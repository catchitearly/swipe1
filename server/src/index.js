import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import campaignRoutes from './routes/campaigns.js';
import influencerRoutes from './routes/influencer.js';
import brandRoutes from './routes/brand.js';
import couponRoutes from './routes/coupons.js';
import paymentRoutes from './routes/payments.js';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Make prisma available to routes
app.set('prisma', prisma);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/influencer', influencerRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'InfluencerMatch API running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});