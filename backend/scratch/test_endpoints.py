import urllib.request
import json

endpoints = [
    'http://127.0.0.1:8000/api/catalog/banners/hero/',
    'http://127.0.0.1:8000/api/catalog/categories/',
    'http://127.0.0.1:8000/api/catalog/deals/',
    'http://127.0.0.1:8000/api/catalog/deals/summary/',
    'http://127.0.0.1:8000/api/catalog/products/?category=Electronics',
    'http://127.0.0.1:8000/api/catalog/products/?category=Fashion',
    'http://127.0.0.1:8000/api/catalog/products/1/',
    'http://127.0.0.1:8000/api/catalog/search/suggestions/?q=boat'
]

for ep in endpoints:
    try:
        req = urllib.request.Request(ep)
        res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
        data = res.get('data')
        info = f"{len(data)} items" if isinstance(data, list) else f"keys: {list(data.keys())}"
        print(f"[OK] {ep:65} -> {res.get('status')} ({info})")
    except Exception as e:
        print(f"[FAIL] {ep:65} -> Error: {e}")
