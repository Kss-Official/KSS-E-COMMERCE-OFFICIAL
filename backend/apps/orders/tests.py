from decimal import Decimal
from django.test import TestCase
from apps.accounts.models import User, WalletTransaction
from apps.catalog.models import Product
from apps.orders.models import Order, OrderItem
from apps.orders.services import cancel_order

class OrderCancellationWalletTestCase(TestCase):
    def setUp(self):
        self.customer = User.objects.create_user(email="testcustomer@buyzo.com", password="password123", role="CUSTOMER")
        self.admin = User.objects.create_superuser(email="testadmin@buyzo.com", password="password123")
        
        self.product = Product.objects.create(
            title="Test Smartphone",
            sku="TEST-MOB-01",
            base_price=10000.00,
            discount_price=9000.00,
            stock_quantity=10
        )

        # 1. Prepaid Order
        self.prepaid_order = Order.objects.create(
            order_number="ORD-PREPAID-01",
            customer=self.customer,
            shipping_name="Test Customer",
            shipping_phone="9876543210",
            shipping_address="123 Street",
            shipping_city="Bangalore",
            shipping_state="Karnataka",
            shipping_pincode="560001",
            subtotal=Decimal("9000.00"),
            total_amount=Decimal("9000.00"),
            status="CONFIRMED",
            payment_method="MOCK",
            payment_status="PAID",
            is_revenue_counted=True
        )

        # 2. COD Order
        self.cod_order = Order.objects.create(
            order_number="ORD-COD-01",
            customer=self.customer,
            shipping_name="Test Customer",
            shipping_phone="9876543210",
            shipping_address="123 Street",
            shipping_city="Bangalore",
            shipping_state="Karnataka",
            shipping_pincode="560001",
            subtotal=Decimal("5000.00"),
            total_amount=Decimal("5000.00"),
            status="CONFIRMED",
            payment_method="COD",
            payment_status="UNPAID",
            is_revenue_counted=True
        )

    def test_cancel_prepaid_order_refunds_wallet_and_excludes_revenue(self):
        self.assertEqual(self.customer.wallet_balance, Decimal("0.00"))
        
        success, res_data, updated_order = cancel_order(self.prepaid_order, cancelled_by=self.customer)
        
        self.assertTrue(success)
        self.assertEqual(updated_order.status, "CANCELLED")
        self.assertEqual(updated_order.payment_status, "REFUNDED")
        self.assertFalse(updated_order.is_revenue_counted)
        
        # Verify Wallet balance
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.wallet_balance, Decimal("9000.00"))
        
        # Verify Wallet Transaction record
        tx = WalletTransaction.objects.filter(related_order=self.prepaid_order).first()
        self.assertIsNotNone(tx)
        self.assertEqual(tx.transaction_type, "CREDIT")
        self.assertEqual(tx.amount, Decimal("9000.00"))

    def test_cancel_cod_order_excludes_revenue_with_no_wallet_refund(self):
        success, res_data, updated_order = cancel_order(self.cod_order, cancelled_by=self.customer)
        
        self.assertTrue(success)
        self.assertEqual(updated_order.status, "CANCELLED")
        self.assertFalse(updated_order.is_revenue_counted)
        
        # Verify Wallet balance remains 0
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.wallet_balance, Decimal("0.00"))

    def test_idempotency_guard_prevents_double_cancellation(self):
        cancel_order(self.prepaid_order, cancelled_by=self.customer)
        
        # Second cancellation attempt
        success2, msg, order2 = cancel_order(self.prepaid_order, cancelled_by=self.customer)
        self.assertFalse(success2)
        self.assertIn("already cancelled", msg)
