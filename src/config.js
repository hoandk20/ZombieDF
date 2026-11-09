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
export const CAMPAIGN_NIGHTS = 10;

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
};
export const WEAPON_ORDER = ['pistol', 'shotgun', 'smg', 'rifle', 'lmg'];

export const GRENADE = { dmg: 280, radius: 125, price: 90, max: 6, fuse: 0.75 };

// kind: 'upright' (đứng) hoặc 'crawl' (bò)
export const ZOMBIES = {
  walker:  { name: 'Xác sống', hp: 60,  speed: 26, dmg: 6,  atkRate: 1.2, h: 104, w: 30, reward: 10, skin: '#7f9a5c', shirt: '#5a4a3a', pants: '#2f3440', kind: 'upright' },
  runner:  { name: 'Kẻ chạy', hp: 42,  speed: 66, dmg: 4,  atkRate: 0.7, h: 98,  w: 26, reward: 15, skin: '#9db06a', shirt: '#3d4f6b', pants: '#3a2f2a', kind: 'upright' },
  crawler: { name: 'Kẻ bò', hp: 45,  speed: 18, dmg: 5,  atkRate: 1.0, h: 40,  w: 58, reward: 15, skin: '#86a066', shirt: '#4c3b4f', pants: '#2b2b2b', kind: 'crawl' },
  brute:   { name: 'Gã khổng lồ', hp: 440, speed: 13, dmg: 22, atkRate: 1.6, h: 142, w: 50, reward: 60, skin: '#5f7f48', shirt: '#6b2e2e', pants: '#24262e', kind: 'upright', heavy: true },
  spitter: { name: 'Kẻ phun axit', hp: 90,  speed: 24, dmg: 11, atkRate: 3.2, h: 108, w: 38, reward: 35, skin: '#a8b04a', shirt: '#4f5a2a', pants: '#2c2f22', kind: 'upright', ranged: true },
  titan:   { name: 'Kẻ Khổng Lồ', hp: 3200, speed: 9, dmg: 60, atkRate: 2.2, h: 220, w: 86, reward: 600, skin: '#4d6a3c', shirt: '#3a1f1f', pants: '#1c1d22', kind: 'upright', heavy: true, boss: true },
};

export function isBossNight(n) {
  return n === CAMPAIGN_NIGHTS || (n > CAMPAIGN_NIGHTS && n % 5 === 0);
}

export function waveFor(n) {
  return {
    total: Math.round(10 + n * 5 + n * n * 0.45),
    interval: Math.max(0.3, 2.2 - n * 0.16),
    hpMul: 1 + (n - 1) * 0.09,
    boss: isBossNight(n),
    weights: {
      walker: 1,
      runner: n >= 2 ? Math.min(0.15 + 0.06 * n, 0.6) : 0,
      crawler: n >= 3 ? 0.18 : 0,
      brute: n >= 4 ? Math.min(0.03 + 0.012 * n, 0.14) : 0,
      spitter: n >= 6 ? Math.min(0.08 + 0.01 * n, 0.18) : 0,
    },
  };
}

export function weatherFor(n) {
  return {
    rain: n >= 7 || (n > CAMPAIGN_NIGHTS && n % 3 === 0),
    lightning: n >= 7,
    fog: Math.min(0.08 + n * 0.02, 0.3),
    bloodMoon: isBossNight(n),
  };
}

export const barricadeMax = (lvl) => Math.round(500 * (1 + 0.35 * lvl));
export const barricadeUpgradePrice = (lvl) => Math.round(350 * Math.pow(lvl + 1, 1.45));
export const reloadMul = (lvl) => Math.pow(0.88, lvl);
export const reloadUpgradePrice = (lvl) => 500 * (lvl + 1);
export const MAX_RELOAD_LVL = 4;
export const repairKitPrice = (night) => 120 + night * 20;
