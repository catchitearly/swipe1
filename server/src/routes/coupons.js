import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Webhook for coupon usage (called by vendor website)
router.post('/webhook/usage', async (req, res) => {
  const prisma = req.app.get('prisma');
  const { couponCode, purchaseAmount } = req.body;

  try {
    // Find coupon
    const coupon = await prisma.coupon.findFirst({
      where: { code: couponCode },
      include: {
        campaign: true,
        influencer: true
      }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    // Check if coupon can be used
    if (coupon.currentUses >= coupon.maxUses) {
      return res.status(400).json({ error: 'Coupon limit reached' });
    }

    // Update coupon usage
    const updatedCoupon = await prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        currentUses: { increment: 1 },
        status: coupon.currentUses + 1 >= coupon.maxUses ? 'depleted' : 'used'
      }
    });

    // Calculate payment if influencer is assigned
    if (coupon.assignedTo && coupon.influencer) {
      const commissionRate = coupon.campaign.commissionRate;
      const platformFee = purchaseAmount * (100 - commissionRate) / 100;
      const netAmount = purchaseAmount - platformFee;

      // Create payment record
      await prisma.payment.create({
        data: {
          influencerId: coupon.assignedTo,
          campaignId: coupon.campaignId,
          couponId: coupon.id,
          amount: purchaseAmount,
          platformFee,
          netAmount,
          status: 'pending'
        }
      });
    }

    res.json({ 
      success: true, 
      currentUses: updatedCoupon.currentUses,
      maxUses: coupon.maxUses,
      message: 'Coupon usage recorded'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual coupon usage (for testing)
router.post('/use', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const { couponId } = req.body;

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: { campaign: true }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    if (coupon.currentUses >= coupon.maxUses) {
      return res.status(400).json({ error: 'Coupon limit reached' });
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        currentUses: { increment: 1 },
        status: coupon.currentUses + 1 >= coupon.maxUses ? 'depleted' : 'used'
      }
    });

    res.json({ 
      success: true, 
      currentUses: updatedCoupon.currentUses,
      maxUses: coupon.maxUses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;