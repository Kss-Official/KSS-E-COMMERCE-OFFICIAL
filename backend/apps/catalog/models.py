from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    icon_name = models.CharField(max_length=50, blank=True, help_text="Lucide icon name if applicable")
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_categories'
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class SubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_subcategories'
        verbose_name_plural = 'SubCategories'
        unique_together = ('category', 'slug')
        ordering = ['name']

    def __str__(self):
        return f"{self.category.name} > {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    logo = models.ImageField(upload_to='brands/', null=True, blank=True)
    website = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'buyzo_brands'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Product(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    sku = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    subcategory = models.ForeignKey(SubCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')

    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=10)

    is_featured = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_deal_of_day = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    review_count = models.PositiveIntegerField(default=0)

    tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated keywords for search")
    specifications = models.JSONField(default=dict, blank=True, help_text="Key-value technical specs")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'buyzo_products'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.sku})"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def current_price(self):
        return self.discount_price if self.discount_price and self.discount_price > 0 else self.base_price

    @property
    def discount_percentage(self):
        if self.discount_price and self.base_price > 0 and self.discount_price < self.base_price:
            pct = round(((self.base_price - self.discount_price) / self.base_price) * 100)
            return f"{pct}% OFF"
        return None

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=150, blank=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_product_images'
        ordering = ['-is_primary', 'display_order', 'id']

    def __str__(self):
        return f"Image for {self.product.title}"

    def save(self, *args, **kwargs):
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    sku = models.CharField(max_length=60, unique=True)
    price_delta = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Additional cost or discount compared to base price")
    stock_quantity = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='variants/', null=True, blank=True)

    class Meta:
        db_table = 'buyzo_product_variants'

    def __str__(self):
        variant_desc = []
        if self.size:
            variant_desc.append(f"Size: {self.size}")
        if self.color:
            variant_desc.append(f"Color: {self.color}")
        return f"{self.product.title} - {', '.join(variant_desc) or self.sku}"

    @property
    def calculated_price(self):
        return self.product.current_price + self.price_delta

class HeroBanner(models.Model):
    title = models.CharField(max_length=200, default="Discover.\nShop. Save More.")
    subtitle = models.TextField(default="Top brands, best prices & exclusive offers on every purchase.")
    primary_button_text = models.CharField(max_length=50, default="Shop Now")
    primary_button_link = models.CharField(max_length=100, default="electronics")
    secondary_button_text = models.CharField(max_length=50, default="Explore Offers")
    secondary_button_link = models.CharField(max_length=100, default="deals")
    background_image = models.ImageField(upload_to='banners/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyzo_hero_banners'
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return self.title.replace('\n', ' ')

