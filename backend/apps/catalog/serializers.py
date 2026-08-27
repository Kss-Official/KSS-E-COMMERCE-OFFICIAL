import uuid
from decimal import Decimal

from rest_framework import serializers
from django.conf import settings
from django.utils.text import slugify
from .models import Category, SubCategory, Brand, Product, ProductImage, ProductVariant, HeroBanner

class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'category', 'name', 'slug', 'description', 'is_active']

class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)
    product_count = serializers.SerializerMethodField()
    svg = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'svg', 'icon_name', 'display_order', 'is_active', 'subcategories', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

    def _get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f"{getattr(settings, 'BACKEND_HOST_URL', 'http://127.0.0.1:8000')}{obj.image.url}"
        return None

    def get_image(self, obj):
        return self._get_image_url(obj)

    def get_svg(self, obj):
        return self._get_image_url(obj)

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'website', 'is_active']

class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image', 'alt_text', 'is_primary', 'display_order']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f"{getattr(settings, 'BACKEND_HOST_URL', 'http://127.0.0.1:8000')}{obj.image.url}"
        return None

class ProductVariantSerializer(serializers.ModelSerializer):
    calculated_price = serializers.ReadOnlyField()

    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'size', 'color', 'sku', 'price_delta', 'calculated_price', 'stock_quantity', 'image']

class ProductListSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='title', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    category = serializers.CharField(source='category.name', read_only=True)
    brand = serializers.CharField(source='brand.name', read_only=True)
    subcategory = serializers.CharField(source='subcategory.name', read_only=True, default='')
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True, default='')
    
    price = serializers.SerializerMethodField()
    originalPrice = serializers.SerializerMethodField()
    discount = serializers.SerializerMethodField()
    discountRange = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    reviews = serializers.IntegerField(source='review_count', read_only=True)
    reviewsCount = serializers.IntegerField(source='review_count', read_only=True)
    
    image = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    current_price = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    popularity = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'name', 'slug', 'sku', 'category', 'category_name',
            'subcategory', 'subcategory_name',
            'brand', 'brand_name', 'base_price', 'discount_price', 'price',
            'originalPrice', 'current_price', 'discount', 'discount_percentage',
            'discountRange', 'stock_quantity', 'rating', 'average_rating',
            'reviews', 'reviewsCount', 'review_count', 'is_in_stock', 'is_featured',
            'is_new_arrival', 'is_deal_of_day', 'popularity', 'image', 'primary_image'
        ]

    def get_price(self, obj):
        return float(obj.current_price)

    def get_originalPrice(self, obj):
        return float(obj.base_price)

    def get_discount(self, obj):
        return obj.discount_percentage or ""

    def get_discountRange(self, obj):
        if obj.discount_price and obj.base_price > 0:
            pct = ((obj.base_price - obj.discount_price) / obj.base_price) * 100
            if pct >= 80:
                return '80% & above'
            elif pct >= 60:
                return '60% - 80%'
            elif pct >= 40:
                return '40% - 60%'
            elif pct >= 20:
                return '20% - 40%'
            else:
                return '10% - 20%'
        return '10% - 20%'

    def get_rating(self, obj):
        return float(obj.average_rating)

    def get_popularity(self, obj):
        return min(99, 80 + (obj.id * 3) % 20)

    def _get_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img and img.image:
            request = self.context.get('request')
            if request:
                res = request.build_absolute_uri(img.image.url)
            else:
                res = f"{getattr(settings, 'BACKEND_HOST_URL', 'http://127.0.0.1:8000')}{img.image.url}"
            if '/media/media/' in res:
                res = res.replace('/media/media/', '/media/')
            return res
        return None

    def get_image(self, obj):
        return self._get_image(_obj := obj)

    def get_primary_image(self, obj):
        return self._get_image(obj)

class ProductDetailSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='title', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    price = serializers.SerializerMethodField()
    originalPrice = serializers.SerializerMethodField()
    discount = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    reviewsCount = serializers.IntegerField(source='review_count', read_only=True)
    soldCount = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    galleryThumbnails = serializers.SerializerMethodField()
    features = serializers.SerializerMethodField()
    colors = serializers.SerializerMethodField()

    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    current_price = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    related_products = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'name', 'slug', 'sku', 'description', 'category',
            'category_name', 'subcategory', 'brand', 'brand_name', 'base_price',
            'discount_price', 'price', 'originalPrice', 'current_price', 'discount',
            'discount_percentage', 'stock_quantity', 'rating', 'average_rating',
            'reviewsCount', 'review_count', 'soldCount', 'is_in_stock', 'is_featured',
            'is_new_arrival', 'is_deal_of_day', 'specifications', 'features', 'colors',
            'image', 'galleryThumbnails', 'images', 'variants', 'related_products', 'created_at'
        ]

    def get_price(self, obj):
        return float(obj.current_price)

    def get_originalPrice(self, obj):
        return float(obj.base_price)

    def get_discount(self, obj):
        return obj.discount_percentage or ""

    def get_rating(self, obj):
        return float(obj.average_rating)

    def get_soldCount(self, obj):
        return f"{min(5000, 100 * obj.id)}+"

    def get_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img and img.image:
            request = self.context.get('request')
            if request:
                res = request.build_absolute_uri(img.image.url)
            else:
                res = f"http://127.0.0.1:8000{img.image.url}"
            if '/media/media/' in res:
                res = res.replace('/media/media/', '/media/')
            return res
        return None

    def get_galleryThumbnails(self, obj):
        res = []
        request = self.context.get('request')
        for img in obj.images.all():
            if img.image:
                url = request.build_absolute_uri(img.image.url) if request else f"http://127.0.0.1:8000{img.image.url}"
                res.append(url)
        if not res:
            main = self.get_image(obj)
            if main:
                res.append(main)
        return res

    def get_features(self, obj):
        if obj.specifications and isinstance(obj.specifications, dict):
            return list(obj.specifications.values())
        return ["Premium Build Quality", "1 Year Brand Warranty", "Fast Delivery"]

    def get_colors(self, obj):
        return [
            {"name": "Teal Green", "hex": "#0f766e"},
            {"name": "Royal Blue", "hex": "#2563eb"},
            {"name": "Silver Gray", "hex": "#9ca3af"},
            {"name": "Matte Black", "hex": "#1f2937"}
        ]

    def get_related_products(self, obj):
        related = Product.objects.filter(category=obj.category, is_active=True).exclude(id=obj.id)[:6]
        return ProductListSerializer(related, many=True, context=self.context).data

class HeroBannerSerializer(serializers.ModelSerializer):
    background_image_url = serializers.SerializerMethodField()

    class Meta:
        model = HeroBanner
        fields = [
            'id', 'title', 'subtitle', 'primary_button_text', 'primary_button_link',
            'secondary_button_text', 'secondary_button_link', 'background_image',
            'background_image_url', 'is_active', 'display_order'
        ]

    def get_background_image_url(self, obj):
        if obj.background_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.background_image.url)
            return f"http://127.0.0.1:8000{obj.background_image.url}"
        return None

class AdminProductCreateUpdateSerializer(serializers.ModelSerializer):
    # The admin "Add Product" form only asks for the essentials, so the columns a
    # product cannot live without are derived here instead of being demanded of
    # the operator. It also speaks the storefront's price vocabulary
    # (current/original) which maps onto discount_price/base_price.
    sku = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    base_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, write_only=True)
    original_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, write_only=True)

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['id', 'slug', 'average_rating', 'review_count', 'created_at', 'updated_at']

    def validate(self, attrs):
        # Translate the storefront aliases onto the real columns.
        selling = attrs.pop('current_price', None)
        mrp = attrs.pop('original_price', None)
        if mrp is not None and not attrs.get('base_price'):
            attrs['base_price'] = mrp
        if selling is not None:
            if not attrs.get('base_price') and not getattr(self.instance, 'base_price', None):
                attrs['base_price'] = selling
            attrs['discount_price'] = selling

        title = attrs.get('title') or getattr(self.instance, 'title', '') or 'Product'

        if not attrs.get('sku') and not getattr(self.instance, 'sku', None):
            base = slugify(title)[:24].upper().replace('-', '') or 'PROD'
            candidate = f"{base}-{uuid.uuid4().hex[:6].upper()}"
            while Product.objects.filter(sku=candidate).exists():
                candidate = f"{base}-{uuid.uuid4().hex[:6].upper()}"
            attrs['sku'] = candidate

        if not attrs.get('description') and not getattr(self.instance, 'description', None):
            attrs['description'] = f"{title} available on BuyZo."

        if attrs.get('base_price') in (None, '') and getattr(self.instance, 'base_price', None) in (None, ''):
            attrs['base_price'] = Decimal('0.00')

        return attrs

