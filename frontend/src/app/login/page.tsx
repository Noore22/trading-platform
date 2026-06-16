'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import { TrendingUp, Lock, User, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const token = useStore((state) => state.token);
  const setToken = useStore((state) => state.setToken);
  const setUser = useStore((state) => state.setUser);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (token) {
      router.replace('/dashboard');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Authenticate
      const data = await api.login(username, password);
      setToken(data.access_token);
      
      // Fetch user profile
      const userProfile = await api.getMe();
      setUser(userProfile);
      
      router.replace('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Incorrect username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role: 'admin' | 'trader' | 'viewer') => {
    setUsername(role);
    setPassword('admin123');
  };

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden items-center justify-center p-4">
      {/* Dynamic Glow Circles in background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10 border border-gray-800">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary/20 text-primary flex items-center justify-center rounded-2xl mb-4 border border-primary/30">
            <TrendingUp size={32} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-sans text-center bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            MT5 AUTOMATION
          </h1>
          <p className="text-textSecondary text-xs mt-1 text-center font-medium uppercase tracking-widest">
            Trading Control Center
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-danger/10 border border-danger/20 text-danger rounded-xl p-3 flex items-start space-x-2 text-sm">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full bg-background border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-white placeholder-gray-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full bg-background border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-white placeholder-gray-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Securing Connection...</span>
              </div>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Demo Quick Access logins */}
        <div className="mt-8 border-t border-gray-800 pt-6">
          <p className="text-xs text-center font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Sandbox Access
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => fillCredentials('admin')}
              className="text-xs py-2 px-1 bg-gray-900 border border-gray-800 hover:border-primary/40 text-gray-300 rounded-lg transition"
            >
              Admin
            </button>
            <button
              onClick={() => fillCredentials('trader')}
              className="text-xs py-2 px-1 bg-gray-900 border border-gray-800 hover:border-success/40 text-gray-300 rounded-lg transition"
            >
              Trader
            </button>
            <button
              onClick={() => fillCredentials('viewer')}
              className="text-xs py-2 px-1 bg-gray-900 border border-gray-800 hover:border-amber/40 text-gray-300 rounded-lg transition"
            >
              Viewer
            </button>
          </div>
          <p className="text-[10px] text-gray-600 text-center mt-2.5">
            Default sandbox password: <code className="text-gray-500 font-mono">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
