import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Server, Volume2, 
  Database, Shield, Eye, EyeOff, Save, Trash2, Radio, Play, Square, Ghost, Sliders
} from 'lucide-react';
import { SystemStatus } from '../types';
import { 
  getStoredElevenLabsKey, 
  setStoredElevenLabsKey, 
  getStoredElevenLabsVoice, 
  setStoredElevenLabsVoice, 
  getStoredBrowserVoice,
  setStoredBrowserVoice,
  getStoredVoicePitch,
  setStoredVoicePitch,
  getStoredVoiceRate,
  setStoredVoiceRate,
  ELEVENLABS_VOICE_PRESETS,
  speakSpokenText,
  stopSpeaking
} from '../audio/speechSynthesis';
import { spookyAtmosphere } from '../audio/spookyAtmosphere';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SystemStatus | null;
  onRefreshStatus: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, status, onRefreshStatus }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM');
  const [customVoiceId, setCustomVoiceId] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [whisperPacing, setWhisperPacing] = useState<'subtle' | 'balanced' | 'intense'>('balanced');

  // Local Browser Voice Selection & Sliders
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedBrowserVoice, setSelectedBrowserVoice] = useState(getStoredBrowserVoice());
  const [pitch, setPitch] = useState(getStoredVoicePitch());
  const [rate, setRate] = useState(getStoredVoiceRate());

  // MongoDB Atlas Connection State
  const [mongoUri, setMongoUri] = useState('');
  const [mongoMessage, setMongoMessage] = useState<string | null>(null);
  const [isConnectingMongo, setIsConnectingMongo] = useState(false);

  const handleConnectMongo = async () => {
    if (!mongoUri.trim()) return;
    setIsConnectingMongo(true);
    setMongoMessage(null);
    try {
      const res = await fetch('/api/settings/mongo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: mongoUri.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMongoMessage('✓ ' + (data.message || 'Connected to Atlas!'));
        onRefreshStatus();
      } else {
        setMongoMessage('✗ ' + (data.error || 'Connection failed'));
      }
    } catch {
      setMongoMessage('✗ Connection error');
    } finally {
      setIsConnectingMongo(false);
    }
  };

  // Listen to browser voice changes (Chromium populates asynchronously)
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (!selectedBrowserVoice && voices.length > 0) {
          const preferred = voices.find(v => 
            v.name.includes('Zira') || 
            v.name.includes('Natural') || 
            v.name.includes('Google') || 
            v.name.includes('Jenny')
          ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
          if (preferred) {
            setSelectedBrowserVoice(preferred.name);
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
    if (isOpen) {
      const storedKey = getStoredElevenLabsKey();
      const storedVoice = getStoredElevenLabsVoice();
      setApiKey(storedKey);
      setSelectedBrowserVoice(getStoredBrowserVoice());
      setPitch(getStoredVoicePitch());
      setRate(getStoredVoiceRate());

      const isPreset = ELEVENLABS_VOICE_PRESETS.some(p => p.id === storedVoice);
      if (isPreset) {
        setSelectedVoice(storedVoice);
        setCustomVoiceId('');
      } else if (storedVoice) {
        setSelectedVoice('custom');
        setCustomVoiceId(storedVoice);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveElevenLabs = async () => {
    const finalVoiceId = selectedVoice === 'custom' ? customVoiceId.trim() : selectedVoice;
    setStoredElevenLabsKey(apiKey);
    if (finalVoiceId) {
      setStoredElevenLabsVoice(finalVoiceId);
    }

    try {
      await fetch('/api/settings/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          voiceId: finalVoiceId || undefined,
        }),
      });
      setSaveMessage('✓ ElevenLabs configuration saved & active!');
      setTimeout(() => setSaveMessage(null), 4000);
      onRefreshStatus();
    } catch {
      setSaveMessage('Saved locally in browser.');
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const handleClearElevenLabs = async () => {
    setApiKey('');
    setStoredElevenLabsKey('');
    setSaveMessage('Key removed. Switched to device browser voice.');
    setTimeout(() => setSaveMessage(null), 4000);
    onRefreshStatus();
  };

  const handlePacingChange = (mode: 'subtle' | 'balanced' | 'intense') => {
    setWhisperPacing(mode);
    if (mode === 'subtle') {
      spookyAtmosphere.setWhisperIntervals(25000, 60000);
    } else if (mode === 'balanced') {
      spookyAtmosphere.setWhisperIntervals(14000, 36000);
    } else {
      spookyAtmosphere.setWhisperIntervals(7000, 16000);
    }
  };

  const handleTestVoice = () => {
    if (isTestingVoice) {
      stopSpeaking();
      setIsTestingVoice(false);
      return;
    }

    const voiceId = selectedVoice === 'custom' ? customVoiceId.trim() : selectedVoice;
    const testPhrases = [
      "Can you hear me through the copper wires? We are right behind you...",
      "Listen closely... this is how I will whisper to you in the dark.",
      "The threshold between the living and the dead has opened wide tonight.",
    ];
    const phrase = testPhrases[Math.floor(Math.random() * testPhrases.length)];

    speakSpokenText(phrase, {
      voiceId: voiceId || undefined,
      apiKey: apiKey.trim() || undefined,
      browserVoiceName: selectedBrowserVoice,
      pitch,
      rate,
      isSpooky: true,
      onStart: () => setIsTestingVoice(true),
      onEnd: () => setIsTestingVoice(false),
    });
  };

  const isConfigured = !!apiKey.trim() || status?.elevenlabs.status === 'configured';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl max-h-[92vh] overflow-y-auto font-mono text-xs md:text-sm text-slate-200">
        <button
          onClick={() => {
            stopSpeaking();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                Voice Studio & System Diagnostics
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Customize voices, change browser synthesizers, set pitch/speed, or enter an ElevenLabs key
            </p>
          </div>
          <button
            onClick={onRefreshStatus}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all"
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Interactive Voice Studio & Tuner */}
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-purple-950/30 via-slate-950 to-purple-950/20 border-2 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-purple-400 animate-pulse" />
              <span className="font-bold text-purple-200 text-sm md:text-base">
                Ghost Voice Studio (EVP Whispers & Readings)
              </span>
            </div>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border self-start sm:self-auto font-mono ${
              isConfigured
                ? 'bg-purple-900/40 text-purple-300 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
            }`}>
              {isConfigured ? '● ElevenLabs AI Active' : '● Local Browser Speech Active'}
            </span>
          </div>

          {/* SECTION A: Manual Local Browser Voice Customization */}
          <div className="mb-4 p-4 rounded-xl bg-black/60 border border-purple-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                Change Browser Voice (All {availableVoices.length} Installed Voices):
              </span>
              <span className="text-[10px] text-slate-400">Offline Free Mode</span>
            </div>

            <div>
              <select
                value={selectedBrowserVoice}
                onChange={(e) => {
                  setSelectedBrowserVoice(e.target.value);
                  setStoredBrowserVoice(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-purple-700 text-xs text-white focus:outline-none focus:border-purple-400"
              >
                {availableVoices.length === 0 ? (
                  <option value="">Default System Voice</option>
                ) : (
                  availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang}) {v.name.includes('Zira') ? '★ Recommended (Smooth female)' : v.name.includes('David') ? '(Monotone robotic)' : ''}
                    </option>
                  ))
                )}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Windows default "Microsoft David" is robotic. Switch to <span className="text-purple-300 font-bold">Microsoft Zira</span> or any installed Natural voice for a smoother tone.
              </p>
            </div>

            {/* Pitch & Speed Sliders */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex justify-between text-purple-200 mb-1">
                  <span>Pitch (Tone):</span>
                  <span className="font-mono text-purple-400">{pitch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
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
                <span className="text-[9px] text-slate-500">1.0 = Natural human</span>
              </div>

              <div>
                <div className="flex justify-between text-purple-200 mb-1">
                  <span>Speed (Cadence):</span>
                  <span className="font-mono text-purple-400">{rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
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
                <span className="text-[9px] text-slate-500">0.95 = Whispering pace</span>
              </div>
            </div>
          </div>

          {/* SECTION B: ElevenLabs AI Key & Persona (Ultra-realistic) */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-300">
              <span>Or Use ElevenLabs (Real Human Whispers & Vocals):</span>
              <a 
                href="https://elevenlabs.io" 
                target="_blank" 
                rel="noreferrer" 
                className="text-purple-400 hover:text-purple-300 underline font-normal text-[11px]"
              >
                Get free API key
              </a>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste ElevenLabs xi-api-key here for hyper-realistic human voices..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-purple-900/60 focus:border-purple-400 focus:outline-none text-white text-xs font-mono placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  title={showApiKey ? 'Hide key' : 'Show key'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveElevenLabs}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              {apiKey && (
                <button
                  type="button"
                  onClick={handleClearElevenLabs}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-600 transition-all"
                  title="Remove key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Voice Persona Presets */}
          <div className="mb-4">
            <label className="text-[11px] font-bold text-purple-300 block mb-2">
              ElevenLabs Persona:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ELEVENLABS_VOICE_PRESETS.map((preset) => {
                const isSelected = selectedVoice === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedVoice(preset.id);
                      setStoredElevenLabsVoice(preset.id);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-900/40 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)] text-purple-100'
                        : 'bg-black/40 border-purple-950/60 hover:border-purple-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <Ghost className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-300' : 'text-slate-500'}`} />
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-purple-400 font-mono">
                        {isSelected ? '✓ ACTIVE' : ''}
                      </span>
                    </div>
                    <span className="text-[11px] text-purple-200/90 font-sans block mb-0.5">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Whisper Pacing */}
          <div className="mb-4">
            <label className="text-[11px] font-bold text-purple-300 block mb-2">
              Whisper Timing & Randomness Pacing:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePacingChange('subtle')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  whisperPacing === 'subtle'
                    ? 'bg-purple-950/80 border-purple-400 text-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : 'bg-black/40 border-purple-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">Subtle</div>
                <div className="text-[10px] opacity-75">25s - 60s random</div>
              </button>

              <button
                type="button"
                onClick={() => handlePacingChange('balanced')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  whisperPacing === 'balanced'
                    ? 'bg-purple-950/80 border-purple-400 text-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : 'bg-black/40 border-purple-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">Balanced</div>
                <div className="text-[10px] opacity-75">14s - 36s random</div>
              </button>

              <button
                type="button"
                onClick={() => handlePacingChange('intense')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  whisperPacing === 'intense'
                    ? 'bg-purple-950/80 border-purple-400 text-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : 'bg-black/40 border-purple-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold">Intense</div>
                <div className="text-[10px] opacity-75">7s - 16s random</div>
              </button>
            </div>
          </div>

          {/* Live Audio Audition Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-purple-950/80">
            <div className="text-[11px] text-purple-300/80">
              {saveMessage ? (
                <span className="text-emerald-400 font-bold">{saveMessage}</span>
              ) : (
                <span>Test your voice settings immediately aloud:</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleTestVoice}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isTestingVoice
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
              }`}
            >
              {isTestingVoice ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isTestingVoice ? 'Stop Speaking' : '▶ Audition Voice Aloud'}</span>
            </button>
          </div>
        </div>

        {/* Sponsor Grid */}
        <div className="space-y-4">
          {/* 1. Google Gemma Open-Weight Model */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Featured Category: Best Use of Gemma (Google)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/40 text-amber-200 border border-amber-600/50">
                Mode: {status?.gemma.mode || 'ollama'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2 font-sans">
              {status?.gemma.details || 'Powers the Calavera Literaria Poet and the Haunted Shell spirit channeler.'}
            </p>
            <div className="text-[11px] text-amber-400/80 bg-black/50 p-2.5 rounded-lg border border-amber-900/40">
              Active Model: <code className="text-amber-200">{status?.gemma.model || 'gemma2:2b'}</code>
              <br />
              Local Command: <code className="text-slate-400">ollama run gemma2:2b</code>
            </div>
          </div>

          {/* 2. Mastra Open-Source Agent Framework */}
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-blue-300 text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                Partner Category: Best Use of Mastra
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-900/40 text-blue-200 border border-blue-600/50">
                v{status?.mastra.version || '1.81.0'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2 font-sans">
              Mastra orchestrates native agent pipelines with folklore memory lookup tools:
            </p>
            <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
              <li><code className="text-blue-300">CalaveraLiterariaAgent</code>: Synthesizes octosyllabic rhyming stanzas.</li>
              <li><code className="text-blue-300">SpiritBoxAgent</code>: Channels lingering ghosts with radio carrier sweeps.</li>
            </ul>
          </div>

          {/* 3. MongoDB Atlas */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Partner Category: Best Use of MongoDB Atlas
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded border ${
                status?.mongo.status === 'connected'
                  ? 'bg-emerald-900/40 text-emerald-200 border-emerald-600/50'
                  : 'bg-emerald-950 text-emerald-400 border-emerald-700/60'
              }`}>
                {status?.mongo.status === 'connected' ? '● Atlas Cluster Connected' : '● In-Memory Store Active (No key needed)'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3 font-sans">
              Stores persistent global ofrenda altars, candle counters, and supernatural séance session logs.
              <span className="text-emerald-300 block mt-1 font-mono text-[11px]">
                ℹ️ Note: Memento Viva works 100% out-of-the-box in memory without any MongoDB account!
              </span>
            </p>

            {/* Optional Atlas Connection Input */}
            <div className="p-3 rounded-xl bg-black/60 border border-emerald-900/60 space-y-2 mb-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-300 font-bold">Connect Your MongoDB Atlas Cluster (Optional):</span>
                <a 
                  href="https://www.mongodb.com/cloud/atlas/register" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  Get free M0 Atlas cluster
                </a>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={mongoUri}
                  onChange={(e) => setMongoUri(e.target.value)}
                  placeholder="mongodb+srv://username:password@cluster.mongodb.net/memento_viva..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-black border border-emerald-900 focus:border-emerald-400 focus:outline-none text-white text-xs font-mono placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={handleConnectMongo}
                  disabled={isConnectingMongo || !mongoUri.trim()}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isConnectingMongo ? 'Connecting...' : 'Connect'}</span>
                </button>
              </div>

              {mongoMessage && (
                <div className={`text-[11px] font-mono ${mongoMessage.startsWith('✓') ? 'text-emerald-400 font-bold' : 'text-red-400'}`}>
                  {mongoMessage}
                </div>
              )}
            </div>

            <div className="text-[11px] text-emerald-400/80 bg-black/50 p-2.5 rounded-lg border border-emerald-900/40 flex justify-between">
              <span>Database: <code className="text-emerald-200">{status?.mongo.database}</code></span>
              <span>Total Altar Items: <code className="text-emerald-200">{status?.mongo.itemCount ?? 4}</code></span>
            </div>
          </div>

          {/* 4. Render */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Featured Category: Best Use of Render
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-900/40 text-cyan-200 border border-cyan-600/50">
                Blueprint Ready
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2 font-sans">
              Includes <code className="text-cyan-300">render.yaml</code> specification and multi-stage <code className="text-cyan-300">Dockerfile</code> for automated zero-downtime deployment to Render Web Services with health check at <code className="text-cyan-300">/api/health</code>.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono transition-all"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};