from rest_framework import serializers
from .models import (
    InboundReceipt, OutboundShipment, StockTransfer, ReturnedItem, WarehouseInventory,
)

class InboundReceiptSerializer(serializers.ModelSerializer):
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = InboundReceipt
        fields = ['id', 'receipt_id', 'supplier_name', 'item_title', 'sku', 'quantity', 'status', 'formatted_date', 'received_at']
        read_only_fields = ['id', 'receipt_id', 'received_at']

    def get_formatted_date(self, obj):
        return obj.received_at.strftime('%d %b, %I:%M %p')

class OutboundShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutboundShipment
        fields = ['id', 'shipment_id', 'destination_hub', 'item_title', 'sku', 'quantity', 'courier_partner', 'status', 'dispatched_at', 'created_at']
        read_only_fields = ['id', 'shipment_id', 'created_at']

class StockTransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransfer
        fields = ['id', 'transfer_id', 'source_warehouse', 'destination_warehouse', 'item_title', 'sku', 'quantity', 'status', 'created_at']
        read_only_fields = ['id', 'transfer_id', 'created_at']

class ReturnedItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturnedItem
        fields = ['id', 'return_id', 'order_number', 'customer_name', 'item_title', 'quantity', 'reason', 'condition', 'status', 'inspected_at']
        read_only_fields = ['id', 'return_id', 'inspected_at']

class WarehouseInventorySerializer(serializers.ModelSerializer):
    """Serialises with both model field names and the shorter aliases the
    warehouse InventoryTab already renders (bin / total / avail / ...)."""
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    name = serializers.CharField(source='product.title', read_only=True)
    sku = serializers.CharField(source='product.sku', read_only=True)
    category = serializers.CharField(source='product.category.name', read_only=True, default='')
    price = serializers.SerializerMethodField()
    bin = serializers.CharField(source='bin_location', required=False, allow_blank=True)
    total = serializers.IntegerField(source='total_units', required=False)
    reserved = serializers.IntegerField(source='reserved_units', required=False)
    transit = serializers.IntegerField(source='in_transit_units', required=False)
    avail = serializers.ReadOnlyField(source='available_units')
    available_units = serializers.ReadOnlyField()
    status = serializers.ReadOnlyField(source='stock_status')
    is_low_stock = serializers.ReadOnlyField()

    class Meta:
        model = WarehouseInventory
        fields = [
            'id', 'product', 'product_id', 'name', 'sku', 'category', 'price',
            'warehouse_code', 'bin', 'bin_location', 'total', 'total_units',
            'reserved', 'reserved_units', 'transit', 'in_transit_units',
            'avail', 'available_units', 'reorder_level', 'status', 'is_low_stock',
            'last_counted_at', 'updated_at',
        ]
        read_only_fields = ['id', 'updated_at']
        extra_kwargs = {
            'product': {'required': False},
            'bin_location': {'required': False},
            'total_units': {'required': False},
            'reserved_units': {'required': False},
            'in_transit_units': {'required': False},
        }

    def get_price(self, obj):
        return float(obj.product.current_price) if obj.product else 0.0
