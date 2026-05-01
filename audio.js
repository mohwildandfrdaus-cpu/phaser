const Settings = { muted: false, bgmGainNode: null, sfxGainNode: null };
const Audio = {
  ctx: null, bgmNodes: [], bgmGain: null, bgmLFO: null, bgmStarted: false, started: false,
  sawNodes: [], sawGains: [], sawActive: false, sawLFO: null, sawLFOGain: null,
  spikeNodes: [], spikeGains: [], spikeActive: false, spikeFilter: null, spikeLFO: null,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); },
  startAll() {
    if (this.started) return;
    this.started = true;
    this.init();
    setTimeout(() => { this.startBGM(); this.startSawHum(); this.startSpikeHum(); }, 50);
  },
  startBGM() {
    this.init(); if (this.bgmStarted) return; this.bgmStarted = true;
    const now = this.ctx.currentTime;
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0, now);
    this.bgmGain.gain.linearRampToValueAtTime(Settings.muted ? 0 : 0.08, now + 2);
    Settings.bgmGainNode = this.bgmGain;
    this.bgmLFO = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.bgmLFO.type = 'sine'; this.bgmLFO.frequency.setValueAtTime(0.1, now); lfoGain.gain.setValueAtTime(0.015, now);
    const osc1 = this.ctx.createOscillator(), g1 = this.ctx.createGain();
    osc1.type = 'sine'; osc1.frequency.setValueAtTime(55, now); g1.gain.setValueAtTime(1, now);
    const osc2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
    osc2.type = 'sine'; osc2.frequency.setValueAtTime(110, now); g2.gain.setValueAtTime(0.4, now);
    const osc3 = this.ctx.createOscillator(), g3 = this.ctx.createGain();
    osc3.type = 'triangle'; osc3.frequency.setValueAtTime(165, now); g3.gain.setValueAtTime(0.15, now);
    const osc4 = this.ctx.createOscillator(), g4 = this.ctx.createGain();
    osc4.type = 'sine'; osc4.frequency.setValueAtTime(440, now); g4.gain.setValueAtTime(0.02, now);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(280, now); filter.Q.setValueAtTime(0.5, now);
    const delay = this.ctx.createDelay(); delay.delayTime.setValueAtTime(0.4, now);
    const delayGain = this.ctx.createGain(); delayGain.gain.setValueAtTime(0.3, now);
    this.bgmLFO.connect(lfoGain); lfoGain.connect(g1.gain); lfoGain.connect(g2.gain);
    osc1.connect(g1); g1.connect(filter); osc2.connect(g2); g2.connect(filter);
    osc3.connect(g3); g3.connect(filter); osc4.connect(g4); g4.connect(filter);
    filter.connect(this.bgmGain); this.bgmGain.connect(this.ctx.destination);
    filter.connect(delay); delay.connect(delayGain); delayGain.connect(delay); delayGain.connect(this.ctx.destination);
    osc1.start(); osc2.start(); osc3.start(); osc4.start(); this.bgmLFO.start();
    this.bgmNodes = [osc1, osc2, osc3, osc4, this.bgmLFO];
  },
  stopBGM() {
    if (!this.bgmStarted) return; this.bgmStarted = false;
    const now = this.ctx.currentTime;
    if (this.bgmGain) { this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now); this.bgmGain.gain.linearRampToValueAtTime(0, now + 1.5); }
    setTimeout(() => { this.bgmNodes.forEach(n => { try { n.stop(); } catch (e) {} }); this.bgmNodes = []; this.bgmLFO = null; this.bgmGain = null; Settings.bgmGainNode = null; }, 1500);
  },
  startSawHum() {
    this.init(); if (this.sawActive) return; this.sawActive = true;
    const now = this.ctx.currentTime;
    this.sawLFO = this.ctx.createOscillator(); this.sawLFOGain = this.ctx.createGain();
    this.sawLFO.type = 'sine'; this.sawLFO.frequency.setValueAtTime(4, now); this.sawLFOGain.gain.setValueAtTime(15, now);
    const osc1 = this.ctx.createOscillator(), g1 = this.ctx.createGain();
    osc1.type = 'square'; osc1.frequency.setValueAtTime(85, now); g1.gain.setValueAtTime(0.08, now);
    const osc2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
    osc2.type = 'sine'; osc2.frequency.setValueAtTime(170, now); g2.gain.setValueAtTime(0.04, now);
    const osc3 = this.ctx.createOscillator(), g3 = this.ctx.createGain();
    osc3.type = 'sawtooth'; osc3.frequency.setValueAtTime(42.5, now); g3.gain.setValueAtTime(0.05, now);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(350, now); filter.Q.setValueAtTime(2, now);
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(Settings.muted ? 0 : 0.15, now);
    Settings.sfxGainNode = masterGain;
    this.sawLFO.connect(this.sawLFOGain); this.sawLFOGain.connect(osc1.frequency); this.sawLFOGain.connect(osc2.frequency); this.sawLFOGain.connect(osc3.frequency);
    osc1.connect(g1); g1.connect(filter); osc2.connect(g2); g2.connect(filter); osc3.connect(g3); g3.connect(filter);
    filter.connect(masterGain); masterGain.connect(this.ctx.destination);
    osc1.start(); osc2.start(); osc3.start(); this.sawLFO.start();
    this.sawNodes = [osc1, osc2, osc3, this.sawLFO]; this.sawGains = [g1, g2, g3, masterGain];
  },
  stopSawHum() {
    if (!this.sawActive) return; this.sawActive = false;
    const now = this.ctx.currentTime;
    if (this.sawGains.length > 0) { const master = this.sawGains[this.sawGains.length - 1]; master.gain.setValueAtTime(master.gain.value, now); master.gain.exponentialRampToValueAtTime(0.001, now + 0.5); }
    setTimeout(() => { this.sawNodes.forEach(n => { try { n.stop(); } catch (e) {} }); this.sawNodes = []; this.sawGains = []; if (this.sawLFO) { try { this.sawLFO.stop(); } catch (e) {} this.sawLFO = null; } if (this.sawLFOGain) { this.sawLFOGain = null; } }, 500);
  },
  startSpikeHum() {
    this.init(); if (this.spikeActive) return; this.spikeActive = true;
    const now = this.ctx.currentTime;
    this.spikeLFO = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.spikeLFO.type = 'sine'; this.spikeLFO.frequency.setValueAtTime(8, now); lfoGain.gain.setValueAtTime(20, now);
    const osc1 = this.ctx.createOscillator(), g1 = this.ctx.createGain();
    osc1.type = 'sawtooth'; osc1.frequency.setValueAtTime(65, now); g1.gain.setValueAtTime(0.1, now);
    const osc2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
    osc2.type = 'square'; osc2.frequency.setValueAtTime(130, now); g2.gain.setValueAtTime(0.05, now);
    const osc3 = this.ctx.createOscillator(), g3 = this.ctx.createGain();
    osc3.type = 'sine'; osc3.frequency.setValueAtTime(32.5, now); g3.gain.setValueAtTime(0.08, now);
    this.spikeFilter = this.ctx.createBiquadFilter();
    this.spikeFilter.type = 'lowpass'; this.spikeFilter.frequency.setValueAtTime(200, now); this.spikeFilter.Q.setValueAtTime(3, now);
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(Settings.muted ? 0 : 0.12, now + 0.5);
    this.spikeLFO.connect(lfoGain); lfoGain.connect(this.spikeFilter.frequency);
    osc1.connect(g1); g1.connect(this.spikeFilter); osc2.connect(g2); g2.connect(this.spikeFilter); osc3.connect(g3); g3.connect(this.spikeFilter);
    this.spikeFilter.connect(masterGain); masterGain.connect(this.ctx.destination);
    osc1.start(); osc2.start(); osc3.start(); this.spikeLFO.start();
    this.spikeNodes = [osc1, osc2, osc3, this.spikeLFO]; this.spikeGains = [g1, g2, g3, masterGain];
  },
  stopSpikeHum() {
    if (!this.spikeActive) return; this.spikeActive = false;
    const now = this.ctx.currentTime;
    if (this.spikeGains.length > 0) { const master = this.spikeGains[this.spikeGains.length - 1]; master.gain.setValueAtTime(master.gain.value, now); master.gain.exponentialRampToValueAtTime(0.001, now + 0.3); }
    setTimeout(() => { this.spikeNodes.forEach(n => { try { n.stop(); } catch (e) {} }); this.spikeNodes = []; this.spikeGains = []; if (this.spikeLFO) { try { this.spikeLFO.stop(); } catch (e) {} this.spikeLFO = null; } this.spikeFilter = null; }, 300);
  },
  playTone(freqStart, freqEnd, dur, type, volMult) {
    if (Settings.muted) return; this.init();
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + dur);
    gain.gain.setValueAtTime(0.15 * volMult, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + dur);
  },
  jump() { this.playTone(150, 600, 0.15, 'square', 1); },
  spikeFall() { this.playTone(200, 50, 0.4, 'sawtooth', 1.3); },
  button() { this.playTone(800, 1200, 0.15, 'sine', 1.3); },
  gameOver() { this.playTone(150, 30, 1.0, 'sawtooth', 1.3); },
  damage() {
    if (Settings.muted) return; this.init();
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource(); noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    noise.connect(noiseGain); noiseGain.connect(this.ctx.destination); noise.start();
    const osc = this.ctx.createOscillator(), oscGain = this.ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);
    oscGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(oscGain); oscGain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.3);
  },
  spikeKill() {
    if (Settings.muted) return; this.init();
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource(); noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    noise.connect(gain); gain.connect(this.ctx.destination); noise.start();
  },
  doorCreak() {
    if (Settings.muted) return; this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    osc.frequency.linearRampToValueAtTime(350, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.8);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(now + 0.8);
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const d = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) d[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource(); noise.buffer = buffer;
    const nGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.5); filter.Q.setValueAtTime(5, now);
    nGain.gain.setValueAtTime(0.05, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    noise.connect(filter); filter.connect(nGain); nGain.connect(this.ctx.destination); noise.start();
  },
  win() {
    if (Settings.muted) return; this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.3);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.12); osc.stop(this.ctx.currentTime + i * 0.12 + 0.3);
    });
  },
  levelUp() {
    if (Settings.muted) return; this.init();
    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + i * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.4);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.1); osc.stop(this.ctx.currentTime + i * 0.1 + 0.4);
    });
  },
  updateMute() {
    const now = this.ctx ? this.ctx.currentTime : 0;
    if (Settings.bgmGainNode && this.ctx) { try { Settings.bgmGainNode.gain.setTargetAtTime(Settings.muted ? 0 : 0.08, now, 0.1); } catch(e) {} }
    if (Settings.sfxGainNode && this.ctx) { try { Settings.sfxGainNode.gain.setTargetAtTime(Settings.muted ? 0 : 0.15, now, 0.1); } catch(e) {} }
    if (this.spikeActive && this.spikeGains.length > 0 && this.ctx) { const master = this.spikeGains[this.spikeGains.length - 1]; try { master.gain.setTargetAtTime(Settings.muted ? 0 : 0.12, now, 0.1); } catch(e) {} }
    if (this.sawActive && this.sawGains.length > 0 && this.ctx) { const master = this.sawGains[this.sawGains.length - 1]; try { master.gain.setTargetAtTime(Settings.muted ? 0 : 0.15, now, 0.1); } catch(e) {} }
  }
};

const GAME_CONFIG = { LIVES_START: 5, INVINCIBLE_DURATION: 2000, STUN_DURATION: 2000, PLAYER_JUMP_POWER: 530, STATIC_SAW_SPEED_CAP: 1.5 };
let gameScene, player, spike, lavaCover, lavaCoverBody, lavaCoverCollider;
let lavaButton, btnBase, buttonPressed = false, doorContainer, doorFrame, doorGlow, doorOpen = false;
let finishZone, lavaZone, winParticles = null;
let isInvincible = false, spikeAlive = true, spikeStunned = false, spikeFallingToLava = false;
let saws = [], lives = GAME_CONFIG.LIVES_START;
let gameWon = false, gameOverActive = false, levelTransition = false;
let invincibleTimer, stunTimer, blinkTimer;
let keys = { left: false, right: false, up: false, down: false, space: false };
let spikeVelX = 0;
let playerOnButton = false;
let lavaGfx, lavaBubbles = [], heartIcons = [], damageFlash;
let currentLevel = 1;
let totalLevels = 2;
let movingPlatforms = [], lasers = [], bats = [], windZones = [];
let lavaGlow;
let bgStars = [];