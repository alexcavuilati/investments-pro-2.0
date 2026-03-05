import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, CreditCard, Shield, Zap, Building2, Landmark, FileText } from 'lucide-react';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { safeFetch } from '../utils/api';

interface SubscriptionProps {
  user: User | null;
}

export function Subscription({ user }: SubscriptionProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'BSP' | 'DIRECT'>('STRIPE');

  const handleUpgrade = async (tier: 'STANDARD' | 'PRO' | 'ENTERPRISE') => {
    if (tier === 'ENTERPRISE') {
      const subject = encodeURIComponent('Enterprise Tier Interest - INVESTMENTS PRO 2.0');
      const body = encodeURIComponent('I am interested in the Enterprise Tier for INVESTMENTS PRO 2.0. Please contact me with more information.');
      window.location.href = `mailto:director_bulaclear@outlook.co.nz?subject=${subject}&body=${body}`;
      return;
    }
    setLoading(tier);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (paymentMethod === 'STRIPE') {
        const data = await safeFetch('/api/create-checkout-session', {
          method: 'POST',
          headers,
          body: JSON.stringify({ tier }),
        });
        
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Failed to create checkout session');
        }
      } else {
        // BSP Payment Flow
        const data = await safeFetch('/api/bsp/initiate', {
          method: 'POST',
          headers,
          body: JSON.stringify({ tier }),
        });
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          throw new Error(data.error || 'Failed to initiate BSP payment');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Payment initialization failed. Please ensure gateway keys are configured.');
    } finally {
      setLoading(null);
    }
  };

  const tiers = [
    {
      id: 'STANDARD',
      name: 'Standard Investor',
      price: '$120',
      period: 'per month',
      description: 'Essential tools for individual global investors.',
      features: [
        'Advanced Fiscal Intelligence',
        'Standard KYC Vault',
        'Up to 10 Saved Projects',
        'Standard Risk Assessment',
        'Email Support'
      ],
      icon: <Building2 size={24} />,
      color: 'navy'
    },
    {
      id: 'PRO',
      name: 'Pro Institutional',
      price: '$300',
      period: 'per month',
      description: 'Advanced tools for serious capital deployment and deal hunting.',
      features: [
        'Advanced 2026 Fiscal Engine',
        'Jurisdictional Intelligence Overlay',
        'Climate-Adaptive NPV Overlay',
        'Unlimited Saved Projects',
        'Autonomous Deal Hunter Access',
        'IoT Digital Twin Integration',
        'Priority Institutional Support',
        'Invite Friends & Network Hub'
      ],
      icon: <Zap size={24} />,
      color: 'navy',
      popular: true
    },
    {
      id: 'ENTERPRISE',
      name: 'Global Enterprise',
      price: 'Custom',
      period: 'tailored pricing',
      description: 'Bespoke solutions for large-scale institutional capital.',
      features: [
        'White-label Integration',
        'Dedicated Account Manager',
        'Custom API Access',
        'On-premise Deployment Options',
        'Bespoke Risk Modeling',
        'Full Network Administration'
      ],
      icon: <Shield size={24} />,
      color: 'navy'
    }
  ];

  return (
    <div className="space-y-16 md:space-y-24">
      <div className="text-center max-w-4xl mx-auto space-y-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white/40 border border-white/5"
        >
          Institutional Access
        </motion.div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9]">
          Deploy Capital with <span className="text-white/20">Precision.</span>
        </h1>
        <p className="text-lg md:text-xl font-medium text-white/50 max-w-2xl mx-auto leading-relaxed">
          Unlock the full power of PropCapital 2026. Connect your capital to global opportunities with institutional-grade intelligence.
        </p>
        
        {user?.tier === 'STANDARD' && user?.trial_ends_at && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl max-w-md mx-auto"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-widest">Active Trial Period</p>
                <p className="text-sm font-bold text-blue-400">
                  {Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days remaining
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex justify-center px-4">
        <div className="bg-white/5 p-2 rounded-[2.5rem] flex gap-2 border border-white/5 shadow-inner">
          <button
            onClick={() => setPaymentMethod('STRIPE')}
            className={`px-6 md:px-10 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all duration-500 ${
              paymentMethod === 'STRIPE'
                ? 'bg-logo-gradient text-white shadow-2xl shadow-blue-500/20'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            Stripe (Global)
          </button>
          <button
            onClick={() => setPaymentMethod('BSP')}
            className={`px-6 md:px-10 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all duration-500 ${
              paymentMethod === 'BSP'
                ? 'bg-logo-gradient text-white shadow-2xl shadow-blue-500/20'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            BSP Pay (Pacific)
          </button>
          <button
            onClick={() => setPaymentMethod('DIRECT')}
            className={`px-6 md:px-10 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all duration-500 ${
              paymentMethod === 'DIRECT'
                ? 'bg-logo-gradient text-white shadow-2xl shadow-blue-500/20'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            Direct Transfer
          </button>
        </div>
      </div>

      {paymentMethod === 'DIRECT' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto px-4 mb-16"
        >
          <div className="bg-navy-900 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                <Landmark size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Direct Institutional Transfer</h3>
                <p className="text-sm font-medium text-white/40 uppercase tracking-widest">Manual Settlement Details</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Account Name</p>
                  <p className="text-lg font-bold text-white">Alekesio Cavuilati</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Bank Account Number</p>
                  <p className="text-lg font-bold text-white">6330169</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">SWIFT Code</p>
                  <p className="text-lg font-bold text-white">BOSPFJFJ</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Payment Reference</p>
                  <p className="text-lg font-bold text-blue-400">Investment Pro Sub</p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
              <p className="text-xs text-white/60 leading-relaxed">
                <span className="text-blue-400 font-bold">Note:</span> After completing the transfer, please email your transaction receipt to <span className="text-white font-bold">director_bulaclear@outlook.co.nz</span> to activate your institutional tier manually.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto px-4">
        {tiers.map((tier, idx) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -10 }}
            className={`relative clean-card p-10 md:p-12 flex flex-col transition-all duration-700 ${
              tier.popular 
                ? 'bg-logo-gradient text-white border-none shadow-[0_60px_100px_-15px_rgba(0,209,255,0.2)] scale-110 z-20 ring-4 ring-white/10' 
                : 'bg-white/5 border-white/5 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] z-10'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-logo-gradient text-white text-[10px] font-black px-8 py-2.5 rounded-full uppercase tracking-[0.3em] border-2 border-white/20 shadow-2xl z-20">
                Most Popular
              </div>
            )}

            <div className="flex items-center justify-between mb-12">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${tier.popular ? 'bg-white/10' : 'bg-white/5'}`}>
                {React.cloneElement(tier.icon as React.ReactElement, { 
                  className: 'text-white',
                  size: 32
                })}
              </div>
              <div className="text-right">
                <div className="text-5xl font-black tracking-tighter text-white">
                  {tier.price}
                </div>
                <div className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 ${tier.popular ? 'text-white/40' : 'text-white/30'}`}>
                  {tier.period}
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h4 className="text-3xl font-black tracking-tight mb-4 text-white">
                {tier.name}
              </h4>
              <p className={`text-sm font-medium leading-relaxed ${tier.popular ? 'text-white/60' : 'text-white/50'}`}>
                {tier.description}
              </p>
            </div>

            <div className="space-y-6 mb-16 flex-1">
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-4 group/item">
                  <div className={`mt-1 p-1 rounded-full transition-colors ${tier.popular ? 'bg-white/20 group-hover/item:bg-white/40' : 'bg-white/5 group-hover/item:bg-white/10'}`}>
                    <Check size={12} className="text-white" />
                  </div>
                  <span className={`text-sm font-medium transition-colors ${tier.popular ? 'text-white/70 group-hover/item:text-white' : 'text-white/70 group-hover/item:text-white'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleUpgrade(tier.id as 'STANDARD' | 'PRO' | 'ENTERPRISE')}
              disabled={user?.tier === tier.id || !!loading}
              className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 ${
                user?.tier === tier.id
                  ? 'bg-white/5 text-white/20 cursor-default border border-white/5'
                  : tier.popular
                  ? 'bg-white text-navy-950 hover:bg-gray-100 shadow-2xl shadow-white/20'
                  : 'btn-outline'
              }`}
            >
              {loading === tier.id ? (
                <div className={`w-6 h-6 border-3 rounded-full animate-spin ${tier.popular ? 'border-navy-950/30 border-t-navy-950' : 'border-white/30 border-t-white'}`} />
              ) : user?.tier === tier.id ? (
                'CURRENT TIER'
              ) : tier.id === 'ENTERPRISE' ? (
                <>
                  <FileText size={18} />
                  CONTACT US
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  UPGRADE NOW
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center">
          <h3 className="text-2xl font-black text-white tracking-tight mb-2">Compare Institutional Tiers</h3>
          <p className="text-sm font-medium text-white/40 uppercase tracking-widest">Detailed Feature Breakdown</p>
        </div>

        <div className="clean-card overflow-hidden border-white/5 shadow-2xl shadow-blue-500/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-white">
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em]">Feature</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-center">Standard</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-center bg-white/5">Pro</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: 'Monthly Price', s: '$120', p: '$300', e: 'Custom' },
                  { name: 'Fiscal Intelligence', s: 'Advanced', p: 'Institutional+', e: 'Custom' },
                  { name: 'Jurisdictional Intelligence', s: 'Basic', p: 'Full (Auto-Tax)', e: 'Full + Legal' },
                  { name: 'KYC Vault Storage', s: 'Standard', p: 'Unlimited', e: 'Bespoke' },
                  { name: 'Project Capacity', s: '10 Projects', p: 'Unlimited', e: 'Unlimited' },
                  { name: 'Autonomous Deal Hunter', s: 'Partial', p: 'Full Access', e: 'Full Access' },
                  { name: 'Digital Twin Integration', s: 'No', p: 'Yes', e: 'Yes' },
                  { name: 'API Access', s: 'No', p: 'Standard', e: 'Full/Custom' },
                  { name: 'Support Tier', s: 'Email', p: 'Priority', e: 'Dedicated' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 text-sm font-bold text-white">{row.name}</td>
                    <td className="p-6 text-sm font-medium text-white/60 text-center">{row.s}</td>
                    <td className="p-6 text-sm font-black text-white text-center bg-white/[0.02]">{row.p}</td>
                    <td className="p-6 text-sm font-medium text-white/60 text-center">{row.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="clean-card p-10 md:p-16 bg-white/5 flex flex-col lg:flex-row items-center gap-12 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-white/10 transition-all duration-1000" />
          <div className="p-8 bg-white/5 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-white/5 relative z-10 group-hover:scale-110 transition-transform duration-700">
            <Landmark size={56} className="text-white" />
          </div>
          <div className="flex-1 text-center lg:text-left relative z-10">
            <h4 className="text-3xl font-black text-white mb-4 tracking-tight">Connect Your Bank Account</h4>
            <p className="text-base font-medium text-white/40 leading-relaxed max-w-2xl">
              Securely link your institutional bank account via Stripe Financial Connections for seamless capital deployment and proof-of-funds verification.
            </p>
          </div>
          <button className="w-full lg:w-auto px-12 py-6 bg-logo-gradient rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white hover:opacity-90 transition-all duration-500 active:scale-95 shadow-2xl shadow-blue-500/20 relative z-10">
            CONNECT ACCOUNT
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-12 pb-16 px-4">
        <div className="flex items-center gap-3 font-black text-white text-[10px] uppercase tracking-[0.3em] opacity-30">
          <Shield size={20} /> Secure Payments
        </div>
        <div className="w-px h-8 bg-white/10 hidden md:block"></div>
        <div className="font-black text-white tracking-tighter text-2xl opacity-30">STRIPE</div>
        <div className="w-px h-8 bg-white/10 hidden md:block"></div>
        <div className="font-black text-white text-[10px] uppercase tracking-[0.3em] opacity-30">PCI COMPLIANT</div>
      </div>
    </div>
  );
}
