import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Settings, ExternalLink, Flame, Radio, Heart, Ghost } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { spookyAtmosphere } from '../audio/spookyAtmosphere';
import { GatewayMode, SystemStatus } from '../types';

interface HeaderProps {
  mode: GatewayMode;
  systemStatus: SystemStatus | null;
  onOpenSettings: () => void;
  onOpenFolklore?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, systemStatus, onOpenSettings, onOpenFolklore }) => {
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [isVoicesEnabled, setIsVoicesEnabled] = useState(spookyAtmosphere.getVoicesEnabled());

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (muted) {
      spookyAtmosphere.stop();
    } else {
      spookyAtmosphere.start();
    }
  };

  const handleToggleVoices = () => {
    const enabled = spookyAtmosphere.toggleVoices();
    setIsVoicesEnabled(enabled);
  };

  const isOfrenda = mode === 'ofrenda';

  return (
    <header className={`w-full transition-colors duration-700 border-b ${
      isOfrenda 
        ? 'bg-ofrenda-night/90 border-amber-900/40 backdrop-blur-md text-amber-100' 
        : 'bg-seance-void/95 border-emerald-950/60 backdrop-blur-md text-emerald-100'
    } sticky top-0 z-40 px-4 py-3 md:px-8`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-all duration-500 ${
            isOfrenda
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
          }`}>
            {isOfrenda ? <Flame className="w-6 h-6 animate-pulse" /> : <Radio className="w-6 h-6 animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-wider font-serif bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">
                MEMENTO VIVA
              </h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono uppercase border ${
                isOfrenda
                  ? 'bg-amber-950/60 text-amber-300 border-amber-700/50'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
              }`}>
                {isOfrenda ? 'Día de los Muertos' : 'Séance & EVP'}
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {isOfrenda 
                ? 'El Umbral & Living Ofrenda — Honoring past spirits with open-weight intelligence' 
                : 'Ghost in the Machine — Autonomous paranormal terminal & spirit scanner'}
            </p>
          </div>
        </div>

        {/* Sponsor Badges (Covering 5 DEV Challenge Sponsor Categories) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 text-[11px] font-mono">
          {/* Gemma 2 Badge */}
          <div 
            onClick={onOpenSettings}
            title="Category: Best Use of Gemma (Google Gemma 2 Open-Weight LLM)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:border-amber-400 hover:bg-amber-900/40 cursor-pointer transition-all"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Gemma 2</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* ElevenLabs Badge */}
          <div 
            onClick={onOpenSettings}
            title="Category: Best Use of ElevenLabs (Ethereal Spirit Whispers & EVP Voice)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:border-purple-400 hover:bg-purple-900/40 cursor-pointer transition-all"
          >
            <span>ElevenLabs</span>
          </div>

          {/* Mastra Badge */}
          <div 
            onClick={onOpenSettings}
            title="Category: Best Use of Mastra (Open-Source Agent Orchestration)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-950/40 border border-blue-500/30 text-blue-300 hover:border-blue-400 hover:bg-blue-900/40 cursor-pointer transition-all"
          >
            <span>Mastra</span>
          </div>

          {/* MongoDB Atlas Badge */}
          <div 
            onClick={onOpenSettings}
            title="Category: Best Use of MongoDB Atlas (Eternal Ofrenda & Spirit Vault)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/40 cursor-pointer transition-all"
          >
            <span>MongoDB</span>
          </div>

          {/* Render Badge */}
          <div 
            onClick={onOpenSettings}
            title="Category: Best Use of Render (Cloud Blueprint Deployment)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/40 cursor-pointer transition-all"
          >
            <span>Render</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onOpenFolklore && isOfrenda && (
            <button
              onClick={onOpenFolklore}
              className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-pink-950/50 hover:bg-pink-900/60 border border-pink-700/50 text-pink-300 transition-all"
            >
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              <span>Folklore & Lore</span>
            </button>
          )}

          {/* Spooky 5-second voices toggle button */}
          <button
            onClick={handleToggleVoices}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              isVoicesEnabled
                ? 'bg-purple-950/60 border-purple-500/50 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-slate-900/60 border-slate-700 text-slate-500'
            }`}
            title={isVoicesEnabled ? 'Creepy spirit voices every 5s: Active' : 'Creepy voices: Disabled'}
          >
            <Ghost className={`w-3.5 h-3.5 ${isVoicesEnabled ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{isVoicesEnabled ? '5s Voices' : 'Mute Voices'}</span>
          </button>

          {/* Audio toggle button */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-lg border transition-all ${
              isMuted
                ? 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                : isOfrenda
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
            }`}
            title={isMuted ? 'Unmute atmospheric audio' : 'Mute atmospheric audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
            title="Settings & System Diagnostics"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
