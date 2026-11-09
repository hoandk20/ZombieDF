import {
  W, H, SHOULDER, PLAYER_X, PLAYER_FOOT, BARRICADE_X, BARRICADE_TOP, LANE_MAX,
  WEAPONS, WEAPON_ORDER, HEADSHOT_MUL, SURVIVOR_SLOTS, waveFor, barricadeMax, reloadMul,
} from './config.js';
import { Zombie, roundRect } from './zombie.js';
import { makeBackground, drawBarricade, drawPerson } from './render.js';
import { sfx, initAudio } from './audio.js';
import { saveGame } from './save.js';

const rand = (a, b) => a + Math.random() * (b - a);
const MAX_PARTICLES = 500;

const SURVIVOR_LOOKS = [
  { shirt: '#3c6e8f', pants: '#2b2f3a', skin: '#e0b48c', hat: '#4b5a2e' },
  { shirt: '#8f6a3c', pants: '#33302b', skin: '#c58c5c', hair: '#111' },
  { shirt: '#6d3c8f', pants: '#2b2f3a', skin: '#f0c9a0', hair: '#7a4a1a' },
  { shirt: '#3c8f5a', pants: '#3a2f2b', skin: '#a8754c', hat: '#222' },
];
const PLAYER_LOOK = { shirt: '#8f3c3c', pants: '#263040', skin: '#e8c09a', hat: '#2f3a2a' };

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sfx = sfx;
    this.state = 'menu'; // menu | night | paused | day | gameover
    this.data = null;
    this.bg = makeBackground();
    this.decals = document.createElement('canvas');
    this.decals.width = W; this.decals.height = H;
    this.dctx = this.decals.getContext('2d');
    this.onState = () => {};
    this.aim = { x: 640, y: 380 };
    this.firing = false;
    this.queuedAt = -1;
    this.time = 0;
    this.resetNightState();
    this.bindInput();
  }

  resetNightState() {
    this.zombies = [];
    this.particles = [];
    this.tracers = [];
    this.texts = [];
    this.survivorState = [];
    this.cooldown = 0;
    this.reloadT = 0;
    this.reloadTotal = 0;
    this.recoil = 0;
    this.shake = 0;
    this.flash = 0;
    this.spawned = 0;
    this.nightKills = 0;
    this.nightCash = 0;
    this.endTimer = -1;
    this.dctx.clearRect(0, 0, W, H);
  }

  // ---------- Input ----------
  bindInput() {
    const c = this.canvas;
    const toLocal = (e) => {
      const r = c.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
    };
    c.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      initAudio();
      try { c.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      this.aim = toLocal(e);
      this.firing = true;
      this.queuedAt = this.time;
    });
    c.addEventListener('pointermove', (e) => { this.aim = toLocal(e); });
    const up = () => { this.firing = false; };
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    c.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('keydown', (e) => {
      if (this.state === 'night') {
        const k = e.key.toLowerCase();
        if (k === 'r') this.startReload();
        else if (k >= '1' && k <= '9') this.switchWeapon(WEAPON_ORDER[Number(k) - 1]);
        else if (k === 'q') this.cycleWeapon(-1);
        else if (k === 'e') this.cycleWeapon(1);
        else if (k === 'escape' || k === 'p') this.pause();
      } else if (this.state === 'paused' && (e.key === 'Escape' || e.key.toLowerCase() === 'p')) {
        this.resume();
      }
    });
    c.addEventListener('wheel', (e) => {
      if (this.state === 'night') this.cycleWeapon(e.deltaY > 0 ? 1 : -1);
    }, { passive: true });
  }

  // ---------- Luồng game ----------
  setState(s, info) {
    this.state = s;
    this.onState(s, info);
  }

  startNight() {
    this.resetNightState();
    const d = this.data;
    this.wave = waveFor(d.night);
    this.spawnTimer = 2;
    for (const id of Object.keys(d.weapons)) {
      // đầu đêm: nạp đầy băng từ kho đạn
      const w = WEAPONS[id], st = d.weapons[id];
      const need = w.mag - st.mag;
      const take = w.infinite ? need : Math.min(need, st.reserve);
      st.mag += take;
      if (!w.infinite) st.reserve -= take;
    }
    for (let i = 0; i < d.survivors; i++) {
      this.survivorState.push({ x: SURVIVOR_SLOTS[i], cd: rand(0.5, 1.5), ang: 0, recoil: 0 });
    }
    this.texts.push({ x: W / 2, y: 200, text: `ĐÊM ${d.night}`, life: 2.2, max: 2.2, size: 48, color: '#e8d9b0' });
    this.setState('night');
  }

  pause() { if (this.state === 'night') { this.firing = false; this.setState('paused'); } }
  resume() { if (this.state === 'paused') this.setState('night'); }

  endNight() {
    const d = this.data;
    const bonus = 100 + d.night * 30;
    d.cash += bonus;
    const info = { night: d.night, kills: this.nightKills, earned: this.nightCash, bonus };
    d.night += 1;
    d.dayUsed = false;
    saveGame(d);
    this.setState('day', info);
  }

  gameOver() {
    this.firing = false;
    this.setState('gameover', { nights: this.data.night - 1, kills: this.data.totalKills });
  }

  // ---------- Vũ khí ----------
  get weapon() { return WEAPONS[this.data.current]; }
  get weaponState() { return this.data.weapons[this.data.current]; }

  switchWeapon(id) {
    if (!id || !this.data.weapons[id] || id === this.data.current) return;
    this.data.current = id;
    this.reloadT = 0;
    this.cooldown = 0.2;
    sfx.click();
    this.onState('weapon');
  }

  cycleWeapon(dir) {
    const owned = WEAPON_ORDER.filter((id) => this.data.weapons[id]);
    const i = owned.indexOf(this.data.current);
    this.switchWeapon(owned[(i + dir + owned.length) % owned.length]);
  }

  canReload() {
    const w = this.weapon, st = this.weaponState;
    return st.mag < w.mag && (w.infinite || st.reserve > 0);
  }

  startReload() {
    if (this.reloadT > 0 || !this.canReload()) return false;
    this.reloadTotal = this.weapon.reload * reloadMul(this.data.reloadLevel);
    this.reloadT = this.reloadTotal;
    sfx.reload();
    return true;
  }

  finishReload() {
    const w = this.weapon, st = this.weaponState;
    const need = w.mag - st.mag;
    const take = w.infinite ? need : Math.min(need, st.reserve);
    st.mag += take;
    if (!w.infinite) st.reserve -= take;
    sfx.reloadDone();
  }

  aimAngle() {
    const a = Math.atan2(this.aim.y - SHOULDER.y, this.aim.x - SHOULDER.x);
    return Math.max(-1.1, Math.min(0.95, a));
  }

  fire() {
    const w = this.weapon, st = this.weaponState;
    if (st.mag <= 0) {
      if (!this.startReload()) sfx.empty();
      this.cooldown = 0.25;
      return;
    }
    st.mag--;
    this.cooldown = w.rate;
    const ang = this.aimAngle();
    const ox = SHOULDER.x + Math.cos(ang) * (12 + w.len);
    const oy = SHOULDER.y + Math.sin(ang) * (12 + w.len);
    const bloom = w.auto && this.firing ? Math.min(this.recoil * 0.004, 0.04) : 0;
    for (let i = 0; i < w.pellets; i++) {
      const a = ang + (Math.random() - 0.5) * 2 * (w.spread + bloom);
      this.castRay(ox, oy, a, w.dmg, w.pierce, w.falloff, true);
    }
    this.recoil = Math.min(10, this.recoil + 4 + w.shake);
    this.shake = Math.max(this.shake, w.shake);
    this.flash = 0.06;
    this.muzzle = { x: ox, y: oy, a: ang, big: w.pellets > 1 || w.id === 'rifle' };
    sfx[w.id]();
    // vỏ đạn
    this.addParticle({ x: SHOULDER.x + 14, y: SHOULDER.y - 2, vx: rand(-60, -20), vy: rand(-160, -90), life: 1.2, color: '#d4a940', size: 2.5, g: 600, ground: PLAYER_FOOT });
    if (st.mag === 0) setTimeout(() => { if (this.state === 'night') this.startReload(); }, 150);
  }

  castRay(ox, oy, a, dmg, pierce, falloff, byPlayer) {
    const dx = Math.cos(a), dy = Math.sin(a);
    const hits = [];
    for (const z of this.zombies) {
      if (!z.alive || z.x > W + 20) continue;
      const h = z.rayHit(ox, oy, dx, dy);
      if (h) hits.push({ z, ...h });
    }
    hits.sort((p, q) => p.t - q.t);
    let endT = 1300;
    if (dy > 0) endT = Math.min(endT, (LANE_MAX + 6 - oy) / dy);
    let n = 0;
    for (const h of hits) {
      if (h.t > endT) break;
      let d = dmg * (h.head ? HEADSHOT_MUL : 1);
      if (falloff) d *= Math.max(0.35, 1 - h.t / 800);
      this.hitZombie(h.z, d, h.head, ox + dx * h.t, oy + dy * h.t, dx, byPlayer);
      if (++n >= pierce) { endT = h.t; break; }
    }
    if (n === 0 && dy > 0 && endT < 1300) {
      const gx = ox + dx * endT, gy = oy + dy * endT;
      for (let i = 0; i < 4; i++) this.addParticle({ x: gx, y: gy, vx: rand(-40, 40), vy: rand(-90, -30), life: 0.4, color: '#6b6250', size: 2, g: 300 });
    }
    this.tracers.push({ x0: ox, y0: oy, x1: ox + dx * endT, y1: oy + dy * endT, life: 0.06, max: 0.06, w: byPlayer ? 2 : 1.4 });
  }

  hitZombie(z, dmg, head, x, y, dx, byPlayer) {
    const killed = z.hurt(dmg, head, this);
    if (head) sfx.headshot(); else sfx.hit();
    const count = head ? 10 : 5;
    for (let i = 0; i < count; i++) {
      this.addParticle({
        x, y, vx: dx * rand(40, 180) + rand(-50, 50), vy: rand(-160, 20),
        life: rand(0.4, 0.9), color: Math.random() < 0.5 ? '#8b0d0d' : '#5e0a0a', size: rand(2, 4), g: 500,
        ground: z.foot + rand(-4, 4), decal: true,
      });
    }
    if (killed) {
      const reward = Math.round(z.T.reward * (head ? 1.5 : 1));
      this.data.cash += reward;
      this.data.totalKills++;
      this.nightKills++;
      this.nightCash += reward;
      this.texts.push({ x: z.x, y: z.foot - z.h - 10, text: (head ? 'HEADSHOT +$' : '+$') + reward, life: 1, max: 1, size: head ? 15 : 13, color: head ? '#ffcf4a' : '#9fe07a' });
      if (head) {
        const b = z.boxes();
        for (let i = 0; i < 16; i++) this.addParticle({ x: b.hx, y: b.hy, vx: rand(-120, 160), vy: rand(-260, -40), life: rand(0.5, 1.1), color: '#7a0b0b', size: rand(2, 5), g: 600, ground: z.foot + rand(-6, 6), decal: true });
      }
    }
  }

  damageBarricade(dmg, foot) {
    if (this.state !== 'night') return;
    this.data.hp -= dmg;
    this.shake = Math.max(this.shake, dmg > 15 ? 5 : 1.5);
    sfx.barricade();
    for (let i = 0; i < 4; i++) {
      this.addParticle({ x: BARRICADE_X - 2, y: rand(BARRICADE_TOP + 10, foot - 6), vx: rand(-120, -20), vy: rand(-120, 0), life: 0.6, color: Math.random() < 0.5 ? '#6b4a2b' : '#8a7b57', size: rand(2, 4), g: 500, ground: foot });
    }
    if (this.data.hp <= 0) { this.data.hp = 0; this.gameOver(); }
  }

  addParticle(p) {
    p.max = p.life;
    if (this.particles.length < MAX_PARTICLES) this.particles.push(p);
  }

  // ---------- Update ----------
  update(dt) {
    this.time += dt;
    if (this.state !== 'night') return;
    const d = this.data;

    // sinh zombie
    if (this.spawned < this.wave.total) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.zombies.push(new Zombie(this.pickType(), this.wave.hpMul));
        this.spawned++;
        const burst = Math.random() < 0.18;
        this.spawnTimer = burst ? 0.15 : this.wave.interval * rand(0.4, 1.6);
      }
    }

    // vũ khí
    this.cooldown -= dt;
    this.recoil = Math.max(0, this.recoil - dt * 40);
    if (this.reloadT > 0) {
      this.reloadT -= dt;
      if (this.reloadT <= 0) { this.reloadT = 0; this.finishReload(); }
    }
    const queued = this.queuedAt >= 0 && this.time - this.queuedAt < 0.3;
    if ((this.weapon.auto && this.firing) || queued) {
      if (this.cooldown <= 0 && this.reloadT <= 0) {
        this.fire();
        this.queuedAt = -1;
      }
    }

    // zombie
    for (const z of this.zombies) z.update(dt, this);
    this.zombies = this.zombies.filter((z) => !(z.state === 'dead' && z.deadT > 5.5));
    if (this.state !== 'night') return; // có thể vừa game over

    // người sống sót tự bắn
    for (const s of this.survivorState) {
      s.cd -= dt;
      s.recoil = Math.max(0, s.recoil - dt * 40);
      const targets = this.zombies.filter((z) => z.alive && z.x < W - 10);
      if (targets.length) {
        targets.sort((a, b) => a.x - b.x);
        const t = targets[Math.min(targets.length - 1, Math.floor(Math.random() * 2))];
        const b = t.boxes();
        const ty = Math.random() < 0.25 ? b.hy : (b.by0 + b.by1) / 2;
        const sx = s.x + 4, sy = PLAYER_FOOT - 76;
        s.ang = Math.atan2(ty - sy, t.x - sx);
        if (s.cd <= 0) {
          s.cd = rand(0.9, 1.5);
          s.recoil = 4;
          const miss = Math.random() < 0.3 ? rand(-0.06, 0.06) : 0;
          this.castRay(sx + Math.cos(s.ang) * 34, sy + Math.sin(s.ang) * 34, s.ang + miss, 22, 1, false, false);
          sfx.pistol();
        }
      }
    }

    // particles
    for (const p of this.particles) {
      p.life -= dt;
      p.vy += (p.g || 0) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.ground && p.y >= p.ground) {
        if (p.decal) {
          this.dctx.fillStyle = 'rgba(90,8,8,0.55)';
          this.dctx.beginPath();
          this.dctx.ellipse(p.x, p.ground, p.size * 1.6, p.size * 0.6, 0, 0, Math.PI * 2);
          this.dctx.fill();
          p.life = 0;
        } else { p.y = p.ground; p.vy *= -0.3; p.vx *= 0.5; }
      }
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const t of this.tracers) t.life -= dt;
    this.tracers = this.tracers.filter((t) => t.life > 0);
    for (const t of this.texts) { t.life -= dt; t.y -= dt * 25; }
    this.texts = this.texts.filter((t) => t.life > 0);
    this.shake = Math.max(0, this.shake - dt * 25);
    this.flash = Math.max(0, this.flash - dt);

    // hết đêm?
    if (this.spawned >= this.wave.total && this.zombies.every((z) => !z.alive)) {
      if (this.endTimer < 0) {
        this.endTimer = 2.5;
        this.texts.push({ x: W / 2, y: 220, text: 'TRỜI ĐÃ SÁNG!', life: 2.4, max: 2.4, size: 40, color: '#ffd77a' });
      }
      this.endTimer -= dt;
      if (this.endTimer <= 0) this.endNight();
    }
    if (d.hp < 0) d.hp = 0;
  }

  pickType() {
    const wts = this.wave.weights;
    let sum = 0;
    for (const k in wts) sum += wts[k];
    let r = Math.random() * sum;
    for (const k in wts) { r -= wts[k]; if (r <= 0) return k; }
    return 'walker';
  }

  // ---------- Render ----------
  render() {
    const ctx = this.ctx;
    ctx.save();
    if (this.shake > 0) ctx.translate(rand(-1, 1) * this.shake, rand(-1, 1) * this.shake);
    ctx.drawImage(this.bg, 0, 0);
    ctx.drawImage(this.decals, 0, 0);

    const inGame = this.data && this.state !== 'menu';
    if (inGame) {
      const ang = this.aimAngle();
      for (const s of this.survivorState) {
        drawPerson(ctx, s.x, PLAYER_FOOT - 4, s.ang, SURVIVOR_LOOKS[SURVIVOR_SLOTS.indexOf(s.x)], 26, s.recoil);
      }
      drawPerson(ctx, PLAYER_X, PLAYER_FOOT, ang, PLAYER_LOOK, this.weapon.len, this.recoil * 0.6);
      drawBarricade(ctx, this.data.hp / barricadeMax(this.data.barricadeLevel));
    }

    const sorted = [...this.zombies].sort((a, b) => (a.alive - b.alive) || (a.foot - b.foot));
    for (const z of sorted) z.draw(ctx);

    for (const p of this.particles) {
      ctx.globalAlpha = Math.min(1, p.life / p.max * 2);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    for (const t of this.tracers) {
      ctx.strokeStyle = `rgba(255,230,150,${(t.life / t.max) * 0.9})`;
      ctx.lineWidth = t.w;
      ctx.beginPath(); ctx.moveTo(t.x0, t.y0); ctx.lineTo(t.x1, t.y1); ctx.stroke();
    }
    if (this.flash > 0 && this.muzzle) {
      const m = this.muzzle, sz = m.big ? 18 : 11;
      ctx.save();
      ctx.translate(m.x, m.y); ctx.rotate(m.a);
      ctx.fillStyle = 'rgba(255,220,120,0.95)';
      ctx.beginPath(); ctx.moveTo(0, -sz * 0.45); ctx.lineTo(sz * 1.6, 0); ctx.lineTo(0, sz * 0.45); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,220,0.9)';
      ctx.beginPath(); ctx.arc(2, 0, sz * 0.35, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    for (const t of this.texts) {
      ctx.globalAlpha = Math.min(1, (t.life / t.max) * 2.5);
      ctx.font = `bold ${t.size}px Impact, "Arial Black", sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // ánh sáng tối viền màn hình
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);

    if (inGame && (this.state === 'night' || this.state === 'paused')) {
      this.drawCrosshair(ctx);
      this.drawHUD(ctx);
    }
  }

  drawCrosshair(ctx) {
    const { x, y } = this.aim;
    const reloading = this.reloadT > 0;
    const gap = 6 + this.recoil * 0.8 + this.weapon.spread * 60;
    ctx.strokeStyle = reloading ? 'rgba(255,180,80,0.9)' : 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - gap - 8, y); ctx.lineTo(x - gap, y);
    ctx.moveTo(x + gap, y); ctx.lineTo(x + gap + 8, y);
    ctx.moveTo(x, y - gap - 8); ctx.lineTo(x, y - gap);
    ctx.moveTo(x, y + gap); ctx.lineTo(x, y + gap + 8);
    ctx.stroke();
    if (reloading) {
      const k = 1 - this.reloadT / this.reloadTotal;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, gap + 14, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2);
      ctx.stroke();
    }
  }

  drawHUD(ctx) {
    const d = this.data;
    const max = barricadeMax(d.barricadeLevel);
    const ratio = d.hp / max;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(ctx, 12, 12, 270, 64, 8);
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.font = 'bold 18px Impact, "Arial Black", sans-serif';
    ctx.fillStyle = '#e8d9b0';
    ctx.fillText(`ĐÊM ${d.night}`, 24, 36);
    ctx.fillStyle = '#9fe07a';
    ctx.textAlign = 'right';
    ctx.fillText(`$${d.cash}`, 270, 36);
    const left = this.wave.total - this.nightKills;
    ctx.fillStyle = '#d9a0a0';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Zombie còn lại: ${left}`, 150, 35);
    // thanh máu hàng rào
    ctx.fillStyle = '#2a1a1a';
    roundRect(ctx, 24, 46, 246, 18, 4); ctx.fill();
    ctx.fillStyle = ratio > 0.5 ? '#5aa64a' : ratio > 0.25 ? '#d9a33a' : '#d94040';
    roundRect(ctx, 24, 46, Math.max(4, 246 * ratio), 18, 4); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`HÀNG RÀO ${Math.ceil(d.hp)} / ${max}`, 147, 59);
  }
}
