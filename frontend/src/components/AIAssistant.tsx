'use client';

import React, { useState, useCallback } from 'react';
import { BotMessageSquare, X, Send, Network, Target, ShieldAlert, LineChart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTickStore } from '../store/useTickStore';

function generateMarketSummary(): string {
  const mt5Data = useStore.getState().mt5Data;
  const ticks = useTickStore.getState().liveTicks;
  const positions = useStore.getState().positions;

  if (!mt5Data) return 'MT5 data not available.';

  const balance = mt5Data.balance || 0;
  const equity = mt5Data.equity || 0;
  const floatingPnl = mt5Data.floating_profit || 0;
  const dailyPnl = mt5Data.daily_profit || 0;
  const openPositions = positions?.length || 0;

  let summary = `Account: $${balance.toLocaleString()} balance, $${equity.toLocaleString()} equity. `;
  summary += `Floating P&L: ${floatingPnl >= 0 ? '+' : ''}$${floatingPnl.toFixed(2)}. `;
  summary += `Daily P&L: ${dailyPnl >= 0 ? '+' : ''}$${dailyPnl.toFixed(2)}. `;
  summary += `Open positions: ${openPositions}. `;

  const firstTick = Object.entries(ticks)[0];
  if (firstTick) {
    const [sym, tick] = firstTick;
    summary += `${sym}: Bid ${tick.bid}, Ask ${tick.ask}. `;
  }

  return summary;
}

function generateTradeSuggestion(): string {
  const scannerData = useStore.getState().scannerData;
  if (!scannerData || scannerData.length === 0) return 'Scanner data not available.';

  const buySignals = scannerData.filter((s: any) => s.signal === 'BUY').sort((a: any, b: any) => b.confidence - a.confidence);
  const sellSignals = scannerData.filter((s: any) => s.signal === 'SELL').sort((a: any, b: any) => b.confidence - a.confidence);

  let suggestion = 'Market Scanner Analysis:\n';
  if (buySignals.length > 0) {
    const top = buySignals[0];
    suggestion += `Top BUY: ${top.symbol} (confidence ${top.confidence}%, RSI ${top.rsi}). `;
  }
  if (sellSignals.length > 0) {
    const top = sellSignals[0];
    suggestion += `Top SELL: ${top.symbol} (confidence ${top.confidence}%, RSI ${top.rsi}). `;
  }
  if (buySignals.length === 0 && sellSignals.length === 0) {
    suggestion += 'No clear signals detected. Market is neutral.';
  }
  return suggestion;
}

function generateRiskAnalysis(): string {
  const mt5Data = useStore.getState().mt5Data;
  if (!mt5Data) return 'Account data not available.';

  const drawdown = mt5Data.drawdown || 0;
  const marginLevel = mt5Data.margin_level || 0;
  const balance = mt5Data.balance || 0;
  const equity = mt5Data.equity || 0;

  let analysis = 'Risk Assessment:\n';
  analysis += `Drawdown: ${drawdown.toFixed(1)}%. `;
  analysis += `Margin Level: ${marginLevel.toFixed(1)}%. `;

  if (marginLevel < 100) analysis += 'WARNING: Margin level below 100% - margin call risk! ';
  else if (marginLevel < 200) analysis += 'Caution: Margin level below 200%. ';
  else analysis += 'Margin level is safe. ';

  if (drawdown > 10) analysis += 'High drawdown detected. Consider reducing exposure. ';
  else if (drawdown > 5) analysis += 'Moderate drawdown. Monitor closely. ';
  else analysis += 'Drawdown is within normal range. ';

  analysis += `Balance/Equity ratio: ${balance > 0 ? ((equity / balance) * 100).toFixed(1) : 'N/A'}%.`;

  return analysis;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello, trader. I am the AntiGravity AI Assistant. How can I help you analyze the markets today? I can provide market summaries, trade suggestions, and risk analysis based on live MT5 data.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = useCallback((overrideInput?: string) => {
    const textToSend = overrideInput !== undefined ? overrideInput : input;
    if (!textToSend.trim()) return;
    
    const userMsg = textToSend.trim().toLowerCase();
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    if (overrideInput === undefined) setInput('');

    let response = '';
    if (userMsg.includes('market') || userMsg.includes('summary') || userMsg.includes('overview')) {
      response = generateMarketSummary();
    } else if (userMsg.includes('trade') || userMsg.includes('signal') || userMsg.includes('suggest')) {
      response = generateTradeSuggestion();
    } else if (userMsg.includes('risk') || userMsg.includes('drawdown') || userMsg.includes('margin')) {
      response = generateRiskAnalysis();
    } else if (userMsg.includes('balance') || userMsg.includes('equity') || userMsg.includes('account')) {
      response = generateMarketSummary();
    } else if (userMsg.includes('deep research on') || userMsg.includes('deep analyze')) {
      const match = userMsg.match(/on\s+([a-zA-Z=]+)/);
      const symbol = match ? match[1].toUpperCase() : 'AAPL';
      response = `Starting Deep Research (Multi-Agent Debate) on ${symbol}. This will take a few minutes as our agents gather data from YFinance, debate strategy, and formulate a plan. I will notify you when it's ready.`;
      
      // Call the API endpoint
      fetch(`http://localhost:8000/api/v1/agents/deep-analyze/${symbol}`, { method: 'POST' })
        .catch(console.error);

      // Start polling for result
      const pollResult = setInterval(() => {
        fetch(`http://localhost:8000/api/v1/agents/deep-result/${symbol}`)
          .then(res => res.json())
          .then(data => {
            if (data.status === 'success') {
              clearInterval(pollResult);
              setMessages(prev => [...prev, { 
                role: 'ai', 
                text: `✅ Deep Research Complete for ${symbol}!\n\n**Final Decision**: ${data.final_state_summary?.final_trade_decision}\n\nCheck your backend terminal or logs for the full markdown reports.` 
              }]);
            } else if (data.status === 'error') {
              clearInterval(pollResult);
              setMessages(prev => [...prev, { role: 'ai', text: `❌ Deep Research Failed for ${symbol}: ${data.message}` }]);
            }
          }).catch(() => {});
      }, 10000); // Poll every 10 seconds
    } else {
      const mt5Data = useStore.getState().mt5Data;
      const ticks = useTickStore.getState().liveTicks;
      response = `Connected to MT5: ${mt5Data ? 'Yes' : 'No'}. `;
      response += `Watching ${Object.keys(ticks).length} symbols. `;
      response += `Open positions: ${useStore.getState().positions?.length || 0}. `;
      response += 'Try asking about: market summary, trade suggestions, risk analysis, or say "deep research on AAPL".';
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 500);
  }, [input]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-purple to-primary rounded-full shadow-lg shadow-purple/40 flex items-center justify-center text-white hover:scale-110 transition-transform z-50"
      >
        <BotMessageSquare className="w-7 h-7" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-[#0B1220] border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      
      {/* Header */}
      <div className="h-16 bg-[#121826] border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple/20 rounded-full flex items-center justify-center border border-purple/30">
            <BotMessageSquare className="w-4 h-4 text-purple" />
          </div>
          <div>
            <div className="text-white font-bold font-outfit">AntiGravity AI</div>
            <div className="text-[10px] text-success font-bold uppercase tracking-wider flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              <span>Online</span>
            </div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-line ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-tr-sm' 
                : 'bg-[#1F2937] text-gray-200 rounded-tl-sm border border-border'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t border-border bg-[#121826] flex space-x-2 overflow-x-auto hide-scrollbar">
        {[
          { label: 'Market Summary', icon: Network, query: 'Give me a market summary' },
          { label: 'Suggest Trade', icon: Target, query: 'Suggest a trade based on current signals' },
          { label: 'Risk Analysis', icon: ShieldAlert, query: 'Show me the current risk analysis' },
          { label: 'Account Status', icon: LineChart, query: 'What is my account status?' },
          { label: 'Deep Research (AAPL)', icon: BotMessageSquare, query: 'Deep research on AAPL' },
        ].map(action => (
          <button key={action.label} onClick={() => { handleSend(action.query); }}
            className="flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 bg-[#0B1220] border border-border rounded-full text-xs text-gray-300 hover:text-white hover:border-primary transition-colors"
          >
            <action.icon className="w-3.5 h-3.5 text-primary" />
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-[#0B1220] border-t border-border">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI anything..." 
            className="w-full bg-[#121826] border border-border rounded-full pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
          />
          <button 
            onClick={() => handleSend()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary rounded-full text-white hover:bg-primary/90 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
