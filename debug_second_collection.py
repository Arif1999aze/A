#!/usr/bin/env python3
"""
Debug second collection issue
"""

import requests
import json
import time
from pathlib import Path

# Get backend URL from frontend .env file
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

print(f"🔍 DEBUG SECOND COLLECTION ISSUE")
print(f"Backend URL: {API_URL}")

# Test data
test_user_data = {
    "email": f"debug.second.{int(time.time())}@example.com",
    "name": "Debug Second Collection",
    "password": "testpass123"
}

admin_credentials = {
    "email": "admin@investaz.com",
    "password": "18061999"
}

def make_request(method, endpoint, data=None, headers=None, timeout=10):
    """Make HTTP request with detailed logging"""
    url = f"{API_URL}{endpoint}"
    print(f"Making {method} request to: {url}")
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=timeout)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=timeout)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"Response status: {response.status_code}")
        if response.status_code >= 400:
            print(f"Error response: {response.text}")
        
        return response
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None

def debug_second_collection():
    """Debug the second collection issue"""
    
    # Setup
    reg_response = make_request('POST', '/auth/register', test_user_data)
    user_token = reg_response.json()['access_token']
    headers = {"Authorization": f"Bearer {user_token}"}
    
    profile_response = make_request('GET', '/auth/me', headers=headers)
    user_id = profile_response.json()['id']
    
    # Admin setup
    admin_response = make_request('POST', '/auth/login', admin_credentials)
    admin_token = admin_response.json()['access_token']
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    balance_update = {
        "user_id": user_id,
        "new_balance": 300.0,
        "notes": "Debug test balance"
    }
    make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
    
    # Purchase package
    purchase_data = {
        "package_type": "gold",
        "invested_amount": 150.0
    }
    
    purchase_response = make_request('POST', '/packages/purchase', purchase_data, headers)
    package_id = purchase_response.json()['id']
    
    print(f"\n✅ Package created: {package_id}")
    
    # Wait for earnings
    print("\nWaiting for earnings...")
    time.sleep(60)
    
    # First collection
    print("\n🔄 Attempting first collection...")
    first_collect = make_request('POST', f'/packages/{package_id}/collect', headers=headers)
    
    if first_collect and first_collect.status_code == 200:
        collect_data = first_collect.json()
        print(f"✅ First collection successful: {collect_data.get('collected_amount')} AZN")
        
        # Check collection status after first collection
        print("\n📊 Checking collection status after first collection...")
        status_response = make_request('GET', f'/packages/{package_id}/collection-status', headers=headers)
        
        if status_response and status_response.status_code == 200:
            status_data = status_response.json()
            print(f"Status data: {json.dumps(status_data, indent=2)}")
        
        # Immediate second collection
        print("\n🔄 Attempting immediate second collection...")
        second_collect = make_request('POST', f'/packages/{package_id}/collect', headers=headers)
        
        if second_collect:
            print(f"Second collection status: {second_collect.status_code}")
            if second_collect.status_code == 400:
                error_data = second_collect.json()
                print(f"✅ Second collection properly rejected: {error_data.get('detail')}")
            elif second_collect.status_code == 200:
                print("❌ Second collection should not succeed immediately")
                collect_data2 = second_collect.json()
                print(f"Unexpected success: {json.dumps(collect_data2, indent=2)}")
            else:
                print(f"❌ Unexpected status code: {second_collect.status_code}")
                print(f"Response: {second_collect.text}")
        else:
            print("❌ Second collection request failed")
    
    else:
        print("❌ First collection failed")
        if first_collect:
            print(f"Status: {first_collect.status_code}")
            print(f"Response: {first_collect.text}")

if __name__ == "__main__":
    debug_second_collection()