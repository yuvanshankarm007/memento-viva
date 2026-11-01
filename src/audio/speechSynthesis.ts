/**
 * Voice & Spirit Audio Channeler
 * Category: Best Use of ElevenLabs (Hacktoberfest 2026 Week 4)
 * 
 * Plays high-fidelity ElevenLabs neural voice audio stream,
 * with bulletproof Chromium/Brave Web Audio buffer decoding,
 * SpeechSynthesis, and procedural Web Audio API fallbacks.
 */
import { spookyAtmosphere } from './spookyAtmosphere';

let activeAudioElement: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null; // CRITICAL: Prevents V8 garbage collection!
let activeBufferSource: AudioBufferSourceNode | null = null;
let localVoiceContext: AudioContext | null = null;

export const ELEVENLABS_VOICE_PRESETS = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', title: 'Deep Haunted Murmur', desc: 'Grave, resonant, spectral male presence (Free Tier Verified)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', title: 'Soft Whisper / Ghostly Maiden', desc: 'Delicate, intimate, ghostly apparition (Free Tier Verified)' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', title: 'Mournful Soul', desc: 'Trembling, ancient, sorrowful voice (Free Tier Verified)' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', title: 'Eerie British Storyteller', desc: 'Crisp, mysterious ancestral voice (Free Tier Verified)' },
];

export function getStoredElevenLabsKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('memento_elevenlabs_key') || localStorage.getItem('elevenlabs_api_key') || '';
}

export function setStoredElevenLabsKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key.trim()) {
    localStorage.removeItem('memento_elevenlabs_key');
    localStorage.removeItem('elevenlabs_api_key');
  } else {
    localStorage.setItem('memento_elevenlabs_key', key.trim());
  }
}

export function getStoredElevenLabsVoice(): string {
  if (typeof window === 'undefined') return 'pNInz6obpgDQGcFmaJgB';
  const stored = localStorage.getItem('memento_elevenlabs_voice');
  // If stored voice was old Rachel (which is blocked by ElevenLabs on free plans), upgrade to Adam
  if (!stored || stored === '21m00Tcm4TlvDq8ikWAM' || stored === '29vD33N1CtxCmqQRPOHJ') {
    return 'pNInz6obpgDQGcFmaJgB';
  }
  return stored;
}

export function setStoredElevenLabsVoice(voiceId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('memento_elevenlabs_voice', voiceId.trim());
}

export function getStoredBrowserVoice(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('memento_browser_voice') || '';
}

export function setStoredBrowserVoice(voiceName: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('memento_browser_voice', voiceName.trim());
}

export function getStoredVoiceRate(): number {
  if (typeof window === 'undefined') return 0.95;
  const val = parseFloat(localStorage.getItem('memento_voice_rate') || '0.95');
  return isNaN(val) ? 0.95 : val;
}

export function setStoredVoiceRate(rate: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('memento_voice_rate', rate.toString());
}

export function getStoredVoicePitch(): number {
  if (typeof window === 'undefined') return 1.0;
  const val = parseFloat(localStorage.getItem('memento_voice_pitch') || '1.0');
  return isNaN(val) ? 1.0 : val;
}

export function setStoredVoicePitch(pitch: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('memento_voice_pitch', pitch.toString());
}

export function getStoredVoiceEngine(): 'browser' | 'elevenlabs' {
  if (typeof window === 'undefined') return 'browser';
  return (localStorage.getItem('memento_voice_engine') as any) || 'browser';
}

export function setStoredVoiceEngine(engine: 'browser' | 'elevenlabs'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('memento_voice_engine', engine);
}

/**
 * Retrieve installed voices on user's current browser/operating system
 */
export function getAvailableBrowserVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

/**
 * Procedural Web Audio Ghostly Whisper (Failsafe for when browser speech is blocked)
 */
export function playProceduralWhisperTone() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(140, now + 1.2);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(330, now);
    osc2.frequency.exponentialRampToValueAtTime(210, now + 1.2);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(4.0, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.5);
    osc2.stop(now + 1.5);
  } catch {}
}

export function getVoiceAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  // 1. Prioritize atmospheric context if running
  const atmosphericCtx = spookyAtmosphere.getContext();
  if (atmosphericCtx && atmosphericCtx.state !== 'closed') {
    if (atmosphericCtx.state === 'suspended') {
      atmosphericCtx.resume().catch(() => {});
    }
    return atmosphericCtx;
  }

  // 2. Fallback to local context
  if (!localVoiceContext || localVoiceContext.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      localVoiceContext = new AudioCtx();
    }
  }
  if (localVoiceContext && localVoiceContext.state === 'suspended') {
    localVoiceContext.resume().catch(() => {});
  }
  return localVoiceContext;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Decode and play audio buffer through active Web Audio context
 * Guarantees zero-block audio playback identical to the background drone
 */
async function playAudioBufferThroughContext(
  ctx: AudioContext,
  arrayBuffer: ArrayBuffer,
  options?: {
    rate?: number;
    pan?: number;
    onEnd?: () => void;
  }
): Promise<boolean> {
  try {
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    // Stop any previous playing buffer source
    if (activeBufferSource) {
      try { activeBufferSource.stop(); activeBufferSource.disconnect(); } catch {}
      activeBufferSource = null;
    }

    const source = ctx.createBufferSource();
    activeBufferSource = source;
    source.buffer = audioBuffer;
    source.playbackRate.value = options?.rate || 0.95;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(1.0, ctx.currentTime);

    if (options?.pan !== undefined && ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, options.pan)), ctx.currentTime);
      source.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(ctx.destination);
    } else {
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
    }

    let endedCalled = false;
    const triggerEnd = () => {
      if (!endedCalled) {
        endedCalled = true;
        if (activeBufferSource === source) {
          activeBufferSource = null;
        }
        options?.onEnd?.();
      }
    };

    source.onended = triggerEnd;

    // Safety timeout in case onended is missed
    const durationMs = ((audioBuffer.duration / (options?.rate || 0.95)) + 0.3) * 1000;
    setTimeout(triggerEnd, Math.max(1000, durationMs));

    source.start(0);
    return true;
  } catch (err) {
    console.warn('Web Audio buffer decode error:', err);
    return false;
  }
}

export async function speakSpokenText(
  text: string,
  options?: {
    voiceId?: string;
    apiKey?: string;
    rate?: number;
    pitch?: number;
    pan?: number;
    isSpooky?: boolean;
    forceEngine?: 'browser' | 'elevenlabs';
    browserVoiceName?: string;
    onStart?: () => void;
    onEnd?: () => void;
  }
): Promise<void> {
  stopSpeaking();

  const spokenText = text.replace(/\[.*?\]/g, '').replace(/[*_#]/g, '').trim();
  if (!spokenText) {
    options?.onEnd?.();
    return;
  }

  options?.onStart?.();

  const activeEngine = options?.forceEngine || getStoredVoiceEngine();
  const activeKey = options?.apiKey || getStoredElevenLabsKey();
  const activeVoice = options?.voiceId || getStoredElevenLabsVoice();

  // PATH 1: Browser SpeechSynthesis
  // Triggered when user explicitly wants Browser Voice (Free / No Key)
  if (activeEngine === 'browser' && !activeKey) {
    speakWithBrowserSpeechSynthesis(spokenText, options);
    return;
  }

  // PATH 2: Neural Audio Stream (ElevenLabs AI or Cloud Neural MP3)
  // Decoded and played directly through the Web Audio context so it is 100% audible
  try {
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/tts/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: spokenText, 
        voiceId: activeVoice,
        apiKey: activeKey ? activeKey.trim() : undefined,
      }),
      signal: controller.signal,
    });
    clearTimeout(abortTimer);

    if (res.ok) {
      const data = await res.json();
      if (!data.useFallback && data.audioBase64) {
        const audioBuffer = base64ToArrayBuffer(data.audioBase64);
        const ctx = getVoiceAudioContext();

        if (ctx) {
          const played = await playAudioBufferThroughContext(ctx, audioBuffer, {
            rate: options?.rate || 0.95,
            pan: options?.pan,
            onEnd: options?.onEnd,
          });
          if (played) return;
        }

        // Secondary fallback to HTML5 Audio element if context wasn't ready
        try {
          const audio = new Audio(`data:${data.contentType || 'audio/mpeg'};base64,${data.audioBase64}`);
          activeAudioElement = audio;
          audio.volume = 1.0;
          audio.onended = () => {
            activeAudioElement = null;
            options?.onEnd?.();
          };
          audio.onerror = () => {
            activeAudioElement = null;
            options?.onEnd?.();
          };
          await audio.play();
          return;
        } catch {
          // Fall through to SpeechSynthesis
        }
      }
    }
  } catch (err) {
    console.warn('Backend audio synthesis error, falling back to local speech:', err);
  }

  // PATH 3: Local Browser SpeechSynthesis Fallback
  speakWithBrowserSpeechSynthesis(spokenText, options);
}

function speakWithBrowserSpeechSynthesis(
  spokenText: string,
  options?: {
    rate?: number;
    pitch?: number;
    browserVoiceName?: string;
    onEnd?: () => void;
  }
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    playProceduralWhisperTone();
    options?.onEnd?.();
    return;
  }

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    activeUtterance = utterance;

    const userRate = options?.rate ?? getStoredVoiceRate();
    const userPitch = options?.pitch ?? getStoredVoicePitch();
    const userVoiceChoice = options?.browserVoiceName || getStoredBrowserVoice();

    utterance.rate = Math.max(0.6, Math.min(1.4, userRate || 0.95));
    utterance.pitch = Math.max(0.6, Math.min(1.5, userPitch || 1.0));
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (userVoiceChoice && voices.length > 0) {
      selectedVoice = voices.find(v => v.name === userVoiceChoice || v.voiceURI === userVoiceChoice);
    }

    if (!selectedVoice && voices.length > 0) {
      const preferredNames = ['Zira', 'Natural', 'Jenny', 'Google', 'Samantha', 'Karen', 'Moira', 'Aria'];
      selectedVoice = voices.find(v => preferredNames.some(p => v.name.toLowerCase().includes(p.toLowerCase())));
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        activeUtterance = null;
        options?.onEnd?.();
      }
    };

    utterance.onend = finish;
    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      playProceduralWhisperTone();
      finish();
    };

    // Chromium watchdog safety timer: Chromium bug 679437 can drop onend events
    const estimatedDuration = Math.max(2500, (spokenText.length * 85) / (userRate || 0.95));
    setTimeout(finish, estimatedDuration);

    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch {
        playProceduralWhisperTone();
        finish();
      }
    }, 40);
  } catch {
    playProceduralWhisperTone();
    options?.onEnd?.();
  }
}

export function stopSpeaking() {
  if (activeBufferSource) {
    try {
      activeBufferSource.stop();
      activeBufferSource.disconnect();
    } catch {}
    activeBufferSource = null;
  }

  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = '';
    } catch {}
    activeAudioElement = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
  }
  activeUtterance = null;
}
