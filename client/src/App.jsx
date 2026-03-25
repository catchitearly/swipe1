import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import InfluencerDashboard from './pages/InfluencerDashboard';
import BrandDashboard from './pages/BrandDashboard';

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

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {user?.role === 'brand' ? <BrandDashboard /> : <InfluencerDashboard />}
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;