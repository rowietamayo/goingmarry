
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';


async function runTests() {
  console.log('Starting Verification Tests...');

  // 1. Register User
  console.log('\n--- Test 1: Registration ---');
  const user = {
    name: 'Backend Test User',
    email: `backend_test_${Date.now()}@test.com`,
    password: 'password123',
    boutiqueName: 'Backend Boutique',
    membershipCode: ""
  };

  let token = '';
  let userId = '';

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Registration failed: ${res.status} ${text}`);
    }

    // @ts-ignore
    const data = await res.json();
    console.log('Registration Successful:', data.seller.email);
    token = data.token;
    userId = data.seller.id;
  } catch (err) {
    console.error('Test 1 Failed:', err);
    return;
  }

  // 2. Login
  console.log('\n--- Test 2: Login ---');
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: user.password })
    });

    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    // @ts-ignore
    const data = await res.json();
    console.log('Login Successful, IDs match:', data.seller.id === userId);
  } catch (err) {
      console.error('Test 2 Failed:', err);
      return;
  }

  // 3. Create Product
  console.log('\n--- Test 3: Create Product ---');
  const createdId = `prod_${Date.now()}`;
  try {
    const productData = {
      id: createdId,
      name: 'Test Dress',
      description: 'A beautiful test dress',
      price: '1500.50', // Sending as string to test conversion
      category: 'Dresses',
      condition: 'New',
      imageUrl: 'http://example.com/image.png',
      isSold: false, // Boolean - should become 0
      sellerId: userId,
      seller: user.name
    };

    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Create Product failed: ${res.status} ${txt}`);
    }
    console.log('Product Created request sent.');

    // Fetch to verify
    const getRes = await fetch(`${BASE_URL}/products`);
    // @ts-ignore
    const products = await getRes.json();
    // @ts-ignore
    const found = products.find(p => p.id === createdId);

    if (!found) throw new Error('Product not found in list after creation');

    if (found.price !== 1500.50) console.error(`Price mismatch: Expected 1500.50, got ${found.price}`);
    else console.log('Price Verified: 1500.50');

    if (found.isSold !== 0) console.error(`isSold mismatch: Expected 0, got ${found.isSold}`);
    else console.log('isSold Verified: 0');

  } catch (err) {
    console.error('Test 3 Failed:', err);
    return;
  }

  // 4. Update Product
  console.log('\n--- Test 4: Update Product ---');
  try {
     const updateData = {
        name: 'Updated Test Dress',
        price: '2000', // Update price
        description: 'Updated description',
        category: 'Dresses',
        condition: 'New',
        imageUrl: 'http://example.com/updated.png',
        isSold: true // Should convert to 1
     };

     const res = await fetch(`${BASE_URL}/products/${createdId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
     });

     if (!res.ok) {
         const txt = await res.text();
         throw new Error(`Update Product failed: ${res.status} ${txt}`);
     }
     console.log('Product Updated request sent.');

     // Fetch to verify
    const getRes = await fetch(`${BASE_URL}/products`);
    // @ts-ignore
    const products = await getRes.json();
    // @ts-ignore
    const found = products.find(p => p.id === createdId);

    if (found.isSold !== 1) console.error(`isSold update mismatch: Expected 1, got ${found.isSold}`);
    else console.log('Product Update Verified: isSold is correctly 1.');

  } catch (err) {
      console.error('Test 4 Failed:', err);
  }

  console.log('\n--- Verification Complete ---');
}

runTests();
