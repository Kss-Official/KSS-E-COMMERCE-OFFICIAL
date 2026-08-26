from rest_framework import serializers
from apps.catalog.serializers import ProductListSerializer
from .models import Cart, CartItem, Wishlist, WishlistItem

class CartItemSerializer(serializers.ModelSerializer):
    product_details = ProductListSerializer(source='product', read_only=True)
    unit_price = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()

    # Direct frontend aliases
    name = serializers.CharField(source='product.title', read_only=True)
    image = serializers.SerializerMethodField()
    price = serializers.DecimalField(source='unit_price', max_digits=10, decimal_places=2, read_only=True)
    originalPrice = serializers.DecimalField(source='product.original_price', max_digits=10, decimal_places=2, read_only=True)
    discount = serializers.CharField(source='product.discount_percentage_display', read_only=True)
    selectedColor = serializers.CharField(source='selected_color', read_only=True)
    selectedSize = serializers.CharField(source='selected_size', read_only=True)
    productId = serializers.IntegerField(source='product.id', read_only=True)

    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'productId', 'variant', 'product_details', 'quantity',
            'selected_color', 'selected_size', 'selectedColor', 'selectedSize',
            'unit_price', 'total_price', 'name', 'image', 'price', 'originalPrice', 'discount'
        ]

    def get_image(self, obj):
        request = self.context.get('request')
        primary_img = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        if primary_img and primary_img.image:
            if request:
                return request.build_absolute_uri(primary_img.image.url)
            return primary_img.image.url
        return None

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    subtotal = serializers.ReadOnlyField()
    estimated_tax = serializers.SerializerMethodField()
    estimated_shipping = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id', 'items', 'total_items', 'subtotal',
            'estimated_tax', 'estimated_shipping', 'grand_total'
        ]

    def get_estimated_tax(self, obj):
        # 18% GST estimate
        return round(float(obj.subtotal) * 0.18, 2)

    def _free_delivery_threshold(self):
        # The Admin Settings tab owns this number, so read it rather than assume it.
        try:
            from apps.analytics.models import StoreSetting
            return float(StoreSetting.load().free_delivery_threshold)
        except Exception:
            return 499.0

    def get_estimated_shipping(self, obj):
        sub = float(obj.subtotal)
        if sub >= self._free_delivery_threshold() or sub == 0:
            return 0.00
        return 49.00

    def get_grand_total(self, obj):
        sub = float(obj.subtotal)
        tax = sub * 0.18
        ship = self.get_estimated_shipping(obj)
        return round(sub + tax + ship, 2)

class WishlistItemSerializer(serializers.ModelSerializer):
    product_details = ProductListSerializer(source='product', read_only=True)
    productId = serializers.IntegerField(source='product.id', read_only=True)
    name = serializers.CharField(source='product.title', read_only=True)
    image = serializers.SerializerMethodField()
    price = serializers.DecimalField(source='product.current_price', max_digits=10, decimal_places=2, read_only=True)
    originalPrice = serializers.DecimalField(source='product.original_price', max_digits=10, decimal_places=2, read_only=True)
    discount = serializers.CharField(source='product.discount_percentage_display', read_only=True)
    category = serializers.CharField(source='product.category.name', read_only=True)
    inStock = serializers.SerializerMethodField()
    deliveryDate = serializers.SerializerMethodField()

    class Meta:
        model = WishlistItem
        fields = [
            'id', 'product', 'productId', 'product_details', 'name', 'image', 'price',
            'originalPrice', 'discount', 'category', 'inStock', 'deliveryDate', 'created_at'
        ]

    def get_image(self, obj):
        request = self.context.get('request')
        primary_img = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        if primary_img and primary_img.image:
            if request:
                return request.build_absolute_uri(primary_img.image.url)
            return primary_img.image.url
        return None

    def get_inStock(self, obj):
        return obj.product.stock_quantity > 0

    def get_deliveryDate(self, obj):
        return "Delivery in 2-4 days"

class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ['id', 'items', 'item_count']

    def get_item_count(self, obj):
        return obj.items.count()
