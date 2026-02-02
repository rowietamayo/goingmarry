
import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const mapProduct = (p: any) => ({
    ...p,
    imageUrl: p.imageUrl || p.imageurl,
    sellerId: p.sellerId || p.sellerid,
    createdAt: p.createdAt || p.createdat,
    isSold: p.isSold !== undefined ? !!p.isSold : (p.issold !== undefined ? !!p.issold : false),
    seller: p.seller || p.boutiquename // fallback if joined
});

const mapSeller = (s: any) => ({
    ...s,
    boutiqueName: s.boutiqueName || s.boutiquename,
    isAdmin: !!(s.isAdmin || s.isadmin)
});

const authenticateAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        if (!user.isAdmin) return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        req.user = user;
        next();
    });
};

router.get('/sellers', authenticateAdmin, async (req, res) => {
    try {
        const sellers = await db.all('SELECT id, name, email, boutiqueName, isAdmin FROM sellers');
        res.json(sellers.map(mapSeller));
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sellers' });
    }
});

router.get('/sellers/:id', authenticateAdmin, async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const seller = await db.get('SELECT id, name, email, boutiqueName, isAdmin FROM sellers WHERE id = $1', [id]);

        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        res.json(mapSeller(seller));
    } catch (error) {
        res.status(500).json({ error: 'Error fetching seller' });
    }
});

router.patch('/sellers/:id', authenticateAdmin, async (req: any, res: any) => {
    const { id } = req.params;
    const { name, boutiqueName } = req.body;

    if (!name || !boutiqueName) {
        return res.status(400).json({ error: 'Name and Boutique Name are required' });
    }

    try {
        const seller = await db.get('SELECT * FROM sellers WHERE id = $1', [id]);
        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        await db.query(
            'UPDATE sellers SET name = $1, boutiqueName = $2 WHERE id = $3',
            [name, boutiqueName, id]
        );

        // Cascade update: Update all products' seller field if boutiqueName changed
        if (seller.boutiqueName !== boutiqueName) {
            await db.query(
                'UPDATE products SET seller = $1 WHERE sellerId = $2',
                [boutiqueName, id]
            );
        }

        res.json({ message: 'Seller updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating seller' });
    }
});

router.delete('/sellers/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        // Prevent deleting self
        // @ts-ignore
        if (req.user.id === id) {
            return res.status(400).json({ error: 'Cannot delete your own admin account' });
        }

        // 1. Delete seller's products
        await db.query('DELETE FROM products WHERE sellerId = $1', [id]);

        // 2. Delete seller
        const result = await db.query('DELETE FROM sellers WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        res.json({ message: 'Seller and their products deleted' });
    } catch (error) {
        console.error('Delete User Error', error);
        res.status(500).json({ error: 'Error deleting seller' });
    }
});


router.get('/sellers/:id/products', authenticateAdmin, async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const seller = await db.get('SELECT id FROM sellers WHERE id = $1', [id]);
        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        const products = await db.all('SELECT * FROM products WHERE sellerId = $1', [id]);
        res.json(products.map(mapProduct));
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
});

router.get('/sellers/:id/products/:productId', authenticateAdmin, async (req: any, res: any) => {
    const { id, productId } = req.params;
    try {
        const seller = await db.get('SELECT id FROM sellers WHERE id = $1', [id]);
        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        const product = await db.get('SELECT * FROM products WHERE id = $1', [productId]);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Optional: Verify the product actually belongs to this seller?
        // The user's request implies getting a seller's product, so we should check consistency.
        if (product.sellerId !== id) {
             return res.status(404).json({ error: 'Product not found for this seller' });
        }

        res.json(mapProduct(product));
    } catch (error) {
        res.status(500).json({ error: 'Error fetching product' });
    }
});

export default router;
