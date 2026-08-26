from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from core.response import APIResponse
from core.permissions import IsAdminUserRole
from apps.cart.views import get_or_create_cart
from apps.cart.models import CartItem
from .models import Coupon, CouponUsage
from .serializers import CouponSerializer, ApplyCouponSerializer, AdminCouponSerializer

class ApplyCouponView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ApplyCouponSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(message="Invalid coupon code provided.", errors=serializer.errors)

        code = serializer.validated_data['code'].upper().strip()
        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return APIResponse.error(message="Invalid or non-existent coupon code.")

        cart = get_or_create_cart(request)
        if not CartItem.objects.filter(cart=cart).exists():
            return APIResponse.error(message="Your cart is empty.")

        discount, msg = coupon.calculate_discount(cart.subtotal, user=request.user if request.user.is_authenticated else None)
        if discount <= 0:
            return APIResponse.error(message=msg)

        subtotal = float(cart.subtotal)
        discount_val = float(discount)
        tax = round((subtotal - discount_val) * 0.18, 2)
        shipping = 0.00 if (subtotal - discount_val) >= 499 else 49.00
        grand_total = round((subtotal - discount_val) + tax + shipping, 2)

        data = {
            "coupon_code": coupon.code,
            "discount_type": coupon.discount_type,
            "discount_amount": discount_val,
            "subtotal": subtotal,
            "tax": tax,
            "shipping": shipping,
            "grand_total": grand_total,
            "message": msg
        }
        return APIResponse.success(data=data, message=msg)

class RemoveCouponView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        cart = get_or_create_cart(request)
        subtotal = float(cart.subtotal)
        tax = round(subtotal * 0.18, 2)
        shipping = 0.00 if subtotal >= 499 or subtotal == 0 else 49.00
        grand_total = round(subtotal + tax + shipping, 2)

        data = {
            "subtotal": subtotal,
            "discount_amount": 0.00,
            "tax": tax,
            "shipping": shipping,
            "grand_total": grand_total
        }
        return APIResponse.success(data=data, message="Coupon removed.")

# ----------------- ADMIN COUPONS CRUD -----------------
class AdminCouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all().prefetch_related('usages').order_by('-created_at')
    serializer_class = AdminCouponSerializer
    permission_classes = [IsAdminUserRole]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Coupons retrieved successfully.")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            coupon = serializer.save()
            return APIResponse.success(
                data=AdminCouponSerializer(coupon).data,
                message="Coupon created successfully.",
                status_code=status.HTTP_201_CREATED
            )
        return APIResponse.error(message="Could not create coupon.", errors=serializer.errors)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(data=serializer.data, message="Coupon details retrieved.")

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            coupon = serializer.save()
            return APIResponse.success(data=AdminCouponSerializer(coupon).data, message="Coupon updated successfully.")
        return APIResponse.error(message="Could not update coupon.", errors=serializer.errors)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        code = instance.code
        instance.delete()
        return APIResponse.success(message=f"Coupon {code} deleted successfully.")

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='available')
    def available(self, request):
        """Live, in-window offers for the storefront's coupon picker."""
        now = timezone.now()
        coupons = Coupon.objects.filter(is_active=True, valid_from__lte=now, valid_to__gte=now)
        data = [
            {
                'id': coupon.id,
                'code': coupon.code,
                'discount_type': coupon.discount_type,
                'discount_value': float(coupon.discount_value),
                'max_discount_amount': float(coupon.max_discount_amount) if coupon.max_discount_amount else None,
                'min_order_value': float(coupon.min_order_value),
                'valid_to': coupon.valid_to.isoformat(),
                'expires_on': coupon.valid_to.strftime('%d %b %Y'),
                'label': (
                    f'{coupon.discount_value:.0f}% off' if coupon.discount_type == 'PERCENTAGE'
                    else f'Rs.{coupon.discount_value:.0f} off'
                ),
                'terms': (
                    f'On orders above Rs.{coupon.min_order_value:.0f}.'
                    if coupon.min_order_value else 'No minimum order value.'
                ) + (
                    f' Maximum discount Rs.{coupon.max_discount_amount:.0f}.'
                    if coupon.max_discount_amount else ''
                ),
            }
            for coupon in coupons.order_by('min_order_value')
        ]
        return APIResponse.success(data=data, message="Available offers retrieved.")
