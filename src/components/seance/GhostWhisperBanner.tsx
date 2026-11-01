import React, { useState, useEffect } from 'react';
import { Ghost, Volume2, VolumeX, Radio, Sparkles, MessageSquare, Play, Square } from 'lucide-react';
import { spookyAtmosphere, GhostWhisperEvent } from '../../audio/spookyAtmosphere';

export const GhostWhisperBanner: React.FC = () => {
  const [currentWhisper, setCurrentWhisper] = useState<GhostWhisperEvent | null>({
    text: "Listen closely... the threshold is listening...",
    source: "Whisper (Behind You)",
    pan: 0,
    timestamp: Date.now(),
  });
  const [isVisible, setIsVisible] = useState(true);
  const [isVoicesEnabled, setIsVoicesEnabled] = useState(spookyAtmosphere.getVoicesEnabled());
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Subscribe to new ghost whispers
    const unsubscribe = spookyAtmosphere.subscribeToWhispers((event) => {
      setCurrentWhisper(event);
      setIsVisible(true);
      setCountdown(8);
    });

    // 8-second countdown ticker
    const timer = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 8 : prev - 1));
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const handleToggleVoices = () => {
    const enabled = spookyAtmosphere.toggleVoices();
    setIsVoicesEnabled(enabled);
  };

  const handleManualWhisper = () => {
    spookyAtmosphere.triggerSingleWhisper();
  };

  if (!currentWhisper) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-auto select-none">
      <div className="relative rounded-2xl bg-black/90 border border-emerald-500/40 p-3.5 shadow-[0_0_40px_rgba(16,185,129,0.3)] backdrop-blur-xl flex flex-col gap-2 font-mono overflow-hidden">
        {/* Subtle glowing scanline on subtitle banner */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/10 to-transparent pointer-events-none" />

        {/* Top Status Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-emerald-950 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Ghost className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-bold tracking-wider uppercase">
              {currentWhisper.source}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">
              Next Whisper in: <span className="text-emerald-400 font-bold">{countdown}s</span>
            </span>

            {/* Quick Toggle Voices */}
            <button
              onClick={handleToggleVoices}
              className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                isVoicesEnabled
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                  : 'bg-red-950/60 text-red-300 border-red-700/60'
              }`}
              title="Toggle automatic 8-second creepy voices"
            >
              {isVoicesEnabled ? 'Voices: ON' : 'Voices: OFF'}
            </button>

            {/* Trigger instant whisper */}
            <button
              onClick={handleManualWhisper}
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[10px]"
              title="Trigger a creepy whisper right now"
            >
              <Sparkles className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* The Spoken Creepy Text */}
        <div className="py-1">
          <p className="text-sm md:text-base font-serif italic text-emerald-200 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] tracking-wide">
            "{currentWhisper.text}"
          </p>
        </div>

        {/* 8-second progress bar */}
        <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
          <div 
            style={{ width: `${(countdown / 8) * 100}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-linear shadow-[0_0_8px_#10b981]"
          />
        </div>
      </div>
    </div>
  );
};
