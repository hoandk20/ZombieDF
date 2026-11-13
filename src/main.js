import './fonts.js';
import './style.css';
import { W, H } from './config.js';
import { Game } from './game.js';
import { UI } from './ui.js';
import { initI18n } from './i18n.js';

initI18n();

const app = document.getElementById('app');
const canvas = document.getElementById('game');
const uiRoot = document.getElementById('ui');

const game = new Game(canvas);
const ui = new UI(uiRoot, game);

// Giữ tỉ lệ 16:9, co giãn vừa màn hình, nét trên màn hình mật độ cao
function resize() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const scale = Math.min(vw / W, vh / H);
  const cw = Math.floor(W * scale), ch = Math.floor(H * scale);
  app.style.width = cw + 'px';
  app.style.height = ch + 'px';
  app.style.fontSize = (16 * scale).toFixed(2) + 'px';
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  game.ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  game.ctx.imageSmoothingEnabled = true;
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 200));
resize();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.update(dt);
  game.render();
  ui.updateHud();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// tiện debug trong console
window.__game = game;
window.__ui = ui;
