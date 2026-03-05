import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { safeFetch } from './utils/api';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Calculator, 
  Newspaper, 
  User as UserIcon, 
  ChevronRight, 
  Plus, 
  FileText, 
  TrendingUp, 
  Globe,
  Bell,
  Search,
  ArrowUpRight,
  Download,
  CreditCard,
  Users,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Info,
  Bot,
  Activity,
  Coins,
  CloudRain,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { User, NewsItem, Project, KYCDocument, IncentiveScheme, FiscalVariables, GLOBAL_JURISDICTION_DATA } from './types';
import { fiscalIntelligence, fetchJurisdictionDefaults } from './services/geminiService';
import { Country, State, City } from 'country-state-city';
import { SocialHub } from './components/SocialHub';
import { InvestmentCalculator } from './components/InvestmentCalculator';
import { WelcomeModal } from './components/WelcomeModal';
import { CurrencySwitcher, Currency } from './components/CurrencySwitcher';
import { DealHunter } from './components/DealHunter';
import { DigitalTwin } from './components/DigitalTwin';
import { FractionalLiquidity } from './components/FractionalLiquidity';
import { Subscription } from './components/Subscription';
import { MarketTicker } from './components/MarketTicker';
import { Dashboard } from './components/Dashboard';
import { KYCVault } from './components/KYCVault';
import { FiscalEngine } from './components/FiscalEngine';
import { NewsFeed } from './components/NewsFeed';
import { Profile } from './components/Profile';
import { Home } from './components/Home';
import { Auth } from './components/Auth';
import { MarketInsights } from './components/MarketInsights';
import { TrialOverlay } from './components/TrialOverlay';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, token, logout, refreshUser, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'kyc' | 'engine' | 'calculator' | 'news' | 'social' | 'profile' | 'hunter' | 'twin' | 'liquidity' | 'subscription' | 'insights'>('home');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [kycDocs, setKycDocs] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const [newsRes, projectsRes, kycRes] = await Promise.all([
          safeFetch('/api/news', { headers: { 'Authorization': `Bearer ${token}` } }),
          safeFetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } }),
          safeFetch('/api/kyc', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        setNews(newsRes);
        setProjects(projectsRes);
        setKycDocs(kycRes);

        // Handle payment success
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment_success') === 'true') {
          const tier = urlParams.get('tier');
            if (tier) {
              await safeFetch('/api/update-tier', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tier }),
              });
              // Refresh user data
              await refreshUser();
              alert(`Successfully upgraded to ${tier} tier!`);
              // Clean up URL
              window.history.replaceState({}, document.title, "/");
            }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading || authLoading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-navy-900">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-white font-display text-2xl font-bold tracking-[0.3em]"
      >
        INVESTMENTS PRO
      </motion.div>
    </div>
  );

  if (!token) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden relative text-white">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 border-r border-white/10 flex flex-col h-full bg-navy-900 text-white z-40 transition-transform duration-300 transform
        lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tighter text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-logo-gradient rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-500/20">
              <TrendingUp size={20} />
            </div>
            <div className="flex flex-col leading-none">
              <span>INVESTMENTS</span>
              <span className="text-white/40 text-[10px] tracking-[0.3em] mt-1">PRO 2.0</span>
            </div>
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <NavItem icon={<Globe size={20} />} label="Home Feed" active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }} />
          <NavItem icon={<Zap size={20} />} label="AI Insights" active={activeTab === 'insights'} onClick={() => { setActiveTab('insights'); setIsSidebarOpen(false); }} />
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
          <NavItem icon={<ShieldCheck size={20} />} label="KYC Vault" active={activeTab === 'kyc'} onClick={() => { setActiveTab('kyc'); setIsSidebarOpen(false); }} />
          <NavItem icon={<Calculator size={20} />} label="Fiscal Engine" active={activeTab === 'engine'} onClick={() => { setActiveTab('engine'); setIsSidebarOpen(false); }} />
          <NavItem icon={<TrendingUp size={20} />} label="Calculator" active={activeTab === 'calculator'} onClick={() => { setActiveTab('calculator'); setIsSidebarOpen(false); }} />
          <NavItem icon={<Bot size={20} />} label="Deal Hunter" active={activeTab === 'hunter'} onClick={() => { setActiveTab('hunter'); setIsSidebarOpen(false); }} />
          <NavItem icon={<Activity size={20} />} label="Digital Twin" active={activeTab === 'twin'} onClick={() => { setActiveTab('twin'); setIsSidebarOpen(false); }} />
          <NavItem icon={<Coins size={20} />} label="Liquidity" active={activeTab === 'liquidity'} onClick={() => { setActiveTab('liquidity'); setIsSidebarOpen(false); }} />
          <NavItem icon={<Newspaper size={20} />} label="Market Intel" active={activeTab === 'news'} onClick={() => { setActiveTab('news'); setIsSidebarOpen(false); }} />
          <NavItem icon={<Users size={20} />} label="Social Hub" active={activeTab === 'social'} onClick={() => { setActiveTab('social'); setIsSidebarOpen(false); }} />
          <NavItem icon={<UserIcon size={20} />} label="Profile" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} />
          <NavItem icon={<CreditCard size={20} />} label="Subscription" active={activeTab === 'subscription'} onClick={() => { setActiveTab('subscription'); setIsSidebarOpen(false); }} />
        </nav>

        <div className="p-6 border-t border-white/10">
          {user?.tier === 'STANDARD' && user?.trial_ends_at && (
            <div className="mb-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Trial Period</span>
                <Zap size={12} className="text-blue-400" />
              </div>
              <div className="text-xs font-bold text-white mb-2">
                {Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Days Remaining
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000" 
                  style={{ width: `${Math.max(0, Math.min(100, ( (new Date(user.trial_ends_at).getTime() - new Date().getTime()) / (3 * 24 * 60 * 60 * 1000) ) * 100))}%` }} 
                />
              </div>
            </div>
          )}
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Current Tier</div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{user?.tier}</span>
              <button 
                onClick={() => setActiveTab('subscription')}
                className="text-[10px] bg-logo-gradient text-white px-3 py-1.5 rounded-lg uppercase font-black hover:opacity-90 transition-all shadow-lg shadow-blue-500/10"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-navy-950">
        <MarketTicker />
        <header className="sticky top-0 bg-navy-950/80 backdrop-blur-md border-b border-white/5 px-4 lg:px-8 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-white/10 rounded-full">
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-black tracking-tight uppercase hidden sm:block">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-2 lg:gap-6">
            <CurrencySwitcher current={currency} onChange={setCurrency} />
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input type="text" placeholder="Search assets..." className="pl-10 pr-4 py-2 bg-white/5 border border-white/5 rounded-full text-sm focus:outline-none w-48 lg:w-64 placeholder:text-white/20" />
            </div>
            <button className="p-2 hover:bg-white/5 rounded-full relative">
              <Bell size={20} className="text-white/60" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-navy-950"></span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <TrialOverlay user={user} onUpgrade={() => setActiveTab('subscription')} />
          <WelcomeModal />
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Home />
              </motion.div>
            )}
            {activeTab === 'insights' && (
              <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MarketInsights />
              </motion.div>
            )}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Dashboard projects={projects} user={user} currency={currency} />
              </motion.div>
            )}
            {activeTab === 'kyc' && (
              <motion.div key="kyc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <KYCVault docs={kycDocs} user={user} />
              </motion.div>
            )}
            {activeTab === 'engine' && (
              <motion.div key="engine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FiscalEngine currency={currency} user={user} />
              </motion.div>
            )}
            {activeTab === 'calculator' && (
              <motion.div key="calculator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <InvestmentCalculator currency={currency} user={user} />
              </motion.div>
            )}
            {activeTab === 'hunter' && (
              <motion.div key="hunter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DealHunter />
              </motion.div>
            )}
            {activeTab === 'twin' && (
              <motion.div key="twin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DigitalTwin />
              </motion.div>
            )}
            {activeTab === 'liquidity' && (
              <motion.div key="liquidity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FractionalLiquidity />
              </motion.div>
            )}
            {activeTab === 'subscription' && (
              <motion.div key="subscription" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Subscription user={user} />
              </motion.div>
            )}
            {activeTab === 'news' && (
              <motion.div key="news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <NewsFeed news={news} />
              </motion.div>
            )}
            {activeTab === 'social' && (
              <motion.div key="social" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SocialHub currentUser={user} />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Profile user={user} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${active ? 'bg-logo-gradient text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}
