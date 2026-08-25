import os, sys
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from django.db import transaction
from apps.orders.models import Order
from apps.accounts.models import WalletTransaction
from apps.payments.models import Payment

def run_backfill():
    print("=== STARTING WALLET & REVENUE BACKFILL MIGRATION ===")
    
    # 1. Update all CANCELLED or REFUNDED orders to is_revenue_counted=False
    cancelled_orders = Order.objects.filter(status__in=['CANCELLED', 'REFUNDED'])
    updated_count = cancelled_orders.update(is_revenue_counted=False)
    print(f"Updated {updated_count} cancelled/refunded orders to is_revenue_counted=False.")

    # 2. Check prepaid cancelled orders that were never credited to customer wallet
    refunded_count = 0
    total_refunded_val = Decimal('0.00')

    with transaction.atomic():
        for order in Order.objects.filter(status__in=['CANCELLED', 'REFUNDED']):
            p_status = (order.payment_status or '').upper()
            p_method = (order.payment_method or '').upper()

            # Check if prepaid order was paid or needs wallet credit
            if p_method != 'COD' and p_status in ['PAID', 'REFUNDED']:
                # Check if wallet credit already exists
                has_credit = WalletTransaction.objects.filter(related_order=order, transaction_type='CREDIT').exists()
                if not has_credit:
                    customer = order.customer
                    refund_amount = order.total_amount
                    
                    customer.wallet_balance += refund_amount
                    customer.save(update_fields=['wallet_balance'])

                    WalletTransaction.objects.create(
                        user=customer,
                        amount=refund_amount,
                        transaction_type='CREDIT',
                        reason=f"Historical refund for cancelled order #{order.order_number}",
                        related_order=order
                    )

                    order.payment_status = 'REFUNDED'
                    order.save(update_fields=['payment_status'])

                    refunded_count += 1
                    total_refunded_val += refund_amount
                    print(f"Backfilled wallet credit INR {refund_amount} to {customer.email} for Order #{order.order_number}")

    print(f"Backfill Complete! Credited {refunded_count} orders totaling INR {total_refunded_val:,.2f} to customer wallets.")

if __name__ == '__main__':
    run_backfill()
