from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal

class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = (
        ('PERCENTAGE', 'Percentage Discount (%)'),
        ('FLAT', 'Flat Amount Discount (₹)'),
    )

    code = models.CharField(max_length=50, unique=True, db_index=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default='PERCENTAGE')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Cap for percentage discounts")
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    valid_from = models.DateTimeField(default=timezone.now)
    valid_to = models.DateTimeField()
    
    total_usage_limit = models.PositiveIntegerField(null=True, blank=True, help_text="Total system-wide uses")
    per_user_limit = models.PositiveIntegerField(default=1)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_coupons'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} ({self.get_discount_type_display()} - {self.discount_value})"

    def save(self, *args, **kwargs):
        self.code = self.code.upper().strip()
        super().save(*args, **kwargs)

    def is_valid_now(self):
        now = timezone.now()
        if not self.is_active:
            return False, "This coupon is currently inactive."
        if now < self.valid_from:
            return False, "This coupon is not active yet."
        if now > self.valid_to:
            return False, "This coupon has expired."
        if self.total_usage_limit and self.usages.count() >= self.total_usage_limit:
            return False, "Coupon usage limit has been reached."
        return True, "Valid"

    def calculate_discount(self, cart_subtotal, user=None):
        valid, msg = self.is_valid_now()
        if not valid:
            return Decimal('0.00'), msg

        subtotal_dec = Decimal(str(cart_subtotal))
        if subtotal_dec < self.min_order_value:
            return Decimal('0.00'), f"Minimum order value of ₹{self.min_order_value} required for this coupon."

        if user and user.is_authenticated:
            user_uses = self.usages.filter(user=user).count()
            if user_uses >= self.per_user_limit:
                return Decimal('0.00'), f"You have already used this coupon {user_uses} time(s)."

        if self.discount_type == 'PERCENTAGE':
            discount = (subtotal_dec * self.discount_value) / Decimal('100.0')
            if self.max_discount_amount and discount > self.max_discount_amount:
                discount = self.max_discount_amount
        else:
            discount = min(self.discount_value, subtotal_dec)

        return round(discount, 2), "Coupon applied successfully!"

class CouponUsage(models.Model):
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='coupon_usages')
    order_id = models.CharField(max_length=60, blank=True, null=True)
    discount_applied = models.DecimalField(max_digits=10, decimal_places=2)
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_coupon_usages'

    def __str__(self):
        return f"{self.user.email} used {self.coupon.code} (-₹{self.discount_applied})"
