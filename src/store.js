// Mua bản đầy đủ: ai cũng chơi miễn phí Màn 1 (20 đêm đầu), từ đêm 21 cần mở khoá một lần qua Google Play.
// Tài khoản Google Play ở các nước trong FREE_COUNTRIES được mở khoá sẵn. Bản web (trình duyệt) luôn mở khoá.
import { Capacitor, registerPlugin } from '@capacitor/core';

export const PRODUCT_ID = 'full_game';
export const FREE_NIGHTS = 20;
export const FREE_COUNTRIES = ['VN'];

const KEY = 'barricade_nights_unlock_v1';
const Billing = registerPlugin('Billing');

const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };
const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* bỏ qua */ } };

export const store = {
  native: Capacitor.isNativePlatform(),
  unlocked: false,
  reason: '',
  country: '',
  price: '',
  checked: false, // đã hỏi được Google Play ít nhất một lần
};

const cached = read();
if (!store.native) { store.unlocked = true; store.reason = 'web'; }
else if (cached && cached.unlocked) { store.unlocked = true; store.reason = cached.reason || 'cache'; }

function setUnlocked(on, reason) {
  store.unlocked = on;
  store.reason = on ? reason : '';
  write({ unlocked: on, reason: store.reason });
}

/** Hỏi Google Play: quốc gia, đã mua chưa, giá. Lỗi mạng thì giữ trạng thái đã lưu. */
export async function initStore() {
  if (!store.native) return store;
  try {
    const { country } = await Billing.init();
    store.country = (country || '').toUpperCase();
    const { owned } = await Billing.restore();
    store.checked = true;
    if ((owned || []).includes(PRODUCT_ID)) setUnlocked(true, 'purchase');
    else if (FREE_COUNTRIES.includes(store.country)) setUnlocked(true, 'country');
    else setUnlocked(false, ''); // đã hoàn tiền hoặc chưa từng mua
  } catch (e) {
    console.warn('billing init', e && e.message);
  }
  refreshPrice();
  return store;
}

export async function refreshPrice() {
  if (!store.native) return '';
  try { const { price } = await Billing.getProduct({ id: PRODUCT_ID }); store.price = price || ''; } catch { /* chưa tạo sản phẩm */ }
  return store.price;
}

/** Trả về 'purchased' | 'pending' | 'canceled' | 'error' */
export async function buyFullGame() {
  if (!store.native) { setUnlocked(true, 'web'); return 'purchased'; }
  try {
    const r = await Billing.purchase({ id: PRODUCT_ID });
    if (r.status === 'purchased' || r.status === 'owned') { setUnlocked(true, 'purchase'); return 'purchased'; }
    return r.status || 'error';
  } catch (e) {
    console.warn('billing purchase', e && e.message);
    return 'error';
  }
}

/** Khôi phục giao dịch đã mua (đổi máy, cài lại). Trả về true nếu đã mở khoá. */
export async function restorePurchase() {
  await initStore();
  return store.unlocked;
}

/** Đêm n có cần bản đầy đủ không */
export const needsUnlock = (night, endless = false) => !endless && night > FREE_NIGHTS && !store.unlocked;
