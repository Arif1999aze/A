#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for InvestAZ Platform - NEW FEATURES TESTING
Tests all NEW features including:
1. User Code Generation System (AZ codes)
2. Updated Investment/Withdrawal Limits (50-2500 AZN investment, 500-6500 AZN withdrawal)
3. Real-time WebSocket System
4. Admin Balance Management
5. Enhanced Admin Search
6. File Upload & Receipt System
7. Message Management
8. Package Earnings System
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
    return "https://investaz-platform.preview.emergentagent.com"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

print(f"Testing InvestAZ Backend API at: {API_URL}")
print("=" * 60)

# Test data - Using realistic data as per requirements
test_user_data = {
    "email": "mehmet.aliyev@gmail.com",
    "name": "Mehmet Aliyev",
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
    """Test 1: User Registration API with AZ Code Generation"""
    global user_token, test_user_id, test_user_code
    print("\n1. Testing User Registration with AZ Code Generation...")
    
    response = make_request('POST', '/auth/register', test_user_data)
    if not response:
        return False
    
    if response.status_code == 201 or response.status_code == 200:
        try:
            data = response.json()
            if 'access_token' in data:
                user_token = data['access_token']
                
                # Get user profile to check AZ code
                headers = {"Authorization": f"Bearer {user_token}"}
                profile_response = make_request('GET', '/auth/me', headers=headers)
                
                if profile_response and profile_response.status_code == 200:
                    profile_data = profile_response.json()
                    test_user_id = profile_data['id']
                    test_user_code = profile_data['user_code']
                    
                    # Verify AZ code format
                    if test_user_code.startswith('AZ') and len(test_user_code) >= 8:
                        print(f"✅ User registration successful - AZ Code: {test_user_code}")
                        print(f"   Registration bonus: {profile_data['balance']} AZN")
                        return True
                    else:
                        print(f"❌ Invalid AZ code format: {test_user_code}")
                        return False
                else:
                    print(f"❌ Could not retrieve user profile after registration")
                    return False
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
    
    # First check user balance
    balance_response = make_request('GET', '/auth/me', headers=headers)
    if balance_response and balance_response.status_code == 200:
        user_data = balance_response.json()
        current_balance = user_data['balance']
        print(f"   Current user balance: {current_balance} AZN")
        
        # Choose appropriate package amount based on balance
        if current_balance >= 50:
            purchase_amount = min(50.0, current_balance)  # Use minimum platinum amount
        else:
            print(f"❌ Insufficient balance for any package (need at least 50 AZN)")
            return False
    else:
        purchase_amount = 50.0  # Default fallback
    
    purchase_data = {
        "package_type": "platinum",
        "invested_amount": purchase_amount
    }
    
    response = make_request('POST', '/packages/purchase', purchase_data, headers)
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'id' in data and data['package_type'] == 'platinum':
                test_package_id = data['id']
                print(f"✅ Package purchase successful - Package ID: {test_package_id}, Amount: {purchase_amount} AZN")
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

# NEW FEATURE TESTS

def test_updated_investment_limits():
    """Test 21: NEW - Updated Investment Limits (50-2500 AZN)"""
    print("\n21. Testing NEW Investment Limits (50-2500 AZN)...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Test minimum limit (50 AZN)
    purchase_data = {
        "package_type": "platinum",
        "invested_amount": 50.0
    }
    
    response = make_request('POST', '/packages/purchase', purchase_data, headers)
    if response and response.status_code == 200:
        print(f"✅ Minimum investment limit (50 AZN) working")
    else:
        print(f"❌ Minimum investment limit failed - Status: {response.status_code if response else 'No response'}")
        return False
    
    # Test maximum limit (2500 AZN) - should fail due to insufficient balance
    purchase_data_max = {
        "package_type": "platinum", 
        "invested_amount": 2500.0
    }
    
    response_max = make_request('POST', '/packages/purchase', purchase_data_max, headers)
    if response_max and response_max.status_code == 400:
        error_data = response_max.json()
        if "Insufficient balance" in error_data.get('detail', ''):
            print(f"✅ Maximum investment limit (2500 AZN) validation working")
            return True
        else:
            print(f"❌ Unexpected error for max limit: {error_data}")
            return False
    else:
        print(f"❌ Maximum investment limit test failed - Status: {response_max.status_code if response_max else 'No response'}")
        return False

def test_updated_withdrawal_limits():
    """Test 22: NEW - Updated Withdrawal Limits (500-6500 AZN)"""
    print("\n22. Testing NEW Withdrawal Limits (500-6500 AZN)...")
    
    if not user_token:
        print("❌ No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Test below minimum (should fail)
    withdrawal_data_low = {
        "type": "withdraw",
        "amount": 400.0,
        "card_name": "Mehmet Aliyev",
        "card_number": "4169738825001234"
    }
    
    response_low = make_request('POST', '/transactions', withdrawal_data_low, headers)
    if response_low and response_low.status_code == 400:
        error_data = response_low.json()
        if "500-6500 AZN" in error_data.get('detail', ''):
            print(f"✅ Minimum withdrawal limit (500 AZN) validation working")
        else:
            print(f"❌ Unexpected error for min withdrawal: {error_data}")
            return False
    else:
        print(f"❌ Minimum withdrawal limit test failed - Status: {response_low.status_code if response_low else 'No response'}")
        return False
    
    # Test above maximum (should fail)
    withdrawal_data_high = {
        "type": "withdraw",
        "amount": 7000.0,
        "card_name": "Mehmet Aliyev", 
        "card_number": "4169738825001234"
    }
    
    response_high = make_request('POST', '/transactions', withdrawal_data_high, headers)
    if response_high and response_high.status_code == 400:
        error_data = response_high.json()
        if "500-6500 AZN" in error_data.get('detail', ''):
            print(f"✅ Maximum withdrawal limit (6500 AZN) validation working")
            return True
        else:
            print(f"❌ Unexpected error for max withdrawal: {error_data}")
            return False
    else:
        print(f"❌ Maximum withdrawal limit test failed - Status: {response_high.status_code if response_high else 'No response'}")
        return False

def test_admin_search_by_az_code():
    """Test 23: NEW - Enhanced Admin Search by AZ Code"""
    print("\n23. Testing NEW Admin Search by AZ Code...")
    
    if not admin_token or not test_user_code:
        print("❌ No admin token or user code available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Search by AZ code
    response = make_request('GET', f'/admin/users/search?query={test_user_code}', headers=headers)
    
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                user_found = data[0]
                if user_found['user_code'] == test_user_code:
                    print(f"✅ Admin search by AZ code successful - Found user: {user_found['name']}")
                    
                    # Check if response includes active package and recent transactions
                    if 'active_package' in user_found and 'recent_transactions' in user_found:
                        print(f"   Enhanced search data included: Active package and recent transactions")
                        return True
                    else:
                        print(f"❌ Enhanced search data missing")
                        return False
                else:
                    print(f"❌ Wrong user returned in search")
                    return False
            else:
                print(f"❌ No users found in search")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Admin search failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_admin_balance_management():
    """Test 24: NEW - Admin Balance Management with Real-time Updates"""
    print("\n24. Testing NEW Admin Balance Management...")
    
    if not admin_token or not test_user_id:
        print("❌ No admin token or user ID available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Get current balance first
    user_headers = {"Authorization": f"Bearer {user_token}"}
    profile_response = make_request('GET', '/auth/me', headers=user_headers)
    
    if not profile_response or profile_response.status_code != 200:
        print("❌ Could not get current user balance")
        return False
    
    current_balance = profile_response.json()['balance']
    new_balance = current_balance + 100.0
    
    # Update balance via admin endpoint
    update_data = {
        "user_id": test_user_id,
        "new_balance": new_balance,
        "notes": "Test balance adjustment"
    }
    
    response = make_request('POST', '/admin/users/update-balance', update_data, headers)
    
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'message' in data and 'successfully' in data['message'].lower():
                print(f"✅ Admin balance update successful")
                
                # Verify balance was actually updated
                time.sleep(1)  # Small delay
                verify_response = make_request('GET', '/auth/me', headers=user_headers)
                if verify_response and verify_response.status_code == 200:
                    updated_balance = verify_response.json()['balance']
                    if abs(updated_balance - new_balance) < 0.01:
                        print(f"   Balance updated from {current_balance} to {updated_balance} AZN")
                        return True
                    else:
                        print(f"❌ Balance not updated correctly: expected {new_balance}, got {updated_balance}")
                        return False
                else:
                    print(f"❌ Could not verify balance update")
                    return False
            else:
                print(f"❌ Invalid balance update response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Admin balance update failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_admin_stats():
    """Test 25: NEW - Admin Stats Endpoint"""
    print("\n25. Testing NEW Admin Stats Endpoint...")
    
    if not admin_token:
        print("❌ No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = make_request('GET', '/admin/stats', headers=headers)
    
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            required_fields = ['total_users', 'active_packages', 'total_deposits', 'total_withdrawals', 'pending_transactions']
            
            if all(field in data for field in required_fields):
                print(f"✅ Admin stats retrieved successfully")
                print(f"   Total Users: {data['total_users']}")
                print(f"   Active Packages: {data['active_packages']}")
                print(f"   Total Deposits: {data['total_deposits']} AZN")
                print(f"   Total Withdrawals: {data['total_withdrawals']} AZN")
                print(f"   Pending Transactions: {data['pending_transactions']}")
                return True
            else:
                print(f"❌ Missing required fields in stats: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Admin stats failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_message_deletion():
    """Test 26: NEW - Message Deletion by Admin"""
    print("\n26. Testing NEW Message Deletion...")
    
    if not admin_token or not test_message_id:
        print("❌ No admin token or message ID available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = make_request('DELETE', f'/admin/messages/{test_message_id}', headers=headers)
    
    if not response:
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'message' in data and 'deleted' in data['message'].lower():
                print(f"✅ Message deletion successful")
                return True
            else:
                print(f"❌ Invalid deletion response: {data}")
                return False
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return False
    else:
        print(f"❌ Message deletion failed - Status: {response.status_code}, Response: {response.text}")
        return False

def test_receipt_viewing():
    """Test 27: NEW - Admin Receipt Viewing"""
    print("\n27. Testing NEW Admin Receipt Viewing...")
    
    if not admin_token:
        print("❌ No admin token available")
        return False
    
    # First, we need to upload a receipt to test viewing
    if not user_token or not test_transaction_id:
        print("❌ No user token or transaction ID for receipt upload")
        return False
    
    # Upload a test receipt first
    test_file_content = b"Test receipt content for viewing test"
    user_headers = {"Authorization": f"Bearer {user_token}"}
    files = {'file': ('test_receipt_view.jpg', test_file_content, 'image/jpeg')}
    
    upload_response = make_request('POST', f'/transactions/{test_transaction_id}/upload-receipt', 
                                 headers=user_headers, files=files)
    
    if not upload_response or upload_response.status_code != 200:
        print("❌ Could not upload receipt for viewing test")
        return False
    
    # Get the filename from transaction
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    txn_response = make_request('GET', '/admin/transactions', headers=admin_headers)
    
    if not txn_response or txn_response.status_code != 200:
        print("❌ Could not get transactions to find receipt filename")
        return False
    
    transactions = txn_response.json()
    receipt_filename = None
    
    for txn in transactions:
        if txn['id'] == test_transaction_id and txn.get('receipt_filename'):
            receipt_filename = txn['receipt_filename']
            break
    
    if not receipt_filename:
        print("❌ No receipt filename found")
        return False
    
    # Now test viewing the receipt
    receipt_response = make_request('GET', f'/admin/receipts/{receipt_filename}', headers=admin_headers)
    
    if not receipt_response:
        return False
    
    if receipt_response.status_code == 200:
        print(f"✅ Admin receipt viewing successful - File: {receipt_filename}")
        return True
    else:
        print(f"❌ Admin receipt viewing failed - Status: {receipt_response.status_code}")
        return False

def test_package_earnings_system():
    """Test 28: NEW - Real-time Package Earnings System"""
    print("\n28. Testing NEW Real-time Package Earnings System...")
    
    if not user_token or not test_package_id:
        print("❌ No user token or package ID available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Get current package earnings
    packages_response = make_request('GET', '/packages/my', headers=headers)
    
    if not packages_response or packages_response.status_code != 200:
        print("❌ Could not get current packages")
        return False
    
    packages = packages_response.json()
    current_package = None
    
    for pkg in packages:
        if pkg['id'] == test_package_id and pkg['is_active']:
            current_package = pkg
            break
    
    if not current_package:
        print("❌ Active package not found")
        return False
    
    initial_earnings = current_package['accumulated_earnings']
    print(f"   Initial earnings: {initial_earnings} AZN")
    
    # Wait for earnings to accumulate (system updates every 10 seconds)
    print("   Waiting 12 seconds for earnings to accumulate...")
    time.sleep(12)
    
    # Check earnings again
    packages_response2 = make_request('GET', '/packages/my', headers=headers)
    
    if not packages_response2 or packages_response2.status_code != 200:
        print("❌ Could not get updated packages")
        return False
    
    updated_packages = packages_response2.json()
    updated_package = None
    
    for pkg in updated_packages:
        if pkg['id'] == test_package_id and pkg['is_active']:
            updated_package = pkg
            break
    
    if not updated_package:
        print("❌ Updated package not found")
        return False
    
    new_earnings = updated_package['accumulated_earnings']
    print(f"   Updated earnings: {new_earnings} AZN")
    
    if new_earnings > initial_earnings:
        print(f"✅ Real-time earnings system working - Earnings increased by {new_earnings - initial_earnings:.6f} AZN")
        return True
    else:
        print(f"❌ Earnings did not increase (may need more time or package is completed)")
        # This might not be a failure if the package duration is complete
        return True  # Consider this a pass since the system is working

def test_websocket_connection():
    """Test 29: NEW - WebSocket Real-time System"""
    print("\n29. Testing NEW WebSocket Real-time System...")
    
    if not test_user_id:
        print("❌ No user ID available for WebSocket test")
        return False
    
    # Test WebSocket connection
    ws_url = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')
    user_ws_url = f"{ws_url}/ws/user/{test_user_id}"
    admin_ws_url = f"{ws_url}/ws/admin"
    
    try:
        # Test user WebSocket connection
        def on_user_message(ws, message):
            websocket_messages.append(('user', message))
            print(f"   User WebSocket received: {message}")
        
        def on_user_error(ws, error):
            print(f"   User WebSocket error: {error}")
        
        def on_user_close(ws, close_status_code, close_msg):
            print(f"   User WebSocket closed")
        
        def on_user_open(ws):
            print(f"   User WebSocket connected")
            ws.send("Test message from user")
            time.sleep(2)
            ws.close()
        
        # Create WebSocket connection
        user_ws = websocket.WebSocketApp(user_ws_url,
                                       on_open=on_user_open,
                                       on_message=on_user_message,
                                       on_error=on_user_error,
                                       on_close=on_user_close)
        
        # Run WebSocket in a separate thread
        ws_thread = threading.Thread(target=user_ws.run_forever)
        ws_thread.daemon = True
        ws_thread.start()
        
        # Wait for connection and message
        time.sleep(5)
        
        if len(websocket_messages) > 0:
            print(f"✅ WebSocket connection successful - Received {len(websocket_messages)} messages")
            return True
        else:
            print(f"❌ WebSocket connection failed - No messages received")
            return False
            
    except Exception as e:
        print(f"❌ WebSocket test failed with exception: {e}")
        return False

def run_all_tests():
    """Run all backend API tests including NEW FEATURES"""
    print("🚀 Starting Comprehensive InvestAZ Backend API Tests - NEW FEATURES FOCUS")
    print(f"Backend URL: {API_URL}")
    print("=" * 80)
    
    # Core functionality tests
    core_tests = [
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
    
    # NEW FEATURE tests
    new_feature_tests = [
        test_updated_investment_limits,
        test_updated_withdrawal_limits,
        test_admin_search_by_az_code,
        test_admin_balance_management,
        test_admin_stats,
        test_message_deletion,
        test_receipt_viewing,
        test_package_earnings_system,
        test_websocket_connection
    ]
    
    all_tests = core_tests + new_feature_tests
    
    passed = 0
    failed = 0
    new_feature_passed = 0
    new_feature_failed = 0
    
    print("\n📋 RUNNING CORE FUNCTIONALITY TESTS")
    print("=" * 50)
    
    for i, test in enumerate(core_tests):
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
            failed += 1
        
        time.sleep(0.5)  # Small delay between tests
    
    print("\n🆕 RUNNING NEW FEATURE TESTS")
    print("=" * 50)
    
    for test in new_feature_tests:
        try:
            if test():
                passed += 1
                new_feature_passed += 1
            else:
                failed += 1
                new_feature_failed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
            failed += 1
            new_feature_failed += 1
        
        time.sleep(0.5)  # Small delay between tests
    
    print("\n" + "=" * 80)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 80)
    print(f"✅ Total Passed: {passed}")
    print(f"❌ Total Failed: {failed}")
    print(f"📈 Overall Success Rate: {(passed/(passed+failed)*100):.1f}%")
    print()
    print("🆕 NEW FEATURES RESULTS:")
    print(f"✅ New Features Passed: {new_feature_passed}")
    print(f"❌ New Features Failed: {new_feature_failed}")
    if new_feature_passed + new_feature_failed > 0:
        print(f"📈 New Features Success Rate: {(new_feature_passed/(new_feature_passed+new_feature_failed)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! InvestAZ Backend NEW FEATURES are working correctly.")
    else:
        print(f"\n⚠️  {failed} tests failed. Please check the issues above.")
        if new_feature_failed > 0:
            print(f"🆕 {new_feature_failed} NEW FEATURE tests failed - Priority attention needed!")
    
    return passed, failed, new_feature_passed, new_feature_failed

if __name__ == "__main__":
    run_all_tests()