import express from 'express';
import { db } from '../db';
import { authenticateToken } from '../middleware/auth';
import { deleteFromCloudinary, uploadToCloudinary } from '../services/cloudinary';


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const mapProduct = (p: any) => ({
    ...p,
    imageUrl: p.imageUrl || p.imageurl,
    sellerId: p.sellerId || p.sellerid,
    createdAt: p.createdAt || p.createdat,
    isSold: p.isSold !== undefined ? !!p.isSold : (p.issold !== undefined ? !!p.issold : false)
});

router.get('/', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products ORDER BY createdAt DESC');
    // Cache for 1 minute, serve stale for up to 1 hour while revalidating
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=3600');
    res.json(products.map(mapProduct));
  } catch (error) {
    console.error('SERVER ERROR (GET /products):', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

router.post('/', authenticateToken, async (req: any, res: any) => {
  const { id, name, description, price, category, condition, imageUrl, seller, isSold, quantity, notes } = req.body;
  const sellerId = req.user.id; // Enforce sellerId from token

  if (!name || price === undefined || !category || !condition || !imageUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate Seller Registration
  const registeredSeller = await db.get('SELECT id, name, boutiqueName FROM sellers WHERE id = $1', [sellerId]);
  if (!registeredSeller) {
      console.log('UNREGISTERED SELLER ATTEMPT:', sellerId);
      return res.status(403).json({ error: 'Seller must be registered to add products.' });
  }

  // Handle Postgres lowercase
  const sellerName = registeredSeller.boutiqueName || registeredSeller.boutiquename;

  // Check for duplicate listing (same name for same seller)
  const existingProduct = await db.get('SELECT id FROM products WHERE name = $1 AND sellerId = $2', [name, sellerId]);
  if (existingProduct) {
      console.log('DUPLICATE LISTING DENIED:', { name, sellerId });
      return res.status(400).json({ error: 'A listing with the same details already exists.' });
  }

  const createdAt = Date.now();

  try {
    const isSoldVal = isSold ? 1 : 0;
    const numericPrice = parseFloat(price);
    const quantityVal = quantity ? parseInt(quantity) : 1;
    // Generate ID if not provided
    const newId = id || Math.random().toString(36).substr(2, 9);

    if (isNaN(numericPrice) || numericPrice <= 0) {
       return res.status(400).json({ error: 'Invalid price value' });
    }

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(imageUrl);

    await db.query(
      `INSERT INTO products
       (id, name, description, price, category, condition, imageUrl, seller, sellerId, createdAt, isSold, quantity, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [newId, name, description, numericPrice, category, condition, cloudinaryUrl, sellerName, sellerId, createdAt, isSoldVal, quantityVal, notes]
    );
    res.json({ message: 'Product successfully added' });
  } catch (error) {
    console.error('SERVER ERROR (POST /products):', error);
    res.status(500).json({ error: 'Error adding product' });
  }
});

// Helper to extract Cloudinary Public ID
const extractPublicId = (url: string) => {
    if (!url.includes('res.cloudinary.com')) return null;
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1 || parts.length <= uploadIndex + 2) return null;

    let pathParts = parts.slice(uploadIndex + 1);
    // Remove version (e.g., v1234567890) if present
    if (pathParts[0].match(/^v\d+$/)) {
        pathParts.shift();
    }
    const filenameWithExt = pathParts.join('/');
    return filenameWithExt.replace(/\.[^/.]+$/, "");
};

// ... existing code ...

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, condition, imageUrl, isSold, quantity, notes } = req.body;

  if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and Price are required' });
  }

  try {
      const product = await db.get('SELECT * FROM products WHERE id = $1', [id]);
      if (!product) {
          return res.status(404).json({ error: "Product not found" });
      }

      // Handle Postgres lowercase
      const productSellerId = product.sellerId || product.sellerid;

      if (productSellerId !== (req as any).user.id && !(req as any).user.isAdmin) {
          return res.status(403).json({ error: "Not authorized to edit this product" });
      }

      const isSoldVal = isSold ? 1 : 0;
      const numericPrice = parseFloat(price);
      const quantityVal = quantity ? parseInt(quantity) : 1;

    if (isNaN(numericPrice) || numericPrice <= 0) {
       return res.status(400).json({ error: 'Invalid price value' });
    }

      // Upload to Cloudinary if new image
      const cloudinaryUrl = await uploadToCloudinary(imageUrl);

      // AUTOMATIC CLEANUP: Delete old image if verified to be different and hosted on Cloudinary
      const oldImageUrl = product.imageUrl || product.imageurl;
      if (oldImageUrl && oldImageUrl !== cloudinaryUrl) {
          const publicId = extractPublicId(oldImageUrl);
          if (publicId) {
             try {
                 await deleteFromCloudinary(publicId);
                 console.log(`Auto-cleaned old image: ${publicId}`);
             } catch (e) {
                 console.warn("Failed to auto-clean old image:", e);
             }
          }
      }

      await db.query(
        'UPDATE products SET name = $1, description = $2, price = $3, category = $4, condition = $5, imageUrl = $6, isSold = $7, quantity = $8, notes = $9 WHERE id = $10',
        [name, description, numericPrice, category, condition, cloudinaryUrl, isSoldVal, quantityVal, notes, id]
      );
      res.json({ message: 'Product updated' });
  } catch (error) {
      console.error('SERVER ERROR (PUT /products/:id):', error);
      res.status(500).json({ error: 'Error updating product' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
      const product = await db.get('SELECT * FROM products WHERE id = $1', [id]);

      if (!product) {
          return res.status(404).json({ error: "Product not found" });
      }

       // @ts-ignore
      const isOwner = (product.sellerId || product.sellerid) === (req as any).user.id;
      // @ts-ignore
      const isAdmin = (req as any).user.isAdmin;

      if (!isOwner && !isAdmin) {
          return res.status(403).json({ error: "Not authorized to delete this product" });
      }

    await db.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
});



router.delete('/:id/image', authenticateToken, async (req: any, res: any) => {
    const { id } = req.params;

    try {
        const product = await db.get('SELECT * FROM products WHERE id = $1', [id]);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // @ts-ignore
        if ((product.sellerId || product.sellerid) !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: "Not authorized to update this product" });
        }

        // @ts-ignore
        const imageUrl = product.imageUrl || product.imageurl;
        if (!imageUrl) {
            return res.status(400).json({ error: "Product currently has no image" });
        }

        // Delete from Cloudinary if it's a Cloudinary image
        if (imageUrl.includes('res.cloudinary.com')) {
            try {
                // Extract public ID
                const parts = imageUrl.split('/');
                const uploadIndex = parts.indexOf('upload');
                if (uploadIndex !== -1 && parts.length > uploadIndex + 2) {
                    let pathParts = parts.slice(uploadIndex + 1);
                     if (pathParts[0].match(/^v\d+$/)) {
                         pathParts.shift();
                     }
                    const filenameWithExt = pathParts.join('/');
                    const publicId = filenameWithExt.replace(/\.[^/.]+$/, "");

                    await deleteFromCloudinary(publicId);
                }
            } catch (e) {
                console.error("Error deleting from Cloudinary:", e);
                // Continue to clear DB even if Cloudinary delete fails (orphan cleanup can handle it later)
            }
        }

        const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800';

        await db.query('UPDATE products SET imageUrl = $1 WHERE id = $2', [DEFAULT_IMAGE, id]);

        res.json({ message: 'Product image removed', defaultImage: DEFAULT_IMAGE });

    } catch (error) {
        console.error('SERVER ERROR (DELETE /products/:id/image):', error);
        res.status(500).json({ error: 'Error deleting product image' });
    }
});

router.get('/:id', async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const product = await db.get('SELECT * FROM products WHERE id = $1', [id]);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(mapProduct(product));
    } catch (error) {
        console.error('SERVER ERROR (GET /products/:id):', error);
        res.status(500).json({ error: 'Error fetching product' });
    }
});

router.patch('/:id', authenticateToken, async (req: any, res: any) => {
    const { id } = req.params;
    const updates = req.body;
    // Basic validation: ensure at least one field is being updated
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
    }

    try {
        const product = await db.get('SELECT* FROM products WHERE id = $1', [id]);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Handle Postgres lowercase
        const productSellerId = product.sellerId || product.sellerid;

        if (productSellerId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Not authorized to update this product' });
        }

        // Build dynamic update query
        const fields = [];
        const values = [];
        const allowedUpdates = ['name', 'description', 'price', 'category', 'condition', 'imageUrl', 'isSold', 'quantity', 'notes'];

        let i = 1;
        for (const [key, value] of Object.entries(updates)) {
            if (allowedUpdates.includes(key)) {
                fields.push(`${key} = $${i}`);
                i++;

                // Handle special conversions
                if (key === 'isSold') values.push(value ? 1 : 0);
                else if (key === 'price') {
                    const priceVal = parseFloat(value as string);
                    if (isNaN(priceVal) || priceVal <= 0) {
                        return res.status(400).json({ error: 'Invalid price value' });
                    }
                    values.push(priceVal);
                }
                else if (key === 'quantity') values.push(parseInt(value as string));
                else values.push(value);
            }
        }

        if (fields.length === 0) {
             return res.status(400).json({ error: 'No valid fields to update' });
        }

        values.push(id);
        await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = $${i}`, values);

        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('SERVER ERROR (PATCH /products/:id):', error);
        res.status(500).json({ error: 'Error updating product' });
    }
});

export default router;
