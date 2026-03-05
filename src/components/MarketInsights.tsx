import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, TrendingUp, AlertTriangle, MapPin, Info, Zap, Globe, BarChart3 } from 'lucide-react';
import { marketInsights } from '../services/geminiService';

interface InsightData {
  market_sentiment: string;
  key_trends: string[];
  interest_rate_forecast: string;
  top_investment_hubs: { city: string; reason: string; projected_growth: number }[];
  risk_factors: string[];
  summary: string;
}

export const MarketInsights: React.FC = () => {
  const [country, setCountry] = useState('United States');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<InsightData | null>(null);

  const handleFetchInsights = async () => {
    setLoading(true);
    try {
      const data = await marketInsights(country);
      setInsights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Globe className="text-accent-blue" />
            AI Market Intelligence
          </h2>
          <p className="text-white/40 mt-1">Real-time 2026 fiscal data & global property analysis</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Enter country..."
              className="bg-navy-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 w-64"
            />
          </div>
          <button
            onClick={handleFetchInsights}
            disabled={loading || !country}
            className="bg-accent-blue hover:bg-accent-blue/80 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
          >
            {loading ? (
              <Zap className="w-4 h-4 animate-pulse" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Analyze
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-navy-900/30 rounded-3xl border border-white/5"
          >
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-accent-blue/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
              <Zap className="absolute inset-0 m-auto w-8 h-8 text-accent-blue animate-pulse" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Gemini is scanning global markets...</h3>
            <p className="text-white/40 text-center max-w-md px-6">
              Accessing 2026 tax codes, legal frameworks, and infrastructure pipelines via Google Search.
            </p>
          </motion.div>
        ) : insights ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Column: Sentiment & Summary */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-navy-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="text-accent-blue" />
                    Market Sentiment
                  </h3>
                  <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    insights.market_sentiment.toLowerCase().includes('bullish') ? 'bg-emerald-500/20 text-emerald-400' :
                    insights.market_sentiment.toLowerCase().includes('bearish') ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {insights.market_sentiment.split(' ')[0]}
                  </span>
                </div>
                <p className="text-white/80 leading-relaxed mb-6">{insights.summary}</p>
                <div className="bg-black/30 rounded-2xl p-6 border border-white/5">
                  <h4 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Interest Rate Forecast</h4>
                  <p className="text-white font-medium text-lg">{insights.interest_rate_forecast}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-navy-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Zap className="text-accent-blue" />
                    Key Trends
                  </h3>
                  <ul className="space-y-4">
                    {insights.key_trends.map((trend, i) => (
                      <li key={i} className="flex gap-3 text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-2 shrink-0"></div>
                        <span>{trend}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-navy-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <AlertTriangle className="text-red-400" />
                    Risk Factors
                  </h3>
                  <ul className="space-y-4">
                    {insights.risk_factors.map((risk, i) => (
                      <li key={i} className="flex gap-3 text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></div>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Top Hubs */}
            <div className="space-y-8">
              <div className="bg-navy-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 h-full">
                <h3 className="text-xl font-semibold text-white mb-8 flex items-center gap-2">
                  <BarChart3 className="text-accent-blue" />
                  Investment Hubs
                </h3>
                <div className="space-y-6">
                  {insights.top_investment_hubs.map((hub, i) => (
                    <div key={i} className="group p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-accent-blue/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-bold text-lg">{hub.city}</h4>
                        <span className="text-emerald-400 font-mono text-sm">+{hub.projected_growth}%</span>
                      </div>
                      <p className="text-white/40 text-sm leading-snug">{hub.reason}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-accent-blue/10 rounded-2xl border border-accent-blue/20">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-accent-blue shrink-0" />
                    <p className="text-xs text-white/60 leading-relaxed">
                      These insights are generated using real-time 2026 data. Always conduct thorough due diligence before committing capital.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-navy-900/20 rounded-3xl border border-dashed border-white/10">
            <Globe className="w-16 h-16 text-white/5 mb-4" />
            <h3 className="text-xl font-medium text-white/40">Select a country to generate AI insights</h3>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
