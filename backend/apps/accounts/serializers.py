from rest_framework import serializers
from django.db import models
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Profile, Address

class ProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Profile
        fields = ['id', 'first_name', 'last_name', 'full_name', 'avatar', 'bio', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'role', 'is_verified', 'is_active', 'date_joined', 'profile']
        read_only_fields = ['id', 'is_verified', 'date_joined']

class AddressSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='recipient_name', required=False)
    phone = serializers.CharField(source='phone_number', required=False)
    address = serializers.CharField(source='street_address', required=False)
    pincode = serializers.CharField(source='postal_code', required=False)
    type = serializers.CharField(source='address_type', required=False)
    isDefault = serializers.BooleanField(source='is_default', required=False)

    class Meta:
        model = Address
        fields = [
            'id', 'recipient_name', 'phone_number', 'street_address',
            'apartment_suite', 'city', 'state', 'postal_code',
            'country', 'landmark', 'address_type', 'is_default', 'created_at',
            'name', 'phone', 'address', 'pincode', 'type', 'isDefault'
        ]
        read_only_fields = ['id', 'created_at']

    def to_internal_value(self, data):
        data_copy = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'name' in data_copy and 'recipient_name' not in data_copy:
            data_copy['recipient_name'] = data_copy['name']
        if 'phone' in data_copy and 'phone_number' not in data_copy:
            data_copy['phone_number'] = data_copy['phone']
        if 'address' in data_copy and 'street_address' not in data_copy:
            data_copy['street_address'] = data_copy['address']
        if 'pincode' in data_copy and 'postal_code' not in data_copy:
            data_copy['postal_code'] = data_copy['pincode']
        if 'type' in data_copy and 'address_type' not in data_copy:
            data_copy['address_type'] = str(data_copy['type']).upper()
        if 'isDefault' in data_copy and 'is_default' not in data_copy:
            data_copy['is_default'] = data_copy['isDefault']
        return super().to_internal_value(data_copy)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        formatted = f"{instance.street_address}"
        if instance.city:
            formatted += f", {instance.city}"
        if instance.state:
            formatted += f", {instance.state}"
        if instance.postal_code:
            formatted += f" {instance.postal_code}"
        if instance.country and instance.country != 'India':
            formatted += f", {instance.country}"
        elif instance.country:
            formatted += ", India"

        ret['formatted_address'] = formatted
        ret['address'] = formatted
        ret['name'] = instance.recipient_name
        ret['phone'] = instance.phone_number
        ret['type'] = instance.address_type
        ret['isDefault'] = instance.is_default
        return ret

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    phone = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    password = serializers.CharField(write_only=True, required=True, min_length=4)
    password_confirm = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = ['email', 'phone', 'password', 'password_confirm', 'first_name', 'last_name', 'role']
        extra_kwargs = {
            'role': {'required': False, 'default': 'CUSTOMER'}
        }

    def validate(self, attrs):
        pw = attrs.get('password')
        pw_confirm = attrs.get('password_confirm')
        if pw_confirm and pw != pw_confirm:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        email = (attrs.get('email') or '').strip().lower()
        phone = (attrs.get('phone') or '').strip()

        # If user passed phone in email field or vice versa
        if email and '@' not in email and any(char.isdigit() for char in email):
            phone = email
            email = ''

        if not email and not phone:
            raise serializers.ValidationError("Please provide an email address or mobile number.")

        if email:
            if User.objects.filter(email=email).exists():
                raise serializers.ValidationError({"email": "An account with this email already exists."})
            attrs['email'] = email
        else:
            attrs['email'] = None

        if phone:
            digits_only = ''.join(filter(str.isdigit, phone))
            if len(digits_only) == 12 and digits_only.startswith('91'):
                digits_only = digits_only[2:]
            if len(digits_only) != 10:
                raise serializers.ValidationError({"phone": "Mobile number must be exactly 10 digits."})
            if User.objects.filter(phone=digits_only).exists():
                raise serializers.ValidationError({"phone": "An account with this mobile number already exists."})
            attrs['phone'] = digits_only
        else:
            attrs['phone'] = None

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        
        user = User.objects.create_user(
            email=validated_data.get('email'),
            phone=validated_data.get('phone'),
            password=validated_data['password'],
            role=validated_data.get('role', 'CUSTOMER')
        )
        
        # Profile is created or updated
        Profile.objects.update_or_create(
            user=user,
            defaults={'first_name': first_name, 'last_name': last_name}
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        identifier = attrs.get('email', '').strip()
        password = attrs.get('password')

        if not identifier or not password:
            raise serializers.ValidationError("Must include email/mobile number and password.")

        user = None
        # Check if identifier is a 10-digit mobile number
        digits_only = ''.join(filter(str.isdigit, identifier))
        if len(digits_only) == 12 and digits_only.startswith('91'):
            digits_only = digits_only[2:]

        if not '@' in identifier and len(digits_only) == 10:
            user_obj = User.objects.filter(phone=digits_only).first()
            if not user_obj:
                for candidate in User.objects.filter(phone__isnull=False).exclude(phone=''):
                    cand_digits = ''.join(filter(str.isdigit, candidate.phone))
                    if cand_digits == digits_only or cand_digits.endswith(digits_only):
                        user_obj = candidate
                        break
            if user_obj and user_obj.check_password(password):
                user = user_obj
        else:
            user = authenticate(request=self.context.get('request'), email=identifier, password=password)
            if not user:
                user_obj = User.objects.filter(email=identifier.lower()).first()
                if not user_obj and len(digits_only) == 10:
                    for candidate in User.objects.filter(phone__isnull=False).exclude(phone=''):
                        cand_digits = ''.join(filter(str.isdigit, candidate.phone))
                        if cand_digits == digits_only or cand_digits.endswith(digits_only):
                            user_obj = candidate
                            break
                if user_obj and user_obj.check_password(password):
                    user = user_obj

        if not user:
            raise serializers.ValidationError("Invalid email/mobile number or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")

        attrs['user'] = user
        return attrs

class EmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, required=True)

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, required=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Passwords do not match."})
        return attrs

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])

class AdminUserManagementSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='profile.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='profile.last_name', required=False, allow_blank=True)
    avatar = serializers.ImageField(source='profile.avatar', required=False, allow_null=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'role', 'is_verified', 'is_active',
            'is_staff', 'date_joined', 'first_name', 'last_name', 'avatar', 'password'
        ]
        read_only_fields = ['id', 'date_joined']

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)
        user = User.objects.create_user(
            email=validated_data['email'],
            password=password or 'Buyzo@123',
            phone=validated_data.get('phone', ''),
            role=validated_data.get('role', 'CUSTOMER'),
            is_verified=validated_data.get('is_verified', True),
            is_active=validated_data.get('is_active', True),
            is_staff=validated_data.get('is_staff', False)
        )
        Profile.objects.update_or_create(
            user=user,
            defaults={
                'first_name': profile_data.get('first_name', ''),
                'last_name': profile_data.get('last_name', ''),
                'avatar': profile_data.get('avatar', None)
            }
        )
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)
        instance.save()

        # Update profile
        if profile_data:
            profile = getattr(instance, 'profile', None)
            if not profile:
                profile = Profile.objects.create(user=instance)
            for p_attr, p_val in profile_data.items():
                setattr(profile, p_attr, p_val)
            profile.save()

        return instance

class WalletTransactionSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='related_order.order_number', read_only=True, default=None)

    class Meta:
        from .models import WalletTransaction
        model = WalletTransaction
        fields = ['id', 'amount', 'transaction_type', 'reason', 'order_number', 'created_at']

class UserWalletSerializer(serializers.ModelSerializer):
    transactions = WalletTransactionSerializer(source='wallet_transactions', many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'wallet_balance', 'transactions']
