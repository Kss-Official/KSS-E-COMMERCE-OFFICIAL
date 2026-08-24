import random
from decimal import Decimal
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from django.http import HttpResponse
from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action

from core.response import APIResponse
from core.permissions import IsAdminUserRole, IsOwnerOrAdmin
from apps.accounts.models import Address
from apps.cart.views import get_or_create_cart
from apps.coupons.models import Coupon, CouponUsage
from apps.catalog.models import Product, ProductVariant
from .models import Order, OrderItem, OrderTrackingMilestone
from .serializers import (
    OrderListSerializer,
    OrderDetailSerializer,
    CheckoutSerializer,
    AdminOrderStatusUpdateSerializer
)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(message="Invalid checkout data.", errors=serializer.errors)

        user = request.user
        payload_items = request.data.get('items')
        cart_items = []

        if payload_items and isinstance(payload_items, list) and len(payload_items) > 0:
            # Process direct items from frontend cart
            calculated_subtotal = Decimal('0.00')
            for p_item in payload_items:
                p_id = p_item.get('id')
                p_title = p_item.get('name') or p_item.get('title') or 'Item'
                p_price = Decimal(str(p_item.get('price') or '0'))
                p_qty = int(p_item.get('quantity') or 1)
                p_color = p_item.get('selectedColor') or ''
                p_size = p_item.get('selectedSize') or ''

                # Match product in DB
                product = None
                if p_id and str(p_id).isdigit():
                    product = Product.objects.filter(id=int(p_id)).first()
                if not product and p_title:
                    product = Product.objects.filter(title__icontains=p_title.split()[0]).first()
                if not product:
                    product = Product.objects.first()

                line_total = p_price * p_qty
                calculated_subtotal += line_total
                cart_items.append({
                    'product': product,
                    'product_title': p_title,
                    'unit_price': p_price,
                    'quantity': p_qty,
                    'total_price': line_total,
                    'selected_color': p_color,
                    'selected_size': p_size
                })
            subtotal = calculated_subtotal
        else:
            cart = get_or_create_cart(request)
            db_items = cart.items.select_related('product', 'variant').all()
            if not db_items.exists():
                return APIResponse.error(message="Cannot checkout with an empty cart.")
            for item in db_items:
                cart_items.append({
                    'product': item.product,
                    'variant': item.variant,
                    'product_title': item.product.title,
                    'unit_price': item.unit_price,
                    'quantity': item.quantity,
                    'total_price': item.total_price,
                    'selected_color': item.selected_color,
                    'selected_size': item.selected_size
                })
            subtotal = Decimal(str(cart.subtotal))

        # Resolve Shipping Address
        address_id = serializer.validated_data.get('address_id')
        if address_id:
            try:
                addr = Address.objects.get(id=address_id, user=user)
                shipping_name = addr.recipient_name
                shipping_phone = addr.phone_number
                shipping_address = addr.street_address
                shipping_city = addr.city
                shipping_state = addr.state
                shipping_pincode = addr.postal_code
                shipping_country = addr.country
            except Address.DoesNotExist:
                return APIResponse.error(message="Selected shipping address not found.")
        else:
            shipping_name = serializer.validated_data.get('recipient_name') or user.profile.full_name or 'BuyZo Customer'
            shipping_phone = serializer.validated_data.get('phone_number') or user.phone or '+91 98765 43210'
            shipping_address = serializer.validated_data.get('street_address') or '42, Park Street, Connaught Place'
            shipping_city = serializer.validated_data.get('city') or 'New Delhi'
            shipping_state = serializer.validated_data.get('state') or 'Delhi'
            shipping_pincode = serializer.validated_data.get('postal_code') or '110001'
            shipping_country = 'India'

        # Financial Calculations
        coupon_code = serializer.validated_data.get('coupon_code')
        discount_amount = Decimal('0.00')
        applied_coupon = None

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code.upper().strip())
                discount_amount, msg = coupon.calculate_discount(subtotal, user=user)
                if discount_amount > 0:
                    applied_coupon = coupon
            except Coupon.DoesNotExist:
                pass

        taxable_amount = max(Decimal('0.00'), subtotal - discount_amount)
        tax_amount = round(taxable_amount * Decimal('0.18'), 2)
        shipping_amount = Decimal('0.00') if taxable_amount >= Decimal('499.00') else Decimal('49.00')
        total_amount = round(taxable_amount + tax_amount + shipping_amount, 2)

        # Generate 4-digit OTP for delivery verification
        delivery_otp = ''.join(random.choices('0123456789', k=4))

        # Create Order
        order = Order.objects.create(
            order_number=Order.generate_order_number(),
            customer=user,
            shipping_name=shipping_name,
            shipping_phone=shipping_phone,
            shipping_email=user.email or f"{user.phone or user.id}@customer.buyzo.com",
            shipping_address=shipping_address,
            shipping_city=shipping_city,
            shipping_state=shipping_state,
            shipping_pincode=shipping_pincode,
            shipping_country=shipping_country,
            subtotal=subtotal,
            coupon_code=coupon_code if applied_coupon else None,
            discount_amount=discount_amount,
            tax_amount=tax_amount,
            shipping_amount=shipping_amount,
            total_amount=total_amount,
            payment_method=serializer.validated_data.get('payment_method', 'MOCK'),
            status='CONFIRMED', # Confirmed immediately upon checkout
            payment_status='PAID' if serializer.validated_data.get('payment_method') != 'COD' else 'UNPAID',
            delivery_otp=delivery_otp,
            notes=serializer.validated_data.get('notes', '')
        )

        # Create Order Items and Deduct Stock
        for item in cart_items:
            product = item.get('product')
            variant = item.get('variant')

            img_url = ''
            if product:
                img = product.images.filter(is_primary=True).first() or product.images.first()
                if img and img.image:
                    img_url = request.build_absolute_uri(img.image.url)

            OrderItem.objects.create(
                order=order,
                product=product,
                variant=variant,
                product_title=item.get('product_title') or (product.title if product else 'Product Item'),
                sku=(variant.sku if variant else product.sku) if product else f'SKU-{order.order_number}',
                product_image=img_url,
                selected_color=item.get('selected_color', ''),
                selected_size=item.get('selected_size', ''),
                unit_price=item['unit_price'],
                quantity=item['quantity'],
                total_price=item['total_price']
            )

            # Deduct inventory stock if product exists
            if product:
                if product.stock_quantity >= item['quantity']:
                    product.stock_quantity -= item['quantity']
                    product.save(update_fields=['stock_quantity'])

        # Record Coupon Usage
        if applied_coupon:
            CouponUsage.objects.create(
                coupon=applied_coupon,
                user=user,
                order_id=order.order_number,
                discount_applied=discount_amount
            )

        # Initialize Tracking Milestones
        milestones = [
            ("Order Placed", "Order received and payment verified", True, False, 1),
            ("Confirmed", "Order confirmed with warehouse", True, True, 2),
            ("Shipped", "Package packed and handed to courier", False, False, 3),
            ("Out for Delivery", "Delivery agent assigned and in route", False, False, 4),
            ("Delivered", "Delivered to recipient with OTP verification", False, False, 5),
        ]
        for title, desc, done, active, idx in milestones:
            OrderTrackingMilestone.objects.create(
                order=order,
                step_title=title,
                description=desc,
                is_completed=done,
                is_active=active,
                order_index=idx
            )

        # Create Outbound Shipment for Warehouse
        try:
            from apps.warehouse.models import OutboundShipment
            first_item = order.items.first()
            OutboundShipment.objects.create(
                shipment_id=OutboundShipment.generate_shipment_id(),
                destination_hub=f"{order.shipping_city} Hub",
                item_title=f"{first_item.product_title if first_item else 'Order Item'} ({order.items.count()} items)",
                sku=first_item.sku if first_item else f'SKU-{order.order_number}',
                quantity=order.items.count(),
                courier_partner='BuyZo Express Logistics',
                status='Ready for Pickup'
            )
        except Exception as e:
            pass

        # Create Delivery Task for Delivery Agent
        try:
            from apps.delivery.models import DeliveryTask
            from apps.accounts.models import User
            delivery_agent = User.objects.filter(role='DELIVERY_AGENT').first() or User.objects.filter(email='delivery@buyzo.com').first()
            if delivery_agent:
                DeliveryTask.objects.create(
                    task_id=DeliveryTask.generate_task_id(),
                    agent=delivery_agent,
                    order=order,
                    recipient_name=order.shipping_name,
                    recipient_phone=order.shipping_phone,
                    delivery_address=f"{order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}",
                    cod_amount=order.total_amount if order.payment_method == 'COD' else Decimal('0.00'),
                    current_stage=1,
                    status='ASSIGNED'
                )
        except Exception as e:
            pass

        # Clear user database cart if present
        try:
            cart = get_or_create_cart(request)
            if cart:
                cart.items.all().delete()
        except Exception:
            pass

        # Send confirmation console email
        if user.email:
            send_mail(
                subject=f"BuyZo Order Confirmation - {order.order_number}",
                message=f"Thank you for shopping with BuyZo!\nYour Order #{order.order_number} for ₹{order.total_amount} has been confirmed.\nYour Delivery OTP is: {order.delivery_otp}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True
            )

        return APIResponse.success(
            data=OrderDetailSerializer(order, context={'request': request}).data,
            message="Order placed successfully!",
            status_code=status.HTTP_201_CREATED
        )

class CustomerOrderListView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Order.objects.filter(customer=self.request.user).prefetch_related('items').order_by('-created_at')
        status_param = self.request.query_params.get('status')
        if status_param and status_param.lower() != 'all orders':
            qs = qs.filter(status__iexact=status_param)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Orders retrieved successfully.")

class CustomerOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'order_number'

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).prefetch_related('items', 'milestones')

    def retrieve(self, request, *args, **kwargs):
        lookup = kwargs.get('order_number')
        order = self.get_queryset().filter(order_number=lookup).first()
        if not order and lookup.isdigit():
            order = self.get_queryset().filter(id=int(lookup)).first()

        if not order:
            return APIResponse.error(message="Order not found.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(order)
        return APIResponse.success(data=serializer.data, message="Order details retrieved.")

class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, order_number):
        order = Order.objects.select_for_update().filter(customer=request.user, order_number=order_number).first()
        if not order:
            return APIResponse.error(message="Order not found.", status_code=status.HTTP_404_NOT_FOUND)

        if order.status in ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']:
            return APIResponse.error(message=f"Order cannot be cancelled because it is already {order.get_status_display()}.")

        order.status = 'CANCELLED'
        order.save(update_fields=['status'])

        # Restore inventory stock
        for item in order.items.all():
            if item.product:
                item.product.stock_quantity += item.quantity
                item.product.save(update_fields=['stock_quantity'])
            if item.variant:
                item.variant.stock_quantity += item.quantity
                item.variant.save(update_fields=['stock_quantity'])

        return APIResponse.success(message=f"Order {order.order_number} has been cancelled and stock was restored.")

class InvoiceDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_number):
        order = Order.objects.filter(order_number=order_number).prefetch_related('items').first()
        if not order:
            return APIResponse.error(message="Order not found.", status_code=status.HTTP_404_NOT_FOUND)

        # Check permissions: owner or admin
        if order.customer != request.user and not (request.user.role == 'ADMIN' or request.user.is_staff):
            return APIResponse.error(message="Permission denied.", status_code=status.HTTP_403_FORBIDDEN)

        items_html = "".join([
            f"<tr><td>{item.product_title} ({item.selected_color or 'Std'})</td><td>{item.quantity}</td><td>₹{item.unit_price}</td><td>₹{item.total_price}</td></tr>"
            for item in order.items.all()
        ])

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice {order.order_number} - BuyZo</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; color: #333; }}
                .header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #063328; padding-bottom: 20px; }}
                .brand {{ font-size: 24px; font-weight: bold; color: #063328; }}
                table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
                th, td {{ border: 1px solid #ddd; padding: 10px; text-align: left; }}
                th {{ background-color: #f8f9fa; }}
                .total-box {{ margin-top: 20px; text-align: right; }}
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="brand">BuyZo E-Commerce</div>
                    <p>Tax Invoice / Bill of Supply</p>
                </div>
                <div style="text-align: right;">
                    <h3>Invoice: {order.order_number}</h3>
                    <p>Date: {order.created_at.strftime('%d %B %Y')}</p>
                    <p>Status: {order.get_status_display()}</p>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <strong>Billed & Shipped To:</strong><br>
                {order.shipping_name}<br>
                {order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}<br>
                Phone: {order.shipping_phone} | Email: {order.shipping_email}
            </div>
            <table>
                <thead>
                    <tr><th>Item Description</th><th>Quantity</th><th>Unit Price</th><th>Line Total</th></tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
            </table>
            <div class="total-box">
                <p>Subtotal: ₹{order.subtotal}</p>
                <p>Coupon Discount: -₹{order.discount_amount}</p>
                <p>GST (18%): ₹{order.tax_amount}</p>
                <p>Shipping Charges: ₹{order.shipping_amount}</p>
                <h2>Grand Total: ₹{order.total_amount}</h2>
            </div>
        </body>
        </html>
        """
        return HttpResponse(html_content, content_type='text/html')

# ----------------- ADMIN ORDER MANAGEMENT -----------------
class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().select_related('customer').prefetch_related('items', 'milestones').order_by('-created_at')
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        payment_status = self.request.query_params.get('payment_status')

        if status_param and status_param.lower() != 'all':
            qs = qs.filter(status__iexact=status_param)
        if payment_status:
            qs = qs.filter(payment_status__iexact=payment_status)
        if search:
            qs = qs.filter(
                models.Q(order_number__icontains=search) |
                models.Q(shipping_name__icontains=search) |
                models.Q(shipping_phone__icontains=search) |
                models.Q(customer__email__icontains=search)
            )
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = OrderDetailSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = OrderDetailSerializer(queryset, many=True, context={'request': request})
        return APIResponse.success(data=serializer.data, message="Admin orders retrieved successfully.")

    @action(detail=True, methods=['patch'], url_path='status')
    @transaction.atomic
    def update_status(self, request, pk=None):
        order = self.get_object()
        serializer = AdminOrderStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(message="Invalid status payload.", errors=serializer.errors)

        new_status = serializer.validated_data['status']
        old_status = order.status

        order.status = new_status
        if new_status == 'DELIVERED':
            order.payment_status = 'PAID'
        elif new_status in ['CANCELLED', 'REFUNDED'] and old_status not in ['CANCELLED', 'REFUNDED']:
            # Restore stock
            for item in order.items.all():
                if item.product:
                    item.product.stock_quantity += item.quantity
                    item.product.save(update_fields=['stock_quantity'])
                if item.variant:
                    item.variant.stock_quantity += item.quantity
                    item.variant.save(update_fields=['stock_quantity'])

        order.save()

        # Update milestone completion status
        if new_status == 'CONFIRMED':
            order.milestones.filter(step_title__in=['Order Placed', 'Confirmed']).update(is_completed=True)
        elif new_status == 'SHIPPED':
            order.milestones.filter(step_title__in=['Order Placed', 'Confirmed', 'Shipped']).update(is_completed=True)
        elif new_status == 'OUT_FOR_DELIVERY':
            order.milestones.filter(step_title__in=['Order Placed', 'Confirmed', 'Shipped', 'Out for Delivery']).update(is_completed=True)
        elif new_status == 'DELIVERED':
            order.milestones.all().update(is_completed=True)

        # Notify Customer
        if serializer.validated_data.get('notify_customer'):
            send_mail(
                subject=f"Update on Order {order.order_number}",
                message=f"Hello {order.shipping_name},\nYour order status has been updated to: {order.get_status_display()}.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[order.customer.email],
                fail_silently=True
            )

        return APIResponse.success(
            data=OrderDetailSerializer(order, context={'request': request}).data,
            message=f"Order status successfully updated to {order.get_status_display()}."
        )
