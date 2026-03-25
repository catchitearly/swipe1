import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get payment history
router.get('/', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const userId = req.user.id;

  try {
    const payments = await prisma.payment.findMany({
      where: { influencerId: userId },
      include: {
        campaign: { select: { title: true } },
        coupon: { select: { code: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request withdrawal
router.post('/withdraw', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const userId = req.user.id;
  const { amount, paymentMethod, accountDetails } = req.body;

  try {
    // Get available balance
    const availablePayments = await prisma.payment.findMany({
      where: {
        influencerId: userId,
        status: 'paid'
      }
    });

    const available = availablePayments.reduce((sum, p) => sum + p.netAmount, 0);

    if (amount > available) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // In production, this would initiate actual payment
    // For demo, just update status
    res.json({
      success: true,
      message: `Withdrawal of $${amount} initiated via ${paymentMethod}`,
      status: 'processing'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;