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
  return src;
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
  return o;
}

// ---------- Âm thanh cơ khí cho nạp đạn ----------
let reloadNodes = [];
const keep = (n) => { if (n) reloadNodes.push(n); };
const RV = 2.2; // âm lượng chung của tiếng cơ khí

// tiếng "tách" kim loại: xung nhiễu rất ngắn qua bộ lọc cộng hưởng + tiếng ngân cao
function click(delay, pitch = 1, vol = 0.32) {
  vol *= RV;
  keep(noise(0.025, 3200 * pitch, vol, 'bandpass', 8, delay));
  keep(noise(0.012, 6500 * pitch, vol * 0.6, 'highpass', 1, delay));
  keep(tone(4200 * pitch, 3000 * pitch, 0.03, vol * 0.12, 'triangle', delay));
}
// tiếng "cộp" nặng: băng đạn/đạn chạm vào thân súng
function thunk(delay, pitch = 1, vol = 0.4) {
  vol *= RV;
  keep(noise(0.07, 520 * pitch, vol, 'lowpass', 2, delay));
  keep(tone(170 * pitch, 85 * pitch, 0.06, vol * 0.5, 'sine', delay));
  keep(noise(0.02, 2600 * pitch, vol * 0.35, 'bandpass', 6, delay + 0.005));
}
// tiếng kim loại trượt/rít (băng đạn tuột ra, khoá nòng kéo lùi)
function slide(delay, dur, f0, f1, vol = 0.14) {
  if (!ctx || !soundOn) return;
  vol *= RV;
  const t = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 5;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g).connect(sfxBus);
  src.start(t, Math.random());
  src.stop(t + dur);
  keep(src);
}
// kéo khoá nòng / bơm shotgun: lùi về (trượt + tách) rồi bật tới (tách mạnh)
function rack(delay, pitch = 1, heavy = false) {
  slide(delay, 0.09, 1800 * pitch, 3200 * pitch, heavy ? 0.22 : 0.14);
  click(delay + 0.07, pitch * 0.9, heavy ? 0.42 : 0.32);
  slide(delay + 0.14, 0.07, 3000 * pitch, 1500 * pitch, heavy ? 0.2 : 0.12);
  click(delay + 0.2, pitch * 1.1, heavy ? 0.5 : 0.38);
  if (heavy) thunk(delay + 0.2, 0.8, 0.3);
}

// Thu âm một đoạn hiệu ứng ra mảng mẫu (dùng để kiểm tra và nghe thử)
export async function renderOffline(seconds, fn) {
  const saved = { ctx, master, sfxBus, soundOn, noiseBuf, reloadNodes };
  const off = new OfflineAudioContext(1, Math.ceil(44100 * seconds), 44100);
  ctx = off;
  master = off.createGain(); master.gain.value = 0.55; master.connect(off.destination);
  sfxBus = off.createGain(); sfxBus.connect(master);
  soundOn = true;
  noiseBuf = off.createBuffer(1, off.sampleRate * 2, off.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  reloadNodes = [];
  try { fn(); } finally {
    ({ ctx, master, sfxBus, soundOn, noiseBuf, reloadNodes } = saved);
  }
  const buf = await off.startRendering();
  return buf.getChannelData(0);
}

export function cancelReload() {
  for (const n of reloadNodes) { try { n.stop(); } catch { /* đã dừng */ } }
  reloadNodes = [];
}

// Chuỗi âm thanh nạp đạn theo từng loại súng, trải đều trong thời gian nạp `dur`
export function reloadSound(id, dur) {
  if (!ctx || !soundOn) return;
  cancelReload();
  const T = (k) => dur * k;
  switch (id) {
    case 'pistol': // bấm nút tháo băng, băng tuột, lắp băng, kéo khoá nòng
      click(T(0.02), 1.2, 0.25);
      slide(T(0.06), 0.12, 2400, 1200, 0.1);
      thunk(T(0.5), 1.25, 0.32);
      click(T(0.52), 1.3, 0.3);
      rack(T(0.74), 1.15);
      break;
    case 'shotgun': { // nhét từng viên vào ống đạn rồi bơm
      const shells = 5;
      for (let i = 0; i < shells; i++) {
        const d = T(0.08 + (i * 0.62) / shells);
        slide(d, 0.06, 1400, 900, 0.08);
        thunk(d + 0.05, 1.0, 0.3);
        click(d + 0.06, 0.8, 0.18);
      }
      rack(T(0.8), 0.75, true);
      break;
    }
    case 'smg':
    case 'lmg':
    case 'rifle': { // tháo băng, đập băng mới vào, kéo tay khoá nòng
      const p = id === 'lmg' ? 0.8 : id === 'rifle' ? 0.95 : 1.1;
      click(T(0.03), p * 1.1, 0.28);
      slide(T(0.06), 0.18, 2600 * p, 1100 * p, 0.12);
      thunk(T(0.12), 0.7 * p, 0.2); // băng cũ rơi
      if (id === 'lmg') { slide(T(0.3), 0.25, 900, 1600, 0.1); click(T(0.4), 0.9, 0.25); } // dây đạn
      slide(T(0.46), 0.1, 1200 * p, 2000 * p, 0.1);
      thunk(T(0.55), p, 0.42);
      click(T(0.56), p * 1.15, 0.36);
      rack(T(0.78), p, id === 'lmg');
      break;
    }
    case 'sniper': { // mở khoá nòng, nạp từng viên, đẩy khoá nòng
      click(T(0.03), 0.9, 0.3);
      slide(T(0.06), 0.14, 1500, 2600, 0.16);
      click(T(0.14), 0.8, 0.36);
      for (let i = 0; i < 4; i++) { thunk(T(0.28 + i * 0.1), 1.3, 0.22); click(T(0.29 + i * 0.1), 1.4, 0.16); }
      slide(T(0.8), 0.12, 2600, 1400, 0.16);
      click(T(0.86), 0.9, 0.42);
      click(T(0.9), 0.7, 0.36);
      break;
    }
    case 'flamer': { // xì van khí, đổi bình, khoá bình
      click(T(0.04), 0.7, 0.3);
      keep(noise(Math.max(0.3, T(0.35)), 2200, 0.16, 'highpass', 0.7, T(0.06)));
      thunk(T(0.5), 0.6, 0.45);
      slide(T(0.62), 0.25, 600, 1800, 0.12);
      click(T(0.86), 0.6, 0.4);
      thunk(T(0.88), 0.7, 0.25);
      break;
    }
    case 'launcher': { // bẻ nòng, nhét đạn, đóng nòng
      click(T(0.03), 0.6, 0.36);
      thunk(T(0.06), 0.55, 0.42);
      slide(T(0.4), 0.16, 900, 600, 0.12);
      thunk(T(0.5), 0.6, 0.38);
      thunk(T(0.82), 0.5, 0.5);
      click(T(0.83), 0.55, 0.45);
      break;
    }
    case 'tesla': { // tháo pin, lắp pin, tiếng sạc điện rít lên
      click(T(0.03), 1.2, 0.28);
      thunk(T(0.35), 1.1, 0.3);
      click(T(0.37), 1.3, 0.3);
      keep(tone(220, 1800, Math.max(0.3, T(0.45)), 0.08, 'sawtooth', T(0.42)));
      keep(tone(225, 1820, Math.max(0.3, T(0.45)), 0.05, 'square', T(0.42)));
      click(T(0.9), 1.6, 0.3);
      break;
    }
    default:
      click(T(0.05)); thunk(T(0.5)); rack(T(0.75));
  }
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
  turret() { if (throttle('turret', 70)) return; noise(0.08, 2600, 0.28); tone(150, 70, 0.05, 0.1); },
  ricochet() { if (throttle('rico', 90)) return; tone(2400, 1600, 0.06, 0.08, 'square'); },
  leap() { if (throttle('leap', 300)) return; noise(0.25, 700, 0.2, 'bandpass', 2); },
  // Âm thanh xa xăm ngẫu nhiên, tuỳ bản đồ (tiếng hét, chó tru, súng nổ xa, kính vỡ, còi báo động…)
  ambient(scene) {
    if (!ctx || !soundOn) return;
    const pool = ['scream', 'howl', 'gun', 'glass', 'groanFar'];
    if (scene === 'harbor') pool.push('horn', 'creak');
    if (scene === 'dam') pool.push('creak', 'howl');
    if (scene === 'base' || scene === 'capital' || scene === 'highway') pool.push('siren');
    const k = pool[Math.floor(Math.random() * pool.length)];
    const t = ctx.currentTime;
    const far = (node, freq = 900) => { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq; node.connect(f); f.connect(sfxBus); return f; };
    if (k === 'scream') { // tiếng hét xa, méo
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(700, t); o.frequency.linearRampToValueAtTime(1100, t + 0.25); o.frequency.linearRampToValueAtTime(500, t + 1.1);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.035, t + 0.15); g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      o.connect(g); far(g, 1400); o.start(t); o.stop(t + 1.25);
    } else if (k === 'howl') { // chó tru
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(380, t); o.frequency.linearRampToValueAtTime(620, t + 0.6); o.frequency.linearRampToValueAtTime(420, t + 1.8);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 0.3); g.gain.exponentialRampToValueAtTime(0.001, t + 1.9);
      o.connect(g); far(g, 1200); o.start(t); o.stop(t + 2);
    } else if (k === 'gun') { // ai đó vẫn đang chiến đấu ở phía xa
      const n = 1 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) noise(0.25, 380, 0.12, 'lowpass', 1, i * (0.12 + Math.random() * 0.2));
    } else if (k === 'glass') {
      for (let i = 0; i < 6; i++) noise(0.05, 5000 + Math.random() * 2000, 0.05, 'highpass', 1, i * 0.03 + Math.random() * 0.05);
    } else if (k === 'groanFar') {
      this.groan();
    } else if (k === 'horn') { // còi tàu xa ngoài khơi
      for (const f0 of [110, 138]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f0; const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.03, t + 0.4); g.gain.linearRampToValueAtTime(0.0001, t + 2.6); o.connect(g); far(g, 500); o.start(t); o.stop(t + 2.7); }
    } else if (k === 'creak') { // kim loại kẽo kẹt
      const o = ctx.createOscillator(); o.type = 'square';
      o.frequency.setValueAtTime(90, t); o.frequency.linearRampToValueAtTime(140, t + 0.9);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.02, t + 0.2); g.gain.exponentialRampToValueAtTime(0.001, t + 1);
      o.connect(g); far(g, 700); o.start(t); o.stop(t + 1.05);
    } else if (k === 'siren') { // còi báo động vọng lại
      const o = ctx.createOscillator(); o.type = 'triangle';
      for (let i = 0; i < 4; i++) { o.frequency.setValueAtTime(620, t + i * 0.7); o.frequency.linearRampToValueAtTime(880, t + i * 0.7 + 0.35); o.frequency.linearRampToValueAtTime(620, t + i * 0.7 + 0.7); }
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.025, t + 0.5); g.gain.linearRampToValueAtTime(0.0001, t + 2.8);
      o.connect(g); far(g, 1600); o.start(t); o.stop(t + 2.9);
    }
  },
  ally() { if (throttle('ally', 80)) return; noise(0.12, 1800, 0.3); tone(170, 60, 0.07, 0.1); },
  reload() { click(0, 1, 0.25); },
  reloadDone() { reloadNodes = []; },
  empty() { if (throttle('empty', 120)) return; click(0, 1.3, 0.3); keep(null); }, // tiếng "tạch" khô của cò súng
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
