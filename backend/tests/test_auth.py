import pytest
from rest_framework import status
from apps.accounts.models import User, EmailVerificationToken, PasswordResetOTP

@pytest.mark.django_db
def test_register_customer(api_client):
    payload = {
        "email": "new_user@buyzo.com",
        "password": "Password@123",
        "password_confirm": "Password@123",
        "first_name": "New",
        "last_name": "User",
        "phone": "+91 98765 11111"
    }
    response = api_client.post('/api/auth/register/', payload, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['status'] == 'success'
    assert 'tokens' in response.data['data']
    assert User.objects.filter(email="new_user@buyzo.com").exists()

@pytest.mark.django_db
def test_login_success(api_client, customer_user):
    payload = {
        "email": customer_user.email,
        "password": "Customer@Password123"
    }
    response = api_client.post('/api/auth/login/', payload, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['status'] == 'success'
    assert 'tokens' in response.data['data']
    assert response.data['data']['user']['role'] == 'CUSTOMER'

@pytest.mark.django_db
def test_email_verification_flow(api_client, customer_user):
    customer_user.is_verified = False
    customer_user.save()

    token_obj = EmailVerificationToken.generate_token_and_otp(customer_user)
    payload = {
        "email": customer_user.email,
        "otp": token_obj.otp
    }
    response = api_client.post('/api/auth/verify-email/', payload, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['status'] == 'success'

    customer_user.refresh_from_db()
    assert customer_user.is_verified is True

@pytest.mark.django_db
def test_password_reset_flow(api_client, customer_user):
    otp_obj = PasswordResetOTP.generate_otp(customer_user)
    payload = {
        "email": customer_user.email,
        "otp": otp_obj.otp,
        "new_password": "NewSecretPassword@123",
        "new_password_confirm": "NewSecretPassword@123"
    }
    response = api_client.post('/api/auth/reset-password/', payload, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['status'] == 'success'

    # Verify user can login with new password
    login_resp = api_client.post('/api/auth/login/', {
        "email": customer_user.email,
        "password": "NewSecretPassword@123"
    }, format='json')
    assert login_resp.status_code == status.HTTP_200_OK
