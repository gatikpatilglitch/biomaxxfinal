// Zero-dependency Web Audio API procedural sound engine
class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
  }

  // Bubble Pop Sound with random pitch variation for organic tactile feel
  playPopSound(pitchMultiplier = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = (550 + Math.random() * 180) * pitchMultiplier;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Ocean wave sound for Pursed-Lip Belly Breathing
  playOceanWave(isInhale) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const duration = isInhale ? 2.2 : 4.2;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pinkish filtered noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.15;
        b2 = 0.85 * b2 + white * 0.25;
        data[i] = (b0 + b1 + b2) * 0.3;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';

      const gain = this.ctx.createGain();

      if (isInhale) {
        // Swelling wave for inhale (2s)
        filter.frequency.setValueAtTime(180, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(850, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + duration * 0.7);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      } else {
        // Receding wave for pursed-lip exhale (4s)
        filter.frequency.setValueAtTime(750, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(0.20, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      }

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Ocean wave audio failed:', e);
    }
  }

  // Solfeggio frequencies for Soundscape Zen Garden (528Hz, 639Hz, 741Hz, 852Hz)
  playZenChime(type = 'chime') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const freqs = [432, 528, 639, 741, 852, 963];
      const freq = freqs[Math.floor(Math.random() * freqs.length)];

      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 1.5, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.2);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      oscHarmonic.start();
      osc.stop(this.ctx.currentTime + 2.2);
      oscHarmonic.stop(this.ctx.currentTime + 2.2);
    } catch (e) {
      console.warn('Zen chime audio failed:', e);
    }
  }

  // Alert ping for sudden spike warnings
  playSpikeAlert() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.18, 0.36].forEach((offset) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now + offset);
        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.12);
      });
    } catch (e) {
      console.warn('Alert audio failed:', e);
    }
  }
}

export const soundFx = new AudioSynthesizer();
