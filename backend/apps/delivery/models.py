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

    task_id = models.CharField(max_length=50, unique=True, db_index=True)
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='delivery_tasks')
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery_task')

    recipient_name = models.CharField(max_length=150)
    recipient_phone = models.CharField(max_length=20)
    delivery_address = models.CharField(max_length=255)
    
    cod_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_cod_collected = models.BooleanField(default=False)
    
    current_stage = models.PositiveSmallIntegerField(choices=STAGE_CHOICES, default=1)
    status = models.CharField(max_length=30, default='IN_TRANSIT') # ASSIGNED, IN_TRANSIT, DELIVERED, FAILED
    
    notes = models.TextField(blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_delivery_tasks'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.task_id} for {self.order.order_number} ({self.get_current_stage_display()})"

    @classmethod
    def generate_task_id(cls):
        num = ''.join(random.choices('0123456789', k=5))
        return f"TASK-{num}"

class AgentEarnings(models.Model):
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='earnings')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='agent_earnings')
    base_fee = models.DecimalField(max_digits=8, decimal_places=2, default=50.00)
    tip = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    incentive = models.DecimalField(max_digits=8, decimal_places=2, default=10.00)
    total_earned = models.DecimalField(max_digits=8, decimal_places=2, default=60.00)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_agent_earnings'
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.agent.email} earned ₹{self.total_earned} from {self.order.order_number}"
