import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import campaignRoutes from './routes/campaigns.js';
import influencerRoutes from './routes/influencer.js';
import brandRoutes from './routes/brand.js';
import couponRoutes from './routes/coupons.js';
import paymentRoutes from './routes/payments.js';
import socialRoutes from './routes/social.js';
import stripeRoutes from './routes/stripe.js';
import paypalRoutes from './routes/paypal.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Make prisma available to routes
app.set('prisma', prisma);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/social', socialRoutes); // Social login routes
app.use('/api/campaigns', campaignRoutes);
app.use('/api/influencer', influencerRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payments/stripe', stripeRoutes); // Stripe integration
app.use('/api/payments/paypal', paypalRoutes); // PayPal integration
app.use('/api/analytics', analyticsRoutes); // Analytics

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'InfluencerMatch API running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});