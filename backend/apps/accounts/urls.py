from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    SendVerificationEmailView,
    VerifyEmailView,
    ForgotPasswordView,
    ResetPasswordView,
    ProfileView,
    ChangePasswordView,
    AddressViewSet,
    AdminUserViewSet,
    CustomerWalletView
)

router = DefaultRouter()
router.register('addresses', AddressViewSet, basename='address')

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Email Verification
    path('send-verification-email/', SendVerificationEmailView.as_view(), name='send_verification_email'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),

    # Password Management
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),

    # Profile, Wallet & Addresses
    path('profile/', ProfileView.as_view(), name='profile'),
    path('wallet/', CustomerWalletView.as_view(), name='customer_wallet'),
    path('', include(router.urls)),

    # Admin User CRUD
    path('admin/users/', AdminUserViewSet.as_view({'get': 'list', 'post': 'create'}), name='admin_user_list_create'),
    path('admin/users/<int:pk>/', AdminUserViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'update', 'delete': 'destroy'}), name='admin_user_detail'),
]
