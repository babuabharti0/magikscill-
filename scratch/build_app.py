import os

with open('app.js', 'r') as f:
    orig = f.read()

split_marker = '  // ==========================================================================\n  // 2. FORM STEP CONFIGURATION'
part1 = orig.split(split_marker)[0]

part2 = '''  // ==========================================================================
  // 2. MASTER STATE & WIZARD CATEGORIES SCHEMA
  // ==========================================================================
  const WIZARD_STATE = {
    step: 1,
    data: {
      capability: 'fullstack',   // Step 1
      velocity: '14days',        // Step 2
      capital: '50k',            // Step 3
      brief: '',                 // Step 4
      client: {                  // Step 4 (Sign-off)
        name: '',
        email: '',
        phone: ''
      }
    }
  };

  const STEP_CONFIG = {
    // STEP 1: CAPABILITIES
    capabilities: {
      fullstack: {
        id: 'fullstack',
        label: 'Full-Stack Web & Mobile',
        subtitle: 'Next.js 15 Edge Monolith, React, Tailwind, Supabase/Node',
        tag: '7-14 Days',
        asset: 'assets/fullstack.webp',
        specTitle: 'Full-Stack Edge Architecture',
        specStamp: 'STACK: NEXT15_EDGE // LATENCY: 12ms',
        deliverables: [
          'Full-Stack Web & Mobile Interface',
          'Responsive Edge Hydration',
          'High-framerate Kinetic Animations',
          'Production DB & API Integration'
        ]
      },
      n8n: {
        id: 'n8n',
        label: 'Autonomous Ops & n8n',
        subtitle: 'Self-hosted cron matrix, business pipeline automation',
        tag: '3-5 Days',
        asset: 'assets/n8n.webp',
        specTitle: 'Autonomous Cron Matrix',
        specStamp: 'ENGINE: n8n_CORE // ZERO_FAILOVER',
        deliverables: [
          'Self-Hosted n8n Production Pipeline',
          'Zero-Failover Cron Architecture',
          'Multi-Service Webhook Catchers',
          'Automated Data Transformation'
        ]
      },
      leads: {
        id: 'leads',
        label: 'Omnichannel Lead Dispatch',
        subtitle: 'Instant WhatsApp API relay, email outreach & scraper actors',
        tag: '48 Hours',
        asset: 'assets/leads.webp',
        specTitle: 'Omnichannel Dispatch Relay',
        specStamp: 'BAND: WHATSAPP_API // SUB_120S',
        deliverables: [
          'Instant WhatsApp API Relay',
          'Lead Verification & Email Scrubbing',
          'Automated Google Sheets Sync',
          'Dynamic Owner Instant Notifications'
        ]
      },
      llm: {
        id: 'llm',
        label: 'Custom AI Agents & LLMs',
        subtitle: 'Geodesic Neural Polyhedron, RAG vector memory & tools',
        tag: 'Custom Tier',
        asset: 'assets/llm.webp',
        specTitle: 'Geodesic Neural Polyhedron',
        specStamp: 'MODEL: CLAUDE_RAG // VECTOR_LATTICE',
        deliverables: [
          'Autonomous LLM Qualification & Routing',
          'Contextual Lead Enrichment',
          'Vector Database RAG Memory',
          'Custom Tool & API Orchestration'
        ]
      }
    },

    // STEP 2: TIMELINE VELOCITY
    timeline: {
      '14days': {
        id: '14days',
        label: 'Immediate Sprint (< 14 Days)',
        tag: 'RAPID',
        asset: 'assets/14days.webp',
        specTitle: 'Rapid Sprint Engine',
        specStamp: 'VELOCITY: < 14 DAYS // EMERGENCY_SPRINT',
        summaryDisplay: 'Rapid (< 14d)'
      },
      'monthly': {
        id: 'monthly',
        label: 'Next Month Rollout',
        tag: 'PLANNED',
        asset: 'assets/monthly.webp',
        specTitle: 'Scheduled Milestone Matrix',
        specStamp: 'CADENCE: 30_DAY_ROLLOUT // STAGED_PROD',
        summaryDisplay: 'Planned (30d)'
      },
      'Q4': {
        id: 'Q4',
        label: 'Enterprise Architecture Q4',
        tag: 'STRATEGIC',
        asset: 'assets/Q4.webp',
        specTitle: 'Enterprise Foundation Pavilion',
        specStamp: 'SCALE: ENTERPRISE_Q4 // STRATEGIC_INFRA',
        summaryDisplay: 'Strategic Q4'
      }
    },

    // STEP 3: CAPITAL ALLOCATION
    capital: {
      '25k': {
        id: '25k',
        label: 'Lean Prototype (₹25k - ₹50k)',
        tag: 'PILOT',
        asset: 'assets/25k.webp',
        specTitle: 'Lean Prototype Energy Cell',
        specStamp: 'TIER: PILOT_₹25k-₹50k // CORE_MVP',
        summaryDisplay: '₹25k - ₹50k'
      },
      '50k': {
        id: '50k',
        label: 'Production Pipeline (₹50k - ₹1L)',
        tag: 'CORE',
        asset: 'assets/50k.webp',
        specTitle: 'Dual-Engine Production Turbine',
        specStamp: 'TIER: CORE_₹50k-₹1L // PRODUCTION',
        summaryDisplay: '₹50k - ₹1L'
      },
      '100k': {
        id: '100k',
        label: 'Full-Scale Enterprise (₹1L+)',
        tag: 'SCALE',
        asset: 'assets/100k.webp',
        specTitle: 'Architectural Obsidian Vault',
        specStamp: 'TIER: ENTERPRISE_₹1L+ // BESPOKE',
        summaryDisplay: '₹1L+ (Scale)'
      }
    },

    // STEP 4: BRIEF & HANDOVER
    handover: {
      asset: 'assets/handover.webp',
      specTitle: 'Technical Handover Ledger',
      specStamp: 'STATUS: DISPATCH_READY // 2HR_SLA'
    }
  };

  // Expose globally
  window.WIZARD_STATE = WIZARD_STATE;
  window.STEP_CONFIG = STEP_CONFIG;

  // Smooth slide-in/out transition for Left 3D Asset
  function swapLeftAsset(assetUrl, specTitle, specStamp) {
    const leftPanel = document.getElementById('leftSpecPanel');
    const assetImg = document.getElementById('specAsset');
    const titleEl = document.getElementById('specTitle');
    const stampEl = document.getElementById('specStamp');

    if (leftPanel) {
      leftPanel.classList.add('swapping');
      setTimeout(() => {
        if (assetImg) {
          assetImg.removeAttribute('data-fallback');
          assetImg.src = assetUrl;
          assetImg.alt = specTitle;
        }
        if (titleEl) titleEl.textContent = specTitle;
        if (stampEl) stampEl.textContent = specStamp;
        leftPanel.classList.remove('swapping');
      }, 160);
    }
  }
  window.swapLeftAsset = swapLeftAsset;

  // Shift symbol mapping for on-screen typing
  const SHIFT_MAP = {
    '2': '"',
    '3': '#',
    '4': '$',
    '5': '%',
    '6': '_',
    '7': '&',
    '8': "'",
    '9': '(',
    '0': ')',
    '-': '*',
    '=': '+',
    ',': '.',
    '/': '?',
    '1': '!',
    '.': '>',
    ';': ':',
    "'": '"',
    '[': '{',
    ']': '}'
  };

  // 4 curved rows + Spacebar layout for 3D mechanical keybed in hollow tray
  const KEYBOARD_LAYOUT = [
    // Row 1 (13 keys): "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "BKSP ←"
    [
      { code: 'Digit1', key: '1', sub: '!', main: '1', label: '1 !' },
      { code: 'Digit2', key: '2', sub: '"', main: '2', label: '2 "' },
      { code: 'Digit3', key: '3', sub: '#', main: '3', label: '3 #' },
      { code: 'Digit4', key: '4', sub: '$', main: '4', label: '4 $' },
      { code: 'Digit5', key: '5', sub: '%', main: '5', label: '5 %' },
      { code: 'Digit6', key: '6', sub: '_', main: '6', label: '6 _' },
      { code: 'Digit7', key: '7', sub: '&', main: '7', label: '7 &' },
      { code: 'Digit8', key: '8', sub: "'", main: '8', label: "8 '" },
      { code: 'Digit9', key: '9', sub: '(', main: '9', label: '9 (' },
      { code: 'Digit0', key: '0', sub: ')', main: '0', label: '0 )' },
      { code: 'Minus', key: '-', sub: '*', main: '-', label: '- *' },
      { code: 'Equal', key: '=', sub: '+', main: '=', label: '= +' },
      { code: 'Backspace', key: 'Backspace', label: 'BKSP', type: 'utility-oval', title: 'Backspace' }
    ],
    // Row 2 (11 keys): "TAB", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"
    [
      { code: 'Tab', key: 'Tab', label: 'TAB', type: 'utility-oval', title: 'Tab' },
      { code: 'KeyQ', key: 'q', label: 'Q' },
      { code: 'KeyW', key: 'w', label: 'W' },
      { code: 'KeyE', key: 'e', label: 'E' },
      { code: 'KeyR', key: 'r', label: 'R' },
      { code: 'KeyT', key: 't', label: 'T' },
      { code: 'KeyY', key: 'y', label: 'Y' },
      { code: 'KeyU', key: 'u', label: 'U' },
      { code: 'KeyI', key: 'i', label: 'I' },
      { code: 'KeyO', key: 'o', label: 'O' },
      { code: 'KeyP', key: 'p', label: 'P' }
    ],
    // Row 3 (12 keys): "LOCK", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "RET ↵"
    [
      { code: 'CapsLock', key: 'CapsLock', label: 'LOCK', type: 'utility-oval', title: 'Shift Lock' },
      { code: 'KeyA', key: 'a', label: 'A' },
      { code: 'KeyS', key: 's', label: 'S' },
      { code: 'KeyD', key: 'd', label: 'D' },
      { code: 'KeyF', key: 'f', label: 'F' },
      { code: 'KeyG', key: 'g', label: 'G' },
      { code: 'KeyH', key: 'h', label: 'H' },
      { code: 'KeyJ', key: 'j', label: 'J' },
      { code: 'KeyK', key: 'k', label: 'K' },
      { code: 'KeyL', key: 'l', label: 'L' },
      { code: 'Semicolon', key: ';', sub: ':', main: ';', label: '; :' },
      { code: 'Enter', key: 'Enter', label: 'RET ↵', type: 'utility-oval', title: 'Return' }
    ],
    // Row 4 (12 keys): "SHIFT", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "?", "SHIFT"
    [
      { code: 'ShiftLeft', key: 'Shift', label: 'SHIFT', type: 'utility-shift', title: 'Left Shift' },
      { code: 'KeyZ', key: 'z', label: 'Z' },
      { code: 'KeyX', key: 'x', label: 'X' },
      { code: 'KeyC', key: 'c', label: 'C' },
      { code: 'KeyV', key: 'v', label: 'V' },
      { code: 'KeyB', key: 'b', label: 'B' },
      { code: 'KeyN', key: 'n', label: 'N' },
      { code: 'KeyM', key: 'm', label: 'M' },
      { code: 'Comma', key: ',', label: ',', shiftKey: '<', title: 'Comma' },
      { code: 'Period', key: '.', sub: '>', main: '.', label: '. >', shiftKey: '>', title: 'Period' },
      { code: 'Slash', key: '/', label: '?', shiftKey: '?', title: 'Question' },
      { code: 'ShiftRight', key: 'Shift', label: 'SHIFT', type: 'utility-shift', title: 'Right Shift' }
    ],
    // Space Row (1 key): Single centered horizontal spacebar
    [
      { code: 'Space', key: ' ', label: '', type: 'spacebar', title: 'Space' }
    ]
  ];

  // ==========================================================================
  // 3. APPLICATION CONTROLLER
  // ==========================================================================
  class TypewriterApp {
    constructor() {
      this.sound = AudioEngine;
      this.isTransitioning = false;
      this.engaged = false;

      // Keybed and modifier state
      this.shiftActive = false;
      this.capsLockActive = false;
      this.pressedKeyCaps = new Set();
      this.activeHeldPointers = new Set();
      this.activeHeldKeys = new Set();

      // DOM Elements
      this.appContainer = document.getElementById('app-container');
      this.ambientBanner = document.getElementById('ambient-banner');
      this.hiddenInput = document.getElementById('hidden-input');
      this.paperSheet = document.getElementById('paper-sheet');
      this.paperBadge = document.getElementById('paper-badge');
      this.paperTitle = document.getElementById('paper-title');
      this.paperDesc = document.getElementById('paper-desc');
      this.advanceBtn = document.getElementById('advance-btn');
      this.prevBtn = document.getElementById('prev-btn');
      this.carriageLever = document.getElementById('carriage-lever');
      this.muteBtn = document.getElementById('soundToggle') || document.getElementById('mute-btn');
      this.summaryModal = document.getElementById('summary-modal');
      this.newTransBtn = document.getElementById('new-trans-btn');
      this.copySummaryBtn = document.getElementById('copy-summary-btn');
      this.dispatchBtn = document.getElementById('dispatchBtn');
      this.optionsContainer = document.getElementById('paper-options-container');
      this.briefContainer = document.getElementById('paper-brief-container');
      this.briefMessage = document.getElementById('briefMessage');

      // Keycap map for fast lookup & 3D Keybed generation
      this.keyCapMap = new Map();
      this.renderDynamicKeybed();

      this.bindEvents();
      this.renderCurrentStep(false);
    }

    // Dynamic 3D Mechanical Keybed Generation inside Hollow Well
    renderDynamicKeybed() {
      const container = document.getElementById('keyboard-deck') || document.getElementById('keyboard-hitbox-bed');
      if (!container) return;

      container.innerHTML = '';
      this.keyCapMap.clear();

      KEYBOARD_LAYOUT.forEach((rowKeys, rowIndex) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'key-row row-' + (rowIndex + 1);
        if (rowIndex === 4) {
          rowEl.classList.add('space-row');
        }

        rowKeys.forEach((k) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          let cls = 'keycap type-key key-cap typewriter-key';
          if (k.type === 'utility-oval') cls += ' key-utility-oval';
          else if (k.type === 'utility-shift') cls += ' key-utility-shift';
          else if (k.type === 'spacebar' || k.space) {
            cls += ' key-spacebar space-bar';
            btn.id = 'spacebar';
          }
          btn.className = cls;

          btn.setAttribute('data-code', k.code);
          btn.setAttribute('data-key', k.key);
          const title = k.title || k.label || k.key;
          btn.setAttribute('title', title);
          btn.setAttribute('aria-label', title);

          if (k.sub && k.main) {
            btn.innerHTML = `<span class="key-dual"><span class="key-sub shift-char">${k.sub}</span><span class="key-main main-char">${k.main}</span></span>`;
          } else if (k.type === 'utility-oval' || k.type === 'utility-shift') {
            btn.innerHTML = `<span class="key-modifier">${k.label}</span>`;
          } else {
            btn.innerHTML = `<span class="key-single main-char">${k.label !== undefined ? k.label : (k.key ? k.key.toUpperCase() : '')}</span>`;
          }

          // Fast indexing by lowercased code and key
          this.keyCapMap.set(k.code.toLowerCase(), btn);
          if (k.key && !this.keyCapMap.has(k.key.toLowerCase())) {
            this.keyCapMap.set(k.key.toLowerCase(), btn);
          }

          // Bind tactile pointer events
          this.bindKeyPointerEvents(btn);

          rowEl.appendChild(btn);
        });

        container.appendChild(rowEl);
      });
    }

    // Pointer events for on-screen mouse and touch interaction
    bindKeyPointerEvents(btn) {
      const handlePress = (e) => {
        e.preventDefault();
        if (this.activeHeldPointers.has(btn)) return;
        this.activeHeldPointers.add(btn);

        this.engageMechanicalTerminal();
        btn.classList.add('is-pressed', 'plunged', 'depressed');

        const isSpace = btn.id === 'spacebar' || btn.classList.contains('key-spacebar') || btn.classList.contains('space-bar');
        const keyVal = isSpace ? 'SPACE' : (btn.getAttribute('data-key') || btn.getAttribute('data-code') || 'A');
        const code = btn.getAttribute('data-code') || '';

        // AudioEngine physical mechanical synthesis
        AudioEngine.playKeySound(keyVal);

        this.triggerKeyPress(keyVal, code, btn);
      };

      btn.addEventListener('pointerdown', handlePress);
      btn.addEventListener('mousedown', (e) => {
        if (!this.activeHeldPointers.has(btn)) {
          handlePress(e);
        }
      });

      const releaseKey = (e) => {
        if (e && e.cancelable && e.type !== 'pointerleave') e.preventDefault();
        if (this.activeHeldPointers.has(btn)) {
          this.activeHeldPointers.delete(btn);
          btn.classList.remove('is-pressed', 'plunged', 'depressed');
        }
      };

      btn.addEventListener('pointerup', releaseKey);
      btn.addEventListener('mouseup', releaseKey);
      btn.addEventListener('pointerleave', releaseKey);
      btn.addEventListener('pointercancel', releaseKey);
      btn.addEventListener('touchend', releaseKey);
      btn.addEventListener('touchcancel', releaseKey);
    }

    engageMechanicalTerminal() {
      if (this.engaged) return;
      this.engaged = true;
      this.sound.init();
      if (this.ambientBanner) {
        this.ambientBanner.classList.add('fade-out');
      }
      this.focusHiddenInput();
    }

    focusHiddenInput() {
      if (WIZARD_STATE.step === 4 && this.briefMessage && document.activeElement === this.briefMessage) {
        return;
      }
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }
      if (this.hiddenInput && document.activeElement !== this.hiddenInput) {
        this.hiddenInput.focus({ preventScroll: true });
      }
    }

    bindEvents() {
      // 1. First interaction engagement
      const engageHandler = () => {
        this.engageMechanicalTerminal();
      };
      window.addEventListener('click', engageHandler, { once: true });
      window.addEventListener('keydown', engageHandler, { once: true });
      window.addEventListener('touchstart', engageHandler, { once: true });

      // 2. Canvas click refocuses hidden input
      if (this.appContainer) {
        this.appContainer.addEventListener('click', (e) => {
          if (e.target.closest('.summary-telegram') || e.target.closest('.client-signoff-section') || e.target.closest('#paper-brief-container')) return;
          this.focusHiddenInput();
        });
      }

      // 3. Global Keyboard events (Zero layout reflow during typing)
      window.addEventListener('keydown', (e) => {
        this.handleKeyDown(e);
      });

      window.addEventListener('keyup', (e) => {
        this.handleKeyUp(e);
      });

      // Clear any stuck depressed keys if window loses focus
      window.addEventListener('blur', () => {
        this.pressedKeyCaps.forEach((k) => k.classList.remove('is-pressed', 'depressed', 'plunged'));
        this.pressedKeyCaps.clear();
        this.activeHeldKeys.clear();
        this.activeHeldPointers.clear();
      });

      // 4. Advance & Prev buttons
      if (this.advanceBtn) {
        this.advanceBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.engageMechanicalTerminal();
          if (WIZARD_STATE.step === 4) {
            this.dispatchSpecification();
          } else {
            this.attemptStepAdvance();
          }
        });
      }

      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.stepBack();
        });
      }

      // 5. Physical Carriage Return Lever
      if (this.carriageLever) {
        this.carriageLever.addEventListener('click', () => {
          this.engageMechanicalTerminal();
          if (WIZARD_STATE.step === 4) {
            this.dispatchSpecification();
          } else {
            this.attemptStepAdvance();
          }
        });
      }

      // 6. Dispatch Button (Step 4 Right Dossier)
      if (this.dispatchBtn) {
        this.dispatchBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.dispatchSpecification();
        });
      }

      // 7. Sound Toggle Button
      if (this.muteBtn) {
        this.muteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          AudioEngine.init();
          const enabled = AudioEngine.toggleSound();
          this.muteBtn.classList.toggle('muted', !enabled);
          const textSpan = this.muteBtn.querySelector('.hud-text');
          if (textSpan) {
            textSpan.textContent = enabled ? 'SOUND: ON' : 'SOUND: OFF';
          }
        });
      }

      // 8. Modal reset & copy actions
      if (this.newTransBtn) {
        this.newTransBtn.addEventListener('click', () => {
          this.resetTransmission();
        });
      }

      if (this.copySummaryBtn) {
        this.copySummaryBtn.addEventListener('click', () => {
          this.copySummaryToClipboard();
        });
      }

      // 9. Sync brief textarea changes
      if (this.briefMessage) {
        this.briefMessage.addEventListener('input', () => {
          WIZARD_STATE.data.brief = this.briefMessage.value;
        });
      }
    }

    // Locate DOM keycap element
    findKeyCap(key, code) {
      if (code) {
        const lowerCode = code.toLowerCase();
        if (this.keyCapMap.has(lowerCode)) {
          return this.keyCapMap.get(lowerCode);
        }
        const domEl = document.querySelector(`.type-key[data-code="${code}"], .typewriter-key[data-code="${code}"]`);
        if (domEl) return domEl;
      }
      if (key) {
        const lowerKey = key.toLowerCase();
        if (this.keyCapMap.has(lowerKey)) {
          return this.keyCapMap.get(lowerKey);
        }
        const domEl = document.querySelector(`.type-key[data-key="${key}"], .typewriter-key[data-key="${key}"]`);
        if (domEl) return domEl;
      }
      for (const [baseKey, shiftedKey] of Object.entries(SHIFT_MAP)) {
        if (key === shiftedKey && this.keyCapMap.has(baseKey.toLowerCase())) {
          return this.keyCapMap.get(baseKey.toLowerCase());
        }
      }
      return null;
    }

    handleKeyDown(e) {
      // 1. Ignore browser-generated auto-repeat events
      if (e.repeat) return;

      const keyVal = e.key;

      // 2. If key is already registered as held, block any further action
      if (this.activeHeldKeys.has(keyVal) || (e.code && this.activeHeldKeys.has(e.code))) {
        return;
      }
      this.activeHeldKeys.add(keyVal);
      if (e.code) this.activeHeldKeys.add(e.code);

      if (this.isTransitioning) return;
      if (this.summaryModal && this.summaryModal.classList.contains('active')) return;

      this.engageMechanicalTerminal();

      // Mechanical audio clack
      AudioEngine.playKeySound(e.key);

      // Find .keycap matching data-code or key & apply physical plunge
      const keyCap = this.findKeyCap(e.key, e.code);
      if (keyCap) {
        keyCap.classList.add('is-pressed', 'plunged', 'depressed');
        this.pressedKeyCaps.add(keyCap);
      }

      // Check if user is typing in a form field directly on step 4
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || (activeEl.tagName === 'TEXTAREA' && activeEl.id !== 'briefMessage'));

      // In Steps 1-3: Number keys 1-4 immediately select corresponding category option
      if (!isInputFocused && WIZARD_STATE.step < 4) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          e.preventDefault();
          this.selectOptionByIndex(parseInt(e.key, 10));
          return;
        }
      }

      // Process Enter / Backspace / Navigation
      if (e.key === 'Enter') {
        if (!isInputFocused) {
          e.preventDefault();
          if (WIZARD_STATE.step === 4) {
            this.dispatchSpecification();
          } else {
            this.attemptStepAdvance();
          }
        }
      } else if (e.key === 'Backspace') {
        if (!isInputFocused) {
          if (WIZARD_STATE.step === 4 && this.briefMessage) {
            // Typing in brief
          } else if (WIZARD_STATE.step > 1) {
            e.preventDefault();
            this.stepBack();
          }
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // In Step 4, append to briefMessage if not already focused in another input
        if (WIZARD_STATE.step === 4 && !isInputFocused) {
          if (this.briefMessage && document.activeElement !== this.briefMessage) {
            e.preventDefault();
            this.briefMessage.value += e.key;
            WIZARD_STATE.data.brief = this.briefMessage.value;
          }
        }
      }
    }

    handleKeyUp(e) {
      this.activeHeldKeys.delete(e.key);
      if (e.code) this.activeHeldKeys.delete(e.code);

      const keyCap = this.findKeyCap(e.key, e.code);
      if (keyCap) {
        keyCap.classList.remove('is-pressed', 'plunged', 'depressed');
        this.pressedKeyCaps.delete(keyCap);
      }
      if (e.key === 'Shift') {
        this.shiftActive = false;
        const shiftKeys = document.querySelectorAll('[data-key="Shift"]');
        shiftKeys.forEach((s) => s.classList.remove('active-lock'));
      }
    }

    triggerKeyPress(key, code, keyEl) {
      if (this.isTransitioning) return;
      if (this.summaryModal && this.summaryModal.classList.contains('active')) return;

      if (code === 'Enter') {
        if (WIZARD_STATE.step === 4) {
          this.dispatchSpecification();
        } else {
          this.attemptStepAdvance();
        }
        return;
      }

      if (code === 'Backspace') {
        if (WIZARD_STATE.step === 4 && this.briefMessage) {
          this.briefMessage.value = this.briefMessage.value.slice(0, -1);
          WIZARD_STATE.data.brief = this.briefMessage.value;
        } else if (WIZARD_STATE.step > 1) {
          this.stepBack();
        }
        return;
      }

      // Check number keys
      if (WIZARD_STATE.step < 4 && ['1', '2', '3', '4'].includes(key)) {
        this.selectOptionByIndex(parseInt(key, 10));
        return;
      }

      // In step 4, type characters into briefMessage
      if (WIZARD_STATE.step === 4 && key && key.length === 1) {
        if (this.briefMessage) {
          this.briefMessage.value += key;
          WIZARD_STATE.data.brief = this.briefMessage.value;
        }
      }
    }

    selectOptionByIndex(index) {
      const step = WIZARD_STATE.step;
      let keys = [];
      let categoryKey = '';

      if (step === 1) {
        keys = Object.keys(STEP_CONFIG.capabilities);
        categoryKey = 'capability';
      } else if (step === 2) {
        keys = Object.keys(STEP_CONFIG.timeline);
        categoryKey = 'velocity';
      } else if (step === 3) {
        keys = Object.keys(STEP_CONFIG.capital);
        categoryKey = 'capital';
      }

      if (index >= 1 && index <= keys.length) {
        const selectedId = keys[index - 1];
        this.selectOption(categoryKey, selectedId);
      }
    }

    selectOption(categoryKey, optionId) {
      if (this.isTransitioning) return;

      if (WIZARD_STATE.step === 1) {
        WIZARD_STATE.data.capability = optionId;
        const cap = STEP_CONFIG.capabilities[optionId];
        if (cap) {
          swapLeftAsset(cap.asset, cap.specTitle, cap.specStamp);
        }
      } else if (WIZARD_STATE.step === 2) {
        WIZARD_STATE.data.velocity = optionId;
        const vel = STEP_CONFIG.timeline[optionId];
        if (vel) {
          swapLeftAsset(vel.asset, vel.specTitle, vel.specStamp);
        }
      } else if (WIZARD_STATE.step === 3) {
        WIZARD_STATE.data.capital = optionId;
        const cap = STEP_CONFIG.capital[optionId];
        if (cap) {
          swapLeftAsset(cap.asset, cap.specTitle, cap.specStamp);
        }
      }

      // Update UI highlighter and right dossier live
      this.refreshOptionsListSelection(optionId);
      this.syncRightDossier();
    }

    refreshOptionsListSelection(activeId) {
      const container = document.getElementById('paper-options-container');
      if (!container) return;
      const items = container.querySelectorAll('.option-item');
      items.forEach((item) => {
        const itemKey = item.getAttribute('data-key');
        const checkSpan = item.querySelector('.option-check');
        if (itemKey === activeId) {
          item.classList.add('bg-amber-100/90', 'active-selection');
          if (checkSpan) checkSpan.textContent = '[✓]';
        } else {
          item.classList.remove('bg-amber-100/90', 'active-selection');
          if (checkSpan) checkSpan.textContent = '[ ]';
        }
      });
    }

    renderOptionsList(configGroup, activeId, categoryKey) {
      const container = document.getElementById('paper-options-container');
      if (!container) return;
      container.innerHTML = '';

      const entries = Object.entries(configGroup);
      entries.forEach(([key, opt], idx) => {
        const isSelected = key === activeId;
        const el = document.createElement('div');
        el.className = `option-item ${isSelected ? 'bg-amber-100/90 active-selection' : ''}`;
        el.setAttribute('data-key', key);
        el.setAttribute('data-index', idx + 1);

        el.innerHTML = `
          <span class="option-check">${isSelected ? '[✓]' : '[ ]'}</span>
          <div class="option-content">
            <div class="option-header">
              <span class="option-label"><span style="color:#a82329;margin-right:4px;">${idx + 1}.</span>${opt.label}</span>
              ${opt.tag ? `<span class="option-tag">${opt.tag}</span>` : ''}
            </div>
            ${opt.subtitle ? `<div class="option-subtitle">${opt.subtitle}</div>` : ''}
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectOption(categoryKey, key);
        });

        container.appendChild(el);
      });
    }

    syncRightDossier() {
      const capId = WIZARD_STATE.data.capability;
      const cap = STEP_CONFIG.capabilities[capId] || STEP_CONFIG.capabilities.fullstack;

      const velId = WIZARD_STATE.data.velocity;
      const vel = STEP_CONFIG.timeline[velId] || STEP_CONFIG.timeline['14days'];

      const capTierId = WIZARD_STATE.data.capital;
      const capital = STEP_CONFIG.capital[capTierId] || STEP_CONFIG.capital['50k'];

      // Capability title & SLA badge
      const capTitleEl = document.getElementById('dossierCapabilityTitle');
      if (capTitleEl) capTitleEl.textContent = cap.label;

      const slaEl = document.getElementById('dossierSlaBadge');
      if (slaEl) slaEl.textContent = cap.tag.toUpperCase();

      // 4 Deliverables
      const deliverablesEl = document.getElementById('dossierDeliverables');
      if (deliverablesEl && cap.deliverables) {
        deliverablesEl.innerHTML = cap.deliverables.map(d => `<li>${d}</li>`).join('');
      }

      // Summary Timeline & Capital
      const timeEl = document.getElementById('summaryTimeline');
      if (timeEl) timeEl.textContent = vel.summaryDisplay;

      const tierEl = document.getElementById('summaryTier');
      if (tierEl) tierEl.textContent = capital.summaryDisplay;

      // In Step 4, highlight client sign-off section
      const clientSec = document.getElementById('clientInputSection');
      if (clientSec) {
        if (WIZARD_STATE.step === 4) {
          clientSec.style.opacity = '1';
          clientSec.style.pointerEvents = 'auto';
        } else {
          clientSec.style.opacity = '0.7';
        }
      }
    }

    renderCurrentStep(animateIn = true) {
      const stepNum = WIZARD_STATE.step;
      const badgeEl = document.getElementById('paper-badge');
      const titleEl = document.getElementById('paper-title');
      const descEl = document.getElementById('paper-desc');
      const optionsContainer = document.getElementById('paper-options-container');
      const briefContainer = document.getElementById('paper-brief-container');
      const prevBtn = document.getElementById('prev-btn');
      const advanceBtn = document.getElementById('advance-btn');
      const hintEl = document.getElementById('paper-footer-hint');

      if (badgeEl) badgeEl.textContent = `[ STEP 0${stepNum} / 04 ]`;
      if (prevBtn) prevBtn.style.display = stepNum > 1 ? 'inline-block' : 'none';

      if (stepNum === 1) {
        if (titleEl) titleEl.textContent = 'PRIMARY SYSTEM CAPABILITY';
        if (descEl) descEl.textContent = 'Select core architectural deliverable. Type (1-4) or click option:';
        if (optionsContainer) optionsContainer.style.display = 'flex';
        if (briefContainer) briefContainer.style.display = 'none';
        if (advanceBtn) advanceBtn.textContent = 'CONTINUE ↵';
        if (hintEl) hintEl.textContent = '[SELECT OPTION (1-4) OR PRESS ↵ ENTER]';

        this.renderOptionsList(STEP_CONFIG.capabilities, WIZARD_STATE.data.capability, 'capability');
        const active = STEP_CONFIG.capabilities[WIZARD_STATE.data.capability];
        if (active) swapLeftAsset(active.asset, active.specTitle, active.specStamp);

      } else if (stepNum === 2) {
        if (titleEl) titleEl.textContent = 'TIMELINE VELOCITY & CADENCE';
        if (descEl) descEl.textContent = 'Specify timeline speed & deployment window. Type (1-3) or click option:';
        if (optionsContainer) optionsContainer.style.display = 'flex';
        if (briefContainer) briefContainer.style.display = 'none';
        if (advanceBtn) advanceBtn.textContent = 'CONTINUE ↵';
        if (hintEl) hintEl.textContent = '[SELECT OPTION (1-3) OR PRESS ↵ ENTER]';

        this.renderOptionsList(STEP_CONFIG.timeline, WIZARD_STATE.data.velocity, 'velocity');
        const active = STEP_CONFIG.timeline[WIZARD_STATE.data.velocity];
        if (active) swapLeftAsset(active.asset, active.specTitle, active.specStamp);

      } else if (stepNum === 3) {
        if (titleEl) titleEl.textContent = 'CAPITAL ALLOCATION';
        if (descEl) descEl.textContent = 'Select target investment tier & production scope. Type (1-3) or click option:';
        if (optionsContainer) optionsContainer.style.display = 'flex';
        if (briefContainer) briefContainer.style.display = 'none';
        if (advanceBtn) advanceBtn.textContent = 'CONTINUE ↵';
        if (hintEl) hintEl.textContent = '[SELECT OPTION (1-3) OR PRESS ↵ ENTER]';

        this.renderOptionsList(STEP_CONFIG.capital, WIZARD_STATE.data.capital, 'capital');
        const active = STEP_CONFIG.capital[WIZARD_STATE.data.capital];
        if (active) swapLeftAsset(active.asset, active.specTitle, active.specStamp);

      } else if (stepNum === 4) {
        if (titleEl) titleEl.textContent = 'OPERATIONAL BRIEF & SIGN-OFF';
        if (descEl) descEl.textContent = 'Review dossier summary on right. Type technical notes below:';
        if (optionsContainer) optionsContainer.style.display = 'none';
        if (briefContainer) briefContainer.style.display = 'flex';
        if (advanceBtn) advanceBtn.textContent = 'DISPATCH SPECIFICATION →';
        if (hintEl) hintEl.textContent = '[SIGN OFF ON RIGHT & DISPATCH →]';

        swapLeftAsset(STEP_CONFIG.handover.asset, STEP_CONFIG.handover.specTitle, STEP_CONFIG.handover.specStamp);

        if (this.briefMessage) {
          this.briefMessage.value = WIZARD_STATE.data.brief || '';
        }
      }

      this.syncRightDossier();

      if (animateIn && this.paperSheet) {
        this.paperSheet.classList.remove('ejecting');
        this.paperSheet.classList.add('loading-roll');
        setTimeout(() => {
          this.paperSheet.classList.remove('loading-roll');
          this.isTransitioning = false;
        }, 340);
      } else {
        this.isTransitioning = false;
      }
    }

    attemptStepAdvance() {
      if (this.isTransitioning) return;

      if (WIZARD_STATE.step >= 4) {
        this.dispatchSpecification();
        return;
      }

      this.isTransitioning = true;
      this.sound.playBell();
      this.sound.playPaperFeed();

      // Paper swap physics
      if (this.paperSheet) {
        this.paperSheet.classList.add('ejecting');
        setTimeout(() => {
          WIZARD_STATE.step++;
          this.sound.playPaperFeed();
          this.renderCurrentStep(true);
        }, 420);
      } else {
        WIZARD_STATE.step++;
        this.renderCurrentStep(false);
      }
    }

    stepBack() {
      if (this.isTransitioning || WIZARD_STATE.step <= 1) return;

      this.isTransitioning = true;
      this.sound.playPaperFeed();

      if (this.paperSheet) {
        this.paperSheet.classList.add('ejecting');
        setTimeout(() => {
          WIZARD_STATE.step--;
          this.sound.playPaperFeed();
          this.renderCurrentStep(true);
        }, 420);
      } else {
        WIZARD_STATE.step--;
        this.renderCurrentStep(false);
      }
    }

    async dispatchSpecification() {
      if (this.isTransitioning) return;

      const nameInput = document.getElementById('clientName');
      const emailInput = document.getElementById('clientEmail');
      const phoneInput = document.getElementById('clientPhone');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const brief = this.briefMessage ? this.briefMessage.value.trim() : (WIZARD_STATE.data.brief || '');

      WIZARD_STATE.data.brief = brief;
      WIZARD_STATE.data.client = { name, email, phone };

      // Validate inputs
      let hasError = false;
      [nameInput, emailInput, phoneInput].forEach((inp) => {
        if (inp) {
          inp.classList.remove('field-error');
          if (!inp.value.trim()) {
            inp.classList.add('field-error');
            hasError = true;
          }
        }
      });

      if (hasError) {
        AudioEngine.playJam();
        const rightPanel = document.getElementById('rightDossierPanel');
        if (rightPanel) {
          rightPanel.classList.add('shake');
          setTimeout(() => rightPanel.classList.remove('shake'), 400);
        }
        return;
      }

      const dispatchBtn = document.getElementById('dispatchBtn');
      const advanceBtn = document.getElementById('advance-btn');

      if (dispatchBtn) {
        dispatchBtn.classList.add('is-loading');
        const textSpan = dispatchBtn.querySelector('.dispatch-btn-text');
        if (textSpan) textSpan.textContent = 'DISPATCHING TO n8n MATRIX...';
      }
      if (advanceBtn) {
        advanceBtn.textContent = 'TRANSMITTING...';
      }

      // Assemble final specification payload
      const payload = {
        timestamp: new Date().toISOString(),
        source: 'typewriter_corkboard_v1',
        lead: {
          name: name,
          email: email,
          phone: phone
        },
        specification: {
          capabilityId: WIZARD_STATE.data.capability,
          capabilityTitle: STEP_CONFIG.capabilities[WIZARD_STATE.data.capability]?.label || '',
          velocityId: WIZARD_STATE.data.velocity,
          velocityTitle: STEP_CONFIG.timeline[WIZARD_STATE.data.velocity]?.label || '',
          capitalId: WIZARD_STATE.data.capital,
          capitalTitle: STEP_CONFIG.capital[WIZARD_STATE.data.capital]?.label || '',
          briefMessage: brief
        }
      };

      const webhookUrl = window.N8N_WEBHOOK_URL || 'https://primary-production-459f.up.railway.app/webhook/typewriter-lead';

      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('n8n webhook dispatch notification (offline/mock):', err);
      }

      AudioEngine.playBell();
      AudioEngine.playPaperFeed();

      if (dispatchBtn) {
        dispatchBtn.classList.remove('is-loading');
        const textSpan = dispatchBtn.querySelector('.dispatch-btn-text');
        if (textSpan) textSpan.textContent = 'SPECIFICATION DISPATCHED ✓';
      }
      if (advanceBtn) {
        advanceBtn.textContent = 'DISPATCHED ✓';
      }

      this.showSummaryModal(payload);
    }

    showSummaryModal(payload) {
      const recordsEl = document.getElementById('ledger-records');
      if (recordsEl) {
        recordsEl.innerHTML = `
          <div class="ledger-item">
            <div class="ledger-label">AUTHORIZING OFFICER:</div>
            <div class="ledger-value">${payload.lead.name} // ${payload.lead.email} // ${payload.lead.phone}</div>
          </div>
          <div class="ledger-item">
            <div class="ledger-label">SELECTED CAPABILITY:</div>
            <div class="ledger-value">${payload.specification.capabilityTitle} (${payload.specification.capabilityId})</div>
          </div>
          <div class="ledger-item">
            <div class="ledger-label">VELOCITY CADENCE:</div>
            <div class="ledger-value">${payload.specification.velocityTitle} (${payload.specification.velocityId})</div>
          </div>
          <div class="ledger-item">
            <div class="ledger-label">CAPITAL ALLOCATION:</div>
            <div class="ledger-value">${payload.specification.capitalTitle} (${payload.specification.capitalId})</div>
          </div>
          <div class="ledger-item">
            <div class="ledger-label">OPERATIONAL BRIEF:</div>
            <div class="ledger-value">${payload.specification.briefMessage || '(NO ADDITIONAL BRIEF PROVIDED)'}</div>
          </div>
          <div class="ledger-item" style="border-left-color:#39ff14;">
            <div class="ledger-label" style="color:#39ff14;">n8n RELAY STATUS:</div>
            <div class="ledger-value">DISPATCHED &amp; QUEUED // WEBHOOK ACKNOWLEDGED</div>
          </div>
        `;
      }

      const dateEl = document.getElementById('ledger-timestamp');
      if (dateEl) {
        dateEl.textContent = `DATE: 1954-10-14 // ${payload.timestamp.replace('T', ' // ').slice(0, 22)} UTC`;
      }

      if (this.summaryModal) {
        this.summaryModal.classList.add('active');
      }
    }

    resetTransmission() {
      if (this.summaryModal) {
        this.summaryModal.classList.remove('active');
      }

      WIZARD_STATE.step = 1;
      WIZARD_STATE.data.brief = '';
      if (this.briefMessage) this.briefMessage.value = '';

      const nameInp = document.getElementById('clientName');
      const emailInp = document.getElementById('clientEmail');
      const phoneInp = document.getElementById('clientPhone');
      if (nameInp) nameInp.value = '';
      if (emailInp) emailInp.value = '';
      if (phoneInp) phoneInp.value = '';

      const dispatchBtn = document.getElementById('dispatchBtn');
      if (dispatchBtn) {
        const textSpan = dispatchBtn.querySelector('.dispatch-btn-text');
        if (textSpan) textSpan.textContent = 'DISPATCH SPECIFICATION →';
      }

      this.sound.playPaperFeed();
      this.renderCurrentStep(true);
      this.focusHiddenInput();
    }

    copySummaryToClipboard() {
      if (!this.copySummaryBtn) return;
      let output = `========================================\n`;
      output += `ROYAL VINTAGE TELETYPE DISPATCH RECORD\n`;
      output += `REF: #849-B // TIMESTAMP: ${new Date().toISOString()}\n`;
      output += `========================================\n\n`;

      output += `[ OFFICER ] ${WIZARD_STATE.data.client.name || 'UNKNOWN'}\n`;
      output += `[ EMAIL ] ${WIZARD_STATE.data.client.email || 'N/A'}\n`;
      output += `[ PHONE ] ${WIZARD_STATE.data.client.phone || 'N/A'}\n\n`;

      output += `[ CAPABILITY ] ${STEP_CONFIG.capabilities[WIZARD_STATE.data.capability]?.label}\n`;
      output += `[ VELOCITY ] ${STEP_CONFIG.timeline[WIZARD_STATE.data.velocity]?.label}\n`;
      output += `[ CAPITAL ] ${STEP_CONFIG.capital[WIZARD_STATE.data.capital]?.label}\n\n`;
      output += `[ BRIEF ]\n${WIZARD_STATE.data.brief || 'NO BRIEF'}\n`;

      navigator.clipboard.writeText(output).then(() => {
        const originalText = this.copySummaryBtn.textContent;
        this.copySummaryBtn.textContent = 'COPIED TO CLIPBOARD!';
        setTimeout(() => {
          this.copySummaryBtn.textContent = originalText;
        }, 2000);
      }).catch(() => {
        alert('Failed to copy to clipboard.');
      });
    }
  }

  // ==========================================================================
  // BOOTSTRAP INITIALIZATION & GUARANTEED AUDIO UNLOCK
  // ==========================================================================
  const unlockAudioHandler = () => {
    MechAudio.init();
    MechAudio.unlock();
    window.removeEventListener('pointerdown', unlockAudioHandler);
    window.removeEventListener('keydown', unlockAudioHandler);
    window.removeEventListener('touchstart', unlockAudioHandler);
    window.removeEventListener('mousedown', unlockAudioHandler);
  };
  window.addEventListener('pointerdown', unlockAudioHandler, { once: true });
  window.addEventListener('keydown', unlockAudioHandler, { once: true });
  window.addEventListener('touchstart', unlockAudioHandler, { once: true });
  window.addEventListener('mousedown', unlockAudioHandler, { once: true });

  // Handle browser tab backgrounding and foregrounding state restoration
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && MechAudio.ctx && MechAudio.ctx.state === 'suspended') {
      MechAudio.ctx.resume().catch(() => {});
    }
  });
  window.addEventListener('focus', () => {
    if (MechAudio.ctx && MechAudio.ctx.state === 'suspended') {
      MechAudio.ctx.resume().catch(() => {});
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    window.teletypeApp = new TypewriterApp();
  });
})();
'''

full_code = part1 + part2
with open('app.js', 'w') as f:
    f.write(full_code)

with open('script.js', 'w') as f:
    f.write(full_code)

print('app.js and script.js written!')

