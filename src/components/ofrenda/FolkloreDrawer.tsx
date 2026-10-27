import React, { useEffect, useState } from 'react';
import { X, Sparkles, Heart, Flame, Wind, Droplets, Mountain } from 'lucide-react';
import { FolkloreItem } from '../../types';
import { fetchFolklore } from '../../lib/api';

interface FolkloreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FolkloreDrawer: React.FC<FolkloreDrawerProps> = ({ isOpen, onClose }) => {
  const [symbols, setSymbols] = useState<FolkloreItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchFolklore().then(setSymbols).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-ofrenda-altar to-black border-2 border-amber-500/50 rounded-3xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-amber-400 hover:text-white rounded-full bg-black/50 border border-amber-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono uppercase mb-2">
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            <span>Mesoamerican Lore & Symbolism</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-amber-100">
            The Living Philosophy of Día de los Muertos
          </h3>
          <p className="text-xs md:text-sm text-amber-200/80 mt-1 leading-relaxed">
            Día de los Muertos is not a day of mourning, but an exuberant celebration where the membrane between the living world and the Mictlán (the Aztec underworld) dissolves, allowing beloved ancestors to return for music, feast, and laughter.
          </p>
        </div>

        {/* The 4 Elements on the Altar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-black/50 border border-amber-900/60 text-center">
            <Mountain className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <span className="text-xs font-bold text-amber-300 block">Earth</span>
            <span className="text-[10px] text-slate-400">Pan de Muerto & Crops</span>
          </div>
          <div className="p-3 rounded-xl bg-black/50 border border-amber-900/60 text-center">
            <Wind className="w-5 h-5 text-fuchsia-400 mx-auto mb-1" />
            <span className="text-xs font-bold text-fuchsia-300 block">Wind</span>
            <span className="text-[10px] text-slate-400">Papel Picado Garland</span>
          </div>
          <div className="p-3 rounded-xl bg-black/50 border border-amber-900/60 text-center">
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <span className="text-xs font-bold text-orange-300 block">Fire</span>
            <span className="text-[10px] text-slate-400">Flickering Veladoras</span>
          </div>
          <div className="p-3 rounded-xl bg-black/50 border border-amber-900/60 text-center">
            <Droplets className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <span className="text-xs font-bold text-cyan-300 block">Water</span>
            <span className="text-[10px] text-slate-400">Quenches Soul Thirst</span>
          </div>
        </div>

        {/* Sacred Symbols */}
        <div className="space-y-3">
          {symbols.map((sym, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-amber-900/40">
              <h4 className="text-sm font-bold text-amber-300 font-serif mb-1">
                {sym.name}
              </h4>
              <p className="text-xs text-amber-100/90 leading-relaxed mb-1">
                {sym.lore}
              </p>
              <span className="text-[10px] font-mono text-amber-400/60">
                Meaning: {sym.nuhuMeaning}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
