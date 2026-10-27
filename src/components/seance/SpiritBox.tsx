import React, { useState, useEffect } from 'react';
import { Radio, Play, Square, Mic, Volume2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { channelSpirit } from '../../lib/api';
import { soundManager } from '../../audio/soundManager';
import { speakSpokenText, stopSpeaking } from '../../audio/speechSynthesis';
import { EMFMeter } from './EMFMeter';

interface SpiritBoxProps {
  onSpiritSpoke?: (text: string) => void;
}

export const SpiritBox: React.FC<SpiritBoxProps> = ({ onSpiritSpoke }) => {
  const [frequency, setFrequency] = useState(94.7);
  const [isSweeping, setIsSweeping] = useState(false);
  const [question, setQuestion] = useState('');
  const [isChanneling, setIsChanneling] = useState(false);
  const [spiritMessage, setSpiritMessage] = useState<string | null>(
    "THE RECEIVER IS WARM. WE HEAR YOUR SUB-CARRIERS... ASK BEFORE THE STATIC CLOSES IN..."
  );
  const [entityName, setEntityName] = useState('Signal 94.7 MHz');
  const [emfLevel, setEmfLevel] = useState(1.4);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Auto-sweep frequency scanner
  useEffect(() => {
    let timer: any;
    if (isSweeping) {
      timer = setInterval(() => {
        setFrequency(prev => {
          const next = prev >= 107.9 ? 87.5 : Math.round((prev + 0.2) * 10) / 10;
          if (Math.random() > 0.7) {
            soundManager.playRadioStaticBurst(120);
          }
          return next;
        });
      }, 350);
    }
    return () => clearInterval(timer);
  }, [isSweeping]);

  const handleAsk = async (presetQuestion?: string) => {
    const q = presetQuestion || question;
    if (!q.trim()) return;

    soundManager.playRadioStaticBurst(400);
    setIsChanneling(true);
    setEmfLevel(4.6 + Math.random() * 0.4); // Spike EMF
    setSpiritMessage(null);

    try {
      const res = await channelSpirit({
        question: q,
        frequency,
        emfReading: 4.8,
      });

      setSpiritMessage(res.response);
      setEntityName(res.spiritName);
      setEmfLevel(res.emfLevel);
      onSpiritSpoke?.(res.response);

      // Speak using ElevenLabs or Web Speech API
      setIsSpeaking(true);
      await speakSpokenText(res.response, {
        isSpooky: true,
        pitch: 0.75,
        rate: 0.8,
        onEnd: () => setIsSpeaking(false),
      });
    } catch (err) {
      setSpiritMessage("[STATIC TOO DENSE... FREQUENCY DRIFT... TRY RETUNING]");
    } finally {
      setIsChanneling(false);
      setTimeout(() => setEmfLevel(1.6), 4000);
    }
  };

  const handleReplayVoice = async () => {
    if (!spiritMessage) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    await speakSpokenText(spiritMessage, {
      isSpooky: true,
      pitch: 0.75,
      rate: 0.8,
      onEnd: () => setIsSpeaking(false),
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 rounded-3xl bg-gradient-to-b from-seance-terminal to-black border-2 border-emerald-900/60 shadow-[0_0_50px_rgba(16,185,129,0.15)] font-mono">
      {/* Top Header of the Spirit Box Hardware */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-emerald-950/80 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-wider text-emerald-200">
              P-SB26 SPIRIT BOX & EVP SCANNER
            </h3>
            <p className="text-xs text-slate-400">
              Mastra Spectral Agent + Gemma 2 Open-Weight Frequency Channeler
            </p>
          </div>
        </div>

        {/* EMF Meter Component */}
        <div className="w-full sm:w-64">
          <EMFMeter reading={emfLevel} isScanning={isSweeping || isChanneling} />
        </div>
      </div>

      {/* Frequency Tuning Dial Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 bg-black/80 rounded-2xl p-5 border border-emerald-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 uppercase tracking-widest">
              Carrier Wave Frequency
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              VHF / AM / FM SWEEP
            </span>
          </div>

          {/* Big Vintage Dial Readout */}
          <div className="flex items-baseline justify-center gap-3 py-4 my-2 rounded-xl bg-emerald-950/20 border border-emerald-500/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
            <span className="text-5xl md:text-6xl font-bold tracking-tight text-emerald-400 font-mono drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]">
              {frequency.toFixed(1)}
            </span>
            <span className="text-xl text-emerald-600 font-bold">MHz</span>
          </div>

          {/* Slider & Quick Controls */}
          <div className="space-y-3">
            <input
              type="range"
              min="87.5"
              max="108.0"
              step="0.1"
              value={frequency}
              onChange={e => {
                setFrequency(parseFloat(e.target.value));
                soundManager.playRadioStaticBurst(80);
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>87.5 MHz (Low Band)</span>
              <span>98.0 MHz (Sub-Carrier)</span>
              <span>108.0 MHz (High Band)</span>
            </div>
          </div>
        </div>

        {/* Scanner Hardware Buttons */}
        <div className="bg-black/80 rounded-2xl p-5 border border-emerald-900/60 flex flex-col justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-widest block mb-2">
              Sweep Controls
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Auto-sweep continuously jumps frequencies to detect spiritual formant fragments.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                setIsSweeping(!isSweeping);
                soundManager.playRadioStaticBurst(200);
              }}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                isSweeping
                  ? 'bg-red-950/80 border border-red-500/60 text-red-200 animate-pulse'
                  : 'bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300'
              }`}
            >
              {isSweeping ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isSweeping ? 'Halt Scanner' : 'Engage Auto-Sweep'}</span>
            </button>

            <button
              onClick={() => {
                const randomFreq = Math.round((88.0 + Math.random() * 19.5) * 10) / 10;
                setFrequency(randomFreq);
                soundManager.playRadioStaticBurst(200);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Random Frequency Jump</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spirit Transmission Readout Screen (CRT Phosphor) */}
      <div className="relative rounded-2xl bg-black p-5 border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)] mb-6 overflow-hidden">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-950 text-xs">
          <span className="text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE EVP DECODER: {entityName}
          </span>
          {spiritMessage && (
            <button
              onClick={handleReplayVoice}
              className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-purple-200 bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-800/60 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeaking ? 'Silencing...' : 'Vocalize (ElevenLabs)'}</span>
            </button>
          )}
        </div>

        {isChanneling ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-emerald-300/80 animate-pulse tracking-widest uppercase">
              Demodulating Spirit Transmission at {frequency.toFixed(1)} MHz...
            </p>
          </div>
        ) : (
          <div className="py-3">
            <p className="text-base md:text-lg text-emerald-300 leading-relaxed font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
              "{spiritMessage}"
            </p>
          </div>
        )}
      </div>

      {/* Question Prompt Input */}
      <div>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Ask the threshold (e.g. 'Is someone with us?' or 'What did you leave behind?')..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            className="flex-1 px-4 py-3 rounded-xl bg-black/80 border border-emerald-800/60 text-emerald-100 placeholder-emerald-700/50 text-sm focus:outline-none focus:border-emerald-400"
          />
          <button
            onClick={() => handleAsk()}
            disabled={isChanneling || !question.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-40"
          >
            {isChanneling ? 'Scanning...' : 'Broadcast Question'}
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          <span className="mr-1">Sample Queries:</span>
          {[
            "Who lingers in this machine?",
            "Are there spirits with us?",
            "What is beyond the veil?",
            "Can you see the living world?",
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(preset);
                handleAsk(preset);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-900 text-emerald-300/80 transition-all text-left"
            >
              "{preset}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
