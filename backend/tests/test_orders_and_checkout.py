import pytest
from decimal import Decimal
from rest_framework import status
from apps.accounts.models import Address
from apps.catalog.models import Category, Product
from apps.orders.models import Order

@pytest.mark.django_db
def test_atomic_checkout_and_stock_deduction(api_client, customer_user):
    cat = Category.objects.create(name="Electronics", slug="electronics")
    product = Product.objects.create(
        title="Wireless Speaker",
        sku="SPK-01",
        category=cat,
        base_price=Decimal("1500.00"),
        stock_quantity=10,
        description="Bluetooth speaker"
    )

    address = Address.objects.create(
        user=customer_user,
        recipient_name="Test Customer",
        phone_number="+91 99999 88888",
        street_address="123 Street",
        city="Delhi",
        state="Delhi",
        postal_code="110001",
        is_default=True
    )

    api_client.force_authenticate(user=customer_user)
    api_client.post('/api/cart/items/', {"product_id": product.id, "quantity": 2}, format='json')

    # Execute checkout
    checkout_payload = {
        "address_id": address.id,
        "payment_method": "MOCK"
    }
    resp = api_client.post('/api/orders/checkout/', checkout_payload, format='json')
    assert resp.status_code == status.HTTP_201_CREATED
    assert resp.data['status'] == 'success'

    # Check stock deduction
    product.refresh_from_db()
    assert product.stock_quantity == 8  # 10 - 2

    # Check order created
    order_num = resp.data['data']['order_number']
    assert Order.objects.filter(order_number=order_num, customer=customer_user).exists()

@pytest.mark.django_db
def test_order_cancellation_restores_stock(api_client, customer_user):
    cat = Category.objects.create(name="Clothing", slug="clothing")
    product = Product.objects.create(
        title="Casual Tee",
        sku="TEE-01",
        category=cat,
        base_price=Decimal("500.00"),
        stock_quantity=5,
        description="T-shirt"
    )

    address = Address.objects.create(
        user=customer_user,
        recipient_name="Test Customer",
        phone_number="+91 99999 88888",
        street_address="123 Street",
        city="Delhi",
        state="Delhi",
        postal_code="110001",
        is_default=True
    )

    api_client.force_authenticate(user=customer_user)
    api_client.post('/api/cart/items/', {"product_id": product.id, "quantity": 3}, format='json')
    chk_resp = api_client.post('/api/orders/checkout/', {"address_id": address.id}, format='json')
    order_num = chk_resp.data['data']['order_number']

    product.refresh_from_db()
    assert product.stock_quantity == 2  # 5 - 3

    # Cancel order
    cancel_resp = api_client.post(f'/api/orders/{order_num}/cancel/')
    assert cancel_resp.status_code == status.HTTP_200_OK

    product.refresh_from_db()
    assert product.stock_quantity == 5  # Restored to 5
