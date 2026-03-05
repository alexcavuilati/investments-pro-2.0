import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Shield, CreditCard, LogOut, Mail, Phone, MapPin, Edit3, Bell, Globe, Zap, Save, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { safeFetch } from '../utils/api';

import { User } from '../types';

interface NotificationSettings {
  email_alerts: number;
  push_notifications: number;
  market_updates: number;
  deal_alerts: number;
}

export function Profile({ user: propUser }: { user?: User | null }) {
  const { user: authUser, logout, token, refreshUser } = useAuth();
  const user = propUser || authUser;
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    phone: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        bio: user.bio || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_alerts: 1,
    push_notifications: 1,
    market_updates: 1,
    deal_alerts: 1
  });
  const [activity, setActivity] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchActivity();
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const data = await safeFetch('/api/notifications/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivity = async () => {
    try {
      const data = await safeFetch('/api/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setActivity(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await safeFetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      setIsEditing(false);
      await refreshUser();
      fetchActivity();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = async (key: keyof NotificationSettings) => {
    const newSettings = { ...notifications, [key]: notifications[key] ? 0 : 1 };
    setNotifications(newSettings);
    try {
      await safeFetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-navy-900/30 rounded-3xl border border-white/5">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Loading Profile Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-8"
        >
          <div className="clean-card p-10 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-logo-gradient opacity-10"></div>
            
            <div className="relative mt-8">
              <div className="w-32 h-32 rounded-[2.5rem] bg-navy-800 mx-auto border-4 border-navy-950 overflow-hidden shadow-2xl flex items-center justify-center text-white text-4xl font-black">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0) || <UserIcon size={40} />
                )}
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="absolute bottom-0 right-1/2 translate-x-16 p-3 bg-logo-gradient rounded-2xl text-white shadow-xl hover:scale-110 transition-all"
              >
                <Edit3 size={18} />
              </button>
            </div>

            <div className="mt-8">
              <h2 className="text-3xl font-black text-white tracking-tight">{user.name || 'Anonymous Investor'}</h2>
              <div className="inline-block px-4 py-1.5 bg-logo-gradient text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mt-3 shadow-lg shadow-blue-500/10">
                {user.tier || 'STANDARD'} INVESTOR
              </div>
              <p className="text-white/40 text-sm mt-6 font-medium italic leading-relaxed">
                {user.bio || 'No bio yet. Define your investment strategy.'}
              </p>
            </div>

            <div className="mt-10 pt-10 border-t border-white/5 space-y-5">
              <div className="flex items-center gap-4 text-white/60 text-sm font-bold">
                <div className="p-2 bg-white/5 rounded-lg"><Mail size={16} className="text-blue-400" /></div>
                {user.email}
              </div>
              <div className="flex items-center gap-4 text-white/60 text-sm font-bold">
                <div className="p-2 bg-white/5 rounded-lg"><Phone size={16} className="text-blue-400" /></div>
                {user.phone || 'Not provided'}
              </div>
              <div className="flex items-center gap-4 text-white/60 text-sm font-bold">
                <div className="p-2 bg-white/5 rounded-lg"><Globe size={16} className="text-blue-400" /></div>
                {user.country_of_origin || 'Global'}
              </div>
            </div>

            <button
              onClick={logout}
              className="mt-10 w-full py-4 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-2xl transition-all flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest border border-red-500/10"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>

          {/* Verification */}
          <div className="clean-card p-8">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <Shield size={18} />
              Verification Status
            </h3>
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5">
              <span className="text-sm font-bold text-white/40 uppercase tracking-widest">KYC Level 1</span>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                user.kyc_status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {user.kyc_status}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-12"
        >
          {isEditing ? (
            <div className="clean-card p-10">
              <h3 className="text-2xl font-black text-white mb-10 tracking-tight">Edit Profile</h3>
              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Phone Number</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Avatar URL</label>
                  <input
                    type="text"
                    value={profileForm.avatar_url}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Bio / Strategy</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold h-40 resize-none"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-6 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary px-10 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
                  >
                    {saving ? <Zap size={16} className="animate-pulse" /> : <Save size={16} />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Notification Preferences */}
              <div className="clean-card p-10">
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                  <Bell size={18} />
                  Notification Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'email_alerts', label: 'Email Alerts', desc: 'Critical account and security updates' },
                    { key: 'push_notifications', label: 'Push Notifications', desc: 'Real-time mobile and desktop alerts' },
                    { key: 'market_updates', label: 'Market Insights', desc: 'Daily AI-powered fiscal reports' },
                    { key: 'deal_alerts', label: 'Deal Hunter Alerts', desc: 'Notifications for high-ROI opportunities' }
                  ].map((pref) => (
                    <div key={pref.key} className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 group hover:bg-white/10 transition-all duration-500">
                      <div>
                        <p className="text-white font-black text-sm tracking-tight">{pref.label}</p>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">{pref.desc}</p>
                      </div>
                      <button
                        onClick={() => toggleNotification(pref.key as keyof NotificationSettings)}
                        className={`w-14 h-7 rounded-full relative transition-all duration-500 ${notifications[pref.key as keyof NotificationSettings] ? 'bg-logo-gradient shadow-lg shadow-blue-500/20' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1.5 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-sm ${notifications[pref.key as keyof NotificationSettings] ? 'left-8' : 'left-2'}`}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="clean-card p-10">
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                  <Activity size={18} />
                  Recent Activity
                </h3>
                <div className="space-y-6">
                  {activity.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                      <p className="text-white/20 font-black text-[10px] uppercase tracking-widest">No recent activity recorded.</p>
                    </div>
                  ) : (
                    activity.map((log) => (
                      <div key={log.id} className="flex gap-6 p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all duration-500">
                        <div className="w-14 h-14 rounded-2xl bg-logo-gradient/10 flex items-center justify-center shrink-0 text-blue-400 shadow-inner">
                          <Zap size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-black text-sm tracking-tight leading-tight">{log.details}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{log.action}</span>
                            <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
