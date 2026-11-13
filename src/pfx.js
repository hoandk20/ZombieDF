// Hiệu ứng pixel art từ thư viện pixelfx (MIT, https://github.com/patch-gg/pixelfx).
// Hiệu ứng được vẽ vào một khung pixel nhỏ (1/2 độ phân giải logic của game) rồi phóng to bằng
// nearest-neighbour, nên ra đúng chất pixel trong khi phần còn lại của game vẫn vẽ bằng vector.
import { createFrame, clearFrame, createFx, composite } from 'pixelfx';
import * as smallExplosion from 'pixelfx/fx/explosions/small-explosion';
import * as dirtExplosion from 'pixelfx/fx/explosions/dirt-explosion';
import * as darkExplosion from 'pixelfx/fx/shadow/dark-explosion';
import * as acidSplash from 'pixelfx/fx/nature/acid-splash';
import * as hitSpark from 'pixelfx/fx/impacts/hit-spark';
import { W, H } from './config.js';

export const PFX_SCALE = 2; // 1 pixel hiệu ứng = 2×2 điểm của game
const PW = W / PFX_SCALE, PH = H / PFX_SCALE;
const MAX_ACTIVE = 14;
// thời gian giữ mỗi loại hiệu ứng (giây) trước khi cho tắt dần: khói nổ kéo dài quá lâu sẽ chồng lên nhau và nặng máy
const LIFE = { explosion: 2.2, dirt: 1.8, dark: 2.6, acid: 1.6, spark: 1 };

const EFFECTS = {
  explosion: smallExplosion,
  dirt: dirtExplosion,
  dark: darkExplosion,
  acid: acidSplash,
  spark: hitSpark,
};
// bảng màu dùng lại
export const PFX_PAL = {
  toxic: ['#16240a', '#2e5010', '#4f8a14', '#7fb020', '#a8d830', '#c8f040', '#e8ff9a', '#ffffff'],
  purple: ['#1a0a24', '#3a1450', '#6a2a8a', '#9a4ac0', '#c88ae8', '#e8c8ff', '#ffffff'],
};

export class PixelFx {
  constructor() {
    this.frame = createFrame(PW, PH);
    this.canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    if (this.canvas) { this.canvas.width = PW; this.canvas.height = PH; this.cctx = this.canvas.getContext('2d'); }
    this.img = this.cctx ? this.cctx.createImageData(PW, PH) : null;
    this.list = [];
    this.seed = 1;
  }

  /** Thêm một hiệu ứng tại toạ độ của game (x, y là điểm chạm đất / tâm). */
  spawn(kind, x, y, opts = {}) {
    const mod = EFFECTS[kind];
    if (!mod) return null;
    if (this.list.length >= MAX_ACTIVE) this.list.shift(); // quá đông thì bỏ hiệu ứng cũ nhất
    const fx = createFx(mod, { seed: this.seed++ % 997, ...opts, x: Math.round(x / PFX_SCALE), y: Math.round(y / PFX_SCALE) });
    fx.life = LIFE[kind] ?? 2;
    this.list.push(fx);
    return fx;
  }

  clear() { this.list = []; }

  update(dt) {
    for (const fx of this.list) { fx.update(dt); if (fx.t > fx.life) fx.stop(); }
    this.list = this.list.filter((fx) => !fx.done());
  }

  draw(ctx) {
    if (!this.list.length || !this.cctx) return;
    clearFrame(this.frame);
    for (const fx of this.list) fx.draw(this.frame);
    composite(this.frame, this.img.data, null);
    this.cctx.putImageData(this.img, 0, 0);
    const smooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.canvas, 0, 0, W, H);
    ctx.imageSmoothingEnabled = smooth;
  }
}
