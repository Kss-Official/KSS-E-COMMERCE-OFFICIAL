from django.urls import path
from .views import (
    AdminDashboardSummaryView,
    AdminRevenueAnalyticsView,
    AdminTopProductsView,
    AdminLowStockAlertsView
)

urlpatterns = [
    path('dashboard/summary/', AdminDashboardSummaryView.as_view(), name='admin_dashboard_summary'),
    path('analytics/revenue/', AdminRevenueAnalyticsView.as_view(), name='admin_revenue_analytics'),
    path('analytics/top-products/', AdminTopProductsView.as_view(), name='admin_top_products'),
    path('analytics/low-stock/', AdminLowStockAlertsView.as_view(), name='admin_low_stock'),
]
