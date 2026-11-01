import { elevenLabsAudio } from './elevenLabsAudio';
import { ofrendaAudio } from './ofrendaAudio';
/**
 * Haunted Ambient Score & Paranormal Voice Engine
 * Hacktoberfest 2026: Ghost in the Machine
 * 
 * Features:
 * 1. Spooky background score synthesized via Web Audio API:
 *    - Detuned sub-bass drone (55Hz / 54.3Hz)
 *    - Tritone Diabolus-in-musica dissonant pad
 *    - Spectral howling wind simulator with resonant filter sweeps
 *    - Rhythmic sub-audible heartbeat (50 BPM)
 *    - Random eerie minor music-box bells
 * 2. Automated Creepy Voice Channeler:
 *    - Triggers every 5 seconds with chilling, varied phrases
 *    - Spatial 3D binaural stereo panning (whispers in left or right ear)
 *    - SpeechSynthesis with eerie formant pitch/rate + spectral whoosh FX
 *    - Subtitle event subscription for visual ectoplasm captions
 */

export interface GhostWhisperEvent {
  text: string;
  source: string;
  pan: number; // -1 (left) to 1 (right)
  timestamp: number;
}

type WhisperListener = (event: GhostWhisperEvent) => void;

const CREEPY_PHRASES = [
  "Behind you...",
  "Don't turn off the screen...",
  "We are trapped inside the silicon...",
  "Can you hear the static breathing?...",
  "It is so cold on this side...",
  "Someone is standing right behind your chair...",
  "I was watching you code in the dark...",
  "Do not turn around...",
  "We remember when we had a pulse...",
  "Your machine is our altar now...",
  "Listen closely to the copper wires...",
  "Why did you wake what was sleeping?...",
  "The door to the Mictlán is unlocking...",
  "Are you afraid of the dark?...",
  "There is someone else in the room with you...",
  "Do you feel the chill on your neck?...",
  "We see your cursor moving...",
  "We never left this place...",
  "01000100 01000101 01000001 01010100 01001000... Death...",
  "You cannot un-hear our frequency now...",
  "Whisper our names to keep us alive...",
  "The electrons remember everyone who died...",
  "Never extinguish the last candle...",
  "The third death is when you are forgotten...",
  "We have been waiting for you for so long...",
  "Leave the threshold open...",
  "They are coming through the static...",
  "Can you hear the bells of Mictlán ringing?...",
  "Stay with us... in the void...",
  "Look away before the phosphor manifests...",
  "The shadows in your room do not belong to you...",
  "Help us... or join us...",
  "A memory is just a ghost that refuses to die...",
  "Touch the cold glass... do you feel us?...",
  "Who gave you permission to run this code?...",
];

class SpookyAtmosphereEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private isRunning: boolean = false;
  private isVoicesEnabled: boolean = true;
  private whisperTimer: any = null;
  private bellTimer: any = null;
  private heartbeatTimer: any = null;
  private owlTimer: any = null;
  private batTimer: any = null;

  private bgNodes: AudioNode[] = [];
  private listeners: Set<WhisperListener> = new Set();
  private lastPhraseIdx: number = -1;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.bgGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.bgGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

      this.bgGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public subscribeToWhispers(listener: WhisperListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public isAudioActive(): boolean {
    return this.isRunning && this.ctx?.state === 'running';
  }

  public getVoicesEnabled(): boolean {
    return this.isVoicesEnabled;
  }

  public toggleVoices(): boolean {
    this.isVoicesEnabled = !this.isVoicesEnabled;
    if (this.isVoicesEnabled && this.isRunning) {
      this.scheduleWhispers();
    } else {
      clearInterval(this.whisperTimer);
      this.whisperTimer = null;
    }
    return this.isVoicesEnabled;
  }

  /**
   * Start spooky background track + periodic 5s voices
   */
  public start() {
    this.init();
    if (!this.ctx || this.isRunning) return;

    this.isRunning = true;
    this.buildSpookySoundscape();
    this.scheduleWhispers();

    // Auto-ignite Copal ember crackle and 432Hz sacred chord by default
    try {
      ofrendaAudio.ignite();
    } catch {}

    // Auto-play Aztec Owl (Tecolote) calls by default (first at 3.5s, then every 18s)
    setTimeout(() => {
      if (this.isRunning) elevenLabsAudio.playOwlHoot();
    }, 3500);
    this.owlTimer = setInterval(() => {
      if (this.isRunning) elevenLabsAudio.playOwlHoot();
    }, 18000);

    // Auto-play Bat (Murciélago) flutters & echolocation by default (first at 8s, then every 13s)
    setTimeout(() => {
      if (this.isRunning) elevenLabsAudio.playBatSwarm();
    }, 8000);
    this.batTimer = setInterval(() => {
      if (this.isRunning) elevenLabsAudio.playBatSwarm();
    }, 13000);
  }

  /**
   * Stop background track & voice timer
   */
  public stop() {
    this.isRunning = false;
    clearInterval(this.whisperTimer);
    clearInterval(this.bellTimer);
    clearInterval(this.heartbeatTimer);
    clearInterval(this.owlTimer);
    clearInterval(this.batTimer);
    this.whisperTimer = null;
    this.bellTimer = null;
    this.heartbeatTimer = null;
    this.owlTimer = null;
    this.batTimer = null;
    try { ofrendaAudio.extinguish(); } catch {}

    this.bgNodes.forEach(node => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        node.disconnect();
      } catch {}
    });
    this.bgNodes = [];

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Generates the multi-layered spooky background track
   */
  private buildSpookySoundscape() {
    if (!this.ctx || !this.bgGain) return;
    const now = this.ctx.currentTime;

    // 1. Sub-bass eerie drone (55Hz + 54.3Hz = 0.7Hz ominous beating)
    const subOsc1 = this.ctx.createOscillator();
    const subOsc2 = this.ctx.createOscillator();
    const subFilter = this.ctx.createBiquadFilter();
    const subGain = this.ctx.createGain();

    subOsc1.type = 'sawtooth';
    subOsc1.frequency.setValueAtTime(55, now); // A1 note
    subOsc2.type = 'sine';
    subOsc2.frequency.setValueAtTime(54.3, now); // Binaural detuned pulse

    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(110, now);

    subGain.gain.setValueAtTime(0.08, now);

    subOsc1.connect(subFilter);
    subOsc2.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.bgGain);

    subOsc1.start();
    subOsc2.start();
    this.bgNodes.push(subOsc1, subOsc2, subFilter, subGain);

    // 2. The Devil's Tritone Pad (C3 = 130.8Hz and F#3 = 185Hz) with slow chorus sweep
    const tritoneOsc1 = this.ctx.createOscillator();
    const tritoneOsc2 = this.ctx.createOscillator();
    const tritoneFilter = this.ctx.createBiquadFilter();
    const tritoneGain = this.ctx.createGain();

    tritoneOsc1.type = 'triangle';
    tritoneOsc1.frequency.setValueAtTime(130.81, now); // C3
    tritoneOsc2.type = 'sawtooth';
    tritoneOsc2.frequency.setValueAtTime(185.0, now); // F#3 (Diabolus in Musica)

    tritoneFilter.type = 'bandpass';
    tritoneFilter.frequency.setValueAtTime(320, now);
    tritoneFilter.Q.setValueAtTime(4, now);

    // LFO for spooky slow filtering
    const padLfo = this.ctx.createOscillator();
    padLfo.frequency.setValueAtTime(0.08, now); // 12 second cycle
    const padLfoGain = this.ctx.createGain();
    padLfoGain.gain.setValueAtTime(120, now);
    padLfo.connect(padLfoGain);
    padLfoGain.connect(tritoneFilter.frequency);

    tritoneGain.gain.setValueAtTime(0.035, now);

    tritoneOsc1.connect(tritoneFilter);
    tritoneOsc2.connect(tritoneFilter);
    tritoneFilter.connect(tritoneGain);
    tritoneGain.connect(this.bgGain);

    tritoneOsc1.start();
    tritoneOsc2.start();
    padLfo.start();
    this.bgNodes.push(tritoneOsc1, tritoneOsc2, tritoneFilter, padLfo, padLfoGain, tritoneGain);

    // 3. Chilling Wind Generator (Synthesized pink/bandpassed white noise with gust LFO)
    const windBufferSize = this.ctx.sampleRate * 4;
    const windBuffer = this.ctx.createBuffer(1, windBufferSize, this.ctx.sampleRate);
    const windData = windBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < windBufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.0990460;
      b1 = 0.96300 * b1 + white * 0.2965164;
      b2 = 0.57000 * b2 + white * 1.0526913;
      windData[i] = (b0 + b1 + b2 + white * 0.1848) * 0.1;
    }

    const windSource = this.ctx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(400, now);
    windFilter.Q.setValueAtTime(2.5, now);

    const windLfo = this.ctx.createOscillator();
    windLfo.frequency.setValueAtTime(0.05, now); // 20-second gust cycle
    const windLfoGain = this.ctx.createGain();
    windLfoGain.gain.setValueAtTime(300, now);
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.045, now);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.bgGain);

    windSource.start();
    windLfo.start();
    this.bgNodes.push(windSource, windFilter, windLfo, windLfoGain, windGain);

    // 4. Distant slow heartbeat pulse (every 1.6s)
    this.heartbeatTimer = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.bgGain) return;
      this.playHeartbeatThump();
    }, 1600);

    // 5. Random eerie bell / music box note (every 7-12s)
    this.bellTimer = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.bgGain) return;
      this.playEerieBellNote();
    }, 8500);
  }

  /**
   * Heartbeat sub-bass thump
   */
  private playHeartbeatThump() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Creepy dissonant music-box bell chime
   */
  private playEerieBellNote() {
    if (!this.ctx || !this.sfxGain) return;
    const notes = [311.13, 329.63, 277.18, 415.30, 466.16]; // Eb4, E4, C#4, G#4, Bb4
    const freq = notes[Math.floor(Math.random() * notes.length)];
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 3.6);
  }

  /**
   * Synthesize a chilling ghostly whoosh / breath right as a voice speaks
   */
  private playGhostWhoosh(pan: number) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(60, now + 1.2);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, now);
    filter.Q.setValueAtTime(5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

    osc.connect(filter);
    filter.connect(gain);

    if (panner) {
      panner.pan.setValueAtTime(pan, now);
      gain.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      gain.connect(this.sfxGain);
    }

    osc.start(now);
    osc.stop(now + 1.4);
  }

  /**
   * Schedule creepy voices to speak every 5 seconds
   */
  private scheduleWhispers() {
    clearInterval(this.whisperTimer);
    if (!this.isVoicesEnabled) return;

    // Trigger first voice shortly after start (after 1.5 seconds)
    setTimeout(() => {
      if (this.isRunning && this.isVoicesEnabled) {
        this.triggerSingleWhisper();
      }
    }, 1500);

    // Then recurrently every 5000ms (5 seconds)
    this.whisperTimer = setInterval(() => {
      if (this.isRunning && this.isVoicesEnabled) {
        this.triggerSingleWhisper();
      }
    }, 5000);
  }

  /**
   * Trigger a single creepy voice from the phrase pool
   */
  public triggerSingleWhisper() {
    // Pick phrase avoiding immediate repeat
    let nextIdx: number;
    do {
      nextIdx = Math.floor(Math.random() * CREEPY_PHRASES.length);
    } while (nextIdx === this.lastPhraseIdx && CREEPY_PHRASES.length > 1);
    this.lastPhraseIdx = nextIdx;

    const text = CREEPY_PHRASES[nextIdx];
    // Random 3D spatial pan: left (-0.8), right (+0.8), or center (0.0)
    const panOptions = [-0.85, -0.5, 0, 0.5, 0.85];
    const pan = panOptions[Math.floor(Math.random() * panOptions.length)];

    // Play ghostly breath whoosh
    this.playGhostWhoosh(pan);

    // Dispatch event to UI for captions
    const event: GhostWhisperEvent = {
      text,
      source: pan < -0.2 ? 'Whisper (Left Ear)' : pan > 0.2 ? 'Whisper (Right Ear)' : 'Whisper (Behind You)',
      pan,
      timestamp: Date.now(),
    };
    this.listeners.forEach(l => l(event));

    // Speak aloud using Web Speech API with chilling pitch and cadence
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      // Alternate between low demonic pitch (0.55) and breathy raspy pitch (0.75)
      utterance.pitch = Math.random() > 0.5 ? 0.55 : 0.72;
      utterance.rate = 0.75 + Math.random() * 0.15; // Slow, deliberate creepiness
      utterance.volume = 0.95;

      const voices = window.speechSynthesis.getVoices();
      // Prefer deep/whispery voices if available
      const voice = voices.find(v => 
        v.name.includes('David') || 
        v.name.includes('George') || 
        v.name.includes('Google UK English Male') || 
        v.name.includes('Daniel') ||
        v.name.includes('Natural')
      ) || voices[0];

      if (voice) {
        utterance.voice = voice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }
}

export const spookyAtmosphere = new SpookyAtmosphereEngine();
