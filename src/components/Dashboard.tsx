import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Activity, Filter, ArrowUpRight, Shield, Clock, CheckCircle, AlertTriangle, Lock, ArrowLeft, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Currency, formatCurrency } from './CurrencySwitcher';
import { TrustVault } from './TrustVault';
import { safeFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ReactNode;
}

function StatCard({ title, value, change, up, icon }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="clean-card p-8 group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        {React.cloneElement(icon as React.ReactElement, { size: 64 })}
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/60 group-hover:bg-logo-gradient group-hover:text-white transition-all duration-500">
          {icon}
        </div>
        <div>
          <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{title}</h4>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white tracking-tighter">{value}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change}
        </div>
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">vs last month</span>
      </div>
    </motion.div>
  );
}

const CHART_DATA = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
];

export function Dashboard({ projects, user, currency }: { projects: any[], user: any, currency: Currency }) {
  const { token } = useAuth();
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);

  const fetchMilestones = async (projectId: number) => {
    setLoadingMilestones(true);
    try {
      const data = await safeFetch(`/api/projects/${projectId}/milestones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMilestones(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMilestones(false);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      fetchMilestones(selectedProject.id);
    }
  }, [selectedProject]);

  const handleFundEscrow = async (milestoneId: number, amount: number) => {
    try {
      await safeFetch('/api/escrow/fund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ milestone_id: milestoneId, amount })
      });
      fetchMilestones(selectedProject.id);
    } catch (err) {
      console.error(err);
    }
  };

  const totalValue = projects.reduce((acc, p) => acc + (p.purchase_price || 0), 0);

  if (selectedProject) {
    return (
      <div className="space-y-12 pb-20">
        <button
          onClick={() => setSelectedProject(null)}
          className="flex items-center gap-2 text-white/40 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all mb-8"
        >
          <ArrowLeft size={16} /> Back to Overview
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue text-[10px] font-black rounded-full border border-accent-blue/20 uppercase tracking-widest">Active Project</span>
              <span className="text-white/20">•</span>
              <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{selectedProject.country}</span>
            </div>
            <h1 className="text-white mb-2">{selectedProject.name}</h1>
            <p className="text-white/40 font-medium">Project ID: EX-{selectedProject.id.toString().padStart(4, '0')}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Total Acquisition Cost</p>
            <p className="text-4xl font-black text-white tracking-tighter">{formatCurrency(selectedProject.purchase_price, currency)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Trust Vault */}
          <div className="clean-card p-10">
            <TrustVault projectId={selectedProject.id} />
          </div>

          {/* Milestone Escrow */}
          <div className="clean-card p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <Clock className="text-accent-blue" />
                Milestone Escrow
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <Shield size={12} />
                Secured
              </div>
            </div>

            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
              {loadingMilestones ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-16 bg-white/5 rounded-2xl" />
                  <div className="h-16 bg-white/5 rounded-2xl" />
                </div>
              ) : milestones.length === 0 ? (
                <p className="text-white/20 text-xs text-center py-8">No milestones defined for this fiscal period.</p>
              ) : (
                milestones.map((m, idx) => (
                  <div key={m.id} className="relative pl-10 group">
                    <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-navy-950 flex items-center justify-center z-10 ${m.status === 'FUNDED' ? 'bg-emerald-500' : 'bg-white/10 group-hover:bg-accent-blue transition-colors'
                      }`}>
                      {m.status === 'FUNDED' && <CheckCircle size={10} className="text-white" />}
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-sm mb-1">{m.title}</h4>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                          Due: {new Date(m.due_date).toLocaleDateString()} • {formatCurrency(m.amount, currency)}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${m.status === 'FUNDED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/30 border border-white/10'
                        }`}>
                        {m.status}
                      </div>
                    </div>
                    {m.status === 'PENDING' && (
                      <button
                        onClick={() => handleFundEscrow(m.id, m.amount)}
                        className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                      >
                        Release Funds to Escrow
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-white mb-2">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="text-white/40 font-medium">Your global portfolio is performing above benchmark.</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Total Assets Under Management</div>
          <div className="text-5xl font-black text-white tracking-tighter flex items-center justify-end gap-3">
            {formatCurrency(totalValue || 12450000, currency)}
            <span className="text-sm font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">+12.4%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Active Projects" value={projects.length.toString()} change="+4" up={true} icon={<BarChart3 size={24} />} />
        <StatCard title="Global Yield" value="8.4%" change="+0.2%" up={true} icon={<TrendingUp size={24} />} />
        <StatCard title="Risk Exposure" value="Low" change="-2%" up={false} icon={<Activity size={24} />} />
        <StatCard title="Capital Deployed" value={formatCurrency(totalValue * 0.6, currency)} change="+1.2M" up={true} icon={<PieChart size={24} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 clean-card p-10 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white tracking-tight">Portfolio Performance</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-white/10 transition-all">1W</button>
              <button className="px-4 py-2 bg-logo-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">1M</button>
              <button className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-white/10 transition-all">1Y</button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0047FF" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#00D1FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.3)' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.3)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0B',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '1.5rem',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)',
                    padding: '1rem'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 900, color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0047FF"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="clean-card p-10 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white tracking-tight">Recent Acquisitions</h3>
            <button className="p-2 bg-white/5 rounded-xl text-white/40 hover:bg-white/10 transition-all">
              <Filter size={18} />
            </button>
          </div>
          <div className="space-y-6">
            {projects.length > 0 ? projects.slice(0, 3).map((project, i) => (
              <div
                key={i}
                onClick={() => setSelectedProject(project)}
                className="group p-6 bg-white/5 rounded-[2rem] border border-transparent hover:border-white/10 hover:bg-white/5 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 cursor-pointer text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-black text-white group-hover:text-white transition-colors">{project.name}</div>
                  <ArrowUpRight size={16} className="text-white/20 group-hover:text-white transition-all" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{project.country} • {formatCurrency(project.purchase_price, currency)}</div>
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{project.eoi_ready ? 'EOI READY' : 'PROCESSING'}</div>
                </div>
              </div>
            )) : (
              [
                { name: 'Savusavu Resort B1', location: 'Fiji', value: '$2.4M', status: 'Finalized' },
                { name: 'Sydney Wharf Loft', location: 'Australia', value: '$1.8M', status: 'In Review' },
                { name: 'Dubai Marina Penthouse', location: 'UAE', value: '$4.2M', status: 'Processing' },
              ].map((project, i) => (
                <div key={i} className="group p-6 bg-white/5 rounded-[2rem] border border-transparent hover:border-white/10 hover:bg-white/5 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-black text-white group-hover:text-white transition-colors">{project.name}</div>
                    <ArrowUpRight size={16} className="text-white/20 group-hover:text-white transition-all" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{project.location} • {project.value}</div>
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{project.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full py-4 bg-white/5 text-white/40 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all duration-500">
            View All Projects
          </button>
        </div>
      </div>
    </div>
  );
}
