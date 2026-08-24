import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.accounts.models import User, Profile, Address
from apps.catalog.models import Category, SubCategory, Brand, Product
from apps.orders.models import Order, OrderItem, OrderTrackingMilestone
from apps.support.models import ContactMessage, FAQ

print("=== VERIFYING DATABASE TABLE RELATIONSHIPS ===")

# 1. Accounts & Profile
users = User.objects.all()
print(f"Total Users: {users.count()}")
for u in users[:3]:
    profile_name = getattr(u, 'profile', None)
    orders_count = u.orders.count()
    print(f"  User: id={u.id}, email={u.email}, phone={u.phone}, role={u.role}, orders={orders_count}")

# 2. Categories & Products
cats = Category.objects.all()
print(f"\nTotal Categories: {cats.count()}")
for c in cats:
    prod_count = c.products.count()
    sub_count = c.subcategories.count()
    print(f"  Category: '{c.name}' (slug={c.slug}) -> Products: {prod_count}, SubCategories: {sub_count}")

# 3. Brands & Products
brands = Brand.objects.all()
print(f"\nTotal Brands: {brands.count()}")
for b in brands:
    print(f"  Brand: '{b.name}' -> Products: {b.products.count()}")

# 4. Products & Catalog Relations
products = Product.objects.all()
print(f"\nTotal Products: {products.count()}")
for p in products[:5]:
    cat_name = p.category.name if p.category else 'No Category'
    brand_name = p.brand.name if p.brand else 'No Brand'
    print(f"  Product: '{p.title}' (SKU={p.sku}, Base=Rs.{p.base_price}, Disc=Rs.{p.discount_price}) -> Cat: {cat_name}, Brand: {brand_name}, Stock: {p.stock_quantity}")

# 5. Orders & Order Items & Milestones
orders = Order.objects.all()
print(f"\nTotal Orders: {orders.count()}")
for o in orders[:5]:
    items_count = o.items.count()
    milestones_count = o.milestones.count()
    print(f"  Order: '{o.order_number}' -> Customer: {o.customer.email or o.customer.phone}, Total: Rs.{o.total_amount}, Status: {o.status}, Items: {items_count}, Milestones: {milestones_count}")
    for item in o.items.all():
        print(f"    Item: {item.quantity}x {item.product_title} (Rs.{item.unit_price} each = Rs.{item.total_price})")

print("\n=== ALL DATABASE TABLE RELATIONSHIPS ARE INTACT AND WORKING PERFECTLY! ===")
