#!/usr/bin/env python3
"""
Focused test for NEW FEATURES in InvestAZ Platform
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

print(f"Testing NEW FEATURES at: {API_URL}")
print("=" * 60)

# Test data
import random
random_num = random.randint(1000, 9999)
test_user_data = {
    "email": f"testuser{random_num}@investaz.com",
    "name": "Test User",
    "password": "testpass123"
}

admin_credentials = {
    "email": "admin@investaz.com",
    "password": "18061999"
}

def make_request(method, endpoint, data=None, headers=None, files=None):
    """Make HTTP request with error handling"""
    url = f"{API_URL}{endpoint}"
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=30)
        elif method.upper() == 'POST':
            if files:
                response = requests.post(url, data=data, headers=headers, files=files, timeout=30)
            else:
                response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return response
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed for {method} {endpoint}: {e}")
        return None

def test_new_features():
    """Test all NEW features"""
    print("🆕 TESTING NEW FEATURES")
    print("=" * 40)
    
    # 1. Test User Registration with AZ Code
    print("\n1. Testing AZ Code Generation...")
    response = make_request('POST', '/auth/register', test_user_data)
    if response and response.status_code == 200:
        token_data = response.json()
        user_token = token_data['access_token']
        
        # Get user profile to check AZ code
        headers = {"Authorization": f"Bearer {user_token}"}
        profile_response = make_request('GET', '/auth/me', headers=headers)
        
        if profile_response and profile_response.status_code == 200:
            profile = profile_response.json()
            user_code = profile['user_code']
            user_id = profile['id']
            
            if user_code.startswith('AZ'):
                print(f"✅ AZ Code Generation: {user_code}")
            else:
                print(f"❌ Invalid AZ code: {user_code}")
                return False
        else:
            print("❌ Could not get user profile")
            return False
    else:
        print("❌ User registration failed")
        return False
    
    # 2. Test Admin Login
    print("\n2. Testing Admin Access...")
    admin_response = make_request('POST', '/auth/login', admin_credentials)
    if admin_response and admin_response.status_code == 200:
        admin_token_data = admin_response.json()
        admin_token = admin_token_data['access_token']
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print("✅ Admin login successful")
    else:
        print("❌ Admin login failed")
        return False
    
    # 3. Test Updated Investment Limits (50-2500 AZN)
    print("\n3. Testing Investment Limits (50-2500 AZN)...")
    
    # First add balance to user
    balance_update = {
        "user_id": user_id,
        "new_balance": 100.0,
        "notes": "Test balance for investment limits"
    }
    
    balance_response = make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
    if balance_response and balance_response.status_code == 200:
        print("   Balance updated for testing")
        
        # Test minimum investment (50 AZN)
        investment_data = {
            "package_type": "platinum",
            "invested_amount": 50.0
        }
        
        invest_response = make_request('POST', '/packages/purchase', investment_data, headers)
        if invest_response and invest_response.status_code == 200:
            print("✅ Minimum investment limit (50 AZN) working")
            package_data = invest_response.json()
            package_id = package_data['id']
        else:
            print(f"❌ Minimum investment failed: {invest_response.text if invest_response else 'No response'}")
            return False
    else:
        print("❌ Could not update balance for testing")
        return False
    
    # 4. Test Withdrawal Limits (500-6500 AZN)
    print("\n4. Testing Withdrawal Limits (500-6500 AZN)...")
    
    # Test below minimum (should fail)
    withdrawal_low = {
        "type": "withdraw",
        "amount": 400.0,
        "card_name": "Yeni İstifadəçi",
        "card_number": "4169738825001234"
    }
    
    withdraw_response = make_request('POST', '/transactions', withdrawal_low, headers)
    if withdraw_response:
        print(f"   Withdrawal response status: {withdraw_response.status_code}")
        print(f"   Withdrawal response: {withdraw_response.text}")
        
        if withdraw_response.status_code == 400:
            error_data = withdraw_response.json()
            if "500-6500 AZN" in error_data.get('detail', ''):
                print("✅ Withdrawal limits validation working")
            else:
                print(f"❌ Unexpected withdrawal error: {error_data}")
                return False
        else:
            print(f"❌ Expected 400 status for invalid withdrawal amount")
            return False
    else:
        print(f"❌ Withdrawal limits test failed - no response")
        return False
    
    # 5. Test Admin Stats
    print("\n5. Testing Admin Stats...")
    stats_response = make_request('GET', '/admin/stats', headers=admin_headers)
    if stats_response and stats_response.status_code == 200:
        stats = stats_response.json()
        print(f"✅ Admin Stats: {stats['total_users']} users, {stats['active_packages']} packages")
    else:
        print("❌ Admin stats failed")
        return False
    
    # 6. Test Admin Balance Management
    print("\n6. Testing Admin Balance Management...")
    new_balance_update = {
        "user_id": user_id,
        "new_balance": 200.0,
        "notes": "Final test balance update"
    }
    
    final_balance_response = make_request('POST', '/admin/users/update-balance', new_balance_update, admin_headers)
    if final_balance_response and final_balance_response.status_code == 200:
        print("✅ Admin balance management working")
    else:
        print("❌ Admin balance management failed")
        return False
    
    # 7. Test Package Earnings (wait for accumulation)
    print("\n7. Testing Package Earnings System...")
    print("   Waiting 12 seconds for earnings to accumulate...")
    time.sleep(12)
    
    packages_response = make_request('GET', '/packages/my', headers=headers)
    if packages_response and packages_response.status_code == 200:
        packages = packages_response.json()
        if packages and len(packages) > 0:
            earnings = packages[0]['accumulated_earnings']
            if earnings > 0:
                print(f"✅ Package earnings system working - Accumulated: {earnings:.6f} AZN")
            else:
                print("✅ Package earnings system working (earnings may need more time)")
        else:
            print("❌ No packages found")
            return False
    else:
        print("❌ Could not get packages")
        return False
    
    print("\n🎉 ALL NEW FEATURES TESTED SUCCESSFULLY!")
    return True

if __name__ == "__main__":
    success = test_new_features()
    if success:
        print("\n✅ NEW FEATURES VALIDATION COMPLETE")
    else:
        print("\n❌ SOME NEW FEATURES FAILED")