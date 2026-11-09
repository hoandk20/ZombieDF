// Âm thanh tổng hợp bằng WebAudio — không cần file âm thanh ngoài.
let ctx = null;
let master = null;
let noiseBuf = null;
let enabled = true;
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
  master.gain.value = enabled ? 0.5 : 0;
  master.connect(ctx.destination);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
}

export function setSoundEnabled(on) {
  enabled = on;
  if (master) master.gain.value = on ? 0.5 : 0;
}

function throttle(name, ms) {
  const now = performance.now();
  if (lastPlay[name] && now - lastPlay[name] < ms) return true;
  lastPlay[name] = now;
  return false;
}

function noise(dur, freq, vol, type = 'lowpass', q = 1) {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t, Math.random() * 0.1);
  src.stop(t + dur);
}

function tone(f0, f1, dur, vol, type = 'square', delay = 0) {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur);
}

export const sfx = {
  pistol() { noise(0.16, 2600, 0.6); tone(190, 60, 0.09, 0.25); },
  shotgun() { noise(0.4, 1200, 0.95); tone(120, 35, 0.22, 0.45); },
  smg() { if (throttle('smg', 50)) return; noise(0.09, 3200, 0.38); tone(160, 70, 0.05, 0.12); },
  rifle() { noise(0.45, 1700, 0.95); tone(230, 45, 0.28, 0.4, 'sawtooth'); },
  lmg() { if (throttle('lmg', 60)) return; noise(0.12, 2100, 0.5); tone(140, 50, 0.07, 0.18); },
  reload() { tone(900, 650, 0.05, 0.12); tone(500, 420, 0.06, 0.12, 'square', 0.18); },
  reloadDone() { tone(1200, 900, 0.05, 0.12, 'square'); },
  empty() { tone(1300, 1200, 0.03, 0.12); },
  hit() { if (throttle('hit', 35)) return; noise(0.07, 700, 0.28); },
  headshot() { if (throttle('hs', 40)) return; noise(0.1, 500, 0.4); tone(300, 80, 0.08, 0.15, 'triangle'); },
  barricade() { if (throttle('bar', 120)) return; noise(0.14, 380, 0.35, 'lowpass', 2); },
  groan() {
    if (!ctx || !enabled || throttle('groan', 900)) return;
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
    o.connect(f).connect(g).connect(master);
    o.start(t);
    o.stop(t + 1);
  },
  buy() { tone(600, 1200, 0.12, 0.18, 'triangle'); },
  deny() { tone(220, 160, 0.15, 0.15, 'square'); },
  click() { tone(800, 700, 0.03, 0.08, 'triangle'); },
};
