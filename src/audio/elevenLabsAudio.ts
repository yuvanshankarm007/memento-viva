/**
 * Memento Viva - Frontend ElevenLabs Audio Synthesizer & Sound Service
 * Connects to ElevenLabs Sound Generation API for cinematic owl, bat, and supernatural effects.
 * Includes local in-memory AudioBuffer caching and seamless procedural Web Audio fallback.
 */

import { seanceAudio } from './seanceAudio';

export type SoundEffectType = 'owl' | 'bat' | 'copal' | 'planchette';

export class ElevenLabsAudioService {
  private audioCtx: AudioContext | null = null;
  private soundCache: Map<string, AudioBuffer> = new Map();
  private isFetching: Map<string, boolean> = new Map();
  private userApiKey: string = '';

  constructor() {
    // Lazy initialized
  }

  private initCtx(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setUserApiKey(key: string): void {
    this.userApiKey = key.trim();
  }

  public getUserApiKey(): string {
    return this.userApiKey;
  }

  /**
   * Fetch and decode sound effect into Web Audio AudioBuffer
   */
  public async loadSoundEffect(type: SoundEffectType): Promise<AudioBuffer | null> {
    if (this.soundCache.has(type)) {
      return this.soundCache.get(type)!;
    }

    if (this.isFetching.get(type)) {
      return null; // Already in flight
    }

    this.isFetching.set(type, true);
    const ctx = this.initCtx();

    try {
      let arrayBuffer: ArrayBuffer;

      // 1. If user supplied a client-side ElevenLabs key, call direct
      if (this.userApiKey) {
        const prompts: Record<SoundEffectType, { text: string; duration: number }> = {
          owl: {
            text: 'Haunted Mexican barn owl hooting deep in a foggy ancient forest, eerie hollow vocal resonance and night wind echo',
            duration: 3.5
          },
          bat: {
            text: 'Swarm of cave bats fluttering leathery wings with sharp high-frequency echolocation chirps inside a damp stone crypt',
            duration: 3.0
          },
          copal: {
            text: 'Sacred copal tree resin crackling and spitting on red-hot aromatic charcoal embers with gentle ritual whispers',
            duration: 4.0
          },
          planchette: {
            text: 'Old wooden planchette slowly scraping and dragging across a varnished antique walnut Ouija board with hollow wooden friction',
            duration: 2.5
          }
        };

        const config = prompts[type];
        const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
          method: 'POST',
          headers: {
            'xi-api-key': this.userApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: config.text,
            duration_seconds: config.duration,
            prompt_influence: 0.35
          })
        });

        if (!res.ok) {
          throw new Error(`Direct ElevenLabs error ${res.status}`);
        }
        arrayBuffer = await res.arrayBuffer();
      } else {
        // 2. Otherwise request from backend server proxy
        const res = await fetch('/api/audio/sound-effect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type })
        });

        if (!res.ok) {
          throw new Error(`Server sound-effect endpoint returned ${res.status}`);
        }
        arrayBuffer = await res.arrayBuffer();
      }

      // Decode MP3 into AudioBuffer
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.soundCache.set(type, decodedBuffer);
      this.isFetching.set(type, false);
      return decodedBuffer;
    } catch (err) {
      console.warn(`ElevenLabs fetch failed for [${type}]:`, err, '-> Switching to procedural synthesis fallback.');
      this.isFetching.set(type, false);
      return null;
    }
  }

  /**
   * Play Owl Hoot (ElevenLabs AI audio with instant procedural Web Audio fallback)
   */
  public async playOwlHoot(): Promise<'elevenlabs' | 'procedural'> {
    const ctx = this.initCtx();
    const buffer = await this.loadSoundEffect('owl');

    if (buffer) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
      return 'elevenlabs';
    }

    // Fallback to procedural Aztec owl synthesis
    seanceAudio.playOwlHoot();
    return 'procedural';
  }

  /**
   * Play Bat Swarm (ElevenLabs AI audio with instant procedural Web Audio fallback)
   */
  public async playBatSwarm(): Promise<'elevenlabs' | 'procedural'> {
    const ctx = this.initCtx();
    const buffer = await this.loadSoundEffect('bat');

    if (buffer) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
      return 'elevenlabs';
    }

    // Fallback to procedural bat chirps + wing flutter
    seanceAudio.playBatWingFlutter();
    setTimeout(() => seanceAudio.playBatEcholocation(), 120);
    return 'procedural';
  }
}

export const elevenLabsAudio = new ElevenLabsAudioService();
