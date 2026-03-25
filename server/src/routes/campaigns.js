import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all active campaigns for swipe feed
router.get('/feed', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const userId = req.user.id;

  try {
    // Get user's swipes to exclude already swiped campaigns
    const userSwipes = await prisma.campaignSwipe.findMany({
      where: { influencerId: userId },
      select: { campaignId: true }
    });
    
    const swipedCampaignIds = userSwipes.map(s => s.campaignId);

    // Get all active campaigns that haven't been swiped
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'active',
        id: { notIn: swipedCampaignIds }
      },
      include: {
        brand: { select: { name: true, logo: true } },
        coupons: { select: { status: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Get coupon availability for each campaign and filter
    const campaignsWithCoupons = await Promise.all(
      campaigns.map(async (campaign) => {
        const availableCoupons = campaign.coupons.filter(c => c.status === 'available').length;
        
        return {
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          category: campaign.category,
          imageUrl: campaign.imageUrl,
          brandName: campaign.brand.name,
          brandLogo: campaign.brand.logo,
          couponTotal: campaign.couponTotal,
          couponUsed: campaign.couponUsed,
          availableCoupons,
          commissionRate: campaign.commissionRate,
          endDate: campaign.endDate
        };
      })
    );

    // Filter out campaigns with 0 available coupons and limit to 20
    const filteredCampaigns = campaignsWithCoupons
      .filter(c => c.availableCoupons > 0)
      .slice(0, 20);

    res.json(filteredCampaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Swipe on a campaign
router.post('/swipe', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const userId = req.user.id;
  const { campaignId, direction } = req.body;

  try {
    // Check if already swiped
    const existingSwipe = await prisma.campaignSwipe.findFirst({
      where: {
        influencerId: userId,
        campaignId
      }
    });

    if (existingSwipe) {
      return res.status(400).json({ error: 'Already swiped on this campaign' });
    }

    // Get campaign to check availability
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    let couponAssigned = null;

    // If swiping right, assign a coupon
    if (direction === 'right') {
      const availableCoupon = await prisma.coupon.findFirst({
        where: {
          campaignId,
          status: 'available'
        }
      });

      if (!availableCoupon) {
        return res.status(400).json({ error: 'No available coupons' });
      }

      // Assign coupon to influencer
      await prisma.coupon.update({
        where: { id: availableCoupon.id },
        data: {
          assignedTo: userId,
          assignedAt: new Date(),
          status: 'assigned'
        }
      });

      // Update campaign coupon used count
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { couponUsed: { increment: 1 } }
      });

      couponAssigned = availableCoupon.code;
    }

    // Record swipe
    const swipe = await prisma.campaignSwipe.create({
      data: {
        campaignId,
        influencerId: userId,
        direction,
        couponId: couponAssigned ? (
          await prisma.coupon.findFirst({
            where: { campaignId, code: couponAssigned }
          })
        )?.id : null
      }
    });

    res.json({ 
      success: true, 
      direction,
      couponCode: couponAssigned,
      message: direction === 'right' ? 'Campaign connected! Coupon assigned.' : 'Campaign passed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get campaign details
router.get('/:id', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const { id } = req.params;

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        brand: { select: { name: true, logo: true, description: true } },
        coupons: { where: { assignedTo: req.user.id } }
      }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;