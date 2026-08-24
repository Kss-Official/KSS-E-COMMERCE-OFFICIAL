import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User, Profile

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def admin_user(db):
    user = User.objects.create_superuser(
        email='admin_test@buyzo.com',
        password='Admin@Password123'
    )
    Profile.objects.create(user=user, first_name='Admin', last_name='Tester')
    return user

@pytest.fixture
def customer_user(db):
    user = User.objects.create_user(
        email='customer_test@buyzo.com',
        password='Customer@Password123',
        role='CUSTOMER',
        is_verified=True
    )
    Profile.objects.create(user=user, first_name='Customer', last_name='Tester')
    return user

@pytest.fixture
def warehouse_user(db):
    user = User.objects.create_user(
        email='warehouse_test@buyzo.com',
        password='Warehouse@Password123',
        role='WAREHOUSE',
        is_verified=True
    )
    Profile.objects.create(user=user, first_name='Warehouse', last_name='Staff')
    return user

@pytest.fixture
def delivery_user(db):
    user = User.objects.create_user(
        email='delivery_test@buyzo.com',
        password='Delivery@Password123',
        role='DELIVERY_AGENT',
        is_verified=True
    )
    Profile.objects.create(user=user, first_name='Delivery', last_name='Agent')
    return user
