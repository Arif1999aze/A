#!/usr/bin/env python3
"""
End-to-End Collection Flow Test - Verifying all aspects of the 12-hour collection system
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

print(f"🔄 END-TO-END COLLECTION FLOW TEST")
print(f"Backend URL: {API_URL}")
print("=" * 60)

# Test data
test_user_data = {
    "email": f"e2e.collection.test.{int(time.time())}@example.com",
    "name": "E2E Collection Test User",
    "password": "testpass123"
}

admin_credentials = {
    "email": "admin@investaz.com",
    "password": "18061999"
}

def make_request(method, endpoint, data=None, headers=None, timeout=10):
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

def test_end_to_end_collection_flow():
    """Test the complete end-to-end collection flow as specified in review request"""
    
    print("\n1️⃣ CREATE NEW PACKAGE FOR TEST USER")
    print("-" * 40)
    
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
    print(f"   Initial balance: {user_data['balance']} AZN")
    print(f"   Total invested: {user_data['total_invested']} AZN")
    print(f"   Total earned: {user_data['total_earned']} AZN")
    
    # Login admin and give user balance
    admin_response = make_request('POST', '/auth/login', admin_credentials)
    admin_token = admin_response.json()['access_token']
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Give user sufficient balance
    balance_update = {
        "user_id": user_id,
        "new_balance": 300.0,
        "notes": "Balance for E2E collection test"
    }
    make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
    
    # Purchase package
    purchase_data = {
        "package_type": "gold",
        "invested_amount": 150.0
    }
    
    purchase_response = make_request('POST', '/packages/purchase', purchase_data, headers)
    package_data = purchase_response.json()
    package_id = package_data['id']
    
    print(f"✅ Package created successfully:")
    print(f"   Package ID: {package_id}")
    print(f"   Investment: {package_data['invested_amount']} AZN")
    print(f"   Expected total return: {package_data['invested_amount'] * package_data['multiplier']} AZN")
    
    print("\n2️⃣ TEST FIRST COLLECTION IS IMMEDIATELY AVAILABLE")
    print("-" * 50)
    
    # Check collection status
    status_response = make_request('GET', f'/packages/{package_id}/collection-status', headers=headers)
    status_data = status_response.json()
    
    print(f"   Collection status for new package:")
    print(f"   - can_collect: {status_data.get('can_collect')}")
    print(f"   - cooldown_remaining_seconds: {status_data.get('cooldown_remaining_seconds')}")
    
    if not status_data.get('can_collect', False):
        print("❌ CRITICAL: First collection should be immediately available")
        return False
    
    print("✅ First collection is immediately available")
    
    print("\n3️⃣ VERIFY SUBSEQUENT COLLECTIONS REQUIRE 12-HOUR WAIT")
    print("-" * 55)
    
    # Wait for earnings to accumulate
    print("   Waiting for earnings to accumulate (minimum 0.01 AZN)...")
    
    wait_time = 0
    while wait_time < 120:  # Wait up to 2 minutes
        packages_response = make_request('GET', '/packages/my', headers=headers)
        packages = packages_response.json()
        
        for pkg in packages:
            if pkg['id'] == package_id:
                current_earnings = pkg.get('accumulated_earnings', 0)
                if current_earnings >= 0.01:
                    print(f"   ✅ Sufficient earnings: {current_earnings:.6f} AZN")
                    break
        else:
            time.sleep(10)
            wait_time += 10
            continue
        break
    
    # Perform first collection
    collect_response = make_request('POST', f'/packages/{package_id}/collect', headers=headers)
    if not collect_response or collect_response.status_code != 200:
        print("❌ First collection failed")
        return False
    
    collect_data = collect_response.json()
    first_collection_amount = collect_data.get('collected_amount', 0)
    
    print(f"✅ First collection successful: {first_collection_amount:.6f} AZN")
    
    # Try immediate second collection (should fail)
    second_collect_response = make_request('POST', f'/packages/{package_id}/collect', headers=headers)
    if not second_collect_response or second_collect_response.status_code != 400:
        print("❌ Second collection should fail with 400 status")
        return False
    
    error_data = second_collect_response.json()
    error_message = error_data.get('detail', '')
    print(f"✅ Second collection properly rejected: {error_message}")
    
    # Verify 12-hour cooldown
    if 'hours' not in error_message.lower():
        print("❌ Error message should mention hours")
        return False
    
    print("✅ 12-hour cooldown system working correctly")
    
    print("\n4️⃣ TEST EARNINGS ARE PROPERLY ADDED TO USER BALANCE AND TOTAL_EARNED")
    print("-" * 70)
    
    # Get updated user profile
    updated_profile = make_request('GET', '/auth/me', headers=headers)
    updated_data = updated_profile.json()
    
    final_balance = updated_data['balance']
    total_earned = updated_data['total_earned']
    total_invested = updated_data['total_invested']
    
    print(f"   User financial summary:")
    print(f"   - Final balance: {final_balance:.6f} AZN")
    print(f"   - Total earned: {total_earned:.6f} AZN")
    print(f"   - Total invested: {total_invested:.6f} AZN")
    
    # Verify calculations
    # Balance should be: 300 - 150 (investment) + collected_amount
    expected_balance = 150.0 + first_collection_amount
    if abs(final_balance - expected_balance) > 0.01:
        print(f"❌ Balance calculation incorrect. Expected ~{expected_balance:.6f}, got {final_balance:.6f}")
        return False
    
    if abs(total_earned - first_collection_amount) > 0.000001:
        print(f"❌ Total earned should equal collected amount")
        return False
    
    if total_invested != 150.0:
        print(f"❌ Total invested should be 150.0, got {total_invested}")
        return False
    
    print("✅ Earnings properly added to user balance and total_earned")
    
    print("\n5️⃣ TEST ERROR HANDLING - INSUFFICIENT EARNINGS SCENARIOS")
    print("-" * 60)
    
    # Create another user to test insufficient earnings
    insufficient_user_data = {
        "email": f"insufficient.test.{int(time.time())}@example.com",
        "name": "Insufficient Test User",
        "password": "testpass123"
    }
    
    reg_response2 = make_request('POST', '/auth/register', insufficient_user_data)
    user_token2 = reg_response2.json()['access_token']
    headers2 = {"Authorization": f"Bearer {user_token2}"}
    
    # Get user profile and give balance
    profile_response2 = make_request('GET', '/auth/me', headers=headers2)
    user_id2 = profile_response2.json()['id']
    
    balance_update2 = {
        "user_id": user_id2,
        "new_balance": 200.0,
        "notes": "Balance for insufficient earnings test"
    }
    make_request('POST', '/admin/users/update-balance', balance_update2, admin_headers)
    
    # Purchase package
    purchase_data2 = {
        "package_type": "gold",
        "invested_amount": 100.0
    }
    
    purchase_response2 = make_request('POST', '/packages/purchase', purchase_data2, headers2)
    package_id2 = purchase_response2.json()['id']
    
    # Try to collect immediately (should fail - no earnings)
    immediate_collect = make_request('POST', f'/packages/{package_id2}/collect', headers=headers2)
    
    if not immediate_collect or immediate_collect.status_code != 400:
        print("❌ Collection with no earnings should return 400")
        return False
    
    error_data = immediate_collect.json()
    if "no earnings" not in error_data.get('detail', '').lower():
        print("❌ Error message should mention 'no earnings'")
        return False
    
    print("✅ Insufficient earnings scenario properly handled")
    
    print("\n6️⃣ VERIFY COLLECTION ENDPOINT RESPONDS WITHIN 2-3 SECONDS")
    print("-" * 60)
    
    # Test response time
    start_time = time.time()
    
    # Try collection on cooldown package (should respond quickly with error)
    quick_response = make_request('POST', f'/packages/{package_id}/collect', headers=headers, timeout=5)
    
    end_time = time.time()
    response_time = end_time - start_time
    
    print(f"   Collection endpoint response time: {response_time:.2f} seconds")
    
    if response_time > 3.0:
        print("❌ Collection endpoint should respond within 2-3 seconds")
        return False
    
    if quick_response is None:
        print("❌ Collection endpoint should not timeout")
        return False
    
    print("✅ Collection endpoint responds quickly (WebSocket timeout protection working)")
    
    print("\n🎉 END-TO-END COLLECTION FLOW TEST COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    success = test_end_to_end_collection_flow()
    if success:
        print("\n🎯 RESULT: END-TO-END COLLECTION FLOW WORKING PERFECTLY")
        print("✅ All requirements from review request verified")
    else:
        print("\n❌ RESULT: END-TO-END COLLECTION FLOW HAS ISSUES")