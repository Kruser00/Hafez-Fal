import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, BookOpen, Brain, Moon, Feather } from 'lucide-react';
import { DreamPerspective, DreamResponse } from '../types';
import { DREAM_PERSPECTIVES, DREAM_SUGGESTIONS } from '../constants';
import { interpretDream } from '../services/geminiService';

interface DreamInterpreterProps {
  onBack?: () => void;
}

const DreamInterpreter: React.FC<DreamInterpreterProps> = ({ onBack }) => {
  const [dream, setDream] = useState('');
  const [perspective, setPerspective] = useState<DreamPerspective>(DreamPerspective.ISLAMIC);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DreamResponse | null>(null);

  const handleInterpret = async () => {
    if (!dream.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await interpretDream(dream, perspective);
      setResult(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (value: string) => {
    setDream(value);
  };

  const getPerspectiveIcon = (p: string) => {
    switch (p) {
      case 'ISLAMIC': return <Moon className="w-4 h-4" />;
      case 'IBN_SINA': return <BookOpen className="w-4 h-4" />;
      case 'PSYCHOLOGY': return <Brain className="w-4 h-4" />;
      case 'FOLKLORE': return <Feather className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col h-full overflow-y-auto no-scrollbar pb-24">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 mb-2 font-serif">
          تعبیر خواب هوشمند
        </h2>
        <p className="text-slate-400 text-sm md:text-base">
          خواب خود را بنویسید و از دیدگاه‌های مختلف تعبیر آن را دریافت کنید.
        </p>
      </motion.div>

      {/* Input Section */}
      <div className="bg-slate-900/50 border border-purple-500/20 rounded-2xl p-4 md:p-6 backdrop-blur-md shadow-xl mb-6">
        <textarea
          value={dream}
          onChange={(e) => setDream(e.target.value)}
          placeholder="دیشب چه خوابی دیدید؟ (مثلاً: خواب دیدم در باغی پر از انار قدم می‌زنم...)"
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all min-h-[120px] resize-none text-lg leading-relaxed"
          dir="rtl"
        />

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 mt-4 mb-6">
          {DREAM_SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSuggestion(s.value)}
              className="px-3 py-1.5 bg-purple-900/30 border border-purple-500/30 rounded-full text-xs md:text-sm text-purple-200 hover:bg-purple-500/20 transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-t border-slate-700/50 pt-4">
          
          {/* Perspective Selector */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {DREAM_PERSPECTIVES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPerspective(p.id as DreamPerspective)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  perspective === p.id 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {getPerspectiveIcon(p.id)}
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleInterpret}
            disabled={!dream.trim() || loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all w-full md:w-auto justify-center ${
              !dream.trim() || loading
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105'
            }`}
          >
            {loading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                در حال تعبیر...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 rotate-180" />
                تعبیر کن
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Section */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-4 md:grid-cols-2"
          >
            {/* Main Interpretation */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-purple-900/20 border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-purple-500/20 transition-all" />
              <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                تعبیر اصلی
              </h3>
              <p className="text-slate-200 leading-loose text-lg text-justify">
                {result.interpretation}
              </p>
            </div>

            {/* Symbolism */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5">
              <h4 className="text-lg font-bold text-pink-300 mb-3 flex items-center gap-2">
                <Feather className="w-4 h-4" />
                نمادشناسی
              </h4>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                {result.symbolism}
              </p>
            </div>

            {/* Action */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5">
              <h4 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                <Moon className="w-4 h-4" />
                پیشنهاد و حکمت
              </h4>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                {result.action}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DreamInterpreter;
