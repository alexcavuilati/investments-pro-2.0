import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Mail, Share2, Users } from 'lucide-react';

interface InviteFriendsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteFriends({ isOpen, onClose }: InviteFriendsProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const inviteLink = `https://investments-pro.app/join?ref=user_${Math.random().toString(36).substring(7)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setEmail('');
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-navy-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-logo-gradient rounded-xl text-white">
                    <Users size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Invite Friends</h3>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={20} className="text-white/30" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Share Invite Link</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/5 px-4 py-3 rounded-xl text-sm font-mono text-white/40 truncate border border-white/5">
                      {inviteLink}
                    </div>
                    <button 
                      onClick={handleCopy}
                      className={`p-3 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-logo-gradient text-white hover:opacity-90'}`}
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-navy-900 px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Or send via email</span>
                  </div>
                </div>

                <form onSubmit={handleSendInvite} className="space-y-4">
                  <div>
                    <input 
                      type="email" 
                      placeholder="friend@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={sent}
                    className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 ${sent ? 'bg-emerald-500 text-white' : 'bg-white text-navy-950 hover:bg-gray-100'}`}
                  >
                    {sent ? (
                      <>
                        <Check size={18} />
                        Invite Sent!
                      </>
                    ) : (
                      <>
                        <Mail size={18} />
                        Send Invitation
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg shadow-sm">
                    <Share2 size={16} className="text-white" />
                  </div>
                  <p className="text-[10px] font-medium text-white/40 leading-relaxed">
                    Invite your network to PropCapital and earn exclusive institutional insights for every successful referral.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
