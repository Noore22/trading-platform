import requests

urls = [
    "http://localhost:8000/api/v1/auth/me",
    "http://localhost:8000/api/v1/accounts/",
    "http://localhost:8000/api/v1/mt5/status",
    "http://localhost:8000/api/v1/mt5/positions",
    "http://localhost:8000/api/v1/mt5/orders",
    "http://localhost:8000/api/v1/mt5/history"
]

for url in urls:
    try:
        r = requests.get(url)
        print(f"{url} -> {r.status_code}")
    except Exception as e:
        print(f"{url} -> FAILED: {e}")
