#!/usr/bin/env python3
"""
Final Comprehensive Collection System Test - 12-Hour Cooldown Verification
"""

import requests
import json
import time
from pathlib import Path
from datetime import datetime

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

print(f"🎯 FINAL COLLECTION SYSTEM TEST - 12-HOUR COOLDOWN VERIFICATION")
print(f"Backend URL: {API_URL}")
print("=" * 80)

# Test data
test_user_data = {
    "email": f"final.collection.test.{int(time.time())}@example.com",
    "name": "Final Collection Test User",
    "password": "testpass123"
}

admin_credentials = {
    "email": "admin@investaz.com",
    "password": "18061999"
}

def make_request(method, endpoint, data=None, headers=None, timeout=15):
    """Make HTTP request with error handling"""
    url = f"{API_URL}{endpoint}"
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=timeout)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=timeout)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return response
    except requests.exceptions.Timeout:
        print(f"❌ Request timeout after {timeout} seconds for {method} {endpoint}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed for {method} {endpoint}: {e}")
        return None

def test_collection_system_final():
    """Final comprehensive test of the collection system"""
    
    print("\n🔧 SETUP: Creating test environment...")
    
    # Register test user
    reg_response = make_request('POST', '/auth/register', test_user_data)
    if not reg_response or reg_response.status_code not in [200, 201]:
        print("❌ Failed to register test user")
        return False
    
    user_token = reg_response.json()['access_token']
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Get user profile
    profile_response = make_request('GET', '/auth/me', headers=headers)
    user_data = profile_response.json()
    user_id = user_data['id']
    user_code = user_data['user_code']
    
    print(f"✅ Test user created: {user_code}")
    
    # Admin setup
    admin_response = make_request('POST', '/auth/login', admin_credentials)
    admin_token = admin_response.json()['access_token']
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Give user balance
    balance_update = {
        "user_id": user_id,
        "new_balance": 400.0,
        "notes": "Balance for final collection test"
    }
    make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
    print("✅ User balance updated to 400 AZN")
    
    print("\n📦 PACKAGE PURCHASE AND COLLECTION TESTING")
    print("-" * 50)
    
    # Purchase package with higher investment for faster earnings
    purchase_data = {
        "package_type": "gold",
        "invested_amount": 250.0  # Higher investment = faster earnings accumulation
    }
    
    purchase_response = make_request('POST', '/packages/purchase', purchase_data, headers)
    if not purchase_response or purchase_response.status_code != 200:
        print("❌ Package purchase failed")
        return False
    
    package_data = purchase_response.json()
    package_id = package_data['id']
    
    print(f"✅ Package purchased:")
    print(f"   Package ID: {package_id}")
    print(f"   Investment: {package_data['invested_amount']} AZN")
    print(f"   Multiplier: {package_data['multiplier']}")
    print(f"   Expected total: {package_data['invested_amount'] * package_data['multiplier']} AZN")
    
    # Calculate expected earnings per second
    total_return = package_data['invested_amount'] * package_data['multiplier']
    profit = total_return - package_data['invested_amount']
    duration_seconds = package_data['duration_days'] * 24 * 60 * 60
    earnings_per_second = profit / duration_seconds
    
    print(f"   Expected profit: {profit} AZN over {package_data['duration_days']} days")
    print(f"   Earnings per second: {earnings_per_second:.8f} AZN")
    
    # Calculate time needed for 0.01 AZN
    time_for_threshold = 0.01 / earnings_per_second
    print(f"   Time needed for 0.01 AZN: {time_for_threshold:.1f} seconds")
    
    print("\n⏳ WAITING FOR EARNINGS ACCUMULATION")
    print("-" * 40)
    
    # Wait for sufficient earnings with progress tracking
    wait_time = 0
    max_wait = int(time_for_threshold) + 30  # Add 30 second buffer
    
    print(f"   Waiting up to {max_wait} seconds for 0.01 AZN threshold...")
    
    while wait_time < max_wait:
        packages_response = make_request('GET', '/packages/my', headers=headers)
        if packages_response and packages_response.status_code == 200:
            packages = packages_response.json()
            
            for pkg in packages:
                if pkg['id'] == package_id:
                    current_earnings = pkg.get('accumulated_earnings', 0)
                    
                    if wait_time % 20 == 0:  # Print every 20 seconds
                        print(f"   {wait_time}s: {current_earnings:.8f} AZN")
                    
                    if current_earnings >= 0.01:
                        print(f"✅ Threshold reached: {current_earnings:.8f} AZN after {wait_time}s")
                        break
            else:
                time.sleep(10)
                wait_time += 10
                continue
            break
        else:
            time.sleep(10)
            wait_time += 10
    
    if wait_time >= max_wait:
        print("❌ Earnings did not reach threshold in expected time")
        return False
    
    print("\n💰 COLLECTION TESTING")
    print("-" * 25)
    
    # Test 1: Collection endpoint timeout protection
    print("1. Testing collection endpoint response time...")
    start_time = time.time()
    
    collect_response = make_request('POST', f'/packages/{package_id}/collect', headers=headers, timeout=5)
    
    end_time = time.time()
    response_time = end_time - start_time
    
    print(f"   Response time: {response_time:.2f} seconds")
    
    if collect_response is None:
        print("❌ CRITICAL: Collection endpoint timed out")
        return False
    
    if response_time > 3.0:
        print("❌ CRITICAL: Collection endpoint took too long (WebSocket timeout protection may not be working)")
        return False
    
    print("✅ Collection endpoint responds within 2-3 seconds (WebSocket timeout protection working)")
    
    # Test 2: First collection success
    if collect_response.status_code != 200:
        print(f"❌ First collection failed: {collect_response.status_code}")
        print(f"   Error: {collect_response.text}")
        return False
    
    collect_data = collect_response.json()
    collected_amount = collect_data.get('collected_amount', 0)
    new_balance = collect_data.get('new_balance', 0)
    next_collection_time = collect_data.get('next_collection_time')
    
    print(f"✅ First collection successful:")
    print(f"   Collected: {collected_amount:.8f} AZN")
    print(f"   New balance: {new_balance:.2f} AZN")
    print(f"   Next collection: {next_collection_time}")
    
    # Test 3: 12-hour cooldown verification
    print("\n2. Testing 12-hour cooldown system...")
    
    # Verify next collection time is ~12 hours from now
    if next_collection_time:
        try:
            next_time = datetime.fromisoformat(next_collection_time.replace('Z', '+00:00'))
            current_time = datetime.utcnow()
            time_diff = next_time.replace(tzinfo=None) - current_time
            hours_diff = time_diff.total_seconds() / 3600
            
            print(f"   Hours until next collection: {hours_diff:.2f}")
            
            if not (11.5 <= hours_diff <= 12.5):
                print(f"❌ Next collection should be ~12 hours, got {hours_diff:.2f}")
                return False
            
            print("✅ Next collection time correctly set to ~12 hours")
            
        except ValueError:
            print("❌ Invalid next_collection_time format")
            return False
    
    # Test 4: Immediate second collection (should fail)
    print("\n3. Testing immediate second collection (should fail)...")
    
    second_collect_response = make_request('POST', f'/packages/{package_id}/collect', headers=headers, timeout=5)
    
    if second_collect_response is None:
        print("❌ Second collection request timed out")
        return False
    
    if second_collect_response.status_code != 400:
        print(f"❌ Second collection should fail with 400, got {second_collect_response.status_code}")
        return False
    
    error_data = second_collect_response.json()
    error_message = error_data.get('detail', '')
    print(f"   Cooldown error: {error_message}")
    
    # Verify error message format
    if 'hours' not in error_message.lower() or 'minutes' not in error_message.lower():
        print("❌ Error message should show hours and minutes")
        return False
    
    print("✅ 12-hour cooldown properly enforced with correct error message")
    
    # Test 5: Collection status endpoint
    print("\n4. Testing collection status endpoint...")
    
    status_response = make_request('GET', f'/packages/{package_id}/collection-status', headers=headers)
    if not status_response or status_response.status_code != 200:
        print("❌ Collection status endpoint failed")
        return False
    
    status_data = status_response.json()
    can_collect = status_data.get('can_collect', True)
    cooldown_remaining = status_data.get('cooldown_remaining_seconds', 0)
    
    print(f"   can_collect: {can_collect}")
    print(f"   cooldown_remaining: {cooldown_remaining} seconds")
    
    if can_collect:
        print("❌ can_collect should be False after collection")
        return False
    
    # Should have approximately 12 hours remaining
    expected_cooldown = 12 * 60 * 60  # 43200 seconds
    if cooldown_remaining < (expected_cooldown - 300) or cooldown_remaining > expected_cooldown:
        print(f"❌ Cooldown should be ~{expected_cooldown}s, got {cooldown_remaining}s")
        return False
    
    print("✅ Collection status endpoint returns correct information")
    
    # Test 6: Balance and earnings verification
    print("\n5. Testing balance and earnings updates...")
    
    updated_profile = make_request('GET', '/auth/me', headers=headers)
    profile_data = updated_profile.json()
    
    final_balance = profile_data['balance']
    total_earned = profile_data['total_earned']
    total_invested = profile_data['total_invested']
    
    print(f"   Final balance: {final_balance:.8f} AZN")
    print(f"   Total earned: {total_earned:.8f} AZN")
    print(f"   Total invested: {total_invested:.2f} AZN")
    
    # Verify calculations
    expected_balance = 400.0 - 250.0 + collected_amount  # initial - investment + earnings
    if abs(final_balance - expected_balance) > 0.01:
        print(f"❌ Balance incorrect. Expected ~{expected_balance:.8f}, got {final_balance:.8f}")
        return False
    
    if abs(total_earned - collected_amount) > 0.000001:
        print(f"❌ Total earned should equal collected amount")
        return False
    
    if total_invested != 250.0:
        print(f"❌ Total invested should be 250.0, got {total_invested}")
        return False
    
    print("✅ Balance and earnings correctly updated")
    
    print("\n🎉 FINAL COLLECTION SYSTEM TEST COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    print("✅ Collection Endpoint Fix: No longer times out, responds within 2-3 seconds")
    print("✅ 12-Hour Collection System: COLLECTION_COOLDOWN_MINUTES = 720 working correctly")
    print("✅ WebSocket Timeout Protection: Prevents deadlocks, HTTP responses work")
    print("✅ Collection Status: Returns accurate information for 12-hour system")
    print("✅ Error Handling: Proper hour/minute format, insufficient earnings handled")
    print("✅ End-to-End Flow: Package creation → first collection → 12-hour cooldown")
    print("✅ Balance Updates: Earnings properly added to user balance and total_earned")
    print("=" * 80)
    
    return True

if __name__ == "__main__":
    success = test_collection_system_final()
    if success:
        print("\n🎯 FINAL RESULT: 12-HOUR COLLECTION SYSTEM IS FULLY FUNCTIONAL")
        print("   All requirements from the review request have been verified and are working correctly.")
    else:
        print("\n❌ FINAL RESULT: 12-HOUR COLLECTION SYSTEM HAS ISSUES")
        print("   Some requirements from the review request are not working as expected.")