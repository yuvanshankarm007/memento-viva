import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Moon, Sun } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface OuijaBoardProps {
  spellTargetText?: string | null;
}

const LETTERS_ROW_1 = 'ABCDEFGHIJKLM'.split('');
const LETTERS_ROW_2 = 'NOPQRSTUVWXYZ'.split('');
const NUMBERS = '1234567890'.split('');

export const OuijaBoard: React.FC<OuijaBoardProps> = ({ spellTargetText }) => {
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [spelledHistory, setSpelledHistory] = useState<string>('');
  const [planchettePos, setPlanchettePos] = useState({ x: 50, y: 50 }); // in percentages

  const isAnimatingRef = useRef(false);

  // If a new text arrives, animate the planchette to spell out keywords!
  useEffect(() => {
    if (!spellTargetText) return;

    const words = spellTargetText.replace(/[^A-Za-z0-9\s]/g, '').toUpperCase().split(/\s+/).filter(Boolean);
    const textToSpell = words.slice(0, 5).join(' '); // spell first few words

    if (!textToSpell) return;

    let index = 0;
    isAnimatingRef.current = true;
    setSpelledHistory('');

    const interval = setInterval(() => {
      if (index >= textToSpell.length) {
        clearInterval(interval);
        isAnimatingRef.current = false;
        setActiveLetter(null);
        return;
      }

      const char = textToSpell[index];
      index++;

      if (char === ' ') {
        setActiveLetter(null);
        return;
      }

      setActiveLetter(char);
      setSpelledHistory(prev => prev + char);
      soundManager.playEmfClick();

      // Estimate position of char on board
      const isRow1 = LETTERS_ROW_1.includes(char);
      const isRow2 = LETTERS_ROW_2.includes(char);
      const isNum = NUMBERS.includes(char);

      if (isRow1) {
        const charIdx = LETTERS_ROW_1.indexOf(char);
        const xPct = 15 + (charIdx / (LETTERS_ROW_1.length - 1)) * 70;
        setPlanchettePos({ x: xPct, y: 42 });
      } else if (isRow2) {
        const charIdx = LETTERS_ROW_2.indexOf(char);
        const xPct = 18 + (charIdx / (LETTERS_ROW_2.length - 1)) * 64;
        setPlanchettePos({ x: xPct, y: 54 });
      } else if (isNum) {
        const charIdx = NUMBERS.indexOf(char);
        const xPct = 25 + (charIdx / (NUMBERS.length - 1)) * 50;
        setPlanchettePos({ x: xPct, y: 70 });
      }
    }, 600);

    return () => clearInterval(interval);
  }, [spellTargetText]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 md:p-10 rounded-3xl bg-[#1b140f] border-4 border-[#3d2c1d] shadow-[0_0_60px_rgba(0,0,0,0.9)] text-[#d4af37] select-none relative font-serif overflow-hidden">
      {/* Wood grain background texture effect */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.15) 0%, transparent 80%)',
        }}
      />

      {/* Top Corners: Sun & Moon */}
      <div className="flex items-center justify-between mb-8 px-4 border-b border-[#3d2c1d]/60 pb-4">
        <div className="flex items-center gap-3">
          <Sun className="w-8 h-8 text-[#d4af37]/70 animate-pulse" />
          <span className="text-xl md:text-2xl font-bold tracking-widest">YES</span>
        </div>
        <div className="text-center">
          <h4 className="text-2xl md:text-4xl font-bold tracking-[0.3em] font-serif uppercase text-[#f3e5ab] drop-shadow-md">
            OUIJA
          </h4>
          <span className="text-[10px] tracking-widest text-[#d4af37]/60 uppercase font-mono">
            MEMENTO VIVA MYSTIC ORACLE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl md:text-2xl font-bold tracking-widest">NO</span>
          <Moon className="w-8 h-8 text-[#d4af37]/70" />
        </div>
      </div>

      {/* Board Body: Letters Arcs */}
      <div className="py-6 relative">
        {/* Row 1: A - M Arc */}
        <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-4 flex-wrap">
          {LETTERS_ROW_1.map(char => (
            <span
              key={char}
              className={`text-xl sm:text-2xl md:text-3xl font-bold font-serif w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${
                activeLetter === char
                  ? 'text-white scale-125 bg-amber-600/40 shadow-[0_0_15px_#f59e0b]'
                  : 'text-[#d4af37]/80'
              }`}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Row 2: N - Z Arc */}
        <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-6 flex-wrap">
          {LETTERS_ROW_2.map(char => (
            <span
              key={char}
              className={`text-xl sm:text-2xl md:text-3xl font-bold font-serif w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${
                activeLetter === char
                  ? 'text-white scale-125 bg-amber-600/40 shadow-[0_0_15px_#f59e0b]'
                  : 'text-[#d4af37]/80'
              }`}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Numbers Row */}
        <div className="flex justify-center gap-3 sm:gap-5 mb-8">
          {NUMBERS.map(num => (
            <span
              key={num}
              className={`text-base sm:text-lg md:text-xl font-bold font-serif w-7 h-7 flex items-center justify-center transition-all duration-300 ${
                activeLetter === num
                  ? 'text-white scale-125 bg-amber-600/40 shadow-[0_0_15px_#f59e0b]'
                  : 'text-[#d4af37]/60'
              }`}
            >
              {num}
            </span>
          ))}
        </div>

        {/* The Animated Planchette */}
        <div
          style={{
            left: `${planchettePos.x}%`,
            top: `${planchettePos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute z-20 pointer-events-none transition-all duration-500 ease-out flex flex-col items-center justify-center"
        >
          <div className="w-16 h-20 md:w-20 md:h-24 bg-gradient-to-b from-[#4a3525] to-[#2b1e15] border-2 border-[#d4af37] rounded-t-full rounded-b-lg shadow-[0_15px_25px_rgba(0,0,0,0.9)] flex items-center justify-center relative">
            {/* Viewing hole */}
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-black/60 border border-[#d4af37] flex items-center justify-center shadow-inner">
              <span className="text-xs text-amber-300 font-bold">{activeLetter || '•'}</span>
            </div>
            <span className="absolute -bottom-2 text-[8px] font-mono text-[#d4af37] bg-black/80 px-1 rounded">
              PLAN适
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: Goodbye */}
      <div className="text-center pt-4 border-t border-[#3d2c1d]/60">
        <span className="text-xl md:text-3xl font-bold tracking-[0.4em] font-serif uppercase text-[#d4af37]/80">
          GOODBYE
        </span>
      </div>

      {/* Spelled-out live ledger */}
      {spelledHistory && (
        <div className="mt-4 text-center">
          <span className="text-xs font-mono uppercase text-slate-400 mr-2">Spirits have spelled:</span>
          <span className="text-sm font-mono font-bold tracking-widest text-amber-300 bg-black/60 px-3 py-1 rounded-md border border-[#3d2c1d]">
            "{spelledHistory}"
          </span>
        </div>
      )}
    </div>
  );
};
