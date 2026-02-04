import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import aiRoutes from './routes/ai';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'https://goingmarry.rowimaytamayo.com',
  'https://the-goingmarry.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      /\.vercel\.app$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
app.use('/ai', aiRoutes);

export default app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!process.env.JWT_SECRET) {
        console.warn('WARNING: JWT_SECRET is not set. Using default "secret". This is insecure for production.');
    }
  });
}