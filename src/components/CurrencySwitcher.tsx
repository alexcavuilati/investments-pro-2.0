import React, { useState, useEffect } from 'react';
import { DollarSign, Globe } from 'lucide-react';

export type Currency = string;

interface CurrencySwitcherProps {
  current: Currency;
  onChange: (c: Currency) => void;
}

export function CurrencySwitcher({ current, onChange }: CurrencySwitcherProps) {
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fallback rates in case the API is unreachable
    const fallbackRates = {
      USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150.5, AUD: 1.53, 
      CAD: 1.35, CHF: 0.88, CNY: 7.19, HKD: 7.82, NZD: 1.64, SGD: 1.34
    };

    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.rates) {
          setRates(data.rates);
          // Store rates globally for formatCurrency to use
          (window as any).globalExchangeRates = data.rates;
        } else {
          throw new Error("Invalid data format from currency API");
        }
      })
      .catch(err => {
        console.error("Currency fetch error, using fallbacks:", err);
        setRates(fallbackRates);
        (window as any).globalExchangeRates = fallbackRates;
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD', 'SGD'];
  const sortedCurrencies = Object.keys(rates).sort();

  return (
    <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5 shadow-sm">
      <div className="flex gap-1">
        {['USD', 'EUR', 'GBP'].map(code => (
          <button
            key={code}
            onClick={() => onChange(code)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
              current === code 
                ? 'bg-logo-gradient text-white shadow-lg shadow-blue-500/20' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {code}
          </button>
        ))}
      </div>
      <div className="w-px h-5 bg-white/10 mx-1" />
      <div className="relative flex items-center group">
        <Globe size={14} className="absolute left-3 text-white/20 group-hover:text-white/40 transition-colors" />
        <select
          value={majorCurrencies.includes(current) && !['USD', 'EUR', 'GBP'].includes(current) ? current : (['USD', 'EUR', 'GBP'].includes(current) ? '' : current)}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-4 py-2 bg-transparent text-[10px] font-black text-white focus:outline-none appearance-none cursor-pointer uppercase tracking-widest"
        >
          <option value="" disabled className="bg-navy-900">MORE</option>
          {sortedCurrencies.map(code => (
            <option key={code} value={code} className="bg-navy-900">{code}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function formatCurrency(value: number, currency: Currency) {
  const rates = (window as any).globalExchangeRates || { USD: 1 };
  const rate = rates[currency] || 1;
  const converted = value * rate;
  
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    });
    return formatter.format(converted);
  } catch (e) {
    // Fallback if currency code is not supported by Intl
    return `${currency} ${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
}

