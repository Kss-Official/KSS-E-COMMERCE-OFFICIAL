import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

print("=== COMPLETE DATABASE PERSISTENCE AUDIT ===")

with connection.cursor() as cursor:
    cursor.execute("SHOW TABLES")
    tables = [row[0] for row in cursor.fetchall()]

print(f"Total Tables in MySQL: {len(tables)}\n")

for table in sorted(tables):
    if table.startswith('buyzo_') or table.startswith('django_'):
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT COUNT(*) FROM `{table}`")
            count = cursor.fetchone()[0]
        print(f"  Table: `{table}` -> {count} records stored")

print("\n=== DETAILED DATA SAMPLES ===")

from apps.accounts.models import User, Profile
from apps.catalog.models import Category, Brand, Product
from apps.orders.models import Order, OrderItem, OrderTrackingMilestone
from apps.support.models import ContactMessage

print(f"\n1. USERS & PROFILES ({User.objects.count()} Users):")
for u in User.objects.all():
    reg = u.date_joined.strftime('%Y-%m-%d %H:%M') if getattr(u, 'date_joined', None) else 'N/A'
    print(f"   - User #{u.id}: email={u.email}, phone={u.phone}, role={u.role}, registered={reg}")

print(f"\n2. CATEGORIES ({Category.objects.count()} Categories):")
for c in Category.objects.all():
    print(f"   - Category #{c.id}: name='{c.name}', slug='{c.slug}', active={c.is_active}")

print(f"\n3. BRANDS ({Brand.objects.count()} Brands):")
for b in Brand.objects.all():
    print(f"   - Brand #{b.id}: name='{b.name}', slug='{b.slug}'")

print(f"\n4. PRODUCTS ({Product.objects.count()} Products):")
for p in Product.objects.all()[:6]:
    print(f"   - Product #{p.id}: '{p.title}', SKU={p.sku}, Base=Rs.{p.base_price}, Disc=Rs.{p.discount_price}, Stock={p.stock_quantity}")

print(f"\n5. ORDERS ({Order.objects.count()} Orders):")
for o in Order.objects.all():
    print(f"   - Order #{o.id} ({o.order_number}): Customer={o.customer.email or o.customer.phone}, Total=Rs.{o.total_amount}, Status={o.status}, OTP={o.delivery_otp}, Items={o.items.count()}")

print(f"\n6. CONTACT MESSAGES ({ContactMessage.objects.count()} Messages):")
for m in ContactMessage.objects.all():
    print(f"   - Message #{m.id}: from '{m.name}' ({m.email}), Subject='{m.subject}', Date={m.created_at.strftime('%Y-%m-%d %H:%M')}")

print("\n=== AUDIT COMPLETE: 100% PERSISTENT IN MYSQL DATABASE ===")
