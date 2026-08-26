from rest_framework import serializers

from .models import StoreSetting


class StoreSettingSerializer(serializers.ModelSerializer):
    updated_by_email = serializers.EmailField(source='updated_by.email', read_only=True, default='')

    class Meta:
        model = StoreSetting
        fields = [
            'id', 'store_name', 'tagline', 'support_email', 'support_phone', 'currency',
            'auto_approve_orders', 'auto_approve_limit', 'email_low_stock_alerts',
            'free_delivery_threshold', 'low_stock_threshold', 'cod_enabled',
            'maintenance_mode', 'updated_at', 'updated_by_email'
        ]
        read_only_fields = ['id', 'updated_at', 'updated_by_email']
