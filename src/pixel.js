// Pixel art: dựng sprite pixel từ thiết kế vector có sẵn rồi "làm sạch" như pixel art vẽ tay:
// cạnh cứng (không khử răng cưa), gom về bảng màu nhỏ, viền tối 1 pixel quanh hình.
// Cả cảnh được vẽ trên lưới 480×270 (1 pixel = 2×2 điểm logic) rồi phóng to không làm mịn.

export const PX = 2; // 1 pixel = 2 điểm logic của game
export const pixelState = { on: true };

const cache = new Map();
const MAX_CACHE = 2600;

const r8 = (c) => c & 255, g8 = (c) => (c >>> 8) & 255, b8 = (c) => (c >>> 16) & 255;

// gom màu: k-means nhỏ trên các pixel đặc của sprite
function reducePalette(data, k) {
  const idx = [];
  for (let i = 0; i < data.length; i += 4) if (data[i + 3]) idx.push(i);
  if (!idx.length) return;
  // khởi tạo: các màu xuất hiện nhiều nhất sau khi lượng tử thô
  const hist = new Map();
  for (const i of idx) {
    const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    hist.set(key, (hist.get(key) || 0) + 1);
  }
  const seeds = [...hist.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map(([key]) => [((key >> 8) & 15) * 17, ((key >> 4) & 15) * 17, (key & 15) * 17]);
  const C = seeds;
  const asg = new Int16Array(idx.length);
  for (let it = 0; it < 4; it++) {
    const sum = C.map(() => [0, 0, 0, 0]);
    for (let n = 0; n < idx.length; n++) {
      const i = idx[n];
      let best = 0, bd = 1e9;
      for (let c = 0; c < C.length; c++) {
        const dr = data[i] - C[c][0], dg = data[i + 1] - C[c][1], db = data[i + 2] - C[c][2];
        const d = dr * dr * 2 + dg * dg * 4 + db * db * 3;
        if (d < bd) { bd = d; best = c; }
      }
      asg[n] = best;
      const s = sum[best]; s[0] += data[i]; s[1] += data[i + 1]; s[2] += data[i + 2]; s[3]++;
    }
    for (let c = 0; c < C.length; c++) if (sum[c][3]) C[c] = [sum[c][0] / sum[c][3], sum[c][1] / sum[c][3], sum[c][2] / sum[c][3]];
  }
  for (let n = 0; n < idx.length; n++) {
    const i = idx[n], c = C[asg[n]];
    data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2];
  }
}

/**
 * Sprite pixel có đệm. bounds = [x0, y0, x1, y1] theo đơn vị logic, gốc (0,0) là điểm neo (vd. chân nhân vật).
 * draw(ctx) vẽ hình vector quanh gốc. Trả về { canvas, x0, y0 } để vẽ: drawImage(canvas, x0, y0, w*PX, h*PX).
 */
export function pixelSprite(key, bounds, draw, opts = {}) {
  let s = cache.get(key);
  if (s) return s;
  const [x0, y0, x1, y1] = bounds;
  const w = Math.ceil((x1 - x0) / PX) + 2, h = Math.ceil((y1 - y0) / PX) + 2;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.setTransform(1 / PX, 0, 0, 1 / PX, 1 - x0 / PX, 1 - y0 / PX);
  draw(g);
  const img = g.getImageData(0, 0, w, h), d = img.data;
  // cạnh cứng: điểm mờ quá nửa thì bỏ, còn lại cho đặc hẳn
  for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= (opts.alphaCut ?? 110) ? 255 : 0;
  reducePalette(d, opts.colors ?? 11);
  // viền tối 1 pixel: điểm trong suốt cạnh điểm đặc lấy màu tối của điểm đặc đó
  if (opts.outline !== false) {
    const out = new Uint8ClampedArray(d);
    const ink = opts.ink ?? [14, 10, 18];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3]) continue;
      let n = -1;
      if (x > 0 && d[i - 1]) n = i - 4; else if (x < w - 1 && d[i + 7]) n = i + 4; else if (y > 0 && d[i - w * 4 + 3]) n = i - w * 4; else if (y < h - 1 && d[i + w * 4 + 3]) n = i + w * 4;
      if (n < 0) continue;
      out[i] = ink[0] * 0.65 + d[n] * 0.35 * 0.35; out[i + 1] = ink[1] * 0.65 + d[n + 1] * 0.35 * 0.35; out[i + 2] = ink[2] * 0.65 + d[n + 2] * 0.35 * 0.35; out[i + 3] = 255;
    }
    img.data.set(out);
  }
  g.putImageData(img, 0, 0);
  s = { canvas: c, x0: x0 - PX, y0: y0 - PX, w: w * PX, h: h * PX };
  if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value);
  cache.set(key, s);
  return s;
}

/** Vẽ sprite đã đệm tại gốc hiện tại của ctx, căn theo lưới pixel. */
export function blit(ctx, s) {
  const sm = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(s.canvas, s.x0, s.y0, s.w, s.h);
  ctx.imageSmoothingEnabled = sm;
}
/** Làm tròn toạ độ logic về lưới pixel. */
export const snap = (v) => Math.round(v / PX) * PX;

// ---------- Nền: thu nhỏ về lưới pixel, gom về bảng màu của bản đồ, pha chấm Bayer ----------
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v / 16 - 0.5));
export function pixelizeBackground(src, colors = 30) {
  const w = Math.round(src.width / PX), h = Math.round(src.height / PX);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(src, 0, 0, w, h);
  const img = g.getImageData(0, 0, w, h), d = img.data;
  // bảng màu: k-means trên mẫu thưa
  const sample = [];
  for (let i = 0; i < d.length; i += 4 * 7) sample.push([d[i], d[i + 1], d[i + 2]]);
  const hist = new Map();
  for (const p of sample) { const k = ((p[0] >> 4) << 8) | ((p[1] >> 4) << 4) | (p[2] >> 4); hist.set(k, (hist.get(k) || 0) + 1); }
  let C = [...hist.entries()].sort((a, b) => b[1] - a[1]).slice(0, colors).map(([k]) => [((k >> 8) & 15) * 17, ((k >> 4) & 15) * 17, (k & 15) * 17]);
  for (let it = 0; it < 5; it++) {
    const sum = C.map(() => [0, 0, 0, 0]);
    for (const p of sample) {
      let best = 0, bd = 1e9;
      for (let k = 0; k < C.length; k++) { const dr = p[0] - C[k][0], dg = p[1] - C[k][1], db = p[2] - C[k][2], dd = dr * dr * 2 + dg * dg * 4 + db * db * 3; if (dd < bd) { bd = dd; best = k; } }
      const s = sum[best]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++;
    }
    C = C.map((c0, k) => (sum[k][3] ? [sum[k][0] / sum[k][3], sum[k][1] / sum[k][3], sum[k][2] / sum[k][3]] : c0));
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, t = BAYER[(y & 3) * 4 + (x & 3)] * 18;
    const pr = d[i] + t, pg = d[i + 1] + t, pb = d[i + 2] + t;
    let best = 0, bd = 1e9;
    for (let k = 0; k < C.length; k++) { const dr = pr - C[k][0], dg = pg - C[k][1], db = pb - C[k][2], dd = dr * dr * 2 + dg * dg * 4 + db * db * 3; if (dd < bd) { bd = dd; best = k; } }
    d[i] = C[best][0]; d[i + 1] = C[best][1]; d[i + 2] = C[best][2]; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

export const _rgb = { r8, g8, b8 };
