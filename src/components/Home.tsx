import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Image as ImageIcon, Heart, MessageCircle, Share2, TrendingUp, Globe, Zap, MapPin, DollarSign, Calculator, ChevronDown, ChevronUp, Shield, Info, AlertTriangle, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { safeFetch } from '../utils/api';
import { Post, GLOBAL_JURISDICTION_DATA } from '../types';
import { fiscalIntelligence } from '../services/geminiService';

export const Home: React.FC = () => {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [postType, setPostType] = useState<'NORMAL' | 'LISTING'>('NORMAL');
  const [country, setCountry] = useState('US');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [rent, setRent] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);

  const fetchPosts = async () => {
    try {
      const data = await safeFetch('/api/posts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await safeFetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: newPost, 
          image_url: imageUrl,
          type: postType,
          country: postType === 'LISTING' ? country : undefined,
          city: postType === 'LISTING' ? city : undefined,
          price: postType === 'LISTING' ? parseFloat(price) : undefined,
          rent: postType === 'LISTING' ? parseFloat(rent) : undefined
        })
      });
      setNewPost('');
      setImageUrl('');
      setPostType('NORMAL');
      setCity('');
      setPrice('');
      setRent('');
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const runAnalysis = async (post: Post) => {
    if (!post.country || !post.price || !post.rent) return;
    setAnalyzingId(post.id);
    try {
      const jurisdiction = GLOBAL_JURISDICTION_DATA[post.country] || GLOBAL_JURISDICTION_DATA['US'];
      const analysis = await fiscalIntelligence({
        country: post.country,
        state_province: '',
        city_district: post.city || '',
        purchase_price: post.price,
        monthly_rent: post.rent,
        fiscal_variables: {
          stamp_duty_rate: jurisdiction.default_stamp_duty,
          vat_gst_rate: jurisdiction.default_vat_gst,
          capital_gains_tax: jurisdiction.default_cgt,
          incentives: jurisdiction.common_incentives.map(i => ({ ...i, is_active: true }))
        }
      });

      if (analysis) {
        await safeFetch(`/api/posts/${post.id}/analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ analysis })
        });
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await safeFetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Create Post */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-navy-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex gap-4 mb-6 p-1 bg-white/5 rounded-xl w-fit">
          <button
            onClick={() => setPostType('NORMAL')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${postType === 'NORMAL' ? 'bg-white text-navy-950 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
          >
            Update
          </button>
          <button
            onClick={() => setPostType('LISTING')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${postType === 'LISTING' ? 'bg-white text-navy-950 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
          >
            Listing
          </button>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center overflow-hidden border border-accent-blue/30 shrink-0">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-accent-blue font-bold">{user?.name?.[0]}</span>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={postType === 'LISTING' ? "Describe your property listing..." : "What's happening in the global market?"}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-accent-blue/50 resize-none h-24"
              />
              
              <AnimatePresence>
                {postType === 'LISTING' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-4 overflow-hidden"
                  >
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 appearance-none font-bold text-sm"
                      >
                        {Object.keys(GLOBAL_JURISDICTION_DATA).map(code => (
                          <option key={code} value={code} className="bg-navy-900">{code}</option>
                        ))}
                      </select>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City / District"
                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 font-bold text-sm"
                      />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Purchase Price"
                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 font-bold text-sm"
                      />
                    </div>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="number"
                        value={rent}
                        onChange={(e) => setRent(e.target.value)}
                        placeholder="Monthly Rent"
                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 font-bold text-sm"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setImageUrl(prompt('Enter image URL:') || '')}
                className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-accent-blue transition-colors"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              {imageUrl && <span className="text-xs text-accent-blue self-center">Image attached</span>}
            </div>
            <button
              type="submit"
              disabled={!newPost.trim() || (postType === 'LISTING' && (!price || !rent || !city))}
              className="px-6 py-2 bg-accent-blue hover:bg-accent-blue/80 disabled:opacity-50 text-white rounded-xl font-medium transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {postType === 'LISTING' ? 'Post Listing' : 'Post Update'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/40">Loading global feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-navy-900/30 rounded-2xl border border-white/5">
            <Globe className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 italic">No posts yet. Be the first to share an update!</p>
          </div>
        ) : (
          posts.map((post, idx) => (
            <PostCard 
              key={post.id} 
              post={post} 
              idx={idx} 
              onRunAnalysis={runAnalysis}
              onLike={() => handleLike(post.id)}
              isAnalyzing={analyzingId === post.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

const PostCard: React.FC<{ 
  post: Post; 
  idx: number; 
  onRunAnalysis: (post: Post) => void;
  onLike: () => void;
  isAnalyzing: boolean;
}> = ({ post, idx, onRunAnalysis, onLike, isAnalyzing }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const analysis = post.analysis_results ? JSON.parse(post.analysis_results) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.1 }}
      className="bg-navy-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-white/20 transition-all"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center overflow-hidden border border-accent-blue/30">
              {post.avatar_url ? (
                <img src={post.avatar_url} alt={post.user_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-accent-blue font-bold">{post.user_name?.[0]}</span>
              )}
            </div>
            <div>
              <h4 className="text-white font-medium">{post.user_name}</h4>
              <p className="text-white/40 text-xs">{new Date(post.created_at).toLocaleString()}</p>
            </div>
          </div>
          {post.type === 'LISTING' && (
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              Listing
            </div>
          )}
        </div>

        <p className="text-white/80 whitespace-pre-wrap mb-4">{post.content}</p>

        {post.type === 'LISTING' && (
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <Globe className="text-white/20" size={16} />
              <div>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Location</p>
                <p className="text-xs font-bold text-white">{post.city}, {post.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="text-white/20" size={16} />
              <div>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Price</p>
                <p className="text-xs font-bold text-white">${post.price?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {post.image_url && (
          <div className="rounded-xl overflow-hidden mb-4 border border-white/5">
            <img src={post.image_url} alt="Post content" className="w-full h-auto max-h-96 object-cover" referrerPolicy="no-referrer" />
          </div>
        )}

        {post.type === 'LISTING' && (
          <div className="mb-6">
            {!analysis ? (
              <button
                onClick={() => onRunAnalysis(post)}
                disabled={isAnalyzing}
                className="w-full py-4 bg-logo-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing Market Data...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Run AI Fiscal Analysis
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                >
                  <Calculator size={16} className="text-accent-blue" />
                  {showAnalysis ? 'Hide AI Analysis' : 'View AI Analysis'}
                  {showAnalysis ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {showAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                          <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Projected ROI</p>
                          <p className="text-xl font-black text-white">{analysis.projected_roi}%</p>
                        </div>
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                          <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">IRR Estimate</p>
                          <p className="text-xl font-black text-white">{analysis.irr_estimate}%</p>
                        </div>
                      </div>

                      <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                        <h5 className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                          <Shield size={14} />
                          Legal & Jurisdiction
                        </h5>
                        <div className="grid grid-cols-1 gap-4 text-xs">
                          <div>
                            <p className="text-white/40 font-bold mb-1">Legal Process</p>
                            <p className="text-white/80 leading-relaxed">{analysis.jurisdiction_laws.legal_process}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-white/40 font-bold mb-1">Legal Fees</p>
                              <p className="text-white/80">{analysis.jurisdiction_laws.legal_fees}</p>
                            </div>
                            <div>
                              <p className="text-white/40 font-bold mb-1">Ownership</p>
                              <p className="text-white/80">{analysis.jurisdiction_laws.foreign_ownership}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-white/40 font-bold mb-1">Financial Institutions</p>
                            <p className="text-white/80">{analysis.jurisdiction_laws.financial_institutions}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-4">
                        <h5 className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest flex items-center gap-2">
                          <Info size={14} />
                          Tax Implications
                        </h5>
                        <p className="text-xs text-white/70 leading-relaxed">{analysis.tax_implications}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                          <h5 className="text-[10px] font-black text-red-500/50 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <AlertTriangle size={14} />
                            Risk Assessment
                          </h5>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-white/40 font-bold">Overall Score</span>
                              <span className="text-xs font-black text-white">{analysis.risk_assessment.overall_risk_score}/100</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500" style={{ width: `${analysis.risk_assessment.overall_risk_score}%` }} />
                            </div>
                            <p className="text-[10px] text-white/60 leading-tight">{analysis.risk_assessment.risk_summary}</p>
                          </div>
                        </div>
                        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                          <h5 className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <BarChart3 size={14} />
                            Climate Risk
                          </h5>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-white/40 font-bold">Insurance Hike (10y)</span>
                              <span className="text-xs font-black text-white">+{analysis.climate_risk.projected_insurance_hike_10y}%</span>
                            </div>
                            <p className="text-[10px] text-white/60 leading-tight">{analysis.climate_risk.climate_summary}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-6 pt-4 border-t border-white/5">
          <button 
            onClick={onLike}
            className="flex items-center gap-2 text-white/40 hover:text-red-400 transition-colors group"
          >
            <Heart className={`w-5 h-5 ${post.likes > 0 ? 'fill-red-400 text-red-400' : 'group-hover:fill-red-400'}`} />
            <span className={`text-sm ${post.likes > 0 ? 'text-red-400' : ''}`}>{post.likes}</span>
          </button>
          <button className="flex items-center gap-2 text-white/40 hover:text-accent-blue transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">Reply</span>
          </button>
          <button className="flex items-center gap-2 text-white/40 hover:text-accent-blue transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
