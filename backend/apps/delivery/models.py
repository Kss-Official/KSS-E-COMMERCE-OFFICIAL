import random
from django.db import models
from django.conf import settings
from apps.orders.models import Order

class DeliveryTask(models.Model):
    STAGE_CHOICES = (
        (1, 'Picked up from Warehouse'),
        (2, 'On the Way'),
        (3, 'Arrived at Destination'),
        (4, 'Delivered'),
        (5, 'Delivery Failed / Rescheduled'),
    )

    FAILED_REASON_CHOICES = (
        ('CUSTOMER_UNAVAILABLE', 'Customer Unavailable / Unreachable'),
        ('WRONG_ADDRESS', 'Incorrect or Incomplete Address'),
        ('CUSTOMER_REJECTED', 'Customer Refused Delivery'),
        ('PARCEL_DAMAGED', 'Parcel Damaged in Transit'),
        ('COD_NOT_READY', 'COD Payment Not Ready'),
        ('CUSTOMER_REQUESTED_RESCHEDULE', 'Customer Requested Reschedule'),
        ('OTHER', 'Other Reason'),
    )

    task_id = models.CharField(max_length=50, unique=True, db_index=True)
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='delivery_tasks')
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery_task')

    recipient_name = models.CharField(max_length=150)
    recipient_phone = models.CharField(max_length=20)
    delivery_address = models.CharField(max_length=255)

    pickup_latitude = models.DecimalField(max_digits=9, decimal_places=6, default=19.088000)
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6, default=72.860000)
    destination_latitude = models.DecimalField(max_digits=9, decimal_places=6, default=19.076000)
    destination_longitude = models.DecimalField(max_digits=9, decimal_places=6, default=72.877700)
    
    cod_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_cod_collected = models.BooleanField(default=False)
    
    current_stage = models.PositiveSmallIntegerField(choices=STAGE_CHOICES, default=1)
    status = models.CharField(max_length=30, default='IN_TRANSIT') # ASSIGNED, IN_TRANSIT, DELIVERED, FAILED
    
    failed_reason = models.CharField(max_length=50, choices=FAILED_REASON_CHOICES, blank=True, null=True)
    rescheduled_date = models.DateTimeField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_delivery_tasks'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['agent', 'status']),
            models.Index(fields=['status', '-created_at']),
        ]

    def __str__(self):
        return f"{self.task_id} for {self.order.order_number} ({self.get_current_stage_display()})"

    @classmethod
    def generate_task_id(cls):
        num = ''.join(random.choices('0123456789', k=5))
        return f"TASK-{num}"


class AgentEarnings(models.Model):
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='earnings', db_index=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='agent_earnings', db_index=True)
    base_fee = models.DecimalField(max_digits=8, decimal_places=2, default=50.00)
    tip = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    incentive = models.DecimalField(max_digits=8, decimal_places=2, default=10.00)
    total_earned = models.DecimalField(max_digits=8, decimal_places=2, default=60.00)
    earned_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'buyzo_agent_earnings'
        ordering = ['-earned_at']
        indexes = [
            models.Index(fields=['agent', '-earned_at']),
        ]

    def __str__(self):
        return f"{self.agent.email} earned ₹{self.total_earned} from {self.order.order_number}"


class DeliveryAgentShift(models.Model):
    STATUS_CHOICES = (
        ('OFFLINE', 'Offline'),
        ('ONLINE', 'Online'),
        ('ON_BREAK', 'On Break'),
    )

    agent = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='delivery_shift')
    shift_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OFFLINE')
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    total_online_minutes = models.IntegerField(default=0)
    
    current_latitude = models.DecimalField(max_digits=9, decimal_places=6, default=19.076000)
    current_longitude = models.DecimalField(max_digits=9, decimal_places=6, default=72.877700)
    last_location_update = models.DateTimeField(auto_now=True)

    cash_in_hand = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_cash_limit = models.DecimalField(max_digits=10, decimal_places=2, default=10000.00)

    class Meta:
        db_table = 'buyzo_delivery_agent_shifts'

    def __str__(self):
        return f"{self.agent.email} - {self.shift_status}"


class DeliveryCashDeposit(models.Model):
    deposit_id = models.CharField(max_length=50, unique=True, db_index=True)
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cash_deposits')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_mode = models.CharField(max_length=30, default='HUB_COUNTER')
    status = models.CharField(max_length=20, default='COMPLETED')
    notes = models.TextField(blank=True)
    deposited_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_delivery_cash_deposits'
        ordering = ['-deposited_at']

    def __str__(self):
        return f"Deposit {self.deposit_id} - ₹{self.amount} by {self.agent.email}"


class DeliverySOSAlert(models.Model):
    STATUS_CHOICES = (
        ('TRIGGERED', 'Emergency Triggered'),
        ('IN_PROGRESS', 'Responder Dispatched'),
        ('RESOLVED', 'Resolved'),
    )

    alert_id = models.CharField(max_length=50, unique=True, db_index=True)
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sos_alerts')
    reason = models.CharField(max_length=100, default='ACCIDENT')
    description = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TRIGGERED')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'buyzo_delivery_sos_alerts'
        ordering = ['-created_at']

    def __str__(self):
        return f"SOS {self.alert_id} ({self.reason}) by {self.agent.email}"


class DeliveryCashTransaction(models.Model):
    TRANSACTION_TYPE_CHOICES = (
        ('COLLECTION', 'Cash Collected from COD Delivery'),
        ('DEPOSIT', 'Cash Deposited at Hub'),
        ('REFUND', 'Refund / Return Adjustment'),
        ('ADJUSTMENT', 'Admin Balance Adjustment'),
    )

    transaction_id = models.CharField(max_length=50, unique=True, db_index=True)
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cash_transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    delivery_task = models.ForeignKey(DeliveryTask, on_delete=models.SET_NULL, null=True, blank=True, related_name='cash_transactions')
    deposit = models.ForeignKey(DeliveryCashDeposit, on_delete=models.SET_NULL, null=True, blank=True, related_name='cash_transactions')
    
    cash_in_hand_before = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    cash_in_hand_after = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_delivery_cash_transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"CashTx {self.transaction_id} ({self.transaction_type}) - ₹{self.amount} for {self.agent.email}"


class DeliveryCashHandover(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Handover Confirmation'),
        ('CONFIRMED', 'Confirmed & Received'),
        ('DISPUTED', 'Disputed Amount Discrepancy'),
        ('REJECTED', 'Rejected'),
    )

    handover_id = models.CharField(max_length=50, unique=True, db_index=True)
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cash_handovers')
    warehouse_staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_cash_handovers')

    requested_amount = models.DecimalField(max_digits=10, decimal_places=2)
    confirmed_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    dispute_reason = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'buyzo_delivery_cash_handovers'
        ordering = ['-created_at']

    def __str__(self):
        return f"Handover {self.handover_id} ({self.status}) - ₹{self.requested_amount} by {self.agent.email}"


