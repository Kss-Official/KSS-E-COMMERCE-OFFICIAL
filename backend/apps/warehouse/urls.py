from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InboundReceiptViewSet,
    OutboundShipmentViewSet,
    StockTransferViewSet,
    ReturnedItemViewSet,
    WarehouseInventoryViewSet,
    WarehouseInventoryOverviewView,
    WarehouseDashboardSummaryView,
    WarehouseAlertsView,
    WarehouseReportsView,
)

router = DefaultRouter()
router.register('inbound', InboundReceiptViewSet, basename='warehouse_inbound')
router.register('outbound', OutboundShipmentViewSet, basename='warehouse_outbound')
router.register('transfers', StockTransferViewSet, basename='warehouse_transfers')
router.register('returns', ReturnedItemViewSet, basename='warehouse_returns')
router.register('inventory', WarehouseInventoryViewSet, basename='warehouse_inventory')

urlpatterns = [
    path('inventory-overview/', WarehouseInventoryOverviewView.as_view(), name='warehouse_inventory_overview'),
    path('dashboard/summary/', WarehouseDashboardSummaryView.as_view(), name='warehouse_dashboard_summary'),
    path('alerts/', WarehouseAlertsView.as_view(), name='warehouse_alerts'),
    path('reports/', WarehouseReportsView.as_view(), name='warehouse_reports'),
    path('', include(router.urls)),
]
