from django.db import models
from django.conf import settings
from apps.catalog.models import Product, ProductVariant

class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='cart')
    session_key = models.CharField(max_length=64, null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'buyzo_carts'

    def __str__(self):
        if self.user:
            return f"Cart of {self.user.email}"
        return f"Guest Cart ({self.session_key})"

    @property
    def total_items(self):
        items = self.items.all() if hasattr(self, 'items') else CartItem.objects.filter(cart=self)
        return sum(item.quantity for item in items)

    @property
    def subtotal(self):
        items = self.items.all() if hasattr(self, 'items') else CartItem.objects.filter(cart=self)
        return sum(item.total_price for item in items)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    selected_color = models.CharField(max_length=50, blank=True, default='')
    selected_size = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'buyzo_cart_items'
        unique_together = ('cart', 'product', 'variant', 'selected_color', 'selected_size')

    def __str__(self):
        return f"{self.quantity}x {self.product.title}"

    @property
    def unit_price(self):
        if self.variant:
            return self.variant.calculated_price
        return self.product.current_price

    @property
    def total_price(self):
        return self.unit_price * self.quantity

class Wishlist(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_wishlists'

    def __str__(self):
        return f"Wishlist of {self.user.email}"

class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_wishlist_items'
        unique_together = ('wishlist', 'product')

    def __str__(self):
        return f"{self.product.title} in wishlist"
