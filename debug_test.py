#!/usr/bin/env python3
"""
Debug test to understand the specific issues with the NEW FEATURES
"""

import requests
import json
from pathlib import Path

# Get backend URL
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

print(f"Debug testing at: {API_URL}")

# Test data
test_user_data = {
    "email": "debug.test@gmail.com",
    "name": "Debug Test User",
    "password": "debugpass123"
}

admin_credentials = {
    "email": "admin@investaz.com",
    "password": "18061999"
}

def test_package_limits_debug():
    """Debug package limits"""
    print("\n=== DEBUG: Package Limits ===")
    
    # Register user
    reg_response = requests.post(f"{API_URL}/auth/register", json=test_user_data)
    if reg_response.status_code not in [200, 201]:
        print(f"Registration failed: {reg_response.text}")
        return
    
    user_token = reg_response.json()['access_token']
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Get user profile to check balance
    profile_response = requests.get(f"{API_URL}/auth/me", headers=headers)
    if profile_response.status_code == 200:
        balance = profile_response.json()['balance']
        print(f"User balance: {balance} AZN")
    
    # Test gold package with invalid amount (49 AZN - below minimum)
    print("\nTesting Gold package with 49 AZN (should fail):")
    purchase_data = {
        "package_type": "gold",
        "invested_amount": 49.0
    }
    
    response = requests.post(f"{API_URL}/packages/purchase", json=purchase_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Test gold package with valid amount (50 AZN)
    print("\nTesting Gold package with 50 AZN (should succeed):")
    purchase_data = {
        "package_type": "gold", 
        "invested_amount": 50.0
    }
    
    response = requests.post(f"{API_URL}/packages/purchase", json=purchase_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

def test_deposit_limits_debug():
    """Debug deposit limits"""
    print("\n=== DEBUG: Deposit Limits ===")
    
    # Login admin to get token
    admin_response = requests.post(f"{API_URL}/auth/login", json=admin_credentials)
    if admin_response.status_code != 200:
        print(f"Admin login failed: {admin_response.text}")
        return
    
    admin_token = admin_response.json()['access_token']
    
    # Register new user for deposit testing
    deposit_user_data = {
        "email": "deposit.test@gmail.com",
        "name": "Deposit Test User", 
        "password": "depositpass123"
    }
    
    reg_response = requests.post(f"{API_URL}/auth/register", json=deposit_user_data)
    if reg_response.status_code not in [200, 201]:
        print(f"Registration failed: {reg_response.text}")
        return
    
    user_token = reg_response.json()['access_token']
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Test deposit with 49 AZN (should fail)
    print("\nTesting deposit with 49 AZN (should fail):")
    transaction_data = {
        "type": "deposit",
        "amount": 49.0,
        "card_name": "Test User",
        "card_number": "1234567890123456"
    }
    
    response = requests.post(f"{API_URL}/transactions", json=transaction_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Test deposit with 2001 AZN (should fail)
    print("\nTesting deposit with 2001 AZN (should fail):")
    transaction_data = {
        "type": "deposit",
        "amount": 2001.0,
        "card_name": "Test User",
        "card_number": "1234567890123456"
    }
    
    response = requests.post(f"{API_URL}/transactions", json=transaction_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

def test_message_restriction_debug():
    """Debug message restriction"""
    print("\n=== DEBUG: Message Restriction ===")
    
    # Register new user for message testing
    msg_user_data = {
        "email": "message.test@gmail.com",
        "name": "Message Test User",
        "password": "messagepass123"
    }
    
    reg_response = requests.post(f"{API_URL}/auth/register", json=msg_user_data)
    if reg_response.status_code not in [200, 201]:
        print(f"Registration failed: {reg_response.text}")
        return
    
    user_token = reg_response.json()['access_token']
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Send first message
    print("\nSending first message:")
    message_data = {
        "content": "First test message",
        "message_type": "support"
    }
    
    response = requests.post(f"{API_URL}/messages", json=message_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        first_msg_id = response.json()['id']
        
        # Try to send second message (should fail)
        print("\nSending second message (should fail):")
        message_data2 = {
            "content": "Second test message",
            "message_type": "support"
        }
        
        response2 = requests.post(f"{API_URL}/messages", json=message_data2, headers=headers)
        print(f"Status: {response2.status_code}")
        print(f"Response: {response2.text}")

if __name__ == "__main__":
    test_package_limits_debug()
    test_deposit_limits_debug()
    test_message_restriction_debug()