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
    seenAct2: false,
    v: 2,
    crew: [],
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
    if (!d.v) { if (out.endless && out.night <= 21) out.endless = false; out.v = 2; }
    return out;
  } catch { return null; }
}

export function clearSave() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function loadSettings() {
  const def = { sound: true, music: true, shake: true };
  try { return { ...def, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; }
  catch { return def; }
}

export function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}
