import pytest
from decimal import Decimal
from rest_framework import status
from apps.orders.models import Order

@pytest.mark.django_db
def test_mock_payment_verification(api_client, customer_user):
    order = Order.objects.create(
        order_number="ORD-TEST-PAY",
        customer=customer_user,
        shipping_name="Test Customer",
        shipping_phone="+91 99999 88888",
        shipping_address="Address 1",
        shipping_city="City",
        shipping_state="State",
        shipping_pincode="110001",
        subtotal=Decimal("1000.00"),
        total_amount=Decimal("1180.00"),
        payment_status="UNPAID",
        status="PENDING"
    )

    api_client.force_authenticate(user=customer_user)

    # 1. Create payment session
    sess_resp = api_client.post('/api/payments/create-session/', {
        "order_number": order.order_number,
        "method": "MOCK"
    }, format='json')
    assert sess_resp.status_code == status.HTTP_201_CREATED

    # 2. Verify payment (Simulate success)
    verif_resp = api_client.post('/api/payments/verify/', {
        "order_number": order.order_number,
        "action": "SIMULATE_SUCCESS"
    }, format='json')
    assert verif_resp.status_code == status.HTTP_200_OK
    assert verif_resp.data['status'] == 'success'

    order.refresh_from_db()
    assert order.payment_status == 'PAID'
    assert order.status == 'CONFIRMED'
