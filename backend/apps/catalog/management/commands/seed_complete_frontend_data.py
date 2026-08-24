import os
import shutil
from pathlib import Path
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone
from datetime import timedelta

from apps.accounts.models import User, Profile, Address
from apps.catalog.models import Category, SubCategory, Brand, Product, ProductImage, ProductVariant, HeroBanner
from apps.orders.models import Order, OrderItem
from apps.delivery.models import DeliveryTask, AgentEarnings
from apps.warehouse.models import InboundReceipt, OutboundShipment, StockTransfer
from apps.coupons.models import Coupon
from apps.reviews.models import Review

class Command(BaseCommand):
    help = "Migrate all frontend assets to backend media storage and seed complete catalog, deals, and orders database"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting complete frontend-backend data migration and seeding..."))

        backend_root = Path(settings.BASE_DIR)
        media_root = Path(settings.MEDIA_ROOT)
        frontend_assets = backend_root.parent / "frontend" / "src" / "assets"

        # Create media directories
        media_dirs = {
            "banners": media_root / "banners",
            "deals": media_root / "deals",
            "categories": media_root / "categories",
            "products": media_root / "products",
            "branding": media_root / "branding",
            "auth": media_root / "auth",
            "support": media_root / "support",
        }

        for d in media_dirs.values():
            d.mkdir(parents=True, exist_ok=True)

        self.stdout.write(self.style.SUCCESS("[OK] Media subdirectories created."))

        # ----------------- STEP 1: ASSET COPYING -----------------
        copied_files = 0
        if frontend_assets.exists():
            # 1. Banners
            for src_name in ["HerohomePage.png", "HeroHomeChair.png", "HeroHomeLamp.png"]:
                src = frontend_assets / src_name
                if src.exists():
                    shutil.copy2(src, media_dirs["banners"] / src_name)
                    copied_files += 1

            # Banners from images/
            images_dir = frontend_assets / "images"
            if images_dir.exists():
                for banner_img in [
                    "deals_hero.jpg", "fashion_hero.jpg", "new_arrivals_banner_hero.jpg",
                    "shop_banner_hero.jpg", "contact_hero.jpg", "ContactHeroPageBackground.png"
                ]:
                    src = images_dir / banner_img
                    if src.exists():
                        shutil.copy2(src, media_dirs["banners"] / banner_img)
                        copied_files += 1

            # 2. Deals
            deals_dir = frontend_assets / "Deals"
            if deals_dir.exists():
                for f in deals_dir.glob("*.*"):
                    shutil.copy2(f, media_dirs["deals"] / f.name)
                    copied_files += 1

            # 3. Categories
            category_dir = frontend_assets / "category"
            if category_dir.exists():
                for f in category_dir.glob("*.*"):
                    shutil.copy2(f, media_dirs["categories"] / f.name)
                    copied_files += 1

            # 4. Products from images/
            if images_dir.exists():
                for prod_img in [
                    "boat_rockerz.jpg", "noise_smartwatch.jpg", "sony_headphones.jpg",
                    "jbl_speaker.jpg", "dell_laptop.jpg", "hp_laptop.jpg",
                    "roadster_shirt.jpg", "teal_backpack.jpg", "accent_chair.jpg",
                    "redmi_note13.jpg", "women_dress.jpg", "lounge_chair.jpg",
                    "camera_canon.jpg", "gopro_action_cam.jpg"
                ]:
                    src = images_dir / prod_img
                    if src.exists():
                        shutil.copy2(src, media_dirs["products"] / prod_img)
                        copied_files += 1

            # 5. Branding
            logo_src = frontend_assets / "logo.png"
            if logo_src.exists():
                shutil.copy2(logo_src, media_dirs["branding"] / "logo.png")
                copied_files += 1

            # 6. Auth
            login_dir = frontend_assets / "loginPage"
            if login_dir.exists():
                for f in login_dir.glob("*.*"):
                    shutil.copy2(f, media_dirs["auth"] / f.name)
                    copied_files += 1
            if images_dir.exists():
                bag_src = images_dir / "login_shopping_bag.png"
                if bag_src.exists():
                    shutil.copy2(bag_src, media_dirs["auth"] / "login_shopping_bag.png")
                    copied_files += 1

            # 7. Support
            contact_dir = frontend_assets / "contact"
            if contact_dir.exists():
                for f in contact_dir.glob("*.*"):
                    shutil.copy2(f, media_dirs["support"] / f.name)
                    copied_files += 1

        self.stdout.write(self.style.SUCCESS(f"[OK] Copied {copied_files} frontend image assets into media storage."))

        # ----------------- STEP 2: SEED HERO BANNERS -----------------
        HeroBanner.objects.all().delete()
        HeroBanner.objects.create(
            title="Discover.\nShop. Save More.",
            subtitle="Top brands, best prices & exclusive offers on every purchase.",
            primary_button_text="Shop Now",
            primary_button_link="electronics",
            secondary_button_text="Explore Offers",
            secondary_button_link="deals",
            background_image="banners/HerohomePage.png",
            is_active=True,
            display_order=1
        )
        self.stdout.write(self.style.SUCCESS("[OK] Seeded HeroBanner."))

        # ----------------- STEP 3: SEED CATEGORIES -----------------
        categories_data = [
            {"name": "Mobiles", "slug": "mobiles", "image": "categories/categoryMobile.svg", "icon_name": "Smartphone", "display_order": 1},
            {"name": "Laptops", "slug": "laptops", "image": "categories/categoryLaptop.svg", "icon_name": "Laptop", "display_order": 2},
            {"name": "Electronics", "slug": "electronics", "image": "categories/categoryElectronics.svg", "icon_name": "Headphones", "display_order": 3},
            {"name": "Fashion", "slug": "fashion", "image": "categories/categoryFashion.svg", "icon_name": "Shirt", "display_order": 4},
            {"name": "Chairs & Furniture", "slug": "chairs-furniture", "image": "categories/categoryChairs.svg", "icon_name": "Armchair", "display_order": 5},
            {"name": "Home & Kitchen", "slug": "home-kitchen", "image": "categories/CategoryHome & kitchen.svg", "icon_name": "Home", "display_order": 6},
            {"name": "Beauty", "slug": "beauty", "image": "categories/categoryBeauty.svg", "icon_name": "Sparkles", "display_order": 7},
            {"name": "Footwear", "slug": "footwear", "image": "categories/categoryShoes.svg", "icon_name": "Footprints", "display_order": 8},
            {"name": "Bags & Luggage", "slug": "bags-luggage", "image": "categories/categoryBags & luddages.svg", "icon_name": "Briefcase", "display_order": 9},
            {"name": "Sports & Fitness", "slug": "sports-fitness", "image": "categories/categoryMobile.svg", "icon_name": "Activity", "display_order": 10},
            {"name": "Appliances", "slug": "appliances", "image": "categories/categoryElectronics.svg", "icon_name": "Tv", "display_order": 11},
            {"name": "Books & More", "slug": "books-more", "image": "categories/categoryFashion.svg", "icon_name": "BookOpen", "display_order": 12},
        ]

        cat_objs = {}
        for c in categories_data:
            cat_obj, _ = Category.objects.update_or_create(
                slug=c["slug"],
                defaults={
                    "name": c["name"],
                    "image": c["image"],
                    "icon_name": c["icon_name"],
                    "display_order": c["display_order"],
                    "is_active": True
                }
            )
            cat_objs[c["name"]] = cat_obj
            cat_objs[c["slug"]] = cat_obj

        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(categories_data)} categories."))

        # ----------------- STEP 4: SEED BRANDS -----------------
        brands_data = [
            "boAt", "Noise", "Sony", "JBL", "Dell", "HP", "Samsung", "Roadster",
            "Biba", "U.S. Polo Assn.", "ONLY", "Puma", "Lavie", "Safari",
            "Bella Vita", "Redmi", "Canon", "GoPro", "IKEA Style"
        ]
        brand_objs = {}
        for b in brands_data:
            brand_obj, _ = Brand.objects.update_or_create(
                slug=slugify(b),
                defaults={"name": b, "is_active": True}
            )
            brand_objs[b] = brand_obj

        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(brands_data)} brands."))

        # ----------------- STEP 5: SEED PRODUCTS -----------------
        products_data = [
            # Electronics / Mobiles / Laptops / Audio
            {
                "id": 1,
                "title": "boAt Rockerz 450",
                "sku": "ELEC-BOAT-450",
                "category": "Electronics",
                "brand": "boAt",
                "base_price": Decimal("3999.00"),
                "discount_price": Decimal("1499.00"),
                "stock_quantity": 150,
                "average_rating": Decimal("4.50"),
                "review_count": 1240,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/boat_rockerz.jpg",
                "tags": "headphone, headset, boat, rockerz, wireless, bluetooth, audio",
                "description": "Experience superior sound quality with boAt Rockerz 450. Enjoy powerful bass, comfy fit and long battery life.",
                "specifications": {
                    "Driver Size": "40mm Drivers",
                    "Playback Time": "Up to 15 Hours Playback",
                    "Earcups": "Soft Cushioned Earcups",
                    "Connectivity": "Bluetooth v5.0"
                }
            },
            {
                "id": 2,
                "title": "Noise ColorFit Pro 5",
                "sku": "ELEC-NOISE-PRO5",
                "category": "Electronics",
                "brand": "Noise",
                "base_price": Decimal("4999.00"),
                "discount_price": Decimal("2999.00"),
                "stock_quantity": 85,
                "average_rating": Decimal("4.40"),
                "review_count": 890,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": True,
                "image": "products/noise_smartwatch.jpg",
                "tags": "watch, smartwatch, noise, colorfit, fitness, tracker, wearable",
                "description": "Smart AMOLED display smartwatch with Bluetooth calling, 100+ sports modes, and 7-day battery life.",
                "specifications": {
                    "Display": "1.85 inch AMOLED",
                    "Battery Life": "Up to 7 days",
                    "Water Resistance": "IP68 Certified",
                    "Calling": "Bluetooth Calling v5.3"
                }
            },
            {
                "id": 3,
                "title": "Sony WH-CH510",
                "sku": "ELEC-SONY-510",
                "category": "Electronics",
                "brand": "Sony",
                "base_price": Decimal("3999.00"),
                "discount_price": Decimal("2499.00"),
                "stock_quantity": 60,
                "average_rating": Decimal("4.40"),
                "review_count": 1540,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": False,
                "image": "products/sony_headphones.jpg",
                "tags": "sony, headphone, wireless, audio, bluetooth, music",
                "description": "Lightweight, on-ear wireless headphones with up to 35 hours of battery life and quick charging.",
                "specifications": {
                    "Battery": "Up to 35 hours",
                    "Driver Unit": "30mm Dome",
                    "Weight": "132 grams",
                    "Mic": "Hands-free voice assistant compatible"
                }
            },
            {
                "id": 4,
                "title": "JBL Flip Essential 2",
                "sku": "ELEC-JBL-FLIP2",
                "category": "Electronics",
                "brand": "JBL",
                "base_price": Decimal("6999.00"),
                "discount_price": Decimal("4499.00"),
                "stock_quantity": 45,
                "average_rating": Decimal("4.50"),
                "review_count": 2100,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": False,
                "image": "products/jbl_speaker.jpg",
                "tags": "jbl, speaker, bluetooth, audio, sound, flip",
                "description": "Bold JBL Original Pro Sound with racetrack-shaped woofer and IPX7 waterproof design.",
                "specifications": {
                    "Output Power": "20W RMS",
                    "Battery Playtime": "Up to 10 hours",
                    "Waterproof Rating": "IPX7 Waterproof",
                    "Bluetooth Version": "v5.1"
                }
            },
            {
                "id": 5,
                "title": "Dell Inspiron 15 Core i5 Laptop",
                "sku": "LAP-DELL-INSP15",
                "category": "Laptops",
                "brand": "Dell",
                "base_price": Decimal("68000.00"),
                "discount_price": Decimal("54990.00"),
                "stock_quantity": 30,
                "average_rating": Decimal("4.30"),
                "review_count": 430,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/dell_laptop.jpg",
                "tags": "dell, laptop, computer, inspiron, pc, notebook, i5",
                "description": "Powerful 12th Gen Intel Core i5 processor laptop with 16GB RAM, 512GB NVMe SSD, and 120Hz FHD Display.",
                "specifications": {
                    "Processor": "Intel Core i5-1235U",
                    "RAM": "16GB DDR4",
                    "Storage": "512GB M.2 PCIe NVMe SSD",
                    "Display": "15.6 inch FHD 120Hz"
                }
            },
            {
                "id": 6,
                "title": "HP 15s Ryzen 5 Slim Laptop",
                "sku": "LAP-HP-15S",
                "category": "Laptops",
                "brand": "HP",
                "base_price": Decimal("55000.00"),
                "discount_price": Decimal("42990.00"),
                "stock_quantity": 40,
                "average_rating": Decimal("4.30"),
                "review_count": 620,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/hp_laptop.jpg",
                "tags": "hp, laptop, ryzen, computer, pc, notebook",
                "description": "Sleek and lightweight AMD Ryzen 5 laptop with fast charging, micro-edge display, and long battery life.",
                "specifications": {
                    "Processor": "AMD Ryzen 5 5500U",
                    "RAM": "8GB DDR4 (Expandable)",
                    "Storage": "512GB PCIe SSD",
                    "Weight": "1.69 kg"
                }
            },
            {
                "id": 7,
                "title": "Redmi Note 13 Pro 5G",
                "sku": "MOB-REDMI-NOTE13",
                "category": "Mobiles",
                "brand": "Redmi",
                "base_price": Decimal("21999.00"),
                "discount_price": Decimal("18999.00"),
                "stock_quantity": 110,
                "average_rating": Decimal("4.50"),
                "review_count": 2450,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/redmi_note13.jpg",
                "tags": "mobile, phone, redmi, xiaomi, smartphone, 5g, note 13",
                "description": "200MP OIS camera flagship phone with 1.5K AMOLED display, Snapdragon 7s Gen 2, and 67W Turbo Charge.",
                "specifications": {
                    "Camera": "200MP + 8MP + 2MP with OIS",
                    "Display": "6.67 inch 1.5K 120Hz Curved AMOLED",
                    "Battery": "5100mAh with 67W Charger",
                    "Processor": "Snapdragon 7s Gen 2 5G"
                }
            },
            {
                "id": 8,
                "title": "Women Emerald Green A-Line Dress",
                "sku": "FASH-WOMEN-DRESS-GRN",
                "category": "Fashion",
                "brand": "ONLY",
                "base_price": Decimal("1999.00"),
                "discount_price": Decimal("999.00"),
                "stock_quantity": 50,
                "average_rating": Decimal("4.40"),
                "review_count": 310,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/women_dress.jpg",
                "tags": "dress, women, fashion, clothing, green dress, outfit, wear",
                "description": "Elegant emerald green A-line knee-length dress with puff sleeves and breathable premium fabric.",
                "specifications": {
                    "Fabric": "100% Rayon / Viscose",
                    "Length": "Knee Length",
                    "Occasion": "Casual / Party",
                    "Care": "Machine wash cold"
                }
            },
            {
                "id": 9,
                "title": "Roadster Men's Cotton Casual Shirt",
                "sku": "FASH-ROADSTER-SHIRT",
                "category": "Fashion",
                "brand": "Roadster",
                "base_price": Decimal("1999.00"),
                "discount_price": Decimal("999.00"),
                "stock_quantity": 69,
                "average_rating": Decimal("4.30"),
                "review_count": 520,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/roadster_shirt.jpg",
                "tags": "shirt, casual, men, roadster, fashion, top, clothes",
                "description": "Classic pure cotton checked casual shirt with spread collar, curved hemline, and button placket.",
                "specifications": {
                    "Fit": "Slim Fit",
                    "Material": "100% Pure Cotton",
                    "Sleeve": "Long Sleeves with roll-up tabs",
                    "Pattern": "Checks"
                }
            },
            {
                "id": 10,
                "title": "Modern Teal Blue Lounge Chair",
                "sku": "HOME-TEAL-CHAIR",
                "category": "Chairs & Furniture",
                "brand": "IKEA Style",
                "base_price": Decimal("12999.00"),
                "discount_price": Decimal("7999.00"),
                "stock_quantity": 12,
                "average_rating": Decimal("4.60"),
                "review_count": 180,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/lounge_chair.jpg",
                "tags": "chair, furniture, lounge, armchair, home, sofa, teal",
                "description": "Ergonomic high-density foam upholstered accent armchair with solid tapered wooden legs.",
                "specifications": {
                    "Frame Material": "Solid Teak Wood",
                    "Upholstery": "Velvet Touch Fabric",
                    "Color": "Teal Blue",
                    "Weight Capacity": "140 kg"
                }
            },
            {
                "id": 11,
                "title": "Safari Venture Casual Backpack",
                "sku": "BAG-SAFARI-VENTURE",
                "category": "Bags & Luggage",
                "brand": "Safari",
                "base_price": Decimal("2199.00"),
                "discount_price": Decimal("1299.00"),
                "stock_quantity": 40,
                "average_rating": Decimal("4.40"),
                "review_count": 420,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": True,
                "image": "products/teal_backpack.jpg",
                "tags": "bag, backpack, safari, travel, luggage, casual",
                "description": "Spacious 35L waterproof multi-compartment travel backpack with dedicated 15.6 inch laptop sleeve.",
                "specifications": {
                    "Capacity": "35 Litres",
                    "Material": "Water-resistant Polyester",
                    "Laptop Sleeve": "Up to 15.6 inch",
                    "Warranty": "1 Year International"
                }
            },
            {
                "id": 12,
                "title": "Accent Upholstered Armchair",
                "sku": "HOME-ACCENT-CHAIR",
                "category": "Home & Kitchen",
                "brand": "IKEA Style",
                "base_price": Decimal("9999.00"),
                "discount_price": Decimal("6499.00"),
                "stock_quantity": 5,
                "average_rating": Decimal("4.60"),
                "review_count": 95,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/accent_chair.jpg",
                "tags": "chair, furniture, accent, armchair, seating",
                "description": "Modern minimalist single-seat upholstered armchair suited for living room, study, or bedroom reading nook.",
                "specifications": {
                    "Seating Capacity": "1 Person",
                    "Foam Density": "32 High Resilience",
                    "Assembly": "DIY Easy Setup (5 mins)"
                }
            },
            {
                "id": 13,
                "title": "Canon EOS 1500D DSLR Camera",
                "sku": "ELEC-CANON-1500D",
                "category": "Electronics",
                "brand": "Canon",
                "base_price": Decimal("47999.00"),
                "discount_price": Decimal("38990.00"),
                "stock_quantity": 20,
                "average_rating": Decimal("4.50"),
                "review_count": 890,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": False,
                "image": "products/camera_canon.jpg",
                "tags": "camera, dslr, canon, photography, video, lens",
                "description": "24.1MP APS-C CMOS sensor DSLR camera with EF-S 18-55mm IS II Lens, built-in Wi-Fi and NFC.",
                "specifications": {
                    "Sensor Resolution": "24.1 Megapixels",
                    "Video Capture": "Full HD 1080p",
                    "ISO Range": "100 - 6400",
                    "Lens Included": "18-55mm IS II"
                }
            },
            {
                "id": 14,
                "title": "GoPro HERO 12 Action Camera",
                "sku": "ELEC-GOPRO-HERO12",
                "category": "Electronics",
                "brand": "GoPro",
                "base_price": Decimal("45000.00"),
                "discount_price": Decimal("37990.00"),
                "stock_quantity": 18,
                "average_rating": Decimal("4.70"),
                "review_count": 410,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/gopro_action_cam.jpg",
                "tags": "gopro, camera, action cam, 4k, 5.3k, waterproof, sports",
                "description": "Incredible 5.3K video resolution action camera with HyperSmooth 6.0 stabilization and HDR video.",
                "specifications": {
                    "Video Resolution": "5.3K60 + 4K120",
                    "Waterproof Depth": "10m (33ft) without housing",
                    "Stabilization": "HyperSmooth 6.0 + 360 Horizon Lock",
                    "Battery": "Enduro 1720mAh"
                }
            }
        ]

        for p_data in products_data:
            cat_obj = cat_objs.get(p_data["category"]) or cat_objs.get(slugify(p_data["category"]))
            brand_obj = brand_objs.get(p_data["brand"])

            product_obj, created = Product.objects.update_or_create(
                sku=p_data["sku"],
                defaults={
                    "title": p_data["title"],
                    "category": cat_obj,
                    "brand": brand_obj,
                    "base_price": p_data["base_price"],
                    "discount_price": p_data["discount_price"],
                    "stock_quantity": p_data["stock_quantity"],
                    "average_rating": p_data["average_rating"],
                    "review_count": p_data["review_count"],
                    "is_featured": p_data.get("is_featured", True),
                    "is_new_arrival": p_data.get("is_new_arrival", False),
                    "is_deal_of_day": p_data.get("is_deal_of_day", False),
                    "is_active": True,
                    "tags": p_data["tags"],
                    "description": p_data["description"],
                    "specifications": p_data["specifications"]
                }
            )

            # Product image
            if p_data.get("image"):
                ProductImage.objects.update_or_create(
                    product=product_obj,
                    is_primary=True,
                    defaults={"image": p_data["image"], "alt_text": p_data["title"]}
                )

        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(products_data)} catalog products."))

        # ----------------- STEP 6: SEED ORDERS & MILESTONES -----------------
        customer_user = User.objects.filter(role="CUSTOMER").first()
        if not customer_user:
            customer_user = User.objects.create_user(
                email="customer@buyzo.com",
                password="Customer@123",
                role="CUSTOMER",
                is_verified=True
            )
            Profile.objects.create(user=customer_user, first_name="Rahul", last_name="Sharma")

        # Create or update demo orders for the user
        sample_order_defs = [
            {
                "order_number": "SN123456789",
                "status": "SHIPPED",
                "product_sku": "ELEC-BOAT-450",
                "quantity": 1,
                "price": Decimal("1499.00"),
                "color": "Teal Green"
            },
            {
                "order_number": "SN987654321",
                "status": "DELIVERED",
                "product_sku": "ELEC-NOISE-PRO5",
                "quantity": 1,
                "price": Decimal("2999.00"),
                "color": "Black"
            },
            {
                "order_number": "SN456789123",
                "status": "PROCESSING",
                "product_sku": "ELEC-SONY-510",
                "quantity": 1,
                "price": Decimal("2499.00"),
                "color": "Black"
            }
        ]

        for o_def in sample_order_defs:
            prod = Product.objects.filter(sku=o_def["product_sku"]).first()
            if not prod:
                continue

            order, _ = Order.objects.update_or_create(
                order_number=o_def["order_number"],
                defaults={
                    "customer": customer_user,
                    "status": o_def["status"],
                    "shipping_name": "Rahul Sharma",
                    "shipping_phone": "+91 98765 43210",
                    "shipping_email": "customer@buyzo.com",
                    "shipping_address": "Flat 402, Green Glen Heights",
                    "shipping_city": "Bengaluru",
                    "shipping_state": "Karnataka",
                    "shipping_pincode": "560103",
                    "subtotal": o_def["price"] * o_def["quantity"],
                    "discount_amount": Decimal("0.00"),
                    "shipping_amount": Decimal("0.00"),
                    "tax_amount": (o_def["price"] * Decimal("0.18")),
                    "total_amount": o_def["price"] * Decimal("1.18"),
                    "payment_method": "MOCK",
                    "payment_status": "PAID",
                    "delivery_otp": "4590"
                }
            )

            item, _ = OrderItem.objects.update_or_create(
                order=order,
                product=prod,
                defaults={
                    "product_title": prod.title,
                    "sku": prod.sku,
                    "product_image": f"/media/{prod.images.first().image}" if prod.images.exists() else "",
                    "unit_price": o_def["price"],
                    "quantity": o_def["quantity"],
                    "total_price": o_def["price"] * o_def["quantity"],
                    "selected_color": o_def["color"]
                }
            )

            # Milestones
            from apps.orders.models import OrderTrackingMilestone
            OrderTrackingMilestone.objects.filter(order=order).delete()

            status_steps = [
                ("Order Placed", "18 May, 10:30 AM", True, False, 1),
                ("Confirmed", "18 May, 11:00 AM", True, False, 2),
                ("Shipped", "19 May, 09:15 AM", o_def["status"] in ["SHIPPED", "DELIVERED"], o_def["status"] == "SHIPPED", 3),
                ("Out for Delivery", "20 May, 08:40 AM", o_def["status"] == "DELIVERED", False, 4),
                ("Delivered", "21 May, 04:30 PM", o_def["status"] == "DELIVERED", o_def["status"] == "DELIVERED", 5),
            ]

            for step_title, desc, is_comp, is_act, idx in status_steps:
                OrderTrackingMilestone.objects.create(
                    order=order,
                    step_title=step_title,
                    description=desc,
                    is_completed=is_comp,
                    is_active=is_act,
                    order_index=idx
                )

        self.stdout.write(self.style.SUCCESS("[OK] Seeded sample customer orders with timeline milestones."))

        self.stdout.write(self.style.SUCCESS("======================================================"))
        self.stdout.write(self.style.SUCCESS("COMPLETE FRONTEND-BACKEND DATA SEEDING SUCCESSFUL!"))
        self.stdout.write(self.style.SUCCESS("======================================================"))
