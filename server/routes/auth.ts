import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const VALID_MEMBERSHIP_CODE = process.env.VALID_MEMBERSHIP_CODE;

router.post('/register', async (req, res) => {
  const { name, email, boutiqueName, password, membershipCode } = req.body;

  if (membershipCode !== VALID_MEMBERSHIP_CODE) {
    return res.status(403).json({ error: 'Invalid membership code' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Math.random().toString(36).substr(2, 9);

    await db.query(
      'INSERT INTO sellers (id, name, email, boutiqueName, password) VALUES ($1, $2, $3, $4, $5)',
      [id, name, email, boutiqueName, hashedPassword]
    );

    const token = jwt.sign({ id, email, isAdmin: false }, JWT_SECRET);
    res.json({ token, seller: { id, name, email, boutiqueName, isAdmin: false } });
  } catch (error) {
    console.error('Register error', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const seller = await db.get('SELECT * FROM sellers WHERE email = $1', [email]);
    if (!seller) {
      return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, seller.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const isAdmin = !!(seller.isAdmin || seller.isadmin);
    const boutiqueName = seller.boutiqueName || seller.boutiquename;
    const token = jwt.sign({ id: seller.id, email: seller.email, isAdmin }, JWT_SECRET);
    res.json({ token, seller: { id: seller.id, name: seller.name, email: seller.email, boutiqueName, isAdmin } });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

router.patch('/profile', authenticateToken, async (req: any, res: any) => {
  const { name, boutiqueName } = req.body;
  const userId = req.user.id;

  if (!name || !boutiqueName) {
    return res.status(400).json({ error: 'Name and Boutique Name are required' });
  }

  try {
    const currentSeller = await db.get('SELECT name, boutiqueName FROM sellers WHERE id = $1', [userId]);

    // Check if user exists (though middleware ensures token validity, DB state might differ)
    if (!currentSeller) {
        return res.status(404).json({ error: 'User not found' });
    }

    const currentName = currentSeller.name;
    const currentBoutiqueName = currentSeller.boutiqueName || currentSeller.boutiquename;

    if (currentName === name && currentBoutiqueName === boutiqueName) {
      return res.status(400).json({ error: 'No changes detected to save.' });
    }

    await db.query(
      'UPDATE sellers SET name = $1, boutiqueName = $2 WHERE id = $3',
      [name, boutiqueName, userId]
    );

    // Cascade update: Update all products' seller field if boutiqueName changed
    if (currentBoutiqueName !== boutiqueName) {
      await db.query(
        'UPDATE products SET seller = $1 WHERE sellerId = $2',
        [boutiqueName, userId]
      );
    }

    const updatedSeller = await db.get('SELECT id, name, email, boutiqueName, isAdmin FROM sellers WHERE id = $1', [userId]);
    const finalBoutiqueName = updatedSeller.boutiqueName || updatedSeller.boutiquename;
    const finalIsAdmin = !!(updatedSeller.isAdmin || updatedSeller.isadmin);
    res.json({ message: 'Profile updated successfully', seller: { ...updatedSeller, boutiqueName: finalBoutiqueName, isAdmin: finalIsAdmin } });
  } catch (error) {
    console.error('Profile update error', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

router.delete('/profile', authenticateToken, async (req: any, res: any) => {
  const userId = req.user.id;

  try {
    // Check if user exists first to return correct error message as requested
    const seller = await db.get('SELECT id FROM sellers WHERE id = $1', [userId]);
    if (!seller) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Also delete their products
    await db.query('DELETE FROM products WHERE sellerId = $1', [userId]);
    await db.query('DELETE FROM sellers WHERE id = $1', [userId]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Profile delete error', error);
    res.status(500).json({ error: 'Error deleting account' });
  }
});

router.patch('/change-password', authenticateToken, async (req: any, res: any) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required' });
  }

  try {
    const seller = await db.get('SELECT * FROM sellers WHERE id = $1', [userId]);
    if (!seller) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, seller.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE sellers SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error', error);
    res.status(500).json({ error: 'Error updating password' });
  }
});

export default router;
