import React, { useState, useEffect } from 'react';
import { Ghost, Sparkles, Radio, Volume2, Sliders, Play, Square, Key, X, Check, RefreshCw, Trash2 } from 'lucide-react';
import { spookyAtmosphere, GhostWhisperEvent } from '../../audio/spookyAtmosphere';
import { 
  getStoredBrowserVoice, 
  setStoredBrowserVoice, 
  getStoredVoicePitch, 
  setStoredVoicePitch, 
  getStoredVoiceRate, 
  setStoredVoiceRate,
  getStoredElevenLabsKey,
  setStoredElevenLabsKey,
  getStoredElevenLabsVoice,
  setStoredElevenLabsVoice,
  getStoredVoiceEngine,
  setStoredVoiceEngine,
  ELEVENLABS_VOICE_PRESETS,
  speakSpokenText,
  stopSpeaking
} from '../../audio/speechSynthesis';

export const GhostWhisperBanner: React.FC = () => {
  const [currentWhisper, setCurrentWhisper] = useState<GhostWhisperEvent | null>({
    text: "The threshold is listening... speak into the frequencies...",
    source: "EVP Carrier Wave",
    pan: 0,
    timestamp: Date.now(),
  });
  const [isVoicesEnabled, setIsVoicesEnabled] = useState(spookyAtmosphere.getVoicesEnabled());
  const [isManifesting, setIsManifesting] = useState(false);
  const [showTuner, setShowTuner] = useState(false);

  // Manual Voice Settings State
  const [engine, setEngine] = useState<'browser' | 'elevenlabs'>(getStoredVoiceEngine());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState(getStoredBrowserVoice());
  const [pitch, setPitch] = useState(getStoredVoicePitch());
  const [rate, setRate] = useState(getStoredVoiceRate());
  const [elevenLabsKey, setElevenLabsKey] = useState(getStoredElevenLabsKey());
  const [elevenLabsVoice, setElevenLabsVoice] = useState(getStoredElevenLabsVoice());
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);
  const [hasServerKey, setHasServerKey] = useState(false);
  const [serverKeyMasked, setServerKeyMasked] = useState('');

  // Detect and sync API key configured in .env
  useEffect(() => {
    fetch('/api/settings/elevenlabs')
      .then((r) => r.json())
      .then((d) => {
        if (d.hasKey) {
          setHasServerKey(true);
          setServerKeyMasked(d.apiKeyMasked);
          if (!elevenLabsKey && d.apiKey) {
            setElevenLabsKey(d.apiKey);
            setStoredElevenLabsKey(d.apiKey);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Load browser voices reliably via onvoiceschanged
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (!selectedVoiceName && voices.length > 0) {
          // Prefer Zira, Google, or Natural over robotic David
          const preferred = voices.find(v => 
            v.name.includes('Zira') || 
            v.name.includes('Natural') || 
            v.name.includes('Google') || 
            v.name.includes('Jenny')
          ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
          if (preferred) {
            setSelectedVoiceName(preferred.name);
            setStoredBrowserVoice(preferred.name);
          }
        }
      }
    };

    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  useEffect(() => {
    // Subscribe to new ghost whispers
    const unsubscribe = spookyAtmosphere.subscribeToWhispers((event) => {
      setCurrentWhisper(event);
      setIsManifesting(true);

      // Reset manifest highlight after 7 seconds
      const timer = setTimeout(() => {
        setIsManifesting(false);
      }, 7000);

      return () => clearTimeout(timer);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleVoices = () => {
    const enabled = spookyAtmosphere.toggleVoices();
    setIsVoicesEnabled(enabled);
  };

  const handleManualWhisper = () => {
    spookyAtmosphere.triggerSingleWhisper();
  };

  const handleTestSelectedVoice = () => {
    if (isTestingVoice) {
      stopSpeaking();
      setIsTestingVoice(false);
      setTestFeedback(null);
      return;
    }

    if (engine === 'elevenlabs') {
      const cleanKey = elevenLabsKey.trim();
      if (!cleanKey && !hasServerKey) {
        setTestFeedback('⚠️ Paste your ElevenLabs key or switch to Browser Voice');
        setTimeout(() => setTestFeedback(null), 4000);
        return;
      }
      if (cleanKey && !cleanKey.startsWith('sk_')) {
        setTestFeedback('⚠️ Key must start with "sk_". (You copied Key ID, not the Secret Key!)');
        setTimeout(() => setTestFeedback(null), 6000);
        return;
      }
    }

    const testPhrases = [
      "Can you hear me? I am speaking with your chosen voice.",
      "Listen closely... this is how I will whisper to you in the dark.",
      "The static carries my words across the room.",
    ];
    const phrase = testPhrases[Math.floor(Math.random() * testPhrases.length)];

    setTestFeedback('Speaking...');
    setIsTestingVoice(true);

    const safetyTimer = setTimeout(() => {
      setIsTestingVoice(false);
      setTestFeedback(prev => prev === 'Speaking...' ? null : prev);
    }, 6000);

    speakSpokenText(phrase, {
      browserVoiceName: selectedVoiceName,
      pitch,
      rate,
      voiceId: elevenLabsVoice,
      apiKey: engine === 'elevenlabs' ? (elevenLabsKey.trim() || undefined) : undefined,
      forceEngine: engine,
      onStart: () => setIsTestingVoice(true),
      onEnd: () => {
        clearTimeout(safetyTimer);
        setIsTestingVoice(false);
        setTestFeedback(
          engine === 'elevenlabs' && (elevenLabsKey.trim() || hasServerKey)
            ? '✓ Spoken via ElevenLabs AI'
            : `✓ Spoken via ${selectedVoiceName || 'Device Voice'}`
        );
        setTimeout(() => setTestFeedback(null), 3500);
      },
    });
  };

  const handleSaveElevenLabsKey = async () => {
    const cleanKey = elevenLabsKey.trim();
    if (!cleanKey) {
      setTestFeedback('⚠️ Paste your ElevenLabs key first');
      setTimeout(() => setTestFeedback(null), 3000);
      return;
    }
    if (!cleanKey.startsWith('sk_')) {
      setTestFeedback('⚠️ Key must start with "sk_". (You copied Key ID, not the Secret Key!)');
      setTimeout(() => setTestFeedback(null), 6000);
      return;
    }
    setStoredElevenLabsKey(cleanKey);
    setStoredElevenLabsVoice(elevenLabsVoice);
    setEngine('elevenlabs');
    setStoredVoiceEngine('elevenlabs');
    try {
      const res = await fetch('/api/settings/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: cleanKey, voiceId: elevenLabsVoice }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestFeedback('✓ Permanently saved to .env & activated!');
      } else {
        setTestFeedback(`⚠️ ${data.error || 'Failed to save'}`);
      }
      setTimeout(() => setTestFeedback(null), 4000);
    } catch {
      setTestFeedback('Saved locally.');
      setTimeout(() => setTestFeedback(null), 3000);
    }
  };

  const handleResetToBrowser = () => {
    setElevenLabsKey('');
    setStoredElevenLabsKey('');
    setEngine('browser');
    setStoredVoiceEngine('browser');
    setTestFeedback('Switched to free browser voice!');
    setTimeout(() => setTestFeedback(null), 3000);
  };

  if (!currentWhisper) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-auto select-none transition-all duration-500">
      <div className={`relative rounded-2xl bg-black/95 border p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-2 font-mono overflow-hidden transition-all duration-700 ${
        isManifesting
          ? 'border-emerald-400/80 shadow-[0_0_50px_rgba(16,185,129,0.35)] scale-[1.01]'
          : 'border-emerald-900/40 shadow-[0_0_25px_rgba(0,0,0,0.8)] opacity-95'
      }`}>
        {/* Subtle glowing scanline on subtitle banner */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/10 to-transparent pointer-events-none" />

        {/* Top Status Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-emerald-950 pb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isManifesting ? 'bg-emerald-400 animate-ping' : 'bg-emerald-600'}`} />
            <Ghost className={`w-3.5 h-3.5 ${isManifesting ? 'text-emerald-300 animate-pulse' : 'text-emerald-500'}`} />
            <span className="text-emerald-300 font-bold tracking-wider uppercase">
              {currentWhisper.source}
            </span>
            <span className="text-[10px] text-emerald-600 hidden sm:inline">
              • {isManifesting ? 'TRANSMISSION ACTIVE' : 'SCANNING SUB-CARRIERS'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Toggle Voices */}
            <button
              onClick={handleToggleVoices}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono border transition-all ${
                isVoicesEnabled
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                  : 'bg-red-950/60 text-red-300 border-red-700/60'
              }`}
              title="Toggle automatic unpredictable ghost whispers"
            >
              {isVoicesEnabled ? 'Whispers: ON' : 'Whispers: MUTED'}
            </button>

            {/* Instant Manifest */}
            <button
              onClick={handleManualWhisper}
              className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[10px] flex items-center gap-1 transition-all"
              title="Channel a spontaneous whisper right now"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Manifest</span>
            </button>

            {/* Manual Voice Tuner Toggle */}
            <button
              onClick={() => setShowTuner(!showTuner)}
              className={`px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 border transition-all ${
                showTuner 
                  ? 'bg-purple-900/60 text-purple-200 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                  : 'bg-slate-900 hover:bg-slate-800 text-purple-300 border-purple-900/60'
              }`}
              title="Manually customize voice, pitch, speed, and AI settings"
            >
              <Sliders className="w-3 h-3 text-purple-400" />
              <span>Voice</span>
            </button>
          </div>
        </div>

        {/* The Spoken Creepy Text */}
        <div className="py-1">
          <p className={`text-sm md:text-base font-serif italic tracking-wide transition-all duration-500 ${
            isManifesting
              ? 'text-emerald-200 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]'
              : 'text-emerald-300/80 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]'
          }`}>
            "{currentWhisper.text}"
          </p>
        </div>

        {/* EXPANDABLE MANUAL VOICE CUSTOMIZATION PANEL */}
        {showTuner && (
          <div className="mt-2 pt-3 border-t border-purple-950/80 space-y-3 bg-purple-950/20 p-3.5 rounded-xl border border-purple-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                Ghost Voice Studio (Manual Control)
              </span>
              <button 
                onClick={() => setShowTuner(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Voice Engine Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-lg border border-purple-900/60 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setEngine('browser');
                  setStoredVoiceEngine('browser');
                }}
                className={`flex-1 py-1.5 px-2 rounded-md font-bold transition-all ${
                  engine === 'browser'
                    ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ● Browser Voice (Free / No Key)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEngine('elevenlabs');
                  setStoredVoiceEngine('elevenlabs');
                }}
                className={`flex-1 py-1.5 px-2 rounded-md font-bold transition-all ${
                  engine === 'elevenlabs'
                    ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ● ElevenLabs AI (Key Required)
              </button>
            </div>

            {/* 1. If Browser Voice is Active */}
            {engine === 'browser' && (
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-purple-300 font-bold block">
                    Select Voice from Your Computer ({availableVoices.length} found):
                  </label>
                  <select
                    value={selectedVoiceName}
                    onChange={(e) => {
                      setSelectedVoiceName(e.target.value);
                      setStoredBrowserVoice(e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black border border-purple-800 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    {availableVoices.length === 0 ? (
                      <option value="">Default System Voice</option>
                    ) : (
                      availableVoices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang}) {v.name.includes('Zira') ? '★ Recommended (Smooth)' : v.name.includes('David') ? '(Robotic SAPI)' : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Pitch & Rate Sliders */}
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div>
                    <div className="flex justify-between text-purple-300 mb-0.5">
                      <span>Pitch (Tone):</span>
                      <span>{pitch.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.5"
                      step="0.05"
                      value={pitch}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setPitch(val);
                        setStoredVoicePitch(val);
                      }}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                    <span className="text-[8px] text-slate-500">1.0 = Natural human</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-purple-300 mb-0.5">
                      <span>Speed (Rate):</span>
                      <span>{rate.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.4"
                      step="0.05"
                      value={rate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setRate(val);
                        setStoredVoiceRate(val);
                      }}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                    <span className="text-[8px] text-slate-500">0.95 = Whispering pace</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. If ElevenLabs AI is Active */}
            {engine === 'elevenlabs' && (
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-purple-300 font-bold flex items-center gap-1">
                      <Key className="w-3 h-3 text-purple-400" />
                      ElevenLabs API Key:
                    </span>
                    <a href="https://elevenlabs.io" target="_blank" rel="noreferrer" className="text-purple-400 underline text-[9px]">
                      Get free key
                    </a>
                  </div>
                  {hasServerKey && (
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono bg-emerald-950/40 border border-emerald-800/50 px-2 py-1 rounded-md">
                      <span>✓ Active API key in .env ({serverKeyMasked || 'sk_...'})</span>
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    <input
                      type="password"
                      placeholder="Paste your ElevenLabs key..."
                      value={elevenLabsKey}
                      onChange={(e) => setElevenLabsKey(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-black border border-purple-900 text-[11px] text-white"
                    />
                    <button
                      onClick={handleSaveElevenLabsKey}
                      className="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-[10px] font-bold"
                    >
                      Save
                    </button>
                    {elevenLabsKey && (
                      <button
                        onClick={handleResetToBrowser}
                        className="p-1.5 bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-700 rounded-lg text-[10px]"
                        title="Clear key and reset to browser"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-purple-300 font-bold block">
                    Persona:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ELEVENLABS_VOICE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setElevenLabsVoice(p.id);
                          setStoredElevenLabsVoice(p.id);
                        }}
                        className={`p-1.5 rounded-lg text-left border text-[10px] ${
                          elevenLabsVoice === p.id
                            ? 'bg-purple-900/40 border-purple-400 text-purple-200'
                            : 'bg-black/40 border-purple-950/60 text-slate-400'
                        }`}
                      >
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-[9px] opacity-75">{p.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Row: Instant Audition */}
            <div className="flex items-center justify-between pt-1 border-t border-purple-950/60">
              <span className="text-[10px] text-emerald-400 font-mono">
                {testFeedback || ''}
              </span>
              <button
                onClick={handleTestSelectedVoice}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(168,85,247,0.4)]"
              >
                {isTestingVoice ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isTestingVoice ? 'Stop Audio' : '▶ Test Voice Aloud'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};