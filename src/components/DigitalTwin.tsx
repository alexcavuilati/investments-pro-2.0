import React from 'react';
import { Activity, Thermometer, Zap, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export function DigitalTwin() {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [lastSync, setLastSync] = React.useState(new Date());

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync(new Date());
    }, 2000);
  };

  const assets = [
    { id: 1, name: 'Savusavu Resort B1', hvac: 'HEALTHY', structural: 98, energy: 85, temp: 22, alerts: [] },
    { id: 2, name: 'Sydney Wharf Loft', hvac: 'WARNING', structural: 94, energy: 72, temp: 24, alerts: ['HVAC Compressor Vibration Detected'] },
    { id: 3, name: 'Dubai Marina Penthouse', hvac: 'HEALTHY', structural: 99, energy: 91, temp: 21, alerts: [] }
  ];

  return (
    <div className="space-y-8 lg:space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-white mb-2">IoT Digital Twin</h1>
          <p className="text-white/40 font-medium">Real-time asset health monitoring and predictive maintenance.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-white/5 rounded-2xl text-xs font-black text-white hover:bg-white/10 transition-all active:scale-95 border border-white/5 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} /> 
            {isSyncing ? 'Syncing Sensors...' : 'Sync Sensors'}
          </button>
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Last Sync: {lastSync.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:gap-12">
        {assets.map(asset => (
          <div key={asset.id} className="clean-card p-8 lg:p-12 flex flex-col lg:flex-row gap-8 lg:gap-16 group">
            <div className="lg:w-1/3 space-y-8">
              <div className="flex items-center justify-between">
                <h4 className="text-xl lg:text-2xl font-black text-white tracking-tight">{asset.name}</h4>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${asset.hvac === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                  {asset.hvac}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 group-hover:bg-logo-gradient group-hover:text-white transition-all duration-500">
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 group-hover:text-white/40">Structural</div>
                  <div className="text-2xl lg:text-3xl font-black tracking-tighter">{asset.structural}%</div>
                </div>
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 group-hover:bg-logo-gradient group-hover:text-white transition-all duration-500">
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 group-hover:text-white/40">Efficiency</div>
                  <div className="text-2xl lg:text-3xl font-black tracking-tighter">{asset.energy}%</div>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                  <div className="p-2 bg-white/5 rounded-lg"><Thermometer size={16} /></div>
                  Climate Control
                </div>
                <div className="text-4xl font-black text-white tracking-tighter">{asset.temp}°C</div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                  <div className="p-2 bg-white/5 rounded-lg"><Zap size={16} /></div>
                  Power Grid
                </div>
                <div className="text-4xl font-black text-white tracking-tighter">4.2 kW</div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '40%' }}
                    className="h-full bg-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                  <div className="p-2 bg-white/5 rounded-lg"><AlertCircle size={16} /></div>
                  Predictive Alerts
                </div>
                {asset.alerts.length > 0 ? (
                  <div className="space-y-3">
                    {asset.alerts.map((alert, i) => (
                      <div key={i} className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[10px] text-amber-400 font-bold uppercase tracking-widest leading-relaxed">
                        {alert}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-white/30 font-bold italic py-4">No critical failures predicted.</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
