from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InboundReceiptViewSet,
    OutboundShipmentViewSet,
    StockTransferViewSet,
    ReturnedItemViewSet,
    WarehouseInventoryOverviewView
)

router = DefaultRouter()
router.register('inbound', InboundReceiptViewSet, basename='warehouse_inbound')
router.register('outbound', OutboundShipmentViewSet, basename='warehouse_outbound')
router.register('transfers', StockTransferViewSet, basename='warehouse_transfers')
router.register('returns', ReturnedItemViewSet, basename='warehouse_returns')

urlpatterns = [
    path('inventory-overview/', WarehouseInventoryOverviewView.as_view(), name='warehouse_inventory_overview'),
    path('', include(router.urls)),
]
