"""
AzPay Credit Application API Tests
Tests all endpoints: settings, credit-offers, applications CRUD
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndSettings:
    """Test basic API health and settings endpoints"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("✓ API root endpoint working")
    
    def test_get_settings(self):
        """Test GET /api/settings - returns site settings"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        # Validate required fields
        assert "deposit_amount" in data
        assert "whatsapp_link" in data
        assert "logo_url" in data
        assert data["deposit_amount"] == 50.0
        print(f"✓ Settings endpoint working - deposit: {data['deposit_amount']} AZN")
    
    def test_settings_immutable(self):
        """Test that settings cannot be modified"""
        response = requests.post(f"{BASE_URL}/api/settings", json={"deposit_amount": 100})
        assert response.status_code == 403
        print("✓ Settings POST blocked (immutable)")
        
        response = requests.put(f"{BASE_URL}/api/settings", json={"deposit_amount": 100})
        assert response.status_code == 403
        print("✓ Settings PUT blocked (immutable)")


class TestCreditOffers:
    """Test credit offers endpoint"""
    
    def test_get_credit_offers(self):
        """Test GET /api/credit-offers - returns available credit offers"""
        response = requests.get(f"{BASE_URL}/api/credit-offers")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Validate offer structure
        first_offer = data[0]
        assert "amount" in first_offer
        assert "duration_months" in first_offer
        assert "interest_rate" in first_offer
        assert "monthly_payment" in first_offer
        
        # Validate specific offers exist
        amounts = [offer["amount"] for offer in data]
        assert 1000 in amounts
        assert 5000 in amounts
        assert 15000 in amounts
        
        print(f"✓ Credit offers endpoint working - {len(data)} offers available")
        print(f"  Available amounts: {amounts}")


class TestApplicationsCRUD:
    """Test applications CRUD operations"""
    
    @pytest.fixture
    def test_application_data(self):
        """Test data for creating applications"""
        return {
            "fin_code": "TEST123",
            "id_series": "AZE987654",
            "full_name": "Test User",
            "phone": "+994501234567"
        }
    
    def test_create_application(self, test_application_data):
        """Test POST /api/applications - create new application"""
        response = requests.post(
            f"{BASE_URL}/api/applications",
            json=test_application_data,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        data = response.json()
        # Validate response structure
        assert "id" in data
        assert data["fin_code"] == test_application_data["fin_code"]
        assert data["full_name"] == test_application_data["full_name"]
        assert data["status"] == "approved"
        assert data["selected_amount"] is None
        assert data["card_number"] is None
        assert data["contract_signed"] == False
        
        print(f"✓ Application created - ID: {data['id']}")
        return data["id"]
    
    def test_get_application(self, test_application_data):
        """Test GET /api/applications/{id} - retrieve application"""
        # First create an application
        create_response = requests.post(
            f"{BASE_URL}/api/applications",
            json=test_application_data,
            headers={"Content-Type": "application/json"}
        )
        app_id = create_response.json()["id"]
        
        # Then retrieve it
        response = requests.get(f"{BASE_URL}/api/applications/{app_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == app_id
        assert data["fin_code"] == test_application_data["fin_code"]
        print(f"✓ Application retrieved - ID: {app_id}")
    
    def test_update_application_amount(self, test_application_data):
        """Test PUT /api/applications/{id} - update selected amount"""
        # Create application
        create_response = requests.post(
            f"{BASE_URL}/api/applications",
            json=test_application_data,
            headers={"Content-Type": "application/json"}
        )
        app_id = create_response.json()["id"]
        
        # Update selected amount
        update_response = requests.put(
            f"{BASE_URL}/api/applications/{app_id}",
            json={"selected_amount": 5000},
            headers={"Content-Type": "application/json"}
        )
        assert update_response.status_code == 200
        
        data = update_response.json()
        assert data["selected_amount"] == 5000
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/applications/{app_id}")
        assert get_response.json()["selected_amount"] == 5000
        print(f"✓ Application amount updated - {app_id}: 5000 AZN")
    
    def test_update_application_card(self, test_application_data):
        """Test PUT /api/applications/{id} - update card number"""
        # Create application
        create_response = requests.post(
            f"{BASE_URL}/api/applications",
            json=test_application_data,
            headers={"Content-Type": "application/json"}
        )
        app_id = create_response.json()["id"]
        
        # Update card number
        card_number = "4169738512345678"
        update_response = requests.put(
            f"{BASE_URL}/api/applications/{app_id}",
            json={"card_number": card_number},
            headers={"Content-Type": "application/json"}
        )
        assert update_response.status_code == 200
        
        data = update_response.json()
        assert data["card_number"] == card_number
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/applications/{app_id}")
        assert get_response.json()["card_number"] == card_number
        print(f"✓ Application card updated - {app_id}")
    
    def test_update_application_contract_signed(self, test_application_data):
        """Test PUT /api/applications/{id} - sign contract"""
        # Create application
        create_response = requests.post(
            f"{BASE_URL}/api/applications",
            json=test_application_data,
            headers={"Content-Type": "application/json"}
        )
        app_id = create_response.json()["id"]
        
        # Sign contract
        update_response = requests.put(
            f"{BASE_URL}/api/applications/{app_id}",
            json={"contract_signed": True},
            headers={"Content-Type": "application/json"}
        )
        assert update_response.status_code == 200
        
        data = update_response.json()
        assert data["contract_signed"] == True
        print(f"✓ Contract signed - {app_id}")
    
    def test_full_application_flow(self, test_application_data):
        """Test complete application flow: create -> select amount -> add card -> sign contract"""
        # Step 1: Create application
        create_response = requests.post(
            f"{BASE_URL}/api/applications",
            json=test_application_data,
            headers={"Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        app_id = create_response.json()["id"]
        print(f"  Step 1: Application created - {app_id}")
        
        # Step 2: Select credit amount
        amount_response = requests.put(
            f"{BASE_URL}/api/applications/{app_id}",
            json={"selected_amount": 10000},
            headers={"Content-Type": "application/json"}
        )
        assert amount_response.status_code == 200
        assert amount_response.json()["selected_amount"] == 10000
        print(f"  Step 2: Amount selected - 10000 AZN")
        
        # Step 3: Add card number
        card_response = requests.put(
            f"{BASE_URL}/api/applications/{app_id}",
            json={"card_number": "4169738500001234"},
            headers={"Content-Type": "application/json"}
        )
        assert card_response.status_code == 200
        assert card_response.json()["card_number"] == "4169738500001234"
        print(f"  Step 3: Card added")
        
        # Step 4: Sign contract
        contract_response = requests.put(
            f"{BASE_URL}/api/applications/{app_id}",
            json={"contract_signed": True},
            headers={"Content-Type": "application/json"}
        )
        assert contract_response.status_code == 200
        assert contract_response.json()["contract_signed"] == True
        print(f"  Step 4: Contract signed")
        
        # Verify final state
        final_response = requests.get(f"{BASE_URL}/api/applications/{app_id}")
        final_data = final_response.json()
        assert final_data["status"] == "approved"
        assert final_data["selected_amount"] == 10000
        assert final_data["card_number"] == "4169738500001234"
        assert final_data["contract_signed"] == True
        print(f"✓ Full application flow completed successfully")


class TestValidation:
    """Test input validation"""
    
    def test_invalid_fin_code(self):
        """Test that invalid FIN code is rejected"""
        response = requests.post(
            f"{BASE_URL}/api/applications",
            json={
                "fin_code": "AB",  # Too short
                "id_series": "AZE987654",
                "full_name": "Test User",
                "phone": "+994501234567"
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 400
        print("✓ Invalid FIN code rejected")
    
    def test_invalid_phone(self):
        """Test that invalid phone is rejected"""
        response = requests.post(
            f"{BASE_URL}/api/applications",
            json={
                "fin_code": "TEST123",
                "id_series": "AZE987654",
                "full_name": "Test User",
                "phone": "abc"  # Invalid phone
            },
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 400
        print("✓ Invalid phone rejected")
    
    def test_invalid_app_id_format(self):
        """Test that invalid application ID format is rejected"""
        response = requests.get(f"{BASE_URL}/api/applications/invalid-id")
        assert response.status_code == 400
        print("✓ Invalid app ID format rejected")
    
    def test_nonexistent_application(self):
        """Test 404 for non-existent application"""
        fake_uuid = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/applications/{fake_uuid}")
        assert response.status_code == 404
        print("✓ Non-existent application returns 404")


class TestSecurity:
    """Test security features"""
    
    def test_blocked_paths(self):
        """Test that suspicious paths are blocked"""
        blocked_paths = ['/admin', '/wp-admin', '/.env', '/config']
        for path in blocked_paths:
            response = requests.get(f"{BASE_URL}{path}")
            assert response.status_code in [403, 404], f"Path {path} should be blocked"
        print("✓ Suspicious paths blocked")
    
    def test_security_headers(self):
        """Test that security headers are present"""
        response = requests.get(f"{BASE_URL}/api/settings")
        headers = response.headers
        
        assert "X-Content-Type-Options" in headers
        assert "X-Frame-Options" in headers
        print("✓ Security headers present")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
