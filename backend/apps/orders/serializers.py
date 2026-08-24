from rest_framework import serializers
from .models import Order, OrderItem, OrderTrackingMilestone

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'variant', 'product_title', 'sku',
            'product_image', 'selected_color', 'selected_size',
            'unit_price', 'quantity', 'total_price'
        ]

class OrderTrackingMilestoneSerializer(serializers.ModelSerializer):
    formatted_time = serializers.SerializerMethodField()

    class Meta:
        model = OrderTrackingMilestone
        fields = ['id', 'step_title', 'description', 'timestamp', 'formatted_time', 'is_completed', 'is_active', 'order_index']

    def get_formatted_time(self, obj):
        return obj.timestamp.strftime('%d %b, %I:%M %p')

class OrderListSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    milestones = OrderTrackingMilestoneSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    primary_product_name = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_method',
            'payment_status', 'subtotal', 'discount_amount',
            'tax_amount', 'shipping_amount', 'total_amount', 'item_count',
            'primary_image', 'primary_product_name', 'formatted_date',
            'delivery_otp', 'items', 'milestones', 'created_at'
        ]

    def get_item_count(self, obj):
        return obj.items.count()

    def get_primary_image(self, obj):
        first_item = obj.items.first()
        return first_item.product_image if first_item else None

    def get_primary_product_name(self, obj):
        first_item = obj.items.first()
        return first_item.product_title if first_item else "BuyZo Package"

    def get_formatted_date(self, obj):
        return f"Placed on {obj.created_at.strftime('%d %b %Y')}"

class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    milestones = OrderTrackingMilestoneSerializer(many=True, read_only=True)
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_method',
            'payment_status', 'shipping_name', 'shipping_phone',
            'shipping_email', 'shipping_address', 'shipping_city',
            'shipping_state', 'shipping_pincode', 'shipping_country',
            'subtotal', 'coupon_code', 'discount_amount', 'tax_amount',
            'shipping_amount', 'total_amount', 'delivery_otp', 'notes',
            'items', 'milestones', 'formatted_date', 'created_at', 'updated_at'
        ]

    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%d %b %Y, %I:%M %p')

class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.IntegerField(required=False, allow_null=True)
    # Inline address fields if not selecting saved address
    recipient_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    street_address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    postal_code = serializers.CharField(required=False, allow_blank=True)

    payment_method = serializers.ChoiceField(choices=['MOCK', 'COD', 'RAZORPAY', 'STRIPE'], default='MOCK')
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

class AdminOrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)
    notify_customer = serializers.BooleanField(default=True)
