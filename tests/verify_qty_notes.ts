
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';


async function runTests() {
  console.log('Starting Verification Tests (Qty & Notes)...');

  // 1. Register User
  console.log('\n--- Test 1: Registration ---');
  const user = {
    name: 'Backend Qty Test',
    email: `qty_test_${Date.now()}@test.com`,
    password: 'password123',
    boutiqueName: 'Qty Boutique',
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
        const txt = await res.text();
        throw new Error(`Registration failed: ${res.status} ${txt}`);
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

  // 2. Create Product with Qty and Notes
  console.log('\n--- Test 2: Create Product with Qty/Notes ---');
  const createdId = `prod_qty_${Date.now()}`;
  try {
    const productData = {
      id: createdId,
      name: 'Qty Test Item',
      description: 'Testing quantity field',
      price: '500',
      category: 'Home',
      condition: 'Brand New',
      imageUrl: 'http://example.com/qty.png',
      isSold: false,
      quantity: '5', // String input from frontend usually
      notes: 'This is a private note.',
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

    if (!found) throw new Error('Product not found');

    if (found.quantity !== 5) console.error(`Qty mismatch: Expected 5, got ${found.quantity}`);
    else console.log('Qty Verified: 5');

    if (found.notes !== 'This is a private note.') console.error(`Notes mismatch: "${found.notes}"`);
    else console.log('Notes Verified: Correct');

  } catch (err) {
    console.error('Test 2 Failed:', err);
    return;
  }

  // 3. Update Product Qty and Notes
  console.log('\n--- Test 3: Update Qty/Notes ---');
  try {
     const updateData = {
        name: 'Qty Test Item Updated',
        price: 500,
        category: 'Home',
        condition: 'Brand New',
        imageUrl: 'http://example.com/qty.png',
        isSold: false,
        quantity: 10, // Number input
        notes: 'Updated note.'
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

    if (found.quantity !== 10) console.error(`Qty update mismatch: Expected 10, got ${found.quantity}`);
    else console.log('Qty Update Verified: 10');

    if (found.notes !== 'Updated note.') console.error(`Notes update mismatch: "${found.notes}"`);
    else console.log('Notes Update Verified: Correct');

  } catch (err) {
      console.error('Test 3 Failed:', err);
  }

  console.log('\n--- Verification Complete ---');
}

runTests();
