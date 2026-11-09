import { WEAPONS, barricadeMax } from './config.js';

const KEY = 'barricade_nights_save_v1';
const SETTINGS_KEY = 'barricade_nights_settings_v1';

export function newSave() {
  return {
    night: 1,
    cash: 0,
    hp: barricadeMax(0),
    barricadeLevel: 0,
    reloadLevel: 0,
    survivors: 0,
    totalKills: 0,
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
    return d && typeof d.night === 'number' ? { ...newSave(), ...d } : null;
  } catch { return null; }
}

export function clearSave() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function loadSettings() {
  try { return { sound: true, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; }
  catch { return { sound: true }; }
}

export function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}
