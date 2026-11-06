/**
 * ============================================================================
 * VINTAGE ROYAL TELETYPE AUDIO ENGINE
 * High-Headroom Procedural & PCM Sample Web Audio Architecture
 * Dedicated Assets: key003.wav, return005.wav, paper_feed.wav
 * Zero Latency // Safari & Chrome Resilient // No Audio-Ducking Compression
 * ============================================================================
 */

(function () {
  'use strict';

  const AudioEngine = {
    ctx: null,
    masterGain: null,
    soundEnabled: true,
    unlocked: false,
    buffers: {
      key: null,
      return: null,
      paperFeed: null
    },
    blobUrls: {
      key: null,
      return: null,
      paperFeed: null
    },
    audioPools: {
      key: [],
      return: [],
      paperFeed: []
    },
    poolIndices: {
      key: 0,
      return: 0,
      paperFeed: 0
    },
    loadingStarted: false,

    init() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          try {
            this.ctx = new AudioContextClass();
            // Direct master gain to destination (NO DYNAMICS COMPRESSOR to preserve transient clicks)
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
          } catch (_) {}
        }
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      if (!this.loadingStarted) {
        this.loadAudioAssets();
      }
    },

    unlock() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      // Force audio hardware clock start with 1-sample silent ping
      if (this.ctx && !this.unlocked) {
        try {
          const silent = this.ctx.createBuffer(1, 1, 22050);
          const src = this.ctx.createBufferSource();
          src.buffer = silent;
          src.connect(this.ctx.destination);
          src.start(0);
        } catch (_) {}
      }
      this.unlocked = true;
    },

    loadAudioAssets() {
      if (this.loadingStarted) return;
      this.loadingStarted = true;

      const base64ToArrayBuffer = (b64) => {
        try {
          const bin = window.atob(b64);
          const len = bin.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
          return bytes.buffer;
        } catch (_) {
          return null;
        }
      };

      const base64ToBlobUrl = (b64) => {
        try {
          const bin = window.atob(b64);
          const len = bin.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'audio/wav' });
          return URL.createObjectURL(blob);
        } catch (_) {
          return null;
        }
      };

      // 1. FAST-PATH: Decode embedded base64 audio data immediately
      if (window.TYPEWRITER_AUDIO_DATA) {
        const d = window.TYPEWRITER_AUDIO_DATA;

        ['key', 'return', 'paperFeed'].forEach((type) => {
          const b64 = d[type];
          if (!b64) return;

          // Preload HTMLAudioElement pool using zero-latency memory Blob URL
          const blobUrl = base64ToBlobUrl(b64);
          if (blobUrl) {
            this.blobUrls[type] = blobUrl;
            const poolSize = (type === 'key') ? 12 : 4;
            const pool = [];
            for (let i = 0; i < poolSize; i++) {
              const a = new Audio(blobUrl);
              a.preload = 'auto';
              pool.push(a);
            }
            this.audioPools[type] = pool;
          }

          // Decode AudioBuffer for Web Audio API
          if (this.ctx) {
            const ab = base64ToArrayBuffer(b64);
            if (ab) {
              this.decodeAudioBuffer(ab, (buf) => {
                if (buf) this.buffers[type] = buf;
              });
            }
          }
        });
      }

      // 2. NETWORK / LOCAL FILE BACKUP FETCH
      const soundFiles = {
        key: ['assets/sounds/key003.wav', 'public/assets/sounds/key003.wav'],
        return: ['assets/sounds/return005.wav', 'public/assets/sounds/return005.wav'],
        paperFeed: ['assets/sounds/paper_feed.wav', 'public/assets/sounds/paper_feed.wav']
      };

      Object.keys(soundFiles).forEach((type) => {
        if (!this.buffers[type] && this.ctx) {
          const tryFetch = (urlList) => {
            if (!urlList.length) return;
            const url = urlList[0];
            fetch(url)
              .then(res => res.ok ? res.arrayBuffer() : null)
              .then(ab => {
                if (ab) {
                  this.decodeAudioBuffer(ab, (buf) => {
                    if (buf && !this.buffers[type]) this.buffers[type] = buf;
                  });
                } else {
                  tryFetch(urlList.slice(1));
                }
              })
              .catch(() => tryFetch(urlList.slice(1)));
          };
          tryFetch(soundFiles[type]);
        }
      });
    },

    decodeAudioBuffer(ab, onSuccess) {
      if (!this.ctx || !ab) return;
      try {
        const copy = ab.slice(0);
        let completed = false;
        const cb = (decoded) => {
          if (!completed && decoded) {
            completed = true;
            onSuccess(decoded);
          }
        };
        const p = this.ctx.decodeAudioData(copy, cb, () => {});
        if (p && typeof p.then === 'function') {
          p.then(cb).catch(() => {});
        }
      } catch (_) {}
    },

    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      return this.soundEnabled;
    },

    playAudio(type, { pitch = 1.0, volume = 1.0 } = {}) {
      if (!this.soundEnabled) return false;
      this.init();

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      // Method 1: Web Audio Buffer (Zero latency, full dynamic headroom)
      const buffer = this.buffers[type];
      if (buffer && this.ctx) {
        try {
          const src = this.ctx.createBufferSource();
          src.buffer = buffer;
          src.playbackRate.setValueAtTime(pitch, this.ctx.currentTime);

          const gainNode = this.ctx.createGain();
          gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);

          src.connect(gainNode);
          gainNode.connect(this.masterGain || this.ctx.destination);
          src.start(0);
          return true;
        } catch (_) {}
      }

      // Method 2: Instant Preloaded Audio Pool (Safari resilient fallback)
      const pool = this.audioPools[type];
      if (pool && pool.length) {
        try {
          const idx = this.poolIndices[type] % pool.length;
          this.poolIndices[type]++;
          const audio = pool[idx];
          audio.volume = Math.max(0, Math.min(1.0, volume > 1.0 ? 1.0 : volume));
          audio.currentTime = 0;
          const p = audio.play();
          if (p && p.catch) p.catch(() => {});
          return true;
        } catch (_) {}
      }

      return false;
    },

    // 1. KEY003.WAV: Alphabet, backspace, numbers, space, and Enter when navigating options
    playKeySound() {
      if (!this.soundEnabled) return;
      const pitch = 0.97 + (Math.random() * 0.06);
      const played = this.playAudio('key', { pitch, volume: 2.8 });
      if (!played) {
        this.synthKeyClack(950);
      }
    },

    // 2. RETURN005.WAV: Enter button ONLY when turning the page or transmitting
    playReturnSound() {
      if (!this.soundEnabled) return;
      const played = this.playAudio('return', { pitch: 1.0, volume: 2.0 });
      if (!played) {
        this.synthReturnLever();
      }
    },

    // 3. PAPER_FEED.WAV: Page turning & platen roller sound
    playPaperRollSound() {
      if (!this.soundEnabled) return;
      const played = this.playAudio('paperFeed', { pitch: 1.0, volume: 2.0 });
      if (!played) {
        this.synthPaperRoll();
      }
    },

    playPaperSlideSound() {
      this.playPaperRollSound();
    },

    playRatchetClick() {},
    playBell() {},
    playJam() {
      this.playKeySound();
    },

    // PROCEDURAL SYNTHESIZER FALLBACKS (Safety net)
    synthKeyClack(baseFreq = 950) {
      if (!this.ctx) return;
      try {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        const now = Math.max(this.ctx.currentTime, 0.01) + 0.005;
        const dur = 0.04;
        const bufSize = Math.floor(this.ctx.sampleRate * dur);
        const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const out = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) out[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuf;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(baseFreq, now);
        filter.Q.setValueAtTime(3.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        noise.start(now);
      } catch (_) {}
    },

    synthReturnLever() {
      if (!this.ctx) return;
      try {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        const now = Math.max(this.ctx.currentTime, 0.01) + 0.005;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch (_) {}
    },

    synthPaperRoll() {
      if (!this.ctx) return;
      try {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        const now = Math.max(this.ctx.currentTime, 0.01) + 0.005;
        const dur = 0.25;
        const bufSize = Math.floor(this.ctx.sampleRate * dur);
        const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const out = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) out[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuf;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        noise.start(now);
      } catch (_) {}
    }
  };

  // Immediate asset preload & decode
  try {
    AudioEngine.init();
  } catch (_) {}

  // Global user gesture unlock for modern browsers (capture phase)
  ['pointerdown', 'mousedown', 'keydown', 'touchstart', 'click'].forEach(evt => {
    window.addEventListener(evt, () => AudioEngine.unlock(), { capture: true, passive: true });
    document.addEventListener(evt, () => AudioEngine.unlock(), { capture: true, passive: true });
  });

  window.AudioEngine = AudioEngine;
  window.MechAudio = AudioEngine;
})();
