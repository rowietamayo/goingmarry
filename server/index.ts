import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import { initDb } from './db';

// Initialize DB
(async () => {
    await initDb();
})();

import adminRoutes from './routes/admin';

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/add/products', productRoutes);
app.use('/admin', adminRoutes);

export default app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!process.env.JWT_SECRET) {
        console.warn('WARNING: JWT_SECRET is not set. Using default "secret". This is insecure for production.');
    }
  });
}