from django.conf import settings
from django.db import models


class StoreSetting(models.Model):
    """
    Single row holding the storefront-wide preferences the Admin portal edits.

    Everything the Settings tab shows lives here rather than in the client, so a
    change made by one administrator is visible to the next one who signs in.
    """

    CURRENCY_CHOICES = [
        ('INR', 'INR (Rupee)'),
        ('USD', 'USD (Dollar)'),
        ('EUR', 'EUR (Euro)'),
        ('GBP', 'GBP (Pound)'),
    ]

    store_name = models.CharField(max_length=120, default='BuyZo')
    tagline = models.CharField(max_length=200, default='Shop More, Save More')
    support_email = models.EmailField(default='support@buyzo.com')
    support_phone = models.CharField(max_length=20, default='+91 98765 43210')
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='INR')

    # Operational switches
    auto_approve_orders = models.BooleanField(default=True)
    auto_approve_limit = models.DecimalField(max_digits=10, decimal_places=2, default=5000)
    email_low_stock_alerts = models.BooleanField(default=True)

    # Storefront rules
    free_delivery_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=499)
    low_stock_threshold = models.PositiveIntegerField(default=10)
    cod_enabled = models.BooleanField(default=True)
    maintenance_mode = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='store_setting_updates'
    )

    class Meta:
        db_table = 'store_settings'
        verbose_name = 'Store Setting'
        verbose_name_plural = 'Store Settings'

    def __str__(self):
        return f"{self.store_name} settings"

    @classmethod
    def load(cls):
        """Fetch the one settings row, creating it with defaults on first use."""
        obj = cls.objects.order_by('id').first()
        if obj is None:
            obj = cls.objects.create()
        return obj

    def save(self, *args, **kwargs):
        # Guard the singleton: any save always lands on the first row.
        if not self.pk:
            existing = StoreSetting.objects.order_by('id').first()
            if existing:
                self.pk = existing.pk
        return super().save(*args, **kwargs)
