import {
  W, H, HORIZON, SHOULDER, PLAYER_X, PLAYER_FOOT, BARRICADE_X, BARRICADE_TOP, LANE_MIN, LANE_MAX,
  WEAPONS, WEAPON_ORDER, HEADSHOT_MUL, SURVIVOR_SLOTS, GRENADE, CAMPAIGN_NIGHTS, ACT_LENGTH,
  waveFor, weatherFor, barricadeMax, reloadMul, actFor, bossTypeFor, dmgMul,
} from './config.js';
import { SURVIVORS, NIGHT_TITLES, hasPerk } from './story.js';
import { Zombie, roundRect } from './zombie.js';
import { makeBackground, drawBarricade, drawPerson, drawHero } from './render.js';
import { sfx, initAudio, setMood, heartbeat } from './audio.js';
import { saveGame } from './save.js';

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const MAX_PARTICLES = 700;
const DISPLAY_FONT = 'Oswald, Impact, "Arial Narrow", sans-serif';
const MENU_WEATHER = { rain: true, lightning: true, fog: 0.18, bloodMoon: false };

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sfx = sfx;
    this.settings = { shake: true };
    this.state = 'menu'; // menu | cutscene | night | paused | day | gameover | victory
    this.data = null;
    this.bgs = {};
    this.scene = 'town';
    this.decals = document.createElement('canvas');
    this.decals.width = W; this.decals.height = H;
    this.dctx = this.decals.getContext('2d');
    this.onState = () => {};
    this.aim = { x: 640, y: 380 };
    this.firing = false;
    this.queuedAt = -1;
    this.time = 0;
    this.weather = MENU_WEATHER;
    this.rain = Array.from({ length: 170 }, () => ({ x: rand(0, W + 200), y: rand(-H, H), len: rand(10, 20), spd: rand(650, 900) }));
    this.nextLightning = 4;
    this.lightning = 0;
    this.bolt = null;
    this.resetNightState();
    this.bindInput();
  }

  resetNightState() {
    this.zombies = [];
    this.particles = [];
    this.tracers = [];
    this.texts = [];
    this.lights = [];
    this.projectiles = [];
    this.survivorState = [];
    this.cooldown = 0;
    this.reloadT = 0;
    this.reloadTotal = 0;
    this.recoil = 0;
    this.shake = 0;
    this.flash = 0;
    this.hurtFlash = 0;
    this.slowT = 0;
    this.spawned = 0;
    this.bossSpawned = false;
    this.boss = null;
    this.endTimer = -1;
    this.titleCard = null;
    this.hitMarker = null;
    this.streak = 0;
    this.lastKill = -10;
    this.comboShow = null;
    this.demoTimer = 1;
    this.demoCd = 1;
    this.demoAim = { x: 600, y: 380 };
    this.grenadeArmed = false;
    this.stats = { kills: 0, headshots: 0, earned: 0, bestStreak: 0, damage: 0, combo: 0 };
    this.extraSpawns = 0;
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
      if (this.grenadeArmed && this.state === 'night') {
        this.grenadeArmed = false;
        this.throwGrenade();
        return;
      }
      this.firing = true;
      this.queuedAt = this.time;
    });
    c.addEventListener('pointermove', (e) => { this.aim = toLocal(e); });
    const up = () => { this.firing = false; };
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    c.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (this.state === 'night') {
        if (k === 'r') this.startReload();
        else if (k === 'g' || k === ' ') { e.preventDefault(); this.throwGrenade(); }
        else if (k >= '1' && k <= '9') this.switchWeapon(WEAPON_ORDER[Number(k) - 1]);
        else if (k === 'q') this.cycleWeapon(-1);
        else if (k === 'e') this.cycleWeapon(1);
        else if (k === 'escape' || k === 'p') this.pause();
      } else if (this.state === 'paused' && (k === 'escape' || k === 'p')) {
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

  bg() {
    const key = this.scene + (this.weather.bloodMoon ? '-blood' : '');
    if (!this.bgs[key]) this.bgs[key] = makeBackground(this.weather.bloodMoon, this.scene);
    return this.bgs[key];
  }

  // Đổi bối cảnh cho phim cốt truyện (vd. sang bến cảng ở chương 2)
  setScene(scene) {
    this.resetNightState();
    this.scene = scene;
    this.survivorState = [];
    this.weather = { rain: false, lightning: false, fog: scene === 'harbor' ? 0.25 : 0.12, bloodMoon: false };
  }

  enterMenu() {
    this.resetNightState();
    this.scene = 'town';
    this.weather = MENU_WEATHER;
    this.state = 'menu';
    setMood('menu');
  }

  startNight() {
    this.resetNightState();
    const d = this.data;
    this.wave = waveFor(d.night);
    this.weather = weatherFor(d.night);
    this.scene = actFor(d.night) === 1 ? 'town' : 'harbor';
    this.spawnTimer = 2.5;
    this.maxHp = barricadeMax(d.barricadeLevel);
    for (const id of Object.keys(d.weapons)) {
      // đầu đêm: nạp đầy băng từ kho đạn
      const w = WEAPONS[id], st = d.weapons[id];
      const need = w.mag - st.mag;
      const take = w.infinite ? need : Math.min(need, st.reserve);
      st.mag += take;
      if (!w.infinite) st.reserve -= take;
    }
    d.crew.forEach((id, i) => {
      const def = SURVIVORS.find((s) => s.id === id);
      this.survivorState.push({ id, def, x: SURVIVOR_SLOTS[i], cd: rand(0.5, 1.5), ang: 0, recoil: 0 });
    });
    const sub = d.night <= CAMPAIGN_NIGHTS ? NIGHT_TITLES[d.night] : (this.wave.boss ? 'Trăng máu lại lên. Một Kẻ Khổng Lồ khác đang đến.' : 'Chúng không bao giờ ngừng lại.');
    this.titleCard = { title: `ĐÊM ${d.night}`, sub, t: 4, max: 4 };
    sfx.sting();
    setMood('night');
    this.setState('night');
  }

  pause() { if (this.state === 'night') { this.firing = false; this.setState('paused'); } }
  resume() { if (this.state === 'paused') this.setState('night'); }

  endNight() {
    const d = this.data;
    const bonus = 100 + d.night * 30;
    d.cash += bonus;
    const info = { night: d.night, bonus, ...this.stats };
    const wasFinale = d.night === CAMPAIGN_NIGHTS && !d.endless;
    const wasAct1End = d.night === ACT_LENGTH && !d.endless;
    d.night += 1;
    d.dayUsed = false;
    saveGame(d);
    setMood('day');
    if (wasFinale || wasAct1End) { this.weather = { rain: false, lightning: false, fog: 0.1, bloodMoon: false }; this.victoryT = 0; }
    this.setState(wasFinale ? 'victory' : wasAct1End ? 'interlude' : 'day', info);
  }

  gameOver() {
    this.firing = false;
    setMood('off');
    this.setState('gameover', { night: this.data.night, kills: this.data.totalKills, ...this.stats });
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
    if (this.state !== 'night' || this.reloadT > 0 || !this.canReload()) return false;
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

  aimAngle(aim = this.aim) {
    const a = Math.atan2(aim.y - SHOULDER.y, aim.x - SHOULDER.x);
    return clamp(a, -1.1, 0.95);
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
    const bloom = w.auto && this.firing ? Math.min(this.recoil * 0.004, 0.04) : 0;
    if (w.flame) this.flame(ang, w);
    else if (w.explosive) this.launch(ang, w);
    else this.shoot(ang, w, bloom, true);
    this.recoil = Math.min(10, this.recoil + 4 + w.shake);
    this.shake = Math.max(this.shake, w.shake);
    sfx[w.id]();
    if (st.mag === 0) setTimeout(() => { if (this.state === 'night') this.startReload(); }, 150);
  }

  shoot(ang, w, bloom, byPlayer) {
    const ox = SHOULDER.x + Math.cos(ang) * (12 + w.len);
    const oy = SHOULDER.y + Math.sin(ang) * (12 + w.len);
    for (let i = 0; i < w.pellets; i++) {
      const a = ang + (Math.random() - 0.5) * 2 * (w.spread + bloom);
      this.castRay(ox, oy, a, w.dmg, w.pierce, w.falloff, byPlayer);
    }
    this.flash = 0.06;
    this.muzzle = { x: ox, y: oy, a: ang, big: w.pellets > 1 || w.id === 'rifle' };
    this.lights.push({ x: ox, y: oy, r: w.pellets > 1 ? 300 : 230, life: 0.07, max: 0.07, color: '255,190,90', a: 0.32 });
    this.addParticle({ x: SHOULDER.x + 14, y: SHOULDER.y - 2, vx: rand(-60, -20), vy: rand(-160, -90), life: 1.2, color: '#d4a940', size: 2.5, g: 600, ground: PLAYER_FOOT });
    this.addParticle({ x: ox, y: oy, vx: Math.cos(ang) * 30, vy: -20, life: 0.6, color: '150,150,160', size: 5, kind: 'smoke' });
  }

  muzzlePos(ang, w) {
    return { x: SHOULDER.x + Math.cos(ang) * (12 + w.len), y: SHOULDER.y + Math.sin(ang) * (12 + w.len) };
  }

  playerMul() { return this.data ? dmgMul(this.data.dmgLevel || 0) : 1; }

  // Súng phun lửa: nón lửa tầm gần, gây cháy theo thời gian, xuyên giáp
  flame(ang, w) {
    const { x: ox, y: oy } = this.muzzlePos(ang, w);
    const mul = this.playerMul();
    const hit = new Set();
    for (let i = 0; i < 3; i++) {
      const a = ang + (i - 1) * w.spread * 0.8;
      const dx = Math.cos(a), dy = Math.sin(a);
      for (const z of this.zombies) {
        if (!z.alive || hit.has(z)) continue;
        const h = z.rayHit(ox, oy, dx, dy);
        if (h && h.t <= w.range) hit.add(z);
      }
    }
    for (const z of hit) {
      z.burnT = 3;
      z.burnDps = w.burn * mul;
      this.hitZombie(z, w.dmg * mul, false, z.x, z.foot - z.h * 0.5, 1, true, { silent: true, kind: 'fire', noFx: true });
    }
    for (let i = 0; i < 3; i++) {
      const a = ang + (Math.random() - 0.5) * w.spread * 2.2;
      const sp = rand(420, 560);
      this.addParticle({ x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, life: w.range / sp, color: '', size: rand(5, 9), kind: 'flame' });
    }
    this.lights.push({ x: ox + Math.cos(ang) * 120, y: oy + Math.sin(ang) * 120, r: 240, life: 0.08, max: 0.08, color: '255,140,40', a: 0.22 });
  }

  // Súng phóng lựu: đạn nổ bay tới điểm ngắm
  launch(ang, w) {
    const { x: ox, y: oy } = this.muzzlePos(ang, w);
    const tx = clamp(this.aim.x, 280, W - 20);
    const ty = Math.min(this.aim.y, LANE_MAX);
    const dist = Math.hypot(tx - ox, ty - oy);
    this.projectiles.push({ type: 'shell', x0: ox, y0: oy, x1: tx, y1: ty, t: 0, dur: dist / 1100, arc: dist * 0.06, w });
    this.flash = 0.06;
    this.muzzle = { x: ox, y: oy, a: ang, big: true };
    this.lights.push({ x: ox, y: oy, r: 220, life: 0.08, max: 0.08, color: '255,190,90', a: 0.3 });
    this.addParticle({ x: ox, y: oy, vx: Math.cos(ang) * 40, vy: -30, life: 0.8, color: '150,150,160', size: 8, kind: 'smoke' });
  }

  castRay(ox, oy, a, dmg, pierce, falloff, byPlayer) {
    if (byPlayer) dmg *= this.playerMul();
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
    this.tracers.push({ x0: ox, y0: oy, x1: ox + dx * endT, y1: oy + dy * endT, life: 0.07, max: 0.07, w: byPlayer ? 2 : 1.4 });
  }

  hitZombie(z, dmg, head, x, y, dx, byPlayer, opts = {}) {
    if (!z.alive) return;
    const res = z.hurt(dmg, head, this, opts.kind || 'bullet');
    const killed = res === true;
    if (res === 'helmet') {
      this.texts.push({ x: z.x, y: z.foot - z.h - 6, text: 'VỠ MŨ!', life: 0.8, max: 0.8, size: 14, color: '#9fc8ff' });
      for (let i = 0; i < 8; i++) this.addParticle({ x, y, vx: rand(-80, 120), vy: rand(-200, -60), life: 1, color: '#20283a', size: rand(3, 5), g: 600, ground: z.foot });
    }
    if (!opts.silent) { if (head) sfx.headshot(); else sfx.hit(); }
    if (byPlayer && !opts.noFx) this.hitMarker = { t: 0.15, head, kill: killed };
    const count = opts.noFx ? 0 : head ? 10 : 5;
    for (let i = 0; i < count; i++) {
      this.addParticle({
        x, y, vx: dx * rand(40, 180) + rand(-50, 50), vy: rand(-160, 20),
        life: rand(0.4, 0.9), color: z.T.ranged ? '#7a9a10' : (Math.random() < 0.5 ? '#8b0d0d' : '#5e0a0a'), size: rand(2, 4), g: 500,
        ground: z.foot + rand(-4, 4), decal: true,
      });
    }
    if (!killed) return;
    this.onKill(z, head, byPlayer);
  }

  burnTick(z, dmg) {
    if (!z.alive) return;
    if (Math.random() < 0.15) this.addParticle({ x: z.x + rand(-8, 8), y: z.foot - z.h * rand(0.2, 0.8), vx: rand(-10, 10), vy: rand(-60, -30), life: 0.5, color: '', size: rand(3, 6), kind: 'flame' });
    this.hitZombie(z, dmg, false, z.x, z.foot - z.h / 2, 1, true, { silent: true, kind: 'fire', noFx: true });
  }

  onKill(z, head, byPlayer, rewarded = true) {
    if (head) {
      const b = z.boxes();
      for (let i = 0; i < 18; i++) this.addParticle({ x: b.hx, y: b.hy, vx: rand(-120, 160), vy: rand(-280, -40), life: rand(0.5, 1.1), color: '#7a0b0b', size: rand(2, 5), g: 600, ground: z.foot + rand(-6, 6), decal: true });
    }
    if (z.T.ranged) this.splashAcid(z.x, z.foot - z.h * 0.45, 14, z.foot);
    if (z.T.bomber && !z.burst) this.bloaterBurst(z, false);
    if (z === this.boss) this.bossDown(z);
    if (this.state !== 'night') return;

    const d = this.data;
    let reward = rewarded ? Math.round(z.T.reward * (head ? 1.5 : 1)) : 0;
    if (byPlayer && rewarded) {
      this.streak = this.time - this.lastKill < 1.6 ? this.streak + 1 : 1;
      this.lastKill = this.time;
      this.stats.bestStreak = Math.max(this.stats.bestStreak, this.streak);
      if (this.streak >= 3) {
        const bonus = this.streak * 3;
        reward += bonus;
        this.comboShow = { n: this.streak, t: 1.3 };
        sfx.combo(Math.min(this.streak, 12));
      }
    }
    if (head) { d.headshots = (d.headshots || 0) + 1; this.stats.headshots++; }
    d.cash += reward;
    d.totalKills++;
    this.stats.kills++;
    this.stats.earned += reward;
    if (reward) this.texts.push({ x: z.x, y: z.foot - z.h - 10, text: (head ? 'HEADSHOT +$' : '+$') + reward, life: 1, max: 1, size: head ? 16 : 13, color: head ? '#ffcf4a' : '#9fe07a' });

    // zombie cuối cùng của đêm: quay chậm
    if (this.allSpawned() && this.zombies.every((o) => !o.alive)) this.slowT = 1.1;
  }

  // Kẻ trương phình phát nổ: hạ cả bầy xung quanh, nhưng nổ sát rào thì làm hỏng rào
  bloaterBurst(z, atWall) {
    if (z.burst) return;
    z.burst = true;
    if (z.alive) {
      z.hp = 0;
      z.state = 'dead';
      z.deadT = 0;
      this.onKill(z, false, false, false);
    }
    const x = z.x, y = z.foot - z.h * 0.45;
    if (z.x - z.w / 2 < BARRICADE_X + 70) this.damageBarricade(atWall ? z.T.dmg : z.T.dmg * 0.5, z.foot);
    this.explode(x, y, { radius: 115, dmg: 160, toxic: true, byPlayer: !atWall, exclude: z });
  }

  allSpawned() {
    return this.spawned >= this.wave.total && (!this.wave.boss || this.bossSpawned);
  }

  // ---------- Lựu đạn ----------
  throwGrenade() {
    const d = this.data;
    if (this.state !== 'night' || d.grenades <= 0) { if (this.state === 'night') sfx.empty(); return; }
    if (this.projectiles.some((p) => p.type === 'grenade' && p.t < 0.15)) return;
    d.grenades--;
    const x1 = clamp(this.aim.x, 290, 900);
    const y1 = clamp(this.aim.y, LANE_MIN, LANE_MAX);
    const dist = Math.hypot(x1 - SHOULDER.x, y1 - SHOULDER.y);
    this.projectiles.push({ type: 'grenade', x0: SHOULDER.x, y0: SHOULDER.y - 10, x1, y1, t: 0, dur: 0.45 + dist / 1500, arc: 90 + dist * 0.18, spin: 0 });
    sfx.throw();
    this.onState('weapon');
  }

  armGrenade() {
    if (this.state !== 'night' || this.data.grenades <= 0) { sfx.empty(); return; }
    this.grenadeArmed = !this.grenadeArmed;
    sfx.click();
    this.onState('weapon');
  }

  explode(x, y, opts = {}) {
    const R = opts.radius || GRENADE.radius;
    const byPlayer = opts.byPlayer !== false;
    const base = (opts.dmg || GRENADE.dmg) * (byPlayer ? this.playerMul() : 1);
    for (const z of this.zombies) {
      if (!z.alive || z === opts.exclude) continue;
      const cy = z.foot - z.h * 0.4;
      const dist = Math.hypot(z.x - x, (cy - y) * 1.6);
      if (dist > R + z.w / 2) continue;
      const k = 1 - Math.min(1, dist / (R + z.w / 2));
      this.hitZombie(z, base * (0.4 + 0.6 * k), false, z.x, cy, Math.sign(z.x - x) || 1, byPlayer, { silent: true, kind: 'blast' });
      if (z.alive && !z.T.heavy) z.x += 45 * k * (Math.sign(z.x - x) || 1);
    }
    const fireCols = opts.toxic ? ['#c8f040', '#7fb020'] : ['#ffb030', '#ff6a10'];
    for (let i = 0; i < 26; i++) this.addParticle({ x, y: y - 6, vx: rand(-260, 260), vy: rand(-380, -60), life: rand(0.3, 0.7), color: fireCols[i % 2], size: rand(3, 7), g: 400, kind: 'fire' });
    for (let i = 0; i < 16; i++) this.addParticle({ x: x + rand(-30, 30), y: y - rand(0, 40), vx: rand(-50, 50), vy: rand(-70, -20), life: rand(1.2, 2.2), color: '60,55,55', size: rand(10, 20), kind: 'smoke' });
    for (let i = 0; i < 14; i++) this.addParticle({ x, y, vx: rand(-200, 200), vy: rand(-320, -120), life: 1.2, color: '#3a3226', size: rand(2, 4), g: 700, ground: y + rand(-8, 8) });
    this.lights.push({ x, y: y - 20, r: 420, life: 0.35, max: 0.35, color: opts.toxic ? '170,255,70' : '255,160,60', a: 0.6 });
    this.texts.push({ x, y: y - 70, text: 'BÙM!', life: 0.8, max: 0.8, size: 30, color: opts.toxic ? '#c8f040' : '#ffb030' });
    this.shake = Math.max(this.shake, 13);
    this.dctx.fillStyle = 'rgba(10,8,6,0.55)';
    const gy = clamp(y + 20, LANE_MIN, LANE_MAX);
    this.dctx.fillStyle = opts.toxic ? 'rgba(60,80,10,0.5)' : 'rgba(10,8,6,0.55)';
    this.dctx.beginPath(); this.dctx.ellipse(x, gy, 48, 12, 0, 0, Math.PI * 2); this.dctx.fill();
    sfx.explosion();
  }

  // ---------- Axit ----------
  spitAcid(z) {
    const b = z.boxes();
    this.projectiles.push({
      type: 'acid', x0: b.hx - b.hr, y0: b.hy + b.hr * 0.4, x1: BARRICADE_X - 2, y1: rand(BARRICADE_TOP + 15, LANE_MAX - 10),
      t: 0, dur: 1.0, arc: 110, dmg: z.T.dmg,
    });
    sfx.spit();
  }

  splashAcid(x, y, n, ground) {
    for (let i = 0; i < n; i++) this.addParticle({ x, y, vx: rand(-140, 60), vy: rand(-200, -20), life: rand(0.4, 0.9), color: Math.random() < 0.5 ? '#b6e83a' : '#7fb020', size: rand(2, 4), g: 500, ground: ground ?? LANE_MAX });
    this.lights.push({ x, y, r: 120, life: 0.25, max: 0.25, color: '160,255,60', a: 0.25 });
  }

  // ---------- Trùm ----------
  spawnBoss() {
    const z = new Zombie(bossTypeFor(this.data.night), this.wave.hpMul);
    this.zombies.push(z);
    this.boss = z;
    this.bossSpawned = true;
    this.texts.push({ x: W / 2, y: 190, text: `${z.T.name.toUpperCase()} ĐÃ XUẤT HIỆN`, life: 3, max: 3, size: 34, color: '#ff5a45' });
    this.bossRoar(z);
    setMood('boss');
  }

  bossRoar(z) {
    sfx.roar();
    this.shake = Math.max(this.shake, 7);
    if (z && z.T.summoner && z.alive && this.state === 'night') { // gọi đàn
      for (let i = 0; i < 3; i++) {
        const r = new Zombie('runner', this.wave.hpMul);
        r.x = z.x + 40 + i * 25;
        this.zombies.push(r);
        this.extraSpawns++;
      }
      this.texts.push({ x: z.x, y: z.foot - z.h - 20, text: 'GỌI ĐÀN!', life: 1.2, max: 1.2, size: 18, color: '#ff8a70' });
    }
  }

  bossDown(z) {
    this.shake = Math.max(this.shake, 16);
    sfx.explosion();
    for (let i = 0; i < 40; i++) this.addParticle({ x: z.x + rand(-30, 30), y: z.foot - rand(20, 180), vx: rand(-200, 240), vy: rand(-300, -40), life: rand(0.6, 1.3), color: '#6a0a0a', size: rand(3, 7), g: 600, ground: z.foot + rand(-8, 8), decal: true });
    this.texts.push({ x: z.x, y: z.foot - z.h - 30, text: `${z.T.name.toUpperCase()} ĐÃ GỤC!`, life: 2.5, max: 2.5, size: 28, color: '#ffcf4a' });
    this.boss = null;
    setMood('night');
  }

  damageBarricade(dmg, foot) {
    if (this.state !== 'night') return;
    this.data.hp -= dmg;
    this.stats.damage += dmg;
    this.shake = Math.max(this.shake, dmg > 15 ? 6 : 1.5);
    this.hurtFlash = Math.min(0.5, this.hurtFlash + dmg / 80);
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
  update(dtReal) {
    this.time += dtReal;
    const s = this.state;
    if (s === 'paused' || s === 'day') return;
    let dt = dtReal;
    if (this.slowT > 0) { this.slowT -= dtReal; dt *= 0.3; }

    this.updateWeather(dt);
    this.updateFx(dt);
    if (s === 'victory' || s === 'interlude') this.victoryT = (this.victoryT || 0) + dt;
    if (s === 'menu' || s === 'cutscene') { this.updateDemo(dt); return; }
    if (s !== 'night') return;
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
    if (this.wave.boss && !this.bossSpawned && this.spawned >= this.wave.total * 0.35) this.spawnBoss();

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

    this.updateSurvivors(dt);
    this.updateProjectiles(dt);
    if (this.state !== 'night') return;

    if (hasPerk(d, 'bao')) d.hp = Math.min(this.maxHp, d.hp + 1.6 * dt);
    if (this.time - this.lastKill > 1.6) this.streak = 0;
    const ratio = d.hp / this.maxHp;
    heartbeat(dtReal, ratio < 0.3 ? 1 - ratio / 0.3 : 0);

    // hết đêm?
    if (this.allSpawned() && this.zombies.every((z) => !z.alive)) {
      if (this.endTimer < 0) {
        this.endTimer = 3.2;
        this.texts.push({ x: W / 2, y: 230, text: 'TRỜI ĐÃ SÁNG!', life: 3, max: 3, size: 44, color: '#ffd77a' });
        sfx.dawn();
        heartbeat(0, 0);
      }
      this.endTimer -= dtReal;
      if (this.endTimer <= 0) this.endNight();
    }
  }

  updateSurvivors(dt) {
    for (const s of this.survivorState) {
      s.cd -= dt;
      s.recoil = Math.max(0, s.recoil - dt * 40);
      const targets = this.zombies.filter((z) => z.alive && z.x < W - 10);
      if (!targets.length) continue;
      const hunter = s.id === 'tu';
      // thợ săn ưu tiên mục tiêu nguy hiểm, người khác bắn con gần nhất
      targets.sort((a, b) => (hunter ? (b.T.reward - a.T.reward) || (a.x - b.x) : a.x - b.x));
      const t = targets[Math.min(targets.length - 1, hunter ? 0 : Math.floor(Math.random() * 2))];
      const b = t.boxes();
      const ty = Math.random() < (hunter ? 0.55 : 0.25) ? b.hy : (b.by0 + b.by1) / 2;
      const sx = s.x + 4, sy = PLAYER_FOOT - 80;
      s.ang = Math.atan2(ty - sy, (hunter ? b.hx : t.x) - sx);
      if (s.cd <= 0) {
        s.cd = hunter ? rand(1.4, 1.8) : rand(0.9, 1.5);
        s.recoil = 4;
        const miss = Math.random() < (hunter ? 0.1 : 0.3) ? rand(-0.06, 0.06) : 0;
        const ox = sx + Math.cos(s.ang) * 34, oy = sy + Math.sin(s.ang) * 34;
        this.castRay(ox, oy, s.ang + miss, hunter ? 44 : 22, 1, false, false);
        this.lights.push({ x: ox, y: oy, r: 150, life: 0.06, max: 0.06, color: '255,190,90', a: 0.2 });
        sfx.ally();
      }
    }
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      p.t += dt;
      p.spin = (p.spin || 0) + dt * 14;
      const k = Math.min(1, p.t / p.dur);
      p.x = p.x0 + (p.x1 - p.x0) * k;
      p.y = p.y0 + (p.y1 - p.y0) * k - p.arc * 4 * k * (1 - k);
      if (p.type === 'shell') this.addParticle({ x: p.x, y: p.y, vx: rand(-15, 15), vy: rand(-15, 5), life: 0.5, color: '170,170,170', size: 4, kind: 'smoke' });
      if (p.type === 'acid' && Math.random() < 0.5) {
        this.addParticle({ x: p.x, y: p.y, vx: rand(-10, 10), vy: rand(-10, 10), life: 0.3, color: '#9fd030', size: 2.5 });
      }
      if (k >= 1) {
        p.done = true;
        if (p.type === 'grenade') this.explode(p.x1, p.y1);
        else if (p.type === 'shell') this.explode(p.x1, p.y1, { radius: p.w.radius, dmg: p.w.dmg });
        else { this.splashAcid(p.x1, p.y1, 10, LANE_MAX); sfx.acid(); this.damageBarricade(p.dmg, LANE_MAX); }
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.done);
  }

  updateFx(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      p.vy += (p.g || 0) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.ground && p.y >= p.ground) {
        if (p.decal) {
          this.dctx.fillStyle = p.color === '#7a9a10' ? 'rgba(90,120,10,0.5)' : 'rgba(90,8,8,0.55)';
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
    for (const l of this.lights) l.life -= dt;
    this.lights = this.lights.filter((l) => l.life > 0);
    this.shake = Math.max(0, this.shake - dt * 25);
    this.flash = Math.max(0, this.flash - dt);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt * 1.5);
    if (this.titleCard) { this.titleCard.t -= dt; if (this.titleCard.t <= 0) this.titleCard = null; }
    if (this.hitMarker) { this.hitMarker.t -= dt; if (this.hitMarker.t <= 0) this.hitMarker = null; }
    if (this.comboShow) { this.comboShow.t -= dt; if (this.comboShow.t <= 0) this.comboShow = null; }
  }

  updateWeather(dt) {
    if (this.weather.rain) {
      for (const r of this.rain) {
        r.y += r.spd * dt;
        r.x -= r.spd * 0.18 * dt;
        if (r.y > H) { r.y = rand(-60, -10); r.x = rand(0, W + 200); }
      }
    }
    this.lightning = Math.max(0, this.lightning - dt * 2.2);
    if (this.weather.lightning) {
      this.nextLightning -= dt;
      if (this.nextLightning <= 0) {
        this.nextLightning = rand(7, 15);
        this.lightning = 1;
        this.bolt = this.makeBolt();
        setTimeout(() => sfx.thunder(), rand(200, 900));
      }
    }
  }

  makeBolt() {
    const pts = [];
    let x = rand(320, 900), y = 0;
    while (y < HORIZON - 40) {
      pts.push([x, y]);
      x += rand(-30, 30);
      y += rand(20, 45);
    }
    return pts;
  }

  // Màn hình tiêu đề: zombie kéo đến, nhân vật tự bắn
  updateDemo(dt) {
    this.demoTimer -= dt;
    const alive = this.zombies.filter((z) => z.alive);
    if (this.demoTimer <= 0 && alive.length < 6) {
      const types = ['walker', 'walker', 'runner', 'crawler'];
      this.zombies.push(new Zombie(types[Math.floor(Math.random() * types.length)], 1, true));
      const z = this.zombies[this.zombies.length - 1];
      z.targetX = BARRICADE_X + z.w / 2 + rand(-2, 10);
      this.demoTimer = rand(1.5, 3);
    }
    for (const z of this.zombies) z.update(dt, this);
    this.zombies = this.zombies.filter((z) => !(z.state === 'dead' && z.deadT > 5.5));
    this.recoil = Math.max(0, this.recoil - dt * 40);
    const target = alive.filter((z) => z.x < W - 120).sort((a, b) => a.x - b.x)[0];
    if (target) {
      const b = target.boxes();
      this.demoAim.x += (b.hx - this.demoAim.x) * Math.min(1, dt * 6);
      this.demoAim.y += (b.hy - this.demoAim.y) * Math.min(1, dt * 6);
      this.demoCd -= dt;
      if (this.demoCd <= 0 && Math.abs(this.demoAim.x - b.hx) < 12) {
        this.demoCd = rand(0.5, 1.1);
        this.shoot(this.aimAngle(this.demoAim) + rand(-0.015, 0.015), WEAPONS.pistol, 0, true);
        this.recoil = 6;
        sfx.ally();
      }
    }
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
    const inGame = this.data && (this.state === 'night' || this.state === 'paused' || this.state === 'gameover');
    ctx.save();
    if (this.shake > 0 && this.settings.shake) ctx.translate(rand(-1, 1) * this.shake, rand(-1, 1) * this.shake);
    ctx.drawImage(this.bg(), 0, 0);
    this.drawFog(ctx, 0.6);
    ctx.drawImage(this.decals, 0, 0);

    // nhân vật + hàng rào
    for (const s of this.survivorState) {
      drawPerson(ctx, s.x, PLAYER_FOOT - 4, s.ang, s.def.look, s.id === 'tu' ? 38 : 26, s.recoil);
    }
    const aim = inGame ? this.aim : this.demoAim;
    const wid = inGame ? this.data.current : (this.data ? 'rifle' : 'pistol');
    drawHero(ctx, PLAYER_X, PLAYER_FOOT, this.aimAngle(aim), wid, WEAPONS[wid].len, this.recoil * 0.6, this.time);
    const hpRatio = inGame ? clamp(this.data.hp / barricadeMax(this.data.barricadeLevel), 0, 1) : 1;
    drawBarricade(ctx, hpRatio, this.scene);

    const sorted = [...this.zombies].sort((a, b) => (a.alive - b.alive) || (a.foot - b.foot));
    for (const z of sorted) z.draw(ctx);

    for (const p of this.projectiles) {
      if (p.type === 'grenade') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.spin);
        ctx.fillStyle = '#3c4a2a'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#888'; ctx.fillRect(-2, -8, 4, 3);
        ctx.restore();
      } else {
        ctx.fillStyle = '#b6e83a';
        ctx.shadowColor = '#a0ff30'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (const p of this.particles) {
      const a = Math.min(1, (p.life / p.max) * 2);
      if (p.kind === 'smoke') {
        const k = 1 - p.life / p.max;
        ctx.fillStyle = `rgba(${p.color},${0.35 * (1 - k)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 + k * 2), 0, Math.PI * 2); ctx.fill();
      } else if (p.kind === 'flame') {
        const k = 1 - p.life / p.max;
        ctx.fillStyle = k < 0.3 ? `rgba(255,230,140,${0.8 - k})` : `rgba(255,${Math.round(150 - k * 120)},30,${0.75 * (1 - k)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.6 + k * 1.8), 0, Math.PI * 2); ctx.fill();
      } else if (p.kind === 'fire') {
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.life / p.max), 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
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

    // mưa
    if (this.weather.rain) {
      ctx.strokeStyle = 'rgba(170,185,230,0.32)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const r of this.rain) { ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - r.len * 0.18, r.y + r.len); }
      ctx.stroke();
    }

    // ánh sáng cộng dồn: chớp súng, vụ nổ, cửa sổ nhà
    ctx.globalCompositeOperation = 'lighter';
    const win = 0.12 + Math.sin(this.time * 7) * 0.02 + (Math.random() < 0.03 ? -0.06 : 0);
    if (this.scene === 'harbor') {
      this.drawLight(ctx, 40, 300, 90, '200,220,255', win * 0.9);
      // đèn hải đăng quét
      const a = this.time * 0.7;
      const reach = Math.cos(a);
      if (reach > 0) {
        const len = 520 * reach;
        const g = ctx.createLinearGradient(905, 216, 905 - len, 230);
        g.addColorStop(0, 'rgba(255,240,190,0.28)');
        g.addColorStop(1, 'rgba(255,240,190,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(905, 216); ctx.lineTo(905 - len, 190 + Math.sin(a) * 30); ctx.lineTo(905 - len, 250 + Math.sin(a) * 30); ctx.fill();
      }
      this.drawLight(ctx, 905, 216, 40, '255,240,190', 0.35);
    } else {
      this.drawLight(ctx, 27, 333, 70, '255,170,80', win);
    }
    for (const l of this.lights) this.drawLight(ctx, l.x, l.y, l.r, l.color, l.a * (l.life / l.max));
    ctx.globalCompositeOperation = 'source-over';

    // sét
    if (this.lightning > 0) {
      if (this.bolt && this.lightning > 0.55) {
        ctx.strokeStyle = `rgba(230,235,255,${this.lightning})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        this.bolt.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
      }
      const flick = this.lightning > 0.7 || (this.lightning > 0.3 && this.lightning < 0.4);
      ctx.fillStyle = `rgba(200,210,255,${flick ? this.lightning * 0.35 : this.lightning * 0.1})`;
      ctx.fillRect(-20, -20, W + 40, H + 40);
    }
    this.drawFog(ctx, 1);

    for (const t of this.texts) {
      ctx.globalAlpha = Math.min(1, (t.life / t.max) * 2.5);
      ctx.font = `600 ${t.size}px ${DISPLAY_FONT}`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // bình minh
    if (this.endTimer >= 0 && this.state === 'night') {
      const k = 1 - this.endTimer / 3.2;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, `rgba(255,170,90,${0.45 * k})`);
      g.addColorStop(0.7, `rgba(255,120,70,${0.18 * k})`);
      g.addColorStop(1, 'rgba(255,120,70,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    if (this.state === 'interlude') this.drawRescue(ctx);
    if (this.state === 'victory') this.drawShip(ctx);

    // viền tối + cảnh báo máu thấp
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
    if (inGame) {
      const danger = hpRatio < 0.3 ? (1 - hpRatio / 0.3) * (0.55 + Math.sin(this.time * 6) * 0.25) : 0;
      const red = Math.min(0.75, danger * 0.6 + this.hurtFlash);
      if (red > 0.01) {
        const rv = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.95);
        rv.addColorStop(0, 'rgba(160,0,0,0)');
        rv.addColorStop(1, `rgba(160,0,0,${red})`);
        ctx.fillStyle = rv;
        ctx.fillRect(0, 0, W, H);
      }
    }

    if (this.data && (this.state === 'night' || this.state === 'paused')) {
      this.drawCrosshair(ctx);
      this.drawHUD(ctx);
      this.drawTitleCard(ctx);
    }
  }

  // Cảnh kết: bình minh lên và trực thăng cứu hộ bay tới
  drawRescue(ctx) {
    const t = this.victoryT || 0;
    const k = Math.min(1, t / 6);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgba(255,150,90,${0.5 * k})`);
    g.addColorStop(0.75, `rgba(255,190,120,${0.3 * k})`);
    g.addColorStop(1, `rgba(80,40,30,${0.2 * k})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const p = Math.min(1, t / 7);
    const ease = 1 - Math.pow(1 - p, 3);
    const x = W + 130 - ease * 300, y = 250 + Math.sin(t * 1.6) * 5 - ease * 30;
    // đèn rọi
    ctx.globalCompositeOperation = 'lighter';
    const cone = ctx.createLinearGradient(x, y, x - 60, LANE_MAX);
    cone.addColorStop(0, 'rgba(255,245,210,0.35)');
    cone.addColorStop(1, 'rgba(255,245,210,0)');
    ctx.fillStyle = cone;
    ctx.beginPath(); ctx.moveTo(x - 18, y + 14); ctx.lineTo(x - 150, LANE_MAX); ctx.lineTo(x + 40, LANE_MAX); ctx.lineTo(x - 4, y + 14); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.06);
    ctx.fillStyle = '#16141c';
    ctx.beginPath(); ctx.ellipse(0, 0, 44, 17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(30, -6, 70, 8);
    ctx.fillRect(94, -18, 8, 22);
    ctx.fillStyle = 'rgba(140,190,230,0.55)';
    ctx.beginPath(); ctx.ellipse(-24, -3, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#16141c'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-26, 22); ctx.lineTo(26, 22); ctx.moveTo(-14, 14); ctx.lineTo(-16, 22); ctx.moveTo(14, 14); ctx.lineTo(16, 22); ctx.stroke();
    const blade = 70 * Math.abs(Math.cos(this.time * 30));
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-blade, -21); ctx.lineTo(blade, -21); ctx.stroke();
    ctx.fillRect(-3, -21, 6, 6);
    ctx.fillStyle = Math.sin(this.time * 8) > 0 ? '#ff3a2a' : '#3a0a0a';
    ctx.beginPath(); ctx.arc(100, -18, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Kết chương 2: tàu sơ tán cập cảng lúc bình minh
  drawShip(ctx) {
    const t = this.victoryT || 0;
    const k = Math.min(1, t / 6);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgba(255,140,80,${0.5 * k})`);
    g.addColorStop(0.65, `rgba(255,200,130,${0.32 * k})`);
    g.addColorStop(1, `rgba(60,40,40,${0.2 * k})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // mặt trời mọc trên biển
    ctx.fillStyle = `rgba(255,170,90,${0.8 * k})`;
    ctx.beginPath(); ctx.arc(330, 336 - k * 18, 30, Math.PI, 0); ctx.fill();
    const p = Math.min(1, t / 8);
    const ease = 1 - Math.pow(1 - p, 3);
    const x = W + 200 - ease * 420, y = 334 + Math.sin(t * 0.9) * 1.5;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#15141c';
    ctx.beginPath(); ctx.moveTo(-150, -10); ctx.lineTo(140, -10); ctx.lineTo(118, 6); ctx.lineTo(-136, 6); ctx.fill();
    ctx.fillRect(-90, -30, 120, 20);
    ctx.fillRect(-60, -48, 70, 18);
    ctx.fillRect(-20, -78, 14, 30);
    ctx.fillStyle = '#9a2a22'; ctx.fillRect(-20, -78, 14, 7);
    ctx.fillStyle = 'rgba(255,220,140,0.85)';
    for (let i = 0; i < 9; i++) ctx.fillRect(-84 + i * 12, -24, 5, 4);
    for (let i = 0; i < 5; i++) ctx.fillRect(-54 + i * 12, -42, 5, 4);
    ctx.restore();
    // khói ống khói
    if (Math.random() < 0.3) this.addParticle({ x: x - 13, y: y - 80, vx: rand(10, 30), vy: rand(-30, -15), life: 2.5, color: '70,60,60', size: rand(6, 10), kind: 'smoke' });
  }

  drawLight(ctx, x, y, r, color, a) {
    if (a <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${color},${a})`);
    g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  drawFog(ctx, layer) {
    const f = this.weather.fog * (layer < 1 ? 0.7 : 0.5);
    if (f <= 0) return;
    for (let i = 0; i < 3; i++) {
      const x = ((this.time * (12 + i * 7) * (layer < 1 ? 0.6 : 1) + i * 380) % (W + 600)) - 300;
      const y = layer < 1 ? HORIZON - 10 + i * 8 : LANE_MAX - 20 + i * 10;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 280);
      g.addColorStop(0, `rgba(150,140,175,${f})`);
      g.addColorStop(1, 'rgba(150,140,175,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 280, y - 90, 560, 180);
    }
  }

  drawCrosshair(ctx) {
    const { x, y } = this.aim;
    if (this.grenadeArmed) {
      const gx = clamp(x, 290, 900), gy = clamp(y, LANE_MIN, LANE_MAX);
      ctx.strokeStyle = 'rgba(255,170,60,0.85)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(gx, gy, GRENADE.radius, GRENADE.radius * 0.35, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = `600 13px ${DISPLAY_FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffb040';
      ctx.fillText('CHẠM ĐỂ NÉM LỰU ĐẠN', gx, gy - GRENADE.radius * 0.35 - 10);
      return;
    }
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
    if (this.hitMarker) {
      const hm = this.hitMarker;
      ctx.strokeStyle = hm.kill ? (hm.head ? '#ff4a3a' : '#ffcf4a') : 'rgba(255,255,255,0.9)';
      ctx.lineWidth = hm.kill ? 3 : 2;
      const a = 5, b = 12;
      ctx.beginPath();
      ctx.moveTo(x - b, y - b); ctx.lineTo(x - a, y - a);
      ctx.moveTo(x + b, y - b); ctx.lineTo(x + a, y - a);
      ctx.moveTo(x - b, y + b); ctx.lineTo(x - a, y + a);
      ctx.moveTo(x + b, y + b); ctx.lineTo(x + a, y + a);
      ctx.stroke();
    }
    if (reloading) {
      const k = 1 - this.reloadT / this.reloadTotal;
      ctx.strokeStyle = 'rgba(255,180,80,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, gap + 14, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2);
      ctx.stroke();
    } else if (this.weaponState.mag === 0 && Math.sin(this.time * 10) > -0.3) {
      ctx.font = `600 13px ${DISPLAY_FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff6b5a';
      ctx.fillText(this.canReload() ? 'HẾT ĐẠN · NẠP (R)' : 'HẾT ĐẠN · ĐỔI SÚNG', x, y + gap + 28);
    }
  }

  drawHUD(ctx) {
    const d = this.data;
    const max = barricadeMax(d.barricadeLevel);
    const ratio = clamp(d.hp / max, 0, 1);
    ctx.fillStyle = 'rgba(8,8,14,0.62)';
    roundRect(ctx, 12, 12, 284, 80, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,190,120,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.font = `600 20px ${DISPLAY_FONT}`;
    ctx.fillStyle = '#efdcae';
    const label = d.night <= CAMPAIGN_NIGHTS && !d.endless ? `ĐÊM ${d.night}/${CAMPAIGN_NIGHTS} · CH.${actFor(d.night)}` : `ĐÊM ${d.night} · VÔ TẬN`;
    ctx.fillText(label, 24, 38);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#9fe07a';
    ctx.fillText(`$${d.cash}`, 284, 38);
    // thanh hàng rào
    ctx.fillStyle = '#2a1a1a';
    roundRect(ctx, 24, 47, 260, 16, 3); ctx.fill();
    ctx.fillStyle = ratio > 0.5 ? '#5aa64a' : ratio > 0.25 ? '#d9a33a' : '#d94040';
    roundRect(ctx, 24, 47, Math.max(4, 260 * ratio), 16, 3); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '700 11px "Be Vietnam Pro", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`HÀNG RÀO  ${Math.ceil(d.hp)} / ${max}`, 154, 59);
    // tiến độ đợt
    const total = this.wave.total + (this.wave.boss ? 1 : 0) + this.extraSpawns;
    const k = Math.min(1, this.stats.kills / total);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(24, 72, 190, 6);
    ctx.fillStyle = '#c0503a';
    ctx.fillRect(24, 72, 190 * k, 6);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#d9b0a0';
    ctx.font = '600 11px "Be Vietnam Pro", system-ui, sans-serif';
    ctx.fillText(`Còn ${Math.max(0, total - this.stats.kills)} zombie`, 222, 79);

    // combo
    if (this.comboShow) {
      const c = this.comboShow;
      const pop = 1 + Math.max(0, c.t - 1.1) * 3;
      ctx.save();
      ctx.globalAlpha = Math.min(1, c.t * 2);
      ctx.translate(W / 2, 110);
      ctx.scale(pop, pop);
      ctx.font = `700 26px ${DISPLAY_FONT}`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.strokeText(`${c.n} LIÊN TIẾP!`, 0, 0);
      ctx.fillStyle = '#ffcf4a';
      ctx.fillText(`${c.n} LIÊN TIẾP!`, 0, 0);
      ctx.restore();
    }

    // thanh máu trùm
    if (this.boss && this.boss.alive) {
      const bw = 420, bx = W / 2 - bw / 2, by = 30;
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(bx - 4, by - 18, bw + 8, 34);
      ctx.font = `600 14px ${DISPLAY_FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff8a70';
      ctx.fillText(this.boss.T.name.toUpperCase(), W / 2, by - 3);
      ctx.fillStyle = '#3a0c0c';
      ctx.fillRect(bx, by + 2, bw, 10);
      ctx.fillStyle = '#d93a2a';
      ctx.fillRect(bx, by + 2, bw * Math.max(0, this.boss.hp / this.boss.maxHp), 10);
    }
  }

  drawTitleCard(ctx) {
    const c = this.titleCard;
    if (!c) return;
    const t = c.max - c.t;
    const a = Math.min(1, t / 0.6, c.t / 0.8);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 170, W, 110);
    ctx.textAlign = 'center';
    ctx.font = `700 54px ${DISPLAY_FONT}`;
    ctx.fillStyle = this.weather.bloodMoon ? '#ff5a45' : '#efdcae';
    ctx.fillText(c.title, W / 2, 232 - (1 - a) * 10);
    ctx.font = 'italic 500 16px "Be Vietnam Pro", system-ui, sans-serif';
    ctx.fillStyle = '#d8ccb4';
    ctx.fillText(c.sub, W / 2, 262);
    ctx.restore();
  }
}
