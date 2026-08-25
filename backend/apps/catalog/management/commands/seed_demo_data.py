from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from apps.accounts.models import User, Profile, Address
from apps.catalog.models import Category, SubCategory, Brand, Product, ProductVariant
from apps.coupons.models import Coupon
from apps.orders.models import Order, OrderItem, OrderTrackingMilestone
from apps.warehouse.models import InboundReceipt, OutboundShipment, StockTransfer
from apps.delivery.models import DeliveryTask, AgentEarnings
from apps.notifications.models import InAppNotification
from apps.support.models import FAQ

class Command(BaseCommand):
    help = "Seeds database with demo accounts, categories, products, coupons, and orders for all 4 portals."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding BuyZo E-Commerce demo dataset..."))

        # 1. USERS & PROFILES FOR ALL 4 ROLES
        users_data = [
            ("admin@buyzo.com", "Admin@123", "ADMIN", "Amit", "Sharma", "+91 98765 00001", True, True),
            ("warehouse@buyzo.com", "Warehouse@123", "WAREHOUSE", "Suresh", "Patel", "+91 98765 00002", True, False),
            ("delivery@buyzo.com", "Delivery@123", "DELIVERY_AGENT", "Amit", "Kumar", "+91 98765 00003", True, False),
            ("customer@buyzo.com", "Customer@123", "CUSTOMER", "Rahul", "Sharma", "+91 98765 43210", True, False),
        ]

        created_users = {}
        for email, password, role, fname, lname, phone, is_ver, is_staff in users_data:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'role': role,
                    'phone': phone,
                    'is_verified': is_ver,
                    'is_staff': is_staff,
                    'is_superuser': (role == 'ADMIN')
                }
            )
            if created or not user.check_password(password):
                user.set_password(password)
                user.role = role
                user.is_verified = is_ver
                user.is_staff = is_staff
                user.is_superuser = (role == 'ADMIN')
                user.save()

            Profile.objects.update_or_create(
                user=user,
                defaults={'first_name': fname, 'last_name': lname}
            )
            created_users[role] = user
            self.stdout.write(self.style.SUCCESS(f"  [+] User created: {email} (Password: {password}, Role: {role})"))

        customer = created_users['CUSTOMER']
        delivery_agent = created_users['DELIVERY_AGENT']

        # Customer Address
        Address.objects.update_or_create(
            user=customer,
            street_address="42, Park Street, Connaught Place",
            defaults={
                'recipient_name': "Rahul Sharma",
                'phone_number': "+91 98765 43210",
                'city': "New Delhi",
                'state': "Delhi",
                'postal_code': "110001",
                'is_default': True,
                'address_type': "HOME"
            }
        )

        # 2. CATEGORIES & SUBCATEGORIES
        categories = [
            ("Mobiles", "Latest 5G smartphones & accessories", "Smartphone", 1),
            ("Electronics", "Headphones, speakers, smart watches", "Headphones", 2),
            ("Fashion", "Trending clothing, apparel & footwear", "Shirt", 3),
            ("Laptops", "High performance laptops & PCs", "Laptop", 4),
            ("Home & Kitchen", "Modern furniture, decor & appliances", "Armchair", 5),
            ("Bags & Luggage", "Travel bags & backpacks", "Backpack", 6),
            ("Beauty", "Skincare, wellness & cosmetics", "Sparkles", 7),
        ]

        cat_map = {}
        for name, desc, icon, order in categories:
            cat, _ = Category.objects.update_or_create(
                name=name,
                defaults={'description': desc, 'icon_name': icon, 'display_order': order}
            )
            cat_map[name] = cat

        # 3. BRANDS
        brands = ["boAt", "Noise", "Sony", "JBL", "Dell", "HP", "Xiaomi", "Roadster", "Safari"]
        brand_map = {}
        for b in brands:
            brand_obj, _ = Brand.objects.update_or_create(name=b)
            brand_map[b] = brand_obj

        # 4. PRODUCTS
        products_data = [
            {
                "title": "Redmi Note 13 Pro 5G",
                "sku": "MOB-REDMI-N13P",
                "category": cat_map["Mobiles"],
                "brand": brand_map["Xiaomi"],
                "base_price": Decimal("21999.00"),
                "discount_price": Decimal("18999.00"),
                "stock_quantity": 45,
                "description": "200MP Ultra-Clear Camera with OIS, 120Hz 1.5K AMOLED Display, Snapdragon 7s Gen 2 5G processor, 67W Turbo Charge.",
                "tags": "mobile, phone, redmi, xiaomi, smartphone, 5g, note 13",
                "is_featured": True,
                "is_new_arrival": True,
                "average_rating": Decimal("4.7"),
                "review_count": 128
            },
            {
                "title": "boAt Rockerz 450 Wireless Headphones",
                "sku": "ELEC-BOAT-R450",
                "category": cat_map["Electronics"],
                "brand": brand_map["boAt"],
                "base_price": Decimal("2499.00"),
                "discount_price": Decimal("1499.00"),
                "stock_quantity": 80,
                "description": "Up to 15 Hours Playback, 40mm Dynamic Drivers, Padded Ear Cushions, Bluetooth v5.0.",
                "tags": "headphone, headset, boat, rockerz, wireless, bluetooth, audio",
                "is_featured": True,
                "is_deal_of_day": True,
                "average_rating": Decimal("4.6"),
                "review_count": 340
            },
            {
                "title": "Noise ColorFit Pro 5 Smartwatch",
                "sku": "ELEC-NOISE-CFP5",
                "category": cat_map["Electronics"],
                "brand": brand_map["Noise"],
                "base_price": Decimal("4999.00"),
                "discount_price": Decimal("2999.00"),
                "stock_quantity": 60,
                "description": "1.85-inch AMOLED Display, Bluetooth Calling with TruSync, Post Training Recovery Score, 100+ Sports Modes.",
                "tags": "watch, smartwatch, noise, colorfit, fitness, tracker, wearable",
                "is_featured": True,
                "average_rating": Decimal("4.5"),
                "review_count": 210
            },
            {
                "title": "Sony WH-CH510 Wireless Headphones",
                "sku": "ELEC-SONY-CH510",
                "category": cat_map["Electronics"],
                "brand": brand_map["Sony"],
                "base_price": Decimal("3990.00"),
                "discount_price": Decimal("2499.00"),
                "stock_quantity": 30,
                "description": "35 Hours Battery Life, Lightweight Swivel Design, Quick 10-Min Charge, Voice Assistant Compatible.",
                "tags": "sony, headphone, wireless, audio, bluetooth, music",
                "is_featured": False,
                "average_rating": Decimal("4.4"),
                "review_count": 95
            },
            {
                "title": "JBL Flip Essential 2 Bluetooth Speaker",
                "sku": "ELEC-JBL-FLIP2",
                "category": cat_map["Electronics"],
                "brand": brand_map["JBL"],
                "base_price": Decimal("6999.00"),
                "discount_price": Decimal("4499.00"),
                "stock_quantity": 25,
                "description": "Bold JBL Original Pro Sound, 10 Hours Playtime, IPX7 Waterproof Design, Eco-friendly packaging.",
                "tags": "jbl, speaker, bluetooth, audio, sound, flip",
                "is_featured": True,
                "average_rating": Decimal("4.8"),
                "review_count": 140
            },
            {
                "title": "Dell Inspiron 15 Core i5 Laptop",
                "sku": "LAP-DELL-INSP15",
                "category": cat_map["Laptops"],
                "brand": brand_map["Dell"],
                "base_price": Decimal("68000.00"),
                "discount_price": Decimal("54990.00"),
                "stock_quantity": 18,
                "description": "Intel Core i5-1235U 12th Gen, 16GB DDR4 RAM, 512GB SSD, 15.6 inch FHD 120Hz Display, Windows 11 + MSO.",
                "tags": "dell, laptop, computer, inspiron, pc, notebook, i5",
                "is_featured": True,
                "average_rating": Decimal("4.6"),
                "review_count": 82
            },
            {
                "title": "HP 15s Ryzen 5 Slim Laptop",
                "sku": "LAP-HP-15S-R5",
                "category": cat_map["Laptops"],
                "brand": brand_map["HP"],
                "base_price": Decimal("45999.00"),
                "discount_price": Decimal("34990.00"),
                "stock_quantity": 22,
                "description": "AMD Ryzen 5 5500U, 8GB DDR4, 512GB SSD, 15.6 inch Micro-Edge Anti-Glare FHD Display, Backlit KB.",
                "tags": "hp, laptop, ryzen, computer, pc, notebook",
                "is_featured": False,
                "average_rating": Decimal("4.3"),
                "review_count": 64
            },
            {
                "title": "Women Emerald Green A-Line Dress",
                "sku": "FASH-DRESS-EMERALD",
                "category": cat_map["Fashion"],
                "brand": brand_map["Roadster"],
                "base_price": Decimal("1999.00"),
                "discount_price": Decimal("999.00"),
                "stock_quantity": 50,
                "description": "Premium Cotton Silk Blend, Elegant Flared Hemline, Mandarin Neckline, Machine Washable.",
                "tags": "dress, women, fashion, clothing, green dress, outfit, wear",
                "is_featured": True,
                "is_deal_of_day": True,
                "average_rating": Decimal("4.7"),
                "review_count": 110
            },
            {
                "title": "Roadster Men's Cotton Casual Shirt",
                "sku": "FASH-ROADSTER-SHIRT",
                "category": cat_map["Fashion"],
                "brand": brand_map["Roadster"],
                "base_price": Decimal("1999.00"),
                "discount_price": Decimal("999.00"),
                "stock_quantity": 70,
                "description": "100% Breathable Cotton, Spread Collar, Curved Hem, Regular Fit Casual Shirt.",
                "tags": "shirt, casual, men, roadster, fashion, top, clothes",
                "is_featured": False,
                "average_rating": Decimal("4.2"),
                "review_count": 75
            },
            {
                "title": "Modern Teal Blue Lounge Chair",
                "sku": "HOME-CHAIR-TEAL",
                "category": cat_map["Home & Kitchen"],
                "brand": None,
                "base_price": Decimal("12999.00"),
                "discount_price": Decimal("7999.00"),
                "stock_quantity": 12,
                "description": "Ergonomic Nordic Armchair, High Density Foam Cushion, Solid Teakwood Legs, Soft Velvet Fabric.",
                "tags": "chair, furniture, lounge, armchair, home, sofa, teal",
                "is_featured": True,
                "average_rating": Decimal("4.9"),
                "review_count": 48
            },
            {
                "title": "Safari Venture Casual Backpack",
                "sku": "BAG-SAFARI-VENTURE",
                "category": cat_map["Bags & Luggage"],
                "brand": brand_map["Safari"],
                "base_price": Decimal("2199.00"),
                "discount_price": Decimal("1299.00"),
                "stock_quantity": 40,
                "description": "3 Compartments, 35L Capacity, Padded Laptop Sleeve up to 15.6 inch, Rain Cover Included.",
                "tags": "bag, backpack, safari, travel, luggage, casual",
                "is_featured": False,
                "average_rating": Decimal("4.5"),
                "review_count": 92
            },
            {
                "title": "Accent Upholstered Armchair",
                "sku": "HOME-ACCENT-CHAIR",
                "category": cat_map["Home & Kitchen"],
                "brand": None,
                "base_price": Decimal("9999.00"),
                "discount_price": Decimal("6999.00"),
                "stock_quantity": 8,
                "description": "Mid-Century Modern Seating, Breathable Linen Upholstery, Durable Metal Legs.",
                "tags": "chair, furniture, accent, armchair, seating",
                "is_featured": False,
                "average_rating": Decimal("4.4"),
                "review_count": 31
            }
        ]

        created_products = []
        for pdata in products_data:
            p, _ = Product.objects.update_or_create(
                sku=pdata['sku'],
                defaults=pdata
            )
            created_products.append(p)
        self.stdout.write(self.style.SUCCESS(f"  [+] Seeded {len(created_products)} catalog products."))

        # 5. COUPONS
        coupons = [
            ("WELCOME50", "PERCENTAGE", Decimal("50.00"), Decimal("500.00"), Decimal("499.00")),
            ("BUYZO10", "PERCENTAGE", Decimal("10.00"), Decimal("1000.00"), Decimal("999.00")),
            ("FLAT100", "FLAT", Decimal("100.00"), None, Decimal("799.00")),
        ]
        for code, dtype, val, max_d, min_val in coupons:
            Coupon.objects.update_or_create(
                code=code,
                defaults={
                    'discount_type': dtype,
                    'discount_value': val,
                    'max_discount_amount': max_d,
                    'min_order_value': min_val,
                    'valid_from': timezone.now() - timedelta(days=5),
                    'valid_to': timezone.now() + timedelta(days=90),
                    'is_active': True
                }
            )
        self.stdout.write(self.style.SUCCESS("  [+] Seeded promotional discount coupons."))

        # 6. ORDERS & DELIVERIES MATCHING FRONTEND DEMO
        demo_orders = [
            ("ORD1042", customer, "Rahul Sharma", "+91 98765 43210", "42, Park Street, Connaught Place", "New Delhi", "110001", Decimal("1299.00"), "CONFIRMED", "PAID", "MOCK", created_products[1]),
            ("ORD1041", customer, "Priya Nair", "+91 98765 12345", "15, Marine Drive, Churchgate", "Mumbai", "400020", Decimal("2499.00"), "SHIPPED", "PAID", "MOCK", created_products[3]),
            ("ORD1040", customer, "Amit Verma", "+91 98765 67890", "88, MG Road, Indiranagar", "Bengaluru", "560038", Decimal("799.00"), "DELIVERED", "PAID", "MOCK", created_products[8]),
            ("ORD1039", customer, "Sneha Iyer", "+91 98765 99887", "12, Anna Salai, T. Nagar", "Chennai", "600017", Decimal("1999.00"), "CONFIRMED", "PAID", "MOCK", created_products[7]),
            ("ORD1038", customer, "Vikram Rao", "+91 98765 11223", "5, Jubilee Hills", "Hyderabad", "500033", Decimal("1499.00"), "DELIVERED", "PAID", "COD", created_products[10]),
        ]

        for onum, cust, name, phone, addr, city, pin, tot, st, pst, pmethod, prod in demo_orders:
            ord_obj, _ = Order.objects.update_or_create(
                order_number=onum,
                defaults={
                    'customer': cust,
                    'shipping_name': name,
                    'shipping_phone': phone,
                    'shipping_email': cust.email,
                    'shipping_address': addr,
                    'shipping_city': city,
                    'shipping_state': 'State',
                    'shipping_pincode': pin,
                    'subtotal': tot,
                    'total_amount': tot,
                    'status': st,
                    'payment_status': pst,
                    'payment_method': pmethod,
                    'delivery_otp': '1234'
                }
            )
            OrderItem.objects.get_or_create(
                order=ord_obj,
                product=prod,
                defaults={
                    'product_title': prod.title,
                    'sku': prod.sku,
                    'unit_price': prod.current_price,
                    'quantity': 1,
                    'total_price': prod.current_price
                }
            )

            # Milestones
            OrderTrackingMilestone.objects.get_or_create(
                order=ord_obj,
                step_title="Order Placed",
                defaults={'is_completed': True, 'order_index': 1}
            )
            OrderTrackingMilestone.objects.get_or_create(
                order=ord_obj,
                step_title="Confirmed",
                defaults={'is_completed': True, 'order_index': 2}
            )
            OrderTrackingMilestone.objects.get_or_create(
                order=ord_obj,
                step_title="Shipped",
                defaults={'is_completed': st in ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'], 'order_index': 3}
            )
            OrderTrackingMilestone.objects.get_or_create(
                order=ord_obj,
                step_title="Out for Delivery",
                defaults={'is_completed': st in ['OUT_FOR_DELIVERY', 'DELIVERED'], 'order_index': 4}
            )
            OrderTrackingMilestone.objects.get_or_create(
                order=ord_obj,
                step_title="Delivered",
                defaults={'is_completed': st == 'DELIVERED', 'order_index': 5}
            )

            # Create Delivery Task for delivery agent
            if st in ['SHIPPED', 'CONFIRMED']:
                DeliveryTask.objects.update_or_create(
                    order=ord_obj,
                    defaults={
                        'task_id': f"TASK-{onum}",
                        'agent': delivery_agent,
                        'recipient_name': name,
                        'recipient_phone': phone,
                        'delivery_address': f"{addr}, {city} - {pin}",
                        'cod_amount': tot if pmethod == 'COD' else Decimal('0.00'),
                        'current_stage': 2,
                        'status': 'IN_TRANSIT'
                    }
                )
            elif st == 'DELIVERED':
                DeliveryTask.objects.update_or_create(
                    order=ord_obj,
                    defaults={
                        'task_id': f"TASK-{onum}",
                        'agent': delivery_agent,
                        'recipient_name': name,
                        'recipient_phone': phone,
                        'delivery_address': f"{addr}, {city} - {pin}",
                        'cod_amount': tot if pmethod == 'COD' else Decimal('0.00'),
                        'current_stage': 4,
                        'status': 'DELIVERED',
                        'delivered_at': timezone.now() - timedelta(days=1)
                    }
                )
                AgentEarnings.objects.get_or_create(
                    agent=delivery_agent,
                    order=ord_obj,
                    defaults={'base_fee': Decimal('50.00'), 'incentive': Decimal('15.00'), 'total_earned': Decimal('65.00')}
                )

        self.stdout.write(self.style.SUCCESS("  [+] Seeded Orders and Delivery Tasks."))

        # 7. WAREHOUSE INBOUND & OUTBOUND LOGS
        InboundReceipt.objects.get_or_create(
            receipt_id="RCPT-250522-001",
            defaults={
                'supplier_name': "Samsung India Logistics",
                'item_title': "Wireless Headphones (WH-1001)",
                'sku': "ELEC-BOAT-R450",
                'quantity': 120,
                'status': "Verified"
            }
        )
        InboundReceipt.objects.get_or_create(
            receipt_id="RCPT-250522-002",
            defaults={
                'supplier_name': "Anker Tech Pvt Ltd",
                'item_title': "Power Bank (PB-5001)",
                'sku': "ELEC-NOISE-CFP5",
                'quantity': 200,
                'status': "Verified"
            }
        )

        OutboundShipment.objects.get_or_create(
            shipment_id="SHP-250522-037",
            defaults={
                'destination_hub': "Delhi Hub",
                'item_title': "Smart Watch (SW-2001)",
                'sku': "ELEC-NOISE-CFP5",
                'quantity': 80,
                'courier_partner': "BlueDart Express",
                'status': "Dispatched"
            }
        )
        OutboundShipment.objects.get_or_create(
            shipment_id="SHP-250522-038",
            defaults={
                'destination_hub': "Mumbai Hub",
                'item_title': "Wireless Headphones (WH-1001)",
                'sku': "ELEC-BOAT-R450",
                'quantity': 150,
                'courier_partner': "Delhivery",
                'status': "Packing In Progress"
            }
        )

        # 8. NOTIFICATIONS & FAQS
        InAppNotification.objects.get_or_create(
            user=customer,
            title="Order Shipped!",
            defaults={'message': "Your order #ORD1041 has been dispatched.", 'notification_type': 'ORDER_UPDATE'}
        )
        InAppNotification.objects.get_or_create(
            user=customer,
            title="Mega Electronics Sale!",
            defaults={'message': "Get up to 50% off on boAt & Noise wearables.", 'notification_type': 'PROMOTION'}
        )

        faqs = [
            ("How do I track my order?", "You can track your order in real-time under 'My Orders' with turn-by-turn milestone updates."),
            ("What payment methods do you support?", "We support UPI, Debit/Credit Cards, Net Banking, and Cash on Delivery (COD)."),
            ("How does the OTP delivery verification work?", "When the delivery agent arrives, share your 4-digit secret OTP displayed in your order details to confirm delivery."),
        ]
        for q, a in faqs:
            FAQ.objects.get_or_create(question=q, defaults={'answer': a})

        self.stdout.write(self.style.SUCCESS("[*] BuyZo demo dataset seeded successfully! Ready for demonstration."))
