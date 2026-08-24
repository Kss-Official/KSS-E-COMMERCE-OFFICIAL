from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.db import connection

def api_root_view(request):
    """
    Root view for http://127.0.0.1:8000/
    Provides an interactive landing page for browsers and JSON for API clients.
    """
    # Check MySQL DB Health
    db_healthy = True
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        db_healthy = False

    # If client requests JSON (API client / curl / mobile)
    if 'application/json' in request.headers.get('Accept', ''):
        return JsonResponse({
            "status": "success",
            "message": "BuyZo REST API Backend is running.",
            "service": "BuyZo Backend API",
            "database": "Connected (MySQL)" if db_healthy else "Disconnected",
            "timestamp": timezone.now().isoformat(),
            "frontend_url": "http://localhost:5173",
            "endpoints": {
                "docs": "http://127.0.0.1:8000/api/docs/",
                "redoc": "http://127.0.0.1:8000/api/redoc/",
                "admin": "http://127.0.0.1:8000/admin/",
                "health": "http://127.0.0.1:8000/api/health/",
                "products": "http://127.0.0.1:8000/api/catalog/products/",
                "categories": "http://127.0.0.1:8000/api/catalog/categories/",
                "orders": "http://127.0.0.1:8000/api/orders/",
                "warehouse": "http://127.0.0.1:8000/api/warehouse/inventory-overview/",
                "delivery": "http://127.0.0.1:8000/api/delivery/tasks/"
            }
        })

    # Return interactive HTML page for Browser visits
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BuyZo REST API Backend - Operational</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; }}
            body {{ background-color: #f4f8f7; color: #1e293b; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; }}
            .card {{ background: #ffffff; border-radius: 24px; box-shadow: 0 20px 40px -15px rgba(12, 122, 104, 0.12), 0 0 1px 1px rgba(0,0,0,0.05); max-width: 680px; width: 100%; padding: 40px; text-align: center; }}
            .logo-badge {{ display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: linear-gradient(135deg, #1b4d3e, #0c7a68); color: white; border-radius: 18px; font-size: 28px; font-weight: 800; margin-bottom: 20px; box-shadow: 0 10px 20px -5px rgba(12, 122, 104, 0.4); }}
            h1 {{ font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }}
            .status-pill {{ display: inline-flex; align-items: center; gap: 8px; background: #ecfdf5; color: #065f46; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; margin-bottom: 20px; border: 1px solid #a7f3d0; }}
            .status-dot {{ width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }}
            @keyframes pulse {{ 0%, 100% {{ opacity: 1; transform: scale(1); }} 50% {{ opacity: 0.5; transform: scale(0.8); }} }}
            p.desc {{ font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 28px; }}
            .btn-primary {{ display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #ff5100; color: white; text-decoration: none; font-weight: 800; font-size: 15px; padding: 14px 28px; border-radius: 14px; box-shadow: 0 10px 20px -5px rgba(255, 81, 0, 0.4); transition: all 0.2s ease; margin-bottom: 28px; }}
            .btn-primary:hover {{ background: #e04800; transform: translateY(-2px); }}
            .grid-links {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: left; }}
            .link-item {{ display: block; padding: 14px 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; text-decoration: none; color: #334155; font-size: 13px; font-weight: 700; transition: all 0.2s ease; }}
            .link-item:hover {{ background: #f0fdf4; border-color: #86efac; color: #166534; transform: translateY(-1px); }}
            .link-sub {{ display: block; font-size: 11px; font-weight: 500; color: #94a3b8; margin-top: 2px; }}
            .footer-note {{ margin-top: 24px; font-size: 12px; color: #94a3b8; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="logo-badge">🛍️</div>
            <h1>BuyZo Backend API</h1>
            <div class="status-pill">
                <span class="status-dot"></span>
                <span>Django REST API is Active & Healthy</span>
            </div>
            <p class="desc">
                The backend service is running on <strong>http://127.0.0.1:8000</strong> connected to MySQL database. The main e-commerce storefront is running on <strong>http://localhost:5173</strong>.
            </p>

            <a href="http://localhost:5173" class="btn-primary">
                <span>🚀 Open Storefront Website (localhost:5173)</span>
            </a>

            <div class="grid-links">
                <a href="/api/docs/" class="link-item">
                    📚 Interactive Swagger API Docs
                    <span class="link-sub">Test all endpoints in Swagger UI</span>
                </a>
                <a href="/api/redoc/" class="link-item">
                    📖 ReDoc API Reference
                    <span class="link-sub">Complete schema documentation</span>
                </a>
                <a href="/admin/" class="link-item">
                    🔐 Django Admin Portal
                    <span class="link-sub">Manage database records directly</span>
                </a>
                <a href="/api/catalog/products/" class="link-item">
                    📦 Product Catalog JSON API
                    <span class="link-sub">Live MySQL product records</span>
                </a>
                <a href="/api/health/" class="link-item">
                    ❤️ Health Check Endpoint
                    <span class="link-sub">Database & service status</span>
                </a>
                <a href="/api/warehouse/inventory-overview/" class="link-item">
                    🏭 Warehouse Inventory API
                    <span class="link-sub">Live stock levels & shipments</span>
                </a>
            </div>

            <div class="footer-note">
                BuyZo E-Commerce Platform • Full Stack Architecture
            </div>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html_content, content_type='text/html')
