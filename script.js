/**
 * ============================================================================
 * VINTAGE ROYAL TELETYPE ENGINE // MODEL 1954
 * Single-Paper Interactive Teletype Wizard
 * Procedural Web Audio API // Authentic Platen Physics // Mechanical Ratchets
 * ============================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. PROCEDURAL WEB AUDIO SYNTHESIZER (SAFARI / CHROME RESILIENT)
  // ==========================================================================
  const AudioEngine = {
    ctx: null,
    masterGain: null,
    soundEnabled: true,
    unlocked: false,
    activeAudios: new Set(),
    buffers: {
      key: null,
      return: null,
      paperFeed: null
    },
    dataUris: {
      key: null,
      return: null,
      paperFeed: null
    },
    loadingStarted: false,

    async unlock() {
      this.init();
      this.unlocked = true;
    },

    init() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          try {
            this.ctx = new AudioContextClass();

            // Dynamics compressor to maximize perceptual loudness, clarity & punch without clipping
            this.compressor = this.ctx.createDynamicsCompressor();
            this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
            this.compressor.knee.setValueAtTime(8, this.ctx.currentTime);
            this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
            this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
            this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

            // Master Gain: Boost output to 2.2x for loud, authentic mechanical audio
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(2.2, this.ctx.currentTime);

            this.masterGain.connect(this.compressor);
            this.compressor.connect(this.ctx.destination);
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

    loadAudioAssets() {
      this.loadingStarted = true;

      // 1. FAST-PATH: Decode embedded base64 audio data if present (Zero CORS, Zero File:// delays)
      if (window.TYPEWRITER_AUDIO_DATA) {
        const d = window.TYPEWRITER_AUDIO_DATA;

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

        const decodeBase64ToBuffer = async (b64) => {
          if (!b64 || !this.ctx) return null;
          const ab = base64ToArrayBuffer(b64);
          if (!ab) return null;
          try {
            return await this.ctx.decodeAudioData(ab);
          } catch (_) {
            return null;
          }
        };

        if (d.key) {
          decodeBase64ToBuffer(d.key).then(b => { if (b) this.buffers.key = b; });
          this.dataUris.key = 'data:audio/wav;base64,' + d.key;
        }
        if (d.return) {
          decodeBase64ToBuffer(d.return).then(b => { if (b) this.buffers.return = b; });
          this.dataUris.return = 'data:audio/wav;base64,' + d.return;
        }
        if (d.paperFeed) {
          decodeBase64ToBuffer(d.paperFeed).then(b => { if (b) this.buffers.paperFeed = b; });
          this.dataUris.paperFeed = 'data:audio/wav;base64,' + d.paperFeed;
        }
      }

      // 2. NETWORK/LOCAL FILE BACKUP FETCH
      const soundFiles = {
        key: 'assets/sounds/key003.wav',
        return: 'assets/sounds/return005.wav',
        paperFeed: 'assets/sounds/paper_feed.wav'
      };

      const loadBufferFromUrl = async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          const arrayBuffer = await res.arrayBuffer();
          if (!this.ctx) return null;
          return await this.ctx.decodeAudioData(arrayBuffer);
        } catch (_) {
          return null;
        }
      };

      if (!this.buffers.key) loadBufferFromUrl(soundFiles.key).then(b => { if (b) this.buffers.key = b; });
      if (!this.buffers.return) loadBufferFromUrl(soundFiles.return).then(b => { if (b) this.buffers.return = b; });
      if (!this.buffers.paperFeed) loadBufferFromUrl(soundFiles.paperFeed).then(b => { if (b) this.buffers.paperFeed = b; });
    },

    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      return this.soundEnabled;
    },

    playAudio(urlOrDataUri, buffer, { pitch = 1.0, volume = 1.0 } = {}) {
      if (!this.soundEnabled) return false;

      // Ensure AudioContext is actively running
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      // Method 1: Web Audio Buffer (Zero latency + dynamic pitch)
      if (buffer && this.ctx) {
        if (this.playBuffer(buffer, { pitch, volume })) {
          return true;
        }
      }

      // Method 2: HTMLAudioElement with persistent Set reference (prevents GC dropouts)
      if (urlOrDataUri) {
        try {
          const audio = new Audio(urlOrDataUri);
          audio.volume = Math.max(0, Math.min(1, volume));
          this.activeAudios.add(audio);
          audio.onended = () => this.activeAudios.delete(audio);
          audio.onerror = () => this.activeAudios.delete(audio);
          const playPromise = audio.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(() => {
              this.activeAudios.delete(audio);
            });
          }
          return true;
        } catch (_) {
          return false;
        }
      }
      return false;
    },

    playBuffer(buffer, { pitch = 1.0, volume = 1.0 } = {}) {
      if (!this.ctx || !buffer || !this.soundEnabled) return false;
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
      } catch (_) {
        return false;
      }
    },

    // 1. KEY003.WAV: Used for alphabet keys, backspace button, and enter button when navigating options
    playKeySound() {
      this.init();
      if (!this.soundEnabled) return;
      const dataUri = (this.dataUris && this.dataUris.key) || 'assets/sounds/key003.wav';
      const pitch = 0.98 + (Math.random() * 0.04);
      const played = this.playAudio(dataUri, this.buffers.key, { pitch, volume: 1.0 });
      if (!played) {
        this.synthKeyClack(950);
      }
    },

    // 2. RETURN005.WAV: Used for enter button ONLY when turning the page
    playReturnSound() {
      this.init();
      if (!this.soundEnabled) return;
      const dataUri = (this.dataUris && this.dataUris.return) || 'assets/sounds/return005.wav';
      const played = this.playAudio(dataUri, this.buffers.return, { pitch: 1.0, volume: 1.0 });
      if (!played) {
        this.synthReturnLever();
      }
    },

    // 3. PAPER_FEED.WAV: Used for the page turning sound
    playPaperRollSound() {
      this.init();
      if (!this.soundEnabled) return;
      const dataUri = (this.dataUris && this.dataUris.paperFeed) || 'assets/sounds/paper_feed.wav';
      const played = this.playAudio(dataUri, this.buffers.paperFeed, { pitch: 1.0, volume: 1.0 });
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

    // PROCEDURAL SYNTHESIZER FALLBACKS
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
        gain.gain.setValueAtTime(0.65, now);
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
        gain.gain.setValueAtTime(0.6, now);
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
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        noise.start(now);
      } catch (_) {}
    }
  };

  // Global user gesture unlock for modern browsers
  ['click', 'keydown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, () => AudioEngine.init(), { once: true });
  });

  window.AudioEngine = AudioEngine;
  const MechAudio = AudioEngine;

  // ==========================================================================
  // 2. MASTER STATE & WIZARD COPY SCHEMA (REFRESHED TELETYPE)
  // ==========================================================================
  const WIZARD_SCHEMA = {
    1: {
      tag: 'WHAT ARE WE BUILDING?',
      title: 'What Are We Building?',
      ref: 'SYS-01 // GOAL',
      stepLabel: '[ 01 / 04 ]',
      directive: 'CHOOSE YOUR PRIMARY GOAL:',
      footerStamp: 'PRESS [1-4] OR CLICK // ENTER ↵ TO CONFIRM',
      options: [
        {
          num: 1,
          id: 'web_app',
          label: 'Modern Website or Web App',
          tag: 'WEB/APP',
          brief: 'Fast, clean websites and web platforms built to convert visitors into clients.'
        },
        {
          num: 2,
          id: 'automation',
          label: 'Business Workflow Automation',
          tag: 'AUTONOMOUS',
          brief: 'Connect your tools (CRMs, Google Sheets, email) so tasks run on autopilot.'
        },
        {
          num: 3,
          id: 'lead_bot',
          label: 'WhatsApp & Lead Capture Bot',
          tag: 'BOT/24-7',
          brief: 'Automatically reply to incoming customer leads and book meetings 24/7.'
        },
        {
          num: 4,
          id: 'custom_software',
          label: 'Custom Software Solution',
          tag: 'BESPOKE',
          brief: 'Tailor-made internal tools, dashboards, or custom database systems.'
        }
      ]
    },
    2: {
      tag: 'WHEN DO YOU NEED IT?',
      title: 'When Do You Need It?',
      ref: 'CAD-02 // TIMELINE',
      stepLabel: '[ 02 / 04 ]',
      directive: 'SELECT YOUR TARGET TIMELINE:',
      footerStamp: 'SELECTION SAVED // PRESS ENTER ↵ TO ROLL',
      options: [
        {
          num: 1,
          id: 'urgent',
          label: 'Urgent Delivery (< 2 Weeks)',
          tag: '< 2 WEEKS',
          brief: 'Rapid sprint to launch an MVP or fix a critical business bottleneck fast.'
        },
        {
          num: 2,
          id: 'standard',
          label: 'Standard Rollout (3 to 5 Weeks)',
          tag: '3-5 WEEKS',
          brief: 'Steady build with full design reviews, feedback cycles, and testing.'
        },
        {
          num: 3,
          id: 'flexible',
          label: 'Flexible / Long-Term Project',
          tag: 'LONG-TERM',
          brief: 'Phased development milestones over several months or an ongoing retainer.'
        },
        {
          num: 4,
          id: 'planning',
          label: 'Still Planning / No Fixed Date',
          tag: 'EXPLORING',
          brief: 'Exploring feasibility and getting expert technical advice first.'
        }
      ]
    },
    3: {
      tag: 'PLANNED INVESTMENT',
      title: 'Planned Investment',
      ref: 'CAP-03 // BUDGET',
      stepLabel: '[ 03 / 04 ]',
      directive: 'CHOOSE YOUR ESTIMATED BUDGET:',
      footerStamp: 'SELECTION SAVED // PRESS ENTER ↵ TO ROLL',
      options: [
        {
          num: 1,
          id: 'tier_starter',
          label: '₹25,000 – ₹50,000 (Starter)',
          tag: '₹25K-₹50K',
          brief: 'Ideal for simple automations, landing pages, or small single-purpose tools.'
        },
        {
          num: 2,
          id: 'tier_growth',
          label: '₹50,000 – ₹1,20,000 (Growth)',
          tag: '₹50K-₹1.2L',
          brief: 'Complete dynamic web apps, multi-step pipelines, or customized bot flows.'
        },
        {
          num: 3,
          id: 'tier_scale',
          label: '₹1,20,000+ (Full Scale)',
          tag: '₹1.2L+',
          brief: 'Comprehensive end-to-end platforms, custom databases, and ongoing support.'
        },
        {
          num: 4,
          id: 'tier_discuss',
          label: 'Let’s Discuss Options First',
          tag: 'CUSTOM',
          brief: 'Scope the technical requirements together before fixing a price tag.'
        }
      ]
    },
    4: {
      tag: 'YOUR DETAILS & NOTES',
      title: 'Your Details & Notes',
      ref: 'LEDGER-04 // CONTACT',
      stepLabel: '[ 04 / 04 ]',
      directive: 'WHERE SHOULD WE SEND THE SCOPE?',
      footerStamp: 'REVIEW SUMMARY BEFORE SENDING ↵'
    }
  };

  const WIZARD_STATE = {
    step: 1,
    capability: null,
    capabilityBrief: null,
    velocity: null,
    velocityBrief: null,
    capital: null,
    capitalBrief: null,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientNotes: '',
    teamMessage: ''
  };

  window.WIZARD_SCHEMA = WIZARD_SCHEMA;
  window.WIZARD_STATE = WIZARD_STATE;

  // ==========================================================================
  // 3. KEYBOARD WELL & 3D MECHANICAL KEYBED LAYOUT
  // ==========================================================================
  const KEYBOARD_ROWS = [
    [
      { label: '1', code: 'Digit1', sub: '!' },
      { label: '2', code: 'Digit2', sub: '"' },
      { label: '3', code: 'Digit3', sub: '#' },
      { label: '4', code: 'Digit4', sub: '$' },
      { label: '5', code: 'Digit5', sub: '%' },
      { label: '6', code: 'Digit6', sub: '_' },
      { label: '7', code: 'Digit7', sub: '&' },
      { label: '8', code: 'Digit8', sub: "'" },
      { label: '9', code: 'Digit9', sub: '(' },
      { label: '0', code: 'Digit0', sub: ')' },
      { label: '-', code: 'Minus', sub: '*' },
      { label: 'BKSP', code: 'Backspace', width: 'wide-backspace', action: 'backspace' }
    ],
    [
      { label: 'Q', code: 'KeyQ' },
      { label: 'W', code: 'KeyW' },
      { label: 'E', code: 'KeyE' },
      { label: 'R', code: 'KeyR' },
      { label: 'T', code: 'KeyT' },
      { label: 'Y', code: 'KeyY' },
      { label: 'U', code: 'KeyU' },
      { label: 'I', code: 'KeyI' },
      { label: 'O', code: 'KeyO' },
      { label: 'P', code: 'KeyP' }
    ],
    [
      { label: 'A', code: 'KeyA' },
      { label: 'S', code: 'KeyS' },
      { label: 'D', code: 'KeyD' },
      { label: 'F', code: 'KeyF' },
      { label: 'G', code: 'KeyG' },
      { label: 'H', code: 'KeyH' },
      { label: 'J', code: 'KeyJ' },
      { label: 'K', code: 'KeyK' },
      { label: 'L', code: 'KeyL' },
      { label: ';', code: 'Semicolon', sub: ':' },
      { label: 'RET', code: 'Enter', width: 'wide-return', action: 'enter' }
    ],
    [
      { label: 'Z', code: 'KeyZ' },
      { label: 'X', code: 'KeyX' },
      { label: 'C', code: 'KeyC' },
      { label: 'V', code: 'KeyV' },
      { label: 'B', code: 'KeyB' },
      { label: 'N', code: 'KeyN' },
      { label: 'M', code: 'KeyM' },
      { label: ',', code: 'Comma' },
      { label: '.', code: 'Period' },
      { label: '/', code: 'Slash', sub: '?' }
    ]
  ];

  // ==========================================================================
  // 4. MAIN TELETYPE ENGINE CLASS
  // ==========================================================================
  class TypewriterEngine {
    constructor() {
      this.sound = AudioEngine;
      this.keyboardDeck = document.getElementById('keyboard-deck');
      this.typewriterPaper = document.getElementById('typewriterPaper');
      this.paperContent = document.getElementById('paperContent');
      this.carriageLever = document.getElementById('carriage-lever');
      this.hiddenInput = document.getElementById('hidden-input');
      this.soundToggleBtn = document.getElementById('soundToggle');
      this.ambientBanner = document.getElementById('ambient-banner');
      this.summaryModal = document.getElementById('summary-modal');
      this.fullFrameReview = document.getElementById('full-frame-review');
      this.reviewConfirmBtn = document.getElementById('review-confirm-btn');
      this.reviewBackBtn = document.getElementById('review-back-btn');
      this.transmittedStamp = document.getElementById('transmitted-stamp');

      this.activeHeldKeys = new Set();
      this.pressedKeyCaps = new Set();
      this.isRolling = false;
      this.focusedIndex = 0;
      this.selectedOption = null;

      // Wheel & Mechanical Platen Physics
      this.paperScrollY = 0;
      this.MIN_SCROLL = -140;
      this.MAX_SCROLL = 40;
      this.lastRatchetTime = 0;
    }

    init() {
      this.build3DKeyboard();
      this.bindEvents();
      this.bindPlatenScroll();
      this.renderPaperStep(WIZARD_STATE.step);
    }

    engageMechanicalTerminal() {
      this.sound.init();
      if (this.ambientBanner) {
        this.ambientBanner.classList.add('hidden');
      }
    }

    build3DKeyboard() {
      if (!this.keyboardDeck) return;
      this.keyboardDeck.innerHTML = '';

      KEYBOARD_ROWS.forEach((rowDef, rowIdx) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'key-row row-' + rowIdx;

        rowDef.forEach((k) => {
          const cap = document.createElement('div');
          let classNames = 'keycap';
          if (k.width) classNames += ' ' + k.width;
          if (k.action) classNames += ' action-key';
          cap.className = classNames;
          cap.dataset.key = k.label;
          cap.dataset.code = k.code;
          if (k.action) cap.dataset.action = k.action;

          let innerHtml = '<span class="key-label">' + k.label + '</span>';
          if (k.sub) innerHtml += '<span class="key-sub">' + k.sub + '</span>';
          cap.innerHTML = innerHtml;

          cap.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.engageMechanicalTerminal();
            this.triggerKeyAction(k.label, k.code, cap);
          });

          rowEl.appendChild(cap);
        });

        this.keyboardDeck.appendChild(rowEl);
      });

      // Elongated horizontal mechanical spacebar
      const spaceRow = document.createElement('div');
      spaceRow.className = 'spacebar-row flex justify-center items-center mt-2';

      const spaceBtn = document.createElement('button');
      spaceBtn.id = 'key-space';
      spaceBtn.className = 'typewriter-spacebar';
      spaceBtn.dataset.key = ' ';
      spaceBtn.dataset.code = 'Space';
      spaceBtn.dataset.action = 'space';
      spaceBtn.type = 'button';
      spaceBtn.innerHTML = '<span class="spacebar-label">SPACE</span>';

      spaceBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.engageMechanicalTerminal();
        this.triggerKeyAction(' ', 'Space', spaceBtn);
      });

      spaceRow.appendChild(spaceBtn);
      this.keyboardDeck.appendChild(spaceRow);
    }

    bindPlatenScroll() {
      if (!this.typewriterPaper) return;

      this.typewriterPaper.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (this.isRolling) return;

        this.paperScrollY -= e.deltaY * 0.4;
        this.paperScrollY = Math.max(this.MIN_SCROLL, Math.min(this.MAX_SCROLL, this.paperScrollY));

        const now = performance.now();
        if (Math.abs(e.deltaY) > 6 && now - this.lastRatchetTime > 40) {
          this.sound.playRatchetClick();
          this.lastRatchetTime = now;
        }

        this.typewriterPaper.style.transform = 'translateY(' + this.paperScrollY + 'px)';
      }, { passive: false });
    }

    bindEvents() {
      window.addEventListener('keydown', (e) => this.handleKeyDown(e), { passive: false });
      window.addEventListener('keyup', (e) => this.handleKeyUp(e), { passive: true });

      if (this.carriageLever) {
        this.carriageLever.addEventListener('click', () => {
          this.engageMechanicalTerminal();
          if (this.fullFrameReview && this.fullFrameReview.classList.contains('active')) {
            this.finalizeMatrixDispatch();
          } else if (WIZARD_STATE.step === 4) {
            this.openFullFrameReview();
          } else {
            if (this.selectedOption === null) {
              this.selectCurrentOption();
            } else {
              this.executePaperAdvance();
            }
          }
        });
      }

      if (this.reviewBackBtn) {
        this.reviewBackBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeFullFrameReview();
        });
      }

      if (this.reviewConfirmBtn) {
        this.reviewConfirmBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.finalizeMatrixDispatch();
        });
      }

      if (this.soundToggleBtn) {
        this.soundToggleBtn.addEventListener('click', () => {
          this.engageMechanicalTerminal();
          const active = this.sound.toggleSound();
          const led = this.soundToggleBtn.querySelector('.hud-led');
          const text = this.soundToggleBtn.querySelector('.hud-text');
          if (active) {
            this.soundToggleBtn.classList.remove('off');
            if (led) led.style.background = '#22C55E';
            if (text) text.textContent = 'SOUND: ON';
          } else {
            this.soundToggleBtn.classList.add('off');
            if (led) led.style.background = '#EF4444';
            if (text) text.textContent = 'SOUND: OFF';
          }
        });
      }

      document.addEventListener('pointerdown', (e) => {
        if (!e.target.closest('#summary-modal') && !e.target.closest('.option-row') && !e.target.closest('input') && !e.target.closest('textarea')) {
          this.engageMechanicalTerminal();
        }
      });
    }

    handleKeyDown(e) {
      const keyVal = e.key;
      const codeVal = e.code;

      // 1. Space key handling
      if (keyVal === ' ' || codeVal === 'Space') {
        const tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
        }
        this.sound.playKeySound();
      }

      // Check held keys to avoid stutter
      if (this.activeHeldKeys.has(keyVal) || (codeVal && this.activeHeldKeys.has(codeVal))) {
        return;
      }
      this.activeHeldKeys.add(keyVal);
      if (codeVal) this.activeHeldKeys.add(codeVal);

      if (this.summaryModal && this.summaryModal.classList.contains('active')) return;

      if (this.fullFrameReview && this.fullFrameReview.classList.contains('active')) {
        if (keyVal === 'Enter') {
          e.preventDefault();
          this.finalizeMatrixDispatch();
          return;
        }
        if (keyVal === 'Escape' || keyVal === 'Backspace') {
          e.preventDefault();
          this.closeFullFrameReview();
          return;
        }
        return;
      }

      this.engageMechanicalTerminal();

      // Play key003 clack for normal keys, NOT space (played above) and NOT enter (handled contextually)
      if (keyVal !== ' ' && codeVal !== 'Space' && keyVal !== 'Enter') {
        this.sound.playKeySound();
      }

      const keyCap = this.findKeyCap(keyVal, codeVal);
      if (keyCap) {
        keyCap.classList.add('is-pressed', 'plunged');
        this.pressedKeyCaps.add(keyCap);
      }

      if (this.isRolling) return;

      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && activeEl.id !== 'hidden-input';

      if (isInputFocused) {
        if (e.key === 'Enter') {
          if (activeEl.tagName === 'TEXTAREA') {
            return;
          }
          // Enter navigates through single-line inputs -> use key003.wav
          e.preventDefault();
          this.sound.playKeySound();
          if (activeEl.id === 'leadName') {
            const next = document.getElementById('leadEmail');
            if (next) next.focus();
          } else if (activeEl.id === 'leadEmail') {
            const next = document.getElementById('leadPhone');
            if (next) next.focus();
          } else if (activeEl.id === 'leadPhone') {
            const next = document.getElementById('teamMessage');
            if (next) next.focus();
          }
        }
        return;
      }

      // Steps 1 to 3
      if (WIZARD_STATE.step < 4) {
        if (keyVal === 'ArrowDown' || keyVal === 'ArrowUp' || keyVal === 'Enter' || keyVal === ' ' || (keyVal >= '1' && keyVal <= '4')) {
          e.preventDefault();
          this.handleKeyNavigation(keyVal);
          return;
        }

        if (keyVal === 'Backspace' && WIZARD_STATE.step > 1) {
          e.preventDefault();
          this.goToPrevStep();
          return;
        }
      } else {
        // Step 4 (when no input is focused) - Enter opens the full-frame review spread
        if (keyVal === 'Enter') {
          e.preventDefault();
          this.openFullFrameReview();
          return;
        }
        if (keyVal === 'Backspace') {
          e.preventDefault();
          this.goToPrevStep();
          return;
        }
      }
    }

    handleKeyUp(e) {
      this.activeHeldKeys.delete(e.key);
      if (e.code) this.activeHeldKeys.delete(e.code);

      const keyCap = this.findKeyCap(e.key, e.code);
      if (keyCap) {
        keyCap.classList.remove('is-pressed', 'plunged');
        this.pressedKeyCaps.delete(keyCap);
      }
    }

    triggerKeyAction(key, code, keyEl) {
      if (keyEl) {
        keyEl.classList.add('is-pressed', 'plunged');
        setTimeout(() => keyEl.classList.remove('is-pressed', 'plunged'), 120);
      }

      if (this.summaryModal && this.summaryModal.classList.contains('active')) return;
      if (this.isRolling) return;

      if (this.fullFrameReview && this.fullFrameReview.classList.contains('active')) {
        if (code === 'Enter' || key === 'RET' || key === 'Enter') {
          this.finalizeMatrixDispatch();
        }
        return;
      }

      // Handle Enter / RET specifically
      if (code === 'Enter' || key === 'RET' || key === 'Enter') {
        if (WIZARD_STATE.step < 4) {
          this.handleKeyNavigation('Enter');
        } else {
          this.openFullFrameReview();
        }
        return;
      }

      // For all alphabet, numbers, backspace, space: play key003.wav
      this.sound.playKeySound();

      if (WIZARD_STATE.step < 4) {
        if (code === 'Backspace' || key === 'BKSP') {
          if (WIZARD_STATE.step > 1) this.goToPrevStep();
          return;
        }
        if (code === 'Space' || key === ' ') {
          this.handleKeyNavigation(' ');
          return;
        }
        if (key >= '1' && key <= '4') {
          this.handleKeyNavigation(key);
          return;
        }
      } else {
        if (code === 'Backspace' || key === 'BKSP') {
          this.goToPrevStep();
          return;
        }
      }
    }

    findKeyCap(key, code) {
      if (code === 'Space' || key === ' ' || key === 'SPACE') {
        return document.getElementById('key-space') || (this.keyboardDeck ? this.keyboardDeck.querySelector('.typewriter-spacebar') : null);
      }
      if (!this.keyboardDeck) return null;
      let target = null;
      if (code) {
        target = this.keyboardDeck.querySelector('[data-code="' + code + '"]');
      }
      if (!target && key) {
        const up = key.toUpperCase();
        target = this.keyboardDeck.querySelector('[data-key="' + up + '"]');
      }
      return target;
    }

    // ========================================================================
    // 5. KEYBOARD SELECTION & ENTER DOUBLE-TAP ADVANCE
    // ========================================================================
    handleKeyNavigation(key) {
      const options = this.paperContent.querySelectorAll('.option-row');
      if (!options.length) return;

      if (key === 'ArrowDown') {
        this.focusedIndex = (this.focusedIndex + 1) % options.length;
        this.updateOptionVisuals();
        this.sound.playKeySound('char');
      } else if (key === 'ArrowUp') {
        this.focusedIndex = (this.focusedIndex - 1 + options.length) % options.length;
        this.updateOptionVisuals();
        this.sound.playKeySound('char');
      } else if (key >= '1' && key <= String(options.length)) {
        this.focusedIndex = parseInt(key, 10) - 1;
        this.selectCurrentOption();
      } else if (key === ' ' || key === 'Space') {
        this.selectCurrentOption();
      } else if (key === 'Enter') {
        if (this.selectedOption === null) {
          // First Enter: Lock selection
          this.selectCurrentOption();
        } else {
          // Second Enter: Confirm and advance paper
          this.executePaperAdvance();
        }
      }
    }

    selectCurrentOption() {
      const options = this.paperContent.querySelectorAll('.option-row');
      if (!options.length || this.focusedIndex < 0 || this.focusedIndex >= options.length) return;

      const currentRow = options[this.focusedIndex];
      this.selectedOption = currentRow.dataset.val;

      this.updateOptionVisuals();
      this.sound.playKeySound('char');
    }

    updateOptionVisuals() {
      const options = this.paperContent.querySelectorAll('.option-row');
      if (!options.length) return;

      options.forEach((row, idx) => {
        const boxEl = row.querySelector('.option-box');

        if (idx === this.focusedIndex) {
          row.classList.add('focused');
        } else {
          row.classList.remove('focused');
        }

        if (this.selectedOption && row.dataset.val === this.selectedOption) {
          row.classList.add('selected');
          if (boxEl) boxEl.textContent = '[ ✓ ]';
        } else {
          row.classList.remove('selected');
          if (boxEl) boxEl.textContent = '[   ]';
        }
      });

      const promptEl = document.getElementById('paperPrompt');
      if (promptEl) {
        if (this.selectedOption !== null) {
          promptEl.textContent = '[ ENTER ↵ TO CONFIRM ]';
        } else {
          promptEl.textContent = '[ SELECT: 1-4 / ARROWS + ENTER ]';
        }
      }
    }

    executePaperAdvance() {
      if (this.isRolling) return;
      if (this.selectedOption === null) return;

      if (WIZARD_STATE.step < 4) {
        const schema = WIZARD_SCHEMA[WIZARD_STATE.step];
        const chosen = schema && schema.options ? schema.options.find(o => o.label === this.selectedOption) : null;
        const brief = chosen ? chosen.brief : '';

        if (WIZARD_STATE.step === 1) {
          WIZARD_STATE.capability = this.selectedOption;
          WIZARD_STATE.capabilityBrief = brief;
        }
        if (WIZARD_STATE.step === 2) {
          WIZARD_STATE.velocity = this.selectedOption;
          WIZARD_STATE.velocityBrief = brief;
        }
        if (WIZARD_STATE.step === 3) {
          WIZARD_STATE.capital = this.selectedOption;
          WIZARD_STATE.capitalBrief = brief;
        }

        this.sound.playReturnSound();
        this.transitionToNextPaper(WIZARD_STATE.step + 1);
      }
    }

    transitionToNextPaper(nextStep) {
      if (this.isRolling) return;
      this.isRolling = true;

      this.sound.playPaperRollSound();

      this.paperScrollY = 0;
      if (this.typewriterPaper) {
        this.typewriterPaper.style.transform = '';
        this.typewriterPaper.classList.remove('paper-resting', 'paper-loading-in');
        this.typewriterPaper.classList.add('paper-ejecting');
      }

      setTimeout(() => {
        WIZARD_STATE.step = nextStep;
        this.selectedOption = null;
        this.focusedIndex = 0;
        this.renderPaperStep(WIZARD_STATE.step);

        if (this.typewriterPaper) {
          this.typewriterPaper.classList.remove('paper-ejecting');
          this.typewriterPaper.classList.add('paper-loading-in');
          void this.typewriterPaper.offsetWidth;
          this.typewriterPaper.classList.remove('paper-loading-in');
          this.typewriterPaper.classList.add('paper-resting');
        }

        this.isRolling = false;
      }, 440);
    }

    goToPrevStep() {
      if (this.isRolling || WIZARD_STATE.step <= 1) return;

      this.isRolling = true;
      this.sound.playPaperRollSound();

      this.paperScrollY = 0;
      if (this.typewriterPaper) {
        this.typewriterPaper.style.transform = '';
        this.typewriterPaper.classList.remove('paper-resting', 'paper-loading-in');
        this.typewriterPaper.classList.add('paper-ejecting');
      }

      setTimeout(() => {
        WIZARD_STATE.step -= 1;
        this.selectedOption = null;
        this.focusedIndex = 0;
        this.renderPaperStep(WIZARD_STATE.step);

        if (this.typewriterPaper) {
          this.typewriterPaper.classList.remove('paper-ejecting');
          this.typewriterPaper.classList.add('paper-loading-in');
          void this.typewriterPaper.offsetWidth;
          this.typewriterPaper.classList.remove('paper-loading-in');
          this.typewriterPaper.classList.add('paper-resting');
        }

        this.isRolling = false;
      }, 440);
    }

    // ========================================================================
    // 6. DYNAMIC SHEET RENDERER (REFRESHED TELETYPE SCHEMA)
    // ========================================================================
    renderPaperStep(step) {
      if (step < 1) step = 1;
      if (step > 4) step = 4;
      WIZARD_STATE.step = step;

      let html = '';

      if (step >= 1 && step <= 3) {
        const schema = WIZARD_SCHEMA[step];

        html += '<div class="sheet-meta-bar typewriter-ink">';
        html += '  <span>' + schema.tag + ' // ' + schema.ref + '</span>';
        html += '  <span>' + schema.stepLabel + '</span>';
        html += '</div>';

        html += '<div class="sheet-directive typewriter-ink">' + schema.directive + '</div>';

        html += '<div class="paper-opt-list">';
        schema.options.forEach((opt, idx) => {
          const isSelected = (step === 1 && WIZARD_STATE.capability === opt.label) ||
                             (step === 2 && WIZARD_STATE.velocity === opt.label) ||
                             (step === 3 && WIZARD_STATE.capital === opt.label);

          const boxText = isSelected ? '[ ✓ ]' : '[   ]';
          const rowClass = isSelected ? 'option-row selected typewriter-ink' : (idx === this.focusedIndex ? 'option-row focused typewriter-ink' : 'option-row typewriter-ink');

          html += '<div class="' + rowClass + '" data-idx="' + idx + '" data-val="' + opt.label + '">';
          html += '  <div class="opt-head">';
          html += '    <span class="option-box">' + boxText + '</span>';
          html += '    <span class="opt-num-label">[' + opt.num + '] ' + opt.label + '</span>';
          html += '  </div>';
          html += '  <div class="opt-brief">Brief: ' + opt.brief + '</div>';
          html += '</div>';
        });
        html += '</div>';

        html += '<div class="sheet-footer-bar typewriter-ink">';
        html += '  <span>' + schema.footerStamp + '</span>';
        html += '</div>';

        if (step === 1) this.selectedOption = WIZARD_STATE.capability;
        if (step === 2) this.selectedOption = WIZARD_STATE.velocity;
        if (step === 3) this.selectedOption = WIZARD_STATE.capital;

      } else if (step === 4) {
        // Step 4: Your Details & Notes
        const schema = WIZARD_SCHEMA[4];

        html += '<div class="sheet-meta-bar typewriter-ink">';
        html += '  <span>' + schema.tag + ' // ' + schema.ref + '</span>';
        html += '  <span>' + schema.stepLabel + '</span>';
        html += '</div>';

        html += '<div class="sheet-directive typewriter-ink">' + schema.directive + '</div>';

        html += '<div class="paper-form-box typewriter-ink">';

        html += '  <div class="field-row">';
        html += '    <span class="field-lbl">[+] Your Name / Company:</span>';
        html += '    <input id="leadName" class="ledger-line typewriter-ink" placeholder="e.g. Rahul Sharma *" value="' + (WIZARD_STATE.clientName || '') + '" autocomplete="name" />';
        html += '  </div>';

        html += '  <div class="field-row">';
        html += '    <span class="field-lbl">[+] Work Email:</span>';
        html += '    <input id="leadEmail" type="email" class="ledger-line typewriter-ink" placeholder="e.g. rahul@company.com *" value="' + (WIZARD_STATE.clientEmail || '') + '" autocomplete="email" />';
        html += '  </div>';

        html += '  <div class="field-row">';
        html += '    <span class="field-lbl">[+] WhatsApp Number:</span>';
        html += '    <input id="leadPhone" type="tel" class="ledger-line typewriter-ink" placeholder="e.g. +91 98765 43210" value="' + (WIZARD_STATE.clientPhone || '') + '" autocomplete="tel" />';
        html += '  </div>';

        html += '  <div class="field-row-area" style="margin-top: 2px;">';
        html += '    <span class="field-lbl" style="display: block; margin-bottom: 2px;">[+] Project Notes:</span>';
        html += '    <textarea id="teamMessage" class="paper-textarea typewriter-ink" rows="2" placeholder="Briefly describe what you want to achieve...">' + (WIZARD_STATE.teamMessage || '') + '</textarea>';
        html += '  </div>';

        html += '  <button id="submitLedger" class="dispatch-action-btn typewriter-ink">';
        html += '    [ REVIEW SUMMARY BEFORE SENDING ↵ ]';
        html += '  </button>';

        html += '</div>';

        html += '<div class="sheet-footer-bar typewriter-ink">';
        html += '  <span>WHERE SHOULD WE SEND THE SCOPE?</span>';
        html += '  <span>[ ENTER ↵ TO REVIEW ]</span>';
        html += '</div>';
      }

      this.paperContent.innerHTML = html;
      this.bindPaperInteractions();
      this.updateOptionVisuals();
    }

    bindPaperInteractions() {
      const rows = this.paperContent.querySelectorAll('.option-row');
      rows.forEach((row, idx) => {
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          this.engageMechanicalTerminal();
          const wasSelected = (row.dataset.val === this.selectedOption);
          this.focusedIndex = idx;

          if (wasSelected) {
            this.executePaperAdvance();
          } else {
            this.selectCurrentOption();
          }
        });
      });

      const pName = document.getElementById('leadName');
      const pEmail = document.getElementById('leadEmail');
      const pPhone = document.getElementById('leadPhone');
      const messageInput = document.getElementById('teamMessage');
      const transmitBtn = document.getElementById('submitLedger') || document.getElementById('dispatchBtn');

      if (pName) {
        pName.addEventListener('input', () => { WIZARD_STATE.clientName = pName.value; });
      }
      if (pEmail) {
        pEmail.addEventListener('input', () => { WIZARD_STATE.clientEmail = pEmail.value; });
      }
      if (pPhone) {
        pPhone.addEventListener('input', () => { WIZARD_STATE.clientPhone = pPhone.value; });
      }

      if (messageInput) {
        let lineShiftY = this.paperScrollY || 0;
        let prevLineCount = 1;

        messageInput.addEventListener('input', () => {
          WIZARD_STATE.teamMessage = messageInput.value;
          WIZARD_STATE.clientNotes = messageInput.value;

          // Auto expand height
          messageInput.style.height = 'auto';
          messageInput.style.height = messageInput.scrollHeight + 'px';

          // Count visual lines
          const lines = Math.floor(messageInput.scrollHeight / 15);
          if (lines > prevLineCount) {
            lineShiftY -= 14; // Shift paper up by 1 line height
            this.paperScrollY = lineShiftY;
            if (this.typewriterPaper) {
              this.typewriterPaper.style.transform = 'translateY(' + lineShiftY + 'px)';
            }
            AudioEngine.playPaperSlideSound();
            prevLineCount = lines;
          }
        });

        messageInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            if (!e.shiftKey) {
              // Plain Enter: Confirm message, lock focus, and highlight Transmit button
              e.preventDefault();
              AudioEngine.playKeySound('select');
              messageInput.blur();

              if (transmitBtn) {
                transmitBtn.focus();
                transmitBtn.classList.add('ring-2', 'ring-amber-400');
              }
            } else {
              // Shift + Enter: Add line break and ratchet paper upwards
              lineShiftY -= 14;
              this.paperScrollY = lineShiftY;
              const paper = document.getElementById('typewriterPaper');
              if (paper) paper.style.transform = 'translateY(' + lineShiftY + 'px)';
              AudioEngine.playPaperSlideSound();
            }
          }
        });
      }

      if (transmitBtn) {
        transmitBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openFullFrameReview();
        });
      }
    }

    // ========================================================================
    // 7. MULTI-PAPER DESK SPREAD REVIEW & MATRIX WEBHOOK DISPATCH
    // ========================================================================
    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    openFullFrameReview() {
      if (this.isRolling) return;

      const pName = document.getElementById('leadName');
      const pEmail = document.getElementById('leadEmail');
      const pPhone = document.getElementById('leadPhone');
      const pMessage = document.getElementById('teamMessage');

      const name = pName ? pName.value.trim() : (WIZARD_STATE.clientName || '').trim();
      const email = pEmail ? pEmail.value.trim() : (WIZARD_STATE.clientEmail || '').trim();
      const phone = pPhone ? pPhone.value.trim() : (WIZARD_STATE.clientPhone || '').trim();
      const message = pMessage ? pMessage.value.trim() : (WIZARD_STATE.teamMessage || WIZARD_STATE.clientNotes || '').trim();

      WIZARD_STATE.clientName = name;
      WIZARD_STATE.clientEmail = email;
      WIZARD_STATE.clientPhone = phone;
      WIZARD_STATE.clientNotes = message;
      WIZARD_STATE.teamMessage = message;

      let hasError = false;
      if (!name) {
        if (pName) pName.classList.add('field-error');
        hasError = true;
      } else {
        if (pName) pName.classList.remove('field-error');
      }

      if (!email || !email.includes('@')) {
        if (pEmail) pEmail.classList.add('field-error');
        hasError = true;
      } else {
        if (pEmail) pEmail.classList.remove('field-error');
      }

      if (hasError) {
        this.sound.playJam();
        if (this.typewriterPaper) {
          this.typewriterPaper.classList.add('shake');
          setTimeout(() => this.typewriterPaper.classList.remove('shake'), 350);
        }
        return;
      }

      // 1. Play return005.wav for Enter / submit action
      this.sound.playReturnSound();

      // Hide ambient banner if present so it doesn't overlap spread header
      if (this.ambientBanner) {
        this.ambientBanner.classList.add('hidden');
        this.ambientBanner.style.display = 'none';
      }

      // 2. Roll paper backwards/down into platen roller
      this.isRolling = true;
      this.sound.playPaperRollSound();
      if (this.typewriterPaper) {
        this.typewriterPaper.classList.add('paper-ejecting');
      }

      // 3. Populate all 4 sheets in the full frame spread with briefs and change buttons
      this.populateFullFrameReview();

      // 4. After paper rolls back, spread all 4 sheets across the full frame
      setTimeout(() => {
        if (this.fullFrameReview) {
          this.fullFrameReview.classList.add('active');
          this.sound.playPaperRollSound();
        }
        this.isRolling = false;
      }, 420);
    }

    closeFullFrameReview() {
      if (this.fullFrameReview) {
        this.fullFrameReview.classList.remove('active');
      }
      this.sound.playPaperRollSound();
      if (this.typewriterPaper) {
        this.typewriterPaper.classList.remove('paper-ejecting');
        this.typewriterPaper.classList.add('paper-loading-in');
        void this.typewriterPaper.offsetWidth;
        setTimeout(() => {
          this.typewriterPaper.classList.remove('paper-loading-in');
          this.typewriterPaper.classList.add('paper-resting');
        }, 320);
      }
    }

    closeFullFrameReviewAndJumpToStep(targetStep) {
      if (this.fullFrameReview) {
        this.fullFrameReview.classList.remove('active');
      }
      this.sound.playPaperRollSound();

      if (this.typewriterPaper) {
        this.typewriterPaper.classList.remove('paper-ejecting');
        this.typewriterPaper.classList.add('paper-loading-in');
        void this.typewriterPaper.offsetWidth;
      }

      setTimeout(() => {
        WIZARD_STATE.step = targetStep;
        if (targetStep === 1) this.selectedOption = WIZARD_STATE.capability;
        if (targetStep === 2) this.selectedOption = WIZARD_STATE.velocity;
        if (targetStep === 3) this.selectedOption = WIZARD_STATE.capital;
        if (targetStep === 4) this.selectedOption = null;

        this.focusedIndex = 0;
        this.paperScrollY = 0;
        this.renderPaperStep(targetStep);

        if (this.typewriterPaper) {
          this.typewriterPaper.classList.remove('paper-loading-in');
          this.typewriterPaper.classList.add('paper-resting');
        }
      }, 320);
    }

    populateFullFrameReview() {
      // Sheet 1: What Are We Building? [ 01 / 04 ]
      const s1 = WIZARD_SCHEMA[1];
      const sheet1El = document.getElementById('review-sheet-1');
      if (s1 && sheet1El) {
        let h1 = '<div class="sheet-head">';
        h1 += '  <div class="sheet-head-meta">' + s1.tag + ' // ' + s1.stepLabel + '</div>';
        h1 += '  <div class="sheet-head-title">' + s1.directive + '</div>';
        h1 += '</div>';
        h1 += '<div class="sheet-body-options">';
        s1.options.forEach((opt) => {
          const isSel = (WIZARD_STATE.capability === opt.label);
          h1 += '<div class="sheet-opt-row ' + (isSel ? 'active-chosen' : 'muted-unselected') + '">';
          h1 += '  <div class="sheet-opt-header-line">';
          h1 += '    <span class="sheet-opt-box">' + (isSel ? '[ ✓ ]' : '[   ]') + '</span>';
          h1 += '    <span class="sheet-opt-text">[' + opt.num + '] ' + opt.label + '</span>';
          h1 += '  </div>';
          if (isSel) {
            h1 += '  <div class="sheet-opt-brief"><strong>Brief:</strong> ' + opt.brief + '</div>';
          }
          h1 += '</div>';
        });
        h1 += '</div>';
        h1 += '<div class="sheet-card-action">';
        h1 += '  <button class="sheet-change-btn" data-step="1">[ ↺ CHANGE GOAL ]</button>';
        h1 += '</div>';
        h1 += '<div class="sheet-footer">';
        h1 += '  <span>RECORD: 01-GOAL</span>';
        h1 += '  <span>STATUS: ' + (WIZARD_STATE.capability ? 'CONFIGURED ✓' : 'PENDING') + '</span>';
        h1 += '</div>';
        sheet1El.innerHTML = h1;
      }

      // Sheet 2: When Do You Need It? [ 02 / 04 ]
      const s2 = WIZARD_SCHEMA[2];
      const sheet2El = document.getElementById('review-sheet-2');
      if (s2 && sheet2El) {
        let h2 = '<div class="sheet-head">';
        h2 += '  <div class="sheet-head-meta">' + s2.tag + ' // ' + s2.stepLabel + '</div>';
        h2 += '  <div class="sheet-head-title">' + s2.directive + '</div>';
        h2 += '</div>';
        h2 += '<div class="sheet-body-options">';
        s2.options.forEach((opt) => {
          const isSel = (WIZARD_STATE.velocity === opt.label);
          h2 += '<div class="sheet-opt-row ' + (isSel ? 'active-chosen' : 'muted-unselected') + '">';
          h2 += '  <div class="sheet-opt-header-line">';
          h2 += '    <span class="sheet-opt-box">' + (isSel ? '[ ✓ ]' : '[   ]') + '</span>';
          h2 += '    <span class="sheet-opt-text">[' + opt.num + '] ' + opt.label + '</span>';
          h2 += '  </div>';
          if (isSel) {
            h2 += '  <div class="sheet-opt-brief"><strong>Brief:</strong> ' + opt.brief + '</div>';
          }
          h2 += '</div>';
        });
        h2 += '</div>';
        h2 += '<div class="sheet-card-action">';
        h2 += '  <button class="sheet-change-btn" data-step="2">[ ↺ CHANGE TIMELINE ]</button>';
        h2 += '</div>';
        h2 += '<div class="sheet-footer">';
        h2 += '  <span>RECORD: 02-TIMELINE</span>';
        h2 += '  <span>STATUS: ' + (WIZARD_STATE.velocity ? 'CONFIGURED ✓' : 'PENDING') + '</span>';
        h2 += '</div>';
        sheet2El.innerHTML = h2;
      }

      // Sheet 3: Planned Investment [ 03 / 04 ]
      const s3 = WIZARD_SCHEMA[3];
      const sheet3El = document.getElementById('review-sheet-3');
      if (s3 && sheet3El) {
        let h3 = '<div class="sheet-head">';
        h3 += '  <div class="sheet-head-meta">' + s3.tag + ' // ' + s3.stepLabel + '</div>';
        h3 += '  <div class="sheet-head-title">' + s3.directive + '</div>';
        h3 += '</div>';
        h3 += '<div class="sheet-body-options">';
        s3.options.forEach((opt) => {
          const isSel = (WIZARD_STATE.capital === opt.label);
          h3 += '<div class="sheet-opt-row ' + (isSel ? 'active-chosen' : 'muted-unselected') + '">';
          h3 += '  <div class="sheet-opt-header-line">';
          h3 += '    <span class="sheet-opt-box">' + (isSel ? '[ ✓ ]' : '[   ]') + '</span>';
          h3 += '    <span class="sheet-opt-text">[' + opt.num + '] ' + opt.label + '</span>';
          h3 += '  </div>';
          if (isSel) {
            h3 += '  <div class="sheet-opt-brief"><strong>Brief:</strong> ' + opt.brief + '</div>';
          }
          h3 += '</div>';
        });
        h3 += '</div>';
        h3 += '<div class="sheet-card-action">';
        h3 += '  <button class="sheet-change-btn" data-step="3">[ ↺ CHANGE BUDGET ]</button>';
        h3 += '</div>';
        h3 += '<div class="sheet-footer">';
        h3 += '  <span>RECORD: 03-BUDGET</span>';
        h3 += '  <span>STATUS: ' + (WIZARD_STATE.capital ? 'CONFIGURED ✓' : 'PENDING') + '</span>';
        h3 += '</div>';
        sheet3El.innerHTML = h3;
      }

      // Sheet 4: Your Details & Notes [ 04 / 04 ]
      const s4 = WIZARD_SCHEMA[4];
      const sheet4El = document.getElementById('review-sheet-4');
      if (s4 && sheet4El) {
        let h4 = '<div class="sheet-head">';
        h4 += '  <div class="sheet-head-meta">' + s4.tag + ' // ' + s4.stepLabel + '</div>';
        h4 += '  <div class="sheet-head-title">' + s4.directive + '</div>';
        h4 += '</div>';
        h4 += '<div class="sheet-body-options">';
        h4 += '  <div class="sheet-field-row">';
        h4 += '    <div class="sheet-field-label">[+] NAME / COMPANY:</div>';
        h4 += '    <div class="sheet-field-val">' + this.escapeHtml(WIZARD_STATE.clientName || 'NOT SPECIFIED') + '</div>';
        h4 += '  </div>';
        h4 += '  <div class="sheet-field-row">';
        h4 += '    <div class="sheet-field-label">[+] WORK EMAIL:</div>';
        h4 += '    <div class="sheet-field-val">' + this.escapeHtml(WIZARD_STATE.clientEmail || 'NOT SPECIFIED') + '</div>';
        h4 += '  </div>';
        h4 += '  <div class="sheet-field-row">';
        h4 += '    <div class="sheet-field-label">[+] WHATSAPP NUMBER:</div>';
        h4 += '    <div class="sheet-field-val">' + this.escapeHtml(WIZARD_STATE.clientPhone || 'NOT PROVIDED') + '</div>';
        h4 += '  </div>';
        h4 += '  <div class="sheet-field-row">';
        h4 += '    <div class="sheet-field-label">[+] PROJECT NOTES:</div>';
        h4 += '    <div class="sheet-field-message">' + this.escapeHtml(WIZARD_STATE.teamMessage || 'NO NOTES ATTACHED') + '</div>';
        h4 += '  </div>';
        h4 += '  <div class="sheet-stamp-box">CONFIDENTIAL RECORD // REF: 849-B</div>';
        h4 += '</div>';
        h4 += '<div class="sheet-card-action">';
        h4 += '  <button class="sheet-change-btn" data-step="4">[ ↺ EDIT DETAILS &amp; NOTES ]</button>';
        h4 += '</div>';
        h4 += '<div class="sheet-footer">';
        h4 += '  <span>RECORD: 04-CONTACT</span>';
        h4 += '  <span>STATUS: READY FOR TRANSMISSION</span>';
        h4 += '</div>';
        sheet4El.innerHTML = h4;
      }

      // Bind click handlers to change buttons
      if (this.fullFrameReview) {
        const changeBtns = this.fullFrameReview.querySelectorAll('.sheet-change-btn');
        changeBtns.forEach((btn) => {
          btn.onclick = (e) => {
            e.stopPropagation();
            const stepNum = parseInt(btn.dataset.step, 10);
            if (stepNum) this.closeFullFrameReviewAndJumpToStep(stepNum);
          };
        });

        // Clicking on cards also allows direct jump
        for (let i = 1; i <= 4; i++) {
          const card = this.fullFrameReview.querySelector('.review-sheet.sheet-' + i);
          if (card) {
            card.onclick = (e) => {
              if (!e.target.closest('button')) {
                this.closeFullFrameReviewAndJumpToStep(i);
              }
            };
          }
        }
      }
    }

    async finalizeMatrixDispatch() {
      if (this.reviewConfirmBtn) {
        this.reviewConfirmBtn.disabled = true;
        this.reviewConfirmBtn.textContent = 'TRANSMITTING TO TEAM...';
      }

      this.sound.playReturnSound();

      // Show red transmitted rubber stamp
      if (this.transmittedStamp) {
        this.transmittedStamp.classList.add('stamped');
      }

      const payload = {
        timestamp: new Date().toISOString(),
        // Client Contact & Notes
        name: WIZARD_STATE.clientName || '',
        clientName: WIZARD_STATE.clientName || '',
        email: WIZARD_STATE.clientEmail || '',
        clientEmail: WIZARD_STATE.clientEmail || '',
        phone: WIZARD_STATE.clientPhone || '',
        clientPhone: WIZARD_STATE.clientPhone || '',
        whatsapp: WIZARD_STATE.clientPhone || '',
        notes: WIZARD_STATE.teamMessage || WIZARD_STATE.clientNotes || '',
        projectNotes: WIZARD_STATE.teamMessage || WIZARD_STATE.clientNotes || '',
        teamMessage: WIZARD_STATE.teamMessage || WIZARD_STATE.clientNotes || '',

        // Selected Options & Descriptions
        capability: WIZARD_STATE.capability || 'Not Specified',
        capabilityBrief: WIZARD_STATE.capabilityBrief || '',
        goal: WIZARD_STATE.capability || 'Not Specified',
        goalBrief: WIZARD_STATE.capabilityBrief || '',

        velocity: WIZARD_STATE.velocity || 'Not Specified',
        velocityBrief: WIZARD_STATE.velocityBrief || '',
        timeline: WIZARD_STATE.velocity || 'Not Specified',
        timelineBrief: WIZARD_STATE.velocityBrief || '',

        capital: WIZARD_STATE.capital || 'Not Specified',
        capitalBrief: WIZARD_STATE.capitalBrief || '',
        budget: WIZARD_STATE.capital || 'Not Specified',
        budgetBrief: WIZARD_STATE.capitalBrief || '',

        // Nested Records for Structured N8N Workflows
        client: {
          name: WIZARD_STATE.clientName || '',
          email: WIZARD_STATE.clientEmail || '',
          phone: WIZARD_STATE.clientPhone || '',
          notes: WIZARD_STATE.teamMessage || WIZARD_STATE.clientNotes || '',
          teamMessage: WIZARD_STATE.teamMessage || WIZARD_STATE.clientNotes || ''
        },
        specification: {
          capability: WIZARD_STATE.capability || 'Not Specified',
          capabilityBrief: WIZARD_STATE.capabilityBrief || '',
          velocity: WIZARD_STATE.velocity || 'Not Specified',
          velocityBrief: WIZARD_STATE.velocityBrief || '',
          capital: WIZARD_STATE.capital || 'Not Specified',
          capitalBrief: WIZARD_STATE.capitalBrief || ''
        },
        meta: {
          userAgent: navigator.userAgent,
          terminalModel: 'Royal Teletype 1954'
        }
      };

      const webhookUrl = window.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook-test/a9393481-aa8c-46bd-9335-4abdf388aba1';

      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload),
            mode: 'no-cors'
          });
        } catch (_) {}
      }

      setTimeout(() => {
        if (this.fullFrameReview) {
          this.fullFrameReview.classList.remove('active');
        }
        if (this.reviewConfirmBtn) {
          this.reviewConfirmBtn.disabled = false;
          this.reviewConfirmBtn.textContent = 'TRANSMIT SPECIFICATION TO TEAM ↵';
        }
        if (this.transmittedStamp) {
          this.transmittedStamp.classList.remove('stamped');
        }
        this.renderPaperReceipt(payload);
        this.showSummaryModal(payload);
      }, 700);
    }

    dispatchSpecification() {
      this.openFullFrameReview();
    }

    renderPaperReceipt(payload) {
      let html = '';
      html += '<div class="sheet-meta-bar typewriter-ink">';
      html += '  <span>DISPATCH RECEIPT // ARCHIVED</span>';
      html += '  <span>STATUS: RELAYED</span>';
      html += '</div>';

      html += '<div class="sheet-directive typewriter-ink">SPECIFICATION AUDIT // RECEIPT</div>';

      html += '<div style="font-size: 10px; line-height: 1.5; color: #0F172A; margin-top: 4px;" class="typewriter-ink">';
      html += '  <div><strong>OFFICER:</strong> ' + payload.client.name + '</div>';
      html += '  <div><strong>RELAY:</strong> ' + payload.client.email + '</div>';
      html += '  <div><strong>PHONE:</strong> ' + (payload.client.phone || 'N/A') + '</div>';
      html += '  <div style="margin-top: 6px; border-top: 1px dashed rgba(15,23,42,0.3); padding-top: 4px;">';
      html += '    <div><strong>[ SERVICE ]:</strong> ' + payload.specification.capability + '</div>';
      html += '    <div><strong>[ TIMELINE ]:</strong> ' + payload.specification.velocity + '</div>';
      html += '    <div><strong>[ BUDGET ]:</strong> ' + payload.specification.capital + '</div>';
      if (payload.client.teamMessage) {
        html += '    <div><strong>[ NOTES ]:</strong> ' + payload.client.teamMessage + '</div>';
      }
      html += '  </div>';
      html += '</div>';

      html += '<button id="newTransmissionBtn" class="dispatch-action-btn typewriter-ink" style="margin-top: 10px;">';
      html += '  [ NEW TRANSMISSION / RESET ]';
      html += '</button>';

      html += '<div class="sheet-footer-bar typewriter-ink" style="margin-top: 8px;">';
      html += '  <span>ROYAL TELETYPE</span>';
      html += '  <span>DISPATCH ID: ' + Math.random().toString(36).substring(2, 8).toUpperCase() + '</span>';
      html += '</div>';

      this.paperContent.innerHTML = html;

      const resetBtn = document.getElementById('newTransmissionBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.resetToStep1());
      }
    }

    showSummaryModal(payload) {
      if (!this.summaryModal) return;

      const ledgerRecords = document.getElementById('ledger-records');
      const ledgerTimestamp = document.getElementById('ledger-timestamp');

      if (ledgerTimestamp) {
        ledgerTimestamp.textContent = 'DATE: ' + new Date().toISOString().replace('T', ' // ').substring(0, 22) + ' UTC';
      }

      if (ledgerRecords) {
        let recHtml = '';
        recHtml += '<div class="ledger-row"><span class="ledger-key">SERVICE:</span><span class="ledger-val highlight">' + payload.specification.capability + '</span></div>';
        if (payload.specification.capabilityBrief) {
          recHtml += '<div class="ledger-row" style="margin-top:-3px;margin-bottom:6px;"><span class="ledger-key">BRIEF:</span><span class="ledger-val" style="font-size:9.5px;color:#57534E;font-style:italic;">' + payload.specification.capabilityBrief + '</span></div>';
        }
        recHtml += '<div class="ledger-row"><span class="ledger-key">TIMELINE:</span><span class="ledger-val highlight">' + payload.specification.velocity + '</span></div>';
        if (payload.specification.velocityBrief) {
          recHtml += '<div class="ledger-row" style="margin-top:-3px;margin-bottom:6px;"><span class="ledger-key">BRIEF:</span><span class="ledger-val" style="font-size:9.5px;color:#57534E;font-style:italic;">' + payload.specification.velocityBrief + '</span></div>';
        }
        recHtml += '<div class="ledger-row"><span class="ledger-key">BUDGET:</span><span class="ledger-val highlight">' + payload.specification.capital + '</span></div>';
        if (payload.specification.capitalBrief) {
          recHtml += '<div class="ledger-row" style="margin-top:-3px;margin-bottom:6px;"><span class="ledger-key">BRIEF:</span><span class="ledger-val" style="font-size:9.5px;color:#57534E;font-style:italic;">' + payload.specification.capitalBrief + '</span></div>';
        }
        recHtml += '<div class="ledger-row"><span class="ledger-key">CONTACT:</span><span class="ledger-val">' + payload.client.name + ' // ' + (payload.client.phone || 'NO PHONE') + ' // ' + payload.client.email + '</span></div>';
        if (payload.client.teamMessage) {
          recHtml += '<div class="ledger-row"><span class="ledger-key">NOTES:</span><span class="ledger-val">' + payload.client.teamMessage + '</span></div>';
        }
        ledgerRecords.innerHTML = recHtml;
      }

      this.summaryModal.classList.add('active');

      const copyBtn = document.getElementById('copy-summary-btn');
      const newBtn = document.getElementById('new-trans-btn');

      if (copyBtn) {
        copyBtn.onclick = () => {
          this.copySummaryToClipboard();
          copyBtn.textContent = 'COPIED TO CLIPBOARD';
          setTimeout(() => { copyBtn.textContent = 'COPY SUMMARY'; }, 2000);
        };
      }

      if (newBtn) {
        newBtn.onclick = () => {
          this.summaryModal.classList.remove('active');
          this.resetToStep1();
        };
      }
    }

    resetToStep1() {
      WIZARD_STATE.step = 1;
      WIZARD_STATE.capability = null;
      WIZARD_STATE.velocity = null;
      WIZARD_STATE.capital = null;
      WIZARD_STATE.clientName = '';
      WIZARD_STATE.clientEmail = '';
      WIZARD_STATE.clientPhone = '';
      WIZARD_STATE.clientNotes = '';
      WIZARD_STATE.teamMessage = '';

      this.selectedOption = null;
      this.focusedIndex = 0;
      this.paperScrollY = 0;

      this.sound.playPaperRollSound();
      if (this.typewriterPaper) {
        this.typewriterPaper.style.transform = '';
        this.typewriterPaper.classList.add('paper-ejecting');
      }

      setTimeout(() => {
        this.renderPaperStep(1);
        if (this.typewriterPaper) {
          this.typewriterPaper.classList.remove('paper-ejecting');
          this.typewriterPaper.classList.add('paper-loading-in');
          void this.typewriterPaper.offsetWidth;
          this.typewriterPaper.classList.remove('paper-loading-in');
          this.typewriterPaper.classList.add('paper-resting');
        }
        this.isRolling = false;
      }, 440);
    }

    copySummaryToClipboard() {
      let output = '=== ROYAL TELETYPE SPECIFICATION ===\n';
      output += 'TIMESTAMP: ' + new Date().toISOString() + '\n\n';
      output += '[ OFFICER ] ' + (WIZARD_STATE.clientName || 'UNKNOWN') + '\n';
      output += '[ EMAIL ] ' + (WIZARD_STATE.clientEmail || 'N/A') + '\n';
      output += '[ PHONE ] ' + (WIZARD_STATE.clientPhone || 'N/A') + '\n\n';
      output += '[ CAPABILITY ] ' + (WIZARD_STATE.capability || 'N/A') + '\n';
      output += '[ VELOCITY ] ' + (WIZARD_STATE.velocity || 'N/A') + '\n';
      output += '[ CAPITAL ] ' + (WIZARD_STATE.capital || 'N/A') + '\n';
      if (WIZARD_STATE.teamMessage) {
        output += '[ MESSAGE ] ' + WIZARD_STATE.teamMessage + '\n';
      }
      output += '====================================';

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(output).catch(() => {});
      }
    }
  }

  // Ensure AudioContext is unlocked & running on very first user gesture anywhere
  const unlockAudioGesture = () => {
    AudioEngine.init();
    if (AudioEngine.ctx && AudioEngine.ctx.state === 'suspended') {
      AudioEngine.ctx.resume().catch(() => {});
    }
  };
  ['pointerdown', 'mousedown', 'keydown', 'touchstart'].forEach((evt) => {
    window.addEventListener(evt, unlockAudioGesture, { passive: true });
  });

  // ==========================================================================
  // 8. BOOTSTRAP TELETYPE ON DOM READY
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    // Autoplay Background Video Resiliency across Safari, Chrome, and Mobile
    const bgVideo = document.getElementById('bg-video');
    if (bgVideo) {
      bgVideo.muted = true;
      bgVideo.defaultMuted = true;
      bgVideo.playsInline = true;

      const startVideoPlayback = () => {
        const p = bgVideo.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
      };

      if (bgVideo.readyState >= 2) {
        startVideoPlayback();
      } else {
        bgVideo.addEventListener('loadeddata', startVideoPlayback, { once: true });
        bgVideo.addEventListener('canplay', startVideoPlayback, { once: true });
        startVideoPlayback();
      }

      // Fallback: unlock on first gesture if browser power-saving or autoplay policy gated it
      const gestureUnlockVideo = () => {
        if (bgVideo.paused) {
          bgVideo.play().catch(() => {});
        }
      };
      ['pointerdown', 'mousedown', 'keydown', 'touchstart', 'click'].forEach((evt) => {
        window.addEventListener(evt, gestureUnlockVideo, { capture: true, passive: true });
      });
    }

    const engine = new TypewriterEngine();
    engine.init();
    window.teletypeEngine = engine;
  });

})();
