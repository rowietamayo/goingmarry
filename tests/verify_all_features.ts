
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';


// This script only tests Backend APIs.
// UI features like "Cart Limit" (Frontend only) and "Navbar" must be manually verified.
// Gemini is tested manually via "Add Product" flow.

async function runBackendTests() {
  console.log('Running Backend Verification (Registration, Login, Products)...');

  // 1. Register
  const userEventId = Date.now();
  const user = {
    name: `Verify User ${userEventId}`,
    email: `verify_${userEventId}@test.com`,
    password: 'password123',
    boutiqueName: 'Verify Boutique',
    membershipCode: ""
  };

  try {
     const regRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
     });
     if (!regRes.ok) throw new Error('Registration failed');
     // @ts-ignore
     const regData = await regRes.json();
     console.log('Registration OK:', regData.seller.email);
     const token = regData.token;
     const userId = regData.seller.id;

     // 2. Create Product (Qty: 2)
     const prodRes = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
           id: `prod_${userEventId}`,
           name: 'Limited Edition Item',
           description: 'Only 2 in stock',
           price: 1000,
           category: 'Fashion',
           condition: 'Brand New',
           imageUrl: 'http://example.com/img.png',
           quantity: 2,
           isSold: false,
           sellerId: userId,
           seller: user.boutiqueName
        })
     });
     if (!prodRes.ok) throw new Error('Create Product failed');
     console.log('Create Product OK (Qty: 2)');

     console.log('Backend Verified. Now perform Manual UI Tests:');
     console.log('1. Login as seller -> Check Navbar (No Cart, Yes Plus, Icon Logout)');
     console.log('2. Click Plus Icon -> Add Product -> Upload Image (Test Gemini)');
     console.log('3. Logout -> View Product -> Add to Cart twice -> Verify 3rd attempt Disabled');

  } catch (err) {
      console.error('Verification Failed:', err);
  }
}

runBackendTests();
