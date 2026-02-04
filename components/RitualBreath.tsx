import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioEngine } from '../utils/audioEngine';

interface RitualBreathProps {
  onComplete: () => void;
}

const RitualBreath: React.FC<RitualBreathProps> = ({ onComplete }) => {
  const [charging, setCharging] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const cleanUp = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle Audio Logic based on charging state
  useEffect(() => {
    if (charging) {
      audioEngine.startBreath();
    } else {
      audioEngine.stopBreath(false); // False = didn't complete
    }

    return () => {
      audioEngine.stopBreath(false);
    };
  }, [charging]);

  useEffect(() => {
    if (charging) {
      const startTime = Date.now();
      // Resume from previous progress would require more logic, 
      // simplified here to restart breath for ritual purity
      
      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / 3000) * 100, 100);
        
        setProgress(newProgress);

        if (newProgress >= 100) {
          cleanUp();
          audioEngine.stopBreath(true); // True = completed
          onComplete();
        }
      }, 16); // ~60fps
    } else {
      setProgress(0);
      cleanUp();
    }

    return cleanUp;
  }, [charging, cleanUp, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-serif text-mystic-gold mb-2">The Virtual Breath</h2>
        <p className="text-slate-400 font-light max-w-xs mx-auto">
          Hold the ember. Quiet your mind. Infuse your intention into the digital ether.
        </p>
      </motion.div>

      <div 
        className="relative cursor-pointer select-none touch-none"
        onPointerDown={() => setCharging(true)}
        onPointerUp={() => setCharging(false)}
        onPointerLeave={() => setCharging(false)}
      >
        {/* Background Glow */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-mystic-gold blur-2xl opacity-20"
          animate={{
            scale: charging ? 1.5 : 1,
            opacity: charging ? 0.4 : 0.2,
          }}
          transition={{ duration: 0.5 }}
        />

        {/* The Ember */}
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 via-red-600 to-mystic-900 border border-orange-400/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_40px_rgba(251,191,36,0.2)]"
          animate={{
            scale: charging ? 1.1 : 1,
          }}
          whileTap={{ scale: 0.95 }}
        >
           {/* Inner fire texture simulation */}
           <motion.div 
             className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-50" 
           />
           
           {/* Pulse Center */}
           <div className="w-8 h-8 bg-orange-200 rounded-full blur-md animate-pulse" />
        </motion.div>

        {/* Ring Progress */}
        <svg className="absolute top-[-20px] left-[-20px] w-[168px] h-[168px] rotate-[-90deg] pointer-events-none">
          <circle
            cx="84"
            cy="84"
            r="80"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            className="text-slate-800"
          />
          <motion.circle
            cx="84"
            cy="84"
            r="80"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-mystic-gold"
            strokeDasharray="502"
            strokeDashoffset={502 - (502 * progress) / 100}
            strokeLinecap="round"
          />
        </svg>
      </div>

      <AnimatePresence>
        {charging && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm tracking-widest text-orange-300 uppercase font-serif"
          >
            Charging Divination...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RitualBreath;
