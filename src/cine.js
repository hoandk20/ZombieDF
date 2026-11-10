// Cắt cảnh minh hoạ cho phim cốt truyện: mỗi câu thoại có thể gắn một "shot".
// Mọi thứ vẽ bằng canvas, chuyển động chậm theo thời gian t (giây).
import { W, H } from './config.js';
import { drawCharacter, CHARACTERS } from './render.js';

const TAU = Math.PI * 2;
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (k) => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function seeded(seed) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

// ---------- phông nền ----------
function sky(ctx, stops, h = H) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  stops.forEach(([k, c]) => g.addColorStop(k, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, h);
}
const NIGHT = [[0, '#05060f'], [0.6, '#141530'], [1, '#2a2040']];
const DAWN = [[0, '#2a2240'], [0.45, '#8a4a5a'], [0.75, '#e08a5a'], [1, '#ffc888']];
const DUSK = [[0, '#1a1428'], [0.5, '#5a2a3a'], [1, '#c0583a']];
const BLOOD = [[0, '#0e0408'], [0.6, '#3a0e14'], [1, '#6a1a1a']];

function stars(ctx, seed, n = 90, a = 1) {
  const r = seeded(seed);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = `rgba(255,255,255,${(0.2 + r() * 0.6) * a})`;
    ctx.fillRect(r() * W, r() * H * 0.6, 1.5, 1.5);
  }
}
function moon(ctx, x, y, r, col = '#f3e9c8') {
  const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 4);
  g.addColorStop(0, 'rgba(255,240,200,0.3)'); g.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = g; ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}
function sun(ctx, x, y, r) {
  const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 5);
  g.addColorStop(0, 'rgba(255,220,150,0.7)'); g.addColorStop(1, 'rgba(255,180,100,0)');
  ctx.fillStyle = g; ctx.fillRect(x - r * 5, y - r * 5, r * 10, r * 10);
  ctx.fillStyle = '#ffe2a8'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}
function mountains(ctx, seed, base, amp, col, step = 50) {
  const r = seeded(seed);
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(-20, H);
  for (let x = -20; x <= W + 60; x += step + r() * step) ctx.lineTo(x, base - r() * amp);
  ctx.lineTo(W + 60, H); ctx.fill();
}
function skyline(ctx, seed, base, col, lit = 0.05, minH = 40, maxH = 160, x0 = -10, x1 = W + 10) {
  const r = seeded(seed);
  let x = x0;
  while (x < x1) {
    const w = 26 + r() * 60, h = minH + r() * (maxH - minH);
    ctx.fillStyle = col; ctx.fillRect(x, base - h, w, h);
    for (let wy = base - h + 6; wy < base - 6; wy += 10) for (let wx = x + 4; wx < x + w - 4; wx += 8) {
      if (r() < lit) { ctx.fillStyle = 'rgba(255,200,110,0.75)'; ctx.fillRect(wx, wy, 3, 4); }
    }
    x += w + r() * 8;
  }
}
function sea(ctx, y, t, col = '#0f1428', glint = 'rgba(240,220,180,') {
  ctx.fillStyle = col; ctx.fillRect(0, y, W, H - y);
  for (let i = 0; i < 40; i++) {
    const yy = y + 6 + (i * 37) % (H - y - 6);
    const xx = ((i * 131 + t * (12 + (i % 5) * 4)) % (W + 80)) - 40;
    ctx.fillStyle = glint + (0.05 + (i % 4) * 0.03) + ')';
    ctx.fillRect(xx, yy, 18 + (i % 3) * 14, 1.5);
  }
}
function glow(ctx, x, y, r, rgb, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function fire(ctx, x, y, s, t) {
  glow(ctx, x, y - 10 * s, 70 * s, '255,120,40', 0.35 + Math.sin(t * 9 + x) * 0.06);
  for (let i = 0; i < 6; i++) {
    const k = ((t * 1.6 + i / 6) % 1);
    const fx = x + Math.sin(i * 2.3 + t * 3) * 8 * s, fy = y - k * 40 * s;
    ctx.fillStyle = `rgba(255,${Math.round(200 - k * 150)},40,${0.8 * (1 - k)})`;
    ctx.beginPath(); ctx.arc(fx, fy, (8 - k * 5) * s, 0, TAU); ctx.fill();
  }
}
function smoke(ctx, x, y, s, t, col = '40,36,40') {
  for (let i = 0; i < 7; i++) {
    const k = ((t * 0.12 + i / 7) % 1);
    ctx.fillStyle = `rgba(${col},${0.35 * (1 - k)})`;
    ctx.beginPath(); ctx.arc(x + k * 60 * s + Math.sin(i + t) * 6, y - k * 160 * s, (14 + k * 40) * s, 0, TAU); ctx.fill();
  }
}
function ground(ctx, y, top, bot) {
  const g = ctx.createLinearGradient(0, y, 0, H);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(0, y, W, H - y);
}

// ---------- hình bóng ----------
function person(ctx, x, y, s, col = '#0a0a10', pose = 'stand', t = 0) {
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y - 92 * s, 10 * s, 0, TAU); ctx.fill();
  ctx.fillRect(x - 10 * s, y - 80 * s, 20 * s, 44 * s);
  ctx.lineWidth = 8 * s;
  const sw = pose === 'walk' ? Math.sin(t * 5) * 8 * s : 0;
  ctx.beginPath(); ctx.moveTo(x - 4 * s, y - 38 * s); ctx.lineTo(x - 5 * s + sw, y); ctx.moveTo(x + 4 * s, y - 38 * s); ctx.lineTo(x + 5 * s - sw, y); ctx.stroke();
  ctx.lineWidth = 6 * s;
  ctx.beginPath();
  if (pose === 'wave') { ctx.moveTo(x + 8 * s, y - 76 * s); ctx.lineTo(x + 18 * s, y - 108 * s + Math.sin(t * 6) * 6 * s); }
  else if (pose === 'push') { ctx.moveTo(x + 8 * s, y - 72 * s); ctx.lineTo(x + 30 * s, y - 70 * s); }
  else if (pose === 'gun') { ctx.moveTo(x + 8 * s, y - 74 * s); ctx.lineTo(x + 34 * s, y - 78 * s); }
  else { ctx.moveTo(x + 8 * s, y - 76 * s); ctx.lineTo(x + 12 * s, y - 44 * s); }
  ctx.stroke();
  if (pose === 'gun') ctx.fillRect(x + 26 * s, y - 82 * s, 26 * s, 5 * s);
}
function zombie(ctx, x, y, s, col = '#0c0a0c', t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.15 + Math.sin(t * 2 + x) * 0.04);
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(-14 * s, -86 * s, 10 * s, 0, TAU); ctx.fill();
  ctx.fillRect(-10 * s, -76 * s, 20 * s, 40 * s);
  ctx.lineWidth = 7 * s;
  ctx.beginPath(); ctx.moveTo(-2 * s, -38 * s); ctx.lineTo(-8 * s + Math.sin(t * 3 + x) * 6 * s, 0); ctx.moveTo(4 * s, -38 * s); ctx.lineTo(6 * s, 0); ctx.stroke();
  ctx.lineWidth = 5 * s;
  ctx.beginPath(); ctx.moveTo(-6 * s, -70 * s); ctx.lineTo(-34 * s, -60 * s); ctx.moveTo(0, -68 * s); ctx.lineTo(-30 * s, -52 * s); ctx.stroke();
  ctx.restore();
}
function heli(ctx, x, y, s, t, light = true) {
  if (light) {
    const g = ctx.createLinearGradient(x, y, x - 40 * s, y + 260 * s);
    g.addColorStop(0, 'rgba(255,245,210,0.35)'); g.addColorStop(1, 'rgba(255,245,210,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x - 14 * s, y + 12 * s); ctx.lineTo(x - 140 * s, y + 280 * s); ctx.lineTo(x + 60 * s, y + 280 * s); ctx.lineTo(x, y + 12 * s); ctx.fill();
  }
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.05);
  ctx.fillStyle = '#121118';
  ctx.beginPath(); ctx.ellipse(0, 0, 44, 17, 0, 0, TAU); ctx.fill();
  ctx.fillRect(30, -6, 70, 8); ctx.fillRect(94, -18, 8, 22);
  ctx.fillStyle = 'rgba(140,190,230,0.55)'; ctx.beginPath(); ctx.ellipse(-24, -3, 14, 9, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#121118'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-26, 22); ctx.lineTo(26, 22); ctx.moveTo(-14, 14); ctx.lineTo(-16, 22); ctx.moveTo(14, 14); ctx.lineTo(16, 22); ctx.stroke();
  const bl = 72 * Math.abs(Math.cos(t * 28));
  ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-bl, -21); ctx.lineTo(bl, -21); ctx.stroke();
  ctx.fillStyle = Math.sin(t * 8) > 0 ? '#ff3a2a' : '#3a0a0a'; ctx.beginPath(); ctx.arc(100, -18, 3, 0, TAU); ctx.fill();
  ctx.restore();
}
function ship(ctx, x, y, s, lit = true) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#13121a';
  ctx.beginPath(); ctx.moveTo(-170, -12); ctx.lineTo(160, -12); ctx.lineTo(136, 8); ctx.lineTo(-150, 8); ctx.fill();
  ctx.fillRect(-100, -34, 140, 22); ctx.fillRect(-70, -54, 80, 20); ctx.fillRect(-26, -88, 16, 34);
  ctx.fillStyle = '#8a2a22'; ctx.fillRect(-26, -88, 16, 8);
  if (lit) { ctx.fillStyle = 'rgba(255,220,140,0.85)'; for (let i = 0; i < 10; i++) ctx.fillRect(-94 + i * 13, -27, 6, 5); for (let i = 0; i < 5; i++) ctx.fillRect(-62 + i * 13, -47, 6, 5); }
  ctx.fillStyle = '#e8e8e8'; ctx.font = 'bold 9px sans-serif'; ctx.fillText('BÌNH MINH', 40, -1);
  ctx.restore();
}
function truck(ctx, x, y, s, col = '#2a2a30') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.fillRect(-90, -50, 120, 44);
  ctx.fillStyle = '#1a1a20'; ctx.fillRect(30, -40, 40, 34); ctx.fillRect(60, -26, 14, 20);
  ctx.fillStyle = 'rgba(160,200,230,0.4)'; ctx.fillRect(40, -36, 18, 12);
  ctx.fillStyle = '#0a0a0e'; for (const wx of [-70, -40, 50]) { ctx.beginPath(); ctx.arc(wx, -4, 11, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,240,180,0.9)'; ctx.fillRect(72, -18, 4, 5);
  ctx.restore();
}
function radioWaves(ctx, x, y, t, col = '255,230,160') {
  for (let k = 0; k < 5; k++) {
    const r = ((t * 80 + k * 60) % 300) + 8;
    ctx.strokeStyle = `rgba(${col},${0.55 * (1 - r / 310)})`;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y, r, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  }
}
function lattice(ctx, x, top, base, w, col) { // cột ăng-ten
  ctx.strokeStyle = col; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - w, base); ctx.lineTo(x, top); ctx.lineTo(x + w, base); ctx.stroke();
  ctx.lineWidth = 1.4;
  for (let y = base; y > top + 10; y -= 16) { const k = (base - y) / (base - top); ctx.beginPath(); ctx.moveTo(x - w * (1 - k), y); ctx.lineTo(x + w * (1 - k), y - 16); ctx.stroke(); }
}
function bigFall(ctx, x, y, t, col) { // trùm đổ sập + bụi tung
  const k = ease(t / 2.2);
  ctx.save(); ctx.translate(x, y); ctx.rotate(k * 1.4);
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(-30, -250, 34, 0, TAU); ctx.fill();
  ctx.fillRect(-60, -220, 110, 130);
  ctx.fillRect(-50, -90, 34, 90); ctx.fillRect(10, -90, 34, 90);
  ctx.fillRect(-120, -210, 70, 26);
  ctx.fillStyle = '#ff3b2f'; ctx.beginPath(); ctx.arc(-44, -254, 5, 0, TAU); ctx.fill();
  ctx.restore();
  if (t > 1.6) for (let i = 0; i < 9; i++) {
    const d = Math.min(1, (t - 1.6) / 2);
    ctx.fillStyle = `rgba(120,100,90,${0.4 * (1 - d * 0.6)})`;
    ctx.beginPath(); ctx.arc(x + 120 + (i - 4) * 50 * d * 1.6, y - 10 - Math.abs(i - 4) * 4, 30 + d * 40, 0, TAU); ctx.fill();
  }
}

// ---------- các shot ----------
const SHOTS = {
  // Mở đầu: Bến Sương
  radioRoom(ctx, t) {
    ctx.fillStyle = '#16121a'; ctx.fillRect(0, 0, W, H);
    // cửa sổ: thị trấn cháy
    ctx.save(); ctx.beginPath(); ctx.rect(560, 80, 300, 220); ctx.clip();
    sky(ctx, NIGHT, 300); skyline(ctx, 7, 300, '#0a0a14', 0.02, 30, 120, 560, 860);
    fire(ctx, 640, 280, 1.2, t); fire(ctx, 790, 290, 0.9, t + 1); smoke(ctx, 640, 260, 0.8, t);
    ctx.restore();
    ctx.strokeStyle = '#2a2228'; ctx.lineWidth = 10; ctx.strokeRect(560, 80, 300, 220);
    ctx.beginPath(); ctx.moveTo(710, 80); ctx.lineTo(710, 300); ctx.moveTo(560, 190); ctx.lineTo(860, 190); ctx.stroke();
    // bàn + bộ đàm
    ctx.fillStyle = '#2a1e18'; ctx.fillRect(80, 360, 620, 24);
    ctx.fillStyle = '#3a3a40'; ctx.fillRect(330, 300, 170, 60);
    ctx.fillStyle = '#1a1a1e'; ctx.fillRect(340, 310, 80, 30);
    ctx.fillStyle = `rgba(120,255,140,${0.6 + Math.sin(t * 12) * 0.2})`; for (let i = 0; i < 10; i++) ctx.fillRect(344 + i * 7, 335 - Math.abs(Math.sin(t * 9 + i)) * 20, 4, Math.abs(Math.sin(t * 9 + i)) * 20 + 2);
    ctx.fillStyle = '#c9a24a'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(445 + i * 18, 330, 6, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(480, 300); ctx.lineTo(500, 220); ctx.stroke();
    glow(ctx, 380, 325, 180, '120,255,140', 0.12);
    glow(ctx, 710, 190, 260, '255,130,60', 0.12 + Math.sin(t * 7) * 0.03);
    ctx.save(); ctx.scale(2.2, 2.2); drawCharacter(ctx, 110, 196, 0.15, 'pistol', 22, 0, t, CHARACTERS.phong); ctx.restore();
  },
  townBurning(ctx, t) {
    sky(ctx, NIGHT); stars(ctx, 3, 60, 0.6);
    ctx.save(); ctx.translate(-t * 6, 0);
    mountains(ctx, 2, 330, 60, '#0e1020');
    skyline(ctx, 11, 400, '#0a0a14', 0.03, 40, 150, -10, W + 200);
    fire(ctx, 260, 395, 1.6, t); fire(ctx, 560, 400, 1.2, t + 2); fire(ctx, 820, 392, 1.4, t + 4);
    smoke(ctx, 260, 360, 1.4, t); smoke(ctx, 820, 360, 1.2, t + 3);
    ctx.restore();
    ground(ctx, 400, '#1e1a18', '#0c0a0a');
    for (let i = 0; i < 9; i++) zombie(ctx, ((i * 120 + t * 14) % (W + 100)) - 50, 470 + (i % 3) * 18, 0.9 + (i % 2) * 0.2, '#070608', t);
  },
  grandpaHouse(ctx, t) {
    sky(ctx, [[0, '#0a0a1a'], [0.7, '#3a2440'], [1, '#7a3a3a']]);
    moon(ctx, 760, 110, 30);
    mountains(ctx, 5, 330, 120, '#141428', 80);
    ground(ctx, 400, '#2a2620', '#100e0c');
    ctx.fillStyle = '#1a1414'; ctx.fillRect(300, 280, 220, 130);
    ctx.beginPath(); ctx.moveTo(280, 284); ctx.lineTo(410, 200); ctx.lineTo(540, 284); ctx.fill();
    ctx.fillStyle = `rgba(255,190,90,${0.6 + Math.sin(t * 6) * 0.08})`; ctx.fillRect(340, 310, 34, 34); ctx.fillRect(440, 310, 34, 34);
    glow(ctx, 410, 330, 160, '255,170,80', 0.15);
    ctx.fillStyle = '#7c6e4d'; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(560 + i * 26, 404 - (i % 2) * 14, 14, 8, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#6b4a2b'; ctx.fillRect(552, 368, 190, 10);
    person(ctx, 620, 404, 0.75, '#0a0a10', 'gun', t);
  },
  // Hết chương 1
  titanFalls(ctx, t) {
    sky(ctx, BLOOD); moon(ctx, 760, 100, 40, '#d8432e');
    skyline(ctx, 21, 420, '#0e0608', 0.01);
    ground(ctx, 420, '#2a1a18', '#0e0808');
    glow(ctx, 600, 400, 260, '255,60,40', 0.12);
    bigFall(ctx, 560, 470, t, '#3a2a26');
    ctx.fillStyle = '#7c6e4d'; ctx.fillRect(160, 400, 80, 80);
    person(ctx, 120, 480, 0.8, '#08080c', 'gun', t);
  },
  heliLanding(ctx, t) {
    sky(ctx, DAWN); sun(ctx, 200, 380, 30);
    mountains(ctx, 9, 360, 80, '#3a2a3a');
    ctx.fillStyle = '#1a1418'; ctx.beginPath(); ctx.moveTo(0, H); ctx.quadraticCurveTo(480, 300, W, H); ctx.fill();
    const k = ease(t / 4);
    heli(ctx, lerp(W + 100, 520, k), lerp(120, 300, k), 1.3, t);
    for (let i = 0; i < 3; i++) person(ctx, 300 + i * 40, 470 - i * 6, 0.7, '#0e0a0e', 'wave', t + i);
    for (let i = 0; i < 18; i++) { const a = (t * 3 + i) % 1; ctx.fillStyle = `rgba(200,180,160,${0.3 * (1 - a)})`; ctx.beginPath(); ctx.arc(520 + Math.cos(i) * a * 160, 400 + a * 30, 10 + a * 20, 0, TAU); ctx.fill(); }
  },
  heliDoor(ctx, t) {
    sky(ctx, DAWN); sun(ctx, 820, 330, 26);
    mountains(ctx, 9, 360, 60, '#3a2a3a');
    ctx.fillStyle = '#1a1418'; ctx.fillRect(0, 420, W, H - 420);
    // thân trực thăng nhìn ngang
    ctx.fillStyle = '#1a1a22';
    roundRect(ctx, 300, 200, 360, 170, 60); ctx.fill();
    ctx.fillRect(640, 250, 300, 34); ctx.fillRect(920, 200, 24, 90);
    ctx.fillStyle = 'rgba(140,190,230,0.45)'; roundRect(ctx, 310, 220, 70, 70, 26); ctx.fill();
    ctx.strokeStyle = '#1a1a22'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(320, 410); ctx.lineTo(640, 410); ctx.moveTo(370, 370); ctx.lineTo(360, 410); ctx.moveTo(590, 370); ctx.lineTo(600, 410); ctx.stroke();
    const bl = 300 * Math.abs(Math.cos(t * 26));
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(480 - bl, 182); ctx.lineTo(480 + bl, 182); ctx.stroke();
    ctx.fillRect(472, 182, 16, 20);
    // khoang cửa mở có đèn bên trong
    ctx.fillStyle = 'rgba(255,220,160,0.35)'; ctx.fillRect(420, 230, 170, 140);
    ctx.save(); ctx.scale(1.5, 1.5); drawCharacter(ctx, 330, 246, -0.4, 'pistol', 22, 0, t, CHARACTERS.phong); ctx.restore();
    // Lan và Ông Tư ở lại dưới đất
    ctx.save(); ctx.scale(1.5, 1.5); drawCharacter(ctx, 200, 280, 0.9, 'pistol', 22, 0, t, CHARACTERS.lan); drawCharacter(ctx, 160, 282, 0.7, 'rifle', 38, 0, t + 1, CHARACTERS.tu); ctx.restore();
    const close = ease((t - 4) / 2);
    ctx.fillStyle = '#24242c'; ctx.fillRect(420, 230, 170 * close, 140);
    for (let i = 0; i < 14; i++) { const a = (t * 2.5 + i / 14) % 1; ctx.fillStyle = `rgba(200,180,160,${0.25 * (1 - a)})`; ctx.beginPath(); ctx.arc(480 + Math.cos(i * 2) * a * 260, 425 + a * 20, 10 + a * 20, 0, TAU); ctx.fill(); }
  },
  heliOverSea(ctx, t) {
    sky(ctx, DAWN); sun(ctx, 760, 330, 34);
    sea(ctx, 340, t, '#2a2a40', 'rgba(255,200,150,');
    heli(ctx, 300 + Math.sin(t * 0.5) * 30, 180 + Math.sin(t) * 6, 1.1, t, false);
    ctx.fillStyle = '#1a1626'; ctx.beginPath(); ctx.moveTo(W - 220, 340); ctx.lineTo(W - 120, 300); ctx.lineTo(W, 330); ctx.lineTo(W, 340); ctx.fill();
  },
  harborDrop(ctx, t) {
    sky(ctx, NIGHT); stars(ctx, 13, 70); moon(ctx, 760, 90, 30);
    sea(ctx, 330, t);
    ctx.fillStyle = '#191a2c';
    for (const cx of [460, 680]) { ctx.fillRect(cx, 200, 5, 140); ctx.fillRect(cx + 40, 200, 5, 140); ctx.fillRect(cx - 90, 190, 200, 10); }
    ctx.fillStyle = '#26282e'; ctx.fillRect(0, 380, W, H - 380);
    const k = ease(t / 5);
    heli(ctx, lerp(380, -200, k), lerp(260, 80, k), 0.9, t);
    ctx.save(); ctx.scale(1.4, 1.4); drawCharacter(ctx, 250, 340, 0.3, 'pistol', 22, 0, t, CHARACTERS.phong); ctx.restore();
  },
  // Hết màn 1
  shipArrives(ctx, t) {
    sky(ctx, DAWN); sun(ctx, 300, 320, 30);
    sea(ctx, 330, t, '#3a2a40', 'rgba(255,200,150,');
    const k = ease(t / 6);
    ship(ctx, lerp(W + 200, 600, k), 334, 1.4);
    if (t > 2 && t < 4) for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(255,240,200,${0.4 - i * 0.1})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lerp(W + 200, 600, k) - 20, 210, 20 + i * 18 + (t % 1) * 20, -0.8, 0.2); ctx.stroke(); }
    ctx.fillStyle = '#2a2830'; ctx.fillRect(0, 400, 380, H - 400);
    person(ctx, 280, 400, 0.7, '#0e0a10', 'wave', t);
  },
  shipDeck(ctx, t) {
    sky(ctx, DAWN);
    sea(ctx, 360, t, '#3a2a40', 'rgba(255,200,150,');
    ship(ctx, 560, 380, 2.0);
    ctx.save(); ctx.scale(1.25, 1.25); drawCharacter(ctx, 420, 254, -0.6, 'smg', 30, 0, t, CHARACTERS.bao); drawCharacter(ctx, 460, 254, -0.5, 'shotgun', 34, 0, t + 1, CHARACTERS.mai); ctx.restore();
    ctx.fillStyle = '#2a2830'; ctx.fillRect(0, 430, 260, H - 430);
    person(ctx, 180, 430, 0.7, '#0e0a10', 'stand', t);
  },
  // Màn 2
  radioSignal(ctx, t) {
    ctx.fillStyle = '#0e1418'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(120,200,160,0.12)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(120,200,160,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(120, 420); ctx.bezierCurveTo(300, 380, 420, 300, 620, 200); ctx.stroke();
    ctx.fillStyle = '#7ad0a0'; ctx.font = '600 14px "Roboto Mono", monospace';
    ctx.fillText('VỌNG HẢI', 90, 446); ctx.fillText('HỒNG SƠN', 630, 196);
    radioWaves(ctx, 620, 200, t, '120,240,160');
    ctx.fillStyle = `rgba(255,80,60,${0.6 + Math.sin(t * 6) * 0.4})`; ctx.beginPath(); ctx.arc(620, 200, 7, 0, TAU); ctx.fill();
    ctx.fillStyle = '#7ad0a0'; ctx.font = '500 12px "Roboto Mono", monospace';
    ctx.fillText(`TẦN SỐ 144.${String(Math.floor(t * 7) % 100).padStart(2, '0')} MHz · TÍN HIỆU CẦU CỨU`, 40, 50);
  },
  riverBoat(ctx, t) {
    sky(ctx, NIGHT); stars(ctx, 17, 80); moon(ctx, 220, 90, 26);
    mountains(ctx, 19, 300, 140, '#10142a', 70);
    mountains(ctx, 23, 360, 90, '#0c1020', 60);
    sea(ctx, 380, t, '#0a0e1c', 'rgba(220,220,240,');
    for (let i = 0; i < 22; i++) { ctx.fillStyle = `rgba(240,230,200,${0.06 + (i % 3) * 0.04})`; ctx.fillRect(200 + Math.sin(i + t) * 20, 386 + i * 7, 40 + (i % 4) * 14, 2); } // ánh trăng trên sông
    const bx = 300 + t * 16;
    glow(ctx, bx, 390, 120, '255,230,160', 0.12);
    ctx.fillStyle = '#3a3440'; ctx.beginPath(); ctx.moveTo(bx - 60, 390); ctx.lineTo(bx + 70, 390); ctx.lineTo(bx + 54, 406); ctx.lineTo(bx - 52, 406); ctx.fill();
    ctx.fillStyle = '#5a5060'; ctx.fillRect(bx - 56, 388, 124, 3);
    ctx.save(); ctx.scale(0.9, 0.9); drawCharacter(ctx, bx / 0.9, 392 / 0.9, 0.2, 'pistol', 22, 0, t, CHARACTERS.phong); ctx.restore();
    ctx.strokeStyle = 'rgba(220,220,240,0.25)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx - 50, 400); ctx.lineTo(bx - 200, 410); ctx.stroke();
    glow(ctx, bx + 58, 394, 40, '255,230,160', 0.4);
  },
  damGate(ctx, t) {
    sky(ctx, NIGHT); stars(ctx, 29, 60);
    mountains(ctx, 31, 250, 100, '#141a2c');
    ctx.fillStyle = '#2a2d36'; ctx.beginPath(); ctx.moveTo(100, H); ctx.lineTo(200, 220); ctx.lineTo(W, 220); ctx.lineTo(W, H); ctx.fill();
    for (let x = 240; x < W; x += 70) { ctx.fillStyle = 'rgba(255,210,120,0.85)'; ctx.fillRect(x, 206, 6, 4); glow(ctx, x + 3, 210, 30, '255,210,120', 0.2); }
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#14161c'; ctx.fillRect(330 + i * 150, 260, 60, 40); for (let k = 0; k < 6; k++) { ctx.fillStyle = 'rgba(150,180,220,0.2)'; ctx.fillRect(334 + i * 150 + k * 9, 300, 2, 240); } }
    ctx.save(); ctx.scale(1.5, 1.5); drawCharacter(ctx, 100, 340, 0, 'rifle', 44, 0, t, CHARACTERS.phong); ctx.restore();
  },
  damCrack(ctx, t) {
    sky(ctx, DAWN);
    ctx.fillStyle = '#2a2d36'; ctx.fillRect(0, 160, W, H - 160);
    ctx.strokeStyle = '#0a0a0e'; ctx.lineWidth = 4;
    const k = Math.min(1, t / 2.5);
    ctx.beginPath(); ctx.moveTo(480, 160);
    const pts = [[470, 220], [500, 270], [460, 330], [510, 400], [480, 470], [520, 540]];
    pts.slice(0, Math.ceil(k * pts.length)).forEach(([x, y]) => ctx.lineTo(x, y)); ctx.stroke();
    if (t > 2) for (let i = 0; i < 30; i++) {
      const a = ((t * 2 + i / 30) % 1);
      ctx.fillStyle = `rgba(160,190,230,${0.6 * (1 - a)})`;
      ctx.beginPath(); ctx.arc(490 + Math.sin(i * 3) * 30 + a * (i % 2 ? 140 : -140), 300 + a * 260, 6 + a * 14, 0, TAU); ctx.fill();
    }
    bigFall(ctx, 760, 540, t, '#141410');
  },
  steelGate(ctx, t) {
    ctx.fillStyle = '#0e1016'; ctx.fillRect(0, 0, W, H);
    const k = ease((t - 2) / 5);
    const gap = lerp(380, 0, k);
    ctx.save(); ctx.beginPath(); ctx.rect(W / 2 - gap / 2, 80, gap, 400); ctx.clip();
    sky(ctx, DAWN);
    mountains(ctx, 33, 380, 80, '#2a2030');
    for (const [px, ph] of [[420, 0], [540, 1.3]]) {
      person(ctx, px, 470, 0.9, '#0a080c', 'gun', t);
      if (Math.sin(t * 22 + ph) > 0.4) glow(ctx, px + 52, 396, 40, '255,200,100', 0.8);
    }
    for (let i = 0; i < 8; i++) zombie(ctx, 640 + i * 40 - (t * 10) % 40, 480, 0.9, '#080608', t + i);
    ctx.restore();
    ctx.fillStyle = '#3a3e48';
    ctx.fillRect(0, 60, W / 2 - gap / 2, 440); ctx.fillRect(W / 2 + gap / 2, 60, W / 2, 440);
    ctx.fillStyle = '#e8c040'; for (let x = 0; x < W; x += 60) { if (Math.abs(x - W / 2) > gap / 2) { ctx.beginPath(); ctx.moveTo(x, 470); ctx.lineTo(x + 30, 470); ctx.lineTo(x + 50, 500); ctx.lineTo(x + 20, 500); ctx.fill(); } }
  },
  baseInterior(ctx, t) {
    sky(ctx, NIGHT); stars(ctx, 37, 50);
    mountains(ctx, 39, 280, 80, '#141a2a');
    ctx.fillStyle = '#1b1f2c'; ctx.fillRect(420, 240, 380, 180);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 11; c++) { ctx.fillStyle = (r + c) % 3 ? 'rgba(140,220,230,0.5)' : 'rgba(255,210,120,0.55)'; ctx.fillRect(434 + c * 33, 256 + r * 30, 18, 12); }
    lattice(ctx, 860, 90, 420, 22, '#1a1d28');
    const a = Math.sin(t * 0.7) * 0.5 + 0.7;
    const g = ctx.createLinearGradient(260, 220, 260 + Math.cos(a) * 600, 220 + Math.sin(a) * 300);
    g.addColorStop(0, 'rgba(255,245,210,0.3)'); g.addColorStop(1, 'rgba(255,245,210,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(260, 220); ctx.lineTo(260 + Math.cos(a) * 600 - 60, 220 + Math.sin(a) * 300 + 60); ctx.lineTo(260 + Math.cos(a) * 600 + 60, 220 + Math.sin(a) * 300 - 60); ctx.fill();
    ground(ctx, 420, '#2c2e33', '#141518');
    ctx.save(); ctx.scale(1.4, 1.4); drawCharacter(ctx, 170, 330, 0.2, 'pistol', 22, 0, t, CHARACTERS.khoa); drawCharacter(ctx, 205, 332, 0.4, 'smg', 30, 0, t + 1, CHARACTERS.vy); drawCharacter(ctx, 110, 334, 0, 'rifle', 44, 0, t, CHARACTERS.phong); ctx.restore();
  },
  // Hết màn 2
  zeroFalls(ctx, t) {
    sky(ctx, BLOOD); moon(ctx, 760, 100, 40, '#d8432e');
    ctx.fillStyle = '#3a3e48'; ctx.fillRect(0, 200, 160, 300);
    ground(ctx, 440, '#2c2a2a', '#100e0e');
    bigFall(ctx, 560, 480, t, '#d8d0c4');
  },
  broadcastTower(ctx, t) {
    sky(ctx, DAWN); sun(ctx, 160, 400, 30);
    mountains(ctx, 41, 400, 80, '#3a2a3a');
    lattice(ctx, 560, 60, 470, 40, '#1a1418');
    radioWaves(ctx, 560, 64, t);
    radioWaves(ctx, 560, 64, t + 1.5, '255,200,140');
    ground(ctx, 470, '#2a2228', '#100c10');
    person(ctx, 520, 470, 0.6, '#0e0a10', 'stand', t);
  },
  coolerBox(ctx, t) {
    ctx.fillStyle = '#121418'; ctx.fillRect(0, 0, W, H);
    glow(ctx, W / 2, 260, 340, '140,220,230', 0.12);
    ctx.fillStyle = '#d8dce0'; ctx.fillRect(360, 250, 240, 140);
    ctx.fillStyle = '#b8bcc0'; ctx.fillRect(360, 250, 240, 26);
    ctx.fillStyle = '#c03030'; ctx.fillRect(470, 300, 20, 60); ctx.fillRect(450, 320, 60, 20);
    ctx.fillStyle = `rgba(80,255,120,${0.6 + Math.sin(t * 4) * 0.3})`; ctx.beginPath(); ctx.arc(580, 290, 6, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1a1c20'; ctx.font = 'bold 11px "Roboto Mono", monospace'; ctx.fillText('CHỦNG GỐC · -80°C', 380, 380);
    for (let i = 0; i < 8; i++) { const a = (t * 0.4 + i / 8) % 1; ctx.fillStyle = `rgba(220,240,255,${0.2 * (1 - a)})`; ctx.beginPath(); ctx.arc(380 + i * 28, 250 - a * 60, 10 + a * 12, 0, TAU); ctx.fill(); }
  },
  // Màn 3
  highwayRoad(ctx, t) {
    sky(ctx, DUSK); sun(ctx, 480, 330, 26);
    ctx.fillStyle = '#2a1e28'; ctx.fillRect(0, 330, W, 30);
    ctx.fillStyle = '#1c1a1e'; ctx.beginPath(); ctx.moveTo(430, 340); ctx.lineTo(530, 340); ctx.lineTo(W + 200, H); ctx.lineTo(-200, H); ctx.fill();
    for (let i = 0; i < 8; i++) { const k = ((t * 0.5 + i / 8) % 1); const y = 340 + k * k * 200; ctx.fillStyle = `rgba(240,240,240,${0.6 * k})`; ctx.fillRect(478 - k * 4, y, 4 + k * 8, 6 + k * 18); }
    ctx.fillStyle = '#1e5a3a'; ctx.fillRect(640, 200, 140, 50); ctx.strokeStyle = '#d8e8d8'; ctx.strokeRect(644, 204, 132, 42);
    ctx.fillStyle = '#e8f0e8'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('THỦ ĐÔ', 656, 222); ctx.fillText('300 km ↑', 656, 238);
    truck(ctx, 480, 500, 1.4, '#3a3428');
    for (const fx of [180, 820]) fire(ctx, fx, 420, 1, t + fx);
  },
  carWall(ctx, t) {
    sky(ctx, NIGHT); stars(ctx, 43, 50);
    ctx.fillStyle = '#1b1c26'; ctx.fillRect(0, 280, W, 16);
    ground(ctx, 400, '#2a2b2f', '#141417');
    const cols = ['#5a2a22', '#2a3a5a', '#4a4a44', '#3a2a1e'];
    for (let i = 0; i < 6; i++) { ctx.fillStyle = cols[i % 4]; ctx.fillRect(140 + i * 110, 380 - (i % 2) * 20, 100, 50); ctx.fillStyle = '#0a0a0e'; ctx.beginPath(); ctx.arc(160 + i * 110, 432 - (i % 2) * 20, 10, 0, TAU); ctx.arc(220 + i * 110, 432 - (i % 2) * 20, 10, 0, TAU); ctx.fill(); }
    fire(ctx, 380, 380, 1, t); fire(ctx, 700, 370, 0.8, t + 2);
    ctx.save(); ctx.scale(1.4, 1.4); drawCharacter(ctx, 80, 350, -0.1, 'rifle', 44, 0, t, CHARACTERS.phong); ctx.restore();
    for (let i = 0; i < 4; i++) { const k = (t * 0.5 + i * 0.25) % 1; zombie(ctx, 900 - k * 200, 300 + Math.sin(k * Math.PI) * -100, 0.7, '#0a080a', t); }
  },
  juggernautFalls(ctx, t) {
    sky(ctx, BLOOD);
    ctx.fillStyle = '#1b1c26'; ctx.fillRect(0, 300, W, 16);
    ground(ctx, 420, '#2a2b2f', '#141417');
    bigFall(ctx, 560, 480, t, '#3a3a40');
  },
  tollGate(ctx, t) {
    sky(ctx, DAWN); sun(ctx, 760, 360, 30);
    ground(ctx, 400, '#2a2628', '#121012');
    ctx.fillStyle = '#2a2a34'; ctx.fillRect(200, 220, 560, 30);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = '#1e1e26'; ctx.fillRect(230 + i * 120, 250, 30, 150); ctx.fillStyle = 'rgba(255,220,140,0.6)'; ctx.fillRect(236 + i * 120, 270, 18, 12); }
    ctx.fillStyle = '#e8e8e8'; ctx.font = 'bold 14px sans-serif'; ctx.fillText('TRẠM THU PHÍ · CỬA NGÕ THỦ ĐÔ', 330, 242);
    truck(ctx, 420, 420, 1.2, '#4a3a28');
    ctx.save(); ctx.scale(1.3, 1.3); drawCharacter(ctx, 400, 324, 0.2, 'shotgun', 34, 0, t, CHARACTERS.tuan); ctx.restore();
    const k = (t * 0.08) % 1;
    ctx.save(); ctx.translate(lerp(-100, W + 100, k), 120); ctx.fillStyle = '#1a1620';
    ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.lineTo(50, -4); ctx.lineTo(-40, -6); ctx.fill(); ctx.fillRect(-8, -24, 14, 44); ctx.restore();
    person(ctx, 120, 470, 0.7, '#0e0a10', 'walk', t);
  },
  capitalSkyline(ctx, t) {
    sky(ctx, NIGHT); stars(ctx, 47, 50, 0.6);
    skyline(ctx, 51, 420, '#121428', 0.04, 120, 300);
    skyline(ctx, 53, 420, '#0c0e1e', 0.06, 60, 200);
    ctx.fillStyle = '#0a0c18'; ctx.beginPath(); ctx.moveTo(470, 420); ctx.lineTo(480, 80); ctx.lineTo(490, 420); ctx.fill();
    if (Math.sin(t * 3) > 0.4) glow(ctx, 480, 82, 24, '255,40,30', 0.8);
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(700, 250, 110, 170); ctx.fillStyle = '#c03030'; ctx.fillRect(744, 270, 22, 60); ctx.fillRect(725, 289, 60, 22);
    glow(ctx, 755, 300, 120, '255,80,80', 0.15);
    ground(ctx, 420, '#2e2c2c', '#151414');
    person(ctx, 200, 480, 0.8, '#0a0a10', 'walk', t);
  },
  metroMouth(ctx, t) {
    ctx.fillStyle = '#121218'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#05050a'; ctx.beginPath(); ctx.moveTo(300, 160); ctx.lineTo(660, 160); ctx.lineTo(760, 460); ctx.lineTo(200, 460); ctx.fill();
    for (let i = 0; i < 6; i++) { ctx.fillStyle = '#1e1e26'; ctx.fillRect(260 + i * 16, 300 + i * 26, 440 - i * 4, 8); }
    ctx.fillStyle = '#c03030'; ctx.beginPath(); ctx.arc(480, 120, 22, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 26px sans-serif'; ctx.fillText('M', 468, 130);
    for (let i = 0; i < 12; i++) { const ex = 340 + (i * 53) % 280, ey = 200 + (i * 37) % 160; if (Math.sin(t * 2 + i * 1.7) > 0.2) { ctx.fillStyle = '#ff3b2f'; ctx.fillRect(ex, ey, 3, 2); ctx.fillRect(ex + 7, ey, 3, 2); } }
    for (let i = 0; i < 6; i++) { const a = (t * 0.3 + i / 6) % 1; ctx.fillStyle = `rgba(200,220,240,${0.12 * (1 - a)})`; ctx.beginPath(); ctx.arc(480 + Math.sin(i) * 60, 300 - a * 200, 30 + a * 60, 0, TAU); ctx.fill(); }
  },
  // Kết thúc
  queenFalls(ctx, t) {
    sky(ctx, BLOOD);
    skyline(ctx, 57, 430, '#0e0608', 0.01, 100, 260);
    ground(ctx, 430, '#2a1a1e', '#0e080a');
    bigFall(ctx, 560, 480, t, '#3a2440');
    for (let i = 0; i < 10; i++) { const k = Math.min(1, Math.max(0, (t - 1.5 - i * 0.08))); ctx.save(); ctx.translate(200 + i * 70, 490); ctx.rotate(k * 1.4); ctx.fillStyle = '#1a1020'; ctx.fillRect(-6, -40, 12, 40); ctx.beginPath(); ctx.arc(0, -46, 7, 0, TAU); ctx.fill(); ctx.restore(); }
  },
  hospitalRoof(ctx, t) {
    sky(ctx, DAWN); sun(ctx, 200, 380, 32);
    skyline(ctx, 61, 470, '#2a1e2a', 0.02, 80, 220);
    ctx.fillStyle = '#d8d8d4'; ctx.fillRect(360, 300, 340, 240);
    ctx.fillStyle = '#c03030'; ctx.fillRect(510, 330, 40, 110); ctx.fillRect(475, 365, 110, 40);
    ctx.strokeStyle = 'rgba(230,200,60,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(530, 296, 110, 18, 0, 0, TAU); ctx.stroke();
    const k = ease(t / 4);
    heli(ctx, lerp(W + 120, 560, k), lerp(100, 250, k), 1.1, t, false);
    person(ctx, 420, 300, 0.55, '#0e0a10', 'wave', t);
  },
  heliSwarm(ctx, t) {
    sky(ctx, DAWN); sun(ctx, 480, 380, 40);
    skyline(ctx, 63, 470, '#2a1e2a', 0.04, 100, 280);
    for (let i = 0; i < 6; i++) { const k = ((t * 0.07 + i * 0.17) % 1); heli(ctx, lerp(-120, W + 120, k), 90 + i * 34 + Math.sin(t + i) * 6, 0.45 + (i % 3) * 0.12, t + i, false); }
  },
  phongHeadphones(ctx, t) {
    sky(ctx, DAWN); sun(ctx, 700, 300, 50 + t);
    ctx.fillStyle = '#2a1e28'; ctx.fillRect(0, 440, W, H - 440);
    ctx.save(); ctx.translate(-120, -520); ctx.scale(3.6, 3.6); drawCharacter(ctx, 110, 260, 0.9, 'rifle', 44, 0, t, CHARACTERS.phong); ctx.restore();
    radioWaves(ctx, 300, 220, t, '255,230,180');
  },
};

export function hasShot(id) { return !!SHOTS[id]; }

// Vẽ một shot toàn màn hình, có viền tối và hạt nhiễu phim
export function drawShot(ctx, id, t) {
  const f = SHOTS[id];
  if (!f) return false;
  ctx.save();
  // máy quay trôi rất chậm
  const z = 1 + Math.min(t, 12) * 0.006;
  ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  f(ctx, t);
  ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  if (t < 0.6) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.6})`; ctx.fillRect(0, 0, W, H); } // mờ dần khi đổi cảnh
  return true;
}
