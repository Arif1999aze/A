#!/usr/bin/env python3
"""
Comprehensive Collection System Test - 12-Hour Cooldown with WebSocket Timeout Protection
"""

import requests
import json
import time
from pathlib import Path
from datetime import datetime, timedelta

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

print(f"🚀 COMPREHENSIVE COLLECTION SYSTEM TEST")
print(f"Backend URL: {API_URL}")
print("=" * 80)

# Test data
test_user_data = {
    "email": f"comprehensive.test.{int(time.time())}@example.com",
    "name": "Comprehensive Test User",
    "password": "testpass123"
}

admin_credentials = {
    "email": "admin@investaz.com",
    "password": "18061999"
}

def make_request(method, endpoint, data=None, headers=None, timeout=30):
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

def test_collection_system_comprehensive():
    """Comprehensive test of the 12-hour collection system"""
    
    print("\n🔧 SETUP: Creating test environment...")
    
    # Step 1: Register test user
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
    
    user_data = profile_response.json()
    user_id = user_data['id']
    user_code = user_data['user_code']
    initial_balance = user_data['balance']
    
    print(f"✅ Test user created: {user_code} (ID: {user_id})")
    print(f"   Initial balance: {initial_balance} AZN")
    
    # Step 2: Login admin and give user more balance
    admin_response = make_request('POST', '/auth/login', admin_credentials)
    if not admin_response or admin_response.status_code != 200:
        print("❌ Admin login failed")
        return False
    
    admin_token = admin_response.json()['access_token']
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Give user sufficient balance
    balance_update = {
        "user_id": user_id,
        "new_balance": 500.0,
        "notes": "Balance for comprehensive collection test"
    }
    balance_response = make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
    if not balance_response or balance_response.status_code != 200:
        print("❌ Failed to update user balance")
        return False
    
    print("✅ User balance updated to 500 AZN")
    
    # Step 3: Purchase package
    print("\n📦 PACKAGE PURCHASE: Testing package purchase with collection system...")
    
    purchase_data = {
        "package_type": "gold",
        "invested_amount": 200.0  # Larger investment for faster earnings
    }
    
    purchase_response = make_request('POST', '/packages/purchase', purchase_data, headers)
    if not purchase_response or purchase_response.status_code != 200:
        print("❌ Package purchase failed")
        return False
    
    package_data = purchase_response.json()
    package_id = package_data['id']
    
    print(f"✅ Package purchased successfully:")
    print(f"   Package ID: {package_id}")
    print(f"   Investment: {package_data['invested_amount']} AZN")
    print(f"   Multiplier: {package_data['multiplier']}")
    print(f"   Duration: {package_data['duration_days']} days")
    print(f"   Last collection time: {package_data['last_collection_time']}")
    
    # Verify package starts with null last_collection_time
    if package_data.get('last_collection_time') is not None:
        print("❌ CRITICAL: New package should start with null last_collection_time")
        return False
    
    print("✅ New package correctly starts with null last_collection_time")
    
    # Step 4: Test collection status for new package
    print("\n📊 COLLECTION STATUS: Testing collection status endpoint...")
    
    status_response = make_request('GET', f'/packages/{package_id}/collection-status', headers=headers)
    if not status_response or status_response.status_code != 200:
        print("❌ Failed to get collection status")
        return False
    
    status_data = status_response.json()
    print(f"   Collection status for new package:")
    print(f"   - can_collect: {status_data.get('can_collect')}")
    print(f"   - cooldown_remaining_seconds: {status_data.get('cooldown_remaining_seconds')}")
    print(f"   - next_collection_time: {status_data.get('next_collection_time')}")
    
    # Verify first collection is immediately available
    if not status_data.get('can_collect', False):
        print("❌ CRITICAL: First collection should be immediately available")
        return False
    
    if status_data.get('cooldown_remaining_seconds', 1) != 0:
        print("❌ CRITICAL: New package should have 0 cooldown remaining")
        return False
    
    print("✅ First collection is immediately available for new package")
    
    # Step 5: Wait for sufficient earnings to accumulate
    print("\n⏳ EARNINGS ACCUMULATION: Waiting for sufficient earnings (0.01+ AZN)...")
    
    wait_time = 0
    max_wait = 300  # 5 minutes max wait
    
    while wait_time < max_wait:
        # Check current earnings
        packages_response = make_request('GET', '/packages/my', headers=headers)
        if packages_response and packages_response.status_code == 200:
            packages = packages_response.json()
            current_package = None
            
            for pkg in packages:
                if pkg['id'] == package_id:
                    current_package = pkg
                    break
            
            if current_package:
                current_earnings = current_package.get('accumulated_earnings', 0)
                print(f"   Current earnings after {wait_time}s: {current_earnings:.6f} AZN")
                
                if current_earnings >= 0.01:
                    print(f"✅ Sufficient earnings accumulated: {current_earnings:.6f} AZN")
                    break
        
        time.sleep(10)  # Wait 10 seconds
        wait_time += 10
    
    if wait_time >= max_wait:
        print("❌ CRITICAL: Earnings did not reach 0.01 AZN threshold within 5 minutes")
        return False
    
    # Step 6: Test first collection (should succeed)
    print("\n💰 FIRST COLLECTION: Testing first earnings collection...")
    
    # Record time before collection
    collection_start_time = datetime.utcnow()
    
    collect_response = make_request('POST', f'/packages/{package_id}/collect', headers=headers, timeout=10)
    
    if collect_response is None:
        print("❌ CRITICAL: Collection endpoint timed out (WebSocket timeout protection failed)")
        return False
    
    if collect_response.status_code != 200:
        print(f"❌ CRITICAL: First collection failed with status {collect_response.status_code}")
        print(f"   Error: {collect_response.text}")
        return False
    
    collect_data = collect_response.json()
    collected_amount = collect_data.get('collected_amount', 0)
    new_balance = collect_data.get('new_balance', 0)
    next_collection_time = collect_data.get('next_collection_time')
    
    print(f"✅ First collection successful:")
    print(f"   Collected amount: {collected_amount:.6f} AZN")
    print(f"   New balance: {new_balance:.2f} AZN")
    print(f"   Next collection time: {next_collection_time}")
    
    if collected_amount <= 0:
        print("❌ CRITICAL: Collected amount should be greater than 0")
        return False
    
    # Verify next collection time is approximately 12 hours from now
    if next_collection_time:
        try:
            next_time = datetime.fromisoformat(next_collection_time.replace('Z', '+00:00'))
            time_diff = next_time.replace(tzinfo=None) - collection_start_time
            hours_diff = time_diff.total_seconds() / 3600
            
            print(f"   Time until next collection: {hours_diff:.2f} hours")
            
            if not (11.5 <= hours_diff <= 12.5):
                print(f"❌ CRITICAL: Next collection should be ~12 hours, got {hours_diff:.2f} hours")
                return False
            
            print("✅ Next collection time correctly set to ~12 hours")
            
        except ValueError:
            print("❌ CRITICAL: Invalid next_collection_time format")
            return False
    
    # Step 7: Test immediate second collection (should fail with 12-hour cooldown)
    print("\n🚫 COOLDOWN TEST: Testing immediate second collection (should fail)...")
    
    second_collect_response = make_request('POST', f'/packages/{package_id}/collect', headers=headers, timeout=10)
    
    if second_collect_response is None:
        print("❌ CRITICAL: Second collection request timed out")
        return False
    
    if second_collect_response.status_code != 400:
        print(f"❌ CRITICAL: Second collection should fail with 400, got {second_collect_response.status_code}")
        return False
    
    error_data = second_collect_response.json()
    error_message = error_data.get('detail', '')
    print(f"   Cooldown error message: {error_message}")
    
    # Verify error message shows hours and minutes format
    if 'hours' not in error_message.lower() or 'minutes' not in error_message.lower():
        print("❌ CRITICAL: Error message should show hours and minutes format")
        return False
    
    # Should show approximately 11-12 hours remaining
    if not any(f'{h} hours' in error_message for h in range(11, 13)):
        print("❌ CRITICAL: Error message should show approximately 11-12 hours remaining")
        return False
    
    print("✅ Cooldown error message correctly shows hours and minutes format")
    
    # Step 8: Test collection status after first collection
    print("\n📊 POST-COLLECTION STATUS: Testing collection status after collection...")
    
    post_collect_status = make_request('GET', f'/packages/{package_id}/collection-status', headers=headers)
    if not post_collect_status or post_collect_status.status_code != 200:
        print("❌ Failed to get post-collection status")
        return False
    
    post_status_data = post_collect_status.json()
    can_collect_after = post_status_data.get('can_collect', True)
    cooldown_remaining = post_status_data.get('cooldown_remaining_seconds', 0)
    
    print(f"   Post-collection status:")
    print(f"   - can_collect: {can_collect_after}")
    print(f"   - cooldown_remaining_seconds: {cooldown_remaining}")
    
    if can_collect_after:
        print("❌ CRITICAL: can_collect should be False after collection")
        return False
    
    # Should have approximately 12 hours (43200 seconds) remaining
    expected_cooldown = 12 * 60 * 60  # 43200 seconds
    if cooldown_remaining < (expected_cooldown - 300) or cooldown_remaining > expected_cooldown:
        print(f"❌ CRITICAL: Cooldown remaining should be ~{expected_cooldown} seconds, got {cooldown_remaining}")
        return False
    
    hours_remaining = cooldown_remaining // 3600
    minutes_remaining = (cooldown_remaining % 3600) // 60
    
    print(f"   Cooldown breakdown: {hours_remaining} hours, {minutes_remaining} minutes")
    print("✅ Collection status correctly shows 12-hour cooldown")
    
    # Step 9: Verify user balance and total_earned updates
    print("\n💳 BALANCE VERIFICATION: Checking balance and earnings updates...")
    
    updated_profile = make_request('GET', '/auth/me', headers=headers)
    if not updated_profile or updated_profile.status_code != 200:
        print("❌ Failed to get updated profile")
        return False
    
    profile_data = updated_profile.json()
    final_balance = profile_data['balance']
    total_earned = profile_data['total_earned']
    
    print(f"   Final balance: {final_balance:.2f} AZN")
    print(f"   Total earned: {total_earned:.6f} AZN")
    
    # Balance should be: 500 - 200 (investment) + collected_amount
    expected_balance = 300.0 + collected_amount
    if abs(final_balance - expected_balance) > 0.01:
        print(f"❌ CRITICAL: Balance calculation incorrect. Expected ~{expected_balance:.2f}, got {final_balance:.2f}")
        return False
    
    if abs(total_earned - collected_amount) > 0.000001:
        print(f"❌ CRITICAL: Total earned should equal collected amount")
        return False
    
    print("✅ Balance and total_earned correctly updated after collection")
    
    # Step 10: Test WebSocket timeout protection
    print("\n🔌 WEBSOCKET TIMEOUT PROTECTION: Verifying collection endpoint responds quickly...")
    
    # The collection endpoint should respond within 2-3 seconds even if WebSocket fails
    start_time = time.time()
    
    # Try another collection (should fail with cooldown but respond quickly)
    quick_collect_response = make_request('POST', f'/packages/{package_id}/collect', headers=headers, timeout=5)
    
    end_time = time.time()
    response_time = end_time - start_time
    
    print(f"   Collection endpoint response time: {response_time:.2f} seconds")
    
    if response_time > 5.0:
        print("❌ CRITICAL: Collection endpoint took too long to respond (WebSocket timeout protection may not be working)")
        return False
    
    if quick_collect_response is None:
        print("❌ CRITICAL: Collection endpoint timed out (WebSocket timeout protection failed)")
        return False
    
    print("✅ Collection endpoint responds quickly (WebSocket timeout protection working)")
    
    print("\n🎉 COMPREHENSIVE COLLECTION SYSTEM TEST COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    print("✅ Collection endpoint no longer times out")
    print("✅ 12-hour collection system working correctly")
    print("✅ WebSocket timeout protection prevents deadlocks")
    print("✅ Collection status endpoint accurate")
    print("✅ Error messages show proper hour/minute format")
    print("✅ Balance and earnings calculations correct")
    print("=" * 80)
    
    return True

if __name__ == "__main__":
    success = test_collection_system_comprehensive()
    if success:
        print("\n🎯 RESULT: ALL TESTS PASSED - 12-HOUR COLLECTION SYSTEM IS WORKING CORRECTLY")
    else:
        print("\n❌ RESULT: TESTS FAILED - 12-HOUR COLLECTION SYSTEM NEEDS ATTENTION")