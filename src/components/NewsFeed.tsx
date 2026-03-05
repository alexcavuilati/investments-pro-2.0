import React, { useState } from 'react';
import { Globe, ArrowUpRight, Search, Zap, Filter, RefreshCw } from 'lucide-react';
import { NewsItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { safeFetch } from '../utils/api';

interface NewsFeedProps {
  news: NewsItem[];
}

export function NewsFeed({ news: initialNews }: NewsFeedProps) {
  const { token } = useAuth();
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                         item.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || item.country === filter;
    return matchesSearch && matchesFilter;
  });

  const handleRefreshNews = async () => {
    setLoading(true);
    try {
      // In a real app, this would call an AI service to fetch/generate news
      const data = await safeFetch('/api/news', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <h1 className="text-white mb-2 flex items-center gap-3">
            <Globe className="text-accent-blue" />
            Global Fiscal Feed
          </h1>
          <p className="text-white/40 font-medium">Real-time 2026 real estate, tax, and legal updates powered by AI.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text" 
              placeholder="Search news..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 w-full sm:w-64 transition-all"
            />
          </div>
          <button 
            onClick={handleRefreshNews}
            disabled={loading}
            className="btn-outline px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Sync Feed
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {['All', 'FJ', 'AU', 'US', 'AE', 'SG', 'GB'].map(country => (
          <FilterChip 
            key={country} 
            label={country} 
            active={filter === country} 
            onClick={() => setFilter(country)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredNews.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <Zap className="w-12 h-12 text-white/5 mx-auto mb-4" />
            <p className="text-white/20 font-black text-[10px] uppercase tracking-widest">No matching updates found in the 2026 fiscal stream.</p>
          </div>
        ) : (
          filteredNews.map(item => (
            <div key={item.id} className="clean-card p-8 md:p-10 flex flex-col md:flex-row gap-10 group hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-700">
              <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex flex-col items-center justify-center text-white/20 shrink-0 group-hover:bg-logo-gradient group-hover:text-white transition-all duration-500 shadow-inner">
                <Globe size={40} />
                <span className="text-[10px] font-black mt-2 uppercase tracking-widest">{item.country}</span>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{item.category}</span>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{new Date(item.published_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors">{item.title}</h3>
                <p className="text-white/40 text-sm font-medium leading-relaxed line-clamp-3">{item.content}</p>
                <div className="pt-4 flex items-center justify-between">
                  <button className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all group/btn">
                    Read Full Analysis <ArrowUpRight size={18} className="text-blue-400 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-all" />
                  </button>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">AI Verified</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface FilterChipProps {
  key?: React.Key;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function FilterChip({ label, active = false, onClick }: FilterChipProps) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${active ? 'bg-logo-gradient text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
    >
      {label}
    </button>
  );
}
