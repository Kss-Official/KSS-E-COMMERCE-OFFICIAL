
def propagate_order_status(order):
    """
    Mirror an Order's status onto the Warehouse and Delivery portals.

    The three staff portals share one pipeline, so an Admin status change has to
    move the warehouse shipment and the rider's task with it. Everything here is
    keyed on the order number, which makes the whole function idempotent — calling
    it twice for the same status is a no-op.

    Imported locally: apps.delivery.models imports apps.orders.models, so a
    module-level import here would close the loop.
    """
    from django.db.models import Count, Q
    from django.utils import timezone

    from apps.accounts.models import User
    from apps.delivery.models import DeliveryTask
    from apps.warehouse.models import OutboundShipment, ReturnedItem

    status_value = order.status
    first_item = order.items.first()
    item_title = first_item.product_title if first_item else f"Order {order.order_number}"
    item_sku = getattr(first_item, 'sku', '') or ''
    total_units = sum(i.quantity for i in order.items.all()) or 1
    hub = order.shipping_city or 'Central Hub'
    shipment_id = f"SHP-{order.order_number}"[:50]

    result = {'shipment': None, 'task': None, 'return': None}

    # ---- Warehouse side -------------------------------------------------
    warehouse_stage = {
        'CONFIRMED': 'Packing In Progress',
        'PROCESSING': 'Packing In Progress',
        'SHIPPED': 'Ready for Pickup',
        'OUT_FOR_DELIVERY': 'Dispatched',
        'DELIVERED': 'Dispatched',
    }.get(status_value)

    if warehouse_stage:
        shipment, _created = OutboundShipment.objects.get_or_create(
            shipment_id=shipment_id,
            defaults={
                'destination_hub': hub,
                'item_title': item_title,
                'sku': item_sku,
                'quantity': total_units,
                'status': warehouse_stage,
            }
        )
        # Never walk a shipment backwards — a packed box does not un-pack.
        order_of_stages = ['Packing In Progress', 'Ready for Pickup', 'Dispatched']
        if order_of_stages.index(warehouse_stage) >= order_of_stages.index(shipment.status):
            shipment.status = warehouse_stage
        if warehouse_stage == 'Dispatched' and not shipment.dispatched_at:
            shipment.dispatched_at = timezone.now()
        shipment.save()
        result['shipment'] = shipment.shipment_id

    # ---- Delivery side --------------------------------------------------
    delivery_stage = {
        'SHIPPED': ('ASSIGNED', 1),
        'OUT_FOR_DELIVERY': ('IN_TRANSIT', 2),
        'DELIVERED': ('DELIVERED', 4),
        'CANCELLED': ('FAILED', 5),
        'RETURNED': ('FAILED', 5),
    }.get(status_value)

    if delivery_stage:
        task_status, task_stage = delivery_stage
        task = getattr(order, 'delivery_task', None)

        if task is None and status_value in ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']:
            # Hand the order to the rider carrying the fewest open jobs.
            agent = (
                User.objects
                .filter(role='DELIVERY_AGENT', is_active=True)
                .annotate(
                    open_tasks=Count(
                        'delivery_tasks',
                        filter=~Q(delivery_tasks__status__in=['DELIVERED', 'FAILED'])
                    )
                )
                .order_by('open_tasks', 'id')
                .first()
            )
            if agent:
                task = DeliveryTask.objects.create(
                    task_id=DeliveryTask.generate_task_id(),
                    agent=agent,
                    order=order,
                    recipient_name=order.shipping_name or 'Customer',
                    recipient_phone=order.shipping_phone or '',
                    delivery_address=', '.join(
                        p for p in [order.shipping_address, order.shipping_city, order.shipping_pincode] if p
                    ) or hub,
                    cod_amount=order.total_amount if str(order.payment_method).upper() == 'COD' else 0,
                    current_stage=task_stage,
                    status=task_status,
                )

        if task is not None:
            task.status = task_status
            task.current_stage = max(task.current_stage, task_stage) if task_stage != 5 else task_stage
            if task_status == 'DELIVERED':
                task.delivered_at = task.delivered_at or timezone.now()
                if str(order.payment_method).upper() == 'COD':
                    task.is_cod_collected = True
            task.save()
            result['task'] = task.task_id

    # ---- Returns desk ---------------------------------------------------
    if status_value == 'RETURNED':
        returned, _ = ReturnedItem.objects.get_or_create(
            return_id=f"RET-{order.order_number}"[:50],
            defaults={
                'order_number': order.order_number,
                'customer_name': order.shipping_name or 'Customer',
                'item_title': item_title,
                'quantity': total_units,
                'reason': 'Returned by customer',
                'condition': 'Good Condition',
                'status': 'Inspected',
            }
        )
        result['return'] = returned.return_id

    return result
