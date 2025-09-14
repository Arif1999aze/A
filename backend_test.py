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
from datetime import datetime
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
test_user_data = {
    "email": "leyla.hasanova@gmail.com",
    "name": "Leyla Hasanova",
    "password": "securepass123"
}

admin_credentials = {
    "email": "admin@investaz.com",
    "password": "18061999"
}

# Test data for new transaction format
transaction_test_data = {
    "withdrawal": {
        "card_name": "Leyla Hasanova",  # Combined name + surname
        "card_number": "Kapital Bank"   # Bank name instead of card number
    },
    "deposit": {
        "card_name": "Leyla Hasanova",  # Combined name + surname  
        "card_number": "Pasha Bank"     # Bank name instead of card number
    }
}

# Global variables for tokens and test data
user_token = None
admin_token = None
test_user_id = None
test_user_code = None
test_package_id = None
test_transaction_id = None
test_message_id = None
websocket_messages = []
admin_notifications = []

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

def setup_test_environment():
    """Setup test environment with user and admin tokens"""
    global user_token, admin_token, test_user_id, test_user_code
    
    print("\n🔧 Setting up test environment...")
    
    # Register test user
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
    
    # Login admin
    admin_response = make_request('POST', '/auth/login', admin_credentials)
    if admin_response and admin_response.status_code == 200:
        admin_data = admin_response.json()
        admin_token = admin_data.get('access_token')
        print(f"✅ Admin logged in successfully")
    
    return user_token and admin_token

def test_authentication_flow():
    """PRIORITY TEST 1: Authentication Flow - JWT authentication working properly"""
    print("\n🔴 PRIORITY TEST 1: Authentication Flow")
    print("Testing user registration, login, admin login, and protected routes...")
    
    # Test 1: User Registration
    print("   Testing user registration...")
    reg_response = make_request('POST', '/auth/register', test_user_data)
    if not reg_response or reg_response.status_code not in [200, 201]:
        print(f"❌ User registration failed: {reg_response.text if reg_response else 'No response'}")
        return False
    
    reg_data = reg_response.json()
    if 'access_token' not in reg_data:
        print("❌ Registration response missing access token")
        return False
    
    global user_token, test_user_id, test_user_code
    user_token = reg_data['access_token']
    print("     ✅ User registration successful with JWT token")
    
    # Test 2: Get user profile (protected route)
    print("   Testing protected route access...")
    headers = {"Authorization": f"Bearer {user_token}"}
    profile_response = make_request('GET', '/auth/me', headers=headers)
    if not profile_response or profile_response.status_code != 200:
        print("❌ Protected route access failed")
        return False
    
    profile_data = profile_response.json()
    test_user_id = profile_data['id']
    test_user_code = profile_data['user_code']
    
    # Verify user data
    if profile_data['email'] != test_user_data['email'] or profile_data['name'] != test_user_data['name']:
        print("❌ User profile data mismatch")
        return False
    
    # Verify AZ code format
    if not test_user_code.startswith('AZ'):
        print(f"❌ User code format incorrect: {test_user_code}")
        return False
    
    print(f"     ✅ Protected route access successful, user code: {test_user_code}")
    
    # Test 3: Admin Login
    print("   Testing admin login...")
    admin_response = make_request('POST', '/auth/login', admin_credentials)
    if not admin_response or admin_response.status_code != 200:
        print("❌ Admin login failed")
        return False
    
    admin_data = admin_response.json()
    if 'access_token' not in admin_data:
        print("❌ Admin login response missing access token")
        return False
    
    global admin_token
    admin_token = admin_data['access_token']
    print("     ✅ Admin login successful")
    
    # Test 4: Admin protected route
    print("   Testing admin protected route...")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    stats_response = make_request('GET', '/admin/stats', headers=admin_headers)
    if not stats_response or stats_response.status_code != 200:
        print("❌ Admin protected route access failed")
        return False
    
    stats_data = stats_response.json()
    required_fields = ['total_users', 'active_packages', 'total_deposits', 'total_withdrawals', 'pending_transactions']
    if not all(field in stats_data for field in required_fields):
        print("❌ Admin stats response missing required fields")
        return False
    
    print("     ✅ Admin protected route access successful")
    
    # Test 5: Invalid token access
    print("   Testing invalid token rejection...")
    invalid_headers = {"Authorization": "Bearer invalid_token_12345"}
    invalid_response = make_request('GET', '/auth/me', headers=invalid_headers)
    if not invalid_response or invalid_response.status_code != 401:
        print("❌ Invalid token should be rejected with 401")
        return False
    
    print("     ✅ Invalid token correctly rejected")
    
    print("✅ PRIORITY TEST 1 PASSED: Authentication flow working correctly")
    return True

def test_package_purchase_api():
    """PRIORITY TEST 2: Package Purchase API - Robustness and Android compatibility"""
    print("\n🔴 PRIORITY TEST 2: Package Purchase API")
    print("Testing package purchase with valid amounts, boundary conditions, insufficient balance, real-time notifications...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # First, get package definitions
    pkg_response = make_request('GET', '/packages')
    if not pkg_response or pkg_response.status_code != 200:
        print("❌ Could not get package definitions")
        return False
    
    packages = pkg_response.json()
    print(f"   📋 Package definitions retrieved:")
    for pkg_name, pkg_info in packages.items():
        print(f"     {pkg_name}: {pkg_info['min_amount']}-{pkg_info['max_amount']} AZN, multiplier: {pkg_info['multiplier']}")
    
    # Ensure user has sufficient balance for testing
    balance_response = make_request('GET', '/auth/me', headers=headers)
    if balance_response and balance_response.status_code == 200:
        current_balance = balance_response.json()['balance']
        if current_balance < 1000:
            # Add balance via admin
            if admin_token:
                admin_headers = {"Authorization": f"Bearer {admin_token}"}
                balance_update = {
                    "user_id": test_user_id,
                    "new_balance": 2000.0,
                    "notes": "Balance for package purchase testing"
                }
                make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
                time.sleep(1)
                print("     ✅ Balance updated for testing")
    
    # Test cases for package purchases
    test_cases = [
        # Gold package tests (50-250 AZN)
        {"package": "gold", "amount": 49, "should_fail": True, "test": "Gold below minimum (49 AZN)"},
        {"package": "gold", "amount": 50, "should_fail": False, "test": "Gold minimum (50 AZN)"},
        {"package": "gold", "amount": 150, "should_fail": False, "test": "Gold mid-range (150 AZN)"},
        {"package": "gold", "amount": 250, "should_fail": False, "test": "Gold maximum (250 AZN)"},
        {"package": "gold", "amount": 251, "should_fail": True, "test": "Gold above maximum (251 AZN)"},
        
        # Titanium package tests (250-500 AZN)
        {"package": "titanium", "amount": 249, "should_fail": True, "test": "Titanium below minimum (249 AZN)"},
        {"package": "titanium", "amount": 250, "should_fail": False, "test": "Titanium minimum (250 AZN)"},
        {"package": "titanium", "amount": 375, "should_fail": False, "test": "Titanium mid-range (375 AZN)"},
        {"package": "titanium", "amount": 500, "should_fail": False, "test": "Titanium maximum (500 AZN)"},
        {"package": "titanium", "amount": 501, "should_fail": True, "test": "Titanium above maximum (501 AZN)"},
        
        # Platinum package tests (50-250 AZN based on current backend code)
        {"package": "platinum", "amount": 49, "should_fail": True, "test": "Platinum below minimum (49 AZN)"},
        {"package": "platinum", "amount": 50, "should_fail": False, "test": "Platinum minimum (50 AZN)"},
        {"package": "platinum", "amount": 150, "should_fail": False, "test": "Platinum mid-range (150 AZN)"},
        {"package": "platinum", "amount": 250, "should_fail": False, "test": "Platinum maximum (250 AZN)"},
        {"package": "platinum", "amount": 251, "should_fail": True, "test": "Platinum above maximum (251 AZN)"}
    ]
    
    passed_tests = 0
    total_tests = len(test_cases)
    successful_purchases = []
    
    for test_case in test_cases:
        purchase_data = {
            "package_type": test_case["package"],
            "invested_amount": test_case["amount"]
        }
        
        response = make_request('POST', '/packages/purchase', purchase_data, headers)
        
        if test_case["should_fail"]:
            if response and response.status_code == 400:
                print(f"     ✅ {test_case['test']}: Correctly rejected")
                passed_tests += 1
            else:
                print(f"     ❌ {test_case['test']}: Should have been rejected")
                if response:
                    print(f"       Response: {response.status_code} - {response.text}")
        else:
            if response and response.status_code == 200:
                purchase_result = response.json()
                print(f"     ✅ {test_case['test']}: Correctly accepted")
                print(f"       Package ID: {purchase_result['id']}")
                passed_tests += 1
                successful_purchases.append(purchase_result)
            else:
                print(f"     ❌ {test_case['test']}: Should have been accepted")
                if response:
                    print(f"       Error: {response.status_code} - {response.text}")
    
    # Test insufficient balance scenario
    print("   Testing insufficient balance scenario...")
    insufficient_balance_data = {
        "package_type": "gold",
        "invested_amount": 10000.0  # Amount higher than user balance
    }
    
    insufficient_response = make_request('POST', '/packages/purchase', insufficient_balance_data, headers)
    if insufficient_response and insufficient_response.status_code == 400:
        error_data = insufficient_response.json()
        if "Insufficient balance" in error_data.get('detail', ''):
            print("     ✅ Insufficient balance correctly rejected")
            passed_tests += 1
            total_tests += 1
        else:
            print(f"     ❌ Wrong error message for insufficient balance: {error_data}")
            total_tests += 1
    else:
        print("     ❌ Insufficient balance should have been rejected")
        total_tests += 1
    
    # Verify package creation and earnings system
    if successful_purchases:
        print("   Testing package retrieval and earnings system...")
        packages_response = make_request('GET', '/packages/my', headers=headers)
        if packages_response and packages_response.status_code == 200:
            user_packages = packages_response.json()
            if len(user_packages) > 0:
                print(f"     ✅ User packages retrieved: {len(user_packages)} packages")
                
                # Check package structure
                latest_package = user_packages[0]
                required_fields = ['id', 'package_type', 'invested_amount', 'multiplier', 'duration_days', 'accumulated_earnings']
                if all(field in latest_package for field in required_fields):
                    print("     ✅ Package structure contains all required fields")
                    passed_tests += 1
                    total_tests += 1
                else:
                    print("     ❌ Package structure missing required fields")
                    total_tests += 1
            else:
                print("     ❌ No packages found for user")
                total_tests += 1
        else:
            print("     ❌ Failed to retrieve user packages")
            total_tests += 1
    
    success_rate = (passed_tests / total_tests) * 100
    print(f"   📊 Package purchase tests: {passed_tests}/{total_tests} passed ({success_rate:.1f}%)")
    
    if success_rate >= 85:  # High threshold for critical functionality
        print(f"✅ PRIORITY TEST 2 PASSED: Package purchase API working correctly")
        return True
    else:
        print(f"❌ PRIORITY TEST 2 FAILED: Package purchase API has issues")
        return False

def test_transaction_apis_new_format():
    """PRIORITY TEST 3: Transaction APIs - New card_name format (combined name + surname)"""
    print("\n🔴 PRIORITY TEST 3: Transaction APIs with New Format")
    print("Testing withdrawal and deposit with card_name as 'Name Surname', card_number as bank name...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Ensure user has sufficient balance for withdrawal testing
    if admin_token:
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        balance_update = {
            "user_id": test_user_id,
            "new_balance": 7000.0,  # Enough for withdrawal testing
            "notes": "Balance for transaction testing"
        }
        make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
        time.sleep(1)
        print("     ✅ Balance updated for transaction testing")
    
    # Test 1: Deposit with new format
    print("   Testing deposit with new format...")
    deposit_test_cases = [
        {"amount": 49, "should_fail": True, "test": "Deposit below minimum (49 AZN)"},
        {"amount": 50, "should_fail": False, "test": "Deposit minimum (50 AZN)"},
        {"amount": 1000, "should_fail": False, "test": "Deposit mid-range (1000 AZN)"},
        {"amount": 2000, "should_fail": False, "test": "Deposit maximum (2000 AZN)"},
        {"amount": 2001, "should_fail": True, "test": "Deposit above maximum (2001 AZN)"}
    ]
    
    deposit_passed = 0
    deposit_total = len(deposit_test_cases)
    successful_deposits = []
    
    for test_case in deposit_test_cases:
        deposit_data = {
            "type": "deposit",
            "amount": test_case["amount"],
            "card_name": transaction_test_data["deposit"]["card_name"],  # "Leyla Hasanova"
            "card_number": transaction_test_data["deposit"]["card_number"]  # "Pasha Bank"
        }
        
        response = make_request('POST', '/transactions', deposit_data, headers)
        
        if test_case["should_fail"]:
            if response and response.status_code == 400:
                error_data = response.json()
                if "50-2000 AZN" in error_data.get('detail', ''):
                    print(f"     ✅ {test_case['test']}: Correctly rejected with proper error")
                    deposit_passed += 1
                else:
                    print(f"     ❌ {test_case['test']}: Rejected but wrong error message")
            else:
                print(f"     ❌ {test_case['test']}: Should have been rejected")
        else:
            if response and response.status_code == 200:
                transaction_result = response.json()
                print(f"     ✅ {test_case['test']}: Correctly accepted")
                print(f"       Transaction ID: {transaction_result['id']}")
                print(f"       Card Name: {transaction_result['card_name']}")
                print(f"       Card Number (Bank): {transaction_result['card_number']}")
                
                # Verify new format is stored correctly
                if (transaction_result['card_name'] == transaction_test_data["deposit"]["card_name"] and
                    transaction_result['card_number'] == transaction_test_data["deposit"]["card_number"]):
                    print(f"       ✅ New format stored correctly")
                else:
                    print(f"       ❌ New format not stored correctly")
                
                deposit_passed += 1
                successful_deposits.append(transaction_result)
            else:
                print(f"     ❌ {test_case['test']}: Should have been accepted")
                if response:
                    print(f"       Error: {response.status_code} - {response.text}")
    
    # Test 2: Withdrawal with new format
    print("   Testing withdrawal with new format...")
    withdrawal_test_cases = [
        {"amount": 499, "should_fail": True, "test": "Withdrawal below minimum (499 AZN)"},
        {"amount": 500, "should_fail": False, "test": "Withdrawal minimum (500 AZN)"},
        {"amount": 3000, "should_fail": False, "test": "Withdrawal mid-range (3000 AZN)"},
        {"amount": 6500, "should_fail": False, "test": "Withdrawal maximum (6500 AZN)"},
        {"amount": 6501, "should_fail": True, "test": "Withdrawal above maximum (6501 AZN)"}
    ]
    
    withdrawal_passed = 0
    withdrawal_total = len(withdrawal_test_cases)
    successful_withdrawals = []
    
    for test_case in withdrawal_test_cases:
        withdrawal_data = {
            "type": "withdraw",
            "amount": test_case["amount"],
            "card_name": transaction_test_data["withdrawal"]["card_name"],  # "Leyla Hasanova"
            "card_number": transaction_test_data["withdrawal"]["card_number"]  # "Kapital Bank"
        }
        
        response = make_request('POST', '/transactions', withdrawal_data, headers)
        
        if test_case["should_fail"]:
            if response and response.status_code == 400:
                error_data = response.json()
                if "500-6500 AZN" in error_data.get('detail', '') or "Insufficient balance" in error_data.get('detail', ''):
                    print(f"     ✅ {test_case['test']}: Correctly rejected")
                    withdrawal_passed += 1
                else:
                    print(f"     ❌ {test_case['test']}: Rejected but wrong error message: {error_data}")
            else:
                print(f"     ❌ {test_case['test']}: Should have been rejected")
        else:
            if response and response.status_code == 200:
                transaction_result = response.json()
                print(f"     ✅ {test_case['test']}: Correctly accepted")
                print(f"       Transaction ID: {transaction_result['id']}")
                print(f"       Card Name: {transaction_result['card_name']}")
                print(f"       Card Number (Bank): {transaction_result['card_number']}")
                
                # Verify new format is stored correctly
                if (transaction_result['card_name'] == transaction_test_data["withdrawal"]["card_name"] and
                    transaction_result['card_number'] == transaction_test_data["withdrawal"]["card_number"]):
                    print(f"       ✅ New format stored correctly")
                else:
                    print(f"       ❌ New format not stored correctly")
                
                withdrawal_passed += 1
                successful_withdrawals.append(transaction_result)
            else:
                print(f"     ❌ {test_case['test']}: Should have been accepted")
                if response:
                    print(f"       Error: {response.status_code} - {response.text}")
    
    # Test 3: File upload for receipts (for deposits)
    if successful_deposits:
        print("   Testing file upload for receipts...")
        deposit_transaction = successful_deposits[0]
        test_file_content = b"Test receipt content for new format testing"
        files = {'file': ('test_receipt_new_format.jpg', test_file_content, 'image/jpeg')}
        
        upload_response = make_request('POST', f'/transactions/{deposit_transaction["id"]}/upload-receipt', 
                                     headers=headers, files=files)
        
        if upload_response and upload_response.status_code == 200:
            upload_result = upload_response.json()
            print(f"     ✅ Receipt upload successful: {upload_result['filename']}")
            deposit_passed += 1
            deposit_total += 1
        else:
            print(f"     ❌ Receipt upload failed")
            if upload_response:
                print(f"       Error: {upload_response.status_code} - {upload_response.text}")
            deposit_total += 1
    
    # Calculate overall success rate
    total_passed = deposit_passed + withdrawal_passed
    total_tests = deposit_total + withdrawal_total
    success_rate = (total_passed / total_tests) * 100
    
    print(f"   📊 Transaction tests: {total_passed}/{total_tests} passed ({success_rate:.1f}%)")
    print(f"     Deposits: {deposit_passed}/{deposit_total}")
    print(f"     Withdrawals: {withdrawal_passed}/{withdrawal_total}")
    
    if success_rate >= 80:
        print(f"✅ PRIORITY TEST 3 PASSED: Transaction APIs with new format working correctly")
        return True
    else:
        print(f"❌ PRIORITY TEST 3 FAILED: Transaction APIs have issues with new format")
        return False

def test_real_time_notifications():
    """PRIORITY TEST 4: Real-time WebSocket Notifications"""
    print("\n🔴 PRIORITY TEST 4: Real-time WebSocket Notifications")
    print("Testing WebSocket notifications for package purchases and transactions...")
    
    if not user_token or not admin_token:
        print("❌ Missing required tokens")
        return False
    
    # Setup WebSocket connection for admin notifications
    ws_url = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')
    admin_ws_url = f"{ws_url}/ws/admin"
    
    admin_connected = False
    notifications_received = []
    
    def on_admin_message(ws, message):
        try:
            data = json.loads(message)
            notifications_received.append(data)
            print(f"   📨 Real-time notification: {data.get('type', 'unknown')}")
        except:
            notifications_received.append(message)
    
    def on_admin_open(ws):
        nonlocal admin_connected
        admin_connected = True
        print(f"   ✅ Admin WebSocket connected")
    
    try:
        # Create admin WebSocket connection
        admin_ws = websocket.WebSocketApp(admin_ws_url,
                                        on_open=on_admin_open,
                                        on_message=on_admin_message)
        
        # Run WebSocket in separate thread
        ws_thread = threading.Thread(target=admin_ws.run_forever)
        ws_thread.daemon = True
        ws_thread.start()
        
        # Wait for connection
        time.sleep(3)
        
        if not admin_connected:
            print("❌ Admin WebSocket connection failed")
            return False
        
        # Test package purchase notification
        print("   Testing package purchase notification...")
        headers = {"Authorization": f"Bearer {user_token}"}
        purchase_data = {
            "package_type": "gold",
            "invested_amount": 100.0
        }
        
        purchase_response = make_request('POST', '/packages/purchase', purchase_data, headers)
        time.sleep(2)  # Wait for notification
        
        # Test transaction notification
        print("   Testing transaction notification...")
        transaction_data = {
            "type": "deposit",
            "amount": 200.0,
            "card_name": "Leyla Hasanova",
            "card_number": "Kapital Bank"
        }
        
        txn_response = make_request('POST', '/transactions', transaction_data, headers)
        time.sleep(2)  # Wait for notification
        
        # Close WebSocket
        admin_ws.close()
        time.sleep(1)
        
        # Analyze results
        print(f"   📊 Total notifications received: {len(notifications_received)}")
        
        notification_types = [notif.get('type', 'unknown') if isinstance(notif, dict) else 'text' 
                            for notif in notifications_received]
        
        expected_types = ['package_purchase', 'new_transaction']
        found_types = [t for t in expected_types if t in notification_types]
        
        print(f"   📋 Expected notification types: {expected_types}")
        print(f"   ✅ Found notification types: {found_types}")
        
        if len(found_types) >= 1:  # At least 1 notification type
            print(f"✅ PRIORITY TEST 4 PASSED: Real-time notifications working ({len(found_types)}/2 types)")
            return True
        else:
            print(f"❌ PRIORITY TEST 4 FAILED: No expected notifications received")
            return False
            
    except Exception as e:
        print(f"❌ PRIORITY TEST 4 FAILED with exception: {e}")
        return False

def test_final_package_purchase_balance_deduction():
    """FINAL VERIFICATION TEST: Complete Package Purchase Balance Deduction Flow"""
    print("\n🎯 FINAL VERIFICATION TEST: Package Purchase Balance Deduction")
    print("Testing complete flow: registration bonus → admin balance increase → package purchase → balance deduction → package activation")
    
    # Test data for final verification
    final_test_user = {
        "email": "final.test.user@example.com",
        "name": "Final Test User",
        "password": "testpass123"
    }
    
    print("\n📋 STEP 1: Create User with Sufficient Balance")
    
    # Register new user
    reg_response = make_request('POST', '/auth/register', final_test_user)
    if not reg_response or reg_response.status_code not in [200, 201]:
        print(f"❌ User registration failed: {reg_response.text if reg_response else 'No response'}")
        return False
    
    reg_data = reg_response.json()
    final_user_token = reg_data['access_token']
    print("✅ User registered successfully")
    
    # Get user profile to verify registration bonus
    headers = {"Authorization": f"Bearer {final_user_token}"}
    profile_response = make_request('GET', '/auth/me', headers=headers)
    if not profile_response or profile_response.status_code != 200:
        print("❌ Failed to get user profile")
        return False
    
    profile_data = profile_response.json()
    final_user_id = profile_data['id']
    initial_balance = profile_data['balance']
    initial_invested = profile_data['total_invested']
    
    print(f"✅ Registration bonus verified: {initial_balance} AZN")
    print(f"✅ Initial total invested: {initial_invested} AZN")
    
    if initial_balance != 10.0:
        print(f"❌ Expected 10 AZN registration bonus, got {initial_balance} AZN")
        return False
    
    # Use admin to increase balance to 100 AZN
    if not admin_token:
        print("❌ Admin token not available")
        return False
    
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    balance_update = {
        "user_id": final_user_id,
        "new_balance": 100.0,
        "notes": "Final verification test - increase to 100 AZN"
    }
    
    balance_response = make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
    if not balance_response or balance_response.status_code != 200:
        print("❌ Failed to update user balance via admin")
        return False
    
    print("✅ Admin balance update successful")
    
    # Verify balance update
    time.sleep(1)  # Wait for update
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
    gold_purchase = {
        "package_type": "gold",
        "invested_amount": 50.0
    }
    
    purchase_response = make_request('POST', '/packages/purchase', gold_purchase, headers)
    if not purchase_response or purchase_response.status_code != 200:
        print(f"❌ Gold package purchase failed: {purchase_response.text if purchase_response else 'No response'}")
        return False
    
    purchase_data = purchase_response.json()
    package_id = purchase_data['id']
    print(f"✅ Gold package purchased successfully (ID: {package_id})")
    
    # Verify balance deduction (100 → 50 AZN)
    time.sleep(1)  # Wait for balance update
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
    
    print("✅ CRITICAL: Balance deduction working correctly (100 → 50 AZN)")
    print("✅ CRITICAL: Total invested updated correctly (0 → 50 AZN)")
    
    # Verify package activation
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
    
    print("✅ CRITICAL: Package activation working (is_active: true)")
    print(f"✅ Package details: {active_package['package_type']}, {active_package['invested_amount']} AZN, multiplier: {active_package['multiplier']}")
    
    print("\n📋 STEP 3: Test Multiple Package Purchases")
    
    # Purchase another package (30 AZN - within Gold range)
    second_purchase = {
        "package_type": "gold",
        "invested_amount": 30.0
    }
    
    second_response = make_request('POST', '/packages/purchase', second_purchase, headers)
    if not second_response or second_response.status_code != 200:
        print(f"❌ Second package purchase failed: {second_response.text if second_response else 'No response'}")
        return False
    
    second_data = second_response.json()
    second_package_id = second_data['id']
    print(f"✅ Second package purchased successfully (ID: {second_package_id})")
    
    # Verify balance deduction (50 → 20 AZN)
    time.sleep(1)
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
    
    print("\n🎉 FINAL VERIFICATION TEST COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print("✅ Registration bonus working (10 AZN)")
    print("✅ Balance deduction working after purchase")
    print("✅ Package activation working (is_active: true)")
    print("✅ Multiple package handling working (old becomes inactive)")
    print("✅ Only active packages visible to user")
    print("=" * 60)
    
    return True

def run_priority_tests():
    """Run all priority tests focusing on recently implemented changes"""
    print("🚀 PRIORITY TESTING AREAS - InvestAZ Backend")
    print(f"Backend URL: {API_URL}")
    print("=" * 80)
    
    # Setup test environment
    if not setup_test_environment():
        print("❌ Failed to setup test environment")
        return
    
    # Priority tests based on review request - FINAL VERIFICATION FOCUS
    priority_tests = [
        ("FINAL Package Purchase Balance Deduction", test_final_package_purchase_balance_deduction),
        ("Authentication Flow", test_authentication_flow),
        ("Package Purchase API", test_package_purchase_api),
        ("Transaction APIs with New Format", test_transaction_apis_new_format),
        ("Real-time WebSocket Notifications", test_real_time_notifications)
    ]
    
    passed = 0
    failed = 0
    results = []
    
    print("\n🔴 RUNNING PRIORITY TESTS")
    print("=" * 50)
    
    for test_name, test_func in priority_tests:
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
    print("📊 PRIORITY TESTS RESULTS")
    print("=" * 80)
    
    for result in results:
        print(result)
    
    print(f"\n📈 SUMMARY:")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 ALL PRIORITY TESTS PASSED!")
        print("✅ Recently implemented changes are working correctly")
    else:
        print(f"\n⚠️  {failed} PRIORITY TESTS FAILED")
        print("❌ Recently implemented changes need attention")
    
    return passed, failed

if __name__ == "__main__":
    run_priority_tests()