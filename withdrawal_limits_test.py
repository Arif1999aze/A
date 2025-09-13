#!/usr/bin/env python3
"""
Specific test for withdrawal limits validation
"""

import requests
import json
import random
from pathlib import Path

# Get backend URL from frontend .env file
def get_backend_url():
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "https://investaz-preview.preview.emergentagent.com"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

print(f"Testing Withdrawal Limits at: {API_URL}")
print("=" * 60)

# Test data with unique email
random_num = random.randint(10000, 99999)
test_user_data = {
    "email": f"withdrawtest{random_num}@investaz.com",
    "name": "Withdrawal Test User",
    "password": "withdrawtest123"
}

admin_credentials = {
    "email": "admin@investaz.com",
    "password": "18061999"
}

def make_request(method, endpoint, data=None, headers=None):
    """Make HTTP request with error handling"""
    url = f"{API_URL}{endpoint}"
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=30)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return response
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed for {method} {endpoint}: {e}")
        return None

def test_withdrawal_limits():
    """Test withdrawal limits specifically"""
    
    # 1. Register user
    print("1. Registering test user...")
    response = make_request('POST', '/auth/register', test_user_data)
    if not response or response.status_code != 200:
        print("❌ User registration failed")
        return False
    
    token_data = response.json()
    user_token = token_data['access_token']
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Get user ID
    profile_response = make_request('GET', '/auth/me', headers=headers)
    if not profile_response or profile_response.status_code != 200:
        print("❌ Could not get user profile")
        return False
    
    profile = profile_response.json()
    user_id = profile['id']
    print(f"✅ User registered with ID: {user_id}")
    
    # 2. Admin login
    print("\n2. Admin login...")
    admin_response = make_request('POST', '/auth/login', admin_credentials)
    if not admin_response or admin_response.status_code != 200:
        print("❌ Admin login failed")
        return False
    
    admin_token_data = admin_response.json()
    admin_token = admin_token_data['access_token']
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("✅ Admin login successful")
    
    # 3. Give user high balance for withdrawal testing
    print("\n3. Setting high balance for withdrawal testing...")
    balance_update = {
        "user_id": user_id,
        "new_balance": 10000.0,  # High balance to avoid insufficient balance error
        "notes": "High balance for withdrawal limits testing"
    }
    
    balance_response = make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
    if not balance_response or balance_response.status_code != 200:
        print("❌ Could not update balance")
        return False
    
    print("✅ Balance set to 10,000 AZN")
    
    # 4. Test withdrawal below minimum (should fail with limits error)
    print("\n4. Testing withdrawal below minimum (400 AZN)...")
    withdrawal_low = {
        "type": "withdraw",
        "amount": 400.0,
        "card_name": "Withdrawal Test User",
        "card_number": "4169738825001234"
    }
    
    withdraw_response = make_request('POST', '/transactions', withdrawal_low, headers)
    if withdraw_response:
        print(f"   Status: {withdraw_response.status_code}")
        print(f"   Response: {withdraw_response.text}")
        
        if withdraw_response.status_code == 400:
            error_data = withdraw_response.json()
            if "500-6500 AZN" in error_data.get('detail', ''):
                print("✅ Minimum withdrawal limit (500 AZN) validation working")
            else:
                print(f"❌ Unexpected error: {error_data}")
                return False
        else:
            print("❌ Expected 400 status for below minimum withdrawal")
            return False
    else:
        print("❌ No response for withdrawal test")
        return False
    
    # 5. Test withdrawal above maximum (should fail with limits error)
    print("\n5. Testing withdrawal above maximum (7000 AZN)...")
    withdrawal_high = {
        "type": "withdraw",
        "amount": 7000.0,
        "card_name": "Withdrawal Test User",
        "card_number": "4169738825001234"
    }
    
    withdraw_response2 = make_request('POST', '/transactions', withdrawal_high, headers)
    if withdraw_response2:
        print(f"   Status: {withdraw_response2.status_code}")
        print(f"   Response: {withdraw_response2.text}")
        
        if withdraw_response2.status_code == 400:
            error_data = withdraw_response2.json()
            if "500-6500 AZN" in error_data.get('detail', ''):
                print("✅ Maximum withdrawal limit (6500 AZN) validation working")
            else:
                print(f"❌ Unexpected error: {error_data}")
                return False
        else:
            print("❌ Expected 400 status for above maximum withdrawal")
            return False
    else:
        print("❌ No response for withdrawal test")
        return False
    
    # 6. Test valid withdrawal (should succeed)
    print("\n6. Testing valid withdrawal (1000 AZN)...")
    withdrawal_valid = {
        "type": "withdraw",
        "amount": 1000.0,
        "card_name": "Withdrawal Test User",
        "card_number": "4169738825001234"
    }
    
    withdraw_response3 = make_request('POST', '/transactions', withdrawal_valid, headers)
    if withdraw_response3:
        print(f"   Status: {withdraw_response3.status_code}")
        
        if withdraw_response3.status_code == 200:
            print("✅ Valid withdrawal (1000 AZN) accepted")
            return True
        else:
            print(f"❌ Valid withdrawal failed: {withdraw_response3.text}")
            return False
    else:
        print("❌ No response for valid withdrawal test")
        return False

if __name__ == "__main__":
    success = test_withdrawal_limits()
    if success:
        print("\n🎉 WITHDRAWAL LIMITS VALIDATION WORKING CORRECTLY!")
    else:
        print("\n❌ WITHDRAWAL LIMITS VALIDATION FAILED")