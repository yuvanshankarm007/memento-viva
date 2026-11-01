import React from 'react';
import { Volume2, Ghost, Sparkles, Skull, Flame } from 'lucide-react';

interface AudioUnlockModalProps {
  onEnter: () => void;
}

export const AudioUnlockModal: React.FC<AudioUnlockModalProps> = ({ onEnter }) => {
  return (
    <div 
      onClick={onEnter}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl cursor-pointer select-none"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="relative max-w-lg w-full bg-gradient-to-b from-[#140b1c] via-[#0b0f14] to-black border-2 border-amber-500/60 rounded-3xl p-6 sm:p-10 text-center shadow-[0_0_80px_rgba(245,158,11,0.3)] animate-float"
      >
        {/* Glowing Skull Emblem */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]">
          <Skull className="w-10 h-10 text-amber-300 animate-pulse" />
        </div>

        <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-400 block mb-2">
          HACKTOBERFEST 2026 • GHOST IN THE MACHINE
        </span>

        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-amber-100 tracking-wide mb-3">
          Cross the Threshold
        </h2>

        <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-sans mb-8">
          The portal between the living and the spirit realm is open. Step inside to awaken the <span className="text-emerald-300 font-semibold">spooky ambient score</span> and hear the <span className="text-purple-300 font-semibold">whispers of lingering entities every 8 seconds</span>.
        </p>

        {/* Enter Button */}
        <button
          onClick={onEnter}
          className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-emerald-600 hover:from-amber-400 hover:via-orange-500 hover:to-emerald-500 text-black font-serif font-bold text-base sm:text-lg tracking-wider uppercase shadow-[0_0_30px_rgba(245,158,11,0.6)] transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Volume2 className="w-5 h-5 stroke-[2.5]" />
          <span>Enter the Threshold</span>
        </button>

        <p className="text-[11px] font-mono text-slate-500 mt-4">
          Click anywhere or press any key to allow browser audio
        </p>
      </div>
    </div>
  );
};
