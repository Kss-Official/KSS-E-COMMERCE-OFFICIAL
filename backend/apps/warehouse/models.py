import random
from django.db import models
from django.conf import settings

class InboundReceipt(models.Model):
    receipt_id = models.CharField(max_length=50, unique=True, db_index=True)
    supplier_name = models.CharField(max_length=200)
    item_title = models.CharField(max_length=255)
    sku = models.CharField(max_length=60, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=30, choices=(('Pending Verification', 'Pending Verification'), ('Verified', 'Verified')), default='Pending Verification')
    received_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_inbound_receipts'
        ordering = ['-received_at']

    def __str__(self):
        return f"{self.receipt_id} - {self.supplier_name} ({self.quantity} items)"

    @classmethod
    def generate_receipt_id(cls):
        num = ''.join(random.choices('0123456789', k=6))
        return f"RCPT-{num}"

class OutboundShipment(models.Model):
    shipment_id = models.CharField(max_length=50, unique=True, db_index=True)
    destination_hub = models.CharField(max_length=150)
    item_title = models.CharField(max_length=255)
    sku = models.CharField(max_length=60, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    courier_partner = models.CharField(max_length=100, default='BlueDart Express')
    status = models.CharField(
        max_length=40,
        choices=(
            ('Packing In Progress', 'Packing In Progress'),
            ('Ready for Pickup', 'Ready for Pickup'),
            ('Dispatched', 'Dispatched')
        ),
        default='Packing In Progress'
    )
    dispatched_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_outbound_shipments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.shipment_id} -> {self.destination_hub} ({self.status})"

    @classmethod
    def generate_shipment_id(cls):
        num = ''.join(random.choices('0123456789', k=6))
        return f"SHP-{num}"

class StockTransfer(models.Model):
    transfer_id = models.CharField(max_length=50, unique=True, db_index=True)
    source_warehouse = models.CharField(max_length=100, default='WH01 - Main Warehouse')
    destination_warehouse = models.CharField(max_length=100)
    item_title = models.CharField(max_length=255)
    sku = models.CharField(max_length=60, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(
        max_length=30,
        choices=(
            ('Initiated', 'Initiated'),
            ('In Transit', 'In Transit'),
            ('Completed', 'Completed')
        ),
        default='Initiated'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_stock_transfers'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transfer_id} ({self.source_warehouse} -> {self.destination_warehouse})"

class ReturnedItem(models.Model):
    return_id = models.CharField(max_length=50, unique=True, db_index=True)
    order_number = models.CharField(max_length=50)
    customer_name = models.CharField(max_length=150)
    item_title = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    reason = models.CharField(max_length=255)
    condition = models.CharField(max_length=50, choices=(('Good Condition', 'Good Condition'), ('Damaged', 'Damaged')), default='Good Condition')
    status = models.CharField(max_length=40, choices=(('Inspected', 'Inspected'), ('Restocked', 'Restocked'), ('Discarded', 'Discarded')), default='Inspected')
    inspected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_returned_items'
        ordering = ['-inspected_at']

    def __str__(self):
        return f"{self.return_id} - Order {self.order_number} ({self.status})"
