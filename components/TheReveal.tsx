import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Poem, InterpretationResponse } from '../types';
import { interpretFal } from '../services/geminiService';
import { BrainCircuit, Loader2, Share2, RefreshCw } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface TheRevealProps {
  poem: Poem;
  userContext: string;
  onReset: () => void;
}

const TheReveal: React.FC<TheRevealProps> = ({ poem, userContext, onReset }) => {
  const [interpretation, setInterpretation] = useState<InterpretationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Trigger audio on component mount
  useEffect(() => {
    audioEngine.playReveal();
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchInterpretation = async () => {
      const result = await interpretFal(userContext, poem);
      if (mounted) {
        setInterpretation(result);
        setLoading(false);
      }
    };
    fetchInterpretation();
    return () => { mounted = false; };
  }, [poem, userContext]);

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 px-4 pt-10 relative z-10">
      
      {/* Poem Section - Fades in first */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="mb-12 text-center"
      >
        <div className="inline-block p-1 border-t border-b border-mystic-gold/30 mb-8">
            <span className="text-xs uppercase tracking-widest text-slate-400">Ghazal {poem.id}</span>
        </div>

        {/* Persian Text */}
        <div className="space-y-4 mb-10 font-persian text-2xl md:text-3xl text-slate-200 leading-loose" dir="rtl">
          {poem.persian.map((line, i) => (
            <motion.p 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (i * 0.2) }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Divider */}
        <div className="w-16 h-[1px] bg-mystic-gold/50 mx-auto my-8" />

        {/* English Text */}
        <div className="space-y-2 font-serif text-slate-400 italic">
          {poem.english.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </motion.div>

      {/* AI Interpretation Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="relative bg-mystic-800/40 backdrop-blur-md rounded-xl p-8 border border-white/5 shadow-2xl overflow-hidden"
      >
        {/* Decorative glass shine */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mystic-gold/50 to-transparent opacity-50" />

        <div className="flex items-center gap-3 mb-6">
          <BrainCircuit className="w-5 h-5 text-mystic-gold" />
          <h3 className="text-lg font-serif text-mystic-gold">The Mystic's Insight</h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
             <Loader2 className="w-8 h-8 text-mystic-gold animate-spin" />
             <p className="text-xs tracking-widest text-slate-500 animate-pulse">Consulting the invisible world...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-slate-300 leading-relaxed font-light">
              {interpretation?.interpretation}
            </p>
            
            <div className="bg-slate-900/50 p-4 rounded border-l-2 border-mystic-gold">
               <p className="text-mystic-gold font-serif text-lg">
                 "{interpretation?.reflection}"
               </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4 }}
        className="mt-10 flex justify-center gap-4"
      >
         <button 
           onClick={onReset}
           className="flex items-center gap-2 px-6 py-3 bg-transparent border border-slate-600 hover:border-mystic-gold text-slate-400 hover:text-mystic-gold transition-colors rounded-full text-sm uppercase tracking-widest"
         >
           <RefreshCw className="w-4 h-4" />
           New Ritual
         </button>
         <button className="flex items-center gap-2 px-6 py-3 bg-mystic-gold text-mystic-900 font-bold hover:bg-white transition-colors rounded-full text-sm uppercase tracking-widest">
           <Share2 className="w-4 h-4" />
           Share Fate
         </button>
      </motion.div>

    </div>
  );
};

export default TheReveal;
