import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ArrowRight, TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react';
import { marketYieldAlerts } from '../services/geminiService';

export const MarketYieldAlerts: React.FC<{ country: string }> = ({ country }) => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            setLoading(true);
            const data = await marketYieldAlerts(country);
            setAlerts(data);
            setLoading(false);
        };
        fetchAlerts();
    }, [country]);

    if (loading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {[1, 2].map(i => (
                    <div key={i} className="min-w-[320px] h-32 bg-navy-900/40 rounded-3xl animate-pulse border border-white/5" />
                ))}
            </div>
        );
    }

    if (alerts.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                    Proactive Yield Alerts
                </h3>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                <AnimatePresence>
                    {alerts.map((alert, idx) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="min-w-[340px] bg-logo-gradient p-[1px] rounded-3xl shadow-xl group"
                        >
                            <div className="bg-navy-950 rounded-[23px] p-5 h-full flex flex-col justify-between hover:bg-navy-950/80 transition-colors">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${alert.urgency === 'HIGH' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                            }`}>
                                            {alert.type} • {alert.urgency} Priority
                                        </div>
                                        <div className="text-emerald-400 text-xs font-black flex items-center gap-1">
                                            <TrendingUp size={12} />
                                            {alert.projected_yield_boost}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm leading-tight group-hover:text-accent-blue transition-colors">{alert.title}</h4>
                                        <p className="text-white/40 text-[10px] line-clamp-2 mt-1">{alert.description}</p>
                                    </div>
                                </div>

                                <button className="mt-4 flex items-center justify-between w-full group/btn">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        {alert.action_label}
                                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </span>
                                    <ShieldCheck size={14} className="text-white/20" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
