import json
import urllib.request
import urllib.error

BASE_URL = 'http://127.0.0.1:8000/api'

def make_request(endpoint, method='GET', data=None, headers=None):
    url = f"{BASE_URL}{endpoint}"
    req_headers = {'Content-Type': 'application/json'}
    if headers:
        req_headers.update(headers)

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
    print("=== Testing Cart & Wishlist APIs ===")
    session_id = "test_sess_9999"
    headers = {
        'X-Session-ID': session_id
    }

    # 1. Clear guest cart first
    status, data = make_request("/cart/", method="DELETE", headers=headers)
    print(f"1. Clear initial cart: {status}")

    # 2. Add product 1 to cart
    status, data = make_request("/cart/items/", method="POST", headers=headers, data={
        "product_id": 1,
        "quantity": 2,
        "selected_color": "Matte Black",
        "selected_size": "M"
    })
    print(f"2. Add product 1 to cart: {status}")
    assert status == 201, f"Failed: {data}"
    cart_data = data.get('data', {})
    items = cart_data.get('items', [])
    print(f"   Items count in cart: {len(items)}, Total Items: {cart_data.get('total_items')}")
    assert len(items) == 1
    item_id = items[0]['id']
    print(f"   Cart Item ID: {item_id}, Product: {items[0].get('name')}, Price: Rs.{items[0].get('price')}")
    assert items[0].get('name') is not None
    assert items[0].get('price') is not None

    # 3. Add product 2 to cart
    status, data = make_request("/cart/items/", method="POST", headers=headers, data={
        "product_id": 2,
        "quantity": 1
    })
    print(f"3. Add product 2 to cart: {status}")
    assert status == 201
    assert data['data']['total_items'] == 3

    # 4. Update quantity of item 1
    status, data = make_request(f"/cart/items/{item_id}/", method="PATCH", headers=headers, data={
        "quantity": 5
    })
    print(f"4. Update quantity of item 1: {status}")
    assert status == 200
    assert data['data']['total_items'] == 6

    # 5. Remove item 1
    status, data = make_request(f"/cart/items/{item_id}/", method="DELETE", headers=headers)
    print(f"5. Remove item 1: {status}")
    assert status == 200
    assert len(data['data']['items']) == 1

    # 6. Retrieve Cart
    status, data = make_request("/cart/", method="GET", headers=headers)
    print(f"6. Retrieve cart: {status}")
    assert status == 200
    print(f"   Grand Total: Rs.{data['data']['grand_total']}")

    # 7. Register/Authenticate test user
    email = f"testuser_{session_id}@buyzo.com"
    pwd = "TestPassword@123"
    status, reg_data = make_request("/auth/register/", method="POST", data={
        "email": email,
        "phone_number": "9876543219",
        "first_name": "Test",
        "last_name": "User",
        "password": pwd,
        "password_confirm": pwd
    })
    if status != 201:
        status, auth_data = make_request("/auth/login/", method="POST", data={
            "email": email,
            "password": pwd
        })
    else:
        auth_data = reg_data

    print(f"7. User Auth: {status}")
    access_token = auth_data.get('data', {}).get('tokens', {}).get('access')
    assert access_token is not None, f"Auth failed: {auth_data}"

    auth_headers = {
        'Authorization': f"Bearer {access_token}",
        'X-Session-ID': session_id
    }

    # 8. Add product 1 to wishlist
    status, data = make_request("/cart/wishlist/", method="POST", headers=auth_headers, data={
        "product_id": 1
    })
    print(f"8. Add product 1 to Wishlist: {status}")
    assert status == 200, f"Wishlist add failed: {data}"
    wishlist_items = data['data']['items']
    print(f"   Wishlist items: {len(wishlist_items)}")
    assert len(wishlist_items) >= 1
    assert wishlist_items[0].get('name') is not None
    assert wishlist_items[0].get('price') is not None

    # 9. Get Wishlist
    status, data = make_request("/cart/wishlist/", method="GET", headers=auth_headers)
    print(f"9. Get Wishlist: {status}")
    assert status == 200

    # 10. Move wishlist item to cart
    status, data = make_request("/cart/wishlist/move-to-cart/1/", method="POST", headers=auth_headers)
    print(f"10. Move wishlist item 1 to cart: {status}")
    assert status == 200

    # 11. Merge guest cart into user account
    status, data = make_request("/cart/merge/", method="POST", headers=auth_headers, data={
        "session_id": session_id
    })
    print(f"11. Merge guest cart into user account: {status}")
    assert status == 200

    print("\nALL CART & WISHLIST BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY! 100% WORKING.")

if __name__ == '__main__':
    run_tests()
