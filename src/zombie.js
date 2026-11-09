import { ZOMBIES, BARRICADE_X, LANE_MIN, LANE_MAX, W } from './config.js';

const rand = (a, b) => a + Math.random() * (b - a);

export class Zombie {
  constructor(type, hpMul = 1, demo = false) {
    const T = ZOMBIES[type];
    this.type = type;
    this.T = T;
    const sizeVar = rand(0.92, 1.08);
    this.h = T.h * sizeVar;
    this.w = T.w * sizeVar;
    this.maxHp = T.hp * hpMul;
    this.hp = this.maxHp;
    this.speed = T.speed * rand(0.85, 1.15);
    this.foot = rand(LANE_MIN, LANE_MAX);
    this.x = W + 40 + rand(0, 60);
    this.demo = demo;
    this.targetX = T.ranged ? rand(470, 640) : BARRICADE_X + this.w / 2 + rand(-2, 10);
    if (demo) this.speed *= 0.8;
    if (T.boss) { this.foot = (LANE_MIN + LANE_MAX) / 2 + 10; this.roarT = 2; }
    this.state = 'walk'; // walk | attack | dead
    this.phase = rand(0, Math.PI * 2);
    this.atkT = rand(0.2, T.atkRate);
    this.swing = 0;
    this.hitT = 0;
    this.deadT = 0;
    this.headless = false;
  }

  get alive() { return this.state !== 'dead'; }

  // Hitbox trong toạ độ thế giới
  boxes() {
    if (this.T.kind === 'crawl') {
      const r = this.h * 0.27;
      return {
        hx: this.x - this.w / 2 + r, hy: this.foot - r - 4, hr: r,
        bx0: this.x - this.w / 2 + r, by0: this.foot - this.h * 0.62,
        bx1: this.x + this.w / 2, by1: this.foot,
      };
    }
    const r = this.h * 0.12;
    return {
      hx: this.x - this.h * 0.03, hy: this.foot - this.h + r, hr: r,
      bx0: this.x - this.w / 2, by0: this.foot - this.h + 2 * r,
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
    if (this.state === 'dead') { this.deadT += dt; return; }

    if (this.T.boss) {
      this.roarT -= dt;
      if (this.roarT <= 0) { this.roarT = rand(6, 9); game.bossRoar(this); }
    }
    if (this.state === 'walk') {
      this.x -= this.speed * dt;
      this.phase += dt * (2 + this.speed * 0.06);
      if (this.x <= this.targetX) { this.x = this.targetX; this.state = 'attack'; }
    } else if (this.state === 'attack') {
      if (this.x > this.targetX + 3) { this.state = 'walk'; return; }
      this.atkT -= dt;
      this.swing = Math.max(0, this.swing - dt * 3);
      if (this.atkT <= 0) {
        this.atkT = this.T.atkRate * rand(0.85, 1.15);
        this.swing = 1;
        if (this.T.ranged) game.spitAcid(this);
        else game.damageBarricade(this.T.dmg, this.foot);
      }
    }
    if (!this.demo && Math.random() < dt * 0.04) game.sfx.groan();
  }

  hurt(dmg, head, game) {
    this.hp -= dmg;
    this.hitT = 0.08;
    const kb = (this.T.heavy ? 1.5 : 6) * Math.min(dmg / 30, 3);
    this.x = Math.min(this.x + kb, W + 100);
    if (this.hp <= 0) {
      this.state = 'dead';
      this.headless = head && dmg > 30;
      this.deadT = 0;
      return true;
    }
    return false;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.foot);
    if (this.state === 'dead') {
      const k = Math.min(1, this.deadT / 0.45);
      const ease = 1 - (1 - k) * (1 - k);
      if (this.T.kind === 'upright') ctx.rotate(ease * Math.PI / 2);
      else ctx.translate(0, ease * 4);
      if (this.deadT > 4) ctx.globalAlpha = Math.max(0, 1 - (this.deadT - 4) / 1.5);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.w * 0.8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (this.T.kind === 'crawl') this.drawCrawl(ctx); else this.drawUpright(ctx);
    ctx.restore();

    // thanh máu cho zombie to
    if (this.alive && this.T.heavy && !this.T.boss && this.hp < this.maxHp) {
      const bw = 46;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(this.x - bw / 2, this.foot - this.h - 14, bw, 5);
      ctx.fillStyle = '#d94040';
      ctx.fillRect(this.x - bw / 2, this.foot - this.h - 14, bw * Math.max(0, this.hp / this.maxHp), 5);
    }
  }

  drawUpright(ctx) {
    const T = this.T, h = this.h, w = this.w, s = h / 100;
    const r = h * 0.12;
    const flash = this.hitT > 0;
    const skin = flash ? '#f2f2e6' : T.skin;
    const hipY = -h * 0.45;
    const shoulderY = -h + 2 * r + 5 * s;
    const walking = this.state === 'walk';
    const sw = walking ? Math.sin(this.phase) * 11 * s : 0;
    const bob = walking ? Math.abs(Math.sin(this.phase)) * 2 * s : 0;
    const reach = this.state === 'attack' ? -Math.sin(this.swing * Math.PI) * 14 * s : 0;

    ctx.lineCap = 'round';
    // chân
    ctx.strokeStyle = T.pants;
    ctx.lineWidth = w * 0.34;
    ctx.beginPath();
    ctx.moveTo(-3 * s, hipY); ctx.lineTo(-3 * s + sw, -2);
    ctx.moveTo(4 * s, hipY); ctx.lineTo(4 * s - sw, -2);
    ctx.stroke();

    ctx.translate(0, -bob);
    // tay sau
    ctx.strokeStyle = shade(skin, -25);
    ctx.lineWidth = w * 0.22;
    ctx.beginPath();
    ctx.moveTo(2 * s, shoulderY + 4 * s);
    ctx.lineTo(-w * 0.95 - 8 * s + reach * 0.6, shoulderY + 10 * s - Math.cos(this.phase) * 2);
    ctx.stroke();

    // thân
    ctx.fillStyle = flash ? '#ddd' : T.shirt;
    roundRect(ctx, -w / 2, shoulderY - 3 * s, w, hipY - shoulderY + 8 * s, 5 * s);
    ctx.fill();
    // vết rách / máu
    ctx.fillStyle = 'rgba(90,10,10,0.55)';
    ctx.fillRect(-w * 0.2, shoulderY + 10 * s, w * 0.3, 6 * s);
    if (T.ranged) { // bụng phình chứa axit, phát sáng
      const glow = 0.55 + Math.sin(this.phase * 2) * 0.15 + (this.state === 'attack' ? this.swing * 0.3 : 0);
      ctx.fillStyle = `rgba(170,230,60,${glow})`;
      ctx.beginPath();
      ctx.ellipse(-w * 0.12, (shoulderY + hipY) / 2 + 6 * s, w * 0.45, (hipY - shoulderY) * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(60,90,10,0.6)';
      ctx.beginPath(); ctx.arc(-w * 0.25, (shoulderY + hipY) / 2, 3 * s, 0, Math.PI * 2); ctx.fill();
    }
    if (T.boss) { // gai xương trên vai, vết thương phát sáng
      ctx.fillStyle = '#d8d0b8';
      for (let i = 0; i < 4; i++) {
        const bx = -w / 2 + 8 * s + i * w * 0.26;
        ctx.beginPath();
        ctx.moveTo(bx, shoulderY);
        ctx.lineTo(bx + 4 * s, shoulderY - 12 * s - (i % 2) * 6 * s);
        ctx.lineTo(bx + 8 * s, shoulderY);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,60,30,0.6)';
      ctx.fillRect(w * 0.05, shoulderY + 24 * s, w * 0.25, 4 * s);
      ctx.fillRect(-w * 0.35, shoulderY + 40 * s, w * 0.2, 3 * s);
    }

    // đầu
    if (!this.headless) {
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(-h * 0.03, -h + r, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff3b2f';
      if (T.boss) { ctx.shadowColor = '#ff2a10'; ctx.shadowBlur = 12; }
      ctx.beginPath();
      ctx.arc(-h * 0.03 - r * 0.5, -h + r * 0.9, r * 0.17, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#2a1a1a';
      ctx.fillRect(-h * 0.03 - r * 0.8, -h + r * 1.4, r * 0.6, r * 0.18);
    } else {
      ctx.fillStyle = '#7a0d0d';
      ctx.beginPath();
      ctx.ellipse(-h * 0.03, -h + 2 * r, r * 0.6, r * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // tay trước
    ctx.strokeStyle = skin;
    ctx.lineWidth = w * 0.24;
    ctx.beginPath();
    ctx.moveTo(-2 * s, shoulderY + 4 * s);
    ctx.lineTo(-w * 0.95 - 12 * s + reach, shoulderY + 6 * s + Math.sin(this.phase) * 2);
    ctx.stroke();
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
