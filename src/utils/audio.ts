/**
 * Audio Engine for ZOMBIE SIEGE: DEADLINE
 * Synthesizes Dark Sci-Fi Home Ambience, Tactical Combat Music,
 * Weapon fire, Ricochet pings, TNT explosions, Reload clicks, and
 * clearly audible, rate-limited Zombie vocalizations (Idle Groan,
 * Detection Snarl, Attack Roar/Spit, Hit Crunch, and Death Growl).
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sfxGain: GainNode | null = null;
  private bgOsc: OscillatorNode | null = null;
  private bgSubOsc: OscillatorNode | null = null;
  private bgLfo: OscillatorNode | null = null;
  private bgGain: GainNode | null = null;
  private currentMusicType: 'home' | 'game' | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private homeVolume: number = 0.7;
  private gameVolume: number = 0.6;
  private sfxVolume: number = 0.8;

  // Cooldown timestamps & simultaneous zombie voice counter so groans never stack into noise
  private lastPlayed: Record<string, number> = {};
  private activeZombieVoices: number = 0;
  private readonly MAX_CONCURRENT_ZOMBIE_VOICES = 2;
  private emoteTimerIds: number[] = [];

  private canPlay(key: string, minIntervalMs: number, isZombieVoice: boolean = false): boolean {
    if (this.isMuted) return false;
    if (isZombieVoice && this.activeZombieVoices >= this.MAX_CONCURRENT_ZOMBIE_VOICES) {
      return false;
    }
    const now = performance.now();
    const prev = this.lastPlayed[key] || 0;
    if (now - prev < minIntervalMs) return false;
    this.lastPlayed[key] = now;
    return true;
  }

  private trackZombieVoice(durationSec: number) {
    this.activeZombieVoices++;
    setTimeout(() => {
      this.activeZombieVoices = Math.max(0, this.activeZombieVoices - 1);
    }, Math.ceil(durationSec * 1000));
  }

  public init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.isMuted ? 0 : 0.68 * this.sfxVolume;
      this.sfxGain.connect(this.ctx.destination);
      this.createNoiseBuffer();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private createNoiseBuffer() {
    if (!this.ctx || this.noiseBuffer) return;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 1.0; // 1 second of white/pink noise
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.04 * white) / 1.04;
      lastOut = data[i];
      data[i] *= 2.2;
    }
    this.noiseBuffer = buffer;
  }

  public setHomeVolume(vol: number) {
    this.homeVolume = Math.max(0, Math.min(1, vol));
    if (this.currentMusicType === 'home' && this.bgGain && !this.isMuted && this.ctx) {
      this.bgGain.gain.setTargetAtTime(0.055 * this.homeVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setGameVolume(vol: number) {
    this.gameVolume = Math.max(0, Math.min(1, vol));
    if (this.currentMusicType === 'game' && this.bgGain && !this.isMuted && this.ctx) {
      this.bgGain.gain.setTargetAtTime(0.065 * this.gameVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && !this.isMuted && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(0.68 * this.sfxVolume, this.ctx.currentTime, 0.03);
    }
  }

  public getVolumes() {
    return {
      home: this.homeVolume,
      game: this.gameVolume,
      sfx: this.sfxVolume
    };
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : 0.68 * this.sfxVolume, this.ctx.currentTime);
    }
    if (muted) {
      this.stopEmoteMusic();
      if (this.bgGain && this.ctx) {
        this.bgGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      this.stopMusicNodes();
    } else {
      if (this.currentMusicType === 'home') {
        this.playHomeMusic();
      } else if (this.currentMusicType === 'game') {
        this.playGameMusic();
      }
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private stopMusicNodes() {
    try {
      if (this.bgOsc) {
        this.bgOsc.stop();
        this.bgOsc.disconnect();
        this.bgOsc = null;
      }
      if (this.bgSubOsc) {
        this.bgSubOsc.stop();
        this.bgSubOsc.disconnect();
        this.bgSubOsc = null;
      }
      if (this.bgLfo) {
        this.bgLfo.stop();
        this.bgLfo.disconnect();
        this.bgLfo = null;
      }
      if (this.bgGain) {
        this.bgGain.disconnect();
        this.bgGain = null;
      }
    } catch {
      // ignore
    }
  }

  public stopMusic() {
    this.stopMusicNodes();
  }

  // Home screen dark sci-fi atmospheric pad
  public playHomeMusic() {
    this.init();
    this.stopMusicNodes();
    this.currentMusicType = 'home';
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.bgOsc = this.ctx.createOscillator();
      this.bgSubOsc = this.ctx.createOscillator();
      this.bgLfo = this.ctx.createOscillator();
      this.bgGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const lfoGain = this.ctx.createGain();

      this.bgOsc.type = 'sawtooth';
      this.bgOsc.frequency.setValueAtTime(110, now); // A2 atmospheric drone

      this.bgSubOsc.type = 'triangle';
      this.bgSubOsc.frequency.setValueAtTime(164.81, now); // E3 fifth harmony

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, now);

      this.bgLfo.type = 'sine';
      this.bgLfo.frequency.setValueAtTime(0.18, now);
      lfoGain.gain.setValueAtTime(90, now);

      this.bgLfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.4, now);

      this.bgGain.gain.setValueAtTime(0.055 * this.homeVolume, now);

      this.bgOsc.connect(filter);
      this.bgSubOsc.connect(subGain);
      subGain.connect(filter);
      filter.connect(this.bgGain);
      this.bgGain.connect(this.ctx.destination);

      this.bgOsc.start(now);
      this.bgSubOsc.start(now);
      this.bgLfo.start(now);
    } catch {
      // ignore
    }
  }

  // Gameplay eerie survival tension ambience + low pulse (kept subtle so SFX cut through)
  public playGameMusic() {
    this.init();
    this.stopMusicNodes();
    this.currentMusicType = 'game';
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.bgOsc = this.ctx.createOscillator();
      this.bgSubOsc = this.ctx.createOscillator();
      this.bgLfo = this.ctx.createOscillator();
      this.bgGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const lfoGain = this.ctx.createGain();

      this.bgOsc.type = 'sawtooth';
      this.bgOsc.frequency.setValueAtTime(73.42, now); // Deep D2 bass tension

      this.bgSubOsc.type = 'triangle';
      this.bgSubOsc.frequency.setValueAtTime(110, now); // A2 tension fifth

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);

      this.bgLfo.type = 'sine';
      this.bgLfo.frequency.setValueAtTime(0.45, now); // Subtle heartbeat pulse
      lfoGain.gain.setValueAtTime(75, now);

      this.bgLfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.35, now);

      this.bgGain.gain.setValueAtTime(0.065 * this.gameVolume, now);

      this.bgOsc.connect(filter);
      this.bgSubOsc.connect(subGain);
      subGain.connect(filter);
      filter.connect(this.bgGain);
      this.bgGain.connect(this.ctx.destination);

      this.bgOsc.start(now);
      this.bgSubOsc.start(now);
      this.bgLfo.start(now);
    } catch {
      // ignore
    }
  }

  public playLaserShot() {
    if (!this.canPlay('laserShot', 60)) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.18);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.linearRampToValueAtTime(0.005, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  public playShot() {
    if (!this.canPlay('shot', 60)) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.005, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.21);
  }

  public playReload() {
    if (!this.canPlay('reload', 250)) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    [0, 0.14].forEach((offset, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(i === 0 ? 520 : 780, now + offset);
      osc.frequency.exponentialRampToValueAtTime(240, now + offset + 0.05);
      gain.gain.setValueAtTime(0.18, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.05);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.055);
    });
  }

  /**
   * 1. ZOMBIE IDLE GROAN:
   * Audible dual-formant guttural undead moan (150-450Hz) with vocal resonance
   * so it is clearly heard on mobile & desktop speakers without becoming noisy.
   */
  public playZombieGroan() {
    if (!this.canPlay('zombieGroan', 2600, true)) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const duration = 0.65;
    this.trackZombieVoice(duration);

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    const basePitch = 155 + Math.random() * 35; // 155-190Hz audible chest/throat register
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(basePitch, now);
    osc1.frequency.linearRampToValueAtTime(basePitch * 1.12, now + 0.2);
    osc1.frequency.linearRampToValueAtTime(basePitch * 0.78, now + duration);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(basePitch * 2.02, now); // 2nd harmonic vocal formant
    osc2.frequency.linearRampToValueAtTime(basePitch * 1.65, now + duration);

    // Vocal rasp vibrato
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(18, now);
    lfoGain.gain.setValueAtTime(9, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.linearRampToValueAtTime(290, now + duration);
    filter.Q.setValueAtTime(1.8, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.42, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    lfo.start(now);
    osc1.stop(now + duration + 0.02);
    osc2.stop(now + duration + 0.02);
    lfo.stop(now + duration + 0.02);
  }

  /**
   * 2. ZOMBIE DETECTION SNARL:
   * Triggered when a zombie spots the player on the same floor or wave spawns.
   */
  public playZombieDetect() {
    if (!this.canPlay('zombieDetect', 1500, true)) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const duration = 0.42;
    this.trackZombieVoice(duration);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(165, now + duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(620, now);
    filter.Q.setValueAtTime(1.5, now);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.38, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + duration + 0.02);

    // Add breath hiss burst if noiseBuffer exists
    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const nFilter = this.ctx.createBiquadFilter();
      nFilter.type = 'bandpass';
      nFilter.frequency.setValueAtTime(950, now);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.18, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      noise.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(this.sfxGain);
      noise.start(now);
      noise.stop(now + 0.3);
    }
  }

  /**
   * 3. ZOMBIE STEP:
   * Audible low shambling thud
   */
  public playZombieStep() {
    if (!this.canPlay('zombieStep', 900)) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(115, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.008, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.095);
  }

  /**
   * 4. ZOMBIE ATTACK / SPIT ROAR:
   * Aggressive undead snarl + spit launch cue
   */
  public playZombieAttack() {
    if (!this.canPlay('zombieAttack', 500, true)) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const duration = 0.34;
    this.trackZombieVoice(duration);

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(240, now);
    osc1.frequency.exponentialRampToValueAtTime(520, now + 0.09);
    osc1.frequency.exponentialRampToValueAtTime(135, now + duration);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(125, now);
    osc2.frequency.exponentialRampToValueAtTime(260, now + 0.09);
    osc2.frequency.exponentialRampToValueAtTime(85, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1150, now);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.02);
    osc2.stop(now + duration + 0.02);
  }

  /**
   * 5. ZOMBIE HURT / HIT CRUNCH:
   * Visceral impact + undead pain grunt
   */
  public playZombieHit(headshot: boolean = false) {
    if (!this.canPlay('zombieHit', 50)) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscGrunt = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(headshot ? 580 : 320, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.16);

    oscGrunt.type = 'sawtooth';
    oscGrunt.frequency.setValueAtTime(headshot ? 290 : 210, now);
    oscGrunt.frequency.exponentialRampToValueAtTime(110, now + 0.16);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    oscGrunt.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    oscGrunt.start(now);
    osc.stop(now + 0.17);
    oscGrunt.stop(now + 0.17);
  }

  /**
   * 6. ZOMBIE DEATH GROWL:
   * Distinct descending guttural death rattle & collapse thud
   */
  public playZombieDeath(isBoss: boolean = false) {
    if (!this.canPlay('zombieDeath', 140, true)) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const duration = isBoss ? 0.65 : 0.42;
    this.trackZombieVoice(duration);

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(isBoss ? 220 : 265, now);
    osc1.frequency.exponentialRampToValueAtTime(isBoss ? 52 : 68, now + duration);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(isBoss ? 330 : 390, now);
    osc2.frequency.exponentialRampToValueAtTime(isBoss ? 75 : 95, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(780, now);
    filter.frequency.exponentialRampToValueAtTime(220, now + duration);

    gain.gain.setValueAtTime(0.46, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.02);
    osc2.stop(now + duration + 0.02);
  }

  /**
   * 7. PLAYER HURT / ARMOR HIT:
   * Clear warning cue when player takes damage from zombie attack or blast
   */
  public playPlayerHurt() {
    if (!this.canPlay('playerHurt', 200)) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.42, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playExplosion() {
    if (!this.canPlay('explosion', 85)) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.48);

    gain.gain.setValueAtTime(0.52, now);
    gain.gain.linearRampToValueAtTime(0.005, now + 0.48);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.5);

    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.45);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.42, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.sfxGain);
      noise.start(now);
      noise.stop(now + 0.46);
    }
  }

  public playBounce(bounceCount: number = 0) {
    if (!this.canPlay('bounce', 35)) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = 520 + Math.min(bounceCount * 90, 850);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.45, now + 0.08);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  public playGlassBreak() {
    if (!this.canPlay('glassBreak', 75)) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1850, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.16);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playLevelClear() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, start);

      gain.gain.setValueAtTime(0.32, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.26);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(start);
      osc.stop(start + 0.27);
    });
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [310, 270, 225, 175];
    notes.forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.14;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, start);

      gain.gain.setValueAtTime(0.32, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.24);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(start);
      osc.stop(start + 0.25);
    });
  }

  public stopEmoteMusic() {
    if (this.emoteTimerIds.length > 0) {
      this.emoteTimerIds.forEach(id => window.clearTimeout(id));
      this.emoteTimerIds = [];
    }
  }

  /**
   * Synthesizes an original, license-free procedural sci-fi celebration rhythm & synth motif
   * tailored to each of the 8 Emotes. Respects Sound ON/OFF and volume sliders.
   */
  public playEmoteBeat(emoteId: string, durationMs: number = 4200) {
    this.stopEmoteMusic();
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const patternMap: Record<string, { bpm: number; scale: number[]; wave: OscillatorType }> = {
      victory_groove: { bpm: 118, scale: [261.63, 329.63, 392.0, 523.25], wave: 'triangle' },
      survivor_shuffle: { bpm: 126, scale: [293.66, 349.23, 440.0, 587.33], wave: 'sawtooth' },
      battle_bounce: { bpm: 122, scale: [220.0, 277.18, 329.63, 440.0], wave: 'square' },
      neon_footwork: { bpm: 130, scale: [329.63, 392.0, 493.88, 659.25], wave: 'triangle' },
      robot_pulse: { bpm: 112, scale: [196.0, 293.66, 392.0, 587.33], wave: 'square' },
      midnight_step: { bpm: 116, scale: [246.94, 293.66, 369.99, 493.88], wave: 'sine' },
      champion_spin: { bpm: 128, scale: [261.63, 329.63, 392.0, 523.25, 659.25], wave: 'triangle' },
      siege_celebration: { bpm: 132, scale: [220.0, 277.18, 329.63, 440.0, 554.37, 659.25], wave: 'sawtooth' }
    };

    const cfg = patternMap[emoteId] || patternMap.victory_groove;
    const stepMs = Math.round((60000 / cfg.bpm) / 2); // 8th-note grid
    const totalSteps = Math.max(6, Math.floor((durationMs - 350) / stepMs));

    for (let step = 0; step < totalSteps; step++) {
      const tid = window.setTimeout(() => {
        if (this.isMuted || !this.ctx || !this.sfxGain) return;
        const now = this.ctx.currentTime;
        const volScale = Math.max(0.15, (this.homeVolume * 0.6 + this.sfxVolume * 0.4));

        // Kick pulse on even beats
        if (step % 2 === 0) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(125, now);
          kickOsc.frequency.exponentialRampToValueAtTime(42, now + 0.11);
          kickGain.gain.setValueAtTime(0.22 * volScale, now);
          kickGain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);
          kickOsc.connect(kickGain);
          kickGain.connect(this.sfxGain);
          kickOsc.start(now);
          kickOsc.stop(now + 0.13);
        }

        // Synth lead note
        const noteFreq = cfg.scale[(step + (step % 3)) % cfg.scale.length];
        const leadOsc = this.ctx.createOscillator();
        const leadFilter = this.ctx.createBiquadFilter();
        const leadGain = this.ctx.createGain();

        leadOsc.type = cfg.wave;
        leadOsc.frequency.setValueAtTime(noteFreq, now);
        if (emoteId === 'robot_pulse') {
          leadOsc.frequency.setValueAtTime(noteFreq * 1.5, now + 0.05);
        }

        leadFilter.type = 'lowpass';
        leadFilter.frequency.setValueAtTime(1150, now);

        leadGain.gain.setValueAtTime(0.11 * volScale, now);
        leadGain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);

        leadOsc.connect(leadFilter);
        leadFilter.connect(leadGain);
        leadGain.connect(this.sfxGain);

        leadOsc.start(now);
        leadOsc.stop(now + 0.16);
      }, step * stepMs);

      this.emoteTimerIds.push(tid);
    }
  }
}

export const sound = new AudioEngine();

if (typeof window !== 'undefined') {
  (window as unknown as { ProAudioSynth: AudioEngine }).ProAudioSynth = sound;
}
