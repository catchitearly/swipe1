import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import './SwipeCard.css';

const campaignData = [
  {
    id: '1',
    brand: 'Fashion Nova',
    logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
    title: 'Summer Collection',
    description: 'Get exclusive 25% off on all summer items! Perfect for your summer look. Share with your followers and earn 70% commission on every sale.',
    commission: '70%',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a5b83147?w=400&h=500&fit=crop',
  },
  {
    id: '2',
    brand: 'TechGear Pro',
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=200&fit=crop',
    title: 'Holiday Tech Sale',
    description: 'Latest gadgets at unbeatable prices. Earn 65% commission on every purchase made with your unique code.',
    commission: '65%',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=500&fit=crop',
  },
  {
    id: '3',
    brand: 'Beauty Bliss',
    logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop',
    title: 'Skincare Essentials',
    description: 'Premium skincare products your followers will love. 75% commission + free products for testing.',
    commission: '75%',
    category: 'Beauty',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=500&fit=crop',
  },
];

function SwipeCard({ campaign, onSwipe, isTop }) {
  const { theme } = useTheme();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  
  const cardRef = useRef(null);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right', campaign);
    } else if (info.offset.x < -threshold) {
      onSwipe('left', campaign);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="swipe-card"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? 1 : 0.8,
        scale: isTop ? 1 : 0.95,
        zIndex: isTop ? 10 : 5,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={isTop ? handleDragEnd : undefined}
      whileTap={isTop ? { cursor: 'grabbing' } : {}}
    >
      <div className="swipe-card-image">
        <img src={campaign.image} alt={campaign.title} />
        <div className="swipe-card-overlay" />
        
        {/* Brand Badge */}
        <div className="swipe-card-brand">
          <div className="brand-logo">
            <img src={campaign.logo} alt={campaign.brand} />
          </div>
          <div className="brand-info">
            <span className="brand-name">{campaign.brand}</span>
            <span className="brand-category">{campaign.category}</span>
          </div>
        </div>

        {/* Commission Badge */}
        <div className="commission-badge">
          <span className="commission-value">{campaign.commission}</span>
          <span className="commission-label">Commission</span>
        </div>
      </div>

      <div className="swipe-card-content">
        <h3 className="campaign-title">{campaign.title}</h3>
        <p className="campaign-description">{campaign.description}</p>
        
        <div className="swipe-card-stats">
          <div className="stat-item">
            <span className="stat-icon">🎁</span>
            <span className="stat-text">Unique Code</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">💰</span>
            <span className="stat-text">High Earnings</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📱</span>
            <span className="stat-text">Easy Share</span>
          </div>
        </div>
      </div>

      {/* Swipe Indicators */}
      <div className="swipe-indicators">
        <div className="indicator nope">
          <span>NOPE</span>
        </div>
        <div className="indicator like">
          <span>LIKE</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function SwipeCardStack() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [cards, setCards] = useState(campaignData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);

  const handleSwipe = (direction, campaign) => {
    if (direction === 'right') {
      setMatches([...matches, campaign]);
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const handleSwipeButton = (direction) => {
    if (currentIndex >= cards.length) return;
    handleSwipe(direction, cards[currentIndex]);
  };

  return (
    <div className="swipe-container" style={{ background: theme.backgroundGradient }}>
      {/* Header */}
      <header className="swipe-header">
        <div className="header-left">
          <h1 className="app-title">Discover</h1>
          <span className="app-subtitle">Find your next campaign</span>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDark ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Card Stack */}
      <div className="card-stack">
        <AnimatePresence>
          {cards.slice(currentIndex, currentIndex + 3).map((campaign, index) => (
            <SwipeCard
              key={campaign.id}
              campaign={campaign}
              onSwipe={handleSwipe}
              isTop={index === 0}
            />
          )).reverse()}
        </AnimatePresence>
      </div>

      {/* Swipe Buttons */}
      <div className="swipe-buttons">
        <button 
          className="swipe-btn nope-btn"
          onClick={() => handleSwipeButton('left')}
        >
          <span className="btn-icon">✕</span>
        </button>
        <button 
          className="swipe-btn super-btn"
          onClick={() => handleSwipeButton('super')}
        >
          <span className="btn-icon">★</span>
        </button>
        <button 
          className="swipe-btn like-btn"
          onClick={() => handleSwipeButton('right')}
        >
          <span className="btn-icon">♥</span>
        </button>
      </div>

      {/* Match Banner */}
      <AnimatePresence>
        {matches.length > 0 && (
          <motion.div 
            className="match-banner"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            🎉 {matches.length} new match{matches.length > 1 ? 'es' : ''}!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}