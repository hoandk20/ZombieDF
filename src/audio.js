// Âm thanh & nhạc nền tổng hợp bằng WebAudio — không cần file âm thanh ngoài.
let ctx = null;
let master = null;
let sfxBus = null;
let musicBus = null;
let noiseBuf = null;
let soundOn = true;
let musicOn = true;
let ambient = null;
let heartTimer = 0;
const lastPlay = {};

export function initAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(ctx.destination);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = soundOn ? 1 : 0;
  sfxBus.connect(master);
  musicBus = ctx.createGain();
  musicBus.gain.value = musicOn ? 1 : 0;
  musicBus.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  if (pendingMood) setMood(pendingMood);
}

export function setSoundEnabled(on) {
  soundOn = on;
  if (sfxBus) sfxBus.gain.value = on ? 1 : 0;
}
export function setMusicEnabled(on) {
  musicOn = on;
  if (musicBus) musicBus.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.3);
}

function throttle(name, ms) {
  const now = performance.now();
  if (lastPlay[name] && now - lastPlay[name] < ms) return true;
  lastPlay[name] = now;
  return false;
}

function noise(dur, freq, vol, type = 'lowpass', q = 1, delay = 0) {
  if (!ctx || !soundOn) return;
  const t = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g).connect(sfxBus);
  src.start(t, Math.random() * 1.2);
  src.stop(t + dur);
}

function tone(f0, f1, dur, vol, type = 'square', delay = 0, bus = null) {
  if (!ctx || (!bus && !soundOn)) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(bus || sfxBus);
  o.start(t);
  o.stop(t + dur);
}

// ---------- Nhạc nền: drone u ám + gió, đổi theo "mood" ----------
let pendingMood = null;
const MOODS = {
  menu:  { root: 55, gain: 0.05, wind: 0.035, filter: 380 },
  night: { root: 49, gain: 0.06, wind: 0.05, filter: 520 },
  boss:  { root: 41, gain: 0.08, wind: 0.06, filter: 700 },
  day:   { root: 65.4, gain: 0.03, wind: 0.015, filter: 900 },
  off:   { root: 55, gain: 0, wind: 0, filter: 300 },
};

export function setMood(name) {
  pendingMood = name;
  if (!ctx) return;
  const m = MOODS[name] || MOODS.off;
  if (!ambient) {
    const out = ctx.createGain();
    out.gain.value = 0;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = m.filter;
    lp.connect(out);
    out.connect(musicBus);
    const oscs = [1, 1.498, 2.003, 0.5].map((mul, i) => {
      const o = ctx.createOscillator();
      o.type = i === 3 ? 'sine' : 'sawtooth';
      o.frequency.value = m.root * mul;
      o.detune.value = (i - 1.5) * 7;
      const g = ctx.createGain();
      g.gain.value = i === 3 ? 0.6 : 0.22;
      o.connect(g).connect(lp);
      o.start();
      return { o, mul };
    });
    // LFO tạo cảm giác "thở"
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 140;
    lfo.connect(lfoG).connect(lp.frequency);
    lfo.start();
    // gió
    const wsrc = ctx.createBufferSource();
    wsrc.buffer = noiseBuf;
    wsrc.loop = true;
    const wf = ctx.createBiquadFilter();
    wf.type = 'bandpass';
    wf.frequency.value = 420;
    wf.Q.value = 0.6;
    const wg = ctx.createGain();
    wg.gain.value = 0;
    wsrc.connect(wf).connect(wg).connect(musicBus);
    wsrc.start();
    const wlfo = ctx.createOscillator();
    wlfo.frequency.value = 0.13;
    const wlfoG = ctx.createGain();
    wlfoG.gain.value = 220;
    wlfo.connect(wlfoG).connect(wf.frequency);
    wlfo.start();
    ambient = { out, lp, oscs, wg };
  }
  const t = ctx.currentTime;
  ambient.out.gain.setTargetAtTime(m.gain, t, 1.2);
  ambient.wg.gain.setTargetAtTime(m.wind, t, 1.2);
  ambient.lp.frequency.setTargetAtTime(m.filter, t, 1.5);
  for (const { o, mul } of ambient.oscs) o.frequency.setTargetAtTime(m.root * mul, t, 2);
}

// Nhịp tim khi hàng rào sắp vỡ; gọi mỗi khung hình
export function heartbeat(dt, danger) {
  if (!ctx || !soundOn || danger <= 0) { heartTimer = 0; return; }
  heartTimer -= dt;
  if (heartTimer <= 0) {
    heartTimer = 1.1 - danger * 0.45;
    tone(60, 40, 0.12, 0.35 * danger, 'sine');
    tone(55, 38, 0.1, 0.25 * danger, 'sine', 0.16);
  }
}

export const sfx = {
  pistol() { noise(0.16, 2600, 0.6); tone(190, 60, 0.09, 0.25); },
  shotgun() { noise(0.4, 1200, 0.95); tone(120, 35, 0.22, 0.45); },
  smg() { if (throttle('smg', 50)) return; noise(0.09, 3200, 0.38); tone(160, 70, 0.05, 0.12); },
  rifle() { noise(0.45, 1700, 0.95); tone(230, 45, 0.28, 0.4, 'sawtooth'); },
  lmg() { if (throttle('lmg', 60)) return; noise(0.12, 2100, 0.5); tone(140, 50, 0.07, 0.18); },
  flamer() { if (throttle('flame', 90)) return; noise(0.18, 900, 0.22, 'bandpass', 0.6); },
  launcher() { noise(0.25, 600, 0.6); tone(140, 60, 0.18, 0.4, 'sine'); },
  sniper() { noise(0.55, 1400, 1.0); tone(260, 40, 0.35, 0.45, 'sawtooth'); },
  tesla() { if (throttle('tesla', 120)) return; noise(0.2, 4200, 0.35, 'highpass'); tone(900, 200, 0.15, 0.12, 'sawtooth'); },
  scream() { if (throttle('scream', 600)) return; tone(900, 1400, 0.6, 0.12, 'sawtooth'); noise(0.6, 3000, 0.18, 'bandpass', 4); },
  plane() { if (throttle('plane', 3000)) return; tone(80, 70, 2.5, 0.08, 'sawtooth'); noise(2.5, 300, 0.12); },
  hurt() { tone(400, 200, 0.25, 0.18, 'square'); },
  levelUp() { tone(523, 784, 0.18, 0.15, 'triangle'); tone(784, 1046, 0.22, 0.12, 'triangle', 0.15); },
  ally() { if (throttle('ally', 80)) return; noise(0.12, 1800, 0.3); tone(170, 60, 0.07, 0.1); },
  reload() { tone(900, 650, 0.05, 0.12); tone(500, 420, 0.06, 0.12, 'square', 0.18); },
  reloadDone() { tone(1200, 900, 0.05, 0.12, 'square'); },
  empty() { tone(1300, 1200, 0.03, 0.12); },
  hit() { if (throttle('hit', 35)) return; noise(0.07, 700, 0.28); },
  headshot() { if (throttle('hs', 40)) return; noise(0.1, 500, 0.4); tone(300, 80, 0.08, 0.15, 'triangle'); },
  barricade() { if (throttle('bar', 120)) return; noise(0.14, 380, 0.35, 'lowpass', 2); },
  acid() { if (throttle('acid', 100)) return; noise(0.35, 2400, 0.25, 'highpass'); },
  spit() { if (throttle('spit', 120)) return; noise(0.15, 900, 0.2, 'bandpass', 3); },
  throw() { noise(0.2, 1500, 0.15, 'bandpass', 2); },
  explosion() {
    noise(1.2, 400, 1.0); noise(0.4, 2000, 0.5);
    tone(90, 25, 0.8, 0.6, 'sine');
  },
  thunder() {
    if (!ctx || !soundOn) return;
    noise(0.3, 1800, 0.25);
    noise(2.5, 160, 0.7, 'lowpass', 0.7, 0.15);
  },
  roar() {
    if (!ctx || !soundOn || throttle('roar', 1500)) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(70, t);
    o.frequency.linearRampToValueAtTime(110, t + 0.4);
    o.frequency.linearRampToValueAtTime(45, t + 1.6);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 600;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.5, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.7);
    o.connect(f).connect(g).connect(sfxBus);
    o.start(t); o.stop(t + 1.8);
    noise(1.5, 300, 0.4, 'bandpass', 1.5);
  },
  groan() {
    if (!ctx || !soundOn || throttle('groan', 900)) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    const base = 70 + Math.random() * 40;
    o.frequency.setValueAtTime(base, t);
    o.frequency.linearRampToValueAtTime(base * 0.7, t + 0.9);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 420;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.95);
    o.connect(f).connect(g).connect(sfxBus);
    o.start(t);
    o.stop(t + 1);
  },
  combo(n) { tone(500 + n * 60, 900 + n * 60, 0.12, 0.12, 'triangle'); },
  typeTick() { if (throttle('tick', 45)) return; noise(0.02, 3000, 0.05, 'highpass'); },
  static() { noise(0.4, 2500, 0.12, 'bandpass', 0.5); },
  sting() { // nốt nhạc ngắn khi sang đêm / bình minh
    tone(110, 108, 1.4, 0.18, 'sawtooth');
    tone(164.8, 162, 1.4, 0.12, 'sawtooth');
    tone(220, 218, 1.4, 0.08, 'triangle');
  },
  dawn() {
    tone(261.6, 261.6, 1.6, 0.1, 'triangle');
    tone(329.6, 329.6, 1.6, 0.08, 'triangle', 0.25);
    tone(392, 392, 1.8, 0.08, 'triangle', 0.5);
  },
  victory() {
    [261.6, 329.6, 392, 523.2].forEach((f, i) => tone(f, f, 1.2, 0.12, 'triangle', i * 0.18));
  },
  buy() { tone(600, 1200, 0.12, 0.18, 'triangle'); },
  deny() { tone(220, 160, 0.15, 0.15, 'square'); },
  click() { tone(800, 700, 0.03, 0.08, 'triangle'); },
};
