from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.db import models
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from core.response import APIResponse
from core.permissions import IsAdminUserRole, IsOwnerOrAdmin
from .models import User, Profile, Address, EmailVerificationToken, PasswordResetOTP
from .serializers import (
    UserSerializer,
    ProfileSerializer,
    RegisterSerializer,
    LoginSerializer,
    AddressSerializer,
    EmailVerificationSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
    AdminUserManagementSerializer,
    UserWalletSerializer
)

class CustomerWalletView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user if request.user and request.user.is_authenticated else None
        if not user:
            email_param = request.query_params.get('email')
            if email_param:
                user = User.objects.filter(email__iexact=email_param).first()
        if not user:
            user = User.objects.filter(role='CUSTOMER').first()

        if not user:
            return APIResponse.error(message="User not found.")

        serializer = UserWalletSerializer(user)
        return APIResponse.success(data=serializer.data, message="Wallet balance retrieved.")

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            # Generate verification token and send console email
            token_obj = EmailVerificationToken.generate_token_and_otp(user)
            send_mail(
                subject="Verify Your BuyZo Account",
                message=f"Welcome to BuyZo! Your verification OTP code is: {token_obj.otp}\nOr use token: {token_obj.token}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True
            )

            data = {
                "user": UserSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh)
                }
            }
            return APIResponse.success(
                data=data,
                message="Registration successful. A verification OTP has been sent to your email.",
                status_code=status.HTTP_201_CREATED
            )
        return APIResponse.error(message="Registration failed.", errors=serializer.errors)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            data = {
                "user": UserSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh)
                }
            }
            return APIResponse.success(data=data, message="Login successful.")
        return APIResponse.error(message="Invalid credentials.", errors=serializer.errors)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return APIResponse.success(message="Logged out successfully.")
        except Exception as e:
            return APIResponse.error(message="Invalid refresh token.", errors={"detail": str(e)})

class SendVerificationEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_verified:
            return APIResponse.success(message="Email is already verified.")

        token_obj = EmailVerificationToken.generate_token_and_otp(user)
        send_mail(
            subject="Verify Your BuyZo Account",
            message=f"Your verification OTP code is: {token_obj.otp}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True
        )
        return APIResponse.success(message=f"Verification OTP sent to {user.email}.")

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(message="Invalid verification data.", errors=serializer.errors)

        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']

        try:
            user = User.objects.get(email=email)
            token_obj = EmailVerificationToken.objects.filter(user=user, otp=otp, is_used=False).latest('created_at')
            if not token_obj.is_valid():
                return APIResponse.error(message="Verification OTP has expired or already been used.")

            token_obj.is_used = True
            token_obj.save()

            user.is_verified = True
            user.save(update_fields=['is_verified'])

            return APIResponse.success(data={"is_verified": True}, message="Email verified successfully!")
        except (User.DoesNotExist, EmailVerificationToken.DoesNotExist):
            return APIResponse.error(message="Invalid email or verification OTP.")

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                otp_obj = PasswordResetOTP.generate_otp(user)
                send_mail(
                    subject="BuyZo Password Reset Code",
                    message=f"Your password reset OTP code is: {otp_obj.otp}\nValid for 15 minutes.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True
                )
            except User.DoesNotExist:
                pass  # Do not disclose user existence

            return APIResponse.success(message="If the email exists, a password reset OTP has been sent.")
        return APIResponse.error(message="Invalid email.", errors=serializer.errors)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']

            try:
                user = User.objects.get(email=email)
                otp_obj = PasswordResetOTP.objects.filter(user=user, otp=otp, is_used=False).latest('created_at')
                if not otp_obj.is_valid():
                    return APIResponse.error(message="Password reset OTP has expired or already been used.")

                otp_obj.is_used = True
                otp_obj.save()

                user.set_password(new_password)
                user.save()

                return APIResponse.success(message="Password reset successfully. You can now login with your new password.")
            except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
                return APIResponse.error(message="Invalid email or reset OTP.")

        return APIResponse.error(message="Password reset failed.", errors=serializer.errors)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return APIResponse.success(data=UserSerializer(user).data, message="User profile retrieved.")

    def put(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)

        first_name = request.data.get('first_name', profile.first_name)
        last_name = request.data.get('last_name', profile.last_name)
        bio = request.data.get('bio', profile.bio)
        phone = request.data.get('phone', user.phone)

        if 'avatar' in request.FILES:
            profile.avatar = request.FILES['avatar']

        profile.first_name = first_name
        profile.last_name = last_name
        profile.bio = bio
        profile.save()

        user.phone = phone
        user.save(update_fields=['phone'])

        return APIResponse.success(data=UserSerializer(user).data, message="Profile updated successfully.")

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return APIResponse.error(message="Current password is incorrect.")

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return APIResponse.success(message="Password changed successfully.")
        return APIResponse.error(message="Password change failed.", errors=serializer.errors)

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user).order_by('-is_default', '-created_at')

    def perform_create(self, serializer):
        is_first = not Address.objects.filter(user=self.request.user).exists()
        is_def = serializer.validated_data.get('is_default', is_first)
        if is_def:
            Address.objects.filter(user=self.request.user, is_default=True).update(is_default=False)
        serializer.save(user=self.request.user, is_default=is_def)

    def perform_update(self, serializer):
        is_def = serializer.validated_data.get('is_default', False)
        if is_def:
            Address.objects.filter(user=self.request.user, is_default=True).exclude(pk=serializer.instance.pk).update(is_default=False)
        serializer.save()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Addresses retrieved successfully.")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return APIResponse.success(data=serializer.data, message="Address created successfully.", status_code=status.HTTP_201_CREATED)
        return APIResponse.error(message="Could not save address.", errors=serializer.errors)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return APIResponse.success(data=serializer.data, message="Address updated successfully.")
        return APIResponse.error(message="Could not update address.", errors=serializer.errors)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        was_default = instance.is_default
        self.perform_destroy(instance)
        # If deleted address was default, set next newest as default if any remain
        if was_default:
            next_addr = Address.objects.filter(user=request.user).first()
            if next_addr:
                next_addr.is_default = True
                next_addr.save()
        return APIResponse.success(message="Address deleted successfully.")

    @action(detail=True, methods=['post', 'patch'], url_path='set-default')
    def set_default(self, request, pk=None):
        instance = self.get_object()
        Address.objects.filter(user=request.user, is_default=True).update(is_default=False)
        instance.is_default = True
        instance.save()
        serializer = self.get_serializer(instance)
        return APIResponse.success(data=serializer.data, message="Address set as default.")

    @action(detail=False, methods=['get'], url_path='default')
    def get_default(self, request):
        addr = Address.objects.filter(user=request.user, is_default=True).first() or Address.objects.filter(user=request.user).first()
        if not addr:
            return APIResponse.success(data=None, message="No addresses found.")
        serializer = self.get_serializer(addr)
        return APIResponse.success(data=serializer.data, message="Default address retrieved.")

# ----------------- ADMIN USER MANAGEMENT -----------------
class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin endpoints for managing users across all portals (Customer, Admin, Warehouse, Delivery Agent).
    """
    queryset = User.objects.all().select_related('profile').order_by('-date_joined')
    serializer_class = AdminUserManagementSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request:
            return qs

        query_params = getattr(self.request, 'query_params', self.request.GET)
        role = query_params.get('role')
        search = query_params.get('search')
        is_active = query_params.get('is_active')

        if role:
            qs = qs.filter(role=role.upper())
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')
        if search:
            qs = qs.filter(
                models.Q(email__icontains=search) |
                models.Q(phone__icontains=search) |
                models.Q(profile__first_name__icontains=search) |
                models.Q(profile__last_name__icontains=search)
            )
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return APIResponse.success(data=serializer.data, message="Users retrieved successfully.")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return APIResponse.success(
                data=AdminUserManagementSerializer(user).data,
                message="User created successfully.",
                status_code=status.HTTP_201_CREATED
            )
        return APIResponse.error(message="Could not create user.", errors=serializer.errors)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return APIResponse.success(data=serializer.data, message="User retrieved successfully.")

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            user = serializer.save()
            return APIResponse.success(data=AdminUserManagementSerializer(user).data, message="User updated successfully.")
        return APIResponse.error(message="Could not update user.", errors=serializer.errors)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user_email = instance.email
        instance.delete()
        return APIResponse.success(message=f"User {user_email} deleted successfully from database.")
