import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { HAFEZ_POEMS } from '../constants';
import { Poem } from '../types';

interface TheScrollProps {
  onSelect: (poem: Poem) => void;
}

const TheScroll: React.FC<TheScrollProps> = ({ onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // We multiply the poems visually to create a "fuller" deck feeling
  const displayPoems = [...HAFEZ_POEMS, ...HAFEZ_POEMS, ...HAFEZ_POEMS];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
       <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-10 text-center z-20"
      >
        <h2 className="text-2xl font-serif text-mystic-gold">The Divan</h2>
        <p className="text-slate-400 text-sm mt-2">Swipe the pages of fate. Stop when your heart signals.</p>
      </motion.div>

      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        className="w-full h-[60vh] overflow-x-auto flex items-center gap-6 px-[50vw] snap-x snap-mandatory no-scrollbar py-10"
      >
        {displayPoems.map((poem, idx) => (
          <motion.div
            key={`${poem.id}-${idx}`}
            className="shrink-0 snap-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div 
              onClick={() => onSelect(poem)}
              className="w-64 h-96 bg-gradient-to-b from-mystic-800 to-mystic-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col items-center justify-center p-6 relative cursor-pointer group hover:border-mystic-gold transition-colors duration-500"
            >
              {/* Card texture */}
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arches.png')]" />
              
              <div className="w-full h-full border border-slate-600/30 flex items-center justify-center relative">
                 <div className="absolute top-2 w-2 h-2 rounded-full bg-slate-600/50" />
                 <div className="absolute bottom-2 w-2 h-2 rounded-full bg-slate-600/50" />
                 
                 <span className="font-persian text-4xl text-slate-600/20 rotate-12 select-none group-hover:text-mystic-gold/20 transition-colors">
                   فال
                 </span>
              </div>
              
              <div className="absolute bottom-6">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500 group-hover:text-mystic-gold transition-colors">
                  Select
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

       {/* Vignette fade for scroll edges */}
       <div className="absolute inset-y-0 left-0 w-12 sm:w-32 bg-gradient-to-r from-[#020617] to-transparent pointer-events-none z-10" />
       <div className="absolute inset-y-0 right-0 w-12 sm:w-32 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default TheScroll;
