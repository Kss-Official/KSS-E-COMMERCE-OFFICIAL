import os, sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from apps.catalog.models import Product, Category, Brand

try:
    p = Product.objects.get(id=79)
    cat, _ = Category.objects.get_or_create(name='Mobiles', defaults={'slug': 'mobiles', 'is_active': True})
    b, _ = Brand.objects.get_or_create(name='Vivo', defaults={'slug': 'vivo', 'is_active': True})
    
    p.title = 'Vivo V30 Pro 5G (12GB RAM, 512GB Storage)'
    p.category = cat
    p.brand = b
    p.base_price = 46999.00
    p.discount_price = 41999.00
    p.description = 'Vivo V30 Pro 5G featuring ZEISS Professional Portrait Camera, 50MP Sony IMX920 Sensor, MediaTek Dimensity 8200 chipset, 80W FlashCharge, and 120Hz 3D Curved AMOLED Display.'
    p.average_rating = 4.7
    p.review_count = 340
    p.is_active = True
    p.save()
    
    print("SUCCESS: Updated Product ID 79 to Vivo V30 Pro 5G!")
except Product.DoesNotExist:
    print("Product ID 79 not found.")
