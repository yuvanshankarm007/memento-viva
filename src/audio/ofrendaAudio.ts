/**
 * Memento Viva - Living Ofrenda Procedural Audio Engine
 * 100% Procedural Web Audio API synthesis:
 * - Sacred 432Hz Altar Drone (Pythagorean A4 tuning + chorus beating)
 * - Copal Resin Ember Crackles (wood/resin pops, snaps, and bandpass simmer)
 * - Veladora Candle Chimes (528Hz Solfeggio bell harmonics)
 */

export interface OfrendaAudioSettings {
  crackleVolume: number; // 0.0 to 1.0
  droneVolume: number;   // 0.0 to 1.0
  popFrequency: number;  // 1 to 10
}

export class OfrendaAudioEngine {
  private ctx: AudioContext | null = null;
  private isIgnited: boolean = false;

  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private hissGain: GainNode | null = null;

  private droneOscs: OscillatorNode[] = [];
  private droneFilter: BiquadFilterNode | null = null;

  private noiseSource: AudioBufferSourceNode | null = null;
  private crackleTimer: ReturnType<typeof setTimeout> | null = null;

  private settings: OfrendaAudioSettings = {
    crackleVolume: 0.75,
    droneVolume: 0.55,
    popFrequency: 5
  };

  /**
   * Lazy-initialize AudioContext upon user gesture
   */
  public init(): void {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.setupCopalHiss();
    this.setupSacredDrone();
  }

  /**
   * Continuous aromatic copal resin sizzle/hiss (filtered pink noise)
   */
  private setupCopalHiss(): void {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const channelData = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      channelData[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }

    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1600, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.hissGain = this.ctx.createGain();
    this.hissGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.noiseSource.connect(bandpass);
    bandpass.connect(this.hissGain);
    this.hissGain.connect(this.masterGain);
    this.noiseSource.start();
  }

  /**
   * 432 Hz Sacred Altar Drone
   * Tunings: 216Hz (Sub A3), 432Hz (A4), 433.2Hz (Chorus beat), 648Hz (Sacred Fifth E5)
   */
  private setupSacredDrone(): void {
    if (!this.ctx || !this.masterGain) return;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const partials = [
      { freq: 216, gain: 0.18, type: 'sine' as OscillatorType },
      { freq: 432, gain: 0.14, type: 'sine' as OscillatorType },
      { freq: 433.2, gain: 0.12, type: 'sine' as OscillatorType },
      { freq: 648, gain: 0.06, type: 'triangle' as OscillatorType }
    ];

    partials.forEach(p => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = p.type;
      osc.frequency.setValueAtTime(p.freq, this.ctx!.currentTime);
      gain.gain.setValueAtTime(p.gain, this.ctx!.currentTime);

      osc.connect(gain);
      gain.connect(this.droneFilter!);
      osc.start();
      this.droneOscs.push(osc);
    });

    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);
  }

  /**
   * Ignite the Copal coals & soundscape
   */
  public ignite(): void {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx!.currentTime;

    // Smoothly fade in resin hiss
    if (this.hissGain) {
      this.hissGain.gain.cancelScheduledValues(now);
      this.hissGain.gain.linearRampToValueAtTime(0.06 * this.settings.crackleVolume, now + 1.2);
    }

    // Smoothly fade in sacred drone
    if (this.droneGain) {
      this.droneGain.gain.cancelScheduledValues(now);
      this.droneGain.gain.linearRampToValueAtTime(0.38 * this.settings.droneVolume, now + 2.0);
    }

    this.isIgnited = true;
    this.scheduleCrackleCycle();
  }

  /**
   * Extinguish copal coals & pause drone
   */
  public extinguish(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.hissGain) {
      this.hissGain.gain.cancelScheduledValues(now);
      this.hissGain.gain.linearRampToValueAtTime(0, now + 0.6);
    }

    if (this.droneGain) {
      this.droneGain.gain.cancelScheduledValues(now);
      this.droneGain.gain.linearRampToValueAtTime(0, now + 1.0);
    }

    this.isIgnited = false;
    if (this.crackleTimer) {
      clearTimeout(this.crackleTimer);
      this.crackleTimer = null;
    }
  }

  /**
   * Self-scheduling loop for randomized ember crackles and bursts
   */
  private scheduleCrackleCycle(): void {
    if (!this.isIgnited) return;

    const baseMs = 1100 / this.settings.popFrequency;
    const delay = (Math.random() * 0.75 + 0.25) * baseMs;

    this.triggerEmberPop(false);

    // 35% probability of a rapid double pop
    if (Math.random() < 0.35) {
      setTimeout(() => this.triggerEmberPop(true), 40 + Math.random() * 70);
    }

    this.crackleTimer = setTimeout(() => {
      this.scheduleCrackleCycle();
    }, delay);
  }

  /**
   * Synthesize a single authentic wood/resin ember burst or micro snap
   */
  public triggerEmberPop(isMicro: boolean = false): void {
    if (!this.ctx || !this.masterGain || !this.isIgnited) return;
    const now = this.ctx.currentTime;

    const isDeepBurst = !isMicro && Math.random() < 0.25;
    const duration = isMicro ? 0.008 : (isDeepBurst ? 0.045 : 0.018);
    const sampleCount = Math.floor(this.ctx.sampleRate * duration);

    const buffer = this.ctx.createBuffer(1, sampleCount, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleCount * 0.28));
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    if (isDeepBurst) {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 + Math.random() * 280, now);
    } else {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200 + Math.random() * 2600, now);
      filter.Q.setValueAtTime(3.2, now);
    }

    const popGain = this.ctx.createGain();
    const baseAmp = isMicro ? 0.08 : (isDeepBurst ? 0.35 : 0.22);
    const amp = baseAmp * this.settings.crackleVolume;

    popGain.gain.setValueAtTime(amp, now);
    popGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(filter);
    filter.connect(popGain);
    popGain.connect(this.masterGain);

    source.start(now);
    source.stop(now + duration);
  }

  /**
   * Resonant brass Veladora (Candle) Chime
   * Based on 528Hz Solfeggio frequency + bell overtone ratios
   */
  public playVeladoraChime(): void {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const fundamental = 528; // Sacred Solfeggio "Miracle / DNA Repair" tone
    const partials = [
      { f: fundamental, g: 0.28, decay: 3.2 },
      { f: fundamental * 2.756, g: 0.12, decay: 2.1 },
      { f: fundamental * 5.404, g: 0.05, decay: 1.4 },
      { f: fundamental * 8.933, g: 0.02, decay: 0.8 }
    ];

    partials.forEach(p => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.f, now);

      gain.gain.setValueAtTime(p.g, now);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + p.decay);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + p.decay);
    });
  }

  public setCrackleVolume(val: number): void {
    this.settings.crackleVolume = Math.max(0, Math.min(1, val));
    if (this.hissGain && this.isIgnited && this.ctx) {
      this.hissGain.gain.linearRampToValueAtTime(0.06 * this.settings.crackleVolume, this.ctx.currentTime + 0.1);
    }
  }

  public setDroneVolume(val: number): void {
    this.settings.droneVolume = Math.max(0, Math.min(1, val));
    if (this.droneGain && this.isIgnited && this.ctx) {
      this.droneGain.gain.linearRampToValueAtTime(0.38 * this.settings.droneVolume, this.ctx.currentTime + 0.1);
    }
  }

  public setPopFrequency(density: number): void {
    this.settings.popFrequency = Math.max(1, Math.min(10, density));
  }

  public getStatus() {
    return {
      isIgnited: this.isIgnited,
      settings: { ...this.settings }
    };
  }
}

// Global singleton instance for easy import across components
export const ofrendaAudio = new OfrendaAudioEngine();
