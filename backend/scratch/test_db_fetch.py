import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

from django.db import connection
from django.conf import settings
from apps.accounts.models import User, Profile, Address
from apps.catalog.models import Category, Product, ProductVariant, Brand
from apps.orders.models import Order, OrderItem
from apps.cart.models import Cart, CartItem
from apps.coupons.models import Coupon
from apps.payments.models import Payment
from apps.warehouse.models import InboundReceipt, OutboundShipment, StockTransfer, ReturnedItem
from apps.delivery.models import DeliveryTask, AgentEarnings
from apps.reviews.models import Review
from apps.notifications.models import InAppNotification

print("=" * 75)
print("1. DATABASE CONFIGURATION & CONNECTIVITY")
print("=" * 75)
db_conf = settings.DATABASES['default']
print(f"Backend DB Engine : {db_conf['ENGINE']}")
print(f"Database Name     : {db_conf['NAME']}")
print(f"Host / Port       : {db_conf.get('HOST', '127.0.0.1')}:{db_conf.get('PORT', '3306')}")
print(f"Database User     : {db_conf.get('USER', 'root')}")

with connection.cursor() as cursor:
    cursor.execute("SELECT 1 + 1;")
    res = cursor.fetchone()[0]
    print(f"Direct SQL Ping   : SUCCESS (Response: {res})")

print("\n" + "=" * 75)
print("2. DATABASE TABLES & RECORD COUNTS")
print("=" * 75)
models = [
    ("Users (buyzo_users)", User),
    ("User Profiles (buyzo_user_profiles)", Profile),
    ("Addresses (buyzo_user_addresses)", Address),
    ("Categories (buyzo_categories)", Category),
    ("Brands (buyzo_brands)", Brand),
    ("Products (buyzo_products)", Product),
    ("Product Variants (buyzo_product_variants)", ProductVariant),
    ("Orders (buyzo_orders)", Order),
    ("Order Items (buyzo_order_items)", OrderItem),
    ("Carts (buyzo_carts)", Cart),
    ("Cart Items (buyzo_cart_items)", CartItem),
    ("Coupons (buyzo_coupons)", Coupon),
    ("Payments (buyzo_payments)", Payment),
    ("Inbound Receipts (buyzo_inbound_receipts)", InboundReceipt),
    ("Outbound Shipments (buyzo_outbound_shipments)", OutboundShipment),
    ("Stock Transfers (buyzo_stock_transfers)", StockTransfer),
    ("Returned Items (buyzo_returned_items)", ReturnedItem),
    ("Delivery Tasks (buyzo_delivery_tasks)", DeliveryTask),
    ("Agent Earnings (buyzo_agent_earnings)", AgentEarnings),
    ("Product Reviews (buyzo_product_reviews)", Review),
    ("Notifications (buyzo_notifications)", InAppNotification),
]

for name, m in models:
    count = m.objects.count()
    print(f"  {name:48}: {count:4} records")

print("\n" + "=" * 75)
print("3. SAMPLE CATALOG DATA FETCH")
print("=" * 75)
for p in Product.objects.select_related('category', 'brand').all()[:5]:
    cat = p.category.name if p.category else "None"
    brand = p.brand.name if p.brand else "None"
    print(f"  [{p.id:2}] {p.title:<38} | Rs.{p.base_price:>8} | Stock: {p.stock_quantity:>3} | Cat: {cat:<15} | Brand: {brand}")

print("\n" + "=" * 75)
print("4. SAMPLE RECENT ORDERS FETCH")
print("=" * 75)
for o in Order.objects.select_related('customer').all()[:3]:
    user_email = o.customer.email if o.customer else "Anonymous"
    print(f"  Order #{o.order_number} | Status: {o.status:<12} | Total: Rs.{o.total_amount:>8} | Customer: {user_email}")

print("\n" + "=" * 75)
print("5. SAMPLE WAREHOUSE & LOGISTICS DATA FETCH")
print("=" * 75)
for r in InboundReceipt.objects.all()[:2]:
    print(f"  Inbound Receipt : {r.receipt_id} | {r.supplier_name} | {r.item_title} | Qty: {r.quantity} | Status: {r.status}")
for s in OutboundShipment.objects.all()[:2]:
    print(f"  Outbound Shipment: {s.shipment_id} | {s.destination_hub} | Courier: {s.courier_partner} | Status: {s.status}")
for d in DeliveryTask.objects.select_related('agent', 'order').all()[:2]:
    agent_email = d.agent.email if d.agent else "Unassigned"
    print(f"  Delivery Task   : {d.task_id} for Order #{d.order.order_number} | Stage: {d.get_current_stage_display()} | Agent: {agent_email}")

print("\n" + "=" * 75)
print("VERIFICATION RESULT: DATABASE IS CONNECTED & FETCHING DATA ACCURATELY")
print("=" * 75)
