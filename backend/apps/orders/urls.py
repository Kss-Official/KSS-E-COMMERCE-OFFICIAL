from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CheckoutView,
    CustomerOrderListView,
    CustomerOrderDetailView,
    CancelOrderView,
    InvoiceDownloadView,
    AdminOrderViewSet
)

admin_router = DefaultRouter()
admin_router.register('orders', AdminOrderViewSet, basename='admin_orders')

urlpatterns = [
    # Customer Checkout & Order Tracking
    path('checkout/', CheckoutView.as_view(), name='order_checkout'),
    path('my-orders/', CustomerOrderListView.as_view(), name='customer_order_list_alias'),

    # Admin Order Management (Direct endpoints for admin portal)
    path('admin/', AdminOrderViewSet.as_view({'get': 'list'}), name='admin_orders_direct'),
    path('admin/orders/', include(admin_router.urls)),

    path('<str:order_number>/', CustomerOrderDetailView.as_view(), name='customer_order_detail'),
    path('<str:order_number>/cancel/', CancelOrderView.as_view(), name='customer_order_cancel'),
    path('<str:order_number>/invoice/', InvoiceDownloadView.as_view(), name='order_invoice'),

    # Default customer list fallback
    path('', CustomerOrderListView.as_view(), name='customer_order_list'),
]
