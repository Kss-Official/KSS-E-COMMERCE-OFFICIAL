from datetime import timedelta

from django.db.models import Sum, Count, F, Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action

from core.response import APIResponse
from core.permissions import IsWarehouseStaff
from apps.catalog.models import Product
from .models import (
    InboundReceipt, OutboundShipment, StockTransfer, ReturnedItem, WarehouseInventory,
)
from .serializers import (
    InboundReceiptSerializer,
    OutboundShipmentSerializer,
    StockTransferSerializer,
    ReturnedItemSerializer,
    WarehouseInventorySerializer,
)


# Shipments raised by the Admin order pipeline are keyed "SHP-<order_number>", so a
# warehouse action on one can be reflected straight back onto the order (and from
# there onto the rider's task). Shipments created by hand have no order to update.
_ORDER_FLOW = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']


def _sync_order_from_shipment(shipment, target_status):
    """Push a warehouse milestone back onto the linked order, never backwards."""
    ref = str(shipment.shipment_id or '')
    if not ref.startswith('SHP-'):
        return None

    # Imported here: apps.orders reaches into this module, so a top-level import
    # would close the loop.
    from apps.orders.models import Order
    from apps.orders._propagate import propagate_order_status

    order = Order.objects.filter(order_number=ref[4:]).first()
    if not order:
        return None
    if order.status in _ORDER_FLOW and target_status in _ORDER_FLOW:
        if _ORDER_FLOW.index(target_status) <= _ORDER_FLOW.index(order.status):
            return order

    order.status = target_status
    order.save(update_fields=['status'])

    titles = {
        'SHIPPED': ['Order Placed', 'Confirmed', 'Shipped'],
        'OUT_FOR_DELIVERY': ['Order Placed', 'Confirmed', 'Shipped', 'Out for Delivery'],
    }.get(target_status)
    if titles:
        order.milestones.filter(step_title__in=titles).update(is_completed=True)

    propagate_order_status(order)
    return order

class InboundReceiptViewSet(viewsets.ModelViewSet):
    queryset = InboundReceipt.objects.all().order_by('-received_at')
    serializer_class = InboundReceiptSerializer
    permission_classes = [IsWarehouseStaff]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            receipt = serializer.save(receipt_id=InboundReceipt.generate_receipt_id(), received_by=self.request.user)
            return APIResponse.success(
                data=InboundReceiptSerializer(receipt).data,
                message="Inbound receipt created successfully.",
                status_code=status.HTTP_201_CREATED
            )
        return APIResponse.error(message="Could not create receipt.", errors=serializer.errors)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Inbound receipts retrieved.")

    @action(detail=True, methods=['patch'], url_path='verify')
    def verify(self, request, pk=None):
        receipt = self.get_object()
        receipt.status = 'Verified'
        receipt.save(update_fields=['status'])

        # Increment product stock if SKU matches
        if receipt.sku:
            product = Product.objects.filter(sku=receipt.sku).first()
            if product:
                product.stock_quantity += receipt.quantity
                product.save(update_fields=['stock_quantity'])

        return APIResponse.success(data=InboundReceiptSerializer(receipt).data, message="Receipt verified and stock updated.")

class OutboundShipmentViewSet(viewsets.ModelViewSet):
    queryset = OutboundShipment.objects.all().order_by('-created_at')
    serializer_class = OutboundShipmentSerializer
    permission_classes = [IsWarehouseStaff]

    def perform_create(self, serializer):
        serializer.save(shipment_id=OutboundShipment.generate_shipment_id())

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Outbound shipments retrieved.")

    # NOTE: must NOT be named `dispatch` - that would shadow APIView.dispatch and
    # break every request routed through this viewset.
    @action(detail=True, methods=['patch'], url_path='dispatch', url_name='dispatch')
    def dispatch_shipment(self, request, pk=None):
        shipment = self.get_object()
        shipment.status = 'Dispatched'
        shipment.dispatched_at = timezone.now()
        shipment.save(update_fields=['status', 'dispatched_at'])
        _sync_order_from_shipment(shipment, 'OUT_FOR_DELIVERY')
        return APIResponse.success(data=OutboundShipmentSerializer(shipment).data, message="Shipment dispatched.")

    @action(detail=True, methods=['patch'], url_path='pack')
    def pack(self, request, pk=None):
        """Move a shipment from packing to ready-for-pickup."""
        shipment = self.get_object()
        shipment.status = 'Ready for Pickup'
        shipment.save(update_fields=['status'])
        _sync_order_from_shipment(shipment, 'SHIPPED')
        return APIResponse.success(data=OutboundShipmentSerializer(shipment).data, message="Shipment packed and ready for pickup.")

class StockTransferViewSet(viewsets.ModelViewSet):
    queryset = StockTransfer.objects.all().order_by('-created_at')
    serializer_class = StockTransferSerializer
    permission_classes = [IsWarehouseStaff]

    def perform_create(self, serializer):
        serializer.save(transfer_id=f"TRF-{timezone.now().strftime('%Y%m%d%H%M%S')}")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Stock transfers retrieved.")

    @action(detail=True, methods=['patch'], url_path='advance')
    def advance(self, request, pk=None):
        """Move a transfer along Initiated -> In Transit -> Completed."""
        transfer = self.get_object()
        flow = {'Initiated': 'In Transit', 'In Transit': 'Completed'}
        target = request.data.get('status') or flow.get(transfer.status)
        if not target:
            return APIResponse.error(message="This transfer is already complete.")
        transfer.status = target
        transfer.save(update_fields=['status'])
        return APIResponse.success(
            data=StockTransferSerializer(transfer).data,
            message=f"Transfer marked as {target}.",
        )

class ReturnedItemViewSet(viewsets.ModelViewSet):
    queryset = ReturnedItem.objects.all().order_by('-inspected_at')
    serializer_class = ReturnedItemSerializer
    permission_classes = [IsWarehouseStaff]

    def perform_create(self, serializer):
        serializer.save(return_id=f"RET-{timezone.now().strftime('%Y%m%d%H%M%S')}")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Returned items retrieved.")

    @action(detail=True, methods=['patch'], url_path='restock')
    def restock(self, request, pk=None):
        """Put a returned unit back on the shelf and back into sellable stock."""
        item = self.get_object()
        item.status = 'Restocked'
        item.save(update_fields=['status'])

        product = Product.objects.filter(title=item.item_title).first()
        if product:
            product.stock_quantity += item.quantity
            product.save(update_fields=['stock_quantity'])
            inventory = getattr(product, 'warehouse_inventory', None)
            if inventory:
                inventory.total_units += item.quantity
                inventory.save(update_fields=['total_units'])

        return APIResponse.success(
            data=ReturnedItemSerializer(item).data,
            message=f"{item.quantity} unit(s) restocked.",
        )

    @action(detail=True, methods=['patch'], url_path='discard')
    def discard(self, request, pk=None):
        """Write off a damaged return - no stock movement."""
        item = self.get_object()
        item.status = 'Discarded'
        item.save(update_fields=['status'])
        return APIResponse.success(
            data=ReturnedItemSerializer(item).data,
            message="Return written off as damaged stock.",
        )

class WarehouseInventoryOverviewView(APIView):
    permission_classes = [IsWarehouseStaff]

    def get(self, request):
        products = Product.objects.filter(is_active=True).values('id', 'title', 'sku', 'stock_quantity', 'low_stock_threshold')
        
        total_items = sum(p['stock_quantity'] for p in products)
        low_stock_count = sum(1 for p in products if p['stock_quantity'] <= p['low_stock_threshold'])

        data = {
            "warehouse_code": "WH01 - Central Hub",
            "total_skus": len(products),
            "total_stock_units": total_items,
            "low_stock_skus": low_stock_count,
            "inventory_items": list(products)
        }
        return APIResponse.success(data=data, message="Warehouse inventory overview retrieved.")


def _sync_inventory_row(product):
    """Make sure every active product has a bin row so the Inventory tab is never
    thinner than the catalogue. Created rows mirror Product.stock_quantity."""
    row, created = WarehouseInventory.objects.get_or_create(
        product=product,
        defaults={
            'total_units': product.stock_quantity,
            'reorder_level': product.low_stock_threshold,
            'bin_location': '',
        },
    )
    return row, created


class WarehouseInventoryViewSet(viewsets.ModelViewSet):
    """Bin-level inventory CRUD for the warehouse portal."""
    serializer_class = WarehouseInventorySerializer
    permission_classes = [IsWarehouseStaff]

    def get_queryset(self):
        qs = (WarehouseInventory.objects
              .select_related('product', 'product__category')
              .filter(product__is_active=True))
        params = getattr(self.request, 'query_params', {}) if self.request else {}
        search = params.get('search')
        if search:
            qs = qs.filter(
                Q(product__title__icontains=search)
                | Q(product__sku__icontains=search)
                | Q(bin_location__icontains=search)
            )
        if params.get('status') == 'low':
            qs = qs.filter(total_units__lte=F('reorder_level') + F('reserved_units'))
        return qs.order_by('bin_location', 'product__title')

    def list(self, request, *args, **kwargs):
        # Backfill first so a freshly seeded catalogue shows up immediately.
        for product in Product.objects.filter(is_active=True, warehouse_inventory__isnull=True):
            _sync_inventory_row(product)

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Warehouse inventory retrieved.")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            row = serializer.save()
            return APIResponse.success(
                data=WarehouseInventorySerializer(row).data,
                message="Inventory row created.",
                status_code=status.HTTP_201_CREATED,
            )
        return APIResponse.error(message="Could not create inventory row.", errors=serializer.errors)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        row = self.get_object()
        serializer = self.get_serializer(row, data=request.data, partial=partial)
        if serializer.is_valid():
            row = serializer.save()
            # Keep the storefront's sellable count in step with the floor count.
            if row.product and row.product.stock_quantity != row.available_units:
                row.product.stock_quantity = row.available_units
                row.product.save(update_fields=['stock_quantity'])
            return APIResponse.success(
                data=WarehouseInventorySerializer(row).data,
                message="Inventory updated.",
            )
        return APIResponse.error(message="Could not update inventory.", errors=serializer.errors)

    def destroy(self, request, *args, **kwargs):
        self.get_object().delete()
        return APIResponse.success(message="Inventory row removed.")

    @action(detail=True, methods=['patch'], url_path='adjust')
    def adjust(self, request, pk=None):
        """Add or remove units against a bin (positive or negative delta)."""
        row = self.get_object()
        try:
            delta = int(request.data.get('delta', 0))
        except (TypeError, ValueError):
            return APIResponse.error(message="'delta' must be a whole number.")

        row.total_units = max(0, row.total_units + delta)
        bin_location = request.data.get('bin_location') or request.data.get('bin')
        if bin_location:
            row.bin_location = bin_location
        row.last_counted_at = timezone.now()
        row.save(update_fields=['total_units', 'bin_location', 'last_counted_at'])

        row.product.stock_quantity = row.available_units
        row.product.save(update_fields=['stock_quantity'])

        return APIResponse.success(
            data=WarehouseInventorySerializer(row).data,
            message=f"Stock adjusted by {delta:+d} units.",
        )


class WarehouseDashboardSummaryView(APIView):
    """Cards plus a recent-activity feed for the warehouse dashboard."""
    permission_classes = [IsWarehouseStaff]

    def get(self, request):
        today = timezone.now().date()
        products = Product.objects.filter(is_active=True)

        agg = products.aggregate(total_units=Sum('stock_quantity'), skus=Count('id'))
        low_stock = products.filter(stock_quantity__lte=F('low_stock_threshold'))
        out_of_stock = products.filter(stock_quantity=0)

        inbound_today = InboundReceipt.objects.filter(received_at__date=today)
        pending_inbound = InboundReceipt.objects.filter(status='Pending Verification')
        outbound_today = OutboundShipment.objects.filter(created_at__date=today)
        pending_outbound = OutboundShipment.objects.exclude(status='Dispatched')
        open_transfers = StockTransfer.objects.exclude(status='Completed')
        pending_returns = ReturnedItem.objects.filter(status='Inspected')

        activities = []
        for receipt in InboundReceipt.objects.order_by('-received_at')[:5]:
            activities.append({
                'type': 'inbound',
                'title': f'Received {receipt.quantity} x {receipt.item_title}',
                'meta': f'{receipt.receipt_id} - {receipt.supplier_name}',
                'status': receipt.status,
                'timestamp': receipt.received_at,
            })
        for shipment in OutboundShipment.objects.order_by('-created_at')[:5]:
            activities.append({
                'type': 'outbound',
                'title': f'{shipment.status}: {shipment.item_title}',
                'meta': f'{shipment.shipment_id} to {shipment.destination_hub}',
                'status': shipment.status,
                'timestamp': shipment.created_at,
            })
        for transfer in StockTransfer.objects.order_by('-created_at')[:4]:
            activities.append({
                'type': 'transfer',
                'title': f'Transfer {transfer.quantity} x {transfer.item_title}',
                'meta': f'{transfer.transfer_id} to {transfer.destination_warehouse}',
                'status': transfer.status,
                'timestamp': transfer.created_at,
            })
        for item in ReturnedItem.objects.order_by('-inspected_at')[:4]:
            activities.append({
                'type': 'return',
                'title': f'Return {item.item_title}',
                'meta': f'{item.return_id} - {item.condition}',
                'status': item.status,
                'timestamp': item.inspected_at,
            })
        activities.sort(key=lambda a: a['timestamp'], reverse=True)
        for activity in activities:
            activity['formatted_date'] = activity['timestamp'].strftime('%d %b, %I:%M %p')
            activity['timestamp'] = activity['timestamp'].isoformat()

        profile = getattr(request.user, 'profile', None)
        data = {
            'warehouse_code': 'WH01 - Central Hub',
            'operator_name': profile.full_name if profile else request.user.email,
            'total_skus': agg['skus'] or 0,
            'total_stock_units': agg['total_units'] or 0,
            'low_stock_count': low_stock.count(),
            'out_of_stock_count': out_of_stock.count(),
            'inbound_today': inbound_today.count(),
            'inbound_units_today': inbound_today.aggregate(q=Sum('quantity'))['q'] or 0,
            'pending_verification': pending_inbound.count(),
            'outbound_today': outbound_today.count(),
            'pending_dispatch': pending_outbound.count(),
            'open_transfers': open_transfers.count(),
            'pending_returns': pending_returns.count(),
            'orders_awaiting_pack': OutboundShipment.objects.filter(status='Packing In Progress').count(),
            'recent_activities': activities[:10],
        }
        return APIResponse.success(data=data, message="Warehouse dashboard summary retrieved.")


class WarehouseAlertsView(APIView):
    """Low-stock, out-of-stock, unverified-inbound and stuck-transfer alerts."""
    permission_classes = [IsWarehouseStaff]

    def get(self, request):
        alerts = []
        low = (Product.objects
               .filter(is_active=True, stock_quantity__lte=F('low_stock_threshold'))
               .select_related('category').order_by('stock_quantity')[:40])
        for product in low:
            out = product.stock_quantity == 0
            alerts.append({
                'id': f'stock-{product.id}',
                'severity': 'critical' if out else 'warning',
                'type': 'Out of Stock' if out else 'Low Stock',
                'title': product.title,
                'sku': product.sku,
                'category': product.category.name if product.category else '',
                'message': (
                    f'{product.title} is out of stock. Raise a purchase order.' if out
                    else f'Only {product.stock_quantity} units left (threshold {product.low_stock_threshold}).'
                ),
                'current_stock': product.stock_quantity,
                'threshold': product.low_stock_threshold,
                'suggested_reorder': max(50, product.low_stock_threshold * 5),
            })

        stale = timezone.now() - timedelta(days=2)
        for receipt in InboundReceipt.objects.filter(
                status='Pending Verification', received_at__lt=stale)[:20]:
            alerts.append({
                'id': f'inbound-{receipt.id}',
                'severity': 'warning',
                'type': 'Unverified Receipt',
                'title': receipt.item_title,
                'sku': receipt.sku,
                'category': '',
                'message': f'{receipt.receipt_id} from {receipt.supplier_name} is still awaiting verification.',
                'current_stock': receipt.quantity,
                'threshold': 0,
                'suggested_reorder': 0,
            })

        for transfer in StockTransfer.objects.filter(status='In Transit', created_at__lt=stale)[:20]:
            alerts.append({
                'id': f'transfer-{transfer.id}',
                'severity': 'info',
                'type': 'Transfer In Transit',
                'title': transfer.item_title,
                'sku': transfer.sku,
                'category': '',
                'message': (
                    f'{transfer.transfer_id} to {transfer.destination_warehouse} '
                    'has been in transit for over 48 hours.'
                ),
                'current_stock': transfer.quantity,
                'threshold': 0,
                'suggested_reorder': 0,
            })

        counts = {
            'critical': sum(1 for a in alerts if a['severity'] == 'critical'),
            'warning': sum(1 for a in alerts if a['severity'] == 'warning'),
            'info': sum(1 for a in alerts if a['severity'] == 'info'),
        }
        return APIResponse.success(
            data={'alerts': alerts, 'counts': counts, 'total': len(alerts)},
            message="Warehouse alerts retrieved.",
        )


class WarehouseReportsView(APIView):
    """Aggregates for the warehouse Reports tab."""
    permission_classes = [IsWarehouseStaff]

    def get(self, request):
        try:
            days = max(1, min(180, int(request.query_params.get('days', 30))))
        except (TypeError, ValueError):
            days = 30
        since = timezone.now() - timedelta(days=days)

        inbound = InboundReceipt.objects.filter(received_at__gte=since)
        outbound = OutboundShipment.objects.filter(created_at__gte=since)
        transfers = StockTransfer.objects.filter(created_at__gte=since)
        returns = ReturnedItem.objects.filter(inspected_at__gte=since)

        daily = []
        for offset in range(min(days, 14) - 1, -1, -1):
            day = (timezone.now() - timedelta(days=offset)).date()
            daily.append({
                'date': day.isoformat(),
                'label': day.strftime('%d %b'),
                'inbound_units': inbound.filter(received_at__date=day).aggregate(q=Sum('quantity'))['q'] or 0,
                'outbound_units': outbound.filter(created_at__date=day).aggregate(q=Sum('quantity'))['q'] or 0,
            })

        by_category = [
            {'category': row['category__name'], 'skus': row['skus'], 'units': row['units'] or 0}
            for row in (Product.objects.filter(is_active=True, category__isnull=False)
                        .values('category__name')
                        .annotate(skus=Count('id'), units=Sum('stock_quantity'))
                        .order_by('-units'))
        ]

        top_movers = [
            {'sku': row['sku'], 'title': row['item_title'],
             'units': row['units'] or 0, 'shipments': row['shipments']}
            for row in (outbound.values('sku', 'item_title')
                        .annotate(units=Sum('quantity'), shipments=Count('id'))
                        .order_by('-units')[:10])
        ]

        outbound_total = outbound.count()
        return APIResponse.success(
            data={
                'period_days': days,
                'summary': {
                    'inbound_receipts': inbound.count(),
                    'inbound_units': inbound.aggregate(q=Sum('quantity'))['q'] or 0,
                    'outbound_shipments': outbound_total,
                    'outbound_units': outbound.aggregate(q=Sum('quantity'))['q'] or 0,
                    'transfers': transfers.count(),
                    'returns': returns.count(),
                    'returns_restocked': returns.filter(status='Restocked').count(),
                    'returns_discarded': returns.filter(status='Discarded').count(),
                    'dispatch_rate': (
                        round(outbound.filter(status='Dispatched').count() / outbound_total * 100, 1)
                        if outbound_total else 0.0
                    ),
                },
                'daily': daily,
                'by_category': by_category,
                'top_movers': top_movers,
            },
            message="Warehouse reports retrieved.",
        )
