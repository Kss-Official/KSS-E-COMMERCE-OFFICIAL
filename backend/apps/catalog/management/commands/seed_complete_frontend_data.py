import os
import shutil
from pathlib import Path
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone
from datetime import timedelta

from django.contrib.auth import get_user_model
from apps.accounts.models import Profile, Address
from apps.catalog.models import Category, SubCategory, Brand, Product, ProductImage, ProductVariant, HeroBanner

User = get_user_model()
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

            # 4. Products from images/ (copy ALL product images)
            if images_dir.exists():
                for img_file in images_dir.glob("*.*"):
                    shutil.copy2(img_file, media_dirs["products"] / img_file.name)
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
            "Bella Vita", "Redmi", "Canon", "GoPro", "IKEA Style", "Zara",
            "H&M", "Levi's", "Wildcraft", "UrbanHome", "Prestige", "Solimo",
            "Philips", "Bombay Dyeing", "Hawkins", "Milton", "Minimalist",
            "Maybelline", "Plum", "L'Oréal Paris", "Forest Essentials",
            "Lakmé", "Mamaearth", "Nykaa", "Apple", "Xiaomi", "Realme",
            "Skybags", "Red Tape", "Home Select"
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
                "base_price": Decimal("65990.00"),
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
            },
            {
                "id": 15,
                "title": "Apple iPhone 15 (128 GB)",
                "sku": "MOB-APPLE-IPHONE15",
                "category": "Mobiles",
                "brand": "Apple",
                "base_price": Decimal("79900.00"),
                "discount_price": Decimal("71990.00"),
                "stock_quantity": 50,
                "average_rating": Decimal("4.70"),
                "review_count": 5120,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": True,
                "image": "products/apple_iphone15.jpg",
                "tags": "iphone, apple, smartphone, mobile, ios, phone, 128gb",
                "description": "Dynamic Island, 48MP Main Camera, USB-C, and A16 Bionic chip in a durable color-infused glass design.",
                "specifications": {
                    "Display": "6.1 inch Super Retina XDR display",
                    "Camera": "48MP Main + 12MP Ultra Wide",
                    "Processor": "A16 Bionic chip",
                    "Connector": "USB-C"
                }
            },
            {
                "id": 16,
                "title": "Samsung Galaxy S23 5G",
                "sku": "MOB-SAMSUNG-S23",
                "category": "Mobiles",
                "brand": "Samsung",
                "base_price": Decimal("89999.00"),
                "discount_price": Decimal("64999.00"),
                "stock_quantity": 40,
                "average_rating": Decimal("4.60"),
                "review_count": 3400,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/samsung_s23.png",
                "tags": "samsung, galaxy, s23, 5g, mobile, phone, android",
                "description": "Snapdragon 8 Gen 2 for Galaxy, 50MP pro-grade camera, and 120Hz Dynamic AMOLED 2X display.",
                "specifications": {
                    "Display": "6.1 inch Dynamic AMOLED 2X 120Hz",
                    "Camera": "50MP Wide + 10MP Telephoto + 12MP Ultra Wide",
                    "Processor": "Snapdragon 8 Gen 2 Mobile Platform",
                    "Battery": "3900mAh Fast Charging"
                }
            },
            {
                "id": 17,
                "title": "boAt Airdopes 141",
                "sku": "ELEC-BOAT-AIRDOPES141",
                "category": "Electronics",
                "brand": "boAt",
                "base_price": Decimal("4490.00"),
                "discount_price": Decimal("1299.00"),
                "stock_quantity": 200,
                "average_rating": Decimal("4.20"),
                "review_count": 8900,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/boat_airdopes.png",
                "tags": "boat, airdopes, tws, earbuds, wireless, bluetooth",
                "description": "Up to 42 hours total playback time, ENx technology for clear calls, and beast mode low latency.",
                "specifications": {
                    "Playback": "42 Hours total with case",
                    "Latency": "80ms Low Latency Beast Mode",
                    "Drivers": "8mm Dynamic Drivers",
                    "Water Resistance": "IPX4 Sweat Resistant"
                }
            },
            {
                "id": 18,
                "title": "Sony HT-S20R Soundbar",
                "sku": "ELEC-SONY-SOUNDBAR",
                "category": "Electronics",
                "brand": "Sony",
                "base_price": Decimal("23990.00"),
                "discount_price": Decimal("17990.00"),
                "stock_quantity": 25,
                "average_rating": Decimal("4.60"),
                "review_count": 1320,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": False,
                "image": "products/sony_soundbar.png",
                "tags": "sony, soundbar, home theater, bluetooth, speaker, 5.1ch",
                "description": "5.1 Channel Dolby Digital Soundbar with subwoofer and rear speakers for immersive cinematic sound.",
                "specifications": {
                    "Total Power": "400W",
                    "Audio Format": "Dolby Digital 5.1ch",
                    "Connectivity": "Bluetooth, HDMI ARC, Optical, USB"
                }
            },
            {
                "id": 19,
                "title": "JBL Wave 200 TWS",
                "sku": "ELEC-JBL-WAVE200",
                "category": "Electronics",
                "brand": "JBL",
                "base_price": Decimal("5999.00"),
                "discount_price": Decimal("2799.00"),
                "stock_quantity": 60,
                "average_rating": Decimal("4.10"),
                "review_count": 780,
                "is_featured": False,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/jbl_wave_tws.png",
                "tags": "jbl, wave, tws, earbuds, wireless, bluetooth",
                "description": "JBL Deep Bass sound with dual connect technology and 20 hours of combined playtime.",
                "specifications": {
                    "Battery": "20 Hours total (5h + 15h case)",
                    "Sound": "JBL Deep Bass Sound",
                    "Touch Controls": "Voice Assistant & Call Controls"
                }
            },
            {
                "id": 20,
                "title": "Apple MacBook Air M2",
                "sku": "LAP-APPLE-MACBOOKM2",
                "category": "Laptops",
                "brand": "Apple",
                "base_price": Decimal("114900.00"),
                "discount_price": Decimal("92900.00"),
                "stock_quantity": 15,
                "average_rating": Decimal("4.80"),
                "review_count": 1950,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": True,
                "image": "products/apple_macbook.png",
                "tags": "apple, macbook, laptop, m2, macbook air, computer",
                "description": "Strikingly thin design with M2 chip, 13.6-inch Liquid Retina display, 18 hours battery life.",
                "specifications": {
                    "Processor": "Apple M2 8-core CPU 8-core GPU",
                    "RAM": "8GB Unified Memory",
                    "Storage": "256GB SSD",
                    "Display": "13.6 inch Liquid Retina True Tone"
                }
            },


            # --- FASHION PRODUCTS ---
            {
                "id": 31,
                "title": "Women's Floral Fit & Flare Summer Dress",
                "sku": "FASH-ZARA-FLORAL-DRESS",
                "category": "Fashion",
                "brand": "Zara",
                "base_price": Decimal("2999.00"),
                "discount_price": Decimal("1499.00"),
                "stock_quantity": 45,
                "average_rating": Decimal("4.60"),
                "review_count": 840,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/women_dress.jpg",
                "tags": "dress, women, fashion, floral, summer dress, zara, casual",
                "description": "Breezy botanical print A-line dress crafted from breathable modal cotton with sweet puff sleeves.",
                "specifications": {
                    "Fabric": "Modal Cotton",
                    "Fit": "Fit & Flare",
                    "Occasion": "Casual / Party",
                    "Pattern": "Floral Botanical"
                }
            },
            {
                "id": 32,
                "title": "Men's Regular Fit Casual Oxford Shirt",
                "sku": "FASH-ROADSTER-OXFORD-SHIRT",
                "category": "Fashion",
                "brand": "Roadster",
                "base_price": Decimal("1999.00"),
                "discount_price": Decimal("899.00"),
                "stock_quantity": 60,
                "average_rating": Decimal("4.40"),
                "review_count": 1250,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/roadster_shirt.jpg",
                "tags": "shirt, casual, men, roadster, fashion, oxford shirt, button down",
                "description": "Pure cotton washed oxford button-down shirt designed for all-day breathability and comfort.",
                "specifications": {
                    "Fit": "Regular Fit",
                    "Material": "100% Pure Cotton",
                    "Collar": "Button-Down Spread Collar",
                    "Sleeve": "Long Sleeves"
                }
            },
            {
                "id": 33,
                "title": "Men's Solid Slim Fit Polo T-Shirt",
                "sku": "FASH-USPOLO-POLO-SHIRT",
                "category": "Fashion",
                "brand": "U.S. Polo Assn.",
                "base_price": Decimal("2499.00"),
                "discount_price": Decimal("1199.00"),
                "stock_quantity": 55,
                "average_rating": Decimal("4.50"),
                "review_count": 960,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/us_polo_tshirt.jpg",
                "tags": "polo, t-shirt, men, us polo, fashion, casual, top",
                "description": "Signature pique cotton polo shirt featuring iconic embroidered brand crest.",
                "specifications": {
                    "Fabric": "100% Pique Cotton",
                    "Fit": "Slim Fit",
                    "Logo": "Embroidered Crest",
                    "Neckline": "Polo Collar"
                }
            },
            {
                "id": 34,
                "title": "Women's Printed Anarkali Kurta Set with Dupatta",
                "sku": "FASH-BIBA-ANARKALI-SET",
                "category": "Fashion",
                "brand": "Biba",
                "base_price": Decimal("4999.00"),
                "discount_price": Decimal("2499.00"),
                "stock_quantity": 40,
                "average_rating": Decimal("4.70"),
                "review_count": 620,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/biba_kurta.jpg",
                "tags": "biba, anarkali, kurta, women, ethnic, traditional, festive",
                "description": "Handcrafted gold foil print Anarkali kurta accompanied by matching trousers and chiffon dupatta.",
                "specifications": {
                    "Material": "100% Cotton",
                    "Set Includes": "Kurta, Trousers & Dupatta",
                    "Work": "Gold Foil Print",
                    "Style": "Anarkali Flared"
                }
            },
            {
                "id": 35,
                "title": "Women's Structured Satchel Handbag",
                "sku": "BAG-LAVIE-SATCHEL-BAG",
                "category": "Bags & Luggage",
                "brand": "Lavie",
                "base_price": Decimal("3990.00"),
                "discount_price": Decimal("1899.00"),
                "stock_quantity": 35,
                "average_rating": Decimal("4.50"),
                "review_count": 430,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/lavie_handbag.jpg",
                "tags": "handbag, lavie, purse, satchel, bag, women, fashion",
                "description": "Premium faux-leather structured handbag with multi-compartment storage and detachable sling strap.",
                "specifications": {
                    "Material": "Synthetic Faux Leather",
                    "Strap": "Detachable Sling Strap",
                    "Compartments": "2 Main + 3 Interior Pockets",
                    "Closure": "Zip"
                }
            },
            {
                "id": 36,
                "title": "Unisex Flyer Flex Running & Training Shoes",
                "sku": "FOOT-PUMA-FLYERFLEX-SHOES",
                "category": "Footwear",
                "brand": "Puma",
                "base_price": Decimal("4999.00"),
                "discount_price": Decimal("2799.00"),
                "stock_quantity": 70,
                "average_rating": Decimal("4.60"),
                "review_count": 1890,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/puma_shoes.jpg",
                "tags": "puma, running shoes, sneakers, footwear, training, sports",
                "description": "Ultra-lightweight mesh upper cushioned with SoftFoam+ comfort insole for responsive workouts.",
                "specifications": {
                    "Upper": "Breathable Mesh",
                    "Insole": "SoftFoam+ Cushioning",
                    "Outsole": "Durable Rubber",
                    "Closure": "Lace-Up"
                }
            },
            {
                "id": 37,
                "title": "Urban Ergonomic Everyday Laptop Backpack 28L",
                "sku": "BAG-WILDCRAFT-28L-BACKPACK",
                "category": "Bags & Luggage",
                "brand": "Wildcraft",
                "base_price": Decimal("2499.00"),
                "discount_price": Decimal("1299.00"),
                "stock_quantity": 50,
                "average_rating": Decimal("4.30"),
                "review_count": 780,
                "is_featured": False,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/teal_backpack.jpg",
                "tags": "backpack, wildcraft, laptop bag, 28l, travel bag, casual",
                "description": "Water-repellent heavy duty polyester backpack with dedicated 15.6 inch padded laptop compartment.",
                "specifications": {
                    "Capacity": "28 Litres",
                    "Laptop Sleeve": "Padded 15.6 inch",
                    "Material": "Water-repellent Polyester",
                    "Warranty": "1 Year Warranty"
                }
            },
            {
                "id": 38,
                "title": "Women's Elegant High-Rise Straight Fit Chinos",
                "sku": "FASH-HM-STRAIGHT-CHINOS",
                "category": "Fashion",
                "brand": "H&M",
                "base_price": Decimal("2299.00"),
                "discount_price": Decimal("1399.00"),
                "stock_quantity": 40,
                "average_rating": Decimal("4.40"),
                "review_count": 510,
                "is_featured": False,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/fashion_chinos.jpg",
                "tags": "chinos, women, h&m, pants, trousers, fashion, casual",
                "description": "Clean silhouette high-waisted cotton twill trousers tailored with stretch flexibility.",
                "specifications": {
                    "Rise": "High-Rise",
                    "Material": "Cotton Twill Stretch",
                    "Fit": "Straight Fit",
                    "Pockets": "4 Pocket Style"
                }
            },
            {
                "id": 39,
                "title": "Men's Classic Stonewashed Denim Jacket",
                "sku": "FASH-LEVIS-STONEWASH-JACKET",
                "category": "Fashion",
                "brand": "Levi's",
                "base_price": Decimal("6499.00"),
                "discount_price": Decimal("3499.00"),
                "stock_quantity": 30,
                "average_rating": Decimal("4.80"),
                "review_count": 1420,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/fashion_denim_jacket.jpg",
                "tags": "denim jacket, levis, jacket, men, fashion, trucker, classic",
                "description": "Original trucker fit authentic heavyweight denim jacket with button flap chest pockets.",
                "specifications": {
                    "Material": "100% Heavyweight Cotton Denim",
                    "Fit": "Original Trucker Fit",
                    "Pockets": "Button Flap Chest Pockets",
                    "Wash": "Stonewashed Indigo"
                }
            },
            {
                "id": 40,
                "title": "Women's Embellished Silk Blend Kurti",
                "sku": "FASH-BIBA-EMBELLISHED-KURTI",
                "category": "Fashion",
                "brand": "Biba",
                "base_price": Decimal("3599.00"),
                "discount_price": Decimal("1799.00"),
                "stock_quantity": 45,
                "average_rating": Decimal("4.50"),
                "review_count": 380,
                "is_featured": False,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/fashion_silk_kurti.jpg",
                "tags": "kurti, silk kurti, biba, ethnic, women, zari embroidery",
                "description": "Lustrous silk blend straight kurti detailed with intricate zari thread embroidery.",
                "specifications": {
                    "Material": "Silk Blend",
                    "Work": "Zari Thread Embroidery",
                    "Sleeve": "3/4 Sleeves",
                    "Neckline": "Round Keyhole Neck"
                }
            },
            {
                "id": 41,
                "title": "Casual Streetwear Chunky Sole Sneakers",
                "sku": "FOOT-PUMA-STREETWEAR-SNEAKERS",
                "category": "Footwear",
                "brand": "Puma",
                "base_price": Decimal("5999.00"),
                "discount_price": Decimal("3299.00"),
                "stock_quantity": 50,
                "average_rating": Decimal("4.50"),
                "review_count": 670,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/fashion_street_sneakers.jpg",
                "tags": "sneakers, puma, chunky shoes, footwear, streetwear, retro",
                "description": "Retro chunky street trainer built with premium synthetic leather and rugged gum rubber outsole.",
                "specifications": {
                    "Upper": "Synthetic Leather",
                    "Outsole": "Rugged Gum Rubber",
                    "Style": "Chunky Platform Retro"
                }
            },
            {
                "id": 42,
                "title": "Men's Crewneck Organic Cotton Minimal Sweatshirt",
                "sku": "FASH-ZARA-CREWNECK-SWEATSHIRT",
                "category": "Fashion",
                "brand": "Zara",
                "base_price": Decimal("2990.00"),
                "discount_price": Decimal("1990.00"),
                "stock_quantity": 40,
                "average_rating": Decimal("4.40"),
                "review_count": 310,
                "is_featured": False,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/fashion_sweatshirt.jpg",
                "tags": "sweatshirt, zara, men, crewneck, cotton, fashion, minimal",
                "description": "Soft brushed organic cotton fleece sweater designed with ribbed trims and relaxed dropped shoulders.",
                "specifications": {
                    "Material": "100% Organic Cotton",
                    "Neckline": "Ribbed Crew Neck",
                    "Fit": "Relaxed Drop Shoulder"
                }
            },

            # --- HOME & KITCHEN PRODUCTS ---
            {
                "id": 43,
                "title": "Modern Ergonomic Velvet Accent Armchair",
                "sku": "HOME-URBAN-VELVET-ARMCHAIR",
                "category": "Home & Kitchen",
                "brand": "UrbanHome",
                "base_price": Decimal("11999.00"),
                "discount_price": Decimal("6999.00"),
                "stock_quantity": 25,
                "average_rating": Decimal("4.80"),
                "review_count": 1420,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/accent_chair.jpg",
                "tags": "armchair, furniture, velvet, accent chair, urbanhome, living room",
                "description": "Plush high-density foam cushioned armchair with solid teak wood legs and ergonomic lumbar support.",
                "specifications": {
                    "Material": "Solid Wood & Velvet",
                    "Legs": "Solid Teak Wood",
                    "Foam": "High-Density 32 Resilience",
                    "Weight Limit": "140 kg"
                }
            },
            {
                "id": 44,
                "title": "Contemporary Nordic Lounge Relaxing Recliner Chair",
                "sku": "HOME-URBAN-NORDIC-RECLINER",
                "category": "Home & Kitchen",
                "brand": "UrbanHome",
                "base_price": Decimal("14999.00"),
                "discount_price": Decimal("8499.00"),
                "stock_quantity": 20,
                "average_rating": Decimal("4.70"),
                "review_count": 980,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/lounge_chair.jpg",
                "tags": "recliner, lounge chair, furniture, scandinavian, home, chair",
                "description": "Minimalist Scandinavian lounge chair with reinforced steel frame and removable washable upholstery.",
                "specifications": {
                    "Frame": "Steel & Hardwood",
                    "Upholstery": "Washable Premium Fabric",
                    "Design": "Nordic Recliner"
                }
            },
            {
                "id": 45,
                "title": "Tri-Ply Stainless Steel 5-Piece Induction Cookware Set",
                "sku": "HOME-PRESTIGE-5PC-COOKWARE",
                "category": "Home & Kitchen",
                "brand": "Prestige",
                "base_price": Decimal("5999.00"),
                "discount_price": Decimal("3499.00"),
                "stock_quantity": 40,
                "average_rating": Decimal("4.60"),
                "review_count": 2850,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/accent_chair.jpg",
                "tags": "cookware, prestige, tri-ply, induction, stainless steel, cookware set",
                "description": "Heavy gauge 3-ply base for uniform heat distribution without hot spots, includes toughened glass lids.",
                "specifications": {
                    "Material": "304 Grade Stainless Steel",
                    "Base": "3-Ply Aluminum Core Base",
                    "Compatibility": "Induction & Gas Top",
                    "Set": "5 Pieces with Glass Lids"
                }
            },
            {
                "id": 46,
                "title": "Nordic Minimalist Geometric Pendant Hanging Ceiling Lamp",
                "sku": "HOME-SOLIMO-GEOMETRIC-LAMP",
                "category": "Home & Kitchen",
                "brand": "Solimo",
                "base_price": Decimal("3499.00"),
                "discount_price": Decimal("1899.00"),
                "stock_quantity": 35,
                "average_rating": Decimal("4.50"),
                "review_count": 1120,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "banners/HeroHomeLamp.png",
                "tags": "lamp, ceiling lamp, home decor, pendant lamp, lighting, solimo",
                "description": "Architectural hanging pendant chandelier lamp with adjustable drop cord and E27 warm LED socket.",
                "specifications": {
                    "Material": "Matte Brass & Aluminum",
                    "Socket": "E27 Warm LED",
                    "Cord Length": "1.2 Meter Adjustable",
                    "Color": "Gold & Matte Black"
                }
            },
            {
                "id": 47,
                "title": "Digital Touch Screen Rapid Air Fryer 4.5L (1400W)",
                "sku": "HOME-PHILIPS-RAPID-AIRFRYER",
                "category": "Home & Kitchen",
                "brand": "Philips",
                "base_price": Decimal("8999.00"),
                "discount_price": Decimal("5499.00"),
                "stock_quantity": 30,
                "average_rating": Decimal("4.70"),
                "review_count": 3600,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/lounge_chair.jpg",
                "tags": "air fryer, philips, appliances, kitchen, 4.5l, low oil, digital",
                "description": "Patented rapid air convection technology for crispy guilt-free snacks with 8 digital preset menus.",
                "specifications": {
                    "Capacity": "4.5 Litres",
                    "Power": "1400 Watts",
                    "Presets": "8 Digital Touch Preset Menus",
                    "Basket": "Non-Stick Dishwasher Safe"
                }
            },
            {
                "id": 48,
                "title": "100% Pure Egyptian Cotton King Size Bedsheet with 2 Pillow Covers",
                "sku": "HOME-BOMBAY-EGYPTIAN-BEDSHEET",
                "category": "Home & Kitchen",
                "brand": "Bombay Dyeing",
                "base_price": Decimal("2999.00"),
                "discount_price": Decimal("1499.00"),
                "stock_quantity": 60,
                "average_rating": Decimal("4.60"),
                "review_count": 2150,
                "is_featured": False,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/accent_chair.jpg",
                "tags": "bedsheet, bedding, bombay dyeing, cotton, king size, Egyptian cotton",
                "description": "Silky smooth breathable luxury king bedsheet that gets softer with every wash, fade-resistant dyes.",
                "specifications": {
                    "Material": "100% Sateen Weave Cotton",
                    "Thread Count": "400 TC",
                    "Bedsheet Dimensions": "274 cm x 274 cm",
                    "Includes": "1 King Bedsheet + 2 Pillow Covers"
                }
            },
            {
                "id": 49,
                "title": "Hard Anodized 3L Pressure Cooker with Inner Lid",
                "sku": "HOME-HAWKINS-3L-COOKER",
                "category": "Home & Kitchen",
                "brand": "Hawkins",
                "base_price": Decimal("2499.00"),
                "discount_price": Decimal("1799.00"),
                "stock_quantity": 50,
                "average_rating": Decimal("4.80"),
                "review_count": 6400,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": False,
                "image": "products/lounge_chair.jpg",
                "tags": "pressure cooker, hawkins, cookware, kitchen, 3l, inner lid",
                "description": "Heavy duty corrosion-proof pressure cooker engineered with pressure locked safety lid and stay-cool handle.",
                "specifications": {
                    "Capacity": "3 Litres",
                    "Material": "Hard Anodized Aluminum",
                    "Lid Type": "Inner Pressure Locked Lid",
                    "Base": "Flat Heavy Duty Base"
                }
            },
            {
                "id": 50,
                "title": "Double-Walled Stainless Steel Insulated Casserole Set (3-Pcs)",
                "sku": "HOME-MILTON-INSULATED-CASSEROLE",
                "category": "Home & Kitchen",
                "brand": "Milton",
                "base_price": Decimal("2199.00"),
                "discount_price": Decimal("1299.00"),
                "stock_quantity": 65,
                "average_rating": Decimal("4.50"),
                "review_count": 3900,
                "is_featured": False,
                "is_new_arrival": True,
                "is_deal_of_day": True,
                "image": "products/accent_chair.jpg",
                "tags": "casserole, milton, hot box, insulated, cookware, kitchen",
                "description": "Keeps food steaming hot and fresh for up to 6 hours with double-wall insulation and leak-proof twist lid.",
                "specifications": {
                    "Set": "3 Pieces (1000ml, 1500ml, 2500ml)",
                    "Insulation": "Polyurethane Foam Insulation",
                    "Heat Retention": "Up to 6 Hours"
                }
            },

            # --- BEAUTY PRODUCTS ---
            {
                "id": 51,
                "title": "10% Niacinamide & Zinc Clarifying Face Serum (30ml)",
                "sku": "BEAUTY-MINIMALIST-NIACINAMIDE-30ML",
                "category": "Beauty",
                "brand": "Minimalist",
                "base_price": Decimal("799.00"),
                "discount_price": Decimal("599.00"),
                "stock_quantity": 100,
                "average_rating": Decimal("4.80"),
                "review_count": 4200,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": True,
                "image": "products/beauty_niacinamide_serum.jpg",
                "tags": "niacinamide, serum, minimalist, skincare, face serum, acne marks, zinc",
                "description": "Nourishing oil-free daily serum formulated with pure fermented Niacinamide to diminish spots and balance sebum.",
                "specifications": {
                    "Volume": "30 ml",
                    "Active Ingredients": "10% Niacinamide + 1% Zinc PCA",
                    "Skin Type": "All Skin Types / Blemish Prone",
                    "Formulation": "Fragrance-Free Gel Serum"
                }
            },
            {
                "id": 52,
                "title": "Matte Liquid Velvet Long-Wear Lipstick (5.5ml)",
                "sku": "BEAUTY-MAYBELLINE-MATTE-LIPSTICK-5.5ML",
                "category": "Beauty",
                "brand": "Maybelline",
                "base_price": Decimal("999.00"),
                "discount_price": Decimal("649.00"),
                "stock_quantity": 120,
                "average_rating": Decimal("4.70"),
                "review_count": 6800,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/beauty_matte_lipstick.jpg",
                "tags": "lipstick, maybelline, matte, makeup, lip color, liquid lipstick",
                "description": "Transfer-proof pigmented liquid matte formula infused with arrowroot for non-drying lightweight all-day wear.",
                "specifications": {
                    "Volume": "5.5 ml",
                    "Finish": "Liquid Velvet Matte",
                    "Stay Power": "16 Hours Transfer-Proof",
                    "Shade": "Ruby Red"
                }
            },
            {
                "id": 53,
                "title": "Hyaluronic Water-Gel Ultralight Sunscreen SPF 50+ PA++++",
                "sku": "BEAUTY-PLUM-SUNSCREEN-GEL-50G",
                "category": "Beauty",
                "brand": "Plum",
                "base_price": Decimal("750.00"),
                "discount_price": Decimal("499.00"),
                "stock_quantity": 110,
                "average_rating": Decimal("4.60"),
                "review_count": 3100,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/beauty_sunscreen_gel.png",
                "tags": "sunscreen, plum, spf50, gel sunscreen, skincare, uv protection, hyaluronic acid",
                "description": "Ultra-lightweight invisible broad-spectrum gel sunscreen loaded with hyaluronic acid and niacinamide.",
                "specifications": {
                    "Volume": "50 g",
                    "Protection": "SPF 50+ PA++++ Broad Spectrum",
                    "Texture": "Invisible Water Gel",
                    "White Cast": "Zero White Cast"
                }
            },
            {
                "id": 54,
                "title": "Moroccan Argan Oil Hair Recovery Serum & Heat Protectant",
                "sku": "BEAUTY-LOREAL-ARGAN-HAIR-SERUM",
                "category": "Beauty",
                "brand": "L'Oréal Paris",
                "base_price": Decimal("1299.00"),
                "discount_price": Decimal("799.00"),
                "stock_quantity": 90,
                "average_rating": Decimal("4.70"),
                "review_count": 5400,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/beauty_argan_hair_serum.jpg",
                "tags": "hair serum, argan oil, loreal, haircare, heat protectant, frizz control",
                "description": "Precious blend of Moroccan Argan oil that instantly smoothens split ends and provides 230°C thermal protection.",
                "specifications": {
                    "Volume": "100 ml",
                    "Thermal Protection": "Up to 230°C",
                    "Key Ingredient": "Moroccan Argan Oil",
                    "Hair Benefit": "Instant Shine & Anti-Frizz"
                }
            },
            {
                "id": 55,
                "title": "Luxury Oud & French Amber Eau De Parfum (100ml)",
                "sku": "BEAUTY-FOREST-OUD-AMBER-EDP",
                "category": "Beauty",
                "brand": "Forest Essentials",
                "base_price": Decimal("4500.00"),
                "discount_price": Decimal("2499.00"),
                "stock_quantity": 50,
                "average_rating": Decimal("4.90"),
                "review_count": 1280,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/beauty_oud_perfume.jpg",
                "tags": "perfume, edp, oud, forest essentials, fragrance, luxury, amber",
                "description": "Enchanting artisanal fragrance combining royal smoked agarwood, sweet vanilla bean, and velvet amber notes.",
                "specifications": {
                    "Volume": "100 ml EDP",
                    "Fragrance Notes": "Royal Oud, Vanilla Bean, French Amber",
                    "Type": "Eau De Parfum",
                    "Longevity": "24 Hours"
                }
            },
            {
                "id": 56,
                "title": "9 to 5 Complexion Care CC Cream SPF 30 (30g)",
                "sku": "BEAUTY-LAKME-CC-CREAM-30G",
                "category": "Beauty",
                "brand": "Lakmé",
                "base_price": Decimal("499.00"),
                "discount_price": Decimal("349.00"),
                "stock_quantity": 130,
                "average_rating": Decimal("4.50"),
                "review_count": 8200,
                "is_featured": False,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/beauty_cc_cream.png",
                "tags": "cc cream, lakme, makeup, foundation, skincare, spf30, glow",
                "description": "Dual-action makeup and skincare cream that conceals blemishes while moisturizing and protecting against UV rays.",
                "specifications": {
                    "Volume": "30 g",
                    "Sun Protection": "SPF 30 PA++",
                    "Coverage": "Natural Dewy Glow",
                    "Skin Tone": "Beige All Tone Adapt"
                }
            },
            {
                "id": 57,
                "title": "Onion Scalp Oil with Redensyl for Hair Growth (150ml)",
                "sku": "BEAUTY-MAMAEARTH-ONION-OIL-150ML",
                "category": "Beauty",
                "brand": "Mamaearth",
                "base_price": Decimal("699.00"),
                "discount_price": Decimal("449.00"),
                "stock_quantity": 140,
                "average_rating": Decimal("4.40"),
                "review_count": 9100,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/beauty_onion_hair_oil.png",
                "tags": "hair oil, onion oil, mamaearth, redensyl, haircare, hair growth",
                "description": "Non-sticky natural cold-pressed oil enriched with sulphur, Redensyl, and almond oil to strengthen hair roots.",
                "specifications": {
                    "Volume": "150 ml",
                    "Key Ingredients": "Onion Seed Oil, Redensyl, Almond Oil",
                    "Safety": "Dermatologically Tested Toxin-Free"
                }
            },
            {
                "id": 58,
                "title": "Vitamin C Brightening Foaming Face Wash with Brush (150ml)",
                "sku": "BEAUTY-PLUM-VITC-FACEWASH-150ML",
                "category": "Beauty",
                "brand": "Plum",
                "base_price": Decimal("599.00"),
                "discount_price": Decimal("399.00"),
                "stock_quantity": 115,
                "average_rating": Decimal("4.50"),
                "review_count": 3700,
                "is_featured": False,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/beauty_vitamin_c_facewash.png",
                "tags": "face wash, vitamin c, plum, foaming face wash, skincare, brush",
                "description": "Gentle exfoliating facial cleanser infused with Kakadu plum vitamin C to remove dirt and boost radiant skin glow.",
                "specifications": {
                    "Volume": "150 ml",
                    "Brush": "Built-in Silicone Massaging Brush",
                    "Key Ingredient": "Kakadu Plum Vitamin C"
                }
            },
            {
                "id": 59,
                "title": "Volumizing Waterproof Panoramic Mascara",
                "sku": "BEAUTY-LOREAL-MASCARA-WATERPROOF",
                "category": "Beauty",
                "brand": "L'Oréal Paris",
                "base_price": Decimal("1299.00"),
                "discount_price": Decimal("899.00"),
                "stock_quantity": 95,
                "average_rating": Decimal("4.60"),
                "review_count": 4300,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/beauty_mascara.jpg",
                "tags": "mascara, loreal, makeup, eye makeup, waterproof, volume",
                "description": "Multi-level bristle wand that fans lashes corner-to-corner for maximum volume without clumping.",
                "specifications": {
                    "Volume": "9.4 ml",
                    "Formula": "Waterproof Clump-Free",
                    "Wand": "Panoramic Multi-Level Bristle"
                }
            },
            {
                "id": 60,
                "title": "Ceramides Deep Hydration Moisturizing Cream (100g)",
                "sku": "BEAUTY-MINIMALIST-CERAMIDE-CREAM-100G",
                "category": "Beauty",
                "brand": "Minimalist",
                "base_price": Decimal("799.00"),
                "discount_price": Decimal("549.00"),
                "stock_quantity": 105,
                "average_rating": Decimal("4.80"),
                "review_count": 2800,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": False,
                "image": "products/beauty_ceramide_cream.png",
                "tags": "moisturizer, ceramides, minimalist, skincare, barrier repair, hydration",
                "description": "Restorative barrier repair cream infused with 0.3% pure ceramides, madecassoside and hyaluronic acid.",
                "specifications": {
                    "Volume": "100 g",
                    "Active Ingredients": "0.3% Ceramides + Madecassoside + Hyaluronic Acid",
                    "Skin Benefit": "Skin Barrier Repair"
                }
            },
            {
                "id": 61,
                "title": "Japanese Cherry Blossom Relaxing Body Wash (250ml)",
                "sku": "BEAUTY-NYKAA-BODYWASH-250ML",
                "category": "Beauty",
                "brand": "Nykaa",
                "base_price": Decimal("550.00"),
                "discount_price": Decimal("375.00"),
                "stock_quantity": 120,
                "average_rating": Decimal("4.60"),
                "review_count": 1900,
                "is_featured": False,
                "is_new_arrival": True,
                "is_deal_of_day": False,
                "image": "products/beauty_cherry_bodywash.png",
                "tags": "body wash, shower gel, nykaa, bath & body, cherry blossom, aloe",
                "description": "Luxe foaming shower gel enriched with aloe vera and cherry blossom extract for supple, fragrant skin.",
                "specifications": {
                    "Volume": "250 ml",
                    "Fragrance": "Japanese Cherry Blossom",
                    "Formula": "Hydrating Aloe Vera Foam"
                }
            },
            # --- TOP DEALS PRODUCTS ---
            {
                "id": 62,
                "title": "boAt Wave Call 2 Smartwatch",
                "sku": "ELEC-BOAT-WAVE-CALL2",
                "category": "Electronics",
                "brand": "boAt",
                "base_price": Decimal("3499.00"),
                "discount_price": Decimal("1299.00"),
                "stock_quantity": 90,
                "average_rating": Decimal("4.60"),
                "review_count": 2300,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": True,
                "image": "products/noise_smartwatch.jpg",
                "tags": "smartwatch, boat, wave call 2, fitness, calling, wearable",
                "description": "Smartwatch with HD display, Bluetooth calling, HR and SpO2 tracking, and 7-day battery backup.",
                "specifications": {
                    "Display": "1.83 inch HD Display",
                    "Calling": "Bluetooth Calling",
                    "Battery": "Up to 7 Days"
                }
            },
            {
                "id": 63,
                "title": "Realme Buds T300 Wireless Earbuds",
                "sku": "ELEC-REALME-BUDS-T300",
                "category": "Electronics",
                "brand": "Realme",
                "base_price": Decimal("2699.00"),
                "discount_price": Decimal("999.00"),
                "stock_quantity": 110,
                "average_rating": Decimal("4.50"),
                "review_count": 1700,
                "is_featured": True,
                "is_new_arrival": True,
                "is_deal_of_day": True,
                "image": "products/boat_airdopes.png",
                "tags": "earbuds, realme, tws, wireless, bluetooth, noise cancellation",
                "description": "True wireless earbuds with 30dB Active Noise Cancellation and 40 hours total battery life.",
                "specifications": {
                    "Noise Cancellation": "30dB Active Noise Cancellation",
                    "Playtime": "40 Hours Total Playback",
                    "Driver": "12.4mm Dynamic Bass Driver"
                }
            },
            {
                "id": 64,
                "title": "Skybags Brat 15.6 inch Laptop Backpack",
                "sku": "BAG-SKYBAGS-BRAT-15",
                "category": "Bags & Luggage",
                "brand": "Skybags",
                "base_price": Decimal("1999.00"),
                "discount_price": Decimal("1199.00"),
                "stock_quantity": 65,
                "average_rating": Decimal("4.40"),
                "review_count": 800,
                "is_featured": False,
                "is_new_arrival": True,
                "is_deal_of_day": True,
                "image": "products/teal_backpack.jpg",
                "tags": "backpack, skybags, laptop bag, travel bag, casual",
                "description": "Lightweight durable polyester 3-compartment backpack with extra laptop sleeve.",
                "specifications": {
                    "Capacity": "30 Litres",
                    "Laptop Sleeve": "15.6 inch",
                    "Material": "Water-Resistant Polyester"
                }
            },
            {
                "id": 65,
                "title": "Red Tape Men's Casual Sneakers",
                "sku": "FOOT-REDTAPE-CASUAL-SNEAKERS",
                "category": "Footwear",
                "brand": "Red Tape",
                "base_price": Decimal("3199.00"),
                "discount_price": Decimal("1399.00"),
                "stock_quantity": 80,
                "average_rating": Decimal("4.50"),
                "review_count": 1800,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/fashion_street_sneakers.jpg",
                "tags": "sneakers, red tape, shoes, footwear, men, casual",
                "description": "Low-top casual lifestyle sneakers with cushioned memory foam insole and synthetic upper.",
                "specifications": {
                    "Upper": "Synthetic PU",
                    "Sole": "TPR Rubber",
                    "Closure": "Lace-Up"
                }
            },
            {
                "id": 66,
                "title": "Prestige Iris 750W Mixer Grinder",
                "sku": "HOME-PRESTIGE-IRIS-750W",
                "category": "Appliances",
                "brand": "Prestige",
                "base_price": Decimal("4599.00"),
                "discount_price": Decimal("2999.00"),
                "stock_quantity": 40,
                "average_rating": Decimal("4.60"),
                "review_count": 1600,
                "is_featured": True,
                "is_new_arrival": False,
                "is_deal_of_day": True,
                "image": "products/accent_chair.jpg",
                "tags": "mixer grinder, prestige, kitchen appliance, 750w, grinder",
                "description": "Heavy-duty 750-watt motor mixer grinder equipped with 3 stainless steel jars and 1 juicer jar.",
                "specifications": {
                    "Motor Power": "750 Watts",
                    "Jars": "3 Stainless Steel Jars + 1 Juicer Jar",
                    "Warranty": "2 Years Motor Warranty"
                }
            },
            {
                "id": 67,
                "title": "Home Select Plastic Storage Box (Pack of 3)",
                "sku": "HOME-SELECT-STORAGE-BOX",
                "category": "Home & Kitchen",
                "brand": "Home Select",
                "base_price": Decimal("1599.00"),
                "discount_price": Decimal("499.00"),
                "stock_quantity": 100,
                "average_rating": Decimal("4.30"),
                "review_count": 1100,
                "is_featured": False,
                "is_new_arrival": True,
                "is_deal_of_day": True,
                "image": "products/beauty_oud_perfume.jpg",
                "tags": "storage box, home select, plastic container, organization, kitchen",
                "description": "BPA-free stackable transparent plastic storage containers with airtight latching lids.",
                "specifications": {
                    "Set": "Pack of 3 Containers",
                    "Capacity": "5 Litres Each",
                    "Material": "BPA-Free Virgin Plastic"
                }
            }
        ]

        for p_data in products_data:
            category_name = str(p_data["category"])
            brand_name = str(p_data["brand"])
            cat_obj = cat_objs.get(category_name) or cat_objs.get(slugify(category_name))
            brand_obj = brand_objs.get(brand_name)

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
            if hasattr(User.objects, "create_user"):
                customer_user = User.objects.create_user(
                    email="customer@buyzo.com",
                    password="Customer@123",
                    role="CUSTOMER",
                    is_verified=True
                )
            else:
                customer_user = User.objects.create(
                    email="customer@buyzo.com",
                    role="CUSTOMER",
                    is_verified=True
                )
                customer_user.set_password("Customer@123")
                customer_user.save()
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

            unit_price = Decimal(str(o_def["price"]))
            quantity = int(o_def["quantity"])
            subtotal = unit_price * quantity
            tax_amount = (subtotal * Decimal("0.18")).quantize(Decimal("0.01"))
            total_amount = (subtotal * Decimal("1.18")).quantize(Decimal("0.01"))

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
                    "subtotal": subtotal,
                    "discount_amount": Decimal("0.00"),
                    "shipping_amount": Decimal("0.00"),
                    "tax_amount": tax_amount,
                    "total_amount": total_amount,
                    "payment_method": "MOCK",
                    "payment_status": "PAID",
                    "delivery_otp": Order.generate_otp()
                }
            )

            prod_img_path = ""
            if hasattr(prod, "images") and prod.images.exists():
                first_img = prod.images.filter(is_primary=True).first() or prod.images.first()
                if first_img and first_img.image:
                    prod_img_path = f"/media/{first_img.image}"

            item, _ = OrderItem.objects.update_or_create(
                order=order,
                product=prod,
                defaults={
                    "product_title": prod.title,
                    "sku": prod.sku,
                    "product_image": prod_img_path,
                    "unit_price": unit_price,
                    "quantity": quantity,
                    "total_price": subtotal,
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
