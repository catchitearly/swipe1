import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get brand profile
router.get('/profile', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const brandId = req.user.id;

  try {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: {
        id: true,
        email: true,
        name: true,
        logo: true,
        description: true,
        createdAt: true
      }
    });

    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update brand profile
router.put('/profile', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const brandId = req.user.id;
  const { name, logo, description } = req.body;

  try {
    const brand = await prisma.brand.update({
      where: { id: brandId },
      data: { name, logo, description }
    });

    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create campaign
router.post('/campaigns', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const brandId = req.user.id;
  const { 
    title, 
    description, 
    category, 
    imageUrl,
    couponCodes, 
    maxUsesPerCoupon,
    commissionRate,
    startDate,
    endDate 
  } = req.body;

  try {
    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        brandId,
        title,
        description,
        category,
        imageUrl,
        couponTotal: couponCodes.length,
        commissionRate: commissionRate || 70,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'active'
      }
    });

    // Create coupons
    const couponData = couponCodes.map(code => ({
      campaignId: campaign.id,
      code,
      maxUses: maxUsesPerCoupon || 50,
      status: 'available'
    }));

    await prisma.coupon.createMany({
      data: couponData
    });

    res.json({ 
      success: true, 
      campaign,
      couponCount: couponCodes.length,
      message: `Campaign created with ${couponCodes.length} coupon codes`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get brand's campaigns
router.get('/campaigns', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const brandId = req.user.id;

  try {
    const campaigns = await prisma.campaign.findMany({
      where: { brandId },
      include: {
        _count: { select: { swipes: true } },
        coupons: {
          select: {
            status: true,
            currentUses: true,
            maxUses: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats for each campaign
    const campaignsWithStats = campaigns.map(c => {
      const assignedCoupons = c.coupons.filter(coupon => coupon.status === 'assigned');
      const usedCoupons = c.coupons.filter(coupon => coupon.currentUses > 0);
      const totalUses = c.coupons.reduce((sum, c) => sum + c.currentUses, 0);
      
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        imageUrl: c.imageUrl,
        couponTotal: c.couponTotal,
        couponUsed: c.couponUsed,
        commissionRate: c.commissionRate,
        status: c.status,
        startDate: c.startDate,
        endDate: c.endDate,
        influencerCount: assignedCoupons.length,
        totalCouponUses: totalUses,
        rightSwipes: c._count.swipes
      };
    });

    res.json(campaignsWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get campaign details
router.get('/campaigns/:id', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const { id } = req.params;
  const brandId = req.user.id;

  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id, brandId },
      include: {
        coupons: {
          include: {
            influencer: { select: { name: true, email: true } }
          }
        },
        swipes: {
          include: {
            influencer: { select: { name: true, followerCount: true } }
          }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get stats
    const stats = {
      totalCoupons: campaign.coupons.length,
      assigned: campaign.coupons.filter(c => c.status === 'assigned').length,
      used: campaign.coupons.filter(c => c.currentUses > 0).length,
      totalUses: campaign.coupons.reduce((sum, c) => sum + c.currentUses, 0),
      influencerCount: campaign.swipes.filter(s => s.direction === 'right').length
    };

    res.json({ campaign, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update campaign status
router.patch('/campaigns/:id', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const { id } = req.params;
  const brandId = req.user.id;
  const { status } = req.body;

  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id, brandId }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, campaign: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;