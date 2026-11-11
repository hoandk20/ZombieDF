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
  else if (variant === 'dam') drawDam(g, rnd);
  else if (variant === 'base') drawBase(g, rnd);
  else if (variant === 'highway') drawHighway(g, rnd);
  else if (variant === 'capital') drawCapital(g, rnd);
  else if (variant === 'factory') drawFactory(g, rnd);
  else if (variant === 'airport') drawAirport(g, rnd);
  else if (variant === 'snow') drawSnow(g, rnd);
  else if (variant === 'lighthouse') drawLighthouse(g, rnd);
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

function mountains(g, rnd, cols, base) {
  cols.forEach((col, k) => {
    g.fillStyle = col;
    g.beginPath(); g.moveTo(0, HORIZON);
    let x = 0;
    while (x <= W + 40) { g.lineTo(x, base + k * 28 - rnd() * (90 - k * 20)); x += 40 + rnd() * 50; }
    g.lineTo(W, HORIZON); g.fill();
  });
}

function drawDam(g, rnd) {
  mountains(g, rnd, ['#151b2c', '#111727', '#0d1220'], 250);
  // rừng thông
  g.fillStyle = '#0a0f18';
  for (let i = 0; i < 46; i++) {
    const x = rnd() * W, y = 330 + rnd() * 50, h = 22 + rnd() * 30;
    g.beginPath(); g.moveTo(x, y - h); g.lineTo(x - h * 0.3, y); g.lineTo(x + h * 0.3, y); g.fill();
  }
  // thân đập bê tông
  g.fillStyle = '#2a2d36';
  g.beginPath(); g.moveTo(290, HORIZON); g.lineTo(320, 296); g.lineTo(W, 296); g.lineTo(W, HORIZON); g.fill();
  g.fillStyle = 'rgba(0,0,0,0.25)';
  for (let x = 340; x < W; x += 56) g.fillRect(x, 300, 2, HORIZON - 300);
  // cửa xả lũ + dòng nước
  for (let i = 0; i < 4; i++) {
    const gx = 420 + i * 130;
    g.fillStyle = '#16181e'; g.fillRect(gx, 312, 40, 26);
    for (let k = 0; k < 9; k++) {
      g.fillStyle = `rgba(150,180,220,${0.08 + rnd() * 0.12})`;
      g.fillRect(gx + 2 + rnd() * 34, 338, 2, HORIZON - 338);
    }
  }
  // lan can + đèn trên đỉnh đập
  g.fillStyle = '#1b1d24'; g.fillRect(318, 290, W - 318, 6);
  for (let x = 330; x < W; x += 70) { g.fillRect(x, 270, 3, 22); g.fillStyle = 'rgba(255,210,120,0.85)'; g.fillRect(x - 2, 266, 7, 4); g.fillStyle = '#1b1d24'; }
  // đường đất
  const ground = g.createLinearGradient(0, HORIZON, 0, H);
  ground.addColorStop(0, '#2f2b25');
  ground.addColorStop(1, '#16140f');
  g.fillStyle = ground;
  g.fillRect(0, HORIZON, W, H - HORIZON);
  g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(240, 462); g.lineTo(W, 458); g.moveTo(240, 492); g.lineTo(W, 496); g.stroke();
  for (let i = 0; i < 50; i++) {
    g.fillStyle = `rgba(80,90,50,${0.2 + rnd() * 0.3})`;
    g.fillRect(rnd() * W, HORIZON + 4 + rnd() * (H - HORIZON), 1.5, 4 + rnd() * 4);
  }
  // chốt gác sau lưng người chơi
  g.fillStyle = '#24262c'; g.fillRect(0, 280, 74, 210);
  g.fillStyle = '#1a1b20'; g.fillRect(-4, 272, 84, 12);
  g.fillStyle = 'rgba(255,200,110,0.5)'; g.fillRect(14, 312, 30, 20);
  g.fillStyle = '#d0b050'; g.font = 'bold 9px sans-serif'; g.fillText('HỒNG SƠN', 10, 300);
}

function drawBase(g, rnd) {
  mountains(g, rnd, ['#141a2a', '#10162a'], 260);
  // tòa nhà phòng thí nghiệm
  g.fillStyle = '#1b1f2c'; g.fillRect(500, 300, 290, HORIZON - 300);
  g.fillStyle = '#161a26'; g.fillRect(560, 270, 170, 32);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) {
    if (rnd() < 0.7) { g.fillStyle = rnd() < 0.8 ? 'rgba(140,220,230,0.55)' : 'rgba(255,210,120,0.6)'; g.fillRect(512 + c * 31, 312 + r * 24, 16, 10); }
  }
  g.fillStyle = '#e0b030'; g.beginPath(); g.arc(645, 286, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1b1f2c'; g.font = 'bold 12px sans-serif'; g.fillText('☣', 639, 291);
  // cột ăng-ten phát sóng
  g.strokeStyle = '#1a1d28'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(850, HORIZON); g.lineTo(870, 150); g.lineTo(890, HORIZON); g.stroke();
  g.lineWidth = 1.5;
  for (let y = HORIZON; y > 160; y -= 18) { const k = (HORIZON - y) / (HORIZON - 150); g.beginPath(); g.moveTo(850 + k * 20, y); g.lineTo(890 - k * 20, y - 18); g.stroke(); }
  // tháp canh
  g.fillStyle = '#191c26';
  g.fillRect(330, 300, 4, 120); g.fillRect(370, 300, 4, 120);
  g.fillRect(318, 272, 68, 30); g.fillRect(312, 266, 80, 7);
  g.fillStyle = 'rgba(255,230,160,0.7)'; g.fillRect(326, 280, 50, 10);
  // hàng rào lưới thép gai
  g.strokeStyle = '#222634'; g.lineWidth = 3;
  for (let x = 250; x < W; x += 44) { g.beginPath(); g.moveTo(x, HORIZON); g.lineTo(x, 368); g.stroke(); }
  g.strokeStyle = 'rgba(120,130,150,0.18)'; g.lineWidth = 1;
  for (let x = 250; x < W; x += 8) { g.beginPath(); g.moveTo(x, 370); g.lineTo(x + 30, HORIZON); g.moveTo(x + 30, 370); g.lineTo(x, HORIZON); g.stroke(); }
  g.strokeStyle = 'rgba(160,170,190,0.5)';
  g.beginPath(); for (let x = 250; x < W; x += 6) g.lineTo(x, 366 + Math.sin(x * 0.5) * 3); g.stroke();
  // sân bê tông + bãi đáp
  const ground = g.createLinearGradient(0, HORIZON, 0, H);
  ground.addColorStop(0, '#2c2e33');
  ground.addColorStop(1, '#141518');
  g.fillStyle = ground;
  g.fillRect(0, HORIZON, W, H - HORIZON);
  g.strokeStyle = 'rgba(230,200,60,0.35)'; g.lineWidth = 3;
  g.beginPath(); g.ellipse(660, 478, 90, 22, 0, 0, Math.PI * 2); g.stroke();
  g.fillStyle = 'rgba(230,200,60,0.35)'; g.font = 'bold 30px sans-serif'; g.fillText('H', 648, 490);
  g.fillStyle = 'rgba(230,200,60,0.3)';
  for (let x = 240; x < W; x += 60) g.fillRect(x, 440, 30, 3);
  // boong-ke sau lưng người chơi
  g.fillStyle = '#262a32'; g.fillRect(0, 290, 76, 200);
  g.fillStyle = '#1c1f26'; for (let y = 300; y < 480; y += 22) g.fillRect(4, y, 66, 3);
  g.fillStyle = '#c94030'; g.fillRect(8, 300, 60, 6);
  g.fillStyle = '#e8c040'; for (let x = 8; x < 68; x += 12) g.fillRect(x, 300, 6, 6);
}

function carSilhouette(g, x, y, w, col, flipped) {
  g.fillStyle = col;
  if (flipped) { // xe lật ngửa
    g.fillRect(x, y - 14, w, 14);
    g.beginPath(); g.moveTo(x + w * 0.2, y); g.lineTo(x + w * 0.3, y + 10); g.lineTo(x + w * 0.75, y + 10); g.lineTo(x + w * 0.85, y); g.fill();
    g.fillStyle = '#0c0c10'; g.beginPath(); g.arc(x + w * 0.2, y - 16, 6, 0, Math.PI * 2); g.arc(x + w * 0.8, y - 16, 6, 0, Math.PI * 2); g.fill();
    return;
  }
  g.fillRect(x, y - 14, w, 12);
  g.beginPath(); g.moveTo(x + w * 0.2, y - 14); g.lineTo(x + w * 0.32, y - 26); g.lineTo(x + w * 0.7, y - 26); g.lineTo(x + w * 0.82, y - 14); g.fill();
  g.fillStyle = '#0c0c10'; g.beginPath(); g.arc(x + w * 0.22, y - 2, 6, 0, Math.PI * 2); g.arc(x + w * 0.78, y - 2, 6, 0, Math.PI * 2); g.fill();
}

function drawHighway(g, rnd) {
  // ánh sáng mờ của thủ đô ở cuối đường
  const glow = g.createRadialGradient(860, HORIZON, 10, 860, HORIZON, 260);
  glow.addColorStop(0, 'rgba(255,150,90,0.25)');
  glow.addColorStop(1, 'rgba(255,150,90,0)');
  g.fillStyle = glow; g.fillRect(560, 160, 400, 260);
  g.fillStyle = '#121225';
  for (let x = 720; x < W; x += 18 + rnd() * 14) { const h = 30 + rnd() * 80; g.fillRect(x, HORIZON - 60 - h, 14 + rnd() * 10, h); }
  // cầu vượt
  g.fillStyle = '#1b1c26';
  g.fillRect(240, 300, W - 240, 18);
  g.fillStyle = '#15161e';
  for (let x = 300; x < W; x += 160) g.fillRect(x, 318, 16, HORIZON - 318);
  g.fillStyle = '#25262f'; g.fillRect(240, 296, W - 240, 4);
  // biển báo xanh
  g.fillStyle = '#1e5a3a'; g.fillRect(520, 248, 120, 40);
  g.strokeStyle = '#d8e8d8'; g.lineWidth = 1.5; g.strokeRect(523, 251, 114, 34);
  g.fillStyle = '#e8f0e8'; g.font = 'bold 11px sans-serif'; g.fillText('THỦ ĐÔ', 534, 266); g.fillText('112 km  ↑', 534, 280);
  g.fillStyle = '#1b1c26'; g.fillRect(578, 288, 4, 10);
  // xe bỏ hoang trên đường
  const cols = ['#3a2a2a', '#2a3040', '#3a3a30', '#2a2a2e', '#402a1e'];
  let x = 290;
  while (x < W - 40) {
    const w = 46 + rnd() * 26;
    carSilhouette(g, x, HORIZON - 2, w, cols[Math.floor(rnd() * cols.length)], rnd() < 0.25);
    x += w + 12 + rnd() * 70;
  }
  // mặt đường cao tốc
  const ground = g.createLinearGradient(0, HORIZON, 0, H);
  ground.addColorStop(0, '#2a2b2f');
  ground.addColorStop(1, '#141417');
  g.fillStyle = ground;
  g.fillRect(0, HORIZON, W, H - HORIZON);
  g.fillStyle = 'rgba(240,240,240,0.35)';
  for (let px = 240; px < W; px += 70) g.fillRect(px, 466, 36, 3);
  g.fillStyle = 'rgba(230,190,40,0.35)'; g.fillRect(240, 430, W - 240, 3);
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1;
  for (let i = 0; i < 14; i++) { const cx = 260 + rnd() * 680, cy = HORIZON + 10 + rnd() * 100; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 20, cy + 6); g.lineTo(cx + 34, cy + 2); g.stroke(); }
  // xe buýt lật sau lưng người chơi
  g.fillStyle = '#5a4a1e'; g.fillRect(-10, 330, 90, 150);
  g.fillStyle = '#3a3014'; for (let y = 345; y < 470; y += 26) g.fillRect(6, y, 60, 16);
  g.fillStyle = 'rgba(160,200,230,0.25)'; for (let y = 345; y < 470; y += 26) g.fillRect(8, y + 2, 56, 10);
}

function groundFill(g, top, bot) {
  const gr = g.createLinearGradient(0, HORIZON, 0, H);
  gr.addColorStop(0, top); gr.addColorStop(1, bot);
  g.fillStyle = gr; g.fillRect(0, HORIZON, W, H - HORIZON);
}

// Chương 7: nhà máy dược Thành Nam
function drawFactory(g, rnd) {
  // ống khói và nhà xưởng
  for (const [x, w, h] of [[300, 120, 120], [440, 160, 150], [630, 140, 110], [790, 170, 135]]) {
    g.fillStyle = '#15161f'; g.fillRect(x, HORIZON - h, w, h);
    g.fillStyle = '#1b1c26';
    for (let k = 0; k < w; k += 22) { g.beginPath(); g.moveTo(x + k, HORIZON - h); g.lineTo(x + k + 11, HORIZON - h - 14); g.lineTo(x + k + 22, HORIZON - h); g.fill(); } // mái răng cưa
    for (let wy = HORIZON - h + 20; wy < HORIZON - 16; wy += 22) for (let wx = x + 8; wx < x + w - 12; wx += 20) {
      if (rnd() < 0.08) { g.fillStyle = 'rgba(255,190,110,0.55)'; g.fillRect(wx, wy, 10, 8); }
    }
  }
  for (const [x, h] of [[480, 230], [520, 200], [700, 250]]) {
    g.fillStyle = '#121219'; g.fillRect(x, HORIZON - h, 22, h);
    g.fillStyle = '#8a2a22'; g.fillRect(x, HORIZON - h + 14, 22, 6); g.fillRect(x, HORIZON - h + 30, 22, 6);
  }
  // bồn chứa hóa chất
  for (const x of [370, 600, 870]) {
    g.fillStyle = '#1e2028'; g.beginPath(); g.ellipse(x, HORIZON - 40, 34, 40, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#c8b030'; g.fillRect(x - 34, HORIZON - 44, 68, 5);
  }
  // biển nhà máy
  g.fillStyle = '#2a3a2e'; g.fillRect(560, 290, 140, 26);
  g.fillStyle = '#d8e8d8'; g.font = 'bold 11px sans-serif'; g.fillText('NHÀ MÁY DƯỢC THÀNH NAM', 566, 307);
  groundFill(g, '#2c2d2a', '#141412');
  g.strokeStyle = 'rgba(200,180,60,0.25)'; g.lineWidth = 3;
  for (let x = 260; x < W; x += 60) { g.beginPath(); g.moveTo(x, HORIZON + 50); g.lineTo(x + 30, HORIZON + 50); g.stroke(); }
  // thùng hóa chất sau lưng người chơi
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#3a5a8a' : '#c8b030'; g.fillRect(4 + i * 30, 400 - (i % 2) * 6, 26, 40); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(4 + i * 30, 410, 26, 3); }
}

// Chương 8: sân bay Bắc Thành
function drawAirport(g, rnd) {
  // nhà ga và tháp không lưu
  g.fillStyle = '#14151f'; g.fillRect(280, HORIZON - 70, 380, 70);
  g.fillStyle = 'rgba(140,190,230,0.12)'; g.fillRect(290, HORIZON - 60, 360, 22);
  g.fillStyle = '#121219'; g.fillRect(740, HORIZON - 200, 26, 200);
  g.fillStyle = '#1a1c28'; g.beginPath(); g.moveTo(718, HORIZON - 200); g.lineTo(788, HORIZON - 200); g.lineTo(778, HORIZON - 236); g.lineTo(728, HORIZON - 236); g.fill();
  g.fillStyle = 'rgba(140,220,255,0.35)'; g.fillRect(730, HORIZON - 230, 46, 18);
  // máy bay vận tải đỗ
  const plane = (x, y, s) => {
    g.fillStyle = '#1e202a';
    g.beginPath(); g.ellipse(x, y, 90 * s, 16 * s, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(x - 20 * s, y); g.lineTo(x + 30 * s, y + 46 * s); g.lineTo(x + 46 * s, y + 46 * s); g.lineTo(x + 20 * s, y); g.fill();
    g.beginPath(); g.moveTo(x + 70 * s, y - 8 * s); g.lineTo(x + 92 * s, y - 40 * s); g.lineTo(x + 100 * s, y - 40 * s); g.lineTo(x + 92 * s, y - 4 * s); g.fill();
  };
  plane(520, HORIZON - 26, 1.1); plane(860, HORIZON - 20, 0.8);
  // đèn đường băng
  groundFill(g, '#28292d', '#121214');
  for (let x = 250; x < W; x += 46) { g.fillStyle = rnd() < 0.5 ? 'rgba(120,200,255,0.8)' : 'rgba(255,220,120,0.8)'; g.fillRect(x, HORIZON + 8, 4, 3); }
  g.fillStyle = 'rgba(255,255,255,0.18)'; for (let x = 260; x < W; x += 70) g.fillRect(x, HORIZON + 46, 40, 4);
  // xe kéo hành lý sau lưng người chơi
  g.fillStyle = '#d8a020'; g.fillRect(0, 404, 120, 30); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(20, 438, 8, 0, Math.PI * 2); g.arc(96, 438, 8, 0, Math.PI * 2); g.fill();
}

// Chương 9: rừng tuyết biên giới
function drawSnow(g, rnd) {
  g.fillStyle = 'rgba(200,215,240,0.05)'; g.fillRect(0, 0, W, HORIZON);
  // núi tuyết xa
  for (const [base, amp, col, cap] of [[300, 120, '#3a4660', '#c8d4e4'], [360, 70, '#2a3448', '#a8b8cc']]) {
    g.fillStyle = col; g.beginPath(); g.moveTo(230, HORIZON);
    const pts = [];
    for (let x = 230; x <= W + 40; x += 60) { const y = base - rnd() * amp; pts.push([x, y]); g.lineTo(x, y); }
    g.lineTo(W + 40, HORIZON); g.fill();
    g.fillStyle = cap; for (const [x, y] of pts) { g.beginPath(); g.moveTo(x - 12, y + 14); g.lineTo(x, y); g.lineTo(x + 12, y + 14); g.fill(); }
  }
  // rừng thông
  const pine = (x, y, h, c) => { g.fillStyle = c; for (let k = 0; k < 3; k++) { const w = h * (0.32 - k * 0.07); g.beginPath(); g.moveTo(x - w, y - k * h * 0.28); g.lineTo(x, y - h - k * 4 + k * h * 0.1); g.lineTo(x + w, y - k * h * 0.28); g.fill(); } g.fillStyle = 'rgba(230,240,255,0.5)'; g.beginPath(); g.moveTo(x - 6, y - h * 0.7); g.lineTo(x, y - h - 2); g.lineTo(x + 6, y - h * 0.7); g.fill(); };
  for (let x = 240; x < W; x += 28 + rnd() * 30) pine(x, HORIZON, 70 + rnd() * 80, '#0f1a1c');
  // mặt tuyết
  groundFill(g, '#c8d2de', '#7c8898');
  g.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 40; i++) g.fillRect(240 + rnd() * 720, HORIZON + rnd() * 120, 18 + rnd() * 30, 2);
  // xác máy bay sau lưng người chơi
  g.fillStyle = '#5a5e66'; g.beginPath(); g.moveTo(0, 440); g.lineTo(130, 420); g.lineTo(150, 400); g.lineTo(0, 396); g.fill();
  g.fillStyle = 'rgba(140,190,230,0.4)'; g.fillRect(20, 404, 18, 10); g.fillRect(48, 404, 18, 10);
}

// Chương 10: Trạm Hải Đăng
function drawLighthouse(g, rnd) {
  // biển đen và đảo đá
  g.fillStyle = '#0c1322'; g.fillRect(230, HORIZON - 60, W - 230, 60);
  g.strokeStyle = 'rgba(160,190,220,0.12)'; g.lineWidth = 1;
  for (let y = HORIZON - 54; y < HORIZON; y += 8) { g.beginPath(); g.moveTo(240, y); g.lineTo(W, y + rnd() * 2); g.stroke(); }
  g.fillStyle = '#141820'; g.beginPath(); g.moveTo(560, HORIZON - 40); g.lineTo(620, HORIZON - 96); g.lineTo(780, HORIZON - 104); g.lineTo(880, HORIZON - 40); g.fill();
  // ngọn hải đăng
  g.fillStyle = '#d8d4cc'; g.beginPath(); g.moveTo(668, HORIZON - 100); g.lineTo(678, HORIZON - 250); g.lineTo(700, HORIZON - 250); g.lineTo(710, HORIZON - 100); g.fill();
  g.fillStyle = '#9a2a22'; g.fillRect(672, HORIZON - 160, 34, 14); g.fillRect(675, HORIZON - 210, 29, 12);
  g.fillStyle = '#2a2a30'; g.fillRect(672, HORIZON - 266, 34, 16);
  g.fillStyle = 'rgba(255,240,180,0.8)'; g.fillRect(678, HORIZON - 262, 22, 8);
  // cột ăng-ten khổng lồ
  g.strokeStyle = '#1c2030'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(780, HORIZON - 100); g.lineTo(800, HORIZON - 330); g.lineTo(820, HORIZON - 100); g.stroke();
  for (let y = HORIZON - 120; y > HORIZON - 320; y -= 20) { const k = (HORIZON - 100 - y) / 230; g.beginPath(); g.moveTo(780 + 20 * k, y); g.lineTo(820 - 20 * k, y - 10); g.stroke(); }
  g.fillStyle = '#ff3a2a'; g.beginPath(); g.arc(800, HORIZON - 334, 4, 0, Math.PI * 2); g.fill();
  // bến tàu và cửa trạm bê tông
  groundFill(g, '#2a2c30', '#121316');
  g.fillStyle = '#20222a'; g.fillRect(320, HORIZON - 50, 160, 50);
  g.fillStyle = '#0a0b0e'; g.fillRect(370, HORIZON - 36, 60, 36);
  g.fillStyle = '#e8c040'; for (let x = 370; x < 430; x += 12) { g.beginPath(); g.moveTo(x, HORIZON - 40); g.lineTo(x + 6, HORIZON - 40); g.lineTo(x + 12, HORIZON - 36); g.lineTo(x + 6, HORIZON - 36); g.fill(); }
  g.fillStyle = '#d8d8d0'; g.font = 'bold 10px sans-serif'; g.fillText('TRẠM HẢI ĐĂNG · KHU VỰC CẤM', 330, HORIZON - 56);
  // tủ máy chủ sau lưng người chơi
  for (let i = 0; i < 3; i++) { g.fillStyle = '#1e2228'; g.fillRect(6 + i * 40, 372, 34, 70); for (let k = 0; k < 6; k++) { g.fillStyle = rnd() < 0.5 ? 'rgba(90,220,140,0.8)' : 'rgba(255,90,60,0.8)'; g.fillRect(12 + i * 40, 380 + k * 10, 3, 3); } }
}

function drawCapital(g, rnd) {
  // nhà chọc trời nhiều lớp
  for (const [base, col, lit] of [[150, '#121428', 0.03], [210, '#0f1122', 0.06]]) {
    let x = 230;
    while (x < W) {
      const bw = 40 + rnd() * 70, bh = HORIZON - base - rnd() * 120;
      g.fillStyle = col; g.fillRect(x, HORIZON - bh, bw, bh);
      for (let wy = HORIZON - bh + 8; wy < HORIZON - 10; wy += 11) for (let wx = x + 4; wx < x + bw - 5; wx += 8) {
        if (rnd() < lit) { g.fillStyle = rnd() < 0.7 ? 'rgba(255,200,120,0.7)' : 'rgba(150,200,255,0.6)'; g.fillRect(wx, wy, 3, 5); }
      }
      x += bw + 4 + rnd() * 16;
    }
  }
  // tháp truyền hình
  g.fillStyle = '#0c0e1c';
  g.beginPath(); g.moveTo(640, HORIZON); g.lineTo(652, 120); g.lineTo(664, HORIZON); g.fill();
  g.beginPath(); g.ellipse(652, 160, 16, 8, 0, 0, Math.PI * 2); g.fill();
  g.fillRect(650, 70, 4, 52);
  // lối xuống tàu điện ngầm
  g.fillStyle = '#1a1c26'; g.fillRect(420, 372, 90, 48);
  g.fillStyle = '#0a0a10'; g.fillRect(432, 384, 66, 36);
  g.fillStyle = '#c03030'; g.beginPath(); g.arc(465, 360, 11, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff'; g.font = 'bold 13px sans-serif'; g.fillText('M', 459, 365);
  // cột đèn gãy
  g.strokeStyle = '#1a1b24'; g.lineWidth = 3;
  for (const lx of [330, 600, 820]) { g.beginPath(); g.moveTo(lx, HORIZON); g.lineTo(lx, 340); g.lineTo(lx + 16, 334); g.stroke(); }
  // quảng trường lát đá
  const ground = g.createLinearGradient(0, HORIZON, 0, H);
  ground.addColorStop(0, '#2e2c2c');
  ground.addColorStop(1, '#151414');
  g.fillStyle = ground;
  g.fillRect(0, HORIZON, W, H - HORIZON);
  g.strokeStyle = 'rgba(0,0,0,0.28)'; g.lineWidth = 1;
  for (let y = HORIZON + 12; y < H; y += 16) { g.beginPath(); g.moveTo(240, y); g.lineTo(W, y); g.stroke(); }
  for (let x2 = 260; x2 < W; x2 += 34) { g.beginPath(); g.moveTo(x2, HORIZON); g.lineTo(x2 + 30, H); g.stroke(); }
  // xe cứu thương sau lưng người chơi
  g.fillStyle = '#d8d8d4'; g.fillRect(-6, 360, 84, 120);
  g.fillStyle = '#c03030'; g.fillRect(-6, 410, 84, 10);
  g.fillRect(30, 380, 8, 22); g.fillRect(23, 387, 22, 8);
  g.fillStyle = '#3a6ad0'; g.fillRect(20, 352, 24, 8);
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
    const plank = {
      harbor: i % 2 ? '#56636b' : '#6b5a46', dam: i % 2 ? '#7d7f7a' : '#6e706b', base: i % 2 ? '#4a5560' : '#566270',
      highway: ['#8a2a22', '#2a4a7a', '#c8c8c0', '#3a3a3e'][i % 4], capital: i % 2 ? '#8a8a84' : '#77776f',
      factory: i % 2 ? '#c8b030' : '#3a5a8a', airport: i % 2 ? '#d8d8d4' : '#5a6068', snow: i % 2 ? '#5a4030' : '#4a3424', lighthouse: i % 2 ? '#4a4e56' : '#5c4030',
    }[variant] || '#6b4a2b';
    ctx.fillStyle = plank;
    ctx.fillRect(-44, -7, 88, 14);
    if (variant === 'harbor') { ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let r = -40; r < 44; r += 8) ctx.fillRect(r, -7, 2, 14); }
    if (variant === 'base') { ctx.fillStyle = '#e8c040'; for (let r = -40; r < 40; r += 14) { ctx.beginPath(); ctx.moveTo(r, 7); ctx.lineTo(r + 6, -7); ctx.lineTo(r + 10, -7); ctx.lineTo(r + 4, 7); ctx.fill(); } }
    if (variant === 'dam') { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-44, -1, 88, 2); }
    if (variant === 'highway') { ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(-44, -7, 88, 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-12, -3, 18, 6); }
    if (variant === 'capital') { ctx.fillStyle = '#e8c030'; for (let r = -40; r < 40; r += 16) ctx.fillRect(r, -2, 8, 4); }
    if (variant === 'factory') { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-44, -1, 88, 2); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-6, -5, 12, 10); }
    if (variant === 'airport') { ctx.fillStyle = '#d83a2a'; for (let r = -40; r < 40; r += 20) ctx.fillRect(r, -7, 10, 14); }
    if (variant === 'snow') { ctx.fillStyle = 'rgba(240,245,255,0.85)'; ctx.fillRect(-44, -7, 88, 4); }
    if (variant === 'lighthouse') { ctx.fillStyle = '#e8c040'; for (let r = -40; r < 40; r += 14) { ctx.beginPath(); ctx.moveTo(r, 7); ctx.lineTo(r + 6, -7); ctx.lineTo(r + 10, -7); ctx.lineTo(r + 4, 7); ctx.fill(); } }
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
  sniper: [[0, 13, 24, 9], [22, 12, 76, 5], [32, 3, 30, 6], [38, 9, 3, 4], [54, 9, 3, 4], [28, 17, 8, 11], [92, 11, 6, 7]],
  cryo: [[0, 11, 30, 12], [28, 13, 48, 8], [74, 10, 14, 14], [30, 22, 8, 12], [8, 24, 18, 10], [44, 4, 10, 8]],
  railgun: [[0, 12, 26, 10], [24, 9, 64, 14], [86, 13, 18, 6], [32, 23, 8, 12], [40, 3, 34, 5], [100, 11, 4, 10]],
  tesla: [[0, 11, 28, 12], [26, 8, 40, 18], [64, 13, 22, 8], [84, 9, 8, 16], [32, 26, 8, 10], [42, 3, 4, 6], [52, 3, 4, 6]],
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
  if (id === 'tesla') { ctx.fillStyle = '#6ad0ff'; ctx.fillRect(30, 12, 32, 4); ctx.fillRect(84, 14, 8, 6); }
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
  hung: {
    skin: '#d9a072', hair: 'short', hairColor: '#1a1410', head: 'bandana', stubble: true,
    outfit: 'camo', top: '#5a6a40', topShade: '#48563a', accent: '#3d4a2a',
    pants: '#4a5236', shoes: '#1e1a14', kneePads: true, gloves: '#2a2a2a',
  },
  linh: {
    female: true, skin: '#f7d4b6', hair: 'longStraight', hairColor: '#0e0a0a', head: 'beret',
    outfit: 'tactical', top: '#55603e', topShade: '#475234', accent: '#1e2024',
    pants: '#2a2e30', shoes: '#141414', lips: '#c8485e', eyes: '#2a1a12', gloves: '#1e1e1e',
  },
  khoa: {
    skin: '#f0c49a', hair: 'neat', hairColor: '#1c1612', head: 'glasses',
    outfit: 'labcoat', top: '#f2f4f6', topShade: '#d6dadf', accent: '#4a6a9a',
    pants: '#3a3f4a', shoes: '#2a2420',
  },
  tuan: {
    skin: '#d4a070', hair: 'short', hairColor: '#1c1410', head: 'cap', stubble: true,
    outfit: 'flannel', top: '#9a2e2a', topShade: '#7a2422', accent: '#2a1a18',
    pants: '#3a4a6a', shoes: '#3a2a1c',
  },
  ngoc: {
    female: true, skin: '#f8d6ba', hair: 'longStraight', hairColor: '#4a2a18', head: 'none',
    outfit: 'press', top: '#f4f4f0', topShade: '#dcdcd4', accent: '#2a5aa0',
    pants: '#8a7a5a', shoes: '#f0ece6', lips: '#e05a74', eyes: '#3a2214',
  },
  dat: {
    skin: '#e0aa80', hair: 'short', hairColor: '#1a1410', head: 'fireHelmet',
    outfit: 'firesuit', top: '#c8a060', topShade: '#a8844a', accent: '#e8e8a0',
    pants: '#b89050', shoes: '#1a1612', gloves: '#3a2a1a',
  },
  ha: {
    female: true, skin: '#f4d0b0', hair: 'braid', hairColor: '#120c0a', head: 'none',
    outfit: 'tactical', top: '#22262e', topShade: '#1a1d24', accent: '#0e1014',
    pants: '#1c1f26', shoes: '#0e0e10', lips: '#c84860', eyes: '#2a1a12', gloves: '#141416',
  },
  son: {
    skin: '#d49a6a', hair: 'short', hairColor: '#1a1410', head: 'hardhat', stubble: true,
    outfit: 'overalls', top: '#6a5a40', topShade: '#584a34', accent: '#d8a020',
    pants: '#3a3a30', shoes: '#2a2018', gloves: '#2a2a2a',
  },
  thao: {
    female: true, skin: '#f6d4b6', hair: 'bob', hairColor: '#1a1210', head: 'goggles',
    outfit: 'labcoat', top: '#f2f6f6', topShade: '#d6dede', accent: '#3aa0a0',
    pants: '#3a4a5a', shoes: '#e8e8e8', lips: '#d9576b', eyes: '#3a2418',
  },
  kien: {
    skin: '#e0ae84', hair: 'neat', hairColor: '#1c1612', head: 'headphones',
    outfit: 'jacket', top: '#5a6a4a', topShade: '#4a5a3c', accent: '#c8a050',
    pants: '#3a3a3e', shoes: '#2a2018', gloves: '#3a2a22',
  },
  nhi: {
    female: true, skin: '#f8d8bc', hair: 'ponytail', hairColor: '#2a1810', head: 'headphones',
    outfit: 'hivis', top: '#2a3448', topShade: '#222a3a', accent: '#ff8a1e',
    pants: '#2a2e3a', shoes: '#1a1a1e', lips: '#e05a74', eyes: '#3a2214',
  },
  quang: {
    old: true, skin: '#c89064', hair: 'gray', hairColor: '#8a8478', head: 'hunterHat', beard: '#e8e8e8',
    outfit: 'camo', top: '#e8ece8', topShade: '#c8d0cc', accent: '#5a6a5a',
    pants: '#4a5248', shoes: '#2a2420', gloves: '#3a3a3a',
  },
  tuyet: {
    female: true, skin: '#f8dcc4', hair: 'braid', hairColor: '#3a2014', head: 'cap',
    outfit: 'jacket', top: '#c84040', topShade: '#a83434', accent: '#2a2a30',
    pants: '#2a3040', shoes: '#4a3a2a', lips: '#d84a62', eyes: '#3a2214', gloves: '#2a2a30',
  },
  minh: {
    skin: '#eec09a', hair: 'spiky', hairColor: '#141214', head: 'glasses',
    outfit: 'shirtTie', top: '#3a4458', topShade: '#2e3648', accent: '#9aa4b8',
    pants: '#2a2e38', shoes: '#141416',
  },
  an: {
    female: true, skin: '#f4d2b4', hair: 'longStraight', hairColor: '#0e0a0a', head: 'glasses',
    outfit: 'labcoat', top: '#eef0f4', topShade: '#d0d4dc', accent: '#2a6a5a',
    pants: '#2a2e36', shoes: '#1a1a1e', lips: '#c8485e', eyes: '#2a1a12',
  },
  vy: {
    female: true, skin: '#f6d0ae', hair: 'buns', hairColor: '#2a1810', head: 'hardhat',
    outfit: 'hivis', top: '#2e3a5a', topShade: '#26304a', accent: '#ff8a1e',
    pants: '#3a4a6a', shoes: '#5a3a22', lips: '#e05a74', eyes: '#3a2214', gloves: '#e8c040',
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
  } else if (C.hair === 'longStraight') {
    const sway = Math.sin(t * 2 + x) * 1.5;
    ctx.beginPath();
    ctx.moveTo(hx - 11, hy - 6);
    ctx.quadraticCurveTo(hx - 16, hy + 14, hx - 14 + sway, hy + 34);
    ctx.lineTo(hx - 4 + sway, hy + 32);
    ctx.quadraticCurveTo(hx - 4, hy + 14, hx + 1, hy + 2);
    ctx.fill();
  } else if (C.hair === 'buns') {
    ctx.beginPath(); ctx.arc(hx - 11, hy - 5, 4.6, 0, Math.PI * 2); ctx.arc(hx - 9, hy + 4, 4.2, 0, Math.PI * 2); ctx.fill();
  } else if (C.hair === 'braid') { // bím tóc thả sau lưng
    for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(hx - 11 - k * 0.6, hy + 2 + k * 4.5, 3.2, 2.6, 0.3, 0, Math.PI * 2); ctx.fill(); }
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
  } else if (C.outfit === 'flannel') { // sơ mi caro
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.2;
    for (let k = -10; k <= 12; k += 5) { ctx.beginPath(); ctx.moveTo(x + k, top + 2); ctx.lineTo(x + k, foot - 40); ctx.stroke(); }
    for (let yy = top + 6; yy < foot - 40; yy += 6) { ctx.beginPath(); ctx.moveTo(bx, yy); ctx.lineTo(bx + bw, yy); ctx.stroke(); }
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(bx, foot - 39, bw, 4);
  } else if (C.outfit === 'press') { // áo gi-lê báo chí + máy quay
    ctx.fillStyle = C.accent;
    roundRect(ctx, bx - 1, top + 4, bw + 2, 30, 3); ctx.fill();
    ctx.fillStyle = '#f0f0f0'; ctx.font = 'bold 4.2px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('BÁO CHÍ', x, top + 18);
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - 9, top + 1); ctx.lineTo(x + 9, top + 30); ctx.stroke();
    ctx.fillStyle = '#1e1e22'; roundRect(ctx, x + 5, top + 26, 9, 7, 1.5); ctx.fill();
    ctx.fillStyle = '#5a8ad0'; ctx.beginPath(); ctx.arc(x + 12, top + 29.5, 2, 0, Math.PI * 2); ctx.fill();
  } else if (C.outfit === 'firesuit') { // đồ chống cháy có sọc phản quang
    ctx.fillStyle = C.accent; ctx.fillRect(bx, top + 18, bw, 3); ctx.fillRect(bx, top + 32, bw, 3);
    ctx.fillStyle = '#c0c0c0'; ctx.fillRect(bx, top + 19, bw, 1);
    ctx.fillStyle = '#c03028'; roundRect(ctx, bx - 4, top + 4, 6, 26, 2); ctx.fill(); // bình khí sau lưng
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(bx, foot - 39, bw, 4);
  } else if (C.outfit === 'camo') {
    ctx.fillStyle = C.accent; // vằn rằn ri
    for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.ellipse(bx + 4 + (k * 7) % bw, top + 6 + k * 6, 4, 2.4, k, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#6b4a2b'; ctx.fillRect(x - 13, top + 26, 26, 4); // dây đạn
    ctx.fillStyle = '#d8b04a'; for (let k = 0; k < 6; k++) ctx.fillRect(x - 12 + k * 4.4, top + 25, 2, 6);
    ctx.fillStyle = '#2a2a1e'; ctx.fillRect(bx, foot - 39, bw, 4);
    ctx.fillStyle = '#c0c4c8'; ctx.fillRect(x + 1, top + 3, 3, 5); // thẻ bài
  } else if (C.outfit === 'tactical') {
    ctx.fillStyle = C.accent; // áo giáp chiến thuật
    roundRect(ctx, bx - 1, top + 6, bw + 2, 30, 4); ctx.fill();
    ctx.fillStyle = '#34383e'; for (let k = 0; k < 3; k++) roundRect(ctx, bx + 2 + k * 7, top + 16, 6, 9, 1.5), ctx.fill();
    ctx.fillStyle = '#d8d8d8'; ctx.fillRect(x - 9, top + 9, 6, 2);
    ctx.fillStyle = '#22252a'; ctx.fillRect(bx, foot - 39, bw, 3);
  } else if (C.outfit === 'labcoat') {
    ctx.fillStyle = C.top; // áo blouse dài quá hông
    ctx.beginPath(); ctx.moveTo(bx, top + 4); ctx.lineTo(bx + bw, top + 4); ctx.lineTo(bx + bw + 3, foot - 22); ctx.lineTo(bx - 3, foot - 22); ctx.fill();
    ctx.fillStyle = '#7aa2d8'; ctx.beginPath(); ctx.moveTo(x - 1, top + 1); ctx.lineTo(x + 6, top + 1); ctx.lineTo(x + 3, top + 14); ctx.fill(); // áo sơ mi xanh bên trong
    ctx.fillStyle = C.accent; ctx.fillRect(x + 2, top + 4, 2.4, 12);
    ctx.fillStyle = C.topShade; ctx.fillRect(x + 1, top + 20, 8, 6);
    ctx.fillStyle = '#c03030'; ctx.fillRect(x + 6, top + 18, 1.5, 5);
    ctx.fillStyle = 'rgba(140,20,20,0.5)'; ctx.beginPath(); ctx.ellipse(x - 5, top + 34, 3, 4, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a6aa0'; roundRect(ctx, x - 8, top + 10, 6, 8, 1); ctx.fill(); // thẻ tên
  } else if (C.outfit === 'hivis') {
    ctx.fillStyle = C.accent; // áo phản quang cam
    ctx.beginPath(); ctx.moveTo(bx, top + 3); ctx.lineTo(x - 2, top + 2); ctx.lineTo(x - 1, foot - 40); ctx.lineTo(bx, foot - 40); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 5, top + 2); ctx.lineTo(bx + bw, top + 3); ctx.lineTo(bx + bw, foot - 40); ctx.lineTo(x + 6, foot - 40); ctx.fill();
    ctx.fillStyle = '#e8eef2'; ctx.fillRect(bx, top + 20, bw, 3); ctx.fillRect(bx, top + 30, bw, 3);
    ctx.fillStyle = '#9aa0a8'; ctx.fillRect(x + 8, foot - 46, 3, 10); // tua vít
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

  if (C.stubble) {
    ctx.fillStyle = 'rgba(40,25,15,0.35)';
    ctx.beginPath(); ctx.moveTo(hx, hy + 3); ctx.quadraticCurveTo(hx + 3, hy + 11, hx + 9, hy + 8); ctx.lineTo(hx + 9, hy + 5); ctx.quadraticCurveTo(hx + 4, hy + 7, hx + 2, hy + 3); ctx.fill();
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
  } else if (C.hair === 'longStraight') {
    ctx.beginPath(); // mái thẳng, tóc phủ hai bên
    ctx.moveTo(hx - 11, hy + 6);
    ctx.quadraticCurveTo(hx - 13, hy - 12, hx, hy - 12.5);
    ctx.quadraticCurveTo(hx + 11, hy - 12, hx + 11, hy - 3);
    ctx.lineTo(hx + 4, hy - 4); ctx.lineTo(hx + 2, hy - 7); ctx.lineTo(hx - 2, hy - 3);
    ctx.lineTo(hx - 5, hy + 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(hx - 1, hy - 3, 8.5, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
  } else if (C.hair === 'buns') {
    ctx.beginPath();
    ctx.moveTo(hx - 11, hy + 4);
    ctx.quadraticCurveTo(hx - 12, hy - 12, hx + 1, hy - 12);
    ctx.quadraticCurveTo(hx + 11, hy - 11, hx + 11, hy - 4);
    ctx.quadraticCurveTo(hx + 6, hy - 7, hx + 1, hy - 5);
    ctx.quadraticCurveTo(hx - 3, hy - 3, hx - 5, hy + 2);
    ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx + 9, hy - 3); ctx.quadraticCurveTo(hx + 11, hy + 2, hx + 9.5, hy + 6); ctx.lineTo(hx + 8.6, hy - 1); ctx.fill(); // lọn tóc mai
  } else if (C.hair === 'neat') {
    ctx.beginPath();
    ctx.moveTo(hx - 11, hy + 3);
    ctx.quadraticCurveTo(hx - 12, hy - 11, hx - 1, hy - 12);
    ctx.quadraticCurveTo(hx + 9, hy - 12.5, hx + 11, hy - 6);
    ctx.lineTo(hx + 2, hy - 7);
    ctx.lineTo(hx - 4, hy - 4); ctx.lineTo(hx - 6, hy + 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(hx - 3, hy - 11); ctx.lineTo(hx + 1, hy - 7.5); ctx.stroke();
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
  } else if (C.head === 'bandana') {
    ctx.fillStyle = '#b83228';
    ctx.beginPath(); ctx.moveTo(hx - 11, hy - 5); ctx.quadraticCurveTo(hx, hy - 10, hx + 11, hy - 6); ctx.lineTo(hx + 11, hy - 2.5); ctx.quadraticCurveTo(hx, hy - 6.5, hx - 11, hy - 1.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx - 11, hy - 4); ctx.lineTo(hx - 18, hy - 1 + Math.sin(t * 4 + x) * 1.5); ctx.lineTo(hx - 17, hy + 3); ctx.lineTo(hx - 10, hy - 1); ctx.fill();
  } else if (C.head === 'beret') {
    ctx.fillStyle = '#2e3a24';
    ctx.beginPath(); ctx.ellipse(hx - 1, hy - 11, 11, 4.6, -0.25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d8b04a'; ctx.beginPath(); ctx.arc(hx + 4, hy - 12, 1.4, 0, Math.PI * 2); ctx.fill();
  } else if (C.head === 'glasses') {
    ctx.strokeStyle = '#1a1a1e'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(hx + 7, hy - 1, 3, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx + 4, hy - 1.5); ctx.lineTo(hx - 3, hy - 0.5); ctx.stroke();
    ctx.fillStyle = 'rgba(200,230,255,0.25)'; ctx.beginPath(); ctx.arc(hx + 7, hy - 1, 2.6, 0, Math.PI * 2); ctx.fill();
  } else if (C.head === 'hardhat') {
    ctx.fillStyle = '#f2c230';
    ctx.beginPath(); ctx.moveTo(hx - 10, hy - 7); ctx.quadraticCurveTo(hx - 10, hy - 19, hx + 1, hy - 19); ctx.quadraticCurveTo(hx + 11, hy - 19, hx + 11, hy - 7); ctx.fill();
    ctx.fillRect(hx - 11, hy - 8, 26, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(hx - 1, hy - 19, 3, 11);
  } else if (C.head === 'cap') { // mũ lưỡi trai
    ctx.fillStyle = '#2a4a7a';
    ctx.beginPath(); ctx.moveTo(hx - 10, hy - 6); ctx.quadraticCurveTo(hx - 9, hy - 17, hx + 1, hy - 17); ctx.quadraticCurveTo(hx + 10, hy - 16, hx + 10, hy - 6); ctx.fill();
    ctx.fillRect(hx + 4, hy - 8, 12, 3);
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(hx - 3, hy - 14, 6, 4);
  } else if (C.head === 'fireHelmet') { // mũ cứu hỏa
    ctx.fillStyle = '#d8b030';
    ctx.beginPath(); ctx.moveTo(hx - 11, hy - 6); ctx.quadraticCurveTo(hx - 10, hy - 20, hx + 1, hy - 20); ctx.quadraticCurveTo(hx + 12, hy - 19, hx + 11, hy - 6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx - 14, hy - 4); ctx.lineTo(hx + 16, hy - 6); ctx.lineTo(hx + 14, hy - 3); ctx.lineTo(hx - 14, hy - 1); ctx.fill();
    ctx.fillStyle = '#a02020'; ctx.fillRect(hx - 2, hy - 19, 5, 6);
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
