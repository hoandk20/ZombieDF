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

// Vẽ người (người chơi hoặc người sống sót) với súng hướng theo góc `ang`
export function drawPerson(ctx, x, foot, ang, colors, gunLen, recoil = 0) {
  const sx = x + 4, sy = foot - 76;
  ctx.lineCap = 'round';
  // thân
  ctx.fillStyle = colors.shirt;
  roundRect(ctx, x - 13, foot - 80, 26, 48, 6);
  ctx.fill();
  ctx.strokeStyle = colors.pants;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(x - 5, foot - 34); ctx.lineTo(x - 7, foot);
  ctx.moveTo(x + 5, foot - 34); ctx.lineTo(x + 7, foot);
  ctx.stroke();
  // đầu
  ctx.fillStyle = colors.skin;
  ctx.beginPath(); ctx.arc(x + 1, foot - 92, 11, 0, Math.PI * 2); ctx.fill();
  if (colors.hat) {
    ctx.fillStyle = colors.hat;
    ctx.beginPath(); ctx.arc(x + 1, foot - 95, 11.5, Math.PI, 0); ctx.fill();
    ctx.fillRect(x - 2, foot - 97, 18, 4);
  } else {
    ctx.fillStyle = colors.hair || '#2b1d14';
    ctx.beginPath(); ctx.arc(x, foot - 95, 11, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  }
  // tay + súng
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(ang);
  ctx.translate(-recoil, 0);
  ctx.strokeStyle = colors.skin;
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(18, 2); ctx.stroke();
  ctx.fillStyle = '#1b1b1f';
  ctx.fillRect(12, -3, gunLen, 6);
  ctx.fillRect(14, 1, 5, 8);
  ctx.fillStyle = '#3a3a42';
  ctx.fillRect(12, -3, gunLen * 0.45, 3);
  ctx.restore();
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

const HERO = {
  skin: '#f2c48f', shirt: '#eceff1', shirtShade: '#cfd5da', tie: '#2b2d34', pants: '#3d434c',
  pad: '#4a3a2e', boot: '#141416', strap: '#5e3f26', glove: '#3a2a22', hair: '#121214', phones: '#2c2f36',
};

// Nhân vật chính Phong: tóc đen dựng, tai nghe, sơ mi trắng, cà vạt, dây đai, bó gối, găng hở ngón
export function drawHero(ctx, x, foot, ang, weaponId, len, recoil = 0, t = 0) {
  const C = HERO;
  const br = Math.sin(t * 2.2) * 0.7;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // chân sau
  ctx.strokeStyle = '#33383f';
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(x - 4, foot - 36); ctx.lineTo(x - 7, foot - 18); ctx.lineTo(x - 7, foot - 4); ctx.stroke();
  ctx.fillStyle = '#3d3128'; roundRect(ctx, x - 12, foot - 24, 9, 10, 3); ctx.fill();
  ctx.fillStyle = C.boot; roundRect(ctx, x - 12, foot - 6, 12, 6, 2); ctx.fill();
  // chân trước
  ctx.strokeStyle = C.pants;
  ctx.beginPath(); ctx.moveTo(x + 5, foot - 36); ctx.lineTo(x + 8, foot - 18); ctx.lineTo(x + 7, foot - 4); ctx.stroke();
  ctx.fillStyle = C.pad; roundRect(ctx, x + 3, foot - 24, 10, 11, 3); ctx.fill();
  ctx.fillStyle = '#7d8188'; ctx.beginPath(); ctx.arc(x + 9, foot - 18.5, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.boot; roundRect(ctx, x + 2, foot - 6, 15, 6, 2); ctx.fill();
  // túi quần hộp
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 6, foot - 32, 6, 7);

  // thân áo
  const top = foot - 82 + br;
  ctx.fillStyle = C.shirt;
  roundRect(ctx, x - 13, top, 26, 48 - br, 6); ctx.fill();
  ctx.fillStyle = C.shirtShade;
  ctx.fillRect(x - 13, top + 6, 6, 40);
  // cổ áo + cà vạt
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.moveTo(x - 1, top + 1); ctx.lineTo(x + 6, top + 1); ctx.lineTo(x + 3, top + 7); ctx.fill();
  ctx.fillStyle = C.tie;
  ctx.beginPath(); ctx.moveTo(x + 2, top + 3); ctx.lineTo(x + 6, top + 3); ctx.lineTo(x + 7, top + 30); ctx.lineTo(x + 4, top + 34); ctx.lineTo(x + 2, top + 30); ctx.fill();
  // dây đai chéo + thắt lưng + túi đạn
  ctx.strokeStyle = C.strap; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x - 10, top + 2); ctx.lineTo(x + 10, top + 40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 9, top + 2); ctx.lineTo(x - 9, top + 44); ctx.stroke();
  ctx.fillStyle = '#c9a24a'; ctx.fillRect(x - 11, top + 20, 4, 4);
  ctx.fillStyle = '#2f2219'; ctx.fillRect(x - 13, foot - 38, 26, 5);
  ctx.fillStyle = '#4a3424'; roundRect(ctx, x - 13, foot - 41, 8, 10, 2); ctx.fill();
  ctx.fillStyle = '#b8902e'; ctx.fillRect(x + 6, foot - 40, 2, 4); ctx.fillRect(x + 9, foot - 40, 2, 4);

  // cổ + đầu
  const hx = x + 1, hy = foot - 92 + br * 0.5;
  ctx.fillStyle = C.skin;
  ctx.fillRect(x - 3, hy + 8, 8, 6);
  ctx.beginPath(); ctx.arc(hx, hy, 11, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx + 9, hy + 2); ctx.lineTo(hx + 12, hy + 4); ctx.lineTo(hx + 8, hy + 6); ctx.fill(); // mũi
  // mắt + lông mày nghiêm nghị
  ctx.strokeStyle = '#1a1210'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(hx + 4, hy - 4.5); ctx.lineTo(hx + 9.5, hy - 2.5); ctx.stroke();
  ctx.fillStyle = '#1a1210'; ctx.fillRect(hx + 5.5, hy - 1.5, 3, 2.2);
  ctx.strokeStyle = 'rgba(80,40,30,0.7)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(hx + 5, hy + 6.5); ctx.lineTo(hx + 8.5, hy + 6); ctx.stroke();
  // tóc dựng
  ctx.fillStyle = C.hair;
  const spikes = [[11, -3], [9, -9], [12, -13], [5, -12], [6, -19], [0, -13], [-3, -20], [-6, -12], [-12, -16], [-11, -8], [-17, -7], [-12, -2], [-15, 3], [-10, 3], [-11, 9], [-6, 6], [-4, 1], [3, -5], [8, -6]];
  ctx.beginPath();
  ctx.moveTo(hx + spikes[0][0], hy + spikes[0][1]);
  for (const [dx, dy] of spikes) ctx.lineTo(hx + dx, hy + dy);
  ctx.closePath(); ctx.fill();
  // tai nghe
  ctx.strokeStyle = C.phones; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(hx - 2, hy - 1, 12.5, Math.PI * 1.08, Math.PI * 1.72); ctx.stroke();
  ctx.fillStyle = C.phones; ctx.beginPath(); ctx.arc(hx - 4, hy + 1, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5b5f68'; ctx.beginPath(); ctx.arc(hx - 4, hy + 1, 3.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff5a3a'; ctx.beginPath(); ctx.arc(hx - 4, hy + 1, 1, 0, Math.PI * 2); ctx.fill();

  // tay + súng
  ctx.save();
  ctx.translate(x + 4, foot - 76);
  ctx.rotate(ang);
  ctx.translate(-recoil, 0);
  const grip = Math.min(len * 0.62 + 10, 40);
  // tay sau (ở phía xa)
  ctx.strokeStyle = C.shirtShade; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(-2, 1); ctx.lineTo(7, 7); ctx.stroke();
  ctx.strokeStyle = C.skin; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(7, 7); ctx.lineTo(15, 4); ctx.stroke();
  drawGun(ctx, weaponId, len);
  ctx.fillStyle = C.glove; ctx.beginPath(); ctx.arc(15, 4, 3.2, 0, Math.PI * 2); ctx.fill();
  // tay trước (xắn tay áo)
  ctx.strokeStyle = C.shirt; ctx.lineWidth = 7.5;
  ctx.beginPath(); ctx.moveTo(1, -1); ctx.lineTo(11, 8); ctx.stroke();
  ctx.strokeStyle = C.shirtShade; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(9, 6); ctx.lineTo(13, 10); ctx.stroke();
  ctx.strokeStyle = C.skin; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(12, 9); ctx.lineTo(grip, 4); ctx.stroke();
  ctx.fillStyle = C.glove; ctx.beginPath(); ctx.arc(grip, 3.5, 3.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.skin; ctx.fillRect(grip + 1.5, 1.5, 2.5, 2);
  ctx.restore();
  ctx.restore();
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
