'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import { Bot, Lock, User, ShieldAlert, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const token = useStore((state) => state.token);
  const setToken = useStore((state) => state.setToken);
  const setUser = useStore((state) => state.setUser);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      const data = await api.login(username, password);
      setToken(data.access_token);
      const userProfile = await api.getMe();
      setUser(userProfile);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Incorrect username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] relative overflow-hidden items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFD400]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00C853]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#181818] border border-[#2B2B2B] rounded-2xl p-8 shadow-2xl relative z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFD400] to-[#FFA500] flex items-center justify-center mb-4 shadow-lg shadow-[#FFD400]/20">
            <Bot className="w-7 h-7 text-black" />
          </div>
          <h1 className="text-2xl font-bold font-outfit text-white text-center">
            AntiGravity AI
          </h1>
          <p className="text-gray-500 text-xs mt-1 text-center font-semibold uppercase tracking-widest">
            AI Trading Platform v4
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-[#FF1744]/10 border border-[#FF1744]/20 text-[#FF1744] rounded-xl p-3 flex items-start space-x-2 text-xs">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <User size={16} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full bg-[#0A0A0A] border border-[#2B2B2B] rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#FFD400]/50 text-white placeholder-gray-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Lock size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full bg-[#0A0A0A] border border-[#2B2B2B] rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#FFD400]/50 text-white placeholder-gray-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#FFD400] hover:bg-[#E6BF00] text-black font-bold rounded-xl text-sm transition focus:outline-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              'Sign In to Terminal'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}