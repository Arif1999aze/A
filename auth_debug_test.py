#!/usr/bin/env python3
"""
Debug Authentication Issues
"""

import requests
import json
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

print(f"🔍 Debug Authentication Issues")
print(f"Backend URL: {API_URL}")
print("=" * 60)

# Test data
test_user_data = {
    "email": "debug.auth.test@gmail.com",
    "name": "Debug Auth Test",
    "password": "debugpass123"
}

def make_request(method, endpoint, data=None, headers=None):
    """Make HTTP request with detailed error handling"""
    url = f"{API_URL}{endpoint}"
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=30)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"   {method} {endpoint}: {response.status_code}")
        if response.status_code >= 400:
            print(f"   Error: {response.text}")
        
        return response
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed for {method} {endpoint}: {e}")
        return None

def test_auth_flow():
    """Test authentication flow step by step"""
    print("\n🔍 Testing Authentication Flow")
    
    # Step 1: Register user
    print("1. Registering user...")
    reg_response = make_request('POST', '/auth/register', test_user_data)
    
    if not reg_response or reg_response.status_code not in [200, 201]:
        print("❌ Registration failed")
        return False
    
    reg_data = reg_response.json()
    if 'access_token' not in reg_data:
        print("❌ No access token in registration response")
        return False
    
    user_token = reg_data['access_token']
    print(f"✅ Registration successful, token: {user_token[:20]}...")
    
    # Step 2: Test /auth/me endpoint
    print("2. Testing /auth/me endpoint...")
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Try multiple times to see if it's intermittent
    for i in range(3):
        print(f"   Attempt {i+1}:")
        me_response = make_request('GET', '/auth/me', headers=headers)
        
        if me_response and me_response.status_code == 200:
            profile_data = me_response.json()
            print(f"   ✅ Success: {profile_data['name']} ({profile_data['user_code']})")
            return True
        elif me_response and me_response.status_code == 500:
            print(f"   ❌ 500 Server Error - This is the critical bug!")
        else:
            print(f"   ❌ Unexpected response")
    
    return False

if __name__ == "__main__":
    test_auth_flow()