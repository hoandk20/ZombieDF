import { W, H, HORIZON, BARRICADE_BACK, BARRICADE_X, BARRICADE_TOP, LANE_MAX } from './config.js';
import { roundRect } from './zombie.js';

// PRNG cố định để nền giống nhau mỗi lần
function seeded(seed) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

export function makeBackground(bloodMoon = false) {
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

  // sương mù sát đất
  const fog = g.createLinearGradient(0, HORIZON - 30, 0, HORIZON + 40);
  fog.addColorStop(0, 'rgba(120,110,150,0)');
  fog.addColorStop(0.5, 'rgba(120,110,150,0.12)');
  fog.addColorStop(1, 'rgba(120,110,150,0)');
  g.fillStyle = fog;
  g.fillRect(0, HORIZON - 30, W, 70);
  return c;
}

export function drawBarricade(ctx, ratio) {
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
    ctx.fillStyle = '#6b4a2b';
    ctx.fillRect(-44, -7, 88, 14);
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
