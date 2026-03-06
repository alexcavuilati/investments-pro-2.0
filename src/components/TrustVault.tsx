import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, FileText, PenTool, CheckCircle, Clock, AlertTriangle, Lock, Eye } from 'lucide-react';
import { safeFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface LegalDocument {
    id: number;
    title: string;
    content: string;
    status: 'DRAFT' | 'ACTIVE' | 'SIGNED';
    created_at: string;
}

export const TrustVault: React.FC<{ projectId?: number }> = ({ projectId }) => {
    const { token, user } = useAuth();
    const [documents, setDocuments] = useState<LegalDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [signingId, setSigningId] = useState<number | null>(null);

    const fetchDocs = async () => {
        if (!projectId) return;
        try {
            const data = await safeFetch(`/api/legal/documents/${projectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDocuments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, [projectId]);

    const handleSign = async (docId: number) => {
        try {
            const signatureHash = btoa(`${user?.email}-${Date.now()}`); // Simple simulation
            await safeFetch('/api/legal/sign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ document_id: docId, signature_hash: signatureHash })
            });
            fetchDocs();
            setSigningId(null);
        } catch (err) {
            console.error(err);
        }
    };

    if (!projectId) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <Shield className="text-accent-blue" />
                    Digital Trust Vault
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    <Lock size={12} className="text-emerald-400/50" />
                    AES-256 Encrypted
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="animate-pulse bg-white/5 h-32 rounded-3xl" />
                ) : documents.length === 0 ? (
                    <div className="p-12 text-center bg-navy-900/40 border border-white/5 rounded-[2.5rem] border-dashed">
                        <FileText size={48} className="mx-auto text-white/10 mb-4" />
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">No active legal documents for this project</p>
                    </div>
                ) : (
                    documents.map((doc) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-navy-900/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden group hover:border-white/20 transition-all"
                        >
                            <div className="p-6 flex items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-accent-blue/10 transition-colors">
                                        <FileText className="text-white/40 group-hover:text-accent-blue" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm mb-1">{doc.title}</h4>
                                        <div className="flex items-center gap-3 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} /> {new Date(doc.created_at).toLocaleDateString()}
                                            </span>
                                            <span>•</span>
                                            <span className={`flex items-center gap-1 ${doc.status === 'SIGNED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {doc.status === 'SIGNED' ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                                                {doc.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button className="p-2.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl transition-all border border-white/5">
                                        <Eye size={18} />
                                    </button>
                                    {doc.status !== 'SIGNED' && (
                                        <button
                                            onClick={() => setSigningId(doc.id)}
                                            className="px-6 py-2.5 bg-accent-blue hover:bg-accent-blue/90 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-accent-blue/20 flex items-center gap-2"
                                        >
                                            <PenTool size={14} />
                                            Sign Now
                                        </button>
                                    )}
                                </div>
                            </div>

                            <AnimatePresence>
                                {signingId === doc.id && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden bg-black/40 border-t border-white/5"
                                    >
                                        <div className="p-8 space-y-6">
                                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 prose prose-invert prose-xs max-w-none">
                                                <p className="text-white/60 leading-relaxed italic">{doc.content}</p>
                                            </div>

                                            <div className="flex items-center justify-between gap-8">
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Legal Consent</p>
                                                    <p className="text-[10px] text-white/40 font-bold leading-tight">By clicking confirm, you apply a cryptographic signature to this document, binding your account to the terms specified above.</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSigningId(null)}
                                                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSign(doc.id)}
                                                        className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                                    >
                                                        Confirm Signature
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
