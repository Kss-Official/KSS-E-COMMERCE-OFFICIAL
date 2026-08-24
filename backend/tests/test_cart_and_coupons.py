import pytest
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from apps.catalog.models import Category, Product
from apps.coupons.models import Coupon

@pytest.mark.django_db
def test_cart_operations(api_client, customer_user):
    cat = Category.objects.create(name="Shoes", slug="shoes")
    product = Product.objects.create(
        title="Running Shoes",
        sku="SHOE-01",
        category=cat,
        base_price=Decimal("1999.00"),
        stock_quantity=10,
        description="Comfortable running shoes."
    )

    api_client.force_authenticate(user=customer_user)

    # 1. Add item
    add_resp = api_client.post('/api/cart/items/', {
        "product_id": product.id,
        "quantity": 2,
        "selected_color": "Blue",
        "selected_size": "9"
    }, format='json')
    assert add_resp.status_code == status.HTTP_201_CREATED
    assert add_resp.data['data']['total_items'] == 2

    item_id = add_resp.data['data']['items'][0]['id']

    # 2. Update item quantity
    update_resp = api_client.patch(f'/api/cart/items/{item_id}/', {
        "quantity": 3
    }, format='json')
    assert update_resp.status_code == status.HTTP_200_OK
    assert update_resp.data['data']['total_items'] == 3

    # 3. Retrieve cart
    get_resp = api_client.get('/api/cart/')
    assert get_resp.status_code == status.HTTP_200_OK
    assert float(get_resp.data['data']['subtotal']) == 5997.00

@pytest.mark.django_db
def test_coupon_validation_and_application(api_client, customer_user):
    cat = Category.objects.create(name="Watches", slug="watches")
    product = Product.objects.create(
        title="Smart Watch",
        sku="WATCH-01",
        category=cat,
        base_price=Decimal("3000.00"),
        stock_quantity=15,
        description="Smart fitness watch."
    )

    coupon = Coupon.objects.create(
        code="SAVE500",
        discount_type="FLAT",
        discount_value=Decimal("500.00"),
        min_order_value=Decimal("1000.00"),
        valid_from=timezone.now() - timedelta(days=1),
        valid_to=timezone.now() + timedelta(days=10),
        is_active=True
    )

    api_client.force_authenticate(user=customer_user)
    api_client.post('/api/cart/items/', {"product_id": product.id, "quantity": 1}, format='json')

    # Apply valid coupon
    coupon_resp = api_client.post('/api/coupons/apply/', {"code": "SAVE500"}, format='json')
    assert coupon_resp.status_code == status.HTTP_200_OK
    assert coupon_resp.data['status'] == 'success'
    assert float(coupon_resp.data['data']['discount_amount']) == 500.00
