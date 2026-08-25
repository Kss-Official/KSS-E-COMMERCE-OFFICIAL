import uuid
from django.db import models
from apps.orders.models import Order

class Payment(models.Model):
    METHOD_CHOICES = (
        ('MOCK', 'Mock Payment Gateway'),
        ('COD', 'Cash On Delivery'),
        ('RAZORPAY', 'Razorpay Test Sandbox'),
        ('STRIPE', 'Stripe Test Sandbox'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    )

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    method = models.CharField(max_length=30, choices=METHOD_CHOICES, default='MOCK')
    transaction_id = models.CharField(max_length=100, unique=True, default=uuid.uuid4)
    gateway_order_id = models.CharField(max_length=100, blank=True, null=True)
    gateway_payment_id = models.CharField(max_length=100, blank=True, null=True)
    gateway_signature = models.CharField(max_length=255, blank=True, null=True)

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    gateway_response = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'buyzo_payments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.transaction_id} for {self.order.order_number} ({self.status})"
