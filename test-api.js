// Quick test script to verify API routes
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

async function testRoutes() {
  console.log('🧪 Testing API Routes...\n');
  
  // Test health endpoint
  try {
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
  
  // Test register endpoint (should fail with validation error, not 404)
  try {
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const registerData = await registerRes.json();
    console.log('✅ Register endpoint exists:', registerData.message || registerData);
  } catch (error) {
    console.error('❌ Register endpoint failed:', error.message);
  }
  
  console.log('\n✅ If you see validation errors (not 404), routes are working!');
}

testRoutes();
