import json
import urllib.request
import urllib.error
import time

BASE_URL = 'http://127.0.0.1:8000/api'

def make_request(endpoint, method='GET', data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    req_headers = {'Content-Type': 'application/json'}
    if token:
        req_headers['Authorization'] = f"Bearer {token}"

    body = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        res_body = e.read().decode('utf-8')
        return e.code, json.loads(res_body) if res_body else {}

def run_tests():
    print("=== Testing Address Dynamic Multi-User CRUD APIs ===")
    ts = int(time.time())

    # --- Scenario 1: New User has Zero Addresses ---
    user_a_email = f"user_a_{ts}@buyzo.com"
    pwd = "Password@123"
    status, reg_a = make_request("/auth/register/", method="POST", data={
        "email": user_a_email,
        "phone_number": f"91{ts % 100000000:08d}",
        "first_name": "Alice",
        "last_name": "Smith",
        "password": pwd,
        "password_confirm": pwd
    })
    print(f"Scenario 1: Registered User A: {status}")
    assert status == 201
    token_a = reg_a['data']['tokens']['access']

    status, list_a = make_request("/auth/addresses/", method="GET", token=token_a)
    print(f"Scenario 1: User A initial addresses: {status}, count = {len(list_a.get('data', []))}")
    assert status == 200
    assert len(list_a.get('data', [])) == 0, "New user must have 0 addresses!"

    # --- Scenario 2: Add Address ---
    status, add_res = make_request("/auth/addresses/", method="POST", token=token_a, data={
        "name": "Alice Smith",
        "phone": "+91 98765 00001",
        "address": "Flat 4B, Sunrise Towers, 12th Main Road, Indiranagar",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560038",
        "type": "HOME"
    })
    print(f"Scenario 2: Add Address for User A: {status}")
    assert status == 201
    created_addr_a = add_res.get('data', {})
    addr_a_id = created_addr_a.get('id')
    assert addr_a_id is not None
    assert created_addr_a.get('isDefault') is True, "First address should be default!"
    print(f"   Created Address ID: {addr_a_id}, Formatted: {created_addr_a.get('formatted_address')}")

    # Fetch addresses again for User A
    status, list_a = make_request("/auth/addresses/", method="GET", token=token_a)
    assert status == 200
    assert len(list_a.get('data', [])) == 1
    assert list_a['data'][0]['id'] == addr_a_id

    # --- Scenario 3: Multiple Users Isolation ---
    user_b_email = f"user_b_{ts}@buyzo.com"
    status, reg_b = make_request("/auth/register/", method="POST", data={
        "email": user_b_email,
        "phone_number": f"92{ts % 100000000:08d}",
        "first_name": "Bob",
        "last_name": "Jones",
        "password": pwd,
        "password_confirm": pwd
    })
    print(f"Scenario 3: Registered User B: {status}")
    assert status == 201
    token_b = reg_b['data']['tokens']['access']

    # User B must see 0 addresses initially (NOT User A's address)
    status, list_b = make_request("/auth/addresses/", method="GET", token=token_b)
    print(f"Scenario 3: User B initial addresses count = {len(list_b.get('data', []))}")
    assert status == 200
    assert len(list_b.get('data', [])) == 0, "User B must NOT see User A's address!"

    # User B adds Address B
    status, add_b_res = make_request("/auth/addresses/", method="POST", token=token_b, data={
        "name": "Bob Jones",
        "phone": "+91 91234 56789",
        "address": "104 Ocean View, Bandra West",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400050",
        "type": "WORK"
    })
    print(f"Scenario 3: Add Address for User B: {status}")
    assert status == 201
    addr_b_id = add_b_res['data']['id']

    # Confirm User A still only sees Address A
    status, list_a = make_request("/auth/addresses/", method="GET", token=token_a)
    assert len(list_a.get('data', [])) == 1
    assert list_a['data'][0]['id'] == addr_a_id

    # Confirm User B only sees Address B
    status, list_b = make_request("/auth/addresses/", method="GET", token=token_b)
    assert len(list_b.get('data', [])) == 1
    assert list_b['data'][0]['id'] == addr_b_id

    # --- Scenario 4: Delete Address ---
    status, del_res = make_request(f"/auth/addresses/{addr_a_id}/", method="DELETE", token=token_a)
    print(f"Scenario 4: Delete User A Address: {status}")
    assert status == 200

    # User A now has 0 addresses
    status, list_a = make_request("/auth/addresses/", method="GET", token=token_a)
    assert status == 200
    assert len(list_a.get('data', [])) == 0, "User A addresses must be empty after deletion!"
    print(f"Scenario 4: User A addresses after deletion = {len(list_a.get('data', []))}")

    # User B's address still exists intact
    status, list_b = make_request("/auth/addresses/", method="GET", token=token_b)
    assert len(list_b.get('data', [])) == 1

    print("\nALL 4 USER ADDRESS SCENARIOS PASSED 100% SUCCESSFULLY!")

if __name__ == '__main__':
    run_tests()
