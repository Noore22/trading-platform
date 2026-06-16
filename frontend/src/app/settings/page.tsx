'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/layout/Navbar';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import { Shield, Settings, Save, AlertTriangle, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const selectedAccount = useStore((state) => state.selectedAccount);
  const user = useStore((state) => state.user);
  
  const [loading, setLoading] = useState(false);
  const [savingTargets, setSavingTargets] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Targets Form
  const [dailyTarget, setDailyTarget] = useState('0');
  const [monthlyTarget, setMonthlyTarget] = useState('0');
  const [dailyLoss, setDailyLoss] = useState('0');
  const [weeklyLoss, setWeeklyLoss] = useState('0');
  const [autoClose, setAutoClose] = useState(false);
  const [autoDisable, setAutoDisable] = useState(false);

  // Settings Form (Extra parameters integrated)
  const [lotSize, setLotSize] = useState('0.01');
  const [riskPercent, setRiskPercent] = useState('1.0');
  const [takeProfit, setTakeProfit] = useState('0.0');
  const [stopLoss, setStopLoss] = useState('0.0');
  const [trailingStop, setTrailingStop] = useState('0.0');
  const [maxDailyLoss, setMaxDailyLoss] = useState('0.0');
  const [maxDailyProfit, setMaxDailyProfit] = useState('0.0');
  
  const [maxTrades, setMaxTrades] = useState('10');
  const [hoursStart, setHoursStart] = useState('00:00');
  const [hoursEnd, setHoursEnd] = useState('23:59');
  const [allowedSymbols, setAllowedSymbols] = useState('BTCUSDT,ETHUSDT,SOLUSDT,BNBUSDT');
  const [newsFilter, setNewsFilter] = useState(false);

  const loadSettingsAndTargets = useCallback(async () => {
    if (!selectedAccount) return;
    setLoading(true);
    try {
      const [targetsData, settingsData] = await Promise.all([
        api.getTargets(selectedAccount.id),
        api.getSettings(selectedAccount.id)
      ]);

      // Populate targets
      setDailyTarget(String(targetsData.daily_profit_target));
      setMonthlyTarget(String(targetsData.monthly_profit_target));
      setDailyLoss(String(targetsData.daily_loss_limit));
      setWeeklyLoss(String(targetsData.weekly_loss_limit));
      setAutoClose(targetsData.auto_close_on_target);
      setAutoDisable(targetsData.auto_disable_on_target);

      // Populate settings
      setLotSize(String(settingsData.default_lot_size));
      setRiskPercent(String(settingsData.risk_percentage));
      setTakeProfit(String(settingsData.take_profit ?? '0.0'));
      setStopLoss(String(settingsData.stop_loss ?? '0.0'));
      setTrailingStop(String(settingsData.trailing_stop ?? '0.0'));
      setMaxDailyLoss(String(settingsData.max_daily_loss ?? '0.0'));
      setMaxDailyProfit(String(settingsData.max_daily_profit ?? '0.0'));

      setMaxTrades(String(settingsData.max_trades));
      setHoursStart(settingsData.trading_hours_start);
      setHoursEnd(settingsData.trading_hours_end);
      setAllowedSymbols(settingsData.allowed_symbols);
      setNewsFilter(settingsData.news_filter_enabled);
    } catch (err) {
      console.error('Failed to load settings data in view:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedAccount]);

  useEffect(() => {
    loadSettingsAndTargets();
  }, [loadSettingsAndTargets]);

  const handleSaveTargets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    if (user?.role === 'viewer') {
      alert('Viewers cannot modify target rules.');
      return;
    }

    setSavingTargets(true);
    try {
      await api.updateTargets(selectedAccount.id, {
        daily_profit_target: Number(dailyTarget),
        monthly_profit_target: Number(monthlyTarget),
        daily_loss_limit: Number(dailyLoss),
        weekly_loss_limit: Number(weeklyLoss),
        auto_close_on_target: autoClose,
        auto_disable_on_target: autoDisable
      });
      alert('Risk and target parameters updated successfully.');
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('connect') || err.message?.includes('NetworkError') || useStore.getState().isBackendOffline) {
        alert("Unable to save settings. Backend unavailable.");
      } else {
        alert(`Save targets failure: ${err.message}`);
      }
    } finally {
      setSavingTargets(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    if (user?.role === 'viewer') {
      alert('Viewers cannot modify parameters.');
      return;
    }

    setSavingSettings(true);
    try {
      const current = await api.getSettings(selectedAccount.id);
      await api.updateSettings(selectedAccount.id, {
        ...current,
        default_lot_size: Number(lotSize),
        risk_percentage: Number(riskPercent),
        take_profit: Number(takeProfit),
        stop_loss: Number(stopLoss),
        trailing_stop: Number(trailingStop),
        max_daily_loss: Number(maxDailyLoss),
        max_daily_profit: Number(maxDailyProfit),
        max_trades: Number(maxTrades),
        trading_hours_start: hoursStart,
        trading_hours_end: hoursEnd,
        allowed_symbols: allowedSymbols,
        news_filter_enabled: newsFilter
      });
      alert('Bot operational configurations updated successfully.');
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('connect') || err.message?.includes('NetworkError') || useStore.getState().isBackendOffline) {
        alert("Unable to save settings. Backend unavailable.");
      } else {
        alert(`Save settings failure: ${err.message}`);
      }
    } finally {
      setSavingSettings(false);
    }
  };

  if (!selectedAccount) {
    return (
      <Navbar>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertTriangle size={48} className="text-warning mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Accounts</h2>
          <p className="text-textSecondary text-sm text-center max-w-md">
            Please register a Binance account to configure operational parameters.
          </p>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <RefreshCw size={36} className="text-primary animate-spin" />
          <p className="text-textSecondary text-xs font-bold uppercase tracking-wider">Syncing Account Configuration Parameters...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Box 1: Targets and Safeguards */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-900 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-5 flex items-center space-x-2">
                <Shield size={16} className="text-success" />
                <span>Safeguards & Target Protections</span>
              </h2>
              
              <form onSubmit={handleSaveTargets} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Daily Target ($)
                    </label>
                    <input
                      type="number"
                      value={dailyTarget}
                      onChange={(e) => setDailyTarget(e.target.value)}
                      className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Monthly Target ($)
                    </label>
                    <input
                      type="number"
                      value={monthlyTarget}
                      onChange={(e) => setMonthlyTarget(e.target.value)}
                      className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Daily Loss Limit ($)
                    </label>
                    <input
                      type="number"
                      value={dailyLoss}
                      onChange={(e) => setDailyLoss(e.target.value)}
                      className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Weekly Loss Limit ($)
                    </label>
                    <input
                      type="number"
                      value={weeklyLoss}
                      onChange={(e) => setWeeklyLoss(e.target.value)}
                      className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-850">
                  <label className="flex items-center space-x-3 text-gray-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoClose}
                      onChange={(e) => setAutoClose(e.target.checked)}
                      className="rounded bg-background border-gray-800 text-primary focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span>Auto-Close All Active Trades when target/limit hit</span>
                  </label>

                  <label className="flex items-center space-x-3 text-gray-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoDisable}
                      onChange={(e) => setAutoDisable(e.target.checked)}
                      className="rounded bg-background border-gray-800 text-primary focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span>Auto-Disable Trading Bot when target/limit hit</span>
                  </label>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingTargets || user?.role === 'viewer'}
                    className="flex items-center space-x-2 py-3 px-5 bg-success hover:bg-success/90 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition active:scale-[0.98] disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>{savingTargets ? 'Saving Guardrails...' : 'Save Guardrails'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Box 2: Bot Parameter Settings */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-900 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-5 flex items-center space-x-2">
                <Settings size={16} className="text-primary" />
                <span>Trading Bot Parameters</span>
              </h2>
              
              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Lot Size
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={lotSize}
                      onChange={(e) => setLotSize(e.target.value)}
                      className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Risk %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={riskPercent}
                      onChange={(e) => setRiskPercent(e.target.value)}
                      className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Trailing Stop
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={trailingStop}
                      onChange={(e) => setTrailingStop(e.target.value)}
                      className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Take Profit
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Stop Loss
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Max Daily Loss ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={maxDailyLoss}
                      onChange={(e) => setMaxDailyLoss(e.target.value)}
                      className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Max Daily Profit ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={maxDailyProfit}
                      onChange={(e) => setMaxDailyProfit(e.target.value)}
                      className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Max Open Trades
                    </label>
                    <input
                      type="number"
                      value={maxTrades}
                      onChange={(e) => setMaxTrades(e.target.value)}
                      className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Trading Hours Start/End
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="00:00"
                        value={hoursStart}
                        onChange={(e) => setHoursStart(e.target.value)}
                        className="w-1/2 bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono text-center"
                      />
                      <input
                        type="text"
                        placeholder="23:59"
                        value={hoursEnd}
                        onChange={(e) => setHoursEnd(e.target.value)}
                        className="w-1/2 bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 font-mono text-center"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Allowed Symbol List (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={allowedSymbols}
                    onChange={(e) => setAllowedSymbols(e.target.value)}
                    className="w-full bg-background border border-gray-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 uppercase font-mono font-bold"
                  />
                </div>

                <div className="pt-3 border-t border-gray-850">
                  <label className="flex items-center space-x-3 text-gray-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newsFilter}
                      onChange={(e) => setNewsFilter(e.target.checked)}
                      className="rounded bg-background border-gray-800 text-primary focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span>Enable News Filter Protection</span>
                  </label>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings || user?.role === 'viewer'}
                    className="flex items-center space-x-2 py-3 px-5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition active:scale-[0.98] disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>{savingSettings ? 'Saving Settings...' : 'Save Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      )}
    </Navbar>
  );
}
