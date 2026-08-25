from django.db import models
from django.conf import settings
from apps.catalog.models import Product

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    title = models.CharField(max_length=150, blank=True)
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'buyzo_product_reviews'
        unique_together = ('product', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.rating}★ by {self.user.email} on {self.product.title}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate product rating
        reviews = self.product.reviews.all()
        count = reviews.count()
        if count > 0:
            avg = sum(r.rating for r in reviews) / count
            self.product.average_rating = round(avg, 2)
            self.product.review_count = count
            self.product.save(update_fields=['average_rating', 'review_count'])
