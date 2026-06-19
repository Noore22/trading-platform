'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import { useRouter } from 'next/navigation';
import { 
  Server, 
  Trash2, 
  Copy, 
  Check, 
  Plus,
  Compass,
  CreditCard,
  KeyRound,
  FileSpreadsheet,
  Lock,
  Activity
} from 'lucide-react';

export default function AccountsPage() {
  const accounts = useStore((state) => state.accounts) ?? [];
  const setAccounts = useStore((state) => state.setAccounts);
  const selectedAccount = useStore((state) => state.selectedAccount);
  const setSelectedAccount = useStore((state) => state.setSelectedAccount);
  const user = useStore((state) => state.user);
  const isMt5Connected = useStore((state) => state.isMt5Connected);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
        router.push('/unauthorized');
    }
  }, [user, router]);

  // Form states - seeded by default with user's real MT5 Demo credentials
  const [name, setName] = useState('MOAZZMA NOORE');
  const [login, setLogin] = useState('108091966');
  const [broker, setBroker] = useState('MetaQuotes Ltd.');
  const [server, setServer] = useState('MetaQuotes-Demo');
  const [investorPassword, setInvestorPassword] = useState('-dZmTaL4');
  const [masterPassword, setMasterPassword] = useState('6!PsDgVb');
  
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const loadAccounts = async () => {
    try {
      const data = await api.getAccounts();
      setAccounts(data || []);
    } catch (err) {
      console.error('Failed to reload account list:', err);
    }
  };

  // On page load: Fetch accounts and populate active account list
  useEffect(() => {
    loadAccounts();
  }, []);

  // Print console logs: Accounts loaded
  useEffect(() => {
    console.log("Accounts loaded:", accounts);
  }, [accounts]);

  const handleRegisterAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
      alert('Only Administrators can register new MT5 Accounts.');
      return;
    }

    setLoading(true);
    const targetLogin = Number(login);
    try {
      const newAcc = await api.createAccount({
        name,
        login: targetLogin,
        broker,
        server,
        investor_password: investorPassword,
        master_password: masterPassword || undefined
      });
      alert('MT5 Account registered successfully! Copy its API Token to EA parameters.');
      
      // Reset to default empty values after registration
      setName('');
      setLogin('');
      setBroker('');
      setServer('');
      setInvestorPassword('');
      setMasterPassword('');

      // Immediately call GET /api/v1/accounts/, update store, and refresh elements
      const data = await api.getAccounts();
      setAccounts(data || []);

      // Auto-select newly created account
      const matchingAccount = data?.find((acc: any) => acc.id === newAcc.id || Number(acc.login) === targetLogin);
      if (matchingAccount) {
        setSelectedAccount(matchingAccount);
      }
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('already registered')) {
        console.log("Account already registered. Selecting existing account.");
        try {
          // Immediately call GET /api/v1/accounts/ and update Zustand store
          const data = await api.getAccounts();
          setAccounts(data || []);

          // Auto-select the existing account
          const matchingAccount = data?.find((acc: any) => Number(acc.login) === targetLogin);
          if (matchingAccount) {
            setSelectedAccount(matchingAccount);
          }

          // Reset to default empty values
          setName('');
          setLogin('');
          setBroker('');
          setServer('');
          setInvestorPassword('');
          setMasterPassword('');

          alert(`Account with login ${targetLogin} is already registered. Selected automatically!`);
        } catch (fetchErr) {
          console.error('Failed to load/select existing account:', fetchErr);
        }
      } else {
        alert(`Registration failure: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: number, loginNum: number) => {
    if (user?.role !== 'admin') {
      alert('Only Administrators can delete MT5 Accounts.');
      return;
    }

    const confirmDelete = confirm(`Are you absolutely sure you want to remove MT5 Account ${loginNum}? This action deletes all historical trades, settings, and logs permanently.`);
    if (!confirmDelete) return;

    try {
      await api.deleteAccount(id);
      alert('Account removed.');
      
      if (selectedAccount?.id === id) {
        setSelectedAccount(null);
      }
      
      await loadAccounts();
    } catch (err: any) {
      alert(`Delete failure: ${err.message}`);
    }
  };

  const copyToClipboard = (tokenStr: string) => {
    navigator.clipboard.writeText(tokenStr);
    setCopiedToken(tokenStr);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const isSyncOnline = (lastSyncStr: string | null) => {
    if (!lastSyncStr) return false;
    const diff = Date.now() - new Date(lastSyncStr).getTime();
    return diff < 40000; // Active if polled in last 40 seconds
  };

  return (
    <Navbar>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Register New Account Form */}
        <div className="lg:col-span-4">
          <div className="glass-panel p-6 rounded-2xl border border-gray-900 glow-blue">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-5 flex items-center space-x-2">
              <Plus size={16} className="text-primary" />
              <span>Register MT5 Account</span>
            </h2>
            
            {user?.role !== 'admin' ? (
              <div className="bg-amber-500/10 border border-amber-500/20 text-warning text-xs p-4 rounded-xl font-semibold leading-relaxed">
                ⚠️ Account registrations are restricted to system Administrators only. Please contact support to provision a terminal.
              </div>
            ) : (
              <form onSubmit={handleRegisterAccount} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Account Alias
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IC Markets Scalper"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Account Number
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 8920138"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-primary/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Broker Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IC Markets Ltd"
                    value={broker}
                    onChange={(e) => setBroker(e.target.value)}
                    className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Server Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICMarkets-Demo"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Investor Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={investorPassword}
                    onChange={(e) => setInvestorPassword(e.target.value)}
                    className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-primary/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Master Password (optional)
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-primary/50 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  {loading ? 'Registering Terminal...' : 'Register Account'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Registered Accounts Cards Grid */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">Registered Terminals ({accounts.length})</h2>
          
          {accounts.length === 0 ? (
            <div className="glass-panel p-16 rounded-2xl border border-gray-900 text-center text-gray-500 font-semibold text-xs">
              No MetaTrader 5 accounts registered. Provision one using the sidebar form.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accounts.map((acc) => {
                const online = (acc.is_active && isMt5Connected) || isSyncOnline(acc.last_sync_at);
                return (
                  <div key={acc.id} className="glass-panel p-6 rounded-2xl border border-gray-900 flex flex-col justify-between space-y-5 relative">
                    
                    {/* Header info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-gray-800 rounded-xl text-gray-300">
                          <Server size={18} />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white">{acc.name}</h3>
                          <p className="text-[10px] text-gray-500 font-bold font-mono">Account Login: {acc.login}</p>
                        </div>
                      </div>
                      
                      {/* Sync indicators */}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                        online 
                          ? 'bg-success/20 text-success border-success/30' 
                          : 'bg-danger/20 text-danger border-danger/30'
                      }`}>
                        {online ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>

                    {/* Meta broker info */}
                    <div className="space-y-2.5 text-xs text-textSecondary font-semibold border-t border-b border-gray-800/40 py-3.5">
                      <div className="flex items-center space-x-2">
                        <Compass size={13} className="text-gray-500" />
                        <span>Broker: {acc.broker}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet size={13} className="text-gray-500" />
                        <span>Server: {acc.server}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity size={13} className="text-gray-500" />
                        <span>Connection Status: <b className={online ? 'text-success' : 'text-danger'}>{online ? 'ONLINE' : 'OFFLINE'}</b></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CreditCard size={13} className="text-gray-500" />
                        <span>Balance: <b className="text-white">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CreditCard size={13} className="text-gray-500" />
                        <span>Equity: <b className="text-white">${(acc.equity ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></span>
                      </div>
                    </div>

                    {/* Copy Token credentials */}
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 px-1">
                        MT5 Connection Secret API Token
                      </label>
                      <div className="flex items-center space-x-2 bg-background border border-gray-850 rounded-xl p-2 font-mono text-[10px] text-gray-300">
                        <KeyRound size={12} className="text-gray-500 shrink-0" />
                        <span className="truncate flex-1 select-all">{acc.api_token}</span>
                        <button
                          onClick={() => copyToClipboard(acc.api_token)}
                          className="p-1 hover:bg-gray-850 text-gray-400 hover:text-white rounded transition"
                          title="Copy Token"
                        >
                          {copiedToken === acc.api_token ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    {/* Footer actions */}
                    {user?.role === 'admin' && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleDeleteAccount(acc.id, acc.login)}
                          className="flex items-center space-x-1.5 py-2 px-3 border border-danger/25 hover:bg-danger hover:text-white text-danger text-xs font-bold rounded-xl transition"
                        >
                          <Trash2 size={12} />
                          <span>Delete Account</span>
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </Navbar>
  );
}
