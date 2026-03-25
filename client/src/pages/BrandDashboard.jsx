import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useBrandStore } from '../stores';

export default function BrandDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { profile, fetchProfile, campaigns, fetchCampaigns, createCampaign, fetchCampaignDetails } = useBrandStore();
  
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'lifestyle',
    couponCodes: '',
    maxUsesPerCoupon: 50,
    commissionRate: 70,
    startDate: '',
    endDate: ''
  });
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    if (user?.role !== 'brand') {
      navigate('/dashboard');
      return;
    }
    fetchProfile();
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    const codes = createForm.couponCodes.split('\n').map(c => c.trim()).filter(c => c);
    
    try {
      await createCampaign({
        ...createForm,
        couponCodes: codes,
        startDate: createForm.startDate || new Date().toISOString(),
        endDate: createForm.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      setShowCreate(false);
      setCreateForm({
        title: '',
        description: '',
        category: 'lifestyle',
        couponCodes: '',
        maxUsesPerCoupon: 50,
        commissionRate: 70,
        startDate: '',
        endDate: ''
      });
      fetchCampaigns();
      alert('Campaign created successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create campaign');
    }
  };

  const handleViewCampaign = async (id) => {
    const data = await fetchCampaignDetails(id);
    setSelectedCampaign(data);
  };

  const categories = ['lifestyle', 'fashion', 'beauty', 'fitness', 'food', 'travel', 'tech', 'gaming'];

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
            <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">Brand</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              + New Campaign
            </button>
            <button onClick={logout} className="text-text-secondary hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {['campaigns', 'analytics', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium capitalize transition-colors ${
                  activeTab === tab 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'campaigns' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Campaigns</h2>
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                + Create Campaign
              </button>
            </div>
            
            {campaigns.length === 0 ? (
              <div className="card text-center py-16">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
                <p className="text-text-secondary mb-6">Create your first campaign to start working with influencers.</p>
                <button onClick={() => setShowCreate(true)} className="btn-primary">
                  Create Campaign
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="card hover:border-primary/30 transition-colors cursor-pointer" onClick={() => handleViewCampaign(campaign.id)}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{campaign.title}</h4>
                        <p className="text-sm text-text-secondary">{campaign.category}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        campaign.status === 'active' ? 'bg-success/20 text-success' :
                        campaign.status === 'paused' ? 'bg-accent/20 text-accent' :
                        'bg-text-muted/20 text-text-muted'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-background rounded-lg p-3">
                        <p className="text-xs text-text-muted">Coupons</p>
                        <p className="text-lg font-bold">{campaign.couponUsed}/{campaign.couponTotal}</p>
                      </div>
                      <div className="bg-background rounded-lg p-3">
                        <p className="text-xs text-text-muted">Influencers</p>
                        <p className="text-lg font-bold">{campaign.influencerCount || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>{campaign.commissionRate}% commission</span>
                      <span>{campaign.rightSwipes || 0} swipes</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Analytics</h2>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">Total Campaigns</p>
                <p className="text-3xl font-bold">{campaigns.length}</p>
              </div>
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">Active Campaigns</p>
                <p className="text-3xl font-bold text-success">{campaigns.filter(c => c.status === 'active').length}</p>
              </div>
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">Total Influencers</p>
                <p className="text-3xl font-bold">
                  {campaigns.reduce((sum, c) => sum + (c.influencerCount || 0), 0)}
                </p>
              </div>
              <div className="card">
                <p className="text-text-secondary text-sm mb-1">Total Coupon Uses</p>
                <p className="text-3xl font-bold text-accent">
                  {campaigns.reduce((sum, c) => sum + c.totalCouponUses, 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Brand Settings</h2>
            <div className="card max-w-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Brand Name</label>
                  <input 
                    type="text" 
                    value={profile?.name || ''} 
                    className="input"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    value={profile?.email || ''} 
                    className="input"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea 
                    value={profile?.description || ''} 
                    className="input min-h-[100px]"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create Campaign</h3>
              <button onClick={() => setShowCreate(false)} className="text-text-secondary hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Title</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                  className="input"
                  placeholder="Summer Sale Campaign"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  className="input min-h-[80px]"
                  placeholder="Describe your campaign..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                  className="input"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Coupon Codes (one per line)</label>
                <textarea
                  value={createForm.couponCodes}
                  onChange={(e) => setCreateForm({...createForm, couponCodes: e.target.value})}
                  className="input min-h-[120px]"
                  placeholder="SUMMER10&#10;SUMMER20&#10;SUMMER30&#10;..."
                  required
                />
                <p className="text-xs text-text-muted mt-1">Each code will be assigned to one influencer</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Max Uses per Coupon</label>
                  <input
                    type="number"
                    value={createForm.maxUsesPerCoupon}
                    onChange={(e) => setCreateForm({...createForm, maxUsesPerCoupon: parseInt(e.target.value)})}
                    className="input"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                  <input
                    type="number"
                    value={createForm.commissionRate}
                    onChange={(e) => setCreateForm({...createForm, commissionRate: parseInt(e.target.value)})}
                    className="input"
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedCampaign.campaign.title}</h3>
              <button onClick={() => setSelectedCampaign(null)} className="text-text-secondary hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold">{selectedCampaign.stats.totalCoupons}</p>
                <p className="text-xs text-text-muted">Total</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">{selectedCampaign.stats.assigned}</p>
                <p className="text-xs text-text-muted">Assigned</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-accent">{selectedCampaign.stats.used}</p>
                <p className="text-xs text-text-muted">Used</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-success">{selectedCampaign.stats.influencerCount}</p>
                <p className="text-xs text-text-muted">Influencers</p>
              </div>
            </div>

            <h4 className="font-semibold mb-3">Connected Influencers</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {selectedCampaign.swipes.filter(s => s.direction === 'right').map(swipe => (
                <div key={swipe.id} className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <div>
                    <p className="font-medium">{swipe.influencer.name}</p>
                    <p className="text-sm text-text-secondary">{swipe.influencer.followerCount} followers</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-accent">{swipe.coupon?.code}</p>
                    <p className="text-xs text-text-muted">{swipe.coupon?.currentUses}/{swipe.coupon?.maxUses} uses</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}