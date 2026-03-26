import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Landing() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <div style={{ 
      background: theme.backgroundGradient, 
      minHeight: '100vh',
      color: theme.text
    }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: theme.card + '80',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: theme.primary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
            }}>
              IM
            </div>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>InfluencerMatch</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <Link to="/login" style={{ 
              color: theme.textSecondary, 
              textDecoration: 'none',
              fontWeight: '500',
            }}>
              Login
            </Link>
            <Link to="/register" style={{
              background: theme.primaryGradient,
              color: 'white',
              padding: '10px 20px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '600',
            }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '128px 24px 80px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
            fontWeight: '700',
            marginBottom: '24px',
            lineHeight: 1.1,
          }}>
            Connect Brands with <span style={{ color: theme.primary }}>Verified Influencers</span>
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: theme.textSecondary,
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}>
            A Tinder-like marketplace where influencers swipe to connect with brands and promote campaigns using unique coupon codes. Get paid for every purchase!
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              background: theme.primaryGradient,
              color: 'white',
              padding: '16px 32px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '18px',
            }}>
              Join as Influencer
            </Link>
            <Link to="/register" style={{
              background: theme.card,
              color: theme.text,
              padding: '16px 32px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '18px',
              border: `1px solid ${theme.border}`,
            }}>
              Partner as Brand
            </Link>
          </div>
          
          {/* Demo Link */}
          <div style={{ marginTop: '40px' }}>
            <Link to="/discover" style={{
              color: theme.primary,
              textDecoration: 'underline',
              fontSize: '16px',
            }}>
              Try the swipe experience →
            </Link>
          </div>
        </div>
      </section>

      {/* Preview Card */}
      <section style={{ padding: '40px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '340px',
          height: '520px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: theme.cardShadow,
          background: theme.card,
        }}>
          <img 
            src="https://images.unsplash.com/photo-1469334031218-e382a5b83147?w=400&h=500&fit=crop"
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', background: theme.card + '50' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 'bold', textAlign: 'center', marginBottom: '48px' }}>
            How It Works
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
          }}>
            {[
              { icon: '✓', title: 'Get Verified', desc: 'Connect your social accounts and verify your followers are real. Minimum 300 followers required.' },
              { icon: '↔️', title: 'Swipe & Connect', desc: 'Browse campaigns and swipe right to connect. Each right swipe assigns you a unique coupon code.' },
              { icon: '💰', title: 'Earn Commission', desc: 'Promote via reels, posts, or WhatsApp. Earn 70% commission on every purchase made with your code.' },
            ].map((feature, i) => (
              <div key={i} style={{
                background: theme.card,
                padding: '32px',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: theme.primary + '20',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '28px',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ color: theme.textSecondary, lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '48px 24px', borderTop: `1px solid ${theme.border}` }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center', color: theme.textSecondary }}>
          <p>© 2024 InfluencerMatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}