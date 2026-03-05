import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Calculator, ShieldCheck, Users, X, ChevronRight } from 'lucide-react';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setIsOpen(true);
    }
  }, []);

  const closeTour = () => {
    localStorage.setItem('hasSeenTour', 'true');
    setIsOpen(false);
  };

  const steps = [
    {
      title: "Global Property Intelligence",
      description: "Analyze real estate opportunities in any country with real-time 2026 fiscal data and legal grounding.",
      icon: <Globe size={48} className="text-accent" />
    },
    {
      title: "Fiscal Recalibration Engine",
      description: "Calculate ROI, IRR, and Loan Readiness using our AI-driven engine that searches for the latest tax codes.",
      icon: <Calculator size={48} className="text-accent" />
    },
    {
      title: "Institutional Vault",
      description: "Securely store your KYC documents and proof of funds in our encrypted investor passport.",
      icon: <ShieldCheck size={48} className="text-accent" />
    },
    {
      title: "Investor Social Hub",
      description: "Connect with other global capital partners, discuss deals, and share market intelligence in real-time.",
      icon: <Users size={48} className="text-accent" />
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-navy-950/80 backdrop-blur-md"
            onClick={closeTour}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-navy-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
          >
            <button 
              onClick={closeTour}
              className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} className="text-white/30" />
            </button>

            <div className="p-12 text-center space-y-8">
              <motion.div 
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center space-y-6"
              >
                <div className="p-8 bg-white/5 rounded-[2.5rem]">
                  {steps[step].icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">{steps[step].title}</h3>
                  <p className="text-white/40 font-medium leading-relaxed">{steps[step].description}</p>
                </div>
              </motion.div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all ${step === i ? 'w-8 bg-logo-gradient' : 'w-1.5 bg-white/10'}`} 
                    />
                  ))}
                </div>
                
                {step < steps.length - 1 ? (
                  <button 
                    onClick={() => setStep(s => s + 1)}
                    className="flex items-center gap-2 font-black text-white uppercase tracking-widest text-[10px] hover:gap-3 transition-all"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={closeTour}
                    className="btn-primary"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
