# InfluencerMatch - Tinder-like Influencer Marketing Platform

A marketplace connecting brands with verified influencers through a Tinder-like swipe interface. Influencers swipe right to connect with campaigns and receive unique coupon codes to promote.

## Features

- ✅ **Influencer Verification** - Bot/fake follower detection with organic score analysis
- ✅ **Tinder-like Swipe Interface** - Swipe right to connect and get assigned coupon codes
- ✅ **Coupon Management** - Each coupon linked to specific influencer, tracks usage
- ✅ **Payment Distribution** - 70% to influencer, 30% platform fee
- ✅ **Brand Portal** - Create campaigns, upload coupons, monitor performance
- ✅ **Influencer Dashboard** - View connected campaigns, assigned coupons, earnings

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Zustand
- **Backend**: Node.js, Express, Prisma (SQLite)
- **Auth**: JWT tokens

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

   # Install server dependencies (in new terminal or separate folder)
   cd ../server
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

3. **Open in browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api/health

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

### Coupons
- `POST /api/coupons/webhook/usage` - Track coupon usage (for vendors)

## Environment Variables

Create a `.env` file in the server folder:
```env
PORT=3001
JWT_SECRET=your-secret-key
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
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth middleware
│   │   └── index.js       # Server entry
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── SPEC.md                # Detailed specification
└── .gitignore
```

## License

MIT