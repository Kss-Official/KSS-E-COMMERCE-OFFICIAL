import random
from django.db import models
from django.conf import settings
from apps.catalog.models import Product, ProductVariant

class Order(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Payment'),
        ('CONFIRMED', 'Confirmed'),
        ('PROCESSING', 'Processing in Warehouse'),
        ('SHIPPED', 'Shipped'),
        ('OUT_FOR_DELIVERY', 'Out for Delivery'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
        ('RETURNED', 'Returned'),
        ('REFUNDED', 'Refunded'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('MOCK', 'Mock / Test Gateway'),
        ('COD', 'Cash On Delivery'),
        ('RAZORPAY', 'Razorpay'),
        ('STRIPE', 'Stripe'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('UNPAID', 'Unpaid'),
        ('PAID', 'Paid'),
        ('REFUNDED', 'Refunded'),
        ('FAILED', 'Failed'),
    )

    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')

    # Shipping Address Snapshot
    shipping_name = models.CharField(max_length=150)
    shipping_phone = models.CharField(max_length=20)
    shipping_email = models.EmailField(blank=True)
    shipping_address = models.CharField(max_length=255)
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)
    shipping_pincode = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=100, default='India')

    # Order Financials
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    coupon_code = models.CharField(max_length=50, blank=True, null=True)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    shipping_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)

    # Status & Payment
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES, default='MOCK')
    payment_status = models.CharField(max_length=30, choices=PAYMENT_STATUS_CHOICES, default='UNPAID')
    is_revenue_counted = models.BooleanField(default=True, db_index=True)
    cancellation_reason = models.CharField(max_length=255, blank=True, null=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    # Last-Mile Verification
    delivery_otp = models.CharField(max_length=4, default='1234', help_text="4-digit customer verification code for delivery agent")

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'buyzo_orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number} - {self.customer.email} (₹{self.total_amount})"

    @classmethod
    def generate_order_number(cls):
        random_digits = ''.join(random.choices('0123456789', k=5))
        return f"ORD-{random_digits}"

    @classmethod
    def generate_otp(cls):
        return ''.join(random.choices('0123456789', k=4))

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='order_items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)

    # Product Snapshot at purchase
    product_title = models.CharField(max_length=255)
    sku = models.CharField(max_length=60)
    product_image = models.CharField(max_length=500, blank=True)
    selected_color = models.CharField(max_length=50, blank=True)
    selected_size = models.CharField(max_length=50, blank=True)

    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'buyzo_order_items'

    def __str__(self):
        return f"{self.quantity}x {self.product_title} in {self.order.order_number}"

class OrderTrackingMilestone(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='milestones')
    step_title = models.CharField(max_length=100) # e.g. "Order Placed", "Confirmed", "Shipped", "Out for Delivery", "Delivered"
    description = models.CharField(max_length=255, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    order_index = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'buyzo_order_milestones'
        ordering = ['order_index', 'timestamp']

    def __str__(self):
        return f"{self.step_title} - {self.order.order_number} ({'Done' if self.is_completed else 'Pending'})"
