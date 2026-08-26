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

class WarehouseInventory(models.Model):
    """
    Bin-level stock ledger for the warehouse portal.

    ``Product.stock_quantity`` is the sellable figure the storefront reads;
    this model adds the physical detail the warehouse floor needs - where the
    stock sits and how much of it is already promised to open orders or moving
    between hubs. ``available_units`` is what an operator can actually pick.
    """
    product = models.OneToOneField(
        'catalog.Product', on_delete=models.CASCADE, related_name='warehouse_inventory'
    )
    warehouse_code = models.CharField(max_length=40, default='WH01')
    bin_location = models.CharField(max_length=30, blank=True, db_index=True)
    total_units = models.PositiveIntegerField(default=0)
    reserved_units = models.PositiveIntegerField(default=0)
    in_transit_units = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=10)
    last_counted_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'buyzo_warehouse_inventory'
        verbose_name_plural = 'Warehouse inventory'
        ordering = ['bin_location', 'id']

    def __str__(self):
        return f"{self.product.sku} @ {self.bin_location or 'unassigned'} ({self.total_units} units)"

    @property
    def available_units(self):
        return max(0, self.total_units - self.reserved_units)

    @property
    def is_low_stock(self):
        return self.available_units <= self.reorder_level

    @property
    def stock_status(self):
        if self.available_units == 0:
            return 'Out of Stock'
        if self.is_low_stock:
            return 'Low Stock'
        return 'In Stock'
