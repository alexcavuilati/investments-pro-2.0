import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Zap, CreditCard, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface TrialOverlayProps {
  user: User | null;
  onUpgrade: () => void;
}

export const TrialOverlay: React.FC<TrialOverlayProps> = ({ user, onUpgrade }) => {
  if (!user || !user.trial_ends_at) return null;

  const trialEndsAt = new Date(user.trial_ends_at);
  const now = new Date();
  const isExpired = now > trialEndsAt;

  if (!isExpired) return null;

  // Only show for STANDARD users who haven't upgraded yet
  if (user.tier !== 'STANDARD') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-navy-900 border border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl shadow-blue-500/10"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-400">
          <AlertTriangle size={40} />
        </div>
        
        <h2 className="text-3xl font-black text-white tracking-tight mb-4 uppercase">Trial Expired</h2>
        <p className="text-white/40 font-medium leading-relaxed mb-10">
          Your 3-day institutional trial has concluded. To maintain access to the Global Fiscal Engine, AI Insights, and the Investor Network, please upgrade to a professional tier.
        </p>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
            <Zap className="text-accent-blue shrink-0" size={20} />
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest">AI Fiscal Engine</p>
              <p className="text-[10px] text-white/30">Real-time global tax & legal analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
            <ShieldCheck className="text-accent-blue shrink-0" size={20} />
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest">KYC Vault</p>
              <p className="text-[10px] text-white/30">Secure institutional document storage</p>
            </div>
          </div>
        </div>

        <button
          onClick={onUpgrade}
          className="w-full py-5 bg-logo-gradient text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <CreditCard size={18} />
          Upgrade Account
        </button>
        
        <p className="mt-6 text-[10px] font-black text-white/20 uppercase tracking-widest">
          Secure Institutional Billing
        </p>
      </motion.div>
    </div>
  );
};
