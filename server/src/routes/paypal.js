import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'your-paypal-client-id';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'your-paypal-secret';
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

// Get PayPal access token
async function getPayPalToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_MODE === 'sandbox' ? 'https://api.sandbox.paypal.com' : 'https://api.paypal.com'}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

// Connect PayPal account (store PayPal email)
router.post('/paypal/connect', async (req, res) => {
  try {
    const { userId, paypalEmail } = req.body;
    
    // Validate email format
    if (!paypalEmail.includes('@')) {
      return res.status(400).json({ error: 'Invalid PayPal email' });
    }

    // Update user with PayPal email
    const user = await prisma.user.update({
      where: { id: userId },
      data: { paypalEmail },
    });

    res.json({
      success: true,
      message: 'PayPal account connected',
      paypalEmail: user.paypalEmail,
    });
  } catch (error) {
    res.status(500).json({ error: 'PayPal connection failed', details: error.message });
  }
});

// Get PayPal connection status
router.get('/paypal/status/:userId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
    });

    res.json({
      connected: !!user?.paypalEmail,
      email: user?.paypalEmail,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get PayPal status' });
  }
});

// Create PayPal payout
router.post('/paypal/payout', async (req, res) => {
  try {
    const { userId, amount, currency = 'USD' } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.paypalEmail) {
      return res.status(400).json({ error: 'No PayPal account connected' });
    }

    const accessToken = await getPayPalToken();

    // Create payout
    const payout = {
      sender_batch_header: {
        sender_batch_id: `payout_${Date.now()}_${userId}`,
        email_subject: 'InfluencerMatch Earnings',
        email_message: 'You have received a payout from InfluencerMatch!',
      },
      items: [{
        recipient_type: 'EMAIL',
        amount: {
          value: amount.toFixed(2),
          currency: currency,
        },
        receiver: user.paypalEmail,
        note: 'InfluencerMatch influencer earnings',
      }],
    };

    const response = await fetch(`${PAYPAL_MODE === 'sandbox' ? 'https://api.sandbox.paypal.com' : 'https://api.paypal.com'}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payout),
    });

    const payoutResult = await response.json();

    if (payoutResult.error) {
      throw new Error(payoutResult.error_description || 'PayPal payout failed');
    }

    // Record in database
    await prisma.payment.create({
      data: {
        influencerId: userId,
        amount: amount,
        platformFee: 0,
        netAmount: amount,
        status: 'completed',
        method: 'paypal',
        paypalPayoutId: payoutResult.batch_header?.payout_batch_id,
      },
    });

    res.json({
      success: true,
      payoutId: payoutResult.batch_header?.payout_batch_id,
      amount,
    });
  } catch (error) {
    res.status(500).json({ error: 'PayPal payout failed', details: error.message });
  }
});

// Webhook for PayPal events
router.post('/paypal/webhook', async (req, res) => {
  try {
    const event = req.body;
    
    switch (event.event_type) {
      case 'PAYMENT.SAPMENT.BLOCKED':
      case 'PAYMENT.SAPMENT.DENIED':
      case 'PAYMENT.SAPMENT.FAILED':
        console.log('PayPal payment failed:', event.resource?.batch_header?.payout_batch_id);
        break;
      case 'PAYMENT.SAPMENT.SUCCESS':
        console.log('PayPal payout success:', event.resource?.batch_header?.payout_batch_id);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;