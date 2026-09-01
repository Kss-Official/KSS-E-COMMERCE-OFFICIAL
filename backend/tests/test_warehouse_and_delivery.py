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


@pytest.mark.django_db
def test_delivery_portal_new_functionalities(api_client, delivery_user, customer_user):
    order = Order.objects.create(
        order_number="ORD-NEW-FUNC-01",
        customer=customer_user,
        shipping_name="Jane Doe",
        shipping_phone="+91 98765 43210",
        shipping_address="123 Park Street, Mumbai",
        subtotal=Decimal("500.00"),
        total_amount=Decimal("500.00"),
        payment_method="COD",
        status="OUT_FOR_DELIVERY"
    )

    task = DeliveryTask.objects.create(
        task_id="TASK-NEW-01",
        agent=delivery_user,
        order=order,
        recipient_name=order.shipping_name,
        recipient_phone=order.shipping_phone,
        delivery_address=order.shipping_address,
        cod_amount=order.total_amount,
        current_stage=2,
        status="IN_TRANSIT"
    )

    api_client.force_authenticate(user=delivery_user)

    # 1. Cash Tracker
    resp = api_client.get('/api/delivery/cash-tracker/')
    assert resp.status_code == status.HTTP_200_OK
    assert 'cash_in_hand' in resp.data['data']

    # 2. Shift & Online Time Tracker
    shift_resp = api_client.get('/api/delivery/shift/')
    assert shift_resp.status_code == status.HTTP_200_OK

    toggle_resp = api_client.post('/api/delivery/shift/toggle/', {'status': 'ONLINE'}, format='json')
    assert toggle_resp.status_code == status.HTTP_200_OK
    assert toggle_resp.data['data']['shift_status'] == 'ONLINE'

    # 3. Performance Metrics
    perf_resp = api_client.get('/api/delivery/performance/')
    assert perf_resp.status_code == status.HTTP_200_OK
    assert 'success_rate' in perf_resp.data['data']

    # 4. Mini Map & Location Ping
    map_resp = api_client.get('/api/delivery/map-data/')
    assert map_resp.status_code == status.HTTP_200_OK

    ping_resp = api_client.post('/api/delivery/location-ping/', {'latitude': '19.076000', 'longitude': '72.877700'}, format='json')
    assert ping_resp.status_code == status.HTTP_200_OK

    # 5. Next Delivery Queue
    queue_resp = api_client.get('/api/delivery/queue/')
    assert queue_resp.status_code == status.HTTP_200_OK
    assert queue_resp.data['data']['queue_count'] >= 1

    # 6. Weather Alert
    weather_resp = api_client.get('/api/delivery/weather/')
    assert weather_resp.status_code == status.HTTP_200_OK
    assert 'alert_level' in weather_resp.data['data']

    # 7. SOS Quick Button
    sos_get = api_client.get('/api/delivery/sos/')
    assert sos_get.status_code == status.HTTP_200_OK

    sos_post = api_client.post('/api/delivery/sos/', {'reason': 'VEHICLE_BREAKDOWN', 'description': 'Flat tire'}, format='json')
    assert sos_post.status_code == status.HTTP_201_CREATED
    assert sos_post.data['data']['reason'] == 'VEHICLE_BREAKDOWN'

    # 8. Failed Delivery Reason
    fail_resp = api_client.post(f'/api/delivery/tasks/{task.task_id}/fail/', {
        'reason_code': 'CUSTOMER_UNAVAILABLE',
        'notes': 'Called twice, no response'
    }, format='json')
    assert fail_resp.status_code == status.HTTP_200_OK
    assert fail_resp.data['data']['status'] == 'FAILED'


@pytest.mark.django_db
def test_cash_in_hand_tracker_and_ledger(api_client, delivery_user, customer_user):
    api_client.force_authenticate(user=delivery_user)

    # 1. Create a COD Order & Delivery Task
    order = Order.objects.create(
        order_number="ORD-CASH-TEST-100",
        customer=customer_user,
        shipping_name="John Cash",
        shipping_phone="+91 99887 76655",
        shipping_address="456 Tech Park, Bangalore",
        subtotal=Decimal("1500.00"),
        total_amount=Decimal("1500.00"),
        payment_method="COD",
        payment_status="UNPAID",
        status="OUT_FOR_DELIVERY",
        delivery_otp="9999"
    )

    task = DeliveryTask.objects.create(
        task_id="TASK-CASH-100",
        agent=delivery_user,
        order=order,
        recipient_name=order.shipping_name,
        recipient_phone=order.shipping_phone,
        delivery_address=order.shipping_address,
        cod_amount=order.total_amount,
        current_stage=3,
        status="IN_TRANSIT"
    )

    # 2. Verify OTP -> Should automatically credit COD cash to agent's cash_in_hand
    otp_resp = api_client.post(f'/api/delivery/tasks/{task.task_id}/verify-otp/', {
        "otp": "9999",
        "collect_cash": True
    }, format='json')
    assert otp_resp.status_code == status.HTTP_200_OK

    # 3. Check Cash Tracker
    tracker_resp = api_client.get('/api/delivery/cash-tracker/')
    assert tracker_resp.status_code == status.HTTP_200_OK
    data = tracker_resp.data['data']
    assert data['cash_in_hand'] == 1500.00
    assert len(data['recent_transactions']) >= 1
    assert data['recent_transactions'][0]['transaction_type'] == 'COLLECTION'

    # 4. Check Cash Transactions Ledger Endpoint
    tx_resp = api_client.get('/api/delivery/cash-transactions/')
    assert tx_resp.status_code == status.HTTP_200_OK
    assert len(tx_resp.data['data']) >= 1

    # 5. Hub Cash Deposit -> Reduces cash in hand
    dep_resp = api_client.post('/api/delivery/cash-deposit/', {
        'amount': 1000.00,
        'payment_mode': 'HUB_COUNTER',
        'notes': 'Partial EOD deposit'
    }, format='json')
    assert dep_resp.status_code == status.HTTP_200_OK
    assert float(dep_resp.data['data']['amount']) == 1000.00

    # 6. Re-check Cash Tracker -> Balance should be 500.00
    tracker_resp2 = api_client.get('/api/delivery/cash-tracker/')
    assert tracker_resp2.data['data']['cash_in_hand'] == 500.00

    # 7. Check Cash Reconciliation Endpoint
    recon_resp = api_client.get('/api/delivery/cash-reconciliation/')
    assert recon_resp.status_code == status.HTTP_200_OK
    assert recon_resp.data['data']['total_collected_today'] == 1500.00
    assert recon_resp.data['data']['total_deposited_today'] == 1000.00
    assert recon_resp.data['data']['current_cash_in_hand'] == 500.00
    assert recon_resp.data['data']['requires_deposit'] is True


@pytest.mark.django_db
def test_cash_handover_flow_agent_and_warehouse(api_client, delivery_user, warehouse_user, customer_user):
    from apps.delivery.models import DeliveryAgentShift

    # Set initial cash in hand for delivery agent
    shift, _ = DeliveryAgentShift.objects.get_or_create(agent=delivery_user)
    shift.cash_in_hand = Decimal("2500.00")
    shift.save()

    # 1. Delivery Agent creates a handover request
    api_client.force_authenticate(user=delivery_user)

    req_resp = api_client.post('/api/delivery/cash-handover/request/', {
        'amount': 2000.00,
        'notes': 'EOD cash handover bundle'
    }, format='json')
    assert req_resp.status_code == status.HTTP_201_CREATED
    handover_id = req_resp.data['data']['handover_id']
    assert req_resp.data['data']['status'] == 'PENDING'

    # 2. Verify duplicate request prevention while pending
    dup_resp = api_client.post('/api/delivery/cash-handover/request/', {
        'amount': 500.00
    }, format='json')
    assert dup_resp.status_code == status.HTTP_400_BAD_REQUEST
    assert 'already have an active pending handover' in dup_resp.data['message']

    # 3. Delivery Agent views active requests
    my_reqs = api_client.get('/api/delivery/cash-handover/my-requests/')
    assert my_reqs.status_code == status.HTTP_200_OK
    assert my_reqs.data['data']['active_pending_request']['handover_id'] == handover_id

    # 4. Warehouse Staff views pending handovers
    api_client.force_authenticate(user=warehouse_user)
    wh_list = api_client.get('/api/warehouse/cash-handovers/')
    assert wh_list.status_code == status.HTTP_200_OK
    assert wh_list.data['data']['pending_count'] >= 1

    # 5. Warehouse Staff confirms receipt of physical cash
    conf_resp = api_client.post(f'/api/warehouse/cash-handovers/{handover_id}/confirm/', {
        'confirmed_amount': 2000.00,
        'notes': 'Verified and received at counter'
    }, format='json')
    assert conf_resp.status_code == status.HTTP_200_OK
    assert conf_resp.data['data']['status'] == 'CONFIRMED'
    assert conf_resp.data['data']['warehouse_staff_email'] == warehouse_user.email

    # 6. Verify agent's cash in hand balance updated (2500 - 2000 = 500)
    shift.refresh_from_db()
    assert float(shift.cash_in_hand) == 500.00

    # 7. Test Dispute Endpoint on a second request
    shift.cash_in_hand = Decimal("1000.00")
    shift.save()

    api_client.force_authenticate(user=delivery_user)
    req2_resp = api_client.post('/api/delivery/cash-handover/request/', {
        'amount': 1000.00,
        'notes': 'Second batch'
    }, format='json')
    assert req2_resp.status_code == status.HTTP_201_CREATED
    handover2_id = req2_resp.data['data']['handover_id']

    api_client.force_authenticate(user=warehouse_user)
    disp_resp = api_client.post(f'/api/warehouse/cash-handovers/{handover2_id}/dispute/', {
        'dispute_reason': 'Count mismatch: received ₹800 instead of declared ₹1000',
        'confirmed_amount': 800.00
    }, format='json')
    assert disp_resp.status_code == status.HTTP_200_OK
    assert disp_resp.data['data']['status'] == 'DISPUTED'
    assert disp_resp.data['data']['dispute_reason'] == 'Count mismatch: received ₹800 instead of declared ₹1000'


@pytest.mark.django_db
def test_advanced_delivery_portal_functionalities(api_client, delivery_user, customer_user):
    from apps.orders.models import Order
    from apps.delivery.models import DeliveryTask

    api_client.force_authenticate(user=delivery_user)

    # 1. Shift & Online Time Tracker
    shift_resp = api_client.get('/api/delivery/shift/')
    assert shift_resp.status_code == status.HTTP_200_OK
    assert 'shift_status' in shift_resp.data['data']

    toggle_resp = api_client.post('/api/delivery/shift/toggle/', {'status': 'ONLINE'}, format='json')
    assert toggle_resp.status_code == status.HTTP_200_OK
    assert toggle_resp.data['data']['shift_status'] == 'ONLINE'

    # 2. Performance Metrics & Success Rate
    perf_resp = api_client.get('/api/delivery/performance/')
    assert perf_resp.status_code == status.HTTP_200_OK
    assert 'success_rate' in perf_resp.data['data']
    assert perf_resp.data['data']['rating'] == 4.9

    # 3. Mini Map Widget & Location Ping
    map_resp = api_client.get('/api/delivery/map-data/')
    assert map_resp.status_code == status.HTTP_200_OK
    assert 'agent_location' in map_resp.data['data']

    ping_resp = api_client.post('/api/delivery/location-ping/', {
        'latitude': 19.088100,
        'longitude': 72.860500
    }, format='json')
    assert ping_resp.status_code == status.HTTP_200_OK
    assert ping_resp.data['data']['latitude'] == 19.0881

    # 4. SOS Emergency Quick Button
    sos_trigger = api_client.post('/api/delivery/sos/', {
        'reason': 'ACCIDENT',
        'description': 'Vehicle breakdown on Western Express Highway',
        'latitude': 19.0881,
        'longitude': 72.8605
    }, format='json')
    assert sos_trigger.status_code == status.HTTP_201_CREATED
    assert sos_trigger.data['data']['status'] == 'TRIGGERED'

    sos_get = api_client.get('/api/delivery/sos/')
    assert sos_get.status_code == status.HTTP_200_OK
    assert len(sos_get.data['data']['hotlines']) >= 1

    # 5. Failed Delivery Reason
    order = Order.objects.create(
        customer=customer_user,
        order_number="ORD-FAIL-101",
        subtotal=Decimal("1200.00"),
        total_amount=Decimal("1200.00"),
        shipping_city="Mumbai",
        status="OUT_FOR_DELIVERY"
    )
    task = DeliveryTask.objects.create(
        task_id="TASK-FAIL-101",
        agent=delivery_user,
        order=order,
        recipient_name="Rahul Verma",
        recipient_phone="9876543210",
        delivery_address="Powai, Mumbai",
        status="IN_TRANSIT"
    )

    fail_resp = api_client.post(f'/api/delivery/tasks/{task.task_id}/fail/', {
        'reason_code': 'CUSTOMER_UNAVAILABLE',
        'notes': 'Customer phone switched off after 3 attempts'
    }, format='json')
    assert fail_resp.status_code == status.HTTP_200_OK
    assert fail_resp.data['data']['status'] == 'FAILED'
    assert fail_resp.data['data']['failed_reason'] == 'CUSTOMER_UNAVAILABLE'
    assert fail_resp.data['data']['failed_reason_display'] == 'Customer Unavailable / Unreachable'




