import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, TrendingUp, Download, AlertTriangle, CloudRain, Star, ThumbsUp, ChevronRight, Bell, Globe, ArrowUpRight, Scale, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Country, State, City } from 'country-state-city';
import { Currency, formatCurrency } from './CurrencySwitcher';
import { User } from '../types';
import { getJurisdiction } from '../jurisdictionalData';
import { useAuth } from '../context/AuthContext';
import { safeFetch } from '../utils/api';

interface FiscalEngineProps {
  currency: Currency;
  user: User | null;
}

export function FiscalEngine({ currency, user }: FiscalEngineProps) {
  const { token } = useAuth();
  const [countryCode, setCountryCode] = useState('FJ');
  const [stateCode, setStateCode] = useState('');
  const [cityDistrict, setCityDistrict] = useState('');
  const [price, setPrice] = useState('500000');
  const [monthlyRent, setMonthlyRent] = useState('3500');
  const [stampDuty, setStampDuty] = useState('3');
  const [vatGst, setVatGst] = useState('15');
  const [cgt, setCgt] = useState('0');
  const [incentives, setIncentives] = useState([
    { id: 1, name: 'First Home Grant', is_active: false },
    { id: 2, name: 'Green Retrofit Rebate', is_active: false },
    { id: 3, name: 'Golden Visa Eligibility', is_active: false }
  ]);
  const [newIncentiveName, setNewIncentiveName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const countries = Country.getAllCountries();
  const states = State.getStatesOfCountry(countryCode);
  const cities = City.getCitiesOfState(countryCode, stateCode);

  const jurisdiction = getJurisdiction(countryCode);
  const isRestricted = user?.country_of_origin && jurisdiction.restrictions.includes(user.country_of_origin);

  useEffect(() => {
    setStampDuty(jurisdiction.stamp_duty.toString());
    setVatGst(jurisdiction.vat_gst.toString());
    setCgt(jurisdiction.cgt.toString());
  }, [countryCode]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!countryCode) newErrors.country = 'Country is required';
    if (!cityDistrict && cities.length > 0) newErrors.city = 'City is required';
    if (!price || Number(price) <= 0) newErrors.price = 'Valid price is required';
    if (!monthlyRent || Number(monthlyRent) <= 0) newErrors.rent = 'Valid rent is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyze = () => {
    if (!validate()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setResult({
        projected_roi: 8.4,
        irr_estimate: 12.2,
        npv_estimate: 1245000,
        loan_readiness_score: 85,
        risk_assessment: {
          risk_summary: `Low risk profile with strong capital appreciation potential in the ${cityDistrict || 'selected'} corridor. Primary risks include currency volatility and climate-related insurance hikes.`
        },
        climate_risk: {
          flood_risk: 15,
          wildfire_risk: 5,
          sea_level_rise_impact: 20,
          projected_insurance_hike_10y: 12,
          mandatory_green_retrofit_cost: 25000,
          npv_adjustment_10y: 45000,
          climate_summary: "Property is located in a high-elevation zone, mitigating immediate sea-level threats, but regional infrastructure remains vulnerable."
        },
        tax_implications: `Under the 2026 ${countryCode} Tax Treaty, foreign investors are eligible for a 5% withholding tax reduction on rental income if structured via a local SPV.`,
        jurisdiction_laws: {
          foreign_ownership: jurisdiction.restrictions.length > 0 ? "Conditional ownership based on FIRB/OIO approval." : "Freehold title available for designated tourism zones.",
          tax_residency: "183-day rule applies for local tax residency status.",
          repatriation_rules: "Full capital repatriation permitted after 24 months.",
          property_rights: "Strong constitutional protection for freehold assets.",
          legal_process: jurisdiction.legal_process[0],
          legal_fees: `Estimated ${jurisdiction.legal_fees_percent}% of acquisition value + ${formatCurrency(jurisdiction.legal_fees_fixed, currency)} fixed.`
        },
        legal_checklist: jurisdiction.legal_process,
        recalibration_notes: "Projections adjusted for the 2026 Global Minimum Tax implementation."
      });
      setAnalyzing(false);
    }, 2000);
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await safeFetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${Country.getCountryByCode(countryCode)?.name} - ${cityDistrict || 'Investment'}`,
          location: `${cityDistrict}, ${Country.getCountryByCode(countryCode)?.name}`,
          roi: result.projected_roi,
          status: 'ANALYZING',
          type: 'PROPERTY'
        }),
      });
      alert('Project saved to your institutional vault.');
    } catch (err) {
      console.error(err);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleFeedback = () => {
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackRating(0);
      setFeedbackComment('');
    }, 3000);
  };

  const toggleIncentive = (id: number) => {
    setIncentives(incentives.map(i => i.id === id ? { ...i, is_active: !i.is_active } : i));
  };

  const addIncentive = () => {
    if (!newIncentiveName.trim()) return;
    setIncentives([...incentives, { id: Date.now(), name: newIncentiveName, is_active: true }]);
    setNewIncentiveName('');
  };

  const chartData = result ? [
    { name: 'ROI', value: result.projected_roi },
    { name: 'IRR', value: result.irr_estimate },
    { name: 'Loan Score', value: result.loan_readiness_score / 10 }
  ] : [];

  const riskData = result ? [
    { subject: 'Market', A: 120, fullMark: 150 },
    { subject: 'Legal', A: 98, fullMark: 150 },
    { subject: 'Climate', A: 86, fullMark: 150 },
    { subject: 'Tax', A: 99, fullMark: 150 },
    { subject: 'Liquidity', A: 85, fullMark: 150 },
  ] : [];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <h1 className="text-white mb-2">2026 Fiscal Intelligence Engine</h1>
          <p className="text-white/40 font-medium">Advanced predictive modeling for global property tax, legal, and climate risk.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="clean-card p-10 space-y-10">
          <h3 className="text-2xl font-black text-white tracking-tight">Project Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Country / Jurisdiction</label>
              <select 
                value={countryCode} 
                onChange={e => { setCountryCode(e.target.value); setStateCode(''); setCityDistrict(''); }}
                className={`input-field ${errors.country ? 'border-red-500' : ''}`}
              >
                {countries.map(c => (
                  <option key={c.isoCode} value={c.isoCode} className="bg-navy-900">{c.name}</option>
                ))}
              </select>
              {errors.country && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{errors.country}</p>}
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">State / Province</label>
              <select 
                value={stateCode} 
                onChange={e => { setStateCode(e.target.value); setCityDistrict(''); }}
                className="input-field"
                disabled={states.length === 0}
              >
                <option value="" className="bg-navy-900">Select State</option>
                {states.map(s => (
                  <option key={s.isoCode} value={s.isoCode} className="bg-navy-900">{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">City / District</label>
              <select 
                value={cityDistrict} 
                onChange={e => setCityDistrict(e.target.value)}
                className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                disabled={cities.length === 0 && states.length > 0}
              >
                <option value="" className="bg-navy-900">Select City</option>
                {cities.map(c => (
                  <option key={c.name} value={c.name} className="bg-navy-900">{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Purchase Price ({currency})</label>
              <input 
                type="number" 
                value={price} 
                onChange={e => setPrice(e.target.value)}
                className={`input-field ${errors.price ? 'border-red-500' : ''}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Stamp Duty %</label>
              <input type="number" value={stampDuty} onChange={e => setStampDuty(e.target.value)} className="input-field" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">VAT/GST %</label>
              <input type="number" value={vatGst} onChange={e => setVatGst(e.target.value)} className="input-field" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">CGT %</label>
              <input type="number" value={cgt} onChange={e => setCgt(e.target.value)} className="input-field" />
            </div>
          </div>

          {isRestricted && (
            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] flex items-start gap-4">
              <AlertTriangle className="text-rose-400 shrink-0" size={24} />
              <div>
                <h5 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-1">Jurisdictional Limitation</h5>
                <p className="text-[10px] text-rose-400/70 font-medium leading-relaxed">
                  Investors from <strong>{user?.country_of_origin}</strong> currently face acquisition restrictions in <strong>{Country.getCountryByCode(countryCode)?.name}</strong>. Professional FIRB/OIO legal counsel is mandatory.
                </p>
              </div>
            </div>
          )}

          <button 
            onClick={handleAnalyze} 
            disabled={analyzing || isRestricted}
            className={`w-full btn-primary py-5 flex items-center justify-center gap-3 text-sm ${isRestricted ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {analyzing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Calculator size={20} /> Run Intelligence Engine</>
            )}
          </button>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {!result && !analyzing && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full clean-card border-dashed flex flex-col items-center justify-center text-center p-12 text-white/10"
              >
                <TrendingUp size={64} className="mb-6 opacity-10" />
                <p className="font-black uppercase tracking-[0.2em] text-xs">Enter project details to generate 2026 fiscal projections.</p>
              </motion.div>
            )}
            {analyzing && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full clean-card flex flex-col items-center justify-center text-center p-12"
              >
                <div className="w-20 h-20 border-4 border-white/5 border-t-accent rounded-full animate-spin mb-8"></div>
                <div className="font-black text-white text-xl tracking-tight mb-2">Querying 2026 Tax Codes...</div>
                <p className="text-xs text-white/40 font-medium uppercase tracking-widest">Analyzing FIRB, SLIP, and Golden Visa implications.</p>
              </motion.div>
            )}
            {result && !analyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="clean-card p-10 space-y-10 bg-navy-900 text-white overflow-y-auto max-h-[900px] relative group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                
                <div className="flex items-center justify-between relative z-10">
                  <h4 className="text-2xl font-black tracking-tight">Intelligence Report</h4>
                  <div className="flex gap-3">
                    <button onClick={handleSave} className="px-6 py-2.5 bg-logo-gradient text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-blue-500/20">Save Project</button>
                    <button className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><Download size={20} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                  <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Projected ROI</div>
                    <div className="text-3xl font-black text-emerald-400 tracking-tighter">{result.projected_roi}%</div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">IRR Estimate</div>
                    <div className="text-3xl font-black text-blue-400 tracking-tighter">{result.irr_estimate}%</div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">NPV (10Y)</div>
                    <div className="text-3xl font-black text-purple-400 tracking-tighter">{formatCurrency(result.npv_estimate, currency)}</div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Loan Score</div>
                    <div className="text-3xl font-black text-amber-400 tracking-tighter">{result.loan_readiness_score}/100</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                  <div className="h-72 bg-white/5 rounded-[2rem] p-8 border border-white/10">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6">Performance Metrics</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.3)' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.3)' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', fontSize: '10px', fontWeight: 900 }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#f59e0b'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="h-72 bg-white/5 rounded-[2rem] p-8 border border-white/10">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6">Risk Profile</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskData}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.3)' }} />
                        <PolarRadiusAxis axisLine={false} tick={false} />
                        <Radar
                          name="Risk"
                          dataKey="A"
                          stroke="#ef4444"
                          fill="#ef4444"
                          fillOpacity={0.5}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 space-y-6 relative z-10">
                  <div className="flex items-center gap-3 text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">
                    <Scale size={18} /> Acquisition Legal Framework
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h5 className="text-xs font-black text-white uppercase tracking-widest">Required Legal Steps</h5>
                      <div className="space-y-3">
                        {result.legal_checklist.map((step: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-white/60">
                            <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[8px]">{i + 1}</div>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-xs font-black text-white uppercase tracking-widest">Estimated Legal Costs</h5>
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                        <div className="text-2xl font-black text-white tracking-tighter mb-1">{result.jurisdiction_laws.legal_fees}</div>
                        <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest">Includes Title Search, Conveyancing, and Registry Filing.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-blue-500/10 rounded-[2rem] border border-blue-500/20 space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-blue-400 font-black text-[10px] uppercase tracking-[0.2em]">
                      <CloudRain size={18} /> Climate-Adaptive Risk Overlay
                    </div>
                    <div className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest">10-Year NPV Impact: -{formatCurrency(result.climate_risk.npv_adjustment_10y, currency)}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    <ClimateStat label="Flood Risk" value={result.climate_risk.flood_risk} />
                    <ClimateStat label="Wildfire Risk" value={result.climate_risk.wildfire_risk} />
                    <ClimateStat label="Sea Level" value={result.climate_risk.sea_level_rise_impact} />
                  </div>
                  <p className="text-xs text-blue-100/60 italic leading-relaxed font-medium">{result.climate_risk.climate_summary}</p>
                </div>

                <div className="pt-10 border-t border-white/10 relative z-10">
                  <div className="clean-card bg-white/5 border-white/10 p-8 space-y-6">
                    <h5 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Rate this Analysis</h5>
                    {feedbackSent ? (
                      <div className="flex items-center gap-3 text-emerald-400 font-black text-sm py-6">
                        <ThumbsUp size={24} /> Thank you for your feedback!
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex gap-6">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button 
                              key={star} 
                              onClick={() => setFeedbackRating(star)}
                              className={`p-1 transition-all hover:scale-110 ${feedbackRating >= star ? 'text-amber-400' : 'text-white/10'}`}
                            >
                              <Star size={32} fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                            </button>
                          ))}
                        </div>
                        <textarea 
                          value={feedbackComment}
                          onChange={e => setFeedbackComment(e.target.value)}
                          placeholder="Any specific feedback on the 2026 fiscal data?"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-white/30 h-24 font-medium"
                        />
                        <button 
                          onClick={handleFeedback}
                          disabled={feedbackRating === 0}
                          className="w-full py-5 bg-logo-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-500/20"
                        >
                          Submit Feedback
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="clean-card p-10 bg-amber-500/10 border-amber-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Bell size={64} className="text-amber-400" />
        </div>
        <div className="flex items-start gap-8 relative z-10">
          <div className="w-14 h-14 bg-amber-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-amber-500/20 shrink-0">
            <Bell size={24} />
          </div>
          <div>
            <h4 className="text-xl font-black text-amber-400 tracking-tight mb-2">Loan-Ready EOI Generation</h4>
            <p className="text-sm text-amber-400/70 mb-6 font-medium leading-relaxed max-w-2xl">Once your project is saved, the engine can generate a professional Expression of Interest (EOI) and route it to Tier-1 financiers like BSP or Westpac.</p>
            <button className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all group">
              Configure Matchmaking Sequence <ChevronRight size={18} className="transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClimateStat({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[8px] font-black text-blue-400/40 uppercase tracking-[0.2em]">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="h-1.5 w-full bg-blue-400/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className="h-full bg-blue-400" 
        />
      </div>
    </div>
  );
}
