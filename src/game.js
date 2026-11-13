import {
  W, H, HORIZON, SHOULDER, PLAYER_X, PLAYER_FOOT, BARRICADE_X, BARRICADE_TOP, LANE_MIN, LANE_MAX,
  WEAPONS, WEAPON_ORDER, HEADSHOT_MUL, SURVIVOR_SLOTS, GRENADE, CAMPAIGN_NIGHTS, ACT_LENGTH,
  waveFor, weatherFor, barricadeMax, reloadMul, actFor, bossTypeFor, dmgMul,
  sceneFor, stageFor, bossCountFor, STAGE_LENGTH, CAMP_INCOME, mateLevel,
  diffOf, UPKEEP, TURRET, MINE, WIRE, nextThreat, eliteChance, SHOCKER, FLAME_TURRET, MORTAR, TESLA_TOWER, DRONE, SAW, SNIPER_NEST, GAS, ROCKET,
} from './config.js';
import { SURVIVORS, NIGHT_TITLES, MATE_COMBAT, hasPerk } from './story.js';
import { Zombie, roundRect, shade as shadeHex } from './zombie.js';
import { makeBackground, drawBarricade, drawHero, drawCharacter, CHARACTERS } from './render.js';
import { sfx, initAudio, setMood, heartbeat, reloadSound, cancelReload } from './audio.js';
import { saveGame } from './save.js';
import { drawShot } from './cine.js';
import { L } from './i18n.js';
import { PixelFx, PFX_PAL } from './pfx.js';

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const MAX_PARTICLES = 700;
const DISPLAY_FONT = 'Oswald, Impact, "Arial Narrow", sans-serif';
const MENU_WEATHER = { rain: true, lightning: true, fog: 0.18, bloodMoon: false };

// sát thương đến từ công trình phòng thủ (để áp kỹ năng của Minh)
const DEF_SRC = new Set(['turret', 'flame', 'tesla', 'drone', 'shock', 'saw', 'sniperNest', 'gas', 'wire']);

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
    this.cine = null;
    this.ambT = 6;
    this.splat = 0;
    this.motes = Array.from({ length: 46 }, () => ({ x: rand(0, W), y: rand(0, H), s: rand(0.6, 1.6), p: rand(0, 6) }));
    this.grain = makeGrain();
    this.splats = Array.from({ length: 9 }, (_, i) => ({ x: i % 2 ? rand(0, 140) : rand(W - 140, W), y: rand(0, H), r: rand(30, 70) }));
    this.lightning = 0;
    this.bolt = null;
    this.resetNightState();
    this.bindInput();
  }

  resetNightState() {
    this.zombies = [];
    this.particles = [];
    this.gibs = [];
    this.rings = [];
    this.pfx = new PixelFx(); // hiệu ứng pixel art (pixelfx)
    this.lastSpark = 0;
    this.onLang = () => { this.bgs = {}; }; // đổi ngôn ngữ thì vẽ lại biển báo trên nền
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
    this.stats = { kills: 0, headshots: 0, earned: 0, bestStreak: 0, damage: 0, combo: 0, crates: 0, injured: [] };
    this.extraSpawns = 0;
    this.drones = [];
    this.turrets = [];
    this.mines = [];
    this.crates = [];
    this.rings = [];
    this.bolts = [];
    this.bosses = [];
    this.bossesSpawned = 0;
    this.bountySpawned = false;
    this.dropTimes = [];
    this.nightT = 0;
    this.mods = {};
    if (this.pfx) this.pfx.clear();
    this.gibs = [];
    this.rings = [];
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
        else if (k === '0') this.switchWeapon(WEAPON_ORDER[9]);
        else if (k === '-') this.switchWeapon(WEAPON_ORDER[10]);
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

  // Cắt cảnh minh hoạ cho phim cốt truyện
  setShot(id) {
    if (!id) { this.cine = null; return; }
    if (!this.cine || this.cine.id !== id) this.cine = { id, t: 0 };
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
    this.scene = sceneFor(d.night);
    this.mods = this.wave.mods || {};
    // mức đe doạ thích nghi với hỏa lực người chơi
    const th = this.wave.grace || this.wave.settle ? Math.min(1, d.threat || 1) : d.threat || 1; // khởi động: không áp mức đe doạ
    this.threat = th;
    this.wave.total = Math.round(this.wave.total * diffOf(d).count * (1 + (th - 1) * 0.55));
    this.wave.hpMul *= 1 + (th - 1) * 0.7;
    this.wave.interval /= 1 + (th - 1) * 0.5;
    this.wave.speedMul = (this.wave.speedMul || 1) * (1 + (th - 1) * 0.12);
    this.spawnTimer = 2.5;
    // công trình phòng thủ
    this.shock = { t: 1, zapT: 0 };
    this.flameT = { heat: 0, cool: 0, ang: 0 };
    this.mortarT = 2;
    this.teslaT = 1;
    this.sawT = 0; this.sawAng = 0;
    this.sniperT = 1.5; this.sniperAim = null;
    this.gasT = 3; this.clouds = [];
    this.rocketT = 3;
    this.drones = Array.from({ length: Math.min(d.drones || 0, DRONE.max) }, (_, i) => ({ x: 300 + i * 140, y: 230 - i * 20, cd: 0.5, ammo: DRONE.mag, reload: 0, ph: i * 2 }));
    this.turrets = Array.from({ length: Math.min(d.turrets || 0, TURRET.max) }, (_, i) => ({ ...TURRET.slots[i], ang: Math.PI * 0.02, cd: 0.5, heat: 0, overheat: 0, recoil: 0 }));
    this.mines = Array.from({ length: d.mines || 0 }, (_, i) => ({ x: 300 + ((i * 47) % 260) + rand(-10, 10), y: rand(LANE_MIN + 4, LANE_MAX - 4) }));
    d.mines = 0;
    // lịch thả dù tiếp tế trong đêm
    const span = Math.max(30, this.wave.total * this.wave.interval);
    const drops = (this.mods.airdrops || 0) + (hasPerk(d, 'ngoc') ? 1 : 0);
    for (let i = 0; i < drops; i++) this.dropTimes.push(8 + (span * (i + 0.5)) / drops + rand(-4, 4));
    this.maxHp = barricadeMax(d.barricadeLevel);
    for (const id of Object.keys(d.weapons)) {
      // đầu đêm: nạp đầy băng từ kho đạn
      const w = WEAPONS[id], st = d.weapons[id];
      const need = w.mag - st.mag;
      const take = w.infinite ? need : Math.min(need, st.reserve);
      st.mag += take;
      if (!w.infinite) st.reserve -= take;
    }
    const squad = (d.squad || d.crew.slice(0, 4)).filter((id) => d.crew.includes(id) && !(d.mates[id]?.injured > 0));
    squad.slice(0, SURVIVOR_SLOTS.length).forEach((id, i) => {
      const def = SURVIVORS.find((s) => s.id === id);
      const lvl = mateLevel(d.mates[id]?.xp || 0);
      this.survivorState.push({ id, def, combat: MATE_COMBAT[id], lvl, x: SURVIVOR_SLOTS[i], cd: rand(0.5, 1.5), ang: 0, recoil: 0, burst: 0 });
    });
    const sub = d.night <= CAMPAIGN_NIGHTS ? NIGHT_TITLES[d.night] : (this.wave.boss ? L("Trăng máu lại lên. Một con trùm khác đang đến.", "The blood moon rises again. Another boss is coming.") : L("Chúng không bao giờ ngừng lại.", "They never stop."));
    const stage = stageFor(d.night);
    const local = d.night - (stage - 1) * STAGE_LENGTH;
    this.titleCard = { title: d.night <= CAMPAIGN_NIGHTS && !d.endless ? L(`MÀN ${stage} · ĐÊM ${local}`, `STAGE ${stage} · NIGHT ${local}`) : L(`ĐÊM ${d.night}`, `NIGHT ${d.night}`), sub, t: 4, max: 4 };
    if (d.hungry) this.texts.push({ x: W / 2, y: 300, text: L("CẢ NHÓM ĐANG ĐÓI · NẠP ĐẠN CHẬM, BẮN RUNG TAY", "THE GROUP IS HUNGRY · SLOW RELOADS, SHAKY AIM"), life: 4, max: 4, size: 16, color: '#ff9a6a' });
    sfx.sting();
    setMood('night');
    this.setState('night');
  }

  pause() { if (this.state === 'night') { this.firing = false; this.setState('paused'); } }
  resume() { if (this.state === 'paused') this.setState('night'); }

  endNight() {
    const d = this.data;
    const df = diffOf(d);
    const bonus = Math.round((100 + d.night * 30) * df.reward);
    d.cash += bonus;
    d.mines = (d.mines || 0) + this.mines.filter((m) => !m.done).length; // mìn chưa nổ được thu lại
    // hồi phục thương tích, thu nhập từ người ở trại, kỹ năng buổi sáng
    for (const id of Object.keys(d.mates)) if (d.mates[id].injured > 0 && !this.stats.injured.includes(id)) d.mates[id].injured--;
    const squad = d.squad || [];
    const campers = d.crew.filter((id) => !squad.includes(id) && !(d.mates[id]?.injured > 0));
    const campIncome = Math.round(campers.length * CAMP_INCOME * (1 + d.night * 0.04));
    d.cash += campIncome;
    // cả nhóm phải ăn: thiếu đồ hộp thì bị đói, chiến đấu kém đi
    const eat = 1 + d.crew.length + (df.upkeep > 1.2 ? 1 : 0);
    const upkeep = 0;
    d.food = (d.food ?? 8) - eat + (hasPerk(d, 'thao') ? 2 : 0);
    d.hungry = d.food < 0;
    if (d.food < 0) d.food = 0;
    if (hasPerk(d, 'tuan')) d.hp = Math.min(barricadeMax(d.barricadeLevel), d.hp + barricadeMax(d.barricadeLevel) * 0.1);
    let extraGrenade = false;
    if (hasPerk(d, 'hung') && d.grenades < GRENADE.max) { d.grenades++; extraGrenade = true; }
    const before = d.threat || 1;
    if (!this.wave.grace) d.threat = nextThreat(d, this.stats.damage / this.maxHp);
    const info = { night: d.night, bonus, campIncome, upkeep, eat, hungry: d.hungry, campers: campers.length, extraGrenade, threat: d.threat, threatBefore: before, dmgPct: Math.round((this.stats.damage / this.maxHp) * 100), ...this.stats };
    const wasFinale = d.night === CAMPAIGN_NIGHTS && !d.endless;
    const transition = !d.endless && d.night < CAMPAIGN_NIGHTS && d.night % ACT_LENGTH === 0 ? d.night : 0;
    d.night += 1;
    d.dayUsed = false;
    saveGame(d);
    setMood('day');
    if (wasFinale || transition) { this.weather = { rain: false, lightning: false, fog: 0.1, bloodMoon: false }; this.victoryT = 0; }
    this.interKind = { 10: 'heli', 20: 'ship', 40: 'broadcast', 80: 'heli' }[transition] || 'dawn';
    info.transition = transition;
    this.setState(wasFinale ? 'victory' : transition ? 'interlude' : 'day', info);
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
    if (this.reloadT > 0) cancelReload();
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
    this.reloadTotal = this.weapon.reload * reloadMul(this.data.reloadLevel) * (this.data.hungry ? 1.3 : 1);
    this.reloadT = this.reloadTotal;
    reloadSound(this.data.current, this.reloadTotal);
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
    const bloom = (w.auto && this.firing ? Math.min(this.recoil * 0.004, 0.04) : 0) + (this.data.hungry ? 0.02 : 0);
    if (w.flame) this.flame(ang, w);
    else if (w.explosive) this.launch(ang, w);
    else if (w.chain) this.tesla(ang, w);
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
      this.castRay(ox, oy, a, w.dmg, w.pierce, w.falloff, byPlayer, null, !!w.heavyTracer, w.rail ? 'blast' : 'bullet');
      if (w.rail) { this.lights.push({ x: ox + Math.cos(a) * 200, y: oy + Math.sin(a) * 200, r: 260, life: 0.12, max: 0.12, color: '120,220,255', a: 0.45 }); this.shake = Math.max(this.shake, 9); }
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
    const near = new Map();
    for (let i = 0; i < 3; i++) {
      const a = ang + (i - 1) * w.spread * 0.8;
      const dx = Math.cos(a), dy = Math.sin(a);
      for (const z of this.zombies) {
        if (!z.alive) continue;
        const h = z.rayHit(ox, oy, dx, dy);
        if (h && h.t <= w.range && (!near.has(z) || h.t < near.get(z))) near.set(z, h.t);
      }
    }
    // lửa chỉ liếm tới vài con đầu tiên, những con phía sau được che
    const hit = [...near.entries()].sort((p, q) => p[1] - q[1]).slice(0, w.pierce).map((e) => e[0]);
    for (const z of hit) {
      if (w.cryo) z.freezeT = w.freeze; // đông cứng: chậm hẳn, chịu thêm sát thương
      else { z.burnT = 3; z.burnDps = w.burn * mul; }
      this.hitZombie(z, w.dmg * mul, false, z.x, z.foot - z.h * 0.5, 1, true, { silent: true, kind: w.cryo ? 'cold' : 'fire', noFx: true });
    }
    for (let i = 0; i < 3; i++) {
      const a = ang + (Math.random() - 0.5) * w.spread * 2.2;
      const sp = rand(420, 560);
      if (w.cryo) this.addParticle({ x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, life: w.range / sp, color: '200,235,255', size: rand(4, 7), kind: 'smoke' });
      else this.addParticle({ x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, life: w.range / sp, color: '', size: rand(5, 9), kind: 'flame' });
    }
    this.lights.push({ x: ox + Math.cos(ang) * 120, y: oy + Math.sin(ang) * 120, r: 240, life: 0.08, max: 0.08, color: w.cryo ? '160,220,255' : '255,140,40', a: 0.22 });
  }

  // Súng điện: tia sét trúng con đầu tiên rồi nhảy sang những con gần nhau
  tesla(ang, w) {
    const { x: ox, y: oy } = this.muzzlePos(ang, w);
    const dx = Math.cos(ang), dy = Math.sin(ang);
    let first = null, bestT = 1e9;
    for (const z of this.zombies) {
      if (!z.alive) continue;
      const h = z.rayHit(ox, oy, dx, dy);
      if (h && h.t < bestT) { bestT = h.t; first = z; }
    }
    const pts = [[ox, oy]];
    if (!first) {
      pts.push([ox + dx * 260, oy + dy * 260]);
    } else {
      const chain = [first];
      while (chain.length < w.chain) {
        const last = chain[chain.length - 1];
        let next = null, bd = w.chainRange;
        for (const z of this.zombies) {
          if (!z.alive || chain.includes(z)) continue;
          const d = Math.hypot(z.x - last.x, z.foot - last.foot);
          if (d < bd) { bd = d; next = z; }
        }
        if (!next) break;
        chain.push(next);
      }
      const mul = this.playerMul();
      chain.forEach((z, i) => {
        const b = z.boxes();
        pts.push([z.x, (b.by0 + b.hy) / 2 + 10]);
        this.hitZombie(z, w.dmg * mul * (1 - 0.08 * i), false, z.x, b.by0 + 10, 1, true, { silent: i > 0, kind: 'blast' });
        if (z.alive && !z.T.boss) z.stunT = Math.max(z.stunT, 0.08); // giật tê liệt chốc lát
      });
    }
    this.bolts.push({ pts, life: 0.12, max: 0.12 });
    this.flash = 0.05;
    this.muzzle = { x: ox, y: oy, a: ang, big: false };
    this.lights.push({ x: ox, y: oy, r: 200, life: 0.08, max: 0.08, color: '120,200,255', a: 0.35 });
    if (first) this.lights.push({ x: first.x, y: first.foot - 60, r: 160, life: 0.1, max: 0.1, color: '120,200,255', a: 0.3 });
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

  castRay(ox, oy, a, dmg, pierce, falloff, byPlayer, src = null, heavy = false, kind = 'bullet') {
    if (byPlayer) dmg *= this.playerMul();
    const dx = Math.cos(a), dy = Math.sin(a);
    if (byPlayer) this.shootCrates(ox, oy, dx, dy);
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
      this.hitZombie(h.z, d, h.head, ox + dx * h.t, oy + dy * h.t, dx, byPlayer, { src, kind });
      if (++n >= pierce) { endT = h.t; break; }
    }
    if (n === 0 && dy > 0 && endT < 1300) {
      const gx = ox + dx * endT, gy = oy + dy * endT;
      for (let i = 0; i < 4; i++) this.addParticle({ x: gx, y: gy, vx: rand(-40, 40), vy: rand(-90, -30), life: 0.4, color: '#6b6250', size: 2, g: 300 });
    }
    this.tracers.push({ x0: ox, y0: oy, x1: ox + dx * endT, y1: oy + dy * endT, life: heavy ? 0.14 : 0.07, max: heavy ? 0.14 : 0.07, w: heavy ? 3.5 : byPlayer ? 2 : 1.4 });
  }

  // ---------- Thả dù tiếp tế ----------
  spawnCrate() {
    this.crates.push({ x: rand(340, 860), y: -40, vy: 42, ground: rand(LANE_MIN, LANE_MAX - 6), landed: false, life: 9, sway: rand(0, 6) });
    this.texts.push({ x: W / 2, y: 150, text: L("TIẾP TẾ ĐANG RƠI · BẮN VÀO THÙNG!", "SUPPLIES INCOMING · SHOOT THE CRATE!"), life: 2, max: 2, size: 18, color: '#9fd8ff' });
    sfx.plane();
  }

  shootCrates(ox, oy, dx, dy) {
    for (const c of this.crates) {
      if (c.opened) continue;
      const x0 = c.x - 13, x1 = c.x + 13, y0 = c.y - 24, y1 = c.y;
      let tmin = -1e9, tmax = 1e9;
      if (Math.abs(dx) > 1e-9) { const a = (x0 - ox) / dx, b = (x1 - ox) / dx; tmin = Math.max(tmin, Math.min(a, b)); tmax = Math.min(tmax, Math.max(a, b)); }
      if (Math.abs(dy) > 1e-9) { const a = (y0 - oy) / dy, b = (y1 - oy) / dy; tmin = Math.max(tmin, Math.min(a, b)); tmax = Math.min(tmax, Math.max(a, b)); }
      if (tmax >= tmin && tmax > 0) this.openCrate(c);
    }
  }

  openCrate(c) {
    const d = this.data;
    c.opened = true;
    this.stats.crates++;
    const owned = WEAPON_ORDER.filter((id) => d.weapons[id] && !WEAPONS[id].infinite);
    const roll = Math.random();
    let text;
    if (roll < 0.4 && owned.length) {
      const id = d.weapons[d.current] && !WEAPONS[d.current].infinite ? d.current : owned[Math.floor(Math.random() * owned.length)];
      const amt = Math.ceil(WEAPONS[id].ammoPack * 0.6);
      d.weapons[id].reserve += amt;
      text = L(`+${amt} ĐẠN ${WEAPONS[id].name.toUpperCase()}`, `+${amt} ${WEAPONS[id].name.toUpperCase()} AMMO`);
    } else if (roll < 0.6 && d.grenades < GRENADE.max) {
      d.grenades = Math.min(GRENADE.max, d.grenades + 2);
      text = L("+2 LỰU ĐẠN", "+2 GRENADES");
      this.onState('weapon');
    } else if (roll < 0.8) {
      const amt = Math.round(this.maxHp * 0.12);
      d.hp = Math.min(this.maxHp, d.hp + amt);
      text = L(`+${amt} ĐỘ BỀN RÀO`, `+${amt} BARRICADE`);
    } else {
      const amt = Math.round(rand(180, 360) * (1 + d.night * 0.05));
      d.cash += amt;
      this.stats.earned += amt;
      text = `+$${amt}`;
    }
    this.texts.push({ x: c.x, y: c.y - 40, text, life: 1.6, max: 1.6, size: 17, color: '#9fd8ff' });
    for (let i = 0; i < 14; i++) this.addParticle({ x: c.x, y: c.y - 12, vx: rand(-160, 160), vy: rand(-240, -60), life: 1, color: i % 2 ? '#8a6a3a' : '#c8a060', size: rand(2, 4), g: 600, ground: c.ground });
    this.lights.push({ x: c.x, y: c.y - 12, r: 140, life: 0.3, max: 0.3, color: '160,220,255', a: 0.35 });
    sfx.buy();
  }

  // ---------- Kẻ rú / kẻ mang hòm / tái sinh ----------
  scream(z) {
    const b = z.boxes();
    this.rings.push({ x: b.hx, y: b.hy, r: 10, life: 0.9, max: 0.9 });
    for (const o of this.zombies) if (o.alive && o !== z && Math.abs(o.x - z.x) < 320) o.buffT = 4;
    sfx.scream();
  }

  spawnBounty() {
    const z = this.mk('bounty');
    this.zombies.push(z);
    this.extraSpawns++;
    this.bountySpawned = true;
    this.texts.push({ x: W / 2, y: 160, text: L("KẺ MANG HÒM XUẤT HIỆN · HẠ NÓ TRƯỚC KHI NÓ CHẠY!", "A THIEF APPEARED · KILL IT BEFORE IT ESCAPES!"), life: 2.5, max: 2.5, size: 18, color: '#ffcf4a' });
  }

  bountyEscaped(z) {
    if (z.escaped) return;
    z.escaped = true;
    z.state = 'dead';
    z.deadT = 99;
    this.extraSpawns--;
    this.texts.push({ x: W / 2, y: 160, text: L("Kẻ mang hòm đã trốn thoát...", "The thief got away..."), life: 2, max: 2, size: 16, color: '#d9b0a0' });
  }

  onRevive(z) {
    this.texts.push({ x: z.x, y: z.foot - z.h - 8, text: L("ĐỨNG DẬY!", "IT GOT UP!"), life: 1, max: 1, size: 14, color: '#c0e0a0' });
    sfx.groan();
  }

  anyAlive() { return this.zombies.some((z) => z.alive || z.reviveT > 0); }

  // ---------- Đồng đội bị thương ----------
  injureMate(chance) {
    if (Math.random() > chance) return;
    const pool = this.survivorState.filter((s) => !s.injured);
    if (!pool.length) return;
    const s = pool[Math.floor(Math.random() * pool.length)];
    const d = this.data;
    s.injured = true;
    let nights = 3;
    if (hasPerk(d, 'lan') && s.id !== 'lan') nights--;
    if (hasPerk(d, 'khoa') && s.id !== 'khoa') nights--;
    d.mates[s.id] = { ...(d.mates[s.id] || { xp: 0 }), injured: Math.max(1, nights) };
    this.stats.injured.push(s.id);
    this.texts.push({ x: s.x + 20, y: PLAYER_FOOT - 120, text: L(`${s.def.name.toUpperCase()} BỊ THƯƠNG!`, `${s.def.name.toUpperCase()} IS INJURED!`), life: 2, max: 2, size: 15, color: '#ff6a5a' });
    sfx.hurt();
  }

  hitZombie(z, dmg, head, x, y, dx, byPlayer, opts = {}) {
    if (!z.alive) return;
    if (opts.src && DEF_SRC.has(opts.src) && hasPerk(this.data, 'minh')) dmg *= 1.25;
    if (!head && (opts.kind || 'bullet') === 'bullet' && z.isLegShot(y)) dmg *= 0.7;
    const res = z.hurt(dmg, head, this, opts.kind || 'bullet');
    const killed = res === true;
    // bắn trúng tay / chân đủ đau thì rụng; nổ lớn xé xác
    if (res !== 'shield' && !head && (opts.kind || 'bullet') === 'bullet') z.limbHit(dmg, y, this);
    else if (opts.kind === 'blast' && killed && dmg >= 80 && Math.random() < 0.55) z.blastLimbs(this);
    if (res === 'shield') {
      for (let i = 0; i < 4; i++) this.addParticle({ x, y, vx: rand(20, 140), vy: rand(-120, 0), life: 0.25, color: '#ffe8a0', size: 2 });
      if (Math.random() < 0.15) this.texts.push({ x: z.x, y: z.foot - z.h - 6, text: L("KHIÊN! BẮN VÀO ĐẦU", "SHIELD! AIM FOR THE HEAD"), life: 0.8, max: 0.8, size: 12, color: '#c8d8f0' });
      if (!opts.silent) sfx.ricochet();
      return;
    }
    if (res === 'revive') this.texts.push({ x: z.x, y: z.foot - z.h - 6, text: L("NÓ SẼ ĐỨNG DẬY…", "IT WILL GET UP…"), life: 1, max: 1, size: 12, color: '#c0e0a0' });
    if (res === 'helmet') {
      this.texts.push({ x: z.x, y: z.foot - z.h - 6, text: L("VỠ MŨ!", "HELMET CRACKED!"), life: 0.8, max: 0.8, size: 14, color: '#9fc8ff' });
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
    this.onKill(z, head, byPlayer, true, opts.src);
  }

  burnTick(z, dmg) {
    if (!z.alive) return;
    if (Math.random() < 0.15) this.addParticle({ x: z.x + rand(-8, 8), y: z.foot - z.h * rand(0.2, 0.8), vx: rand(-10, 10), vy: rand(-60, -30), life: 0.5, color: '', size: rand(3, 6), kind: 'flame' });
    this.hitZombie(z, dmg, false, z.x, z.foot - z.h / 2, 1, true, { silent: true, kind: 'fire', noFx: true });
  }

  onKill(z, head, byPlayer, rewarded = true, src = null) {
    if (head) {
      const b = z.boxes();
      if (this.time - this.lastSpark > 0.08) { this.lastSpark = this.time; this.pfx.spawn('spark', b.hx - 10, b.hy + 10, { height: 4 }); }
      for (let i = 0; i < 18; i++) this.addParticle({ x: b.hx, y: b.hy, vx: rand(-120, 160), vy: rand(-280, -40), life: rand(0.5, 1.1), color: '#7a0b0b', size: rand(2, 5), g: 600, ground: z.foot + rand(-6, 6), decal: true });
    }
    if (z.T.ranged) { this.splashAcid(z.x, z.foot - z.h * 0.45, 14, z.foot); this.pfx.spawn('acid', z.x, z.foot); }
    if (z.T.bomber && !z.burst) this.bloaterBurst(z, false);
    if (z.T.splitter && this.state === 'night') { // tách thành 2 con non
      for (let k = 0; k < 2; k++) { const c = this.mk('spawnling'); c.x = z.x + (k ? 18 : -6); c.foot = Math.min(LANE_MAX, Math.max(LANE_MIN, z.foot + (k ? 8 : -8))); this.zombies.push(c); this.extraSpawns++; }
      this.texts.push({ x: z.x, y: z.foot - z.h, text: L("PHÂN THÂN!", "SPLIT!"), life: 0.8, max: 0.8, size: 13, color: '#c8a8e8' });
    }
    if (z.T.burner) { // nổ tung thành lửa, đốt những con xung quanh
      for (let i = 0; i < 12; i++) this.addParticle({ x: z.x, y: z.foot - 50, vx: rand(-140, 140), vy: rand(-200, -40), life: 0.6, color: '', size: rand(4, 8), kind: 'flame' });
      for (const o of this.zombies) if (o.alive && o !== z && Math.abs(o.x - z.x) < 80) { o.burnT = 2.5; o.burnDps = 14; }
      this.lights.push({ x: z.x, y: z.foot - 50, r: 180, life: 0.4, max: 0.4, color: '255,140,40', a: 0.4 });
    }
    if (z.T.boss) this.bossDown(z);
    if (this.state !== 'night') return;

    const d = this.data;
    let reward = rewarded ? Math.round(z.T.reward * (head ? 1.5 : 1) * diffOf(d).reward * (z.elite ? 2 : 1) * (this.wave.rewardMul || 1)) : 0;
    if (head && byPlayer && hasPerk(d, 'linh')) reward = Math.round(reward * 1.25);
    if (hasPerk(d, 'nhi')) reward = Math.round(reward * 1.15);
    if (z.T.bounty) {
      this.texts.push({ x: z.x, y: z.foot - z.h - 34, text: L("CƯỚP LẠI HÒM TIẾP TẾ!", "SUPPLY CHEST RECOVERED!"), life: 2, max: 2, size: 18, color: '#ffcf4a' });
      d.grenades = Math.min(GRENADE.max, d.grenades + 1);
    }
    if (src && d.mates[src]) { // đồng đội lên cấp
      const m = d.mates[src];
      const before = mateLevel(m.xp);
      m.xp++;
      const after = mateLevel(m.xp);
      if (after > before) {
        const st = this.survivorState.find((o) => o.id === src);
        if (st) st.lvl = after;
        this.texts.push({ x: (st?.x || 80) + 10, y: PLAYER_FOOT - 130, text: L(`${SURVIVORS.find((o) => o.id === src).name.toUpperCase()} LÊN CẤP ${after}!`, `${SURVIVORS.find((o) => o.id === src).name.toUpperCase()} REACHED LEVEL ${after}!`), life: 2, max: 2, size: 15, color: '#9fe07a' });
        sfx.levelUp();
      }
    }
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
    if (this.allSpawned() && !this.anyAlive()) this.slowT = 1.1;
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
    // chỉ làm hỏng rào khi nổ ngay sát rào (trước đây nổ cách gần 100px vẫn trừ máu)
    if (atWall || z.x - z.w / 2 < BARRICADE_X + 18) {
      this.damageBarricade(atWall ? z.dmg : z.dmg * 0.4, z.foot);
      this.injureMate(atWall ? 0.35 : 0.1);
    }
    this.explode(x, y, { radius: 100, dmg: 110, toxic: true, byPlayer: !atWall, exclude: z });
  }

  allSpawned() {
    const bossNeed = this.wave.boss ? bossCountFor(this.data.night) : 0;
    return this.spawned >= this.wave.total && this.bossesSpawned >= bossNeed && (!this.wave.mods?.bounty || this.bountySpawned);
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
    const base = (opts.dmg || GRENADE.dmg) * (byPlayer ? this.playerMul() : 1) * (opts.grenade && hasPerk(this.data, 'ha') ? 1.5 : 1);
    for (const z of this.zombies) {
      if (!z.alive || z === opts.exclude) continue;
      const cy = z.foot - z.h * 0.4;
      const dist = Math.hypot(z.x - x, (cy - y) * 1.6);
      if (dist > R + z.w / 2) continue;
      const k = 1 - Math.min(1, dist / (R + z.w / 2));
      // sát thương giảm mạnh ở rìa vụ nổ; trùm và gã khổng lồ chịu nổ tốt hơn
      const tough = z.T.boss ? 0.5 : z.T.heavy ? 0.65 : 1;
      this.hitZombie(z, base * (0.15 + 0.85 * k) * tough, false, z.x, cy, Math.sign(z.x - x) || 1, byPlayer, { silent: true, kind: 'blast' });
      if (z.alive) z.x += (40 * k * (Math.sign(z.x - x) || 1)) / Math.pow(z.mass(), 1.3); // vụ nổ hất văng, con to ít bị hất
    }
    // hình ảnh vụ nổ: hiệu ứng pixel art của pixelfx (mìn nổ tung đất, axit của kẻ trương phình màu xanh)
    const size = clamp(R / 85, 0.7, 1.3);
    if (opts.mine) this.pfx.spawn('dirt', x, y + 8);
    else this.pfx.spawn('explosion', x, y, { size, ...(opts.toxic ? { palette: PFX_PAL.toxic } : {}) });
    this.lights.push({ x, y: y - 20, r: 420, life: 0.35, max: 0.35, color: opts.toxic ? '170,255,70' : '255,160,60', a: 0.6 });
    this.texts.push({ x, y: y - 70, text: L("BÙM!", "BOOM!"), life: 0.8, max: 0.8, size: 30, color: opts.toxic ? '#c8f040' : '#ffb030' });
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
      t: 0, dur: 1.0, arc: 110, dmg: z.T.dmg * (1 + this.data.night * 0.012) * Math.min(1.15, diffOf(this.data).dmg),
    });
    sfx.spit();
  }

  splashAcid(x, y, n, ground) {
    for (let i = 0; i < n; i++) this.addParticle({ x, y, vx: rand(-140, 60), vy: rand(-200, -20), life: rand(0.4, 0.9), color: Math.random() < 0.5 ? '#b6e83a' : '#7fb020', size: rand(2, 4), g: 500, ground: ground ?? LANE_MAX });
    this.lights.push({ x, y, r: 120, life: 0.25, max: 0.25, color: '160,255,60', a: 0.25 });
  }

  // ---------- Trùm ----------
  spawnBoss() {
    const z = this.mk(bossTypeFor(this.data.night, this.bossesSpawned));
    if (this.bossesSpawned > 0) { z.foot -= 22; z.x += 60; }
    z.phase2 = false;
    this.zombies.push(z);
    this.bosses.push(z);
    if (!this.boss) this.boss = z;
    this.bossesSpawned++;
    this.bossSpawned = true;
    this.texts.push({ x: W / 2, y: 190, text: L(`${z.T.name.toUpperCase()} ĐÃ XUẤT HIỆN`, `${z.T.name.toUpperCase()} HAS APPEARED`), life: 3, max: 3, size: 34, color: '#ff5a45' });
    this.bossRoar(z);
    setMood('boss');
  }

  bossRoar(z) {
    sfx.roar();
    this.shake = Math.max(this.shake, 7);
    if (z && z.T.summoner && z.alive && this.state === 'night') { // gọi đàn
      for (let i = 0; i < 3; i++) {
        const r = this.mk(typeof z.T.summoner === 'string' ? z.T.summoner : 'runner');
        r.x = z.x + 40 + i * 25;
        this.zombies.push(r);
        this.extraSpawns++;
      }
      this.texts.push({ x: z.x, y: z.foot - z.h - 20, text: L("GỌI ĐÀN!", "SUMMONS THE PACK!"), life: 1.2, max: 1.2, size: 18, color: '#ff8a70' });
    }
  }

  bossDown(z) {
    this.pfx.spawn('dark', z.x, z.foot);
    this.shake = Math.max(this.shake, 16);
    sfx.explosion();
    for (let i = 0; i < 40; i++) this.addParticle({ x: z.x + rand(-30, 30), y: z.foot - rand(20, 180), vx: rand(-200, 240), vy: rand(-300, -40), life: rand(0.6, 1.3), color: '#6a0a0a', size: rand(3, 7), g: 600, ground: z.foot + rand(-8, 8), decal: true });
    this.texts.push({ x: z.x, y: z.foot - z.h - 30, text: L(`${z.T.name.toUpperCase()} ĐÃ GỤC!`, `${z.T.name.toUpperCase()} IS DOWN!`), life: 2.5, max: 2.5, size: 28, color: '#ffcf4a' });
    this.bosses = this.bosses.filter((b) => b !== z && b.alive);
    this.boss = this.bosses[0] || null;
    if (!this.boss) setMood('night');
  }

  damageBarricade(dmg, foot) {
    if (this.state !== 'night') return;
    if (hasPerk(this.data, 'dat')) dmg *= 0.85;
    if (dmg >= 16) this.splat = Math.min(1, this.splat + dmg / 90);
    this.data.hp -= dmg;
    this.stats.damage += dmg;
    if (this.data.hp / this.maxHp < 0.35) this.injureMate(dmg / 320);
    this.shake = Math.max(this.shake, dmg > 15 ? 6 : 1.5);
    this.hurtFlash = Math.min(0.5, this.hurtFlash + dmg / 80);
    sfx.barricade();
    for (let i = 0; i < 4; i++) {
      this.addParticle({ x: BARRICADE_X - 2, y: rand(BARRICADE_TOP + 10, foot - 6), vx: rand(-120, -20), vy: rand(-120, 0), life: 0.6, color: Math.random() < 0.5 ? '#6b4a2b' : '#8a7b57', size: rand(2, 4), g: 500, ground: foot });
    }
    if (this.data.hp <= 0) { this.data.hp = 0; this.gameOver(); }
  }

  // một cánh tay / cẳng chân văng ra, rơi xuống đất rồi nằm lại như vết máu
  sever(z, part, x, y) {
    const T = z.T, s = z.h / 100;
    const skin = shadeHex(T.skin, part === 'arm' ? -10 : -30);
    const cloth = z.female ? (part === 'arm' ? z.dress : shadeHex(T.skin, -22)) : part === 'arm' ? shadeHex(T.shirt, -20) : T.pants;
    if (this.gibs.length > 40) this.gibs.shift();
    this.gibs.push({ part, x, y, vx: rand(40, 170), vy: rand(-300, -160), rot: rand(0, Math.PI * 2), vr: rand(-14, 14), s, w: z.w, skin, cloth, ground: z.foot + rand(-4, 8), bounced: false, life: 6 });
    for (let i = 0; i < 16; i++) this.addParticle({ x, y, vx: rand(-40, 200), vy: rand(-240, -20), life: rand(0.5, 1), color: Math.random() < 0.5 ? '#8b0d0d' : '#5e0a0a', size: rand(2, 4.5), g: 600, ground: z.foot + rand(-5, 5), decal: true });
    sfx.headshot();
    if (Math.random() < 0.35) this.texts.push({ x: z.x, y: z.foot - z.h * (z.legless ? 0.5 : 1) - 8, text: part === 'arm' ? L("ĐỨT TAY!", "ARM OFF!") : z.legless ? L("CỤT CHÂN!", "LEGS OFF!") : L("GÃY CHÂN!", "LEG OFF!"), life: 0.8, max: 0.8, size: 13, color: '#ff8a7a' });
  }
  updateGibs(dt) {
    for (const g of this.gibs) {
      g.vy += 900 * dt; g.x += g.vx * dt; g.y += g.vy * dt; g.rot += g.vr * dt;
      if (g.y >= g.ground) {
        g.y = g.ground;
        if (!g.bounced) { g.bounced = true; g.vy *= -0.28; g.vx *= 0.45; g.vr *= 0.4; }
        else { // nằm im: in hẳn xuống lớp nền
          g.rot = Math.round(g.rot / Math.PI) * Math.PI + (g.rot % 0.6);
          this.drawGib(this.dctx, g);
          this.dctx.fillStyle = 'rgba(90,8,8,0.5)';
          this.dctx.beginPath(); this.dctx.ellipse(g.x, g.y + 2, 14 * g.s, 4 * g.s, 0, 0, Math.PI * 2); this.dctx.fill();
          g.life = 0;
        }
      }
      g.life -= dt;
    }
    this.gibs = this.gibs.filter((g) => g.life > 0);
  }
  drawGib(ctx, g) {
    const s = g.s;
    ctx.save();
    ctx.translate(g.x, g.y); ctx.rotate(g.rot);
    ctx.lineCap = 'round';
    const tube = (x0, x1, wd, col) => {
      ctx.strokeStyle = 'rgba(20,10,8,0.9)'; ctx.lineWidth = wd + 2 * s;
      ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x1, 0); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = wd;
      ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x1, 0); ctx.stroke();
    };
    if (g.part === 'arm') {
      tube(-14 * s, 6 * s, g.w * 0.17, g.skin);          // cẳng tay
      tube(6 * s, 16 * s, g.w * 0.22, g.skin);
      tube(8 * s, 18 * s, g.w * 0.28, g.cloth);           // tay áo rách
      ctx.fillStyle = g.skin; ctx.beginPath(); ctx.arc(-16 * s, 0, 3.6 * s, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(20,10,8,0.9)'; ctx.lineWidth = 1.6 * s; ctx.beginPath();
      for (let k = 0; k < 4; k++) { const a = Math.PI * 0.85 + k * 0.18; ctx.moveTo(-16 * s, 0); ctx.lineTo(-16 * s + Math.cos(a) * 7 * s, Math.sin(a) * 7 * s); }
      ctx.stroke();
      ctx.fillStyle = '#6a0c0c'; ctx.beginPath(); ctx.arc(19 * s, 0, g.w * 0.14, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e4dac4'; ctx.lineWidth = 2.2 * s; ctx.beginPath(); ctx.moveTo(18 * s, 0); ctx.lineTo(24 * s, -1 * s); ctx.stroke();
    } else {
      tube(-16 * s, 4 * s, g.w * 0.24, g.skin);           // cẳng chân
      tube(0, 22 * s, g.w * 0.38, g.cloth);               // đùi trong quần
      ctx.fillStyle = g.skin; ctx.beginPath(); ctx.ellipse(-19 * s, -3 * s, 3.5 * s, 7 * s, 0, 0, Math.PI * 2); ctx.fill(); // bàn chân
      ctx.fillStyle = '#6a0c0c'; ctx.beginPath(); ctx.ellipse(23 * s, 0, 3 * s, g.w * 0.19, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e4dac4'; ctx.lineWidth = 2.6 * s; ctx.beginPath(); ctx.moveTo(22 * s, 0); ctx.lineTo(29 * s, 1 * s); ctx.stroke();
    }
    ctx.restore();
  }

  addParticle(p) {
    p.max = p.life;
    if (this.particles.length < MAX_PARTICLES) this.particles.push(p);
  }

  // ---------- Update ----------
  update(dtReal) {
    this.time += dtReal;
    if (this.cine) this.cine.t += dtReal;
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

    this.nightT += dt;
    // tiếng động xa xăm của một thế giới đã sụp đổ
    this.ambT -= dt;
    if (this.ambT <= 0) { this.ambT = rand(5, 11); sfx.ambient(this.scene); }
    this.splat = Math.max(0, this.splat - dt * 0.22);
    // sinh zombie
    if (this.spawned < this.wave.total) {
      this.spawnTimer -= dt;
      // dọn quá nhanh thì đợt sau kéo đến ngay, không để khoảng lặng
      const onField = this.zombies.reduce((n, z) => n + (z.alive ? 1 : 0), 0);
      if (onField < 3 + Math.floor(d.night / 4) && this.spawnTimer > 0.35 && this.nightT > 3) this.spawnTimer = 0.35;
      if (this.spawnTimer <= 0) {
        const df = diffOf(d);
        // thỉnh thoảng cả bầy kéo đến cùng lúc
        const pack = Math.random() < df.pack ? Math.min(this.wave.total - this.spawned, 2 + Math.floor(Math.random() * (2 + d.night / 6))) : 1;
        for (let k = 0; k < pack; k++) {
          const z = this.mk(this.pickType());
          z.x += k * rand(18, 34);
          this.zombies.push(z);
          this.spawned++;
        }
        this.spawnTimer = (pack > 1 ? this.wave.interval * 2.2 : this.wave.interval * rand(0.4, 1.6)) * df.interval;
      }
    }
    if (this.wave.boss) {
      const need = bossCountFor(d.night);
      if (this.bossesSpawned < need && this.spawned >= this.wave.total * (0.35 + this.bossesSpawned * 0.25)) this.spawnBoss();
    }
    if (this.mods.bounty && !this.bountySpawned && this.spawned >= this.wave.total * 0.45) this.spawnBounty();
    while (this.dropTimes.length && this.nightT >= this.dropTimes[0]) { this.dropTimes.shift(); this.spawnCrate(); }
    this.updateBossPhases();

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
    this.updateDefenses(dt);
    this.updateSpecials(dt);
    this.updateDefenses2(dt);
    this.updateProjectiles(dt);
    this.updateCrates(dt);
    if (this.state !== 'night') return;

    if (hasPerk(d, 'bao')) d.hp = Math.min(this.maxHp, d.hp + 1.6 * dt);
    if (this.time - this.lastKill > 1.6) this.streak = 0;
    const ratio = d.hp / this.maxHp;
    heartbeat(dtReal, ratio < 0.3 ? 1 - ratio / 0.3 : 0);

    // hết đêm?
    if (this.allSpawned() && !this.anyAlive()) {
      if (this.endTimer < 0) {
        this.endTimer = 3.2;
        this.texts.push({ x: W / 2, y: 230, text: L("TRỜI ĐÃ SÁNG!", "DAWN HAS COME!"), life: 3, max: 3, size: 44, color: '#ffd77a' });
        sfx.dawn();
        heartbeat(0, 0);
      }
      this.endTimer -= dtReal;
      if (this.endTimer <= 0) this.endNight();
    }
  }

  updateSurvivors(dt) {
    for (const s of this.survivorState) {
      s.recoil = Math.max(0, s.recoil - dt * 40);
      if (s.injured) continue;
      s.cd -= dt;
      const c = s.combat || MATE_COMBAT.lan;
      const targets = this.zombies.filter((z) => z.alive && z.x < W - 10);
      if (!targets.length) continue;
      // xạ thủ ưu tiên mục tiêu nguy hiểm, người khác bắn con gần nhất
      targets.sort((a, b) => (c.hunter ? (b.T.reward - a.T.reward) || (a.x - b.x) : a.x - b.x));
      const t = targets[Math.min(targets.length - 1, c.hunter ? 0 : Math.floor(Math.random() * 2))];
      const b = t.boxes();
      const aimHead = Math.random() < c.head;
      const ty = aimHead ? b.hy : (b.by0 + b.by1) / 2;
      const sx = s.x + 4, sy = PLAYER_FOOT - 80;
      s.ang = Math.atan2(ty - sy, (aimHead ? b.hx : t.x) - sx);
      if (s.cd <= 0) {
        const lv = s.lvl || 1;
        const burst = c.burst || 1;
        s.burst = (s.burst || 0) + 1;
        s.cd = s.burst < burst ? 0.09 : rand(c.cd[0], c.cd[1]) / (1 + 0.15 * (lv - 1)) / (hasPerk(this.data, 'tuyet') ? 1.25 : 1);
        if (s.burst >= burst) s.burst = 0;
        s.recoil = 4;
        const ox = sx + Math.cos(s.ang) * 34, oy = sy + Math.sin(s.ang) * 34;
        const dmg = c.dmg * (1 + 0.35 * (lv - 1)) * diffOf(this.data).mate * (this.data.hungry ? 0.7 : 1);
        for (let k = 0; k < (c.pellets || 1); k++) {
          const miss = Math.random() < c.miss ? rand(-0.06, 0.06) : 0;
          const spread = c.pellets ? rand(-0.07, 0.07) : 0;
          this.castRay(ox, oy, s.ang + miss + spread, dmg, c.pierce || 1, !!c.pellets, false, s.id, c.pierce > 1);
        }
        this.lights.push({ x: ox, y: oy, r: 150, life: 0.06, max: 0.06, color: '255,190,90', a: 0.2 });
        sfx.ally();
      }
    }
  }

  // Tháp súng máy tự động + mìn
  updateDefenses(dt) {
    const lvl = Math.max(1, Math.min(3, this.data.turretLevel || 1)) - 1;
    for (const t of this.turrets) {
      t.recoil = Math.max(0, t.recoil - dt * 30);
      if (t.overheat > 0) { t.overheat -= dt; if (Math.random() < 0.3) this.addParticle({ x: t.x + 10, y: t.y - 8, vx: rand(-10, 10), vy: rand(-40, -20), life: 0.8, color: '200,200,210', size: 4, kind: 'smoke' }); continue; }
      let target = null;
      for (const z of this.zombies) if (z.alive && z.x < W - 20 && (!target || z.x < target.x)) target = z;
      if (!target) { t.heat = Math.max(0, t.heat - dt * 4); continue; }
      const b = target.boxes();
      const want = Math.atan2((b.by0 + b.by1) / 2 - t.y, target.x - t.x);
      t.ang += (want - t.ang) * Math.min(1, dt * 10);
      t.cd -= dt;
      if (t.cd <= 0) {
        t.cd = TURRET.rate[lvl];
        t.heat++;
        t.recoil = 3;
        const ox = t.x + Math.cos(t.ang) * 26, oy = t.y + Math.sin(t.ang) * 26;
        this.castRay(ox, oy, t.ang + rand(-0.035, 0.035), TURRET.dmg[lvl], 1, false, false, 'turret');
        this.lights.push({ x: ox, y: oy, r: 120, life: 0.05, max: 0.05, color: '255,200,110', a: 0.25 });
        sfx.turret();
        if (t.heat >= TURRET.heat[lvl]) { t.heat = 0; t.overheat = TURRET.cool; }
      }
    }
    for (const m of this.mines) {
      if (m.done) continue;
      for (const z of this.zombies) {
        if (!z.alive || z.leaping) continue;
        if (Math.abs(z.x - m.x) < z.w / 2 + 6 && Math.abs(z.foot - m.y) < 18) {
          m.done = true;
          this.explode(m.x, m.y - 8, { mine: true, radius: MINE.radius, dmg: MINE.dmg * (hasPerk(this.data, 'quang') ? 1.4 : 1) });
          break;
        }
      }
    }
  }

  // Bẫy điện, tháp phun lửa, súng cối, tháp Tesla, drone
  updateDefenses2(dt) {
    const d = this.data;
    const alive = this.zombies.filter((z) => z.alive);
    // bẫy điện: phóng điện định kỳ, làm tê liệt mọi con trong vùng
    const sl = d.shockerLevel || 0;
    if (sl) {
      this.shock.zapT = Math.max(0, this.shock.zapT - dt);
      this.shock.t -= dt;
      if (this.shock.t <= 0) {
        // mỗi lần phóng chỉ giật được vài con gần rào nhất trong vùng
        const hit = alive.filter((z) => !z.leaping && z.x - z.w / 2 < SHOCKER.to && z.x > SHOCKER.from - 10).sort((a, b) => a.x - b.x).slice(0, SHOCKER.maxHit[sl]);
        if (hit.length) {
          this.shock.t = SHOCKER.every[sl];
          this.shock.zapT = 0.18;
          for (const z of hit) {
            if (!z.T.boss) z.stunT = SHOCKER.stun;
            this.hitZombie(z, SHOCKER.dmg[sl], false, z.x, z.foot - 30, 1, false, { silent: true, noFx: true, kind: 'blast', src: 'shock' });
            this.bolts.push({ pts: [[z.x, z.foot], [z.x + rand(-6, 6), z.foot - z.h * 0.6]], life: 0.15, max: 0.15 });
          }
          this.lights.push({ x: (SHOCKER.from + SHOCKER.to) / 2, y: 480, r: 200, life: 0.15, max: 0.15, color: '120,200,255', a: 0.4 });
          sfx.tesla();
        } else this.shock.t = 0.2;
      }
    }
    // tháp phun lửa
    if (d.flameTurret) {
      const f = this.flameT;
      const slot = FLAME_TURRET.slot;
      if (f.cool > 0) f.cool -= dt;
      else {
        const near = alive.filter((z) => z.x - BARRICADE_X < FLAME_TURRET.range);
        if (near.length) {
          f.heat += dt;
          const tgt = near.sort((a, b) => a.x - b.x)[0];
          f.ang = Math.atan2(tgt.foot - 40 - slot.y, tgt.x - slot.x);
          for (const z of near) { if (!z.T.burner) { z.burnT = 2; z.burnDps = FLAME_TURRET.burn; } }
          if (Math.random() < 0.5) this.hitZombie(tgt, FLAME_TURRET.dmg, false, tgt.x, tgt.foot - 40, 1, false, { silent: true, noFx: true, kind: 'fire', src: 'flame' });
          for (let i = 0; i < 2; i++) { const a = f.ang + rand(-0.12, 0.12), sp = rand(380, 480); this.addParticle({ x: slot.x + Math.cos(a) * 20, y: slot.y + Math.sin(a) * 20, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 10, life: FLAME_TURRET.range / sp, color: '', size: rand(5, 8), kind: 'flame' }); }
          this.lights.push({ x: slot.x + 90, y: slot.y + 30, r: 200, life: 0.06, max: 0.06, color: '255,140,40', a: 0.2 });
          sfx.flamer();
          if (f.heat > FLAME_TURRET.spray) { f.heat = 0; f.cool = FLAME_TURRET.cool; }
        } else f.heat = Math.max(0, f.heat - dt);
      }
    }
    // súng cối: bắn vào chỗ đông nhất ở xa
    const ml = d.mortarLevel || 0;
    if (ml) {
      this.mortarT -= dt;
      if (this.mortarT <= 0) {
        const far = alive.filter((z) => z.x > 380 && z.x < W - 10);
        if (far.length) {
          let best = far[0], bestN = 0;
          for (const z of far) { const n = far.filter((o) => Math.abs(o.x - z.x) < 100).length; if (n > bestN) { bestN = n; best = z; } }
          this.mortarT = MORTAR.every[ml];
          const dist = best.x - MORTAR.x;
          this.projectiles.push({ type: 'shell', x0: MORTAR.x, y0: MORTAR.y - 30, x1: best.x - 20, y1: best.foot - 6, t: 0, dur: 1.1, arc: 230 + dist * 0.15, w: { radius: MORTAR.radius, dmg: MORTAR.dmg[ml] } });
          this.addParticle({ x: MORTAR.x, y: MORTAR.y - 34, vx: 10, vy: -40, life: 1, color: '160,160,160', size: 8, kind: 'smoke' });
          sfx.launcher();
        } else this.mortarT = 0.5;
      }
    }
    // tháp Tesla: sét nhảy giữa các con
    const tl = d.teslaLevel || 0;
    if (tl) {
      this.teslaT -= dt;
      if (this.teslaT <= 0) {
        const first = alive.filter((z) => z.x - TESLA_TOWER.x < TESLA_TOWER.range).sort((a, b) => a.x - b.x)[0];
        if (first) {
          this.teslaT = TESLA_TOWER.every[tl];
          const chain = [first];
          while (chain.length < TESLA_TOWER.chain + 1) {
            const last = chain[chain.length - 1];
            let next = null, bd = 150;
            for (const z of alive) { if (chain.includes(z)) continue; const dd = Math.hypot(z.x - last.x, z.foot - last.foot); if (dd < bd) { bd = dd; next = z; } }
            if (!next) break;
            chain.push(next);
          }
          const pts = [[TESLA_TOWER.x, TESLA_TOWER.y - 34]];
          chain.forEach((z, i) => { pts.push([z.x, z.foot - z.h * 0.55]); this.hitZombie(z, TESLA_TOWER.dmg[tl] * (1 - i * 0.12), false, z.x, z.foot - 40, 1, false, { silent: true, kind: 'blast', src: 'tesla' }); });
          this.bolts.push({ pts, life: 0.14, max: 0.14 });
          this.lights.push({ x: TESLA_TOWER.x, y: TESLA_TOWER.y - 34, r: 180, life: 0.12, max: 0.12, color: '120,200,255', a: 0.45 });
          sfx.tesla();
        } else this.teslaT = 0.3;
      }
    }
    // lưỡi cưa quay: cứa vào chân, dễ làm đứt chân
    const sw = d.sawLevel || 0;
    if (sw) {
      this.sawAng += dt * 18;
      this.sawT -= dt;
      if (this.sawT <= 0) {
        this.sawT = 0.25;
        for (const z of alive) {
          if (z.leaping || z.x - z.w / 2 > SAW.to || z.x < SAW.from) continue;
          const dm = SAW.dps[sw] * 0.25 * (hasPerk(d, 'quang') ? 1.4 : 1);
          this.hitZombie(z, dm, false, z.x - z.w / 2, z.foot - 12, 1, false, { silent: true, noFx: true, kind: 'blast', src: 'saw' });
          if (z.alive && z.T.kind === 'upright') z.limbHit(dm * 1.6, z.foot - z.h * 0.2, this);
          for (let i = 0; i < 2; i++) this.addParticle({ x: z.x - z.w / 2, y: z.foot - 8, vx: rand(20, 120), vy: rand(-140, -40), life: 0.4, color: '#8b0d0d', size: rand(2, 3), g: 500, ground: z.foot + 2, decal: true });
        }
      }
    }
    // ổ bắn tỉa: ưu tiên con nhiều máu nhất
    const sn = d.sniperLevel || 0;
    if (sn) {
      this.sniperT -= dt;
      const pool = alive.filter((z) => z.x < W - 30 && !z.leaping);
      const tgt = pool.sort((a, b) => b.hp - a.hp)[0];
      if (tgt) this.sniperAim = tgt;
      if (this.sniperT <= 0) {
        if (tgt) {
          this.sniperT = SNIPER_NEST.every[sn];
          const b = tgt.boxes();
          const ang = Math.atan2((b.by0 + b.by1) / 2 - SNIPER_NEST.y, tgt.x - SNIPER_NEST.x);
          this.castRay(SNIPER_NEST.x + 20, SNIPER_NEST.y, ang, SNIPER_NEST.dmg[sn], SNIPER_NEST.pierce, false, false, 'sniperNest', true);
          this.lights.push({ x: SNIPER_NEST.x + 20, y: SNIPER_NEST.y, r: 120, life: 0.07, max: 0.07, color: '255,220,150', a: 0.35 });
          sfx.sniper();
        } else this.sniperT = 0.4;
      }
    }
    // máy phóng khí độc
    const gl = d.gasLevel || 0;
    if (gl) {
      this.gasT -= dt;
      if (this.gasT <= 0) {
        const mid = alive.filter((z) => z.x > 300 && z.x < 760);
        if (mid.length) {
          let best = mid[0], bestN = 0;
          for (const z of mid) { const n = mid.filter((o) => Math.abs(o.x - z.x) < GAS.radius).length; if (n > bestN) { bestN = n; best = z; } }
          this.gasT = GAS.every[gl];
          const tx = best.x - 25, ty = clamp(best.foot - 4, LANE_MIN, LANE_MAX);
          this.projectiles.push({ type: 'gas', x0: GAS.x, y0: GAS.y - 24, x1: tx, y1: ty, t: 0, dur: 0.9, arc: 160, lvl: gl });
          sfx.throw();
        } else this.gasT = 0.5;
      }
    }
    for (const c of this.clouds) {
      c.life -= dt;
      for (const z of alive) {
        if (Math.hypot((z.x - c.x) * 0.8, z.foot - c.y) > GAS.radius) continue;
        z.gasT = 0.3;
        if (Math.random() < dt * 4) this.hitZombie(z, GAS.dps[c.lvl] * 0.25, false, z.x, z.foot - 40, 1, false, { silent: true, noFx: true, kind: 'gas', src: 'gas' });
      }
      if (Math.random() < dt * 10) this.addParticle({ x: c.x + rand(-GAS.radius, GAS.radius) * 0.8, y: c.y - rand(0, 50), vx: rand(-10, 10), vy: rand(-18, -6), life: 1.2, color: '120,170,60', size: rand(10, 18), kind: 'smoke' });
    }
    this.clouds = this.clouds.filter((c) => c.life > 0);
    // giàn tên lửa
    const rl = d.rocketLevel || 0;
    if (rl) {
      this.rocketT -= dt;
      if (this.rocketT <= 0) {
        const far = alive.filter((z) => z.x > 360 && z.x < W - 10);
        if (far.length) {
          this.rocketT = ROCKET.every[rl];
          for (let i = 0; i < ROCKET.salvo[rl]; i++) {
            const t = far[Math.floor(Math.random() * far.length)];
            this.projectiles.push({ type: 'shell', rocket: true, x0: ROCKET.x + i * 4, y0: ROCKET.y - 26, x1: t.x - 10 + rand(-14, 14), y1: t.foot - 4, t: -i * 0.12, dur: 0.75, arc: 120 + rand(0, 60), w: { radius: ROCKET.radius, dmg: ROCKET.dmg[rl] } });
          }
          sfx.launcher();
        } else this.rocketT = 0.5;
      }
    }
    // drone chiến đấu
    for (const dr of this.drones) {
      dr.ph += dt;
      dr.x += Math.sin(dr.ph * 0.9) * 20 * dt;
      dr.y = 230 + Math.sin(dr.ph * 2.1) * 8 - (dr.ph % 1 === 0 ? 0 : 0);
      if (dr.reload > 0) { dr.reload -= dt; if (dr.reload <= 0) dr.ammo = DRONE.mag; continue; }
      const tgt = alive.filter((z) => z.x < W - 20).sort((a, b) => Math.abs(a.x - dr.x) - Math.abs(b.x - dr.x))[0];
      if (!tgt) continue;
      dr.cd -= dt;
      if (dr.cd <= 0) {
        dr.cd = DRONE.rate;
        const b = tgt.boxes();
        const ang = Math.atan2((b.by0 + b.by1) / 2 - dr.y, tgt.x - dr.x);
        this.castRay(dr.x, dr.y + 6, ang + rand(-0.04, 0.04), DRONE.dmg, 1, false, false, 'drone');
        this.lights.push({ x: dr.x, y: dr.y + 6, r: 80, life: 0.05, max: 0.05, color: '255,210,120', a: 0.25 });
        sfx.turret();
        if (--dr.ammo <= 0) dr.reload = DRONE.reload;
      }
    }
  }

  // Dây thép gai: làm chậm và cứa zombie sát hàng rào
  slowAt(z, dt) {
    let m = 1;
    if (z.freezeT > 0) { z.freezeT -= dt; m *= 0.4; }
    if (z.gasT > 0) { z.gasT -= dt; m *= GAS.slow; }
    return m * this.wireSlow(z, dt);
  }
  wireSlow(z, dt) {
    const lv = this.state === 'night' && this.data ? this.data.wireLevel || 0 : 0;
    if (!lv || z.leaping || z.x - z.w / 2 > WIRE.to || z.x < WIRE.from) return 1;
    if (Math.random() < dt * 4) this.hitZombie(z, WIRE.dps[lv] * 0.25, false, z.x - z.w / 2, z.foot - 20, 1, false, { silent: true, noFx: true, kind: 'blast', src: 'wire' });
    return z.T.heavy ? (1 + WIRE.slow[lv]) / 2 : WIRE.slow[lv];
  }

  updateCrates(dt) {
    for (const c of this.crates) {
      if (c.opened) { c.life = Math.min(c.life, 0); continue; }
      if (!c.landed) {
        c.y += c.vy * dt;
        c.sway += dt * 2;
        c.x += Math.sin(c.sway) * 12 * dt;
        if (c.y >= c.ground) { c.y = c.ground; c.landed = true; }
      } else c.life -= dt;
    }
    this.crates = this.crates.filter((c) => !c.opened && c.life > 0);
  }

  // quái đặc biệt của màn 4 · 5: ấp trứng, chữa lành, tái tạo
  updateSpecials(dt) {
    for (const z of this.zombies) {
      if (!z.alive) continue;
      if (z.T.brood) { // đẻ con non phía sau lưng
        z.eggT = (z.eggT ?? 3) - dt;
        if (z.eggT <= 0) { z.eggT = 4.5; const c = this.mk('spawnling'); c.x = z.x + 24; c.foot = z.foot; this.zombies.push(c); this.extraSpawns++; }
      }
      if (z.T.healer) { // hút tín hiệu, chữa lành cả bầy quanh mình
        z.healT = (z.healT ?? 2) - dt;
        if (z.healT <= 0) {
          z.healT = z.T.boss ? 5 : 3;
          const r = z.T.boss ? 220 : 130;
          for (const o of this.zombies) if (o.alive && o !== z && Math.abs(o.x - z.x) < r) o.hp = Math.min(o.maxHp, o.hp + o.maxHp * (z.T.boss ? 0.12 : 0.08));
          this.rings.push({ x: z.x, y: z.foot - z.h * 0.5, r: 10, max: r, life: 0.6 });
        }
      }
      if (z.T.regen) { // Quỷ Tuyết tự lành khi không bị bắn
        z.sinceHit = (z.sinceHit || 0) + dt;
        if (z.sinceHit > 2) z.hp = Math.min(z.maxHp, z.hp + z.maxHp * 0.012 * dt);
      }
    }
    for (const g of this.rings) { g.life -= dt; g.r += (g.max - g.r) * dt * 6; }
    this.rings = this.rings.filter((g) => g.life > 0);
  }

  // Mẫu Thể Số 0: 3 giai đoạn
  updateBossPhases() {
    for (const z of this.bosses) {
      if (z.alive && z.T.caller) { // Kẻ Gọi Bầy: gọi kẻ thu sóng, rồi mọc giáp băng
        const r = z.hp / z.maxHp;
        if (!z.phase2 && r < 0.6) {
          z.phase2 = true; z.speed *= 1.4;
          this.texts.push({ x: W / 2, y: 180, text: L("KẺ GỌI BẦY PHÁT SÓNG!", "THE CALLER IS BROADCASTING!"), life: 2.5, max: 2.5, size: 28, color: '#9fe07a' });
          for (let k = 0; k < 3; k++) { const s2 = this.mk('signal'); s2.x = z.x + 60 + k * 40; this.zombies.push(s2); this.extraSpawns++; }
          sfx.roar(); this.shake = Math.max(this.shake, 10);
        }
        if (!z.armorPhase && r < 0.25) {
          z.armorPhase = true;
          this.texts.push({ x: W / 2, y: 180, text: L("GIÁP CÁP! DÙNG ĐIỆN, CHẤT NỔ, SÚNG ĐIỆN TỪ!", "ICE ARMOR! USE ELECTRICITY, EXPLOSIVES, THE RAILGUN!"), life: 3, max: 3, size: 24, color: '#ffcf4a' });
          for (let k = 0; k < 3; k++) { const f = this.mk('frost'); f.x = z.x + 60 + k * 40; this.zombies.push(f); this.extraSpawns++; }
          sfx.roar(); this.shake = Math.max(this.shake, 12);
        }
      }
      if (z.alive && z.T.queen) {
        z.broodT = (z.broodT ?? 4) - 1 / 30;
        if (z.broodT <= 0) {
          z.broodT = z.phase2 ? 3.5 : 5;
          for (let k = 0; k < 3; k++) { const c = this.mk('spawnling'); c.x = z.x + 30 + k * 22; this.zombies.push(c); this.extraSpawns++; }
          this.texts.push({ x: z.x, y: z.foot - z.h - 20, text: L("ĐẺ BẦY!", "SPAWNING!"), life: 1, max: 1, size: 16, color: '#c8a8e8' });
        }
        const r = z.hp / z.maxHp;
        if (!z.phase2 && r < 0.5) {
          z.phase2 = true; z.speed *= 1.5;
          this.texts.push({ x: W / 2, y: 180, text: L("NỮ HOÀNG GỌI CẢ TỔ!", "THE QUEEN CALLS THE WHOLE NEST!"), life: 2.5, max: 2.5, size: 28, color: '#ff5a45' });
          for (let k = 0; k < 3; k++) { const st = this.mk('stalker'); st.x = z.x + 60 + k * 40; this.zombies.push(st); this.extraSpawns++; }
          sfx.roar(); this.shake = Math.max(this.shake, 10);
        }
        if (!z.armorPhase && r < 0.2) {
          z.armorPhase = true;
          this.texts.push({ x: W / 2, y: 180, text: L("VỎ CỨNG! DÙNG LỬA, ĐIỆN, CHẤT NỔ!", "HARD SHELL! USE FIRE, ELECTRICITY, EXPLOSIVES!"), life: 3, max: 3, size: 24, color: '#ffcf4a' });
          sfx.roar(); this.shake = Math.max(this.shake, 12);
        }
      }
      if (!z.alive || !z.T.phases) continue;
      const r = z.hp / z.maxHp;
      if (!z.phase2 && r < 0.6) {
        z.phase2 = true;
        z.speed *= 1.7;
        this.texts.push({ x: W / 2, y: 180, text: L("MẪU THỂ SỐ 0 NỔI ĐIÊN!", "SPECIMEN ZERO IS ENRAGED!"), life: 2.5, max: 2.5, size: 30, color: '#ff5a45' });
        for (let k = 0; k < 2; k++) { const sc = this.mk('screamer'); sc.x = z.x + 80 + k * 40; this.zombies.push(sc); this.extraSpawns++; }
        sfx.roar();
        this.shake = Math.max(this.shake, 10);
      }
      if (!z.armorPhase && r < 0.25) {
        z.armorPhase = true;
        this.texts.push({ x: W / 2, y: 180, text: L("GIÁP XƯƠNG! DÙNG LỬA, ĐIỆN, CHẤT NỔ!", "BONE ARMOR! USE FIRE, ELECTRICITY, EXPLOSIVES!"), life: 3, max: 3, size: 24, color: '#ffcf4a' });
        for (let k = 0; k < 4; k++) { const rv = this.mk('reviver'); rv.x = z.x + 60 + k * 35; this.zombies.push(rv); this.extraSpawns++; }
        sfx.roar();
        this.shake = Math.max(this.shake, 12);
      }
    }
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      p.t += dt;
      p.spin = (p.spin || 0) + dt * 14;
      const k = Math.max(0, Math.min(1, p.t / p.dur));
      p.x = p.x0 + (p.x1 - p.x0) * k;
      p.y = p.y0 + (p.y1 - p.y0) * k - p.arc * 4 * k * (1 - k);
      if (p.type === 'shell') this.addParticle({ x: p.x, y: p.y, vx: rand(-15, 15), vy: rand(-15, 5), life: 0.5, color: '170,170,170', size: 4, kind: 'smoke' });
      if (p.type === 'acid' && Math.random() < 0.5) {
        this.addParticle({ x: p.x, y: p.y, vx: rand(-10, 10), vy: rand(-10, 10), life: 0.3, color: '#9fd030', size: 2.5 });
      }
      if (k >= 1) {
        p.done = true;
        if (p.type === 'grenade') this.explode(p.x1, p.y1, { grenade: true });
        else if (p.type === 'shell') this.explode(p.x1, p.y1, { radius: p.w.radius, dmg: p.w.dmg });
        else if (p.type === 'gas') { this.clouds.push({ x: p.x1, y: p.y1, life: GAS.life, lvl: p.lvl }); sfx.acid(); }
        else {
          this.splashAcid(p.x1, p.y1, 10, LANE_MAX); sfx.acid(); this.damageBarricade(p.dmg, LANE_MAX);
          this.texts.push({ x: p.x1 + 6, y: p.y1 - 18, text: L('AXIT!', 'ACID!'), life: 0.8, max: 0.8, size: 13, color: '#c8f040' });
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.done);
  }

  updateFx(dt) {
    this.pfx.update(dt);
    this.updateGibs(dt);
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
    for (const r of this.rings) { r.life -= dt; r.r += dt * 420; }
    this.rings = this.rings.filter((r) => r.life > 0);
    for (const b of this.bolts) b.life -= dt;
    this.bolts = this.bolts.filter((b) => b.life > 0);
    this.shake = Math.max(0, this.shake - dt * 25);
    this.flash = Math.max(0, this.flash - dt);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt * 1.5);
    if (this.titleCard) { this.titleCard.t -= dt; if (this.titleCard.t <= 0) this.titleCard = null; }
    if (this.hitMarker) { this.hitMarker.t -= dt; if (this.hitMarker.t <= 0) this.hitMarker = null; }
    if (this.comboShow) { this.comboShow.t -= dt; if (this.comboShow.t <= 0) this.comboShow = null; }
  }

  updateWeather(dt) {
    const up = this.scene === 'harbor' ? -1 : 1;
    for (const m of this.motes) {
      m.y += (10 + m.s * 12) * dt * up;
      m.x += (Math.sin(this.time * 0.6 + m.p) * 14 - 8) * dt;
      if (m.y > H) m.y = -4; if (m.y < -4) m.y = H; if (m.x < -4) m.x = W;
    }
    if (this.weather.snow) {
      for (const r of this.rain) {
        r.y += r.spd * 0.07 * dt; r.x += Math.sin(this.time + r.len) * 14 * dt - 6 * dt;
        if (r.y > H) { r.y = rand(-60, -10); r.x = rand(0, W + 200); }
      }
    }
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

  // Tạo zombie theo đêm hiện tại và độ khó
  mk(type) {
    const df = diffOf(this.data);
    const z = new Zombie(type, this.wave.hpMul * df.hp);
    z.speed *= (this.wave.speedMul || 1) * df.speed;
    z.dmg *= (this.wave.dmgMul || 1) * df.dmg;
    if (!z.T.boss && type !== 'spawnling' && type !== 'bounty' && Math.random() < eliteChance(this.data.night, this.threat || 1) * (hasPerk(this.data, 'an') ? 0.5 : 1)) {
      z.elite = true; // tinh nhuệ: nhiều máu, nhanh, cắn đau, thưởng gấp đôi
      z.maxHp *= 2.2; z.hp = z.maxHp; z.speed *= 1.15; z.dmg *= 1.25; z.helmet *= 2;
    }
    return z;
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
    if (this.cine && drawShot(ctx, this.cine.id, this.cine.t)) { this.drawGrain(ctx, 0.09); return; }
    const inGame = this.data && (this.state === 'night' || this.state === 'paused' || this.state === 'gameover');
    ctx.save();
    if (this.shake > 0 && this.settings.shake) ctx.translate(rand(-1, 1) * this.shake, rand(-1, 1) * this.shake);
    if (this.state === 'night' && this.settings.shake) ctx.translate(Math.sin(this.time * 0.7) * 1.4, Math.cos(this.time * 0.53) * 1); // máy quay cầm tay
    ctx.drawImage(this.bg(), 0, 0);
    this.drawFog(ctx, 0.6);
    ctx.drawImage(this.decals, 0, 0);

    // nhân vật + hàng rào
    for (const s of this.survivorState) {
      if (s.injured) { // ngồi gục sau hàng rào
        ctx.save(); ctx.translate(0, 16);
        drawCharacter(ctx, s.x, PLAYER_FOOT - 4, 1.2, s.def.weapon, WEAPONS[s.def.weapon].len, 0, 0, CHARACTERS[s.id]);
        ctx.restore();
        ctx.fillStyle = '#fff'; ctx.fillRect(s.x - 5, PLAYER_FOOT - 116, 12, 12);
        ctx.fillStyle = '#d33'; ctx.fillRect(s.x - 1, PLAYER_FOOT - 114, 4, 8); ctx.fillRect(s.x - 3, PLAYER_FOOT - 112, 8, 4);
        continue;
      }
      drawCharacter(ctx, s.x, PLAYER_FOOT - 4, s.ang, s.def.weapon, WEAPONS[s.def.weapon].len, s.recoil, this.time, CHARACTERS[s.id]);
      if (s.lvl > 1) { ctx.fillStyle = '#ffcf4a'; ctx.font = `600 9px ${DISPLAY_FONT}`; ctx.textAlign = 'center'; ctx.fillText('★'.repeat(s.lvl - 1), s.x + 1, PLAYER_FOOT - 112); }
    }
    const aim = inGame ? this.aim : this.demoAim;
    const wid = inGame ? this.data.current : (this.data ? 'rifle' : 'pistol');
    drawHero(ctx, PLAYER_X, PLAYER_FOOT, this.aimAngle(aim), wid, WEAPONS[wid].len, this.recoil * 0.6, this.time);
    const hpRatio = inGame ? clamp(this.data.hp / barricadeMax(this.data.barricadeLevel), 0, 1) : 1;
    drawBarricade(ctx, hpRatio, this.scene);
    if (inGame) { this.drawDefenses(ctx); this.drawDefenses2(ctx); }

    // chỉ ~20 con gần hàng rào nhất được vẽ đầy đủ bóng khối
    const byX = this.zombies.filter((z) => z.alive).sort((a, b) => a.x - b.x);
    const nDetail = this.settings.hq === false ? 0 : 20;
    byX.forEach((z, i) => { z.detail = i < nDetail; });
    const sorted = [...this.zombies].sort((a, b) => (a.alive - b.alive) || (a.foot - b.foot));
    for (const z of sorted) z.draw(ctx);

    // thùng tiếp tế + dù
    for (const c of this.crates) {
      if (!c.landed) {
        ctx.strokeStyle = 'rgba(230,230,230,0.6)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(c.x - 12, c.y - 24); ctx.lineTo(c.x - 22, c.y - 58); ctx.moveTo(c.x + 12, c.y - 24); ctx.lineTo(c.x + 22, c.y - 58); ctx.stroke();
        for (let k = 0; k < 4; k++) {
          ctx.fillStyle = k % 2 ? '#e8e8e8' : '#e07a2a';
          ctx.beginPath(); ctx.moveTo(c.x, c.y - 74);
          ctx.arc(c.x, c.y - 52, 26, Math.PI + (k * Math.PI) / 4, Math.PI + ((k + 1) * Math.PI) / 4); ctx.fill();
        }
      }
      ctx.fillStyle = '#7a5a30'; ctx.fillRect(c.x - 13, c.y - 24, 26, 24);
      ctx.strokeStyle = '#4a3418'; ctx.lineWidth = 2; ctx.strokeRect(c.x - 13, c.y - 24, 26, 24);
      ctx.beginPath(); ctx.moveTo(c.x - 13, c.y - 24); ctx.lineTo(c.x + 13, c.y); ctx.moveTo(c.x + 13, c.y - 24); ctx.lineTo(c.x - 13, c.y); ctx.stroke();
      ctx.fillStyle = Math.sin(this.time * 8) > 0 ? '#ff3a2a' : '#5a1010';
      ctx.beginPath(); ctx.arc(c.x, c.y - 27, 2.5, 0, Math.PI * 2); ctx.fill();
      if (c.landed && c.life < 3 && Math.sin(this.time * 14) > 0) { ctx.strokeStyle = '#ffcf4a'; ctx.strokeRect(c.x - 15, c.y - 26, 30, 28); }
    }
    // vòng sóng tiếng rú
    for (const r of this.rings) {
      ctx.strokeStyle = `rgba(255,80,80,${(r.life / r.max) * 0.6})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
    }

    for (const p of this.projectiles) {
      if (p.type === 'grenade') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.spin);
        ctx.fillStyle = '#3c4a2a'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#888'; ctx.fillRect(-2, -8, 4, 3);
        ctx.restore();
      } else {
        if (p.t < 0) continue; // tên lửa chưa phóng
        if (p.type === 'shell') {
          ctx.fillStyle = '#2a2c30'; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rocket ? 5 : 6, p.rocket ? 2.5 : 4, 0, 0, Math.PI * 2); ctx.fill();
          if (p.rocket) { ctx.fillStyle = 'rgba(255,170,60,0.8)'; ctx.beginPath(); ctx.arc(p.x - 6, p.y + 1, 3, 0, Math.PI * 2); ctx.fill(); }
        } else if (p.type === 'gas') { // bình khí độc
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.spin);
          ctx.fillStyle = '#4a6a30'; ctx.fillRect(-4, -7, 8, 14); ctx.fillStyle = '#e0d040'; ctx.fillRect(-4, -2, 8, 3);
          ctx.restore();
        } else { // viên axit: to, phát sáng, có vệt
          ctx.fillStyle = 'rgba(180,240,60,0.35)';
          ctx.beginPath(); ctx.arc(p.x + 8, p.y - 3, 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#c8f040';
          ctx.shadowColor = '#a0ff30'; ctx.shadowBlur = 16;
          ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    this.pfx.draw(ctx);
    for (const g of this.gibs) this.drawGib(ctx, g);
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

    // tia sét của súng điện
    for (const b of this.bolts) {
      const a = b.life / b.max;
      for (const [wdt, col] of [[5, `rgba(120,200,255,${0.35 * a})`], [2, `rgba(230,245,255,${a})`]]) {
        ctx.strokeStyle = col; ctx.lineWidth = wdt;
        ctx.beginPath();
        for (let k = 0; k < b.pts.length - 1; k++) {
          const [x0, y0] = b.pts[k], [x1, y1] = b.pts[k + 1];
          ctx.moveTo(x0, y0);
          for (let q = 1; q <= 5; q++) ctx.lineTo(x0 + ((x1 - x0) * q) / 5 + (q < 5 ? rand(-7, 7) : 0), y0 + ((y1 - y0) * q) / 5 + (q < 5 ? rand(-7, 7) : 0));
        }
        ctx.stroke();
      }
    }

    if (this.weather.snow) { // tuyết rơi
      ctx.fillStyle = 'rgba(235,240,255,0.75)';
      for (const r of this.rain) { ctx.beginPath(); ctx.arc(r.x % (W + 40), r.y, r.len * 0.12, 0, Math.PI * 2); ctx.fill(); }
    }
    // vòng tín hiệu chữa lành
    for (const g of this.rings) {
      ctx.strokeStyle = `rgba(140,230,120,${g.life})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(g.x, g.y, g.r, g.r * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // mưa
    if (this.weather.rain) {
      ctx.strokeStyle = 'rgba(170,185,230,0.32)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const r of this.rain) { ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - r.len * 0.18, r.y + r.len); }
      ctx.stroke();
    }

    // bụi tro / hơi nước lơ lửng trong không khí
    const moteCol = { harbor: '220,230,240', dam: '210,220,190', base: '220,220,230' }[this.scene] || '170,160,150';
    for (const m of this.motes) {
      ctx.fillStyle = `rgba(${moteCol},${0.25 + Math.sin(this.time + m.p) * 0.12})`;
      ctx.fillRect(m.x, m.y, m.s * 1.6, m.s * 1.6);
    }
    // đêm tối hơn: chỉ đèn pin và ánh lửa mới thấy rõ
    if (inGame && this.state !== 'gameover') { ctx.fillStyle = 'rgba(4,4,14,0.2)'; ctx.fillRect(-20, -20, W + 40, H + 40); }

    // ánh sáng cộng dồn: chớp súng, vụ nổ, cửa sổ nhà
    ctx.globalCompositeOperation = 'lighter';
    if (inGame && this.data && this.data.flashlight && (this.state === 'night' || this.state === 'paused')) { // đèn pin (phải mua) rọi theo hướng ngắm
      const a = this.aimAngle();
      const fl = ctx.createRadialGradient(SHOULDER.x, SHOULDER.y, 10, SHOULDER.x, SHOULDER.y, 560);
      fl.addColorStop(0, 'rgba(255,240,200,0.16)'); fl.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = fl;
      ctx.beginPath(); ctx.moveTo(SHOULDER.x, SHOULDER.y);
      ctx.arc(SHOULDER.x, SHOULDER.y, 560, a - 0.17, a + 0.17); ctx.closePath(); ctx.fill();
    }
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
    } else if (this.scene === 'base') {
      // đèn pha tháp canh quét
      const a = Math.sin(this.time * 0.6) * 0.5 + 0.6;
      const tx = 352 + Math.cos(a) * 520, ty = 285 + Math.sin(a) * 240;
      const g = ctx.createLinearGradient(352, 285, tx, ty);
      g.addColorStop(0, 'rgba(255,245,210,0.3)');
      g.addColorStop(1, 'rgba(255,245,210,0)');
      ctx.fillStyle = g;
      const nx = -Math.sin(a) * 60, ny = Math.cos(a) * 60;
      ctx.beginPath(); ctx.moveTo(352, 285); ctx.lineTo(tx + nx, ty + ny); ctx.lineTo(tx - nx, ty - ny); ctx.fill();
      this.drawLight(ctx, 352, 285, 40, '255,240,190', 0.4);
      if (Math.sin(this.time * 3) > 0.6) this.drawLight(ctx, 870, 152, 26, '255,40,30', 0.7);
      this.drawLight(ctx, 38, 330, 70, '255,200,120', win * 0.8);
    } else if (this.scene === 'highway') {
      for (const [fx, fy] of [[420, 404], [700, 402], [880, 406]]) { // xe đang cháy
        this.drawLight(ctx, fx, fy, 90, '255,130,40', 0.22 + Math.sin(this.time * 9 + fx) * 0.05 + Math.random() * 0.04);
        if (Math.random() < 0.25) this.addParticle({ x: fx + rand(-12, 12), y: fy, vx: rand(-8, 8), vy: rand(-50, -25), life: 0.6, color: '', size: rand(3, 6), kind: 'flame' });
      }
      this.drawLight(ctx, 860, 400, 200, '255,150,90', 0.08);
    } else if (this.scene === 'capital') {
      if (Math.sin(this.time * 2.5) > 0.5) this.drawLight(ctx, 652, 72, 24, '255,40,30', 0.7);
      this.drawLight(ctx, 465, 360, 50, '255,80,60', 0.2);
      this.drawLight(ctx, 34, 360, 60, '120,160,255', 0.12 + (Math.sin(this.time * 6) > 0 ? 0.08 : 0));
    } else if (this.scene === 'dam') {
      for (let x = 330; x < W; x += 70) this.drawLight(ctx, x + 1, 268, 26, '255,210,120', 0.18 + Math.sin(this.time * 5 + x) * 0.03);
      this.drawLight(ctx, 29, 322, 70, '255,180,90', win);
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
    if (this.state === 'night' || this.state === 'paused') this.drawBlackout(ctx);

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

    if (this.state === 'interlude') {
      if (this.interKind === 'heli') this.drawRescue(ctx);
      else if (this.interKind === 'ship') this.drawShip(ctx);
      else if (this.interKind === 'broadcast') this.drawBroadcast(ctx);
      else this.drawDawn(ctx);
    }
    if (this.state === 'victory') this.drawRescue(ctx);

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

    if (inGame && hpRatio < 0.35) { // sắp vỡ: màu sắc nhạt dần
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = `rgba(128,128,128,${(1 - hpRatio / 0.35) * 0.75})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (this.splat > 0.02) { // máu bắn lên màn hình khi rào bị đánh mạnh
      for (const sp of this.splats) {
        ctx.fillStyle = `rgba(110,8,8,${this.splat * 0.55})`;
        ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r * (0.8 + this.splat * 0.4), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(80,4,4,${this.splat * 0.5})`;
        ctx.beginPath(); ctx.arc(sp.x + sp.r * 0.5, sp.y + sp.r * 0.6, sp.r * 0.35, 0, Math.PI * 2); ctx.fill();
      }
    }
    this.drawGrain(ctx, this.state === 'night' ? 0.07 : 0.05);
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

  // Đêm mất điện: tối đen, chỉ thấy quanh đèn pin và những nguồn sáng
  drawDefenses(ctx) {
    const d = this.data;
    // dây thép gai trên mặt đất trước rào
    const wl = d.wireLevel || 0;
    if (wl) {
      ctx.strokeStyle = wl > 1 ? 'rgba(190,195,205,0.85)' : 'rgba(160,165,175,0.75)';
      ctx.lineWidth = 1.3;
      for (const y of [LANE_MIN + 6, (LANE_MIN + LANE_MAX) / 2 + 4, LANE_MAX - 2]) {
        ctx.beginPath();
        for (let x = WIRE.from + 4; x < WIRE.to; x += 2) {
          const a = (x - WIRE.from) * 0.5;
          ctx.lineTo(x + Math.cos(a) * 4, y - 6 + Math.sin(a) * 6);
        }
        ctx.stroke();
        ctx.fillStyle = '#3a3026';
        for (let x = WIRE.from + 10; x < WIRE.to; x += 30) ctx.fillRect(x, y - 14, 2, 14);
      }
    }
    // mìn
    for (const m of this.mines) {
      if (m.done) continue;
      ctx.fillStyle = '#2a2c24';
      ctx.beginPath(); ctx.ellipse(m.x, m.y, 9, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a4c40'; ctx.fillRect(m.x - 3, m.y - 4, 6, 3);
      if (Math.sin(this.time * 6 + m.x) > 0.5) { ctx.fillStyle = '#ff3a2a'; ctx.beginPath(); ctx.arc(m.x, m.y - 4, 1.6, 0, Math.PI * 2); ctx.fill(); }
    }
    // tháp súng
    const lvl = Math.max(1, Math.min(3, d.turretLevel || 1));
    for (const t of this.turrets) {
      ctx.save();
      ctx.translate(t.x, t.y); ctx.scale(1.4, 1.4); ctx.translate(-t.x, -t.y);
      ctx.fillStyle = '#7c6e4d'; // bao cát kê chân
      ctx.beginPath(); ctx.ellipse(t.x, t.y + 15, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3a3f48'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(t.x, t.y); ctx.lineTo(t.x - 10, t.y + 16); ctx.moveTo(t.x, t.y); ctx.lineTo(t.x + 10, t.y + 16); ctx.moveTo(t.x, t.y); ctx.lineTo(t.x, t.y + 16); ctx.stroke();
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.ang);
      ctx.translate(-t.recoil, 0);
      ctx.fillStyle = lvl === 3 ? '#6a7484' : '#565e6a';
      ctx.fillRect(-10, -6, 24, 12);
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-10, -6, 24, 2);
      ctx.fillStyle = '#e0b040'; ctx.fillRect(-2, -6, 3, 12);
      ctx.fillStyle = '#1c1e22'; ctx.fillRect(12, -2.5, 16 + lvl * 2, 5);
      if (lvl >= 2) ctx.fillRect(12, -6, 12, 2);
      ctx.fillStyle = '#5a4a2a'; ctx.fillRect(-8, 5, 10, 7);
      ctx.fillStyle = '#c9a24a'; for (let k = 0; k < 3; k++) ctx.fillRect(-7 + k * 3, 4, 1.6, 3);
      ctx.restore();
      ctx.restore();
      // thanh nhiệt
      const heatK = t.overheat > 0 ? 1 : t.heat / TURRET.heat[lvl - 1];
      if (heatK > 0.05) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(t.x - 14, t.y - 22, 28, 3);
        ctx.fillStyle = t.overheat > 0 ? '#ff5a3a' : '#ffb040'; ctx.fillRect(t.x - 14, t.y - 22, 28 * heatK, 3);
      }
    }
  }

  drawDefenses2(ctx) {
    const d = this.data;
    if (d.shockerLevel) { // tấm điện trên mặt đất
      for (const y of [LANE_MIN + 8, (LANE_MIN + LANE_MAX) / 2 + 4, LANE_MAX - 2]) {
        ctx.fillStyle = '#2a3440'; ctx.fillRect(SHOCKER.from + 6, y - 3, SHOCKER.to - SHOCKER.from - 12, 5);
        ctx.fillStyle = this.shock.zapT > 0 ? '#bfe8ff' : 'rgba(110,190,255,0.5)';
        for (let x = SHOCKER.from + 12; x < SHOCKER.to - 8; x += 20) ctx.fillRect(x, y - 4, 6, 2);
      }
      if (Math.random() < 0.1) this.addParticle({ x: rand(SHOCKER.from, SHOCKER.to), y: rand(LANE_MIN, LANE_MAX), vx: rand(-20, 20), vy: rand(-60, -20), life: 0.2, color: '#9fdcff', size: 2 });
    }
    if (d.flameTurret) {
      const sl = FLAME_TURRET.slot;
      ctx.save(); ctx.translate(sl.x, sl.y); ctx.scale(1.3, 1.3);
      ctx.fillStyle = '#7c6e4d'; ctx.beginPath(); ctx.ellipse(0, 14, 13, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#b03a22'; roundRect(ctx, -9, -4, 10, 18, 3); ctx.fill();
      ctx.rotate(this.flameT.ang);
      ctx.fillStyle = '#3a3e46'; ctx.fillRect(-2, -4, 22, 8);
      ctx.fillStyle = '#1c1e22'; ctx.fillRect(18, -3, 8, 6);
      ctx.restore();
      if (this.flameT.cool > 0) { ctx.fillStyle = '#ff5a3a'; ctx.fillRect(sl.x - 14, sl.y - 22, 28 * (this.flameT.cool / FLAME_TURRET.cool), 3); }
    }
    if (d.mortarLevel) {
      ctx.save(); ctx.translate(MORTAR.x, MORTAR.y);
      ctx.fillStyle = '#7c6e4d'; ctx.beginPath(); ctx.ellipse(0, 4, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(-1.05);
      ctx.fillStyle = d.mortarLevel > 1 ? '#5a6050' : '#4a5040'; ctx.fillRect(-4, -6, 36, 12);
      ctx.fillStyle = '#1c1e1a'; ctx.fillRect(30, -5, 4, 10);
      ctx.restore();
      ctx.strokeStyle = '#3a3e36'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(MORTAR.x + 4, MORTAR.y - 8); ctx.lineTo(MORTAR.x + 14, MORTAR.y + 4); ctx.stroke();
    }
    if (d.teslaLevel) { // cuộn Tesla trên đỉnh rào
      const tx = TESLA_TOWER.x, ty = TESLA_TOWER.y;
      ctx.fillStyle = '#2a2e36'; ctx.fillRect(tx - 5, ty - 30, 10, 48);
      ctx.strokeStyle = '#b8823a'; ctx.lineWidth = 2;
      for (let y = ty - 26; y < ty + 14; y += 5) { ctx.beginPath(); ctx.moveTo(tx - 7, y); ctx.lineTo(tx + 7, y + 2); ctx.stroke(); }
      ctx.fillStyle = '#9aa4b0'; ctx.beginPath(); ctx.arc(tx, ty - 34, 8, 0, Math.PI * 2); ctx.fill();
      const charge = 1 - Math.max(0, this.teslaT) / TESLA_TOWER.every[d.teslaLevel];
      this.drawLight(ctx, tx, ty - 34, 30, '120,200,255', 0.15 + charge * 0.35);
    }
    for (const c of this.clouds) { // đám mây khí độc
      const a = Math.min(1, c.life / 1) * 0.28;
      const g = ctx.createRadialGradient(c.x, c.y - 20, 10, c.x, c.y - 20, GAS.radius * 1.15);
      g.addColorStop(0, `rgba(130,180,60,${a})`); g.addColorStop(1, 'rgba(110,160,50,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(c.x, c.y - 20, GAS.radius * 1.15, GAS.radius * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (d.sawLevel) { // ba lưỡi cưa xoay nửa chìm dưới đất
      for (const y of [LANE_MIN + 10, (LANE_MIN + LANE_MAX) / 2 + 4, LANE_MAX - 2]) {
        const x = SAW.to - 12, r = 15;
        ctx.save(); ctx.beginPath(); ctx.rect(x - r - 2, y - r - 2, r * 2 + 4, r + 2); ctx.clip();
        ctx.translate(x, y); ctx.rotate(this.sawAng);
        ctx.fillStyle = d.sawLevel > 1 ? '#c8ccd2' : '#a8acb2';
        ctx.beginPath();
        for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; const rr = k % 2 ? r : r - 4; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#3a3e44'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#2a2c30'; ctx.fillRect(x - r - 3, y - 1, r * 2 + 6, 4);
      }
    }
    if (d.sniperLevel) { // ổ bắn tỉa trên bao cát sau rào
      const sx = SNIPER_NEST.x, sy = SNIPER_NEST.y;
      ctx.fillStyle = '#7c6e4d'; ctx.beginPath(); ctx.ellipse(sx, sy + 12, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a4a40'; ctx.fillRect(sx - 4, sy, 8, 12);
      const t = this.sniperAim && this.sniperAim.alive ? this.sniperAim : null;
      const ang = t ? Math.atan2(t.foot - t.h * 0.5 - sy, t.x - sx) : 0.05;
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang);
      ctx.fillStyle = '#2a2c30'; ctx.fillRect(-6, -3, 34, 5); ctx.fillRect(4, -7, 10, 4);
      ctx.restore();
      if (t) { ctx.strokeStyle = 'rgba(255,40,40,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx + 20, sy); ctx.lineTo(t.x, t.foot - t.h * 0.5); ctx.stroke(); }
    }
    if (d.gasLevel) { // ống phóng bình khí
      ctx.save(); ctx.translate(GAS.x, GAS.y);
      ctx.fillStyle = '#7c6e4d'; ctx.beginPath(); ctx.ellipse(0, 4, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(-0.8); ctx.fillStyle = '#4a6a30'; ctx.fillRect(-4, -6, 30, 12); ctx.fillStyle = '#e0d040'; ctx.fillRect(10, -6, 4, 12);
      ctx.restore();
    }
    if (d.rocketLevel) { // giàn tên lửa
      ctx.save(); ctx.translate(ROCKET.x, ROCKET.y);
      ctx.fillStyle = '#7c6e4d'; ctx.beginPath(); ctx.ellipse(0, 6, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(-0.55); ctx.fillStyle = '#3e4440'; ctx.fillRect(-12, -14, 34, 20);
      ctx.fillStyle = '#1a1c1e'; for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { ctx.beginPath(); ctx.arc(20, -9 + r * 9 + c * 0, 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    for (const dr of this.drones) { // drone quadcopter
      ctx.save(); ctx.translate(dr.x, dr.y);
      ctx.fillStyle = '#2a2e36'; roundRect(ctx, -10, -4, 20, 8, 3); ctx.fill();
      ctx.strokeStyle = '#2a2e36'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-16, -6); ctx.lineTo(16, -6); ctx.stroke();
      ctx.strokeStyle = 'rgba(200,210,220,0.6)'; ctx.lineWidth = 1.5;
      const bl = 8 * Math.abs(Math.cos(this.time * 40));
      for (const rx of [-16, 16]) { ctx.beginPath(); ctx.moveTo(rx - bl, -8); ctx.lineTo(rx + bl, -8); ctx.stroke(); }
      ctx.fillStyle = '#1a1c20'; ctx.fillRect(-2, 4, 6, 5);
      ctx.fillStyle = dr.reload > 0 ? '#ffb040' : Math.sin(this.time * 8) > 0 ? '#ff3a2a' : '#5a1010';
      ctx.beginPath(); ctx.arc(8, 0, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  drawBlackout(ctx) {
    if (!this.mods.blackout) return;
    if (!this.darkCanvas) { this.darkCanvas = document.createElement('canvas'); this.darkCanvas.width = W; this.darkCanvas.height = H; }
    const g = this.darkCanvas.getContext('2d');
    const vy = hasPerk(this.data, 'vy') || this.data.floodlight;
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, W, H);
    g.fillStyle = `rgba(2,3,8,${0.92 * (1 - this.lightning * 0.8)})`;
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r, a = 1) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(0,0,0,${a})`);
      gr.addColorStop(0.6, `rgba(0,0,0,${a * 0.7})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    };
    hole(this.aim.x, this.aim.y, vy ? 170 : this.data.flashlight ? 115 : 72);
    hole(140, 430, vy ? 240 : 130);
    if (vy) { hole(420, 470, 200, 0.8); hole(640, 470, 160, 0.5); } // đèn pha của Vy
    for (const l of this.lights) hole(l.x, l.y, l.r * 0.9, Math.min(1, l.a * 3 * (l.life / l.max)));
    for (const c of this.crates) hole(c.x, c.y - 20, 60, 0.8);
    for (const z of this.zombies) if ((z.burnT > 0 || z.T.burner) && z.alive) hole(z.x, z.foot - z.h / 2, 70, 0.8);
    for (const dr of this.drones) hole(dr.x, dr.y + 60, 90, 0.6);
    ctx.drawImage(this.darkCanvas, 0, 0);
  }

  drawDawn(ctx) {
    const k = Math.min(1, (this.victoryT || 0) / 6);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgba(255,150,90,${0.5 * k})`);
    g.addColorStop(0.7, `rgba(255,200,130,${0.3 * k})`);
    g.addColorStop(1, 'rgba(60,40,40,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // Kết thúc màn 2: bình minh và sóng radio phát đi từ ăng-ten căn cứ
  drawBroadcast(ctx) {
    this.drawDawn(ctx);
    const t = this.victoryT || 0;
    for (let k = 0; k < 5; k++) {
      const r = ((t * 90 + k * 70) % 350) + 10;
      ctx.strokeStyle = `rgba(255,230,160,${0.5 * (1 - r / 360)})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(870, 152, r, Math.PI * 0.85, Math.PI * 2.15); ctx.stroke();
    }
    this.drawLight(ctx, 870, 152, 40, '255,220,140', 0.6);
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

  drawGrain(ctx, a) { // hạt nhiễu phim
    ctx.globalAlpha = a;
    const ox = Math.floor(Math.random() * 128), oy = Math.floor(Math.random() * 128);
    for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) ctx.drawImage(this.grain, x, y);
    ctx.globalAlpha = 1;
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
      ctx.fillText(L("CHẠM ĐỂ NÉM LỰU ĐẠN", "TAP TO THROW GRENADE"), gx, gy - GRENADE.radius * 0.35 - 10);
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
      ctx.fillText(this.canReload() ? L("HẾT ĐẠN · NẠP (R)", "EMPTY · RELOAD (R)") : L("HẾT ĐẠN · ĐỔI SÚNG", "EMPTY · SWITCH WEAPON"), x, y + gap + 28);
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
    const stg = stageFor(d.night);
    const label = d.night <= CAMPAIGN_NIGHTS && !d.endless ? L(`MÀN ${stg} · ĐÊM ${d.night - (stg - 1) * STAGE_LENGTH}/${STAGE_LENGTH}`, `STAGE ${stg} · NIGHT ${d.night - (stg - 1) * STAGE_LENGTH}/${STAGE_LENGTH}`) : L(`ĐÊM ${d.night} · VÔ TẬN`, `NIGHT ${d.night} · ENDLESS`);
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
    ctx.fillText(L(`HÀNG RÀO  ${Math.ceil(d.hp)} / ${max}`, `BARRICADE  ${Math.ceil(d.hp)} / ${max}`), 154, 59);
    // tiến độ đợt
    const total = this.wave.total + (this.wave.boss ? bossCountFor(d.night) : 0) + this.extraSpawns;
    const k = Math.min(1, this.stats.kills / total);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(24, 72, 190, 6);
    ctx.fillStyle = '#c0503a';
    ctx.fillRect(24, 72, 190 * k, 6);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#d9b0a0';
    ctx.font = '600 11px "Be Vietnam Pro", system-ui, sans-serif';
    ctx.fillText(L(`Còn ${Math.max(0, total - this.stats.kills)} zombie`, `${Math.max(0, total - this.stats.kills)} zombies left`), 222, 79);

    if (d.hungry) {
      ctx.fillStyle = 'rgba(160,60,20,0.85)'; roundRect(ctx, 214, 66, 70, 16, 3); ctx.fill();
      ctx.fillStyle = '#ffe0c0'; ctx.font = `600 11px ${DISPLAY_FONT}`; ctx.textAlign = 'center'; ctx.fillText(L("ĐANG ĐÓI", "HUNGRY"), 249, 78);
    }
    const w = this.weapon, st = this.weaponState;
    if (!w.infinite && st.mag + st.reserve < w.mag * 1.5 && Math.sin(this.time * 6) > 0) {
      ctx.font = `600 13px ${DISPLAY_FONT}`; ctx.textAlign = 'left'; ctx.fillStyle = '#ff7a5a';
      ctx.fillText(st.mag + st.reserve === 0 ? L("HẾT SẠCH ĐẠN", "OUT OF AMMO") : L("SẮP HẾT ĐẠN", "LOW AMMO"), 300, 34);
    }

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
      ctx.strokeText(L(`${c.n} LIÊN TIẾP!`, `${c.n} STREAK!`), 0, 0);
      ctx.fillStyle = '#ffcf4a';
      ctx.fillText(L(`${c.n} LIÊN TIẾP!`, `${c.n} STREAK!`), 0, 0);
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

// Kết cấu hạt nhiễu dùng chung
function makeGrain() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const img = g.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = Math.random() < 0.5 ? 255 : 0;
  }
  g.putImageData(img, 0, 0);
  return c;
}
