import os, sys, re

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from apps.catalog.models import Product
from apps.orders.models import OrderItem
from apps.cart.models import CartItem

def get_fuzzy_key(title):
    t = title.lower()
    # Normalize common duplicates
    if 'rockerz' in t: return 'boat_rockerz_450'
    if 'colorfit' in t: return 'noise_colorfit_pro_5'
    if 'wh-ch510' in t: return 'sony_wh_ch510'
    if 'dell inspiron' in t: return 'dell_inspiron_15'
    if 'hp 15s' in t: return 'hp_15s'
    if 'redmi note 13' in t: return 'redmi_note_13'
    if 'flyer flex' in t: return 'puma_flyer_flex'
    if 'structured handbag' in t or 'structured satchel' in t: return 'women_handbag'
    if 'floral fit' in t: return 'women_floral_dress'
    if 'anarkali' in t: return 'women_anarkali'
    if 'denim jacket' in t: return 'men_denim_jacket'
    if 's23' in t: return 'samsung_s23'
    if 'iphone 15' in t and 'pro' not in t: return 'apple_iphone_15'
    if 'oud' in t and 'amber' in t: return 'luxury_oud_perfume'
    
    # Fallback key: first 3 words
    words = re.findall(r'[a-z0-9]+', t)
    return "_".join(words[:3]) if len(words) >= 3 else t

all_products = list(Product.objects.all())
groups = {}

for p in all_products:
    key = get_fuzzy_key(p.title)
    if key not in groups:
        groups[key] = []
    groups[key].append(p)

deleted_count = 0
retained_count = 0

for key, p_list in groups.items():
    if len(p_list) == 1:
        retained_count += 1
        continue

    # Keep the product with the longest/most detailed title and higher ID (seeded detailed items)
    p_list.sort(key=lambda p: (len(p.title), p.id), reverse=True)
    canonical = p_list[0]
    duplicates = p_list[1:]

    retained_count += 1
    for dup in duplicates:
        OrderItem.objects.filter(product=dup).update(product=canonical)
        CartItem.objects.filter(product=dup).update(product=canonical)
        dup.delete()
        deleted_count += 1
        print(f"Merged duplicate product ID {dup.id} '{dup.title}' -> canonical ID {canonical.id} '{canonical.title}'")

print(f"\nFuzzy Cleanup Finished! Retained {retained_count} unique products, deleted {deleted_count} duplicates.")
