'use client';

import React, { useState } from 'react';
import { Newspaper, RefreshCw, AlertTriangle, ExternalLink, TrendingUp, TrendingDown, Minus, Clock, Brain } from 'lucide-react';

const MOCK_NEWS = [
  { title: 'Fed Holds Interest Rates Steady at 4.50%', source: 'Reuters', impact: 'HIGH', sentiment: 'NEUTRAL', time: '2h ago' },
  { title: 'US Non-Farm Payrolls Beat Expectations by 185K', source: 'Bloomberg', impact: 'HIGH', sentiment: 'BULLISH', time: '4h ago' },
  { title: 'EUR/USD Tests Key Resistance at 1.0850', source: 'DailyFX', impact: 'MEDIUM', sentiment: 'BULLISH', time: '6h ago' },
  { title: 'Gold Surges Past $2,400 as Safe-Haven Demand Rises', source: 'CNBC', impact: 'HIGH', sentiment: 'BULLISH', time: '8h ago' },
  { title: 'Oil Prices Drop 3% on OPEC+ Supply Increase', source: 'WSJ', impact: 'MEDIUM', sentiment: 'BEARISH', time: '10h ago' },
];

export default function NewsPage() {
  const [mounted, setMounted] = useState(true);

  const impactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return 'bg-[#FF1744]/10 text-[#FF1744] border-[#FF1744]/20';
      case 'MEDIUM': return 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20';
      default: return 'bg-[#2196F3]/10 text-[#2196F3] border-[#2196F3]/20';
    }
  };

  const sentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return <TrendingUp className="w-3 h-3 text-[#00C853]" />;
      case 'BEARISH': return <TrendingDown className="w-3 h-3 text-[#FF1744]" />;
      default: return <Minus className="w-3 h-3 text-[#FF9800]" />;
    }
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-outfit text-white">News & Analysis</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">AI-powered market news and sentiment</p>
        </div>
        <button className="flex items-center gap-1.5 bg-[#0A0A0A] border border-[#2B2B2B] text-gray-400 px-2.5 py-1.5 rounded-lg text-[11px] font-medium hover:border-[#FFD400]/50 hover:text-white transition-all">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {MOCK_NEWS.map((item, i) => (
            <div key={i} className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4 hover:border-[#FFD400]/20 transition-all">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-white flex-1">{item.title}</h3>
                <ExternalLink className="w-3.5 h-3.5 text-gray-600 hover:text-[#FFD400] cursor-pointer ml-2 flex-shrink-0" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-500">{item.source}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${impactColor(item.impact)}`}>{item.impact} IMPACT</span>
                <div className="flex items-center gap-1">
                  {sentimentIcon(item.sentiment)}
                  <span className={`text-[10px] font-semibold ${item.sentiment === 'BULLISH' ? 'text-[#00C853]' : item.sentiment === 'BEARISH' ? 'text-[#FF1744]' : 'text-[#FF9800]'}`}>{item.sentiment}</span>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <Clock className="w-3 h-3 text-gray-600" />
                  <span className="text-[10px] text-gray-600">{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-[#FFD400]" />
              <span className="text-sm font-semibold text-white">AI Summary</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Market sentiment is cautiously bullish as the Fed maintains its hold on rates while economic data continues to show strength. Gold is attracting safe-haven flows amid geopolitical uncertainty.
            </p>
            <div className="mt-3 pt-3 border-t border-[#2B2B2B]">
              <div className="text-[10px] text-gray-500">Trading Recommendation</div>
              <div className="text-sm font-bold text-[#FFD400] mt-1">CAUTIOUS BUY</div>
              <div className="text-[10px] text-gray-600 mt-0.5">Confidence: 65%</div>
            </div>
          </div>

          <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-[#FF9800]" />
              <span className="text-sm font-semibold text-white">Upcoming Events</span>
            </div>
            <div className="space-y-2">
              {[
                { event: 'FOMC Minutes', date: 'Today 14:00', impact: 'HIGH' },
                { event: 'US CPI Data', date: 'Tomorrow 08:30', impact: 'HIGH' },
                { event: 'ECB Rate Decision', date: 'Thu 12:45', impact: 'HIGH' },
              ].map((evt, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{evt.event}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{evt.date}</span>
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-[#FF1744]/10 text-[#FF1744]">{evt.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}