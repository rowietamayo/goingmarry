
import fetch from 'node-fetch'; // Standard fetch might be available depending on node version, but import to be safe if env differs.
// Using global fetch if available (Node 18+)

const BASE_URL = 'http://localhost:3001';

async function reproAdd() {
    console.log('Testing Add Product with Large Payload...');

    // 1. Register/Login
    const userEmail = `repro_${Date.now()}@example.com`;
    let token = '';
    let sellerId = '';

    try {
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Repro User',
                email: userEmail,
                boutiqueName: 'Repro Boutique',
                password: 'password',
                membershipCode: ""
            })
        });

        if (!regRes.ok) throw new Error(await regRes.text());
        const data: any = await regRes.json();
        token = data.token;
        sellerId = data.seller.id;
        console.log('✅ Logged in/Registered');
    } catch (e) {
        console.error('❌ Login failed:', e);
        process.exit(1);
    }

    // 2. Create Dummy Large Payload (10MB String)
    const largeString = 'A'.repeat(10 * 1024 * 1024);

    const product = {
        id: `repro_${Date.now()}`,
        name: 'Large Image Product',
        description: 'Testing payload size',
        price: 100,
        category: 'Home',
        condition: 'New',
        imageUrl: `data:image/jpeg;base64,${largeString}`, // Mimic base64 image
        seller: 'Repro User',
        sellerId: sellerId
    };

    console.log('Sending ~10MB payload...');

    try {
        const res = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(product)
        });

        if (!res.ok) {
            console.error(`❌ Failed: ${res.status} ${res.statusText}`);
            const txt = await res.text();
            console.error('Response:', txt);
        } else {
            console.log('✅ Success! Product added with large payload.');
        }

    } catch (e) {
        console.error('❌ Network error:', e);
    }
}

reproAdd();
