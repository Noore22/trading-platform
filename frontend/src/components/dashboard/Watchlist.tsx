import React, { memo } from 'react';
import { useTickStore } from '../../store/useTickStore';
import { Star, ChevronRight } from 'lucide-react';
import { List } from 'react-window';

interface WatchlistProps {
  filteredSymbols: string[];
  favorites: string[];
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  toggleFavorite: (symbol: string, e: React.MouseEvent) => void;
  indexSymbols: string[];
  metalsSymbols: string[];
}

// Sub-component to fetch live tick individually so the whole list doesn't re-render
const WatchlistRow = memo(({
  symbol,
  isSelected,
  isFav,
  onSelect,
  onToggleFav,
  indexSymbols,
  metalsSymbols
}: {
  symbol: string,
  isSelected: boolean,
  isFav: boolean,
  onSelect: (s: string) => void,
  onToggleFav: (s: string, e: React.MouseEvent) => void,
  indexSymbols: string[],
  metalsSymbols: string[]
}) => {
  const priceData = useTickStore((state) => state.liveTicks[symbol]) || { bid: 1.0, ask: 1.01, last: 1.0, volume: 0 };

  const isJPYOrMetal = symbol.includes('JPY') || indexSymbols.includes(symbol) || metalsSymbols.includes(symbol);
  const decimalPlaces = isJPYOrMetal ? 2 : 5;

  return (
    <div
      onClick={() => onSelect(symbol)}
      className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer mb-1.5 h-[50px] ${isSelected
        ? 'bg-primary/10 border-primary/30 text-white'
        : 'bg-background/40 border-transparent hover:border-gray-850 text-gray-400'
        }`}
    >
      <div className="flex items-center space-x-2 min-w-0">
        <button
          onClick={(e) => onToggleFav(symbol, e)}
          className={`p-0.5 hover:scale-110 transition shrink-0 ${isFav ? 'text-warning' : 'text-gray-600 hover:text-gray-400'
            }`}
        >
          <Star size={12} fill={isFav ? "currentColor" : "none"} />
        </button>
        <span className={`text-[11px] font-bold font-mono truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
          {symbol}
        </span>
      </div>

      <div className="flex items-center space-x-3 shrink-0 font-mono text-[10px] font-bold">
        <div className="text-right">
          <span className="block text-[8px] text-gray-600 uppercase font-sans">Bid</span>
          <span>{priceData.bid.toFixed(decimalPlaces)}</span>
        </div>
        <div className="text-right">
          <span className="block text-[8px] text-gray-600 uppercase font-sans">Ask</span>
          <span>{priceData.ask.toFixed(decimalPlaces)}</span>
        </div>
        <ChevronRight size={12} className="text-gray-650" />
      </div>
    </div>
  );
});

WatchlistRow.displayName = 'WatchlistRow';

export default function Watchlist({
  filteredSymbols,
  favorites,
  selectedSymbol,
  setSelectedSymbol,
  toggleFavorite,
  indexSymbols,
  metalsSymbols
}: WatchlistProps) {

  if (filteredSymbols.length === 0) {
    return <p className="text-center text-gray-600 text-[10px] py-8 font-bold">No symbols found matching queries.</p>;
  }

  // react-window v2 row renderer component
  const Row = ({ index, style, ariaAttributes }: { index: number, style: React.CSSProperties, ariaAttributes: any }) => {
    const sym = filteredSymbols[index];
    const isFav = favorites.includes(sym);
    const isSelected = selectedSymbol === sym;

    return (
      <div style={style} {...ariaAttributes}>
        <WatchlistRow
          symbol={sym}
          isSelected={isSelected}
          isFav={isFav}
          onSelect={setSelectedSymbol}
          onToggleFav={toggleFavorite}
          indexSymbols={indexSymbols}
          metalsSymbols={metalsSymbols}
        />
      </div>
    );
  };

  return (
    <List
      rowCount={filteredSymbols.length}
      rowHeight={56} // 50px height + 6px margin bottom
      rowComponent={Row}
      rowProps={{}} // No extra props passed via rowProps since Row is in scope
      style={{ height: 208, width: '100%' }}
      className="custom-scrollbar pr-1"
    />
  );
}
