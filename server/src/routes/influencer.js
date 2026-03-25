import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get influencer profile
router.get('/profile', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isVerified: true,
        followerCount: true,
        organicScore: true,
        engagementRate: true,
        platformData: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update influencer profile
router.put('/profile', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const userId = req.user.id;
  const { name, avatar, platformData } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        avatar,
        platformData: platformData ? JSON.stringify(platformData) : undefined
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify influencer (simulate verification process)
router.post('/verify', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const userId = req.user.id;
  const { platform, username, followerCount } = req.body;

  try {
    // Simulate verification analysis
    // In production, this would use actual API calls
    
    // Calculate organic score based on engagement
    const baseOrganicScore = 70 + Math.random() * 25; // 70-95%
    const engagementRate = 1 + Math.random() * 8; // 1-9%
    
    // Check minimum follower requirement
    if (followerCount < 300) {
      return res.status(400).json({ 
        error: 'Minimum 300 followers required. You have ' + followerCount 
      });
    }

    // Determine verification status
    const isVerified = followerCount >= 300 && baseOrganicScore >= 70 && engagementRate >= 1;

    // Store platform data
    const platformData = {
      platform,
      username,
      followerCount,
      organicScore: Math.round(baseOrganicScore * 10) / 10,
      engagementRate: Math.round(engagementRate * 10) / 10,
      verified: isVerified,
      verifiedAt: isVerified ? new Date() : null
    };

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified,
        followerCount,
        organicScore: platformData.organicScore,
        engagementRate: platformData.engagementRate,
        platformData: JSON.stringify(platformData)
      }
    });

    res.json({
      success: true,
      isVerified,
      followerCount,
      organicScore: platformData.organicScore,
      engagementRate: platformData.engagementRate,
      message: isVerified 
        ? 'Verification successful! You can now participate in campaigns.'
        : 'Verification pending. Need improvement in engagement or follower quality.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get connected campaigns (right swipes)
router.get('/campaigns', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const userId = req.user.id;

  try {
    const swipes = await prisma.campaignSwipe.findMany({
      where: {
        influencerId: userId,
        direction: 'right'
      },
      include: {
        campaign: {
          include: {
            brand: { select: { name: true, logo: true } }
          }
        },
        coupon: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(swipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get assigned coupons
router.get('/coupons', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const userId = req.user.id;

  try {
    const coupons = await prisma.coupon.findMany({
      where: { assignedTo: userId },
      include: {
        campaign: {
          include: {
            brand: { select: { name: true } }
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get earnings
router.get('/earnings', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const userId = req.user.id;

  try {
    const payments = await prisma.payment.findMany({
      where: { influencerId: userId },
      orderBy: { createdAt: 'desc' }
    });

    const totalEarned = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPlatformFee = payments.reduce((sum, p) => sum + p.platformFee, 0);
    const totalNet = payments.reduce((sum, p) => sum + p.netAmount, 0);
    
    const pending = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.netAmount, 0);
    
    const available = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.netAmount, 0);

    res.json({
      totalEarned: Math.round(totalEarned * 100) / 100,
      totalPlatformFee: Math.round(totalPlatformFee * 100) / 100,
      totalNet: Math.round(totalNet * 100) / 100,
      pending: Math.round(pending * 100) / 100,
      available: Math.round(available * 100) / 100,
      transactions: payments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;