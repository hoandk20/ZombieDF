import { WEAPONS, barricadeMax } from './config.js';
import { SURVIVORS } from './story.js';

const KEY = 'barricade_nights_save_v1';
const SETTINGS_KEY = 'barricade_nights_settings_v1';

export function newSave() {
  return {
    night: 1,
    cash: 0,
    hp: barricadeMax(0),
    barricadeLevel: 0,
    reloadLevel: 0,
    dmgLevel: 0,
    seenAct: 1,
    v: 5,
    difficulty: 'normal',
    turrets: 0,
    turretLevel: 1,
    mines: 0,
    wireLevel: 0,
    floodlight: false,
    food: 8,
    threat: 1,
    flashlight: false,
    met: [],
    hungry: false,
    eventDay: 0,
    shockerLevel: 0,
    flameTurret: 0,
    mortarLevel: 0,
    teslaLevel: 0,
    drones: 0,
    sawLevel: 0,
    sniperLevel: 0,
    gasLevel: 0,
    rocketLevel: 0,
    crew: [],
    squad: [],
    mates: {},
    grenades: 2,
    totalKills: 0,
    headshots: 0,
    endless: false,
    dayUsed: false,
    current: 'pistol',
    weapons: { pistol: { mag: WEAPONS.pistol.mag, reserve: 0 } },
  };
}

export function saveGame(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* bộ nhớ không khả dụng */ }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || typeof d.night !== 'number') return null;
    const out = { ...newSave(), ...d };
    // bản lưu cũ chỉ có số người sống sót
    if (!Array.isArray(d.crew)) out.crew = SURVIVORS.slice(0, d.survivors || 0).map((s) => s.id);
    delete out.survivors;
    // bản lưu cũ (chiến dịch 10 đêm): người đã thắng tiếp tục sang chương 2 thay vì vô tận
    if (!d.v) { if (out.endless && out.night <= 21) out.endless = false; }
    // bản 40 đêm: thêm đội hình, cấp độ và thương tích của đồng đội
    if ((d.v || 0) < 3) {
      if (out.endless && out.night <= 41) out.endless = false;
      out.seenAct = d.seenAct2 ? 2 : 1;
      if (out.night > 20 && out.seenAct < 2) out.seenAct = 2;
    }
    if ((d.v || 0) < 4 && out.endless && out.night <= 61 && out.night > 40) out.endless = false; // bản 60 đêm
    // bản 100 đêm: người vừa thắng đêm 60 và chưa đi xa trong vô tận được chơi tiếp màn 4
    if ((d.v || 0) < 5 && out.endless && out.night <= 62 && out.night > 60) { out.endless = false; out.night = 61; }
    out.v = 5;
    // những đồng đội đã từng gặp (để cắt cảnh không nhắc tới người chưa gặp)
    if (!Array.isArray(out.met)) out.met = [...new Set([...(out.crew || []), ...Object.keys(out.mates || {})])];
    if (!Array.isArray(out.squad)) out.squad = out.crew.slice(0, 4);
    out.mates = out.mates || {};
    for (const id of out.crew) out.mates[id] = { xp: 0, injured: 0, ...(out.mates[id] || {}) };
    return out;
  } catch { return null; }
}

export function clearSave() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function loadSettings() {
  const def = { sound: true, music: true, shake: true, hq: true, pixel: true };
  try { return { ...def, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; }
  catch { return def; }
}

export function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}
