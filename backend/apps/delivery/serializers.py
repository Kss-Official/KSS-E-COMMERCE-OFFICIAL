from rest_framework import serializers
from .models import (
    DeliveryTask,
    AgentEarnings,
    DeliveryAgentShift,
    DeliveryCashDeposit,
    DeliverySOSAlert,
    DeliveryCashTransaction,
    DeliveryCashHandover,
)

class DeliveryTaskSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    items_count = serializers.SerializerMethodField()
    stage_name = serializers.CharField(source='get_current_stage_display', read_only=True)
    failed_reason_display = serializers.CharField(source='get_failed_reason_display', read_only=True)
    # The rider screen needs these to show what to collect and to prompt the
    # customer for their delivery code.
    delivery_otp = serializers.CharField(source='order.delivery_otp', read_only=True)
    payment_method = serializers.CharField(source='order.payment_method', read_only=True)
    payment_status = serializers.CharField(source='order.payment_status', read_only=True)
    order_status = serializers.CharField(source='order.status', read_only=True)
    order_total = serializers.DecimalField(source='order.total_amount', max_digits=12,
                                           decimal_places=2, read_only=True)
    shipping_city = serializers.CharField(source='order.shipping_city', read_only=True)
    shipping_pincode = serializers.CharField(source='order.shipping_pincode', read_only=True)
    formatted_date = serializers.SerializerMethodField()

    order_items = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryTask
        fields = [
            'id', 'task_id', 'order', 'order_number', 'items_count', 'order_items',
            'recipient_name', 'recipient_phone', 'delivery_address',
            'pickup_latitude', 'pickup_longitude', 'destination_latitude', 'destination_longitude',
            'cod_amount', 'is_cod_collected', 'current_stage',
            'stage_name', 'status', 'failed_reason', 'failed_reason_display', 'rescheduled_date',
            'notes', 'delivered_at', 'created_at',
            'delivery_otp', 'payment_method', 'payment_status', 'order_status',
            'order_total', 'shipping_city', 'shipping_pincode', 'formatted_date'
        ]

    def get_items_count(self, obj):
        if not obj.order:
            return 0
        return len(obj.order.items.all())

    def get_order_items(self, obj):
        if not obj.order:
            return []
        items = []
        for item in obj.order.items.all():
            p_name = 'Package Item'
            if item.product:
                p_name = getattr(item.product, 'title', getattr(item.product, 'name', 'Package Item'))
            items.append({
                'product_name': p_name,
                'quantity': item.quantity
            })
        return items

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%d %b %Y, %I:%M %p')

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

class DeliveryAgentShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryAgentShift
        fields = [
            'id', 'shift_status', 'started_at', 'ended_at',
            'total_online_minutes', 'current_latitude', 'current_longitude',
            'last_location_update', 'cash_in_hand', 'max_cash_limit'
        ]

class DeliveryCashDepositSerializer(serializers.ModelSerializer):
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryCashDeposit
        fields = [
            'id', 'deposit_id', 'amount', 'payment_mode',
            'status', 'notes', 'deposited_at', 'formatted_date'
        ]

    def get_formatted_date(self, obj):
        return obj.deposited_at.strftime('%d %b %Y, %I:%M %p')

class DeliverySOSAlertSerializer(serializers.ModelSerializer):
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = DeliverySOSAlert
        fields = [
            'id', 'alert_id', 'reason', 'description',
            'latitude', 'longitude', 'status', 'created_at', 'formatted_date'
        ]

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%d %b %Y, %I:%M %p')

class LocationUpdateSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=True)

class FailedDeliverySerializer(serializers.Serializer):
    reason_code = serializers.ChoiceField(choices=DeliveryTask.FAILED_REASON_CHOICES, required=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    reschedule_date = serializers.DateTimeField(required=False, allow_null=True)


class DeliveryCashTransactionSerializer(serializers.ModelSerializer):
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    formatted_date = serializers.SerializerMethodField()
    order_number = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryCashTransaction
        fields = [
            'id', 'transaction_id', 'transaction_type', 'transaction_type_display',
            'amount', 'delivery_task', 'order_number', 'deposit',
            'cash_in_hand_before', 'cash_in_hand_after', 'notes', 'created_at', 'formatted_date'
        ]

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%d %b %Y, %I:%M %p')

    def get_order_number(self, obj):
        if obj.delivery_task and obj.delivery_task.order:
            return obj.delivery_task.order.order_number
        return None


class DeliveryCashHandoverSerializer(serializers.ModelSerializer):
    agent_name = serializers.SerializerMethodField()
    agent_email = serializers.CharField(source='agent.email', read_only=True)
    agent_code = serializers.SerializerMethodField()
    warehouse_staff_email = serializers.CharField(source='warehouse_staff.email', read_only=True, default=None)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    formatted_created_at = serializers.SerializerMethodField()
    formatted_confirmed_at = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryCashHandover
        fields = [
            'id', 'handover_id', 'agent', 'agent_name', 'agent_email', 'agent_code',
            'warehouse_staff', 'warehouse_staff_email', 'requested_amount', 'confirmed_amount',
            'status', 'status_display', 'dispute_reason', 'notes',
            'created_at', 'confirmed_at', 'formatted_created_at', 'formatted_confirmed_at'
        ]

    def get_agent_name(self, obj):
        profile = getattr(obj.agent, 'profile', None)
        return profile.full_name if profile and profile.full_name else obj.agent.email

    def get_agent_code(self, obj):
        return f"AGT-{obj.agent.id:04d}"

    def get_formatted_created_at(self, obj):
        return obj.created_at.strftime('%d %b %Y, %I:%M %p')

    def get_formatted_confirmed_at(self, obj):
        return obj.confirmed_at.strftime('%d %b %Y, %I:%M %p') if obj.confirmed_at else None



