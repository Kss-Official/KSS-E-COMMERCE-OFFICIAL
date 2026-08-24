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
    path('', CustomerOrderListView.as_view(), name='customer_order_list'),
    path('<str:order_number>/', CustomerOrderDetailView.as_view(), name='customer_order_detail'),
    path('<str:order_number>/cancel/', CancelOrderView.as_view(), name='customer_order_cancel'),
    path('<str:order_number>/invoice/', InvoiceDownloadView.as_view(), name='order_invoice'),

    # Admin Order Management
    path('admin/', include(admin_router.urls)),
]
