from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action

from core.response import APIResponse
from core.permissions import IsWarehouseStaff
from apps.catalog.models import Product
from .models import InboundReceipt, OutboundShipment, StockTransfer, ReturnedItem
from .serializers import (
    InboundReceiptSerializer,
    OutboundShipmentSerializer,
    StockTransferSerializer,
    ReturnedItemSerializer
)

class InboundReceiptViewSet(viewsets.ModelViewSet):
    queryset = InboundReceipt.objects.all().order_by('-received_at')
    serializer_class = InboundReceiptSerializer
    permission_classes = [IsWarehouseStaff]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            receipt = serializer.save(receipt_id=InboundReceipt.generate_receipt_id(), received_by=self.request.user)
            return APIResponse.success(
                data=InboundReceiptSerializer(receipt).data,
                message="Inbound receipt created successfully.",
                status_code=status.HTTP_201_CREATED
            )
        return APIResponse.error(message="Could not create receipt.", errors=serializer.errors)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Inbound receipts retrieved.")

    @action(detail=True, methods=['patch'], url_path='verify')
    def verify(self, request, pk=None):
        receipt = self.get_object()
        receipt.status = 'Verified'
        receipt.save(update_fields=['status'])

        # Increment product stock if SKU matches
        if receipt.sku:
            product = Product.objects.filter(sku=receipt.sku).first()
            if product:
                product.stock_quantity += receipt.quantity
                product.save(update_fields=['stock_quantity'])

        return APIResponse.success(data=InboundReceiptSerializer(receipt).data, message="Receipt verified and stock updated.")

class OutboundShipmentViewSet(viewsets.ModelViewSet):
    queryset = OutboundShipment.objects.all().order_by('-created_at')
    serializer_class = OutboundShipmentSerializer
    permission_classes = [IsWarehouseStaff]

    def perform_create(self, serializer):
        serializer.save(shipment_id=OutboundShipment.generate_shipment_id())

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Outbound shipments retrieved.")

    @action(detail=True, methods=['patch'], url_path='dispatch')
    def dispatch(self, request, pk=None):
        shipment = self.get_object()
        shipment.status = 'Dispatched'
        shipment.dispatched_at = timezone.now()
        shipment.save(update_fields=['status', 'dispatched_at'])
        return APIResponse.success(data=OutboundShipmentSerializer(shipment).data, message="Shipment dispatched.")

class StockTransferViewSet(viewsets.ModelViewSet):
    queryset = StockTransfer.objects.all().order_by('-created_at')
    serializer_class = StockTransferSerializer
    permission_classes = [IsWarehouseStaff]

    def perform_create(self, serializer):
        serializer.save(transfer_id=f"TRF-{timezone.now().strftime('%Y%m%d%H%M')}")

class ReturnedItemViewSet(viewsets.ModelViewSet):
    queryset = ReturnedItem.objects.all().order_by('-inspected_at')
    serializer_class = ReturnedItemSerializer
    permission_classes = [IsWarehouseStaff]

    def perform_create(self, serializer):
        serializer.save(return_id=f"RET-{timezone.now().strftime('%Y%m%d%H%M')}")

class WarehouseInventoryOverviewView(APIView):
    permission_classes = [IsWarehouseStaff]

    def get(self, request):
        products = Product.objects.filter(is_active=True).values('id', 'title', 'sku', 'stock_quantity', 'low_stock_threshold')
        
        total_items = sum(p['stock_quantity'] for p in products)
        low_stock_count = sum(1 for p in products if p['stock_quantity'] <= p['low_stock_threshold'])

        data = {
            "warehouse_code": "WH01 - Central Hub",
            "total_skus": len(products),
            "total_stock_units": total_items,
            "low_stock_skus": low_stock_count,
            "inventory_items": list(products)
        }
        return APIResponse.success(data=data, message="Warehouse inventory overview retrieved.")
