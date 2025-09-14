#!/usr/bin/env python3
"""
Debug test for collection endpoint timeout issue
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

print(f"Debug testing collection endpoint at: {API_URL}")

# Test data
test_user_data = {
    "email": f"debug.collection.test.{int(time.time())}@example.com",
    "name": "Debug Collection Test",
    "password": "testpass123"
}

admin_credentials = {
    "email": "admin@investaz.com",
    "password": "18061999"
}

def make_request(method, endpoint, data=None, headers=None, timeout=10):
    """Make HTTP request with detailed error reporting"""
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
    except requests.exceptions.Timeout:
        print(f"❌ Request timeout after {timeout} seconds for {method} {endpoint}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed for {method} {endpoint}: {e}")
        return None

def debug_collection_endpoint():
    """Debug the collection endpoint issue"""
    print("\n🔍 DEBUGGING COLLECTION ENDPOINT")
    print("=" * 50)
    
    # Step 1: Register test user
    print("\n1. Registering test user...")
    reg_response = make_request('POST', '/auth/register', test_user_data)
    if not reg_response or reg_response.status_code not in [200, 201]:
        print("❌ Failed to register test user")
        return False
    
    user_token = reg_response.json()['access_token']
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Get user profile
    profile_response = make_request('GET', '/auth/me', headers=headers)
    if not profile_response or profile_response.status_code != 200:
        print("❌ Failed to get user profile")
        return False
    
    user_id = profile_response.json()['id']
    print(f"✅ Test user created: {user_id}")
    
    # Step 2: Login admin and give user balance
    print("\n2. Setting up admin and user balance...")
    admin_response = make_request('POST', '/auth/login', admin_credentials)
    if not admin_response or admin_response.status_code != 200:
        print("❌ Admin login failed")
        return False
    
    admin_token = admin_response.json()['access_token']
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Give user balance
    balance_update = {
        "user_id": user_id,
        "new_balance": 200.0,
        "notes": "Balance for collection debug test"
    }
    balance_response = make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
    if not balance_response or balance_response.status_code != 200:
        print("❌ Failed to update user balance")
        return False
    
    print("✅ User balance updated to 200 AZN")
    
    # Step 3: Purchase package
    print("\n3. Purchasing package...")
    purchase_data = {
        "package_type": "gold",
        "invested_amount": 100.0
    }
    
    purchase_response = make_request('POST', '/packages/purchase', purchase_data, headers)
    if not purchase_response or purchase_response.status_code != 200:
        print("❌ Package purchase failed")
        return False
    
    package_data = purchase_response.json()
    package_id = package_data['id']
    print(f"✅ Package purchased: {package_id}")
    print(f"   Package data: {json.dumps(package_data, indent=2)}")
    
    # Step 4: Check collection status
    print("\n4. Checking collection status...")
    status_response = make_request('GET', f'/packages/{package_id}/collection-status', headers=headers)
    if not status_response or status_response.status_code != 200:
        print("❌ Failed to get collection status")
        return False
    
    status_data = status_response.json()
    print(f"   Collection status: {json.dumps(status_data, indent=2)}")
    
    # Step 5: Wait for earnings to accumulate
    print("\n5. Waiting 30 seconds for earnings to accumulate...")
    time.sleep(30)
    
    # Check updated package
    packages_response = make_request('GET', '/packages/my', headers=headers)
    if packages_response and packages_response.status_code == 200:
        packages = packages_response.json()
        for pkg in packages:
            if pkg['id'] == package_id:
                print(f"   Updated package earnings: {pkg.get('accumulated_earnings', 0)} AZN")
                break
    
    # Step 6: Attempt collection with different timeout values
    print("\n6. Testing collection endpoint with different timeouts...")
    
    # Test with 5 second timeout
    print("   Testing with 5 second timeout...")
    collect_response_5s = make_request('POST', f'/packages/{package_id}/collect', headers=headers, timeout=5)
    
    if collect_response_5s is None:
        print("   ❌ Collection timed out after 5 seconds")
        
        # Test with 10 second timeout
        print("   Testing with 10 second timeout...")
        collect_response_10s = make_request('POST', f'/packages/{package_id}/collect', headers=headers, timeout=10)
        
        if collect_response_10s is None:
            print("   ❌ Collection timed out after 10 seconds")
            
            # Test with 30 second timeout
            print("   Testing with 30 second timeout...")
            collect_response_30s = make_request('POST', f'/packages/{package_id}/collect', headers=headers, timeout=30)
            
            if collect_response_30s is None:
                print("   ❌ Collection timed out after 30 seconds")
                print("   🚨 CRITICAL: Collection endpoint is completely unresponsive")
                return False
            else:
                print(f"   ✅ Collection succeeded with 30 second timeout: {collect_response_30s.status_code}")
                if collect_response_30s.status_code == 200:
                    print(f"   Response: {json.dumps(collect_response_30s.json(), indent=2)}")
        else:
            print(f"   ✅ Collection succeeded with 10 second timeout: {collect_response_10s.status_code}")
            if collect_response_10s.status_code == 200:
                print(f"   Response: {json.dumps(collect_response_10s.json(), indent=2)}")
    else:
        print(f"   ✅ Collection succeeded with 5 second timeout: {collect_response_5s.status_code}")
        if collect_response_5s.status_code == 200:
            print(f"   Response: {json.dumps(collect_response_5s.json(), indent=2)}")
        elif collect_response_5s.status_code == 400:
            error_data = collect_response_5s.json()
            print(f"   Collection rejected: {error_data.get('detail', 'Unknown error')}")
    
    return True

if __name__ == "__main__":
    debug_collection_endpoint()