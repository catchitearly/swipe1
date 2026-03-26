# InfluencerMatch - Tinder-like Influencer Marketing Platform

A marketplace connecting brands with verified influencers through a Tinder-like swipe interface. Influencers swipe right to connect with campaigns and receive unique coupon codes to promote.

## Features

- ✅ **Influencer Verification** - Bot/fake follower detection with organic score analysis
- ✅ **Tinder-like Swipe Interface** - Swipe right to connect and get assigned coupon codes
- ✅ **Coupon Management** - Each coupon linked to specific influencer, tracks usage
- ✅ **Payment Distribution** - 70% to influencer, 30% platform fee
- ✅ **Brand Portal** - Create campaigns, upload coupons, monitor performance
- ✅ **Influencer Dashboard** - View connected campaigns, assigned coupons, earnings
- ✅ **Mobile App** - React Native/Expo mobile app with swipe interface
- ✅ **Push Notifications** - Real-time notifications for new campaigns, payments, etc.
- ✅ **Analytics Dashboard** - Campaign performance, earnings tracking, top influencers
- ✅ **Payment Integrations** - Stripe & PayPal for payouts to influencers
- ✅ **Social Login** - Google, Facebook, Apple OAuth authentication

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Zustand
- **Mobile**: React Native, Expo, Expo Router
- **Backend**: Node.js, Express, Prisma (SQLite)
- **Auth**: JWT tokens, OAuth (Google, Facebook, Apple)
- **Payments**: Stripe Connect, PayPal Payouts

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/catchitearly/swipe1.git
   cd swipe1
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install

   # Install mobile app dependencies (optional)
   cd ../mobile
   npm install
   ```

3. **Set up database**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

### Running the App

1. **Start the backend** (Terminal 1 - port 3001)
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend** (Terminal 2 - port 5173)
   ```bash
   cd client
   npm run dev
   ```

3. **Start the mobile app** (Terminal 3)
   ```bash
   cd mobile
   npm install
   npx expo start
   ```

4. **Open in browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api/health

## Building Mobile Apps

### iOS
```bash
cd mobile
npm install
npx expo run:ios
```

### Android
```bash
cd mobile
npm install
npx expo run:android
```

For detailed build instructions, see [mobile/README.md](mobile/README.md)

## How It Works

### For Influencers
1. Register and connect your social media account
2. Verify your account (300+ followers required)
3. Browse campaigns in the swipe feed
4. Swipe right to connect - you'll get a unique coupon code
5. Promote via Reels, Posts, or WhatsApp
6. Earn 70% commission on every purchase made with your code

### For Brands
1. Register and create a campaign
2. Upload unique coupon codes (each can be used multiple times)
3. Influencers swipe right to connect and receive your coupons
4. Track campaign performance in your dashboard
5. Pay influencers via the platform (automatic 30% fee)

## API Endpoints

### Auth
- `POST /api/auth/register/influencer` - Register influencer
- `POST /api/auth/register/brand` - Register brand
- `POST /api/auth/login` - Login
- `POST /api/auth/social/google` - Google OAuth
- `POST /api/auth/social/facebook` - Facebook OAuth
- `POST /api/auth/social/apple` - Apple OAuth

### Campaigns
- `GET /api/campaigns/feed` - Get available campaigns
- `POST /api/campaigns/swipe` - Swipe on campaign

### Influencer
- `POST /api/influencer/verify` - Verify account
- `GET /api/influencer/campaigns` - Get connected campaigns
- `GET /api/influencer/coupons` - Get assigned coupons
- `GET /api/influencer/earnings` - Get earnings

### Brand
- `POST /api/brand/campaigns` - Create campaign
- `GET /api/brand/campaigns` - List campaigns

### Payments
- `GET /api/payments/history` - Payment history
- `POST /api/payments/stripe/connect` - Connect Stripe account
- `POST /api/payments/stripe/payout` - Create Stripe payout
- `POST /api/payments/paypal/connect` - Connect PayPal
- `POST /api/payments/paypal/payout` - Create PayPal payout

### Analytics
- `GET /api/analytics/campaign/:campaignId` - Campaign analytics
- `GET /api/analytics/brand` - Brand analytics overview

### Coupons
- `POST /api/coupons/webhook/usage` - Track coupon usage (for vendors)

## Environment Variables

Create `.env` files:

**Server (.env)**:
```env
PORT=3001
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=your-paypal-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
PAYPAL_MODE=sandbox
FRONTEND_URL=http://localhost:5173
```

## Project Structure

```
swipe1/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/         # Landing, Login, Register, Dashboards
│   │   ├── stores/        # Zustand state management
│   │   └── utils/         # API client
│   └── package.json
├── mobile/                 # React Native/Expo mobile app
│   ├── app/               # Expo Router screens
│   │   ├── (tabs)/        # Tab navigation
│   │   └── auth/         # Auth screens
│   ├── src/
│   │   ├── components/
│   │   ├── stores/       # Zustand stores
│   │   ├── services/     # Notifications, etc.
│   │   └── utils/        # API, colors
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   │   ├── auth.js
│   │   │   ├── social.js  # OAuth (Google, FB, Apple)
│   │   │   ├── campaigns.js
│   │   │   ├── influencer.js
│   │   │   ├── brand.js
│   │   │   ├── coupons.js
│   │   │   ├── payments.js
│   │   │   ├── stripe.js   # Stripe Connect
│   │   │   ├── paypal.js  # PayPal Payouts
│   │   │   └── analytics.js
│   │   ├── middleware/   # Auth middleware
│   │   └── index.js      # Server entry
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
├── SPEC.md                # Detailed specification
└── .gitignore
```

## License

MIT