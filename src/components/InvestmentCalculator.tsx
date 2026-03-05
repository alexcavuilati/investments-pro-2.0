import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Percent, ArrowRight, Globe, AlertTriangle, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { Currency, formatCurrency } from './CurrencySwitcher';
import { Country } from 'country-state-city';
import { User } from '../types';
import { getJurisdiction } from '../jurisdictionalData';
import { useAuth } from '../context/AuthContext';
import { safeFetch } from '../utils/api';

export function InvestmentCalculator({ currency, user }: { currency: Currency, user: User | null }) {
  const { token } = useAuth();
  const [countryCode, setCountryCode] = useState('FJ');
  const [price, setPrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(5.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [monthlyRent, setMonthlyRent] = useState(3500);
  const [expenses, setExpenses] = useState(800);
  const [saving, setSaving] = useState(false);
  
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [cashFlow, setCashFlow] = useState(0);
  const [capRate, setCapRate] = useState(0);
  const [cashOnCash, setCashOnCash] = useState(0);

  const countries = Country.getAllCountries();
  const jurisdiction = getJurisdiction(countryCode);
  const isRestricted = user?.country_of_origin && jurisdiction.restrictions.includes(user.country_of_origin);

  useEffect(() => {
    const loanAmount = price - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    const mortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    setMonthlyPayment(mortgage);
    
    // Auto-calculate expenses based on jurisdiction (VAT/GST + Stamp Duty + Legal)
    const stampDutyCost = price * (jurisdiction.stamp_duty / 100);
    const vatGstCost = price * (jurisdiction.vat_gst / 100);
    const legalCost = (price * (jurisdiction.legal_fees_percent / 100)) + jurisdiction.legal_fees_fixed;
    
    // We'll add a portion of acquisition costs to monthly expenses for simulation if desired, 
    // but usually these are upfront. Let's keep monthly expenses separate but show the upfront costs.
    
    const cf = monthlyRent - mortgage - expenses;
    setCashFlow(cf);
    
    const annualNetIncome = (monthlyRent - expenses) * 12;
    setCapRate((annualNetIncome / price) * 100);
    
    const annualCashFlow = cf * 12;
    setCashOnCash((annualCashFlow / downPayment) * 100);
  }, [price, downPayment, interestRate, loanTerm, monthlyRent, expenses, countryCode]);

  const acquisitionCosts = (price * (jurisdiction.stamp_duty / 100)) + (price * (jurisdiction.vat_gst / 100)) + (price * (jurisdiction.legal_fees_percent / 100)) + jurisdiction.legal_fees_fixed;

  const handleSave = async () => {
    setSaving(true);
    try {
      await safeFetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `Calc: ${Country.getCountryByCode(countryCode)?.name}`,
          location: Country.getCountryByCode(countryCode)?.name,
          roi: capRate,
          status: 'DRAFT',
          type: 'PROPERTY'
        }),
      });
      alert('Calculation saved to your institutional vault.');
    } catch (err) {
      console.error(err);
      alert('Failed to save calculation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <h3 className="text-3xl font-black text-white tracking-tight">Quick Yield Calculator</h3>
          <p className="text-white/40 font-medium">Simulate "what-if" scenarios for global property acquisitions with jurisdictional intelligence.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-outline px-8 py-4 flex items-center gap-2"
        >
          {saving ? 'Saving...' : 'Save to Vault'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 clean-card p-10 space-y-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Target Jurisdiction</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <select 
                value={countryCode} 
                onChange={e => setCountryCode(e.target.value)}
                className="input-field pl-12"
              >
                {countries.map(c => (
                  <option key={c.isoCode} value={c.isoCode} className="bg-navy-900">{c.name}</option>
                ))}
              </select>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Purchase Price ({currency})</label>
              <input 
                type="number" 
                value={price} 
                onChange={e => setPrice(Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Down Payment ({currency})</label>
              <input 
                type="number" 
                value={downPayment} 
                onChange={e => setDownPayment(Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Interest Rate (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={interestRate} 
                onChange={e => setInterestRate(Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Loan Term (Years)</label>
              <select 
                value={loanTerm} 
                onChange={e => setLoanTerm(Number(e.target.value))}
                className="input-field"
              >
                <option value={15} className="bg-navy-900">15 Years</option>
                <option value={20} className="bg-navy-900">20 Years</option>
                <option value={30} className="bg-navy-900">30 Years</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Monthly Rent ({currency})</label>
              <input 
                type="number" 
                value={monthlyRent} 
                onChange={e => setMonthlyRent(Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Monthly Expenses ({currency})</label>
              <input 
                type="number" 
                value={expenses} 
                onChange={e => setExpenses(Number(e.target.value))}
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 space-y-8">
            <div className="flex items-center gap-3 text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">
              <Scale size={18} /> Legal & Acquisition Breakdown
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h5 className="text-xs font-black text-white uppercase tracking-widest">Required Legal Steps</h5>
                <div className="space-y-3">
                  {jurisdiction.legal_process.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-white/60">
                      <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[8px]">{i + 1}</div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h5 className="text-xs font-black text-white uppercase tracking-widest">Estimated Upfront Costs</h5>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-2xl font-black text-white tracking-tighter mb-1">{formatCurrency(acquisitionCosts, currency)}</div>
                  <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest">Includes Stamp Duty ({jurisdiction.stamp_duty}%), VAT/GST ({jurisdiction.vat_gst}%), and Legal Fees.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="clean-card p-10 bg-logo-gradient text-white space-y-8 relative overflow-hidden group shadow-2xl shadow-blue-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-700" />
            <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] relative z-10">Financial Summary</h4>
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-white/60">Monthly Mortgage</span>
                <span className="text-2xl font-black tracking-tighter">{formatCurrency(monthlyPayment, currency)}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-white/60">Monthly Cash Flow</span>
                <span className={`text-2xl font-black tracking-tighter ${cashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(cashFlow, currency)}
                </span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-white/60">Cap Rate</span>
                <span className="text-2xl font-black tracking-tighter text-blue-400">{capRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-white/60">Cash on Cash</span>
                <span className="text-2xl font-black tracking-tighter text-amber-400">{cashOnCash.toFixed(2)}%</span>
              </div>
            </div>

            <button className="w-full py-5 bg-white text-navy-950 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-all active:scale-95 shadow-xl shadow-white/5 relative z-10">
              Run Full AI Analysis <ArrowRight size={18} />
            </button>
          </div>

          <div className="clean-card p-8 border-amber-500/20 bg-amber-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calculator size={48} className="text-amber-400" />
            </div>
            <h5 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-4">Pro Tip</h5>
            <p className="text-xs text-amber-400/70 leading-relaxed font-medium">
              In 2026, many jurisdictions offer tax rebates for energy-efficient retrofitting. Factor in a 5-10% expense reduction if the property is LEED certified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
