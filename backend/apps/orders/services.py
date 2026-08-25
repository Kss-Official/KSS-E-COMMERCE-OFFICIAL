from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from apps.accounts.models import WalletTransaction
from apps.payments.models import Payment
from .models import OrderItem

@transaction.atomic
def cancel_order(order, cancelled_by=None, cancellation_reason=""):
    """
    Atomic service to cancel an order, credit wallet balance if prepaid,
    exclude from revenue, and restore stock.
    Idempotency guard included.
    """
    if not order:
        return False, "Order not found.", None

    # Idempotency guard
    if order.status in ['CANCELLED', 'REFUNDED']:
        return False, f"Order {order.order_number} is already cancelled.", order

    is_admin = cancelled_by and (getattr(cancelled_by, 'role', '') == 'ADMIN' or getattr(cancelled_by, 'is_staff', False))

    # Customer restrictions
    if not is_admin and order.status in ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']:
        return False, f"Order cannot be cancelled because it is already {order.get_status_display()}.", order

    # Perform cancellation
    old_status = order.status
    order.status = 'CANCELLED'
    order.is_revenue_counted = False
    order.cancelled_at = timezone.now()
    order.cancellation_reason = cancellation_reason or f"Cancelled by {getattr(cancelled_by, 'email', 'System')}"

    is_refunded = False
    refund_amount = Decimal('0.00')

    # Refund logic for Prepaid Orders
    p_status = (order.payment_status or '').upper()
    p_method = (order.payment_method or '').upper()

    if p_status == 'PAID' and p_method != 'COD':
        refund_amount = order.total_amount
        is_refunded = True

        # 1. Credit Customer Wallet
        customer = order.customer
        current_bal = Decimal(str(customer.wallet_balance or 0.0))
        customer.wallet_balance = current_bal + refund_amount
        customer.save(update_fields=['wallet_balance'])

        # 2. Log Wallet Transaction Audit Trail
        WalletTransaction.objects.create(
            user=customer,
            amount=refund_amount,
            transaction_type='CREDIT',
            reason=f"Refund for cancelled order #{order.order_number}",
            related_order=order
        )

        # 3. Update Payment record if present, or create refund record
        pmt = Payment.objects.filter(order=order, status='COMPLETED').first()
        if pmt:
            pmt.status = 'REFUNDED'
            pmt.save(update_fields=['status'])
        else:
            Payment.objects.create(
                order=order,
                method=order.payment_method,
                amount=refund_amount,
                status='REFUNDED',
                gateway_response={"reason": "Order Cancellation Wallet Refund"}
            )

        order.payment_status = 'REFUNDED'

    # Restore inventory stock
    for item in OrderItem.objects.filter(order=order):
        if item.product:
            item.product.stock_quantity += item.quantity
            item.product.save(update_fields=['stock_quantity'])
        if item.variant:
            item.variant.stock_quantity += item.quantity
            item.variant.save(update_fields=['stock_quantity'])

    order.save(update_fields=['status', 'payment_status', 'is_revenue_counted', 'cancelled_at', 'cancellation_reason', 'updated_at'])

    result_data = {
        "order_number": order.order_number,
        "status": order.status,
        "payment_status": order.payment_status,
        "is_refunded": is_refunded,
        "refund_amount": float(refund_amount),
        "wallet_balance": float(order.customer.wallet_balance) if order.customer else 0.0
    }

    return True, result_data, order
