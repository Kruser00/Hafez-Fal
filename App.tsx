import React, { useState } from 'react';
import { AppStage, Poem, ContextOption } from './types';
import { CONTEXT_OPTIONS } from './constants';
import { motion, AnimatePresence } from 'framer-motion';
import RitualBreath from './components/RitualBreath';
import TheScroll from './components/TheScroll';
import TheReveal from './components/TheReveal';
import Starfield from './components/Starfield';
import { Sparkles, Moon, Volume2, VolumeX } from 'lucide-react';
import { audioEngine } from './utils/audioEngine';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.SPLASH);
  const [userContext, setUserContext] = useState<string>('');
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const startRitual = async () => {
    // Initialize audio context on first user gesture
    await audioEngine.init();
    audioEngine.playClick();
    setStage(AppStage.INTENT);
  };

  const toggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleContextSelect = (ctx: ContextOption) => {
    audioEngine.playClick();
    setUserContext(ctx);
    setStage(AppStage.BREATH);
  };

  const handleBreathComplete = () => {
    audioEngine.playCompletion();
    setStage(AppStage.SCROLL);
  };

  const handlePoemSelect = (poem: Poem) => {
    audioEngine.playClick();
    // Fade out ambient drone to let the Reveal swell take over
    audioEngine.fadeAmbientOut(3); 
    setSelectedPoem(poem);
    setStage(AppStage.REVEAL);
  };

  const resetRitual = () => {
    audioEngine.playClick();
    // Bring back the ambient drone for the new ritual
    audioEngine.fadeAmbientIn(2);
    setStage(AppStage.SPLASH);
    setUserContext('');
    setSelectedPoem(null);
  };

  // Static Background Base (Gradients)
  const BackgroundBase = () => (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
       {/* Deep gradient base */}
       <div className="absolute inset-0 bg-gradient-to-b from-mystic-900 via-[#131525] to-black" />
       {/* Fog/Mist Overlay */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse-slow" />
    </div>
  );

  return (
    <div className="min-h-screen text-slate-100 font-persian overflow-x-hidden relative" dir="rtl">
      <BackgroundBase />
      <Starfield />

      {/* Main Content Area */}
      <main className="relative z-10 w-full h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent relative z-50">
          <div className="flex items-center gap-2 text-mystic-gold">
            <Moon className="w-5 h-5 fill-current" />
            <h1 className="font-serif tracking-widest text-lg font-bold">فال حافظ</h1>
          </div>
          
          <button 
            onClick={toggleMute}
            className="text-slate-500 hover:text-mystic-gold transition-colors p-2"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </header>

        {/* Dynamic Stage Rendering */}
        <div className="flex-grow flex flex-col relative">
          <AnimatePresence mode="wait">
            
            {/* STAGE 1: SPLASH */}
            {stage === AppStage.SPLASH && (
              <motion.div
                key="splash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full px-4 text-center"
              >
                <motion.h2 
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.2, duration: 0.8 }}
                   className="text-5xl md:text-7xl text-slate-100 mb-8 leading-tight font-bold"
                >
                  لسان <span className="text-mystic-gold italic">الغیب</span>
                </motion.h2>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="max-w-md text-slate-300 mb-12 text-lg leading-loose"
                >
                  ای حافظ شیرازی، تو محرم هر رازی. <br/>
                  برای شنیدن پاسخ دل، نیت کنید.
                </motion.p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRitual}
                  className="px-12 py-4 border border-mystic-gold/30 bg-mystic-gold/10 backdrop-blur-sm rounded-full text-mystic-gold text-xl font-bold hover:bg-mystic-gold hover:text-mystic-900 transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.1)]"
                >
                  نیت کنید
                </motion.button>
              </motion.div>
            )}

            {/* STAGE 2: INTENT */}
            {stage === AppStage.INTENT && (
              <motion.div
                key="intent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center justify-center h-full px-4"
              >
                <h3 className="text-2xl md:text-3xl mb-10 text-center text-slate-200">دل در گرو چه دارید؟</h3>
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  {CONTEXT_OPTIONS.map((ctx) => (
                    <button
                      key={ctx}
                      onClick={() => handleContextSelect(ctx)}
                      className="p-5 border border-slate-700 bg-slate-900/50 hover:bg-mystic-gold/20 hover:border-mystic-gold text-slate-200 rounded-xl transition-all text-lg backdrop-blur-sm"
                    >
                      {ctx}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STAGE 3: BREATH */}
            {stage === AppStage.BREATH && (
              <motion.div
                key="breath"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <RitualBreath onComplete={handleBreathComplete} />
              </motion.div>
            )}

            {/* STAGE 4: SCROLL */}
            {stage === AppStage.SCROLL && (
              <motion.div
                key="scroll"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <TheScroll onSelect={handlePoemSelect} />
              </motion.div>
            )}

             {/* STAGE 5: REVEAL */}
             {stage === AppStage.REVEAL && selectedPoem && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto no-scrollbar"
              >
                <TheReveal 
                  poem={selectedPoem} 
                  userContext={userContext}
                  onReset={resetRitual}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
        
        {/* Footer/Hint */}
        {stage !== AppStage.REVEAL && (
          <motion.div 
            className="p-6 text-center text-xs text-slate-600 tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3" />
              تلفیق عرفان و هوش مصنوعی
            </span>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default App;