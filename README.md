# Barricade Nights 🧟

Game thủ thành chống zombie 2D (thể loại *barricade defense*), chiến dịch 2 màn × 20 đêm: đứng sau hàng rào, ngắm bắn
từng đợt zombie mỗi đêm, ban ngày thì sửa rào, đi lục lọi, tìm người sống sót và mua súng mới.

Viết bằng **HTML5 Canvas + JavaScript thuần** (không dùng engine), đóng gói bằng **Vite** cho web
và **Capacitor** cho Android. Toàn bộ hình ảnh và âm thanh được vẽ / tổng hợp bằng code nên không
cần file tài nguyên nào.

## Cốt truyện

Nhân vật chính là **Phong**, kỹ thuật viên trạm phát thanh thị trấn Bến Sương: tóc đen dựng, luôn đeo
tai nghe, sơ mi trắng, cà vạt, dây đai đeo súng. Dịch bệnh bùng phát, và radio là sợi dây hy vọng cuối cùng.

- **Chương 1 · Bến Sương (đêm 1–10):** cố thủ trong nhà ông ngoại dưới chân đồi chờ trực thăng.
  Đêm 10 có trăng máu và trùm **Kẻ Khổng Lồ**.
- **Chương 2 · Cảng Vọng Hải (đêm 11–20):** trực thăng chỉ đưa được nhóm tới bến cảng; phải giữ cầu
  tàu số 3 chờ tàu sơ tán *Bình Minh*. Bản đồ bến cảng với biển đêm, cần cẩu, container và hải đăng.
  Đêm 15 có Kẻ Khổng Lồ thứ hai, đêm 20 có trùm cuối **Quái Vật Cảng** biết gọi đàn.
- Phim mở đầu, chuyển chương và kết thúc; tin radio và nhật ký mỗi bình minh.
- 4 người sống sót có tên, ngoại hình và kỹ năng riêng: **Lan** (y tá, sửa rào giỏi), **Ông Tư** (thợ săn,
  bắn chính xác), **Bảo** (thợ máy, hàng rào tự hồi phục), **Mai** (sinh viên, lục lọi được nhiều hơn).
- **Màn 2 · Mật mã Hồng Sơn (đêm 21–40):** trạm nghiên cứu Hồng Sơn có vắc-xin nhưng cần 20 ngày điều chế.
  **Chương 3 · Đập Hồng Sơn** (núi rừng, đập thủy điện) và **Chương 4 · Căn cứ Hồng Sơn** (đèn pha, tháp canh,
  phòng thí nghiệm). Trùm: Kẻ Khổng Lồ (25), Bạo Chúa Rừng gọi đàn chó (30), hai Kẻ Khổng Lồ (35), Mẫu Thể Số 0
  ba giai đoạn (40). Kết thúc: Phong phát công thức vắc-xin trên mọi tần số.
- 4 đồng đội mới ở màn 2: **Hùng** (cựu binh, súng máy), **Linh** (xạ thủ), **bác sĩ Khoa**, **Vy** (kỹ sư điện).
- Thắng chiến dịch sẽ mở **chế độ vô tận** (cứ 5 đêm lại có một con trùm).

## Giữ cho mỗi đêm không nhàm chán

- **Dự báo đêm nay** hiện ở màn ban ngày. Các kiểu đêm đặc biệt:
  🔦 **Mất điện** (chỉ thấy quanh đèn pin và ánh lửa), 🪂 **Thả dù tiếp tế** (bắn trúng thùng hàng để nhận đồ),
  💰 **Kẻ mang hòm** (hạ trước khi nó bỏ chạy), ⚡ **Đêm tốc độ**, 🌊 **Đêm bầy đàn**.
- Kẻ thù mới xuất hiện dần: chó nhiễm bệnh (22), kẻ rú làm cả bầy chạy nhanh hơn (24), kẻ tái sinh đứng dậy nếu
  không bị bắn vỡ đầu hoặc thiêu cháy (27).
- Cứ 5 đêm một con trùm; vũ khí mới mở theo chương (súng bắn tỉa ở chương 3, súng điện ở chương 4).

## Đội hình đồng đội

- Tối đa **4 người trên hàng rào**; người còn lại **ở trại** và mỗi sáng kiếm thêm tiền.
- Đồng đội **lên cấp** (★★★) khi tự tay hạ zombie: bắn mạnh hơn, nhanh hơn.
- Khi hàng rào dưới 35% hoặc kẻ trương phình nổ sát rào, đồng đội có thể **bị thương** và phải nghỉ vài đêm
  (Lan và bác sĩ Khoa giúp hồi phục nhanh hơn). Vào tab **Đồng đội** để đưa người khác lên thay.

## Lối chơi

| | |
|---|---|
| **Ban đêm** | Zombie kéo đến từ bên phải. Chuột / chạm để ngắm & bắn. Bắn vào **đầu** gây x2.5 sát thương và thưởng thêm tiền. Độ bền hàng rào về 0 là thua. |
| **Ban ngày** | Chia 10 giờ cho: 🔨 sửa hàng rào, 🎒 lục lọi (tiền, đạn, đôi khi nhặt được súng), 🔦 tìm người sống sót (tối đa 4 người, tự động bắn hỗ trợ). Sau đó mua sắm ở cửa hàng. |
| **Vũ khí** | Súng lục (đạn vô hạn), Shotgun (nhiều viên, mạnh ở gần), Tiểu liên (tự động), Súng trường (xuyên 4 mục tiêu), Súng máy. Chương 2 mở thêm Súng phun lửa (đốt cháy, xuyên giáp) và Súng phóng lựu (đạn nổ); chương 3 Súng bắn tỉa (xuyên 8), chương 4 Súng điện (sét lan 5 con). |
| **Zombie** | Thường, chạy nhanh (từ đêm 2), bò (từ đêm 3, khó bắn đầu), gã khổng lồ (từ đêm 4), kẻ phun axit (từ đêm 6, phá rào từ xa), cảnh sát bọc giáp (từ đêm 11, mũ chặn headshot cho tới khi vỡ), kẻ trương phình (từ đêm 12, phát nổ khi chết), trùm Kẻ Khổng Lồ (đêm 10, 15) và Quái Vật Cảng (đêm 20). |
| **Lựu đạn** | Nổ diện rộng. Phím `G`/`Space` ném vào vị trí con trỏ; trên điện thoại chạm nút lựu đạn rồi chạm vào chỗ muốn ném. |
| **Nâng cấp** | Gia cố hàng rào (tăng độ bền tối đa), luyện nạp đạn nhanh hơn, đạn xuyên giáp (+12% sát thương mỗi cấp), bộ sửa chữa. |

**Điều khiển:** chuột/chạm để bắn (súng tự động: giữ), `R` nạp đạn, `G` lựu đạn, `1–9` / `Q` `E` / con lăn để đổi
súng, `P` hoặc `Esc` tạm dừng. Trên điện thoại có nút nạp đạn và nút đổi súng ở bên trái màn hình.

Tiến trình tự lưu (localStorage) vào mỗi buổi sáng và đầu mỗi đêm; thua thì có thể chơi lại đúng đêm đó.

**Hiệu ứng:** ánh sáng chớp súng và vụ nổ, mưa, sấm sét, sương mù, trăng máu, quay chậm khi hạ zombie cuối cùng, chuỗi hạ liên tiếp, nhạc nền u ám và nhịp tim khi hàng rào sắp vỡ.

## Chạy trên web

Cần Node.js 18+.

```bash
npm install
npm run dev        # mở http://localhost:5173 (dùng --host nên điện thoại cùng mạng Wi-Fi cũng vào được)
npm run build      # xuất bản build tĩnh ra thư mục dist/
npm run preview    # chạy thử bản build
```

Thư mục `dist/` là web tĩnh, có thể đưa lên bất kỳ hosting nào (GitHub Pages, Netlify, Vercel,
itch.io...). Có sẵn workflow `.github/workflows/pages.yml`: bật **Settings → Pages → Source: GitHub
Actions** rồi chạy workflow *Deploy web to GitHub Pages* trong tab Actions.

Game cũng có `manifest.webmanifest`, nên trên Android có thể "Thêm vào màn hình chính" từ Chrome để
chơi toàn màn hình như ứng dụng.

## Build Android (APK)

Dự án Android nằm trong thư mục `android/` (đã cấu hình khoá màn hình ngang, toàn màn hình,
giữ màn hình sáng).

### Cách 1 — để GitHub build giúp
Mỗi lần push, workflow `.github/workflows/build.yml` sẽ build web + APK debug. Vào tab
**Actions → lần chạy mới nhất → Artifacts → `barricade-nights-debug-apk`**, tải về và cài lên điện
thoại (cần cho phép "Cài ứng dụng không rõ nguồn gốc").

### Cách 2 — build trên máy
Cần [Android Studio](https://developer.android.com/studio) (kèm Android SDK) và JDK 17.

```bash
npm install
npm run android:sync   # build web và chép vào dự án Android
npm run android:open   # mở Android Studio → Run ▶ hoặc Build → Build APK(s)
# hoặc chạy thẳng lên máy/emulator đang kết nối:
npm run android:run
```

Mỗi khi sửa code game, chạy lại `npm run android:sync`.

Để phát hành lên Google Play: trong Android Studio chọn **Build → Generate Signed App Bundle**,
tạo keystore và tải file `.aab` lên Play Console. Đổi `appId` trong `capacitor.config.json`
(hiện là `com.zombiedf.barricadenights`) trước khi phát hành lần đầu nếu muốn.

## Cấu trúc mã nguồn

```
src/
  config.js   # thông số: vũ khí, loại zombie, độ khó từng đêm, thời tiết, giá nâng cấp  ← chỉnh cân bằng game ở đây
  story.js    # cốt truyện: phim mở đầu/kết thúc, tin radio, người sống sót
  game.js     # vòng lặp game: bắn (hitscan, headshot, xuyên), sinh zombie, hàng rào, người sống sót, HUD
  zombie.js   # zombie: hitbox đầu/thân, di chuyển, tấn công, vẽ
  render.js   # vẽ nền, hàng rào, nhân vật
  ui.js       # các màn hình HTML: menu, ban ngày + cửa hàng, tạm dừng, thua
  audio.js    # hiệu ứng âm thanh, nhạc nền, nhịp tim (tổng hợp bằng WebAudio)
  save.js     # lưu / tải tiến trình
  main.js     # khởi tạo, co giãn màn hình 16:9, vòng lặp requestAnimationFrame
android/      # dự án Android do Capacitor tạo
```

## Ý tưởng mở rộng

- Thêm loại zombie (nhổ axit tấn công từ xa, zombie mặc giáp chỉ chết khi bắn đầu).
- Thêm vũ khí: lựu đạn, mìn đặt trước hàng rào, súng phun lửa.
- Thay hình vẽ bằng sprite và âm thanh thật (đặt file vào `public/`).
- Bảng xếp hạng, thành tích, chế độ chơi vô tận.
