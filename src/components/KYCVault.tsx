import React from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, Upload, CheckCircle2, AlertCircle, Clock, Download, Trash2, Eye } from 'lucide-react';

interface DocRowProps {
  name: string;
  status: 'VERIFIED' | 'PENDING' | 'EXPIRED';
  date: string;
  type: string;
}

function DocRow({ name, status, date, type }: any) {
  const statusColors = {
    VERIFIED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    EXPIRED: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  const statusIcons = {
    VERIFIED: <CheckCircle2 size={12} />,
    PENDING: <Clock size={12} />,
    EXPIRED: <AlertCircle size={12} />
  };

  return (
    <div className="group p-6 bg-white/5 rounded-[2rem] border border-transparent hover:border-white/10 hover:bg-white/5 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white group-hover:bg-logo-gradient group-hover:text-white transition-all duration-500">
          <FileText size={28} />
        </div>
        <div>
          <div className="text-lg font-black text-white tracking-tight mb-1">{name}</div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{type} • {date}</span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${statusColors[status as keyof typeof statusColors]}`}>
              {statusIcons[status as keyof typeof statusIcons]}
              {status}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:justify-end w-full sm:w-auto">
        <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white hover:shadow-lg transition-all active:scale-95">
          <Eye size={18} />
        </button>
        <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white hover:shadow-lg transition-all active:scale-95">
          <Download size={18} />
        </button>
        <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-rose-400/40 hover:text-rose-400 hover:shadow-lg transition-all active:scale-95">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export function KYCVault({ docs, user }: { docs: any[], user: any }) {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <h1 className="text-white mb-2">Investor Passport</h1>
          <p className="text-white/40 font-medium">Secure, encrypted institutional KYC storage for {user?.name}.</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 border shadow-sm ${user?.kyc_status === 'VERIFIED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'}`}>
            <Shield size={16} />
            {user?.kyc_status}
          </div>
          <button className="btn-primary px-8 py-4 flex items-center justify-center gap-3">
            <Upload size={20} /> Upload Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="clean-card p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-white tracking-tight">Active Documents</h3>
              <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{docs.length} Documents Total</div>
            </div>
            <div className="space-y-4">
              {docs.length > 0 ? docs.map((doc, i) => (
                <DocRow key={i} name={doc.type} status={(doc.status || 'VERIFIED') as 'VERIFIED' | 'PENDING' | 'EXPIRED'} date="Exp: 2029" type={doc.type} />
              )) : (
                <>
                  <DocRow name="Passport - Fiji" status="VERIFIED" date="Exp: 2029" type="Identity" />
                  <DocRow name="Proof of Funds - Westpac" status="PENDING" date="Uploaded Today" type="Financial" />
                  <DocRow name="Tax Residency - Australia" status="VERIFIED" date="Exp: 2026" type="Legal" />
                </>
              )}
            </div>
          </div>

          <div className="clean-card p-12 border-dashed border-2 border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-all duration-500">
            <div className="p-6 bg-white/5 rounded-[2rem] shadow-xl shadow-blue-500/5 mb-6 group-hover:scale-110 transition-transform">
              <Upload size={32} className="text-white" />
            </div>
            <div className="font-black text-white text-lg mb-2 tracking-tight">Upload New Document</div>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-8">PDF, JPG, PNG (Max 25MB)</p>
            <button className="btn-primary">Select Files</button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="clean-card p-10 bg-navy-900 text-white space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-700" />
            <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-white mb-6 relative z-10">
              <Shield size={32} />
            </div>
            <h4 className="text-2xl font-black tracking-tight relative z-10">Auto-Injection Hub</h4>
            <p className="text-sm font-medium text-white/60 leading-relaxed relative z-10">
              Your verified KYC data is automatically injected into EOIs, FIRB applications, and bank loan packages.
            </p>
            <div className="pt-6 border-t border-white/10 space-y-4 relative z-10">
              <div className="flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-widest">
                <CheckCircle2 size={14} className="text-emerald-400" /> Fiji SLIP Application Ready
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-widest">
                <CheckCircle2 size={14} className="text-emerald-400" /> AUS FIRB Package Ready
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-widest">
                <Clock size={14} className="text-amber-400" /> UAE Golden Visa (Missing Deeds)
              </div>
            </div>
          </div>

          <div className="clean-card p-8 border-blue-500/20 bg-blue-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Clock size={48} className="text-blue-400" />
            </div>
            <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Verification Status</h5>
            <p className="text-xs text-blue-400/70 leading-relaxed font-medium">
              Institutional verification typically takes 24-48 hours. Connect your bank account to expedite the proof-of-funds process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
