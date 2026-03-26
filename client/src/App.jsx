import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import InfluencerDashboard from './pages/InfluencerDashboard';
import BrandDashboard from './pages/BrandDashboard';
import SwipeCard from './components/SwipeCard';

function ProtectedRoute({ children, role }) {
  const { user, token } = useAuthStore();
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (role && user?.role !== role) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function AppContent() {
  const { user } = useAuthStore();
  const { theme } = useTheme();

  return (
    <div style={{ 
      background: theme.backgroundGradient, 
      minHeight: '100vh',
      color: theme.text 
    }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/discover" element={<SwipeCard />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {user?.role === 'brand' ? <BrandDashboard /> : <InfluencerDashboard />}
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}

export default App;