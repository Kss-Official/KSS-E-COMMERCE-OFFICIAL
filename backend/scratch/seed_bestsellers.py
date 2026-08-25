import os, sys, random

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from apps.catalog.models import Category, Product

items = [
    {
        'title': 'boAt Rockerz 450 Wireless Bluetooth On-Ear Headphone',
        'category': 'Electronics',
        'discount_price': 1499.00,
        'base_price': 3999.00,
        'stock_quantity': 150,
        'description': 'High definition audio with up to 15 hours battery backup and plush ear cushions.'
    },
    {
        'title': 'Redmi Note 13 Pro 5G (8GB RAM, 128GB Storage)',
        'category': 'Mobiles',
        'discount_price': 18999.00,
        'base_price': 24999.00,
        'stock_quantity': 110,
        'description': '200MP OIS camera with 120Hz curved AMOLED display and 67W Turbo Charge.'
    },
    {
        'title': "Women's Floral Fit & Flare Casual Summer Dress",
        'category': 'Fashion',
        'discount_price': 1499.00,
        'base_price': 2999.00,
        'stock_quantity': 45,
        'description': 'Flowy A-line breathable cotton silhouette with elegant sweetheart neckline.'
    },
    {
        'title': 'Noise ColorFit Pro 5 Smartwatch with 1.85" HD Display',
        'category': 'Electronics',
        'discount_price': 2999.00,
        'base_price': 4999.00,
        'stock_quantity': 85,
        'description': 'Bluetooth calling, 100+ sports modes, stainless steel crown and 7-day battery.'
    },
    {
        'title': 'HP 15s 12th Gen Intel Core i5 Thin & Light Laptop',
        'category': 'Laptops',
        'discount_price': 44990.00,
        'base_price': 58900.00,
        'stock_quantity': 40,
        'description': '16GB DDR4, 512GB NVMe SSD, 15.6 inch FHD anti-glare micro-edge display.'
    },
    {
        'title': "Women's Printed Anarkali Kurta Set with Dupatta",
        'category': 'Fashion',
        'discount_price': 2499.00,
        'base_price': 4999.00,
        'stock_quantity': 40,
        'description': 'Handcrafted gold foil print royal Anarkali with silk blend finish.'
    },
    {
        'title': 'Unisex Flyer Flex Training & Gym Running Shoes',
        'category': 'Footwear',
        'discount_price': 2799.00,
        'base_price': 4999.00,
        'stock_quantity': 70,
        'description': 'SoftFoam+ cushioning with rugged traction outsole for supreme athletic comfort.'
    },
    {
        'title': "Women's Structured Handbag with Detachable Sling",
        'category': 'Bags & Luggage',
        'discount_price': 1899.00,
        'base_price': 3990.00,
        'stock_quantity': 35,
        'description': 'Premium textured faux-leather bag with dual handles and secure zip compartments.'
    },
    {
        'title': "Men's Classic Stonewashed Heavy Denim Jacket",
        'category': 'Fashion',
        'discount_price': 3499.00,
        'base_price': 6499.00,
        'stock_quantity': 30,
        'description': 'Authentic 100% durable cotton denim with vintage wash and button flap pockets.'
    },
    {
        'title': 'Dell Inspiron 15 Core i5 16GB RAM Laptop',
        'category': 'Laptops',
        'discount_price': 54990.00,
        'base_price': 68000.00,
        'stock_quantity': 30,
        'description': 'Intel Core i5-1235U, 16GB RAM, 512GB SSD, Windows 11 + MS Office 2021.'
    },
    {
        'title': 'Casual Streetwear Chunky Sole Sneakers',
        'category': 'Footwear',
        'discount_price': 3299.00,
        'base_price': 5999.00,
        'stock_quantity': 50,
        'description': 'Retro chunky street sneaker built with soft cushioned sole and durable leather panels.'
    },
    {
        'title': 'Urban Ergonomic Everyday Laptop Backpack 28L',
        'category': 'Bags & Luggage',
        'discount_price': 1299.00,
        'base_price': 2499.00,
        'stock_quantity': 50,
        'description': 'Triple compartment water-resistant nylon backpack with padded back airflow mesh.'
    },
    {
        'title': 'Apple iPhone 15 Pro Max 256GB Titanium',
        'category': 'Mobiles',
        'discount_price': 149900.00,
        'base_price': 159900.00,
        'stock_quantity': 25,
        'description': 'Forged in titanium with A17 Pro chip and customizable Action button.'
    },
    {
        'title': 'Samsung Galaxy S24 Ultra 5G AI Smartphone',
        'category': 'Mobiles',
        'discount_price': 129999.00,
        'base_price': 139999.00,
        'stock_quantity': 30,
        'description': 'Galaxy AI with 200MP camera and built-in S Pen.'
    },
    {
        'title': 'OnePlus 12 5G (16GB RAM, 512GB Storage)',
        'category': 'Mobiles',
        'discount_price': 64999.00,
        'base_price': 69999.00,
        'stock_quantity': 45,
        'description': 'Snapdragon 8 Gen 3 with 4th Gen Hasselblad Camera System.'
    },
    {
        'title': 'Google Pixel 8 Pro 128GB Obsidian',
        'category': 'Mobiles',
        'discount_price': 88999.00,
        'base_price': 106999.00,
        'stock_quantity': 20,
        'description': 'Google Tensor G3 with advanced Pixel Camera and AI features.'
    }
]

created_count = 0
updated_count = 0
for idx, item in enumerate(items, start=101):
    cat_obj, _ = Category.objects.get_or_create(name=item['category'], defaults={'is_active': True})
    prod, created = Product.objects.get_or_create(
        title=item['title'],
        defaults={
            'category': cat_obj,
            'sku': f"SKU-BS-{idx}",
            'base_price': item['base_price'],
            'discount_price': item['discount_price'],
            'stock_quantity': item['stock_quantity'],
            'description': item['description'],
            'is_active': True,
            'is_featured': True
        }
    )
    if created:
        created_count += 1
    else:
        if not prod.category:
            prod.category = cat_obj
            prod.save(update_fields=['category'])
            updated_count += 1

print(f'Seeded {created_count} new products and updated {updated_count} existing products in database!')
