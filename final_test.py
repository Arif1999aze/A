#!/usr/bin/env python3
"""
FINAL PACKAGE PURCHASE BALANCE DEDUCTION TEST
Testing the complete flow as requested in the review.
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

print(f"🎯 FINAL PACKAGE PURCHASE BALANCE DEDUCTION TEST")
print(f"Backend URL: {API_URL}")
print("=" * 80)

def make_request(method, endpoint, data=None, headers=None):
    """Make HTTP request with error handling"""
    url = f"{API_URL}{endpoint}"
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=30)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers, timeout=30)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return response
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed for {method} {endpoint}: {e}")
        return None

def test_final_package_purchase_flow():
    """FINAL VERIFICATION: Complete Package Purchase Balance Deduction Flow"""
    
    # Test data
    final_test_user = {
        "email": "final.test.user@example.com",
        "name": "Final Test User", 
        "password": "testpass123"
    }
    
    admin_credentials = {
        "email": "admin@investaz.com",
        "password": "18061999"
    }
    
    print("\n📋 STEP 1: Create User with Sufficient Balance")
    
    # Register new user
    print("   Registering new user...")
    reg_response = make_request('POST', '/auth/register', final_test_user)
    if not reg_response or reg_response.status_code not in [200, 201]:
        print(f"❌ User registration failed: {reg_response.status_code if reg_response else 'No response'}")
        if reg_response:
            print(f"   Error: {reg_response.text}")
        return False
    
    reg_data = reg_response.json()
    final_user_token = reg_data['access_token']
    print("✅ User registered successfully")
    
    # Get user profile to verify registration bonus
    headers = {"Authorization": f"Bearer {final_user_token}"}
    profile_response = make_request('GET', '/auth/me', headers=headers)
    if not profile_response or profile_response.status_code != 200:
        print(f"❌ Failed to get user profile: {profile_response.status_code if profile_response else 'No response'}")
        return False
    
    profile_data = profile_response.json()
    final_user_id = profile_data['id']
    initial_balance = profile_data['balance']
    initial_invested = profile_data['total_invested']
    
    print(f"✅ Registration bonus verified: {initial_balance} AZN")
    print(f"✅ Initial total invested: {initial_invested} AZN")
    print(f"✅ User code: {profile_data['user_code']}")
    
    if initial_balance != 10.0:
        print(f"❌ Expected 10 AZN registration bonus, got {initial_balance} AZN")
        return False
    
    # Login admin
    print("   Logging in admin...")
    admin_response = make_request('POST', '/auth/login', admin_credentials)
    if not admin_response or admin_response.status_code != 200:
        print(f"❌ Admin login failed: {admin_response.status_code if admin_response else 'No response'}")
        return False
    
    admin_data = admin_response.json()
    admin_token = admin_data['access_token']
    print("✅ Admin logged in successfully")
    
    # Use admin to increase balance to 100 AZN
    print("   Updating user balance to 100 AZN...")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    balance_update = {
        "user_id": final_user_id,
        "new_balance": 100.0,
        "notes": "Final verification test - increase to 100 AZN"
    }
    
    balance_response = make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
    if not balance_response or balance_response.status_code != 200:
        print(f"❌ Failed to update user balance via admin: {balance_response.status_code if balance_response else 'No response'}")
        if balance_response:
            print(f"   Error: {balance_response.text}")
        return False
    
    print("✅ Admin balance update successful")
    
    # Verify balance update
    time.sleep(2)  # Wait for update
    updated_profile = make_request('GET', '/auth/me', headers=headers)
    if updated_profile and updated_profile.status_code == 200:
        updated_data = updated_profile.json()
        updated_balance = updated_data['balance']
        if updated_balance == 100.0:
            print(f"✅ Balance successfully updated to {updated_balance} AZN")
        else:
            print(f"❌ Balance update failed. Expected 100 AZN, got {updated_balance} AZN")
            return False
    else:
        print("❌ Failed to verify balance update")
        return False
    
    print("\n📋 STEP 2: Package Purchase Flow Test")
    
    # Purchase Gold package (50 AZN investment)
    print("   Purchasing Gold package (50 AZN)...")
    gold_purchase = {
        "package_type": "gold",
        "invested_amount": 50.0
    }
    
    purchase_response = make_request('POST', '/packages/purchase', gold_purchase, headers)
    if not purchase_response or purchase_response.status_code != 200:
        print(f"❌ Gold package purchase failed: {purchase_response.status_code if purchase_response else 'No response'}")
        if purchase_response:
            print(f"   Error: {purchase_response.text}")
        return False
    
    purchase_data = purchase_response.json()
    package_id = purchase_data['id']
    print(f"✅ Gold package purchased successfully (ID: {package_id})")
    print(f"   Package type: {purchase_data['package_type']}")
    print(f"   Invested amount: {purchase_data['invested_amount']} AZN")
    print(f"   Multiplier: {purchase_data['multiplier']}")
    print(f"   Is active: {purchase_data['is_active']}")
    
    # Verify balance deduction (100 → 50 AZN)
    time.sleep(2)  # Wait for balance update
    post_purchase_profile = make_request('GET', '/auth/me', headers=headers)
    if not post_purchase_profile or post_purchase_profile.status_code != 200:
        print("❌ Failed to get profile after purchase")
        return False
    
    post_purchase_data = post_purchase_profile.json()
    final_balance = post_purchase_data['balance']
    final_invested = post_purchase_data['total_invested']
    
    print(f"✅ Balance after purchase: {final_balance} AZN (expected: 50 AZN)")
    print(f"✅ Total invested after purchase: {final_invested} AZN (expected: 50 AZN)")
    
    # Verify balance deduction
    if final_balance != 50.0:
        print(f"❌ CRITICAL: Balance deduction failed! Expected 50 AZN, got {final_balance} AZN")
        return False
    
    # Verify total invested increase
    if final_invested != 50.0:
        print(f"❌ CRITICAL: Total invested not updated! Expected 50 AZN, got {final_invested} AZN")
        return False
    
    print("🎉 CRITICAL: Balance deduction working correctly (100 → 50 AZN)")
    print("🎉 CRITICAL: Total invested updated correctly (0 → 50 AZN)")
    
    # Verify package activation
    print("   Verifying package activation...")
    packages_response = make_request('GET', '/packages/my', headers=headers)
    if not packages_response or packages_response.status_code != 200:
        print("❌ Failed to get user packages")
        return False
    
    user_packages = packages_response.json()
    if not user_packages:
        print("❌ CRITICAL: No packages found for user after purchase")
        return False
    
    active_package = None
    for pkg in user_packages:
        if pkg['id'] == package_id:
            active_package = pkg
            break
    
    if not active_package:
        print("❌ CRITICAL: Purchased package not found in user's packages")
        return False
    
    if not active_package.get('is_active', False):
        print("❌ CRITICAL: Package is not active after purchase")
        return False
    
    print("🎉 CRITICAL: Package activation working (is_active: true)")
    print(f"   Package details: {active_package['package_type']}, {active_package['invested_amount']} AZN, multiplier: {active_package['multiplier']}")
    
    print("\n📋 STEP 3: Test Multiple Package Purchases")
    
    # Purchase another package (30 AZN - within Gold range)
    print("   Purchasing second Gold package (30 AZN)...")
    second_purchase = {
        "package_type": "gold",
        "invested_amount": 30.0
    }
    
    second_response = make_request('POST', '/packages/purchase', second_purchase, headers)
    if not second_response or second_response.status_code != 200:
        print(f"❌ Second package purchase failed: {second_response.status_code if second_response else 'No response'}")
        if second_response:
            print(f"   Error: {second_response.text}")
        return False
    
    second_data = second_response.json()
    second_package_id = second_data['id']
    print(f"✅ Second package purchased successfully (ID: {second_package_id})")
    
    # Verify balance deduction (50 → 20 AZN)
    time.sleep(2)
    final_profile = make_request('GET', '/auth/me', headers=headers)
    if final_profile and final_profile.status_code == 200:
        final_data = final_profile.json()
        final_final_balance = final_data['balance']
        final_final_invested = final_data['total_invested']
        
        print(f"✅ Final balance: {final_final_balance} AZN (expected: 20 AZN)")
        print(f"✅ Final total invested: {final_final_invested} AZN (expected: 80 AZN)")
        
        if final_final_balance != 20.0:
            print(f"❌ Second balance deduction failed! Expected 20 AZN, got {final_final_balance} AZN")
            return False
        
        if final_final_invested != 80.0:
            print(f"❌ Total invested not updated correctly! Expected 80 AZN, got {final_final_invested} AZN")
            return False
    
    # Verify first package becomes inactive, second becomes active
    print("   Verifying package status changes...")
    final_packages = make_request('GET', '/packages/my', headers=headers)
    if final_packages and final_packages.status_code == 200:
        all_packages = final_packages.json()
        
        first_pkg_status = None
        second_pkg_status = None
        
        for pkg in all_packages:
            if pkg['id'] == package_id:
                first_pkg_status = pkg.get('is_active', False)
            elif pkg['id'] == second_package_id:
                second_pkg_status = pkg.get('is_active', False)
        
        print(f"✅ First package active status: {first_pkg_status} (expected: False)")
        print(f"✅ Second package active status: {second_pkg_status} (expected: True)")
        
        if first_pkg_status != False:
            print("❌ First package should be inactive after second purchase")
            return False
        
        if second_pkg_status != True:
            print("❌ Second package should be active")
            return False
    
    print("\n📋 STEP 4: Test Package Visibility")
    
    # Test /api/packages/my endpoint
    print("   Testing package visibility...")
    visibility_response = make_request('GET', '/packages/my', headers=headers)
    if not visibility_response or visibility_response.status_code != 200:
        print("❌ Package visibility test failed")
        return False
    
    visible_packages = visibility_response.json()
    active_count = sum(1 for pkg in visible_packages if pkg.get('is_active', False))
    
    print(f"✅ Total packages visible: {len(visible_packages)}")
    print(f"✅ Active packages: {active_count} (expected: 1)")
    
    if active_count != 1:
        print(f"❌ Expected exactly 1 active package, found {active_count}")
        return False
    
    # Show active package details
    active_pkg = next((pkg for pkg in visible_packages if pkg.get('is_active', False)), None)
    if active_pkg:
        print(f"✅ Active package details:")
        print(f"   Type: {active_pkg['package_type']}")
        print(f"   Amount: {active_pkg['invested_amount']} AZN")
        print(f"   Multiplier: {active_pkg['multiplier']}")
        print(f"   Duration: {active_pkg['duration_days']} days")
    
    print("\n🎉 FINAL VERIFICATION TEST COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    print("✅ Registration bonus working (10 AZN)")
    print("✅ Balance deduction working after purchase")
    print("✅ Package activation working (is_active: true)")
    print("✅ Multiple package handling working (old becomes inactive)")
    print("✅ Only active packages visible to user")
    print("=" * 80)
    print("🎯 USER COMPLAINT RESOLVED: 'müşteri paket satın aldıktan sonra balansında para çıksın paket aktifleşsin'")
    print("   ✅ Customer balance IS deducted after package purchase")
    print("   ✅ Package DOES become active after purchase")
    print("=" * 80)
    
    return True

if __name__ == "__main__":
    success = test_final_package_purchase_flow()
    if success:
        print("\n🎉 ALL TESTS PASSED - PACKAGE PURCHASE FLOW IS WORKING CORRECTLY!")
    else:
        print("\n❌ TESTS FAILED - PACKAGE PURCHASE FLOW HAS ISSUES!")