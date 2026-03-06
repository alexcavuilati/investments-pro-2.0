import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gavel, Search, BookOpen, Scale, ShieldCheck, ChevronRight, Globe, AlertCircle, Info } from 'lucide-react';
import { lawGPT } from '../services/geminiService';

export const LawGPT: React.FC<{ country: string }> = ({ country }) => {
    const [topic, setTopic] = useState('');
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!topic) return;
        setLoading(true);
        const result = await lawGPT(country, topic);
        setAnalysis(result);
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <Gavel className="text-accent-blue" />
                    Jurisdictional Law-GPT
                </h3>
                <span className="px-3 py-1.5 bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest rounded-full border border-white/5 flex items-center gap-2">
                    <Globe size={12} className="text-accent-blue/50" />
                    Searching {country} Statutes
                </span>
            </div>

            <div className="relative group">
                <div className="absolute inset-0 bg-accent-blue/20 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="relative bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-2 flex gap-2">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., FIRB restrictions for Fiji residents in AU..."
                        className="flex-1 bg-transparent px-6 py-4 text-white placeholder:text-white/20 focus:outline-none font-medium"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading || !topic}
                        className="px-8 bg-white text-navy-950 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center gap-2"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" /> : <Search size={16} />}
                        Analyze
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {analysis ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                                    <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                                        <BookOpen size={16} className="text-accent-blue" />
                                        Legal Interpretation
                                    </h4>
                                    <p className="text-white/60 text-xs leading-relaxed font-medium">{analysis.legal_interpretation}</p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-2 flex items-center justify-between">
                                        Case Law Precedents
                                        <Scale size={14} />
                                    </h4>
                                    {analysis.precedents.map((p: any, idx: number) => (
                                        <div key={idx} className="bg-navy-900/40 border border-white/10 rounded-2xl p-6 group hover:border-white/20 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-accent-blue font-bold text-xs">{p.case_name}</span>
                                                <span className="text-white/20 font-black text-[10px] tracking-widest">{p.year}</span>
                                            </div>
                                            <p className="text-white/40 text-[10px] leading-relaxed">{p.summary}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-accent-blue/5 border border-accent-blue/10 rounded-3xl p-6">
                                    <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-emerald-400" />
                                        Compliance Checklist
                                    </h4>
                                    <div className="space-y-3">
                                        {analysis.compliance_checklist.map((item: string, idx: number) => (
                                            <div key={idx} className="flex gap-3 text-[10px] text-white/60 font-medium">
                                                <div className="mt-0.5"><ChevronRight size={14} className="text-accent-blue" /></div>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6">
                                    <h4 className="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        Strategic Advice
                                    </h4>
                                    <p className="text-amber-500/80 text-[10px] leading-relaxed font-bold italic">{analysis.strategic_recommendation}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                            {analysis.primary_statutes.map((s: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-white/40 uppercase tracking-widest">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                ) : !loading && (
                    <div className="p-12 text-center bg-navy-900/40 border border-white/5 rounded-[2.5rem] border-dashed">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Info size={24} className="text-white/10" />
                        </div>
                        <p className="text-white/20 text-xs font-bold uppercase tracking-[0.2em]">Enter a legal topic to begin deep-dive analysis</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
