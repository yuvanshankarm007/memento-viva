import React from 'react';

const FLAGS = [
  { color: 'bg-fuchsia-600', border: 'border-fuchsia-400', icon: '💀', title: 'Recuerdo' },
  { color: 'bg-amber-500', border: 'border-amber-300', icon: '🌼', title: 'Vida' },
  { color: 'bg-cyan-600', border: 'border-cyan-400', icon: '🕯️', title: 'Luz' },
  { color: 'bg-purple-600', border: 'border-purple-400', icon: '🕊️', title: 'Paz' },
  { color: 'bg-rose-500', border: 'border-rose-300', icon: '❤️', title: 'Amor' },
  { color: 'bg-orange-500', border: 'border-orange-300', icon: '☀️', title: 'Sol' },
  { color: 'bg-emerald-600', border: 'border-emerald-400', icon: '🌿', title: 'Esperanza' },
  { color: 'bg-pink-600', border: 'border-pink-400', icon: '✨', title: 'Eternidad' },
];

export const PapelPicadoBanner: React.FC = () => {
  return (
    <div className="w-full overflow-hidden select-none py-2 relative z-10 border-b border-amber-900/20">
      {/* Hanging Garland String */}
      <div className="w-full h-0.5 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 opacity-60 relative" />

      {/* Fluttering Paper Flags */}
      <div className="flex justify-between items-start px-2 gap-1.5 md:gap-3 max-w-7xl mx-auto overflow-x-auto scrollbar-none">
        {FLAGS.map((flag, idx) => (
          <div
            key={idx}
            style={{
              animationDelay: `${idx * 0.15}s`,
              transformOrigin: 'top center',
            }}
            className={`flex-shrink-0 w-16 sm:w-20 md:w-24 h-20 sm:h-24 md:h-28 ${flag.color} ${flag.border} border-t-0 border-x border-b-2 rounded-b-md shadow-lg p-1.5 flex flex-col items-center justify-between text-white animate-float opacity-90 transition-transform hover:scale-105`}
          >
            {/* Paper cut-out triangular patterns at top */}
            <div className="flex gap-1 justify-center w-full opacity-60">
              <span className="w-1.5 h-1.5 bg-black/40 rounded-full" />
              <span className="w-1.5 h-1.5 bg-black/40 rounded-full" />
              <span className="w-1.5 h-1.5 bg-black/40 rounded-full" />
            </div>

            {/* Emblem in center */}
            <div className="text-xl sm:text-2xl filter drop-shadow">
              {flag.icon}
            </div>

            {/* Title / Pattern cut-out at bottom */}
            <div className="text-[9px] sm:text-[10px] font-mono tracking-wider uppercase opacity-90 bg-black/20 px-1 py-0.5 rounded w-full text-center truncate">
              {flag.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
