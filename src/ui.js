import {
  WEAPONS, WEAPON_ORDER, DAY_HOURS, MAX_RELOAD_LVL, GRENADE, CAMPAIGN_NIGHTS, ACT_LENGTH, ACT_NAMES,
  barricadeMax, barricadeUpgradePrice, reloadUpgradePrice, repairKitPrice, isBossNight, bossTypeFor, actFor,
  ZOMBIES, dmgUpgradePrice, MAX_DMG_LVL, stageFor, STAGE_LENGTH, STAGE_NAMES, SCENES, MAX_SQUAD,
  modsFor, MOD_INFO, waveFor, mateLevel, MATE_XP, CAMP_INCOME,
  DIFFICULTIES, DIFF_ORDER, diffOf, UPKEEP, TURRET, MINE, WIRE, FLOODLIGHT_PRICE,
  SHOCKER, FLAME_TURRET, MORTAR, TESLA_TOWER, DRONE, SAW, SNIPER_NEST, GAS, ROCKET, DEFENSES_BY_ACT, ALL_DEFENSES, resetDefenses,
  isStageStartAct, weaponUnlockNight,
} from './config.js';
import {
  INTRO, DAWN_LOG, ENDING, ENDLESS_NOTE, GAMEOVER_LINES, SURVIVORS, ACT1_END, ACT2_INTRO,
  STAGE1_END, STAGE2_INTRO, ACT3_END, ACT4_INTRO, STAGE2_END, STAGE3_INTRO, ACT5_END, ACT6_INTRO, hasPerk,
  storyFor, STAGE3_END, STAGE4_INTRO, ACT7_END, ACT8_INTRO, STAGE4_END, STAGE5_INTRO, ACT9_END, ACT10_INTRO,
} from './story.js';
import { setMet } from './cine.js';
import { L, getLang, setLang, whoLabel } from './i18n.js';
import { pixelState } from './pixel.js';
import { store, initStore, buyFullGame, restorePurchase, refreshPrice, needsUnlock, FREE_NIGHTS } from './store.js';
import { newSave, saveGame, loadGame, clearSave, loadSettings, saveSettings } from './save.js';
import { sfx, initAudio, setSoundEnabled, setMusicEnabled, setMood } from './audio.js';
import { weaponIcon, heroPortrait, characterPortrait } from './render.js';

const rand = (a, b) => a + Math.random() * (b - a);

// Sự kiện buổi sáng: những lựa chọn khó khăn của người sống sót
const MORNING_EVENTS = [
  {
    get title() { return L("Người lạ xin ăn", "A stranger begging for food"); },
    get text() { return L("Một người đàn ông gầy gò đứng ngoài hàng rào, tay giơ cao. \"Tôi chỉ xin ít đồ ăn. Hai ngày rồi tôi chưa ăn gì.\"", "A gaunt man stands outside the barricade, hands raised. \"I only need a little food. I haven't eaten in two days.\""); },
    choices: [
      { get label() { return L("Chia 2 hộp đồ ăn", "Share 2 cans of food"); }, get hint() { return L("−2 đồ hộp, có thể được đền đáp", "−2 cans, may be repaid"); }, run: (d) => { d.food = Math.max(0, (d.food || 0) - 2); if (Math.random() < 0.6) { d.grenades = Math.min(GRENADE.max, d.grenades + 1); return L("Ông ấy cảm ơn rối rít, để lại một quả lựu đạn tìm được trên đường rồi lặng lẽ đi về phía núi.", "He thanks you over and over, leaves a grenade he found on the road, then quietly heads for the mountains."); } return L("Ông ấy ăn ngấu nghiến rồi đi mất. Ít nhất đêm nay bạn ngủ ngon hơn.", "He wolfs it down and disappears. At least you will sleep better tonight."); } },
      { get label() { return L("Đuổi đi", "Send him away"); }, get hint() { return L("Giữ đồ ăn cho nhóm", "Keep the food for the group"); }, run: () => L("Ông ấy nhìn bạn rất lâu rồi bỏ đi. Bạn cố không nghĩ về chuyện đó.", "He stares at you for a long time, then walks away. You try not to think about it.") },
    ],
  },
  {
    get title() { return L("Tiếng khóc trong khu nhà bên", "Crying next door"); },
    get text() { return L("Có tiếng khóc như trẻ con vọng ra từ căn nhà đổ nát bên kia đường. Có thể là người sống sót. Cũng có thể là cái bẫy.", "Something like a child crying echoes from the ruined house across the street. It could be a survivor. It could be a trap."); },
    choices: [
      { get label() { return L("Đi kiểm tra", "Go check"); }, get hint() { return L("Rủi ro, có thể được đồ ăn", "Risky, may find food"); }, run: (d, max) => { if (Math.random() < 0.55) { d.food = (d.food || 0) + 4; d.searchPity = (d.searchPity || 0) + 3; return L("Một gia đình trốn dưới hầm. Họ đã lên đường về phía nam, để lại 4 hộp đồ ăn và chỉ cho bạn chỗ có thể còn người sống.", "A family hiding in the basement. They head south, leaving 4 cans of food and telling you where more survivors might be."); } d.hp = Math.max(1, d.hp - max * 0.12); return L("Là một con zombie mắc kẹt dưới đống gạch. Cả bầy nghe tiếng động kéo đến, phá một mảng hàng rào trước khi bạn kịp chạy về.", "It is a zombie trapped under the rubble. The noise draws the pack, and they tear down part of the barricade before you get back."); } },
      { get label() { return L("Mặc kệ", "Ignore it"); }, get hint() { return L("An toàn", "Safe"); }, run: () => L("Tiếng khóc tắt dần lúc gần trưa. Bạn không bao giờ biết đó là gì.", "The crying fades out around noon. You will never know what it was.") },
    ],
  },
  {
    get title() { return L("Thùng cứu trợ giữa đường", "Relief crate in the road"); },
    get text() { return L("Một thùng hàng cứu trợ rơi lệch, nằm giữa đường cách hàng rào hai trăm mét. Vài cái bóng đang lảng vảng quanh đó.", "A relief crate missed its target and landed in the road two hundred meters from the barricade. A few shadows are lurking around it."); },
    choices: [
      { get label() { return L("Liều ra lấy", "Risk it"); }, get hint() { return L("Được tiền và đồ ăn, rào có thể bị hư", "Cash and food, the barricade may get damaged"); }, run: (d, max) => { const cash = Math.round(rand(150, 300) * (1 + d.night * 0.05)); d.cash += cash; d.food = (d.food || 0) + 2; if (Math.random() < 0.5) { d.hp = Math.max(1, d.hp - max * 0.08); return L(`Bạn kéo được thùng về: $${cash} và 2 hộp đồ ăn. Nhưng vài con bám theo, cào hỏng một góc hàng rào.`, `You haul the crate back: $${cash} and 2 cans of food. But a few followed you and clawed a corner of the barricade.`); } return L(`Bạn kéo được thùng về trót lọt: $${cash} và 2 hộp đồ ăn.`, `You haul the crate back safely: $${cash} and 2 cans of food.`); } },
      { get label() { return L("Bỏ qua", "Leave it"); }, get hint() { return L("Không mạo hiểm", "No risk"); }, run: () => L("Đến chiều, thùng hàng đã biến mất. Ai đó khác liều hơn bạn.", "By afternoon the crate is gone. Someone braver than you took it.") },
    ],
  },
  {
    get title() { return L("Kho thuốc bỏ hoang", "Abandoned pharmacy"); },
    get text() { return L("Bạn tìm thấy một hiệu thuốc cửa sắt còn khoá. Bên trong tối om, có mùi lạ.", "You find a pharmacy with its steel shutter still locked. It is pitch dark inside and smells strange."); },
    choices: [
      { get label() { return L("Phá cửa vào", "Break in"); }, get hint() { return L("Có thể được nhiều đồ, có thể mất tiền sửa đồ", "May find a lot, may cost money for repairs"); }, run: (d) => { if (Math.random() < 0.7) { d.food = (d.food || 0) + 2; d.grenades = Math.min(GRENADE.max, d.grenades + 1); for (const id of Object.keys(d.mates || {})) d.mates[id].injured = Math.max(0, (d.mates[id].injured || 0) - 1); return L("Thuốc men, băng gạc, 2 hộp đồ ăn và một quả lựu đạn. Những người bị thương hồi phục nhanh hơn một ngày.", "Medicine, bandages, 2 cans of food and a grenade. The injured recover one day faster."); } d.cash = Math.max(0, d.cash - 120); return L("Cửa có bẫy. Bạn thoát được nhưng làm hỏng đồ nghề, mất $120 để sửa.", "The door was trapped. You got away but broke your tools, $120 to fix."); } },
      { get label() { return L("Đi tiếp", "Move on"); }, get hint() { return L("An toàn", "Safe"); }, run: () => L("Bạn đánh dấu chỗ này trên bản đồ. Có lẽ để lần sau.", "You mark the place on your map. Maybe next time.") },
    ],
  },
  {
    get title() { return L("Tín hiệu cầu cứu", "Distress call"); },
    get text() { return L("Radio bắt được một giọng nói run rẩy: \"Ai đó… chúng tôi bị kẹt ở trạm xăng, còn ba người…\"", "The radio picks up a trembling voice: \"Anyone… we're trapped at the gas station, three of us left…\""); },
    choices: [
      { get label() { return L("Gửi đồ tiếp tế", "Send supplies"); }, get hint() { return L("−3 đồ hộp, dễ tìm người hơn", "−3 cans, easier to find survivors"); }, run: (d) => { d.food = Math.max(0, (d.food || 0) - 3); d.searchPity = (d.searchPity || 0) + 6; return L("Bạn hướng dẫn họ chỗ lấy đồ. Họ hứa sẽ báo cho bạn nếu thấy ai còn sống quanh đây.", "You tell them where to find supplies. They promise to let you know if they see anyone alive nearby."); } },
      { get label() { return L("Tắt radio", "Turn off the radio"); }, get hint() { return L("Giữ đồ ăn", "Keep the food"); }, run: () => L("Bạn tắt radio. Lần đầu tiên, Hoàn tháo tai nghe xuống trước khi tín hiệu kịp tắt.", "You switch off the radio. For the first time, Hoan takes off his headphones before the signal dies.") },
    ],
  },
  {
    get title() { return L("Chuột phá kho", "Rats in the stores"); },
    get text() { return L("Sáng nay kho đồ ăn có dấu răng chuột. Nếu không làm gì, chúng sẽ ăn hết.", "This morning there are rat bites in the food store. If you do nothing, they will eat it all."); },
    choices: [
      { get label() { return L("Mua bẫy và dọn kho", "Buy traps and clean up"); }, get hint() { return L("−$80, giữ được đồ ăn", "−$80, food is saved"); }, run: (d) => { d.cash = Math.max(0, d.cash - 80); return L("Kho sạch sẽ, đồ ăn còn nguyên. Bạn tự nhủ ít nhất vẫn còn thứ mình kiểm soát được.", "The store is clean and the food is safe. At least something is still under your control."); } },
      { get label() { return L("Chấp nhận mất", "Accept the loss"); }, get hint() { return L("−2 đồ hộp", "−2 cans"); }, run: (d) => { d.food = Math.max(0, (d.food || 0) - 2); return L("Lũ chuột ăn mất 2 hộp. Bữa sáng hôm nay ít hơn mọi ngày.", "The rats ate 2 cans. Breakfast is smaller than usual today."); } },
    ],
  },
  {
    get title() { return L("Gương mặt quen", "A familiar face"); },
    get text() { return L("Trong số những cái xác lảng vảng ngoài hàng rào, có một gương mặt bạn nhận ra: người bán bánh mì đầu ngõ, vẫn đeo chiếc tạp dề cũ.", "Among the corpses wandering outside the barricade is a face you recognize: the bread seller from the corner, still wearing his old apron."); },
    choices: [
      { get label() { return L("Kết thúc cho ông ấy", "Put him to rest"); }, get hint() { return L("Lấy lại đồ trong túi tạp dề", "Take what is in his apron"); }, run: (d) => { const c = Math.round(rand(60, 140)); d.cash += c; d.food = (d.food || 0) + 1; return L(`Một phát súng duy nhất. Trong túi tạp dề còn $${c} và một hộp sữa. Bạn chôn ông ấy cạnh hàng rào.`, `A single shot. His apron pocket holds $${c} and a can of milk. You bury him by the barricade.`); } },
      { get label() { return L("Để ông ấy đi", "Let him go"); }, get hint() { return L("Không làm gì", "Do nothing"); }, run: () => L("Bạn nhìn theo cho đến khi bóng ông khuất sau dãy nhà. Có những thứ bạn chưa sẵn sàng làm.", "You watch until he disappears behind the houses. Some things you are not ready to do.") },
    ],
  },
  {
    get title() { return L("Mưa đêm qua", "Last night's rain"); },
    get text() { return L("Mưa lớn suốt đêm làm ướt kho đạn và mục một phần hàng rào.", "Heavy rain all night soaked the ammo store and rotted part of the barricade."); },
    choices: [
      { get label() { return L("Phơi đạn, chằng rào", "Dry the ammo, tie down the barricade"); }, get hint() { return L("Mất thời gian, giữ đạn", "Takes time, keeps the ammo"); }, run: (d, max) => { d.hp = Math.max(1, d.hp - max * 0.05); return L("Đạn khô lại, nhưng một phần hàng rào vẫn hỏng mất 5% độ bền.", "The ammo dries out, but part of the barricade still loses 5% durability."); } },
      { get label() { return L("Gia cố rào trước", "Reinforce the barricade first"); }, get hint() { return L("Mất một ít đạn", "Lose some ammo"); }, run: (d) => { const ids = Object.keys(d.weapons).filter((id) => !WEAPONS[id].infinite); if (ids.length) { const id = ids[Math.floor(Math.random() * ids.length)]; const lost = Math.ceil(d.weapons[id].reserve * 0.2); d.weapons[id].reserve -= lost; return L(`Hàng rào vững vàng, nhưng ${lost} viên đạn ${WEAPONS[id].name} bị ẩm, không dùng được nữa.`, `The barricade holds, but ${lost} ${WEAPONS[id].name} rounds got wet and are useless now.`); } return L("Hàng rào vững vàng. May mà bạn chưa có nhiều đạn để mà mất.", "The barricade holds. Luckily you did not have much ammo to lose."); } },
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
    pixelState.on = this.settings.pixel !== false;
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
        this.playCutscene(INTRO, () => { saveGame(g.data); g.startNight(); }, ACT_NAMES[1], true);
        break;
      case 'continue': {
        const d = loadGame();
        if (!d) return;
        g.data = d;
        sfx.click();
        if (needsUnlock(d.night, d.endless)) { this.showPaywall(() => this.act('continue')); return; }
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
        if (arg === 'pixel') pixelState.on = this.settings.pixel;
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
      case 'startNight': g.data.upgradeReset = false; g.data.chapterReset = false; saveGame(g.data); sfx.click(); g.startNight(); break;
      case 'lang': setLang(arg); sfx.click(); this.game.onLang && this.game.onLang(); this.showMenu(); break;
      case 'endless':
        g.data.endless = true;
        saveGame(g.data);
        this.playCutscene(ENDLESS_NOTE, () => this.showDay(null), L('Chế độ vô tận', 'Endless mode'));
        break;
      case 'next': this.advanceCut(); break;
      case 'skip': this.finishCut(); break;
      case 'closeModal': this.closeModal(); break;
      case 'unlockBuy': this.doUnlock('buy'); break;
      case 'unlockRestore': this.doUnlock('restore'); break;
      case 'unlockMenu': this.closeModal(); g.data = null; g.enterMenu(); this.showMenu(); break;
      case 'event': this.resolveEvent(arg); break;
    }
  }

  toggleBtn(key) {
    const labels = { sound: L('Âm thanh', 'Sound'), music: L('Nhạc nền', 'Music'), shake: L('Rung màn hình', 'Screen shake'), hq: L('Đồ hoạ chi tiết', 'Detailed graphics'), pixel: L('Đồ hoạ pixel', 'Pixel art') };
    const on = this.settings[key];
    return `<button class="toggle ${on ? 'on' : ''}" data-act="toggle" data-arg="${key}"><span>${labels[key]}</span><b>${on ? L('BẬT', 'ON') : L('TẮT', 'OFF')}</b></button>`;
  }

  // ---------- Menu ----------
  showMenu() {
    this.cut = null;
    const save = loadGame();
    const fs = document.fullscreenEnabled ? `<button class="ghost" data-act="fullscreen">${L('Toàn màn hình', 'Fullscreen')}</button>` : '';
    const contLabel = save
      ? (save.night > CAMPAIGN_NIGHTS && !save.endless ? L('Tiếp tục · Đã thắng chiến dịch', 'Continue · Campaign won') : `${L('Tiếp tục', 'Continue')} · ${save.endless ? L(`Đêm ${save.night} (vô tận)`, `Night ${save.night} (endless)`) : L(`Màn ${stageFor(save.night)} · Đêm ${save.night - (stageFor(save.night) - 1) * STAGE_LENGTH}`, `Stage ${stageFor(save.night)} · Night ${save.night - (stageFor(save.night) - 1) * STAGE_LENGTH}`)} · ${diffOf(save).name}`)
      : '';
    this.root.innerHTML = `
      <div class="screen menu fade-in">
        <div class="menu-left">
          <div class="eyebrow">${L("Một đài phát thanh · một hàng rào · Bến Sương", "One radio station · one barricade · Ben Suong")}</div>
          <h1 class="title"><span class="t1">BARRICADE</span><span class="t2">NIGHTS</span></h1>
          <p class="tagline">${L("Hoàn, một kỹ sư IT giữ đài phát thanh cuối cùng. Giữ vững hàng rào cho đến khi được cứu.", "Hoan, an IT engineer keeping the last radio station alive. Hold the barricade until rescue comes.")}</p>
          <div class="menu-buttons">
            ${save ? `<button class="primary" data-act="continue">${contLabel}</button>` : ''}
            <button class="${save ? '' : 'primary'}" data-act="new">${L("Chiến dịch mới", "New campaign")}</button>
            <button data-act="help">${L("Hướng dẫn", "How to play")}</button>
            <div class="menu-row">${this.toggleBtn('sound')}${this.toggleBtn('music')}</div>
            <div class="menu-row">${this.toggleBtn('pixel')}${this.toggleBtn('shake')}</div>
            ${fs}
          </div>
        </div>
        <div class="menu-foot">${L("Chạm hoặc click để bắn · Bắn vào đầu để hạ nhanh", "Tap or click to shoot · Aim for the head")}</div>
        <div class="lang-flags">${this.flagBtn('en')}${this.flagBtn('vi')}</div>
      </div>`;
  }

  // nút chọn ngôn ngữ bằng lá cờ (vẽ bằng SVG để hiện giống nhau trên mọi máy)
  flagBtn(code) {
    const flag = code === 'vi'
      ? '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#da251d"/><polygon fill="#ffcd00" points="15,4 16.2,8.3 20.7,8.3 17.1,10.9 18.4,15.2 15,12.6 11.6,15.2 12.9,10.9 9.3,8.3 13.8,8.3"/></svg>'
      : '<svg viewBox="0 0 60 30"><clipPath id="uk-t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#uk-t)" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></svg>';
    const label = code === 'vi' ? 'Tiếng Việt' : 'English';
    return `<button class="flag-btn${getLang() === code ? ' active' : ''}" data-act="lang" data-arg="${code}" aria-label="${label}" title="${label}">${flag}<span>${code.toUpperCase()}</span></button>`;
  }

  chooseDifficulty() {
    this.modal(`
      <div class="eyebrow">${L("Chiến dịch mới", "New campaign")}</div>
      <h2>${L("Chọn độ khó", "Choose difficulty")}</h2>
      <div class="diff-grid">
        ${DIFF_ORDER.map((k) => `<button class="diff-btn${k === 'normal' ? ' rec' : ''}" data-act="diff" data-arg="${k}">
          <b>${DIFFICULTIES[k].name}${k === 'normal' ? ` <em>${L('ĐỀ XUẤT', 'RECOMMENDED')}</em>` : ''}</b><span>${DIFFICULTIES[k].desc}</span></button>`).join('')}
      </div>
      <div class="modal-actions"><button class="ghost" data-act="closeModal">${L("Huỷ", "Cancel")}</button></div>`);
  }

  // Màn hình mở khoá bản đầy đủ (sau đêm 20)
  showPaywall(onUnlock) {
    this.afterUnlock = onUnlock;
    this.game.state = 'day';
    const price = store.price;
    this.modal(`
      <h2>${L('Hết bản chơi thử', 'End of the free chapter')}</h2>
      <p>${L(`Bạn đã sống sót qua ${FREE_NIGHTS} đêm đầu tiên. Mở khoá bản đầy đủ để đi tiếp 80 đêm còn lại: Đập Hồng Sơn, thủ đô, nhà máy, sân bay, rừng tuyết và Trạm Hải Đăng, cùng chế độ vô tận.`, `You survived the first ${FREE_NIGHTS} nights. Unlock the full game to play the remaining 80 nights: Hong Son Dam, the capital, the plant, the airport, the snow forest and Lighthouse Station, plus endless mode.`)}</p>
      <p class="muted">${L('Mua một lần, chơi mãi. Không quảng cáo. Tiến trình của bạn được giữ nguyên.', 'One-time purchase. No ads. Your progress is kept.')}</p>
      <p class="paywall-msg" id="paywall-msg"></p>
      <div class="modal-actions">
        <button class="ghost" data-act="unlockMenu">${L('Menu chính', 'Main menu')}</button>
        <button data-act="unlockRestore">${L('Khôi phục giao dịch', 'Restore purchase')}</button>
        <button class="primary" data-act="unlockBuy">${L('Mở khoá bản đầy đủ', 'Unlock full game')}${price ? ` · ${price}` : ''}</button>
      </div>`);
    if (!price) refreshPrice().then((p) => {
      const b = this.root.querySelector('[data-act="unlockBuy"]');
      if (p && b) b.textContent = `${L('Mở khoá bản đầy đủ', 'Unlock full game')} · ${p}`;
    });
  }

  async doUnlock(kind) {
    if (this.unlocking) return;
    this.unlocking = true;
    sfx.click();
    const msg = this.root.querySelector('#paywall-msg');
    if (msg) msg.textContent = L('Đang kết nối Google Play…', 'Connecting to Google Play…');
    let ok = false, status = '';
    if (kind === 'buy') { status = await buyFullGame(); ok = status === 'purchased'; }
    else ok = await restorePurchase();
    this.unlocking = false;
    if (ok) {
      this.closeModal();
      const go = this.afterUnlock; this.afterUnlock = null;
      if (go) go();
      return;
    }
    const m = this.root.querySelector('#paywall-msg');
    if (!m) return;
    m.textContent = kind === 'restore' ? L('Không tìm thấy giao dịch nào trên tài khoản Google Play này.', 'No purchase found on this Google Play account.')
      : status === 'pending' ? L('Giao dịch đang chờ xử lý. Game sẽ mở khoá khi thanh toán hoàn tất.', 'Payment is pending. The game unlocks once it completes.')
      : status === 'canceled' ? ''
      : L('Không kết nối được Google Play. Hãy kiểm tra mạng rồi thử lại.', 'Could not reach Google Play. Check your connection and try again.');
  }

  confirmNew() {
    this.modal(`
      <h2>${L('Bắt đầu lại?', 'Start over?')}</h2>
      <p>${L('Tiến trình hiện tại sẽ bị xoá và bạn bắt đầu lại từ đêm 1.', 'Your current progress will be erased and you will start again from night 1.')}</p>
      <div class="modal-actions">
        <button data-act="closeModal">${L('Huỷ', 'Cancel')}</button>
        <button class="primary" data-act="new" data-arg="confirm">${L('Bắt đầu lại', 'Start over')}</button>
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
            <img class="hero-card" src="${heroPortrait()}" alt="Hoan">
            <div>
              <div class="eyebrow">${L("Nhân vật chính", "The hero")}</div>
              <h2>${L("Hoàn · kỹ sư IT của đài phát thanh", "Hoan · the radio station's IT engineer")}</h2>
              <p class="story-line">${L("Không bao giờ tháo tai nghe. Biết code, biết sửa máy, và không bao giờ tháo tai nghe. Chừng nào radio còn phát, chừng đó Hoàn còn chiến đấu.", "Writes code, fixes machines, and never takes off his headphones. As long as the radio keeps broadcasting, Hoan keeps fighting.")}</p>
            </div>
          </div>
          <div class="help-grid">
            <div><h4>${L("Ban đêm", "Night")}</h4>
              <p>${L("Zombie kéo đến từ bên phải để phá hàng rào. Ngắm và bắn bằng chuột hoặc chạm vào màn hình. Súng tự động thì giữ để xả đạn.", "Zombies come from the right to tear down your barricade. Aim and shoot with the mouse or by tapping the screen. Hold to fire automatic weapons.")}</p>
              ${L('<p><b>Bắn vào đầu</b> gây x2.5 sát thương, thưởng thêm 50% tiền. Hạ liên tiếp nhanh được thưởng thêm.</p>', '<p><b>Headshots</b> deal x2.5 damage and pay 50% more. Quick kill streaks earn bonus cash.</p>')}
            </div>
            <div><h4>${L("Ban ngày", "Day")}</h4>
              <p>${L(`Chia ${DAY_HOURS} giờ cho sửa rào, lục lọi tiền và đạn, hoặc tìm người sống sót. Mỗi người có một kỹ năng riêng và sẽ bắn hỗ trợ bạn.`, `Split ${DAY_HOURS} hours between repairing the barricade, scavenging for cash and ammo, or searching for survivors. Each survivor has a unique perk and fights alongside you.`)}</p>
              <p>${L("Chỉ 4 người được đứng trên rào, người còn lại ở trại kiếm thêm tiền. Đồng đội lên cấp khi hạ zombie và có thể bị thương khi rào sắp vỡ: hãy đưa người khác lên thay.", "Only 4 people fit on the barricade; the rest stay in camp and earn extra cash. Companions level up by killing zombies and can get injured when the barricade is about to break: swap someone else in.")}</p>
              ${L('<p>Mỗi màn có 20 đêm. Chú ý <b>dự báo đêm nay</b>: mất điện, thả dù tiếp tế, kẻ mang hòm…</p>', '<p>Each stage has 20 nights. Watch <b>tonight\'s forecast</b>: blackouts, supply drops, thieves…</p>')}
              ${L('<p>Tab <b>Phòng thủ</b>: mỗi chương có bộ công trình riêng (mìn, dây thép gai, tháp súng, bẫy điện, tháp phun lửa, súng cối, tháp Tesla, drone). Sang chương mới, đồng đội và công trình đều phải làm lại từ đầu.</p>', '<p><b>Defense</b> tab: each chapter has its own set of defenses (mines, barbed wire, turrets, electric traps, flame turrets, mortars, tesla towers, drones). In a new chapter, companions and defenses start over.</p>')}
            </div>
            <div><h4>${L("Điều khiển", "Controls")}</h4>
              <table class="keys">
                <tr><td>${L('Bắn', 'Shoot')}</td><td>${L('Click / chạm', 'Click / tap')}</td></tr>
                <tr><td>${L('Nạp đạn', 'Reload')}</td><td>${L('R · nút ⟳', 'R · ⟳ button')}</td></tr>
                <tr><td>${L('Lựu đạn', 'Grenade')}</td><td>${L('G hoặc Space · nút lựu đạn rồi chạm', 'G or Space · grenade button then tap')}</td></tr>
                <tr><td>${L('Đổi súng', 'Switch weapon')}</td><td>${L('1–9, 0, - · Q/E · con lăn', '1–9, 0, - · Q/E · mouse wheel')}</td></tr>
                <tr><td>${L('Tạm dừng', 'Pause')}</td><td>P · Esc</td></tr>
              </table>
            </div>
          </div>
          <button class="primary" data-act="menu">${L("Quay lại", "Back")}</button>
        </div>
      </div>`;
  }

  // ---------- Phim cốt truyện ----------
  playCutscene(lines, done, chapter = '', demo = false) {
    if (demo) this.game.state = 'cutscene'; // màn mở đầu: zombie diễn phía sau
    lines = storyFor(lines, this.game.data?.met || []);
    setMet(this.game.data?.met || []);
    this.cut = { lines, i: 0, done, chars: 0, timer: null };
    this.root.innerHTML = `
      <div class="screen cutscene fade-in" data-act="next">
        <div class="bar top"></div>
        <div class="cut-chapter">${esc(chapter)}</div>
        <div class="cut-box">
          <div class="cut-who"></div>
          <p class="cut-text"></p>
          <div class="cut-hint">${L("Chạm để tiếp tục ▸", "Tap to continue ▸")}</div>
        </div>
        <button class="cut-skip ghost" data-act="skip">${L("Bỏ qua ▸▸", "Skip ▸▸")}</button>
        <div class="bar bottom"></div>
      </div>`;
    this.showCutLine();
  }

  showCutLine() {
    const c = this.cut;
    const line = c.lines[c.i];
    const who = this.root.querySelector('.cut-who');
    const text = this.root.querySelector('.cut-text');
    who.textContent = whoLabel(line.who);
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
        <button class="hud-btn pause" data-hud="pause" aria-label="Pause">❚❚</button>
        <div class="weapon-bar"></div>
        <div class="hud-actions">
          <button class="hud-btn grenade" data-hud="grenade" aria-label="Grenade"></button>
          <button class="hud-btn reload" data-hud="reload" aria-label="Reload">⟳<small>R</small></button>
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
        <span class="slot-key">${["1","2","3","4","5","6","7","8","9","0","-"][WEAPON_ORDER.indexOf(id)]}</span>
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
          <h2>${L('Tạm dừng', 'Paused')}</h2>
          <button class="primary" data-act="resume">${L('Tiếp tục chiến đấu', 'Resume fighting')}</button>
          ${this.toggleBtn('sound')}${this.toggleBtn('music')}${this.toggleBtn('shake')}${this.toggleBtn('pixel')}${this.toggleBtn('hq')}
          <button class="ghost" data-act="quit">${L("Về menu (đêm này sẽ chơi lại từ đầu)", "Quit to menu (this night restarts)")}</button>
        </div>
      </div>`;
  }

  showGameOver(info) {
    const d = this.game.data;
    this.root.innerHTML = `
      <div class="screen panel-screen dim red fade-in-slow">
        <div class="panel small over">
          <div class="eyebrow danger">${L('Đêm', 'Night')} ${info.night}</div>
          <h2 class="danger big-title">${L('HÀNG RÀO ĐÃ VỠ', 'THE BARRICADE HAS FALLEN')}</h2>
          <p class="story-line">${GAMEOVER_LINES[ri(0, GAMEOVER_LINES.length - 1)]}</p>
          <div class="stat-row">
            <div><b>${d.night - 1}</b><span>${L('đêm sống sót', 'nights survived')}</span></div>
            <div><b>${d.totalKills}</b><span>${L('zombie đã hạ', 'zombies killed')}</span></div>
            <div><b>${d.headshots || 0}</b><span>headshot</span></div>
          </div>
          <button class="primary" data-act="retry">${L('Thử lại đêm', 'Retry night')} ${info.night}</button>
          <button data-act="new" data-arg="confirm">${L('Chiến dịch mới', 'New campaign')}</button>
          <button class="ghost" data-act="menu">${L('Menu chính', 'Main menu')}</button>
        </div>
      </div>`;
  }

  // Chuyển chương / chuyển màn
  showInterlude(info) {
    const n = info.transition;
    const end = {
      10: [ACT1_END, L("Hết chương 1 · Bình minh thứ mười", "End of chapter 1 · The tenth dawn")], 20: [STAGE1_END, L("Hết màn 1 · Bình minh thứ hai mươi", "End of stage 1 · The twentieth dawn")],
      30: [ACT3_END, L("Hết chương 3 · Bình minh thứ ba mươi", "End of chapter 3 · The thirtieth dawn")], 40: [STAGE2_END, L("Hết màn 2 · Bình minh thứ bốn mươi", "End of stage 2 · The fortieth dawn")],
      50: [ACT5_END, L("Hết chương 5 · Bình minh thứ năm mươi", "End of chapter 5 · The fiftieth dawn")], 60: [STAGE3_END, L("Hết màn 3 · Bình minh thứ sáu mươi", "End of stage 3 · The sixtieth dawn")],
      70: [ACT7_END, L("Hết chương 7 · Bình minh thứ bảy mươi", "End of chapter 7 · The seventieth dawn")], 80: [STAGE4_END, L("Hết màn 4 · Bình minh thứ tám mươi", "End of stage 4 · The eightieth dawn")],
      90: [ACT9_END, L("Hết chương 9 · Bình minh thứ chín mươi", "End of chapter 9 · The ninetieth dawn")],
    }[n];
    setTimeout(() => this.playCutscene(end[0], () => this.playActIntro(actFor(n + 1), info), end[1]), 600);
  }

  playActIntro(act, info) {
    const g = this.game;
    // hết bản chơi thử: từ màn 2 cần mở khoá bản đầy đủ
    if (needsUnlock((act - 1) * 10 + 1, g.data.endless)) { saveGame(g.data); this.showPaywall(() => this.playActIntro(act, info)); return; }
    g.setScene(SCENES[act]);
    g.state = 'day';
    const lines = { 2: ACT2_INTRO, 3: STAGE2_INTRO, 4: ACT4_INTRO, 5: STAGE3_INTRO, 6: ACT6_INTRO, 7: STAGE4_INTRO, 8: ACT8_INTRO, 9: STAGE5_INTRO, 10: ACT10_INTRO }[act] || [];
    const stageStart = isStageStartAct(act) ? (act + 1) / 2 : 0;
    const title = stageStart ? `${L('Màn', 'Stage')} ${stageStart} · ${STAGE_NAMES[stageStart]} · ${L('Chương', 'Chapter')} ${act} · ${ACT_NAMES[act]}` : `${L('Chương', 'Chapter')} ${act} · ${ACT_NAMES[act]}`;
    // chương mới: đồng đội cũ đã ở lại phía sau, công trình phòng thủ phải dựng lại từ đầu
    if (act > (g.data.seenAct || 1) && !g.data.endless) {
      g.data.crew = []; g.data.squad = []; g.data.mates = {}; g.data.searchPity = 0;
      resetDefenses(g.data);
      // chỗ mới thì hàng rào cũng phải dựng lại từ đầu, nhưng mang theo được một ít vật liệu
      let built = 0;
      for (let i = 0; i < (g.data.barricadeLevel || 0); i++) built += barricadeUpgradePrice(i);
      g.data.salvage = Math.round(built * 0.4);
      g.data.cash += g.data.salvage;
      g.data.barricadeLevel = 0;
      g.data.hp = barricadeMax(0);
      g.data.chapterReset = true;
      if (isStageStartAct(act)) { // màn mới: nâng cấp vũ khí cũng làm lại từ đầu
        g.data.dmgLevel = 0; g.data.reloadLevel = 0; g.data.upgradeReset = true;
        // màn mới: Hoàn ra đi tay trắng, chỉ còn khẩu súng lục của ông ngoại
        g.data.weapons = { pistol: { mag: WEAPONS.pistol.mag, reserve: 0 } };
        g.data.current = 'pistol';
        g.data.cash = 300;
        g.data.grenades = 2;
        g.data.flashlight = false;
        g.data.food = 8;
        g.data.hungry = false;
        g.data.threat = Math.round((1 + ((g.data.threat || 1) - 1) * 0.5) * 100) / 100;
      }
    }
    this.playCutscene(lines, () => {
      g.data.seenAct = Math.max(g.data.seenAct || 1, act);
      saveGame(g.data);
      this.showDay(info);
    }, title);
  }

  showVictoryStory(info) {
    setTimeout(() => this.playCutscene(ENDING, () => { this.game.state = 'victory'; this.showVictory(info); }, L('Hết phần 1 · Bình minh thứ một trăm', 'End of Part 1 · The hundredth dawn')), 600);
  }

  showVictory() {
    const d = this.game.data;
    sfx.victory();
    this.root.innerHTML = `
      <div class="screen panel-screen dawn fade-in-slow">
        <div class="panel small victory">
          <div class="eyebrow">${L('Chiến dịch hoàn thành', 'Campaign complete')}</div>
          <h2 class="big-title gold">${L('BẠN ĐÃ SỐNG SÓT', 'YOU SURVIVED')}</h2>
          <p class="story-line">${L('Một trăm đêm, từ Bến Sương tới Trạm Hải Đăng. Hoàn đã mang vắc-xin tới thủ đô và đảo ngược tín hiệu điều khiển bầy đàn. Bầy đàn đã ngủ, nhưng chưa chết, và ở phía bên kia biển, Trạm 02 vừa bắt đầu phát. Còn tiếp ở Phần 2.', 'One hundred nights, from Ben Suong to Lighthouse Station. Hoan carried the vaccine to the capital and turned the signal driving the horde against itself. The horde sleeps, but it is not dead, and across the sea Station 02 has just started broadcasting. To be continued in Part 2.')}</p>
          <div class="stat-row">
            <div><b>${d.totalKills}</b><span>${L('zombie đã hạ', 'zombies killed')}</span></div>
            <div><b>${d.headshots || 0}</b><span>headshot</span></div>
            <div><b>${(d.met || d.crew).length}/${SURVIVORS.length}</b><span>${L('đồng đội đã gặp', 'companions met')}</span></div>
          </div>
          <button class="primary" data-act="endless">${L('Ở lại chiến đấu · Chế độ vô tận', 'Keep fighting · Endless mode')}</button>
          <button class="ghost" data-act="menu">${L('Menu chính', 'Main menu')}</button>
        </div>
      </div>`;
  }

  // ---------- Ban ngày ----------
  afterNight(info) {
    const log = DAWN_LOG[info.night];
    const go = () => this.showDay(info);
    if (log && !this.game.data.endless) setTimeout(() => this.playCutscene(log, go, `${L('Bình minh · Ngày', 'Dawn · Day')} ${info.night + 1}`), 400);
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
    this.dayLog = this.dayDone ? [{ icon: '·', text: L('Bạn đã dùng hết thời gian của ngày hôm nay.', 'You have used up all of today\'s time.') }] : [];
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
      <div class="eyebrow">${L('Buổi sáng · Ngày', 'Morning · Day')} ${this.game.data.night}</div>
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
    this.modal(`<h2>${ev.title}</h2><p class="story-line">${result}</p><div class="modal-actions"><button class="primary" data-act="closeModal">${L('Tiếp tục', 'Continue')}</button></div>`);
  }

  changeHour(arg) {
    if (this.dayDone) return;
    const [k, dir] = arg.split(':');
    const used = this.alloc.repair + this.alloc.scav + this.alloc.search;
    if (dir === '+' && used < this.dayHours()) this.alloc[k]++;
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
      log.push({ icon: '🔨', text: L(`Sửa hàng rào: +${Math.round(d.hp - before)} độ bền${hasPerk(d, 'lan') ? ' (Lan giúp một tay)' : ''}.`, `Repaired the barricade: +${Math.round(d.hp - before)} durability${hasPerk(d, 'lan') ? ' (Lan helped)' : ''}.`) });
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
          log.push({ icon: '📦', text: L(`Tìm thấy ${amt} viên đạn ${WEAPONS[id].name}.`, `Found ${amt} ${WEAPONS[id].name} rounds.`) });
        }
      }
      if (Math.random() < 0.15 && d.grenades < GRENADE.max) {
        d.grenades++;
        log.push({ icon: '💣', text: L('Nhặt được một quả lựu đạn trong đồn cảnh sát cũ.', 'Picked up a grenade at the old police station.') });
      }
      if (Math.random() < 0.035) {
        const missing = WEAPON_ORDER.filter((id) => !d.weapons[id] && weaponUnlockNight(id, d.night, d.endless) <= d.night);
        if (missing.length) {
          const id = missing[0];
          d.weapons[id] = { mag: 0, reserve: WEAPONS[id].mag * 2 };
          log.push({ icon: '🔫', text: L(`May mắn! Nhặt được khẩu ${WEAPONS[id].name}!`, `Lucky! Found a ${WEAPONS[id].name}!`) });
        }
      }
    }
    // đồ ăn hiếm dần: giờ lục lọi sau kém hơn giờ trước, đông người thì lục được thêm chút
    for (let i = 0; i < this.alloc.scav; i++) if (Math.random() < 0.4 * Math.pow(0.85, i) * (1 + d.crew.length * 0.1)) cans += 1 + (Math.random() < 0.1 ? 1 : 0);
    if (this.alloc.scav) {
      d.cash += cash;
      d.food = (d.food || 0) + cans;
      log.push({ icon: '💰', text: L(`Lục lọi được $${cash}${hasPerk(d, 'mai') ? ' (Mai dẫn đường)' : ''}.`, `Scavenged $${cash}${hasPerk(d, 'mai') ? ' (Mai led the way)' : ''}.`) });
      log.push({ icon: '🥫', text: cans ? L(`Tìm được ${cans} hộp đồ ăn.`, `Found ${cans} can${cans > 1 ? 's' : ''} of food.`) : L('Không tìm được chút đồ ăn nào.', 'Found no food at all.') });
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
        if (!(d.met || []).includes(next.id)) d.met = [...(d.met || []), next.id];
        d.mates[next.id] = { xp: 0, injured: 0 };
        if (d.squad.length < MAX_SQUAD) d.squad.push(next.id);
        d.searchPity = 0;
        found.push(next);
      }
    }
    if (this.alloc.search) {
      if (found.length) found.forEach((s) => log.push({ icon: '🧍', text: L(`${s.name} (${s.role}) đã gia nhập nhóm!`, `${s.name} (${s.role}) joined the group!`) }));
      else log.push({ icon: '🔦', text: !this.availableRecruits().length ? L('Quanh đây không còn ai để tìm nữa.', 'There is no one left to find around here.') : L('Không tìm thấy ai còn sống… nhưng bạn đã đi được xa hơn.', 'Found no one alive… but you searched further than before.') });
    }
    if (!log.length) log.push({ icon: '·', text: L('Bạn nghỉ ngơi cả ngày.', 'You rested all day.') });
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
    return next ? L(`Chưa có ai quanh đây (có người mới từ đêm ${next.from})`, `No one around yet (someone new from night ${next.from})`) : L('Quanh đây không còn ai', 'No one left around here');
  }

  dayHours() { return DAY_HOURS + (hasPerk(this.game.data, 'kien') ? 2 : 0); }

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
          <div class="eyebrow">${L("Người sống sót mới", "New survivor")}</div>
          <h2>${s.name} <small>${s.role}</small></h2>
          <p class="story-line">${s.intro}</p>
          <p class="perk">${L('Kỹ năng', 'Perk')}: ${s.perk}</p>
        </div>
      </div>
      <div class="modal-actions"><button class="primary" data-act="closeModal">${L("Chào mừng", "Welcome")}</button></div>`;
  }

  shopItems() {
    const d = this.game.data;
    const max = barricadeMax(d.barricadeLevel);
    if (this.shopTab === 'weapons') {
      // súng mở dần theo đêm của màn; hiện trước 2 khẩu sắp mở để người chơi biết mà để dành tiền
      const open = (id) => weaponUnlockNight(id, d.night, d.endless) <= d.night;
      const upcoming = WEAPON_ORDER.filter((id) => !WEAPONS[id].infinite && !d.weapons[id] && !open(id) && weaponUnlockNight(id, d.night, d.endless) < Infinity).slice(0, 2);
      const locked = upcoming.map((id) => ({ id: 'lock:' + id, icon: id, title: WEAPONS[id].name, desc: L(`Chưa có hàng. Kho sẽ bán từ đêm ${weaponUnlockNight(id, d.night) - (stageFor(d.night) - 1) * STAGE_LENGTH} của màn này.`, `Not in stock yet. Available from night ${weaponUnlockNight(id, d.night) - (stageFor(d.night) - 1) * STAGE_LENGTH} of this stage.`), price: WEAPONS[id].price, disabled: true, tag: L('SẮP CÓ', 'SOON') }));
      return WEAPON_ORDER.filter((id) => !WEAPONS[id].infinite && (open(id) || d.weapons[id])).map((id) => {
        const w = WEAPONS[id];
        const stats = `${L('ST', 'DMG')} ${w.dmg}${w.pellets > 1 ? '×' + w.pellets : ''} · ${L('băng', 'mag')} ${w.mag}${w.auto ? ' · ' + L('tự động', 'auto') : ''}${w.pierce > 1 ? ' · ' + L('xuyên', 'pierce') + ' ' + w.pierce : ''}`;
        if (!d.weapons[id]) return { id: 'w:' + id, icon: id, title: w.name, desc: w.desc, stats, price: w.price, tag: weaponUnlockNight(id, d.night, d.endless) >= d.night - 1 ? L('MỚI VỀ', 'JUST IN') : '' };
        return { id: 'a:' + id, icon: id, title: L(`Đạn ${w.name} +${w.ammoPack}`, `${w.name} ammo +${w.ammoPack}`), desc: L(`Đang có ${d.weapons[id].reserve + d.weapons[id].mag} viên`, `${d.weapons[id].reserve + d.weapons[id].mag} rounds owned`), stats, price: w.ammoPrice, owned: true };
      }).concat(locked);
    }
    if (this.shopTab === 'defense') return this.defenseItems();
    const items = [
      { id: 'food', title: L('Đồ hộp × 3', 'Canned food × 3'), desc: L(`Mỗi sáng cả nhóm ăn ${this.eatPerDay()} hộp. Hết đồ ăn thì bị đói: nạp đạn chậm, bắn rung tay. Đang có ${d.food || 0}.`, `The group eats ${this.eatPerDay()} cans every morning. Without food everyone goes hungry: slower reloads, shaky aim. You have ${d.food || 0}.`), price: Math.round(70 * (1 + d.night * 0.03)), glyph: '🥫' },
      { id: 'grenade', icon: 'grenade', title: L('Lựu đạn', 'Grenade'), desc: L(`Nổ diện rộng, cực mạnh với bầy đàn. Đang có ${d.grenades}/${GRENADE.max}.`, `Wide blast, devastating against hordes. You have ${d.grenades}/${GRENADE.max}.`), price: GRENADE.price, disabled: d.grenades >= GRENADE.max },
      ...(d.flashlight ? [] : [{ id: 'flashlight', title: L('Đèn pin gắn súng', 'Weapon flashlight'), desc: L('Rọi một luồng sáng theo hướng ngắm. Đêm mất điện nhìn xa hơn hẳn.', 'Casts a beam where you aim. See much further on blackout nights.'), price: 250, glyph: '🔦' }]),
      // bộ sửa chữa không bán bằng tiền nữa: muốn sửa rào thì phải bỏ giờ ban ngày ra sửa
      { id: 'barricade', title: L(`Gia cố hàng rào · cấp ${d.barricadeLevel + 1}`, `Reinforce barricade · level ${d.barricadeLevel + 1}`), desc: L(`Độ bền tối đa ${max} → ${barricadeMax(d.barricadeLevel + 1)}`, `Max durability ${max} → ${barricadeMax(d.barricadeLevel + 1)}`), price: barricadeUpgradePrice(d.barricadeLevel) },
    ];
    const dl = d.dmgLevel || 0;
    if (dl < MAX_DMG_LVL) {
      items.push({ id: 'dmgUp', title: L(`Đạn xuyên giáp · cấp ${dl + 1}/${MAX_DMG_LVL}`, `Armor-piercing rounds · level ${dl + 1}/${MAX_DMG_LVL}`), desc: L('Mọi vũ khí của bạn gây thêm 8% sát thương', 'All your weapons deal 8% more damage'), price: dmgUpgradePrice(dl) });
    }
    if (d.reloadLevel < MAX_RELOAD_LVL) {
      items.push({ id: 'reloadUp', title: L(`Luyện nạp đạn · cấp ${d.reloadLevel + 1}/${MAX_RELOAD_LVL}`, `Reload drills · level ${d.reloadLevel + 1}/${MAX_RELOAD_LVL}`), desc: L('Nạp đạn mọi loại súng nhanh hơn 12%', 'Reload every weapon 12% faster'), price: reloadUpgradePrice(d.reloadLevel) });
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
        if ((d.turrets || 0) < TURRET.max) out.push({ id: 'turret', title: L(`Tháp súng máy tự động #${(d.turrets || 0) + 1}`, `Auto turret #${(d.turrets || 0) + 1}`), desc: L('Đặt trên hàng rào, tự bắn con gần nhất. Bắn liên tục sẽ quá nhiệt.', 'Mounted on the barricade, shoots the nearest zombie. Overheats with sustained fire.'), stats: L(`ST ${TURRET.dmg[tl - 1]} · ${Math.round(1 / TURRET.rate[tl - 1])} phát/giây`, `DMG ${TURRET.dmg[tl - 1]} · ${Math.round(1 / TURRET.rate[tl - 1])} shots/s`), price: TURRET.price, glyph: '⌖' });
        if ((d.turrets || 0) > 0 && tl < 3) out.push({ id: 'turretUp', title: L(`Nâng cấp tháp súng · cấp ${tl + 1}`, `Upgrade turrets · level ${tl + 1}`), desc: L('Mạnh hơn, bắn nhanh hơn, lâu quá nhiệt hơn.', 'Stronger, faster, overheats later.'), stats: `${L('ST', 'DMG')} ${TURRET.dmg[tl - 1]} → ${TURRET.dmg[tl]}`, price: TURRET.upgrade[tl], glyph: '⌖' });
      } else if (k === 'mines') {
        out.push({ id: 'mines', title: L('Mìn × 2', 'Mines × 2'), desc: L(`Tự rải trước rào mỗi đêm, nổ khi zombie dẫm lên. Kẻ nhảy bật qua được. Đang có ${d.mines || 0}/${MINE.max}.`, `Laid in front of the barricade every night, explode when stepped on. Leapers jump over them. You have ${d.mines || 0}/${MINE.max}.`), price: MINE.price * 2, glyph: '✸', disabled: (d.mines || 0) + 2 > MINE.max });
      } else if (k === 'wire') {
        const wl = d.wireLevel || 0;
        if (wl < 2) out.push({ id: 'wire', title: L(`Dây thép gai · cấp ${wl + 1}`, `Barbed wire · level ${wl + 1}`), desc: L(`Zombie sát rào bị làm chậm ${Math.round((1 - WIRE.slow[wl + 1]) * 100)}% và bị cứa liên tục.`, `Zombies near the barricade are slowed by ${Math.round((1 - WIRE.slow[wl + 1]) * 100)}% and constantly cut.`), price: WIRE.prices[wl], glyph: '✕' });
      } else if (k === 'floodlight') {
        if (!d.floodlight) out.push({ id: 'floodlight', title: L('Đèn pha chiến trường', 'Field floodlight'), desc: L('Đêm mất điện vẫn nhìn rõ quanh hàng rào và điểm ngắm.', 'See clearly around the barricade and your aim point on blackout nights.'), price: FLOODLIGHT_PRICE, glyph: '☀' });
      } else if (k === 'shocker') {
        const sl = d.shockerLevel || 0;
        if (sl < 2) out.push({ id: 'shocker', title: sl ? L('Nâng cấp bẫy điện · cấp 2', 'Upgrade electric trap · level 2') : L('Bẫy điện', 'Electric trap'), desc: L(`Tấm điện đặt xa phía trước rào, phóng điện định kỳ vào tối đa ${SHOCKER.maxHit[sl + 1]} con gần nhất trong vùng, làm tê liệt trong chốc lát. Trùm không bị tê liệt.`, `Electric plates far in front of the barricade zap up to ${SHOCKER.maxHit[sl + 1]} of the nearest zombies in the zone, stunning them briefly. Bosses are not stunned.`), stats: L(`ST ${SHOCKER.dmg[sl + 1]} · mỗi ${SHOCKER.every[sl + 1]} giây`, `DMG ${SHOCKER.dmg[sl + 1]} · every ${SHOCKER.every[sl + 1]}s`), price: SHOCKER.prices[sl], glyph: 'ϟ', tag: sl ? '' : L('MỚI', 'NEW') });
      } else if (k === 'flameTurret') {
        if (!d.flameTurret) out.push({ id: 'flameTurret', title: L('Tháp phun lửa', 'Flame turret'), desc: L('Phun lửa vào mọi con lại gần rào, đốt cháy theo thời gian. Kẻ cháy miễn nhiễm.', 'Sprays fire at everything near the barricade, burning over time. Burners are immune.'), stats: L(`tầm ${FLAME_TURRET.range}px · đốt ${FLAME_TURRET.burn}/giây`, `range ${FLAME_TURRET.range}px · burn ${FLAME_TURRET.burn}/s`), price: FLAME_TURRET.price, glyph: '♨', tag: L('MỚI', 'NEW') });
      } else if (k === 'mortar') {
        const ml = d.mortarLevel || 0;
        if (ml < 2) out.push({ id: 'mortar', title: ml ? L('Nâng cấp súng cối · cấp 2', 'Upgrade mortar · level 2') : L('Súng cối tự động', 'Auto mortar'), desc: L('Tự bắn đạn nổ vào chỗ bầy đàn đông nhất ở xa.', 'Shells the densest group of zombies at range.'), stats: L(`ST ${MORTAR.dmg[ml + 1]} · mỗi ${MORTAR.every[ml + 1]} giây`, `DMG ${MORTAR.dmg[ml + 1]} · every ${MORTAR.every[ml + 1]}s`), price: MORTAR.prices[ml], glyph: '☄', tag: ml ? '' : L('MỚI', 'NEW') });
      } else if (k === 'teslaTower') {
        const t2 = d.teslaLevel || 0;
        if (t2 < 2) out.push({ id: 'teslaTower', title: t2 ? L('Nâng cấp tháp Tesla · cấp 2', 'Upgrade tesla tower · level 2') : L('Tháp Tesla', 'Tesla tower'), desc: L('Sét nhảy qua 5 con gần nhau. Xuyên giáp, xuyên khiên.', 'Lightning jumps through nearby zombies. Ignores armor and shields.'), stats: L(`ST ${TESLA_TOWER.dmg[t2 + 1]} · mỗi ${TESLA_TOWER.every[t2 + 1]} giây`, `DMG ${TESLA_TOWER.dmg[t2 + 1]} · every ${TESLA_TOWER.every[t2 + 1]}s`), price: TESLA_TOWER.prices[t2], glyph: '⚡', tag: t2 ? '' : L('MỚI', 'NEW') });
      } else if (k === 'saw') {
        const v = d.sawLevel || 0;
        if (v < 2) out.push({ id: 'saw', title: v ? L('Nâng cấp lưỡi cưa · cấp 2', 'Upgrade saw blades · level 2') : L('Lưỡi cưa quay', 'Spinning saws'), desc: L('Ba lưỡi cưa xoay sát chân rào, cứa liên tục vào chân mọi con lại gần. Hay cắt đứt chân, biến chúng thành kẻ bò.', 'Three spinning blades at the foot of the barricade slice the legs of anything that gets close. Often cuts legs off, turning them into crawlers.'), stats: L(`${SAW.dps[v + 1]} sát thương/giây`, `${SAW.dps[v + 1]} damage/s`), price: SAW.prices[v], glyph: '✲', tag: v ? '' : L('MỚI', 'NEW') });
      } else if (k === 'sniperNest') {
        const v = d.sniperLevel || 0;
        if (v < 2) out.push({ id: 'sniperNest', title: v ? L('Nâng cấp ổ bắn tỉa · cấp 2', 'Upgrade sniper nest · level 2') : L('Ổ bắn tỉa tự động', 'Auto sniper nest'), desc: L('Súng bắn tỉa gắn ống ngắm nhiệt trên mái nhà. Ưu tiên hạ con to và nguy hiểm nhất, đạn xuyên 3 con.', 'A thermal-scoped sniper rifle on the wall. Targets the biggest, most dangerous zombie first; rounds pierce 3.'), stats: L(`ST ${SNIPER_NEST.dmg[v + 1]} · mỗi ${SNIPER_NEST.every[v + 1]} giây`, `DMG ${SNIPER_NEST.dmg[v + 1]} · every ${SNIPER_NEST.every[v + 1]}s`), price: SNIPER_NEST.prices[v], glyph: '⌖', tag: v ? '' : L('MỚI', 'NEW') });
      } else if (k === 'gas') {
        const v = d.gasLevel || 0;
        if (v < 2) out.push({ id: 'gas', title: v ? L('Nâng cấp máy phóng khí độc · cấp 2', 'Upgrade gas launcher · level 2') : L('Máy phóng khí độc', 'Gas launcher'), desc: L('Bắn bình khí độc vào chỗ bầy đàn đông nhất. Đám mây làm chậm và ăn mòn mọi con bên trong vài giây.', 'Lobs gas canisters into the densest group. The cloud slows and corrodes everything inside for a few seconds.'), stats: L(`${GAS.dps[v + 1]} sát thương/giây · mỗi ${GAS.every[v + 1]} giây`, `${GAS.dps[v + 1]} damage/s · every ${GAS.every[v + 1]}s`), price: GAS.prices[v], glyph: '☁', tag: v ? '' : L('MỚI', 'NEW') });
      } else if (k === 'rocket') {
        const v = d.rocketLevel || 0;
        if (v < 2) out.push({ id: 'rocket', title: v ? L('Nâng cấp giàn tên lửa · cấp 2', 'Upgrade rocket pod · level 2') : L('Giàn tên lửa', 'Rocket pod'), desc: L('Phóng cả loạt tên lửa nhỏ vào những con ở xa, mỗi quả nổ một vùng nhỏ.', 'Fires a salvo of small rockets at distant zombies, each with a small blast.'), stats: L(`${ROCKET.salvo[v + 1]} quả × ST ${ROCKET.dmg[v + 1]} · mỗi ${ROCKET.every[v + 1]} giây`, `${ROCKET.salvo[v + 1]} × DMG ${ROCKET.dmg[v + 1]} · every ${ROCKET.every[v + 1]}s`), price: ROCKET.prices[v], glyph: '➶', tag: v ? '' : L('MỚI', 'NEW') });
      } else if (k === 'drone') {
        if ((d.drones || 0) < DRONE.max) out.push({ id: 'drone', title: L(`Drone chiến đấu #${(d.drones || 0) + 1}`, `Combat drone #${(d.drones || 0) + 1}`), desc: L('Bay lượn trên chiến trường, bắn con gần nhất. Hết băng thì tự nạp.', 'Hovers over the battlefield shooting the nearest zombie. Reloads by itself.'), stats: L(`ST ${DRONE.dmg} · băng ${DRONE.mag}`, `DMG ${DRONE.dmg} · mag ${DRONE.mag}`), price: DRONE.price, glyph: '✈', tag: L('MỚI', 'NEW') });
      }
    }
    if (hasPerk(d, 'son')) for (const it of out) it.price = Math.round(it.price * 0.8);
    if (!out.length) out.push({ id: 'none', title: L('Đã dựng hết công trình của chương này', 'All defenses for this chapter are built'), desc: L('Sang chương mới sẽ có công trình phòng thủ khác.', 'A new chapter brings different defenses.'), price: 0, glyph: '✓', disabled: true });
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
    else if (id === 'flashlight') d.flashlight = true;
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
    else if (id === 'saw') d.sawLevel = (d.sawLevel || 0) + 1;
    else if (id === 'sniperNest') d.sniperLevel = (d.sniperLevel || 0) + 1;
    else if (id === 'gas') d.gasLevel = (d.gasLevel || 0) + 1;
    else if (id === 'rocket') d.rocketLevel = (d.rocketLevel || 0) + 1;
    else if (id.startsWith('w:')) {
      const w = id.slice(2);
      d.weapons[w] = { mag: WEAPONS[w].mag, reserve: WEAPONS[w].mag * 2 };
      d.current = w;
    } else if (id.startsWith('a:')) d.weapons[id.slice(2)].reserve += WEAPONS[id.slice(2)].ammoPack;
    sfx.buy();
    saveGame(d);
    this.renderDay();
  }

  // tóm tắt đêm vừa qua
  recap(info) {
    const hurt = info.injured?.length ? info.injured.map((id) => SURVIVORS.find((x) => x.id === id).name).join(', ') : '';
    if (getLang() === 'en') {
      return `Night ${info.night}: killed <b>${info.kills}</b> zombies (${info.headshots} headshots), best streak <b>${info.bestStreak}</b>, earned <b>$${info.earned}</b> + survival bonus <b>$${info.bonus}</b>${info.campIncome ? ` + camp <b>$${info.campIncome}</b>` : ''}${info.eat ? `, the group ate <b>${info.eat}</b> cans` : ''}${info.hungry ? ' <span class="hurt-txt">· OUT OF FOOD, EVERYONE IS HUNGRY</span>' : ''}${info.crates ? `, opened <b>${info.crates}</b> supply crates` : ''}${info.extraGrenade ? ', Hung found 1 extra grenade' : ''}.${hurt ? ` <span class="hurt-txt">${hurt} injured.</span>` : ''}`;
    }
    return `Đêm ${info.night}: hạ <b>${info.kills}</b> zombie (${info.headshots} headshot), chuỗi dài nhất <b>${info.bestStreak}</b>, kiếm <b>$${info.earned}</b> + thưởng sống sót <b>$${info.bonus}</b>${info.campIncome ? ` + trại <b>$${info.campIncome}</b>` : ''}${info.eat ? `, cả nhóm ăn <b>${info.eat}</b> hộp` : ''}${info.hungry ? ' <span class="hurt-txt">· HẾT ĐỒ ĂN, CẢ NHÓM ĐANG ĐÓI</span>' : ''}${info.crates ? `, mở <b>${info.crates}</b> thùng tiếp tế` : ''}${info.extraGrenade ? ', Hùng nhặt thêm 1 lựu đạn' : ''}.${hurt ? ` <span class="hurt-txt">${hurt} bị thương.</span>` : ''}`;
  }

  renderDay() {
    const d = this.game.data;
    const max = barricadeMax(d.barricadeLevel);
    const used = this.alloc.repair + this.alloc.scav + this.alloc.search;
    const info = this.dayInfo;
    const campaign = !d.endless && d.night <= CAMPAIGN_NIGHTS;
    // giữ vị trí cuộn của cả khung kế hoạch lẫn cửa hàng khi vẽ lại
    const scroll = this.root.querySelector('.shop-list')?.scrollTop || 0;
    const planScroll = this.root.querySelector('.panel.plan')?.scrollTop || 0;

    const act = actFor(d.night);
    const actStart = (act - 1) * ACT_LENGTH;
    const dots = campaign ? `<div class="night-track">${Array.from({ length: ACT_LENGTH }, (_, i) => {
      const n = actStart + i + 1;
      const cls = n < d.night ? 'done' : n === d.night ? 'next' : '';
      return `<span class="${cls}${isBossNight(n) ? ' boss' : ''}" title="${L('Đêm', 'Night')} ${n}"></span>`;
    }).join('')}<em>${['', '🚁', '🚢', '🏔', '📡', '🚚', '🏥', '🏭', '✈', '🌲', '🗼'][act]}</em></div>` : '';

    const radioLines = storyFor(DAWN_LOG[d.night - 1], d.met || []);
    const radio = radioLines.length && !d.endless ? radioLines[radioLines.length - 1] : null;
    const newFoe = { 62: 'hazmat', 72: 'brood', 82: 'frost', 92: 'signal', 2: 'runner', 3: 'crawler', 4: 'brute', 6: 'spitter', 11: 'riot', 12: 'bloater', 22: 'dog', 24: 'screamer', 27: 'reviver', 32: 'shielder', 42: 'leaper', 44: 'burner', 52: 'splitter', 54: 'stalker' }[d.night];
    const mods = modsFor(d.night);
    const modList = Object.keys(MOD_INFO).filter((k) => mods[k]);
    const wv = waveFor(d.night);
    const graceInfo = wv.grace ? L(`<div><b>🌱 Khởi động màn mới (đêm ${wv.local}/3)</b> Zombie yếu hơn, ít quái nặng, không có tinh nhuệ. Tiền thưởng ×1,4 để kịp mua súng.</div>`, `<div><b>🌱 New stage warm-up (night ${wv.local}/3)</b> Weaker zombies, fewer heavies, no elites. Rewards ×1.4 so you can afford guns.</div>`) : '';
    const forecast = modList.length || graceInfo ? `<div class="forecast"><span class="radio-tag">${L('DỰ BÁO ĐÊM NAY', 'TONIGHT\'S FORECAST')}</span>${graceInfo}${modList.map((k) => `<div><b>${MOD_INFO[k].icon} ${MOD_INFO[k].name}${k === 'airdrops' ? ` ×${mods.airdrops}` : ''}</b> ${MOD_INFO[k].desc}</div>`).join('')}</div>` : '';
    const hurtSquad = d.squad.filter((id) => d.mates[id]?.injured > 0);
    const openSlots = MAX_SQUAD - d.squad.filter((id) => !(d.mates[id]?.injured > 0)).length;
    const bench = d.crew.filter((id) => !d.squad.includes(id) && !(d.mates[id]?.injured > 0));
    const foodWarn = (d.food || 0) < this.eatPerDay() ? L(`<div class="warn">🥫 Đồ ăn không đủ cho sáng mai (cần ${this.eatPerDay()}, còn ${d.food || 0}). Hãy lục lọi hoặc mua đồ hộp, nếu không cả nhóm sẽ đói.</div>`, `<div class="warn">🥫 Not enough food for tomorrow morning (need ${this.eatPerDay()}, have ${d.food || 0}). Scavenge or buy canned food, or the group will go hungry.</div>`) : '';
    const th = d.threat || 1;
    const thInfo = info && info.threat !== undefined ? (info.threat > info.threatBefore ? L(` Đêm qua rào chỉ mất ${info.dmgPct}% nên bầy đàn đang mạnh lên.`, ` The barricade only lost ${info.dmgPct}% last night, so the horde is getting stronger.`) : info.threat < info.threatBefore ? L(` Đêm qua rào mất ${info.dmgPct}%, bầy đàn nới tay một chút.`, ` The barricade lost ${info.dmgPct}% last night, so the horde eases off a little.`) : '') : '';
    const threatWarn = th > 1.05 || (info && info.threat !== info.threatBefore) ? `<div class="warn${th >= 1.6 ? '' : ' soft'}">☠ ${L('Mức đe doạ', 'Threat level')} <b>${th.toFixed(2)}×</b>: ${L('zombie nhiều máu hơn, đông hơn, dồn dập hơn.', 'zombies are tougher, more numerous and more relentless.')}${thInfo}</div>` : '';
    const resetWarn = d.upgradeReset ? L('<div class="warn soft">⚙ Màn mới, bắt đầu lại tay trắng: chỉ còn súng lục, $300, 2 lựu đạn, 8 hộp đồ ăn. Súng, đạn, nâng cấp, hàng rào, đồng đội và công trình phòng thủ đều phải làm lại.</div>', '<div class="warn soft">⚙ New stage, starting from scratch: just a pistol, $300, 2 grenades and 8 cans of food. Guns, ammo, upgrades, barricade, companions and defenses all start over.</div>')
      : d.chapterReset ? L(`<div class="warn soft">⚙ Chương mới, chỗ ở mới: hàng rào phải dựng lại từ đầu (mất hết cấp gia cố), đồng đội và công trình phòng thủ cũng vậy. Súng, đạn và tiền vẫn giữ nguyên.${d.salvage ? ` Vật liệu tháo từ hàng rào cũ bán được <b>$${d.salvage}</b>.` : ''} Hai đêm đầu bầy đàn sẽ thưa hơn.</div>`, `<div class="warn soft">⚙ New chapter, new place: the barricade is rebuilt from scratch (all reinforcement levels lost), and so are companions and defenses. Guns, ammo and cash are kept.${d.salvage ? ` Materials salvaged from the old barricade sold for <b>$${d.salvage}</b>.` : ''} The horde is thinner for the first two nights.</div>`) : '';
    const squadWarn = hurtSquad.length && bench.length && openSlots > 0
      ? `<div class="warn">🩹 ${hurtSquad.map((id) => SURVIVORS.find((x) => x.id === id).name).join(', ')} ${L('đang bị thương. Mở tab Đồng đội để đưa người khác lên thay.', 'injured. Open the Crew tab to swap someone else in.')}</div>` : '';
    const warn = (isBossNight(d.night) ? L(`<div class="warn">⚠ Đêm nay có trăng máu: ${ZOMBIES[bossTypeFor(d.night)].name} sẽ xuất hiện.</div>`, `<div class="warn">⚠ Blood moon tonight: ${ZOMBIES[bossTypeFor(d.night)].name} will appear.</div>`) : '')
      + (newFoe && !d.endless ? L(`<div class="warn soft">Loại mới đêm nay: ${ZOMBIES[newFoe].name}.</div>`, `<div class="warn soft">New enemy tonight: ${ZOMBIES[newFoe].name}.</div>`) : '');

    const row = (k, label, hint) => `
      <div class="hour-row">
        <div class="hour-label">${label}<small>${hint}</small></div>
        <div class="stepper">
          <button data-act="hour" data-arg="${k}:-" ${this.dayDone || !this.alloc[k] ? 'disabled' : ''} aria-label="Less">−</button>
          <span>${this.alloc[k]}<i>h</i></span>
          <button data-act="hour" data-arg="${k}:+" ${this.dayDone || used >= this.dayHours() ? 'disabled' : ''} aria-label="More">+</button>
        </div>
      </div>`;
    const hourDots = Array.from({ length: this.dayHours() }, (_, i) => {
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
      shopBody = L(`<div class="squad-head">Trên hàng rào: <b>${onWall}/${MAX_SQUAD}</b> · Người ở trại kiếm thêm ~$${Math.round(CAMP_INCOME * (1 + d.night * 0.04))} mỗi sáng · Bị thương phải nghỉ vài đêm</div>`, `<div class="squad-head">On the barricade: <b>${onWall}/${MAX_SQUAD}</b> · Each person in camp earns ~$${Math.round(CAMP_INCOME * (1 + d.night * 0.04))} every morning · Injured people rest a few nights</div>`)
      + SURVIVORS.filter((s) => d.crew.includes(s.id) || (!d.endless && s.act === curAct)).map((s) => {
        const has = d.crew.includes(s.id);
        if (!has) {
          return `<div class="crew-card unknown"><div class="crew-unknown">?</div>
            <div><b>${L('Chưa tìm thấy', 'Not found yet')}</b><span>${L('Dành thời gian tìm người sống sót vào ban ngày.', 'Spend daytime hours searching for survivors.')}</span></div></div>`;
        }
        const m = d.mates[s.id] || { xp: 0, injured: 0 };
        const lv = mateLevel(m.xp);
        const nextXp = MATE_XP[lv] ?? null;
        const inSquad = d.squad.includes(s.id);
        const hurt = m.injured > 0;
        const status = hurt ? `<em class="st hurt">${L(`Bị thương · nghỉ ${m.injured} đêm`, `Injured · resting ${m.injured} night${m.injured > 1 ? 's' : ''}`)}</em>` : inSquad ? `<em class="st wall">${L('Trên hàng rào', 'On the barricade')}</em>` : `<em class="st camp">${L('Ở trại', 'In camp')}</em>`;
        return `<div class="crew-card${hurt ? ' hurt' : ''}">
          <img src="${portrait(s)}" alt="">
          <div class="crew-main">
            <b>${s.name} · ${s.role} <i class="stars">${'★'.repeat(lv)}<span class="off">${'★'.repeat(3 - lv)}</span></i></b>
            <span>${s.perk}</span>
            <small>${status} · ${WEAPONS[s.weapon].name} · ${nextXp ? `${m.xp}/${nextXp} XP` : L('cấp tối đa', 'max level')}</small>
          </div>
          <button class="squad-btn${inSquad ? ' on' : ''}" data-act="squad" data-arg="${s.id}" ${hurt && !inSquad ? 'disabled' : ''}>${inSquad ? L('Về trại', 'To camp') : L('Ra trận', 'Deploy')}</button>
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
            <div class="eyebrow">${campaign ? L(`Màn ${stageFor(d.night)} · Chương ${act} · ${ACT_NAMES[act]} · còn ${act * ACT_LENGTH - d.night + 1} đêm`, `Stage ${stageFor(d.night)} · Chapter ${act} · ${ACT_NAMES[act]} · ${act * ACT_LENGTH - d.night + 1} night${act * ACT_LENGTH - d.night + 1 > 1 ? 's' : ''} left`) : L('Ban ngày · chế độ vô tận', 'Daytime · endless mode')}</div>
            <h2>${L('Chuẩn bị cho Đêm', 'Prepare for Night')} ${campaign ? `${d.night - (stageFor(d.night) - 1) * STAGE_LENGTH}/${STAGE_LENGTH}` : d.night}</h2>
            ${dots}
          </div>
          <div class="stats">
            <div class="stat cash"><b>$${d.cash}</b><span>${L('tiền', 'cash')}</span></div>
            <div class="stat${(d.food || 0) < this.eatPerDay() ? ' low' : ''}"><b>🥫 ${d.food || 0}</b><span>${L(`đồ hộp · ăn ${this.eatPerDay()}/ngày`, `cans · eat ${this.eatPerDay()}/day`)}</span></div>
            <div class="stat"><b>${Math.ceil(d.hp)}<i>/${max}</i></b><span>${L('hàng rào', 'barricade')}</span></div>
            <div class="stat"><b>${d.squad.filter((id) => !(d.mates[id]?.injured > 0)).length}<i>/${MAX_SQUAD}</i></b><span>${L(`trên rào · ${d.crew.length} người`, `on wall · ${d.crew.length} crew`)}</span></div>
          </div>
        </header>
        <div class="day-body">
          <section class="panel plan">
            ${info ? `<div class="recap">${this.recap(info)}</div>` : ''}
            ${radio ? `<div class="radio-card"><span class="radio-tag">${whoLabel(radio.who)}</span>${esc(radio.text)}</div>` : ''}
            ${resetWarn}${threatWarn}${warn}${foodWarn}${squadWarn}${forecast}
            <h3>${this.dayDone ? L('Kết quả trong ngày', 'Today\'s results') : L('Kế hoạch ban ngày', 'Day plan')} <small>${this.dayDone ? L('Đã hết giờ', 'Out of time') : L(`${this.dayHours() - used} giờ còn lại`, `${this.dayHours() - used} hours left`)}</small></h3>
            <div class="hour-dots">${hourDots}</div>
            ${this.dayDone
              ? `<ul class="day-log${this.animateLog ? ' animate' : ''}">${this.dayLog.map((l) => `<li><span>${l.icon}</span>${l.text}</li>`).join('')}</ul>`
              : `${row('repair', L('🔨 Sửa hàng rào', '🔨 Repair barricade'), L(`+${Math.round(this.repairRate() * 100)}% độ bền mỗi giờ`, `+${Math.round(this.repairRate() * 100)}% durability per hour`))}
            ${row('scav', L('🎒 Lục lọi', '🎒 Scavenge'), L('Tiền, đạn, lựu đạn, may mắn có súng', 'Cash, ammo, grenades, maybe a gun'))}
            ${row('search', L('🔦 Tìm người sống sót', '🔦 Search for survivors'), this.availableRecruits().length ? L('Khó tìm, thường mất nhiều ngày', 'Hard to find, often takes several days') : this.nextRecruitHint())}
              <button class="primary wide" data-act="doDay" ${used ? '' : 'disabled'}>${used ? L(`Thực hiện kế hoạch (${used} giờ)`, `Carry out the plan (${used} h)`) : L('Phân bổ ít nhất 1 giờ', 'Assign at least 1 hour')}</button>`}
          </section>
          <section class="panel shop">
            <div class="tabs">
              <button class="${this.shopTab === 'weapons' ? 'active' : ''}" data-act="tab" data-arg="weapons">${L('Vũ khí', 'Weapons')}</button>
              <button class="${this.shopTab === 'gear' ? 'active' : ''}" data-act="tab" data-arg="gear">${L('Trang bị', 'Gear')}</button>
              <button class="${this.shopTab === 'defense' ? 'active' : ''}" data-act="tab" data-arg="defense">${L('Phòng thủ', 'Defense')}</button>
              <button class="${this.shopTab === 'crew' ? 'active' : ''}" data-act="tab" data-arg="crew">${L('Đồng đội', 'Crew')} ${d.crew.length}${hurtSquad.length ? ' 🩹' : ''}</button>
            </div>
            <div class="shop-list">${shopBody}</div>
          </section>
        </div>
        <footer class="day-footer">
          <button class="ghost" data-act="quit">${L('Lưu & về menu', 'Save & quit')}</button>
          <button class="primary big" data-act="startNight" ${this.dayDone ? '' : 'disabled'}>
            ${this.dayDone ? L(`Bắt đầu Đêm ${d.night} ☾`, `Start Night ${d.night} ☾`) : L('Hãy dùng thời gian ban ngày trước', 'Use your daytime first')}
          </button>
        </footer>
      </div>`;
    this.fadeDay = false;
    this.animateLog = false;
    const list = this.root.querySelector('.shop-list');
    if (list) list.scrollTop = scroll;
    const plan = this.root.querySelector('.panel.plan');
    if (plan) plan.scrollTop = planScroll;
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().then(() => {
      screen.orientation?.lock?.('landscape').catch(() => {});
    }).catch(() => {});
  } else document.exitFullscreen?.();
}
