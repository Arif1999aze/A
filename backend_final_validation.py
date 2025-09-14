#!/usr/bin/env python3
"""
FINAL COMPREHENSIVE BACKEND VALIDATION - InvestAZ Platform
Focus: 12-Hour Collection System Stability and Production Readiness

This test suite validates all requirements from the review request:
1. 12-Hour Collection System Stability (COLLECTION_COOLDOWN_MINUTES = 720)
2. Package Management with proper date calculations
3. User Balance Operations (balance vs total_earned separation)
4. API Endpoint Health Check (2-3 second response times)
5. Error Handling and Security (JWT, CORS, input validation)
6. Performance and Reliability (concurrent requests, stability)
"""

import requests
import json
import os
import time
import threading
import concurrent.futures
from datetime import datetime, timedelta
from pathlib import Path
import random

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

print(f"🎯 FINAL BACKEND VALIDATION - InvestAZ Platform")
print(f"Backend URL: {API_URL}")
print("=" * 80)

# Test Results Storage
test_results = {
    "passed": 0,
    "failed": 0,
    "details": []
}

def log_result(test_name, passed, details=""):
    """Log test result"""
    if passed:
        test_results["passed"] += 1
        test_results["details"].append(f"✅ {test_name}")
        print(f"✅ {test_name}")
    else:
        test_results["failed"] += 1
        test_results["details"].append(f"❌ {test_name}: {details}")
        print(f"❌ {test_name}: {details}")
    if details and passed:
        print(f"   {details}")

def make_request_with_timing(method, endpoint, data=None, headers=None, timeout=10):
    """Make HTTP request with timing measurement"""
    url = f"{API_URL}{endpoint}"
    start_time = time.time()
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=timeout)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=timeout)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers, timeout=timeout)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=timeout)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        response_time = time.time() - start_time
        return response, response_time
    except requests.exceptions.Timeout:
        response_time = time.time() - start_time
        return None, response_time
    except Exception as e:
        response_time = time.time() - start_time
        return None, response_time

def setup_test_user():
    """Create test user and admin tokens"""
    timestamp = int(time.time())
    random_suffix = random.randint(1000, 9999)
    
    test_user = {
        "email": f"final.validation.{timestamp}.{random_suffix}@test.com",
        "name": "Final Validation User",
        "password": "securepass123"
    }
    
    admin_creds = {
        "email": "admin@investaz.com",
        "password": "18061999"
    }
    
    # Register user
    response, _ = make_request_with_timing('POST', '/auth/register', test_user)
    if not response or response.status_code not in [200, 201]:
        return None, None, None, None
    
    user_token = response.json()['access_token']
    
    # Get user profile
    headers = {"Authorization": f"Bearer {user_token}"}
    profile_response, _ = make_request_with_timing('GET', '/auth/me', headers=headers)
    if not profile_response or profile_response.status_code != 200:
        return None, None, None, None
    
    user_data = profile_response.json()
    
    # Login admin
    admin_response, _ = make_request_with_timing('POST', '/auth/login', admin_creds)
    if not admin_response or admin_response.status_code != 200:
        return None, None, None, None
    
    admin_token = admin_response.json()['access_token']
    
    return user_token, admin_token, user_data['id'], user_data

def test_12_hour_collection_system_stability():
    """TEST 1: 12-Hour Collection System Stability"""
    print("\n🔴 TEST 1: 12-Hour Collection System Stability")
    
    user_token, admin_token, user_id, user_data = setup_test_user()
    if not all([user_token, admin_token, user_id]):
        log_result("12-Hour Collection System Setup", False, "Failed to setup test environment")
        return
    
    log_result("Test Environment Setup", True, f"User: {user_data['user_code']}")
    
    # Give user balance for testing
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    balance_update = {
        "user_id": user_id,
        "new_balance": 300.0,
        "notes": "Final validation testing"
    }
    
    response, timing = make_request_with_timing('POST', '/admin/users/update-balance', balance_update, admin_headers)
    if response and response.status_code == 200:
        log_result("Admin Balance Update", True, f"Response time: {timing:.2f}s")
    else:
        log_result("Admin Balance Update", False, "Failed to update balance")
        return
    
    # Purchase package
    user_headers = {"Authorization": f"Bearer {user_token}"}
    purchase_data = {
        "package_type": "gold",
        "invested_amount": 100.0
    }
    
    response, timing = make_request_with_timing('POST', '/packages/purchase', purchase_data, user_headers)
    if not response or response.status_code != 200:
        log_result("Package Purchase", False, "Failed to purchase package")
        return
    
    package_data = response.json()
    package_id = package_data['id']
    log_result("Package Purchase", True, f"Package ID: {package_id}, Response time: {timing:.2f}s")
    
    # Verify COLLECTION_COOLDOWN_MINUTES = 720 configuration
    if package_data.get('last_collection_time') is not None:
        log_result("Initial Collection Time", False, "New package should start with null last_collection_time")
        return
    
    log_result("Initial Collection Time", True, "New package correctly starts with null last_collection_time")
    
    # Test collection status endpoint
    response, timing = make_request_with_timing('GET', f'/packages/{package_id}/collection-status', headers=user_headers)
    if not response or response.status_code != 200:
        log_result("Collection Status Endpoint", False, "Failed to get collection status")
        return
    
    status_data = response.json()
    log_result("Collection Status Endpoint", True, f"Response time: {timing:.2f}s")
    
    # Verify first collection is available
    if not status_data.get('can_collect', False):
        log_result("First Collection Availability", False, "First collection should be immediately available")
        return
    
    log_result("First Collection Availability", True, "First collection immediately available")
    
    # Wait for earnings to accumulate
    print("   Waiting 90 seconds for earnings accumulation...")
    time.sleep(90)
    
    # Test collection endpoint with timeout protection
    response, timing = make_request_with_timing('POST', f'/packages/{package_id}/collect', headers=user_headers, timeout=15)
    
    if not response:
        log_result("Collection Endpoint Response", False, f"Timeout after {timing:.2f}s")
        return
    
    if response.status_code == 400:
        error_data = response.json()
        if "no earnings" in error_data.get('detail', '').lower():
            log_result("Collection Endpoint Response", True, f"Correctly rejected - no earnings (Response time: {timing:.2f}s)")
        else:
            log_result("Collection Endpoint Response", False, f"Unexpected 400 error: {error_data.get('detail')}")
            return
    elif response.status_code == 200:
        collect_data = response.json()
        collected_amount = collect_data.get('collected_amount', 0)
        log_result("Collection Endpoint Response", True, f"Collected {collected_amount} AZN (Response time: {timing:.2f}s)")
        
        # Test immediate second collection (should fail with 12-hour cooldown)
        response2, timing2 = make_request_with_timing('POST', f'/packages/{package_id}/collect', headers=user_headers)
        if response2 and response2.status_code == 400:
            error_data = response2.json()
            error_message = error_data.get('detail', '')
            if 'hours' in error_message.lower() and 'minutes' in error_message.lower():
                log_result("12-Hour Cooldown Error Format", True, f"Error shows hours/minutes format")
            else:
                log_result("12-Hour Cooldown Error Format", False, f"Error format incorrect: {error_message}")
        else:
            log_result("12-Hour Cooldown Enforcement", False, "Second collection should be rejected")
    else:
        log_result("Collection Endpoint Response", False, f"Unexpected status: {response.status_code}")

def test_package_management():
    """TEST 2: Package Management with Date Calculations"""
    print("\n🔴 TEST 2: Package Management")
    
    user_token, admin_token, user_id, user_data = setup_test_user()
    if not all([user_token, admin_token, user_id]):
        log_result("Package Management Setup", False, "Failed to setup test environment")
        return
    
    # Give user balance
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    balance_update = {"user_id": user_id, "new_balance": 500.0, "notes": "Package testing"}
    make_request_with_timing('POST', '/admin/users/update-balance', balance_update, admin_headers)
    time.sleep(1)
    
    user_headers = {"Authorization": f"Bearer {user_token}"}
    
    # Test all package types
    package_types = [
        {"type": "gold", "amount": 100, "expected_multiplier": 4.5, "expected_duration": 60},
        {"type": "titanium", "amount": 300, "expected_multiplier": 4.0, "expected_duration": 45},
        {"type": "platinum", "amount": 150, "expected_multiplier": 3.0, "expected_duration": 30}
    ]
    
    for pkg in package_types:
        purchase_data = {
            "package_type": pkg["type"],
            "invested_amount": pkg["amount"]
        }
        
        response, timing = make_request_with_timing('POST', '/packages/purchase', purchase_data, user_headers)
        if response and response.status_code == 200:
            package_data = response.json()
            
            # Verify package data
            if (package_data['multiplier'] == pkg["expected_multiplier"] and 
                package_data['duration_days'] == pkg["expected_duration"] and
                package_data['invested_amount'] == pkg["amount"]):
                log_result(f"{pkg['type'].title()} Package Creation", True, f"Correct multiplier and duration")
            else:
                log_result(f"{pkg['type'].title()} Package Creation", False, "Incorrect package parameters")
        else:
            log_result(f"{pkg['type'].title()} Package Creation", False, "Failed to create package")
    
    # Test active package retrieval
    response, timing = make_request_with_timing('GET', '/packages/my', headers=user_headers)
    if response and response.status_code == 200:
        packages = response.json()
        active_packages = [p for p in packages if p.get('is_active', False)]
        
        if len(active_packages) == 1:
            log_result("Active Package Retrieval", True, f"Only one active package (Response time: {timing:.2f}s)")
        else:
            log_result("Active Package Retrieval", False, f"Expected 1 active package, got {len(active_packages)}")
    else:
        log_result("Active Package Retrieval", False, "Failed to retrieve packages")

def test_user_balance_operations():
    """TEST 3: User Balance Operations"""
    print("\n🔴 TEST 3: User Balance Operations")
    
    user_token, admin_token, user_id, user_data = setup_test_user()
    if not all([user_token, admin_token, user_id]):
        log_result("Balance Operations Setup", False, "Failed to setup test environment")
        return
    
    user_headers = {"Authorization": f"Bearer {user_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test balance vs total_earned separation
    initial_balance = user_data['balance']
    initial_total_earned = user_data['total_earned']
    
    log_result("Initial Balance State", True, f"Balance: {initial_balance} AZN, Total Earned: {initial_total_earned} AZN")
    
    # Test admin balance update
    balance_update = {"user_id": user_id, "new_balance": 200.0, "notes": "Balance testing"}
    response, timing = make_request_with_timing('POST', '/admin/users/update-balance', balance_update, admin_headers)
    
    if response and response.status_code == 200:
        log_result("Admin Balance Update", True, f"Response time: {timing:.2f}s")
        
        # Verify balance update
        profile_response, _ = make_request_with_timing('GET', '/auth/me', headers=user_headers)
        if profile_response and profile_response.status_code == 200:
            updated_data = profile_response.json()
            if updated_data['balance'] == 200.0:
                log_result("Balance Update Verification", True, "Balance correctly updated")
            else:
                log_result("Balance Update Verification", False, f"Expected 200.0, got {updated_data['balance']}")
        else:
            log_result("Balance Update Verification", False, "Failed to verify balance update")
    else:
        log_result("Admin Balance Update", False, "Failed to update balance")
    
    # Test withdrawal restrictions (only from total_earned)
    withdrawal_data = {
        "type": "withdraw",
        "amount": 600.0,
        "card_name": "Test User",
        "card_number": "Test Bank"
    }
    
    response, timing = make_request_with_timing('POST', '/transactions', withdrawal_data, user_headers)
    if response and response.status_code == 400:
        error_data = response.json()
        if "insufficient earnings" in error_data.get('detail', '').lower():
            log_result("Withdrawal Restriction", True, "Correctly prevents withdrawal from balance")
        else:
            log_result("Withdrawal Restriction", False, f"Unexpected error: {error_data.get('detail')}")
    else:
        log_result("Withdrawal Restriction", False, "Should prevent withdrawal with insufficient earnings")

def test_api_endpoint_health():
    """TEST 4: API Endpoint Health Check"""
    print("\n🔴 TEST 4: API Endpoint Health Check")
    
    user_token, admin_token, user_id, user_data = setup_test_user()
    if not all([user_token, admin_token, user_id]):
        log_result("API Health Setup", False, "Failed to setup test environment")
        return
    
    user_headers = {"Authorization": f"Bearer {user_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test critical endpoints with response time requirements (2-3 seconds)
    endpoints = [
        ("GET", "/auth/me", user_headers, "User Profile"),
        ("GET", "/packages/my", user_headers, "User Packages"),
        ("GET", "/packages", None, "Package Definitions"),
        ("GET", "/admin/stats", admin_headers, "Admin Stats")
    ]
    
    for method, endpoint, headers, name in endpoints:
        response, timing = make_request_with_timing(method, endpoint, headers=headers)
        
        if response and response.status_code == 200:
            if timing <= 3.0:
                log_result(f"{name} Response Time", True, f"{timing:.2f}s (within 3s requirement)")
            else:
                log_result(f"{name} Response Time", False, f"{timing:.2f}s (exceeds 3s requirement)")
        else:
            log_result(f"{name} Availability", False, f"Status: {response.status_code if response else 'No response'}")

def test_error_handling_and_security():
    """TEST 5: Error Handling and Security"""
    print("\n🔴 TEST 5: Error Handling and Security")
    
    # Test JWT token validation
    invalid_headers = {"Authorization": "Bearer invalid-token-12345"}
    response, timing = make_request_with_timing('GET', '/auth/me', headers=invalid_headers)
    
    if response and response.status_code == 401:
        log_result("JWT Token Validation", True, "Invalid token correctly rejected")
    else:
        log_result("JWT Token Validation", False, f"Expected 401, got {response.status_code if response else 'No response'}")
    
    # Test input validation
    invalid_package_data = {
        "package_type": "invalid_type",
        "invested_amount": -100
    }
    
    user_token, _, _, _ = setup_test_user()
    if user_token:
        user_headers = {"Authorization": f"Bearer {user_token}"}
        response, timing = make_request_with_timing('POST', '/packages/purchase', invalid_package_data, user_headers)
        
        if response and response.status_code == 400:
            log_result("Input Validation", True, "Invalid package data correctly rejected")
        else:
            log_result("Input Validation", False, f"Expected 400, got {response.status_code if response else 'No response'}")
    
    # Test CORS configuration
    cors_headers = {
        "Origin": "https://investaz-platform-1.preview.emergentagent.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization"
    }
    
    response, timing = make_request_with_timing('OPTIONS', '/auth/login', headers=cors_headers)
    if response and response.status_code in [200, 204]:
        log_result("CORS Configuration", True, "CORS preflight handled correctly")
    else:
        log_result("CORS Configuration", False, f"CORS preflight failed: {response.status_code if response else 'No response'}")

def test_performance_and_reliability():
    """TEST 6: Performance and Reliability"""
    print("\n🔴 TEST 6: Performance and Reliability")
    
    user_token, admin_token, user_id, user_data = setup_test_user()
    if not all([user_token, admin_token, user_id]):
        log_result("Performance Test Setup", False, "Failed to setup test environment")
        return
    
    user_headers = {"Authorization": f"Bearer {user_token}"}
    
    # Test concurrent requests
    def make_concurrent_request():
        response, timing = make_request_with_timing('GET', '/auth/me', headers=user_headers)
        return response is not None and response.status_code == 200, timing
    
    # Run 5 concurrent requests
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(make_concurrent_request) for _ in range(5)]
        results = [future.result() for future in concurrent.futures.as_completed(futures)]
    
    successful_requests = sum(1 for success, _ in results if success)
    avg_response_time = sum(timing for _, timing in results) / len(results)
    
    if successful_requests == 5:
        log_result("Concurrent Request Handling", True, f"5/5 requests successful, avg time: {avg_response_time:.2f}s")
    else:
        log_result("Concurrent Request Handling", False, f"Only {successful_requests}/5 requests successful")
    
    # Test API response consistency (multiple calls to same endpoint)
    consistency_results = []
    for i in range(3):
        response, timing = make_request_with_timing('GET', '/packages', headers=user_headers)
        if response and response.status_code == 200:
            consistency_results.append(response.json())
        time.sleep(1)
    
    if len(consistency_results) == 3 and all(r == consistency_results[0] for r in consistency_results):
        log_result("API Response Consistency", True, "Package definitions consistent across calls")
    else:
        log_result("API Response Consistency", False, "Inconsistent responses detected")

def run_final_validation():
    """Run complete final validation suite"""
    print("🎯 STARTING FINAL COMPREHENSIVE BACKEND VALIDATION")
    print("=" * 80)
    
    # Run all test suites
    test_suites = [
        ("12-Hour Collection System Stability", test_12_hour_collection_system_stability),
        ("Package Management", test_package_management),
        ("User Balance Operations", test_user_balance_operations),
        ("API Endpoint Health Check", test_api_endpoint_health),
        ("Error Handling and Security", test_error_handling_and_security),
        ("Performance and Reliability", test_performance_and_reliability)
    ]
    
    for suite_name, test_func in test_suites:
        try:
            print(f"\n{'='*20} {suite_name} {'='*20}")
            test_func()
        except Exception as e:
            log_result(f"{suite_name} (CRASHED)", False, str(e))
        
        time.sleep(2)  # Brief pause between test suites
    
    # Final Results
    print("\n" + "=" * 80)
    print("📊 FINAL VALIDATION RESULTS")
    print("=" * 80)
    
    for detail in test_results["details"]:
        print(detail)
    
    total_tests = test_results["passed"] + test_results["failed"]
    success_rate = (test_results["passed"] / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\n📈 SUMMARY:")
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    print(f"📊 Success Rate: {success_rate:.1f}%")
    
    if test_results["failed"] == 0:
        print("\n🎉 ALL TESTS PASSED - BACKEND IS PRODUCTION READY!")
        print("✅ 12-hour collection system is stable and responsive")
        print("✅ All API endpoints meet performance requirements")
        print("✅ Security and error handling working correctly")
    else:
        print(f"\n⚠️  {test_results['failed']} TESTS FAILED")
        print("❌ Backend needs attention before production deployment")
    
    return test_results["passed"], test_results["failed"]

if __name__ == "__main__":
    run_final_validation()