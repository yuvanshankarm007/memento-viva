import React from 'react';
import { Flame, Ghost, Sparkles, Skull } from 'lucide-react';
import { GatewayMode } from '../types';
import { soundManager } from '../audio/soundManager';

interface GatewaySwitchProps {
  currentMode: GatewayMode;
  onModeChange: (mode: GatewayMode) => void;
}

export const GatewaySwitch: React.FC<GatewaySwitchProps> = ({ currentMode, onModeChange }) => {
  const isOfrenda = currentMode === 'ofrenda';

  const handleSelect = (mode: GatewayMode) => {
    if (mode !== currentMode) {
      soundManager.playGatewayFlip();
      soundManager.setMode(mode);
      onModeChange(mode);
    }
  };

  return (
    <div className="w-full flex justify-center py-4 px-4">
      <div className="relative inline-flex p-1.5 rounded-2xl bg-black/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
        {/* Active glowing indicator pill */}
        <div
          className={`absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-500 ease-out ${
            isOfrenda
              ? 'left-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 shadow-[0_0_25px_rgba(245,158,11,0.5)]'
              : 'left-[calc(50%+3px)] w-[calc(50%-6px)] bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
          }`}
        />

        {/* Option 1: Día de los Muertos */}
        <button
          onClick={() => handleSelect('ofrenda')}
          className={`relative z-10 flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            isOfrenda
              ? 'text-white font-serif tracking-wide drop-shadow-sm'
              : 'text-slate-400 hover:text-amber-200'
          }`}
        >
          <Skull className={`w-4 h-4 transition-transform duration-300 ${isOfrenda ? 'scale-110 text-amber-200' : ''}`} />
          <span>Altar de Recuerdos</span>
          <span className="text-[10px] hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/30 text-amber-200 uppercase font-mono">
            Día de Muertos
          </span>
        </button>

        {/* Option 2: The Séance */}
        <button
          onClick={() => handleSelect('seance')}
          className={`relative z-10 flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            !isOfrenda
              ? 'text-emerald-100 font-mono tracking-wide drop-shadow-sm'
              : 'text-slate-400 hover:text-emerald-300'
          }`}
        >
          <Ghost className={`w-4 h-4 transition-transform duration-300 ${!isOfrenda ? 'scale-110 text-emerald-400' : ''}`} />
          <span>The Midnight Séance</span>
          <span className="text-[10px] hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/30 text-emerald-300 uppercase font-mono">
            Ghost in Machine
          </span>
        </button>
      </div>
    </div>
  );
};
