import os
import sys
import django

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.catalog.models import ProductImage, Category, HeroBanner

print("Fixing ProductImage instances...")
count = 0
for img in ProductImage.objects.all():
    original = img.image.name
    if not original:
        continue
    new_name = original
    if new_name.startswith('/media/'):
        new_name = new_name[7:]
    elif new_name.startswith('media/'):
        new_name = new_name[6:]
    
    if new_name != original:
        img.image.name = new_name
        img.save()
        count += 1
        print(f"Fixed [{img.id}]: '{original}' -> '{new_name}'")

print(f"Total fixed ProductImages: {count}")
