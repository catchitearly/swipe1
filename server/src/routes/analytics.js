import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get campaign analytics
router.get('/campaign/:campaignId', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');
  const { campaignId } = req.params;

  try {
    // Get campaign details
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { brand: true },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Verify ownership
    if (campaign.brandId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get coupons stats
    const couponStats = await prisma.coupon.groupBy({
      by: ['status'],
      where: { campaignId },
      _count: { id: true },
    });

    // Get connected influencers count
    const influencersCount = await prisma.coupon.count({
      where: { campaignId, status: { not: 'available' } },
    });

    // Get payments for this campaign
    const payments = await prisma.payment.findMany({
      where: { campaignId },
    });

    const totalSales = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPlatformFee = payments.reduce((sum, p) => sum + p.platformFee, 0);
    const totalPaidToInfluencers = payments.reduce((sum, p) => sum + p.netAmount, 0);

    // Get daily breakdown (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyPayments = await prisma.payment.findMany({
      where: {
        campaignId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Group by day
    const dailyBreakdown = {};
    dailyPayments.forEach((payment) => {
      const date = payment.createdAt.toISOString().split('T')[0];
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = 0;
      }
      dailyBreakdown[date] += payment.amount;
    });

    // Get top performing influencers
    const topInfluencers = await prisma.payment.groupBy({
      by: ['influencerId'],
      where: { campaignId },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
    });

    // Get influencer details for top performers
    const influencerIds = topInfluencers.map(i => i.influencerId);
    const influencers = await prisma.user.findMany({
      where: { id: { in: influencerIds } },
      select: { id: true, name: true, email: true },
    });

    const topInfluencersWithDetails = topInfluencers.map(i => ({
      ...i,
      ...influencers.find(inf => inf.id === i.influencerId),
    }));

    // Calculate ROI
    const roi = totalSales > 0 ? ((totalPaidToInfluencers / totalSales) * 100).toFixed(2) : 0;

    res.json({
      campaign: {
        id: campaign.id,
        title: campaign.title,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
      },
      overview: {
        totalCoupons: campaign.couponTotal,
        couponsUsed: campaign.couponUsed,
        couponsRemaining: campaign.couponTotal - campaign.couponUsed,
        influencersConnected: influencersCount,
      },
      financials: {
        totalSales,
        platformFee: totalPlatformFee,
        paidToInfluencers: totalPaidToInfluencers,
        commissionRate: campaign.commissionRate,
        roi,
      },
      couponStatus: couponStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.id;
        return acc;
      }, {}),
      dailySales: Object.entries(dailyBreakdown).map(([date, amount]) => ({
        date,
        amount,
      })),
      topInfluencers: topInfluencersWithDetails.map(i => ({
        id: i.influencerId,
        name: i.name,
        totalSales: i._sum.amount || 0,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get overall brand analytics
router.get('/brand', authMiddleware, async (req, res) => {
  const prisma = req.app.get('prisma');

  try {
    // Get all campaigns for this brand
    const campaigns = await prisma.campaign.findMany({
      where: { brandId: req.user.id },
      include: { coupons: true },
    });

    // Get all payments
    const payments = await prisma.payment.findMany({
      where: {
        campaign: { brandId: req.user.id },
      },
    });

    // Calculate totals
    const totalSales = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPlatformFee = payments.reduce((sum, p) => sum + p.platformFee, 0);
    const totalPaidToInfluencers = payments.reduce((sum, p) => sum + p.netAmount, 0);

    // Campaign performance
    const campaignPerformance = campaigns.map(c => {
      const campaignPayments = payments.filter(p => p.campaignId === c.id);
      const campaignSales = campaignPayments.reduce((sum, p) => sum + p.amount, 0);
      const connectedInfluencers = c.coupons.filter(coupon => coupon.status !== 'available').length;

      return {
        id: c.id,
        title: c.title,
        status: c.status,
        totalSales: campaignSales,
        couponsUsed: c.couponUsed,
        influencers: connectedInfluencers,
        conversionRate: c.couponTotal > 0 ? ((c.couponUsed / c.couponTotal) * 100).toFixed(2) : 0,
      };
    });

    // Monthly breakdown (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        campaign: { brandId: req.user.id },
        createdAt: { gte: sixMonthsAgo },
      },
    });

    // Group by month
    const monthlyBreakdown = {};
    monthlyData.forEach((payment) => {
      const month = payment.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyBreakdown[month]) {
        monthlyBreakdown[month] = 0;
      }
      monthlyBreakdown[month] += payment.amount;
    });

    res.json({
      overview: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalInfluencers: new Set(campaigns.flatMap(c => c.coupons.filter(coupon => coupon.status !== 'available').map(coupon => coupon.assignedTo))).size,
      },
      financials: {
        totalSales,
        platformFee: totalPlatformFee,
        paidToInfluencers: totalPaidToInfluencers,
        averageOrderValue: payments.length > 0 ? (totalSales / payments.length).toFixed(2) : 0,
      },
      monthlySales: Object.entries(monthlyBreakdown)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({ month, amount })),
      campaignPerformance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;