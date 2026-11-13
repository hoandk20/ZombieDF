# Đăng Barricade Nights lên Google Play

Mọi thứ phía code đã sẵn sàng: Capacitor 8, **target API 36** (mức Google Play bắt buộc cho ứng dụng mới),
icon, màn hình chờ, phông chữ đóng gói offline, workflow build file `.aab` đã ký, trang chính sách quyền riêng tư,
ảnh cho trang cửa hàng (`store-assets/`). Phần còn lại làm trên máy bạn và trên Play Console.

## 1. Tạo upload key (một lần duy nhất)

Nếu bạn đã có upload key từ game trước, có thể dùng lại khoá đó (Google cho phép một upload key cho nhiều ứng dụng).
Nếu muốn khoá riêng, trên máy có cài JDK hoặc Android Studio, chạy:

```bash
keytool -genkeypair -v -keystore upload-keystore.jks -alias upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

Giữ file `upload-keystore.jks` và hai mật khẩu ở nơi an toàn (trình quản lý mật khẩu, bản sao dự phòng).
**Không commit file này vào repo** (`.gitignore` đã chặn `*.jks`).

## 2. Thêm 4 secret vào GitHub

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Tên secret | Giá trị |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | nội dung file keystore mã hoá base64 (lệnh bên dưới) |
| `ANDROID_KEYSTORE_PASSWORD` | mật khẩu keystore |
| `ANDROID_KEY_ALIAS` | alias, vd. `upload` |
| `ANDROID_KEY_PASSWORD` | mật khẩu của khoá |

Lấy base64:

- macOS: `base64 -i upload-keystore.jks | pbcopy`
- Linux: `base64 -w0 upload-keystore.jks`
- Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("upload-keystore.jks")) | Set-Clipboard`

## 3. Build file `.aab`

Tab **Actions → Release build for Google Play → Run workflow**, nhập tên phiên bản (vd. `1.0.0`).
Khi chạy xong, tải artifact `barricade-nights-…-aab` (file `app-release.aab`). Artifact `…-apk` là bản đã ký để cài thử.
Mỗi lần chạy workflow, `versionCode` tự tăng (bằng số thứ tự lần chạy), nên lần cập nhật sau chỉ cần chạy lại.

## 4. Trang chính sách quyền riêng tư

Google bắt buộc có URL chính sách quyền riêng tư. File `public/privacy.html` được đưa lên GitHub Pages cùng bản web:
chạy workflow **Deploy web to GitHub Pages**, rồi dùng URL
`https://hoandk20.github.io/ZombieDF/privacy.html`.

## 5. Tạo ứng dụng trên Play Console

1. **Create app**: tên `Barricade Nights`, ngôn ngữ mặc định English (United States), loại **Game**, **Free**.
2. **App integrity → App signing**: để Google quản lý khoá ký (Play App Signing, mặc định); file `.aab` bạn tải lên được ký bằng upload key.
3. **Tài khoản cá nhân tạo sau 13/11/2023** phải chạy **closed testing với ít nhất 12 người thử trong 14 ngày liên tục**
   trước khi được xin production. Tài khoản tổ chức, hoặc tài khoản cũ hơn, có thể lên production ngay.
   Vì bạn đã từng đăng game, hãy xem Dashboard của Play Console có hiện yêu cầu này hay không.
4. **Testing → Internal testing**: tải `.aab` lên trước để tự cài thử trên điện thoại qua Play Store.

## 6. Nội dung khai báo (App content)

| Mục | Trả lời |
|---|---|
| Privacy policy | URL ở bước 4 |
| Ads | **No**, ứng dụng không có quảng cáo |
| App access | Mọi chức năng dùng được không cần đăng nhập |
| Content rating (IARC) | Danh mục Game. Có bạo lực với nhân vật giả tưởng (zombie) kèm máu; không có nội dung tình dục, cờ bạc, ma tuý, chat hay mua hàng trong ứng dụng. Kết quả thường là **PEGI 16 / ESRB Teen–Mature** tuỳ câu trả lời về máu |
| Target audience | **18+** (hoặc 16–17 và 18+). Không chọn nhóm dưới 13 tuổi |
| Data safety | **Không thu thập và không chia sẻ dữ liệu nào**. Bản lưu chỉ nằm trên máy |
| News app / Government / Financial / Health | No |

## 7. Trang cửa hàng (Store listing)

Ảnh có sẵn trong `store-assets/`:

- `icon-512.png`: icon 512×512
- `feature-1024x500.png`: ảnh nổi bật 1024×500
- `screenshot-*.png`: 5 ảnh chụp ngang 1920×1080 (cần ít nhất 2 ảnh)

**Tên (≤30 ký tự):** Barricade Nights

**Mô tả ngắn (≤80 ký tự)**

- EN: `Hold the barricade for 100 nights. A dark pixel zombie survival story.`
- VI: `Giữ hàng rào qua 100 đêm. Câu chuyện sinh tồn zombie pixel u tối.`

**Mô tả đầy đủ (EN)**

```
The radio is the only thing still talking. Hoan, an IT engineer who kept the town's radio station alive,
has one pistol, a few sandbags and a promise: rescue in ten nights.

Barricade Nights is a pixel-art zombie defense game. Aim for the head, sever limbs, hold the wall, and survive
until dawn. By day, split your hours between repairing the barricade, scavenging for cash and ammo, and searching
for survivors who will fight beside you.

• 100-night campaign across 5 stages and 10 locations: a hillside house, a burning harbor, a mountain dam,
  a dead capital, a frozen border forest and a lighthouse that should have stopped broadcasting long ago.
• A dark story told through cutscenes, radio chatter and dawn logs, with an open ending.
• 11 weapons unlocked as the campaign goes on: shotguns, rifles, machine guns, flamethrowers, grenade launchers,
  tesla guns, railguns and more. Recoil matters: hold the trigger and the muzzle climbs.
• Dozens of zombie types: crawlers, runners, armored riot police, exploding bloaters, leapers, burners, brood
  carriers, and colossal bosses.
• 20 survivors to recruit, each with their own weapon and perk.
• Build defenses: turrets, mines, electric fences, flame turrets, tesla towers, sniper nests.
• Dismemberment: shoot the legs and they crawl.
• Endless mode after the campaign.
• Fully offline. No ads. No data collected.
• English and Vietnamese.
```

**Mô tả đầy đủ (VI)**

```
Radio là thứ duy nhất còn lên tiếng. Hoàn, kỹ sư IT giữ cho đài phát thanh của thị trấn còn sống, chỉ có
một khẩu súng lục, vài bao cát và một lời hứa: trực thăng sẽ đến sau mười đêm.

Barricade Nights là game thủ thành zombie phong cách pixel. Ngắm vào đầu, bắn đứt tay chân, giữ vững hàng rào
và sống tới bình minh. Ban ngày, chia thời gian để sửa hàng rào, lục lọi tìm tiền và đạn, hoặc đi tìm những
người sống sót sẽ cùng bạn chiến đấu.

• Chiến dịch 100 đêm qua 5 màn và 10 địa điểm: căn nhà dưới chân đồi, bến cảng bốc cháy, con đập trên núi,
  thủ đô chết, rừng tuyết biên giới và một ngọn hải đăng lẽ ra đã phải ngừng phát sóng từ lâu.
• Cốt truyện u tối kể qua phim, tin radio và nhật ký mỗi bình minh, với một cái kết mở.
• 11 loại súng mở dần theo chiến dịch: shotgun, súng trường, súng máy, súng phun lửa, súng phóng lựu,
  súng điện, railgun… Súng có độ giật: giữ cò lâu là nòng súng bị kéo lên.
• Hàng chục loại zombie: kẻ bò, kẻ chạy, cảnh sát bọc giáp, xác trương phình phát nổ, kẻ nhảy, kẻ cháy,
  kẻ ấp trứng và những con trùm khổng lồ.
• 20 người sống sót để chiêu mộ, mỗi người một khẩu súng và một kỹ năng riêng.
• Xây phòng thủ: súng máy tự động, mìn, rào điện, súng phun lửa, tháp Tesla, ổ bắn tỉa.
• Bắn đứt chân là zombie phải bò.
• Chế độ vô tận sau khi hoàn thành chiến dịch.
• Chơi offline hoàn toàn. Không quảng cáo. Không thu thập dữ liệu.
• Tiếng Anh và tiếng Việt.
```

**Danh mục:** Game → Action (hoặc Strategy). **Tags:** Zombie, Tower defense, Pixel art, Offline, Single player.

## Thông tin kỹ thuật

| Mục | Giá trị |
|---|---|
| Package name | `com.zombiedf.barricadenights` (không đổi được sau lần tải lên đầu tiên) |
| minSdk / targetSdk | 24 / 36 |
| Hướng màn hình | ngang (sensorLandscape) |
| Quyền | chỉ INTERNET (mặc định của Capacitor, game không dùng mạng) |
