import urllib.request
import json

req_adm = urllib.request.Request('http://127.0.0.1:8000/api/auth/login/', data=json.dumps({'email': 'admin@buyzo.com', 'password': 'Admin@123'}).encode('utf-8'), headers={'Content-Type': 'application/json'})
adm_token = json.loads(urllib.request.urlopen(req_adm).read())['data']['tokens']['access']

req_cust = urllib.request.Request('http://127.0.0.1:8000/api/auth/login/', data=json.dumps({'email': 'customer@buyzo.com', 'password': 'Customer@123'}).encode('utf-8'), headers={'Content-Type': 'application/json'})
cust_token = json.loads(urllib.request.urlopen(req_cust).read())['data']['tokens']['access']

test_urls = [
    ('Hero Banner', 'http://127.0.0.1:8000/api/catalog/banners/hero/', None),
    ('Categories', 'http://127.0.0.1:8000/api/catalog/categories/', None),
    ('Deals List', 'http://127.0.0.1:8000/api/catalog/deals/', None),
    ('Deals Summary', 'http://127.0.0.1:8000/api/catalog/deals/summary/', None),
    ('Products List', 'http://127.0.0.1:8000/api/catalog/products/', None),
    ('Search Suggestions', 'http://127.0.0.1:8000/api/catalog/search/suggestions/?q=noise', None),
    ('Customer Orders', 'http://127.0.0.1:8000/api/orders/', cust_token),
    ('Admin Users', 'http://127.0.0.1:8000/api/auth/admin/users/', adm_token),
    ('Admin Dashboard', 'http://127.0.0.1:8000/api/admin/dashboard/summary/', adm_token),
    ('Warehouse Inbound', 'http://127.0.0.1:8000/api/warehouse/inbound/', adm_token),
    ('Delivery Dashboard', 'http://127.0.0.1:8000/api/delivery/dashboard/', adm_token),
]

print("=" * 65)
print("COMPREHENSIVE BACKEND API ENDPOINT VERIFICATION")
print("=" * 65)
for name, url, token in test_urls:
    headers = {'Authorization': f'Bearer {token}'} if token else {}
    req = urllib.request.Request(url, headers=headers)
    res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    print(f"[OK] {name:22} -> {res.get('status')} : {url}")
print("=" * 65)
print("ALL BACKEND ENDPOINTS ARE VERIFIED & READY FOR FRONTEND INTEGRATION")
print("=" * 65)
