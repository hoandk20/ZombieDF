import {
  WEAPONS, WEAPON_ORDER, DAY_HOURS, MAX_SURVIVORS, MAX_RELOAD_LVL,
  barricadeMax, barricadeUpgradePrice, reloadUpgradePrice, repairKitPrice,
} from './config.js';
import { newSave, saveGame, loadGame, clearSave, loadSettings, saveSettings } from './save.js';
import { sfx, initAudio, setSoundEnabled } from './audio.js';

const rand = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rand(a, b + 1));

export class UI {
  constructor(root, game) {
    this.root = root;
    this.game = game;
    this.settings = loadSettings();
    setSoundEnabled(this.settings.sound);
    game.onState = (s, info) => this.onState(s, info);
    root.addEventListener('click', (e) => {
      const el = e.target.closest('[data-act]');
      if (!el || el.disabled) return;
      initAudio();
      this.act(el.dataset.act, el.dataset.arg, el);
    });
    // nút HUD dùng pointerdown để phản hồi nhanh trên cảm ứng
    root.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('[data-hud]');
      if (!el) return;
      e.preventDefault();
      initAudio();
      const a = el.dataset.hud;
      if (a === 'reload') game.startReload();
      else if (a === 'pause') game.pause();
      else if (a === 'weapon') game.switchWeapon(el.dataset.arg);
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) game.pause(); });
    this.lastHud = '';
    this.showMenu();
  }

  onState(s, info) {
    if (s === 'night') this.showHud();
    else if (s === 'weapon') this.lastHud = '';
    else if (s === 'paused') this.showPause();
    else if (s === 'day') this.showDay(info);
    else if (s === 'gameover') this.showGameOver(info);
  }

  act(a, arg, el) {
    const g = this.game;
    switch (a) {
      case 'new':
        clearSave();
        g.data = newSave();
        sfx.click();
        g.startNight();
        break;
      case 'continue': {
        const d = loadGame();
        if (!d) return;
        g.data = d;
        sfx.click();
        this.showDay(null);
        g.state = 'day';
        break;
      }
      case 'help': this.showHelp(); break;
      case 'menu': g.state = 'menu'; g.resetNightState(); this.showMenu(); break;
      case 'sound':
        this.settings.sound = !this.settings.sound;
        setSoundEnabled(this.settings.sound);
        saveSettings(this.settings);
        if (g.state === 'menu') this.showMenu();
        else if (el) el.textContent = `Âm thanh: ${this.settings.sound ? 'Bật' : 'Tắt'}`;
        break;
      case 'fullscreen': toggleFullscreen(); break;
      case 'resume': g.resume(); break;
      case 'quit':
        // giữa đêm thì không lưu: bản lưu là trạng thái trước khi vào đêm
        if (g.state === 'day') saveGame(g.data);
        g.state = 'menu'; g.resetNightState(); this.showMenu(); break;
      case 'retry': this.act('new'); break;
      case 'hour': this.changeHour(arg); break;
      case 'doDay': this.doDay(); break;
      case 'buy': this.buy(arg); break;
      case 'startNight': saveGame(g.data); sfx.click(); g.startNight(); break;
    }
  }

  // ---------- Menu ----------
  showMenu() {
    const save = loadGame();
    const fs = document.fullscreenEnabled ? '<button data-act="fullscreen">Toàn màn hình</button>' : '';
    this.root.innerHTML = `
      <div class="screen menu">
        <h1 class="title">BARRICADE<span>NIGHTS</span></h1>
        <p class="tagline">Giữ vững hàng rào. Sống sót qua từng đêm.</p>
        <div class="menu-buttons">
          ${save ? `<button class="primary" data-act="continue">Tiếp tục — Đêm ${save.night}</button>` : ''}
          <button class="${save ? '' : 'primary'}" data-act="new">Trò chơi mới</button>
          <button data-act="help">Hướng dẫn</button>
          <button data-act="sound">Âm thanh: ${this.settings.sound ? 'Bật' : 'Tắt'}</button>
          ${fs}
        </div>
      </div>`;
  }

  showHelp() {
    this.root.innerHTML = `
      <div class="screen panel-screen">
        <div class="panel help">
          <h2>Hướng dẫn</h2>
          <ul>
            <li><b>Ngắm & bắn:</b> chuột / chạm vào màn hình. Súng tự động: giữ để bắn liên tục.</li>
            <li><b>Bắn vào đầu</b> gây sát thương x2.5 và thưởng thêm 50% tiền.</li>
            <li><b>Nạp đạn:</b> phím R hoặc nút ⟳. Hết băng sẽ tự nạp.</li>
            <li><b>Đổi súng:</b> phím 1–5, Q/E, con lăn chuột hoặc chạm vào biểu tượng súng.</li>
            <li><b>Ban đêm:</b> zombie kéo tới phá hàng rào. Hàng rào về 0 là thua.</li>
            <li><b>Ban ngày:</b> chia ${DAY_HOURS} giờ để sửa rào, đi lục lọi tìm tiền/đạn, hoặc tìm người sống sót (họ sẽ bắn giúp bạn). Sau đó mua súng và nâng cấp.</li>
            <li>Tiến trình tự lưu mỗi sáng.</li>
          </ul>
          <button class="primary" data-act="menu">Quay lại</button>
        </div>
      </div>`;
  }

  // ---------- HUD ban đêm ----------
  showHud() {
    this.lastHud = '';
    this.root.innerHTML = `
      <div class="hud">
        <button class="hud-btn pause" data-hud="pause" aria-label="Tạm dừng">❚❚</button>
        <div class="weapon-bar"></div>
        <button class="hud-btn reload" data-hud="reload" aria-label="Nạp đạn">⟳<small>R</small></button>
      </div>`;
    this.weaponBar = this.root.querySelector('.weapon-bar');
    this.updateHud();
  }

  // gọi mỗi khung hình; chỉ cập nhật DOM khi có thay đổi
  updateHud() {
    const g = this.game;
    if (g.state !== 'night' || !this.weaponBar) return;
    const d = g.data;
    const key = WEAPON_ORDER.filter((id) => d.weapons[id])
      .map((id) => `${id}:${d.weapons[id].mag}:${d.weapons[id].reserve}`).join('|') + d.current + (g.reloadT > 0);
    if (key === this.lastHud) return;
    this.lastHud = key;
    this.weaponBar.innerHTML = WEAPON_ORDER.filter((id) => d.weapons[id]).map((id, i) => {
      const w = WEAPONS[id], st = d.weapons[id];
      const active = id === d.current;
      const low = st.mag === 0 ? ' empty' : '';
      return `<button class="weapon-slot${active ? ' active' : ''}${low}" data-hud="weapon" data-arg="${id}">
        <span class="slot-key">${i + 1}</span>
        <span class="slot-name">${w.name}</span>
        <span class="slot-ammo">${active && g.reloadT > 0 ? 'nạp…' : st.mag}<small>/${w.infinite ? '∞' : st.reserve}</small></span>
      </button>`;
    }).join('');
  }

  showPause() {
    this.root.innerHTML = `
      <div class="screen panel-screen dim">
        <div class="panel small">
          <h2>Tạm dừng</h2>
          <button class="primary" data-act="resume">Tiếp tục</button>
          <button data-act="sound">Âm thanh: ${this.settings.sound ? 'Bật' : 'Tắt'}</button>
          <button data-act="quit">Về menu (đêm này sẽ chơi lại)</button>
        </div>
      </div>`;
  }

  showGameOver(info) {
    clearSave();
    this.root.innerHTML = `
      <div class="screen panel-screen dim red">
        <div class="panel small">
          <h2 class="danger">HÀNG RÀO ĐÃ VỠ</h2>
          <p>Bạn đã sống sót <b>${info.nights}</b> đêm và hạ <b>${info.kills}</b> zombie.</p>
          <button class="primary" data-act="retry">Chơi lại</button>
          <button data-act="menu">Menu chính</button>
        </div>
      </div>`;
  }

  // ---------- Ban ngày ----------
  showDay(info) {
    this.dayInfo = info;
    this.alloc = { repair: 0, scav: 0, search: 0 };
    this.dayDone = !!this.game.data.dayUsed;
    this.dayLog = this.dayDone ? ['Bạn đã dùng hết thời gian của ngày hôm nay.'] : [];
    this.renderDay();
  }

  changeHour(arg) {
    if (this.dayDone) return;
    const [k, dir] = arg.split(':');
    const used = this.alloc.repair + this.alloc.scav + this.alloc.search;
    if (dir === '+' && used < DAY_HOURS) this.alloc[k]++;
    if (dir === '-' && this.alloc[k] > 0) this.alloc[k]--;
    sfx.click();
    this.renderDay();
  }

  doDay() {
    const d = this.game.data;
    const max = barricadeMax(d.barricadeLevel);
    const log = [];
    if (this.alloc.repair) {
      const before = d.hp;
      d.hp = Math.min(max, d.hp + this.alloc.repair * max * 0.09);
      log.push(`🔨 Sửa hàng rào: +${Math.round(d.hp - before)} độ bền.`);
    }
    let cash = 0;
    for (let i = 0; i < this.alloc.scav; i++) {
      cash += Math.round(rand(35, 85) * (1 + d.night * 0.08));
      if (Math.random() < 0.3) {
        const owned = WEAPON_ORDER.filter((id) => d.weapons[id] && !WEAPONS[id].infinite);
        if (owned.length) {
          const id = owned[ri(0, owned.length - 1)];
          const amt = Math.ceil(WEAPONS[id].ammoPack * rand(0.25, 0.5));
          d.weapons[id].reserve += amt;
          log.push(`📦 Tìm thấy ${amt} viên đạn ${WEAPONS[id].name}.`);
        }
      }
      if (Math.random() < 0.035) {
        const missing = WEAPON_ORDER.filter((id) => !d.weapons[id]);
        if (missing.length) {
          const id = missing[0];
          d.weapons[id] = { mag: 0, reserve: WEAPONS[id].mag * 2 };
          log.push(`🔫 May mắn! Nhặt được khẩu ${WEAPONS[id].name}!`);
        }
      }
    }
    if (this.alloc.scav) { d.cash += cash; log.push(`💰 Lục lọi được $${cash}.`); }
    let found = 0;
    for (let i = 0; i < this.alloc.search; i++) {
      if (d.survivors < MAX_SURVIVORS && Math.random() < 0.13 + Math.min(d.night * 0.01, 0.1)) {
        d.survivors++; found++;
      }
    }
    if (this.alloc.search) {
      log.push(found ? `🧍 Tìm được ${found} người sống sót! Họ sẽ cùng bạn giữ hàng rào.`
        : (d.survivors >= MAX_SURVIVORS ? '🧍 Nơi trú ẩn đã đủ người.' : '🧍 Không tìm thấy ai còn sống...'));
    }
    if (!log.length) log.push('Bạn nghỉ ngơi cả ngày.');
    this.dayLog = log;
    this.dayDone = true;
    d.dayUsed = true;
    saveGame(d);
    sfx.buy();
    this.renderDay();
  }

  shopItems() {
    const d = this.game.data;
    const items = [];
    const max = barricadeMax(d.barricadeLevel);
    items.push({
      id: 'repair', title: 'Bộ sửa chữa', desc: `+25% độ bền (${Math.ceil(d.hp)}/${max})`,
      price: repairKitPrice(d.night), disabled: d.hp >= max,
    });
    items.push({
      id: 'barricade', title: `Gia cố hàng rào Lv${d.barricadeLevel + 1}`,
      desc: `Độ bền tối đa ${max} → ${barricadeMax(d.barricadeLevel + 1)}`,
      price: barricadeUpgradePrice(d.barricadeLevel),
    });
    if (d.reloadLevel < MAX_RELOAD_LVL) {
      items.push({
        id: 'reloadUp', title: `Luyện nạp đạn Lv${d.reloadLevel + 1}`, desc: 'Nạp đạn nhanh hơn 12%',
        price: reloadUpgradePrice(d.reloadLevel),
      });
    }
    for (const id of WEAPON_ORDER) {
      const w = WEAPONS[id];
      if (w.infinite) continue;
      if (!d.weapons[id]) {
        items.push({
          id: 'w:' + id, title: `Mua ${w.name}`, weapon: true,
          desc: `ST ${w.dmg}${w.pellets > 1 ? '×' + w.pellets : ''} · băng ${w.mag}${w.auto ? ' · tự động' : ''}${w.pierce > 1 ? ' · xuyên ' + w.pierce : ''}`,
          price: w.price,
        });
      } else {
        items.push({
          id: 'a:' + id, title: `Đạn ${w.name} +${w.ammoPack}`, desc: `Đang có ${d.weapons[id].reserve + d.weapons[id].mag} viên`,
          price: w.ammoPrice,
        });
      }
    }
    return items;
  }

  buy(id) {
    const d = this.game.data;
    const item = this.shopItems().find((i) => i.id === id);
    if (!item || item.disabled || d.cash < item.price) { sfx.deny(); return; }
    d.cash -= item.price;
    const max = barricadeMax(d.barricadeLevel);
    if (id === 'repair') d.hp = Math.min(max, d.hp + max * 0.25);
    else if (id === 'barricade') {
      d.barricadeLevel++;
      d.hp += barricadeMax(d.barricadeLevel) - max; // phần tăng thêm được đầy
    } else if (id === 'reloadUp') d.reloadLevel++;
    else if (id.startsWith('w:')) {
      const w = id.slice(2);
      d.weapons[w] = { mag: WEAPONS[w].mag, reserve: WEAPONS[w].mag * 2 };
      d.current = w;
    } else if (id.startsWith('a:')) d.weapons[id.slice(2)].reserve += WEAPONS[id.slice(2)].ammoPack;
    sfx.buy();
    saveGame(d);
    this.renderDay();
  }

  renderDay() {
    const d = this.game.data;
    const max = barricadeMax(d.barricadeLevel);
    const used = this.alloc.repair + this.alloc.scav + this.alloc.search;
    const info = this.dayInfo;
    const row = (k, icon, label, hint) => `
      <div class="hour-row">
        <div class="hour-label">${icon} ${label}<small>${hint}</small></div>
        <div class="stepper">
          <button data-act="hour" data-arg="${k}:-" ${this.dayDone || !this.alloc[k] ? 'disabled' : ''}>−</button>
          <span>${this.alloc[k]}h</span>
          <button data-act="hour" data-arg="${k}:+" ${this.dayDone || used >= DAY_HOURS ? 'disabled' : ''}>+</button>
        </div>
      </div>`;
    const items = this.shopItems().map((it) => `
      <button class="shop-item${it.weapon ? ' weapon' : ''}" data-act="buy" data-arg="${it.id}" ${it.disabled || d.cash < it.price ? 'disabled' : ''}>
        <span class="si-title">${it.title}</span>
        <span class="si-desc">${it.desc}</span>
        <span class="si-price">$${it.price}</span>
      </button>`).join('');

    this.root.innerHTML = `
      <div class="screen day">
        <header class="day-header">
          <div>
            <h2>☀ Ban ngày — chuẩn bị cho Đêm ${d.night}</h2>
            ${info ? `<p class="summary">Đêm ${info.night}: hạ ${info.kills} zombie, kiếm $${info.earned} + thưởng sống sót $${info.bonus}</p>` : ''}
          </div>
          <div class="stats">
            <span class="cash">$${d.cash}</span>
            <span>🛡 ${Math.ceil(d.hp)}/${max}</span>
            <span>🧍 ${d.survivors}/${MAX_SURVIVORS}</span>
          </div>
        </header>
        <div class="day-body">
          <section class="panel hours">
            <h3>Phân chia thời gian <small>${DAY_HOURS - used}/${DAY_HOURS} giờ còn lại</small></h3>
            ${row('repair', '🔨', 'Sửa hàng rào', '+9% độ bền / giờ')}
            ${row('scav', '🎒', 'Lục lọi', 'Tiền, đạn, may mắn có súng')}
            ${row('search', '🔦', 'Tìm người sống sót', 'Họ sẽ bắn hỗ trợ')}
            ${this.dayDone
              ? `<ul class="day-log">${this.dayLog.map((l) => `<li>${l}</li>`).join('')}</ul>`
              : '<button class="primary" data-act="doDay">Thực hiện</button>'}
          </section>
          <section class="panel shop">
            <h3>Cửa hàng</h3>
            <div class="shop-grid">${items}</div>
          </section>
        </div>
        <footer class="day-footer">
          <button data-act="quit">Lưu & về menu</button>
          <button class="primary big" data-act="startNight" ${this.dayDone ? '' : 'disabled'}>
            ${this.dayDone ? `Bắt đầu Đêm ${d.night} ☾` : 'Hãy dùng thời gian ban ngày trước'}
          </button>
        </footer>
      </div>`;
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().then(() => {
      screen.orientation?.lock?.('landscape').catch(() => {});
    }).catch(() => {});
  } else document.exitFullscreen?.();
}
