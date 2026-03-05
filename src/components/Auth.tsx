import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User as UserIcon, TrendingUp, ArrowRight, Shield, Globe, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { safeFetch } from '../utils/api';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { email, password, name };
      
      const data = await safeFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-logo-gradient rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-blue-500/20">
            <TrendingUp size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">INVESTMENTS PRO</h1>
          <p className="text-white/40 font-medium uppercase tracking-[0.3em] text-xs">Institutional Wealth Platform</p>
        </div>

        <div className="bg-navy-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex gap-4 mb-10 p-1 bg-white/5 rounded-2xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-navy-950 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-navy-950 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3"
              >
                <Zap size={16} />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-logo-gradient text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] shadow-xl shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20">
                <Shield size={20} />
              </div>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20">
                <Globe size={20} />
              </div>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Global</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/20">
                <Zap size={20} />
              </div>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Instant</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
