#!/usr/bin/env python3
"""
EKA-AI Backend API Testing Suite
Tests all endpoints for the Go4Garage Intelligence Platform
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class EKAAPITester:
    def __init__(self, base_url="https://g4g-intel.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
    def log(self, message: str, level: str = "INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, headers: Optional[Dict] = None) -> tuple:
        """Run a single API test"""
        url = f"{self.api_base}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                self.log(f"   Response: {response.text[:200]}", "FAIL")
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}", "ERROR")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}

    def test_health_endpoints(self):
        """Test basic health and info endpoints"""
        self.log("=== Testing Health Endpoints ===")
        
        # Test root endpoint
        self.run_test("Root Endpoint", "GET", "", 200)
        
        # Test health endpoint
        self.run_test("Health Check", "GET", "health", 200)

    def test_auth_flow(self):
        """Test authentication endpoints"""
        self.log("=== Testing Authentication Flow ===")
        
        # Test user registration
        register_data = {
            "email": f"test_{datetime.now().strftime('%H%M%S')}@go4garage.com",
            "password": "test123",
            "name": "Test User",
            "department": "DEPT_TECHNOLOGY"
        }
        
        success, response = self.run_test(
            "User Registration", "POST", "auth/register", 200, register_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = response['user']
            self.log(f"✅ Registered user: {self.user_data['name']}")
        else:
            # Try login with existing test user
            self.log("Registration failed, trying login with test user...")
            login_data = {
                "email": "test@go4garage.com",
                "password": "test123"
            }
            
            success, response = self.run_test(
                "User Login", "POST", "auth/login", 200, login_data
            )
            
            if success and 'access_token' in response:
                self.token = response['access_token']
                self.user_data = response['user']
                self.log(f"✅ Logged in user: {self.user_data['name']}")
            else:
                self.log("❌ Both registration and login failed!")
                return False
        
        # Test get current user
        if self.token:
            self.run_test("Get Current User", "GET", "auth/me", 200)
        
        return True

    def test_ai_endpoints(self):
        """Test AI chat endpoints"""
        self.log("=== Testing AI Endpoints ===")
        
        if not self.token:
            self.log("❌ No auth token, skipping AI tests")
            return
        
        # Test AI ask endpoint
        ask_data = {
            "question": "What is the status of URGAA EV charging stations?",
            "category": "URGAA"
        }
        
        success, response = self.run_test(
            "AI Ask Question", "POST", "ai/ask", 200, ask_data
        )
        
        if success:
            # Verify response structure
            required_fields = ['id', 'answer', 'provenance', 'pipeline_steps']
            for field in required_fields:
                if field not in response:
                    self.log(f"❌ Missing field in AI response: {field}")
                else:
                    self.log(f"✅ AI response contains {field}")
        
        # Test chat history
        self.run_test("Get Chat History", "GET", "ai/history", 200)

    def test_urgaa_endpoints(self):
        """Test URGAA EV charging endpoints"""
        self.log("=== Testing URGAA Endpoints ===")
        
        if not self.token:
            self.log("❌ No auth token, skipping URGAA tests")
            return
        
        # Test stations endpoint
        success, response = self.run_test(
            "Get EV Stations", "GET", "urgaa/stations", 200
        )
        
        if success and isinstance(response, list):
            self.log(f"✅ Retrieved {len(response)} EV stations")
            if response:
                station = response[0]
                required_fields = ['id', 'name', 'location', 'chargers_total', 'status']
                for field in required_fields:
                    if field not in station:
                        self.log(f"❌ Missing field in station data: {field}")
        
        # Test metrics endpoint
        success, response = self.run_test(
            "Get URGAA Metrics", "GET", "urgaa/metrics", 200
        )
        
        if success:
            required_fields = ['total_stations', 'active_sessions', 'uptime_percent']
            for field in required_fields:
                if field not in response:
                    self.log(f"❌ Missing field in URGAA metrics: {field}")

    def test_gstsaas_endpoints(self):
        """Test GSTSAAS workshop endpoints"""
        self.log("=== Testing GSTSAAS Endpoints ===")
        
        if not self.token:
            self.log("❌ No auth token, skipping GSTSAAS tests")
            return
        
        # Test job card creation
        job_card_data = {
            "customer_name": "Test Customer",
            "vehicle_make": "Maruti",
            "vehicle_model": "Swift",
            "registration": "DL01AB1234",
            "complaint": "Engine noise issue",
            "parts": [
                {"name": "Oil Filter", "price": 250, "quantity": 1},
                {"name": "Engine Oil", "price": 800, "quantity": 1}
            ],
            "labor_hours": 2.5,
            "labor_rate": 400
        }
        
        success, response = self.run_test(
            "Create Job Card", "POST", "gstsaas/job-card", 201, job_card_data
        )
        
        if success:
            required_fields = ['id', 'job_number', 'customer_name', 'grand_total']
            for field in required_fields:
                if field not in response:
                    self.log(f"❌ Missing field in job card: {field}")
                else:
                    self.log(f"✅ Job card contains {field}: {response.get(field)}")
        
        # Test get job cards
        self.run_test("Get Job Cards", "GET", "gstsaas/job-cards", 200)

    def test_arjun_endpoints(self):
        """Test ARJUN training endpoints"""
        self.log("=== Testing ARJUN Endpoints ===")
        
        if not self.token:
            self.log("❌ No auth token, skipping ARJUN tests")
            return
        
        # Test courses endpoint
        success, response = self.run_test(
            "Get Training Courses", "GET", "arjun/courses", 200
        )
        
        if success and isinstance(response, list):
            self.log(f"✅ Retrieved {len(response)} training courses")
            if response:
                course = response[0]
                required_fields = ['id', 'title', 'duration_hours', 'level']
                for field in required_fields:
                    if field not in course:
                        self.log(f"❌ Missing field in course data: {field}")
        
        # Test user progress
        success, response = self.run_test(
            "Get User Progress", "GET", "arjun/progress", 200
        )
        
        if success:
            required_fields = ['current_course', 'certifications', 'total_hours']
            for field in required_fields:
                if field not in response:
                    self.log(f"❌ Missing field in progress data: {field}")

    def test_ignition_endpoints(self):
        """Test IGNITION customer intelligence endpoints"""
        self.log("=== Testing IGNITION Endpoints ===")
        
        if not self.token:
            self.log("❌ No auth token, skipping IGNITION tests")
            return
        
        # Test customer metrics
        success, response = self.run_test(
            "Get Customer Metrics", "GET", "ignition/metrics", 200
        )
        
        if success:
            required_fields = ['total_customers', 'active_customers', 'churn_risk_count']
            for field in required_fields:
                if field not in response:
                    self.log(f"❌ Missing field in customer metrics: {field}")
        
        # Test churn risks
        success, response = self.run_test(
            "Get Churn Risks", "GET", "ignition/churn-risks", 200
        )
        
        if success and isinstance(response, list):
            self.log(f"✅ Retrieved {len(response)} churn risk customers")

    def test_support_endpoints(self):
        """Test support ticket endpoints"""
        self.log("=== Testing Support Endpoints ===")
        
        if not self.token:
            self.log("❌ No auth token, skipping Support tests")
            return
        
        # Test ticket creation
        ticket_data = {
            "subject": "Test Support Ticket",
            "description": "This is a test ticket for API testing",
            "priority": "medium"
        }
        
        success, response = self.run_test(
            "Create Support Ticket", "POST", "support/tickets", 200, ticket_data
        )
        
        if success:
            required_fields = ['id', 'ticket_number', 'subject', 'status']
            for field in required_fields:
                if field not in response:
                    self.log(f"❌ Missing field in ticket: {field}")
        
        # Test get tickets
        self.run_test("Get Support Tickets", "GET", "support/tickets", 200)
        
        # Test support metrics
        self.run_test("Get Support Metrics", "GET", "support/metrics", 200)

    def test_finance_endpoints(self):
        """Test finance dashboard endpoints"""
        self.log("=== Testing Finance Endpoints ===")
        
        if not self.token:
            self.log("❌ No auth token, skipping Finance tests")
            return
        
        success, response = self.run_test(
            "Get Finance Dashboard", "GET", "finance/dashboard", 200
        )
        
        if success:
            required_fields = ['revenue_mtd', 'expenses_mtd', 'net_profit', 'transactions']
            for field in required_fields:
                if field not in response:
                    self.log(f"❌ Missing field in finance dashboard: {field}")

    def test_legal_endpoints(self):
        """Test legal contract endpoints"""
        self.log("=== Testing Legal Endpoints ===")
        
        if not self.token:
            self.log("❌ No auth token, skipping Legal tests")
            return
        
        success, response = self.run_test(
            "Get Legal Contracts", "GET", "legal/contracts", 200
        )
        
        if success and isinstance(response, list):
            self.log(f"✅ Retrieved {len(response)} legal contracts")
            if response:
                contract = response[0]
                required_fields = ['id', 'title', 'status', 'risk_level']
                for field in required_fields:
                    if field not in contract:
                        self.log(f"❌ Missing field in contract data: {field}")

    def test_general_endpoints(self):
        """Test general info endpoints"""
        self.log("=== Testing General Endpoints ===")
        
        # Test departments (no auth required)
        success, response = self.run_test(
            "Get Departments", "GET", "departments", 200
        )
        
        if success and isinstance(response, list):
            self.log(f"✅ Retrieved {len(response)} departments")
        
        # Test products (no auth required)
        success, response = self.run_test(
            "Get Products", "GET", "products", 200
        )
        
        if success and isinstance(response, list):
            self.log(f"✅ Retrieved {len(response)} products")

    def run_all_tests(self):
        """Run all test suites"""
        self.log("🚀 Starting EKA-AI Backend API Tests")
        self.log(f"Testing against: {self.base_url}")
        
        # Test in order of dependency
        self.test_health_endpoints()
        self.test_general_endpoints()
        
        if self.test_auth_flow():
            self.test_ai_endpoints()
            self.test_urgaa_endpoints()
            self.test_gstsaas_endpoints()
            self.test_arjun_endpoints()
            self.test_ignition_endpoints()
            self.test_support_endpoints()
            self.test_finance_endpoints()
            self.test_legal_endpoints()
        
        # Print summary
        self.log("=" * 50)
        self.log(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            self.log("❌ Failed Tests:")
            for test in self.failed_tests:
                error_msg = test.get('error', f"Status {test.get('actual')} != {test.get('expected')}")
                self.log(f"   - {test['test']}: {error_msg}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"✅ Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80  # Consider 80%+ as passing

def main():
    tester = EKAAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())