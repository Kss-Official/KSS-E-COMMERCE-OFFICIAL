from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.permissions import AllowAny
from .views import ApplyCouponView, RemoveCouponView, AdminCouponViewSet

router = DefaultRouter()
router.register('admin/coupons', AdminCouponViewSet, basename='admin_coupon')

# The frontend (src/services/api.js) manages coupons at /api/coupons/ directly,
# so the same viewset is also mounted at the root of this include.
coupon_collection = AdminCouponViewSet.as_view({'get': 'list', 'post': 'create'})
coupon_detail = AdminCouponViewSet.as_view({
    'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy',
})
# NOTE: calling as_view() by hand skips the @action's initkwargs, so the public
# permission has to be re-declared here or the class-level admin gate applies.
coupon_available = AdminCouponViewSet.as_view(
    {'get': 'available'}, permission_classes=[AllowAny]
)

urlpatterns = [
    path('apply/', ApplyCouponView.as_view(), name='coupon_apply'),
    path('remove/', RemoveCouponView.as_view(), name='coupon_remove'),
    path('available/', coupon_available, name='coupon_available'),
    path('', coupon_collection, name='coupon_list_create'),
    path('<int:pk>/', coupon_detail, name='coupon_detail'),
    path('', include(router.urls)),
]
