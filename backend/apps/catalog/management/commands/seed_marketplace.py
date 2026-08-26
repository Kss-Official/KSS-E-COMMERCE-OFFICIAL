"""
``python manage.py seed_marketplace``

Builds the BuyZo marketplace out to real, production-shaped volume so that every
customer page and every staff portal reads live MySQL rows instead of bundled
JavaScript literals.

Design rules:

* **Idempotent.** Every write goes through ``update_or_create`` / ``get_or_create``
  keyed on a stable natural key (sku, order_number, receipt_id, ...). Re-running
  the command updates in place and never duplicates.
* **Non-destructive.** Rows seeded by the older ``seed_complete_frontend_data``
  command are adopted (matched by normalised title) rather than shadowed. The one
  exception is a genuine duplicate title, where the extra row is deactivated -
  not deleted - and reported.
* **Deterministic.** All "random" values are drawn from ``random.Random(seed)``
  seeded off the natural key, so two runs produce identical data.

Catalogue content lives in the sibling ``_marketplace_*`` modules.
"""

import re
import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Avg, Count
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.accounts.models import Profile, Address
from apps.catalog.models import (
    Category, SubCategory, Brand, Product, ProductImage, ProductVariant, HeroBanner,
)
from apps.coupons.models import Coupon
from apps.delivery.models import DeliveryTask, AgentEarnings
from apps.orders.models import Order, OrderItem, OrderTrackingMilestone
from apps.reviews.models import Review
from apps.warehouse.models import (
    InboundReceipt, OutboundShipment, StockTransfer, ReturnedItem,
)

from ._marketplace_tech import ELECTRONICS, MOBILES, LAPTOPS
from ._marketplace_lifestyle import FASHION, FOOTWEAR, BAGS, BEAUTY
from ._marketplace_home import HOME_KITCHEN, FURNITURE, APPLIANCES, SPORTS, BOOKS
from ._marketplace_people import (
    REVIEWERS, REVIEW_COPY, COUPONS, SUPPLIERS, HUBS, COURIERS,
    RETURN_REASONS, BIN_ZONES,
)

try:  # Added in the warehouse phase; the seeder stays runnable before then.
    from apps.warehouse.models import WarehouseInventory
except ImportError:  # pragma: no cover
    WarehouseInventory = None

User = get_user_model()

# (data list, category name, sku code, category display order, icon)
CATALOGUE = [
    (MOBILES, 'Mobiles', 'MOB', 1, 'Smartphone'),
    (LAPTOPS, 'Laptops', 'LAP', 2, 'Laptop'),
    (ELECTRONICS, 'Electronics', 'ELE', 3, 'Headphones'),
    (FASHION, 'Fashion', 'FSH', 4, 'Shirt'),
    (FURNITURE, 'Chairs & Furniture', 'FUR', 5, 'Armchair'),
    (HOME_KITCHEN, 'Home & Kitchen', 'HKN', 6, 'CookingPot'),
    (BEAUTY, 'Beauty', 'BTY', 7, 'Sparkles'),
    (FOOTWEAR, 'Footwear', 'FTW', 8, 'Footprints'),
    (BAGS, 'Bags & Luggage', 'BAG', 9, 'Briefcase'),
    (SPORTS, 'Sports & Fitness', 'SPT', 10, 'Dumbbell'),
    (APPLIANCES, 'Appliances', 'APL', 11, 'Microwave'),
    (BOOKS, 'Books & More', 'BKS', 12, 'BookOpen'),
]

APPAREL_SUBCATEGORIES = {"Women's Wear", "Men's Wear", "Ethnic Wear"}
FOOTWEAR_CATEGORY = 'Footwear'

APPAREL_SIZES = ['S', 'M', 'L', 'XL', 'XXL']
SHOE_SIZES = ['6', '7', '8', '9', '10', '11']
VARIANT_COLOURS = ['Black', 'Navy Blue', 'Olive Green', 'Maroon', 'Off White', 'Charcoal Grey']

PORTAL_ACCOUNTS = [
    # email, password, role, first, last, phone, staff, superuser, city, state, pin
    ('customer@buyzo.com', 'Customer@123', 'CUSTOMER', 'Riya', 'Sharma', '9800000001',
     False, False, 'Bengaluru', 'Karnataka', '560103'),
    ('admin@buyzo.com', 'Admin@123', 'ADMIN', 'Arnav', 'Kapoor', '9800000002',
     True, True, 'Mumbai', 'Maharashtra', '400051'),
    ('delivery@buyzo.com', 'Delivery@123', 'DELIVERY_AGENT', 'Sameer', 'Yadav', '9800000003',
     False, False, 'Pune', 'Maharashtra', '411045'),
    ('warehouse@buyzo.com', 'Warehouse@123', 'WAREHOUSE', 'Nikhil', 'Rane', '9800000004',
     False, False, 'Bhiwandi', 'Maharashtra', '421302'),
]

ORDER_PIPELINE = [
    # status, payment_status, payment_method, days_ago
    ('DELIVERED', 'PAID', 'MOCK', 34),
    ('DELIVERED', 'PAID', 'RAZORPAY', 29),
    ('DELIVERED', 'PAID', 'COD', 26),
    ('DELIVERED', 'PAID', 'MOCK', 22),
    ('DELIVERED', 'PAID', 'RAZORPAY', 19),
    ('DELIVERED', 'PAID', 'MOCK', 16),
    ('DELIVERED', 'PAID', 'COD', 14),
    ('DELIVERED', 'PAID', 'MOCK', 11),
    ('RETURNED', 'REFUNDED', 'MOCK', 24),
    ('REFUNDED', 'REFUNDED', 'RAZORPAY', 21),
    ('CANCELLED', 'UNPAID', 'COD', 18),
    ('CANCELLED', 'REFUNDED', 'MOCK', 13),
    ('OUT_FOR_DELIVERY', 'PAID', 'MOCK', 2),
    ('OUT_FOR_DELIVERY', 'UNPAID', 'COD', 2),
    ('OUT_FOR_DELIVERY', 'PAID', 'RAZORPAY', 1),
    ('SHIPPED', 'PAID', 'MOCK', 4),
    ('SHIPPED', 'UNPAID', 'COD', 3),
    ('SHIPPED', 'PAID', 'RAZORPAY', 3),
    ('PROCESSING', 'PAID', 'MOCK', 2),
    ('PROCESSING', 'PAID', 'MOCK', 1),
    ('PROCESSING', 'UNPAID', 'COD', 1),
    ('CONFIRMED', 'PAID', 'RAZORPAY', 1),
    ('CONFIRMED', 'PAID', 'MOCK', 0),
    ('CONFIRMED', 'UNPAID', 'COD', 0),
    ('PENDING', 'UNPAID', 'MOCK', 0),
    ('PENDING', 'UNPAID', 'RAZORPAY', 0),
]

MILESTONE_STEPS = [
    ('Order Placed', 'We have received your order and payment details.'),
    ('Order Confirmed', 'Your order has been confirmed and sent to the warehouse.'),
    ('Packed & Shipped', 'Your parcel has been packed and handed to the courier.'),
    ('Out for Delivery', 'Your parcel is with the delivery agent and arriving today.'),
    ('Delivered', 'Delivered successfully. Thanks for shopping with BuyZo!'),
]

STATUS_TO_MILESTONE_INDEX = {
    'PENDING': 0,
    'CONFIRMED': 1,
    'PROCESSING': 1,
    'SHIPPED': 2,
    'OUT_FOR_DELIVERY': 3,
    'DELIVERED': 4,
    'RETURNED': 4,
    'REFUNDED': 4,
    'CANCELLED': 1,
}


def norm_title(value):
    """Punctuation- and case-insensitive title key used to adopt legacy rows."""
    return re.sub(r'[^a-z0-9]+', ' ', str(value or '').lower()).strip()


def rng(*parts):
    return random.Random('buyzo::' + '::'.join(str(p) for p in parts))


class Command(BaseCommand):
    help = (
        'Seed the full BuyZo marketplace: catalogue, subcategories, images, '
        'variants, reviews, coupons, customers, staff accounts, orders, '
        'warehouse movements and delivery tasks. Safe to re-run.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--skip-reviews', action='store_true',
            help='Skip the review pass (much faster when iterating on catalogue data).',
        )

    # ------------------------------------------------------------------ main
    def handle(self, *args, **options):
        self.now = timezone.now()
        self.stdout.write(self.style.NOTICE('Seeding the BuyZo marketplace...'))

        with transaction.atomic():
            categories = self.seed_categories()
            subcategories = self.seed_subcategories(categories)
            brands = self.seed_brands()
            products = self.seed_products(categories, subcategories, brands)
            self.seed_variants(products)
            self.apply_merchandising_flags(products)

        customers = self.seed_customer_base()
        portal_users = self.seed_portal_accounts()

        if not options['skip_reviews']:
            self.seed_reviews(products, customers)

        self.seed_coupons()
        orders = self.seed_orders(products, customers, portal_users['customer@buyzo.com'])
        self.seed_delivery(orders, portal_users['delivery@buyzo.com'])
        self.seed_warehouse(products, orders, portal_users['warehouse@buyzo.com'])
        self.seed_hero_banners()

        self.report(products)

    # ----------------------------------------------------------- hero slider
    def seed_hero_banners(self):
        banners = [
            ('Discover.\nShop. Save More.',
             'Top brands, best prices and exclusive offers on every purchase, delivered across India.',
             'Shop Now', 'shop', 'Explore Offers', 'deals', 0),
            ('Big Tech Days\nUp to 60% Off',
             'Flagship phones, ultrabooks and audio from Apple, Samsung, Sony and more.',
             'Shop Electronics', 'electronics', 'View Deals', 'deals', 1),
            ('Fashion Fest\nStyles from Rs.399',
             'Fresh drops in womenswear, menswear and ethnic edits from the labels you already love.',
             'Shop Fashion', 'fashion', 'New Arrivals', 'new-arrivals', 2),
            ('Home Upgrade Sale\nFlat Rs.750 Off',
             'Cookware, decor, furniture and appliances to make every corner feel finished.',
             'Shop Home', 'home-kitchen', 'Best Sellers', 'best-sellers', 3),
        ]
        for title, subtitle, p_text, p_link, s_text, s_link, order in banners:
            fields = {
                'title': title,
                'subtitle': subtitle,
                'primary_button_text': p_text,
                'primary_button_link': p_link,
                'secondary_button_text': s_text,
                'secondary_button_link': s_link,
                'display_order': order,
                'is_active': True,
            }
            # title is not unique, so match on it manually rather than risk
            # MultipleObjectsReturned against rows from the older seeder.
            existing = HeroBanner.objects.filter(title=title).order_by('id').first()
            if existing:
                for field, value in fields.items():
                    setattr(existing, field, value)
                existing.save()
            else:
                HeroBanner.objects.create(**fields)
        self.stdout.write(self.style.SUCCESS(f'  hero banners     : {len(banners)}'))

    # ------------------------------------------------------------ categories
    def seed_categories(self):
        objs = {}
        for _, name, _, order, icon in CATALOGUE:
            cat, created = Category.objects.get_or_create(
                name=name,
                defaults={'display_order': order, 'icon_name': icon, 'is_active': True},
            )
            # Refresh presentation fields without touching a hand-uploaded image.
            dirty = []
            if cat.display_order != order:
                cat.display_order = order
                dirty.append('display_order')
            if not cat.icon_name:
                cat.icon_name = icon
                dirty.append('icon_name')
            if not cat.is_active:
                cat.is_active = True
                dirty.append('is_active')
            if not cat.description:
                cat.description = f'Shop {name.lower()} from top brands at BuyZo prices.'
                dirty.append('description')
            if dirty:
                cat.save(update_fields=dirty)
            objs[name] = cat
        self.stdout.write(self.style.SUCCESS(f'  categories       : {len(objs)}'))
        return objs

    def seed_subcategories(self, categories):
        objs = {}
        for data, cat_name, _, _, _ in CATALOGUE:
            category = categories[cat_name]
            for row in data:
                sub_name = row[2]
                key = (cat_name, sub_name)
                if key in objs:
                    continue
                sub, _ = SubCategory.objects.get_or_create(
                    category=category, name=sub_name,
                    defaults={'is_active': True},
                )
                objs[key] = sub
        self.stdout.write(self.style.SUCCESS(f'  subcategories    : {len(objs)}'))
        return objs

    def seed_brands(self):
        names = set()
        for data, *_ in CATALOGUE:
            for row in data:
                names.add(row[1])
        objs = {}
        for name in sorted(names):
            brand, _ = Brand.objects.get_or_create(name=name, defaults={'is_active': True})
            objs[name] = brand
        self.stdout.write(self.style.SUCCESS(f'  brands           : {len(objs)}'))
        return objs

    # -------------------------------------------------------------- products
    def seed_products(self, categories, subcategories, brands):
        # Adopt rows seeded by the earlier command instead of duplicating them.
        legacy = {}
        duplicates = []
        for existing in Product.objects.all().order_by('id'):
            key = norm_title(existing.title)
            if key in legacy:
                duplicates.append(existing)
            else:
                legacy[key] = existing

        for dup in duplicates:
            if dup.is_active:
                dup.is_active = False
                dup.save(update_fields=['is_active'])
        if duplicates:
            self.stdout.write(self.style.WARNING(
                f'  deactivated {len(duplicates)} duplicate legacy product row(s): '
                + ', '.join(d.sku for d in duplicates)
            ))

        products = []
        for data, cat_name, code, _, _ in CATALOGUE:
            category = categories[cat_name]
            for index, row in enumerate(data, start=1):
                title, brand_name, sub_name, base, discount, image, tags, specs = row
                sku = f'BZ-{code}-{index:03d}'
                r = rng(sku)

                stock = self.pick_stock(r)
                defaults = {
                    'title': title,
                    'category': category,
                    'subcategory': subcategories[(cat_name, sub_name)],
                    'brand': brands[brand_name],
                    'base_price': Decimal(str(base)),
                    'discount_price': Decimal(str(discount)) if discount else None,
                    'stock_quantity': stock,
                    'low_stock_threshold': 10,
                    'is_active': True,
                    # tags is a CharField(255); keep the join inside that budget.
                    'tags': (
                        f'{tags}, {brand_name.lower()}, {cat_name.lower()}, {sub_name.lower()}'
                    )[:255].rstrip(', '),
                    'description': self.build_description(title, brand_name, sub_name, specs),
                    'specifications': specs,
                }

                adopted = legacy.get(norm_title(title))
                if adopted is not None:
                    for field, value in defaults.items():
                        setattr(adopted, field, value)
                    adopted.save()
                    product = adopted
                else:
                    product, _ = Product.objects.update_or_create(sku=sku, defaults=defaults)

                ProductImage.objects.update_or_create(
                    product=product, is_primary=True,
                    defaults={'image': f'products/{image}', 'alt_text': title},
                )
                products.append(product)

        self.stdout.write(self.style.SUCCESS(f'  products         : {len(products)}'))
        return products

    @staticmethod
    def pick_stock(r):
        roll = r.random()
        if roll < 0.04:
            return 0                       # out of stock, so the UI has that state
        if roll < 0.15:
            return r.randint(2, 9)         # low stock -> warehouse alerts fire
        if roll < 0.55:
            return r.randint(25, 120)
        return r.randint(120, 480)

    @staticmethod
    def build_description(title, brand, subcategory, specs):
        spec_line = ' '.join(f'{k}: {v}.' for k, v in specs.items())
        return (
            f'{title} from {brand}. A {subcategory.lower()} pick that our buyers '
            f'shortlisted for build quality, everyday usability and value at this price. '
            f'{spec_line} '
            'Every BuyZo Assured listing ships with a genuine manufacturer warranty and a '
            'GST invoice, is quality-checked before dispatch, and is covered by our 7-day '
            'easy returns window. Free delivery on orders above Rs.499.'
        )

    # -------------------------------------------------------------- variants
    def seed_variants(self, products):
        created = 0
        for product in products:
            cat_name = product.category.name if product.category else ''
            sub_name = product.subcategory.name if product.subcategory else ''
            if sub_name in APPAREL_SUBCATEGORIES:
                sizes = APPAREL_SIZES
            elif cat_name == FOOTWEAR_CATEGORY:
                sizes = SHOE_SIZES
            else:
                continue

            r = rng('variant', product.sku)
            colours = r.sample(VARIANT_COLOURS, 2)
            for s_idx, size in enumerate(sizes):
                colour = colours[s_idx % len(colours)]
                variant_sku = f'{product.sku}-{size}-{colour[:3].upper()}'
                _, was_created = ProductVariant.objects.update_or_create(
                    sku=variant_sku,
                    defaults={
                        'product': product,
                        'size': size,
                        'color': colour,
                        'price_delta': Decimal('0.00') if s_idx < 3 else Decimal('100.00'),
                        'stock_quantity': r.randint(0, 40),
                    },
                )
                created += int(was_created)
        self.stdout.write(self.style.SUCCESS(f'  variants created : {created}'))

    # --------------------------------------------------------- merchandising
    def apply_merchandising_flags(self, products):
        """Fill Deals / New Arrivals / Best Sellers from the DB, not literals."""
        def discount_pct(p):
            if p.discount_price and p.base_price:
                return float((p.base_price - p.discount_price) / p.base_price)
            return 0.0

        Product.objects.filter(pk__in=[p.pk for p in products]).update(
            is_deal_of_day=False, is_new_arrival=False, is_featured=False
        )

        deals = sorted(products, key=lambda p: (-discount_pct(p), p.sku))[:30]
        Product.objects.filter(pk__in=[p.pk for p in deals]).update(is_deal_of_day=True)

        # New arrivals: spread across every category so the page is not all phones.
        by_category = {}
        for p in products:
            by_category.setdefault(p.category_id, []).append(p)
        arrivals = []
        for _, group in sorted(by_category.items(), key=lambda kv: kv[0] or 0):
            arrivals.extend(sorted(group, key=lambda p: p.sku)[:3])
        arrivals = arrivals[:32]
        Product.objects.filter(pk__in=[p.pk for p in arrivals]).update(is_new_arrival=True)
        for offset, product in enumerate(arrivals):
            Product.objects.filter(pk=product.pk).update(
                created_at=self.now - timedelta(days=offset // 4, hours=offset)
            )

        featured = sorted(products, key=lambda p: (-float(p.base_price), p.sku))[:18]
        featured += sorted(deals, key=lambda p: p.sku)[:18]
        Product.objects.filter(pk__in=[p.pk for p in featured]).update(is_featured=True)

        self.stdout.write(self.style.SUCCESS(
            f'  merchandising    : {len(deals)} deals, {len(arrivals)} new arrivals, '
            f'{len(set(p.pk for p in featured))} featured'
        ))

    # ------------------------------------------------------------- customers
    def seed_customer_base(self):
        customers = []
        for index, (first, last, city, state, pin) in enumerate(REVIEWERS, start=1):
            email = f'{first.lower()}.{last.lower()}@buyzomail.com'
            phone = f'9{700000000 + index:09d}'[:10]
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'role': 'CUSTOMER', 'is_verified': True, 'phone': phone},
            )
            if created:
                user.set_unusable_password()
                user.save(update_fields=['password'])
            Profile.objects.update_or_create(
                user=user, defaults={'first_name': first, 'last_name': last},
            )
            Address.objects.update_or_create(
                user=user, street_address=f'{index * 7}, MG Road',
                defaults={
                    'recipient_name': f'{first} {last}',
                    'phone_number': phone,
                    'city': city,
                    'state': state,
                    'postal_code': pin,
                    'country': 'India',
                    'address_type': 'HOME',
                    'is_default': True,
                },
            )
            customers.append(user)
        self.stdout.write(self.style.SUCCESS(f'  customer base    : {len(customers)}'))
        return customers

    def seed_portal_accounts(self):
        users = {}
        for (email, password, role, first, last, phone,
             is_staff, is_super, city, state, pin) in PORTAL_ACCOUNTS:
            user, _ = User.objects.get_or_create(email=email, defaults={'role': role})
            user.role = role
            user.phone = phone
            user.is_staff = is_staff
            user.is_superuser = is_super
            user.is_active = True
            user.is_verified = True
            user.set_password(password)
            user.save()

            Profile.objects.update_or_create(
                user=user, defaults={'first_name': first, 'last_name': last},
            )
            Address.objects.update_or_create(
                user=user, street_address='14, Brigade Gateway, Rajajinagar',
                defaults={
                    'recipient_name': f'{first} {last}',
                    'phone_number': phone,
                    'city': city,
                    'state': state,
                    'postal_code': pin,
                    'country': 'India',
                    'address_type': 'HOME',
                    'is_default': True,
                },
            )
            users[email] = user

        customer = users['customer@buyzo.com']
        if customer.wallet_balance == Decimal('0.00'):
            customer.wallet_balance = Decimal('2500.00')
            customer.save(update_fields=['wallet_balance'])

        self.stdout.write(self.style.SUCCESS(f'  portal accounts  : {len(users)}'))
        return users

    # --------------------------------------------------------------- reviews
    def seed_reviews(self, products, customers):
        existing = set(
            Review.objects.filter(product__in=products)
            .values_list('product_id', 'user_id')
        )
        pending = []
        for product in products:
            r = rng('review', product.sku)
            count = r.randint(6, min(22, len(customers)))
            for reviewer in r.sample(customers, count):
                if (product.pk, reviewer.pk) in existing:
                    continue
                rating = r.choices([5, 4, 3, 2], weights=[52, 30, 13, 5])[0]
                title, comment = r.choice(REVIEW_COPY[rating])
                pending.append(Review(
                    product=product, user=reviewer, rating=rating,
                    title=title, comment=comment,
                    is_verified_purchase=r.random() < 0.82,
                ))
        if pending:
            Review.objects.bulk_create(pending, batch_size=500, ignore_conflicts=True)

        # Review.save() recomputes aggregates one row at a time; bulk_create skips
        # it, so recompute in a single pass here.
        stats = {
            row['product_id']: row
            for row in Review.objects.filter(product__in=products)
            .values('product_id')
            .annotate(avg=Avg('rating'), total=Count('id'))
        }
        to_update = []
        for product in products:
            row = stats.get(product.pk)
            if not row:
                continue
            product.average_rating = Decimal(str(round(row['avg'], 2)))
            product.review_count = row['total']
            to_update.append(product)
        Product.objects.bulk_update(to_update, ['average_rating', 'review_count'], batch_size=500)

        self.stdout.write(self.style.SUCCESS(
            f'  reviews          : +{len(pending)} new, '
            f'{sum(r["total"] for r in stats.values())} total'
        ))

    # --------------------------------------------------------------- coupons
    def seed_coupons(self):
        for (code, dtype, value, max_disc, min_order,
             per_user, days, active) in COUPONS:
            Coupon.objects.update_or_create(
                code=code,
                defaults={
                    'discount_type': dtype,
                    'discount_value': Decimal(str(value)),
                    'max_discount_amount': Decimal(str(max_disc)) if max_disc else None,
                    'min_order_value': Decimal(str(min_order)),
                    'valid_from': self.now - timedelta(days=7),
                    'valid_to': self.now + timedelta(days=days),
                    'total_usage_limit': None,
                    'per_user_limit': per_user,
                    'is_active': active,
                },
            )
        self.stdout.write(self.style.SUCCESS(f'  coupons          : {len(COUPONS)}'))

    # ---------------------------------------------------------------- orders
    def seed_orders(self, products, customers, primary_customer):
        sellable = [p for p in products if p.stock_quantity > 0]
        orders = []

        for index, (status, pay_status, pay_method, days_ago) in enumerate(ORDER_PIPELINE):
            order_number = f'ORD-9{index:04d}'
            r = rng('order', order_number)

            # Weight the demo customer heavily so their Orders page is populated.
            customer = primary_customer if index % 2 == 0 else r.choice(customers)
            address = customer.addresses.filter(is_default=True).first() or customer.addresses.first()
            profile = getattr(customer, 'profile', None)
            recipient = profile.full_name if profile else (customer.email or 'BuyZo Customer')

            picked = r.sample(sellable, r.randint(1, 4))
            lines = []
            subtotal = Decimal('0.00')
            for product in picked:
                qty = r.randint(1, 2)
                unit = Decimal(product.current_price)
                lines.append((product, qty, unit, unit * qty))
                subtotal += unit * qty

            coupon_code, discount = ('', Decimal('0.00'))
            if r.random() < 0.4 and subtotal >= Decimal('999'):
                coupon_code = r.choice(['WELCOME10', 'BUYZO500', 'FESTIVE25', 'NEWUSER100'])
                discount = (subtotal * Decimal('0.10')).quantize(Decimal('0.01'))
                if discount > Decimal('500'):
                    discount = Decimal('500.00')
            shipping = Decimal('0.00') if subtotal >= Decimal('499') else Decimal('49.00')
            total = (subtotal - discount + shipping).quantize(Decimal('0.01'))

            order, _ = Order.objects.update_or_create(
                order_number=order_number,
                defaults={
                    'customer': customer,
                    'shipping_name': recipient,
                    'shipping_phone': (address.phone_number if address else '9800000001'),
                    'shipping_email': customer.email or '',
                    'shipping_address': (address.street_address if address else '14, Brigade Gateway'),
                    'shipping_city': (address.city if address else 'Bengaluru'),
                    'shipping_state': (address.state if address else 'Karnataka'),
                    'shipping_pincode': (address.postal_code if address else '560103'),
                    'shipping_country': 'India',
                    'subtotal': subtotal.quantize(Decimal('0.01')),
                    'coupon_code': coupon_code or None,
                    'discount_amount': discount,
                    'tax_amount': Decimal('0.00'),
                    'shipping_amount': shipping,
                    'total_amount': total,
                    'status': status,
                    'payment_method': pay_method,
                    'payment_status': pay_status,
                    'is_revenue_counted': status not in ('CANCELLED', 'RETURNED', 'REFUNDED'),
                    'delivery_otp': f'{r.randint(1000, 9999)}',
                    'notes': 'Seeded pipeline order for portal demonstration.',
                },
            )
            placed_at = self.now - timedelta(days=days_ago, hours=r.randint(0, 20))
            Order.objects.filter(pk=order.pk).update(created_at=placed_at)
            order.created_at = placed_at

            order.items.all().delete()
            for product, qty, unit, line_total in lines:
                image = product.images.filter(is_primary=True).first()
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_title=product.title,
                    sku=product.sku,
                    product_image=(image.image.url if image and image.image else ''),
                    unit_price=unit,
                    quantity=qty,
                    total_price=line_total,
                )

            self.seed_milestones(order, status, placed_at)
            orders.append(order)

        self.stdout.write(self.style.SUCCESS(f'  orders           : {len(orders)}'))
        return orders

    def seed_milestones(self, order, status, placed_at):
        reached = STATUS_TO_MILESTONE_INDEX.get(status, 0)
        cancelled = status in ('CANCELLED',)
        for idx, (step, description) in enumerate(MILESTONE_STEPS):
            if cancelled and idx > 1:
                break
            is_done = idx < reached or (idx == reached and status in ('DELIVERED', 'RETURNED', 'REFUNDED'))
            milestone, _ = OrderTrackingMilestone.objects.update_or_create(
                order=order, order_index=idx,
                defaults={
                    'step_title': step,
                    'description': description,
                    'is_completed': is_done or idx < reached,
                    'is_active': idx == reached and not is_done,
                },
            )
            if milestone.is_completed or milestone.is_active:
                OrderTrackingMilestone.objects.filter(pk=milestone.pk).update(
                    timestamp=placed_at + timedelta(hours=idx * 14)
                )
        if cancelled:
            OrderTrackingMilestone.objects.update_or_create(
                order=order, order_index=9,
                defaults={
                    'step_title': 'Order Cancelled',
                    'description': order.cancellation_reason or 'Cancelled at the customer\'s request.',
                    'is_completed': True,
                    'is_active': False,
                },
            )

    # -------------------------------------------------------------- delivery
    def seed_delivery(self, orders, agent):
        stage_map = {'SHIPPED': 1, 'OUT_FOR_DELIVERY': 2, 'DELIVERED': 4, 'RETURNED': 5}
        status_map = {'SHIPPED': 'ASSIGNED', 'OUT_FOR_DELIVERY': 'IN_TRANSIT',
                      'DELIVERED': 'DELIVERED', 'RETURNED': 'FAILED'}
        tasks = 0
        earnings = 0
        for order in orders:
            if order.status not in stage_map:
                continue
            r = rng('task', order.order_number)
            is_cod = order.payment_method == 'COD'
            task, _ = DeliveryTask.objects.update_or_create(
                order=order,
                defaults={
                    'task_id': f'TASK-{order.order_number[-5:]}',
                    'agent': agent,
                    'recipient_name': order.shipping_name,
                    'recipient_phone': order.shipping_phone,
                    'delivery_address': (
                        f'{order.shipping_address}, {order.shipping_city}, '
                        f'{order.shipping_state} - {order.shipping_pincode}'
                    ),
                    'cod_amount': order.total_amount if is_cod else Decimal('0.00'),
                    'is_cod_collected': is_cod and order.status == 'DELIVERED',
                    'current_stage': stage_map[order.status],
                    'status': status_map[order.status],
                    'notes': r.choice([
                        'Call on arrival, gate security requires a name.',
                        'Leave with the building reception if unavailable.',
                        'Second floor, lift is under maintenance.',
                        '',
                    ]),
                    'delivered_at': (order.created_at + timedelta(days=3)) if order.status == 'DELIVERED' else None,
                },
            )
            DeliveryTask.objects.filter(pk=task.pk).update(
                created_at=order.created_at + timedelta(days=1)
            )
            tasks += 1

            if order.status == 'DELIVERED':
                base = Decimal('50.00')
                tip = Decimal(str(r.choice([0, 0, 10, 20, 30, 50])))
                incentive = Decimal(str(r.choice([10, 15, 20, 25])))
                obj, _ = AgentEarnings.objects.update_or_create(
                    agent=agent, order=order,
                    defaults={
                        'base_fee': base,
                        'tip': tip,
                        'incentive': incentive,
                        'total_earned': base + tip + incentive,
                    },
                )
                AgentEarnings.objects.filter(pk=obj.pk).update(
                    earned_at=order.created_at + timedelta(days=3)
                )
                earnings += 1

        self.stdout.write(self.style.SUCCESS(
            f'  delivery         : {tasks} tasks, {earnings} earning records'
        ))

    # ------------------------------------------------------------- warehouse
    def seed_warehouse(self, products, orders, operator):
        inbound = 0
        for index, product in enumerate(sorted(products, key=lambda p: p.sku)[:20], start=1):
            r = rng('inbound', product.sku)
            receipt_id = f'RCPT-9{index:05d}'
            obj, _ = InboundReceipt.objects.update_or_create(
                receipt_id=receipt_id,
                defaults={
                    'supplier_name': SUPPLIERS[index % len(SUPPLIERS)],
                    'item_title': product.title,
                    'sku': product.sku,
                    'quantity': r.randint(20, 300),
                    'status': 'Verified' if index % 3 else 'Pending Verification',
                    'received_by': operator,
                },
            )
            InboundReceipt.objects.filter(pk=obj.pk).update(
                received_at=self.now - timedelta(days=index, hours=r.randint(0, 20))
            )
            inbound += 1

        outbound = 0
        shippable = [o for o in orders if o.status in
                     ('PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED')]
        for index, order in enumerate(shippable, start=1):
            r = rng('outbound', order.order_number)
            first_item = order.items.first()
            if not first_item:
                continue
            hub, _state = HUBS[index % len(HUBS)]
            if order.status == 'PROCESSING':
                status = 'Packing In Progress'
            elif order.status == 'SHIPPED':
                status = 'Ready for Pickup'
            else:
                status = 'Dispatched'
            obj, _ = OutboundShipment.objects.update_or_create(
                shipment_id=f'SHP-9{index:05d}',
                defaults={
                    'destination_hub': hub,
                    'item_title': first_item.product_title,
                    'sku': first_item.sku,
                    'quantity': first_item.quantity,
                    'courier_partner': COURIERS[index % len(COURIERS)],
                    'status': status,
                    'dispatched_at': (order.created_at + timedelta(days=1)) if status == 'Dispatched' else None,
                },
            )
            OutboundShipment.objects.filter(pk=obj.pk).update(
                created_at=order.created_at + timedelta(hours=r.randint(2, 20))
            )
            outbound += 1

        transfers = 0
        for index, product in enumerate(sorted(products, key=lambda p: p.sku)[40:54], start=1):
            r = rng('transfer', product.sku)
            hub, _state = HUBS[index % len(HUBS)]
            obj, _ = StockTransfer.objects.update_or_create(
                transfer_id=f'TRF-9{index:05d}',
                defaults={
                    'source_warehouse': 'WH01 - Main Warehouse',
                    'destination_warehouse': hub,
                    'item_title': product.title,
                    'sku': product.sku,
                    'quantity': r.randint(10, 90),
                    'status': ['Initiated', 'In Transit', 'Completed'][index % 3],
                },
            )
            StockTransfer.objects.filter(pk=obj.pk).update(
                created_at=self.now - timedelta(days=index * 2, hours=r.randint(0, 18))
            )
            transfers += 1

        returns = 0
        returned_orders = [o for o in orders if o.status in ('RETURNED', 'REFUNDED', 'CANCELLED')]
        for index, order in enumerate(returned_orders, start=1):
            r = rng('return', order.order_number)
            item = order.items.first()
            if not item:
                continue
            condition = 'Good Condition' if index % 3 else 'Damaged'
            obj, _ = ReturnedItem.objects.update_or_create(
                return_id=f'RET-9{index:05d}',
                defaults={
                    'order_number': order.order_number,
                    'customer_name': order.shipping_name,
                    'item_title': item.product_title,
                    'quantity': item.quantity,
                    'reason': r.choice(RETURN_REASONS),
                    'condition': condition,
                    'status': 'Inspected' if index % 2 else ('Restocked' if condition == 'Good Condition' else 'Discarded'),
                },
            )
            ReturnedItem.objects.filter(pk=obj.pk).update(
                inspected_at=order.created_at + timedelta(days=5)
            )
            returns += 1

        self.stdout.write(self.style.SUCCESS(
            f'  warehouse        : {inbound} inbound, {outbound} outbound, '
            f'{transfers} transfers, {returns} returns'
        ))

        if WarehouseInventory is None:
            self.stdout.write(self.style.WARNING(
                '  warehouse bins   : skipped (WarehouseInventory model not migrated yet)'
            ))
            return

        bins = 0
        for index, product in enumerate(products, start=1):
            r = rng('bin', product.sku)
            zone = BIN_ZONES[index % len(BIN_ZONES)]
            total = product.stock_quantity
            reserved = min(total, r.randint(0, max(1, total // 5)))
            in_transit = r.randint(0, 60)
            WarehouseInventory.objects.update_or_create(
                product=product,
                defaults={
                    'bin_location': f'{zone}-{(index % 24) + 1:02d}-{(index % 6) + 1}',
                    'total_units': total,
                    'reserved_units': reserved,
                    'in_transit_units': in_transit,
                    'reorder_level': product.low_stock_threshold,
                },
            )
            bins += 1
        self.stdout.write(self.style.SUCCESS(f'  warehouse bins   : {bins}'))

    # ---------------------------------------------------------------- report
    def report(self, products):
        self.stdout.write('')
        self.stdout.write(self.style.MIGRATE_HEADING('Products per category'))
        for category in Category.objects.all().order_by('display_order', 'name'):
            count = category.products.filter(is_active=True).count()
            style = self.style.SUCCESS if count >= 20 else self.style.WARNING
            self.stdout.write(style(f'  {category.name:22s} {count:4d}'))

        self.stdout.write('')
        self.stdout.write(self.style.MIGRATE_HEADING('Portal credentials'))
        for email, password, role, *_ in PORTAL_ACCOUNTS:
            self.stdout.write(f'  {role:16s} {email:26s} {password}')
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Done. {Product.objects.filter(is_active=True).count()} active products, '
            f'{Review.objects.count()} reviews, {Order.objects.count()} orders, '
            f'{User.objects.count()} users.'
        ))
