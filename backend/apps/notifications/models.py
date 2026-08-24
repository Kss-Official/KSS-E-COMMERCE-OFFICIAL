from django.db import models
from django.conf import settings

class InAppNotification(models.Model):
    TYPE_CHOICES = (
        ('ORDER_UPDATE', 'Order Update'),
        ('PROMOTION', 'Promotion / Offer'),
        ('SYSTEM', 'System Alert'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='ORDER_UPDATE')
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} for {self.user.email} ({'Read' if self.is_read else 'Unread'})"
