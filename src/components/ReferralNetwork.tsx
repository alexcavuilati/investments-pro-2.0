import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Gift, Share2, Copy, Check, TrendingUp, DollarSign, Award, ChevronRight } from 'lucide-react';
import { safeFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export const ReferralNetwork: React.FC = () => {
    const { token, user } = useAuth();
    const [referrals, setReferrals] = useState<any[]>([]);
    const [stats, setStats] = useState({ total_referred: 0, pending_commissions: 0, paid_commissions: 0 });
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    const referralLink = `${window.location.origin}/signup?ref=${user?.id}`;

    const fetchReferralData = async () => {
        try {
            const [refData, statData] = await Promise.all([
                safeFetch('/api/referrals', { headers: { 'Authorization': `Bearer ${token}` } }),
                safeFetch('/api/referrals/stats', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            setReferrals(refData);
            setStats(statData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferralData();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div>
                    <h1 className="text-white mb-2">Global Referral Network</h1>
                    <p className="text-white/40 font-medium text-sm">Empower your network and earn 0.5% commission on all successful syndications.</p>
                </div>
                <div className="bg-logo-gradient p-[1px] rounded-3xl w-full md:w-auto">
                    <div className="bg-navy-950 rounded-[23px] p-6 flex items-center gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Your Private Invite Link</p>
                            <p className="text-xs font-mono text-accent-blue truncate max-w-[200px]">{referralLink}</p>
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 text-white"
                        >
                            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="clean-card p-8 flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Referred</p>
                        <p className="text-2xl font-black text-white">{stats.total_referred}</p>
                    </div>
                </div>
                <div className="clean-card p-8 flex items-center gap-6">
                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Pending Yield</p>
                        <p className="text-2xl font-black text-white">${stats.pending_commissions.toLocaleString()}</p>
                    </div>
                </div>
                <div className="clean-card p-8 flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                        <Award size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Payouts</p>
                        <p className="text-2xl font-black text-white">${stats.paid_commissions.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="clean-card p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <Gift className="text-accent-blue" />
                            Network Growth
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="animate-pulse bg-white/5 h-20 rounded-2xl" />
                        ) : referrals.length === 0 ? (
                            <p className="text-white/20 text-xs italic py-4">Your network is currently empty. Start inviting partners to scale your yield.</p>
                        ) : (
                            referrals.map((ref, idx) => (
                                <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-logo-gradient rounded-full flex items-center justify-center text-[10px] font-black">{ref.name[0]}</div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{ref.name}</p>
                                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{ref.tier} Tier • Joined {new Date(ref.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${ref.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/30 border border-white/10'
                                        }`}>
                                        {ref.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="clean-card p-10 space-y-8 bg-logo-gradient/5">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <DollarSign className="text-emerald-400" />
                        Commission Engine
                    </h3>
                    <div className="p-8 bg-black/40 rounded-3xl border border-white/10 space-y-6">
                        <div className="flex justify-between items-center pb-6 border-b border-white/5">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Referral Bonus Rate</span>
                            <span className="text-lg font-black text-white">0.50%</span>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] text-white/40 font-medium leading-relaxed">
                                Commissions are calculated on the total investment amount of your referred partners for any property syndicate they join. Payouts are released once the project milestone "Escrow Release" is triggered.
                            </p>
                            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <Check size={14} /> Active Synergy Protocol
                            </div>
                        </div>
                        <button className="w-full py-4 bg-white text-navy-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                            <Share2 size={16} /> Broadcast Network Invite
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
