import os, sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from apps.catalog.models import Product

products = list(Product.objects.all().order_by('id'))
print(f"Total Database Products: {len(products)}")

for p in products:
    print(f"ID {p.id:2d} | Category: {p.category.name if p.category else 'None':15s} | Title: {p.title}")
