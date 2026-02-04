import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Poem, InterpretationResponse } from '../types';
import { interpretFal } from '../services/geminiService';
import { BrainCircuit, Loader2, Share2, RefreshCw, Sparkles } from 'lucide-react';
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
    <div className="w-full max-w-4xl mx-auto pb-24 px-4 pt-4 md:pt-10 relative z-10" dir="rtl">
      
      {/* Poem Section - Fades in first */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(10px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="mb-8 md:mb-12 text-center"
      >
        <div className="inline-block p-1 border-t border-b border-mystic-gold/30 mb-6 md:mb-8">
            <span className="text-xs md:text-sm font-bold text-slate-400 px-4">غزل شماره {poem.id}</span>
        </div>

        {/* Persian Text */}
        <div className="space-y-4 md:space-y-6 mb-8 md:mb-10 font-persian text-xl md:text-3xl text-slate-200 leading-[2.2] md:leading-[2.5]" dir="rtl">
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
      </motion.div>

      {/* AI Interpretation Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="relative bg-mystic-800/40 backdrop-blur-md rounded-xl p-6 md:p-8 border border-white/5 shadow-2xl overflow-hidden"
      >
        {/* Decorative glass shine */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mystic-gold/50 to-transparent opacity-50" />

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-5 h-5 text-mystic-gold" />
            <h3 className="text-lg md:text-xl font-bold text-mystic-gold">تفسیر عرفانی فال</h3>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
             <Loader2 className="w-8 h-8 text-mystic-gold animate-spin" />
             <p className="text-sm text-slate-400 animate-pulse">در حال دریافت الهام...</p>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            <p className="text-slate-200 leading-[2.2] text-base md:text-lg text-justify">
              {interpretation?.interpretation}
            </p>
            
            <div className="bg-slate-900/50 p-4 md:p-6 rounded-lg border-r-4 border-mystic-gold">
               <p className="text-mystic-gold text-lg md:text-xl leading-relaxed italic">
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
        className="mt-10 md:mt-12 flex flex-col sm:flex-row justify-center gap-4"
      >
         <button 
           onClick={onReset}
           className="flex items-center justify-center gap-2 px-8 py-3 bg-transparent border border-slate-600 hover:border-mystic-gold text-slate-300 hover:text-mystic-gold transition-colors rounded-full text-base w-full sm:w-auto"
         >
           <RefreshCw className="w-4 h-4 ml-2" />
           نیت دوباره
         </button>
         <button className="flex items-center justify-center gap-2 px-8 py-3 bg-mystic-gold text-mystic-900 font-bold hover:bg-white transition-colors rounded-full text-base w-full sm:w-auto">
           <Share2 className="w-4 h-4 ml-2" />
           اشتراک گذاری
         </button>
      </motion.div>

    </div>
  );
};

export default TheReveal;