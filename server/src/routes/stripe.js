import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Stripe (use test key for development)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

// Create Stripe connected account for influencer
router.post('/stripe/connect', async (req, res) => {
  try {
    const { userId, email } = req.body;
    
    // Create a Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        transfers: { requested: true },
      },
    });

    // Save account ID to user
    await prisma.user.update({
      where: { id: userId },
      data: { stripeAccountId: account.id },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/payments/reauth`,
      return_url: `${process.env.FRONTEND_URL}/payments/connected`,
      type: 'account_onboarding',
    });

    res.json({
      success: true,
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    res.status(500).json({ error: 'Stripe connect failed', details: error.message });
  }
});

// Get Stripe account status
router.get('/stripe/status/:userId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
    });

    if (!user?.stripeAccountId) {
      return res.json({ connected: false });
    }

    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    res.json({
      connected: true,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get Stripe status' });
  }
});

// Create payout to influencer
router.post('/stripe/payout', async (req, res) => {
  try {
    const { userId, amount } = req.body; // amount in cents
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.stripeAccountId) {
      return res.status(400).json({ error: 'No Stripe account connected' });
    }

    // Check if transfers are enabled
    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    if (!account.charges_enabled) {
      return res.status(400).json({ error: 'Account not ready for transfers' });
    }

    // Create transfer
    const transfer = await stripe.transfers.create({
      amount,
      currency: 'usd',
      destination: user.stripeAccountId,
      description: 'InfluencerMatch earnings payout',
    });

    // Record in database
    await prisma.payment.create({
      data: {
        influencerId: userId,
        amount: amount / 100,
        platformFee: 0,
        netAmount: amount / 100,
        status: 'completed',
        method: 'stripe',
        stripeTransferId: transfer.id,
      },
    });

    res.json({
      success: true,
      transferId: transfer.id,
      amount: amount / 100,
    });
  } catch (error) {
    res.status(500).json({ error: 'Payout failed', details: error.message });
  }
});

// Webhook for Stripe events
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
    );

    switch (event.type) {
      case 'account.updated':
        // Handle connected account updates
        console.log('Stripe account updated:', event.data.object.id);
        break;
      case 'transfer.created':
        console.log('Transfer created:', event.data.object.id);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;