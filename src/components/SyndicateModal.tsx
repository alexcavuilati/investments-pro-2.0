import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, TrendingUp, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { safeFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface SyndicateModalProps {
    syndicate: {
        id: number;
        project_name: string;
        total_valuation: number;
        available_equity: number;
        min_investment: number;
    };
    onClose: () => void;
    onSuccess: () => void;
}

export const SyndicateModal: React.FC<SyndicateModalProps> = ({ syndicate, onClose, onSuccess }) => {
    const { token } = useAuth();
    const [amount, setAmount] = useState(syndicate.min_investment.toString());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const equityPercent = (parseFloat(amount) / syndicate.total_valuation) * 100;
    const isInvalid = parseFloat(amount) < syndicate.min_investment || equityPercent > syndicate.available_equity;

    const handleInvest = async () => {
        setLoading(true);
        setError(null);
        try {
            await safeFetch(`/api/syndicates/${syndicate.id}/invest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: parseFloat(amount) })
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Investment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-navy-950 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
                <div className="bg-logo-gradient p-6 flex justify-between items-center text-white">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight uppercase">Fractional Investment</h3>
                        <p className="text-xs opacity-80 font-medium">Project: {syndicate.project_name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Total Valuation</p>
                            <p className="text-lg font-black text-white">${syndicate.total_valuation.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Avail. Equity</p>
                            <p className="text-lg font-black text-emerald-400">{syndicate.available_equity.toFixed(2)}%</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Investment Amount (USD)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-blue" size={20} />
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xl font-black text-white focus:outline-none focus:border-accent-blue/50 transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-white/30 mt-2 font-medium">Minimum Investment: ${syndicate.min_investment.toLocaleString()}</p>
                        </div>

                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Share to Acquire</span>
                                <span className="text-sm font-black text-white">{equityPercent.toFixed(2)}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (equityPercent / syndicate.available_equity) * 100)}%` }}
                                    className="h-full bg-accent-blue"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={handleInvest}
                            disabled={loading || isInvalid}
                            className="w-full py-4 bg-accent-blue hover:bg-accent-blue/80 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-accent-blue/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Zap size={18} fill="currentColor" />
                                    Confirm Investment
                                </>
                            )}
                        </button>
                        <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                            <ShieldCheck size={14} className="text-emerald-400/50" />
                            Secured by Digital Trust Protocol
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
