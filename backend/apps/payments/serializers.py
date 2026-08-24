from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_number', 'method', 'transaction_id',
            'gateway_order_id', 'amount', 'currency', 'status', 'created_at'
        ]

class CreatePaymentSessionSerializer(serializers.Serializer):
    order_number = serializers.CharField(required=True)
    method = serializers.ChoiceField(choices=['MOCK', 'COD', 'RAZORPAY', 'STRIPE'], default='MOCK')

class VerifyPaymentSerializer(serializers.Serializer):
    order_number = serializers.CharField(required=True)
    transaction_id = serializers.CharField(required=False, allow_blank=True)
    # Simulated mock status: 'SIMULATE_SUCCESS' or 'SIMULATE_FAILURE'
    action = serializers.CharField(required=False, default='SIMULATE_SUCCESS')
    gateway_payment_id = serializers.CharField(required=False, allow_blank=True)
    gateway_signature = serializers.CharField(required=False, allow_blank=True)

class RefundPaymentSerializer(serializers.Serializer):
    order_number = serializers.CharField(required=True)
    reason = serializers.CharField(required=False, default='Customer cancellation / return')
