# Barricade Nights 🧟

Game thủ thành chống zombie 2D (thể loại *barricade defense*): đứng sau hàng rào, ngắm bắn
từng đợt zombie mỗi đêm, ban ngày thì sửa rào, đi lục lọi, tìm người sống sót và mua súng mới.

Viết bằng **HTML5 Canvas + JavaScript thuần** (không dùng engine), đóng gói bằng **Vite** cho web
và **Capacitor** cho Android. Toàn bộ hình ảnh và âm thanh được vẽ / tổng hợp bằng code nên không
cần file tài nguyên nào.

## Cốt truyện

Dịch bệnh tràn qua thị trấn ven biển **Bến Sương**. Radio khẩn cấp báo tin: trực thăng cứu hộ sẽ hạ
cánh trên đồi Cao Vọng sau **10 đêm**. Bạn cố thủ trong căn nhà cũ của ông ngoại dưới chân đồi.

- Phim mở đầu và kết thúc, tin radio và nhật ký vào mỗi bình minh.
- 4 người sống sót có tên và kỹ năng riêng: **Lan** (y tá, sửa rào giỏi), **Ông Tư** (thợ săn,
  bắn chính xác), **Bảo** (thợ máy, hàng rào tự hồi phục), **Mai** (sinh viên, lục lọi được nhiều hơn).
- Đêm 10 có trăng máu và trùm **Kẻ Khổng Lồ**. Thắng chiến dịch sẽ mở **chế độ vô tận**
  (cứ 5 đêm lại có một Kẻ Khổng Lồ).

## Lối chơi

| | |
|---|---|
| **Ban đêm** | Zombie kéo đến từ bên phải. Chuột / chạm để ngắm & bắn. Bắn vào **đầu** gây x2.5 sát thương và thưởng thêm tiền. Độ bền hàng rào về 0 là thua. |
| **Ban ngày** | Chia 10 giờ cho: 🔨 sửa hàng rào, 🎒 lục lọi (tiền, đạn, đôi khi nhặt được súng), 🔦 tìm người sống sót (tối đa 4 người, tự động bắn hỗ trợ). Sau đó mua sắm ở cửa hàng. |
| **Vũ khí** | Súng lục (đạn vô hạn), Shotgun (nhiều viên, mạnh ở gần), Tiểu liên (tự động), Súng trường (xuyên 4 mục tiêu), Súng máy. |
| **Zombie** | Thường, chạy nhanh (từ đêm 2), bò (từ đêm 3, khó bắn đầu), gã khổng lồ (từ đêm 4), kẻ phun axit (từ đêm 6, phá rào từ xa), trùm Kẻ Khổng Lồ (đêm 10). |
| **Lựu đạn** | Nổ diện rộng. Phím `G`/`Space` ném vào vị trí con trỏ; trên điện thoại chạm nút lựu đạn rồi chạm vào chỗ muốn ném. |
| **Nâng cấp** | Gia cố hàng rào (tăng độ bền tối đa), luyện nạp đạn nhanh hơn, bộ sửa chữa. |

**Điều khiển:** chuột/chạm để bắn (súng tự động: giữ), `R` nạp đạn, `G` lựu đạn, `1–5` / `Q` `E` / con lăn để đổi
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
