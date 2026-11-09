// Kích thước logic của màn chơi (được scale theo màn hình thực tế)
export const W = 960;
export const H = 540;

export const HORIZON = 420;          // đường chân trời / mép đất
export const LANE_MIN = 440;         // vị trí chân zombie xa nhất
export const LANE_MAX = 512;         // vị trí chân zombie gần nhất
export const BARRICADE_BACK = 158;   // mép sau hàng rào
export const BARRICADE_X = 238;      // mép trước hàng rào (zombie dừng ở đây)
export const BARRICADE_TOP = 400;

export const PLAYER_X = 120;
export const PLAYER_FOOT = 478;
export const SHOULDER = { x: PLAYER_X + 4, y: PLAYER_FOOT - 76 };

export const SURVIVOR_SLOTS = [86, 54, 144, 24];

export const HEADSHOT_MUL = 2.5;
export const DAY_HOURS = 10;
export const CAMPAIGN_NIGHTS = 40;
export const ACT_LENGTH = 10;
export const STAGE_LENGTH = 20; // 20 đêm = 1 màn
export const actFor = (n) => Math.min(4, Math.max(1, Math.ceil(n / ACT_LENGTH)));
export const stageFor = (n) => Math.min(2, Math.max(1, Math.ceil(n / STAGE_LENGTH)));
export const ACT_NAMES = { 1: 'Bến Sương', 2: 'Cảng Vọng Hải', 3: 'Đập Hồng Sơn', 4: 'Căn cứ Hồng Sơn' };
export const STAGE_NAMES = { 1: 'Đường ra biển', 2: 'Mật mã Hồng Sơn' };
export const SCENES = { 1: 'town', 2: 'harbor', 3: 'dam', 4: 'base' };
export const sceneFor = (n) => SCENES[actFor(n)];
export const MAX_SQUAD = 4;
export const CAMP_INCOME = 35;

export const WEAPONS = {
  pistol: {
    id: 'pistol', name: 'Súng lục', dmg: 26, rate: 0.26, mag: 12, reload: 1.1,
    pellets: 1, spread: 0.012, pierce: 1, auto: false, infinite: true,
    price: 0, ammoPrice: 0, ammoPack: 0, shake: 1.2, len: 22,
    desc: 'Khẩu súng cũ của ông ngoại. Không bao giờ hết đạn.',
  },
  shotgun: {
    id: 'shotgun', name: 'Shotgun', dmg: 17, rate: 0.75, mag: 6, reload: 2.0,
    pellets: 7, spread: 0.13, pierce: 1, auto: false, falloff: true,
    price: 700, ammoPrice: 110, ammoPack: 24, shake: 4.5, len: 34,
    desc: '7 viên mỗi phát. Cực mạnh ở cự ly gần.',
  },
  smg: {
    id: 'smg', name: 'Tiểu liên', dmg: 14, rate: 0.075, mag: 30, reload: 1.7,
    pellets: 1, spread: 0.055, pierce: 1, auto: true,
    price: 1400, ammoPrice: 140, ammoPack: 90, shake: 1.4, len: 30,
    desc: 'Giữ để xả đạn. Tốt khi bị bầy đàn áp sát.',
  },
  rifle: {
    id: 'rifle', name: 'Súng trường', dmg: 100, rate: 0.9, mag: 5, reload: 2.3,
    pellets: 1, spread: 0, pierce: 4, auto: false,
    price: 2400, ammoPrice: 150, ammoPack: 20, shake: 3.5, len: 44,
    desc: 'Xuyên 4 mục tiêu. Một phát vào đầu là đủ.',
  },
  lmg: {
    id: 'lmg', name: 'Súng máy', dmg: 24, rate: 0.095, mag: 80, reload: 3.6,
    pellets: 1, spread: 0.07, pierce: 2, auto: true,
    price: 4800, ammoPrice: 320, ammoPack: 160, shake: 2, len: 42,
    desc: 'Băng 80 viên, xuyên 2. Nạp đạn rất lâu.',
  },
  flamer: {
    id: 'flamer', name: 'Súng phun lửa', dmg: 7, rate: 0.05, mag: 120, reload: 3.2,
    pellets: 1, spread: 0.1, pierce: 4, auto: true, flame: true, range: 330, burn: 16,
    price: 5200, ammoPrice: 260, ammoPack: 120, shake: 0.6, len: 40, act: 2,
    desc: 'Phun lửa tầm gần, đốt cháy cả đám. Xuyên giáp.',
  },
  launcher: {
    id: 'launcher', name: 'Súng phóng lựu', dmg: 210, rate: 1.0, mag: 4, reload: 3.0,
    pellets: 1, spread: 0.01, pierce: 1, auto: false, explosive: true, radius: 105,
    price: 6800, ammoPrice: 300, ammoPack: 8, shake: 5, len: 38, act: 2,
    desc: 'Bắn đạn nổ vào điểm ngắm. Dọn sạch bầy đàn.',
  },
  sniper: {
    id: 'sniper', name: 'Súng bắn tỉa', dmg: 280, rate: 1.25, mag: 5, reload: 2.6,
    pellets: 1, spread: 0, pierce: 8, auto: false, heavyTracer: true,
    price: 9000, ammoPrice: 380, ammoPack: 18, shake: 6, len: 50, act: 3,
    desc: 'Xuyên 8 mục tiêu trên một đường thẳng. Một phát một hàng.',
  },
  tesla: {
    id: 'tesla', name: 'Súng điện', dmg: 55, rate: 0.32, mag: 30, reload: 2.4,
    pellets: 1, spread: 0.02, pierce: 1, auto: true, chain: 5, chainRange: 150,
    price: 12500, ammoPrice: 420, ammoPack: 40, shake: 1.5, len: 40, act: 4,
    desc: 'Tia sét nhảy sang 5 con gần nhau. Xuyên giáp.',
  },
};
export const WEAPON_ORDER = ['pistol', 'shotgun', 'smg', 'rifle', 'lmg', 'flamer', 'launcher', 'sniper', 'tesla'];

export const GRENADE = { dmg: 280, radius: 125, price: 90, max: 6, fuse: 0.75 };

// kind: 'upright' (đứng) hoặc 'crawl' (bò)
export const ZOMBIES = {
  walker:  { name: 'Xác sống', hp: 60,  speed: 26, dmg: 6,  atkRate: 1.2, h: 104, w: 30, reward: 10, skin: '#9a8a66', shirt: '#4e3d27', pants: '#3b3122', kind: 'upright' },
  runner:  { name: 'Kẻ chạy', hp: 42,  speed: 66, dmg: 4,  atkRate: 0.7, h: 98,  w: 26, reward: 15, skin: '#a39470', shirt: '#3c4350', pants: '#352b20', kind: 'upright' },
  crawler: { name: 'Kẻ bò', hp: 45,  speed: 18, dmg: 5,  atkRate: 1.0, h: 40,  w: 58, reward: 15, skin: '#8f8060', shirt: '#4a3a2c', pants: '#2e281f', kind: 'crawl' },
  brute:   { name: 'Gã khổng lồ', hp: 440, speed: 13, dmg: 22, atkRate: 1.6, h: 142, w: 50, reward: 60, skin: '#7d6f52', shirt: '#5a2c22', pants: '#2a251d', kind: 'upright', heavy: true },
  spitter: { name: 'Kẻ phun axit', hp: 90,  speed: 24, dmg: 11, atkRate: 3.2, h: 108, w: 38, reward: 35, skin: '#a49a5c', shirt: '#4a4a26', pants: '#2c2a1e', kind: 'upright', ranged: true },
  riot:    { name: 'Cảnh sát bọc giáp', hp: 150, speed: 21, dmg: 9, atkRate: 1.3, h: 108, w: 34, reward: 40, skin: '#94866a', shirt: '#26324a', pants: '#1c2232', kind: 'upright', armored: true, helmet: 70 },
  bloater: { name: 'Kẻ trương phình', hp: 120, speed: 15, dmg: 55, atkRate: 0.5, h: 112, w: 56, reward: 30, skin: '#9c9460', shirt: '#55502c', pants: '#2c2a20', kind: 'upright', bomber: true },
  colossus:{ name: 'Quái Vật Cảng', hp: 6500, speed: 8, dmg: 80, atkRate: 2.4, h: 250, w: 98, reward: 1500, skin: '#6a5e48', shirt: '#2a2018', pants: '#1a1612', kind: 'upright', heavy: true, boss: true, summoner: true },
  dog:     { name: 'Chó nhiễm bệnh', hp: 50, speed: 92, dmg: 4, atkRate: 0.55, h: 46, w: 62, reward: 20, skin: '#6b5a44', shirt: '#4a3c2c', pants: '#2e261c', kind: 'dog' },
  screamer:{ name: 'Kẻ rú', hp: 110, speed: 22, dmg: 0, atkRate: 4, h: 106, w: 30, reward: 45, skin: '#b8a88a', shirt: '#5a2a3a', pants: '#2a2228', kind: 'upright', screamer: true },
  reviver: { name: 'Kẻ tái sinh', hp: 85, speed: 24, dmg: 7, atkRate: 1.2, h: 104, w: 32, reward: 30, skin: '#7a8a7a', shirt: '#2e3a3a', pants: '#22282a', kind: 'upright', revive: true },
  bounty:  { name: 'Kẻ mang hòm', hp: 320, speed: 44, dmg: 0, atkRate: 9, h: 104, w: 36, reward: 600, skin: '#a8946a', shirt: '#6a5020', pants: '#3a2c18', kind: 'upright', bounty: true },
  tyrant:  { name: 'Bạo Chúa Rừng', hp: 8500, speed: 9, dmg: 85, atkRate: 2.3, h: 240, w: 96, reward: 1800, skin: '#5e5a40', shirt: '#2a2a18', pants: '#1a1a12', kind: 'upright', heavy: true, boss: true, summoner: 'dog' },
  zero:    { name: 'Mẫu Thể Số 0', hp: 14000, speed: 10, dmg: 95, atkRate: 2.0, h: 232, w: 90, reward: 4000, skin: '#c8c0b4', shirt: '#3a1820', pants: '#1a1014', kind: 'upright', heavy: true, boss: true, phases: true },
  titan:   { name: 'Kẻ Khổng Lồ', hp: 3200, speed: 9, dmg: 60, atkRate: 2.2, h: 220, w: 86, reward: 600, skin: '#74664a', shirt: '#3a2418', pants: '#1f1b16', kind: 'upright', heavy: true, boss: true },
};

export function isBossNight(n) {
  return n >= 10 && n % 5 === 0;
}
export function bossTypeFor(n) {
  if (n === 20) return 'colossus';
  if (n === 30) return 'tyrant';
  if (n === 40) return 'zero';
  if (n > CAMPAIGN_NIGHTS) return ['titan', 'colossus', 'tyrant', 'zero'][Math.floor(n / 5) % 4];
  return 'titan';
}
export const bossCountFor = (n) => (n === 35 ? 2 : 1); // đêm 35: hai Kẻ Khổng Lồ

// Mỗi đêm một "điểm nhấn" để người chơi không chán
const MODS = {
  5: { airdrops: 2 }, 9: { airdrops: 2 }, 14: { airdrops: 2 }, 18: { airdrops: 3 },
  21: { airdrops: 2 },
  22: { rush: true },
  23: { blackout: true },
  24: { airdrops: 2 },
  26: { bounty: true, rush: true },
  27: { airdrops: 1 },
  28: { airdrops: 3 },
  29: { horde: true },
  31: { airdrops: 2 },
  32: { blackout: true },
  33: { bounty: true },
  34: { airdrops: 3 },
  36: { rush: true, airdrops: 1 },
  37: { blackout: true, bounty: true },
  38: { horde: true },
  39: { airdrops: 3, bounty: true },
};
export function modsFor(n) {
  if (n <= CAMPAIGN_NIGHTS) return { airdrops: 0, ...(MODS[n] || {}) };
  return { airdrops: n % 3 === 0 ? 2 : 0, blackout: n % 4 === 0, bounty: n % 7 === 0, rush: n % 6 === 0, horde: n % 8 === 0 };
}
export const MOD_INFO = {
  blackout: { icon: '🔦', name: 'Mất điện', desc: 'Tối đen như mực. Chỉ thấy quanh đèn pin, chớp súng và vụ nổ.' },
  airdrops: { icon: '🪂', name: 'Thả dù tiếp tế', desc: 'Bắn trúng thùng hàng đang rơi để nhận đạn, tiền hoặc lựu đạn.' },
  bounty: { icon: '💰', name: 'Kẻ mang hòm', desc: 'Một zombie mang của cải sẽ xuất hiện rồi bỏ chạy. Hạ nó để nhận thưởng lớn.' },
  rush: { icon: '⚡', name: 'Đêm tốc độ', desc: 'Zombie di chuyển nhanh hơn 30%, nhưng ít hơn.' },
  horde: { icon: '🌊', name: 'Đêm bầy đàn', desc: 'Số lượng zombie tăng mạnh và kéo đến dồn dập.' },
};

export function waveFor(n) {
  const m = modsFor(n);
  let total = 10 + Math.min(n, 20) * 5 + Math.min(n, 12) ** 2 * 0.45 + Math.max(0, n - 20) * 1.5;
  let interval = Math.max(0.3, 2.2 - n * 0.16);
  if (m.rush) total *= 0.8;
  if (m.horde) { total *= 1.35; interval *= 0.65; }
  return {
    total: Math.round(total),
    interval,
    hpMul: 1 + Math.min(n - 1, 19) * 0.09 + Math.max(0, n - 20) * 0.06,
    speedMul: m.rush ? 1.3 : 1,
    boss: isBossNight(n),
    mods: m,
    weights: {
      walker: 1,
      runner: n >= 2 ? Math.min(0.15 + 0.06 * n, 0.6) : 0,
      crawler: n >= 3 ? 0.18 : 0,
      brute: n >= 4 ? Math.min(0.03 + 0.012 * n, 0.14) : 0,
      spitter: n >= 6 ? Math.min(0.08 + 0.01 * n, 0.18) : 0,
      riot: n >= 11 ? Math.min(0.12 + 0.015 * (n - 11), 0.28) : 0,
      bloater: n >= 12 ? Math.min(0.08 + 0.01 * (n - 12), 0.16) : 0,
      dog: n >= 22 ? (m.horde ? 0.35 : 0.2) : 0,
      screamer: n >= 24 ? 0.07 : 0,
      reviver: n >= 27 ? 0.16 : 0,
    },
  };
}

export function weatherFor(n) {
  return {
    rain: (n >= 7 && n <= 10) || [16, 17, 19, 25, 28, 34, 35].includes(n) || (n > CAMPAIGN_NIGHTS && n % 3 === 0),
    lightning: (n >= 7 && n <= 10) || [16, 17, 28, 34, 35].includes(n),
    fog: n > 30 ? 0.12 : n > 20 ? (n === 28 ? 0.4 : 0.22) : n > 10 ? Math.min(0.2 + (n - 10) * 0.02, 0.38) : Math.min(0.08 + n * 0.02, 0.3),
    bloodMoon: isBossNight(n),
  };
}

export const barricadeMax = (lvl) => Math.round(500 * (1 + 0.35 * lvl));
export const barricadeUpgradePrice = (lvl) => Math.round(350 * Math.pow(lvl + 1, 1.45));
export const reloadMul = (lvl) => Math.pow(0.88, lvl);
export const reloadUpgradePrice = (lvl) => 500 * (lvl + 1);
export const MAX_RELOAD_LVL = 4;
export const repairKitPrice = (night) => 120 + night * 20;
export const dmgMul = (lvl) => 1 + 0.12 * lvl;
export const dmgUpgradePrice = (lvl) => 700 * (lvl + 1);
export const MAX_DMG_LVL = 10;
export const mateLevel = (xp) => (xp >= 60 ? 3 : xp >= 20 ? 2 : 1);
export const MATE_XP = [0, 20, 60];
