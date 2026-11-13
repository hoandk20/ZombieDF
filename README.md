# Barricade Nights 🧟

Game thủ thành chống zombie 2D (thể loại *barricade defense*), chiến dịch 5 màn × 20 đêm (10 chương, 10 bản đồ, 100 đêm): đứng sau hàng rào, ngắm bắn
từng đợt zombie mỗi đêm, ban ngày thì sửa rào, đi lục lọi, tìm người sống sót và mua súng mới.

Viết bằng **HTML5 Canvas + JavaScript thuần** (không dùng engine), đóng gói bằng **Vite** cho web
và **Capacitor** cho Android. Toàn bộ hình ảnh và âm thanh được vẽ / tổng hợp bằng code nên không
cần file tài nguyên nào.

## Đồ hoạ pixel art

Mặc định cả cảnh được vẽ trên lưới **480×270** rồi phóng ×2 không làm mịn; chữ và bảng thông tin vẫn vẽ sắc nét.
Tắt/bật bằng nút **Pixel art** ở màn hình tiêu đề hoặc menu tạm dừng (`src/pixel.js`).

- **Zombie, nhân vật chính, đồng đội, hàng rào** là sprite pixel thật: mỗi khung hình được dựng ở độ phân giải pixel
  từ thiết kế có sẵn rồi làm sạch như pixel art vẽ tay (cạnh cứng, gom về 11–16 màu, viền tối 1 pixel), lưu đệm và
  dùng lại. Zombie có 8 khung đi, 4 khung tấn công, 5 khung ngã; nhân vật có 28 góc ngắm. Giữ đủ biến thể: zombie nữ,
  cụt tay chân, bò, đồ bảo hộ, vỏ băng, ăng-ten, túi trứng, trúng đạn chớp trắng, đông cứng.
- **Nền 10 bản đồ** được gom về bảng ~30 màu của từng bản đồ, pha chấm Bayer.

## Hiệu ứng pixel art

Vụ nổ (lựu đạn, súng phóng lựu, súng cối, giàn tên lửa, mìn, kẻ trương phình), axit khi kẻ phun axit chết,
tia lửa khi headshot và vụ nổ bóng tối khi trùm gục dùng thư viện **[pixelfx](https://github.com/patch-gg/pixelfx)**
(MIT, © Patch; một phần dựa trên hiệu ứng mã nguồn mở của Hugo Duprez / Sprite Fusion). Hiệu ứng được vẽ vào khung
480×270 rồi phóng ×2 không làm mịn (`src/pfx.js`), nên ra đúng chất pixel. Muốn thêm hiệu ứng khác: import nó trong
`src/pfx.js`, thêm vào `EFFECTS`, rồi gọi `game.pfx.spawn('tên', x, y, { palette, size })`.

## Ngôn ngữ

Game có **tiếng Anh (mặc định)** và **tiếng Việt**. Chọn bằng hai lá cờ ở góc trên bên phải màn hình tiêu đề;
lựa chọn được lưu lại cho lần sau. Toàn bộ giao diện, cốt truyện (`src/story_en.js`), tên súng, quái, đồng đội
và chữ hiện trong trận đều được dịch. Phần chuyển ngôn ngữ nằm ở `src/i18n.js`.

## Cốt truyện

Nhân vật chính là **Hoàn**, kỹ sư IT phụ trách máy chủ và mạng của đài phát thanh thị trấn Bến Sương: tóc đen dựng, luôn đeo
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
  ba giai đoạn (40). Kết thúc: Hoàn phát công thức vắc-xin trên mọi tần số.
- **Màn 3 · Chuyến hàng cuối cùng (đêm 41–60):** mang thùng chủng gốc vắc-xin về Bệnh viện Trung ương.
  **Chương 5 · Cao tốc Bắc Nam** (cầu vượt, xe bỏ hoang đang cháy) và **Chương 6 · Thủ đô** (nhà chọc trời,
  tháp truyền hình, ga tàu điện ngầm). Trùm: Quái Vật Cảng (45), Cỗ Máy Nghiền lao húc, da thép (50),
  Cỗ Máy Nghiền + Bạo Chúa Rừng (55), Nữ Hoàng Bầy Đàn đẻ bầy liên tục, 3 giai đoạn (60).
- **Màn 4 · Biến chủng (đêm 61–80):** vắc-xin ra đời nhưng một chủng mới không phản ứng với thuốc. Hoàn phát hiện
  trong bản ghi radio một tín hiệu 19 hertz lặp lại mỗi khi bầy đàn tràn lên.
  **Chương 7 · Nhà máy Thành Nam** (ống khói, bồn hóa chất) giữ dây chuyền vắc-xin thế hệ hai;
  **Chương 8 · Sân bay Bắc Thành** (đường băng, tháp không lưu) giữ cho những chuyến bay vắc-xin cất cánh,
  đồng thời dò ra nguồn tín hiệu: **Trạm Hải Đăng**. Trùm: Mẫu Thể Số 0 (65), **Lò Thiêu Sống** miễn lửa, gọi kẻ cháy (70),
  Lò Thiêu + Cỗ Máy Nghiền (75), **Kẻ Gặt Đường Băng** lao húc, gọi kẻ nhảy (80), Kẻ Gặt + Bạo Chúa Rừng (85).
- **Màn 5 · Tần số cuối cùng (đêm 81–100):** vượt **Chương 9 · Rừng tuyết biên giới** (tuyết rơi, rừng thông, xác máy bay)
  tới **Chương 10 · Trạm Hải Đăng** (ngọn hải đăng, cột ăng-ten khổng lồ, phòng máy chủ). Trùm: **Quỷ Tuyết** tự lành
  khi không bị bắn, miễn tê liệt (90), Quỷ Tuyết + Nữ Hoàng (95), **Kẻ Gọi Bầy** chữa lành cả bầy, gọi kẻ thu sóng,
  mọc giáp băng (100). Kết thúc: Hoàn viết lại phần mềm máy phát, đảo ngược tần số và ru ngủ bầy đàn khắp cả nước.
- **Mỗi chương là một khởi đầu mới:** đồng đội cũ ở lại phía sau (có lý do trong cốt truyện), công trình
  phòng thủ phải dựng lại. Mỗi chương có 2 đồng đội riêng, bộ công trình riêng và loại quái mới riêng.

| Chương | Đồng đội | Công trình phòng thủ | Quái mới |
|---|---|---|---|
| 1 · Bến Sương | Lan, Ông Tư | Lưỡi cưa quay, tháp súng máy, mìn, dây thép gai | Kẻ chạy, kẻ bò, gã khổng lồ, kẻ phun axit |
| 2 · Cảng Vọng Hải | Bảo, Mai | Tháp súng máy, tháp phun lửa, máy phóng khí độc, mìn, đèn pha | Cảnh sát bọc giáp, kẻ trương phình |
| 3 · Đập Hồng Sơn | Hùng, Linh | Bẫy điện, ổ bắn tỉa tự động, lưỡi cưa quay, dây thép gai, mìn | Chó nhiễm bệnh, kẻ rú, kẻ tái sinh |
| 4 · Căn cứ Hồng Sơn | Bác sĩ Khoa, Vy | Tháp súng máy, tháp phun lửa, súng cối tự động, ổ bắn tỉa tự động, đèn pha | Lính mang khiên |
| 5 · Cao tốc Bắc Nam | Tuấn, Ngọc | Súng cối tự động, giàn tên lửa, bẫy điện, dây thép gai, mìn | Kẻ nhảy (bật qua mìn), kẻ cháy (miễn nhiễm lửa) |
| 6 · Thủ đô | Đạt, Hà | Tháp Tesla, drone chiến đấu, giàn tên lửa, máy phóng khí độc, đèn pha | Kẻ phân thân, kẻ tàng hình |
| 7 · Nhà máy Thành Nam | Sơn (công trình rẻ hơn 20%), Thảo (+2 đồ hộp mỗi sáng) | Tháp phun lửa, khí độc, lưỡi cưa, tháp súng máy, mìn | Kẻ mặc đồ bảo hộ (chịu lửa, khí độc) |
| 8 · Sân bay Bắc Thành | Kiên (+2 giờ ban ngày), Nhi (+15% tiền thưởng) | Tháp súng máy, drone, giàn tên lửa, ổ bắn tỉa, đèn pha | Kẻ ấp trứng (đẻ con non liên tục) |
| 9 · Rừng tuyết biên giới | Quang (mìn, lưỡi cưa +40%), Tuyết (đồng đội bắn nhanh hơn 20%) | Bẫy điện, ổ bắn tỉa, súng cối, lưỡi cưa, dây thép gai, mìn | Kẻ băng giá (miễn tê liệt, sợ lửa) |
| 10 · Trạm Hải Đăng | Minh (công trình +25% sát thương), An (tinh nhuệ ít hơn một nửa) | Tháp Tesla, drone, giàn tên lửa, súng cối, khí độc, đèn pha | Kẻ thu sóng (chữa lành cả bầy) |

- 4 đồng đội mới ở màn 2: **Hùng** (cựu binh, súng máy), **Linh** (xạ thủ), **bác sĩ Khoa**, **Vy** (kỹ sư điện).
- Vũ khí mới ở màn 4: **Súng phun băng** (làm chậm, zombie đông cứng chịu thêm 30% sát thương) và **Súng điện từ**
  do Hoàn tự lắp (xuyên 14 con, xuyên giáp). Phím tắt: `0` và `-`.
- Cắt cảnh và nhật ký không nhắc tới đồng đội bạn chưa từng gặp.
- Thắng chiến dịch sẽ mở **chế độ vô tận** (cứ 5 đêm lại có một con trùm).

## Không khí sinh tồn

- **Cắt cảnh minh hoạ** cho mọi lần chuyển bản đồ và đoạn kết, vẽ động bằng canvas, khớp từng câu thoại.
- Đêm tối hơn, **đèn pin** của Hoàn rọi theo hướng ngắm, máy quay rung như cầm tay, hạt nhiễu phim,
  tro bụi bay, máu bắn lên màn hình khi rào bị đánh mạnh, màu nhạt dần khi rào sắp vỡ.
- Âm thanh xa xăm theo từng bản đồ: tiếng hét, chó tru, súng nổ xa, kính vỡ, còi báo động, còi tàu.
- **Đồ hộp**: cả nhóm ăn mỗi sáng; hết đồ ăn thì bị đói (nạp đạn chậm, bắn rung tay, đồng đội yếu đi).
- **Sự kiện buổi sáng** với lựa chọn khó: người lạ xin ăn, tiếng khóc trẻ con, thùng cứu trợ giữa đường…
- Zombie ghê rợn: **zombie nữ** tóc bết che mặt, váy rách; mắt sáng đồng tử đỏ, máu chảy từ mắt, vết thương
  hở lộ xương, mảng sọ lộ, cụt tay, gân tím, đầu giật co quắp, rỏ máu trên đường đi.

## Giữ cho mỗi đêm không nhàm chán

- **Dự báo đêm nay** hiện ở màn ban ngày. Các kiểu đêm đặc biệt:
  🔦 **Mất điện** (chỉ thấy quanh đèn pin và ánh lửa), 🪂 **Thả dù tiếp tế** (bắn trúng thùng hàng để nhận đồ),
  💰 **Kẻ mang hòm** (hạ trước khi nó bỏ chạy), ⚡ **Đêm tốc độ**, 🌊 **Đêm bầy đàn**.
- Kẻ thù mới xuất hiện dần: chó nhiễm bệnh (22), kẻ rú làm cả bầy chạy nhanh hơn (24), kẻ tái sinh đứng dậy nếu
  không bị bắn vỡ đầu hoặc thiêu cháy (27).
- Cứ 5 đêm một con trùm; vũ khí mới mở theo chương (súng bắn tỉa ở chương 3, súng điện ở chương 4).

## Độ khó và phòng thủ

- Chọn độ khó khi bắt đầu chiến dịch: **Dễ** (cân bằng bản đầu), **Thường** (đề xuất), **Khó**, **Ác mộng**.
  Độ khó tăng máu, sát thương, tốc độ, số lượng zombie, tần suất kéo đến theo bầy; giảm tiền thưởng;
  đồng đội khó tìm hơn và tốn nhiều khẩu phần hơn. Zombie cắn rào đau dần theo từng đêm.
- Tab **Phòng thủ** trong cửa hàng (mỗi chương chỉ bán một số loại, xem bảng ở trên):
  - **Tháp súng máy tự động** (tối đa 2, nâng cấp 3 cấp): tự bắn con gần nhất, bắn liên tục sẽ quá nhiệt.
  - **Bẫy điện**: phóng điện làm tê liệt mọi con trên tấm điện. **Tháp phun lửa**: đốt mọi con lại gần rào.
  - **Súng cối tự động**: nã đạn nổ vào chỗ đông nhất. **Tháp Tesla**: sét nhảy 5 con. **Drone chiến đấu**: bay và bắn.
  - **Lưỡi cưa quay** (mới): cứa chân mọi con sát rào, hay làm đứt chân. **Ổ bắn tỉa tự động** (mới): ưu tiên bắn con nhiều máu nhất, xuyên 3 con.
  - **Máy phóng khí độc** (mới): đám mây làm chậm và bào máu cả bầy. **Giàn tên lửa** (mới): phóng cả loạt tên lửa nhỏ vào những con ở xa.
  - **Mìn**: tự rải trước rào mỗi đêm, nổ khi zombie dẫm lên; mìn chưa nổ được thu lại.
  - **Dây thép gai** (2 cấp): làm chậm và cứa zombie sát hàng rào.
  - **Đèn pha chiến trường**: nhìn rõ trong đêm mất điện.

## Cân bằng vũ khí

- Vũ khí sát thương lan (súng phóng lựu, lựu đạn, mìn, súng điện, súng cối, tháp Tesla) đã được giảm:
  sát thương giảm mạnh ở rìa vụ nổ, trùm và gã khổng lồ chịu nổ tốt hơn, lựu đạn đắt hơn và mang tối đa 4 quả.
- Súng phun lửa có tầm bắn trung bình (420px) thay vì sát rào.
- **Mỗi màn bắt đầu lại tay trắng:** súng (chỉ còn súng lục), đạn, tiền ($300), lựu đạn, đồ hộp, nâng cấp vũ khí,
  đồng đội, công trình phòng thủ và hàng rào đều đặt lại.
- **Mức đe doạ thích nghi:** hàng rào càng ít bị xây xước, đêm sau zombie càng nhiều máu, đông và dồn dập hơn;
  suýt thua thì bầy đàn nới tay. Từ đêm 8 có **zombie tinh nhuệ** (hào quang đỏ, gấp đôi máu, thưởng gấp đôi).
- **Đẩy lùi theo khối lượng:** zombie càng to càng ít bị đẩy lùi; bị bắn liên tục thì kháng dần.

## Đội hình đồng đội

- Đồng đội khó tìm: mỗi người chỉ xuất hiện từ một đêm nhất định (Lan từ đêm 2, Ông Tư 4, Bảo 6, Mai 8, Hùng 22,
  Linh 24, Khoa 27, Vy 31), tỉ lệ tìm thấy thấp và giảm khi nhóm đông. Mỗi sáng tốn **khẩu phần** cho cả nhóm.
- Tối đa **4 người trên hàng rào**; người còn lại **ở trại** và mỗi sáng kiếm thêm tiền.
- Đồng đội **lên cấp** (★★★) khi tự tay hạ zombie: bắn mạnh hơn, nhanh hơn.
- Khi hàng rào dưới 35% hoặc kẻ trương phình nổ sát rào, đồng đội có thể **bị thương** và phải nghỉ vài đêm
  (Lan và bác sĩ Khoa giúp hồi phục nhanh hơn). Vào tab **Đồng đội** để đưa người khác lên thay.

## Lối chơi

| | |
|---|---|
| **Ban đêm** | Zombie kéo đến từ bên phải. Chuột / chạm để ngắm & bắn. Bắn vào **đầu** gây x2.5 sát thương và thưởng thêm tiền. Độ bền hàng rào về 0 là thua. |
| **Ban ngày** | Chia 10 giờ cho: 🔨 sửa hàng rào, 🎒 lục lọi (tiền, đạn, đôi khi nhặt được súng), 🔦 tìm người sống sót (tối đa 4 người, tự động bắn hỗ trợ). Sau đó mua sắm ở cửa hàng. |
| **Vũ khí** | Súng lục (đạn vô hạn), Shotgun (nhiều viên, mạnh ở gần), Tiểu liên (tự động), Súng trường (xuyên 4 mục tiêu), Súng máy. Chương 2 mở thêm Súng phun lửa (đốt cháy, xuyên giáp) và Súng phóng lựu (đạn nổ); chương 3 Súng bắn tỉa (xuyên 6), chương 4 Súng điện (sét lan 5 con, làm tê liệt). |
| **Sức mạnh theo giá** | Súng càng đắt càng mạnh: Súng lục < Shotgun < Tiểu liên < Súng trường < Súng máy < Súng phun lửa < Súng phóng lựu < Súng bắn tỉa < Súng điện < Súng phun băng < Súng điện từ. |
| **Súng về kho dần** | Cửa hàng không bán đủ súng ngay từ đầu. Màn 1: Shotgun đêm 2, Tiểu liên đêm 4, Súng trường đêm 7, Súng máy đêm 12, Súng phun lửa đêm 15, Súng phóng lựu đêm 17; Súng bắn tỉa từ màn 2 (đêm 24), Súng điện đêm 33; Súng phun băng từ màn 4 (đêm 65), Súng điện từ đêm 74. Mỗi màn mới bắt đầu tay trắng nên súng lại về kho dần theo đêm của màn (nhanh hơn màn 1). Hai khẩu sắp về được hiện trước kèm đêm mở bán. |
| **Đổi chỗ mỗi chương** | Sang chương mới thì hàng rào phải dựng lại từ đầu (mất hết cấp gia cố), nhưng 40% số tiền đã đầu tư vào hàng rào được trả lại dưới dạng vật liệu. Hai đêm đầu của chương thứ hai trong mỗi màn bầy đàn đến thưa hơn. |
| **Zombie** | Thường, chạy nhanh (từ đêm 2), bò (từ đêm 3, khó bắn đầu), gã khổng lồ (từ đêm 4), kẻ phun axit (từ đêm 6, phá rào từ xa), cảnh sát bọc giáp (từ đêm 11, mũ chặn headshot cho tới khi vỡ), kẻ trương phình (từ đêm 12, phát nổ khi chết), trùm Kẻ Khổng Lồ (đêm 10, 15) và Quái Vật Cảng (đêm 20). |
| **Quái tăng dần** | Đêm đầu chỉ có xác sống thường, mỗi đêm thêm dần loại mới; loại mới xuất hiện lác đác rồi đông dần. Mỗi màn bắt đầu lại chỉ với xác sống: các loại cơ bản và loại của màn ngay trước quay lại dần trong 10 đêm đầu, loại mới của chương xuất hiện đúng đêm của nó. Nhịp ra quân đều đặn suốt đêm thay vì dồn cả đợt vào nửa phút đầu. |
| **Cắt rời chi** | Bắn vào tay hoặc chân đủ đau thì chi đó rụng ra (bắn chân gây ít sát thương hơn nhưng rất dễ làm đứt chân), văng xuống đất và nằm lại. Mất một chân: khập khiễng, chậm hẳn. Mất cả hai chân: đổ sấp, lết bằng tay. Mất tay: cào hàng rào yếu đi. Nổ lớn có thể xé rời chi. Không áp dụng cho trùm. |
| **Lựu đạn** | Nổ diện rộng. Phím `G`/`Space` ném vào vị trí con trỏ; trên điện thoại chạm nút lựu đạn rồi chạm vào chỗ muốn ném. |
| **Đèn pin** | Không có sẵn. Mua "Đèn pin gắn súng" ($250, tab Trang bị) để có luồng sáng theo hướng ngắm và nhìn xa hơn trong đêm mất điện. Mất khi sang màn mới. |
| **Nâng cấp** | Gia cố hàng rào (tăng độ bền tối đa), luyện nạp đạn nhanh hơn, đạn xuyên giáp (+8% sát thương mỗi cấp). Hàng rào chỉ sửa được bằng giờ ban ngày (không mua bộ sửa chữa bằng tiền). |

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
