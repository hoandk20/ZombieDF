import { W, H, HORIZON, BARRICADE_BACK, BARRICADE_X, BARRICADE_TOP, LANE_MAX } from './config.js';
import { roundRect } from './zombie.js';

// PRNG cố định để nền giống nhau mỗi lần
function seeded(seed) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

export function makeBackground(bloodMoon = false, variant = 'town') {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const rnd = seeded(1337);

  const sky = g.createLinearGradient(0, 0, 0, HORIZON);
  if (bloodMoon) {
    sky.addColorStop(0, '#0f0508');
    sky.addColorStop(0.6, '#2a0f18');
    sky.addColorStop(1, '#5a1a1e');
  } else {
    sky.addColorStop(0, '#070a17');
    sky.addColorStop(0.6, '#1a1734');
    sky.addColorStop(1, '#3a2742');
  }
  g.fillStyle = sky;
  g.fillRect(0, 0, W, HORIZON);

  for (let i = 0; i < 110; i++) {
    g.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.7})`;
    const s = rnd() < 0.1 ? 2 : 1;
    g.fillRect(rnd() * W, rnd() * 300, s, s);
  }

  // mặt trăng
  const mx = 790, my = 92;
  const glow = g.createRadialGradient(mx, my, 20, mx, my, 140);
  glow.addColorStop(0, bloodMoon ? 'rgba(255,60,40,0.45)' : 'rgba(255,240,200,0.35)');
  glow.addColorStop(1, 'rgba(255,60,40,0)');
  g.fillStyle = glow;
  g.fillRect(mx - 150, my - 150, 300, 300);
  g.fillStyle = bloodMoon ? '#d8432e' : '#f3e9c8';
  g.beginPath(); g.arc(mx, my, bloodMoon ? 42 : 36, 0, Math.PI * 2); g.fill();
  g.fillStyle = bloodMoon ? 'rgba(120,20,15,0.5)' : 'rgba(180,170,140,0.5)';
  g.beginPath(); g.arc(mx - 10, my - 8, 7, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(mx + 12, my + 10, 5, 0, Math.PI * 2); g.fill();

  if (variant === 'harbor') drawHarbor(g, rnd);
  else {
  // thành phố đổ nát phía xa
  let x = 240;
  while (x < W) {
    const bw = 30 + rnd() * 60;
    const bh = 40 + rnd() * 120;
    g.fillStyle = '#141327';
    g.fillRect(x, HORIZON - bh, bw, bh);
    if (rnd() < 0.4) { // mái gãy
      g.beginPath();
      g.moveTo(x, HORIZON - bh);
      g.lineTo(x + bw * rnd(), HORIZON - bh - 15 * rnd());
      g.lineTo(x + bw, HORIZON - bh);
      g.fill();
    }
    for (let wy = HORIZON - bh + 8; wy < HORIZON - 10; wy += 14) {
      for (let wx = x + 5; wx < x + bw - 6; wx += 10) {
        if (rnd() < 0.06) { g.fillStyle = 'rgba(255,200,90,0.7)'; g.fillRect(wx, wy, 4, 6); }
      }
    }
    x += bw + rnd() * 10;
  }
  // cây chết
  g.strokeStyle = '#0d0c1a';
  for (let i = 0; i < 5; i++) {
    const tx = 300 + rnd() * 640, base = HORIZON + 2;
    g.lineWidth = 4;
    g.beginPath(); g.moveTo(tx, base); g.lineTo(tx + 3, base - 70); g.stroke();
    g.lineWidth = 2;
    for (let b = 0; b < 4; b++) {
      const by = base - 30 - b * 10;
      g.beginPath(); g.moveTo(tx + 2, by);
      g.lineTo(tx + 2 + (rnd() - 0.5) * 50, by - 10 - rnd() * 20); g.stroke();
    }
  }

  // mặt đất
  const ground = g.createLinearGradient(0, HORIZON, 0, H);
  ground.addColorStop(0, '#2c2a26');
  ground.addColorStop(1, '#14130f');
  g.fillStyle = ground;
  g.fillRect(0, HORIZON, W, H - HORIZON);
  // đường nhựa nứt
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.fillRect(0, 455, W, 40);
  g.strokeStyle = 'rgba(200,190,120,0.18)';
  g.lineWidth = 3;
  g.setLineDash([26, 22]);
  g.beginPath(); g.moveTo(240, 476); g.lineTo(W, 476); g.stroke();
  g.setLineDash([]);
  for (let i = 0; i < 60; i++) {
    g.strokeStyle = `rgba(60,80,40,${0.3 + rnd() * 0.4})`;
    g.lineWidth = 1;
    const gx = rnd() * W, gy = HORIZON + 4 + rnd() * (H - HORIZON);
    g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + (rnd() - 0.5) * 6, gy - 5 - rnd() * 5); g.stroke();
  }

  // ngôi nhà phía sau người chơi
  g.fillStyle = '#231c1b';
  g.fillRect(0, 290, 70, 200);
  g.fillStyle = '#1a1414';
  g.beginPath(); g.moveTo(-10, 292); g.lineTo(35, 250); g.lineTo(80, 292); g.fill();
  g.fillStyle = 'rgba(255,190,90,0.55)';
  g.fillRect(16, 320, 22, 26);
  g.strokeStyle = '#1a1414'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(27, 320); g.lineTo(27, 346); g.moveTo(16, 333); g.lineTo(38, 333); g.stroke();

  }
  // sương mù sát đất
  const fog = g.createLinearGradient(0, HORIZON - 30, 0, HORIZON + 40);
  fog.addColorStop(0, 'rgba(120,110,150,0)');
  fog.addColorStop(0.5, 'rgba(120,110,150,0.12)');
  fog.addColorStop(1, 'rgba(120,110,150,0)');
  g.fillStyle = fog;
  g.fillRect(0, HORIZON - 30, W, 70);
  return c;
}

function drawHarbor(g, rnd) {
  // biển đêm
  const sea = g.createLinearGradient(0, 330, 0, HORIZON);
  sea.addColorStop(0, '#141a30');
  sea.addColorStop(1, '#0b0f1e');
  g.fillStyle = sea;
  g.fillRect(0, 330, W, HORIZON - 330);
  // đảo xa
  g.fillStyle = '#10142a';
  g.beginPath(); g.moveTo(240, 335); g.quadraticCurveTo(320, 300, 420, 334); g.fill();
  g.beginPath(); g.moveTo(560, 334); g.quadraticCurveTo(640, 316, 700, 334); g.fill();
  // ánh trăng trên mặt nước
  for (let i = 0; i < 26; i++) {
    const y = 338 + i * 3, w = 10 + rnd() * 50;
    g.fillStyle = `rgba(240,225,190,${0.05 + rnd() * 0.12})`;
    g.fillRect(790 - w / 2 + (rnd() - 0.5) * 30, y, w, 1.5);
  }
  // cần cẩu
  const crane = (x, h) => {
    g.strokeStyle = '#191a2c'; g.fillStyle = '#191a2c'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(x, HORIZON); g.lineTo(x, HORIZON - h); g.moveTo(x + 40, HORIZON); g.lineTo(x + 40, HORIZON - h); g.stroke();
    g.lineWidth = 2;
    for (let y = HORIZON; y > HORIZON - h; y -= 22) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 40, y - 22); g.stroke(); }
    g.fillRect(x - 90, HORIZON - h - 12, 200, 10);
    g.fillRect(x + 6, HORIZON - h - 30, 28, 20);
    g.beginPath(); g.moveTo(x - 60, HORIZON - h - 2); g.lineTo(x - 60, HORIZON - h + 50); g.stroke();
    g.fillStyle = 'rgba(255,60,40,0.8)'; g.fillRect(x + 104, HORIZON - h - 14, 4, 4);
  };
  crane(470, 150);
  crane(690, 120);
  // container chồng
  const colors = ['#3a2424', '#24323a', '#2f3a24', '#3a3424', '#2a2638'];
  let x = 250;
  while (x < W) {
    const stack = 1 + Math.floor(rnd() * 3);
    for (let k = 0; k < stack; k++) {
      g.fillStyle = colors[Math.floor(rnd() * colors.length)];
      g.fillRect(x, HORIZON - 22 * (k + 1), 64, 21);
      g.fillStyle = 'rgba(0,0,0,0.25)';
      for (let r = 4; r < 64; r += 6) g.fillRect(x + r, HORIZON - 22 * (k + 1) + 2, 2, 17);
    }
    x += 66 + (rnd() < 0.35 ? 60 + rnd() * 80 : 0);
  }
  // hải đăng
  g.fillStyle = '#0f1222';
  g.beginPath(); g.moveTo(880, 336); g.lineTo(930, 336); g.lineTo(915, 300); g.lineTo(895, 300); g.fill();
  g.fillStyle = '#d8d2c0';
  g.beginPath(); g.moveTo(896, 300); g.lineTo(914, 300); g.lineTo(910, 222); g.lineTo(900, 222); g.fill();
  g.fillStyle = '#9a2a22';
  g.fillRect(898, 262, 14, 10); g.fillRect(900, 236, 10, 8);
  g.fillStyle = '#1a1a22'; g.fillRect(897, 210, 16, 12);
  g.fillStyle = 'rgba(255,230,150,0.9)'; g.fillRect(900, 212, 10, 8);
  // cầu tàu bê tông
  const ground = g.createLinearGradient(0, HORIZON, 0, H);
  ground.addColorStop(0, '#34363a');
  ground.addColorStop(1, '#17181b');
  g.fillStyle = ground;
  g.fillRect(0, HORIZON, W, H - HORIZON);
  g.fillStyle = 'rgba(0,0,0,0.3)';
  for (let px = 0; px < W; px += 120) g.fillRect(px, HORIZON, 2, H - HORIZON);
  g.fillStyle = 'rgba(220,180,40,0.35)';
  for (let px = 240; px < W; px += 50) g.fillRect(px, 470, 26, 4);
  g.fillStyle = '#1c1d22';
  for (let px = 300; px < W; px += 210) { g.fillRect(px, HORIZON + 4, 14, 14); g.fillRect(px - 3, HORIZON + 2, 20, 5); }
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(0,0,0,${0.15 + rnd() * 0.2})`;
    g.fillRect(rnd() * W, HORIZON + 5 + rnd() * (H - HORIZON), 6 + rnd() * 20, 1.5);
  }
  // nhà kho sau lưng người chơi
  g.fillStyle = '#20232a';
  g.fillRect(0, 270, 74, 220);
  g.fillStyle = '#2a2e36';
  for (let y = 300; y < 480; y += 8) g.fillRect(6, y, 54, 4);
  g.fillStyle = '#16181d';
  g.fillRect(0, 262, 80, 10);
  g.fillStyle = '#c9a44a';
  g.font = 'bold 14px sans-serif';
  g.fillText('03', 26, 290);
}

export function drawBarricade(ctx, ratio, variant = 'town') {
  const x0 = BARRICADE_BACK, x1 = BARRICADE_X, top = BARRICADE_TOP, bottom = LANE_MAX + 10;
  // bao cát
  const rows = 7;
  for (let row = 0; row < rows; row++) {
    const y = bottom - 15 - row * 16.5;
    if (ratio < 0.3 && row === rows - 1) continue;
    if (ratio < 0.12 && row === rows - 2) continue;
    for (let i = 0; i < 3; i++) {
      const bx = x0 + 1 + i * 24 + (row % 2) * 5;
      if (bx + 24 > x1 + 2) continue;
      ctx.fillStyle = (row + i) % 2 ? '#8a7b57' : '#7c6e4d';
      roundRect(ctx, bx, y, 25, 15, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  // ván gỗ đóng phía trước
  const planks = [
    { y: top + 6, a: -0.07 }, { y: top + 34, a: 0.05 }, { y: top + 64, a: -0.04 }, { y: top + 94, a: 0.05 },
  ];
  planks.forEach((p, i) => {
    if (ratio < 0.15 * (i + 1) && i < 3) return; // ván rơi dần khi hỏng
    ctx.save();
    ctx.translate((x0 + x1) / 2 + 2, p.y);
    ctx.rotate(p.a);
    ctx.fillStyle = variant === 'harbor' ? (i % 2 ? '#56636b' : '#6b5a46') : '#6b4a2b';
    ctx.fillRect(-44, -7, 88, 14);
    if (variant === 'harbor') { ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let r = -40; r < 44; r += 8) ctx.fillRect(r, -7, 2, 14); }
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(-44, 4, 88, 3);
    ctx.fillStyle = '#c9c9c9';
    ctx.fillRect(-38, -2, 3, 3); ctx.fillRect(35, -2, 3, 3);
    ctx.restore();
  });
  // cọc
  ctx.fillStyle = '#4e3520';
  ctx.fillRect(x1 - 8, top - 12, 8, bottom - top + 12);
  ctx.fillRect(x0 + 18, top - 4, 7, bottom - top + 4);
  // dây thép gai
  ctx.strokeStyle = 'rgba(170,170,170,0.7)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i <= 12; i++) {
    const px = x1 - 4 + Math.sin(i * 1.3) * 5;
    const py = top - 10 + i * ((bottom - top) / 12);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
  // vết nứt khi hư hỏng
  if (ratio < 0.6) {
    ctx.strokeStyle = 'rgba(20,10,5,0.7)';
    ctx.lineWidth = 2;
    const n = Math.round((1 - ratio) * 8);
    for (let i = 0; i < n; i++) {
      const cx = x0 + 10 + ((i * 37) % 60), cy = top + 10 + ((i * 53) % 80);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 6, cy + 8); ctx.lineTo(cx + 2, cy + 16); ctx.stroke();
    }
  }
}


// Biểu tượng vũ khí (dataURL), vẽ bằng canvas và lưu cache
const iconCache = {};
const GUN_SHAPES = {
  pistol: [[8, 10, 34, 9], [10, 18, 9, 16], [38, 11, 6, 6]],
  shotgun: [[2, 12, 20, 10], [20, 10, 72, 7], [22, 17, 34, 5], [18, 21, 8, 12]],
  smg: [[10, 10, 52, 11], [60, 13, 16, 5], [24, 20, 8, 16], [40, 20, 6, 12], [2, 13, 10, 6]],
  rifle: [[0, 12, 24, 10], [22, 11, 76, 6], [40, 4, 26, 5], [46, 17, 6, 10], [30, 16, 8, 8]],
  lmg: [[0, 12, 22, 10], [20, 9, 54, 12], [72, 12, 26, 5], [34, 21, 18, 12], [46, 4, 8, 6], [80, 17, 3, 12]],
  flamer: [[0, 12, 30, 12], [28, 14, 52, 6], [78, 11, 12, 10], [30, 22, 8, 12], [6, 24, 16, 10], [56, 8, 4, 6]],
  launcher: [[0, 10, 24, 14], [22, 8, 58, 16], [80, 10, 10, 12], [30, 24, 8, 12], [50, 3, 12, 5]],
};
export function weaponIcon(id) {
  if (iconCache[id]) return iconCache[id];
  const c = document.createElement('canvas');
  c.width = 100; c.height = 40;
  const g = c.getContext('2d');
  g.fillStyle = '#e9dcc0';
  if (id === 'grenade') {
    g.beginPath(); g.ellipse(50, 24, 11, 13, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(45, 7, 12, 6);
    g.strokeStyle = '#e9dcc0'; g.lineWidth = 2.5;
    g.beginPath(); g.arc(62, 11, 5, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.fillRect(40, 20, 20, 2); g.fillRect(40, 27, 20, 2);
  } else {
    for (const [x, y, w, h] of GUN_SHAPES[id] || []) g.fillRect(x, y, w, h);
  }
  iconCache[id] = c.toDataURL();
  return iconCache[id];
}

// Vẽ súng (dùng chung hình dáng với biểu tượng) trong hệ toạ độ đã xoay theo góc ngắm
export function drawGun(ctx, id, len) {
  const shapes = GUN_SHAPES[id] || GUN_SHAPES.pistol;
  let maxX = 0;
  for (const [x, , w] of shapes) maxX = Math.max(maxX, x + w);
  const k = (len + 4) / maxX;
  ctx.save();
  ctx.translate(10, -15 * k);
  ctx.scale(k, k);
  ctx.fillStyle = '#1c1d22';
  for (const [x, y, w, h] of shapes) ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (const [x, y, w] of shapes) ctx.fillRect(x, y, w, 1.6);
  if (id === 'flamer') { ctx.fillStyle = '#b8471e'; ctx.fillRect(6, 24, 16, 10); }
  ctx.restore();
}

// ---------- Nhân vật chi tiết (nhân vật chính + người sống sót) ----------
// Mỗi nhân vật là một "spec": màu da, kiểu tóc, trang phục, phụ kiện.
export const CHARACTERS = {
  phong: {
    skin: '#f2c48f', hair: 'spiky', hairColor: '#121214', head: 'headphones',
    outfit: 'shirtTie', top: '#eceff1', topShade: '#cfd5da', accent: '#2b2d34',
    pants: '#3d434c', shoes: '#141416', kneePads: true, gloves: '#3a2a22',
  },
  lan: {
    female: true, skin: '#f6d2b0', hair: 'ponytail', hairColor: '#1a1210', head: 'nurseCap',
    outfit: 'scrubs', top: '#cdeceb', topShade: '#a9d6d4', accent: '#d33a3a',
    pants: '#5fa8a6', shoes: '#f2f2f2', lips: '#d9576b', eyes: '#3a2418',
  },
  tu: {
    old: true, skin: '#c98e5e', hair: 'gray', hairColor: '#b9b4ab', head: 'hunterHat', beard: '#cfcac0',
    outfit: 'vest', top: '#d8c9a3', topShade: '#bfae84', accent: '#55603a',
    pants: '#5a4630', shoes: '#2a1d14', gloves: null,
  },
  bao: {
    skin: '#e3b088', hair: 'short', hairColor: '#2a1b12', head: 'goggles',
    outfit: 'overalls', top: '#8c949c', topShade: '#727a82', accent: '#2f5d80',
    pants: '#2f5d80', shoes: '#3a2a1c', gloves: '#e07a2a',
  },
  mai: {
    female: true, skin: '#f8d8bc', hair: 'bob', hairColor: '#6a3a1e', head: 'clip',
    outfit: 'jacket', top: '#f4f1ec', topShade: '#dcd6cc', accent: '#5b7fae',
    pants: '#1d1d24', skirt: '#8a3a4a', shoes: '#f0e6e0', lips: '#e0607a', eyes: '#4a2a18',
  },
};

// Vẽ một nhân vật nhìn nghiêng sang phải, cầm súng theo góc `ang`.
// Vai ở (x + 4, foot - 76) — khớp với điểm bắn trong game.
export function drawCharacter(ctx, x, foot, ang, weaponId, len, recoil = 0, t = 0, C = CHARACTERS.phong) {
  const br = Math.sin(t * 2.2 + x) * 0.7;
  const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16);
    const c = (v) => Math.max(0, Math.min(255, v + amt));
    return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
  };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const hx = x + 1, hy = foot - 92 + br * 0.5;
  const top = foot - 82 + br;

  // ---- tóc phía sau (đuôi ngựa / tóc bob) vẽ trước thân ----
  ctx.fillStyle = C.hairColor;
  if (C.hair === 'ponytail') {
    const sway = Math.sin(t * 2.5 + x) * 3;
    ctx.beginPath();
    ctx.moveTo(hx - 8, hy - 6);
    ctx.quadraticCurveTo(hx - 22, hy + 2 + sway * 0.3, hx - 18 + sway, hy + 30);
    ctx.quadraticCurveTo(hx - 13 + sway, hy + 34, hx - 11 + sway * 0.6, hy + 26);
    ctx.quadraticCurveTo(hx - 10, hy + 8, hx - 3, hy - 2);
    ctx.fill();
    ctx.fillStyle = C.accent; // dây buộc tóc
    ctx.beginPath(); ctx.arc(hx - 11, hy - 3, 2.4, 0, Math.PI * 2); ctx.fill();
  } else if (C.hair === 'bob') {
    ctx.beginPath();
    ctx.moveTo(hx - 12, hy - 4);
    ctx.quadraticCurveTo(hx - 15, hy + 10, hx - 9, hy + 13);
    ctx.lineTo(hx + 1, hy + 11);
    ctx.lineTo(hx + 2, hy - 2);
    ctx.fill();
  }

  // ---- chân ----
  const legCol = C.skirt ? C.pants : C.pants;
  ctx.strokeStyle = shade(legCol, -14);
  ctx.lineWidth = C.female ? 7.5 : 9;
  ctx.beginPath(); ctx.moveTo(x - 4, foot - 36); ctx.lineTo(x - 7, foot - 18); ctx.lineTo(x - 7, foot - 4); ctx.stroke();
  if (C.kneePads) { ctx.fillStyle = '#3d3128'; roundRect(ctx, x - 12, foot - 24, 9, 10, 3); ctx.fill(); }
  ctx.fillStyle = shade(C.shoes, -20); roundRect(ctx, x - 12, foot - 6, 12, 6, 2); ctx.fill();
  ctx.strokeStyle = legCol;
  ctx.beginPath(); ctx.moveTo(x + 5, foot - 36); ctx.lineTo(x + 8, foot - 18); ctx.lineTo(x + 7, foot - 4); ctx.stroke();
  if (C.kneePads) {
    ctx.fillStyle = '#4a3a2e'; roundRect(ctx, x + 3, foot - 24, 10, 11, 3); ctx.fill();
    ctx.fillStyle = '#7d8188'; ctx.beginPath(); ctx.arc(x + 9, foot - 18.5, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = C.shoes; roundRect(ctx, x + 2, foot - 6, 15, 6, 2); ctx.fill();
  if (C.shoes === '#f2f2f2' || C.shoes === '#f0e6e0') { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 2, foot - 2, 15, 2); }
  if (C.outfit === 'shirtTie') { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 6, foot - 32, 6, 7); }
  if (C.skirt) { // váy kẻ ô
    ctx.fillStyle = C.skirt;
    ctx.beginPath(); ctx.moveTo(x - 12, foot - 40); ctx.lineTo(x + 12, foot - 40); ctx.lineTo(x + 16, foot - 24); ctx.lineTo(x - 15, foot - 24); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1;
    for (let k = -10; k <= 12; k += 5) { ctx.beginPath(); ctx.moveTo(x + k, foot - 40); ctx.lineTo(x + k * 1.25, foot - 24); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x - 13, foot - 32); ctx.lineTo(x + 14, foot - 32); ctx.stroke();
  }

  // ---- thân ----
  const bw = C.female ? 22 : C.outfit === 'vest' ? 27 : 26;
  const bx = x - bw / 2;
  ctx.fillStyle = C.top;
  if (C.female) { // eo thon
    ctx.beginPath();
    ctx.moveTo(bx + 1, top + 4); ctx.quadraticCurveTo(bx, top, bx + 5, top);
    ctx.lineTo(bx + bw - 5, top); ctx.quadraticCurveTo(bx + bw, top, bx + bw, top + 4);
    ctx.quadraticCurveTo(bx + bw - 3, top + 24, bx + bw, foot - 38);
    ctx.lineTo(bx, foot - 38); ctx.quadraticCurveTo(bx + 3, top + 24, bx + 1, top + 4);
    ctx.fill();
  } else { roundRect(ctx, bx, top, bw, 48 - br, 6); ctx.fill(); }
  ctx.fillStyle = C.topShade;
  ctx.fillRect(bx + 1, top + 7, 5, foot - 40 - top - 7);

  if (C.outfit === 'shirtTie') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(x - 1, top + 1); ctx.lineTo(x + 6, top + 1); ctx.lineTo(x + 3, top + 7); ctx.fill();
    ctx.fillStyle = C.accent;
    ctx.beginPath(); ctx.moveTo(x + 2, top + 3); ctx.lineTo(x + 6, top + 3); ctx.lineTo(x + 7, top + 30); ctx.lineTo(x + 4, top + 34); ctx.lineTo(x + 2, top + 30); ctx.fill();
    ctx.strokeStyle = '#5e3f26'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x - 10, top + 2); ctx.lineTo(x + 10, top + 40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 9, top + 2); ctx.lineTo(x - 9, top + 44); ctx.stroke();
    ctx.fillStyle = '#c9a24a'; ctx.fillRect(x - 11, top + 20, 4, 4);
    ctx.fillStyle = '#2f2219'; ctx.fillRect(x - 13, foot - 38, 26, 5);
    ctx.fillStyle = '#4a3424'; roundRect(ctx, x - 13, foot - 41, 8, 10, 2); ctx.fill();
    ctx.fillStyle = '#b8902e'; ctx.fillRect(x + 6, foot - 40, 2, 4); ctx.fillRect(x + 9, foot - 40, 2, 4);
  } else if (C.outfit === 'scrubs') {
    ctx.fillStyle = C.skin; // cổ chữ V
    ctx.beginPath(); ctx.moveTo(x - 1, top); ctx.lineTo(x + 7, top); ctx.lineTo(x + 3, top + 9); ctx.fill();
    ctx.fillStyle = '#ffffff'; roundRect(ctx, x - 7, top + 12, 7, 7, 1.5); ctx.fill();
    ctx.fillStyle = C.accent; ctx.fillRect(x - 4.5, top + 13.2, 2, 4.6); ctx.fillRect(x - 5.8, top + 14.5, 4.6, 2);
    ctx.fillStyle = C.topShade; ctx.fillRect(x + 1, top + 18, 8, 7);
    ctx.fillStyle = '#3a6ad0'; ctx.fillRect(x + 6, top + 15, 1.5, 5);
    ctx.fillStyle = C.pants; ctx.fillRect(bx, foot - 40, bw, 3);
  } else if (C.outfit === 'vest') {
    ctx.fillStyle = C.accent; // áo gi-lê săn
    roundRect(ctx, bx - 1, top + 2, bw + 2, 42, 5); ctx.fill();
    ctx.fillStyle = C.top; ctx.beginPath(); ctx.moveTo(x - 1, top + 1); ctx.lineTo(x + 7, top + 1); ctx.lineTo(x + 3, top + 18); ctx.fill();
    ctx.fillStyle = shade(C.accent, -18);
    roundRect(ctx, x - 11, top + 22, 9, 8, 1.5); ctx.fill(); roundRect(ctx, x + 3, top + 22, 9, 8, 1.5); ctx.fill();
    ctx.fillStyle = '#b8352a'; // dãy đạn
    for (let k = 0; k < 5; k++) ctx.fillRect(x - 10 + k * 4.4, top + 34, 2.6, 6);
    ctx.fillStyle = '#d8b04a'; for (let k = 0; k < 5; k++) ctx.fillRect(x - 10 + k * 4.4, top + 39, 2.6, 1.5);
    ctx.fillStyle = '#3a2a1c'; ctx.fillRect(bx, foot - 39, bw, 4);
  } else if (C.outfit === 'overalls') {
    ctx.fillStyle = C.accent; // yếm
    ctx.fillRect(x - 9, top + 14, 18, foot - 38 - top - 14);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(x - 8, top + 15); ctx.lineTo(x - 9, top + 1); ctx.moveTo(x + 8, top + 15); ctx.lineTo(x + 7, top + 1); ctx.stroke();
    ctx.fillStyle = '#d8c060'; ctx.beginPath(); ctx.arc(x - 7, top + 16, 1.6, 0, Math.PI * 2); ctx.arc(x + 7, top + 16, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shade(C.accent, -15); roundRect(ctx, x - 5, top + 19, 10, 7, 1.5); ctx.fill();
    ctx.fillStyle = 'rgba(20,15,10,0.45)'; ctx.beginPath(); ctx.ellipse(x + 3, top + 33, 4, 2.5, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9aa0a8'; ctx.fillRect(x + 9, foot - 44, 3, 14); ctx.fillRect(x + 7.5, foot - 46, 6, 4); // cờ lê
  } else if (C.outfit === 'jacket') {
    ctx.fillStyle = C.accent; // áo khoác jean mở
    ctx.beginPath(); ctx.moveTo(bx - 1, top + 2); ctx.lineTo(x - 2, top + 1); ctx.lineTo(x - 3, foot - 39); ctx.lineTo(bx - 1, foot - 39); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 6, top + 1); ctx.lineTo(bx + bw + 1, top + 3); ctx.lineTo(bx + bw + 1, foot - 39); ctx.lineTo(x + 7, foot - 39); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(x - 3, top + 3); ctx.lineTo(x - 4, foot - 40); ctx.moveTo(x + 7, top + 3); ctx.lineTo(x + 8, foot - 40); ctx.stroke();
    ctx.fillStyle = '#e8a0b0'; ctx.beginPath(); ctx.arc(x + 9, top + 12, 1.8, 0, Math.PI * 2); ctx.fill(); // huy hiệu
    ctx.strokeStyle = '#5a3a5a'; ctx.lineWidth = 3; // quai ba lô
    ctx.beginPath(); ctx.moveTo(x - 6, top + 1); ctx.lineTo(x - 8, top + 30); ctx.stroke();
  }

  // ---- cổ + đầu ----
  ctx.fillStyle = C.skin;
  ctx.fillRect(x - (C.female ? 2 : 3), hy + 8, C.female ? 6 : 8, 6);
  ctx.beginPath();
  if (C.female) ctx.ellipse(hx, hy, 10.5, 11, 0, 0, Math.PI * 2);
  else ctx.arc(hx, hy, 11, 0, Math.PI * 2);
  ctx.fill();
  if (C.female) { // cằm thon
    ctx.beginPath(); ctx.moveTo(hx + 4, hy + 8); ctx.quadraticCurveTo(hx + 9, hy + 7, hx + 10, hy + 3); ctx.lineTo(hx + 6, hy + 3); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx + 9, hy + 1); ctx.lineTo(hx + 11, hy + 3); ctx.lineTo(hx + 8.5, hy + 4); ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(hx + 9, hy + 2); ctx.lineTo(hx + 12, hy + 4); ctx.lineTo(hx + 8, hy + 6); ctx.fill();
  }
  // tai
  ctx.fillStyle = shade(C.skin, -18);
  ctx.beginPath(); ctx.ellipse(hx - 3, hy + 1, 2.2, 3, 0, 0, Math.PI * 2); ctx.fill();

  // mắt
  if (C.female) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(hx + 6.5, hy - 1, 2.6, 2.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.eyes;
    ctx.beginPath(); ctx.arc(hx + 7.2, hy - 0.8, 1.7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(hx + 7.4, hy - 2, 0.9, 0.9);
    ctx.strokeStyle = '#1a1010'; ctx.lineWidth = 1.2; // mi cong
    ctx.beginPath(); ctx.moveTo(hx + 3.8, hy - 2.4); ctx.quadraticCurveTo(hx + 6.5, hy - 4.2, hx + 9.5, hy - 2.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx + 9.3, hy - 2.3); ctx.lineTo(hx + 10.8, hy - 3.6); ctx.moveTo(hx + 8.4, hy - 3.3); ctx.lineTo(hx + 9.4, hy - 4.8); ctx.stroke();
    ctx.strokeStyle = shade(C.hairColor, 20); ctx.lineWidth = 0.9; // lông mày mảnh
    ctx.beginPath(); ctx.moveTo(hx + 4.5, hy - 5.8); ctx.quadraticCurveTo(hx + 7, hy - 6.8, hx + 9.5, hy - 5.6); ctx.stroke();
    ctx.fillStyle = 'rgba(255,120,130,0.35)'; // má hồng
    ctx.beginPath(); ctx.ellipse(hx + 5, hy + 3.5, 2.6, 1.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.lips;
    ctx.beginPath(); ctx.ellipse(hx + 7.6, hy + 6.2, 1.8, 1.1, -0.1, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = '#1a1210'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(hx + 4, hy - 4.5); ctx.lineTo(hx + 9.5, hy - 2.5); ctx.stroke();
    ctx.fillStyle = '#1a1210'; ctx.fillRect(hx + 5.5, hy - 1.5, 3, 2.2);
    ctx.strokeStyle = 'rgba(80,40,30,0.7)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(hx + 5, hy + 6.5); ctx.lineTo(hx + 8.5, hy + 6); ctx.stroke();
    if (C.old) {
      ctx.strokeStyle = 'rgba(70,40,25,0.5)'; ctx.lineWidth = 0.8; // nếp nhăn
      ctx.beginPath(); ctx.moveTo(hx + 2, hy - 1); ctx.lineTo(hx + 4, hy); ctx.moveTo(hx + 2, hy + 1); ctx.lineTo(hx + 4, hy + 1.5); ctx.stroke();
    }
  }
  if (C.beard) { // ria + râu bạc
    ctx.fillStyle = C.beard;
    ctx.beginPath(); ctx.moveTo(hx + 4, hy + 4.5); ctx.quadraticCurveTo(hx + 9, hy + 3.5, hx + 11, hy + 5.5); ctx.quadraticCurveTo(hx + 8, hy + 6, hx + 4, hy + 6.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx - 1, hy + 4); ctx.quadraticCurveTo(hx + 2, hy + 13, hx + 7, hy + 11); ctx.quadraticCurveTo(hx + 9, hy + 9, hx + 9, hy + 7); ctx.lineTo(hx + 3, hy + 7); ctx.fill();
  }

  // ---- tóc phía trước ----
  ctx.fillStyle = C.hairColor;
  if (C.hair === 'spiky') {
    const spikes = [[11, -3], [9, -9], [12, -13], [5, -12], [6, -19], [0, -13], [-3, -20], [-6, -12], [-12, -16], [-11, -8], [-17, -7], [-12, -2], [-15, 3], [-10, 3], [-11, 9], [-6, 6], [-4, 1], [3, -5], [8, -6]];
    ctx.beginPath();
    ctx.moveTo(hx + spikes[0][0], hy + spikes[0][1]);
    for (const [dx, dy] of spikes) ctx.lineTo(hx + dx, hy + dy);
    ctx.closePath(); ctx.fill();
  } else if (C.hair === 'ponytail') {
    ctx.beginPath(); // phủ đầu + mái chéo mềm
    ctx.moveTo(hx - 11, hy + 3);
    ctx.quadraticCurveTo(hx - 13, hy - 12, hx, hy - 12.5);
    ctx.quadraticCurveTo(hx + 10, hy - 12, hx + 11.5, hy - 4);
    ctx.quadraticCurveTo(hx + 7, hy - 8, hx + 2, hy - 5);
    ctx.quadraticCurveTo(hx - 2, hy - 3, hx - 4, hy + 1);
    ctx.quadraticCurveTo(hx - 7, hy - 2, hx - 9, hy + 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(hx, hy - 3, 8, Math.PI * 1.15, Math.PI * 1.6); ctx.stroke();
  } else if (C.hair === 'bob') {
    ctx.beginPath();
    ctx.moveTo(hx - 12, hy + 6);
    ctx.quadraticCurveTo(hx - 14, hy - 12, hx + 1, hy - 12.5);
    ctx.quadraticCurveTo(hx + 12, hy - 11, hx + 12, hy - 1);
    ctx.quadraticCurveTo(hx + 8, hy - 8, hx + 2, hy - 6);   // mái lệch
    ctx.quadraticCurveTo(hx - 3, hy - 3, hx - 5, hy + 3);
    ctx.lineTo(hx - 6, hy + 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,180,0.18)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(hx - 1, hy - 3, 8.5, Math.PI * 1.1, Math.PI * 1.65); ctx.stroke();
  } else if (C.hair === 'short') {
    ctx.beginPath();
    ctx.moveTo(hx - 11, hy + 3);
    ctx.lineTo(hx - 12, hy - 7); ctx.lineTo(hx - 8, hy - 11); ctx.lineTo(hx - 4, hy - 14); ctx.lineTo(hx, hy - 12);
    ctx.lineTo(hx + 4, hy - 14); ctx.lineTo(hx + 7, hy - 11); ctx.lineTo(hx + 11, hy - 9); ctx.lineTo(hx + 10, hy - 5);
    ctx.lineTo(hx + 4, hy - 7); ctx.lineTo(hx - 3, hy - 5); ctx.lineTo(hx - 5, hy + 1); ctx.lineTo(hx - 8, hy + 4);
    ctx.fill();
  } else if (C.hair === 'gray') {
    ctx.beginPath(); ctx.moveTo(hx - 11, hy + 4); ctx.quadraticCurveTo(hx - 12, hy - 6, hx - 5, hy - 8); ctx.lineTo(hx - 3, hy + 2); ctx.fill();
  }

  // ---- phụ kiện trên đầu ----
  if (C.head === 'headphones') {
    ctx.strokeStyle = '#2c2f36'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(hx - 2, hy - 1, 12.5, Math.PI * 1.08, Math.PI * 1.72); ctx.stroke();
    ctx.fillStyle = '#2c2f36'; ctx.beginPath(); ctx.arc(hx - 4, hy + 1, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5b5f68'; ctx.beginPath(); ctx.arc(hx - 4, hy + 1, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff5a3a'; ctx.beginPath(); ctx.arc(hx - 4, hy + 1, 1, 0, Math.PI * 2); ctx.fill();
  } else if (C.head === 'nurseCap') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(hx - 7, hy - 10); ctx.lineTo(hx + 5, hy - 12); ctx.lineTo(hx + 4, hy - 17); ctx.lineTo(hx - 6, hy - 15); ctx.fill();
    ctx.fillStyle = C.accent; ctx.fillRect(hx - 2, hy - 16, 1.6, 4.4); ctx.fillRect(hx - 3.4, hy - 14.6, 4.4, 1.6);
  } else if (C.head === 'hunterHat') {
    ctx.fillStyle = '#6a5034';
    ctx.beginPath(); ctx.ellipse(hx + 1, hy - 8, 17, 3.4, -0.05, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx - 9, hy - 8); ctx.quadraticCurveTo(hx - 9, hy - 20, hx + 1, hy - 20); ctx.quadraticCurveTo(hx + 11, hy - 20, hx + 10, hy - 8); ctx.fill();
    ctx.fillStyle = '#3a2a1c'; ctx.fillRect(hx - 9, hy - 11, 19, 3);
  } else if (C.head === 'goggles') {
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(hx - 11, hy - 10, 22, 3);
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath(); ctx.arc(hx + 2, hy - 9, 3.6, 0, Math.PI * 2); ctx.arc(hx + 8.5, hy - 8.5, 3.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(120,200,120,0.75)';
    ctx.beginPath(); ctx.arc(hx + 2, hy - 9, 2.2, 0, Math.PI * 2); ctx.arc(hx + 8.5, hy - 8.5, 2.2, 0, Math.PI * 2); ctx.fill();
  } else if (C.head === 'clip') {
    ctx.fillStyle = '#ff8fb0'; ctx.fillRect(hx + 3, hy - 9.5, 5, 1.8);
    ctx.fillStyle = '#ffc0d4'; ctx.beginPath(); ctx.arc(hx + 8.5, hy - 8.6, 1.6, 0, Math.PI * 2); ctx.fill();
  }

  // ---- tay + súng ----
  ctx.save();
  ctx.translate(x + 4, foot - 76);
  ctx.rotate(ang);
  ctx.translate(-recoil, 0);
  const grip = Math.min(len * 0.62 + 10, 40);
  const sleeve = C.outfit === 'jacket' ? C.accent : C.top;
  const sleeveShade = C.outfit === 'jacket' ? shade(C.accent, -20) : C.topShade;
  const hand = C.gloves || C.skin;
  const armW = C.female ? 0.85 : 1;
  ctx.strokeStyle = sleeveShade; ctx.lineWidth = 7 * armW;
  ctx.beginPath(); ctx.moveTo(-2, 1); ctx.lineTo(7, 7); ctx.stroke();
  ctx.strokeStyle = C.skin; ctx.lineWidth = 5 * armW;
  ctx.beginPath(); ctx.moveTo(7, 7); ctx.lineTo(15, 4); ctx.stroke();
  drawGun(ctx, weaponId, len);
  ctx.fillStyle = hand; ctx.beginPath(); ctx.arc(15, 4, 3.2 * armW, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = sleeve; ctx.lineWidth = 7.5 * armW;
  ctx.beginPath(); ctx.moveTo(1, -1); ctx.lineTo(11, 8); ctx.stroke();
  if (C.outfit === 'shirtTie') { ctx.strokeStyle = C.topShade; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(9, 6); ctx.lineTo(13, 10); ctx.stroke(); }
  if (C.outfit === 'scrubs') { ctx.strokeStyle = C.accent; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(4, 2); ctx.lineTo(6, 4); ctx.stroke(); }
  ctx.strokeStyle = C.skin; ctx.lineWidth = 5 * armW;
  ctx.beginPath(); ctx.moveTo(12, 9); ctx.lineTo(grip, 4); ctx.stroke();
  ctx.fillStyle = hand; ctx.beginPath(); ctx.arc(grip, 3.5, 3.4 * armW, 0, Math.PI * 2); ctx.fill();
  if (C.gloves) { ctx.fillStyle = C.skin; ctx.fillRect(grip + 1.5, 1.5, 2.5, 2); }
  ctx.restore();
  ctx.restore();
}

export function drawHero(ctx, x, foot, ang, weaponId, len, recoil = 0, t = 0) {
  drawCharacter(ctx, x, foot, ang, weaponId, len, recoil, t, CHARACTERS.phong);
}

// Ảnh chân dung (đầu + vai) cho thẻ nhân vật
const portraitCache2 = {};
export function characterPortrait(id, weaponId = 'pistol') {
  if (portraitCache2[id]) return portraitCache2[id];
  const c = document.createElement('canvas');
  c.width = 192; c.height = 192;
  const g = c.getContext('2d');
  const bg = g.createRadialGradient(96, 70, 10, 96, 96, 130);
  bg.addColorStop(0, '#3a3040');
  bg.addColorStop(1, '#141018');
  g.fillStyle = bg;
  g.fillRect(0, 0, 192, 192);
  g.scale(4.6, 4.6);
  drawCharacter(g, 19, 118, 0.7, weaponId, 30, 0, 0, CHARACTERS[id]);
  portraitCache2[id] = c.toDataURL();
  return portraitCache2[id];
}

let heroPortraitURL = null;
export function heroPortrait() {
  if (heroPortraitURL) return heroPortraitURL;
  const c = document.createElement('canvas');
  c.width = 200; c.height = 260;
  const g = c.getContext('2d');
  g.scale(2, 2);
  drawHero(g, 42, 124, 0.35, 'rifle', 44, 0, 0);
  heroPortraitURL = c.toDataURL();
  return heroPortraitURL;
}
