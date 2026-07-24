export class SoundEngine {
  private static ctx: AudioContext | null = null;
  private static humGain: GainNode | null = null;
  private static humOsc1: OscillatorNode | null = null;
  private static humOsc2: OscillatorNode | null = null;
  private static masterGain: GainNode | null = null;
  private static heartbeatInterval: number | null = null;
  private static isInitialized = false;

  public static init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext failed to initialize', e);
    }
  }

  public static resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Continuous 60Hz Fluorescent Hum Generator with random flickering crackles
   */
  public static startFluorescentHum(volume = 0.2) {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    if (this.humGain) this.stopFluorescentHum();

    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(volume, this.ctx.currentTime);

    // 60Hz fundamental hum
    this.humOsc1 = this.ctx.createOscillator();
    this.humOsc1.type = 'sawtooth';
    this.humOsc1.frequency.setValueAtTime(60, this.ctx.currentTime);

    // 120Hz harmonic
    this.humOsc2 = this.ctx.createOscillator();
    this.humOsc2.type = 'sine';
    this.humOsc2.frequency.setValueAtTime(120, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    this.humOsc1.connect(filter);
    this.humOsc2.connect(filter);
    filter.connect(this.humGain);
    this.humGain.connect(this.masterGain);

    this.humOsc1.start();
    this.humOsc2.start();

    // Random electrical flicker sound effect
    const scheduleFlicker = () => {
      if (!this.humGain || !this.ctx) return;
      const timeout = 1500 + Math.random() * 5000;
      setTimeout(() => {
        if (this.humGain && this.ctx) {
          const now = this.ctx.currentTime;
          this.humGain.gain.setValueAtTime(volume * 0.1, now);
          this.humGain.gain.setValueAtTime(volume * 1.5, now + 0.05);
          this.humGain.gain.setValueAtTime(volume, now + 0.1);
          this.playFlickerSnap();
        }
        scheduleFlicker();
      }, timeout);
    };
    scheduleFlicker();
  }

  public static stopFluorescentHum() {
    if (this.humOsc1) {
      try { this.humOsc1.stop(); } catch {}
      this.humOsc1 = null;
    }
    if (this.humOsc2) {
      try { this.humOsc2.stop(); } catch {}
      this.humOsc2 = null;
    }
    if (this.humGain) {
      this.humGain.disconnect();
      this.humGain = null;
    }
  }

  public static playFlickerSnap() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  /**
   * Footstep sound effect based on material type
   */
  public static playFootstep(material: 'carpet' | 'concrete' | 'water' | 'metal') {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (material === 'carpet') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250 + Math.random() * 100, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    } else if (material === 'water') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200 + Math.random() * 400, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    } else if (material === 'metal') {
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    } else {
      // Concrete
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    }

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
  }

  /**
   * Heartbeat pulsation when low health or low sanity
   */
  public static startHeartbeat(bpm = 110) {
    if (this.heartbeatInterval) return;
    const intervalMs = (60 / bpm) * 1000;
    this.heartbeatInterval = window.setInterval(() => {
      this.playHeartbeatThump();
    }, intervalMs);
  }

  public static stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private static playHeartbeatThump() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  /**
   * Motion Tracker Radar Beep (Higher pitch = closer entity)
   */
  public static playRadarBeep(distanceMeters: number) {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = Math.min(2200, Math.max(600, 2000 - distanceMeters * 60));
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  /**
   * Terrifying Entity Screech when spotted or attacked
   */
  public static playEntityScreech() {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    const now = this.ctx.currentTime;
    osc1.frequency.setValueAtTime(200, now);
    osc1.frequency.linearRampToValueAtTime(1400, now + 0.2);
    osc1.frequency.exponentialRampToValueAtTime(100, now + 0.8);

    osc2.frequency.setValueAtTime(250, now);
    osc2.frequency.linearRampToValueAtTime(1550, now + 0.2);
    osc2.frequency.exponentialRampToValueAtTime(120, now + 0.8);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    osc1.stop(now + 0.85);
    osc2.stop(now + 0.85);
  }

  /**
   * Item Pickup / Drink Almond Water Sound
   */
  public static playItemPickup() {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1040, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  /**
   * Flashlight Click
   */
  public static playFlashlightClick() {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  /**
   * Level Noclip / Warp dimensional WHOOSH
   */
  public static playWarpSound() {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const now = this.ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 1.2);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(now + 1.2);
  }

  public static setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }
}
