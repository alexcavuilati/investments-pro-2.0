import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MARKET_DATA = [
  { symbol: 'USD/FJD', value: '2.24', change: '+0.12%', up: true },
  { symbol: 'AUD/USD', value: '0.66', change: '-0.05%', up: false },
  { symbol: 'NZD/USD', value: '0.61', change: '+0.08%', up: true },
  { symbol: 'GBP/USD', value: '1.27', change: '+0.15%', up: true },
  { symbol: 'EUR/USD', value: '1.08', change: '-0.02%', up: false },
  { symbol: 'USD/JPY', value: '156.42', change: '+0.22%', up: true },
  { symbol: 'USD/AED', value: '3.67', change: '0.00%', up: true },
  { symbol: 'GOLD', value: '2342.10', change: '+0.45%', up: true },
  { symbol: 'S&P 500', value: '5277.51', change: '+0.11%', up: true },
  { symbol: 'FTSE 100', value: '8275.38', change: '-0.31%', up: false },
];

export function MarketTicker() {
  return (
    <div className="bg-navy-900 border-b border-white/10 py-3 overflow-hidden relative z-50 shadow-2xl">
      <motion.div 
        className="flex whitespace-nowrap gap-16 items-center"
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 40, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        {[...MARKET_DATA, ...MARKET_DATA, ...MARKET_DATA].map((item, i) => (
          <div key={i} className="flex items-center gap-4 group cursor-default">
            <span className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase group-hover:text-white/60 transition-colors">{item.symbol}</span>
            <span className="text-sm font-mono font-black text-white tracking-tighter">{item.value}</span>
            <span className={`flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase ${item.up ? 'text-emerald-400' : 'text-rose-400'}`}>
              {item.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {item.change}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          </div>
        ))}
      </motion.div>
      
      {/* Neon Glow Effect */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(255,255,255,0.03)]" />
    </div>
  );
}
