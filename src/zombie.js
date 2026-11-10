import { ZOMBIES, BARRICADE_X, LANE_MIN, LANE_MAX, W } from './config.js';

const rand = (a, b) => a + Math.random() * (b - a);
// vị trí đầu (tỉ lệ theo chiều cao) cho dáng còng lưng; dùng chung cho hitbox và hình vẽ
const HEAD_X = 0.17, HEAD_Y = 0.86, HEAD_R = 0.105;

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
    this.burnT = 0;
    this.burnDps = 0;
  }

  get alive() { return this.state !== 'dead'; }

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
    this.buffT = Math.max(0, this.buffT - dt);
    this.screamT = Math.max(0, this.screamT - dt);
    if (this.burnT > 0) {
      this.burnT -= dt;
      game.burnTick(this, this.burnDps * dt);
      if (this.state === 'dead') return;
    }

    if (this.T.boss) {
      this.roarT -= dt;
      if (this.roarT <= 0) { this.roarT = rand(6, 9); game.bossRoar(this); }
    }
    const spd = this.speed * (this.buffT > 0 ? 1.5 : 1) * (game.slowAt ? game.slowAt(this, dt) : 1);
    if (this.fleeing) { // kẻ mang hòm bỏ chạy
      this.x += spd * 1.15 * dt;
      this.phase += dt * (2 + spd * 0.06);
      if (this.x > W + 70) game.bountyEscaped(this);
      return;
    }
    if (this.state === 'walk') {
      this.x -= spd * dt;
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
  }

  // kind: 'bullet' | 'fire' | 'blast'. Giáp chỉ chặn đạn thường.
  hurt(dmg, head, game, kind = 'bullet') {
    let result = false;
    if (this.T.armored && kind === 'bullet') {
      if (head && this.helmet > 0) {
        this.helmet -= dmg;
        dmg *= 0.3;
        if (this.helmet <= 0) result = 'helmet';
      } else if (!head) dmg *= 0.55;
    }
    if (this.armorPhase && kind === 'bullet') dmg *= 0.4; // giai đoạn 3 của Mẫu Thể Số 0
    this.hp -= dmg;
    if (kind !== 'fire') this.hitT = 0.08; // cháy âm ỉ thì không chớp trắng
    const kb = (this.T.heavy ? 1.5 : 6) * Math.min(dmg / 30, 3);
    this.x = Math.min(this.x + kb, W + 100);
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
    if (this.reviveT > 0) ctx.translate(Math.sin(this.reviveT * 40) * 1.5, 0); // co giật trước khi đứng dậy
    if (this.T.kind === 'crawl') this.drawCrawl(ctx); else if (this.T.kind === 'dog') this.drawDog(ctx); else this.drawUpright(ctx);
    ctx.restore();
    if (this.alive && this.buffT > 0) { // bị kích động bởi tiếng rú
      const b = this.boxes();
      const g = ctx.createRadialGradient(b.hx, b.hy, 0, b.hx, b.hy, b.hr * 2.6);
      g.addColorStop(0, 'rgba(255,40,40,0.35)');
      g.addColorStop(1, 'rgba(255,40,40,0)');
      ctx.fillStyle = g;
      ctx.fillRect(b.hx - b.hr * 3, b.hy - b.hr * 3, b.hr * 6, b.hr * 6);
    }
    if (this.burnT > 0 && this.alive) { // lửa bám trên người
      const fh = this.T.kind === 'crawl' ? this.h : this.h * 0.8;
      for (let i = 0; i < 3; i++) {
        const fx = this.x + Math.sin(this.phase * 5 + i * 2) * this.w * 0.3;
        const fy = this.foot - fh * (0.3 + i * 0.25);
        const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 14);
        g.addColorStop(0, 'rgba(255,220,120,0.85)');
        g.addColorStop(0.5, 'rgba(255,110,30,0.5)');
        g.addColorStop(1, 'rgba(255,60,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(fx - 14, fy - 18, 28, 32);
      }
    }

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
    const flash = this.hitT > 0;
    const skin = flash ? '#f2f2e6' : T.skin;
    const skinDark = flash ? '#ddd' : shade(T.skin, -30);
    const shirt = flash ? '#ddd' : T.shirt;
    const pants = flash ? '#ccc' : T.pants;
    const walking = this.state === 'walk';
    const attacking = this.state === 'attack';
    const sw = walking ? Math.sin(this.phase) * 12 * s : 0;
    const bob = walking ? Math.abs(Math.sin(this.phase)) * 2.2 * s : 0;
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
      ctx.strokeStyle = col;
      ctx.lineWidth = w * 0.36;
      ctx.beginPath(); ctx.moveTo(hipX + dx, hipY); ctx.lineTo(kx, ky); ctx.lineTo(fx + 1 * s, fy - 7 * s); ctx.stroke();
      // gấu quần rách
      ctx.fillStyle = col;
      ctx.beginPath();
      const hw = w * 0.2;
      ctx.moveTo(fx - hw, fy - 10 * s);
      for (let k = 0; k <= 4; k++) ctx.lineTo(fx - hw + (k * hw) / 2, fy - 10 * s + (k % 2 ? 6 : 2) * s);
      ctx.lineTo(fx + hw, fy - 10 * s);
      ctx.fill();
      // cổ chân + bàn chân trần, ngón chân hướng về phía trước (trái)
      ctx.strokeStyle = skinDark;
      ctx.lineWidth = w * 0.16;
      ctx.beginPath(); ctx.moveTo(fx + 1 * s, fy - 8 * s); ctx.lineTo(fx - 1 * s, fy - 1 * s); ctx.stroke();
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.ellipse(fx - 4 * s, fy, 8 * s, 3 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(110,20,15,0.6)';
      ctx.fillRect(fx - 11 * s, fy - 1 * s, 4 * s, 2 * s);
    };
    leg(4 * s, -sw, shade(T.pants, -18));
    ctx.translate(0, -bob);

    // ---- tay sau (buông thõng) ----
    const arm = (offX, phase, col, sleeve) => {
      const lift = attacking ? Math.sin(this.swing * Math.PI) : 0;
      const dangle = walking ? Math.sin(phase) * 6 * s : 0;
      const ex = shX + offX - 6 * s + dangle - lift * 16 * s;
      const ey = shY + 26 * s - lift * 20 * s;
      const hx2 = ex - 7 * s - lift * 18 * s;
      const hy2 = ey + 24 * s - lift * 26 * s;
      ctx.strokeStyle = col;
      ctx.lineWidth = w * 0.17;
      ctx.beginPath(); ctx.moveTo(shX + offX, shY + 3 * s); ctx.lineTo(ex, ey); ctx.lineTo(hx2, hy2); ctx.stroke();
      // tay áo rách tới khuỷu
      ctx.strokeStyle = sleeve;
      ctx.lineWidth = w * 0.26;
      ctx.beginPath(); ctx.moveTo(shX + offX, shY + 2 * s); ctx.lineTo((shX + offX + ex) / 2 + 1, (shY + ey) / 2 + 4 * s); ctx.stroke();
      // bàn tay + móng vuốt
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(hx2, hy2, 3.4 * s, 0, Math.PI * 2); ctx.fill();
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
    arm(6 * s, this.phase + Math.PI, skinDark, shade(T.shirt, -20));

    leg(-4 * s, sw, pants);

    // ---- thân: ngực trơ xương sườn, áo phanh ----
    const tw = w * 0.5;
    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.moveTo(hipX - tw * 0.8, hipY + 4 * s); ctx.lineTo(shX - tw, shY + 2 * s);
    ctx.quadraticCurveTo(shX, shY - 5 * s, shX + tw, shY); ctx.lineTo(hipX + tw * 0.85, hipY + 4 * s);
    ctx.closePath(); ctx.fill();
    // xương sườn
    ctx.strokeStyle = 'rgba(40,25,15,0.55)';
    ctx.lineWidth = 1.3 * s;
    for (let k = 0; k < 5; k++) {
      const t = 0.18 + k * 0.13;
      const cx = shX + (hipX - shX) * t, cy = shY + (hipY - shY) * t;
      ctx.beginPath(); ctx.moveTo(cx - tw * 0.55, cy + 2 * s); ctx.quadraticCurveTo(cx - tw * 0.1, cy - 2 * s, cx + tw * 0.3, cy + 1 * s); ctx.stroke();
    }
    // áo: vạt sau + vạt trước, gấu rách
    const flap = (x0, x1, front) => {
      ctx.fillStyle = front ? shirt : shade(T.shirt, -15);
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
      ctx.fill();
    };
    flap(tw * 0.1, tw * 1.05, false);   // vạt sau (phía lưng)
    flap(-tw * 1.05, -tw * 0.62, true); // vạt trước phanh ra
    // cổ áo
    ctx.fillStyle = shade(T.shirt, 12);
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
      ctx.fillText('CSCĐ', (shX + hipX) / 2, shoulderY + 18 * s);
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
    ctx.strokeStyle = skinDark;
    ctx.lineWidth = w * 0.18;
    ctx.beginPath(); ctx.moveTo(shX - 1 * s, shY + 2 * s); ctx.lineTo(hx + r * 0.3, hy + r * 0.7); ctx.stroke();
    if (!this.headless) {
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.ellipse(hx, hy, r * 0.95, r * 1.08, -0.25, 0, Math.PI * 2); ctx.fill();
      // hàm dưới nhô ra
      ctx.beginPath(); ctx.moveTo(hx - r * 0.95, hy + r * 0.25); ctx.lineTo(hx - r * 0.85, hy + r * 1.05); ctx.lineTo(hx + r * 0.1, hy + r * 1.1); ctx.lineTo(hx + r * 0.4, hy + r * 0.5); ctx.fill();
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
      ctx.fillStyle = T.boss ? '#ff3b2f' : '#e8d8b0';
      if (T.boss) { ctx.shadowColor = '#ff2a10'; ctx.shadowBlur = 12; }
      ctx.beginPath(); ctx.arc(hx - r * 0.56, hy - r * 0.1, r * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // gò má + tai
      ctx.fillStyle = skinDark;
      ctx.beginPath(); ctx.ellipse(hx + r * 0.25, hy + r * 0.05, r * 0.2, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      // tóc lưa thưa
      ctx.strokeStyle = flash ? '#fff' : '#3a2e22';
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      for (let k = 0; k < 5; k++) {
        const a = -Math.PI * 0.75 + k * 0.28;
        const x0 = hx + Math.cos(a) * r * 0.9, y0 = hy + Math.sin(a) * r * 0.95;
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(x0 + 3 * s, y0 - 4 * s, x0 + 6 * s + k, y0 - 2 * s);
      }
      ctx.stroke();
      if (this.helmet > 0) { // mũ bảo hiểm có kính chắn
        ctx.fillStyle = flash ? '#fff' : '#20283a';
        ctx.beginPath(); ctx.arc(hx, hy - r * 0.05, r * 1.15, Math.PI * 1.05, Math.PI * 0.05); ctx.fill();
        ctx.fillStyle = 'rgba(150,190,230,0.45)';
        ctx.fillRect(hx - r * 1.2, hy - r * 0.3, r * 0.9, r * 0.75);
      }
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

    // ---- tay trước ----
    arm(-2 * s, this.phase, skin, shirt);
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
