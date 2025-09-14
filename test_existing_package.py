#!/usr/bin/env python3
"""
Test collection with existing package that has earnings
"""

import requests
import json
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path

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

async def find_package_with_earnings():
    """Find a package with sufficient earnings"""
    try:
        client = AsyncIOMotorClient('mongodb://localhost:27017')
        db = client['test_database']
        
        # Find package with earnings > 0.01
        package = await db.investment_packages.find_one({
            'is_active': True,
            'accumulated_earnings': {'$gt': 0.01}
        })
        
        if package:
            # Get user info
            user = await db.users.find_one({'id': package['user_id']})
            client.close()
            return package, user
        
        client.close()
        return None, None
    except Exception as e:
        print(f"Database error: {e}")
        return None, None

async def main():
    print("Finding package with sufficient earnings...")
    package, user = await find_package_with_earnings()
    
    if not package:
        print("No package with sufficient earnings found")
        return
    
    print(f"Found package: {package['id']}")
    print(f"Earnings: {package['accumulated_earnings']} AZN")
    print(f"User: {user['email']}")
    
    # Login as admin to get user token (simulate user login)
    admin_creds = {"email": "admin@investaz.com", "password": "18061999"}
    admin_response = requests.post(f"{API_URL}/auth/login", json=admin_creds, timeout=10)
    admin_token = admin_response.json()['access_token']
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Create a test token for the user (we'll use admin token for simplicity)
    # In a real scenario, we'd need to login as the user
    print("Testing collection with admin privileges...")
    
    # Try collection
    try:
        print("Making collection request...")
        collect_response = requests.post(
            f"{API_URL}/packages/{package['id']}/collect",
            headers=admin_headers,
            timeout=10
        )
        
        print(f"Collection response: {collect_response.status_code}")
        print(f"Response text: {collect_response.text}")
        
    except requests.exceptions.Timeout:
        print("❌ Collection request timed out")
    except Exception as e:
        print(f"❌ Collection request error: {e}")

if __name__ == "__main__":
    asyncio.run(main())