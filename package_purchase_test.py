#!/usr/bin/env python3
"""
URGENT: Package Purchase Balance Deduction Test
Testing the critical issue where balance is not deducted and package doesn't become active after purchase.

SPECIFIC TEST SCENARIOS:
1. Create user with sufficient balance (10 AZN bonus + admin balance addition)
2. Test Gold Package Purchase (50 AZN) - verify balance deduction and package activation
3. Test Package Activation - verify package is active and visible
4. Test Balance Validation - insufficient balance scenarios
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

print(f"🚨 URGENT: Testing Package Purchase Balance Deduction Issue")
print(f"Backend URL: {API_URL}")
print("=" * 80)

# Test data
test_user_data = {
    "email": "test.balance.user@gmail.com",
    "name": "Balans Test İstifadəçisi",
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

def test_package_purchase_balance_deduction():
    """CRITICAL TEST: Package Purchase Balance Deduction Issue"""
    print("\n🔴 CRITICAL TEST: Package Purchase Balance Deduction")
    print("Testing the reported issue where balance is not deducted after package purchase")
    
    # Step 1: Create a user with sufficient balance for testing
    print("\n📋 STEP 1: Create user with sufficient balance")
    
    # Register new user
    print("   Registering new user...")
    reg_response = make_request('POST', '/auth/register', test_user_data)
    if not reg_response or reg_response.status_code not in [200, 201]:
        print(f"❌ User registration failed: {reg_response.text if reg_response else 'No response'}")
        return False
    
    reg_data = reg_response.json()
    user_token = reg_data['access_token']
    print("   ✅ User registered successfully")
    
    # Get user profile to check initial balance
    headers = {"Authorization": f"Bearer {user_token}"}
    profile_response = make_request('GET', '/auth/me', headers=headers)
    if not profile_response or profile_response.status_code != 200:
        print("❌ Failed to get user profile")
        return False
    
    profile_data = profile_response.json()
    user_id = profile_data['id']
    user_code = profile_data['user_code']
    initial_balance = profile_data['balance']
    
    print(f"   ✅ User created: {user_code}")
    print(f"   💰 Initial balance: {initial_balance} AZN (should be 10 AZN bonus)")
    
    if initial_balance != 10.0:
        print(f"   ⚠️  Expected 10 AZN bonus, got {initial_balance} AZN")
    
    # Login admin to add more balance
    print("   Logging in admin to add balance...")
    admin_response = make_request('POST', '/auth/login', admin_credentials)
    if not admin_response or admin_response.status_code != 200:
        print("❌ Admin login failed")
        return False
    
    admin_token = admin_response.json()['access_token']
    print("   ✅ Admin logged in successfully")
    
    # Add balance via admin (make it 100 AZN total)
    print("   Adding balance via admin endpoint...")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    balance_update = {
        "user_id": user_id,
        "new_balance": 100.0,
        "notes": "Balance for package purchase testing - URGENT BUG FIX"
    }
    
    balance_response = make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
    if not balance_response or balance_response.status_code != 200:
        print("❌ Failed to update balance via admin")
        return False
    
    print("   ✅ Balance updated via admin")
    
    # Verify balance is updated
    time.sleep(1)  # Wait for update
    profile_response = make_request('GET', '/auth/me', headers=headers)
    if profile_response and profile_response.status_code == 200:
        updated_balance = profile_response.json()['balance']
        print(f"   💰 Updated balance: {updated_balance} AZN")
        
        if updated_balance != 100.0:
            print(f"   ❌ Balance update failed. Expected 100 AZN, got {updated_balance} AZN")
            return False
        else:
            print("   ✅ Balance correctly updated to 100 AZN")
    else:
        print("   ❌ Failed to verify balance update")
        return False
    
    # Step 2: Test Gold Package Purchase (50 AZN)
    print("\n📋 STEP 2: Test Gold Package Purchase (50 AZN)")
    
    # Get current balance before purchase
    pre_purchase_response = make_request('GET', '/auth/me', headers=headers)
    pre_purchase_balance = pre_purchase_response.json()['balance']
    pre_purchase_invested = pre_purchase_response.json()['total_invested']
    
    print(f"   💰 Balance before purchase: {pre_purchase_balance} AZN")
    print(f"   📊 Total invested before: {pre_purchase_invested} AZN")
    
    # Purchase Gold package with 50 AZN
    print("   Purchasing Gold package with 50 AZN...")
    purchase_data = {
        "package_type": "gold",
        "invested_amount": 50.0
    }
    
    purchase_response = make_request('POST', '/packages/purchase', purchase_data, headers)
    if not purchase_response:
        print("❌ Package purchase request failed (no response)")
        return False
    
    if purchase_response.status_code != 200:
        print(f"❌ Package purchase failed: {purchase_response.status_code} - {purchase_response.text}")
        return False
    
    purchase_result = purchase_response.json()
    package_id = purchase_result['id']
    print(f"   ✅ Package purchase API returned success")
    print(f"   📦 Package ID: {package_id}")
    print(f"   📋 Package Type: {purchase_result['package_type']}")
    print(f"   💵 Invested Amount: {purchase_result['invested_amount']} AZN")
    print(f"   🔢 Multiplier: {purchase_result['multiplier']}")
    print(f"   📅 Duration: {purchase_result['duration_days']} days")
    print(f"   ⚡ Is Active: {purchase_result['is_active']}")
    
    # CRITICAL CHECK: Verify balance is deducted
    time.sleep(2)  # Wait for balance update
    post_purchase_response = make_request('GET', '/auth/me', headers=headers)
    if not post_purchase_response or post_purchase_response.status_code != 200:
        print("❌ Failed to get user profile after purchase")
        return False
    
    post_purchase_data = post_purchase_response.json()
    post_purchase_balance = post_purchase_data['balance']
    post_purchase_invested = post_purchase_data['total_invested']
    
    print(f"\n🔍 CRITICAL BALANCE CHECK:")
    print(f"   💰 Balance before: {pre_purchase_balance} AZN")
    print(f"   💰 Balance after:  {post_purchase_balance} AZN")
    print(f"   💰 Expected after: {pre_purchase_balance - 50.0} AZN")
    print(f"   📊 Total invested before: {pre_purchase_invested} AZN")
    print(f"   📊 Total invested after:  {post_purchase_invested} AZN")
    print(f"   📊 Expected invested: {pre_purchase_invested + 50.0} AZN")
    
    balance_deducted = (pre_purchase_balance - post_purchase_balance) == 50.0
    invested_updated = (post_purchase_invested - pre_purchase_invested) == 50.0
    
    if balance_deducted:
        print("   ✅ BALANCE CORRECTLY DEDUCTED: 50 AZN deducted from balance")
    else:
        print("   ❌ BALANCE NOT DEDUCTED: This is the reported critical bug!")
        print(f"      Expected deduction: 50 AZN")
        print(f"      Actual deduction: {pre_purchase_balance - post_purchase_balance} AZN")
    
    if invested_updated:
        print("   ✅ TOTAL INVESTED CORRECTLY UPDATED")
    else:
        print("   ❌ TOTAL INVESTED NOT UPDATED")
    
    # Step 3: Test Package Activation
    print("\n📋 STEP 3: Test Package Activation")
    
    # Check if package appears in user's active packages
    print("   Checking user's active packages...")
    packages_response = make_request('GET', '/packages/my', headers=headers)
    if not packages_response or packages_response.status_code != 200:
        print("❌ Failed to get user packages")
        return False
    
    user_packages = packages_response.json()
    print(f"   📦 Total packages found: {len(user_packages)}")
    
    if len(user_packages) == 0:
        print("   ❌ NO PACKAGES FOUND: Package was not created!")
        return False
    
    # Find the purchased package
    purchased_package = None
    active_packages = []
    
    for pkg in user_packages:
        print(f"   📋 Package: {pkg['package_type']} - {pkg['invested_amount']} AZN - Active: {pkg['is_active']}")
        if pkg['id'] == package_id:
            purchased_package = pkg
        if pkg['is_active']:
            active_packages.append(pkg)
    
    if not purchased_package:
        print(f"   ❌ PURCHASED PACKAGE NOT FOUND: Package ID {package_id} not in user's packages")
        return False
    
    print(f"   ✅ Purchased package found in user's packages")
    
    # Check if package is active
    if purchased_package['is_active']:
        print("   ✅ PACKAGE IS ACTIVE: Package correctly marked as active")
    else:
        print("   ❌ PACKAGE NOT ACTIVE: Package is not marked as active!")
    
    print(f"   📊 Total active packages: {len(active_packages)}")
    
    # Verify package details
    print(f"\n🔍 PACKAGE DETAILS VERIFICATION:")
    print(f"   📦 Package ID: {purchased_package['id']}")
    print(f"   📋 Package Type: {purchased_package['package_type']}")
    print(f"   💵 Invested Amount: {purchased_package['invested_amount']} AZN")
    print(f"   🔢 Multiplier: {purchased_package['multiplier']}")
    print(f"   📅 Duration: {purchased_package['duration_days']} days")
    print(f"   💰 Accumulated Earnings: {purchased_package['accumulated_earnings']} AZN")
    print(f"   ⚡ Is Active: {purchased_package['is_active']}")
    print(f"   📅 Start Date: {purchased_package['start_date']}")
    
    # Step 4: Test Balance Validation (Insufficient Balance)
    print("\n📋 STEP 4: Test Balance Validation - Insufficient Balance")
    
    # Try to purchase another package with insufficient balance
    print("   Testing insufficient balance scenario...")
    print(f"   Current balance: {post_purchase_balance} AZN")
    print("   Attempting to purchase Gold package with 100 AZN (should fail)...")
    
    insufficient_purchase_data = {
        "package_type": "gold",
        "invested_amount": 100.0  # More than current balance
    }
    
    insufficient_response = make_request('POST', '/packages/purchase', insufficient_purchase_data, headers)
    
    if insufficient_response and insufficient_response.status_code == 400:
        error_data = insufficient_response.json()
        if "Insufficient balance" in error_data.get('detail', ''):
            print("   ✅ INSUFFICIENT BALANCE CORRECTLY REJECTED")
            print(f"      Error message: {error_data['detail']}")
        else:
            print(f"   ❌ Wrong error message: {error_data['detail']}")
    elif insufficient_response and insufficient_response.status_code == 200:
        print("   ❌ INSUFFICIENT BALANCE NOT DETECTED: Purchase should have failed!")
        return False
    else:
        print(f"   ❌ Unexpected response: {insufficient_response.status_code if insufficient_response else 'No response'}")
    
    # Step 5: Test Multiple Package Purchase (should deactivate old packages)
    print("\n📋 STEP 5: Test Multiple Package Purchase")
    
    # Add more balance for another purchase
    print("   Adding more balance for second purchase...")
    balance_update_2 = {
        "user_id": user_id,
        "new_balance": 200.0,
        "notes": "Additional balance for multiple package testing"
    }
    
    balance_response_2 = make_request('POST', '/admin/users/update-balance', balance_update_2, admin_headers)
    if balance_response_2 and balance_response_2.status_code == 200:
        print("   ✅ Additional balance added")
        time.sleep(1)
        
        # Purchase another package
        print("   Purchasing second Gold package...")
        second_purchase_data = {
            "package_type": "gold",
            "invested_amount": 75.0
        }
        
        second_response = make_request('POST', '/packages/purchase', second_purchase_data, headers)
        if second_response and second_response.status_code == 200:
            print("   ✅ Second package purchased successfully")
            
            # Check if old package is deactivated
            time.sleep(1)
            packages_response_2 = make_request('GET', '/packages/my', headers=headers)
            if packages_response_2 and packages_response_2.status_code == 200:
                updated_packages = packages_response_2.json()
                active_count = sum(1 for pkg in updated_packages if pkg['is_active'])
                
                print(f"   📦 Total packages after second purchase: {len(updated_packages)}")
                print(f"   ⚡ Active packages: {active_count}")
                
                if active_count == 1:
                    print("   ✅ OLD PACKAGE CORRECTLY DEACTIVATED: Only one active package")
                else:
                    print(f"   ❌ MULTIPLE ACTIVE PACKAGES: Expected 1, found {active_count}")
                
                # Show package statuses
                for pkg in updated_packages:
                    status = "ACTIVE" if pkg['is_active'] else "INACTIVE"
                    print(f"      📋 {pkg['package_type']} - {pkg['invested_amount']} AZN - {status}")
    
    # Final Results Summary
    print("\n" + "=" * 80)
    print("📊 PACKAGE PURCHASE BALANCE DEDUCTION TEST RESULTS")
    print("=" * 80)
    
    results = []
    
    # Check all critical aspects
    if balance_deducted:
        results.append("✅ Balance correctly deducted after purchase")
    else:
        results.append("❌ CRITICAL: Balance not deducted after purchase")
    
    if invested_updated:
        results.append("✅ Total invested correctly updated")
    else:
        results.append("❌ Total invested not updated")
    
    if purchased_package and purchased_package['is_active']:
        results.append("✅ Package correctly marked as active")
    else:
        results.append("❌ CRITICAL: Package not active after purchase")
    
    if len(user_packages) > 0:
        results.append("✅ Package appears in user's package list")
    else:
        results.append("❌ CRITICAL: Package not created")
    
    # Print results
    for result in results:
        print(result)
    
    # Determine overall success
    critical_issues = [r for r in results if r.startswith("❌ CRITICAL")]
    
    print(f"\n📈 SUMMARY:")
    if len(critical_issues) == 0:
        print("🎉 ALL CRITICAL TESTS PASSED!")
        print("✅ Package purchase balance deduction is working correctly")
        return True
    else:
        print(f"🚨 {len(critical_issues)} CRITICAL ISSUES FOUND:")
        for issue in critical_issues:
            print(f"   {issue}")
        print("❌ Package purchase balance deduction has critical bugs")
        return False

if __name__ == "__main__":
    success = test_package_purchase_balance_deduction()
    if success:
        print("\n✅ Package purchase balance deduction test PASSED")
    else:
        print("\n❌ Package purchase balance deduction test FAILED")