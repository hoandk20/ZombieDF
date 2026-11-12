// Ngôn ngữ: tiếng Anh (mặc định) hoặc tiếng Việt.
// Dữ liệu tiếng Việt giữ nguyên trong code; khi chọn tiếng Anh, các thuộc tính chữ (tên, mô tả, lời thoại)
// được thay bằng getter trả về bản dịch, nên các chỗ dùng không phải sửa.
import {
  WEAPONS, ZOMBIES, DIFFICULTIES, MOD_INFO, ACT_NAMES, STAGE_NAMES,
} from './config.js';
import * as STORY from './story.js';
import { STORY_EN, NIGHT_TITLES_EN, MATES_EN } from './story_en.js';

const KEY = 'barricade_nights_lang_v1';
let lang = 'en';
try { const v = localStorage.getItem(KEY); if (v === 'vi' || v === 'en') lang = v; } catch {}

const listeners = [];
export const getLang = () => lang;
export const isEn = () => lang === 'en';
export function setLang(l) {
  if (l !== 'en' && l !== 'vi') return;
  lang = l;
  try { localStorage.setItem(KEY, l); } catch {}
  document.documentElement.lang = l;
  for (const f of listeners) f(l);
}
export const onLangChange = (f) => listeners.push(f);
// chọn câu theo ngôn ngữ hiện tại
export const L = (vi, en) => (lang === 'en' ? en : vi);

// tên người nói trong cắt cảnh
const WHO_EN = { 'HOÀN': 'HOAN', 'NHẬT KÝ': 'JOURNAL', RADIO: 'RADIO' };
export const whoLabel = (who) => (lang === 'en' ? WHO_EN[who] || who : who);

// gắn getter: obj[prop] trả về bản dịch khi đang ở tiếng Anh
function bind(obj, prop, en) {
  if (!obj || en === undefined || en === null) return;
  const vi = obj[prop];
  Object.defineProperty(obj, prop, { get: () => (lang === 'en' ? en : vi), set: () => {}, enumerable: true, configurable: true });
}

const WEAPONS_EN = {
  pistol: ['Pistol', "Grandpa's old sidearm. Never runs out of ammo."],
  shotgun: ['Shotgun', '8 pellets per shot. Devastating up close.'],
  smg: ['SMG', 'Hold to spray. Great when the horde gets close.'],
  rifle: ['Rifle', 'Pierces 4 targets. One headshot is enough.'],
  lmg: ['Machine Gun', '80-round belt, pierces 2. Very slow reload.'],
  flamer: ['Flamethrower', 'Mid-range flames that burn up to 7 zombies ahead. Ignores armor.'],
  launcher: ['Grenade Launcher', 'Fires explosive rounds at your aim point. Clears hordes.'],
  sniper: ['Sniper Rifle', 'Pierces 6 targets in a line. One shot, one row.'],
  tesla: ['Tesla Gun', 'Lightning jumps between 5 nearby zombies and stuns them briefly. Ignores armor.'],
  cryo: ['Cryo Gun', "Sprays the plant's liquid nitrogen. Heavily slows up to 8 zombies; frozen ones take 30% more damage."],
  railgun: ['Railgun', 'Built by Hoan from aircraft capacitors. One shot pierces a whole line, no armor can stop it.'],
};
const ZOMBIES_EN = {
  walker: 'Walker', runner: 'Runner', crawler: 'Crawler', brute: 'Brute', spitter: 'Spitter', riot: 'Riot Cop',
  bloater: 'Bloater', colossus: 'Harbor Leviathan', dog: 'Infected Dog', screamer: 'Screamer', reviver: 'Reviver',
  bounty: 'Thief', tyrant: 'Forest Tyrant', shielder: 'Shield Soldier', leaper: 'Leaper', burner: 'Burner',
  splitter: 'Splitter', spawnling: 'Spawnling', stalker: 'Stalker', juggernaut: 'The Juggernaut', queen: 'Hive Queen',
  zero: 'Specimen Zero', hazmat: 'Hazmat', brood: 'Brooder', frost: 'Frostbitten', signal: 'Receiver',
  furnace: 'The Furnace', reaper: 'Runway Reaper', wendigo: 'Snow Wendigo', caller: 'The Caller', titan: 'The Titan',
};
const DIFF_EN = {
  easy: ['Easy', 'Balanced like the original. Good for learning.'],
  normal: ['Normal', 'Tough, fast zombies arriving in packs. Companions are hard to find.'],
  hard: ['Hard', 'Big, aggressive hordes. Every bullet counts.'],
  nightmare: ['Nightmare', 'For those who have won. Nearly impossible.'],
};
const MOD_EN = {
  blackout: ['Blackout', 'Pitch black. You only see around your flashlight, muzzle flashes and explosions.'],
  airdrops: ['Supply drop', 'Shoot falling crates to get ammo, cash or grenades.'],
  bounty: ['Thief', 'A zombie carrying loot will appear and run away. Kill it for a big reward.'],
  rush: ['Rush night', 'Zombies move 30% faster, but there are fewer of them.'],
  horde: ['Horde night', 'Zombie numbers surge and arrive relentlessly.'],
};
const ACT_EN = { 1: 'Ben Suong', 2: 'Vong Hai Harbor', 3: 'Hong Son Dam', 4: 'Hong Son Base', 5: 'North–South Highway', 6: 'The Capital', 7: 'Thanh Nam Plant', 8: 'Bac Thanh Airport', 9: 'Border Snow Forest', 10: 'Lighthouse Station' };
const STAGE_EN = { 1: 'Road to the Sea', 2: 'The Hong Son Code', 3: 'The Last Delivery', 4: 'Mutation', 5: 'The Final Frequency' };

const STORY_ARRAYS = ['INTRO', 'ACT1_END', 'ACT2_INTRO', 'STAGE1_END', 'STAGE2_INTRO', 'ACT3_END', 'ACT4_INTRO', 'STAGE2_END', 'STAGE3_INTRO',
  'ACT5_END', 'ACT6_INTRO', 'STAGE3_END', 'STAGE4_INTRO', 'ACT7_END', 'ACT8_INTRO', 'STAGE4_END', 'STAGE5_INTRO', 'ACT9_END', 'ACT10_INTRO', 'ENDING', 'ENDLESS_NOTE'];

function bindLines(lines, prefix) {
  (lines || []).forEach((l, i) => {
    bind(l, 'text', STORY_EN[`${prefix}.${i}`]);
    if (l.alt) bind(l, 'alt', STORY_EN[`${prefix}.${i}.alt`]);
  });
}

// Gắn bản dịch vào dữ liệu (gọi một lần khi khởi động)
export function initI18n() {
  document.documentElement.lang = lang;
  for (const [id, [n, d]] of Object.entries(WEAPONS_EN)) { bind(WEAPONS[id], 'name', n); bind(WEAPONS[id], 'desc', d); }
  for (const [id, n] of Object.entries(ZOMBIES_EN)) bind(ZOMBIES[id], 'name', n);
  for (const [id, [n, d]] of Object.entries(DIFF_EN)) { bind(DIFFICULTIES[id], 'name', n); bind(DIFFICULTIES[id], 'desc', d); }
  for (const [id, [n, d]] of Object.entries(MOD_EN)) { bind(MOD_INFO[id], 'name', n); bind(MOD_INFO[id], 'desc', d); }
  for (const [k, n] of Object.entries(ACT_EN)) bind(ACT_NAMES, k, n);
  for (const [k, n] of Object.entries(STAGE_EN)) bind(STAGE_NAMES, k, n);
  for (const k of STORY_ARRAYS) bindLines(STORY[k], k);
  for (const [n, lines] of Object.entries(STORY.DAWN_LOG)) bindLines(lines, `DAWN.${n}`);
  for (const [n, t] of Object.entries(NIGHT_TITLES_EN)) bind(STORY.NIGHT_TITLES, n, t);
  STORY.GAMEOVER_LINES.forEach((_, i) => bind(STORY.GAMEOVER_LINES, i, STORY_EN[`GAMEOVER.${i}`]));
  for (const s of STORY.SURVIVORS) {
    const e = MATES_EN[s.id];
    if (!e) continue;
    for (const p of ['name', 'role', 'perk', 'intro']) bind(s, p, e[p]);
  }
}
