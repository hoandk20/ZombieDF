import {
  WEAPONS, WEAPON_ORDER, DAY_HOURS, MAX_RELOAD_LVL, GRENADE, CAMPAIGN_NIGHTS, ACT_LENGTH, ACT_NAMES,
  barricadeMax, barricadeUpgradePrice, reloadUpgradePrice, repairKitPrice, isBossNight, bossTypeFor, actFor,
  ZOMBIES, dmgUpgradePrice, MAX_DMG_LVL, stageFor, STAGE_LENGTH, STAGE_NAMES, SCENES, MAX_SQUAD,
  modsFor, MOD_INFO, mateLevel, MATE_XP, CAMP_INCOME,
  DIFFICULTIES, DIFF_ORDER, diffOf, UPKEEP, TURRET, MINE, WIRE, FLOODLIGHT_PRICE,
  SHOCKER, FLAME_TURRET, MORTAR, TESLA_TOWER, DRONE, DEFENSES_BY_ACT, ALL_DEFENSES, resetDefenses,
} from './config.js';
import {
  INTRO, DAWN_LOG, ENDING, ENDLESS_NOTE, GAMEOVER_LINES, SURVIVORS, ACT1_END, ACT2_INTRO,
  STAGE1_END, STAGE2_INTRO, ACT3_END, ACT4_INTRO, STAGE2_END, STAGE3_INTRO, ACT5_END, ACT6_INTRO, hasPerk,
} from './story.js';
import { newSave, saveGame, loadGame, clearSave, loadSettings, saveSettings } from './save.js';
import { sfx, initAudio, setSoundEnabled, setMusicEnabled, setMood } from './audio.js';
import { weaponIcon, heroPortrait, characterPortrait } from './render.js';

const rand = (a, b) => a + Math.random() * (b - a);

// Sự kiện buổi sáng: những lựa chọn khó khăn của người sống sót
const MORNING_EVENTS = [
  {
    title: 'Người lạ xin ăn',
    text: 'Một người đàn ông gầy gò đứng ngoài hàng rào, tay giơ cao. "Tôi chỉ xin ít đồ ăn. Hai ngày rồi tôi chưa ăn gì."',
    choices: [
      { label: 'Chia 2 hộp đồ ăn', hint: '−2 đồ hộp, có thể được đền đáp', run: (d) => { d.food = Math.max(0, (d.food || 0) - 2); if (Math.random() < 0.6) { d.grenades = Math.min(6, d.grenades + 1); return 'Ông ấy cảm ơn rối rít, để lại một quả lựu đạn tìm được trên đường rồi lặng lẽ đi về phía núi.'; } return 'Ông ấy ăn ngấu nghiến rồi đi mất. Ít nhất đêm nay bạn ngủ ngon hơn.'; } },
      { label: 'Đuổi đi', hint: 'Giữ đồ ăn cho nhóm', run: () => 'Ông ấy nhìn bạn rất lâu rồi bỏ đi. Bạn cố không nghĩ về chuyện đó.' },
    ],
  },
  {
    title: 'Tiếng khóc trong khu nhà bên',
    text: 'Có tiếng khóc như trẻ con vọng ra từ căn nhà đổ nát bên kia đường. Có thể là người sống sót. Cũng có thể là cái bẫy.',
    choices: [
      { label: 'Đi kiểm tra', hint: 'Rủi ro, có thể được đồ ăn', run: (d, max) => { if (Math.random() < 0.55) { d.food = (d.food || 0) + 4; d.searchPity = (d.searchPity || 0) + 3; return 'Một gia đình trốn dưới hầm. Họ đã lên đường về phía nam, để lại 4 hộp đồ ăn và chỉ cho bạn chỗ có thể còn người sống.'; } d.hp = Math.max(1, d.hp - max * 0.12); return 'Là một con zombie mắc kẹt dưới đống gạch. Cả bầy nghe tiếng động kéo đến, phá một mảng hàng rào trước khi bạn kịp chạy về.'; } },
      { label: 'Mặc kệ', hint: 'An toàn', run: () => 'Tiếng khóc tắt dần lúc gần trưa. Bạn không bao giờ biết đó là gì.' },
    ],
  },
  {
    title: 'Thùng cứu trợ giữa đường',
    text: 'Một thùng hàng cứu trợ rơi lệch, nằm giữa đường cách hàng rào hai trăm mét. Vài cái bóng đang lảng vảng quanh đó.',
    choices: [
      { label: 'Liều ra lấy', hint: 'Được tiền và đồ ăn, rào có thể bị hư', run: (d, max) => { const cash = Math.round(rand(150, 300) * (1 + d.night * 0.05)); d.cash += cash; d.food = (d.food || 0) + 2; if (Math.random() < 0.5) { d.hp = Math.max(1, d.hp - max * 0.08); return `Bạn kéo được thùng về: $${cash} và 2 hộp đồ ăn. Nhưng vài con bám theo, cào hỏng một góc hàng rào.`; } return `Bạn kéo được thùng về trót lọt: $${cash} và 2 hộp đồ ăn.`; } },
      { label: 'Bỏ qua', hint: 'Không mạo hiểm', run: () => 'Đến chiều, thùng hàng đã biến mất. Ai đó khác liều hơn bạn.' },
    ],
  },
  {
    title: 'Kho thuốc bỏ hoang',
    text: 'Bạn tìm thấy một hiệu thuốc cửa sắt còn khoá. Bên trong tối om, có mùi lạ.',
    choices: [
      { label: 'Phá cửa vào', hint: 'Có thể được nhiều đồ, có thể mất tiền sửa đồ', run: (d) => { if (Math.random() < 0.7) { d.food = (d.food || 0) + 2; d.grenades = Math.min(6, d.grenades + 1); for (const id of Object.keys(d.mates || {})) d.mates[id].injured = Math.max(0, (d.mates[id].injured || 0) - 1); return 'Thuốc men, băng gạc, 2 hộp đồ ăn và một quả lựu đạn. Những người bị thương hồi phục nhanh hơn một ngày.'; } d.cash = Math.max(0, d.cash - 120); return 'Cửa có bẫy. Bạn thoát được nhưng làm hỏng đồ nghề, mất $120 để sửa.'; } },
      { label: 'Đi tiếp', hint: 'An toàn', run: () => 'Bạn đánh dấu chỗ này trên bản đồ. Có lẽ để lần sau.' },
    ],
  },
  {
    title: 'Tín hiệu cầu cứu',
    text: 'Radio bắt được một giọng nói run rẩy: "Ai đó… chúng tôi bị kẹt ở trạm xăng, còn ba người…"',
    choices: [
      { label: 'Gửi đồ tiếp tế', hint: '−3 đồ hộp, dễ tìm người hơn', run: (d) => { d.food = Math.max(0, (d.food || 0) - 3); d.searchPity = (d.searchPity || 0) + 6; return 'Bạn hướng dẫn họ chỗ lấy đồ. Họ hứa sẽ báo cho bạn nếu thấy ai còn sống quanh đây.'; } },
      { label: 'Tắt radio', hint: 'Giữ đồ ăn', run: () => 'Bạn tắt radio. Lần đầu tiên, Phong tháo tai nghe xuống trước khi tín hiệu kịp tắt.' },
    ],
  },
  {
    title: 'Chuột phá kho',
    text: 'Sáng nay kho đồ ăn có dấu răng chuột. Nếu không làm gì, chúng sẽ ăn hết.',
    choices: [
      { label: 'Mua bẫy và dọn kho', hint: '−$80, giữ được đồ ăn', run: (d) => { d.cash = Math.max(0, d.cash - 80); return 'Kho sạch sẽ, đồ ăn còn nguyên. Bạn tự nhủ ít nhất vẫn còn thứ mình kiểm soát được.'; } },
      { label: 'Chấp nhận mất', hint: '−2 đồ hộp', run: (d) => { d.food = Math.max(0, (d.food || 0) - 2); return 'Lũ chuột ăn mất 2 hộp. Bữa sáng hôm nay ít hơn mọi ngày.'; } },
    ],
  },
  {
    title: 'Gương mặt quen',
    text: 'Trong số những cái xác lảng vảng ngoài hàng rào, có một gương mặt bạn nhận ra: người bán bánh mì đầu ngõ, vẫn đeo chiếc tạp dề cũ.',
    choices: [
      { label: 'Kết thúc cho ông ấy', hint: 'Lấy lại đồ trong túi tạp dề', run: (d) => { const c = Math.round(rand(60, 140)); d.cash += c; d.food = (d.food || 0) + 1; return `Một phát súng duy nhất. Trong túi tạp dề còn $${c} và một hộp sữa. Bạn chôn ông ấy cạnh hàng rào.`; } },
      { label: 'Để ông ấy đi', hint: 'Không làm gì', run: () => 'Bạn nhìn theo cho đến khi bóng ông khuất sau dãy nhà. Có những thứ bạn chưa sẵn sàng làm.' },
    ],
  },
  {
    title: 'Mưa đêm qua',
    text: 'Mưa lớn suốt đêm làm ướt kho đạn và mục một phần hàng rào.',
    choices: [
      { label: 'Phơi đạn, chằng rào', hint: 'Mất thời gian, giữ đạn', run: (d, max) => { d.hp = Math.max(1, d.hp - max * 0.05); return 'Đạn khô lại, nhưng một phần hàng rào vẫn hỏng mất 5% độ bền.'; } },
      { label: 'Gia cố rào trước', hint: 'Mất một ít đạn', run: (d) => { const ids = Object.keys(d.weapons).filter((id) => !WEAPONS[id].infinite); if (ids.length) { const id = ids[Math.floor(Math.random() * ids.length)]; const lost = Math.ceil(d.weapons[id].reserve * 0.2); d.weapons[id].reserve -= lost; return `Hàng rào vững vàng, nhưng ${lost} viên đạn ${WEAPONS[id].name} bị ẩm, không dùng được nữa.`; } return 'Hàng rào vững vàng. May mà bạn chưa có nhiều đạn để mà mất.'; } },
    ],
  },
];
const ri = (a, b) => Math.floor(rand(a, b + 1));
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const portrait = (sv) => characterPortrait(sv.id, sv.weapon);

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
    else if (s === 'interlude') this.showInterlude(info);
  }

  act(a, arg, el) {
    const g = this.game;
    switch (a) {
      case 'new':
        if (loadGame() && arg !== 'confirm') { this.confirmNew(); return; }
        sfx.click();
        this.chooseDifficulty();
        break;
      case 'diff':
        this.closeModal();
        clearSave();
        g.data = newSave();
        g.data.difficulty = arg;
        sfx.click();
        this.playCutscene(INTRO, () => { saveGame(g.data); g.startNight(); }, 'Bến Sương', true);
        break;
      case 'continue': {
        const d = loadGame();
        if (!d) return;
        g.data = d;
        sfx.click();
        if (d.night > CAMPAIGN_NIGHTS && !d.endless) this.showVictory(null);
        else if (actFor(d.night) > (d.seenAct || 1) && !d.endless) this.playActIntro(actFor(d.night), null);
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
      case 'squad': this.toggleSquad(arg); break;
      case 'startNight': saveGame(g.data); sfx.click(); g.startNight(); break;
      case 'endless':
        g.data.endless = true;
        saveGame(g.data);
        this.playCutscene(ENDLESS_NOTE, () => this.showDay(null), 'Chế độ vô tận');
        break;
      case 'next': this.advanceCut(); break;
      case 'skip': this.finishCut(); break;
      case 'closeModal': this.closeModal(); break;
      case 'event': this.resolveEvent(arg); break;
    }
  }

  toggleBtn(key) {
    const labels = { sound: 'Âm thanh', music: 'Nhạc nền', shake: 'Rung màn hình', hq: 'Đồ hoạ chi tiết' };
    const on = this.settings[key];
    return `<button class="toggle ${on ? 'on' : ''}" data-act="toggle" data-arg="${key}"><span>${labels[key]}</span><b>${on ? 'BẬT' : 'TẮT'}</b></button>`;
  }

  // ---------- Menu ----------
  showMenu() {
    this.cut = null;
    const save = loadGame();
    const fs = document.fullscreenEnabled ? '<button class="ghost" data-act="fullscreen">Toàn màn hình</button>' : '';
    const contLabel = save
      ? (save.night > CAMPAIGN_NIGHTS && !save.endless ? 'Tiếp tục · Đã thắng chiến dịch' : `Tiếp tục · Đêm ${save.night}${save.endless ? ' (vô tận)' : `/${CAMPAIGN_NIGHTS}`} · ${diffOf(save).name}`)
      : '';
    this.root.innerHTML = `
      <div class="screen menu fade-in">
        <div class="menu-left">
          <div class="eyebrow">3 màn · 60 đêm · Bến Sương → Thủ đô</div>
          <h1 class="title"><span class="t1">BARRICADE</span><span class="t2">NIGHTS</span></h1>
          <p class="tagline">Phong, người giữ trạm phát thanh cuối cùng. Giữ vững hàng rào cho đến khi được cứu.</p>
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

  chooseDifficulty() {
    this.modal(`
      <div class="eyebrow">Chiến dịch mới</div>
      <h2>Chọn độ khó</h2>
      <div class="diff-grid">
        ${DIFF_ORDER.map((k) => `<button class="diff-btn${k === 'normal' ? ' rec' : ''}" data-act="diff" data-arg="${k}">
          <b>${DIFFICULTIES[k].name}${k === 'normal' ? ' <em>ĐỀ XUẤT</em>' : ''}</b><span>${DIFFICULTIES[k].desc}</span></button>`).join('')}
      </div>
      <div class="modal-actions"><button class="ghost" data-act="closeModal">Huỷ</button></div>`);
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
          <div class="help-head">
            <img class="hero-card" src="${heroPortrait()}" alt="Phong">
            <div>
              <div class="eyebrow">Nhân vật chính</div>
              <h2>Phong · kỹ thuật viên trạm phát thanh</h2>
              <p class="story-line">Không bao giờ tháo tai nghe. Chừng nào radio còn phát, chừng đó Phong còn chiến đấu.</p>
            </div>
          </div>
          <div class="help-grid">
            <div><h4>Ban đêm</h4>
              <p>Zombie kéo đến từ bên phải để phá hàng rào. Ngắm và bắn bằng chuột hoặc chạm vào màn hình. Súng tự động thì giữ để xả đạn.</p>
              <p><b>Bắn vào đầu</b> gây x2.5 sát thương, thưởng thêm 50% tiền. Hạ liên tiếp nhanh được thưởng thêm.</p>
            </div>
            <div><h4>Ban ngày</h4>
              <p>Chia ${DAY_HOURS} giờ cho sửa rào, lục lọi tiền và đạn, hoặc tìm người sống sót. Mỗi người có một kỹ năng riêng và sẽ bắn hỗ trợ bạn.</p>
              <p>Chỉ 4 người được đứng trên rào, người còn lại ở trại kiếm thêm tiền. Đồng đội lên cấp khi hạ zombie và có thể bị thương khi rào sắp vỡ: hãy đưa người khác lên thay.</p>
              <p>Mỗi màn có 20 đêm. Chú ý <b>dự báo đêm nay</b>: mất điện, thả dù tiếp tế, kẻ mang hòm…</p>
              <p>Tab <b>Phòng thủ</b>: mỗi chương có bộ công trình riêng (mìn, dây thép gai, tháp súng, bẫy điện, tháp phun lửa, súng cối, tháp Tesla, drone). Sang chương mới, đồng đội và công trình đều phải làm lại từ đầu.</p>
            </div>
            <div><h4>Điều khiển</h4>
              <table class="keys">
                <tr><td>Bắn</td><td>Click / chạm</td></tr>
                <tr><td>Nạp đạn</td><td>R · nút ⟳</td></tr>
                <tr><td>Lựu đạn</td><td>G hoặc Space · nút lựu đạn rồi chạm</td></tr>
                <tr><td>Đổi súng</td><td>1–9 · Q/E · con lăn</td></tr>
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
    // mỗi câu có thể gắn một cảnh minh hoạ; câu không có cảnh thì giữ cảnh trước
    if (line.shot) this.game.setShot(line.shot);
    else if (c.i === 0) this.game.setShot(null);
    this.root.querySelector('.cutscene')?.classList.toggle('cine', !!this.game.cine);
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
    this.game.setShot(null);
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
    const ownedCount = WEAPON_ORDER.filter((id) => d.weapons[id]).length;
    this.weaponBar.classList.toggle('two-col', ownedCount > 6);
    this.weaponBar.innerHTML = WEAPON_ORDER.filter((id) => d.weapons[id]).map((id) => {
      const w = WEAPONS[id], st = d.weapons[id];
      const active = id === d.current;
      const empty = st.mag === 0 ? ' empty' : '';
      return `<button class="weapon-slot${active ? ' active' : ''}${empty}" data-hud="weapon" data-arg="${id}">
        <span class="slot-key">${WEAPON_ORDER.indexOf(id) + 1}</span>
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
          ${this.toggleBtn('sound')}${this.toggleBtn('music')}${this.toggleBtn('shake')}${this.toggleBtn('hq')}
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

  // Chuyển chương / chuyển màn
  showInterlude(info) {
    const n = info.transition;
    const end = {
      10: [ACT1_END, 'Hết chương 1 · Bình minh thứ mười'], 20: [STAGE1_END, 'Hết màn 1 · Bình minh thứ hai mươi'],
      30: [ACT3_END, 'Hết chương 3 · Bình minh thứ ba mươi'], 40: [STAGE2_END, 'Hết màn 2 · Bình minh thứ bốn mươi'],
      50: [ACT5_END, 'Hết chương 5 · Bình minh thứ năm mươi'],
    }[n];
    setTimeout(() => this.playCutscene(end[0], () => this.playActIntro(actFor(n + 1), info), end[1]), 600);
  }

  playActIntro(act, info) {
    const g = this.game;
    g.setScene(SCENES[act]);
    g.state = 'day';
    const lines = { 2: ACT2_INTRO, 3: STAGE2_INTRO, 4: ACT4_INTRO, 5: STAGE3_INTRO, 6: ACT6_INTRO }[act] || [];
    const stageStart = { 3: 2, 5: 3 }[act];
    const title = stageStart ? `Màn ${stageStart} · ${STAGE_NAMES[stageStart]} · Chương ${act} · ${ACT_NAMES[act]}` : `Chương ${act} · ${ACT_NAMES[act]}`;
    // chương mới: đồng đội cũ đã ở lại phía sau, công trình phòng thủ phải dựng lại từ đầu
    if (act > (g.data.seenAct || 1) && !g.data.endless) {
      g.data.crew = []; g.data.squad = []; g.data.mates = {}; g.data.searchPity = 0;
      resetDefenses(g.data);
    }
    this.playCutscene(lines, () => {
      g.data.seenAct = Math.max(g.data.seenAct || 1, act);
      saveGame(g.data);
      this.showDay(info);
    }, title);
  }

  showVictoryStory(info) {
    setTimeout(() => this.playCutscene(ENDING, () => { this.game.state = 'victory'; this.showVictory(info); }, 'Kết thúc · Bình minh thứ sáu mươi'), 600);
  }

  showVictory() {
    const d = this.game.data;
    sfx.victory();
    this.root.innerHTML = `
      <div class="screen panel-screen dawn fade-in-slow">
        <div class="panel small victory">
          <div class="eyebrow">Chiến dịch hoàn thành</div>
          <h2 class="big-title gold">BẠN ĐÃ SỐNG SÓT</h2>
          <p class="story-line">Sáu mươi đêm, từ Bến Sương tới thủ đô. Phong đã mang thùng mẫu đến Bệnh viện Trung ương, và vắc-xin bắt đầu được sản xuất cho cả đất nước.</p>
          <div class="stat-row">
            <div><b>${d.totalKills}</b><span>zombie đã hạ</span></div>
            <div><b>${d.headshots || 0}</b><span>headshot</span></div>
            <div><b>${d.crew.length}/${SURVIVORS.length}</b><span>đồng đội</span></div>
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
    g.scene = SCENES[actFor(g.data.night)];
    setMood('day');
    this.dayInfo = info;
    this.alloc = { repair: 0, scav: 0, search: 0 };
    this.dayDone = !!g.data.dayUsed;
    this.fadeDay = true;
    this.dayLog = this.dayDone ? [{ icon: '·', text: 'Bạn đã dùng hết thời gian của ngày hôm nay.' }] : [];
    this.renderDay();
    const d = g.data;
    if (info && !info.transition && d.eventDay !== d.night && Math.random() < 0.5) {
      d.eventDay = d.night;
      this.showEvent(MORNING_EVENTS[Math.floor(Math.random() * MORNING_EVENTS.length)]);
    }
  }

  showEvent(ev) {
    this.currentEvent = ev;
    this.modal(`
      <div class="eyebrow">Buổi sáng · Ngày ${this.game.data.night}</div>
      <h2>${ev.title}</h2>
      <p class="story-line">${ev.text}</p>
      <div class="event-choices">
        ${ev.choices.map((c, i) => `<button class="${i === 0 ? 'primary' : ''}" data-act="event" data-arg="${i}"><b>${c.label}</b><span>${c.hint}</span></button>`).join('')}
      </div>`);
  }

  resolveEvent(i) {
    const ev = this.currentEvent;
    if (!ev) return;
    const d = this.game.data;
    const result = ev.choices[Number(i)].run(d, barricadeMax(d.barricadeLevel));
    this.currentEvent = null;
    saveGame(d);
    this.renderDay();
    this.modal(`<h2>${ev.title}</h2><p class="story-line">${result}</p><div class="modal-actions"><button class="primary" data-act="closeModal">Tiếp tục</button></div>`);
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
    let cans = 0;
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
    for (let i = 0; i < this.alloc.scav; i++) if (Math.random() < 0.55) cans += 1 + (Math.random() < 0.25 ? 1 : 0);
    if (this.alloc.scav) {
      d.cash += cash;
      d.food = (d.food || 0) + cans;
      log.push({ icon: '💰', text: `Lục lọi được $${cash}${hasPerk(d, 'mai') ? ' (Mai dẫn đường)' : ''}.` });
      log.push({ icon: '🥫', text: cans ? `Tìm được ${cans} hộp đồ ăn.` : 'Không tìm được chút đồ ăn nào.' });
    }

    const found = [];
    for (let i = 0; i < this.alloc.search; i++) {
      const next = this.availableRecruits()[0];
      if (!next) break;
      d.searchPity = (d.searchPity || 0) + 1;
      const df = diffOf(d);
      const chance = ((0.07 + Math.min(d.night * 0.004, 0.06)) * df.recruit) / (1 + d.crew.length * 0.3);
      if (Math.random() < chance || d.searchPity >= Math.round(11 / df.recruit)) {
        d.crew.push(next.id);
        d.mates[next.id] = { xp: 0, injured: 0 };
        if (d.squad.length < MAX_SQUAD) d.squad.push(next.id);
        d.searchPity = 0;
        found.push(next);
      }
    }
    if (this.alloc.search) {
      if (found.length) found.forEach((s) => log.push({ icon: '🧍', text: `${s.name} (${s.role}) đã gia nhập nhóm!` }));
      else log.push({ icon: '🔦', text: !this.availableRecruits().length ? 'Quanh đây không còn ai để tìm nữa.' : 'Không tìm thấy ai còn sống… nhưng bạn đã đi được xa hơn.' });
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

  nextRecruitHint() {
    const d = this.game.data;
    const next = SURVIVORS.filter((s) => !d.crew.includes(s.id) && s.act === actFor(d.night) && (s.from || 1) > d.night).sort((a, b) => a.from - b.from)[0];
    return next ? `Chưa có ai quanh đây (có người mới từ đêm ${next.from})` : 'Quanh đây không còn ai';
  }

  eatPerDay() {
    const d = this.game.data;
    return 1 + d.crew.length + (diffOf(d).upkeep > 1.2 ? 1 : 0);
  }

  availableRecruits() {
    const d = this.game.data;
    // mỗi chương chỉ gặp được những người ở bản đồ đó
    if (d.endless) return SURVIVORS.filter((s) => !d.crew.includes(s.id));
    return SURVIVORS.filter((s) => !d.crew.includes(s.id) && s.act === actFor(d.night) && (s.from || 1) <= d.night);
  }

  // Đưa đồng đội lên hàng rào hoặc cho về trại
  toggleSquad(id) {
    const d = this.game.data;
    if (d.squad.includes(id)) d.squad = d.squad.filter((x) => x !== id);
    else if (d.mates[id]?.injured > 0) { sfx.deny(); return; }
    else if (d.squad.length >= MAX_SQUAD) { sfx.deny(); return; }
    else d.squad.push(id);
    sfx.click();
    saveGame(d);
    this.renderDay();
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
      const act = d.endless ? 2 : actFor(d.night);
      return WEAPON_ORDER.filter((id) => !WEAPONS[id].infinite && ((WEAPONS[id].act || 1) <= act || d.weapons[id])).map((id) => {
        const w = WEAPONS[id];
        const stats = `ST ${w.dmg}${w.pellets > 1 ? '×' + w.pellets : ''} · băng ${w.mag}${w.auto ? ' · tự động' : ''}${w.pierce > 1 ? ' · xuyên ' + w.pierce : ''}`;
        if (!d.weapons[id]) return { id: 'w:' + id, icon: id, title: w.name, desc: w.desc, stats, price: w.price, tag: w.act === 2 ? 'KHO CẢNG' : 'MỚI' };
        return { id: 'a:' + id, icon: id, title: `Đạn ${w.name} +${w.ammoPack}`, desc: `Đang có ${d.weapons[id].reserve + d.weapons[id].mag} viên`, stats, price: w.ammoPrice, owned: true };
      });
    }
    if (this.shopTab === 'defense') return this.defenseItems();
    const items = [
      { id: 'food', title: 'Đồ hộp × 3', desc: `Mỗi sáng cả nhóm ăn ${this.eatPerDay()} hộp. Hết đồ ăn thì bị đói: nạp đạn chậm, bắn rung tay. Đang có ${d.food || 0}.`, price: Math.round(70 * (1 + d.night * 0.03)), glyph: '🥫' },
      { id: 'grenade', icon: 'grenade', title: 'Lựu đạn', desc: `Nổ diện rộng, cực mạnh với bầy đàn. Đang có ${d.grenades}/${GRENADE.max}.`, price: GRENADE.price, disabled: d.grenades >= GRENADE.max },
      { id: 'repair', title: 'Bộ sửa chữa', desc: `+25% độ bền ngay lập tức (${Math.ceil(d.hp)}/${max})`, price: repairKitPrice(d.night), disabled: d.hp >= max },
      { id: 'barricade', title: `Gia cố hàng rào · cấp ${d.barricadeLevel + 1}`, desc: `Độ bền tối đa ${max} → ${barricadeMax(d.barricadeLevel + 1)}`, price: barricadeUpgradePrice(d.barricadeLevel) },
    ];
    const dl = d.dmgLevel || 0;
    if (dl < MAX_DMG_LVL) {
      items.push({ id: 'dmgUp', title: `Đạn xuyên giáp · cấp ${dl + 1}/${MAX_DMG_LVL}`, desc: 'Mọi vũ khí của bạn gây thêm 12% sát thương', price: dmgUpgradePrice(dl) });
    }
    if (d.reloadLevel < MAX_RELOAD_LVL) {
      items.push({ id: 'reloadUp', title: `Luyện nạp đạn · cấp ${d.reloadLevel + 1}/${MAX_RELOAD_LVL}`, desc: 'Nạp đạn mọi loại súng nhanh hơn 12%', price: reloadUpgradePrice(d.reloadLevel) });
    }
    return items;
  }

  // Công trình phòng thủ của chương hiện tại
  defenseItems() {
    const d = this.game.data;
    const avail = d.endless ? ALL_DEFENSES : DEFENSES_BY_ACT[actFor(d.night)] || [];
    const out = [];
    const tl = d.turretLevel || 1;
    for (const k of avail) {
      if (k === 'turret') {
        if ((d.turrets || 0) < TURRET.max) out.push({ id: 'turret', title: `Tháp súng máy tự động #${(d.turrets || 0) + 1}`, desc: 'Đặt trên hàng rào, tự bắn con gần nhất. Bắn liên tục sẽ quá nhiệt.', stats: `ST ${TURRET.dmg[tl - 1]} · ${Math.round(1 / TURRET.rate[tl - 1])} phát/giây`, price: TURRET.price, glyph: '⌖' });
        if ((d.turrets || 0) > 0 && tl < 3) out.push({ id: 'turretUp', title: `Nâng cấp tháp súng · cấp ${tl + 1}`, desc: 'Mạnh hơn, bắn nhanh hơn, lâu quá nhiệt hơn.', stats: `ST ${TURRET.dmg[tl - 1]} → ${TURRET.dmg[tl]}`, price: TURRET.upgrade[tl], glyph: '⌖' });
      } else if (k === 'mines') {
        out.push({ id: 'mines', title: 'Mìn × 2', desc: `Tự rải trước rào mỗi đêm, nổ khi zombie dẫm lên. Kẻ nhảy bật qua được. Đang có ${d.mines || 0}/${MINE.max}.`, price: MINE.price * 2, glyph: '✸', disabled: (d.mines || 0) + 2 > MINE.max });
      } else if (k === 'wire') {
        const wl = d.wireLevel || 0;
        if (wl < 2) out.push({ id: 'wire', title: `Dây thép gai · cấp ${wl + 1}`, desc: `Zombie sát rào bị làm chậm ${Math.round((1 - WIRE.slow[wl + 1]) * 100)}% và bị cứa liên tục.`, price: WIRE.prices[wl], glyph: '✕' });
      } else if (k === 'floodlight') {
        if (!d.floodlight) out.push({ id: 'floodlight', title: 'Đèn pha chiến trường', desc: 'Đêm mất điện vẫn nhìn rõ quanh hàng rào và điểm ngắm.', price: FLOODLIGHT_PRICE, glyph: '☀' });
      } else if (k === 'shocker') {
        const sl = d.shockerLevel || 0;
        if (sl < 2) out.push({ id: 'shocker', title: sl ? 'Nâng cấp bẫy điện · cấp 2' : 'Bẫy điện', desc: 'Tấm điện trước rào phóng điện định kỳ, làm tê liệt và gây sát thương mọi con đứng trên đó.', stats: `ST ${SHOCKER.dmg[sl + 1]} · mỗi ${SHOCKER.every[sl + 1]} giây`, price: SHOCKER.prices[sl], glyph: 'ϟ', tag: sl ? '' : 'MỚI' });
      } else if (k === 'flameTurret') {
        if (!d.flameTurret) out.push({ id: 'flameTurret', title: 'Tháp phun lửa', desc: 'Phun lửa vào mọi con lại gần rào, đốt cháy theo thời gian. Kẻ cháy miễn nhiễm.', stats: `tầm ${FLAME_TURRET.range}px · đốt ${FLAME_TURRET.burn}/giây`, price: FLAME_TURRET.price, glyph: '♨', tag: 'MỚI' });
      } else if (k === 'mortar') {
        const ml = d.mortarLevel || 0;
        if (ml < 2) out.push({ id: 'mortar', title: ml ? 'Nâng cấp súng cối · cấp 2' : 'Súng cối tự động', desc: 'Tự bắn đạn nổ vào chỗ bầy đàn đông nhất ở xa.', stats: `ST ${MORTAR.dmg[ml + 1]} · mỗi ${MORTAR.every[ml + 1]} giây`, price: MORTAR.prices[ml], glyph: '☄', tag: ml ? '' : 'MỚI' });
      } else if (k === 'teslaTower') {
        const t2 = d.teslaLevel || 0;
        if (t2 < 2) out.push({ id: 'teslaTower', title: t2 ? 'Nâng cấp tháp Tesla · cấp 2' : 'Tháp Tesla', desc: 'Sét nhảy qua 5 con gần nhau. Xuyên giáp, xuyên khiên.', stats: `ST ${TESLA_TOWER.dmg[t2 + 1]} · mỗi ${TESLA_TOWER.every[t2 + 1]} giây`, price: TESLA_TOWER.prices[t2], glyph: '⚡', tag: t2 ? '' : 'MỚI' });
      } else if (k === 'drone') {
        if ((d.drones || 0) < DRONE.max) out.push({ id: 'drone', title: `Drone chiến đấu #${(d.drones || 0) + 1}`, desc: 'Bay lượn trên chiến trường, bắn con gần nhất. Hết băng thì tự nạp.', stats: `ST ${DRONE.dmg} · băng ${DRONE.mag}`, price: DRONE.price, glyph: '✈', tag: 'MỚI' });
      }
    }
    if (!out.length) out.push({ id: 'none', title: 'Đã dựng hết công trình của chương này', desc: 'Sang chương mới sẽ có công trình phòng thủ khác.', price: 0, glyph: '✓', disabled: true });
    return out;
  }

  buy(id) {
    const d = this.game.data;
    const item = this.shopItems().find((i) => i.id === id);
    if (!item || item.disabled || d.cash < item.price) { sfx.deny(); return; }
    d.cash -= item.price;
    const max = barricadeMax(d.barricadeLevel);
    if (id === 'repair') d.hp = Math.min(max, d.hp + max * 0.25);
    else if (id === 'grenade') d.grenades++;
    else if (id === 'food') d.food = (d.food || 0) + 3;
    else if (id === 'barricade') {
      d.barricadeLevel++;
      d.hp += barricadeMax(d.barricadeLevel) - max; // phần tăng thêm được đầy
    } else if (id === 'reloadUp') d.reloadLevel++;
    else if (id === 'dmgUp') d.dmgLevel = (d.dmgLevel || 0) + 1;
    else if (id === 'turret') d.turrets = (d.turrets || 0) + 1;
    else if (id === 'turretUp') d.turretLevel = (d.turretLevel || 1) + 1;
    else if (id === 'mines') d.mines = (d.mines || 0) + 2;
    else if (id === 'wire') d.wireLevel = (d.wireLevel || 0) + 1;
    else if (id === 'floodlight') d.floodlight = true;
    else if (id === 'shocker') d.shockerLevel = (d.shockerLevel || 0) + 1;
    else if (id === 'flameTurret') d.flameTurret = 1;
    else if (id === 'mortar') d.mortarLevel = (d.mortarLevel || 0) + 1;
    else if (id === 'teslaTower') d.teslaLevel = (d.teslaLevel || 0) + 1;
    else if (id === 'drone') d.drones = (d.drones || 0) + 1;
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

    const act = actFor(d.night);
    const actStart = (act - 1) * ACT_LENGTH;
    const dots = campaign ? `<div class="night-track">${Array.from({ length: ACT_LENGTH }, (_, i) => {
      const n = actStart + i + 1;
      const cls = n < d.night ? 'done' : n === d.night ? 'next' : '';
      return `<span class="${cls}${isBossNight(n) ? ' boss' : ''}" title="Đêm ${n}"></span>`;
    }).join('')}<em>${['', '🚁', '🚢', '🏔', '📡', '🚚', '🏥'][act]}</em></div>` : '';

    const radioLines = DAWN_LOG[d.night - 1];
    const radio = radioLines && !d.endless ? radioLines[radioLines.length - 1] : null;
    const newFoe = { 2: 'runner', 3: 'crawler', 4: 'brute', 6: 'spitter', 11: 'riot', 12: 'bloater', 22: 'dog', 24: 'screamer', 27: 'reviver', 32: 'shielder', 42: 'leaper', 44: 'burner', 52: 'splitter', 54: 'stalker' }[d.night];
    const mods = modsFor(d.night);
    const modList = Object.keys(MOD_INFO).filter((k) => mods[k]);
    const forecast = modList.length ? `<div class="forecast"><span class="radio-tag">DỰ BÁO ĐÊM NAY</span>${modList.map((k) => `<div><b>${MOD_INFO[k].icon} ${MOD_INFO[k].name}${k === 'airdrops' ? ` ×${mods.airdrops}` : ''}</b> ${MOD_INFO[k].desc}</div>`).join('')}</div>` : '';
    const hurtSquad = d.squad.filter((id) => d.mates[id]?.injured > 0);
    const openSlots = MAX_SQUAD - d.squad.filter((id) => !(d.mates[id]?.injured > 0)).length;
    const bench = d.crew.filter((id) => !d.squad.includes(id) && !(d.mates[id]?.injured > 0));
    const foodWarn = (d.food || 0) < this.eatPerDay() ? `<div class="warn">🥫 Đồ ăn không đủ cho sáng mai (cần ${this.eatPerDay()}, còn ${d.food || 0}). Hãy lục lọi hoặc mua đồ hộp, nếu không cả nhóm sẽ đói.</div>` : '';
    const squadWarn = hurtSquad.length && bench.length && openSlots > 0
      ? `<div class="warn">🩹 ${hurtSquad.map((id) => SURVIVORS.find((x) => x.id === id).name).join(', ')} đang bị thương. Mở tab Đồng đội để đưa người khác lên thay.</div>` : '';
    const warn = (isBossNight(d.night) ? `<div class="warn">⚠ Đêm nay có trăng máu: ${ZOMBIES[bossTypeFor(d.night)].name} sẽ xuất hiện.</div>` : '')
      + (newFoe && !d.endless ? `<div class="warn soft">Loại mới đêm nay: ${ZOMBIES[newFoe].name}.</div>` : '');

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
      const onWall = d.squad.filter((id) => !(d.mates[id]?.injured > 0)).length;
      const curAct = actFor(d.night);
      shopBody = `<div class="squad-head">Trên hàng rào: <b>${onWall}/${MAX_SQUAD}</b> · Người ở trại kiếm thêm ~$${Math.round(CAMP_INCOME * (1 + d.night * 0.04))} mỗi sáng · Khẩu phần ~$${Math.round(UPKEEP * diffOf(d).upkeep * (1 + d.night * 0.03))}/người/ngày · Bị thương phải nghỉ vài đêm</div>`
      + SURVIVORS.filter((s) => d.crew.includes(s.id) || (!d.endless && s.act === curAct)).map((s) => {
        const has = d.crew.includes(s.id);
        if (!has) {
          return `<div class="crew-card unknown"><div class="crew-unknown">?</div>
            <div><b>Chưa tìm thấy</b><span>Dành thời gian tìm người sống sót vào ban ngày.</span></div></div>`;
        }
        const m = d.mates[s.id] || { xp: 0, injured: 0 };
        const lv = mateLevel(m.xp);
        const nextXp = MATE_XP[lv] ?? null;
        const inSquad = d.squad.includes(s.id);
        const hurt = m.injured > 0;
        const status = hurt ? `<em class="st hurt">Bị thương · nghỉ ${m.injured} đêm</em>` : inSquad ? '<em class="st wall">Trên hàng rào</em>' : '<em class="st camp">Ở trại</em>';
        return `<div class="crew-card${hurt ? ' hurt' : ''}">
          <img src="${portrait(s)}" alt="">
          <div class="crew-main">
            <b>${s.name} · ${s.role} <i class="stars">${'★'.repeat(lv)}<span class="off">${'★'.repeat(3 - lv)}</span></i></b>
            <span>${s.perk}</span>
            <small>${status} · ${WEAPONS[s.weapon].name} · ${nextXp ? `${m.xp}/${nextXp} XP` : 'cấp tối đa'}</small>
          </div>
          <button class="squad-btn${inSquad ? ' on' : ''}" data-act="squad" data-arg="${s.id}" ${hurt && !inSquad ? 'disabled' : ''}>${inSquad ? 'Về trại' : 'Ra trận'}</button>
        </div>`;
      }).join('');
    } else {
      shopBody = this.shopItems().map((it) => `
        <button class="shop-item${it.owned ? ' owned' : ''}" data-act="buy" data-arg="${it.id}" ${it.disabled || d.cash < it.price ? 'disabled' : ''}>
          ${it.icon ? `<img class="si-icon" src="${weaponIcon(it.icon)}" alt="">` : '<span class="si-icon si-glyph">' + (it.glyph || { repair: '✚', barricade: '▦', dmgUp: '◆' }[it.id] || '⟳') + '</span>'}
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
            <div class="eyebrow">${campaign ? `Màn ${stageFor(d.night)} · Chương ${act} · ${ACT_NAMES[act]} · còn ${act * ACT_LENGTH - d.night + 1} đêm` : 'Ban ngày · chế độ vô tận'}</div>
            <h2>${campaign ? `Chuẩn bị cho Đêm ${d.night - (stageFor(d.night) - 1) * STAGE_LENGTH}/${STAGE_LENGTH}` : `Chuẩn bị cho Đêm ${d.night}`}</h2>
            ${dots}
          </div>
          <div class="stats">
            <div class="stat cash"><b>$${d.cash}</b><span>tiền</span></div>
            <div class="stat${(d.food || 0) < this.eatPerDay() ? ' low' : ''}"><b>🥫 ${d.food || 0}</b><span>đồ hộp · ăn ${this.eatPerDay()}/ngày</span></div>
            <div class="stat"><b>${Math.ceil(d.hp)}<i>/${max}</i></b><span>hàng rào</span></div>
            <div class="stat"><b>${d.squad.filter((id) => !(d.mates[id]?.injured > 0)).length}<i>/${MAX_SQUAD}</i></b><span>trên rào · ${d.crew.length} người</span></div>
          </div>
        </header>
        <div class="day-body">
          <section class="panel plan">
            ${info ? `<div class="recap">Đêm ${info.night}: hạ <b>${info.kills}</b> zombie (${info.headshots} headshot), chuỗi dài nhất <b>${info.bestStreak}</b>, kiếm <b>$${info.earned}</b> + thưởng sống sót <b>$${info.bonus}</b>${info.campIncome ? ` + trại <b>$${info.campIncome}</b>` : ''}${info.eat ? `, cả nhóm ăn <b>${info.eat}</b> hộp` : ''}${info.hungry ? ' <span class="hurt-txt">· HẾT ĐỒ ĂN, CẢ NHÓM ĐANG ĐÓI</span>' : ''}${info.crates ? `, mở <b>${info.crates}</b> thùng tiếp tế` : ''}${info.extraGrenade ? ', Hùng nhặt thêm 1 lựu đạn' : ''}.${info.injured?.length ? ` <span class="hurt-txt">${info.injured.map((id) => SURVIVORS.find((x) => x.id === id).name).join(', ')} bị thương.</span>` : ''}</div>` : ''}
            ${radio ? `<div class="radio-card"><span class="radio-tag">${radio.who}</span>${esc(radio.text)}</div>` : ''}
            ${warn}${foodWarn}${squadWarn}${forecast}
            <h3>${this.dayDone ? 'Kết quả trong ngày' : 'Kế hoạch ban ngày'} <small>${this.dayDone ? 'Đã hết giờ' : `${DAY_HOURS - used} giờ còn lại`}</small></h3>
            <div class="hour-dots">${hourDots}</div>
            ${this.dayDone
              ? `<ul class="day-log${this.animateLog ? ' animate' : ''}">${this.dayLog.map((l) => `<li><span>${l.icon}</span>${l.text}</li>`).join('')}</ul>`
              : `${row('repair', '🔨 Sửa hàng rào', `+${Math.round(this.repairRate() * 100)}% độ bền mỗi giờ`)}
            ${row('scav', '🎒 Lục lọi', 'Tiền, đạn, lựu đạn, may mắn có súng')}
            ${row('search', '🔦 Tìm người sống sót', this.availableRecruits().length ? 'Khó tìm, thường mất nhiều ngày' : this.nextRecruitHint())}
              <button class="primary wide" data-act="doDay" ${used ? '' : 'disabled'}>${used ? `Thực hiện kế hoạch (${used} giờ)` : 'Phân bổ ít nhất 1 giờ'}</button>`}
          </section>
          <section class="panel shop">
            <div class="tabs">
              <button class="${this.shopTab === 'weapons' ? 'active' : ''}" data-act="tab" data-arg="weapons">Vũ khí</button>
              <button class="${this.shopTab === 'gear' ? 'active' : ''}" data-act="tab" data-arg="gear">Trang bị</button>
              <button class="${this.shopTab === 'defense' ? 'active' : ''}" data-act="tab" data-arg="defense">Phòng thủ</button>
              <button class="${this.shopTab === 'crew' ? 'active' : ''}" data-act="tab" data-arg="crew">Đồng đội ${d.crew.length}${hurtSquad.length ? ' 🩹' : ''}</button>
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
