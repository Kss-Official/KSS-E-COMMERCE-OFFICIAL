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

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'discount_type', 'discount_value',
            'max_discount_amount', 'min_order_value', 'valid_from',
            'valid_to', 'total_usage_limit', 'per_user_limit',
            'is_active', 'total_used_count', 'created_at'
        ]

    def get_total_used_count(self, obj):
        return obj.usages.count()
