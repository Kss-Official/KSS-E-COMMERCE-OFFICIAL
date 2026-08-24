from rest_framework import serializers
from .models import InboundReceipt, OutboundShipment, StockTransfer, ReturnedItem

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
