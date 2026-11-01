/**
 * Memento Viva - Midnight Séance & Nocturnal Procedural Audio Engine
 * 100% Procedural Web Audio API:
 * 1. Planchette Wooden Friction & Drag Scrape (velocity-modulated grain friction & felt slide)
 * 2. Owl (Tecolote) Nocturnal Calls (dual-resonance throat acoustic with Aztec night reverb)
 * 3. Bat (Murciélago) Echolocation Chirps & Wing Flutter Swoops
 */

export class SeanceAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  // Planchette Friction Nodes
  private planchetteNoiseSource: AudioBufferSourceNode | null = null;
  private planchetteBandpass: BiquadFilterNode | null = null;
  private planchetteHighpass: BiquadFilterNode | null = null;
  private planchetteGain: GainNode | null = null;
  private isPlanchetteMoving: boolean = false;
  private targetPlanchetteVolume: number = 0;
  private currentPlanchetteVolume: number = 0;
  private frictionSmootherTimer: number | null = null;

  constructor() {
    // Initialized lazily on user gesture
  }

  public init(): void {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.setupPlanchetteFriction();
  }

  // --- 1. PLANCHETTE WOODEN FRICTION / SCRAPE SYNTHESIZER ---
  private setupPlanchetteFriction(): void {
    if (!this.ctx || !this.masterGain) return;

    // Generate 3 seconds of textured wood grain noise (brownish/pink noise)
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const channel = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise integration for heavy wood body resonance
      lastOut = (lastOut + 0.04 * white) / 1.04;
      channel[i] = lastOut * 3.5;
    }

    this.planchetteNoiseSource = this.ctx.createBufferSource();
    this.planchetteNoiseSource.buffer = buffer;
    this.planchetteNoiseSource.loop = true;

    // Resonant bandpass to emulate wood grain scraping & cavity resonance
    this.planchetteBandpass = this.ctx.createBiquadFilter();
    this.planchetteBandpass.type = 'bandpass';
    this.planchetteBandpass.frequency.setValueAtTime(520, this.ctx.currentTime);
    this.planchetteBandpass.Q.setValueAtTime(3.2, this.ctx.currentTime);

    // Highpass to eliminate unnatural sub-rumble while keeping friction bite
    this.planchetteHighpass = this.ctx.createBiquadFilter();
    this.planchetteHighpass.type = 'highpass';
    this.planchetteHighpass.frequency.setValueAtTime(180, this.ctx.currentTime);

    this.planchetteGain = this.ctx.createGain();
    this.planchetteGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.planchetteNoiseSource.connect(this.planchetteBandpass);
    this.planchetteBandpass.connect(this.planchetteHighpass);
    this.planchetteHighpass.connect(this.planchetteGain);
    this.planchetteGain.connect(this.masterGain);

    this.planchetteNoiseSource.start();
  }

  /**
   * Update wooden drag friction based on real-time cursor/planchette velocity
   * @param velocity Pixel velocity normalized between 0.0 (still) and 1.0 (fast drag)
   */
  public updatePlanchetteDrag(velocity: number): void {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    if (!this.ctx || !this.planchetteGain || !this.planchetteBandpass) return;

    const clampedV = Math.max(0, Math.min(1.2, velocity));
    const now = this.ctx.currentTime;

    if (clampedV > 0.02) {
      // Wood friction frequency rises with speed (from 420Hz deep scrape to 1100Hz sharp rasp)
      const targetFreq = 420 + clampedV * 680;
      this.planchetteBandpass.frequency.linearRampToValueAtTime(targetFreq, now + 0.05);

      // Volume is proportional to speed with a tactile curve
      const targetVol = Math.min(0.45, clampedV * 0.42);
      this.planchetteGain.gain.linearRampToValueAtTime(targetVol, now + 0.04);
      this.isPlanchetteMoving = true;
    } else {
      // Smooth deceleration stop
      this.planchetteGain.gain.linearRampToValueAtTime(0, now + 0.08);
      this.isPlanchetteMoving = false;
    }
  }

  /**
   * Play a solid wooden "thud/tap" when planchette settles or strikes a letter
   */
  public playPlanchetteTap(): void {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Damped pitch-drop wood tap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // --- 2. NOCTURNAL OWL (TECOLOTE) HOOT SYNTHESIZER ---
  /**
   * Synthesize the sacred Aztec owl call (Tecolote / Lechuza)
   * In Mesoamerican lore: "Cuando el tecolote canta, el alma cruza el Mictlán."
   * Rhythmic phrase: "Hoo... hu-hu-hoooo"
   */
  public playOwlHoot(): void {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Syllables: [startTimeOffset, duration, baseFreq, endFreq, peakGain]
    const syllables = [
      { start: 0.00, dur: 0.38, f0: 310, f1: 295, amp: 0.28 },
      { start: 0.55, dur: 0.16, f0: 335, f1: 325, amp: 0.24 },
      { start: 0.78, dur: 0.18, f0: 345, f1: 330, amp: 0.26 },
      { start: 1.05, dur: 0.70, f0: 330, f1: 280, amp: 0.32 }
    ];

    syllables.forEach(({ start, dur, f0, f1, amp }) => {
      const syllableTime = now + start;

      // Primary throat oscillator
      const osc1 = this.ctx!.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(f0, syllableTime);
      osc1.frequency.exponentialRampToValueAtTime(f1, syllableTime + dur);

      // Tremolo / natural vocal cord flutter LFO (6.5 Hz)
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();
      lfo.frequency.setValueAtTime(6.5, syllableTime);
      lfoGain.gain.setValueAtTime(7, syllableTime); // 7Hz pitch vibrato
      lfo.connect(osc1.frequency);

      // Harmonic nasal formant (hollow skull cavity overtone)
      const osc2 = this.ctx!.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(f0 * 1.98, syllableTime);
      osc2.frequency.exponentialRampToValueAtTime(f1 * 1.98, syllableTime + dur);

      const throatFilter = this.ctx!.createBiquadFilter();
      throatFilter.type = 'lowpass';
      throatFilter.frequency.setValueAtTime(680, syllableTime);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.0001, syllableTime);
      // Soft vocal attack
      gain.gain.linearRampToValueAtTime(amp, syllableTime + 0.08);
      // Gentle decay with night-wind fadeout
      gain.gain.exponentialRampToValueAtTime(0.0001, syllableTime + dur);

      osc1.connect(throatFilter);
      osc2.connect(throatFilter);
      throatFilter.connect(gain);
      gain.connect(this.masterGain!);

      osc1.start(syllableTime);
      osc2.start(syllableTime);
      lfo.start(syllableTime);

      osc1.stop(syllableTime + dur + 0.02);
      osc2.stop(syllableTime + dur + 0.02);
      lfo.stop(syllableTime + dur + 0.02);
    });
  }

  // --- 3. BAT (MURCIÉLAGO) ECHOLOCATION & WING FLUTTERS ---
  /**
   * Synthesize a burst of bat echolocation clicks and ultrasonic chirp sweeps
   */
  public playBatEcholocation(): void {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const chirpCount = 5 + Math.floor(Math.random() * 4);

    for (let i = 0; i < chirpCount; i++) {
      const chirpTime = now + (i * 0.035) + (Math.random() * 0.015);
      const chirpDuration = 0.012; // 12ms rapid sweep

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // High frequency down-sweep (from 7200Hz down to 2800Hz)
      osc.frequency.setValueAtTime(7400 + Math.random() * 800, chirpTime);
      osc.frequency.exponentialRampToValueAtTime(2800, chirpTime + chirpDuration);

      gain.gain.setValueAtTime(0.12, chirpTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, chirpTime + chirpDuration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(chirpTime);
      osc.stop(chirpTime + chirpDuration);
    }
  }

  /**
   * Synthesize the leathery wing swoosh & flutter of bats darting overhead
   */
  public playBatWingFlutter(): void {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const flaps = 6;
    const flapInterval = 0.065; // ~15 flaps per second

    for (let f = 0; f < flaps; f++) {
      const flapTime = now + (f * flapInterval);
      const dur = 0.042;

      // Soft leathery burst: low-pass filtered noise
      const sampleCount = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, sampleCount, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let s = 0; s < sampleCount; s++) {
        data[s] = (Math.random() * 2 - 1) * Math.sin((s / sampleCount) * Math.PI);
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(260 + (f % 2) * 80, flapTime);
      filter.Q.setValueAtTime(1.8, flapTime);

      const gain = this.ctx.createGain();
      const amp = 0.22 * Math.sin(((f + 1) / (flaps + 1)) * Math.PI); // crescent volume arc
      gain.gain.setValueAtTime(amp, flapTime);
      gain.gain.exponentialRampToValueAtTime(0.001, flapTime + dur);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      source.start(flapTime);
      source.stop(flapTime + dur);
    }
  }
}

export const seanceAudio = new SeanceAudioEngine();
