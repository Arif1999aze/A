#!/usr/bin/env python3
"""
Simple Collection Test - Direct API Testing
"""

import requests
import json
import time
from pathlib import Path

# Get backend URL
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

print(f"🧪 SIMPLE COLLECTION TEST")
print(f"Backend URL: {API_URL}")
print("=" * 50)

# Test with existing user from previous test
def test_existing_package():
    """Test collection with existing package"""
    
    # Login admin to get a user with packages
    admin_response = requests.post(f"{API_URL}/auth/login", json={
        "email": "admin@investaz.com",
        "password": "18061999"
    }, timeout=10)
    
    if admin_response.status_code != 200:
        print("❌ Admin login failed")
        return False
    
    admin_token = admin_response.json()['access_token']
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Get all users
    users_response = requests.get(f"{API_URL}/admin/users", headers=admin_headers, timeout=10)
    if users_response.status_code != 200:
        print("❌ Failed to get users")
        return False
    
    users = users_response.json()
    print(f"Found {len(users)} users")
    
    # Find a user with packages
    for user in users[:3]:  # Check first 3 users
        user_id = user['id']
        print(f"\nChecking user: {user['user_code']} ({user['name']})")
        
        # Create a temporary token for this user (admin privilege)
        # We'll use admin to update balance and then create a new user for testing
        
        # Create test user
        test_user = {
            "email": f"simple.test.{int(time.time())}@example.com",
            "name": "Simple Test User",
            "password": "testpass123"
        }
        
        reg_response = requests.post(f"{API_URL}/auth/register", json=test_user, timeout=10)
        if reg_response.status_code not in [200, 201]:
            continue
        
        user_token = reg_response.json()['access_token']
        user_headers = {"Authorization": f"Bearer {user_token}"}
        
        # Get user profile
        profile_response = requests.get(f"{API_URL}/auth/me", headers=user_headers, timeout=10)
        if profile_response.status_code != 200:
            continue
        
        test_user_id = profile_response.json()['id']
        
        # Give balance
        balance_update = {
            "user_id": test_user_id,
            "new_balance": 100.0,
            "notes": "Simple test balance"
        }
        
        requests.post(f"{API_URL}/admin/users/update-balance", json=balance_update, headers=admin_headers, timeout=10)
        time.sleep(1)
        
        # Purchase package
        purchase_data = {
            "package_type": "gold",
            "invested_amount": 50.0
        }
        
        purchase_response = requests.post(f"{API_URL}/packages/purchase", json=purchase_data, headers=user_headers, timeout=10)
        if purchase_response.status_code != 200:
            print(f"   Package purchase failed: {purchase_response.status_code}")
            continue
        
        package_data = purchase_response.json()
        package_id = package_data['id']
        print(f"   ✅ Package created: {package_id}")
        
        # Wait for earnings
        print("   Waiting 60 seconds for earnings...")
        time.sleep(60)
        
        # Test collection status
        status_response = requests.get(f"{API_URL}/packages/{package_id}/collection-status", headers=user_headers, timeout=10)
        if status_response.status_code == 200:
            status_data = status_response.json()
            print(f"   Collection status: {status_data}")
        
        # Test first collection
        print("   Testing first collection...")
        try:
            collect_response = requests.post(f"{API_URL}/packages/{package_id}/collect", headers=user_headers, timeout=15)
            print(f"   First collection status: {collect_response.status_code}")
            
            if collect_response.status_code == 200:
                collect_data = collect_response.json()
                print(f"   ✅ Collected: {collect_data.get('collected_amount', 0)} AZN")
                
                # Test immediate second collection
                print("   Testing immediate second collection...")
                try:
                    second_response = requests.post(f"{API_URL}/packages/{package_id}/collect", headers=user_headers, timeout=15)
                    print(f"   Second collection status: {second_response.status_code}")
                    
                    if second_response.status_code == 400:
                        error_data = second_response.json()
                        error_msg = error_data.get('detail', '')
                        print(f"   ✅ Cooldown error: {error_msg}")
                        
                        if 'hours' in error_msg.lower():
                            print("   ✅ 12-hour cooldown system working!")
                            return True
                        else:
                            print("   ❌ Error message doesn't mention hours")
                    else:
                        print(f"   ❌ Second collection should return 400, got {second_response.status_code}")
                        if second_response.status_code == 200:
                            print(f"   Response: {second_response.text}")
                
                except requests.exceptions.Timeout:
                    print("   ❌ Second collection timed out")
                except Exception as e:
                    print(f"   ❌ Second collection error: {e}")
                
            elif collect_response.status_code == 400:
                error_data = collect_response.json()
                print(f"   No earnings yet: {error_data.get('detail', '')}")
            else:
                print(f"   First collection failed: {collect_response.text}")
                
        except requests.exceptions.Timeout:
            print("   ❌ First collection timed out")
        except Exception as e:
            print(f"   ❌ First collection error: {e}")
        
        break
    
    return False

if __name__ == "__main__":
    test_existing_package()