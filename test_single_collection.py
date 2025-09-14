#!/usr/bin/env python3
"""
Test single collection functionality
"""

import requests
import json
import time
import random
from pathlib import Path

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

# Generate unique test user
timestamp = int(time.time())
random_suffix = random.randint(1000, 9999)

test_user = {
    "email": f"collection.test.{timestamp}.{random_suffix}@example.com",
    "name": "Collection Test User",
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

print("🔴 TESTING COLLECTION COOLDOWN SYSTEM")
print("=" * 50)

# Step 1: Register user
print("1. Registering collection test user...")
reg_response = make_request('POST', '/auth/register', test_user)
if not reg_response or reg_response.status_code not in [200, 201]:
    print(f"❌ Registration failed: {reg_response.status_code if reg_response else 'No response'}")
    exit(1)

user_token = reg_response.json()['access_token']
user_headers = {"Authorization": f"Bearer {user_token}"}

# Get user profile
profile_response = make_request('GET', '/auth/me', headers=user_headers)
user_id = profile_response.json()['id']
print(f"✅ User registered: {user_id}")

# Step 2: Admin login and balance update
print("2. Admin setup...")
admin_response = make_request('POST', '/auth/login', admin_creds)
admin_token = admin_response.json()['access_token']
admin_headers = {"Authorization": f"Bearer {admin_token}"}

balance_update = {
    "user_id": user_id,
    "new_balance": 500.0,
    "notes": "Balance for collection testing"
}
make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
print("✅ Balance updated to 500 AZN")

# Step 3: Purchase package
print("3. Purchasing package...")
purchase_data = {
    "package_type": "gold",
    "invested_amount": 100.0
}

purchase_response = make_request('POST', '/packages/purchase', purchase_data, user_headers)
if not purchase_response or purchase_response.status_code != 200:
    print(f"❌ Package purchase failed: {purchase_response.status_code if purchase_response else 'No response'}")
    exit(1)

package_data = purchase_response.json()
package_id = package_data['id']
print(f"✅ Package purchased: {package_id}")

# Verify package starts with null last_collection_time
if package_data.get('last_collection_time') is not None:
    print("❌ New package should start with null last_collection_time")
else:
    print("✅ New package correctly starts with null last_collection_time")

# Step 4: Wait for earnings
print("4. Waiting 90 seconds for earnings to accumulate...")
time.sleep(90)

# Check earnings
packages_response = make_request('GET', '/packages/my', headers=user_headers)
if packages_response and packages_response.status_code == 200:
    packages = packages_response.json()
    for pkg in packages:
        if pkg['id'] == package_id:
            earnings = pkg.get('accumulated_earnings', 0)
            print(f"   Package earnings: {earnings} AZN")
            if earnings < 0.01:
                print(f"   ⚠️  Earnings ({earnings}) below minimum threshold (0.01)")
            break

# Step 5: Check collection status
print("5. Checking collection status...")
status_response = make_request('GET', f'/packages/{package_id}/collection-status', headers=user_headers)
if status_response and status_response.status_code == 200:
    status_data = status_response.json()
    print(f"   Status: can_collect={status_data.get('can_collect')}, cooldown={status_data.get('cooldown_remaining_seconds')}")
else:
    print("❌ Failed to get collection status")

# Step 6: Test collection
print("6. Testing collection...")
collect_response = make_request('POST', f'/packages/{package_id}/collect', headers=user_headers)

if collect_response:
    print(f"   Collection response: {collect_response.status_code}")
    if collect_response.status_code == 200:
        collect_data = collect_response.json()
        print(f"   ✅ Collection successful: {collect_data.get('collected_amount', 0)} AZN")
        print(f"   New balance: {collect_data.get('new_balance', 0)} AZN")
        
        # Test immediate second collection (should fail)
        print("7. Testing immediate second collection...")
        second_collect = make_request('POST', f'/packages/{package_id}/collect', headers=user_headers)
        if second_collect and second_collect.status_code == 400:
            error_data = second_collect.json()
            error_message = error_data.get('detail', '')
            print(f"   ✅ Second collection correctly rejected: {error_message}")
            
            # Check if error message shows hours and minutes
            if 'hours' in error_message.lower() and 'minutes' in error_message.lower():
                print("   ✅ Error message shows hours and minutes format")
            else:
                print("   ❌ Error message should show hours and minutes format")
        else:
            print("   ❌ Second collection should have been rejected")
            
    elif collect_response.status_code == 400:
        error_data = collect_response.json()
        print(f"   ❌ Collection failed: {error_data.get('detail', 'Unknown error')}")
    else:
        print(f"   ❌ Unexpected response: {collect_response.text}")
else:
    print("   ❌ No response from collection endpoint")

print("\nTest completed.")