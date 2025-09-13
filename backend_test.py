#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for InvestAZ Platform
Tests all authentication, package, transaction, messaging, and admin endpoints
"""

import requests
import json
import os
import time
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
    return "https://investaz-preview.preview.emergentagent.com"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

print(f"Testing InvestAZ Backend API at: {API_URL}")
print("=" * 60)

# Test data
test_user_data = {
    "email": "testuser@investaz.com",
    "name": "Test User",
    "password": "testpassword123"
}

admin_credentials = {
    "email": "admin@investaz.com",
    "password": "18061999"
}

# Global variables for tokens
user_token = None
admin_token = None
test_user_id = None
test_package_id = None
test_transaction_id = None
test_message_id = None

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

def test_user_registration():
    """Test 1: User Registration API"""
    global user_token, test_user_id
    print("\n1. Testing User Registration...")
    
    response = make_request('POST', '/auth/register', test_user_data)
    if not response:
        return False
    
    if response.status_code == 201 or response.status_code == 200:
        try:
            data = response.json()
            if 'access_token' in data:
                user_token = data['access_token']
                print(f"✅ User registration successful - Token received")
                return True
            else:
                print(f"❌ Registration response missing access_token: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Registration failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_user_login():
    """Test 2: User Login API"""
    global user_token
    print("\n2. Testing User Login...")
    
    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"]
    }
    
    response = make_request('POST', '/auth/login', login_data)
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'access_token' in data:
                user_token = data['access_token']
                print(f"✅ User login successful")
                return True
            else:
                print(f"❌ Login response missing access_token: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Login failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_admin_login():
    """Test 3: Admin Login"""
    global admin_token
    print("\n3. Testing Admin Login...")
    
    response = make_request('POST', '/auth/login', admin_credentials)
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'access_token' in data:
                admin_token = data['access_token']
                print(f"✅ Admin login successful")
                return True
            else:
                print(f"❌ Admin login response missing access_token: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Admin login failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_protected_routes():
    """Test 4: Protected Routes with JWT"""
    print("\n4. Testing Protected Routes...")
    
    if not user_token:
        print("❌ No user token available for testing")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response = make_request('GET', '/auth/me', headers=headers)
    
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'email' in data and data['email'] == test_user_data['email']:
                print(f"✅ Protected route access successful - User: {data['name']}")
                return True
            else:
                print(f"❌ Unexpected user data: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Protected route failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_user_profile():
    """Test 5: User Profile Endpoint"""
    print("\n5. Testing User Profile Endpoint...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response = make_request('GET', '/auth/me', headers=headers)
    
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            required_fields = ['id', 'email', 'name', 'balance', 'total_invested', 'total_earned']
            if all(field in data for field in required_fields):
                print(f"✅ User profile retrieved - Balance: {data['balance']} AZN")
                return True
            else:
                print(f"❌ Missing required fields in profile: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Profile retrieval failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_package_definitions():
    """Test 6: Package Definitions"""
    print("\n6. Testing Package Definitions...")
    
    response = make_request('GET', '/packages')
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            expected_packages = ['platinum', 'titanium', 'gold']
            if all(pkg in data for pkg in expected_packages):
                print(f"✅ Package definitions retrieved - {len(data)} packages available")
                for pkg_name, pkg_info in data.items():
                    print(f"   {pkg_name}: {pkg_info['min_amount']}-{pkg_info['max_amount']} AZN, {pkg_info['multiplier']}x")
                return True
            else:
                print(f"❌ Missing expected packages: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Package definitions failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_package_purchase():
    """Test 7: Package Purchase"""
    global test_package_id
    print("\n7. Testing Package Purchase...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    purchase_data = {
        "package_type": "platinum",
        "invested_amount": 100.0
    }
    
    response = make_request('POST', '/packages/purchase', purchase_data, headers)
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'id' in data and data['package_type'] == 'platinum':
                test_package_id = data['id']
                print(f"✅ Package purchase successful - Package ID: {test_package_id}")
                return True
            else:
                print(f"❌ Invalid package purchase response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Package purchase failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_my_packages():
    """Test 8: My Packages"""
    print("\n8. Testing My Packages...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response = make_request('GET', '/packages/my', headers=headers)
    
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                print(f"✅ My packages retrieved - {len(data)} packages found")
                for pkg in data:
                    print(f"   {pkg['package_type']}: {pkg['invested_amount']} AZN, Active: {pkg['is_active']}")
                return True
            else:
                print(f"❌ No packages found or invalid response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ My packages failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_earnings_collection():
    """Test 9: Earnings Collection"""
    print("\n9. Testing Earnings Collection...")
    
    if not user_token or not test_package_id:
        print("❌ No user token or package ID available")
        return False
    
    # Wait a moment for earnings to accumulate
    print("   Waiting 3 seconds for earnings to accumulate...")
    time.sleep(3)
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response = make_request('POST', f'/packages/{test_package_id}/collect', headers=headers)
    
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'collected_amount' in data:
                print(f"✅ Earnings collection successful - Collected: {data['collected_amount']} AZN")
                return True
            else:
                print(f"❌ Invalid earnings collection response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    elif response.status_code == 400:
        print(f"✅ Earnings collection handled correctly - No earnings to collect yet")
        return True
    else:
        print(f"❌ Earnings collection failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_deposit_creation():
    """Test 10: Deposit Creation"""
    global test_transaction_id
    print("\n10. Testing Deposit Creation...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    transaction_data = {
        "type": "deposit",
        "amount": 50.0,
        "card_name": "Test User",
        "card_number": "1234567890123456"
    }
    
    response = make_request('POST', '/transactions', transaction_data, headers)
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'id' in data and data['type'] == 'deposit':
                test_transaction_id = data['id']
                print(f"✅ Deposit creation successful - Transaction ID: {test_transaction_id}")
                return True
            else:
                print(f"❌ Invalid deposit response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Deposit creation failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_withdrawal_creation():
    """Test 11: Withdrawal Creation"""
    print("\n11. Testing Withdrawal Creation...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    transaction_data = {
        "type": "withdraw",
        "amount": 5.0,
        "card_name": "Test User",
        "card_number": "1234567890123456"
    }
    
    response = make_request('POST', '/transactions', transaction_data, headers)
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'id' in data and data['type'] == 'withdraw':
                print(f"✅ Withdrawal creation successful - Transaction ID: {data['id']}")
                return True
            else:
                print(f"❌ Invalid withdrawal response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Withdrawal creation failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_file_upload():
    """Test 12: File Upload for Receipts"""
    print("\n12. Testing File Upload for Receipts...")
    
    if not user_token or not test_transaction_id:
        print("❌ No user token or transaction ID available")
        return False
    
    # Create a test file
    test_file_content = b"Test receipt content - this is a mock receipt file"
    
    headers = {"Authorization": f"Bearer {user_token}"}
    files = {'file': ('test_receipt.jpg', test_file_content, 'image/jpeg')}
    
    response = make_request('POST', f'/transactions/{test_transaction_id}/upload-receipt', 
                          headers=headers, files=files)
    
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'message' in data and 'successfully' in data['message'].lower():
                print(f"✅ File upload successful")
                return True
            else:
                print(f"❌ Invalid file upload response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ File upload failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_user_transactions():
    """Test 13: Get User Transactions"""
    print("\n13. Testing Get User Transactions...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response = make_request('GET', '/transactions/my', headers=headers)
    
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ User transactions retrieved - {len(data)} transactions found")
                for txn in data[:3]:  # Show first 3
                    print(f"   {txn['type']}: {txn['amount']} AZN, Status: {txn['status']}")
                return True
            else:
                print(f"❌ Invalid transactions response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Get transactions failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_send_message():
    """Test 14: Send Support Message"""
    global test_message_id
    print("\n14. Testing Send Support Message...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    message_data = {
        "content": "Hello, I need help with my investment package. Can you please assist me?",
        "message_type": "support"
    }
    
    response = make_request('POST', '/messages', message_data, headers)
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'id' in data and data['content'] == message_data['content']:
                test_message_id = data['id']
                print(f"✅ Support message sent successfully - Message ID: {test_message_id}")
                return True
            else:
                print(f"❌ Invalid message response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Send message failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_get_user_messages():
    """Test 15: Get User Messages"""
    print("\n15. Testing Get User Messages...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response = make_request('GET', '/messages/my', headers=headers)
    
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ User messages retrieved - {len(data)} messages found")
                for msg in data[:2]:  # Show first 2
                    print(f"   From Admin: {msg['is_from_admin']}, Content: {msg['content'][:50]}...")
                return True
            else:
                print(f"❌ Invalid messages response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Get messages failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_admin_users():
    """Test 16: Admin User List"""
    print("\n16. Testing Admin User List...")
    
    if not admin_token:
        print("❌ No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = make_request('GET', '/admin/users', headers=headers)
    
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Admin user list retrieved - {len(data)} users found")
                return True
            else:
                print(f"❌ Invalid admin users response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Admin user list failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_admin_transactions():
    """Test 17: Admin Transaction List"""
    print("\n17. Testing Admin Transaction List...")
    
    if not admin_token:
        print("❌ No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = make_request('GET', '/admin/transactions', headers=headers)
    
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Admin transaction list retrieved - {len(data)} transactions found")
                return True
            else:
                print(f"❌ Invalid admin transactions response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Admin transaction list failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_admin_transaction_approval():
    """Test 18: Admin Transaction Approval"""
    print("\n18. Testing Admin Transaction Approval...")
    
    if not admin_token or not test_transaction_id:
        print("❌ No admin token or transaction ID available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    approval_data = {
        "transaction_id": test_transaction_id,
        "approve": True,
        "admin_notes": "Approved for testing purposes"
    }
    
    response = make_request('POST', '/admin/transactions/approve', approval_data, headers)
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'message' in data and 'successfully' in data['message'].lower():
                print(f"✅ Transaction approval successful")
                return True
            else:
                print(f"❌ Invalid approval response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Transaction approval failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_admin_messages():
    """Test 19: Admin Message List"""
    print("\n19. Testing Admin Message List...")
    
    if not admin_token:
        print("❌ No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = make_request('GET', '/admin/messages', headers=headers)
    
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Admin message list retrieved - {len(data)} messages found")
                return True
            else:
                print(f"❌ Invalid admin messages response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Admin message list failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_admin_message_reply():
    """Test 20: Admin Message Reply"""
    print("\n20. Testing Admin Message Reply...")
    
    if not admin_token or not test_message_id:
        print("❌ No admin token or message ID available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    reply_data = {
        "content": "Thank you for your message. We will help you with your investment package shortly."
    }
    
    response = make_request('POST', f'/admin/messages/{test_message_id}/reply', reply_data, headers)
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'id' in data and data['is_from_admin']:
                print(f"✅ Admin message reply successful")
                return True
            else:
                print(f"❌ Invalid reply response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Admin message reply failed - Status: {response.status_code}, Response: {response.text}")
        return False

def run_all_tests():
    """Run all backend API tests"""
    print("🚀 Starting Comprehensive InvestAZ Backend API Tests")
    print(f"Backend URL: {API_URL}")
    print("=" * 60)
    
    tests = [
        test_user_registration,
        test_user_login,
        test_admin_login,
        test_protected_routes,
        test_user_profile,
        test_package_definitions,
        test_package_purchase,
        test_my_packages,
        test_earnings_collection,
        test_deposit_creation,
        test_withdrawal_creation,
        test_file_upload,
        test_user_transactions,
        test_send_message,
        test_get_user_messages,
        test_admin_users,
        test_admin_transactions,
        test_admin_transaction_approval,
        test_admin_messages,
        test_admin_message_reply
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
            failed += 1
        
        time.sleep(0.5)  # Small delay between tests
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! InvestAZ Backend is working correctly.")
    else:
        print(f"\n⚠️  {failed} tests failed. Please check the issues above.")
    
    return passed, failed

if __name__ == "__main__":
    run_all_tests()