import React, { useState } from 'react';
import { Coins, ArrowRightLeft, ShieldCheck, TrendingUp, Wallet, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export function FractionalLiquidity() {
  const [shardsToTrade, setShardsToTrade] = useState(10);
  
  const assets = [
    { id: 1, name: 'Savusavu Resort', total: 10000, owned: 1200, price: 125.50, trend: '+4.2%' },
    { id: 2, name: 'Dubai Marina Penthouse', total: 50000, owned: 500, price: 412.00, trend: '+1.8%' },
    { id: 3, name: 'Sydney Wharf Loft', total: 25000, owned: 2500, price: 89.20, trend: '-0.5%' }
  ];

  return (
    <div className="space-y-8 lg:space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-white mb-2">Fractional Liquidity</h1>
          <p className="text-white/40 font-medium">Trade property equity shards instantly on our internal blockchain bridge.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Wallet Balance</div>
            <div className="text-3xl font-black text-white tracking-tighter">$42,850.00</div>
          </div>
          <div className="w-16 h-16 bg-logo-gradient rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Wallet size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {assets.map(asset => (
              <div key={asset.id} className="clean-card p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between hover:border-white/20 transition-all group">
                <div className="flex items-center gap-6 mb-4 sm:mb-0">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white group-hover:bg-logo-gradient group-hover:text-white transition-all duration-500">
                    <Coins size={28} />
                  </div>
                  <div>
                    <div className="font-black text-white text-lg tracking-tight">{asset.name}</div>
                    <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">
                      {asset.owned} Shards Owned • {((asset.owned / asset.total) * 100).toFixed(1)}% Equity
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-12 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <div className="font-black text-white text-xl tracking-tighter">${asset.price.toFixed(2)}</div>
                    <div className={`text-[10px] font-black tracking-widest uppercase mt-1 ${asset.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {asset.trend} 24h
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-white text-navy-950 rounded-xl font-black text-xs hover:bg-gray-100 transition-all active:scale-95 shadow-lg shadow-white/5">
                    Trade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="clean-card p-8 md:p-10 bg-navy-900 text-white space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-700" />
            <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] relative z-10">Instant Swap</h4>
            <div className="space-y-6 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Sell Shards</label>
                <div className="relative">
                  <input 
                    type="number" value={shardsToTrade} 
                    onChange={e => setShardsToTrade(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-white/30 font-black text-lg"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/40 tracking-widest">SHARDS</span>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="p-3 bg-white/5 rounded-full border border-white/10">
                  <ArrowRightLeft size={20} className="text-white/40" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Receive (USD)</label>
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white/60 font-black text-lg">
                  ${(shardsToTrade * 125.50).toLocaleString()}
                </div>
              </div>
            </div>
            <button className="w-full py-5 bg-logo-gradient text-white rounded-2xl font-black text-sm hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-blue-500/20 relative z-10">
              Confirm Blockchain Swap
            </button>
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest relative z-10">
              <ShieldCheck size={14} /> Secured by PropChain L2 Bridge
            </div>
          </div>

          <div className="clean-card p-8 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={48} className="text-emerald-400" />
            </div>
            <div className="flex items-center gap-3 text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
              <TrendingUp size={16} /> Market Insight
            </div>
            <p className="text-xs text-white/40 leading-relaxed font-medium">
              Liquidity for 'Savusavu Resort' shards has increased by 40% following the 2026 fiscal recalibration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
