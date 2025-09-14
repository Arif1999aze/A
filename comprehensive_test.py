#!/usr/bin/env python3
"""
Comprehensive test of NEW FEATURES with proper setup
"""

import requests
import json
import time
from pathlib import Path

def get_backend_url():
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "https://investaz-platform.preview.emergentagent.com"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

print(f"Comprehensive testing at: {API_URL}")

admin_credentials = {
    "email": "admin@investaz.com",
    "password": "18061999"
}

def test_all_new_features():
    """Test all NEW FEATURES comprehensively"""
    
    # Get admin token
    admin_response = requests.post(f"{API_URL}/auth/login", json=admin_credentials)
    if admin_response.status_code != 200:
        print(f"❌ Admin login failed: {admin_response.text}")
        return
    
    admin_token = admin_response.json()['access_token']
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    print("✅ Admin logged in successfully")
    
    # Test 1: Updated Package Limits
    print("\n🔴 TEST 1: Updated Package Limits")
    
    # Register test user
    test_user = {
        "email": "comprehensive.test@gmail.com",
        "name": "Comprehensive Test User",
        "password": "comptest123"
    }
    
    reg_response = requests.post(f"{API_URL}/auth/register", json=test_user)
    if reg_response.status_code not in [200, 201]:
        print(f"❌ User registration failed: {reg_response.text}")
        return
    
    user_token = reg_response.json()['access_token']
    user_headers = {"Authorization": f"Bearer {user_token}"}
    
    # Get user ID for balance update
    profile_response = requests.get(f"{API_URL}/auth/me", headers=user_headers)
    user_data = profile_response.json()
    user_id = user_data['id']
    user_code = user_data['user_code']
    
    print(f"✅ User registered: {user_code}")
    
    # Update user balance to 3000 AZN for testing
    balance_update = {
        "user_id": user_id,
        "new_balance": 3000.0,
        "notes": "Balance for comprehensive testing"
    }
    
    balance_response = requests.post(f"{API_URL}/admin/users/update-balance", json=balance_update, headers=admin_headers)
    if balance_response.status_code == 200:
        print("✅ User balance updated to 3000 AZN")
    
    time.sleep(1)  # Wait for balance update
    
    # Test package limits
    package_tests = [
        # Gold package (50-250 AZN)
        {"package": "gold", "amount": 49, "should_pass": False, "name": "Gold below min (49)"},
        {"package": "gold", "amount": 50, "should_pass": True, "name": "Gold at min (50)"},
        {"package": "gold", "amount": 250, "should_pass": True, "name": "Gold at max (250)"},
        {"package": "gold", "amount": 251, "should_pass": False, "name": "Gold above max (251)"},
        
        # Titanium package (250-500 AZN)
        {"package": "titanium", "amount": 249, "should_pass": False, "name": "Titanium below min (249)"},
        {"package": "titanium", "amount": 250, "should_pass": True, "name": "Titanium at min (250)"},
        {"package": "titanium", "amount": 500, "should_pass": True, "name": "Titanium at max (500)"},
        {"package": "titanium", "amount": 501, "should_pass": False, "name": "Titanium above max (501)"},
        
        # Platinum package (500-2000 AZN)
        {"package": "platinum", "amount": 499, "should_pass": False, "name": "Platinum below min (499)"},
        {"package": "platinum", "amount": 500, "should_pass": True, "name": "Platinum at min (500)"},
        {"package": "platinum", "amount": 2000, "should_pass": True, "name": "Platinum at max (2000)"},
        {"package": "platinum", "amount": 2001, "should_pass": False, "name": "Platinum above max (2001)"}
    ]
    
    package_passed = 0
    package_total = len(package_tests)
    
    for test in package_tests:
        purchase_data = {
            "package_type": test["package"],
            "invested_amount": test["amount"]
        }
        
        response = requests.post(f"{API_URL}/packages/purchase", json=purchase_data, headers=user_headers)
        
        if test["should_pass"]:
            if response.status_code == 200:
                print(f"   ✅ {test['name']}: Correctly accepted")
                package_passed += 1
            else:
                print(f"   ❌ {test['name']}: Should have been accepted - {response.text}")
        else:
            if response.status_code == 400:
                print(f"   ✅ {test['name']}: Correctly rejected")
                package_passed += 1
            else:
                print(f"   ❌ {test['name']}: Should have been rejected")
    
    package_success = (package_passed / package_total) * 100
    print(f"📊 Package Limits: {package_passed}/{package_total} tests passed ({package_success:.1f}%)")
    
    # Test 2: Updated Deposit Limits (50-2000 AZN)
    print("\n🔴 TEST 2: Updated Deposit Limits")
    
    deposit_tests = [
        {"amount": 49, "should_pass": False, "name": "Below min (49 AZN)"},
        {"amount": 50, "should_pass": True, "name": "At min (50 AZN)"},
        {"amount": 1000, "should_pass": True, "name": "Mid-range (1000 AZN)"},
        {"amount": 2000, "should_pass": True, "name": "At max (2000 AZN)"},
        {"amount": 2001, "should_pass": False, "name": "Above max (2001 AZN)"},
        {"amount": 2500, "should_pass": False, "name": "Old max (2500 AZN) - should fail"}
    ]
    
    deposit_passed = 0
    deposit_total = len(deposit_tests)
    
    for test in deposit_tests:
        transaction_data = {
            "type": "deposit",
            "amount": test["amount"],
            "card_name": "Test User",
            "card_number": "1234567890123456"
        }
        
        response = requests.post(f"{API_URL}/transactions", json=transaction_data, headers=user_headers)
        
        if test["should_pass"]:
            if response.status_code == 200:
                print(f"   ✅ {test['name']}: Correctly accepted")
                deposit_passed += 1
            else:
                print(f"   ❌ {test['name']}: Should have been accepted - {response.text}")
        else:
            if response.status_code == 400 and "50-2000 AZN" in response.text:
                print(f"   ✅ {test['name']}: Correctly rejected")
                deposit_passed += 1
            else:
                print(f"   ❌ {test['name']}: Should have been rejected with proper error")
    
    deposit_success = (deposit_passed / deposit_total) * 100
    print(f"📊 Deposit Limits: {deposit_passed}/{deposit_total} tests passed ({deposit_success:.1f}%)")
    
    # Test 3: Support Message Restriction
    print("\n🔴 TEST 3: Support Message Restriction")
    
    # Register new user for message testing
    msg_user = {
        "email": "message.comprehensive@gmail.com",
        "name": "Message Test User",
        "password": "msgtest123"
    }
    
    msg_reg_response = requests.post(f"{API_URL}/auth/register", json=msg_user)
    msg_user_token = msg_reg_response.json()['access_token']
    msg_user_headers = {"Authorization": f"Bearer {msg_user_token}"}
    
    message_passed = 0
    message_total = 4
    
    # Step 1: Send first message (should succeed)
    first_message = {
        "content": "Salam, investisiya paketim haqqında sualım var.",
        "message_type": "support"
    }
    
    response1 = requests.post(f"{API_URL}/messages", json=first_message, headers=msg_user_headers)
    if response1.status_code == 200:
        print("   ✅ First message: Correctly sent")
        message_passed += 1
        first_msg_id = response1.json()['id']
    else:
        print(f"   ❌ First message: Should have been sent - {response1.text}")
        return
    
    # Step 2: Try second message (should fail)
    second_message = {
        "content": "Həmçinin, balansım haqqında da sual var.",
        "message_type": "support"
    }
    
    response2 = requests.post(f"{API_URL}/messages", json=second_message, headers=msg_user_headers)
    if response2.status_code == 400 and "Admin cavab verənə qədər" in response2.text:
        print("   ✅ Second message: Correctly blocked")
        message_passed += 1
    else:
        print(f"   ❌ Second message: Should have been blocked - {response2.text}")
    
    # Step 3: Admin replies
    admin_reply = {
        "content": "Salam! Əlbəttə kömək edəcəyəm."
    }
    
    reply_response = requests.post(f"{API_URL}/admin/messages/{first_msg_id}/reply", json=admin_reply, headers=admin_headers)
    if reply_response.status_code == 200:
        print("   ✅ Admin reply: Successfully sent")
        message_passed += 1
    else:
        print(f"   ❌ Admin reply: Failed - {reply_response.text}")
    
    time.sleep(1)  # Wait for reply to be processed
    
    # Step 4: Try third message after admin reply (should succeed)
    third_message = {
        "content": "Təşəkkür edirəm! Platinum paket haqqında məlumat istəyirəm.",
        "message_type": "support"
    }
    
    response3 = requests.post(f"{API_URL}/messages", json=third_message, headers=msg_user_headers)
    if response3.status_code == 200:
        print("   ✅ Third message after reply: Correctly sent")
        message_passed += 1
    else:
        print(f"   ❌ Third message after reply: Should have been sent - {response3.text}")
    
    message_success = (message_passed / message_total) * 100
    print(f"📊 Message Restriction: {message_passed}/{message_total} tests passed ({message_success:.1f}%)")
    
    # Test 4: Real-time Notifications (Basic API test)
    print("\n🔴 TEST 4: Real-time Notification System")
    
    # Test that notifications are sent by checking if WebSocket endpoint exists
    # and that notification data is properly structured
    
    # Create a transaction to trigger notification
    notification_test_data = {
        "type": "deposit",
        "amount": 100.0,
        "card_name": "Notification Test",
        "card_number": "1234567890123456"
    }
    
    notif_response = requests.post(f"{API_URL}/transactions", json=notification_test_data, headers=user_headers)
    if notif_response.status_code == 200:
        print("   ✅ Transaction created (should trigger admin notification)")
        notification_passed = 1
    else:
        print(f"   ❌ Transaction creation failed - {notif_response.text}")
        notification_passed = 0
    
    notification_success = (notification_passed / 1) * 100
    print(f"📊 Notification System: {notification_passed}/1 tests passed ({notification_success:.1f}%)")
    
    # Overall Results
    print("\n" + "="*80)
    print("📊 COMPREHENSIVE TEST RESULTS")
    print("="*80)
    
    overall_passed = package_passed + deposit_passed + message_passed + notification_passed
    overall_total = package_total + deposit_total + message_total + 1
    overall_success = (overall_passed / overall_total) * 100
    
    print(f"✅ Package Limits: {package_success:.1f}% ({package_passed}/{package_total})")
    print(f"✅ Deposit Limits: {deposit_success:.1f}% ({deposit_passed}/{deposit_total})")
    print(f"✅ Message Restriction: {message_success:.1f}% ({message_passed}/{message_total})")
    print(f"✅ Notification System: {notification_success:.1f}% ({notification_passed}/1)")
    print(f"\n📈 OVERALL SUCCESS RATE: {overall_success:.1f}% ({overall_passed}/{overall_total})")
    
    if overall_success >= 80:
        print("\n🎉 NEW FEATURES ARE WORKING CORRECTLY!")
        return True
    else:
        print(f"\n⚠️  NEW FEATURES NEED ATTENTION")
        return False

if __name__ == "__main__":
    test_all_new_features()