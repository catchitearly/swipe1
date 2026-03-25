import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useCampaignStore, useInfluencerStore } from '../stores';

export default function InfluencerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { campaigns, fetchFeed, swipe, isLoading: campaignsLoading } = useCampaignStore();
  const { profile, fetchProfile, verify, connectedCampaigns, fetchConnectedCampaigns, assignedCoupons, fetchCoupons, earnings, fetchEarnings } = useInfluencerStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('swipe');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationForm, setVerificationForm] = useState({ platform: 'instagram', username: '', followerCount: 300 });
  const [swipeResult, setSwipeResult] = useState(null);

  useEffect(() => {
    if (user?.role === 'brand') {
      navigate('/dashboard');
      return;
    }
    fetchProfile();
    fetchFeed();
    fetchConnectedCampaigns();
    fetchCoupons();
    fetchEarnings();
  }, []);

  const handleSwipe = async (direction) => {
    if (currentIndex >= campaigns.length) return;
    
    const campaign = campaigns[currentIndex];
    try {
      const result = await swipe(campaign.id, direction);
      setSwipeResult(result);
      setTimeout(() => setSwipeResult(null), 2000);
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Swipe error:', error);
    }
  };

  const handleVerification = async () => {
    try {
      const result = await verify(verificationForm.platform, verificationForm.username, verificationForm.followerCount);
      setShowVerification(false);
      fetchProfile();
      alert(result.message);
    } catch (error) {
      alert(error.response?.data?.error || 'Verification failed');
    }
  };

  const renderSwipeCard = () => {
    if (campaignsLoading) {
      return (
        <div className="swipe-card flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading campaigns...</p>
          </div>
        </div>
      );
    }

    if (currentIndex >= campaigns.length) {
      return (
        <div className="swipe-card flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">All Done!</h3>
            <p className="text-text-secondary">You've seen all available campaigns.</p>
            <button 
              onClick={() => { setCurrentIndex(0); fetchFeed(); }}
              className="btn-primary mt-4"
            >
              Load More
            </button>
          </div>
        </div>
      );
    }

    const campaign = campaigns[currentIndex];

    return (
      <motion.div
        key={campaign.id}
        initial={{ x: 0, rotate: 0 }}
        animate={{ x: 0 }}
        exit={{ x: -500, opacity: 0 }}
        className="swipe-card relative"
      >
        {/* Campaign Image */}
        <div className="swipe-card-image bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
          {campaign.imageUrl ? (
            <img src={campaign.imageUrl} alt={campaign.title} className="swipe-card-image" />
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold">{campaign.brandName?.charAt(0) || 'B'}</span>
              </div>
              <p className="text-2xl font-bold">{campaign.brandName}</p>
            </div>
          )}
        </div>

        {/* Campaign Details */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
              {campaign.category}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2">{campaign.title}</h3>
          <p className="text-text-secondary text-sm mb-4 line-clamp-2">{campaign.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-background rounded-lg p-3">
              <p className="text-text-muted">Coupons Left</p>
              <p className="text-xl font-bold text-success">{campaign.availableCoupons}</p>
            </div>
            <div className="bg-background rounded-lg p-3">
              <p className="text-text-muted">Commission</p>
              <p className="text-xl font-bold text-accent">{campaign.commissionRate}%</p>
            </div>
          </div>
        </div>

        {/* Swipe Result Overlay */}
        <AnimatePresence>
          {swipeResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 flex items-center justify-center ${
                swipeResult.direction === 'right' 
                  ? 'bg-success/30' 
                  : 'bg-error/30'
              }`}
            >
              <div className="text-center">
                {swipeResult.direction === 'right' ? (
                  <>
                    <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold">Connected!</h3>
                    <p className="text-white/80">{swipeResult.couponCode}</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-error rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold">Passed</h3>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold">InfluencerMatch</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Verification Status */}
            {profile?.isVerified ? (
              <span className="verified-badge">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            ) : (
              <button 
                onClick={() => setShowVerification(true)}
                className="pending-badge cursor-pointer hover:bg-accent/30"
              >
                Verify Account
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">{user?.name?.charAt(0)}</span>
              </div>
              <button 
                onClick={logout}
                className="text-text-secondary hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {['swipe', 'campaigns', 'coupons', 'earnings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium capitalize transition-colors ${
                  activeTab === tab 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {tab === 'swipe' ? 'Discover' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'swipe' && (
          <div className="flex flex-col items-center">
            {!profile?.isVerified ? (
              <div className="card text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Verify Your Account</h3>
                <p className="text-text-secondary mb-4">
                  You need to verify your social media account before you can participate in campaigns.
                </p>
                <button onClick={() => setShowVerification(true)} className="btn-primary">
                  Verify Now
                </button>
              </div>
            ) : (
              <>
                {renderSwipeCard()}
                
                {/* Swipe Buttons */}
                <div className="flex gap-8 mt-8">
                  <button
                    onClick={() => handleSwipe('left')}
                    disabled={currentIndex >= campaigns.length}
                    className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center hover:bg-error/30 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleSwipe('right')}
                    disabled={currentIndex >= campaigns.length}
                    className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center hover:bg-success/30 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
                <p className="text-text-muted mt-4 text-sm">Swipe right to connect • Swipe left to pass</p>
              </>
            )}
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Connected Campaigns</h2>
            {connectedCampaigns.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-text-secondary">No campaigns connected yet. Start swiping!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectedCampaigns.map(swipe => (
                  <div key={swipe.id} className="card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        <span className="font-bold">{swipe.campaign.brand.name?.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{swipe.campaign.title}</h4>
                        <p className="text-sm text-text-secondary">{swipe.campaign.brand.name}</p>
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-3 mb-3">
                      <p className="text-xs text-text-muted mb-1">Your Coupon Code</p>
                      <p className="text-xl font-bold text-accent">{swipe.coupon?.code}</p>
                    </div>
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Uses: {swipe.coupon?.currentUses}/{swipe.coupon?.maxUses}</span>
                      <span>{swipe.campaign.commissionRate}% commission</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'coupons' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Coupons</h2>
            {assignedCoupons.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-text-secondary">No coupons assigned yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedCoupons.map(coupon => (
                  <div key={coupon.id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">{coupon.campaign.title}</h4>
                        <p className="text-sm text-text-secondary">{coupon.campaign.brand.name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        coupon.status === 'assigned' ? 'bg-success/20 text-success' :
                        coupon.status === 'used' ? 'bg-accent/20 text-accent' :
                        'bg-error/20 text-error'
                      }`}>
                        {coupon.status}
                      </span>
                    </div>
                    <div className="bg-background rounded-lg p-4 mb-4 text-center">
                      <p className="text-2xl font-bold text-accent tracking-wider">{coupon.code}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Used: {coupon.currentUses}/{coupon.maxUses}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(coupon.code)}
                        className="text-primary hover:underline"
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'earnings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Earnings</h2>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">Total Earned</p>
                <p className="text-3xl font-bold text-accent">${earnings?.totalEarned || 0}</p>
              </div>
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">Platform Fee (30%)</p>
                <p className="text-3xl font-bold text-error">${earnings?.totalPlatformFee || 0}</p>
              </div>
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">Net Earnings</p>
                <p className="text-3xl font-bold text-success">${earnings?.totalNet || 0}</p>
              </div>
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">Available</p>
                <p className="text-3xl font-bold">${earnings?.available || 0}</p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
            {earnings?.transactions?.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-text-secondary">No transactions yet.</p>
              </div>
            ) : (
              <div className="card">
                {earnings?.transactions?.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="font-medium">${tx.amount.toFixed(2)}</p>
                      <p className="text-sm text-text-secondary">{tx.campaignId ? 'Campaign sale' : 'Other'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Net: ${tx.netAmount.toFixed(2)}</p>
                      <span className={`text-xs ${
                        tx.status === 'paid' ? 'text-success' : 'text-accent'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Verify Your Account</h3>
            <p className="text-text-secondary mb-6">
              Connect your social media account to verify your followers are real and organic.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Platform</label>
                <select 
                  value={verificationForm.platform}
                  onChange={(e) => setVerificationForm({...verificationForm, platform: e.target.value})}
                  className="input"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={verificationForm.username}
                  onChange={(e) => setVerificationForm({...verificationForm, username: e.target.value})}
                  className="input"
                  placeholder="@username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Follower Count</label>
                <input
                  type="number"
                  value={verificationForm.followerCount}
                  onChange={(e) => setVerificationForm({...verificationForm, followerCount: parseInt(e.target.value)})}
                  className="input"
                  min="0"
                />
                <p className="text-xs text-text-muted mt-1">Minimum 300 followers required</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowVerification(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleVerification}
                className="flex-1 btn-primary"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}