#!/usr/bin/env python3
"""
Simple test to check collection endpoint functionality
"""

import requests
import json
import time
from pathlib import Path

# Get backend URL
def get_backend_url():
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "https://investaz-platform-1.preview.emergentagent.com"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

print(f"Testing collection endpoint at: {API_URL}")

# Test data
test_user = {
    "email": f"simple.test.{int(time.time())}@example.com",
    "name": "Simple Test User",
    "password": "testpass123"
}

admin_creds = {
    "email": "admin@investaz.com",
    "password": "18061999"
}

def make_request(method, endpoint, data=None, headers=None):
    url = f"{API_URL}{endpoint}"
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=30)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=30)
        return response
    except Exception as e:
        print(f"Request error: {e}")
        return None

# Step 1: Register user
print("1. Registering user...")
reg_response = make_request('POST', '/auth/register', test_user)
if not reg_response or reg_response.status_code not in [200, 201]:
    print(f"Registration failed: {reg_response.status_code if reg_response else 'No response'}")
    exit(1)

user_token = reg_response.json()['access_token']
user_headers = {"Authorization": f"Bearer {user_token}"}

# Get user ID
profile_response = make_request('GET', '/auth/me', headers=user_headers)
user_id = profile_response.json()['id']
print(f"User registered: {user_id}")

# Step 2: Login admin and add balance
print("2. Admin login and balance update...")
admin_response = make_request('POST', '/auth/login', admin_creds)
admin_token = admin_response.json()['access_token']
admin_headers = {"Authorization": f"Bearer {admin_token}"}

balance_update = {
    "user_id": user_id,
    "new_balance": 200.0,
    "notes": "Test balance"
}
make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
print("Balance updated")

# Step 3: Purchase package
print("3. Purchasing package...")
purchase_data = {
    "package_type": "gold",
    "invested_amount": 100.0
}

purchase_response = make_request('POST', '/packages/purchase', purchase_data, user_headers)
if not purchase_response or purchase_response.status_code != 200:
    print(f"Package purchase failed: {purchase_response.status_code if purchase_response else 'No response'}")
    if purchase_response:
        print(f"Error: {purchase_response.text}")
    exit(1)

package_id = purchase_response.json()['id']
print(f"Package purchased: {package_id}")

# Step 4: Wait for earnings
print("4. Waiting 10 seconds for earnings...")
time.sleep(10)

# Step 5: Test collection status
print("5. Checking collection status...")
status_response = make_request('GET', f'/packages/{package_id}/collection-status', headers=user_headers)
if status_response and status_response.status_code == 200:
    status_data = status_response.json()
    print(f"Collection status: {status_data}")
else:
    print(f"Status check failed: {status_response.status_code if status_response else 'No response'}")

# Step 6: Test collection
print("6. Testing collection...")
collect_response = make_request('POST', f'/packages/{package_id}/collect', headers=user_headers)

if collect_response:
    print(f"Collection response status: {collect_response.status_code}")
    print(f"Collection response: {collect_response.text}")
    
    if collect_response.status_code == 200:
        print("✅ Collection successful!")
    elif collect_response.status_code == 400:
        print("❌ Collection failed - validation error")
        try:
            error_data = collect_response.json()
            print(f"Error details: {error_data}")
        except:
            pass
    else:
        print("❌ Collection failed")
else:
    print("❌ No response from collection endpoint")

print("Test completed.")