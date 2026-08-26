from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers
from .models import Coupon, CouponUsage

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'discount_type', 'discount_value',
            'max_discount_amount', 'min_order_value', 'valid_from',
            'valid_to', 'is_active'
        ]

class ApplyCouponSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50, required=True)

class AdminCouponSerializer(serializers.ModelSerializer):
    total_used_count = serializers.SerializerMethodField()
    # The admin form asks for a code, a value and a type; if no window is given the
    # coupon runs for the next 90 days rather than failing validation.
    valid_to = serializers.DateTimeField(required=False)

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'discount_type', 'discount_value',
            'max_discount_amount', 'min_order_value', 'valid_from',
            'valid_to', 'total_usage_limit', 'per_user_limit',
            'is_active', 'total_used_count', 'created_at'
        ]

    def validate(self, attrs):
        if not attrs.get('valid_to') and not getattr(self.instance, 'valid_to', None):
            attrs['valid_to'] = timezone.now() + timedelta(days=90)
        return attrs

    def get_total_used_count(self, obj):
        return obj.usages.count()
