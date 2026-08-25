from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplyCouponView, RemoveCouponView, AdminCouponViewSet

router = DefaultRouter()
router.register('admin/coupons', AdminCouponViewSet, basename='admin_coupon')

urlpatterns = [
    path('apply/', ApplyCouponView.as_view(), name='coupon_apply'),
    path('remove/', RemoveCouponView.as_view(), name='coupon_remove'),
    path('', include(router.urls)),
]
