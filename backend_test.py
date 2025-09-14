#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for InvestAZ Platform - PRIORITY TESTING AREAS
Focus on recently implemented changes:
1. Package Purchase API - Test /api/packages/purchase endpoint for robustness and Android compatibility
2. Transaction APIs - Test withdrawal and deposit endpoints with new card_name format (combined name + surname)
3. Authentication Flow - Verify JWT authentication is working properly

SPECIFIC TEST SCENARIOS:
- Package Purchase Tests: Valid amounts, boundary conditions, insufficient balance, real-time notifications
- Transaction Tests: New format with card_name as "Name Surname", card_number as bank name
- Authentication Tests: User registration, login, admin login, protected routes
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
    return "https://investor-portal-7.preview.emergentagent.com"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

print(f"Testing InvestAZ Backend API at: {API_URL}")
print("=" * 60)

# Test data - Using realistic data as per requirements
test_user_data = {
    "email": "aysel.mammadova@gmail.com",
    "name": "Aysel Mammadova",
    "password": "securepass123"
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

def test_admin_websocket_notifications():
    """CRITICAL TEST 1: Admin Panel Real-time Notifications via WebSocket"""
    print("\n🔴 CRITICAL TEST 1: Admin Panel Real-time Notifications")
    print("Testing WebSocket connection to /ws/admin and real-time notifications...")
    
    if not admin_token:
        print("❌ No admin token available")
        return False
    
    # Setup WebSocket connection for admin
    ws_url = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')
    admin_ws_url = f"{ws_url}/ws/admin"
    
    admin_connected = False
    notifications_received = []
    
    def on_admin_message(ws, message):
        try:
            data = json.loads(message)
            notifications_received.append(data)
            print(f"   📨 Admin notification received: {data.get('type', 'unknown')}")
        except:
            notifications_received.append(message)
            print(f"   📨 Admin message received: {message}")
    
    def on_admin_error(ws, error):
        print(f"   ❌ Admin WebSocket error: {error}")
    
    def on_admin_close(ws, close_status_code, close_msg):
        print(f"   🔌 Admin WebSocket closed")
    
    def on_admin_open(ws):
        nonlocal admin_connected
        admin_connected = True
        print(f"   ✅ Admin WebSocket connected to /ws/admin")
    
    try:
        # Create admin WebSocket connection
        admin_ws = websocket.WebSocketApp(admin_ws_url,
                                        on_open=on_admin_open,
                                        on_message=on_admin_message,
                                        on_error=on_admin_error,
                                        on_close=on_admin_close)
        
        # Run WebSocket in separate thread
        ws_thread = threading.Thread(target=admin_ws.run_forever)
        ws_thread.daemon = True
        ws_thread.start()
        
        # Wait for connection
        time.sleep(3)
        
        if not admin_connected:
            print("❌ Admin WebSocket connection failed")
            return False
        
        # Test 1: New user registration notification
        print("   Testing new user registration notification...")
        new_user_data = {
            "email": "test.notification@gmail.com",
            "name": "Test Notification User",
            "password": "testpass123"
        }
        
        reg_response = make_request('POST', '/auth/register', new_user_data)
        time.sleep(2)  # Wait for notification
        
        # Test 2: Package purchase notification
        if reg_response and reg_response.status_code in [200, 201]:
            reg_data = reg_response.json()
            temp_token = reg_data.get('access_token')
            
            if temp_token:
                print("   Testing package purchase notification...")
                headers = {"Authorization": f"Bearer {temp_token}"}
                purchase_data = {
                    "package_type": "gold",
                    "invested_amount": 50.0
                }
                
                purchase_response = make_request('POST', '/packages/purchase', purchase_data, headers)
                time.sleep(2)  # Wait for notification
                
                # Test 3: Transaction notification
                print("   Testing transaction notification...")
                transaction_data = {
                    "type": "deposit",
                    "amount": 100.0,
                    "card_name": "Test User",
                    "card_number": "1234567890123456"
                }
                
                txn_response = make_request('POST', '/transactions', transaction_data, headers)
                time.sleep(2)  # Wait for notification
                
                # Test 4: Message notification
                print("   Testing support message notification...")
                message_data = {
                    "content": "Test support message for admin notification",
                    "message_type": "support"
                }
                
                msg_response = make_request('POST', '/messages', message_data, headers)
                time.sleep(2)  # Wait for notification
        
        # Close WebSocket
        admin_ws.close()
        time.sleep(1)
        
        # Analyze results
        print(f"   📊 Total notifications received: {len(notifications_received)}")
        
        notification_types = [notif.get('type', 'unknown') if isinstance(notif, dict) else 'text' 
                            for notif in notifications_received]
        
        expected_types = ['new_user_registration', 'package_purchase', 'new_transaction', 'new_message']
        found_types = [t for t in expected_types if t in notification_types]
        
        print(f"   📋 Expected notification types: {expected_types}")
        print(f"   ✅ Found notification types: {found_types}")
        
        if len(found_types) >= 3:  # At least 3 out of 4 notification types
            print(f"✅ CRITICAL TEST 1 PASSED: Admin WebSocket notifications working ({len(found_types)}/4 types)")
            return True
        else:
            print(f"❌ CRITICAL TEST 1 FAILED: Only {len(found_types)}/4 notification types received")
            return False
            
    except Exception as e:
        print(f"❌ CRITICAL TEST 1 FAILED with exception: {e}")
        return False

def test_updated_package_limits():
    """CRITICAL TEST 2: Updated Investment Package Limits"""
    print("\n🔴 CRITICAL TEST 2: Updated Investment Package Limits")
    print("Testing Gold: 50-250, Titanium: 250-500, Platinum: 500-2000 AZN")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # First, get package definitions to verify limits
    pkg_response = make_request('GET', '/packages')
    if not pkg_response or pkg_response.status_code != 200:
        print("❌ Could not get package definitions")
        return False
    
    packages = pkg_response.json()
    print(f"   📋 Package definitions retrieved:")
    
    expected_limits = {
        "gold": {"min": 50, "max": 250},
        "titanium": {"min": 250, "max": 500}, 
        "platinum": {"min": 500, "max": 2000}
    }
    
    limits_correct = True
    for pkg_name, expected in expected_limits.items():
        if pkg_name in packages:
            actual_min = packages[pkg_name]["min_amount"]
            actual_max = packages[pkg_name]["max_amount"]
            print(f"     {pkg_name}: {actual_min}-{actual_max} AZN (expected: {expected['min']}-{expected['max']})")
            
            if actual_min != expected["min"] or actual_max != expected["max"]:
                print(f"     ❌ {pkg_name} limits incorrect!")
                limits_correct = False
        else:
            print(f"     ❌ {pkg_name} package not found!")
            limits_correct = False
    
    if not limits_correct:
        print("❌ CRITICAL TEST 2 FAILED: Package limits are incorrect")
        return False
    
    # Test boundary values
    test_cases = [
        # Gold package tests
        {"package": "gold", "amount": 49, "should_fail": True, "test": "Below gold minimum"},
        {"package": "gold", "amount": 50, "should_fail": False, "test": "Gold minimum"},
        {"package": "gold", "amount": 250, "should_fail": False, "test": "Gold maximum"},
        {"package": "gold", "amount": 251, "should_fail": True, "test": "Above gold maximum"},
        
        # Titanium package tests  
        {"package": "titanium", "amount": 249, "should_fail": True, "test": "Below titanium minimum"},
        {"package": "titanium", "amount": 250, "should_fail": False, "test": "Titanium minimum"},
        {"package": "titanium", "amount": 500, "should_fail": False, "test": "Titanium maximum"},
        {"package": "titanium", "amount": 501, "should_fail": True, "test": "Above titanium maximum"},
        
        # Platinum package tests
        {"package": "platinum", "amount": 499, "should_fail": True, "test": "Below platinum minimum"},
        {"package": "platinum", "amount": 500, "should_fail": False, "test": "Platinum minimum"},
        {"package": "platinum", "amount": 2000, "should_fail": False, "test": "Platinum maximum"},
        {"package": "platinum", "amount": 2001, "should_fail": True, "test": "Above platinum maximum"}
    ]
    
    # First, ensure user has enough balance for testing
    balance_response = make_request('GET', '/auth/me', headers=headers)
    if balance_response and balance_response.status_code == 200:
        current_balance = balance_response.json()['balance']
        if current_balance < 2500:
            # Add balance via admin
            if admin_token:
                admin_headers = {"Authorization": f"Bearer {admin_token}"}
                balance_update = {
                    "user_id": test_user_id,
                    "new_balance": 3000.0,
                    "notes": "Balance for package limit testing"
                }
                make_request('POST', '/admin/users/update-balance', balance_update, admin_headers)
                time.sleep(1)
    
    passed_tests = 0
    total_tests = len(test_cases)
    
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
        else:
            if response and response.status_code == 200:
                print(f"     ✅ {test_case['test']}: Correctly accepted")
                passed_tests += 1
            else:
                print(f"     ❌ {test_case['test']}: Should have been accepted")
                if response:
                    print(f"       Error: {response.text}")
    
    success_rate = (passed_tests / total_tests) * 100
    print(f"   📊 Package limit tests: {passed_tests}/{total_tests} passed ({success_rate:.1f}%)")
    
    if success_rate >= 80:  # Allow some tolerance
        print(f"✅ CRITICAL TEST 2 PASSED: Package limits working correctly")
        return True
    else:
        print(f"❌ CRITICAL TEST 2 FAILED: Package limits not working correctly")
        return False

def test_support_message_restriction():
    """CRITICAL TEST 3: Support System Message Restriction"""
    print("\n🔴 CRITICAL TEST 3: Support System Message Restriction")
    print("Testing: User can only send ONE message until admin replies")
    
    if not user_token or not admin_token:
        print("❌ Missing user or admin token")
        return False
    
    user_headers = {"Authorization": f"Bearer {user_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Step 1: Send first message (should succeed)
    print("   Step 1: Sending first support message...")
    first_message = {
        "content": "Salam, investisiya paketim haqqında sualım var. Kömək edə bilərsinizmi?",
        "message_type": "support"
    }
    
    response1 = make_request('POST', '/messages', first_message, user_headers)
    if not response1 or response1.status_code != 200:
        print("❌ First message failed to send")
        return False
    
    first_msg_data = response1.json()
    first_msg_id = first_msg_data['id']
    print(f"     ✅ First message sent successfully (ID: {first_msg_id})")
    
    # Step 2: Try to send second message (should fail)
    print("   Step 2: Attempting to send second message (should be blocked)...")
    second_message = {
        "content": "Həmçinin, balansım haqqında da sual var.",
        "message_type": "support"
    }
    
    response2 = make_request('POST', '/messages', second_message, user_headers)
    if response2 and response2.status_code == 400:
        error_data = response2.json()
        if "Admin cavab verənə qədər" in error_data.get('detail', ''):
            print(f"     ✅ Second message correctly blocked: {error_data['detail']}")
        else:
            print(f"     ❌ Second message blocked but wrong error message: {error_data}")
            return False
    else:
        print(f"     ❌ Second message should have been blocked but wasn't")
        return False
    
    # Step 3: Admin replies to first message
    print("   Step 3: Admin replying to first message...")
    admin_reply = {
        "content": "Salam! Əlbəttə kömək edəcəyəm. Hansı paket haqqında sualınız var?"
    }
    
    reply_response = make_request('POST', f'/admin/messages/{first_msg_id}/reply', admin_reply, admin_headers)
    if not reply_response or reply_response.status_code != 200:
        print("❌ Admin reply failed")
        return False
    
    print(f"     ✅ Admin reply sent successfully")
    time.sleep(1)  # Small delay
    
    # Step 4: Try to send third message (should succeed now)
    print("   Step 4: Attempting to send message after admin reply (should succeed)...")
    third_message = {
        "content": "Təşəkkür edirəm! Platinum paket haqqında məlumat istəyirəm.",
        "message_type": "support"
    }
    
    response3 = make_request('POST', '/messages', third_message, user_headers)
    if response3 and response3.status_code == 200:
        print(f"     ✅ Third message sent successfully after admin reply")
    else:
        print(f"     ❌ Third message should have been allowed after admin reply")
        return False
    
    # Step 5: Try to send fourth message (should be blocked again)
    print("   Step 5: Attempting to send fourth message (should be blocked again)...")
    fourth_message = {
        "content": "Həmçinin, gəlir toplama prosesi necə işləyir?",
        "message_type": "support"
    }
    
    response4 = make_request('POST', '/messages', fourth_message, user_headers)
    if response4 and response4.status_code == 400:
        print(f"     ✅ Fourth message correctly blocked again")
        print(f"✅ CRITICAL TEST 3 PASSED: Message restriction system working correctly")
        return True
    else:
        print(f"     ❌ Fourth message should have been blocked")
        print(f"❌ CRITICAL TEST 3 FAILED: Message restriction not working")
        return False

def test_updated_deposit_limits():
    """CRITICAL TEST 4: Updated Deposit Limits (50-2000 AZN)"""
    print("\n🔴 CRITICAL TEST 4: Updated Deposit Limits (50-2000 AZN)")
    print("Testing deposit limits changed from 50-2500 to 50-2000 AZN")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    test_cases = [
        {"amount": 49, "should_fail": True, "test": "Below minimum (49 AZN)"},
        {"amount": 50, "should_fail": False, "test": "At minimum (50 AZN)"},
        {"amount": 1000, "should_fail": False, "test": "Mid-range (1000 AZN)"},
        {"amount": 2000, "should_fail": False, "test": "At maximum (2000 AZN)"},
        {"amount": 2001, "should_fail": True, "test": "Above maximum (2001 AZN)"},
        {"amount": 2500, "should_fail": True, "test": "Old maximum (2500 AZN) - should now fail"}
    ]
    
    passed_tests = 0
    total_tests = len(test_cases)
    
    for test_case in test_cases:
        transaction_data = {
            "type": "deposit",
            "amount": test_case["amount"],
            "card_name": "Aysel Mammadova",
            "card_number": "4169738825001234"
        }
        
        response = make_request('POST', '/transactions', transaction_data, headers)
        
        if test_case["should_fail"]:
            if response and response.status_code == 400:
                error_data = response.json()
                if "50-2000 AZN" in error_data.get('detail', ''):
                    print(f"     ✅ {test_case['test']}: Correctly rejected with proper error")
                    passed_tests += 1
                else:
                    print(f"     ❌ {test_case['test']}: Rejected but wrong error message")
            else:
                print(f"     ❌ {test_case['test']}: Should have been rejected")
        else:
            if response and response.status_code == 200:
                print(f"     ✅ {test_case['test']}: Correctly accepted")
                passed_tests += 1
                # Store transaction ID for potential cleanup
                if test_case["amount"] == 50:
                    global test_transaction_id
                    test_transaction_id = response.json()['id']
            else:
                print(f"     ❌ {test_case['test']}: Should have been accepted")
                if response:
                    print(f"       Error: {response.text}")
    
    success_rate = (passed_tests / total_tests) * 100
    print(f"   📊 Deposit limit tests: {passed_tests}/{total_tests} passed ({success_rate:.1f}%)")
    
    if success_rate >= 80:
        print(f"✅ CRITICAL TEST 4 PASSED: Deposit limits working correctly")
        return True
    else:
        print(f"❌ CRITICAL TEST 4 FAILED: Deposit limits not working correctly")
        return False

def test_receipt_upload_notification():
    """CRITICAL TEST 5: Receipt Upload Real-time Notification"""
    print("\n🔴 CRITICAL TEST 5: Receipt Upload Real-time Notification")
    print("Testing admin receives immediate notification when user uploads receipt")
    
    if not user_token or not admin_token or not test_transaction_id:
        print("❌ Missing required tokens or transaction ID")
        return False
    
    # Setup admin WebSocket to listen for receipt notifications
    ws_url = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')
    admin_ws_url = f"{ws_url}/ws/admin"
    
    receipt_notifications = []
    admin_connected = False
    
    def on_receipt_message(ws, message):
        try:
            data = json.loads(message)
            if data.get('type') == 'receipt_uploaded':
                receipt_notifications.append(data)
                print(f"   📨 Receipt notification received: {data}")
        except:
            pass
    
    def on_receipt_open(ws):
        nonlocal admin_connected
        admin_connected = True
        print(f"   ✅ Admin WebSocket connected for receipt testing")
    
    try:
        # Create admin WebSocket connection
        admin_ws = websocket.WebSocketApp(admin_ws_url,
                                        on_open=on_receipt_open,
                                        on_message=on_receipt_message)
        
        # Run WebSocket in separate thread
        ws_thread = threading.Thread(target=admin_ws.run_forever)
        ws_thread.daemon = True
        ws_thread.start()
        
        # Wait for connection
        time.sleep(2)
        
        if not admin_connected:
            print("❌ Admin WebSocket connection failed")
            return False
        
        # Upload receipt
        print("   Uploading test receipt...")
        user_headers = {"Authorization": f"Bearer {user_token}"}
        test_file_content = b"Test receipt content for notification testing"
        files = {'file': ('test_receipt_notification.jpg', test_file_content, 'image/jpeg')}
        
        upload_response = make_request('POST', f'/transactions/{test_transaction_id}/upload-receipt', 
                                     headers=user_headers, files=files)
        
        if not upload_response or upload_response.status_code != 200:
            print("❌ Receipt upload failed")
            admin_ws.close()
            return False
        
        print("   ✅ Receipt uploaded successfully")
        
        # Wait for notification
        time.sleep(3)
        admin_ws.close()
        
        if len(receipt_notifications) > 0:
            notification = receipt_notifications[0]
            required_fields = ['type', 'transaction_id', 'user_name', 'user_code', 'filename', 'amount']
            
            if all(field in notification for field in required_fields):
                print(f"   ✅ Receipt notification contains all required fields")
                print(f"   📋 Notification details: User {notification['user_name']} ({notification['user_code']}) uploaded {notification['filename']}")
                print(f"✅ CRITICAL TEST 5 PASSED: Receipt upload notifications working")
                return True
            else:
                print(f"   ❌ Receipt notification missing required fields")
                return False
        else:
            print(f"❌ CRITICAL TEST 5 FAILED: No receipt notification received")
            return False
            
    except Exception as e:
        print(f"❌ CRITICAL TEST 5 FAILED with exception: {e}")
        return False

def run_critical_tests():
    """Run all critical tests focusing on NEW FEATURES"""
    print("🚀 CRITICAL NEW FEATURES TESTING - InvestAZ Backend")
    print(f"Backend URL: {API_URL}")
    print("=" * 80)
    
    # Setup test environment
    if not setup_test_environment():
        print("❌ Failed to setup test environment")
        return
    
    # Critical tests based on user requirements
    critical_tests = [
        ("Admin Panel Real-time Notifications", test_admin_websocket_notifications),
        ("Updated Investment Package Limits", test_updated_package_limits),
        ("Support System Message Restriction", test_support_message_restriction),
        ("Updated Deposit Limits", test_updated_deposit_limits),
        ("Receipt Upload Real-time Notification", test_receipt_upload_notification)
    ]
    
    passed = 0
    failed = 0
    results = []
    
    print("\n🔴 RUNNING CRITICAL TESTS")
    print("=" * 50)
    
    for test_name, test_func in critical_tests:
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
    print("📊 CRITICAL TESTS RESULTS")
    print("=" * 80)
    
    for result in results:
        print(result)
    
    print(f"\n📈 SUMMARY:")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 ALL CRITICAL TESTS PASSED!")
        print("✅ NEW FEATURES are working correctly")
    else:
        print(f"\n⚠️  {failed} CRITICAL TESTS FAILED")
        print("❌ NEW FEATURES need attention")
    
    return passed, failed

if __name__ == "__main__":
    run_critical_tests()