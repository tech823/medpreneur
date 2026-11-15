import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock } from 'lucide-react';

const LOGO_COLOR = "https://customer-assets.emergentagent.com/job_c0d91bdc-a3a1-4ad2-8e15-9e4f736b74ee/artifacts/995ub22h_Color%20Half%20Logo.png";

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={LOGO_COLOR} alt="MedPreneur" className="h-10 mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-slate-900">Admin Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage the MedPreneur platform</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg" data-testid="login-error">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="admin@medpreneur.com"
                data-testid="login-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Enter password"
                data-testid="login-password"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-2.5 rounded-full shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="login-submit-btn"
            >
              <Lock size={16} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">MedPreneur Admin Portal - Authorized Access Only</p>
      </div>
    </div>
  );
}
