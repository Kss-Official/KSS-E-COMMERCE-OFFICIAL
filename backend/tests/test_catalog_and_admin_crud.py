import pytest
from decimal import Decimal
from rest_framework import status
from apps.catalog.models import Category, Brand, Product

@pytest.mark.django_db
def test_public_catalog_list(api_client):
    cat = Category.objects.create(name="Audio", slug="audio")
    Product.objects.create(
        title="Test Earbuds",
        sku="TEST-EARBUDS-01",
        category=cat,
        base_price=Decimal("1999.00"),
        stock_quantity=50,
        description="Great sound earbuds."
    )

    response = api_client.get('/api/catalog/products/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['status'] == 'success'
    assert len(response.data['data']['results']) >= 1

@pytest.mark.django_db
def test_search_and_autocomplete(api_client):
    cat = Category.objects.create(name="Smartphones", slug="smartphones")
    Product.objects.create(
        title="Xiaomi Super Phone 5G",
        sku="XIAOMI-5G",
        category=cat,
        base_price=Decimal("15999.00"),
        stock_quantity=20,
        description="Fast phone",
        tags="xiaomi, 5g, smartphone"
    )

    # Search
    resp = api_client.get('/api/catalog/search/?q=xiaomi')
    assert resp.status_code == status.HTTP_200_OK
    assert resp.data['data']['total_found'] >= 1

    # Suggestions
    sug_resp = api_client.get('/api/catalog/search/suggestions/?q=xiao')
    assert sug_resp.status_code == status.HTTP_200_OK
    assert len(sug_resp.data['data']['suggestions']) >= 1

@pytest.mark.django_db
def test_admin_product_crud(api_client, admin_user, customer_user):
    cat = Category.objects.create(name="Laptops", slug="laptops")

    # Customer forbidden
    api_client.force_authenticate(user=customer_user)
    forbidden_resp = api_client.post('/api/catalog/admin/products/', {
        "title": "Admin Laptop",
        "sku": "ADM-LAP-01",
        "category": cat.id,
        "base_price": "45000.00",
        "stock_quantity": 10,
        "description": "Powerful laptop"
    }, format='json')
    assert forbidden_resp.status_code == status.HTTP_403_FORBIDDEN

    # Admin allowed
    api_client.force_authenticate(user=admin_user)
    create_resp = api_client.post('/api/catalog/admin/products/', {
        "title": "Admin Laptop",
        "sku": "ADM-LAP-01",
        "category": cat.id,
        "base_price": "45000.00",
        "stock_quantity": 10,
        "description": "Powerful laptop"
    }, format='json')
    assert create_resp.status_code == status.HTTP_201_CREATED
    prod_id = create_resp.data['data']['id']

    # Update product
    update_resp = api_client.patch(f'/api/catalog/admin/products/{prod_id}/', {
        "base_price": "42000.00"
    }, format='json')
    assert update_resp.status_code == status.HTTP_200_OK
    assert float(update_resp.data['data']['base_price']) == 42000.00
