# InfluencerMatch - Influencer Marketing Platform

## 1. Project Overview

**Project Name:** InfluencerMatch  
**Type:** Web Application (React + Node.js)  
**Core Functionality:** A Tinder-like marketplace connecting brands with verified influencers. Brands provide unique coupon codes for campaigns, and influencers swipe right to connect and receive exclusive coupon codes linked to their profile.  
**Target Users:** 
- Brands/Vendors wanting to run influencer marketing campaigns
- Influencers with 300+ followers wanting to participate in paid campaigns

---

## 2. UI/UX Specification

### Layout Structure

#### Pages:
1. **Landing Page** - Marketing page for the platform
2. **Influencer Dashboard** - Main app for influencers (swipe, view codes, earnings)
3. **Brand Portal** - For brands to create and manage campaigns
4. **Admin Panel** - Platform management

#### Responsive Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Visual Design

#### Color Palette:
- **Primary:** #FF4B6E (Coral Pink - main brand color)
- **Secondary:** #1A1A2E (Dark Navy - backgrounds)
- **Accent:** #FFD93D (Golden Yellow - highlights, earnings)
- **Success:** #6BCB77 (Green - verified, success states)
- **Error:** #FF6B6B (Red - errors, left swipe)
- **Background:** #0F0F1A (Deep dark)
- **Card Background:** #1E1E32 (Dark card)
- **Text Primary:** #FFFFFF
- **Text Secondary:** #A0A0B0
- **Text Muted:** #6B6B7B

#### Typography:
- **Primary Font:** "Outfit" (Google Fonts) - modern, clean
- **Heading Sizes:** 
  - H1: 48px, weight 700
  - H2: 36px, weight 600
  - H3: 24px, weight 600
  - H4: 18px, weight 500
- **Body:** 16px, weight 400
- **Small:** 14px, weight 400

#### Spacing System:
- Base unit: 8px
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, xxl: 48px

#### Visual Effects:
- **Cards:** 12px border-radius, subtle glow on hover
- **Buttons:** 8px border-radius, scale(1.02) on hover
- **Shadows:** 0 8px 32px rgba(255, 75, 110, 0.15)
- **Animations:** Smooth 0.3s ease transitions, swipe animations
- **Glassmorphism:** backdrop-filter: blur(10px) for overlays

### Components

#### 1. SwipeCard Component
- Card dimensions: 320px x 480px (mobile-first)
- Brand logo, campaign image, details
- Swipe left (reject) / Swipe right (accept) with animation
- Visual feedback on swipe direction

#### 2. CampaignCard Component
- Brand name, campaign title
- Coupon count available
- Commission percentage
- Category tags
- States: available, full, ended

#### 3. CouponCodeCard Component
- Coupon code display (large, copyable)
- Brand name, campaign details
- Usage count / max uses
- Linked to influencer indicator
- Copy button with confirmation

#### 4. EarningsWidget Component
- Total earnings display
- Pending vs Available balance
- Commission breakdown (30% platform)
- Withdraw button
- Graph/chart of earnings over time

#### 5. VerificationBadge Component
- Verified status indicator
- Follower count
- Platform (Instagram, TikTok, etc.)
- Organic vs Bot percentage

#### 6. BrandCampaignForm Component
- Brand name, logo upload
- Campaign details
- Coupon code upload (CSV/text)
- Campaign duration
- Category selection
- Budget allocation

---

## 3. Functionality Specification

### Core Features

#### A. Influencer Verification System
1. **Social Media Connection:**
   - Connect Instagram, TikTok, YouTube, Twitter accounts
   - OAuth flow for secure API access

2. **Bot/Fake Follower Detection:**
   - Analyze engagement rate (likes/comments vs followers)
   - Check follower growth patterns
   - Detect suspicious activity patterns
   - Use third-party APIs: HypeAuditor, Social Blade, or custom algorithm
   
3. **Verification Criteria:**
   - Minimum 300 followers required
   - Engagement rate > 1% (for accounts with 1000+ followers)
   - < 30% fake/bot followers
   - Account age > 30 days
   - Verified = display checkmark badge

4. **Verification Status:**
   - Pending (initial review)
   - Verified (approved)
   - Rejected (needs improvement)
   - Suspended (previously verified, now flagged)

#### B. Campaign Discovery (Tinder-like Swipe)
1. **Campaign Feed:**
   - Show available campaigns matching influencer's niche
   - Each card shows: brand, campaign, coupon availability, commission

2. **Swipe Mechanics:**
   - **Left Swipe:** Skip/Pass on campaign
   - **Right Swipe:** Connect/Accept campaign
   - **Right Swipe = Coupon Assignment:** Auto-link next available coupon to influencer
   - Each unique campaign can only be swiped once

3. **Matching Logic:**
   - Campaign category matches influencer's verified platforms
   - Only show campaigns with available coupons
   - Prioritize campaigns with higher commissions

4. **Campaign States:**
   - Active (accepting new influencers)
   - Paused (temporary hold)
   - Completed (all coupons distributed)
   - Expired (campaign duration ended)

#### C. Coupon Management System
1. **Brand Coupon Upload:**
   - Upload via CSV or paste list
   - Each code has max usage limit (e.g., 50 uses)
   - System tracks usage count

2. **Coupon Distribution:**
   - FIFO (First In First Out) assignment on right swipe
   - Each coupon linked to specific influencer
   - Track: assigned_at, used_count, status

3. **Coupon States:**
   - Available (not assigned)
   - Assigned (linked to influencer)
   - Used (partially consumed)
   - Depleted (max uses reached)
   - Expired

4. **Vendor Verification:**
   - Brands verify coupon usage on their website
   - Webhook/API for usage tracking
   - Manual verification option

#### D. Influencer Dashboard
1. **Connected Campaigns:**
   - List of all campaigns user has swiped right on
   - Each shows assigned coupon code
   - Usage statistics

2. **Earnings Dashboard:**
   - Total earned from all campaigns
   - Available balance (can withdraw)
   - Pending (pending payment from brand)
   - Commission breakdown

3. **Payment Distribution:**
   - 30% platform fee
   - 70% to influencer
   - Payment via: Bank transfer, PayPal, UPI

4. **Promotion Tools:**
   - Generate unique promo link per campaign
   - Share to: Reels, Posts, WhatsApp
   - Track clicks and conversions

#### E. Brand Portal
1. **Campaign Management:**
   - Create new campaign
   - Upload coupon codes
   - Set campaign parameters
   - Monitor performance

2. **Analytics Dashboard:**
   - Total influencers connected
   - Coupons distributed vs used
   - Conversion tracking
   - ROI metrics

3. **Payment to Influencers:**
   - Fund influencer payments
   - Track platform fees
   - Invoice generation

#### F. API/Webhook System
1. **Coupon Usage Tracking:**
   - Vendor website calls webhook on purchase
   - System updates coupon usage count
   - Triggers payment calculation

2. **Payment Processing:**
   - Real-time usage triggers payment calculation
   - 30% platform fee deduction
   - 70% added to influencer balance

### Data Models

#### User (Influencer)
```
- id, email, password_hash
- name, avatar_url
- platforms: [{platform, username, followers, verified}]
- verification_status: enum
- organic_followers_percentage
- created_at, updated_at
```

#### Campaign
```
- id, brand_id, title, description
- category, image_url
- coupon_total, coupon_used
- commission_percentage (default 70%)
- start_date, end_date
- status: enum
- created_at
```

#### Coupon
```
- id, campaign_id, code
- max_uses, current_uses
- assigned_to (influencer_id)
- assigned_at, status
```

#### CampaignSwipe
```
- id, campaign_id, influencer_id
- direction: enum (left, right)
- coupon_assigned_id
- created_at
```

#### Payment
```
- id, influencer_id, campaign_id
- amount, platform_fee, net_amount
- status: enum (pending, processing, paid)
- created_at, paid_at
```

### User Flows

#### Influencer Flow:
1. Register → Connect social accounts
2. Verification process runs → Get verified badge
3. Browse campaign feed → Swipe right on campaigns
4. Receive coupon code → Promote via social media
5. Track purchases → Earn commissions
6. Withdraw earnings

#### Brand Flow:
1. Register → Complete brand profile
2. Create campaign → Upload coupon codes
3. Campaign goes live → Influencers see and swipe
4. Monitor progress → Track conversions
5. Pay influencers → Platform handles distribution

---

## 4. Technical Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS + Custom CSS
- **Animations:** Framer Motion (swipe animations)
- **State:** Zustand (lightweight state)
- **HTTP:** Axios

### Backend
- **Framework:** Node.js + Express
- **Database:** SQLite (for demo) / PostgreSQL (production)
- **ORM:** Prisma
- **Auth:** JWT tokens
- **Validation:** Zod

### External APIs (Verification)
- Instagram Graph API
- TikTok API
- YouTube Data API
- HypeAuditor API (optional)

---

## 5. Acceptance Criteria

### Verification System
- [ ] Influencer can connect Instagram/TikTok account
- [ ] System analyzes follower quality and engagement
- [ ] Verification status clearly displayed
- [ ] 300+ followers minimum enforced

### Swipe Interface
- [ ] Cards display campaign info attractively
- [ ] Swipe left rejects campaign
- [ ] Swipe right connects and assigns coupon
- [ ] Smooth animations on swipe

### Coupon Management
- [ ] Brands can upload coupon codes
- [ ] Each code tracks usage count
- [ ] Coupons linked to specific influencers
- [ ] Maximum uses per coupon enforced

### Payment System
- [ ] 30% platform commission calculated
- [ ] 70% goes to influencer balance
- [ ] Earnings displayed in dashboard
- [ ] Withdraw functionality works

### Dashboard
- [ ] Shows all connected campaigns
- [ ] Displays assigned coupon codes
- [ ] Earnings breakdown visible
- [ ] Can copy/share promo links

---

## 6. File Structure

```
/workspace/project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── package.json
│   └── prisma/
└── README.md
```