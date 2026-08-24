import pytest
from decimal import Decimal
from rest_framework import status
from apps.orders.models import Order
from apps.delivery.models import DeliveryTask

@pytest.mark.django_db
def test_warehouse_inbound_and_dispatch(api_client, warehouse_user):
    api_client.force_authenticate(user=warehouse_user)

    # 1. Create Inbound PO Receipt
    inbound_resp = api_client.post('/api/warehouse/inbound/', {
        "supplier_name": "Supplier Logistics Ltd",
        "item_title": "Audio Headset",
        "sku": "ELEC-HDST-01",
        "quantity": 50
    }, format='json')
    assert inbound_resp.status_code == status.HTTP_201_CREATED
    receipt_id = inbound_resp.data['data']['id']

    # 2. Verify Inbound PO
    verify_resp = api_client.patch(f'/api/warehouse/inbound/{receipt_id}/verify/')
    assert verify_resp.status_code == status.HTTP_200_OK
    assert verify_resp.data['data']['status'] == 'Verified'

@pytest.mark.django_db
def test_delivery_agent_stage_advancement_and_otp_verification(api_client, delivery_user, customer_user):
    order = Order.objects.create(
        order_number="ORD-DELIV-TEST",
        customer=customer_user,
        shipping_name="Delivery Recipient",
        shipping_phone="+91 99999 11111",
        shipping_address="Green Park, Delhi",
        shipping_city="Delhi",
        shipping_state="Delhi",
        shipping_pincode="110016",
        subtotal=Decimal("1299.00"),
        total_amount=Decimal("1299.00"),
        payment_status="UNPAID",
        payment_method="COD",
        status="SHIPPED",
        delivery_otp="4321"
    )

    task = DeliveryTask.objects.create(
        task_id="TASK-DELIV-01",
        agent=delivery_user,
        order=order,
        recipient_name=order.shipping_name,
        recipient_phone=order.shipping_phone,
        delivery_address=order.shipping_address,
        cod_amount=order.total_amount,
        current_stage=1,
        status="IN_TRANSIT"
    )

    api_client.force_authenticate(user=delivery_user)

    # 1. Advance stage (Picked up -> On the way)
    adv_resp = api_client.post(f'/api/delivery/tasks/{task.task_id}/advance-stage/')
    assert adv_resp.status_code == status.HTTP_200_OK
    assert adv_resp.data['data']['current_stage'] == 2

    # 2. Advance stage (On the way -> Arrived)
    adv_resp2 = api_client.post(f'/api/delivery/tasks/{task.task_id}/advance-stage/')
    assert adv_resp2.status_code == status.HTTP_200_OK
    assert adv_resp2.data['data']['current_stage'] == 3

    # 3. Verify OTP and complete delivery
    otp_resp = api_client.post(f'/api/delivery/tasks/{task.task_id}/verify-otp/', {
        "otp": "4321",
        "collect_cash": True
    }, format='json')
    assert otp_resp.status_code == status.HTTP_200_OK
    assert otp_resp.data['data']['status'] == 'DELIVERED'

    order.refresh_from_db()
    assert order.status == 'DELIVERED'
    assert order.payment_status == 'PAID'
