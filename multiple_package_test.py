#!/usr/bin/env python3
"""
MULTIPLE PACKAGE PURCHASE TEST
Test the scenario where user purchases multiple packages.
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
    return "https://investor-portal-7.preview.emergentagent.com"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

def make_request(method, endpoint, data=None, headers=None):
    """Make HTTP request with error handling"""
    url = f"{API_URL}{endpoint}"
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=10)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return response
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed for {method} {endpoint}: {e}")
        return None

def test_multiple_packages():
    """Test multiple package purchases"""
    
    # Test data
    test_user = {
        "email": "multi.test.user@example.com",
        "name": "Multi Test User", 
        "password": "testpass123"
    }
    
    admin_credentials = {
        "email": "admin@investaz.com",
        "password": "18061999"
    }
    
    print("🔧 SETUP: Creating test environment for multiple packages")
    
    # Register user
    reg_response = make_request('POST', '/auth/register', test_user)
    if not reg_response or reg_response.status_code not in [200, 201]:
        print(f"❌ User registration failed")
        return False
    
    user_token = reg_response.json()['access_token']
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Get user ID
    profile_response = make_request('GET', '/auth/me', headers=headers)
    user_id = profile_response.json()['id']
    
    # Login admin and set balance to 200 AZN
    admin_response = make_request('POST', '/auth/login', admin_credentials)
    admin_token = admin_response.json()['access_token']
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    balance_update = {
        "user_id": user_id,
        "new_balance": 200.0,
        "notes": "Multiple package test"
    }
    make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
    time.sleep(1)
    
    print("✅ Setup complete - User has 200 AZN balance")
    
    # Purchase first package (Gold - 80 AZN)
    print("\n📦 FIRST PACKAGE: Gold package (80 AZN)")
    first_purchase = {
        "package_type": "gold",
        "invested_amount": 80.0
    }
    
    first_response = make_request('POST', '/packages/purchase', first_purchase, headers)
    if not first_response or first_response.status_code != 200:
        print(f"❌ First package purchase failed")
        return False
    
    first_data = first_response.json()
    first_package_id = first_data['id']
    print(f"✅ First package purchased (ID: {first_package_id})")
    
    # Check balance after first purchase
    time.sleep(1)
    profile1 = make_request('GET', '/auth/me', headers=headers)
    balance1 = profile1.json()['balance']
    invested1 = profile1.json()['total_invested']
    
    print(f"   Balance after first: {balance1} AZN (expected: 120 AZN)")
    print(f"   Total invested: {invested1} AZN (expected: 80 AZN)")
    
    if balance1 != 120.0 or invested1 != 80.0:
        print("❌ First package purchase balance/investment tracking failed")
        return False
    
    # Check first package is active
    packages1 = make_request('GET', '/packages/my', headers=headers)
    user_packages1 = packages1.json()
    active1 = [pkg for pkg in user_packages1 if pkg.get('is_active', False)]
    
    if len(active1) != 1 or active1[0]['id'] != first_package_id:
        print("❌ First package should be active")
        return False
    
    print("✅ First package is active and balance tracking correct")
    
    # Purchase second package (Gold - 60 AZN) 
    print("\n📦 SECOND PACKAGE: Gold package (60 AZN)")
    second_purchase = {
        "package_type": "gold", 
        "invested_amount": 60.0
    }
    
    second_response = make_request('POST', '/packages/purchase', second_purchase, headers)
    if not second_response or second_response.status_code != 200:
        print(f"❌ Second package purchase failed")
        return False
    
    second_data = second_response.json()
    second_package_id = second_data['id']
    print(f"✅ Second package purchased (ID: {second_package_id})")
    
    # Check balance after second purchase
    time.sleep(1)
    profile2 = make_request('GET', '/auth/me', headers=headers)
    balance2 = profile2.json()['balance']
    invested2 = profile2.json()['total_invested']
    
    print(f"   Balance after second: {balance2} AZN (expected: 60 AZN)")
    print(f"   Total invested: {invested2} AZN (expected: 140 AZN)")
    
    if balance2 != 60.0 or invested2 != 140.0:
        print("❌ Second package purchase balance/investment tracking failed")
        return False
    
    # Check package status changes
    packages2 = make_request('GET', '/packages/my', headers=headers)
    user_packages2 = packages2.json()
    
    first_pkg_status = None
    second_pkg_status = None
    
    for pkg in user_packages2:
        if pkg['id'] == first_package_id:
            first_pkg_status = pkg.get('is_active', False)
        elif pkg['id'] == second_package_id:
            second_pkg_status = pkg.get('is_active', False)
    
    print(f"   First package active: {first_pkg_status} (expected: False)")
    print(f"   Second package active: {second_pkg_status} (expected: True)")
    
    if first_pkg_status != False or second_pkg_status != True:
        print("❌ Package status changes failed")
        return False
    
    print("✅ Multiple package handling working correctly!")
    print("   ✅ First package deactivated when second purchased")
    print("   ✅ Second package is now active")
    print("   ✅ Balance deductions working for both purchases")
    print("   ✅ Total invested tracking working correctly")
    
    return True

if __name__ == "__main__":
    print("🎯 MULTIPLE PACKAGE PURCHASE TEST")
    print("=" * 60)
    
    success = test_multiple_packages()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 MULTIPLE PACKAGE TEST PASSED!")
        print("✅ Multiple package purchase flow working correctly")
    else:
        print("❌ MULTIPLE PACKAGE TEST FAILED!")
    print("=" * 60)