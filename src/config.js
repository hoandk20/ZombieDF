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
export const CAMPAIGN_NIGHTS = 60;
export const ACT_LENGTH = 10;
export const STAGE_LENGTH = 20; // 20 đêm = 1 màn
export const actFor = (n) => Math.min(6, Math.max(1, Math.ceil(n / ACT_LENGTH)));
export const stageFor = (n) => Math.min(3, Math.max(1, Math.ceil(n / STAGE_LENGTH)));
export const ACT_NAMES = { 1: 'Bến Sương', 2: 'Cảng Vọng Hải', 3: 'Đập Hồng Sơn', 4: 'Căn cứ Hồng Sơn', 5: 'Cao tốc Bắc Nam', 6: 'Thủ đô' };
export const STAGE_NAMES = { 1: 'Đường ra biển', 2: 'Mật mã Hồng Sơn', 3: 'Chuyến hàng cuối cùng' };
export const SCENES = { 1: 'town', 2: 'harbor', 3: 'dam', 4: 'base', 5: 'highway', 6: 'capital' };
export const sceneFor = (n) => SCENES[actFor(n)];
export const MAX_SQUAD = 4;
export const CAMP_INCOME = 35;
export const UPKEEP = 18; // tiền khẩu phần mỗi đồng đội mỗi sáng

// Độ khó: nhân với máu, sát thương, số lượng, tốc độ zombie và tiền thưởng
export const DIFFICULTIES = {
  easy:      { name: 'Dễ',      desc: 'Cân bằng như bản đầu. Hợp để làm quen.', hp: 0.8, dmg: 0.9, count: 0.95, speed: 1, reward: 1.15, recruit: 1.6, mate: 1, upkeep: 0.5, pack: 0.18, interval: 1 },
  normal:    { name: 'Thường',  desc: 'Zombie khỏe, nhanh, kéo đến theo bầy. Đồng đội khó tìm.', hp: 1.4, dmg: 1.0, count: 1.2, speed: 1.2, reward: 0.95, recruit: 1, mate: 0.8, upkeep: 1, pack: 0.28, interval: 0.92 },
  hard:      { name: 'Khó',     desc: 'Bầy đàn đông và hung hãn. Mỗi viên đạn đều quý.', hp: 1.8, dmg: 1.45, count: 1.4, speed: 1.35, reward: 0.82, recruit: 0.8, mate: 0.7, upkeep: 1.3, pack: 0.36, interval: 0.8 },
  nightmare: { name: 'Ác mộng', desc: 'Dành cho người đã thắng. Gần như không thể.', hp: 2.6, dmg: 2.0, count: 1.7, speed: 1.6, reward: 0.65, recruit: 0.6, mate: 0.6, upkeep: 1.6, pack: 0.48, interval: 0.65 },
};
export const DIFF_ORDER = ['easy', 'normal', 'hard', 'nightmare'];
export const diffOf = (d) => DIFFICULTIES[(d && d.difficulty) || 'normal'] || DIFFICULTIES.normal;

// Công trình phòng thủ
export const TURRET = {
  max: 2,
  price: 3200,
  upgrade: [0, 2600, 5200],            // giá lên cấp 2, 3
  dmg: [10, 15, 22],
  rate: [0.13, 0.1, 0.08],
  heat: [24, 32, 44],                  // số phát trước khi quá nhiệt
  cool: 2.6,
  slots: [{ x: 214, y: 392 }, { x: 176, y: 398 }],
};
export const MINE = { price: 180, max: 8, radius: 80, dmg: 170 };
export const WIRE = { prices: [1400, 3000], slow: [1, 0.62, 0.45], dps: [0, 5, 10], from: 238, to: 330 };
export const FLOODLIGHT_PRICE = 900;
export const SHOCKER = { prices: [2800, 4200], every: [0, 1.8, 1.25], dmg: [0, 34, 52], stun: 0.6, from: 450, to: 570 };
export const FLAME_TURRET = { price: 4200, range: 330, burn: 18, dmg: 5, spray: 3, cool: 2.2, slot: { x: 196, y: 386 } };
export const MORTAR = { prices: [5200, 4800], every: [0, 4.2, 3.2], dmg: [0, 120, 170], radius: 90, x: 46, y: 468 };
export const TESLA_TOWER = { prices: [6500, 5200], every: [0, 1.6, 1.15], dmg: [0, 45, 65], range: 430, chain: 3, x: 232, y: 352 };
export const DRONE = { price: 4800, max: 2, dmg: 13, rate: 0.12, mag: 30, reload: 2.2 };

// Mỗi chương (bản đồ) có bộ công trình phòng thủ riêng. Sang chương mới thì làm lại từ đầu.
export const DEFENSES_BY_ACT = {
  1: ['mines', 'wire'],
  2: ['turret', 'mines', 'floodlight'],
  3: ['shocker', 'wire', 'mines'],
  4: ['turret', 'flameTurret', 'floodlight'],
  5: ['mortar', 'wire', 'mines'],
  6: ['teslaTower', 'drone', 'floodlight'],
};
export const ALL_DEFENSES = ['turret', 'mines', 'wire', 'floodlight', 'shocker', 'flameTurret', 'mortar', 'teslaTower', 'drone'];
export function resetDefenses(d) {
  Object.assign(d, { turrets: 0, turretLevel: 1, mines: 0, wireLevel: 0, floodlight: false, shockerLevel: 0, flameTurret: 0, mortarLevel: 0, teslaLevel: 0, drones: 0 });
}

export const WEAPONS = {
  pistol: {
    id: 'pistol', name: 'Súng lục', dmg: 26, rate: 0.26, mag: 12, reload: 1.1,
    pellets: 1, spread: 0.012, pierce: 1, auto: false, infinite: true,
    price: 0, ammoPrice: 0, ammoPack: 0, shake: 1.2, len: 22,
    desc: 'Khẩu súng cũ của ông ngoại. Không bao giờ hết đạn.',
  },
  shotgun: {
    id: 'shotgun', name: 'Shotgun', dmg: 24, rate: 0.7, mag: 6, reload: 2.0,
    pellets: 8, spread: 0.12, pierce: 1, auto: false, falloff: true,
    price: 700, ammoPrice: 110, ammoPack: 24, shake: 4.5, len: 34,
    desc: '8 viên mỗi phát. Cực mạnh ở cự ly gần.',
  },
  smg: {
    id: 'smg', name: 'Tiểu liên', dmg: 17, rate: 0.075, mag: 30, reload: 1.7,
    pellets: 1, spread: 0.045, pierce: 1, auto: true,
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
    id: 'flamer', name: 'Súng phun lửa', dmg: 5, rate: 0.05, mag: 120, reload: 3.2,
    pellets: 1, spread: 0.12, pierce: 7, auto: true, flame: true, range: 420, burn: 14,
    price: 5200, ammoPrice: 260, ammoPack: 120, shake: 0.6, len: 40, act: 2,
    desc: 'Phun lửa tầm trung, đốt cháy tối đa 7 con phía trước. Xuyên giáp.',
  },
  launcher: {
    id: 'launcher', name: 'Súng phóng lựu', dmg: 168, rate: 1.4, mag: 4, reload: 3.2,
    pellets: 1, spread: 0.01, pierce: 1, auto: false, explosive: true, radius: 92,
    price: 6800, ammoPrice: 420, ammoPack: 6, shake: 5, len: 38, act: 2,
    desc: 'Bắn đạn nổ vào điểm ngắm. Dọn sạch bầy đàn.',
  },
  sniper: {
    id: 'sniper', name: 'Súng bắn tỉa', dmg: 270, rate: 1.25, mag: 5, reload: 2.6,
    pellets: 1, spread: 0, pierce: 6, auto: false, heavyTracer: true,
    price: 9000, ammoPrice: 380, ammoPack: 18, shake: 6, len: 50, act: 3,
    desc: 'Xuyên 6 mục tiêu trên một đường thẳng. Một phát một hàng.',
  },
  tesla: {
    id: 'tesla', name: 'Súng điện', dmg: 60, rate: 0.32, mag: 30, reload: 2.4,
    pellets: 1, spread: 0.02, pierce: 1, auto: true, chain: 5, chainRange: 130,
    price: 12500, ammoPrice: 420, ammoPack: 40, shake: 1.5, len: 40, act: 4,
    desc: 'Tia sét nhảy sang 4 con gần nhau. Xuyên giáp.',
  },
};
export const WEAPON_ORDER = ['pistol', 'shotgun', 'smg', 'rifle', 'lmg', 'flamer', 'launcher', 'sniper', 'tesla'];

export const GRENADE = { dmg: 380, radius: 100, price: 150, max: 4, fuse: 0.75 };

// kind: 'upright' (đứng) hoặc 'crawl' (bò)
export const ZOMBIES = {
  walker:  { name: 'Xác sống', hp: 60,  speed: 26, dmg: 6,  atkRate: 1.2, h: 104, w: 30, reward: 10, skin: '#9a8a66', shirt: '#4e3d27', pants: '#3b3122', kind: 'upright' },
  runner:  { name: 'Kẻ chạy', hp: 42,  speed: 66, dmg: 4,  atkRate: 0.7, h: 98,  w: 26, reward: 15, skin: '#a39470', shirt: '#3c4350', pants: '#352b20', kind: 'upright' },
  crawler: { name: 'Kẻ bò', hp: 45,  speed: 18, dmg: 5,  atkRate: 1.0, h: 40,  w: 58, reward: 15, skin: '#8f8060', shirt: '#4a3a2c', pants: '#2e281f', kind: 'crawl' },
  brute:   { name: 'Gã khổng lồ', hp: 440, speed: 13, dmg: 22, atkRate: 1.6, h: 142, w: 50, reward: 60, skin: '#7d6f52', shirt: '#5a2c22', pants: '#2a251d', kind: 'upright', heavy: true },
  spitter: { name: 'Kẻ phun axit', hp: 90,  speed: 24, dmg: 8, atkRate: 3.8, h: 108, w: 38, reward: 35, skin: '#a49a5c', shirt: '#4a4a26', pants: '#2c2a1e', kind: 'upright', ranged: true },
  riot:    { name: 'Cảnh sát bọc giáp', hp: 150, speed: 21, dmg: 9, atkRate: 1.3, h: 108, w: 34, reward: 40, skin: '#94866a', shirt: '#26324a', pants: '#1c2232', kind: 'upright', armored: true, helmet: 70 },
  bloater: { name: 'Kẻ trương phình', hp: 120, speed: 15, dmg: 55, atkRate: 0.5, h: 112, w: 56, reward: 30, skin: '#9c9460', shirt: '#55502c', pants: '#2c2a20', kind: 'upright', bomber: true },
  colossus:{ name: 'Quái Vật Cảng', hp: 6500, speed: 8, dmg: 80, atkRate: 2.4, h: 250, w: 98, reward: 1500, skin: '#6a5e48', shirt: '#2a2018', pants: '#1a1612', kind: 'upright', heavy: true, boss: true, summoner: true },
  dog:     { name: 'Chó nhiễm bệnh', hp: 50, speed: 184, dmg: 4, atkRate: 0.55, h: 46, w: 62, reward: 20, skin: '#6b5a44', shirt: '#4a3c2c', pants: '#2e261c', kind: 'dog' },
  screamer:{ name: 'Kẻ rú', hp: 110, speed: 22, dmg: 0, atkRate: 4, h: 106, w: 30, reward: 45, skin: '#b8a88a', shirt: '#5a2a3a', pants: '#2a2228', kind: 'upright', screamer: true },
  reviver: { name: 'Kẻ tái sinh', hp: 85, speed: 24, dmg: 7, atkRate: 1.2, h: 104, w: 32, reward: 30, skin: '#7a8a7a', shirt: '#2e3a3a', pants: '#22282a', kind: 'upright', revive: true },
  bounty:  { name: 'Kẻ mang hòm', hp: 320, speed: 44, dmg: 0, atkRate: 9, h: 104, w: 36, reward: 600, skin: '#a8946a', shirt: '#6a5020', pants: '#3a2c18', kind: 'upright', bounty: true },
  tyrant:  { name: 'Bạo Chúa Rừng', hp: 8500, speed: 9, dmg: 85, atkRate: 2.3, h: 240, w: 96, reward: 1800, skin: '#5e5a40', shirt: '#2a2a18', pants: '#1a1a12', kind: 'upright', heavy: true, boss: true, summoner: 'dog' },
  shielder:{ name: 'Lính mang khiên', hp: 130, speed: 22, dmg: 9, atkRate: 1.3, h: 108, w: 36, reward: 40, skin: '#8a8a6a', shirt: '#3a4a2a', pants: '#2a3020', kind: 'upright', shield: true },
  leaper:  { name: 'Kẻ nhảy', hp: 70, speed: 40, dmg: 8, atkRate: 0.9, h: 100, w: 28, reward: 30, skin: '#9a8c6a', shirt: '#4a3a30', pants: '#2a241c', kind: 'upright', leaper: true },
  burner:  { name: 'Kẻ cháy', hp: 110, speed: 28, dmg: 13, atkRate: 1.1, h: 104, w: 32, reward: 35, skin: '#5a3a28', shirt: '#2a1a12', pants: '#1a120c', kind: 'upright', burner: true },
  splitter:{ name: 'Kẻ phân thân', hp: 140, speed: 22, dmg: 8, atkRate: 1.2, h: 110, w: 40, reward: 30, skin: '#8a7a9a', shirt: '#3a2a4a', pants: '#2a2030', kind: 'upright', splitter: true },
  spawnling:{ name: 'Con non', hp: 28, speed: 64, dmg: 3, atkRate: 0.7, h: 64, w: 22, reward: 6, skin: '#a090b0', shirt: '#4a3a5a', pants: '#2a2030', kind: 'upright' },
  stalker: { name: 'Kẻ tàng hình', hp: 95, speed: 34, dmg: 10, atkRate: 1.0, h: 104, w: 28, reward: 45, skin: '#6a7a8a', shirt: '#2a3038', pants: '#1a1e24', kind: 'upright', stalker: true },
  juggernaut:{ name: 'Cỗ Máy Nghiền', hp: 9500, speed: 9, dmg: 90, atkRate: 2.2, h: 205, w: 110, reward: 2600, skin: '#6a6050', shirt: '#2a2a2e', pants: '#18181c', kind: 'upright', heavy: true, boss: true, plated: true, charger: true },
  queen:   { name: 'Nữ Hoàng Bầy Đàn', hp: 17000, speed: 8, dmg: 100, atkRate: 2.0, h: 245, w: 104, reward: 6000, skin: '#b0a0c0', shirt: '#3a2040', pants: '#1a1020', kind: 'upright', heavy: true, boss: true, queen: true, bomber: false },
  zero:    { name: 'Mẫu Thể Số 0', hp: 14000, speed: 10, dmg: 95, atkRate: 2.0, h: 232, w: 90, reward: 4000, skin: '#c8c0b4', shirt: '#3a1820', pants: '#1a1014', kind: 'upright', heavy: true, boss: true, phases: true },
  titan:   { name: 'Kẻ Khổng Lồ', hp: 3200, speed: 9, dmg: 60, atkRate: 2.2, h: 220, w: 86, reward: 600, skin: '#74664a', shirt: '#3a2418', pants: '#1f1b16', kind: 'upright', heavy: true, boss: true },
};

export function isBossNight(n) {
  return n >= 10 && n % 5 === 0;
}
export function bossTypeFor(n, idx = 0) {
  if (n === 20) return 'colossus';
  if (n === 30) return 'tyrant';
  if (n === 40) return 'zero';
  if (n === 45) return 'colossus';
  if (n === 50) return 'juggernaut';
  if (n === 55) return idx === 0 ? 'juggernaut' : 'tyrant';
  if (n === 60) return 'queen';
  if (n > CAMPAIGN_NIGHTS) return ['titan', 'colossus', 'tyrant', 'zero', 'juggernaut', 'queen'][Math.floor(n / 5) % 6];
  return 'titan';
}
export const bossCountFor = (n) => (n === 35 || n === 55 ? 2 : 1); // đêm 35, 55: hai con trùm

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
  41: { airdrops: 2 },
  42: { rush: true },
  43: { blackout: true },
  44: { airdrops: 2, bounty: true },
  46: { horde: true },
  47: { blackout: true, airdrops: 1 },
  48: { rush: true, bounty: true },
  49: { airdrops: 3 },
  51: { airdrops: 2 },
  52: { blackout: true },
  53: { horde: true, airdrops: 1 },
  54: { bounty: true },
  56: { blackout: true, rush: true },
  57: { airdrops: 3, bounty: true },
  58: { horde: true },
  59: { blackout: true, airdrops: 2 },
};
export function modsFor(n) {
  if (n <= CAMPAIGN_NIGHTS) {
    const local = ((n - 1) % STAGE_LENGTH) + 1;
    const m = { airdrops: 0, ...(MODS[n] || {}) };
    // 3 đêm khởi động đầu màn mới: chỉ giữ thả dù tiếp tế, bỏ các đêm đặc biệt khó
    if (n > STAGE_LENGTH && local <= 3) return { airdrops: Math.max(1, m.airdrops) };
    return m;
  }
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
  // mỗi màn bắt đầu lại tay trắng nên sức mạnh zombie tính theo đêm trong màn, cộng thêm một bậc mỗi màn
  const st = n <= CAMPAIGN_NIGHTS ? stageFor(n) : Math.ceil(n / STAGE_LENGTH);
  const local = n <= CAMPAIGN_NIGHTS ? ((n - 1) % STAGE_LENGTH) + 1 : n;
  const up = n <= CAMPAIGN_NIGHTS ? st - 1 : 0;
  let total = 10 + Math.min(local, 20) * 5 + Math.min(local, 12) ** 2 * 0.45 + up * 8 + (n > CAMPAIGN_NIGHTS ? (n - 20) * 1.2 : 0);
  let interval = Math.max(0.3, 2.2 - local * 0.16 - up * 0.1);
  if (m.rush) total *= 0.8;
  if (m.horde) { total *= 1.35; interval *= 0.65; }
  // 3 đêm khởi động đầu mỗi màn mới: zombie yếu, ít quái nặng, thưởng nhiều để kịp tích tiền
  const grace = n <= CAMPAIGN_NIGHTS && st > 1 && local <= 3;
  const ramp = n <= CAMPAIGN_NIGHTS && st > 1 && local <= 5;
  const gk = ramp ? [0.5, 0.6, 0.75, 0.9, 0.95][local - 1] : 1;
  if (grace) { total *= 0.6 + 0.1 * (local - 1); interval *= 1.25; }
  // 2 đêm đầu của chương thứ hai trong màn: hàng rào vừa dựng lại nên bầy đàn đến thưa hơn
  const settle = n <= CAMPAIGN_NIGHTS && (local === 11 || local === 12);
  if (settle) { total *= local === 11 ? 0.7 : 0.85; interval *= local === 11 ? 1.2 : 1.1; }
  const w = {
    grace,
    local,
    settle,
    rewardMul: grace ? 1.4 : settle ? 1.15 : 1,
    total: Math.round(total),
    interval,
    hpMul: (n <= CAMPAIGN_NIGHTS ? 1 + (local - 1) * 0.11 + up * 0.25 : 1 + 19 * 0.11 + (n - 20) * 0.06) * gk * (settle ? (local === 11 ? 0.85 : 0.92) : 1),
    dmgMul: (n <= CAMPAIGN_NIGHTS ? 1 + (local - 1) * 0.02 + up * 0.08 : 1 + (n - 1) * 0.02) * (grace ? 0.75 : 1),
    speedMul: m.rush ? 1.3 : 1,
    boss: isBossNight(n),
    mods: m,
    weights: {
      walker: 1,
      runner: n >= 2 ? Math.min(0.15 + 0.06 * n, 0.6) : 0,
      crawler: n >= 3 ? 0.18 : 0,
      brute: n >= 4 ? Math.min(0.03 + 0.012 * n, 0.14) : 0,
      spitter: n >= 6 ? Math.min(0.06 + 0.006 * n, 0.12) : 0,
      riot: n >= 11 ? Math.min(0.12 + 0.015 * (n - 11), 0.28) : 0,
      bloater: n >= 12 ? Math.min(0.08 + 0.01 * (n - 12), 0.16) : 0,
      dog: n >= 22 ? (m.horde ? 0.35 : 0.2) : 0,
      screamer: n >= 24 ? 0.07 : 0,
      reviver: n >= 27 ? 0.16 : 0,
      shielder: n >= 32 ? 0.12 : 0,
      leaper: n >= 42 ? 0.14 : 0,
      burner: n >= 44 ? 0.12 : 0,
      splitter: n >= 52 ? 0.13 : 0,
      stalker: n >= 54 ? 0.11 : 0,
    },
  };
  if (grace) for (const k of ['brute', 'riot', 'spitter', 'bloater', 'shielder', 'burner', 'splitter', 'reviver', 'screamer', 'stalker', 'leaper']) w.weights[k] *= 0.25;
  return w;
}

export function weatherFor(n) {
  return {
 rain: (n >= 7 && n <= 10) || [16, 17, 19, 25, 28, 34, 35, 46, 49, 55, 58].includes(n) || (n > CAMPAIGN_NIGHTS && n % 3 === 0),
    lightning: (n >= 7 && n <= 10) || [16, 17, 28, 34, 35, 49, 58].includes(n),
    fog: n > 50 ? 0.16 : n > 40 ? 0.2 : n > 30 ? 0.12 : n > 20 ? (n === 28 ? 0.4 : 0.22) : n > 10 ? Math.min(0.2 + (n - 10) * 0.02, 0.38) : Math.min(0.08 + n * 0.02, 0.3),
    bloodMoon: isBossNight(n),
  };
}

export const barricadeMax = (lvl) => Math.round(500 * (1 + 0.35 * lvl));
export const barricadeUpgradePrice = (lvl) => Math.round(350 * Math.pow(lvl + 1, 1.45));
export const reloadMul = (lvl) => Math.pow(0.88, lvl);
export const reloadUpgradePrice = (lvl) => 500 * (lvl + 1);
export const MAX_RELOAD_LVL = 4;
export const repairKitPrice = (night) => 120 + night * 20;
export const dmgMul = (lvl) => 1 + 0.08 * lvl;
export const dmgUpgradePrice = (lvl) => Math.round(900 * Math.pow(lvl + 1, 1.2));
export const MAX_DMG_LVL = 8;

// "Đạo diễn" bầy đàn: mức đe doạ tăng khi hàng rào gần như không bị xây xước, giảm khi suýt thua
export const THREAT = {
  easy:      { min: 0.8, max: 1.25, up: 0.08 },
  normal:    { min: 0.85, max: 1.35, up: 0.1 },
  hard:      { min: 0.95, max: 1.8, up: 0.14 },
  nightmare: { min: 1.1, max: 3.6, up: 0.3 },
};
export function nextThreat(d, dmgRatio) {
  const T = THREAT[d.difficulty || 'normal'] || THREAT.normal;
  let t = d.threat || 1;
  if (dmgRatio < 0.06) t += T.up;            // không xây xước gì
  else if (dmgRatio < 0.15) t += T.up * 0.6;
  else if (dmgRatio < 0.3) t += T.up * 0.2;
  else if (dmgRatio > 0.65) t -= 0.25;       // suýt thua: nới tay
  else if (dmgRatio > 0.45) t -= 0.1;
  return Math.max(T.min, Math.min(T.max, Math.round(t * 100) / 100));
}
export function eliteChance(n, threat) {
  const local = n <= CAMPAIGN_NIGHTS ? ((n - 1) % STAGE_LENGTH) + 1 : n;
  if (local < 9) return 0;
  return Math.min(0.18, (0.03 + (local - 9) * 0.004 + (n > STAGE_LENGTH ? 0.02 : 0)) * threat);
}
export const mateLevel = (xp) => (xp >= 60 ? 3 : xp >= 20 ? 2 : 1);
export const MATE_XP = [0, 20, 60];
