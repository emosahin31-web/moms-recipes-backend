#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime
import uuid

class RecipeAPITester:
    def __init__(self, base_url="https://moms-recipes.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{self.base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_recipe_id = None
        self.created_youtube_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    json_resp = response.json()
                    return success, json_resp
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_msg = response.json()
                    print(f"   Error details: {error_msg}")
                except:
                    print(f"   Response text: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_create_recipe(self):
        """Test recipe creation"""
        recipe_data = {
            "title": f"Test Recipe {datetime.now().strftime('%H%M%S')}",
            "content": "<h2>Ingredients</h2><ul><li>2 cups flour</li><li>1 cup sugar</li></ul><h2>Instructions</h2><ol><li>Mix ingredients</li><li>Bake for 30 minutes</li></ol>"
        }
        
        success, response = self.run_test(
            "Create Recipe",
            "POST",
            "recipes",
            200,
            data=recipe_data
        )
        
        if success and 'id' in response:
            self.created_recipe_id = response['id']
            print(f"   Created recipe ID: {self.created_recipe_id}")
        
        return success

    def test_get_recipes(self):
        """Test getting all recipes"""
        success, response = self.run_test(
            "Get All Recipes",
            "GET",
            "recipes",
            200
        )
        
        if success:
            recipes_count = len(response) if isinstance(response, list) else 0
            print(f"   Found {recipes_count} recipes")
        
        return success

    def test_get_single_recipe(self):
        """Test getting a single recipe"""
        if not self.created_recipe_id:
            print("⏭️  Skipping single recipe test - no recipe created")
            return True
            
        success, response = self.run_test(
            "Get Single Recipe",
            "GET",
            f"recipes/{self.created_recipe_id}",
            200
        )
        
        return success

    def test_update_recipe(self):
        """Test updating a recipe"""
        if not self.created_recipe_id:
            print("⏭️  Skipping recipe update test - no recipe created")
            return True
            
        update_data = {
            "title": f"Updated Recipe {datetime.now().strftime('%H%M%S')}"
        }
        
        success, response = self.run_test(
            "Update Recipe",
            "PUT",
            f"recipes/{self.created_recipe_id}",
            200,
            data=update_data
        )
        
        return success

    def test_ai_chat(self):
        """Test AI chat functionality"""
        chat_data = {
            "message": "Give me a simple chocolate chip cookie recipe",
            "session_id": "test-session"
        }
        
        success, response = self.run_test(
            "AI Chat Assistant",
            "POST",
            "chat",
            200,
            data=chat_data
        )
        
        if success and 'response' in response:
            response_text = response['response'][:100] + '...' if len(response['response']) > 100 else response['response']
            print(f"   AI Response preview: {response_text}")
        
        return success

    def test_create_youtube_link(self):
        """Test creating YouTube link"""
        youtube_data = {
            "url": "https://youtube.com/watch?v=test123",
            "title": f"Test Recipe Video {datetime.now().strftime('%H%M%S')}"
        }
        
        success, response = self.run_test(
            "Create YouTube Link",
            "POST",
            "youtube-links",
            200,
            data=youtube_data
        )
        
        if success and 'id' in response:
            self.created_youtube_id = response['id']
            print(f"   Created YouTube link ID: {self.created_youtube_id}")
        
        return success

    def test_get_youtube_links(self):
        """Test getting all YouTube links"""
        success, response = self.run_test(
            "Get YouTube Links",
            "GET",
            "youtube-links",
            200
        )
        
        if success:
            links_count = len(response) if isinstance(response, list) else 0
            print(f"   Found {links_count} YouTube links")
        
        return success

    def test_delete_recipe(self):
        """Test deleting a recipe"""
        if not self.created_recipe_id:
            print("⏭️  Skipping recipe deletion test - no recipe to delete")
            return True
            
        success, response = self.run_test(
            "Delete Recipe",
            "DELETE",
            f"recipes/{self.created_recipe_id}",
            200
        )
        
        return success

    def test_delete_youtube_link(self):
        """Test deleting a YouTube link"""
        if not self.created_youtube_id:
            print("⏭️  Skipping YouTube link deletion test - no link to delete")
            return True
            
        success, response = self.run_test(
            "Delete YouTube Link",
            "DELETE",
            f"youtube-links/{self.created_youtube_id}",
            200
        )
        
        return success

    def test_error_handling(self):
        """Test error handling for non-existent resources"""
        fake_id = str(uuid.uuid4())
        
        # Test getting non-existent recipe
        success1, _ = self.run_test(
            "Get Non-existent Recipe",
            "GET",
            f"recipes/{fake_id}",
            404
        )
        
        # Test deleting non-existent recipe  
        success2, _ = self.run_test(
            "Delete Non-existent Recipe",
            "DELETE", 
            f"recipes/{fake_id}",
            404
        )
        
        # Test deleting non-existent YouTube link
        success3, _ = self.run_test(
            "Delete Non-existent YouTube Link",
            "DELETE",
            f"youtube-links/{fake_id}",
            404
        )
        
        return success1 and success2 and success3

def main():
    print("🧪 Starting Recipe API Tests")
    print("=" * 50)
    
    tester = RecipeAPITester()
    
    # Run all tests in logical order
    test_results = []
    
    # Basic connectivity tests
    test_results.append(tester.test_root_endpoint())
    
    # Recipe CRUD tests
    test_results.append(tester.test_create_recipe())
    test_results.append(tester.test_get_recipes())
    test_results.append(tester.test_get_single_recipe())
    test_results.append(tester.test_update_recipe())
    
    # YouTube links tests
    test_results.append(tester.test_create_youtube_link())
    test_results.append(tester.test_get_youtube_links())
    
    # AI chat test
    test_results.append(tester.test_ai_chat())
    
    # Cleanup tests
    test_results.append(tester.test_delete_recipe())
    test_results.append(tester.test_delete_youtube_link())
    
    # Error handling tests
    test_results.append(tester.test_error_handling())
    
    # Print summary
    print("\n" + "=" * 50)
    print(f"📊 Test Summary: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())