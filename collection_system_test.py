#!/usr/bin/env python3
"""
Focused Collection System Test - 12-Hour Cooldown Validation
"""

import requests
import json
import time
from pathlib import Path

# Configuration
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

print(f"🔍 Collection System Test - {API_URL}")
print("=" * 60)

def test_collection_system():
    # 1. Create test user
    test_user = {
        "email": f"collection.test.{int(time.time())}@test.com",
        "name": "Collection Test User",
        "password": "testpass123"
    }
    
    print("1. Creating test user...")
    response = requests.post(f"{API_URL}/auth/register", json=test_user, timeout=10)
    if response.status_code not in [200, 201]:
        print(f"❌ User registration failed: {response.status_code}")
        return
    
    user_token = response.json()['access_token']
    user_headers = {"Authorization": f"Bearer {user_token}"}
    
    # Get user profile
    profile_response = requests.get(f"{API_URL}/auth/me", headers=user_headers, timeout=10)
    user_data = profile_response.json()
    user_id = user_data['id']
    print(f"✅ User created: {user_data['user_code']}")
    
    # 2. Login admin and give user balance
    admin_creds = {"email": "admin@investaz.com", "password": "18061999"}
    admin_response = requests.post(f"{API_URL}/auth/login", json=admin_creds, timeout=10)
    admin_token = admin_response.json()['access_token']
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    balance_update = {"user_id": user_id, "new_balance": 300.0, "notes": "Collection testing"}
    requests.post(f"{API_URL}/admin/users/update-balance", json=balance_update, headers=admin_headers, timeout=10)
    print("✅ Balance updated to 300 AZN")
    
    # 3. Purchase package
    purchase_data = {"package_type": "gold", "invested_amount": 100.0}
    purchase_response = requests.post(f"{API_URL}/packages/purchase", json=purchase_data, headers=user_headers, timeout=10)
    
    if purchase_response.status_code != 200:
        print(f"❌ Package purchase failed: {purchase_response.status_code}")
        print(f"Response: {purchase_response.text}")
        return
    
    package_data = purchase_response.json()
    package_id = package_data['id']
    print(f"✅ Package purchased: {package_id}")
    
    # 4. Check collection status
    status_response = requests.get(f"{API_URL}/packages/{package_id}/collection-status", headers=user_headers, timeout=10)
    if status_response.status_code != 200:
        print(f"❌ Collection status failed: {status_response.status_code}")
        return
    
    status_data = status_response.json()
    print(f"✅ Collection status: can_collect={status_data.get('can_collect')}")
    
    # 5. Wait for earnings and test collection
    print("⏳ Waiting 120 seconds for earnings to accumulate...")
    time.sleep(120)
    
    # Check package earnings
    packages_response = requests.get(f"{API_URL}/packages/my", headers=user_headers, timeout=10)
    packages = packages_response.json()
    active_package = next((p for p in packages if p['id'] == package_id), None)
    
    if active_package:
        earnings = active_package.get('accumulated_earnings', 0)
        print(f"📊 Accumulated earnings: {earnings} AZN")
        
        if earnings < 0.01:
            print("⚠️  Insufficient earnings for collection (< 0.01 AZN)")
            
            # Test collection anyway to see error message
            print("🧪 Testing collection with insufficient earnings...")
            collect_response = requests.post(f"{API_URL}/packages/{package_id}/collect", headers=user_headers, timeout=30)
            
            if collect_response.status_code == 400:
                error_data = collect_response.json()
                print(f"✅ Correctly rejected: {error_data.get('detail')}")
            else:
                print(f"❌ Unexpected response: {collect_response.status_code}")
                if collect_response.text:
                    print(f"Response: {collect_response.text}")
        else:
            print("🧪 Testing collection with sufficient earnings...")
            collect_response = requests.post(f"{API_URL}/packages/{package_id}/collect", headers=user_headers, timeout=30)
            
            if collect_response.status_code == 200:
                collect_data = collect_response.json()
                print(f"✅ Collection successful: {collect_data.get('collected_amount')} AZN")
                
                # Test immediate second collection
                print("🧪 Testing immediate second collection (should fail)...")
                second_response = requests.post(f"{API_URL}/packages/{package_id}/collect", headers=user_headers, timeout=30)
                
                if second_response.status_code == 400:
                    error_data = second_response.json()
                    error_msg = error_data.get('detail', '')
                    print(f"✅ Correctly rejected with 12-hour cooldown: {error_msg}")
                    
                    # Check if error message shows hours and minutes
                    if 'hours' in error_msg.lower() and 'minutes' in error_msg.lower():
                        print("✅ Error message correctly shows hours and minutes format")
                    else:
                        print("❌ Error message should show hours and minutes format")
                else:
                    print(f"❌ Second collection should fail with 400, got: {second_response.status_code}")
            else:
                print(f"❌ Collection failed: {collect_response.status_code}")
                if collect_response.text:
                    print(f"Response: {collect_response.text}")
    
    # 6. Test collection status after collection attempt
    final_status = requests.get(f"{API_URL}/packages/{package_id}/collection-status", headers=user_headers, timeout=10)
    if final_status.status_code == 200:
        final_data = final_status.json()
        cooldown_remaining = final_data.get('cooldown_remaining_seconds', 0)
        hours_remaining = cooldown_remaining // 3600
        minutes_remaining = (cooldown_remaining % 3600) // 60
        
        print(f"📊 Final status: can_collect={final_data.get('can_collect')}")
        print(f"📊 Cooldown remaining: {hours_remaining}h {minutes_remaining}m ({cooldown_remaining}s)")
        
        # Verify 12-hour cooldown (should be close to 43200 seconds)
        if cooldown_remaining > 43000:  # Allow some margin
            print("✅ 12-hour cooldown correctly enforced")
        elif cooldown_remaining == 0:
            print("ℹ️  No cooldown (first collection was rejected or not performed)")
        else:
            print(f"⚠️  Unexpected cooldown time: {cooldown_remaining}s")

if __name__ == "__main__":
    test_collection_system()