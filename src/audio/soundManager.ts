/**
 * Procedural Web Audio API Sound Synthesizer
 * Provides atmospheric soundscapes and FX for both Día de los Muertos and Séance modes
 * 100% self-contained with no external audio file downloads required.
 */

import { GatewayMode } from '../types';

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private activeMode: GatewayMode = 'ofrenda';
  private ambientNodes: Array<AudioNode> = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.ambientGain = this.ctx.createGain();

      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
      this.ambientGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      this.ambientGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMode(mode: GatewayMode) {
    this.activeMode = mode;
    if (this.ctx && !this.isMuted) {
      this.startAmbient();
    }
  }

  public toggleMute(): boolean {
    this.initContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime, 0.05);
    }
    if (!this.isMuted) {
      this.startAmbient();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public startAmbient() {
    this.initContext();
    if (!this.ctx || !this.ambientGain || this.isMuted) return;

    this.stopAmbient();

    if (this.activeMode === 'ofrenda') {
      // Warm, harmonic ambient pad (Día de los Muertos: Cempasúchil warmth in D / F# / A)
      const rootFreq = 216; // 432Hz harmonic base
      const notes = [rootFreq, rootFreq * 1.25, rootFreq * 1.5, rootFreq * 2];

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.ambientGain) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), this.ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.04 / (idx + 1), this.ctx.currentTime);

        // Slow subtle LFO for warm candle flicker breathing
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.1 + idx * 0.05, this.ctx.currentTime);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
        lfo.connect(lfoGain.gain);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);

        osc.start();
        lfo.start();
        this.ambientNodes.push(osc, filter, gain, lfo, lfoGain);
      });
    } else {
      // Paranormal dark drone + binaural low hum (Séance mode: 55Hz + ghost sub-carrier)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 bass note
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(56.5, this.ctx.currentTime); // 1.5Hz binaural beating

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc1.start();
      osc2.start();
      this.ambientNodes.push(osc1, osc2, filter, gain);
    }
  }

  public stopAmbient() {
    this.ambientNodes.forEach(node => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        node.disconnect();
      } catch {}
    });
    this.ambientNodes = [];
  }

  // FX: Candle lit on Ofrenda (warm resonant bell / chime)
  public playCandleChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const chimeFreqs = [528, 792, 1056]; // Solfeggio love/miracle frequency
    chimeFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1 / (idx + 1), this.ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8 + idx * 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.5);
    });
  }

  // FX: Spirit Box radio static burst (white noise sweep)
  public playRadioStaticBurst(durationMs = 250) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const bufferSize = this.ctx.sampleRate * (durationMs / 1000);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationMs / 1000);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
  }

  // FX: EMF Meter Geiger spike click
  public playEmfClick() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // FX: Talisman portal coin flip (gateway switch between realms)
  public playGatewayFlip() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }
}

export const soundManager = new SoundManager();
