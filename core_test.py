#!/usr/bin/env python3
"""
CORE PACKAGE PURCHASE BALANCE DEDUCTION TEST
Focus on the essential functionality requested in the review.
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

print(f"🎯 CORE PACKAGE PURCHASE BALANCE DEDUCTION TEST")
print(f"Backend URL: {API_URL}")
print("=" * 80)

def make_request(method, endpoint, data=None, headers=None):
    """Make HTTP request with error handling"""
    url = f"{API_URL}{endpoint}"
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=15)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=15)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return response
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed for {method} {endpoint}: {e}")
        return None

def test_core_functionality():
    """Test the core package purchase functionality"""
    
    # Test data
    test_user = {
        "email": "core.test.user@example.com",
        "name": "Core Test User", 
        "password": "testpass123"
    }
    
    admin_credentials = {
        "email": "admin@investaz.com",
        "password": "18061999"
    }
    
    print("\n🔧 SETUP: Creating test environment")
    
    # Register new user
    reg_response = make_request('POST', '/auth/register', test_user)
    if not reg_response or reg_response.status_code not in [200, 201]:
        print(f"❌ User registration failed")
        return False
    
    reg_data = reg_response.json()
    user_token = reg_data['access_token']
    print("✅ User registered successfully")
    
    # Get user profile
    headers = {"Authorization": f"Bearer {user_token}"}
    profile_response = make_request('GET', '/auth/me', headers=headers)
    if not profile_response or profile_response.status_code != 200:
        print(f"❌ Failed to get user profile")
        return False
    
    profile_data = profile_response.json()
    user_id = profile_data['id']
    initial_balance = profile_data['balance']
    initial_invested = profile_data['total_invested']
    
    print(f"✅ User profile retrieved:")
    print(f"   User ID: {user_id}")
    print(f"   User Code: {profile_data['user_code']}")
    print(f"   Initial Balance: {initial_balance} AZN")
    print(f"   Initial Invested: {initial_invested} AZN")
    
    # Verify registration bonus
    if initial_balance != 10.0:
        print(f"❌ Registration bonus issue: Expected 10 AZN, got {initial_balance} AZN")
        return False
    
    print("✅ Registration bonus working correctly (10 AZN)")
    
    # Login admin
    admin_response = make_request('POST', '/auth/login', admin_credentials)
    if not admin_response or admin_response.status_code != 200:
        print(f"❌ Admin login failed")
        return False
    
    admin_data = admin_response.json()
    admin_token = admin_data['access_token']
    print("✅ Admin logged in successfully")
    
    # Update user balance to 100 AZN
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    balance_update = {
        "user_id": user_id,
        "new_balance": 100.0,
        "notes": "Core test - balance for package purchase"
    }
    
    balance_response = make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
    if not balance_response or balance_response.status_code != 200:
        print(f"❌ Failed to update user balance")
        return False
    
    print("✅ Admin balance update successful")
    
    # Verify balance update
    time.sleep(1)
    updated_profile = make_request('GET', '/auth/me', headers=headers)
    if updated_profile and updated_profile.status_code == 200:
        updated_data = updated_profile.json()
        updated_balance = updated_data['balance']
        if updated_balance == 100.0:
            print(f"✅ Balance verified: {updated_balance} AZN")
        else:
            print(f"❌ Balance update failed: Expected 100 AZN, got {updated_balance} AZN")
            return False
    
    print("\n🎯 CORE TEST: Package Purchase with Balance Deduction")
    
    # Purchase Gold package (50 AZN)
    gold_purchase = {
        "package_type": "gold",
        "invested_amount": 50.0
    }
    
    print("   Purchasing Gold package (50 AZN)...")
    purchase_response = make_request('POST', '/packages/purchase', gold_purchase, headers)
    if not purchase_response or purchase_response.status_code != 200:
        print(f"❌ Package purchase failed: {purchase_response.status_code if purchase_response else 'No response'}")
        if purchase_response:
            print(f"   Error details: {purchase_response.text}")
        return False
    
    purchase_data = purchase_response.json()
    package_id = purchase_data['id']
    
    print(f"✅ Package purchased successfully!")
    print(f"   Package ID: {package_id}")
    print(f"   Package Type: {purchase_data['package_type']}")
    print(f"   Invested Amount: {purchase_data['invested_amount']} AZN")
    print(f"   Multiplier: {purchase_data['multiplier']}")
    print(f"   Duration: {purchase_data['duration_days']} days")
    print(f"   Is Active: {purchase_data['is_active']}")
    
    # Verify package is active
    if not purchase_data.get('is_active', False):
        print("❌ CRITICAL: Package is not active after purchase!")
        return False
    
    print("🎉 CRITICAL SUCCESS: Package is active (is_active: true)")
    
    # Verify balance deduction
    time.sleep(1)
    post_purchase_profile = make_request('GET', '/auth/me', headers=headers)
    if not post_purchase_profile or post_purchase_profile.status_code != 200:
        print("❌ Failed to get profile after purchase")
        return False
    
    post_data = post_purchase_profile.json()
    final_balance = post_data['balance']
    final_invested = post_data['total_invested']
    
    print(f"\n📊 BALANCE VERIFICATION:")
    print(f"   Before purchase: 100.0 AZN")
    print(f"   After purchase: {final_balance} AZN")
    print(f"   Expected after: 50.0 AZN")
    print(f"   Deduction amount: {100.0 - final_balance} AZN")
    
    if final_balance != 50.0:
        print(f"❌ CRITICAL FAILURE: Balance deduction failed!")
        print(f"   Expected: 50.0 AZN, Got: {final_balance} AZN")
        return False
    
    print("🎉 CRITICAL SUCCESS: Balance deduction working correctly!")
    
    print(f"\n📊 INVESTMENT TRACKING:")
    print(f"   Before purchase: {initial_invested} AZN")
    print(f"   After purchase: {final_invested} AZN")
    print(f"   Expected after: 50.0 AZN")
    
    if final_invested != 50.0:
        print(f"❌ CRITICAL FAILURE: Total invested not updated!")
        print(f"   Expected: 50.0 AZN, Got: {final_invested} AZN")
        return False
    
    print("🎉 CRITICAL SUCCESS: Total invested updated correctly!")
    
    # Verify package visibility
    print(f"\n📊 PACKAGE VISIBILITY TEST:")
    packages_response = make_request('GET', '/packages/my', headers=headers)
    if not packages_response or packages_response.status_code != 200:
        print("❌ Failed to get user packages")
        return False
    
    user_packages = packages_response.json()
    active_packages = [pkg for pkg in user_packages if pkg.get('is_active', False)]
    
    print(f"   Total packages: {len(user_packages)}")
    print(f"   Active packages: {len(active_packages)}")
    
    if len(active_packages) != 1:
        print(f"❌ Expected 1 active package, found {len(active_packages)}")
        return False
    
    active_pkg = active_packages[0]
    if active_pkg['id'] != package_id:
        print(f"❌ Active package ID mismatch")
        return False
    
    print("🎉 CRITICAL SUCCESS: Package visibility working correctly!")
    print(f"   Active package: {active_pkg['package_type']} - {active_pkg['invested_amount']} AZN")
    
    return True

def run_core_test():
    """Run the core functionality test"""
    print("🚀 STARTING CORE PACKAGE PURCHASE TEST")
    print("Testing the essential functionality reported in user complaint")
    print("=" * 80)
    
    success = test_core_functionality()
    
    print("\n" + "=" * 80)
    print("📊 CORE TEST RESULTS")
    print("=" * 80)
    
    if success:
        print("🎉 ALL CORE TESTS PASSED!")
        print("")
        print("✅ VERIFIED FUNCTIONALITY:")
        print("   ✅ User registration with 10 AZN bonus")
        print("   ✅ Admin balance management working")
        print("   ✅ Package purchase successful")
        print("   ✅ Balance deduction working (100 → 50 AZN)")
        print("   ✅ Package activation working (is_active: true)")
        print("   ✅ Total invested tracking working (0 → 50 AZN)")
        print("   ✅ Package visibility working")
        print("")
        print("🎯 USER COMPLAINT STATUS: RESOLVED")
        print("   'müşteri paket satın aldıktan sonra balansında para çıksın paket aktifleşsin'")
        print("   ✅ Customer balance IS deducted after package purchase")
        print("   ✅ Package DOES become active after purchase")
        print("")
        print("🏆 CONCLUSION: Package purchase flow is working correctly!")
        
    else:
        print("❌ CORE TESTS FAILED!")
        print("   The package purchase flow has critical issues")
        print("   User complaint is NOT resolved")
    
    print("=" * 80)
    return success

if __name__ == "__main__":
    run_core_test()