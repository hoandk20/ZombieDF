import { ZOMBIES, BARRICADE_X, LANE_MIN, LANE_MAX, W } from './config.js';
import { L } from './i18n.js';
import { pixelState, pixelSprite, blit, snap } from './pixel.js';

const rand = (a, b) => a + Math.random() * (b - a);
// ---------- vẽ khối: chi thuôn có viền, vệt sáng trăng và bóng đổ ----------
const OUTLINE = 'rgba(10,6,6,0.78)';
const LIGHT = { x: 0.6, y: -0.8 }; // trăng ở phía trên bên phải
function tubePath(ctx, x0, y0, x1, y1, w0, w1, caps = true) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  ctx.beginPath();
  ctx.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2);
  ctx.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2);
  ctx.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2);
  ctx.lineTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2);
  ctx.closePath();
  if (caps) {
    ctx.moveTo(x0 + w0 / 2, y0); ctx.arc(x0, y0, w0 / 2, 0, Math.PI * 2);
    ctx.moveTo(x1 + w1 / 2, y1); ctx.arc(x1, y1, w1 / 2, 0, Math.PI * 2);
  }
  return { nx, ny };
}
// một đoạn tay/chân: viền tối → màu chính → bóng phía khuất → vệt sáng phía trăng
function seg(ctx, x0, y0, x1, y1, w0, w1, col, o, flat = false) {
  if (LITE) { ctx.fillStyle = col; tubePath(ctx, x0, y0, x1, y1, w0, w1); ctx.fill(); return; }
  ctx.fillStyle = OUTLINE;
  const { nx, ny } = tubePath(ctx, x0, y0, x1, y1, w0 + o * 2, w1 + o * 2);
  ctx.fill();
  ctx.fillStyle = col;
  tubePath(ctx, x0, y0, x1, y1, w0, w1);
  ctx.fill();
  if (flat) return;
  const side = nx * LIGHT.x + ny * LIGHT.y > 0 ? 1 : -1;
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  tubePath(ctx, x0 - nx * side * w0 * 0.32, y0 - ny * side * w0 * 0.32, x1 - nx * side * w1 * 0.32, y1 - ny * side * w1 * 0.32, w0 * 0.34, w1 * 0.34, false);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,245,220,0.15)';
  tubePath(ctx, x0 + nx * side * w0 * 0.3, y0 + ny * side * w0 * 0.3, x1 + nx * side * w1 * 0.3, y1 + ny * side * w1 * 0.3, w0 * 0.22, w1 * 0.22, false);
  ctx.fill();
}
// cả một chi nhiều đốt: vẽ viền tất cả các đốt trước rồi mới tô, để khớp nối liền mạch
let LITE = false; // vẽ gọn cho zombie ở xa
function limb(ctx, pts, ws, col, o, flat = false) {
  if (LITE) { ctx.fillStyle = col; for (let i = 0; i < pts.length - 1; i++) { tubePath(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], ws[i], ws[i + 1]); ctx.fill(); } return; }
  ctx.fillStyle = OUTLINE;
  for (let i = 0; i < pts.length - 1; i++) { tubePath(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], ws[i] + o * 2, ws[i + 1] + o * 2); ctx.fill(); }
  ctx.fillStyle = col;
  for (let i = 0; i < pts.length - 1; i++) { tubePath(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], ws[i], ws[i + 1]); ctx.fill(); }
  if (flat) return;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], w0 = ws[i], w1 = ws[i + 1];
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const side = nx * LIGHT.x + ny * LIGHT.y > 0 ? 1 : -1;
    ctx.fillStyle = 'rgba(0,0,0,0.17)';
    tubePath(ctx, x0 - nx * side * w0 * 0.3, y0 - ny * side * w0 * 0.3, x1 - nx * side * w1 * 0.3, y1 - ny * side * w1 * 0.3, w0 * 0.38, w1 * 0.38, false); ctx.fill();
    ctx.fillStyle = 'rgba(255,245,220,0.16)';
    tubePath(ctx, x0 + nx * side * w0 * 0.32, y0 + ny * side * w0 * 0.32, x1 + nx * side * w1 * 0.32, y1 + ny * side * w1 * 0.32, w0 * 0.2, w1 * 0.2, false); ctx.fill();
  }
}

// tô một hình đã dựng path bằng màu chuyển sáng tối theo chiều ngang + viền
const gradCache = new Map();
function shadeFill(ctx, x0, x1, col, flash, o) {
  if (LITE) { ctx.fillStyle = col; ctx.fill(); return; }
  if (flash) ctx.fillStyle = col;
  else {
    // màu chuyển theo toạ độ cục bộ của zombie nên dùng lại được giữa các khung hình
    const key = `${x0.toFixed(1)}|${x1.toFixed(1)}|${col}`;
    let g = gradCache.get(key);
    if (!g) {
      g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, shade(col, -34));
      g.addColorStop(0.55, col);
      g.addColorStop(0.92, shade(col, 16));
      g.addColorStop(1, shade(col, 34));
      if (gradCache.size > 4000) gradCache.clear();
      gradCache.set(key, g);
    }
    ctx.fillStyle = g;
  }
  ctx.fill();
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = o; ctx.stroke();
}

// vị trí đầu (tỉ lệ theo chiều cao) cho dáng còng lưng; dùng chung cho hitbox và hình vẽ
const HEAD_X = 0.17, HEAD_Y = 0.86, HEAD_R = 0.105;
// tư thế nằm sấp khi mất cả hai chân: xoay thân và dịch về sau (theo tỉ lệ chiều cao)
const LEGLESS = { rot: -1.0, tx: 0.6, ty: 0.1 }; // thân chống lên hai tay, đầu ngóc lên

const TAU_Z = Math.PI * 2;

// pha hai màu hex
function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (sh) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
  return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
}
const pick = (a) => a[Math.floor(Math.random() * a.length)];
// da người thật, nhuốm màu tử thi
const SKINS = ['#d8b896', '#c9a07a', '#b48a64', '#9a7252', '#e2c6a6', '#86634a'];
const SHIRTS = ['#6a2a2a', '#2a3a5a', '#3a5a3a', '#8a8a80', '#c8bea4', '#4a3a5a', '#8a5a2a', '#26262c', '#5a6a7a', '#a03a2a', '#d8d4c8', '#3a6a6a'];
const PANTS = ['#2a3450', '#3a3a3e', '#5a4a32', '#22222a', '#4a5a6a', '#6a5a40', '#2a3a2a'];
const HAIRS = ['#16100e', '#3a2418', '#5a4a3a', '#2a2a2a', '#7a7064', '#8a5a2a'];
// loại zombie "người thường": quần áo và tóc đổi theo từng con; loại đặc biệt giữ trang phục nhận diện
const CIVIL = new Set(['walker', 'runner', 'reviver', 'leaper', 'stalker', 'splitter', 'screamer', 'spawnling']);
function makeLook(T, type, female) {
  const civil = CIVIL.has(type);
  const skin = mixHex(pick(SKINS), T.skin, civil ? 0.38 : 0.55); // vẫn giữ chút sắc riêng của từng loại
  const look = {
    skin,
    shirt: civil ? pick(SHIRTS) : T.shirt,
    pants: civil ? pick(PANTS) : T.pants,
    hair: pick(HAIRS),
    style: female ? 'long' : pick(civil ? ['bald', 'short', 'short', 'messy', 'cap', 'long', 'short'] : ['bald', 'short', 'messy']),
    build: civil ? pick([0.88, 1, 1, 1.14]) : 1,
    sleeves: civil ? pick(['short', 'long', 'long']) : 'long',
    acc: civil && !female ? pick(['', '', '', '', 'glasses', 'tie', 'beard']) : '',
    cap: pick(['#8a2a22', '#2a3a6a', '#3a3a3a', '#c8b060']),
  };
  look.key = [look.skin, look.shirt, look.pants, look.hair, look.style, look.build, look.sleeves, look.acc, look.style === 'cap' ? look.cap : ''].join('');
  return look;
}

export class Zombie {
  constructor(type, hpMul = 1, demo = false) {
    const T = ZOMBIES[type];
    this.type = type;
    this.T = T;
    const sizeVar = [0.94, 1, 1.06][Math.floor(Math.random() * 3)]; // 3 cỡ cố định để dùng chung sprite pixel
    this.h = T.h * sizeVar;
    this.w = T.w * sizeVar;
    this.maxHp = T.hp * hpMul;
    this.hp = this.maxHp;
    this.speed = T.speed * rand(0.85, 1.15);
    this.foot = rand(LANE_MIN, LANE_MAX);
    // con nhanh nhẹn đi lạng lách đổi làn, con thường thỉnh thoảng loạng choạng sang ngang
    this.lane = null; // làn gốc, gán ở bước đi đầu tiên (nơi sinh ra có thể đặt lại foot)
    this.weave = T.boss ? 0 : ['runner', 'dog', 'leaper', 'stalker', 'spawnling'].includes(type) ? rand(16, 30) : Math.random() < 0.35 ? rand(4, 10) : 0;
    this.weavePh = rand(0, Math.PI * 2);
    this.x = W + 40 + rand(0, 60);
    this.demo = demo;
    this.targetX = T.ranged ? rand(470, 640) : T.screamer ? rand(540, 720) : T.bounty ? rand(360, 470) : BARRICADE_X + this.w / 2 + rand(-2, 10);
    this.buffT = 0;
    this.screamT = 0;
    this.reviveT = 0;
    this.revived = false;
    this.fleeing = false;
    if (demo) this.speed *= 0.8;
    if (T.boss) { this.foot = (LANE_MIN + LANE_MAX) / 2 + 10; this.roarT = 2; }
    this.state = 'walk'; // walk | attack | dead
    this.phase = rand(0, Math.PI * 2);
    this.atkT = rand(0.2, T.atkRate);
    this.swing = 0;
    this.hitT = 0;
    this.deadT = 0;
    this.headless = false;
    this.helmet = T.helmet ? T.helmet * hpMul : 0;
    this.dmg = T.dmg; // game nhân thêm theo đêm và độ khó
    // ngoại hình riêng: zombie nữ, cụt tay, lộ sọ, đầu giật
    const plain = T.kind === 'upright' && !T.boss && !T.heavy && !T.armored && !T.shield && !T.bomber;
    this.female = plain && Math.random() < 0.4;
    this.dress = ['#5a3a44', '#3a4a5a', '#6a5a3a', '#4a2a2a', '#5a5a62', '#6a3a2a', '#7a6a6a'][Math.floor(Math.random() * 7)];
    this.hairCol = ['#16100e', '#3a2418', '#5a4a3a', '#2a2a2a', '#6a6050'][Math.floor(Math.random() * 5)];
    this.oneArm = plain && Math.random() < 0.15;
    // cắt rời chi: bắn đủ đau vào tay/chân thì rụng
    this.armsLost = this.oneArm ? 1 : 0;
    this.legsLost = 0;
    this.legless = false;
    this.armDmg = 0;
    this.legDmg = 0;
    this.bleedT = 0;
    this.bleedAt = null;
    this.skull = !this.female && Math.random() < 0.18;
    this.look = makeLook(T, type, this.female);
    this.twitchT = rand(1.5, 5);
    this.twitching = 0;
    this.detail = true; // game tắt bớt chi tiết cho con ở xa khi quá đông
    this.kbRecent = 0;
    this.burnT = 0;
    this.burnDps = 0;
    this.stunT = 0;
    this.leapt = false;
    this.leaping = false;
    this.jumpY = 0;
    this.chargeT = 4;
    this.charging = 0;
  }

  get alive() { return this.state !== 'dead'; }

  // khối lượng tương đối so với một xác sống thường (dùng cho độ đẩy lùi)
  mass() {
    let m = (this.h * this.w) / (104 * 30);
    if (this.T.heavy) m *= 2.5;
    if (this.T.boss) m *= 6;
    if (this.elite) m *= 1.5;
    if (this.T.shield || this.T.plated || this.T.armored) m *= 1.3;
    return Math.max(0.6, m);
  }

  // toạ độ thân (đứng) -> toạ độ tại chỗ khi nằm sấp bò (so với x, foot)
  fromBody(px, py) {
    const c = Math.cos(LEGLESS.rot), sn = Math.sin(LEGLESS.rot), h = this.h;
    return [h * LEGLESS.tx + px * c - py * sn, h * LEGLESS.ty + px * sn + py * c];
  }
  toBody(X, Y) {
    const c = Math.cos(-LEGLESS.rot), sn = Math.sin(-LEGLESS.rot);
    X -= this.h * LEGLESS.tx; Y -= this.h * LEGLESS.ty;
    return [X * c - Y * sn, X * sn + Y * c];
  }
  canDismember() { return this.T.kind === 'upright' && !this.T.boss; }

  // Trúng đạn vào thân ở độ cao y (thế giới): cộng dồn sát thương lên tay / chân, đủ thì rụng
  // bắn vào chân: ít sát thương hơn nhưng dễ làm đứt chân -> zombie thường còn sống để bò
  isLegShot(y) { return this.canDismember() && !this.legless && this.legsLost < 2 && (this.foot + this.jumpY - y) / this.h < 0.44; }
  limbHit(dmg, y, game) {
    if (!this.canDismember()) return;
    const rel = (this.foot + this.jumpY - y) / this.h;
    const thr = this.maxHp * (this.T.heavy ? 0.5 : 0.34);
    const legThr = this.maxHp * (this.T.heavy ? 0.35 : 0.2);
    if (this.legless) { // đang bò: chỉ còn tay để bắn rụng
      if (this.armsLost < 2 && !this.T.shield) { this.armDmg += dmg * 0.6; if (this.armDmg >= thr) { this.armDmg = 0; this.loseArm(game); } }
      return;
    }
    if (rel < 0.44 && this.legsLost < 2) {
      this.legDmg += dmg;
      if (this.legDmg >= legThr) { this.legDmg = 0; this.loseLeg(game); }
    } else if (rel >= 0.48 && rel < 0.8 && this.armsLost < 2 && !this.T.shield) {
      this.armDmg += dmg * 0.7;
      if (this.armDmg >= thr) { this.armDmg = 0; this.loseArm(game); }
    }
  }
  // vụ nổ xé xác: rụng ngẫu nhiên một hai chi
  blastLimbs(game) {
    if (!this.canDismember()) return;
    if (this.legsLost < 2 && Math.random() < 0.6) this.loseLeg(game);
    if (this.armsLost < 2 && !this.T.shield && Math.random() < 0.5) this.loseArm(game);
  }
  loseArm(game) {
    this.armsLost++;
    const s = this.h / 100;
    const sh = this.legless ? this.fromBody(-this.h * 0.1, -this.h * 0.72) : [-this.h * 0.1 - 4 * s, -this.h * 0.7];
    this.bleedAt = sh; this.bleedT = 1.6;
    this.dmg *= this.armsLost >= 2 ? 0.55 : 0.8; // cụt tay thì cào yếu đi
    game.sever(this, 'arm', this.x + sh[0], this.foot + sh[1] + this.jumpY);
  }
  loseLeg(game) {
    this.legsLost++;
    const at = [0, -this.h * 0.42];
    this.bleedAt = at; this.bleedT = 1.8;
    game.sever(this, 'leg', this.x + at[0], this.foot + at[1] + this.jumpY);
    if (this.legsLost === 1) { this.speed *= 0.62; this.stunT = Math.max(this.stunT, 0.25); return; } // khập khiễng
    // mất cả hai chân: đổ sấp xuống, lết bằng tay
    this.legless = true;
    this.leaping = false; this.jumpY = 0; this.charging = 0;
    this.speed *= 0.55;
    this.stunT = Math.max(this.stunT, 0.6);
    this.bleedAt = this.fromBody(0, -this.h * 0.47);
    if (!this.T.ranged && !this.T.screamer && !this.T.bounty) this.targetX = BARRICADE_X + this.h * 0.32;
    if (this.state === 'attack' && this.x > this.targetX + 3) this.state = 'walk';
  }

  // Hitbox trong toạ độ thế giới
  boxes() {
    if (this.T.kind === 'dog') {
      const r = this.h * 0.24;
      return {
        hx: this.x - this.w / 2 + r * 0.6, hy: this.foot - this.h * 0.74, hr: r,
        bx0: this.x - this.w / 2 + r, by0: this.foot - this.h * 0.82,
        bx1: this.x + this.w / 2, by1: this.foot,
      };
    }
    if (this.T.kind === 'crawl') {
      const r = this.h * 0.27;
      return {
        hx: this.x - this.w / 2 + r, hy: this.foot - r - 4, hr: r,
        bx0: this.x - this.w / 2 + r, by0: this.foot - this.h * 0.62,
        bx1: this.x + this.w / 2, by1: this.foot,
      };
    }
    if (this.legless) { // mất cả hai chân: nằm sấp, lết bằng tay
      const r = this.h * HEAD_R;
      const [hx, hy] = this.fromBody(-this.h * HEAD_X, -this.h * HEAD_Y);
      return {
        hx: this.x + hx, hy: this.foot + hy, hr: r,
        bx0: this.x + hx + r * 0.6, by0: this.foot - this.h * 0.38,
        bx1: this.x + this.h * 0.3, by1: this.foot,
      };
    }
    // dáng còng lưng: đầu chúi về phía trước và thấp xuống
    const r = this.h * HEAD_R;
    const hy = this.foot - this.h * HEAD_Y;
    return {
      hx: this.x - this.h * HEAD_X, hy, hr: r,
      bx0: this.x - this.w / 2 - this.h * 0.07, by0: hy + r * 0.8,
      bx1: this.x + this.w / 2, by1: this.foot,
    };
  }

  // Giao của tia (o + t*d) với zombie. Trả về {t, head} hoặc null.
  rayHit(ox, oy, dx, dy) {
    const b = this.boxes();
    let best = null;
    if (!this.headless) {
      const fx = ox - b.hx, fy = oy - b.hy;
      const bq = fx * dx + fy * dy;
      const c = fx * fx + fy * fy - b.hr * b.hr;
      const disc = bq * bq - c;
      if (disc >= 0) {
        const t = -bq - Math.sqrt(disc);
        if (t > 0) best = { t, head: true };
      }
    }
    // slab test cho hình chữ nhật thân
    let tmin = -Infinity, tmax = Infinity;
    if (Math.abs(dx) < 1e-9) { if (ox < b.bx0 || ox > b.bx1) return best; }
    else {
      const t1 = (b.bx0 - ox) / dx, t2 = (b.bx1 - ox) / dx;
      tmin = Math.max(tmin, Math.min(t1, t2)); tmax = Math.min(tmax, Math.max(t1, t2));
    }
    if (Math.abs(dy) < 1e-9) { if (oy < b.by0 || oy > b.by1) return best; }
    else {
      const t1 = (b.by0 - oy) / dy, t2 = (b.by1 - oy) / dy;
      tmin = Math.max(tmin, Math.min(t1, t2)); tmax = Math.min(tmax, Math.max(t1, t2));
    }
    if (tmax >= tmin && tmax > 0) {
      const t = Math.max(tmin, 0);
      if (!best || t < best.t) best = { t, head: false };
    }
    return best;
  }

  update(dt, game) {
    this.hitT = Math.max(0, this.hitT - dt);
    if (this.state === 'dead') {
      this.deadT += dt;
      this.burnT = 0;
      if (this.reviveT > 0) {
        this.reviveT -= dt;
        if (this.reviveT <= 0) { // đứng dậy lần nữa
          this.state = 'walk';
          this.hp = this.maxHp * 0.5;
          this.revived = true;
          this.deadT = 0;
          this.hitT = 0.3;
          game.onRevive(this);
        }
      }
      return;
    }
    if (this.bleedT > 0 && this.bleedAt) {
      this.bleedT -= dt;
      if (!this.demo && Math.random() < dt * 30) {
        const [bx, by] = this.bleedAt;
        game.addParticle({ x: this.x + bx, y: this.foot + by + this.jumpY, vx: rand(10, 90), vy: rand(-120, -20), life: 0.7, color: Math.random() < 0.5 ? '#8b0d0d' : '#5e0a0a', size: rand(2, 3.5), g: 500, ground: this.foot + rand(-3, 3), decal: true });
      }
    }
    this.buffT = Math.max(0, this.buffT - dt);
    this.kbRecent = Math.max(0, this.kbRecent - dt * 14);
    this.screamT = Math.max(0, this.screamT - dt);
    if (this.T.frost) this.stunT = 0; // vỏ băng: không bị tê liệt
    if (this.stunT > 0) { this.stunT -= dt; return; } // bị bẫy điện làm tê liệt
    if (this.leaping) { // kẻ nhảy đang bật qua mìn và dây thép gai
      this.leapT += dt;
      const k = Math.min(1, this.leapT / 0.7);
      this.x = this.leapFrom + (this.targetX - this.leapFrom) * k;
      this.jumpY = -Math.sin(k * Math.PI) * 95;
      if (k >= 1) { this.leaping = false; this.jumpY = 0; this.state = 'attack'; this.x = this.targetX; }
      return;
    }
    if (this.T.charger) { // Cỗ Máy Nghiền lao húc
      this.chargeT -= dt;
      if (this.charging > 0) this.charging -= dt;
      else if (this.chargeT <= 0 && this.state === 'walk') { this.chargeT = 6.5; this.charging = 1.2; game.bossRoar(this); }
    }
    if (this.T.burner) this.burnT = 0;
    if (this.burnT > 0) {
      this.burnT -= dt;
      game.burnTick(this, this.burnDps * dt);
      if (this.state === 'dead') return;
    }

    if (this.T.boss) {
      this.roarT -= dt;
      if (this.roarT <= 0) { this.roarT = rand(6, 9); game.bossRoar(this); }
    }
    const spd = this.speed * (this.buffT > 0 ? 1.5 : 1) * (this.charging > 0 ? 4 : 1) * (game.slowAt ? game.slowAt(this, dt) : 1);
    if (this.fleeing) { // kẻ mang hòm bỏ chạy
      this.x += spd * 1.15 * dt;
      this.phase += dt * (2 + spd * 0.06);
      if (this.x > W + 70) game.bountyEscaped(this);
      return;
    }
    if (this.state === 'walk' && this.T.leaper && !this.leapt && !this.legsLost && this.x < 580) {
      this.leaping = true; this.leapt = true; this.leapT = 0; this.leapFrom = this.x;
      game.sfx.leap && game.sfx.leap();
      return;
    }
    if (this.state === 'walk') {
      // bò lết: mỗi lần tay bấu xuống thì kéo thân giật lên một đoạn
      this.x -= spd * dt * (this.legless ? 0.35 + 1.5 * Math.abs(Math.sin(this.phase)) : 1);
      if (this.weave && !this.legless) {
        if (this.lane === null) { this.lane = this.foot; this.weavePh = -this.x * 0.013; }
        this.foot = Math.max(LANE_MIN, Math.min(LANE_MAX, this.lane + Math.sin(this.weavePh + this.x * 0.013) * this.weave));
      }
      this.phase += dt * (2 + spd * 0.06);
      if (this.x <= this.targetX) {
        this.x = this.targetX;
        if (this.T.bounty) { this.fleeing = true; return; }
        this.state = 'attack';
      }
    } else if (this.state === 'attack') {
      if (this.x > this.targetX + 3) { this.state = 'walk'; return; }
      this.atkT -= dt * (this.buffT > 0 ? 1.4 : 1);
      this.swing = Math.max(0, this.swing - dt * 3);
      if (this.atkT <= 0) {
        this.atkT = this.T.atkRate * rand(0.85, 1.15);
        this.swing = 1;
        if (this.T.screamer) { this.screamT = 1; game.scream(this); }
        else if (this.T.ranged) game.spitAcid(this);
        else if (this.T.bomber) { game.bloaterBurst(this, true); return; }
        else game.damageBarricade(this.dmg, this.foot);
      }
    }
    if (!this.demo && Math.random() < dt * 0.04) game.sfx.groan();
    // đầu giật co quắp
    this.twitching = Math.max(0, this.twitching - dt);
    this.twitchT -= dt;
    if (this.twitchT <= 0) { this.twitchT = rand(2, 6); this.twitching = 0.4; }
    // vệt máu kéo lê khi bò
    if (this.legless && !this.demo && this.state === 'walk' && Math.random() < dt * 6) {
      game.addParticle({ x: this.x + this.h * 0.2 + rand(-4, 4), y: this.foot - 3, vx: 0, vy: 10, life: 0.3, color: '#5e0a0a', size: rand(2.5, 4), g: 200, ground: this.foot + rand(-1, 2), decal: true });
    }
    // rỏ máu xuống đất khi đi
    if (!this.demo && this.state === 'walk' && this.T.kind === 'upright' && Math.random() < dt * 0.7) {
      game.addParticle({ x: this.x + rand(-4, 6), y: this.foot - this.h * 0.45, vx: 0, vy: 20, life: 1, color: '#5e0a0a', size: 2, g: 400, ground: this.foot + rand(-2, 2), decal: true });
    }
  }

  // kind: 'bullet' | 'fire' | 'blast'. Giáp chỉ chặn đạn thường.
  hurt(dmg, head, game, kind = 'bullet') {
    let result = false;
    if (this.T.burner && kind === 'fire') return false; // kẻ cháy miễn nhiễm lửa
    if (this.T.plated && kind === 'bullet') dmg *= 0.5;
    if (this.T.shield && kind === 'bullet' && !head) { dmg *= 0.12; result = 'shield'; }
    if (this.T.armored && kind === 'bullet') {
      if (head && this.helmet > 0) {
        this.helmet -= dmg;
        dmg *= 0.3;
        if (this.helmet <= 0) result = 'helmet';
      } else if (!head) dmg *= 0.55;
    }
    if (this.T.hazmat && (kind === 'fire' || kind === 'gas' || kind === 'cold')) dmg *= 0.25; // đồ bảo hộ
    if (this.T.frost) { if (kind === 'fire') dmg *= 2; else if (kind === 'bullet') dmg *= 0.75; } // vỏ băng
    if (this.freezeT > 0 && kind !== 'cold') dmg *= 1.3; // đang đông cứng
    this.sinceHit = 0;
    if (this.armorPhase && kind === 'bullet') dmg *= 0.4; // giai đoạn 3 của Mẫu Thể Số 0
    this.hp -= dmg;
    if (kind !== 'fire' && kind !== 'gas' && kind !== 'cold') this.hitT = 0.08; // cháy âm ỉ thì không chớp trắng
    // đẩy lùi: con càng to (càng nặng) càng ít bị đẩy; trúng liên tục thì kháng dần
    if (kind !== 'fire' && kind !== 'gas' && kind !== 'cold') {
      const kb = (5 * Math.min(dmg / 35, 1.6)) / this.mass() / (1 + this.kbRecent * 0.35);
      this.kbRecent += kb;
      this.x = Math.min(this.x + kb, W + 100);
    }
    if (this.hp <= 0 && this.T.revive && !this.revived && !head && kind === 'bullet') {
      this.state = 'dead';
      this.deadT = 0;
      this.reviveT = 2.4;
      return 'revive';
    }
    if (this.hp <= 0) {
      this.state = 'dead';
      this.headless = head && dmg > 30;
      this.deadT = 0;
      return true;
    }
    return result;
  }

  draw(ctx) {
    if (pixelState.on) { this.drawPixel(ctx); return; }
    ctx.save();
    ctx.translate(this.x, this.foot);
    if (this.state === 'dead') {
      const k = Math.min(1, this.deadT / 0.45);
      const ease = 1 - (1 - k) * (1 - k);
      if (this.T.kind === 'upright' && !this.legless) ctx.rotate(ease * Math.PI / 2);
      else ctx.translate(0, ease * 4);
      if (this.deadT > 4) ctx.globalAlpha = Math.max(0, 1 - (this.deadT - 4) / 1.5);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.w * 0.8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (this.reviveT > 0) ctx.translate(Math.sin(this.reviveT * 40) * 1.5, 0); // co giật trước khi đứng dậy
    if (this.jumpY) ctx.translate(0, this.jumpY);
    if (this.T.stalker && this.alive && this.hitT <= 0 && this.burnT <= 0) ctx.globalAlpha *= Math.max(0.07, Math.min(1, (560 - this.x) / 220));
    if (this.elite && this.alive) { // hào quang đỏ của zombie tinh nhuệ
      const g = ctx.createRadialGradient(0, -this.h * 0.5, this.w * 0.2, 0, -this.h * 0.5, this.h * 0.75);
      g.addColorStop(0, 'rgba(200,20,20,0.28)'); g.addColorStop(1, 'rgba(200,20,20,0)');
      ctx.fillStyle = g; ctx.fillRect(-this.h * 0.75, -this.h * 1.25, this.h * 1.5, this.h * 1.5);
    }
    LITE = !this.detail;
    if (this.legless) { ctx.translate(this.h * LEGLESS.tx, this.h * LEGLESS.ty); ctx.rotate(LEGLESS.rot); }
    if (this.T.kind === 'crawl') this.drawCrawl(ctx); else if (this.T.kind === 'dog') this.drawDog(ctx); else this.drawUpright(ctx);
    if (this.T.kind === 'upright') this.drawExtras(ctx);
    if (this.freezeT > 0 && this.alive) { ctx.fillStyle = 'rgba(170,220,255,0.28)'; ctx.fillRect(-this.w * 0.9, -this.h * 1.02, this.w * 1.8, this.h); }
    LITE = false;
    ctx.restore();
    this.drawOverlays(ctx);
  }

  // phần vẽ phủ: hào quang tiếng rú, lửa bám người, dấu tinh nhuệ, thanh máu
  drawOverlays(ctx) {
    if (this.alive && this.buffT > 0) { // bị kích động bởi tiếng rú
      const b = this.boxes();
      const g = ctx.createRadialGradient(b.hx, b.hy, 0, b.hx, b.hy, b.hr * 2.6);
      g.addColorStop(0, 'rgba(255,40,40,0.35)');
      g.addColorStop(1, 'rgba(255,40,40,0)');
      ctx.fillStyle = g;
      ctx.fillRect(b.hx - b.hr * 3, b.hy - b.hr * 3, b.hr * 6, b.hr * 6);
    }
    if ((this.burnT > 0 || this.T.burner) && this.alive) { // lửa bám trên người
      const fh = this.T.kind === 'crawl' ? this.h : this.h * 0.8;
      for (let i = 0; i < 3; i++) {
        const fx = this.x + Math.sin(this.phase * 5 + i * 2) * this.w * 0.3;
        const fy = this.foot - fh * (0.3 + i * 0.25) + this.jumpY;
        const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 14);
        g.addColorStop(0, 'rgba(255,220,120,0.85)');
        g.addColorStop(0.5, 'rgba(255,110,30,0.5)');
        g.addColorStop(1, 'rgba(255,60,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(fx - 14, fy - 18, 28, 32);
      }
    }

    if (this.elite && this.alive) { // dấu đầu lâu trên đầu
      ctx.fillStyle = '#ff4a3a'; ctx.font = `bold ${Math.round(10 + this.h * 0.04)}px sans-serif`; ctx.textAlign = 'center';
      ctx.fillText('☠', this.x - this.h * 0.12, this.foot - this.h * (this.legless ? 0.4 : 1) - 6 + this.jumpY);
    }
    // thanh máu cho zombie to và zombie tinh nhuệ
    if (this.alive && (this.T.heavy || this.elite) && !this.T.boss && this.hp < this.maxHp) {
      const bw = 46;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      const top = this.foot - this.h * (this.legless ? 0.4 : 1);
      ctx.fillRect(this.x - bw / 2, top - 14, bw, 5);
      ctx.fillStyle = '#d94040';
      ctx.fillRect(this.x - bw / 2, top - 14, bw * Math.max(0, this.hp / this.maxHp), 5);
    }
  }

  // ---------- Pixel art ----------
  // khung hình hiện tại (đi 8 khung, tấn công 4 khung, ngã 5 khung) để dùng chung sprite đã dựng
  pixelFrame() {
    if (this.state === 'dead') { const k = Math.min(1, this.deadT / 0.45); return ['d', Math.round(k * 4) / 4]; }
    if (this.state === 'attack') return ['a', Math.round(this.swing * 3) / 3];
    const ph = ((this.phase % TAU_Z) + TAU_Z) % TAU_Z;
    return ['w', Math.floor((ph / TAU_Z) * 8)];
  }
  pixelKey(frame) {
    return [this.type, Math.round(this.h), this.female ? 'F' + this.dress + this.hairCol : '', this.look ? this.look.key : '', this.skull ? 'S' : '', this.armsLost, this.legsLost,
      this.legless ? 'L' : '', this.headless ? 'H' : '', this.hitT > 0 ? 'f' : '', this.freezeT > 0 && this.alive ? 'z' : '', this.armorPhase ? 'A' : '', frame[0] + frame[1]].join('|');
  }
  drawPixel(ctx) {
    ctx.save();
    ctx.translate(snap(this.x), snap(this.foot));
    if (this.state === 'dead') {
      if (this.deadT > 4) ctx.globalAlpha = Math.max(0, 1 - (this.deadT - 4) / 1.5);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(-snap(this.w * 0.8), -2, snap(this.w * 1.6), 4);
    }
    if (this.reviveT > 0) ctx.translate(snap(Math.sin(this.reviveT * 40) * 2), 0);
    if (this.jumpY) ctx.translate(0, snap(this.jumpY));
    if (this.T.stalker && this.alive && this.hitT <= 0 && this.burnT <= 0) ctx.globalAlpha *= Math.max(0.07, Math.min(1, (560 - this.x) / 220));
    if (this.elite && this.alive) {
      const g = ctx.createRadialGradient(0, -this.h * 0.5, this.w * 0.2, 0, -this.h * 0.5, this.h * 0.75);
      g.addColorStop(0, 'rgba(200,20,20,0.28)'); g.addColorStop(1, 'rgba(200,20,20,0)');
      ctx.fillStyle = g; ctx.fillRect(-this.h * 0.75, -this.h * 1.25, this.h * 1.5, this.h * 1.5);
    }
    const frame = this.pixelFrame();
    const S = Math.max(this.h, this.w * 1.3);
    const spr = pixelSprite(this.pixelKey(frame), [-S * 0.95, -S * 1.35, S * 1.15, S * 0.3], (g) => this.bakeFrame(g, frame), { colors: this.T.boss ? 16 : 12 });
    blit(ctx, spr);
    ctx.restore();
    this.drawOverlays(ctx);
  }
  // dựng một khung hình: tạm đặt trạng thái theo khung, vẽ thân bằng vector, rồi trả lại trạng thái
  bakeFrame(g, frame) {
    const keep = { phase: this.phase, swing: this.swing, deadT: this.deadT, twitching: this.twitching, state: this.state };
    if (frame[0] === 'w') { this.phase = ((frame[1] + 0.5) / 8) * TAU_Z; this.state = 'walk'; }
    else if (frame[0] === 'a') { this.swing = frame[1]; this.state = 'attack'; }
    else { this.deadT = frame[1] * 0.45; this.state = 'dead'; }
    this.twitching = 0;
    g.save();
    if (this.state === 'dead') {
      const k = Math.min(1, this.deadT / 0.45), ease = 1 - (1 - k) * (1 - k);
      if (this.T.kind === 'upright' && !this.legless) g.rotate(ease * Math.PI / 2); else g.translate(0, ease * 4);
    }
    LITE = false;
    if (this.legless) { g.translate(this.h * LEGLESS.tx, this.h * LEGLESS.ty); g.rotate(LEGLESS.rot); }
    if (this.T.kind === 'crawl') this.drawCrawl(g); else if (this.T.kind === 'dog') this.drawDog(g); else this.drawUpright(g);
    if (this.T.kind === 'upright') this.drawExtras(g);
    g.restore();
    if (this.freezeT > 0 && this.alive) { // nhuộm băng chỉ trên thân
      g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(170,220,255,0.45)'; g.fillRect(-1e4, -1e4, 2e4, 2e4); g.restore();
    }
    Object.assign(this, keep);
  }

  drawUpright(ctx) {
    const T = this.T, h = this.h, w = this.w, s = h / 100;
    const LK = this.look || { skin: SK, shirt: SH, pants: PA, hair: '#3a2e22', style: 'bald', build: 1, sleeves: 'long', acc: '' };
    const SK = LK.skin, SH = LK.shirt, PA = LK.pants;
    const flash = this.hitT > 0;
    const skin = flash ? '#f2f2e6' : SK;
    const skinDark = flash ? '#ddd' : shade(SK, -30);
    const shirt = flash ? '#ddd' : SH;
    const pants = flash ? '#ccc' : PA;
    const walking = this.state === 'walk';
    const attacking = this.state === 'attack';
    const sw = walking ? Math.sin(this.phase) * 12 * s : 0;
    const bob = walking ? Math.abs(Math.sin(this.phase)) * (this.legless ? 6 : 2.2) * s : 0;
    const hipY = -h * 0.47;
    const hipX = 0;
    const shX = -h * 0.1, shY = -h * 0.76;        // vai đổ về trước
    const hx = -h * HEAD_X, hy = -h * HEAD_Y, r = h * HEAD_R;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // ---- chân: quần rách tua rua + bàn chân trần ----
    const leg = (dx, swing, col) => {
      const kx = dx + swing * 0.5 - 2 * s, ky = -h * 0.24;
      const fx = dx + swing, fy = -3 * s;
      const o = 1.1 * s;
      const W0 = w * 0.42 * legW, W1 = w * 0.3 * legW, W2 = w * 0.22 * legW;
      limb(ctx, [[hipX + dx, hipY], [kx, ky], [fx + 1 * s, fy - 7 * s]], [W0, W1, W2], col, o, flash || !this.detail); // đùi + cẳng chân
      ctx.fillStyle = this.female ? 'rgba(255,240,220,0.18)' : 'rgba(0,0,0,0.22)'; // xương bánh chè / mảng quần sờn
      ctx.beginPath(); ctx.ellipse(kx - W1 * 0.12, ky, W1 * 0.32, W1 * 0.26, 0, 0, Math.PI * 2); ctx.fill();
      // gấu quần rách
      ctx.fillStyle = this.female ? 'rgba(0,0,0,0)' : col;
      ctx.beginPath();
      const hw = w * 0.2;
      ctx.moveTo(fx - hw, fy - 10 * s);
      for (let k = 0; k <= 4; k++) ctx.lineTo(fx - hw + (k * hw) / 2, fy - 10 * s + (k % 2 ? 6 : 2) * s);
      ctx.lineTo(fx + hw, fy - 10 * s);
      ctx.fill();
      // cổ chân + bàn chân trần, ngón chân hướng về phía trước (trái)
      seg(ctx, fx + 1 * s, fy - 8 * s, fx - 1 * s, fy - 1 * s, w * 0.16, w * 0.15, skinDark, o, true);
      ctx.beginPath(); ctx.ellipse(fx - 4 * s, fy, 8 * s, 3 * s, 0, 0, Math.PI * 2);
      shadeFill(ctx, fx - 12 * s, fx + 4 * s, flash ? '#ddd' : SK, flash, o);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      for (let k = 0; k < 3; k++) ctx.fillRect(fx - 11 * s + k * 2.4 * s, fy - 0.5 * s, 0.8 * s, 2 * s); // kẽ ngón chân
      ctx.fillStyle = 'rgba(110,20,15,0.6)';
      ctx.fillRect(fx - 11 * s, fy - 1 * s, 4 * s, 2 * s);
    };
    const legCol = (c) => (this.female ? (flash ? '#ddd' : shade(SK, -22)) : c);
    const legW = this.female ? 0.7 : 1;
    // mỏm cụt đùi: vải rách, thịt đỏ, đầu xương trắng
    const stump = (dx, col) => {
      const ex = hipX + dx - 2 * s, ey = hipY + h * 0.11;
      seg(ctx, hipX + dx, hipY, ex, ey, w * 0.42 * legW, w * 0.38 * legW, col, 1.1 * s, flash || !this.detail);
      ctx.fillStyle = flash ? '#eee' : '#6a0c0c';
      ctx.beginPath(); ctx.ellipse(ex, ey + 1 * s, w * 0.2 * legW, 3 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = flash ? '#fff' : '#9a1a12';
      ctx.beginPath(); ctx.ellipse(ex, ey + 1 * s, w * 0.12 * legW, 2 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e4dac4'; ctx.lineWidth = 2.4 * s;
      ctx.beginPath(); ctx.moveTo(ex, ey - 1 * s); ctx.lineTo(ex + 1 * s, ey + 5 * s); ctx.stroke();
    };
    const limp = this.legsLost === 1 && walking ? Math.max(0, Math.sin(this.phase)) * 4 * s : 0; // khập khiễng nhún lên xuống
    if (this.legsLost >= 2) stump(4 * s, legCol(shade(PA, -18)));
    else leg(4 * s, this.legsLost === 1 ? -sw * 0.5 : -sw, legCol(shade(PA, -18)));
    ctx.translate(0, limp);
    ctx.translate(0, -bob);

    // ---- tay sau (buông thõng) ----
    const arm = (offX, phase, col, sleeve, front = false) => {
      if (front ? this.armsLost >= 1 : this.armsLost >= 2) { // cụt tay: mỏm cụt lộ xương
        ctx.strokeStyle = sleeve; ctx.lineWidth = w * 0.26;
        ctx.beginPath(); ctx.moveTo(shX + offX, shY + 2 * s); ctx.lineTo(shX + offX - 4 * s, shY + 14 * s); ctx.stroke();
        ctx.fillStyle = '#6a0c0c'; ctx.beginPath(); ctx.arc(shX + offX - 4 * s, shY + 15 * s, w * 0.13, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#e0d6c0'; ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.moveTo(shX + offX - 4 * s, shY + 14 * s); ctx.lineTo(shX + offX - 6 * s, shY + 20 * s); ctx.stroke();
        return;
      }
      const lift = attacking ? Math.sin(this.swing * Math.PI) : 0;
      const dangle = walking ? Math.sin(phase) * 6 * s : 0;
      let ex = shX + offX - 6 * s + dangle - lift * 16 * s;
      let ey = shY + 26 * s - lift * 20 * s;
      let hx2 = ex - 7 * s - lift * 18 * s;
      let hy2 = ey + 24 * s - lift * 26 * s;
      if (this.legless) { // nằm sấp: hai tay vươn ra trước bấu xuống đất kéo lê thân
        const [sx, sy] = this.fromBody(shX + offX, shY + 3 * s);
        const cyc = Math.sin(phase);
        const hand = attacking
          ? [sx - h * 0.3, -h * (0.12 + 0.22 * Math.sin(this.swing * Math.PI))]
          : [sx - h * (0.2 + 0.14 * cyc), -2 * s - Math.max(0, Math.cos(phase)) * 12 * s];
        const elbow = [(sx + hand[0]) / 2 + h * 0.02, Math.min(sy, hand[1]) - h * 0.1];
        [ex, ey] = this.toBody(elbow[0], elbow[1]);
        [hx2, hy2] = this.toBody(hand[0], hand[1]);
      }
      const o = 1 * s;
      limb(ctx, [[shX + offX, shY + 3 * s], [ex, ey], [hx2, hy2]], [w * 0.21, w * 0.15, w * 0.11], col, o, flash || !this.detail); // bắp tay + cẳng tay gầy
      ctx.fillStyle = 'rgba(255,240,220,0.22)'; // khuỷu tay xương xẩu
      ctx.beginPath(); ctx.arc(ex + 1 * s, ey, w * 0.07, 0, Math.PI * 2); ctx.fill();
      // gân tím nổi trên cẳng tay
      ctx.strokeStyle = 'rgba(70,30,80,0.55)'; ctx.lineWidth = 0.9 * s;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo((ex + hx2) / 2 + 2 * s, (ey + hy2) / 2); ctx.lineTo(hx2 + 1 * s, hy2 - 3 * s); ctx.stroke();
      // tay áo rách tới khuỷu
      if (this.female || LK.sleeves === 'short') seg(ctx, shX + offX, shY + 2 * s, (shX + offX + ex) / 2 + 1, (shY + ey) / 2 + 4 * s, w * 0.3, w * 0.27, this.female ? this.dress : sleeve, o, flash || !this.detail);
      else limb(ctx, [[shX + offX, shY + 3 * s], [ex, ey], [(ex + hx2) / 2 + 1 * s, (ey + hy2) / 2]], [w * 0.27, w * 0.22, w * 0.18], flash ? '#ccc' : sleeve, o, flash || !this.detail);
      // bàn tay xương + móng vuốt
      ctx.beginPath(); ctx.arc(hx2, hy2, 3.6 * s, 0, Math.PI * 2);
      shadeFill(ctx, hx2 - 4 * s, hx2 + 4 * s, col, true, o);
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2.6 * s;
      ctx.beginPath();
      for (let k = 0; k < 4; k++) {
        const a = Math.PI * 0.55 + k * 0.22 - lift * 0.9;
        ctx.moveTo(hx2, hy2);
        ctx.lineTo(hx2 + Math.cos(a) * 8 * s, hy2 + Math.sin(a) * 8 * s);
      }
      ctx.stroke();
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.4 * s;
      ctx.beginPath();
      for (let k = 0; k < 4; k++) {
        const a = Math.PI * 0.55 + k * 0.22 - lift * 0.9;
        ctx.moveTo(hx2, hy2);
        ctx.lineTo(hx2 + Math.cos(a) * 8 * s, hy2 + Math.sin(a) * 8 * s);
      }
      ctx.stroke();
    };
    arm(6 * s, this.phase + Math.PI, skinDark, shade(SH, -20));

    if (this.legsLost >= 1) stump(-4 * s, legCol(pants)); else leg(-4 * s, sw, legCol(pants));

    // ---- thân: áo ôm theo người, rách một mảng lộ xương sườn ----
    const tw = w * 0.5 * (this.female ? 1 : LK.build);
    const torso = () => {
      ctx.beginPath();
      ctx.moveTo(hipX - tw * 0.82, hipY + 6 * s); ctx.lineTo(shX - tw, shY + 2 * s);
      ctx.quadraticCurveTo(shX, shY - 5 * s, shX + tw * 0.92, shY + 1 * s);
      ctx.quadraticCurveTo(hipX + tw * 1.02, (shY + hipY) / 2, hipX + tw * 0.8, hipY + 6 * s);
      ctx.closePath();
    };
    torso();
    shadeFill(ctx, shX - tw, hipX + tw, flash ? '#ddd' : this.female ? shade(SK, -30) : SH, flash, 1.2 * s);
    if (!this.female) {
      // lỗ rách trên áo: da tái, xương sườn
      ctx.save(); torso(); ctx.clip();
      ctx.fillStyle = flash ? '#eee' : shade(SK, -28);
      ctx.beginPath(); ctx.ellipse(shX - tw * 0.25, (shY + hipY) / 2 - 1 * s, tw * 0.55, (hipY - shY) * 0.26, 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      // gấu áo rách lởm chởm
      ctx.fillStyle = flash ? '#ddd' : shade(SH, -12);
      ctx.beginPath(); ctx.moveTo(hipX - tw * 0.82, hipY + 4 * s);
      for (let k = 0; k <= 6; k++) ctx.lineTo(hipX - tw * 0.82 + (tw * 1.62 * k) / 6, hipY + (k % 2 ? 11 : 5) * s);
      ctx.lineTo(hipX + tw * 0.8, hipY + 2 * s); ctx.closePath(); ctx.fill();
      // nẹp áo / đường may giữa ngực
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.2 * s;
      ctx.beginPath(); ctx.moveTo(shX - tw * 0.45, shY + 3 * s); ctx.lineTo(hipX - tw * 0.3, hipY + 6 * s); ctx.stroke();
    }
    // xương ức và hõm bụng tạo khối
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath(); ctx.ellipse((shX + hipX) / 2 - tw * 0.1, (shY + hipY) / 2 + 10 * s, tw * 0.35, 7 * s, 0.2, 0, Math.PI * 2); ctx.fill();
    // xương sườn (trong lỗ rách áo)
    ctx.strokeStyle = 'rgba(40,25,15,0.55)';
    ctx.lineWidth = 1.3 * s;
    for (let k = 1; k < 4; k++) {
      const t = 0.18 + k * 0.13;
      const cx = shX + (hipX - shX) * t, cy = shY + (hipY - shY) * t;
      ctx.beginPath(); ctx.moveTo(cx - tw * 0.55, cy + 2 * s); ctx.quadraticCurveTo(cx - tw * 0.1, cy - 2 * s, cx + tw * 0.3, cy + 1 * s); ctx.stroke();
    }
    // áo: vạt sau + vạt trước, gấu rách
    const flap = (x0, x1, front) => {
      const flapCol = front ? shirt : (flash ? '#ccc' : shade(SH, -15));
      ctx.beginPath();
      ctx.moveTo(shX + x0, shY - 1 * s);
      ctx.lineTo(shX + x1, shY - 2 * s);
      ctx.lineTo(hipX + x1 * 0.9, hipY + 10 * s);
      const n = 4;
      for (let k = 1; k <= n; k++) {
        const xx = hipX + x1 * 0.9 + ((x0 * 0.85 - x1 * 0.9) * k) / n;
        ctx.lineTo(xx, hipY + (k % 2 ? 16 : 9) * s);
      }
      ctx.lineTo(hipX + x0 * 0.85, hipY + 8 * s);
      ctx.closePath();
      shadeFill(ctx, shX + Math.min(x0, x1), shX + Math.max(x0, x1), flapCol, flash, 1.1 * s);
    };
    if (this.female) { // váy rách tả tơi, dài tới gối
      ctx.beginPath();
      ctx.moveTo(shX - tw * 0.8, shY);
      ctx.quadraticCurveTo(shX, shY - 4 * s, shX + tw * 0.85, shY);
      ctx.lineTo(hipX + tw * 1.15, -h * 0.22);
      const n = 7;
      for (let k = 1; k <= n; k++) ctx.lineTo(hipX + tw * 1.15 - (tw * 2.4 * k) / n, -h * 0.22 + (k % 2 ? 9 : -2) * s + Math.sin(this.phase + k) * 1.5 * s);
      ctx.lineTo(hipX - tw * 0.95, hipY + 4 * s);
      ctx.closePath();
      shadeFill(ctx, hipX - tw * 1.2, hipX + tw * 1.2, flash ? '#ddd' : this.dress, flash, 1.1 * s);
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; // nếp váy và chỗ rách
      for (let k = 0; k < 3; k++) ctx.fillRect(hipX - tw * 0.5 + k * tw * 0.5, hipY + 4 * s, 1.5 * s, h * 0.2);
      ctx.fillStyle = skinDark; // vai trần
      ctx.beginPath(); ctx.ellipse(shX - tw * 0.1, shY + 1 * s, tw * 0.45, 3 * s, 0, 0, Math.PI * 2); ctx.fill();
    } else if (LK.acc === 'tie') { // cà vạt lệch
      ctx.fillStyle = flash ? '#eee' : '#7a1a1a';
      ctx.beginPath(); ctx.moveTo(shX - tw * 0.32, shY + 3 * s); ctx.lineTo(shX - tw * 0.12, shY + 3 * s); ctx.lineTo(shX - tw * 0.05, shY + 26 * s); ctx.lineTo(shX - tw * 0.3, shY + 30 * s); ctx.fill();
    }
    // vết thương hở lộ xương, máu chảy thành vệt
    const wx = shX - tw * 0.15, wy = (shY + hipY) / 2 - 2 * s;
    ctx.fillStyle = flash ? '#eee' : '#4a0606';
    ctx.beginPath(); ctx.ellipse(wx, wy, 4.5 * s, 7 * s, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = flash ? '#fff' : '#8a1a12';
    ctx.beginPath(); ctx.ellipse(wx, wy, 2.6 * s, 5 * s, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d8ccb0'; ctx.lineWidth = 1.2 * s;
    ctx.beginPath(); ctx.moveTo(wx - 2 * s, wy - 3 * s); ctx.lineTo(wx + 2 * s, wy + 3 * s); ctx.stroke();
    ctx.strokeStyle = 'rgba(100,8,8,0.7)'; ctx.lineWidth = 1.6 * s;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(wx - 2 * s + k * 2 * s, wy + 5 * s); ctx.lineTo(wx - 2 * s + k * 2 * s, wy + (12 + k * 5 + Math.sin(this.phase + k) * 1.5) * s); ctx.stroke(); }
    // cổ áo
    ctx.fillStyle = shade(SH, 12);
    ctx.beginPath(); ctx.moveTo(shX - tw * 0.6, shY - 1 * s); ctx.lineTo(shX - tw * 0.2, shY + 7 * s); ctx.lineTo(shX - tw * 0.05, shY - 2 * s); ctx.fill();
    // vết máu/bẩn
    ctx.fillStyle = 'rgba(70,15,10,0.45)';
    ctx.beginPath(); ctx.ellipse(shX - tw * 0.3, (shY + hipY) / 2 + 8 * s, 4 * s, 7 * s, 0.3, 0, Math.PI * 2); ctx.fill();

    const shoulderY = shY;
    if (T.armored) { // áo giáp cơ động
      ctx.fillStyle = flash ? '#ccc' : '#1a2235';
      ctx.beginPath();
      ctx.moveTo(hipX - tw, hipY + 2 * s); ctx.lineTo(shX - tw * 1.1, shY); ctx.lineTo(shX + tw * 1.1, shY - 2 * s); ctx.lineTo(hipX + tw, hipY + 2 * s);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c9c9c9';
      ctx.font = `bold ${7 * s}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(L("CSCĐ", "POLICE"), (shX + hipX) / 2, shoulderY + 18 * s);
    }
    if (T.bomber) { // bụng trương phình
      const pulse = 1 + Math.sin(this.phase * 3) * 0.04;
      ctx.fillStyle = flash ? '#eee' : '#9da45a';
      ctx.beginPath();
      ctx.ellipse((shX + hipX) / 2 - 4 * s, (shY + hipY) / 2 + 6 * s, w * 0.62 * pulse, (hipY - shY) * 0.55 * pulse, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(120,40,60,0.5)';
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(-w * 0.3 + k * w * 0.18, (shY + hipY) / 2 + (k % 2 ? 0 : 12) * s, 3.5 * s, 0, Math.PI * 2); ctx.fill(); }
    }
    if (T.ranged) { // bụng phình chứa axit, phát sáng
      const glow = 0.55 + Math.sin(this.phase * 2) * 0.15 + (attacking ? this.swing * 0.3 : 0);
      ctx.fillStyle = `rgba(170,230,60,${glow})`;
      ctx.beginPath();
      ctx.ellipse((shX + hipX) / 2 - 3 * s, (shY + hipY) / 2 + 6 * s, w * 0.42, (hipY - shY) * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (T.boss) { // gai xương trên lưng, vết thương phát sáng
      ctx.fillStyle = '#d8d0b8';
      for (let k = 0; k < 4; k++) {
        const bx = shX + tw * 0.2 + k * tw * 0.35, by = shY + k * 6 * s;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 5 * s, by - 13 * s - (k % 2) * 6 * s); ctx.lineTo(bx + 9 * s, by + 2 * s); ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,60,30,0.6)';
      ctx.fillRect(shX, shY + 24 * s, tw * 0.6, 4 * s);
      ctx.fillRect(shX - tw * 0.5, shY + 40 * s, tw * 0.5, 3 * s);
    }

    // ---- cổ + đầu hói, hàm nhô, mắt trũng ----
    seg(ctx, shX - 1 * s, shY + 2 * s, hx + r * 0.3, hy + r * 0.7, w * 0.2, w * 0.16, skinDark, 1 * s, flash || !this.detail);
    if (!this.headless) {
      ctx.save();
      if (this.twitching > 0) { // đầu giật co quắp
        const a = Math.sin(this.twitching * 60) * 0.28;
        ctx.translate(hx + r * 0.3, hy + r * 0.8); ctx.rotate(a); ctx.translate(-(hx + r * 0.3), -(hy + r * 0.8));
      }
      if (this.female) { // tóc dài phía sau gáy
        ctx.fillStyle = flash ? '#fff' : this.hairCol;
        ctx.beginPath();
        ctx.moveTo(hx - r * 0.2, hy - r * 1.05);
        ctx.quadraticCurveTo(hx + r * 1.6, hy - r * 0.6, hx + r * 1.2 + Math.sin(this.phase) * 2 * s, hy + r * 2.6);
        ctx.lineTo(hx + r * 0.2, hy + r * 1.4);
        ctx.fill();
      }
      const headFill = flash ? skin : (this._headG || (this._headG = (() => {
        const g = ctx.createRadialGradient(hx + r * 0.35, hy - r * 0.45, r * 0.1, hx, hy, r * 1.35);
        g.addColorStop(0, shade(SK, 26)); g.addColorStop(0.55, SK); g.addColorStop(1, shade(SK, -40));
        return g;
      })()));
      // hàm dưới nhô ra (vẽ trước để đầu phủ lên, có viền)
      ctx.beginPath(); ctx.moveTo(hx - r * 0.95, hy + r * 0.25); ctx.lineTo(hx - r * 0.85, hy + r * 1.05); ctx.lineTo(hx + r * 0.1, hy + r * 1.1); ctx.lineTo(hx + r * 0.4, hy + r * 0.5); ctx.closePath();
      ctx.fillStyle = flash ? skin : shade(SK, -22); ctx.fill();
      if (this.detail) { ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.1 * s; ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(hx, hy, r * 0.95, r * 1.08, -0.25, 0, Math.PI * 2);
      ctx.fillStyle = this.detail ? headFill : skin; ctx.fill();
      if (this.detail) {
        ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.2 * s; ctx.stroke();
        // viền sáng trăng sau gáy + bóng dưới cằm
        ctx.strokeStyle = 'rgba(255,245,215,0.35)'; ctx.lineWidth = 1.3 * s;
        ctx.beginPath(); ctx.ellipse(hx, hy, r * 0.88, r * 1.0, -0.25, -Math.PI * 0.45, Math.PI * 0.1); ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(hx - r * 0.25, hy + r * 1.02, r * 0.55, r * 0.16, 0, 0, Math.PI * 2); ctx.fill();
      }
      // miệng + răng
      ctx.fillStyle = '#2a1410';
      ctx.beginPath(); ctx.moveTo(hx - r * 1.0, hy + r * 0.45); ctx.lineTo(hx - r * 0.2, hy + r * 0.5); ctx.lineTo(hx - r * 0.25, hy + r * 0.85); ctx.lineTo(hx - r * 0.9, hy + r * 0.8); ctx.fill();
      ctx.fillStyle = '#d9cfa8';
      for (let k = 0; k < 4; k++) ctx.fillRect(hx - r * 0.95 + k * r * 0.18, hy + r * 0.46, r * 0.11, r * 0.16);
      // dãi chảy
      ctx.strokeStyle = 'rgba(210,200,170,0.45)';
      ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.moveTo(hx - r * 0.7, hy + r * 0.9); ctx.lineTo(hx - r * 0.72, hy + r * (1.5 + Math.sin(this.phase) * 0.2)); ctx.stroke();
      // hốc mắt trũng
      ctx.fillStyle = 'rgba(30,18,12,0.85)';
      ctx.beginPath(); ctx.ellipse(hx - r * 0.5, hy - r * 0.12, r * 0.28, r * 0.22, 0, 0, Math.PI * 2); ctx.fill();
      // mắt sáng nhợt, đồng tử đỏ
      // quầng sáng giả bằng vòng tròn mờ (shadowBlur rất tốn khi vẽ hàng trăm con)
      ctx.fillStyle = T.boss ? 'rgba(255,50,30,0.35)' : 'rgba(255,240,180,0.22)';
      ctx.beginPath(); ctx.arc(hx - r * 0.56, hy - r * 0.1, r * (T.boss ? 0.42 : 0.28), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = T.boss ? '#ff3b2f' : '#f2ecc8';
      ctx.beginPath(); ctx.arc(hx - r * 0.56, hy - r * 0.1, r * 0.14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c01a10';
      ctx.beginPath(); ctx.arc(hx - r * 0.6, hy - r * 0.1, r * 0.06, 0, Math.PI * 2); ctx.fill();
      // máu chảy từ khoé mắt và loang quanh miệng
      ctx.strokeStyle = 'rgba(120,8,8,0.85)'; ctx.lineWidth = 1.3 * s;
      ctx.beginPath(); ctx.moveTo(hx - r * 0.5, hy + r * 0.02); ctx.lineTo(hx - r * 0.48, hy + r * 0.45); ctx.stroke();
      ctx.fillStyle = 'rgba(110,8,8,0.6)';
      ctx.beginPath(); ctx.ellipse(hx - r * 0.55, hy + r * 0.95, r * 0.4, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
      // gò má + tai
      ctx.fillStyle = skinDark;
      ctx.beginPath(); ctx.ellipse(hx + r * 0.25, hy + r * 0.05, r * 0.2, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      if (this.skull) { // mảng sọ lộ ra, nứt
        ctx.fillStyle = flash ? '#fff' : '#d8ccb0';
        ctx.beginPath(); ctx.ellipse(hx + r * 0.2, hy - r * 0.6, r * 0.45, r * 0.32, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#5a4030'; ctx.lineWidth = 0.9 * s;
        ctx.beginPath(); ctx.moveTo(hx + r * 0.05, hy - r * 0.8); ctx.lineTo(hx + r * 0.25, hy - r * 0.55); ctx.lineTo(hx + r * 0.15, hy - r * 0.35); ctx.stroke();
        ctx.fillStyle = 'rgba(110,8,8,0.75)'; // mép da rách lởm chởm
        for (let k = 0; k < 7; k++) {
          const ang = Math.PI * 0.9 + k * 0.32, ex = hx + r * 0.2 + Math.cos(ang) * r * 0.48, ey = hy - r * 0.6 + Math.sin(ang) * r * 0.34;
          ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + Math.cos(ang) * r * 0.16, ey + Math.sin(ang) * r * 0.16 + 1 * s); ctx.lineTo(ex + Math.cos(ang + 0.4) * r * 0.06, ey + Math.sin(ang + 0.4) * r * 0.06); ctx.fill();
        }
      }
      if (this.female) { // tóc bết rủ xuống che nửa mặt
        ctx.strokeStyle = flash ? '#fff' : this.hairCol;
        ctx.lineWidth = 2.2 * s;
        for (let k = 0; k < 9; k++) {
          const x0 = hx - r * 0.9 + k * r * 0.22, y0 = hy - r * 0.95 + Math.abs(k - 4) * 0.4 * s;
          const sway = Math.sin(this.phase * 1.3 + k) * 1.8 * s;
          const len = k < 3 ? r * 2.6 : k < 5 ? r * 1.0 : r * 2.2; // chừa khe hở ở mắt
          ctx.beginPath(); ctx.moveTo(x0, y0);
          ctx.quadraticCurveTo(x0 - 2 * s + sway, y0 + len * 0.5, x0 - 1 * s + sway * 1.5, y0 + len);
          ctx.stroke();
        }
        ctx.fillStyle = flash ? '#fff' : this.hairCol;
        ctx.beginPath(); ctx.ellipse(hx, hy - r * 0.75, r * 1.0, r * 0.45, -0.2, Math.PI, 0); ctx.fill();
      }
      // tóc / mũ theo từng người
      const HC = flash ? '#fff' : LK.hair;
      if (!this.female && !this.skull && !(this.helmet > 0)) {
        if (LK.style === 'bald') {
          ctx.strokeStyle = HC; ctx.lineWidth = 1 * s; ctx.beginPath();
          for (let k = 0; k < 5; k++) { const a = -Math.PI * 0.75 + k * 0.28, x0 = hx + Math.cos(a) * r * 0.9, y0 = hy + Math.sin(a) * r * 0.95; ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + 3 * s, y0 - 4 * s, x0 + 6 * s + k, y0 - 2 * s); }
          ctx.stroke();
        } else if (LK.style === 'cap') { // mũ lưỡi trai, lưỡi quay về phía trước
          ctx.fillStyle = flash ? '#fff' : LK.cap;
          ctx.beginPath(); ctx.ellipse(hx + r * 0.05, hy - r * 0.45, r * 1.0, r * 0.62, -0.2, Math.PI * 1.02, Math.PI * 2.02); ctx.fill();
          ctx.beginPath(); ctx.moveTo(hx - r * 0.75, hy - r * 0.42); ctx.lineTo(hx - r * 1.55, hy - r * 0.3); ctx.lineTo(hx - r * 0.7, hy - r * 0.2); ctx.fill();
          ctx.fillStyle = HC; ctx.beginPath(); ctx.ellipse(hx + r * 0.75, hy - r * 0.05, r * 0.25, r * 0.4, 0, 0, Math.PI * 2); ctx.fill(); // tóc mai sau gáy
        } else {
          // tóc phủ đỉnh và gáy (ngắn), rối thì thêm chỏm dựng, dài thì rủ xuống cổ
          ctx.fillStyle = HC;
          ctx.beginPath(); ctx.ellipse(hx + r * 0.12, hy - r * 0.42, r * 0.98, r * 0.72, -0.25, Math.PI * 0.92, Math.PI * 2.15); ctx.fill();
          if (LK.style === 'long') { ctx.beginPath(); ctx.moveTo(hx + r * 0.4, hy - r * 0.6); ctx.quadraticCurveTo(hx + r * 1.35, hy, hx + r * 0.9, hy + r * 1.35); ctx.lineTo(hx + r * 0.35, hy + r * 0.9); ctx.fill(); }
          if (LK.style === 'messy') { ctx.strokeStyle = HC; ctx.lineWidth = 2 * s; ctx.beginPath(); for (let k = 0; k < 5; k++) { const a = -Math.PI * 0.85 + k * 0.32, x0 = hx + Math.cos(a) * r * 0.9, y0 = hy + Math.sin(a) * r * 0.95; ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(a) * 5 * s, y0 + Math.sin(a) * 5 * s - 1 * s); } ctx.stroke(); }
        }
      }
      if (LK.acc === 'glasses' && !this.female) { // kính gọng đen, một tròng vỡ
        ctx.strokeStyle = flash ? '#fff' : '#141414'; ctx.lineWidth = 1.3 * s;
        ctx.beginPath(); ctx.ellipse(hx - r * 0.55, hy - r * 0.1, r * 0.26, r * 0.2, 0, 0, Math.PI * 2); ctx.moveTo(hx - r * 0.3, hy - r * 0.12); ctx.lineTo(hx + r * 0.3, hy - r * 0.2); ctx.stroke();
      }
      if (LK.acc === 'beard' && !this.female) { // râu lởm chởm
        ctx.fillStyle = flash ? '#fff' : shade(LK.hair, 10);
        ctx.beginPath(); ctx.moveTo(hx - r * 0.95, hy + r * 0.6); ctx.lineTo(hx - r * 0.85, hy + r * 1.15); ctx.lineTo(hx + r * 0.15, hy + r * 1.15); ctx.lineTo(hx + r * 0.3, hy + r * 0.6); ctx.lineTo(hx - r * 0.2, hy + r * 0.85); ctx.fill();
      }
      if (this.helmet > 0) { // mũ bảo hiểm có kính chắn
        ctx.fillStyle = flash ? '#fff' : '#20283a';
        ctx.beginPath(); ctx.arc(hx, hy - r * 0.05, r * 1.15, Math.PI * 1.05, Math.PI * 0.05); ctx.fill();
        ctx.fillStyle = 'rgba(150,190,230,0.45)';
        ctx.fillRect(hx - r * 1.2, hy - r * 0.3, r * 0.9, r * 0.75);
      }
      ctx.restore();
    } else {
      ctx.fillStyle = '#7a0d0d';
      ctx.beginPath(); ctx.ellipse(hx + r * 0.3, hy + r * 0.8, r * 0.55, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    }

    if (T.screamer && !this.headless) { // miệng há to khi rú
      const open = 0.4 + this.screamT * 0.8;
      ctx.fillStyle = '#1a0808';
      ctx.beginPath(); ctx.ellipse(hx - r * 0.6, hy + r * 0.6, r * 0.35, r * 0.25 * (1 + open), 0.2, 0, Math.PI * 2); ctx.fill();
    }
    if (T.bounty) { // ba lô quân dụng phát sáng vàng
      ctx.fillStyle = '#5a4a20';
      roundRect(ctx, shX + tw * 0.6, shY + 2 * s, tw * 1.1, 30 * s, 4 * s); ctx.fill();
      ctx.fillStyle = '#e8c040';
      ctx.font = `bold ${12 * s}px sans-serif`; ctx.textAlign = 'center';
      ctx.fillText('$', shX + tw * 1.15, shY + 22 * s);
      ctx.strokeStyle = 'rgba(255,210,80,0.5)'; ctx.lineWidth = 2 * s;
      ctx.strokeRect(shX + tw * 0.6, shY + 2 * s, tw * 1.1, 30 * s);
    }
    if (T.phases) { // gân đỏ phát sáng trên Mẫu Thể Số 0
      ctx.strokeStyle = `rgba(255,40,40,${0.5 + Math.sin(this.phase * 3) * 0.2})`;
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const t = k / 6, cx = shX + (hipX - shX) * t, cy = shY + (hipY - shY) * t;
        ctx.moveTo(cx - tw * 0.6, cy); ctx.lineTo(cx - tw * 0.1, cy + 5 * s); ctx.lineTo(cx + tw * 0.5, cy - 2 * s);
      }
      ctx.stroke();
      if (this.armorPhase) { // giáp xương mọc ra
        ctx.fillStyle = '#e0d6c0';
        for (let k = 0; k < 4; k++) roundRect(ctx, shX - tw * 0.9 + k * 2 * s, shY + 8 * s + k * 14 * s, tw * 1.6, 9 * s, 3 * s), ctx.fill();
      }
    }

    if (T.plated) { // giáp thép
      ctx.fillStyle = flash ? '#fff' : '#5a5e66';
      for (let k = 0; k < 4; k++) { roundRect(ctx, shX - tw * 1.0 + k * 2 * s, shY + 4 * s + k * 15 * s, tw * 1.9, 10 * s, 2 * s); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      for (let k = 0; k < 4; k++) ctx.fillRect(shX - tw * 1.0 + k * 2 * s, shY + 4 * s + k * 15 * s, tw * 1.9, 2 * s);
    }
    if (T.queen) { // túi trứng sau lưng
      const pulse = 1 + Math.sin(this.phase * 2) * 0.05;
      ctx.fillStyle = flash ? '#fff' : 'rgba(170,110,190,0.85)';
      ctx.beginPath(); ctx.ellipse(shX + tw * 1.4, (shY + hipY) / 2, tw * 1.1 * pulse, (hipY - shY) * 0.6 * pulse, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(90,40,110,0.6)';
      for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(shX + tw * (1 + (k % 3) * 0.35), shY + 20 * s + k * 12 * s, 4 * s, 0, Math.PI * 2); ctx.fill(); }
    }

    // ---- tay trước ----
    arm(-2 * s, this.phase, skin, this.female ? this.dress : shirt, true);

    if (T.shield) { // khiên chống đạn phía trước
      ctx.fillStyle = flash ? '#fff' : '#2a3038';
      roundRect(ctx, shX - tw * 2.1, shY - 2 * s, tw * 0.9, (hipY - shY) + 26 * s, 3 * s); ctx.fill();
      ctx.fillStyle = 'rgba(150,190,230,0.35)';
      ctx.fillRect(shX - tw * 2.0, shY + 4 * s, tw * 0.7, 10 * s);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5 * s;
      ctx.strokeRect(shX - tw * 2.1, shY - 2 * s, tw * 0.9, (hipY - shY) + 26 * s);
    }
  }

  drawDog(ctx) {
    const T = this.T, h = this.h, w = this.w, s = h / 46;
    const flash = this.hitT > 0;
    const fur = flash ? '#eee' : T.skin;
    const furDark = flash ? '#ccc' : shade(T.skin, -28);
    const run = this.state === 'walk' || this.fleeing ? this.phase * 1.6 : this.swing * 2;
    const bodyY = -h * 0.55 + Math.sin(run * 2) * 1.5 * s;
    ctx.lineCap = 'round';
    // chân (2 sau, 2 trước)
    const leg = (lx, ph, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = 4.5 * s;
      const sw = Math.sin(run + ph) * 9 * s;
      ctx.beginPath(); ctx.moveTo(lx, bodyY + 4 * s); ctx.lineTo(lx + sw * 0.5, -h * 0.25); ctx.lineTo(lx + sw, -1); ctx.stroke();
    };
    leg(w * 0.3, 0, furDark); leg(-w * 0.25, Math.PI, furDark);
    // thân gầy trơ xương
    ctx.fillStyle = fur;
    ctx.beginPath(); ctx.ellipse(0, bodyY, w * 0.42, h * 0.2, -0.05, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(40,25,15,0.5)'; ctx.lineWidth = 1.2 * s;
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-w * 0.15 + k * 5 * s, bodyY - 3 * s); ctx.lineTo(-w * 0.12 + k * 5 * s, bodyY + 6 * s); ctx.stroke(); }
    ctx.fillStyle = 'rgba(120,20,15,0.6)';
    ctx.beginPath(); ctx.ellipse(w * 0.1, bodyY + 2 * s, 5 * s, 3 * s, 0, 0, Math.PI * 2); ctx.fill();
    // đuôi
    ctx.strokeStyle = furDark; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(w * 0.4, bodyY - 2 * s); ctx.quadraticCurveTo(w * 0.55, bodyY - 10 * s, w * 0.6, bodyY - 4 * s + Math.sin(run) * 3 * s); ctx.stroke();
    leg(w * 0.2, Math.PI * 0.6, fur); leg(-w * 0.32, Math.PI * 1.6, fur);
    // cổ + đầu + mõm
    const hx = -w / 2 + h * 0.24 * 0.6, hy = -h * 0.74;
    ctx.strokeStyle = fur; ctx.lineWidth = 7 * s;
    ctx.beginPath(); ctx.moveTo(-w * 0.3, bodyY); ctx.lineTo(hx + 4 * s, hy + 3 * s); ctx.stroke();
    if (!this.headless) {
      ctx.fillStyle = fur;
      ctx.beginPath(); ctx.ellipse(hx + 2 * s, hy, 7 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(hx - 2 * s, hy - 3 * s); ctx.lineTo(hx - 12 * s, hy + 1 * s); ctx.lineTo(hx - 11 * s, hy + 5 * s); ctx.lineTo(hx, hy + 5 * s); ctx.fill();
      ctx.fillStyle = '#1a0e0a'; ctx.beginPath(); ctx.arc(hx - 12 * s, hy + 1.5 * s, 1.6 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8dcc0'; for (let k = 0; k < 3; k++) ctx.fillRect(hx - 10 * s + k * 3 * s, hy + 4 * s, 1.4 * s, 2.2 * s);
      ctx.fillStyle = furDark; // tai
      ctx.beginPath(); ctx.moveTo(hx + 3 * s, hy - 4 * s); ctx.lineTo(hx + 7 * s, hy - 12 * s); ctx.lineTo(hx + 8 * s, hy - 3 * s); ctx.fill();
      ctx.fillStyle = '#ff3b2f'; ctx.beginPath(); ctx.arc(hx - 2 * s, hy - 1.5 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
    }
  }

  // phụ kiện của quái màn 4 · 5 (vẽ trong toạ độ của thân, gốc ở chân)
  drawExtras(ctx) {
    const T = this.T, h = this.h, s = h / 100;
    const hx = -h * HEAD_X, hy = -h * HEAD_Y, r = h * HEAD_R;
    const flash = this.hitT > 0;
    if (T.hazmat) { // mũ trùm bảo hộ, kính che mặt, bình lọc
      ctx.fillStyle = flash ? '#fff' : 'rgba(210,184,52,0.95)';
      ctx.beginPath(); ctx.arc(hx, hy, r * 1.22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(30,40,46,0.9)'; ctx.beginPath(); ctx.ellipse(hx - r * 0.35, hy, r * 0.55, r * 0.42, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(160,220,255,0.35)'; ctx.fillRect(hx - r * 0.7, hy - r * 0.25, r * 0.35, r * 0.15);
      ctx.fillStyle = '#2a2c30'; ctx.beginPath(); ctx.arc(hx - r * 0.6, hy + r * 0.62, r * 0.32, 0, Math.PI * 2); ctx.fill();
    }
    if (T.brood) { // túi trứng phập phồng trên lưng
      const pulse = 1 + Math.sin(this.phase * 2.5) * 0.06;
      ctx.fillStyle = flash ? '#fff' : 'rgba(170,110,190,0.88)';
      ctx.beginPath(); ctx.ellipse(h * 0.08, -h * 0.6, h * 0.16 * pulse, h * 0.2 * pulse, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(90,40,110,0.6)';
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(h * (0.03 + (k % 2) * 0.08), -h * (0.72 - k * 0.07), 3.5 * s, 0, Math.PI * 2); ctx.fill(); }
    }
    if (T.frost) { // vỏ băng nhọn trên vai và lưng
      ctx.fillStyle = flash ? '#fff' : 'rgba(200,232,255,0.85)';
      for (const [x, y, k] of [[-0.14, -0.78, 1], [0.0, -0.8, 1.3], [0.12, -0.7, 1.1], [0.14, -0.56, 0.9]]) {
        ctx.beginPath(); ctx.moveTo(h * x - 4 * s, h * y); ctx.lineTo(h * x + 2 * s, h * y - 16 * s * k); ctx.lineTo(h * x + 7 * s, h * y); ctx.fill();
      }
      ctx.fillStyle = 'rgba(180,220,255,0.18)'; ctx.fillRect(-this.w * 0.7, -h * 0.95, this.w * 1.4, h * 0.95);
    }
    if (T.healer) { // ăng-ten mọc ra từ đầu, đầu đèn nhấp nháy
      ctx.strokeStyle = '#3a3e3a'; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(hx + r * 0.2, hy - r * 0.8); ctx.lineTo(hx + r * 0.6, hy - r * 2.6); ctx.moveTo(hx - r * 0.3, hy - r * 0.9); ctx.lineTo(hx - r * 0.9, hy - r * 2.1); ctx.stroke();
      const on = Math.sin(this.phase * 4) > 0;
      ctx.fillStyle = on ? '#9fff7a' : '#3a6a2a';
      ctx.beginPath(); ctx.arc(hx + r * 0.6, hy - r * 2.6, 3 * s, 0, Math.PI * 2); ctx.arc(hx - r * 0.9, hy - r * 2.1, 2.5 * s, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawCrawl(ctx) {
    const T = this.T, h = this.h, w = this.w, s = h / 40;
    const r = h * 0.27;
    const flash = this.hitT > 0;
    const skin = flash ? '#f2f2e6' : T.skin;
    const crawlPh = this.state === 'walk' ? this.phase : this.swing * 3;
    ctx.lineCap = 'round';
    // chân kéo lê
    ctx.strokeStyle = T.pants;
    ctx.lineWidth = 7 * s;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 6 * s, -8 * s); ctx.lineTo(w / 2 + 18 * s, -3 * s);
    ctx.moveTo(w / 2 - 8 * s, -6 * s); ctx.lineTo(w / 2 + 14 * s + Math.sin(crawlPh) * 3, -1);
    ctx.stroke();
    // thân
    ctx.fillStyle = flash ? '#ddd' : T.shirt;
    roundRect(ctx, -w / 2 + r, -h * 0.62, w - r, h * 0.5, 7 * s);
    ctx.fill();
    // tay bò
    ctx.strokeStyle = skin;
    ctx.lineWidth = 5 * s;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 2 * r, -h * 0.4);
    ctx.lineTo(-w / 2 - 6 * s + Math.sin(crawlPh) * 7 * s, -1);
    ctx.moveTo(-w / 2 + 2.4 * r, -h * 0.35);
    ctx.lineTo(-w / 2 + Math.cos(crawlPh) * 7 * s, -1);
    ctx.stroke();
    // đầu
    if (!this.headless) {
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(-w / 2 + r, -r - 4, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff3b2f';
      ctx.beginPath();
      ctx.arc(-w / 2 + r * 0.5, -r - 6, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amt));
  const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
