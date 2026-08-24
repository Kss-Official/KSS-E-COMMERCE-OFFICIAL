import uuid
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from core.response import APIResponse
from apps.orders.models import Order
from .models import Payment
from .serializers import (
    PaymentSerializer,
    CreatePaymentSessionSerializer,
    VerifyPaymentSerializer,
    RefundPaymentSerializer
)

class CreatePaymentSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreatePaymentSessionSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(message="Invalid payment request.", errors=serializer.errors)

        order_number = serializer.validated_data['order_number']
        method = serializer.validated_data['method']

        try:
            order = Order.objects.get(order_number=order_number, customer=request.user)
        except Order.DoesNotExist:
            return APIResponse.error(message="Order not found.", status_code=status.HTTP_404_NOT_FOUND)

        if order.payment_status == 'PAID':
            return APIResponse.error(message="This order is already paid.")

        tx_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        payment = Payment.objects.create(
            order=order,
            method=method,
            transaction_id=tx_id,
            amount=order.total_amount,
            currency='INR',
            status='PENDING'
        )

        session_data = {
            "order_number": order.order_number,
            "transaction_id": payment.transaction_id,
            "amount": float(order.total_amount),
            "currency": "INR",
            "method": method,
            "mock_gateway_active": True,
            "sandbox_keys": {
                "razorpay_key": settings.RAZORPAY_KEY_ID,
                "stripe_key": settings.STRIPE_PUBLISHABLE_KEY
            }
        }
        return APIResponse.success(data=session_data, message="Payment session initialized.", status_code=status.HTTP_201_CREATED)

class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(message="Invalid payment payload.", errors=serializer.errors)

        order_number = serializer.validated_data['order_number']
        action = serializer.validated_data.get('action', 'SIMULATE_SUCCESS').upper()

        try:
            order = Order.objects.get(order_number=order_number, customer=request.user)
        except Order.DoesNotExist:
            return APIResponse.error(message="Order not found.", status_code=status.HTTP_404_NOT_FOUND)

        payment = Payment.objects.filter(order=order).latest('created_at')

        if action == 'SIMULATE_FAILURE':
            payment.status = 'FAILED'
            payment.save(update_fields=['status'])
            order.payment_status = 'FAILED'
            order.save(update_fields=['payment_status'])
            return APIResponse.error(
                data={"order_number": order.order_number, "status": "FAILED"},
                message="Simulated payment failure."
            )

        # Success flow
        payment.status = 'COMPLETED'
        payment.gateway_payment_id = serializer.validated_data.get('gateway_payment_id') or f"PAY-{uuid.uuid4().hex[:8]}"
        payment.save()

        order.payment_status = 'PAID'
        order.status = 'CONFIRMED'
        order.save(update_fields=['payment_status', 'status'])

        return APIResponse.success(
            data={"order_number": order.order_number, "payment_id": payment.gateway_payment_id, "status": "PAID"},
            message="Payment completed successfully!"
        )

class RefundPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RefundPaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(message="Invalid refund request.", errors=serializer.errors)

        order_number = serializer.validated_data['order_number']
        order = Order.objects.filter(order_number=order_number).first()
        if not order:
            return APIResponse.error(message="Order not found.", status_code=status.HTTP_404_NOT_FOUND)

        payment = Payment.objects.filter(order=order, status='COMPLETED').first()
        if not payment:
            return APIResponse.error(message="No successful payment found for this order to refund.")

        payment.status = 'REFUNDED'
        payment.save(update_fields=['status'])

        order.payment_status = 'REFUNDED'
        order.status = 'REFUNDED'
        order.save(update_fields=['payment_status', 'status'])

        return APIResponse.success(
            data={"order_number": order.order_number, "refund_amount": float(payment.amount)},
            message=f"Refund of ₹{payment.amount} processed successfully."
        )
