import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores';

export default function Register() {
  const [userType, setUserType] = useState('influencer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [description, setDescription] = useState('');
  const { registerInfluencer, registerBrand, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (userType === 'influencer') {
        await registerInfluencer(name, email, password);
      } else {
        await registerBrand(name, email, password, description);
      }
      navigate('/dashboard');
    } catch (err) {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold">InfluencerMatch</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-text-secondary">Join the influencer marketplace</p>
        </div>

        {/* User Type Selector */}
        <div className="flex gap-2 mb-6 p-1 bg-card rounded-lg">
          <button
            type="button"
            onClick={() => setUserType('influencer')}
            className={`flex-1 py-3 rounded-md font-medium transition-all ${
              userType === 'influencer' 
                ? 'bg-primary text-white' 
                : 'text-text-secondary hover:text-white'
            }`}
          >
            I'm an Influencer
          </button>
          <button
            type="button"
            onClick={() => setUserType('brand')}
            className={`flex-1 py-3 rounded-md font-medium transition-all ${
              userType === 'brand' 
                ? 'bg-primary text-white' 
                : 'text-text-secondary hover:text-white'
            }`}
          >
            I'm a Brand
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {userType === 'brand' ? 'Company Name' : 'Full Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder={userType === 'brand' ? 'Acme Inc.' : 'John Doe'}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {userType === 'brand' && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Company Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-[100px]"
                placeholder="Tell us about your company..."
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-4 disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-text-secondary mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}