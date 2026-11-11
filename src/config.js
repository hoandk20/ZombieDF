// Kích thước logic của màn chơi (được scale theo màn hình thực tế)
export const W = 960;
export const H = 540;

export const HORIZON = 340;          // đường chân trời / mép đất
export const LANE_MIN = 352;         // vị trí chân zombie xa nhất
export const LANE_MAX = 532;         // vị trí chân zombie gần nhất
export const BARRICADE_BACK = 158;   // mép sau hàng rào
export const BARRICADE_X = 238;      // mép trước hàng rào (zombie dừng ở đây)
export const BARRICADE_TOP = 336;

export const PLAYER_X = 120;
export const PLAYER_FOOT = 412; // đứng trên bục gỗ sau hàng rào
export const SHOULDER = { x: PLAYER_X + 4, y: PLAYER_FOOT - 76 };

export const SURVIVOR_SLOTS = [86, 54, 144, 24];

export const HEADSHOT_MUL = 2.5;
export const DAY_HOURS = 10;
export const CAMPAIGN_NIGHTS = 100;
export const ACT_LENGTH = 10;
export const STAGE_LENGTH = 20; // 20 đêm = 1 màn
export const actFor = (n) => Math.min(10, Math.max(1, Math.ceil(n / ACT_LENGTH)));
export const stageFor = (n) => Math.min(5, Math.max(1, Math.ceil(n / STAGE_LENGTH)));
// chương đầu của mỗi màn (sang chương này là bắt đầu lại tay trắng)
export const isStageStartAct = (act) => act > 1 && act % 2 === 1;
export const ACT_NAMES = { 1: 'Bến Sương', 2: 'Cảng Vọng Hải', 3: 'Đập Hồng Sơn', 4: 'Căn cứ Hồng Sơn', 5: 'Cao tốc Bắc Nam', 6: 'Thủ đô', 7: 'Nhà máy Thành Nam', 8: 'Sân bay Bắc Thành', 9: 'Rừng tuyết biên giới', 10: 'Trạm Hải Đăng' };
export const STAGE_NAMES = { 1: 'Đường ra biển', 2: 'Mật mã Hồng Sơn', 3: 'Chuyến hàng cuối cùng', 4: 'Biến chủng', 5: 'Tần số cuối cùng' };
export const SCENES = { 1: 'town', 2: 'harbor', 3: 'dam', 4: 'base', 5: 'highway', 6: 'capital', 7: 'factory', 8: 'airport', 9: 'snow', 10: 'lighthouse' };
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
  slots: [{ x: 214, y: 328 }, { x: 176, y: 334 }],
};
export const MINE = { price: 180, max: 8, radius: 80, dmg: 170 };
export const WIRE = { prices: [1400, 3000], slow: [1, 0.62, 0.45], dps: [0, 5, 10], from: 238, to: 330 };
export const FLOODLIGHT_PRICE = 900;
export const SHOCKER = { prices: [2800, 4200], every: [0, 3, 2.2], dmg: [0, 18, 26], stun: 0.25, maxHit: [0, 5, 8], from: 450, to: 570 };
export const FLAME_TURRET = { price: 4200, range: 330, burn: 18, dmg: 5, spray: 3, cool: 2.2, slot: { x: 196, y: 322 } };
export const MORTAR = { prices: [5200, 4800], every: [0, 4.2, 3.2], dmg: [0, 120, 170], radius: 90, x: 46, y: 468 };
export const TESLA_TOWER = { prices: [6500, 5200], every: [0, 1.6, 1.15], dmg: [0, 45, 65], range: 430, chain: 3, x: 232, y: 288 };
export const DRONE = { price: 4800, max: 2, dmg: 13, rate: 0.12, mag: 30, reload: 2.2 };
// Vũ khí tự động mới
export const SAW = { prices: [1500, 2600], dps: [0, 12, 22], from: 238, to: 305 };                       // lưỡi cưa quay sát rào
export const SNIPER_NEST = { prices: [3600, 4200], every: [0, 2.6, 1.9], dmg: [0, 140, 200], pierce: 3, x: 186, y: 296 }; // ổ bắn tỉa tự động
export const GAS = { prices: [3000, 3800], every: [0, 6, 4.5], dps: [0, 20, 30], radius: 85, life: 4, slow: 0.8, x: 70, y: 470 }; // máy phóng khí độc
export const ROCKET = { prices: [5600, 5000], every: [0, 5, 3.8], salvo: [0, 3, 4], dmg: [0, 95, 125], radius: 62, x: 100, y: 452 }; // giàn tên lửa

// Mỗi chương (bản đồ) có bộ công trình phòng thủ riêng. Sang chương mới thì làm lại từ đầu.
export const DEFENSES_BY_ACT = {
  1: ['saw', 'turret', 'mines', 'wire'],
  2: ['turret', 'flameTurret', 'gas', 'mines', 'floodlight'],
  3: ['shocker', 'sniperNest', 'saw', 'wire', 'mines'],
  4: ['turret', 'flameTurret', 'mortar', 'sniperNest', 'floodlight'],
  5: ['mortar', 'rocket', 'shocker', 'wire', 'mines'],
  6: ['teslaTower', 'drone', 'rocket', 'gas', 'floodlight'],
  7: ['flameTurret', 'gas', 'saw', 'turret', 'mines'],
  8: ['turret', 'drone', 'rocket', 'sniperNest', 'floodlight'],
  9: ['shocker', 'sniperNest', 'mortar', 'saw', 'wire', 'mines'],
  10: ['teslaTower', 'drone', 'rocket', 'mortar', 'gas', 'floodlight'],
};
export const ALL_DEFENSES = ['turret', 'mines', 'wire', 'floodlight', 'shocker', 'flameTurret', 'mortar', 'teslaTower', 'drone', 'saw', 'sniperNest', 'gas', 'rocket'];
export function resetDefenses(d) {
  Object.assign(d, { turrets: 0, turretLevel: 1, mines: 0, wireLevel: 0, floodlight: false, shockerLevel: 0, flameTurret: 0, mortarLevel: 0, teslaLevel: 0, drones: 0, sawLevel: 0, sniperLevel: 0, gasLevel: 0, rocketLevel: 0 });
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
    id: 'tesla', name: 'Súng điện', dmg: 64, rate: 0.28, mag: 40, reload: 2.2,
    pellets: 1, spread: 0.02, pierce: 1, auto: true, chain: 5, chainRange: 140,
    price: 12500, ammoPrice: 380, ammoPack: 120, shake: 1.5, len: 40, act: 4,
    desc: 'Tia sét nhảy sang 5 con gần nhau, làm tê liệt trong chốc lát. Xuyên giáp.',
  },
};
WEAPONS.cryo = {
  id: 'cryo', name: 'Súng phun băng', dmg: 10, rate: 0.05, mag: 150, reload: 3.0,
  pellets: 1, spread: 0.12, pierce: 8, auto: true, flame: true, cryo: true, range: 440, burn: 0, freeze: 1.4,
  price: 15000, ammoPrice: 320, ammoPack: 150, shake: 0.6, len: 42, act: 7,
  desc: 'Phun khí nitơ lỏng của nhà máy. Làm chậm mạnh tối đa 8 con, zombie bị đông cứng chịu thêm 30% sát thương.',
};
WEAPONS.railgun = {
  id: 'railgun', name: 'Súng điện từ', dmg: 520, rate: 1.6, mag: 4, reload: 2.8,
  pellets: 1, spread: 0, pierce: 14, auto: false, heavyTracer: true, rail: true,
  price: 19000, ammoPrice: 480, ammoPack: 16, shake: 8, len: 56, act: 8,
  desc: 'Hoàn tự lắp từ tụ điện máy bay. Một phát xuyên cả hàng, không giáp nào chặn nổi.',
};
export const WEAPON_ORDER = ['pistol', 'shotgun', 'smg', 'rifle', 'lmg', 'flamer', 'launcher', 'sniper', 'tesla', 'cryo', 'railgun'];

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
  dog:     { name: 'Chó nhiễm bệnh', hp: 50, speed: 184, dmg: 3, atkRate: 0.55, h: 46, w: 62, reward: 20, skin: '#6b5a44', shirt: '#4a3c2c', pants: '#2e261c', kind: 'dog' },
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
  // Màn 4 · 5
  hazmat:  { name: 'Kẻ mặc đồ bảo hộ', hp: 170, speed: 22, dmg: 10, atkRate: 1.2, h: 108, w: 36, reward: 40, skin: '#8a8a70', shirt: '#c8b030', pants: '#b8a028', kind: 'upright', hazmat: true },
  brood:   { name: 'Kẻ ấp trứng', hp: 200, speed: 15, dmg: 9, atkRate: 1.4, h: 114, w: 44, reward: 45, skin: '#a89cb0', shirt: '#4a3a52', pants: '#2a2030', kind: 'upright', brood: true },
  frost:   { name: 'Kẻ băng giá', hp: 210, speed: 19, dmg: 12, atkRate: 1.3, h: 112, w: 36, reward: 45, skin: '#a8c4d4', shirt: '#3a4a5a', pants: '#24303a', kind: 'upright', frost: true },
  signal:  { name: 'Kẻ thu sóng', hp: 130, speed: 24, dmg: 6, atkRate: 1.3, h: 106, w: 30, reward: 55, skin: '#9a9a8a', shirt: '#2a3a2e', pants: '#1e2420', kind: 'upright', healer: true },
  furnace: { name: 'Lò Thiêu Sống', hp: 11000, speed: 9, dmg: 95, atkRate: 2.2, h: 236, w: 100, reward: 4500, skin: '#5a3020', shirt: '#2a140c', pants: '#1a0c08', kind: 'upright', heavy: true, boss: true, burner: true, hazmat: true, summoner: 'burner' },
  reaper:  { name: 'Kẻ Gặt Đường Băng', hp: 12000, speed: 11, dmg: 100, atkRate: 2.0, h: 228, w: 92, reward: 5000, skin: '#7a7468', shirt: '#22242a', pants: '#14161a', kind: 'upright', heavy: true, boss: true, charger: true, summoner: 'leaper' },
  wendigo: { name: 'Quỷ Tuyết', hp: 14000, speed: 10, dmg: 105, atkRate: 2.1, h: 248, w: 100, reward: 5500, skin: '#c8d8e0', shirt: '#4a5a66', pants: '#2a343c', kind: 'upright', heavy: true, boss: true, frost: true, regen: true, summoner: 'dog' },
  caller:  { name: 'Kẻ Gọi Bầy', hp: 20000, speed: 8, dmg: 115, atkRate: 2.0, h: 262, w: 108, reward: 10000, skin: '#b8b0a0', shirt: '#1e2a24', pants: '#101612', kind: 'upright', heavy: true, boss: true, caller: true, healer: true },
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
  if (n === 65) return 'zero';
  if (n === 70) return 'furnace';
  if (n === 75) return idx === 0 ? 'furnace' : 'juggernaut';
  if (n === 80) return 'reaper';
  if (n === 85) return idx === 0 ? 'reaper' : 'tyrant';
  if (n === 90) return 'wendigo';
  if (n === 95) return idx === 0 ? 'wendigo' : 'queen';
  if (n === 100) return 'caller';
  if (n > CAMPAIGN_NIGHTS) return ['titan', 'colossus', 'tyrant', 'zero', 'juggernaut', 'queen', 'furnace', 'reaper', 'wendigo'][Math.floor(n / 5) % 9];
  return 'titan';
}
export const bossCountFor = (n) => ([35, 55, 75, 85, 95].includes(n) ? 2 : 1); // những đêm có hai con trùm

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
  // Màn 4
  64: { airdrops: 2 }, 66: { rush: true }, 67: { blackout: true }, 68: { horde: true, airdrops: 1 }, 69: { bounty: true, airdrops: 2 },
  71: { airdrops: 2 }, 72: { rush: true }, 73: { blackout: true, bounty: true }, 74: { horde: true },
  76: { airdrops: 3 }, 77: { blackout: true, rush: true }, 78: { horde: true, airdrops: 1 }, 79: { bounty: true, airdrops: 2 },
  // Màn 5
  84: { airdrops: 2 }, 86: { blackout: true }, 87: { horde: true, airdrops: 1 }, 88: { rush: true, bounty: true }, 89: { blackout: true, airdrops: 2 },
  91: { airdrops: 2 }, 92: { blackout: true }, 93: { horde: true }, 94: { rush: true, airdrops: 2 },
  96: { blackout: true, bounty: true }, 97: { horde: true, airdrops: 2 }, 98: { rush: true, blackout: true }, 99: { airdrops: 3, horde: true },
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
  let total = 10 + Math.min(local, 20) * 5 + Math.min(local, 12) ** 2 * 0.2 + up * 8 + (n > CAMPAIGN_NIGHTS ? (n - 20) * 1.2 : 0);
  let interval = Math.max(0.55, 2.2 - local * 0.085 - up * 0.05); // ra quân đều đặn, không dồn cả đợt vào nửa phút đầu
  if (m.rush) total *= 0.8;
  if (m.horde) { total *= 1.25; interval *= 0.8; }
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
    hpMul: (n <= CAMPAIGN_NIGHTS ? 1 + (local - 1) * 0.06 + (up <= 2 ? up * 0.25 : 0.5 + (up - 2) * 0.12) : 1 + 19 * 0.11 + (n - 20) * 0.06) * gk * (settle ? (local === 11 ? 0.85 : 0.92) : 1),
    dmgMul: (n <= CAMPAIGN_NIGHTS ? 1 + (local - 1) * 0.02 + (up <= 2 ? up * 0.08 : 0.16 + (up - 2) * 0.03) : 1 + (n - 1) * 0.02) * (grace ? 0.75 : 1),
    speedMul: m.rush ? 1.3 : 1,
    boss: isBossNight(n),
    mods: m,
    weights: rosterFor(n, m),
  };
  return w;
}

// Thứ tự xuất hiện các loại zombie: [loại, đêm đầu tiên gặp, tỉ lệ tối đa, số đêm để đạt tỉ lệ tối đa]
export const ROSTER = [
  ['runner', 2, 0.55, 6], ['crawler', 3, 0.18, 3], ['brute', 4, 0.13, 6], ['spitter', 6, 0.11, 4],
  ['riot', 11, 0.26, 6], ['bloater', 12, 0.15, 5],
  ['dog', 22, 0.2, 3], ['screamer', 24, 0.07, 2], ['reviver', 27, 0.15, 3],
  ['shielder', 32, 0.12, 3],
  ['leaper', 42, 0.14, 3], ['burner', 44, 0.12, 3],
  ['splitter', 52, 0.13, 3], ['stalker', 54, 0.11, 3],
  ['hazmat', 62, 0.14, 3],
  ['brood', 72, 0.1, 3],
  ['frost', 82, 0.14, 3],
  ['signal', 92, 0.08, 3],
];
// Đêm một loại zombie (lại) xuất hiện. Màn 1: đúng đêm gặp đầu tiên. Từ màn 2 trở đi, người chơi bắt đầu lại
// tay trắng nên loại cũ quay lại dần trong 10 đêm đầu màn (xác sống, kẻ chạy trước; loại khó sau), còn loại mới
// của màn vẫn xuất hiện đúng đêm của nó.
export function introNight(type, n) {
  const e = ROSTER.find((r) => r[0] === type);
  if (!e) return 1;
  if (n > CAMPAIGN_NIGHTS) return e[1];
  const start = (stageFor(n) - 1) * STAGE_LENGTH + 1;
  if (e[1] >= start) return e[1];
  const back = RETURNING[stageFor(n)] || [];
  const k = back.indexOf(type);
  if (k < 0) return Infinity; // loại cũ không quay lại ở màn này
  return start + 1 + Math.floor((k * 9) / Math.max(1, back.length - 1));
}
// Những loại cũ quay lại ở mỗi màn, theo thứ tự quay lại: loại cơ bản trước, rồi các loại của màn ngay trước.
// Nhờ vậy mỗi màn có bộ quái riêng, không dồn mọi loại vào cùng một đêm.
export const RETURNING = {
  2: ['runner', 'crawler', 'brute', 'spitter', 'riot', 'bloater'],
  3: ['runner', 'crawler', 'brute', 'spitter', 'riot', 'dog', 'screamer', 'reviver', 'shielder'],
  4: ['runner', 'crawler', 'brute', 'spitter', 'shielder', 'leaper', 'burner', 'splitter', 'stalker'],
  5: ['runner', 'crawler', 'brute', 'spitter', 'dog', 'leaper', 'stalker', 'hazmat', 'brood'],
};
export function rosterFor(n, m = {}) {
  const w = { walker: 1 };
  const start = n <= CAMPAIGN_NIGHTS ? (stageFor(n) - 1) * STAGE_LENGTH + 1 : 1;
  for (const [type, first, max, ramp] of ROSTER) {
    const at = introNight(type, n);
    if (n < at) { w[type] = 0; continue; }
    let v = max * Math.min(1, (n - at + 1) / ramp); // mới xuất hiện thì lác đác vài con, đông dần
    if (type === 'dog' && m.horde) v *= 1.75;
    // loại cũ của các màn trước: ít hơn một chút để loại mới của màn nổi bật
    if (first < start && start > STAGE_LENGTH && !['runner', 'crawler'].includes(type)) v *= 0.8;
    w[type] = v;
  }
  return w;
}

export function weatherFor(n) {
  return {
 rain: (n >= 7 && n <= 10) || [16, 17, 19, 25, 28, 34, 35, 46, 49, 55, 58, 66, 67, 74, 77, 78, 96, 98].includes(n) || (n > CAMPAIGN_NIGHTS && n % 3 === 0),
    snow: n > 80 && n <= 90,
    lightning: (n >= 7 && n <= 10) || [16, 17, 28, 34, 35, 49, 58].includes(n),
    fog: n > 90 ? 0.3 : n > 80 ? 0.26 : n > 70 ? 0.14 : n > 60 ? 0.2 : n > 50 ? 0.16 : n > 40 ? 0.2 : n > 30 ? 0.12 : n > 20 ? (n === 28 ? 0.4 : 0.22) : n > 10 ? Math.min(0.2 + (n - 10) * 0.02, 0.38) : Math.min(0.08 + n * 0.02, 0.3),
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
  return Math.min(0.1, (0.015 + (local - 9) * 0.003 + (n > STAGE_LENGTH ? 0.008 : 0)) * threat);
}
export const mateLevel = (xp) => (xp >= 60 ? 3 : xp >= 20 ? 2 : 1);
export const MATE_XP = [0, 20, 60];
