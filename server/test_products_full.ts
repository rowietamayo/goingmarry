
import fetch from 'node-fetch'; // Requiring node-fetch if in node < 18 or types issue, but let's try native fetch first or require if needed. Actually simpler to use native fetch if node 18+. Assuming node 20+ from metadata.
// If native fetch is not available, I might need to install node-fetch.
// Let's try native fetch first by just using 'fetch'.

const BASE_URL = 'http://localhost:3001';

async function testProducts() {
    console.log('Starting Product Route Tests...');

    // 1. Register User to get Token
    const userEmail = `testuser_${Date.now()}@example.com`;
    const password = 'password123';
    console.log(`\n1. Registering user: ${userEmail}`);

    let token = '';
    let sellerId = '';
    let sellerName = 'Test Seller';

    try {
        const registerRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: sellerName,
                email: userEmail,
                boutiqueName: 'Test Boutique',
                password: password,
                membershipCode: ""
            })
        });

        if (!registerRes.ok) {
            const err = await registerRes.text();
            throw new Error(`Registration failed: ${registerRes.status} ${err}`);
        }

        const authData: any = await registerRes.json();
        token = authData.token;
        sellerId = authData.seller.id;
        console.log('✅ Registration successful');
    } catch (e) {
        console.error('❌ Registration failed:', e);
        process.exit(1);
    }

    // 2. Get Products (Public)
    console.log('\n2. Fetching products (public)...');
    try {
        const getRes = await fetch(`${BASE_URL}/products`);
        if (!getRes.ok) throw new Error(`Get products failed: ${getRes.status}`);
        const products = await getRes.json();
        console.log(`✅ Fetched ${Array.isArray(products) ? products.length : 0} products`);
    } catch (e) {
        console.error('❌ Get products failed:', e);
    }

    // 3. Create Product (Protected)
    console.log('\n3. Creating new product...');
    const productId = `prod_${Date.now()}`;
    const newProduct = {
        id: productId,
        name: 'Vintage Veil',
        description: 'Beautiful vintage veil.',
        price: 150,
        category: 'Accessories',
        condition: 'New',
        imageUrl: 'http://example.com/veil.jpg',
        seller: sellerName,
        sellerId: sellerId
    };

    try {
        const createRes = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newProduct)
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`Create product failed: ${createRes.status} ${err}`);
        }
        console.log('✅ Product created successfully');
    } catch (e) {
        console.error('❌ Create product failed:', e);
        process.exit(1);
    }

    // 4. Update Product (Protected)
    console.log('\n4. Updating product...');
    try {
        const updateRes = await fetch(`${BASE_URL}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                ...newProduct,
                name: 'Vintage Veil (Updated)',
                price: 180
            })
        });

        if (!updateRes.ok) {
            const err = await updateRes.text();
            throw new Error(`Update product failed: ${updateRes.status} ${err}`);
        }
        console.log('✅ Product updated successfully');
    } catch (e) {
        console.error('❌ Update product failed:', e);
    }

    // 5. Delete Product (Protected)
    console.log('\n5. Deleting product...');
    try {
        const deleteRes = await fetch(`${BASE_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!deleteRes.ok) {
            const err = await deleteRes.text();
            throw new Error(`Delete product failed: ${deleteRes.status} ${err}`);
        }
        console.log('✅ Product deleted successfully');
    } catch (e) {
        console.error('❌ Delete product failed:', e);
    }

    console.log('\nAll tests completed.');
}

testProducts();
