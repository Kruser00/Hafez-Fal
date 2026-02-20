import React, { useState } from 'react';
import { AppStage, Poem, ContextOption, AppTab } from './types';
import { CONTEXT_OPTIONS } from './constants';
import { motion, AnimatePresence } from 'framer-motion';
import RitualBreath from './components/RitualBreath';
import TheScroll from './components/TheScroll';
import TheReveal from './components/TheReveal';
import Starfield from './components/Starfield';
import DreamInterpreter from './components/DreamInterpreter';
import { Sparkles, Moon, Volume2, VolumeX, Feather, Stars } from 'lucide-react';
import { audioEngine } from './utils/audioEngine';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.FAL);
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

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    audioEngine.playClick();
  };

  // Dynamic Background Base (Gradients)
  const BackgroundBase = () => (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-1000 ease-in-out">
       {/* Deep gradient base - shifts based on tab */}
       <div className={`absolute inset-0 bg-gradient-to-b transition-all duration-1000 ${
         activeTab === AppTab.FAL 
           ? 'from-mystic-900 via-[#131525] to-black' 
           : 'from-[#2e1065] via-[#1a1a2e] to-black' // Purple theme for Dream
       }`} />
       
       {/* Fog/Mist Overlay */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse-slow mix-blend-overlay" />
       
       {/* Purple accent orb for Dream tab */}
       <motion.div 
         animate={{ opacity: activeTab === AppTab.DREAM ? 0.4 : 0 }}
         className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/30 rounded-full blur-[120px]"
       />
       <motion.div 
         animate={{ opacity: activeTab === AppTab.DREAM ? 0.3 : 0 }}
         className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-pink-600/20 rounded-full blur-[150px]"
       />
    </div>
  );

  return (
    <div className="min-h-screen text-slate-100 font-persian overflow-x-hidden relative" dir="rtl">
      <BackgroundBase />
      <Starfield />

      {/* Main Content Area */}
      <main className="relative z-10 w-full h-screen flex flex-col supports-[height:100dvh]:h-[100dvh]">
        {/* Header */}
        <header className="p-4 md:p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent relative z-50 shrink-0 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center gap-3 text-mystic-gold">
            <div className="p-2 bg-mystic-gold/10 rounded-full border border-mystic-gold/20">
              {activeTab === AppTab.FAL ? <Moon className="w-5 h-5 fill-current" /> : <Stars className="w-5 h-5 text-purple-400" />}
            </div>
            <h1 className="font-serif tracking-widest text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-mystic-gold to-amber-200">
              {activeTab === AppTab.FAL ? 'فال حافظ' : 'تعبیر خواب'}
            </h1>
          </div>
          
          {/* Tab Switcher - Desktop/Tablet */}
          <div className="hidden md:flex bg-slate-900/80 rounded-full p-1 border border-slate-700/50 backdrop-blur-md absolute left-1/2 -translate-x-1/2 top-6">
            <button
              onClick={() => handleTabChange(AppTab.FAL)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === AppTab.FAL 
                  ? 'bg-mystic-gold text-mystic-900 shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              فال حافظ
            </button>
            <button
              onClick={() => handleTabChange(AppTab.DREAM)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === AppTab.DREAM 
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              تعبیر خواب
            </button>
          </div>

          <button 
            onClick={toggleMute}
            className="text-slate-500 hover:text-mystic-gold transition-colors p-2 rounded-full hover:bg-white/5"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex justify-center pb-2 px-4 relative z-40">
           <div className="flex bg-slate-900/80 rounded-xl p-1 border border-slate-700/50 backdrop-blur-md w-full max-w-xs">
            <button
              onClick={() => handleTabChange(AppTab.FAL)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === AppTab.FAL 
                  ? 'bg-mystic-gold text-mystic-900 shadow-sm' 
                  : 'text-slate-400'
              }`}
            >
              فال حافظ
            </button>
            <button
              onClick={() => handleTabChange(AppTab.DREAM)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === AppTab.DREAM 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-400'
              }`}
            >
              تعبیر خواب
            </button>
          </div>
        </div>

        {/* Dynamic Stage Rendering */}
        <div className="flex-grow flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* DREAM TAB */}
            {activeTab === AppTab.DREAM && (
              <motion.div
                key="dream-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full w-full"
              >
                <DreamInterpreter />
              </motion.div>
            )}

            {/* FAL TAB */}
            {activeTab === AppTab.FAL && (
              <motion.div
                key="fal-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full w-full flex flex-col"
              >
                <AnimatePresence mode="wait">
                  {/* STAGE 1: SPLASH */}
                  {stage === AppStage.SPLASH && (
                    <motion.div
                      key="splash"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col items-center justify-center h-full px-4 text-center pb-20"
                    >
                      <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-5xl md:text-7xl text-slate-100 mb-6 md:mb-8 leading-tight font-bold"
                      >
                        لسان <span className="text-mystic-gold italic">الغیب</span>
                      </motion.h2>
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-md text-slate-300 mb-10 md:mb-12 text-base md:text-lg leading-loose"
                      >
                        ای حافظ شیرازی، تو محرم هر رازی. <br/>
                        برای شنیدن پاسخ دل، نیت کنید.
                      </motion.p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startRitual}
                        className="px-10 py-3 md:px-12 md:py-4 border border-mystic-gold/30 bg-mystic-gold/10 backdrop-blur-sm rounded-full text-mystic-gold text-lg md:text-xl font-bold hover:bg-mystic-gold hover:text-mystic-900 transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.1)]"
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
                      className="flex flex-col items-center justify-center h-full px-4 pb-12"
                    >
                      <h3 className="text-2xl md:text-3xl mb-8 md:mb-10 text-center text-slate-200">دل در گرو چه دارید؟</h3>
                      <div className="grid grid-cols-2 gap-3 md:gap-4 w-full max-w-md">
                        {CONTEXT_OPTIONS.map((ctx) => (
                          <button
                            key={ctx}
                            onClick={() => handleContextSelect(ctx)}
                            className="p-4 md:p-5 border border-slate-700 bg-slate-900/50 hover:bg-mystic-gold/20 hover:border-mystic-gold text-slate-200 rounded-xl transition-all text-base md:text-lg backdrop-blur-sm"
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
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
