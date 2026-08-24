# BuyZo E-Commerce Backend (Django REST Framework + MySQL)

A complete, production-ready, zero-cost backend powering all 4 portals of the **BuyZo E-Commerce** platform:
1. 🛒 **Customer Storefront Portal**
2. 🛡️ **Admin Management & Analytics Portal**
3. 🏢 **Warehouse & Fulfillment Portal**
4. 🛵 **Delivery Agent Portal**

Built strictly using free, local, open-source tools with **zero paid subscriptions, zero cloud fees, and simulated mock payment gateways**.

---

## 🚀 Tech Stack

- **Framework**: Django 5.1+ / Python 3.11+
- **API Layer**: Django REST Framework (DRF)
- **Database**: MySQL 8.x (via pure-Python `PyMySQL` connector) with automatic fallback to `SQLite` for zero-configuration local runs
- **Authentication**: JWT via `djangorestframework-simplejwt` + custom RBAC permissions
- **Documentation**: Swagger / OpenAPI 3.0 via `drf-spectacular`
- **Payments**: Zero-cost simulated Mock Payment Gateway + Razorpay/Stripe sandbox integration
- **Email**: Console Email Backend (logs confirmation emails, OTPs, and password reset codes to terminal)
- **Containerization**: `docker-compose.yml` (Django + MySQL)

---

## ⚡ Quick Start (Local Setup)

### 1. Prerequisites
- Python 3.11+ installed

### 2. Setup Virtual Environment & Install Dependencies
```bash
# Navigate to backend directory
cd KSS-E-COMMERCE-OFFICIAL/backend

# Create & activate virtual environment
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(By default, `.env` uses `DB_ENGINE=sqlite` so the project works out of the box with zero external database configuration. To connect to a local MySQL server or Docker MySQL, set `DB_ENGINE=mysql` in `.env`.)*

### 4. Run Migrations & Seed Demo Data
```bash
python manage.py migrate
python manage.py seed_demo_data
```

### 5. Start Development Server
```bash
python manage.py runserver 8000
```
- **API Base URL**: `http://127.0.0.1:8000/api/`
- **Swagger Documentation**: `http://127.0.0.1:8000/api/docs/`
- **Redoc Documentation**: `http://127.0.0.1:8000/api/redoc/`
- **Health Check**: `http://127.0.0.1:8000/api/health/`

---

## 🐳 Docker Setup (One-Command Run)

If you prefer running Django with a dedicated MySQL 8 container in Docker:
```bash
docker-compose up --build
```
This automatically boots MySQL 8 on port `3306` and the Django backend on port `8000`.

---

## 🔑 Pre-Configured Demo Accounts

After running `python manage.py seed_demo_data`, you can test all 4 portals with these credentials:

| Portal | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **🛡️ Admin Portal** | `ADMIN` | `admin@buyzo.com` | `Admin@123` |
| **🏢 Warehouse Portal** | `WAREHOUSE` | `warehouse@buyzo.com` | `Warehouse@123` |
| **🛵 Delivery Agent Portal** | `DELIVERY_AGENT` | `delivery@buyzo.com` | `Delivery@123` |
| **🛒 Customer Portal** | `CUSTOMER` | `customer@buyzo.com` | `Customer@123` |

---

## 🗺️ Mapping APIs to Frontend Portals & Actions

### 1. 🛒 Customer Portal (`src/`)
| Frontend Screen / Action | HTTP Method & Endpoint | Description |
| :--- | :--- | :--- |
| **User Registration** | `POST /api/auth/register/` | Register new account & generate verification OTP |
| **User Login** | `POST /api/auth/login/` | Obtain JWT access & refresh tokens |
| **Email Verification** | `POST /api/auth/verify-email/` | Validate 6-digit OTP to verify account |
| **Password Reset** | `POST /api/auth/forgot-password/` & `reset-password/` | Recover password via OTP |
| **Header Live Search** | `GET /api/catalog/search/suggestions/?q=...` | Instant autocomplete matching products |
| **Browse Products / Categories** | `GET /api/catalog/products/` & `/categories/` | Paginated catalog with filters & sorting |
| **Product Detail Page** | `GET /api/catalog/products/<slug>/` | Specs, images, variants, related items |
| **Cart Operations** | `GET/POST/PATCH/DELETE /api/cart/` & `/items/` | Add/update/remove items, subtotal calculation |
| **Apply Coupon** | `POST /api/coupons/apply/` | Validate & apply discounts (`WELCOME50`, `BUYZO10`) |
| **Checkout Order** | `POST /api/orders/checkout/` | Atomic transaction, stock decrement, 4-digit OTP |
| **Mock Payment** | `POST /api/payments/verify/` | Instant `SIMULATE_SUCCESS` payment confirmation |
| **Order History & Live Milestones** | `GET /api/orders/` & `GET /api/orders/<id>/` | Turn-by-turn tracking: *Placed → Confirmed → Shipped → Out for Delivery → Delivered* |
| **Cancel Order** | `POST /api/orders/<id>/cancel/` | Cancels order & automatically rolls back inventory stock |
| **Download Invoice** | `GET /api/orders/<id>/invoice/` | HTML / PDF formatted invoice summary |
| **Submit Product Review** | `POST /api/reviews/product/<slug>/` | Verified-purchase rating & review submission |

---

### 2. 🛡️ Admin Portal (`Admin/`)
| Frontend Tab / Feature | HTTP Method & Endpoint | Description |
| :--- | :--- | :--- |
| **Dashboard KPIs** | `GET /api/admin/dashboard/summary/` | Total revenue, monthly sales, order counts |
| **Revenue Chart** | `GET /api/admin/analytics/revenue/` | Multi-day / monthly revenue curves |
| **Top Selling Products** | `GET /api/admin/analytics/top-products/` | Best sellers by volume and revenue |
| **Low Stock Warnings** | `GET /api/admin/analytics/low-stock/` | Products at or below threshold |
| **Catalog Management** | `GET/POST/PUT/DELETE /api/catalog/admin/products/` | Full product catalog CRUD operations |
| **Categories & Brands** | `GET/POST/PUT/DELETE /api/catalog/admin/categories/` | Manage catalog taxonomy & brands |
| **Orders Master Control** | `GET /api/orders/admin/orders/` | Filter orders by status, payment, customer |
| **Order Status Override** | `PATCH /api/orders/admin/orders/<id>/status/` | Update status (*Pending → Shipped → Delivered → Cancelled*), stock rollback, and notifications |
| **Coupons Management** | `GET/POST/PUT/DELETE /api/coupons/admin/coupons/` | Create, edit, and track discount coupon usage |
| **User Management** | `GET/POST/PATCH/DELETE /api/auth/admin/users/` | Role assignment, ban/deactivate user accounts |

---

### 3. 🏢 Warehouse Portal (`WarehousePortal/`)
| Frontend Tab / Feature | HTTP Method & Endpoint | Description |
| :--- | :--- | :--- |
| **Inbound PO Intake** | `GET/POST /api/warehouse/inbound/` | Log incoming supplier stock shipments |
| **Verify Inbound Shipment** | `PATCH /api/warehouse/inbound/<id>/verify/` | Mark PO verified & increment warehouse stock |
| **Outbound Packing Slips** | `GET/POST /api/warehouse/outbound/` | Generate order manifests for couriers |
| **Dispatch Shipment** | `PATCH /api/warehouse/outbound/<id>/dispatch/` | Handover manifest to courier (BlueDart, Delhivery) |
| **Stock Transfers** | `GET/POST /api/warehouse/transfers/` | Inter-hub stock movement logs |
| **Customer Returns** | `GET/POST/PATCH /api/warehouse/returns/` | Inspect returns & approve restocking |
| **Inventory Overview** | `GET /api/warehouse/inventory-overview/` | Bin/shelf SKU counts & health overview |

---

### 4. 🛵 Delivery Agent Portal (`DeliveryAgentPortal/`)
| Frontend Tab / Feature | HTTP Method & Endpoint | Description |
| :--- | :--- | :--- |
| **Agent Dashboard** | `GET /api/delivery/dashboard/` | Shift status, completed deliveries, rating |
| **Delivery Queue** | `GET /api/delivery/tasks/?status=active` | Assigned pending & in-transit orders |
| **Advance Delivery Stage** | `POST /api/delivery/tasks/<id>/advance-stage/` | Advances step (*Picked Up → On the Way → Arrived*) |
| **Verify Customer OTP** | `POST /api/delivery/tasks/<id>/verify-otp/` | Validates 4-digit code, confirms COD cash, marks Delivered |
| **Agent Earnings Ledger** | `GET /api/delivery/earnings/` | Delivery fees, tips, and daily incentives |

---

## 🧪 Running Automated Tests

Run the full pytest suite:
```bash
pytest
```
The test suite covers:
- User registration, login, JWT tokens, email verification, and password reset.
- Catalog search, autocomplete, and Admin CRUD permissions.
- Cart quantity manipulation, price calculation, and coupon validation.
- Atomic checkout, stock decrement, and cancellation stock rollback.
- Mock payment session creation and verification.
- Warehouse inbound PO verification and Delivery Agent OTP completion.
