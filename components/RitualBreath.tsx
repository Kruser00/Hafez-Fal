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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastHapticRef = useRef<number>(0);

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

  // Main Logic Loop
  useEffect(() => {
    if (charging) {
      const startTime = Date.now();
      
      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / 3000) * 100, 100);
        
        setProgress(newProgress);

        // Haptic Feedback Logic: Trigger a tick every ~20%
        // This creates a sense of building momentum
        if (Math.floor(newProgress) % 20 === 0 && Math.floor(newProgress) !== lastHapticRef.current && newProgress < 99) {
            audioEngine.triggerHaptic('tick');
            lastHapticRef.current = Math.floor(newProgress);
        }

        if (newProgress >= 100) {
          cleanUp();
          audioEngine.stopBreath(true); // True = completed
          onComplete();
        }
      }, 16); // ~60fps
    } else {
      setProgress(0);
      lastHapticRef.current = 0;
      cleanUp();
    }

    return cleanUp;
  }, [charging, cleanUp, onComplete]);

  // Particle System for Embers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const particles: { x: number; y: number; vx: number; vy: number; life: number; size: number; color: string }[] = [];

    const spawnParticle = () => {
      // Spawn from center
      const x = width / 2 + (Math.random() - 0.5) * 80;
      const y = height / 2 + (Math.random() - 0.5) * 80;
      const colors = ['#fbbf24', '#f59e0b', '#dc2626', '#7c2d12']; // Gold to Ember Red
      
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 3 - 1, // Always go up
        life: 1.0,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    };

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Spawn rate based on charging
      const spawnCount = charging ? 5 : 1;
      if (charging || Math.random() > 0.8) {
         for(let i=0; i<spawnCount; i++) spawnParticle();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.015;
        p.x += Math.sin(p.life * 10) * 0.5; // Wiggle

        if (p.life <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
        if(canvasRef.current) {
            width = canvasRef.current.width = canvasRef.current.offsetWidth;
            height = canvasRef.current.height = canvasRef.current.offsetHeight;
        }
    }
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animId);
    }
  }, [charging]);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4"
      >
        <h2 className="text-2xl text-mystic-gold mb-4 font-bold">تمرکز بر نیت</h2>
        <p className="text-slate-300 text-lg leading-relaxed max-w-xs mx-auto">
          انگشت خود را نگه دارید، ذهن را آرام کنید و بر نیت خود تمرکز کنید.
        </p>
      </motion.div>

      <div 
        className="relative flex items-center justify-center"
      >
        {/* Canvas for Embers - Overlays the interaction area */}
        <canvas 
            ref={canvasRef}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[600px] pointer-events-none z-0"
        />

        <div 
            className="relative cursor-pointer select-none touch-none z-10"
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

            {/* The Ember Button */}
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
      </div>

      <AnimatePresence>
        {charging && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm tracking-widest text-orange-300 font-bold"
          >
            در حال ارتباط...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RitualBreath;