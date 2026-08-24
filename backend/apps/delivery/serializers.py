from rest_framework import serializers
from .models import DeliveryTask, AgentEarnings

class DeliveryTaskSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    items_count = serializers.SerializerMethodField()
    stage_name = serializers.CharField(source='get_current_stage_display', read_only=True)

    class Meta:
        model = DeliveryTask
        fields = [
            'id', 'task_id', 'order', 'order_number', 'items_count',
            'recipient_name', 'recipient_phone', 'delivery_address',
            'cod_amount', 'is_cod_collected', 'current_stage',
            'stage_name', 'status', 'notes', 'delivered_at', 'created_at'
        ]

    def get_items_count(self, obj):
        return obj.order.items.count()

class AdvanceDeliveryStageSerializer(serializers.Serializer):
    target_stage = serializers.IntegerField(required=False, min_value=1, max_value=4)

class VerifyDeliveryOTPSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=4, required=True)
    collect_cash = serializers.BooleanField(default=True)

class AgentEarningsSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = AgentEarnings
        fields = [
            'id', 'order_number', 'base_fee', 'tip',
            'incentive', 'total_earned', 'formatted_date', 'earned_at'
        ]

    def get_formatted_date(self, obj):
        return obj.earned_at.strftime('%d %b %Y, %I:%M %p')
