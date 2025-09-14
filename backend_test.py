#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for InvestAZ Platform - 12-HOUR COLLECTION SYSTEM TESTING
Focus on the updated backend collection system with 12-hour cooldown:

CRITICAL TESTING SCOPE:
1. **Collection Cooldown System (CRITICAL)**:
   - Test COLLECTION_COOLDOWN_MINUTES = 720 (12 hours) is working correctly
   - Verify /api/packages/{package_id}/collect endpoint respects 12-hour cooldown
   - Test error messages show proper hour/minute format instead of just minutes
   - Ensure users can collect earnings twice per day (12-hour intervals)

2. **Collection Status Endpoint**:
   - Test /api/packages/{package_id}/collection-status returns correct cooldown information
   - Verify can_collect status is accurate for 12-hour system
   - Check cooldown_remaining_seconds calculation is correct

3. **Package Purchase Flow**:
   - Ensure package purchase still works correctly with the updated system
   - Verify new packages start with null last_collection_time
   - Test first collection is immediately available after package purchase

4. **Error Handling**:
   - Test cooldown error messages are user-friendly and show hours/minutes
   - Verify collection attempts during cooldown period are properly rejected

5. **Earnings Calculation**:
   - Ensure accumulated_earnings are calculated correctly
   - Test that earnings collection adds to user balance and total_earned properly
"""

import requests
import json
import os
import time
import websocket
import threading
from datetime import datetime, timedelta
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

print(f"Testing InvestAZ Backend API at: {API_URL}")
print("=" * 60)

# Test data - Using realistic data as per requirements
import random
import time as time_module

# Generate unique email addresses to avoid conflicts
timestamp = int(time_module.time())
random_suffix = random.randint(1000, 9999)

test_user_data = {
    "email": f"aysel.mammadova.{timestamp}.{random_suffix}@gmail.com",
    "name": "Aysel Mammadova", 
    "password": "securepass123"
}

collection_test_user_data = {
    "email": f"collection.test.user.{timestamp}.{random_suffix}@example.com",
    "name": "Collection Test User",
    "password": "testpass123"
}

admin_credentials = {
    "email": "admin@investaz.com",
    "password": "18061999"
}

# Global variables for tokens and test data
user_token = None
admin_token = None
test_user_id = None
test_user_code = None

def make_request(method, endpoint, data=None, headers=None, files=None):
    """Make HTTP request with error handling"""
    url = f"{API_URL}{endpoint}"
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=60)
        elif method.upper() == 'POST':
            if files:
                response = requests.post(url, data=data, headers=headers, files=files, timeout=60)
            else:
                response = requests.post(url, json=data, headers=headers, timeout=60)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers, timeout=60)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=60)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return response
    except requests.exceptions.Timeout:
        print(f"❌ Request timeout for {method} {endpoint}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed for {method} {endpoint}: {e}")
        return None

def setup_test_environment():
    """Setup test environment with user and admin tokens"""
    global user_token, admin_token, test_user_id, test_user_code
    
    print("\n🔧 Setting up test environment...")
    
    # Register test user
    print(f"   Registering user: {test_user_data['email']}")
    response = make_request('POST', '/auth/register', test_user_data)
    if response and response.status_code in [200, 201]:
        data = response.json()
        user_token = data.get('access_token')
        
        # Get user profile
        headers = {"Authorization": f"Bearer {user_token}"}
        profile_response = make_request('GET', '/auth/me', headers=headers)
        if profile_response and profile_response.status_code == 200:
            profile_data = profile_response.json()
            test_user_id = profile_data['id']
            test_user_code = profile_data['user_code']
            print(f"✅ Test user created: {test_user_code}")
        else:
            print(f"❌ Failed to get user profile: {profile_response.status_code if profile_response else 'No response'}")
            return False
    else:
        print(f"❌ User registration failed: {response.status_code if response else 'No response'}")
        if response:
            print(f"   Error details: {response.text}")
        return False
    
    # Login admin
    admin_response = make_request('POST', '/auth/login', admin_credentials)
    if admin_response and admin_response.status_code == 200:
        admin_data = admin_response.json()
        admin_token = admin_data.get('access_token')
        print(f"✅ Admin logged in successfully")
    else:
        print(f"❌ Admin login failed: {admin_response.status_code if admin_response else 'No response'}")
        if admin_response:
            print(f"   Error details: {admin_response.text}")
        return False
    
    return user_token and admin_token

def test_collection_cooldown_system():
    """CRITICAL TEST 1: Collection Cooldown System (12-hour system)"""
    print("\n🔴 CRITICAL TEST 1: Collection Cooldown System (12-hour)")
    print("Testing COLLECTION_COOLDOWN_MINUTES = 720 (12 hours) and proper error messages...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Step 1: Create a test user specifically for collection testing
    collection_user_response = make_request('POST', '/auth/register', collection_test_user_data)
    if not collection_user_response or collection_user_response.status_code not in [200, 201]:
        print("❌ Failed to create collection test user")
        return False
    
    collection_token = collection_user_response.json()['access_token']
    collection_headers = {"Authorization": f"Bearer {collection_token}"}
    
    # Get collection user profile
    profile_response = make_request('GET', '/auth/me', headers=collection_headers)
    if not profile_response or profile_response.status_code != 200:
        print("❌ Failed to get collection user profile")
        return False
    
    collection_user_id = profile_response.json()['id']
    print(f"✅ Collection test user created: {collection_user_id}")
    
    # Step 2: Give user sufficient balance via admin
    if admin_token:
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        balance_update = {
            "user_id": collection_user_id,
            "new_balance": 500.0,
            "notes": "Balance for collection testing"
        }
        make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
        time.sleep(1)
        print("✅ Collection user balance updated to 500 AZN")
    
    # Step 3: Purchase a package to test collection
    purchase_data = {
        "package_type": "gold",
        "invested_amount": 100.0
    }
    
    purchase_response = make_request('POST', '/packages/purchase', purchase_data, collection_headers)
    if not purchase_response or purchase_response.status_code != 200:
        print("❌ Failed to purchase package for collection testing")
        return False
    
    package_data = purchase_response.json()
    package_id = package_data['id']
    print(f"✅ Package purchased for collection testing: {package_id}")
    
    # Verify package starts with null last_collection_time
    if package_data.get('last_collection_time') is not None:
        print("❌ New package should start with null last_collection_time")
        return False
    
    print("✅ New package correctly starts with null last_collection_time")
    
    # Step 4: Wait for some earnings to accumulate (15 seconds should be enough)
    print("   Waiting 15 seconds for earnings to accumulate...")
    time.sleep(15)
    
    # Step 5: Test first collection (should be immediately available)
    print("   Testing first collection (should be immediately available)...")
    
    # Check collection status first
    status_response = make_request('GET', f'/packages/{package_id}/collection-status', headers=collection_headers)
    if not status_response or status_response.status_code != 200:
        print("❌ Failed to get collection status")
        return False
    
    status_data = status_response.json()
    print(f"   Collection status: can_collect={status_data.get('can_collect')}, cooldown_remaining={status_data.get('cooldown_remaining_seconds')}")
    
    if not status_data.get('can_collect', False):
        print("❌ First collection should be immediately available")
        return False
    
    print("✅ First collection is immediately available")
    
    # Perform first collection
    collect_response = make_request('POST', f'/packages/{package_id}/collect', headers=collection_headers)
    if not collect_response:
        print("❌ First collection failed: No response (timeout or network error)")
        return False
    
    if collect_response.status_code != 200:
        print(f"❌ First collection failed: HTTP {collect_response.status_code}")
        print(f"   Response: {collect_response.text}")
        return False
    
    collect_data = collect_response.json()
    collected_amount = collect_data.get('collected_amount', 0)
    new_balance = collect_data.get('new_balance', 0)
    next_collection_time = collect_data.get('next_collection_time')
    
    print(f"✅ First collection successful:")
    print(f"   Collected amount: {collected_amount} AZN")
    print(f"   New balance: {new_balance} AZN")
    print(f"   Next collection time: {next_collection_time}")
    
    if collected_amount <= 0:
        print("❌ Collected amount should be greater than 0")
        return False
    
    # Step 6: Test immediate second collection (should fail with 12-hour cooldown)
    print("   Testing immediate second collection (should fail with 12-hour cooldown)...")
    
    second_collect_response = make_request('POST', f'/packages/{package_id}/collect', headers=collection_headers)
    if not second_collect_response or second_collect_response.status_code != 400:
        print("❌ Second immediate collection should fail with 400 status")
        return False
    
    error_data = second_collect_response.json()
    error_message = error_data.get('detail', '')
    print(f"   Error message: {error_message}")
    
    # Verify error message shows hours and minutes format
    if 'hours' not in error_message.lower() or 'minutes' not in error_message.lower():
        print("❌ Error message should show hours and minutes format")
        return False
    
    # Should show approximately 12 hours (720 minutes) remaining
    if '11 hours' not in error_message and '12 hours' not in error_message:
        print("❌ Error message should show approximately 11-12 hours remaining")
        return False
    
    print("✅ Cooldown error message correctly shows hours and minutes format")
    
    # Step 7: Test collection status after first collection
    print("   Testing collection status after first collection...")
    
    post_collect_status = make_request('GET', f'/packages/{package_id}/collection-status', headers=collection_headers)
    if not post_collect_status or post_collect_status.status_code != 200:
        print("❌ Failed to get post-collection status")
        return False
    
    post_status_data = post_collect_status.json()
    can_collect_after = post_status_data.get('can_collect', True)
    cooldown_remaining = post_status_data.get('cooldown_remaining_seconds', 0)
    
    print(f"   Post-collection status: can_collect={can_collect_after}, cooldown_remaining={cooldown_remaining}s")
    
    if can_collect_after:
        print("❌ can_collect should be False after collection")
        return False
    
    # Should have approximately 12 hours (43200 seconds) remaining
    expected_cooldown = 12 * 60 * 60  # 43200 seconds
    if cooldown_remaining < (expected_cooldown - 300) or cooldown_remaining > expected_cooldown:
        print(f"❌ Cooldown remaining should be approximately {expected_cooldown} seconds, got {cooldown_remaining}")
        return False
    
    print("✅ Collection status correctly shows 12-hour cooldown")
    
    # Step 8: Verify cooldown calculation is accurate
    hours_remaining = cooldown_remaining // 3600
    minutes_remaining = (cooldown_remaining % 3600) // 60
    
    print(f"   Cooldown breakdown: {hours_remaining} hours, {minutes_remaining} minutes")
    
    if hours_remaining < 11 or hours_remaining > 12:
        print(f"❌ Hours remaining should be 11-12, got {hours_remaining}")
        return False
    
    print("✅ Cooldown calculation is accurate")
    
    print("✅ CRITICAL TEST 1 PASSED: Collection cooldown system working correctly")
    return True

def test_collection_status_endpoint():
    """CRITICAL TEST 2: Collection Status Endpoint"""
    print("\n🔴 CRITICAL TEST 2: Collection Status Endpoint")
    print("Testing /api/packages/{package_id}/collection-status accuracy...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Get user's packages
    packages_response = make_request('GET', '/packages/my', headers=headers)
    if not packages_response or packages_response.status_code != 200:
        print("❌ Failed to get user packages")
        return False
    
    packages = packages_response.json()
    if not packages:
        print("❌ No packages found for testing")
        return False
    
    # Test with the first active package
    test_package = None
    for pkg in packages:
        if pkg.get('is_active', False):
            test_package = pkg
            break
    
    if not test_package:
        print("❌ No active package found for testing")
        return False
    
    package_id = test_package['id']
    print(f"✅ Testing with package: {package_id}")
    
    # Test 1: Get collection status
    status_response = make_request('GET', f'/packages/{package_id}/collection-status', headers=headers)
    if not status_response or status_response.status_code != 200:
        print("❌ Collection status endpoint failed")
        return False
    
    status_data = status_response.json()
    required_fields = ['can_collect', 'cooldown_remaining_seconds', 'next_collection_time']
    
    print(f"   Status response: {status_data}")
    
    # Verify all required fields are present
    for field in required_fields:
        if field not in status_data:
            print(f"❌ Missing required field: {field}")
            return False
    
    print("✅ All required fields present in status response")
    
    # Test 2: Verify can_collect logic
    can_collect = status_data['can_collect']
    cooldown_remaining = status_data['cooldown_remaining_seconds']
    
    if can_collect and cooldown_remaining > 0:
        print("❌ Logic error: can_collect=True but cooldown_remaining > 0")
        return False
    
    if not can_collect and cooldown_remaining <= 0:
        print("❌ Logic error: can_collect=False but cooldown_remaining <= 0")
        return False
    
    print("✅ can_collect logic is consistent with cooldown_remaining")
    
    # Test 3: Verify next_collection_time format
    next_collection_time = status_data['next_collection_time']
    
    if not can_collect:
        if next_collection_time is None:
            print("❌ next_collection_time should not be None when cooldown is active")
            return False
        
        # Verify ISO format
        try:
            from datetime import datetime
            parsed_time = datetime.fromisoformat(next_collection_time.replace('Z', '+00:00'))
            print(f"   Next collection time: {parsed_time}")
        except ValueError:
            print("❌ next_collection_time is not in valid ISO format")
            return False
    
    print("✅ next_collection_time format is correct")
    
    # Test 4: Test with non-existent package
    fake_package_id = "fake-package-id-12345"
    fake_status_response = make_request('GET', f'/packages/{fake_package_id}/collection-status', headers=headers)
    
    if not fake_status_response or fake_status_response.status_code != 404:
        print("❌ Non-existent package should return 404")
        return False
    
    print("✅ Non-existent package correctly returns 404")
    
    print("✅ CRITICAL TEST 2 PASSED: Collection status endpoint working correctly")
    return True

def test_package_purchase_with_collection_system():
    """CRITICAL TEST 3: Package Purchase Flow with Collection System"""
    print("\n🔴 CRITICAL TEST 3: Package Purchase Flow with Collection System")
    print("Testing package purchase integration with 12-hour collection system...")
    
    if not user_token or not admin_token:
        print("❌ Missing required tokens")
        return False
    
    # Create a new user for this test
    purchase_test_user = {
        "email": "purchase.collection.test@example.com",
        "name": "Purchase Collection Test",
        "password": "testpass123"
    }
    
    reg_response = make_request('POST', '/auth/register', purchase_test_user)
    if not reg_response or reg_response.status_code not in [200, 201]:
        print("❌ Failed to create purchase test user")
        return False
    
    purchase_token = reg_response.json()['access_token']
    purchase_headers = {"Authorization": f"Bearer {purchase_token}"}
    
    # Get user profile
    profile_response = make_request('GET', '/auth/me', headers=purchase_headers)
    purchase_user_id = profile_response.json()['id']
    
    # Give user sufficient balance
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    balance_update = {
        "user_id": purchase_user_id,
        "new_balance": 300.0,
        "notes": "Balance for purchase collection testing"
    }
    make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
    time.sleep(1)
    
    print("✅ Purchase test user created with 300 AZN balance")
    
    # Test 1: Purchase package and verify initial state
    purchase_data = {
        "package_type": "gold",
        "invested_amount": 150.0
    }
    
    purchase_response = make_request('POST', '/packages/purchase', purchase_data, purchase_headers)
    if not purchase_response or purchase_response.status_code != 200:
        print("❌ Package purchase failed")
        return False
    
    package_data = purchase_response.json()
    package_id = package_data['id']
    
    print(f"✅ Package purchased: {package_id}")
    
    # Verify package starts with null last_collection_time
    if package_data.get('last_collection_time') is not None:
        print("❌ New package should start with null last_collection_time")
        return False
    
    print("✅ New package correctly starts with null last_collection_time")
    
    # Test 2: Verify first collection is immediately available
    status_response = make_request('GET', f'/packages/{package_id}/collection-status', headers=purchase_headers)
    if not status_response or status_response.status_code != 200:
        print("❌ Failed to get collection status for new package")
        return False
    
    status_data = status_response.json()
    if not status_data.get('can_collect', False):
        print("❌ First collection should be immediately available for new package")
        return False
    
    if status_data.get('cooldown_remaining_seconds', 1) != 0:
        print("❌ New package should have 0 cooldown remaining")
        return False
    
    print("✅ First collection is immediately available for new package")
    
    # Test 3: Wait for earnings and perform collection
    print("   Waiting 10 seconds for earnings to accumulate...")
    time.sleep(10)
    
    collect_response = make_request('POST', f'/packages/{package_id}/collect', headers=purchase_headers)
    if not collect_response or collect_response.status_code != 200:
        print("❌ First collection failed for new package")
        return False
    
    collect_data = collect_response.json()
    print(f"✅ First collection successful: {collect_data.get('collected_amount', 0)} AZN")
    
    # Test 4: Verify balance and total_earned updates
    updated_profile = make_request('GET', '/auth/me', headers=purchase_headers)
    if not updated_profile or updated_profile.status_code != 200:
        print("❌ Failed to get updated profile")
        return False
    
    profile_data = updated_profile.json()
    new_balance = profile_data['balance']
    total_earned = profile_data['total_earned']
    
    print(f"   Updated balance: {new_balance} AZN")
    print(f"   Total earned: {total_earned} AZN")
    
    # Balance should be: 300 - 150 (investment) + collected_amount
    expected_balance = 150.0 + collect_data.get('collected_amount', 0)
    if abs(new_balance - expected_balance) > 0.01:
        print(f"❌ Balance calculation incorrect. Expected ~{expected_balance}, got {new_balance}")
        return False
    
    if total_earned != collect_data.get('collected_amount', 0):
        print(f"❌ Total earned should equal collected amount")
        return False
    
    print("✅ Balance and total_earned correctly updated after collection")
    
    print("✅ CRITICAL TEST 3 PASSED: Package purchase flow with collection system working correctly")
    return True

def test_earnings_calculation_and_collection():
    """CRITICAL TEST 4: Earnings Calculation and Collection"""
    print("\n🔴 CRITICAL TEST 4: Earnings Calculation and Collection")
    print("Testing accumulated_earnings calculation and collection process...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Get user's active package
    packages_response = make_request('GET', '/packages/my', headers=headers)
    if not packages_response or packages_response.status_code != 200:
        print("❌ Failed to get user packages")
        return False
    
    packages = packages_response.json()
    active_package = None
    
    for pkg in packages:
        if pkg.get('is_active', False):
            active_package = pkg
            break
    
    if not active_package:
        print("❌ No active package found for earnings testing")
        return False
    
    package_id = active_package['id']
    invested_amount = active_package['invested_amount']
    multiplier = active_package['multiplier']
    
    print(f"✅ Testing with package: {package_id}")
    print(f"   Investment: {invested_amount} AZN, Multiplier: {multiplier}")
    
    # Test 1: Wait for earnings to accumulate
    print("   Waiting 20 seconds for earnings to accumulate...")
    initial_earnings = active_package.get('accumulated_earnings', 0)
    time.sleep(20)
    
    # Get updated package data
    updated_packages = make_request('GET', '/packages/my', headers=headers)
    if not updated_packages or updated_packages.status_code != 200:
        print("❌ Failed to get updated packages")
        return False
    
    updated_package = None
    for pkg in updated_packages.json():
        if pkg['id'] == package_id:
            updated_package = pkg
            break
    
    if not updated_package:
        print("❌ Package not found in updated list")
        return False
    
    current_earnings = updated_package.get('accumulated_earnings', 0)
    print(f"   Initial earnings: {initial_earnings} AZN")
    print(f"   Current earnings: {current_earnings} AZN")
    
    if current_earnings <= initial_earnings:
        print("❌ Earnings should have increased over time")
        return False
    
    print("✅ Earnings are accumulating correctly")
    
    # Test 2: Verify earnings calculation logic
    # Expected total earnings = invested_amount * multiplier
    expected_total_earnings = invested_amount * multiplier
    expected_profit = expected_total_earnings - invested_amount
    
    print(f"   Expected total earnings: {expected_total_earnings} AZN")
    print(f"   Expected profit: {expected_profit} AZN")
    
    # Current earnings should not exceed expected profit
    if current_earnings > expected_profit:
        print(f"❌ Current earnings ({current_earnings}) exceed expected profit ({expected_profit})")
        return False
    
    print("✅ Earnings calculation within expected bounds")
    
    print("✅ CRITICAL TEST 4 PASSED: Earnings calculation and collection working correctly")
    return True

def test_error_handling_and_edge_cases():
    """CRITICAL TEST 5: Error Handling and Edge Cases"""
    print("\n🔴 CRITICAL TEST 5: Error Handling and Edge Cases")
    print("Testing error messages, edge cases, and boundary conditions...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Test 1: Collection with non-existent package
    fake_package_id = "non-existent-package-12345"
    fake_collect_response = make_request('POST', f'/packages/{fake_package_id}/collect', headers=headers)
    
    if not fake_collect_response or fake_collect_response.status_code != 404:
        print("❌ Collection with non-existent package should return 404")
        return False
    
    print("✅ Non-existent package collection correctly returns 404")
    
    # Test 2: Collection with inactive package
    packages_response = make_request('GET', '/packages/my', headers=headers)
    if packages_response and packages_response.status_code == 200:
        packages = packages_response.json()
        inactive_package = None
        
        for pkg in packages:
            if not pkg.get('is_active', True):
                inactive_package = pkg
                break
        
        if inactive_package:
            inactive_collect_response = make_request('POST', f'/packages/{inactive_package["id"]}/collect', headers=headers)
            
            if not inactive_collect_response or inactive_collect_response.status_code != 400:
                print("❌ Collection with inactive package should return 400")
                return False
            
            error_data = inactive_collect_response.json()
            if "not active" not in error_data.get('detail', '').lower():
                print("❌ Inactive package error message should mention 'not active'")
                return False
            
            print("✅ Inactive package collection correctly rejected")
    
    # Test 3: Collection with no earnings
    if admin_token:
        # Create test user for this scenario
        no_earnings_user = {
            "email": "no.earnings.test@example.com",
            "name": "No Earnings Test",
            "password": "testpass123"
        }
        
        reg_response = make_request('POST', '/auth/register', no_earnings_user)
        if reg_response and reg_response.status_code in [200, 201]:
            no_earnings_token = reg_response.json()['access_token']
            no_earnings_headers = {"Authorization": f"Bearer {no_earnings_token}"}
            
            # Get user ID and add balance
            profile_response = make_request('GET', '/auth/me', headers=no_earnings_headers)
            if profile_response and profile_response.status_code == 200:
                user_id = profile_response.json()['id']
                
                admin_headers = {"Authorization": f"Bearer {admin_token}"}
                balance_update = {
                    "user_id": user_id,
                    "new_balance": 200.0,
                    "notes": "Balance for no earnings test"
                }
                make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
                time.sleep(1)
                
                # Purchase package
                purchase_data = {
                    "package_type": "gold",
                    "invested_amount": 100.0
                }
                
                purchase_response = make_request('POST', '/packages/purchase', purchase_data, no_earnings_headers)
                if purchase_response and purchase_response.status_code == 200:
                    new_package_id = purchase_response.json()['id']
                    
                    # Try to collect immediately (should fail - no earnings)
                    immediate_collect = make_request('POST', f'/packages/{new_package_id}/collect', headers=no_earnings_headers)
                    
                    if immediate_collect and immediate_collect.status_code == 400:
                        error_data = immediate_collect.json()
                        if "no earnings" in error_data.get('detail', '').lower():
                            print("✅ No earnings collection correctly rejected")
                        else:
                            print("❌ No earnings error message should mention 'no earnings'")
                            return False
                    else:
                        print("❌ Collection with no earnings should return 400")
                        return False
    
    print("✅ CRITICAL TEST 5 PASSED: Error handling and edge cases working correctly")
    return True

def run_collection_system_tests():
    """Run all collection system tests focusing on 12-hour cooldown"""
    print("🚀 12-HOUR COLLECTION SYSTEM TESTING - InvestAZ Backend")
    print(f"Backend URL: {API_URL}")
    print("=" * 80)
    
    # Setup test environment
    if not setup_test_environment():
        print("❌ Failed to setup test environment")
        return
    
    # Collection system tests based on review request
    collection_tests = [
        ("Collection Cooldown System (12-hour)", test_collection_cooldown_system),
        ("Collection Status Endpoint", test_collection_status_endpoint),
        ("Package Purchase with Collection System", test_package_purchase_with_collection_system),
        ("Earnings Calculation and Collection", test_earnings_calculation_and_collection),
        ("Error Handling and Edge Cases", test_error_handling_and_edge_cases)
    ]
    
    passed = 0
    failed = 0
    results = []
    
    print("\n🔴 RUNNING COLLECTION SYSTEM TESTS")
    print("=" * 50)
    
    for test_name, test_func in collection_tests:
        try:
            print(f"\n{'='*20} {test_name} {'='*20}")
            if test_func():
                passed += 1
                results.append(f"✅ {test_name}")
            else:
                failed += 1
                results.append(f"❌ {test_name}")
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            failed += 1
            results.append(f"❌ {test_name} (CRASHED)")
        
        time.sleep(1)  # Delay between tests
    
    # Final results
    print("\n" + "=" * 80)
    print("📊 COLLECTION SYSTEM TESTS RESULTS")
    print("=" * 80)
    
    for result in results:
        print(result)
    
    print(f"\n📈 SUMMARY:")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 ALL COLLECTION SYSTEM TESTS PASSED!")
        print("✅ 12-hour collection system is working correctly")
    else:
        print(f"\n⚠️  {failed} COLLECTION SYSTEM TESTS FAILED")
        print("❌ 12-hour collection system needs attention")
    
    return passed, failed

if __name__ == "__main__":
    run_collection_system_tests()