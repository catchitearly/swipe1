import { create } from 'zustand';
import { api } from '../utils/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Login failed', isLoading: false });
      throw error;
    }
  },

  registerInfluencer: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register/influencer', { name, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  registerBrand: async (name, email, password, description) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register/brand', { name, email, password, description });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
}));

export const useCampaignStore = create((set) => ({
  campaigns: [],
  currentCampaign: null,
  isLoading: false,
  error: null,

  fetchFeed: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/campaigns/feed');
      set({ campaigns: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch campaigns', isLoading: false });
      throw error;
    }
  },

  swipe: async (campaignId, direction) => {
    try {
      const { data } = await api.post('/campaigns/swipe', { campaignId, direction });
      return data;
    } catch (error) {
      throw error;
    }
  },
}));

export const useInfluencerStore = create((set, get) => ({
  profile: null,
  connectedCampaigns: [],
  assignedCoupons: [],
  earnings: null,
  isLoading: false,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/influencer/profile');
      set({ profile: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  verify: async (platform, username, followerCount) => {
    try {
      const { data } = await api.post('/influencer/verify', { platform, username, followerCount });
      const { profile } = get();
      if (profile) {
        set({ profile: { ...profile, ...data } });
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  fetchConnectedCampaigns: async () => {
    try {
      const { data } = await api.get('/influencer/campaigns');
      set({ connectedCampaigns: data });
      return data;
    } catch (error) {
      throw error;
    }
  },

  fetchCoupons: async () => {
    try {
      const { data } = await api.get('/influencer/coupons');
      set({ assignedCoupons: data });
      return data;
    } catch (error) {
      throw error;
    }
  },

  fetchEarnings: async () => {
    try {
      const { data } = await api.get('/influencer/earnings');
      set({ earnings: data });
      return data;
    } catch (error) {
      throw error;
    }
  },
}));

export const useBrandStore = create((set) => ({
  profile: null,
  campaigns: [],
  isLoading: false,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/brand/profile');
      set({ profile: data, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createCampaign: async (campaignData) => {
    try {
      const { data } = await api.post('/brand/campaigns', campaignData);
      return data;
    } catch (error) {
      throw error;
    }
  },

  fetchCampaigns: async () => {
    try {
      const { data } = await api.get('/brand/campaigns');
      set({ campaigns: data });
      return data;
    } catch (error) {
      throw error;
    }
  },

  fetchCampaignDetails: async (id) => {
    try {
      const { data } = await api.get(`/brand/campaigns/${id}`);
      return data;
    } catch (error) {
      throw error;
    }
  },
}));