import {
  WEAPONS, WEAPON_ORDER, DAY_HOURS, MAX_RELOAD_LVL, GRENADE, CAMPAIGN_NIGHTS,
  barricadeMax, barricadeUpgradePrice, reloadUpgradePrice, repairKitPrice, isBossNight,
} from './config.js';
import { INTRO, DAWN_LOG, ENDING, ENDLESS_NOTE, GAMEOVER_LINES, SURVIVORS, hasPerk } from './story.js';
import { newSave, saveGame, loadGame, clearSave, loadSettings, saveSettings } from './save.js';
import { sfx, initAudio, setSoundEnabled, setMusicEnabled, setMood } from './audio.js';
import { weaponIcon, drawPerson } from './render.js';

const rand = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rand(a, b + 1));
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const portraitCache = {};
function portrait(sv) {
  if (portraitCache[sv.id]) return portraitCache[sv.id];
  const c = document.createElement('canvas');
  c.width = 96; c.height = 96;
  const g = c.getContext('2d');
  g.fillStyle = '#1d1a22';
  g.fillRect(0, 0, 96, 96);
  g.scale(2.2, 2.2);
  drawPerson(g, 20, 120, 0.5, sv.look, 26, 0);
  portraitCache[sv.id] = c.toDataURL();
  return portraitCache[sv.id];
}

export class UI {
  constructor(root, game) {
    this.root = root;
    this.game = game;
    this.settings = loadSettings();
    setSoundEnabled(this.settings.sound);
    setMusicEnabled(this.settings.music);
    game.settings = this.settings;
    game.onState = (s, info) => this.onState(s, info);
    this.shopTab = 'weapons';
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
      else if (a === 'grenade') game.armGrenade();
      else if (a === 'weapon') game.switchWeapon(el.dataset.arg);
    });
    window.addEventListener('keydown', (e) => {
      if (this.cut && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); this.advanceCut(); }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) game.pause(); });
    this.lastHud = '';
    game.enterMenu();
    this.showMenu();
  }

  onState(s, info) {
    if (s === 'night') this.showHud();
    else if (s === 'weapon') this.lastHud = '';
    else if (s === 'paused') this.showPause();
    else if (s === 'day') this.afterNight(info);
    else if (s === 'gameover') this.showGameOver(info);
    else if (s === 'victory') this.showVictoryStory(info);
  }

  act(a, arg, el) {
    const g = this.game;
    switch (a) {
      case 'new':
        if (loadGame() && arg !== 'confirm') { this.confirmNew(); return; }
        clearSave();
        g.data = newSave();
        sfx.click();
        this.playCutscene(INTRO, () => { saveGame(g.data); g.startNight(); }, 'Bến Sương', true);
        break;
      case 'continue': {
        const d = loadGame();
        if (!d) return;
        g.data = d;
        sfx.click();
        if (d.night > CAMPAIGN_NIGHTS && !d.endless) this.showVictory(null);
        else this.showDay(null);
        break;
      }
      case 'retry': {
        const d = loadGame();
        if (!d) { this.act('new', 'confirm'); return; }
        g.data = d;
        sfx.click();
        g.startNight();
        break;
      }
      case 'help': this.showHelp(); break;
      case 'menu': g.data = null; g.enterMenu(); this.showMenu(); break;
      case 'toggle': {
        this.settings[arg] = !this.settings[arg];
        if (arg === 'sound') setSoundEnabled(this.settings.sound);
        if (arg === 'music') setMusicEnabled(this.settings.music);
        saveSettings(this.settings);
        if (el) el.outerHTML = this.toggleBtn(arg);
        sfx.click();
        break;
      }
      case 'fullscreen': toggleFullscreen(); break;
      case 'resume': g.resume(); break;
      case 'quit':
        // giữa đêm thì không lưu: bản lưu là trạng thái trước khi vào đêm
        if (g.state === 'day') saveGame(g.data);
        g.data = null;
        g.enterMenu();
        this.showMenu();
        break;
      case 'hour': this.changeHour(arg); break;
      case 'doDay': this.doDay(); break;
      case 'buy': this.buy(arg); break;
      case 'tab': this.shopTab = arg; sfx.click(); this.renderDay(); break;
      case 'startNight': saveGame(g.data); sfx.click(); g.startNight(); break;
      case 'endless':
        g.data.endless = true;
        saveGame(g.data);
        this.playCutscene(ENDLESS_NOTE, () => this.showDay(null), 'Chế độ vô tận');
        break;
      case 'next': this.advanceCut(); break;
      case 'skip': this.finishCut(); break;
      case 'closeModal': this.closeModal(); break;
    }
  }

  toggleBtn(key) {
    const labels = { sound: 'Âm thanh', music: 'Nhạc nền', shake: 'Rung màn hình' };
    const on = this.settings[key];
    return `<button class="toggle ${on ? 'on' : ''}" data-act="toggle" data-arg="${key}"><span>${labels[key]}</span><b>${on ? 'BẬT' : 'TẮT'}</b></button>`;
  }

  // ---------- Menu ----------
  showMenu() {
    this.cut = null;
    const save = loadGame();
    const fs = document.fullscreenEnabled ? '<button class="ghost" data-act="fullscreen">Toàn màn hình</button>' : '';
    const contLabel = save
      ? (save.night > CAMPAIGN_NIGHTS && !save.endless ? 'Tiếp tục · Đã thắng chiến dịch' : `Tiếp tục · Đêm ${save.night}${save.endless ? ' (vô tận)' : `/${CAMPAIGN_NIGHTS}`}`)
      : '';
    this.root.innerHTML = `
      <div class="screen menu fade-in">
        <div class="menu-left">
          <div class="eyebrow">Bến Sương · 10 đêm chờ cứu hộ</div>
          <h1 class="title"><span class="t1">BARRICADE</span><span class="t2">NIGHTS</span></h1>
          <p class="tagline">Giữ vững hàng rào. Sống sót cho đến khi trực thăng tới.</p>
          <div class="menu-buttons">
            ${save ? `<button class="primary" data-act="continue">${contLabel}</button>` : ''}
            <button class="${save ? '' : 'primary'}" data-act="new">Chiến dịch mới</button>
            <button data-act="help">Hướng dẫn</button>
            <div class="menu-row">${this.toggleBtn('sound')}${this.toggleBtn('music')}</div>
            ${fs}
          </div>
        </div>
        <div class="menu-foot">Chạm hoặc click để bắn · Bắn vào đầu để hạ nhanh</div>
      </div>`;
  }

  confirmNew() {
    this.modal(`
      <h2>Bắt đầu lại?</h2>
      <p>Tiến trình hiện tại sẽ bị xoá và bạn bắt đầu lại từ đêm 1.</p>
      <div class="modal-actions">
        <button data-act="closeModal">Huỷ</button>
        <button class="primary" data-act="new" data-arg="confirm">Bắt đầu lại</button>
      </div>`);
  }

  modal(html) {
    this.root.querySelector('.modal-wrap')?.remove();
    const m = document.createElement('div');
    m.className = 'modal-wrap fade-in';
    m.innerHTML = `<div class="panel modal">${html}</div>`;
    this.root.appendChild(m);
  }
  closeModal() {
    this.root.querySelector('.modal-wrap')?.remove();
    if (this.modalQueue?.length) this.modal(this.modalQueue.shift());
  }

  showHelp() {
    this.root.innerHTML = `
      <div class="screen panel-screen fade-in">
        <div class="panel help">
          <h2>Cách sống sót</h2>
          <div class="help-grid">
            <div><h4>Ban đêm</h4>
              <p>Zombie kéo đến từ bên phải để phá hàng rào. Ngắm và bắn bằng chuột hoặc chạm vào màn hình. Súng tự động thì giữ để xả đạn.</p>
              <p><b>Bắn vào đầu</b> gây x2.5 sát thương, thưởng thêm 50% tiền. Hạ liên tiếp nhanh được thưởng thêm.</p>
            </div>
            <div><h4>Ban ngày</h4>
              <p>Chia ${DAY_HOURS} giờ cho sửa rào, lục lọi tiền và đạn, hoặc tìm người sống sót. Mỗi người có một kỹ năng riêng và sẽ bắn hỗ trợ bạn.</p>
              <p>Mua súng, đạn, lựu đạn và nâng cấp ở cửa hàng.</p>
            </div>
            <div><h4>Điều khiển</h4>
              <table class="keys">
                <tr><td>Bắn</td><td>Click / chạm</td></tr>
                <tr><td>Nạp đạn</td><td>R · nút ⟳</td></tr>
                <tr><td>Lựu đạn</td><td>G hoặc Space · nút lựu đạn rồi chạm</td></tr>
                <tr><td>Đổi súng</td><td>1–5 · Q/E · con lăn</td></tr>
                <tr><td>Tạm dừng</td><td>P · Esc</td></tr>
              </table>
            </div>
          </div>
          <button class="primary" data-act="menu">Quay lại</button>
        </div>
      </div>`;
  }

  // ---------- Phim cốt truyện ----------
  playCutscene(lines, done, chapter = '', demo = false) {
    if (demo) this.game.state = 'cutscene'; // màn mở đầu: zombie diễn phía sau
    this.cut = { lines, i: 0, done, chars: 0, timer: null };
    this.root.innerHTML = `
      <div class="screen cutscene fade-in" data-act="next">
        <div class="bar top"></div>
        <div class="cut-chapter">${esc(chapter)}</div>
        <div class="cut-box">
          <div class="cut-who"></div>
          <p class="cut-text"></p>
          <div class="cut-hint">Chạm để tiếp tục ▸</div>
        </div>
        <button class="cut-skip ghost" data-act="skip">Bỏ qua ▸▸</button>
        <div class="bar bottom"></div>
      </div>`;
    this.showCutLine();
  }

  showCutLine() {
    const c = this.cut;
    const line = c.lines[c.i];
    const who = this.root.querySelector('.cut-who');
    const text = this.root.querySelector('.cut-text');
    who.textContent = line.who;
    who.className = 'cut-who who-' + (line.who === 'RADIO' ? 'radio' : line.who === 'NHẬT KÝ' ? 'journal' : 'you');
    text.className = 'cut-text' + (line.who === 'RADIO' ? ' radio' : '');
    if (line.who === 'RADIO') sfx.static();
    c.chars = 0;
    clearInterval(c.timer);
    c.timer = setInterval(() => {
      c.chars += 1;
      text.textContent = line.text.slice(0, c.chars);
      if (line.text[c.chars - 1] !== ' ') sfx.typeTick();
      if (c.chars >= line.text.length) clearInterval(c.timer);
    }, 24);
  }

  advanceCut() {
    const c = this.cut;
    if (!c) return;
    const line = c.lines[c.i];
    if (c.chars < line.text.length) { // hiện hết câu trước
      clearInterval(c.timer);
      c.chars = line.text.length;
      this.root.querySelector('.cut-text').textContent = line.text;
      return;
    }
    c.i++;
    if (c.i >= c.lines.length) this.finishCut();
    else this.showCutLine();
  }

  finishCut() {
    const c = this.cut;
    if (!c) return;
    clearInterval(c.timer);
    this.cut = null;
    c.done();
  }

  // ---------- HUD ban đêm ----------
  showHud() {
    this.lastHud = '';
    this.cut = null;
    this.root.innerHTML = `
      <div class="hud">
        <button class="hud-btn pause" data-hud="pause" aria-label="Tạm dừng">❚❚</button>
        <div class="weapon-bar"></div>
        <div class="hud-actions">
          <button class="hud-btn grenade" data-hud="grenade" aria-label="Lựu đạn"></button>
          <button class="hud-btn reload" data-hud="reload" aria-label="Nạp đạn">⟳<small>R</small></button>
        </div>
      </div>`;
    this.weaponBar = this.root.querySelector('.weapon-bar');
    this.grenadeBtn = this.root.querySelector('.hud-btn.grenade');
    this.updateHud();
  }

  // gọi mỗi khung hình; chỉ cập nhật DOM khi có thay đổi
  updateHud() {
    const g = this.game;
    if (g.state !== 'night' || !this.weaponBar) return;
    const d = g.data;
    const key = WEAPON_ORDER.filter((id) => d.weapons[id])
      .map((id) => `${id}:${d.weapons[id].mag}:${d.weapons[id].reserve}`).join('|') + d.current + (g.reloadT > 0) + d.grenades + g.grenadeArmed;
    if (key === this.lastHud) return;
    this.lastHud = key;
    this.weaponBar.innerHTML = WEAPON_ORDER.filter((id) => d.weapons[id]).map((id, i) => {
      const w = WEAPONS[id], st = d.weapons[id];
      const active = id === d.current;
      const empty = st.mag === 0 ? ' empty' : '';
      return `<button class="weapon-slot${active ? ' active' : ''}${empty}" data-hud="weapon" data-arg="${id}">
        <span class="slot-key">${i + 1}</span>
        <img class="slot-icon" src="${weaponIcon(id)}" alt="">
        <span class="slot-ammo">${active && g.reloadT > 0 ? '···' : st.mag}<small>/${w.infinite ? '∞' : st.reserve}</small></span>
      </button>`;
    }).join('');
    this.grenadeBtn.innerHTML = `<img src="${weaponIcon('grenade')}" alt=""><b>${d.grenades}</b>`;
    this.grenadeBtn.classList.toggle('armed', g.grenadeArmed);
    this.grenadeBtn.classList.toggle('none', d.grenades <= 0);
  }

  showPause() {
    this.root.innerHTML = `
      <div class="screen panel-screen dim fade-in">
        <div class="panel small">
          <h2>Tạm dừng</h2>
          <button class="primary" data-act="resume">Tiếp tục chiến đấu</button>
          ${this.toggleBtn('sound')}${this.toggleBtn('music')}${this.toggleBtn('shake')}
          <button class="ghost" data-act="quit">Về menu (đêm này sẽ chơi lại từ đầu)</button>
        </div>
      </div>`;
  }

  showGameOver(info) {
    const d = this.game.data;
    this.root.innerHTML = `
      <div class="screen panel-screen dim red fade-in-slow">
        <div class="panel small over">
          <div class="eyebrow danger">Đêm ${info.night}</div>
          <h2 class="danger big-title">HÀNG RÀO ĐÃ VỠ</h2>
          <p class="story-line">${GAMEOVER_LINES[ri(0, GAMEOVER_LINES.length - 1)]}</p>
          <div class="stat-row">
            <div><b>${d.night - 1}</b><span>đêm sống sót</span></div>
            <div><b>${d.totalKills}</b><span>zombie đã hạ</span></div>
            <div><b>${d.headshots || 0}</b><span>headshot</span></div>
          </div>
          <button class="primary" data-act="retry">Thử lại đêm ${info.night}</button>
          <button data-act="new" data-arg="confirm">Chiến dịch mới</button>
          <button class="ghost" data-act="menu">Menu chính</button>
        </div>
      </div>`;
  }

  showVictoryStory(info) {
    setTimeout(() => this.playCutscene(ENDING, () => { this.game.state = 'victory'; this.showVictory(info); }, 'Bình minh thứ mười'), 600);
  }

  showVictory() {
    const d = this.game.data;
    sfx.victory();
    this.root.innerHTML = `
      <div class="screen panel-screen dawn fade-in-slow">
        <div class="panel small victory">
          <div class="eyebrow">Chiến dịch hoàn thành</div>
          <h2 class="big-title gold">BẠN ĐÃ SỐNG SÓT</h2>
          <p class="story-line">Mười đêm ở Bến Sương. Trực thăng Hải Âu đã đưa bạn${d.crew.length ? ` và ${d.crew.length} người đồng hành` : ''} rời khỏi đồi Cao Vọng.</p>
          <div class="stat-row">
            <div><b>${d.totalKills}</b><span>zombie đã hạ</span></div>
            <div><b>${d.headshots || 0}</b><span>headshot</span></div>
            <div><b>${d.crew.length}/${SURVIVORS.length}</b><span>người được cứu</span></div>
          </div>
          <button class="primary" data-act="endless">Ở lại chiến đấu · Chế độ vô tận</button>
          <button class="ghost" data-act="menu">Menu chính</button>
        </div>
      </div>`;
  }

  // ---------- Ban ngày ----------
  afterNight(info) {
    const log = DAWN_LOG[info.night];
    const go = () => this.showDay(info);
    if (log && !this.game.data.endless) setTimeout(() => this.playCutscene(log, go, `Bình minh · Ngày ${info.night + 1}`), 400);
    else setTimeout(go, 400);
  }

  showDay(info) {
    const g = this.game;
    g.state = 'day';
    setMood('day');
    this.dayInfo = info;
    this.alloc = { repair: 0, scav: 0, search: 0 };
    this.dayDone = !!g.data.dayUsed;
    this.fadeDay = true;
    this.dayLog = this.dayDone ? [{ icon: '·', text: 'Bạn đã dùng hết thời gian của ngày hôm nay.' }] : [];
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

  repairRate() { return hasPerk(this.game.data, 'lan') ? 0.12 : 0.09; }

  doDay() {
    const d = this.game.data;
    const max = barricadeMax(d.barricadeLevel);
    const log = [];
    if (this.alloc.repair) {
      const before = d.hp;
      d.hp = Math.min(max, d.hp + this.alloc.repair * max * this.repairRate());
      log.push({ icon: '🔨', text: `Sửa hàng rào: +${Math.round(d.hp - before)} độ bền${hasPerk(d, 'lan') ? ' (Lan giúp một tay)' : ''}.` });
    }
    let cash = 0;
    const cashMul = hasPerk(d, 'mai') ? 1.3 : 1;
    for (let i = 0; i < this.alloc.scav; i++) {
      cash += Math.round(rand(35, 85) * (1 + d.night * 0.08) * cashMul);
      if (Math.random() < 0.3) {
        const owned = WEAPON_ORDER.filter((id) => d.weapons[id] && !WEAPONS[id].infinite);
        if (owned.length) {
          const id = owned[ri(0, owned.length - 1)];
          const amt = Math.ceil(WEAPONS[id].ammoPack * rand(0.25, 0.5));
          d.weapons[id].reserve += amt;
          log.push({ icon: '📦', text: `Tìm thấy ${amt} viên đạn ${WEAPONS[id].name}.` });
        }
      }
      if (Math.random() < 0.15 && d.grenades < GRENADE.max) {
        d.grenades++;
        log.push({ icon: '💣', text: 'Nhặt được một quả lựu đạn trong đồn cảnh sát cũ.' });
      }
      if (Math.random() < 0.035) {
        const missing = WEAPON_ORDER.filter((id) => !d.weapons[id]);
        if (missing.length) {
          const id = missing[0];
          d.weapons[id] = { mag: 0, reserve: WEAPONS[id].mag * 2 };
          log.push({ icon: '🔫', text: `May mắn! Nhặt được khẩu ${WEAPONS[id].name}!` });
        }
      }
    }
    if (this.alloc.scav) { d.cash += cash; log.push({ icon: '💰', text: `Lục lọi được $${cash}${hasPerk(d, 'mai') ? ' (Mai dẫn đường)' : ''}.` }); }

    const found = [];
    for (let i = 0; i < this.alloc.search; i++) {
      const next = SURVIVORS.find((s) => !d.crew.includes(s.id));
      if (!next) break;
      d.searchPity = (d.searchPity || 0) + 1;
      if (Math.random() < 0.14 + Math.min(d.night * 0.012, 0.12) || d.searchPity >= 7) {
        d.crew.push(next.id);
        d.searchPity = 0;
        found.push(next);
      }
    }
    if (this.alloc.search) {
      if (found.length) found.forEach((s) => log.push({ icon: '🧍', text: `${s.name} (${s.role}) đã gia nhập nhóm!` }));
      else log.push({ icon: '🔦', text: d.crew.length >= SURVIVORS.length ? 'Nơi trú ẩn đã đủ người.' : 'Không tìm thấy ai còn sống… nhưng bạn đã đi được xa hơn.' });
    }
    if (!log.length) log.push({ icon: '·', text: 'Bạn nghỉ ngơi cả ngày.' });
    this.dayLog = log;
    this.dayDone = true;
    d.dayUsed = true;
    saveGame(d);
    sfx.buy();
    if (found.length) this.shopTab = 'crew';
    this.animateLog = true;
    this.renderDay();
    this.modalQueue = found.map((s) => this.survivorCard(s));
    if (this.modalQueue.length) this.modal(this.modalQueue.shift());
  }

  survivorCard(s) {
    return `
      <div class="found">
        <img src="${portrait(s)}" alt="">
        <div>
          <div class="eyebrow">Người sống sót mới</div>
          <h2>${s.name} <small>${s.role}</small></h2>
          <p class="story-line">${s.intro}</p>
          <p class="perk">Kỹ năng: ${s.perk}</p>
        </div>
      </div>
      <div class="modal-actions"><button class="primary" data-act="closeModal">Chào mừng</button></div>`;
  }

  shopItems() {
    const d = this.game.data;
    const max = barricadeMax(d.barricadeLevel);
    if (this.shopTab === 'weapons') {
      return WEAPON_ORDER.filter((id) => !WEAPONS[id].infinite).map((id) => {
        const w = WEAPONS[id];
        const stats = `ST ${w.dmg}${w.pellets > 1 ? '×' + w.pellets : ''} · băng ${w.mag}${w.auto ? ' · tự động' : ''}${w.pierce > 1 ? ' · xuyên ' + w.pierce : ''}`;
        if (!d.weapons[id]) return { id: 'w:' + id, icon: id, title: w.name, desc: w.desc, stats, price: w.price, tag: 'MỚI' };
        return { id: 'a:' + id, icon: id, title: `Đạn ${w.name} +${w.ammoPack}`, desc: `Đang có ${d.weapons[id].reserve + d.weapons[id].mag} viên`, stats, price: w.ammoPrice, owned: true };
      });
    }
    const items = [
      { id: 'grenade', icon: 'grenade', title: 'Lựu đạn', desc: `Nổ diện rộng, cực mạnh với bầy đàn. Đang có ${d.grenades}/${GRENADE.max}.`, price: GRENADE.price, disabled: d.grenades >= GRENADE.max },
      { id: 'repair', title: 'Bộ sửa chữa', desc: `+25% độ bền ngay lập tức (${Math.ceil(d.hp)}/${max})`, price: repairKitPrice(d.night), disabled: d.hp >= max },
      { id: 'barricade', title: `Gia cố hàng rào · cấp ${d.barricadeLevel + 1}`, desc: `Độ bền tối đa ${max} → ${barricadeMax(d.barricadeLevel + 1)}`, price: barricadeUpgradePrice(d.barricadeLevel) },
    ];
    if (d.reloadLevel < MAX_RELOAD_LVL) {
      items.push({ id: 'reloadUp', title: `Luyện nạp đạn · cấp ${d.reloadLevel + 1}/${MAX_RELOAD_LVL}`, desc: 'Nạp đạn mọi loại súng nhanh hơn 12%', price: reloadUpgradePrice(d.reloadLevel) });
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
    else if (id === 'grenade') d.grenades++;
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
    const campaign = !d.endless && d.night <= CAMPAIGN_NIGHTS;
    const scroll = this.root.querySelector('.shop-list')?.scrollTop || 0;

    const dots = campaign ? `<div class="night-track">${Array.from({ length: CAMPAIGN_NIGHTS }, (_, i) => {
      const n = i + 1;
      const cls = n < d.night ? 'done' : n === d.night ? 'next' : '';
      return `<span class="${cls}${n === CAMPAIGN_NIGHTS ? ' boss' : ''}" title="Đêm ${n}"></span>`;
    }).join('')}<em>🚁</em></div>` : '';

    const radioLines = DAWN_LOG[d.night - 1];
    const radio = radioLines && !d.endless ? radioLines[radioLines.length - 1] : null;
    const warn = isBossNight(d.night) ? '<div class="warn">⚠ Đêm nay có trăng máu: Kẻ Khổng Lồ sẽ xuất hiện.</div>' : '';

    const row = (k, label, hint) => `
      <div class="hour-row">
        <div class="hour-label">${label}<small>${hint}</small></div>
        <div class="stepper">
          <button data-act="hour" data-arg="${k}:-" ${this.dayDone || !this.alloc[k] ? 'disabled' : ''} aria-label="Bớt">−</button>
          <span>${this.alloc[k]}<i>h</i></span>
          <button data-act="hour" data-arg="${k}:+" ${this.dayDone || used >= DAY_HOURS ? 'disabled' : ''} aria-label="Thêm">+</button>
        </div>
      </div>`;
    const hourDots = Array.from({ length: DAY_HOURS }, (_, i) => {
      let c = '';
      if (i < this.alloc.repair) c = 'r';
      else if (i < this.alloc.repair + this.alloc.scav) c = 's';
      else if (i < used) c = 'f';
      return `<span class="${c}"></span>`;
    }).join('');

    let shopBody;
    if (this.shopTab === 'crew') {
      shopBody = SURVIVORS.map((s) => {
        const has = d.crew.includes(s.id);
        return `<div class="crew-card ${has ? '' : 'unknown'}">
          ${has ? `<img src="${portrait(s)}" alt="">` : '<div class="crew-unknown">?</div>'}
          <div><b>${has ? `${s.name} · ${s.role}` : 'Chưa tìm thấy'}</b>
          <span>${has ? s.perk : 'Dành thời gian tìm người sống sót vào ban ngày.'}</span></div>
        </div>`;
      }).join('');
    } else {
      shopBody = this.shopItems().map((it) => `
        <button class="shop-item${it.owned ? ' owned' : ''}" data-act="buy" data-arg="${it.id}" ${it.disabled || d.cash < it.price ? 'disabled' : ''}>
          ${it.icon ? `<img class="si-icon" src="${weaponIcon(it.icon)}" alt="">` : '<span class="si-icon si-glyph">' + (it.id === 'repair' ? '✚' : it.id === 'barricade' ? '▦' : '⟳') + '</span>'}
          <span class="si-main">
            <span class="si-title">${it.title}${it.tag ? ` <em>${it.tag}</em>` : ''}</span>
            <span class="si-desc">${it.desc}</span>
            ${it.stats ? `<span class="si-stats">${it.stats}</span>` : ''}
          </span>
          <span class="si-price">$${it.price}</span>
        </button>`).join('');
    }

    this.root.innerHTML = `
      <div class="screen day ${this.fadeDay === false ? '' : 'fade-in'}">
        <header class="day-header">
          <div class="day-title">
            <div class="eyebrow">${campaign ? `Ban ngày · còn ${CAMPAIGN_NIGHTS - d.night + 1} đêm` : 'Ban ngày · chế độ vô tận'}</div>
            <h2>Chuẩn bị cho Đêm ${d.night}</h2>
            ${dots}
          </div>
          <div class="stats">
            <div class="stat cash"><b>$${d.cash}</b><span>tiền</span></div>
            <div class="stat"><b>${Math.ceil(d.hp)}<i>/${max}</i></b><span>hàng rào</span></div>
            <div class="stat"><b>${d.crew.length}<i>/${SURVIVORS.length}</i></b><span>đồng đội</span></div>
          </div>
        </header>
        <div class="day-body">
          <section class="panel plan">
            ${info ? `<div class="recap">Đêm ${info.night}: hạ <b>${info.kills}</b> zombie (${info.headshots} headshot), chuỗi dài nhất <b>${info.bestStreak}</b>, kiếm <b>$${info.earned}</b> + thưởng sống sót <b>$${info.bonus}</b>.</div>` : ''}
            ${radio ? `<div class="radio-card"><span class="radio-tag">${radio.who}</span>${esc(radio.text)}</div>` : ''}
            ${warn}
            <h3>${this.dayDone ? 'Kết quả trong ngày' : 'Kế hoạch ban ngày'} <small>${this.dayDone ? 'Đã hết giờ' : `${DAY_HOURS - used} giờ còn lại`}</small></h3>
            <div class="hour-dots">${hourDots}</div>
            ${this.dayDone
              ? `<ul class="day-log${this.animateLog ? ' animate' : ''}">${this.dayLog.map((l) => `<li><span>${l.icon}</span>${l.text}</li>`).join('')}</ul>`
              : `${row('repair', '🔨 Sửa hàng rào', `+${Math.round(this.repairRate() * 100)}% độ bền mỗi giờ`)}
            ${row('scav', '🎒 Lục lọi', 'Tiền, đạn, lựu đạn, may mắn có súng')}
            ${row('search', '🔦 Tìm người sống sót', d.crew.length >= SURVIVORS.length ? 'Đã đủ người' : 'Có thể không tìm thấy ai')}
              <button class="primary wide" data-act="doDay" ${used ? '' : 'disabled'}>${used ? `Thực hiện kế hoạch (${used} giờ)` : 'Phân bổ ít nhất 1 giờ'}</button>`}
          </section>
          <section class="panel shop">
            <div class="tabs">
              <button class="${this.shopTab === 'weapons' ? 'active' : ''}" data-act="tab" data-arg="weapons">Vũ khí</button>
              <button class="${this.shopTab === 'gear' ? 'active' : ''}" data-act="tab" data-arg="gear">Trang bị</button>
              <button class="${this.shopTab === 'crew' ? 'active' : ''}" data-act="tab" data-arg="crew">Đồng đội ${d.crew.length}/${SURVIVORS.length}</button>
            </div>
            <div class="shop-list">${shopBody}</div>
          </section>
        </div>
        <footer class="day-footer">
          <button class="ghost" data-act="quit">Lưu & về menu</button>
          <button class="primary big" data-act="startNight" ${this.dayDone ? '' : 'disabled'}>
            ${this.dayDone ? `Bắt đầu Đêm ${d.night} ☾` : 'Hãy dùng thời gian ban ngày trước'}
          </button>
        </footer>
      </div>`;
    this.fadeDay = false;
    this.animateLog = false;
    const list = this.root.querySelector('.shop-list');
    if (list) list.scrollTop = scroll;
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().then(() => {
      screen.orientation?.lock?.('landscape').catch(() => {});
    }).catch(() => {});
  } else document.exitFullscreen?.();
}
