'use client';

import React, { useState, useEffect } from 'react';
import { Save, User, Shield, Bell, Database, Globe, Key } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const user = useStore((state) => state.user);
  const mt5Data = useStore((state) => state.mt5Data);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-white p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-white">Settings</h1>
          <p className="text-gray-400 mt-2">Manage your account settings and preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-72 flex-shrink-0 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/30 shadow-[0_0_20px_rgba(234,179,8,0.05)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 bg-[#0a0a0a] p-8 border border-border rounded-2xl shadow-xl min-h-[400px]">
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold font-outfit mb-6 text-white border-b border-border pb-4">Profile Information</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-[#111] border border-border rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#111] border border-border rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                </div>

                {mt5Data && (
                  <div className="border-t border-border pt-6">
                    <h3 className="text-sm font-bold text-gray-300 mb-4">MT5 Account</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="bg-background rounded-xl p-4 border border-border">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Account</div>
                        <div className="text-sm font-bold font-mono text-white mt-1">{mt5Data.account_number}</div>
                      </div>
                      <div className="bg-background rounded-xl p-4 border border-border">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Server</div>
                        <div className="text-sm font-bold font-mono text-white mt-1">{mt5Data.server}</div>
                      </div>
                      <div className="bg-background rounded-xl p-4 border border-border">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Broker</div>
                        <div className="text-sm font-bold font-mono text-white mt-1">{mt5Data.broker}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6">
                  <button className="flex items-center gap-2 bg-primary text-black px-8 py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {activeTab !== 'profile' && (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-500 animate-fadeIn">
                <SettingsPlaceholder icon={tabs.find(t => t.id === activeTab)?.icon} />
                <p className="mt-6 text-base font-medium">This section is currently under construction.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPlaceholder({ icon: Icon }: { icon?: any }) {
  if (!Icon) return null;
  return (
    <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
      <Icon className="w-10 h-10 text-gray-600" />
    </div>
  );
}
