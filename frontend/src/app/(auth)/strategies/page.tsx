'use client';
import React from 'react';
import { Bookmark, Plus, Play, Pencil, Trash2 } from 'lucide-react';

export default function StrategiesPage() {
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-outfit text-white">Strategies</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">Trading strategy management</p>
        </div>
        <button className="flex items-center gap-1.5 bg-[#FFD400] text-black px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-[#E6BF00] transition-all">
          <Plus className="w-3.5 h-3.5" /> New Strategy
        </button>
      </div>
      <div className="bg-[#181818] border border-[#2B2B2B] rounded-2xl p-8 flex flex-col items-center justify-center text-gray-600">
        <Bookmark className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-sm font-medium">No strategies defined</p>
        <p className="text-xs mt-1">Create a new strategy to automate trading rules</p>
      </div>
    </div>
  );
}
