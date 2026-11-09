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
export const MAX_SURVIVORS = SURVIVOR_SLOTS.length;

export const HEADSHOT_MUL = 2.5;
export const DAY_HOURS = 10;

export const WEAPONS = {
  pistol: {
    id: 'pistol', name: 'Súng lục', dmg: 26, rate: 0.26, mag: 12, reload: 1.1,
    pellets: 1, spread: 0.012, pierce: 1, auto: false, infinite: true,
    price: 0, ammoPrice: 0, ammoPack: 0, shake: 1.2, len: 22,
  },
  shotgun: {
    id: 'shotgun', name: 'Shotgun', dmg: 17, rate: 0.75, mag: 6, reload: 2.0,
    pellets: 7, spread: 0.13, pierce: 1, auto: false, falloff: true,
    price: 700, ammoPrice: 110, ammoPack: 24, shake: 4.5, len: 34,
  },
  smg: {
    id: 'smg', name: 'Tiểu liên', dmg: 14, rate: 0.075, mag: 30, reload: 1.7,
    pellets: 1, spread: 0.055, pierce: 1, auto: true,
    price: 1400, ammoPrice: 140, ammoPack: 90, shake: 1.4, len: 30,
  },
  rifle: {
    id: 'rifle', name: 'Súng trường', dmg: 100, rate: 0.9, mag: 5, reload: 2.3,
    pellets: 1, spread: 0, pierce: 4, auto: false,
    price: 2400, ammoPrice: 150, ammoPack: 20, shake: 3.5, len: 44,
  },
  lmg: {
    id: 'lmg', name: 'Súng máy', dmg: 24, rate: 0.095, mag: 80, reload: 3.6,
    pellets: 1, spread: 0.07, pierce: 2, auto: true,
    price: 4800, ammoPrice: 320, ammoPack: 160, shake: 2, len: 42,
  },
};
export const WEAPON_ORDER = ['pistol', 'shotgun', 'smg', 'rifle', 'lmg'];

// kind: 'upright' (đứng) hoặc 'crawl' (bò)
export const ZOMBIES = {
  walker:  { hp: 60,  speed: 26, dmg: 6,  atkRate: 1.2, h: 104, w: 30, reward: 10, skin: '#7f9a5c', shirt: '#5a4a3a', pants: '#2f3440', kind: 'upright' },
  runner:  { hp: 42,  speed: 64, dmg: 4,  atkRate: 0.7, h: 98,  w: 26, reward: 15, skin: '#9db06a', shirt: '#3d4f6b', pants: '#3a2f2a', kind: 'upright' },
  crawler: { hp: 45,  speed: 17, dmg: 5,  atkRate: 1.0, h: 40,  w: 58, reward: 15, skin: '#86a066', shirt: '#4c3b4f', pants: '#2b2b2b', kind: 'crawl' },
  brute:   { hp: 440, speed: 13, dmg: 22, atkRate: 1.6, h: 142, w: 50, reward: 60, skin: '#5f7f48', shirt: '#6b2e2e', pants: '#24262e', kind: 'upright', heavy: true },
};

export function waveFor(n) {
  return {
    total: Math.round(10 + n * 5 + n * n * 0.45),
    interval: Math.max(0.32, 2.2 - n * 0.16),
    hpMul: 1 + (n - 1) * 0.09,
    weights: {
      walker: 1,
      runner: n >= 2 ? Math.min(0.15 + 0.06 * n, 0.6) : 0,
      crawler: n >= 3 ? 0.18 : 0,
      brute: n >= 4 ? Math.min(0.03 + 0.012 * n, 0.14) : 0,
    },
  };
}

export const barricadeMax = (lvl) => Math.round(500 * (1 + 0.35 * lvl));
export const barricadeUpgradePrice = (lvl) => Math.round(350 * Math.pow(lvl + 1, 1.45));
export const reloadMul = (lvl) => Math.pow(0.88, lvl);
export const reloadUpgradePrice = (lvl) => 500 * (lvl + 1);
export const MAX_RELOAD_LVL = 4;
export const repairKitPrice = (night) => 120 + night * 20;
