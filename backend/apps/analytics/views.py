from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count, F, Q
from rest_framework.views import APIView

from core.response import APIResponse
from core.permissions import IsAdminUserRole
from apps.accounts.models import User
from apps.catalog.models import Product
from apps.orders.models import Order, OrderItem

class AdminDashboardSummaryView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # Revenue
        total_revenue = Order.objects.filter(payment_status='PAID').aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        monthly_revenue = Order.objects.filter(payment_status='PAID', created_at__gte=thirty_days_ago).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        # Counts
        total_orders = Order.objects.count()
        total_products = Product.objects.filter(is_active=True).count()
        total_customers = User.objects.filter(role='CUSTOMER', is_active=True).count()

        # Status breakdown
        status_counts = {
            "pending": Order.objects.filter(status='PENDING').count(),
            "confirmed": Order.objects.filter(status='CONFIRMED').count(),
            "shipped": Order.objects.filter(status='SHIPPED').count(),
            "out_for_delivery": Order.objects.filter(status='OUT_FOR_DELIVERY').count(),
            "delivered": Order.objects.filter(status='DELIVERED').count(),
            "cancelled": Order.objects.filter(status='CANCELLED').count(),
        }

        # Recent 5 orders
        recent_orders = []
        for o in Order.objects.select_related('customer').order_by('-created_at')[:5]:
            recent_orders.append({
                "id": o.order_number,
                "customer": o.shipping_name,
                "email": o.customer.email,
                "amount": float(o.total_amount),
                "status": o.get_status_display(),
                "date": o.created_at.strftime('%d %b')
            })

        data = {
            "total_revenue": float(total_revenue),
            "monthly_revenue": float(monthly_revenue),
            "total_orders": total_orders,
            "total_products": total_products,
            "total_customers": total_customers,
            "order_status_breakdown": status_counts,
            "recent_orders": recent_orders
        }
        return APIResponse.success(data=data, message="Admin dashboard summary retrieved.")

class AdminRevenueAnalyticsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        now = timezone.now()
        # Return 8 chart points over the last 30 days
        chart_data = []
        for i in range(7, -1, -1):
            day_start = (now - timedelta(days=i*4)).replace(hour=0, minute=0, second=0)
            day_end = day_start + timedelta(days=4)
            rev = Order.objects.filter(payment_status='PAID', created_at__gte=day_start, created_at__lt=day_end).aggregate(total=Sum('total_amount'))['total'] or 0
            chart_data.append({
                "label": day_start.strftime('%b %d'),
                "sales": float(rev),
                "orders_count": Order.objects.filter(created_at__gte=day_start, created_at__lt=day_end).count()
            })

        return APIResponse.success(data={"timeline": chart_data}, message="Revenue analytics retrieved.")

class AdminTopProductsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        top_items = OrderItem.objects.values('product__id', 'product__title', 'product__sku')\
            .annotate(total_sold=Sum('quantity'), revenue_generated=Sum('total_price'))\
            .order_by('-total_sold')[:10]

        data = [
            {
                "product_id": item['product__id'],
                "title": item['product__title'],
                "sku": item['product__sku'],
                "units_sold": item['total_sold'],
                "revenue": float(item['revenue_generated'] or 0)
            }
            for item in top_items
        ]
        return APIResponse.success(data=data, message="Top selling products retrieved.")

class AdminLowStockAlertsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        low_stock = Product.objects.filter(is_active=True, stock_quantity__lte=F('low_stock_threshold')).order_by('stock_quantity')
        data = [
            {
                "id": p.id,
                "title": p.title,
                "sku": p.sku,
                "current_stock": p.stock_quantity,
                "threshold": p.low_stock_threshold,
                "category": p.category.name if p.category else "Uncategorized"
            }
            for p in low_stock
        ]
        return APIResponse.success(data=data, message="Low stock alerts retrieved.")
