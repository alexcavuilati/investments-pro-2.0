import React, { useState, useEffect } from 'react';
import { Bot, Target, Zap, FileText, Settings, Play, Pause, Save, Info, AlertCircle, TrendingUp, Search, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { safeFetch } from '../utils/api';

interface Deal {
  id: string;
  name: string;
  location: string;
  price: number;
  discount: number;
  projected_roi: number;
  reasoning: string;
}

export function DealHunter() {
  const { token } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [threshold, setThreshold] = useState(15);
  const [maxBid, setMaxBid] = useState(2000000);
  const [autoEOI, setAutoEOI] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState('distress');
  const [saving, setSaving] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [aiReasoning, setAiReasoning] = useState('Initializing market scan...');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await safeFetch('/api/deal-hunter/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (data) {
          setIsActive(!!data.is_active);
          setThreshold(data.discount_threshold);
          setMaxBid(data.max_bid_usd);
          setAutoEOI(!!data.auto_eoi_drafting);
          setSelectedStrategy(data.strategy_notes);
        }
      } catch (err) {
        console.error("Failed to fetch deal hunter settings", err);
      }
    };
    if (token) fetchSettings();
  }, [token]);

  const strategies = [
    { id: 'distress', name: 'Distressed Asset Hunter', description: 'Targets properties with 20%+ discount to market value.' },
    { id: 'yield', name: 'High-Yield Arbitrage', description: 'Targets properties where projected IRR exceeds 18%.' },
    { id: 'green', name: 'Green Retrofit Flip', description: 'Targets low-efficiency buildings for mandatory upgrade arbitrage.' }
  ];

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        // Simulate finding a deal
        if (Math.random() > 0.7) {
          const newDeal: Deal = {
            id: Math.random().toString(36).substr(2, 9),
            name: ['Mosman Heights', 'Dubai Marina Tower', 'London Wharf', 'Fiji Beachfront'][Math.floor(Math.random() * 4)],
            location: ['Sydney, AU', 'Dubai, AE', 'London, UK', 'Nadi, FJ'][Math.floor(Math.random() * 4)],
            price: Math.floor(Math.random() * 1000000) + 500000,
            discount: Math.floor(Math.random() * 10) + threshold,
            projected_roi: Math.floor(Math.random() * 10) + 12,
            reasoning: 'AI detected a motivated seller and below-market listing price based on 2026 fiscal trends.'
          };
          setDeals(prev => [newDeal, ...prev].slice(0, 5));
          setAiReasoning(`Detected high-probability opportunity in ${newDeal.location}. Discount: ${newDeal.discount}%. ROI: ${newDeal.projected_roi}%.`);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isActive, threshold]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await safeFetch('/api/deal-hunter/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          is_active: isActive ? 1 : 0,
          discount_threshold: threshold,
          max_bid_usd: maxBid,
          auto_eoi_drafting: autoEOI ? 1 : 0,
          strategy_notes: selectedStrategy
        })
      });
      alert('Deal Hunter configuration saved to your vault.');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 lg:space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-white mb-2 flex items-center gap-3">
            <Bot className="text-accent-blue" />
            Agentic Deal Hunter 2.0
          </h1>
          <p className="text-white/40 font-medium">Autonomous AI agents executing multi-step acquisition strategies across global markets.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all bg-white/5 border border-white/10 hover:bg-white/10 text-white"
          >
            <Save size={16} /> Save Config
          </button>
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 ${isActive ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-logo-gradient text-white shadow-blue-500/20'}`}
          >
            {isActive ? <><Pause size={20} /> Agent Active</> : <><Play size={20} /> Start Agent</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="clean-card p-8 md:p-10 space-y-8">
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg"><Settings size={18} /></div>
              Agent Configuration
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-6">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Discount Threshold (%)</label>
                <input 
                  type="range" min="5" max="40" value={threshold} 
                  onChange={e => setThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <span>5%</span>
                  <span className="text-white font-black">{threshold}% Below Market</span>
                  <span>40%</span>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Max Bid Cap (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-black">$</span>
                  <input 
                    type="number" value={maxBid} 
                    onChange={e => setMaxBid(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl pl-10 pr-6 py-4 text-white font-black focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 p-6 bg-white/5 rounded-[2rem] border border-white/5 group hover:bg-white/10 transition-all duration-500">
              <div className="w-14 h-14 bg-logo-gradient/10 rounded-2xl flex items-center justify-center shadow-inner shrink-0 text-amber-400">
                <Zap size={28} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-black text-white tracking-tight">Auto-Draft Expression of Interest (EOI)</div>
                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Agent will automatically draft and queue legal documents for review.</div>
              </div>
              <button 
                onClick={() => setAutoEOI(!autoEOI)}
                className={`w-14 h-7 rounded-full relative transition-all duration-500 ${autoEOI ? 'bg-logo-gradient' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1.5 w-4 h-4 bg-white rounded-full transition-all duration-500 ${autoEOI ? 'left-8' : 'left-2'}`}></div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {strategies.map(s => (
              <button 
                key={s.id} 
                onClick={() => setSelectedStrategy(s.id)}
                className={`clean-card p-8 text-left transition-all group relative overflow-hidden ${selectedStrategy === s.id ? 'border-blue-500/50 bg-blue-500/5 shadow-xl shadow-blue-500/10' : 'hover:border-white/20'}`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                  <Target size={48} className="text-white" />
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${selectedStrategy === s.id ? 'bg-logo-gradient text-white' : 'bg-white/5 text-white/40 group-hover:bg-white/10'}`}>
                  <Target size={24} />
                </div>
                <div className="font-black text-sm text-white mb-2 tracking-tight">{s.name}</div>
                <p className="text-[10px] text-white/30 leading-relaxed font-black uppercase tracking-widest">{s.description}</p>
              </button>
            ))}
          </div>

          {/* Recent Deals Found */}
          <div className="clean-card p-10">
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <Search size={18} />
              Recent Opportunities Detected
            </h4>
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {deals.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                    <p className="text-white/20 font-black text-[10px] uppercase tracking-widest">Agent is scanning... No deals queued yet.</p>
                  </div>
                ) : (
                  deals.map((deal) => (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all duration-500"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-logo-gradient flex items-center justify-center shrink-0 text-white shadow-lg shadow-blue-500/20">
                        <TrendingUp size={32} />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h5 className="text-white font-black text-lg tracking-tight">{deal.name}</h5>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{deal.location}</p>
                        <p className="text-white/60 text-xs mt-2 italic">"{deal.reasoning}"</p>
                      </div>
                      <div className="flex flex-col items-center md:items-end gap-2">
                        <span className="text-emerald-400 font-black text-xl tracking-tighter">-{deal.discount}%</span>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Below Market</span>
                      </div>
                      <button className="btn-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest">
                        Review EOI
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="clean-card p-8 md:p-10 bg-navy-900 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-8 relative z-10 flex items-center gap-2">
              <Activity size={16} className="text-blue-400" />
              Live Agent Logs
            </h4>
            <div className="space-y-6 relative z-10">
              <LogEntry time="02:14" msg={`Scanning ${selectedStrategy} opportunities...`} />
              {deals.map((d, i) => (
                <LogEntry key={i} time="02:10" msg={`Opportunity found: ${d.name} (${d.location})`} />
              ))}
              <LogEntry time="01:30" msg="Agent initialized. Strategy: Distressed Asset Hunter." />
            </div>
          </div>

          <div className="clean-card p-8 border-blue-500/20 bg-blue-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Bot size={48} className="text-blue-400" />
            </div>
            <div className="flex items-center gap-3 text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
              <Bot size={16} /> AI Reasoning
            </div>
            <p className="text-xs text-blue-400/70 leading-relaxed font-black uppercase tracking-widest">
              {aiReasoning}
            </p>
          </div>

          <div className="clean-card p-8 space-y-4">
            <div className="flex items-center gap-3 text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">
              <Info size={16} /> Strategy Insights
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/60 font-black uppercase tracking-widest leading-relaxed">
                The agent is currently prioritizing markets with high interest rate volatility to exploit temporary price dislocations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LogEntryProps {
  key?: React.Key;
  time: string;
  msg: string;
}

function LogEntry({ time, msg }: LogEntryProps) {
  return (
    <div className="flex gap-4 text-[10px]">
      <span className="text-blue-400 font-black tracking-widest">{time}</span>
      <span className="text-white/40 font-black uppercase tracking-widest">{msg}</span>
    </div>
  );
}
