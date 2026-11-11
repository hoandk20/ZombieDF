// Cốt truyện: Hoàn, kỹ sư IT phụ trách máy chủ và mạng của đài phát thanh Bến Sương.
// Chương 1 (đêm 1–10): giữ nhà dưới chân đồi chờ trực thăng.
// Chương 2 (đêm 11–20): giữ cầu tàu Cảng Vọng Hải chờ tàu sơ tán.

export const HERO_NAME = 'HOÀN';

export const INTRO = [
  { who: 'RADIO', shot: 'townBurning', text: '…rè… rè… Đây là Đài Phát Thanh Khẩn Cấp vùng duyên hải. Dịch bệnh đã tràn qua thị trấn Bến Sương.' },
  { who: 'HOÀN', shot: 'radioRoom', text: 'Tôi là Hoàn, dân IT, lo máy chủ và đường truyền cho đài phát thanh thị trấn. Ba ngày nay mạng sập hết, tôi chỉ còn bộ đàm và những cuộc gọi cầu cứu tắt dần.' },
  { who: 'RADIO', shot: 'townBurning', text: 'Người nhiễm bệnh mất hết lý trí và tấn công mọi thứ còn sống. Chúng mạnh nhất về đêm. Không được ra ngoài sau khi mặt trời lặn.' },
  { who: 'RADIO', shot: 'radioRoom', text: 'Trực thăng cứu hộ sẽ hạ cánh trên đồi Cao Vọng sau MƯỜI đêm nữa. Ai còn nghe được… hãy cố thủ. Hãy sống sót.' },
  { who: 'HOÀN', shot: 'grandpaHouse', text: 'Căn nhà cũ của ông ngoại nằm ngay chân đồi. Vài bao cát, mấy tấm ván, khẩu súng lục và hai quả lựu đạn trong rương gỗ.' },
  { who: 'HOÀN', shot: 'grandpaHouse', text: 'Tai nghe vẫn đeo trên cổ, laptop nhét trong ba lô. Chừng nào radio còn phát, chừng đó tôi còn hy vọng. Mặt trời vừa lặn.' },
];

// Câu dẫn hiện ở đầu mỗi đêm
export const NIGHT_TITLES = {
  1: 'Đêm đầu tiên. Đừng để chúng chạm vào hàng rào.',
  2: 'Có những bước chân nhanh hơn trong bóng tối.',
  3: 'Nhìn xuống thấp. Có thứ đang bò.',
  4: 'Mặt đất rung lên theo từng bước chân nặng nề.',
  5: 'Đã qua nửa chặng đường.',
  6: 'Mùi axit cháy khét trong gió.',
  7: 'Bão đến. Sấm chớp xé ngang bầu trời.',
  8: 'Radio im lặng. Chỉ còn bạn và bóng đêm.',
  9: 'Đêm áp chót. Chúng đông hơn bao giờ hết.',
  10: 'Trăng máu. Kẻ Khổng Lồ đang đến.',
  11: 'Cảng Vọng Hải. Sau lưng là biển, trước mặt là cả một thành phố.',
  12: 'Có những cái xác phình to như sắp vỡ. Đừng để chúng tới gần.',
  13: 'Tiếng khiên va vào nhau. Đội cơ động năm xưa giờ đứng về phía bên kia.',
  14: 'Sương biển dày đặc. Hãy nghe tiếng rên mà bắn.',
  15: 'Trăng máu lần thứ hai. Một Kẻ Khổng Lồ khác lội qua bãi container.',
  16: 'Bão biển ập vào. Sóng đánh rung cả cầu tàu.',
  17: 'Tàu bị chậm. Thêm một đêm dài.',
  18: 'Pháo sáng của tàu đã thấy ở đường chân trời.',
  19: 'Chúng biết. Cả thành phố đang đổ về cảng.',
  20: 'Đêm cuối cùng của màn 1. Thứ gì đó đang trồi lên từ lòng cảng.',
  21: 'Đập Hồng Sơn. Phía sau cánh cổng là hy vọng của cả đất nước.',
  22: 'Tiếng sủa vọng ra từ rừng thông. Chúng chạy bằng bốn chân.',
  23: 'Máy phát điện của đập hỏng. Đêm nay tối đen như mực.',
  24: 'Một tiếng rú xé tai. Cả bầy bỗng chạy nhanh hơn.',
  25: 'Trăng máu trên núi. Một Kẻ Khổng Lồ lội qua lòng hồ.',
  26: 'Một con mang theo hòm đồ của đoàn tiếp tế. Đừng để nó chạy mất.',
  27: 'Có những cái xác ngã xuống rồi lại đứng dậy.',
  28: 'Sương núi và bão. Máy bay vẫn cố thả hàng.',
  29: 'Cả cánh rừng đang đổ xuống đập.',
  30: 'Mặt đất rung chuyển. Bạo Chúa Rừng đã thức giấc.',
  31: 'Căn cứ Hồng Sơn. Đèn pha quét qua hàng rào thép gai.',
  32: 'Chúng cắn đứt dây điện. Toàn căn cứ chìm trong bóng tối.',
  33: 'Kẻ mang hòm lại xuất hiện, lần này là thùng mẫu vắc-xin.',
  34: 'Bão trên núi. Tiếp tế rơi khắp sân bay.',
  35: 'Trăng máu. Hai Kẻ Khổng Lồ cùng lúc.',
  36: 'Chúng đánh hơi thấy phòng thí nghiệm. Nhanh hơn bao giờ hết.',
  37: 'Lại mất điện. Có tiếng sủa trong bóng tối.',
  38: 'Bầy đàn lớn nhất từ trước đến nay.',
  39: 'Vắc-xin sắp xong. Chỉ cần thêm một đêm.',
  40: 'Đêm cuối của màn 2. Mẫu Thể Số 0 đã thoát khỏi phòng cách ly.',
  41: 'Cao tốc Bắc Nam, km 112. Hàng rào bằng xác xe tải.',
  42: 'Có những bóng người bật nhảy qua nóc xe. Mìn và dây thép gai không giữ được chúng.',
  43: 'Đèn cao tốc tắt hết. Chỉ còn ánh lửa từ những chiếc xe đang cháy.',
  44: 'Kẻ cháy: chúng bốc lửa mà vẫn bước tới. Súng phun lửa vô dụng.',
  45: 'Trăng máu trên cao tốc. Quái Vật Cảng thứ hai lết qua đống xe.',
  46: 'Mưa và bầy đàn. Cả một thị trấn đang di cư về phía nam.',
  47: 'Mất điện, và tiếng động cơ trên trời. Không quân vẫn cố thả hàng.',
  48: 'Kẻ mang hòm chạy dọc dải phân cách. Lần này là thùng nhiên liệu.',
  49: 'Bão. Còn một đêm nữa là tới cửa ngõ thủ đô.',
  50: 'Mặt đường rung chuyển. Cỗ Máy Nghiền lao tới như xe tăng.',
  51: 'Thủ đô. Những tòa nhà chọc trời tắt đèn đứng nhìn xuống.',
  52: 'Một con vỡ đôi khi gục xuống. Rồi hai con nhỏ bò ra.',
  53: 'Bầy đàn tràn lên từ ga tàu điện ngầm.',
  54: 'Có thứ gì đó chỉ hiện ra khi đã ở rất gần.',
  55: 'Trăng máu. Cỗ Máy Nghiền và Bạo Chúa Rừng cùng lúc.',
  56: 'Mất điện toàn thành phố. Chúng chạy nhanh hơn trong bóng tối.',
  57: 'Tiếp tế rơi khắp quảng trường. Kẻ mang hòm lại xuất hiện.',
  58: 'Bầy đàn lớn nhất từ trước đến nay. Cả thủ đô đang thức giấc.',
  59: 'Mất điện. Bệnh viện Trung ương đã dọn xong đường. Chỉ cần thêm một đêm.',
  60: 'Nữ Hoàng Bầy Đàn trồi lên từ lòng đất.',
  61: "Nhà máy Thành Nam. Ống khói đã nguội, nhưng bóng tối thì không.",
  62: "Có những bộ đồ bảo hộ màu vàng đang bước tới.",
  63: "Kho hóa chất bốc khói. Đừng để lửa lan vào hàng rào.",
  64: "Tiếp tế rơi xuống mái nhà xưởng.",
  65: "Trăng máu. Một thứ cũ quay lại từ thủ đô.",
  66: "Chúng chạy nhanh như ngửi thấy mùi thuốc.",
  67: "Mất điện. Dây chuyền dừng. Chỉ còn tiếng rên ngoài cổng.",
  68: "Cả một bầy đàn tràn qua bãi xe tải.",
  69: "Kẻ mang hòm lại xuất hiện, lần này đeo mặt nạ phòng độc.",
  70: "Lò thiêu của nhà máy đang bước ra ngoài.",
  71: "Sân bay Bắc Thành. Đường băng dài và trống trải.",
  72: "Có những con mang túi trứng trên lưng.",
  73: "Mất điện ở tháp không lưu. Kẻ mang hòm chạy dọc đường băng.",
  74: "Bầy đàn kéo đến từ phía nhà ga.",
  75: "Hai con trùm. Một đêm dài trên đường băng.",
  76: "Tiếp tế rơi khắp sân đỗ.",
  77: "Mất điện. Chúng chạy nhanh hơn trong bóng tối.",
  78: "Bầy đàn lớn nhất từ khi rời thủ đô.",
  79: "Chuyến bay cuối cùng đã nạp đầy nhiên liệu.",
  80: "Có thứ gì đó đang chạy trên đường băng, nhanh hơn cả máy bay.",
  81: "Rừng tuyết biên giới. Hơi thở đông lại trên nòng súng.",
  82: "Có những con phủ băng, da cứng như vỏ đá.",
  83: "Bão tuyết. Không nhìn thấy gì quá ba mươi mét.",
  84: "Tiếp tế rơi xuống giữa rừng thông.",
  85: "Hai con trùm. Tuyết nhuộm đỏ cả bìa rừng.",
  86: "Mất điện. Chỉ còn ánh lửa trại.",
  87: "Một bầy đàn đi qua rừng như dòng sông đóng băng.",
  88: "Chúng chạy trên mặt băng. Kẻ mang hòm lại xuất hiện.",
  89: "Mất điện. Phía xa, ánh đèn hải đăng quét qua mặt biển.",
  90: "Mặt hồ băng nứt toác. Thứ dưới đó đã thức dậy.",
  91: "Trạm Hải Đăng. Ăng-ten vẫn đang phát.",
  92: "Có những con mang ăng-ten trên đầu. Chúng chữa lành cho cả bầy.",
  93: "Bầy đàn bị tín hiệu lùa tới như một đàn cừu.",
  94: "Chúng chạy theo nhịp tín hiệu, nhanh hơn mọi đêm.",
  95: "Hai con trùm. Trạm rung lên dưới chân.",
  96: "Mất điện toàn trạm. Kẻ mang hòm chạy vào đường hầm.",
  97: "Bầy đàn lớn nhất từ trước tới nay.",
  98: "Mất điện. Tín hiệu mạnh hơn bao giờ hết.",
  99: "Bản cập nhật cuối cùng đã sẵn sàng. Chỉ cần thêm một đêm.",
  100: "Đêm cuối cùng. Kẻ Gọi Bầy rời khỏi phòng phát sóng.",
};

// Tin radio / nhật ký vào mỗi bình minh, sau khi sống sót qua đêm n
export const DAWN_LOG = {
  1: [
    { who: 'NHẬT KÝ', text: 'Sống sót qua đêm đầu. Tay vẫn còn run. Những thứ ngoài kia từng là hàng xóm của mình.' },
    { who: 'RADIO', text: 'Nếu bạn còn nghe được: hãy tìm người sống sót quanh khu vực. Càng đông người, càng nhiều tay súng.' },
  ],
  2: [
    { who: 'RADIO', text: 'Cảnh báo: một số người nhiễm bệnh di chuyển rất nhanh. Có vẻ chúng từng là vận động viên ở sân vận động thị trấn.' },
    { who: 'NHẬT KÝ', text: 'Cần súng tốt hơn. Cửa hàng săn bắn ở phố chợ có thể còn gì đó.' },
  ],
  3: [
    { who: 'RADIO', text: 'Có những kẻ bò sát đất. Đầu chúng rất thấp, hãy hạ nòng súng khi chúng lại gần hàng rào.' },
    { who: 'NHẬT KÝ', text: 'Hàng rào kêu cót két cả đêm. Nếu muốn nó trụ đến ngày thứ mười thì phải gia cố.' },
  ],
  4: [
    { who: 'RADIO', text: 'Người nhiễm bệnh lâu ngày bắt đầu đột biến: to lớn, chịu đòn rất khỏe. Hãy dùng lựu đạn hoặc súng hạng nặng.' },
    { who: 'NHẬT KÝ', text: 'Tối qua có một con cao gần hai mét rưỡi. Mất gần hết băng đạn mới hạ được.' },
  ],
  5: [
    { who: 'RADIO', text: 'Trực thăng cứu hộ đã cất cánh từ hạm đội ngoài khơi. Đường bay gặp bão nhưng vẫn đúng lịch. Năm đêm nữa.' },
    { who: 'HOÀN', text: 'Tôi chế lại ăng-ten trên mái nhà bằng dây mạng và một bộ phát wifi cũ. Tín hiệu rõ hơn hẳn. Năm đêm. Đã đi được nửa đường.' },
  ],
  6: [
    { who: 'RADIO', text: 'Báo cáo mới: một chủng phun axit ăn mòn từ xa. Chúng đứng ngoài tầm với và phá hàng rào. Hạ chúng trước tiên.' },
    { who: 'NHẬT KÝ', text: 'Có những vết cháy xèo xèo trên ván gỗ. Mùi kinh khủng.' },
  ],
  7: [
    { who: 'RADIO', text: '…rè… bão lớn… giữ… vững… rè…' },
    { who: 'NHẬT KÝ', text: 'Mưa xối xả cả đêm. Mỗi tia chớp lại thấy thêm hàng chục cái bóng ngoài kia.' },
  ],
  8: [
    { who: 'RADIO', text: '…………' },
    { who: 'HOÀN', text: 'Radio không còn phát gì nữa. Tôi tháo tai nghe ra rồi lại đeo vào. Chỉ là do bão thôi.' },
  ],
  9: [
    { who: 'RADIO', text: '…rè… Đây là Phi đội Cứu hộ Hải Âu. Chúng tôi sẽ đến đồi Cao Vọng lúc bình minh sau đêm mai. Giữ vững!' },
    { who: 'RADIO', text: 'Cảnh báo: vệ tinh ghi nhận một cá thể khổng lồ đang tiến về phía đồi. Nó cao gấp đôi người thường.' },
    { who: 'NHẬT KÝ', text: 'Một đêm nữa thôi. Chỉ một đêm nữa.' },
  ],
  11: [
    { who: 'HOÀN', text: 'Cầu tàu số 3 trụ được đêm đầu. Mùi muối, mùi dầu máy, và mùi xác chết.' },
    { who: 'RADIO', text: 'Tàu Bình Minh gọi cảng Vọng Hải. Chúng tôi còn chín ngày hải trình. Hãy giữ cầu tàu cho chúng tôi cập bến.' },
  ],
  12: [
    { who: 'RADIO', text: 'Cảnh báo: chủng trương phình phát nổ khi bị tiêu diệt. Bắn chúng khi còn ở xa, vụ nổ sẽ quét sạch những con xung quanh.' },
    { who: 'NHẬT KÝ', text: 'Một con nổ ngay trước hàng rào. Ba tấm tôn bay mất. May mà không ai bị thương.' },
  ],
  13: [
    { who: 'RADIO', text: 'Đội cảnh sát cơ động từng giữ cảng đã bị nhiễm. Mũ giáp chặn được đạn vào đầu, cho đến khi vỡ. Lửa và chất nổ xuyên qua giáp.' },
    { who: 'HOÀN', text: 'Kho vũ khí của cảng còn mở. Có súng phun lửa và súng phóng lựu, nếu đủ tiền đổi với ông chủ kho.' },
  ],
  14: [
    { who: 'NHẬT KÝ', need: ['mai'], alt: 'Sương dày đến mức không thấy nổi mũi súng. Tôi bắn theo tiếng rên.', text: 'Sương dày đến mức không thấy nổi mũi súng. Tôi bắn theo tiếng rên. Mai nói tôi bắn trúng nhiều hơn tôi nghĩ.' },
    { who: 'RADIO', text: 'Tàu Bình Minh: chúng tôi đã qua eo biển. Sáu ngày nữa.' },
  ],
  15: [
    { who: 'HOÀN', text: 'Con khổng lồ thứ hai ngã xuống giữa bãi container. Nó rơi xuống nước mà không nổi lên.' },
    { who: 'RADIO', text: 'Thủy âm của tàu ghi nhận chuyển động lớn dưới đáy cảng. Có thể chỉ là xác tàu cũ. Có thể không.' },
  ],
  16: [
    { who: 'NHẬT KÝ', text: 'Bão biển. Sóng tràn lên cầu tàu cuốn theo cả xác lẫn sống. Chúng vẫn bò lên được.' },
    { who: 'RADIO', text: '…Bình Minh… neo tránh bão… chậm một ngày… rè…' },
  ],
  17: [
    { who: 'HOÀN', text: 'Tôi khôi phục lại hệ thống liên lạc của cảng, cài lại phần mềm từ một chiếc máy tính trong phòng điều độ. Giờ chúng tôi nói chuyện được với thuyền trưởng mỗi sáng.' },
    { who: 'RADIO', text: 'Thuyền trưởng tàu Bình Minh: ba đêm nữa. Trên tàu còn chỗ cho tất cả các bạn.' },
  ],
  18: [
    { who: 'RADIO', text: 'Chúng tôi thấy ánh lửa của các bạn từ ngoài khơi. Hai đêm nữa thôi. Đừng bỏ cuộc.' },
    { who: 'NHẬT KÝ', need: ['bao'], alt: 'Mười tám ngày. Tôi nói chuyện với cái radio nhiều hơn tôi muốn thừa nhận.', text: 'Lần đầu tiên sau mười tám ngày, cả nhóm cùng cười. Bảo kể chuyện hồi sửa tàu đánh cá.' },
  ],
  19: [
    { who: 'RADIO', text: 'Cảnh báo khẩn: thủy âm ghi nhận một cá thể khổng lồ đang di chuyển dưới nước về phía cầu tàu. Nó lớn hơn mọi thứ chúng tôi từng thấy.' },
    { who: 'HOÀN', text: 'Đêm cuối. Tôi chỉnh tai nghe, kiểm tra từng băng đạn. Dù có chuyện gì, sáng mai chúng tôi sẽ lên tàu.' },
  ],
  21: [
    { who: 'RADIO', text: 'Trạm Hồng Sơn gọi đoàn Bình Minh. Máy bay vận tải sẽ thả tiếp tế. Bắn vào thùng hàng khi nó còn lơ lửng để mở dù sớm.' },
    { who: 'HOÀN', text: 'Đêm đầu trên đập. Gió núi lạnh buốt. Dưới chân là cả một hồ nước đen ngòm.' },
  ],
  22: [
    { who: 'RADIO', text: 'Cảnh báo: chó nghiệp vụ của đồn biên phòng đã bị nhiễm. Chúng rất nhanh và thấp, hãy hạ nòng súng.' },
    { who: 'NHẬT KÝ', need: ['hung'], alt: 'Chúng từng là chó nghiệp vụ. Trên cổ vẫn còn vòng có số hiệu.', text: 'Hùng nói anh từng huấn luyện mấy con chó đó. Anh không nói thêm gì nữa.' },
  ],
  23: [
    { who: 'HOÀN', need: ['vy'], alt: 'Mất điện cả đêm. Tôi chỉ bắn theo vệt sáng của đèn pin và tiếng rên.', text: 'Mất điện cả đêm. Tôi chỉ bắn theo vệt sáng của đèn pin và tiếng rên. Vy hứa sẽ dựng đèn pha nếu tìm được máy phát.' },
    { who: 'RADIO', text: 'Bác sĩ Khoa: mẫu vắc-xin đầu tiên đang nuôi cấy. Chúng tôi cần mười bảy ngày nữa.' },
  ],
  24: [
    { who: 'RADIO', text: 'Chủng mới: Kẻ rú. Tiếng hét của nó kích động cả bầy, làm chúng chạy nhanh hơn. Hạ nó trước tiên.' },
    { who: 'NHẬT KÝ', text: 'Tiếng rú đó vẫn còn văng vẳng trong tai, kể cả khi đã tháo tai nghe.' },
  ],
  25: [
    { who: 'HOÀN', text: 'Kẻ Khổng Lồ thứ ba. Nó gục ngay trên mép đập rồi rơi xuống lòng hồ.' },
    { who: 'RADIO', text: 'Một đoàn tiếp tế bị phục kích gần cầu treo. Có kẻ đã cướp hòm vật tư. Nếu thấy nó, đừng để nó chạy thoát.' },
  ],
  26: [
    { who: 'NHẬT KÝ', need: ['linh'], alt: 'Tối qua có một con khoác ba lô quân dụng, chạy vòng vòng như đang trêu tôi. Lần sau tôi sẽ không bắn trượt.', text: 'Tối qua có một con khoác ba lô quân dụng, chạy vòng vòng như đang trêu chúng tôi. Linh nói lần sau cô sẽ không bắn trượt.' },
    { who: 'RADIO', text: 'Bác sĩ Khoa: tiến độ 40%. Các bạn đang làm rất tốt.' },
  ],
  27: [
    { who: 'RADIO', text: 'Cảnh báo: chủng tái sinh. Chúng đứng dậy sau khi gục, trừ khi bị bắn vỡ đầu hoặc thiêu cháy.' },
    { who: 'HOÀN', text: 'Tôi đếm được ba con đứng dậy hai lần. Từ giờ chỉ nhắm vào đầu.' },
  ],
  28: [
    { who: 'NHẬT KÝ', need: ['hung'], alt: 'Sương mù và bão. Ba thùng tiếp tế rơi trúng đập, một thùng rơi xuống hồ.', text: 'Sương mù và bão. Ba thùng tiếp tế rơi trúng đập, một thùng rơi xuống hồ. Hùng lặn xuống vớt được nửa thùng đạn.' },
    { who: 'RADIO', text: 'Vệ tinh ghi nhận một đàn rất lớn đang di chuyển qua rừng thông về phía đập.' },
  ],
  29: [
    { who: 'RADIO', text: 'Đàn lớn đó có một con đầu đàn. Nó to như một ngôi nhà và đi đến đâu, chó hoang theo đến đó.' },
    { who: 'HOÀN', text: 'Đêm mai là đêm thứ mười trên đập. Rồi chúng tôi sẽ rút vào căn cứ trong lòng núi.' },
  ],
  31: [
    { who: 'HOÀN', text: 'Căn cứ Hồng Sơn có tường thép, đèn pha và cả một phòng máy chủ quân sự. Lần đầu tiên tôi được chạm vào một hệ thống như thế.' },
    { who: 'RADIO', text: 'Kho vũ khí căn cứ đã mở: súng điện thử nghiệm. Đắt, nhưng một tia sét có thể hạ năm con.' },
  ],
  32: [
    { who: 'NHẬT KÝ', need: ['vy'], alt: 'Chúng gặm đứt cáp điện chính. Tôi nối tạm bằng dây mạng đến tận sáng.', text: 'Chúng gặm đứt cáp điện chính. Vy sửa đến tận sáng. Tay cô bị bỏng nhưng vẫn cười.' },
    { who: 'RADIO', text: 'Bác sĩ Khoa: tiến độ 65%. Mẫu ổn định ở nhiệt độ thường.' },
  ],
  33: [
    { who: 'HOÀN', text: 'Kẻ mang hòm lần này đeo thùng mẫu lạnh của phòng thí nghiệm. Khoa suýt ngất khi thấy nó.' },
    { who: 'RADIO', text: 'Mỗi thùng mẫu là một tuần nghiên cứu. Hãy bảo vệ chúng bằng mọi giá.' },
  ],
  34: [
    { who: 'NHẬT KÝ', need: ['vy'], alt: 'Bão. Tiếp tế rơi khắp sân bay. Tôi soi đèn pin đi nhặt từng thùng hàng.', text: 'Bão. Tiếp tế rơi khắp sân bay. Vy dựng đèn pha trên tháp canh soi từng thùng hàng.' },
    { who: 'RADIO', text: 'Cảnh báo: hai cá thể khổng lồ đang leo lên đường núi. Cùng lúc.' },
  ],
  35: [
    { who: 'HOÀN', text: 'Hai con. Tôi không nghĩ chúng tôi sẽ qua được. Nhưng chúng tôi vẫn ở đây.' },
    { who: 'RADIO', text: 'Bác sĩ Khoa: tiến độ 85%. Năm đêm nữa.' },
  ],
  36: [
    { who: 'NHẬT KÝ', text: 'Chúng chạy nhanh như bị điên. Có lẽ chúng ngửi thấy mùi phòng thí nghiệm. Hoặc mùi hy vọng.' },
    { who: 'RADIO', text: 'Hoàn, cậu có thể cấu hình lại hệ thống phát sóng của căn cứ để phủ toàn quốc không? Khi vắc-xin xong, mọi người cần biết công thức.' },
  ],
  37: [
    { who: 'HOÀN', text: 'Tôi làm được. Mười năm làm IT, đây là lần đầu việc của tôi cứu được người. Chỉ cần căn cứ còn điện vào đêm cuối.' },
    { who: 'NHẬT KÝ', text: 'Lại mất điện. Lại tiếng sủa trong bóng tối. Không ai ngủ được.' },
  ],
  38: [
    { who: 'RADIO', text: 'Bác sĩ Khoa: tiến độ 97%. Nhưng có chuyện rồi. Mẫu Thể Số 0, bệnh nhân đầu tiên mà chúng tôi giữ lại để nghiên cứu, đang phá cửa phòng cách ly.' },
    { who: 'HOÀN', text: 'Hai đêm nữa. Tôi đã đi từ Bến Sương đến tận đây. Không thể dừng lại bây giờ.' },
  ],
  39: [
    { who: 'RADIO', text: 'Vắc-xin hoàn tất lúc bình minh. Mẫu Thể Số 0 đã thoát ra ngoài. Nó sẽ đến tìm các bạn.' },
    { who: 'HOÀN', text: 'Tôi chỉnh tai nghe lần cuối. Đêm mai, hoặc là tất cả, hoặc là không gì cả.' },
  ],
  41: [
    { who: 'HOÀN', text: 'Đêm đầu trên cao tốc. Thùng mẫu lạnh nằm trong cabin, đèn báo nhiệt độ vẫn xanh.' },
    { who: 'RADIO', text: 'Không quân gọi người mang mẫu: chúng tôi sẽ thả tiếp tế khi có thể. Đường bay rất nguy hiểm.' },
  ],
  42: [
    { who: 'RADIO', text: 'Cảnh báo: chủng nhảy. Chúng bật qua mìn và dây thép gai, đáp thẳng xuống hàng rào. Hạ chúng khi còn đang lao tới.' },
    { who: 'NHẬT KÝ', need: ['tuan'], alt: 'Cao tốc dài như không có điểm cuối. Mỗi trạm xăng bỏ hoang là một canh bạc.', text: 'Tuấn nói anh đã chạy tuyến này hai mươi năm. Anh biết từng trạm xăng còn dầu.' },
  ],
  43: [
    { who: 'HOÀN', text: 'Mất điện cả đêm. Những chiếc xe cháy là thứ ánh sáng duy nhất. Tôi bắn vào những cái bóng chạy qua ngọn lửa.' },
    { who: 'RADIO', text: 'Kho quân sự ở km 140 còn súng cối tự động. Nếu đủ tiền, đổi được một khẩu.' },
  ],
  44: [
    { who: 'RADIO', text: 'Chủng mới: Kẻ cháy. Chúng không sợ lửa, đốt luôn cả hàng rào. Dùng đạn thường hoặc chất nổ.' },
    { who: 'RADIO', text: 'Cảnh báo: một con khổng lồ đang lết dọc cao tốc. Nó to như con ở cảng Vọng Hải.' },
  ],
  45: [
    { who: 'HOÀN', need: ['ngoc'], alt: 'Quái Vật Cảng thứ hai gục xuống giữa đống xe. Tôi ghi lại tất cả vào laptop. Sau này người ta cần biết chuyện gì đã xảy ra.', text: 'Quái Vật Cảng thứ hai gục xuống giữa đống xe. Ngọc quay lại tất cả. "Sau này người ta cần biết chuyện gì đã xảy ra," cô nói.' },
    { who: 'RADIO', text: 'Bệnh viện Trung ương: còn mười lăm ngày. Nhiệt độ thùng mẫu vẫn ổn định chứ?' },
  ],
  46: [
    { who: 'NHẬT KÝ', text: 'Cả đêm mưa, cả một bầy đàn đi qua như dòng sông. Hàng rào xe tải bốc khói đến sáng.' },
    { who: 'RADIO', text: 'Bệnh viện Trung ương: còn mười bốn ngày.' },
  ],
  47: [
    { who: 'HOÀN', text: 'Thùng mẫu vẫn ổn. Tôi thì không chắc. Đã bốn mươi bảy đêm rồi.' },
    { who: 'RADIO', text: 'Không quân: chúng tôi thấy pháo sáng của các bạn. Thả hàng trong ba phút.' },
  ],
  48: [
    { who: 'NHẬT KÝ', need: ['tuan'], alt: 'Kẻ mang hòm lần này kéo theo một can dầu. Tôi chửi thề suốt nửa tiếng.', text: 'Kẻ mang hòm lần này kéo theo một can dầu. Tuấn chửi thề suốt nửa tiếng.' },
    { who: 'RADIO', text: 'Vệ tinh ghi nhận một khối di chuyển rất lớn ở cửa ngõ thủ đô. Nó lao theo đường thẳng, như một chiếc xe ủi.' },
  ],
  49: [
    { who: 'HOÀN', text: 'Đêm mai là đêm cuối trên cao tốc. Sau đó là thành phố, và những thứ đang chờ trong đó.' },
    { who: 'RADIO', text: 'Cỗ Máy Nghiền: lớp da dày như thép tấm, đạn thường chỉ xước. Hãy dùng chất nổ và súng xuyên giáp.' },
  ],
  51: [
    { who: 'HOÀN', text: 'Thủ đô im lặng một cách kỳ lạ. Không còn tiếng còi xe, chỉ còn tiếng gió lùa qua những ô kính vỡ.' },
    { who: 'RADIO', text: 'Kho thiết bị của đội phản ứng nhanh còn tháp Tesla và drone chiến đấu. Rất đắt, nhưng đáng.' },
  ],
  52: [
    { who: 'RADIO', text: 'Chủng phân thân: khi gục, chúng tách ra thành những con non nhỏ và nhanh. Đừng để chúng dồn tới hàng rào.' },
    { who: 'NHẬT KÝ', need: ['dat'], alt: 'Ba đám cháy quanh phòng tuyến. Tôi dập bằng cát và chiếc áo khoác cuối cùng.', text: 'Đạt đã dập ba đám cháy quanh phòng tuyến. Anh nói thành phố này là nhà anh.' },
  ],
  53: [
    { who: 'HOÀN', text: 'Chúng tràn lên từ ga tàu điện ngầm như nước vỡ bờ. Có cái gì đó dưới đó đang sinh ra chúng.' },
    { who: 'RADIO', text: 'Bệnh viện Trung ương: tuyến đường số 2 đã thông được một nửa. Cầm cự tiếp.' },
  ],
  54: [
    { who: 'RADIO', text: 'Cảnh báo: chủng tàng hình. Da chúng đổi màu theo bóng tối. Chỉ thấy rõ khi chúng đã đến rất gần.' },
    { who: 'NHẬT KÝ', text: 'Hà đứng trên nóc xe buýt suốt đêm, không bắn trượt phát nào. Đội của cô đã hy sinh để giữ chính con đường này.' },
  ],
  55: [
    { who: 'HOÀN', text: 'Hai con trùm, một đêm. Tôi không biết mình đã bắn bao nhiêu băng đạn.' },
    { who: 'RADIO', text: 'Bệnh viện Trung ương: còn năm ngày. Chúng tôi đã định vị được cái tổ. Nó ở ngay dưới quảng trường.' },
  ],
  56: [
    { who: 'NHẬT KÝ', text: 'Mất điện toàn thành phố. Chúng chạy nhanh hơn trong bóng tối, như thể bóng tối là nhà của chúng.' },
    { who: 'RADIO', text: 'Hoàn, đường truyền của bệnh viện chập chờn. Cậu có thể nối lại ăng-ten trên nóc tòa nhà phát thanh không?' },
  ],
  57: [
    { who: 'HOÀN', text: 'Tôi trèo lên nóc tòa nhà phát thanh quốc gia. Nơi tôi từng mơ được làm việc. Giờ tôi sửa nó bằng laptop, băng dính và dây đồng.' },
    { who: 'RADIO', text: 'Tín hiệu rõ rồi! Không quân sẽ thả mọi thứ còn lại xuống quảng trường.' },
  ],
  58: [
    { who: 'RADIO', text: 'Cả thủ đô đang thức giấc. Cái tổ dưới quảng trường đang gọi tất cả về. Đêm nay sẽ rất dài.' },
    { who: 'NHẬT KÝ', need: ['dat', 'ha'], alt: 'Một người, một hàng rào, một thùng mẫu lạnh.', text: 'Đạt và Hà đứng hai bên tôi. Ba người, một hàng rào, một thùng mẫu lạnh.' },
  ],
  59: [
    { who: 'RADIO', text: 'Bệnh viện Trung ương: đường đã thông. Bình minh mai chúng tôi sẽ tới lấy mẫu. Nhưng thứ dưới quảng trường đã thức dậy. Nó là mẹ của tất cả.' },
    { who: 'HOÀN', text: 'Một đêm nữa. Thùng mẫu lạnh nằm cạnh tôi, đèn báo vẫn xanh. Tôi sẽ không dừng lại lúc này.' },
  ],
  61: [
    { who: "HOÀN", text: "Đêm đầu ở nhà máy. Mùi clo và mùi xác cháy. Dây chuyền vắc-xin thế hệ hai bắt đầu chạy lúc nửa đêm." },
    { who: "RADIO", text: "Nhà máy Thành Nam: mẻ đầu tiên cần hai mươi ngày. Chúng tôi cần người giữ cổng." },
  ],
  62: [
    { who: "RADIO", text: "Cảnh báo: công nhân nhà máy bị nhiễm vẫn mặc nguyên đồ bảo hộ. Lửa và khí độc gần như vô dụng với chúng. Dùng đạn." },
    { who: "NHẬT KÝ", text: "Một con mặc đồ vàng đứng giữa đám lửa mà không ngã. Tôi bắn ba phát vào mặt nạ nó mới gục." },
  ],
  63: [
    { who: "HOÀN", text: "Tôi chạy phân tích bản ghi radio trên laptop. Cái nhịp 19 hertz ấy xuất hiện đúng lúc bầy đàn tràn lên. Không phải trùng hợp." },
    { who: "NHẬT KÝ", need: ["son"], alt: "Lò hơi tắt rồi lại cháy. Tôi giữ cho nhà máy còn điện bằng cách nối thẳng vào máy phát dự phòng.", text: "Sơn giữ lò hơi chạy suốt đêm để nhà máy còn điện. Anh không nói nhiều, chỉ gật đầu." },
  ],
  64: [
    { who: "RADIO", text: "Không quân: thả tiếp tế lên mái nhà xưởng số 2. Bắn vào thùng khi còn đang rơi." },
    { who: "NHẬT KÝ", text: "Một thùng rơi trúng bể nước. Tôi lặn xuống vớt được hai hộp đạn và một cuộn dây đồng." },
  ],
  65: [
    { who: "HOÀN", text: "Mẫu Thể Số 0 thứ hai. Nó giống hệt con ở Hồng Sơn. Ai đó đã tạo ra nhiều hơn một con." },
    { who: "NHẬT KÝ", need: ["thao"], alt: "Lô thuốc ổn định. Tôi ngủ gục bên cạnh dây chuyền, tay vẫn cầm khẩu súng.", text: "Thảo nói lô thuốc ổn định. Cô ấy ngủ gục trên bàn thí nghiệm, tay vẫn cầm ống nghiệm." },
  ],
  66: [
    { who: "RADIO", text: "Nhà máy Thành Nam: tiến độ 30%. Nhiệt độ bồn ủ vẫn ổn." },
    { who: "NHẬT KÝ", text: "Chúng chạy nhanh hơn mọi đêm. Như thể có ai đó đang thúc chúng." },
  ],
  67: [
    { who: "HOÀN", text: "Mất điện cả đêm. Tôi bắn theo vệt sáng của những chiếc xe nâng còn cháy." },
    { who: "HOÀN", text: "Lúc mất điện, tín hiệu 19 hertz vẫn phát. Nghĩa là nó không đến từ đây. Nó đến từ phía bắc." },
  ],
  68: [
    { who: "NHẬT KÝ", text: "Bầy đàn tràn qua bãi xe tải như nước vỡ đê. Hàng rào thùng hóa chất móp méo nhưng vẫn đứng." },
    { who: "RADIO", text: "Nhà máy Thành Nam: tiến độ 60%. Còn hai đêm cho mẻ đầu tiên." },
  ],
  69: [
    { who: "HOÀN", text: "Kẻ mang hòm lần này đeo bình khí độc của nhà máy. Tôi suýt bắn trúng bình." },
    { who: "RADIO", text: "Cảnh báo: lò thiêu số 3 phát nổ. Có thứ gì đó bước ra từ trong đó. Nó vẫn đang cháy." },
  ],
  71: [
    { who: "HOÀN", text: "Đường băng dài hai cây số, hàng rào của tôi chỉ dài mười mét. Phải giữ cho từng chuyến bay cất cánh được." },
    { who: "RADIO", text: "Tháp không lưu Bắc Thành: chúng tôi còn ba máy bay vận tải. Mỗi chuyến chở vắc-xin cho cả một tỉnh." },
  ],
  72: [
    { who: "RADIO", text: "Chủng mới: Kẻ ấp trứng. Túi trên lưng nó liên tục đẻ ra con non. Hạ nó trước khi cả đàn kịp nở." },
    { who: "NHẬT KÝ", need: ["kien"], alt: "Có một chiếc máy bay vận tải vẫn còn nguyên trong nhà chứa. Ai đó cần phải lái nó.", text: "Kiên nói anh từng bay tuyến này mười năm. Giờ anh bay với một khẩu súng trường trên đùi." },
  ],
  73: [
    { who: "HOÀN", text: "Tôi tháo tụ điện từ một chiếc máy bay hỏng, nối với ray thép của băng chuyền hành lý. Súng điện từ. Nó bắn xuyên được cả một hàng." },
    { who: "RADIO", text: "Kho sân bay đã mở bán súng điện từ do Hoàn lắp. Đắt, nhưng một phát xuyên cả hàng zombie." },
  ],
  74: [
    { who: "HOÀN", text: "Radar của sân bay bắt được tín hiệu 19 hertz rõ hơn bao giờ hết. Tôi bắt đầu dò hướng." },
    { who: "NHẬT KÝ", text: "Bầy đàn kéo đến từ phía nhà ga, giẫm lên những vali bỏ lại từ ngày đầu." },
  ],
  75: [
    { who: "HOÀN", text: "Hai con trùm. Tôi không nhớ mình đã đổi bao nhiêu băng đạn." },
    { who: "NHẬT KÝ", need: ["nhi"], alt: "Tôi bật đèn đường băng bằng tay để chiếc máy bay cuối cùng hạ cánh được trong bóng tối.", text: "Nhi điều khiển đèn đường băng bằng tay để máy bay hạ cánh trong bóng tối." },
  ],
  76: [
    { who: "HOÀN", text: "Dò hướng xong. Tín hiệu phát từ một hòn đảo ở cực bắc, bên kia rừng tuyết biên giới. Trên bản đồ quân sự cũ, nó có tên: Trạm Hải Đăng." },
    { who: "RADIO", text: "Tháp không lưu: hai chuyến đã cất cánh. Còn chuyến cuối." },
  ],
  77: [
    { who: "NHẬT KÝ", text: "Mất điện. Chúng chạy theo một nhịp đều đặn, như những người lính đang hành quân." },
    { who: "HOÀN", text: "Tôi giải mã được một đoạn tín hiệu. Bên trong có một chuỗi lệnh lặp lại: TIẾN LÊN. TÌM NGƯỜI SỐNG. Ai đó đã lập trình bầy đàn." },
  ],
  78: [
    { who: "NHẬT KÝ", text: "Bầy đàn lớn nhất từ khi rời thủ đô. Hàng rào bốc khói đến sáng." },
    { who: "RADIO", text: "Chuyến bay cuối cùng sẽ cất cánh sau đêm mai. Trên đó còn đúng một chỗ trống." },
  ],
  79: [
    { who: "HOÀN", text: "Tôi biết mình sẽ dùng chỗ trống đó làm gì. Vắc-xin chỉ chữa được người. Nó không tắt được thứ đang lùa bầy đàn đi." },
    { who: "RADIO", text: "Cảnh báo: radar ghi nhận một cá thể khổng lồ đang chạy dọc đường băng. Nó nhanh như một chiếc xe." },
  ],
  81: [
    { who: "HOÀN", text: "Đêm đầu trong rừng tuyết. Nhiệt độ âm hai mươi. Đạn bắn chậm hơn, tay tôi cũng vậy." },
    { who: "NHẬT KÝ", text: "Ba trăm cây số rừng thông đến bờ biển. Không có radio, chỉ có tiếng gió và tiếng rên." },
  ],
  82: [
    { who: "RADIO", text: "…rè… cảnh báo: zombie ở vùng tuyết bị đóng băng một nửa. Da cứng như vỏ đá, bẫy điện không làm chúng tê được. Lửa làm chúng tan ra." },
    { who: "NHẬT KÝ", need: ["quang"], alt: "Tôi lần theo những cột mốc biên giới phủ tuyết. Không có ai dẫn đường.", text: "Quang dẫn tôi qua những con dốc anh đã đi tuần mười lăm năm. Anh biết từng vết chân trên tuyết." },
  ],
  83: [
    { who: "NHẬT KÝ", text: "Bão tuyết. Tôi chỉ thấy những cái bóng khi chúng đã ở sát hàng rào." },
    { who: "HOÀN", text: "Laptop còn 40% pin. Tôi tắt mọi thứ, chỉ giữ chương trình giải mã chạy." },
  ],
  84: [
    { who: "RADIO", text: "Không quân: chúng tôi thấy pháo sáng của anh giữa rừng. Thả hàng trong ba phút." },
    { who: "NHẬT KÝ", text: "Một thùng rơi trúng ngọn thông, treo lơ lửng cả buổi sáng." },
  ],
  85: [
    { who: "HOÀN", text: "Hai con trùm. Tuyết quanh hàng rào nhuộm đỏ đến tận bìa rừng." },
    { who: "NHẬT KÝ", need: ["tuyet"], alt: "Tôi học cách dựng lều trên băng. Núi chỉ giết những người vội vàng.", text: "Tuyết dạy tôi cách dựng lều trên băng. Cô ấy nói núi chỉ giết những người vội vàng." },
  ],
  86: [
    { who: "HOÀN", text: "Mất điện. Chỉ còn ánh lửa trại và đôi mắt phát sáng ở bìa rừng." },
    { who: "HOÀN", text: "Giải mã được 50%. Tín hiệu không chỉ ra lệnh. Nó còn làm virus biến đổi nhanh hơn. Càng phát lâu, chúng càng mạnh." },
  ],
  87: [
    { who: "NHẬT KÝ", text: "Một bầy đàn đi qua rừng như dòng sông đóng băng. Chúng không dừng lại vì tôi. Chúng đang đi về phía nam, về phía các thành phố." },
    { who: "RADIO", text: "…rè… Bệnh viện Trung ương: các ca nhiễm mới đang tăng lại. Chủng mới. Vắc-xin chậm tác dụng…" },
  ],
  88: [
    { who: "HOÀN", text: "Chúng chạy trên mặt hồ đóng băng. Kẻ mang hòm lại xuất hiện, kéo theo một chiếc xe trượt." },
    { who: "NHẬT KÝ", text: "Còn hai đêm nữa đến bờ biển." },
  ],
  89: [
    { who: "HOÀN", text: "Từ đỉnh đồi cuối cùng, tôi thấy nó: một ngọn hải đăng trên đảo đá, và cột ăng-ten cao gấp ba lần ngọn hải đăng." },
    { who: "RADIO", text: "Cảnh báo: mặt hồ băng dưới chân đồi đang nứt. Có thứ gì đó rất lớn bên dưới." },
  ],
  91: [
    { who: "HOÀN", text: "Trạm Hải Đăng. Bên dưới ngọn hải đăng là cả một khu nghiên cứu đào sâu vào đá. Cửa khóa bằng mã. Tôi mất cả đêm để bẻ khóa." },
    { who: "NHẬT KÝ", text: "Trên tường có dòng chữ sơn đỏ: DỰ ÁN HẢI ĐĂNG. ĐIỀU KHIỂN ĐÁM ĐÔNG BẰNG ÂM THANH." },
  ],
  92: [
    { who: "RADIO", text: "Chủng mới: Kẻ thu sóng. Ăng-ten mọc ra từ đầu, chúng hút tín hiệu rồi chữa lành cho cả bầy quanh mình. Hạ chúng trước tiên." },
    { who: "NHẬT KÝ", need: ["minh"], alt: "Trong phòng điều khiển có một chiếc máy tính còn mở, đầy những dòng mã viết dở. Ai đó đã cố tắt nó trước tôi.", text: "Minh. Người từng ngồi cạnh tôi ở công ty cũ. Cậu ấy được thuê viết phần mềm cho trạm này và mắc kẹt ở đây từ ngày đầu." },
  ],
  93: [
    { who: "HOÀN", text: "Firmware của máy phát được viết bằng thứ ngôn ngữ tôi từng dùng mười năm trước. Lần đầu tiên tôi thấy nghề của mình đáng sợ đến vậy." },
    { who: "NHẬT KÝ", text: "Bầy đàn bị tín hiệu lùa tới hàng rào như một đàn cừu." },
  ],
  94: [
    { who: "NHẬT KÝ", need: ["an"], alt: "Trong phòng thí nghiệm có một bản báo cáo: dự án bắt đầu từ một bệnh nhân duy nhất, não nối thẳng vào ăng-ten. Rồi nó học được cách điều khiển ngược lại.", text: "An kể dự án bắt đầu từ một bệnh nhân duy nhất. Họ nối não nó vào ăng-ten để điều khiển những con khác. Rồi nó học được cách điều khiển ngược lại." },
    { who: "HOÀN", text: "Giải mã được 80%. Nếu đảo ngược tần số, tín hiệu sẽ ru ngủ bầy đàn thay vì lùa chúng đi." },
  ],
  95: [
    { who: "HOÀN", text: "Hai con trùm. Cả trạm rung lên dưới chân như sắp sụp." },
    { who: "RADIO", text: "Bệnh viện Trung ương: các thành phố phía nam đang bị vây. Chúng tôi không trụ được lâu nữa." },
  ],
  96: [
    { who: "NHẬT KÝ", text: "Mất điện toàn trạm. Kẻ mang hòm chạy vào đường hầm cáp ngầm, mang theo một ổ cứng." },
    { who: "HOÀN", text: "Ổ cứng đó chứa khóa mã của máy phát. Tôi phải lấy lại nó." },
  ],
  97: [
    { who: "NHẬT KÝ", text: "Bầy đàn lớn nhất tôi từng thấy, từ Bến Sương đến tận đây. Chúng biết tôi đang làm gì." },
    { who: "HOÀN", text: "Bản cập nhật đã viết xong. Chỉ cần đưa được nó vào phòng phát sóng." },
  ],
  98: [
    { who: "HOÀN", text: "Mất điện. Tín hiệu mạnh đến mức tai nghe của tôi rè lên từng đợt." },
    { who: "RADIO", text: "…rè… Kẻ Gọi Bầy đã rời khỏi phòng phát sóng… nó đang đi tìm anh…" },
  ],
  99: [
    { who: "HOÀN", text: "Một đêm nữa. Đêm mai tôi sẽ đẩy bản cập nhật cuối cùng, dù có chuyện gì xảy ra." },
    { who: "NHẬT KÝ", text: "Tôi đeo tai nghe. Lần đầu tiên sau một trăm đêm, tôi chủ động phát sóng thay vì chỉ lắng nghe." },
  ],
};

// Hết chương 1: trực thăng đến, nhưng hành trình chưa kết thúc
export const ACT1_END = [
  { who: 'HOÀN', shot: 'titanFalls', text: 'Kẻ Khổng Lồ đổ sập xuống ngay trước hàng rào. Mặt đất rung lên lần cuối, rồi im bặt.' },
  { who: 'RADIO', shot: 'heliLanding', text: 'Phi đội Hải Âu gọi người sống sót ở Cao Vọng. Chúng tôi thấy pháo sáng của các bạn. Đang hạ cánh!' },
  { who: 'HOÀN', shot: 'heliLanding', text: 'Tiếng cánh quạt xé tan màn sương. Ánh bình minh đầu tiên sau mười đêm dài rọi lên những bao cát rách nát.' },
  { who: 'RADIO', shot: 'heliOverSea', text: 'Tin xấu: hạm đội đã rút ra xa vì bão. Trực thăng chỉ còn một chỗ, và chỉ đủ nhiên liệu tới Cảng Vọng Hải.' },
  { who: 'HOÀN', shot: 'heliDoor', need: ['lan', 'tu'], alt: 'Phi công nhìn tôi: "Cậu là người duy nhất biết sửa radio. Lên đi." Cánh cửa đóng lại trước khi tôi kịp nhìn ngọn đồi lần cuối.', text: 'Lan và Ông Tư đẩy tôi lên. "Cậu là người duy nhất rành máy móc với radio. Bọn tôi sẽ đi chuyến sau." Cánh cửa đóng lại trước khi tôi kịp nói gì.' },
];

export const ACT2_INTRO = [
  { who: 'RADIO', shot: 'heliOverSea', text: 'Cảng Vọng Hải là điểm sơ tán cuối cùng của vùng duyên hải. Tàu Bình Minh sẽ cập cầu tàu số 3 sau MƯỜI đêm nữa.' },
  { who: 'HOÀN', shot: 'harborDrop', text: 'Trực thăng thả tôi xuống cầu tàu rồi quay đầu. Một mình. Cả thành phố cảng chìm trong bóng tối, và bóng tối đang chuyển động.' },
  { who: 'HOÀN', shot: 'harborDrop', text: 'Container chắn ngang, tôn lợp làm khiên. Lại một hàng rào nữa. Lại mười đêm nữa.' },
];

// Hết màn 1 (đêm 20): tàu cập bến, nhưng hành trình mới bắt đầu
export const STAGE1_END = [
  { who: 'HOÀN', shot: 'shipArrives', text: 'Quái Vật Cảng gục xuống, kéo theo nửa cầu tàu chìm vào làn nước đen.' },
  { who: 'RADIO', shot: 'shipArrives', text: 'Tàu Bình Minh gọi cầu tàu số 3. Chúng tôi đang cập bến. Thả dây! Mọi người lên tàu ngay!' },
  { who: 'HOÀN', shot: 'shipArrives', text: 'Tiếng còi tàu vang dài qua mặt biển. Hai mươi đêm. Tôi tưởng mọi thứ đã kết thúc.' },
  { who: 'HOÀN', shot: 'shipDeck', need: ['bao', 'mai'], alt: 'Tàu Bình Minh phải đưa hàng trăm người ra hạm đội. Tôi đứng trên boong, nhìn cảng Vọng Hải chìm dần trong khói.', text: 'Bảo và Mai ở lại trên tàu. Tàu Bình Minh phải đưa hàng trăm người ra hạm đội, và họ cần một thợ máy, một người biết đường.' },
];

export const STAGE2_INTRO = [
  { who: 'RADIO', shot: 'radioSignal', text: '…rè… Đây là Trạm Nghiên Cứu Hồng Sơn. Chúng tôi có mẫu vắc-xin. Cần hai mươi ngày để điều chế. Trạm đang bị vây. Ai nghe được… xin hãy đến.' },
  { who: 'HOÀN', shot: 'radioSignal', text: 'Thuyền trưởng nhìn tôi. Cả nhóm nhìn tôi. Tôi là người duy nhất giải mã được tín hiệu đó và biết nó phát từ đâu.' },
  { who: 'HOÀN', shot: 'riverBoat', text: 'Thuyền trưởng cho tôi một chiếc xuồng máy. Tôi ngược sông lên núi một mình. Ở Hồng Sơn có những người khác cũng đang chiến đấu.' },
  { who: 'RADIO', shot: 'damGate', text: 'MÀN 2 · MẬT MÃ HỒNG SƠN. Giữ cổng đập mười đêm, rồi giữ căn cứ thêm mười đêm nữa, cho đến khi vắc-xin hoàn tất.' },
];

export const ACT3_END = [
  { who: 'HOÀN', shot: 'damCrack', text: 'Bạo Chúa Rừng đổ sập xuống mép đập. Bê tông nứt toác dưới sức nặng của nó.' },
  { who: 'RADIO', shot: 'damCrack', text: 'Đập không trụ được nữa. Rút vào căn cứ trong lòng núi ngay! Chúng tôi sẽ mở cổng thép.' },
  { who: 'HOÀN', shot: 'steelGate', need: ['hung', 'linh'], alt: 'Tôi chạy dọc mép đập khi bầy đàn tràn qua chỗ nứt. Cánh cổng thép đóng sập sau lưng, chỉ chậm hơn chúng vài bước chân.', text: 'Hùng và Linh ở lại trên mép đập cầm chân bầy đàn cho tôi chạy. Cánh cổng thép đóng sập sau lưng. Tôi vẫn nghe tiếng súng máy của Hùng rất lâu.' },
];

export const ACT4_INTRO = [
  { who: 'HOÀN', shot: 'baseInterior', text: 'Căn cứ Hồng Sơn: tường thép, đèn pha, tháp canh, và phòng thí nghiệm của bác sĩ Khoa ở trung tâm.' },
  { who: 'RADIO', shot: 'baseInterior', text: 'Mười đêm cuối. Vắc-xin đang được điều chế. Hoàn, chúng tôi cần cậu giữ cho hệ thống phát sóng sống sót.' },
];

export const STAGE2_END = [
  { who: 'HOÀN', shot: 'zeroFalls', text: 'Mẫu Thể Số 0 gục xuống trước cánh cổng thép. Sau bốn mươi đêm, mọi thứ im lặng.' },
  { who: 'RADIO', shot: 'broadcastTower', text: 'Bác sĩ Khoa: vắc-xin đã hoàn tất. Hoàn, đến lượt cậu.' },
  { who: 'HOÀN', shot: 'broadcastTower', text: 'Tôi đeo tai nghe, cắm laptop vào bộ phát sóng, gõ dòng lệnh cuối cùng. Tần số khẩn cấp, mọi băng tần, toàn quốc.' },
  { who: 'HOÀN', shot: 'broadcastTower', text: 'Đây là Hoàn, từ đài phát thanh Bến Sương. Nếu bạn còn nghe được… chúng tôi có thuốc chữa. Hãy ghi lại công thức sau đây.' },
  { who: 'HOÀN', shot: 'broadcastTower', text: 'Lần đầu tiên sau bốn mươi đêm, radio không còn tiếng rè. Chỉ có những giọng nói đáp lại, từ khắp mọi nơi.' },
  { who: 'RADIO', shot: 'coolerBox', text: 'Bác sĩ Khoa: công thức là chưa đủ. Bệnh viện Trung ương ở thủ đô cần chủng gốc để sản xuất hàng triệu liều. Ai đó phải mang thùng mẫu này đi.' },
  { who: 'HOÀN', shot: 'coolerBox', need: ['vy'], alt: 'Bác sĩ Khoa phải ở lại giữ phòng thí nghiệm. Tôi nhận thùng mẫu lạnh. Lại một mình, lại một con đường mới.', text: 'Khoa và Vy phải ở lại giữ phòng thí nghiệm. Tôi nhận thùng mẫu lạnh. Lại một mình, lại một con đường mới.' },
];

export const STAGE3_INTRO = [
  { who: 'RADIO', shot: 'highwayRoad', text: 'MÀN 3 · CHUYẾN HÀNG CUỐI CÙNG. Ba trăm cây số cao tốc Bắc Nam. Rồi thủ đô. Thùng mẫu phải đến Bệnh viện Trung ương trong hai mươi ngày.' },
  { who: 'HOÀN', shot: 'carWall', text: 'Chiếc xe quân sự chết máy ở km 112. Phía trước là một đoàn xe tải bỏ hoang nằm ngang mặt đường. Tôi dựng hàng rào bằng chính những chiếc xe đó.' },
  { who: 'HOÀN', shot: 'carWall', text: 'Ngoài kia có những kẻ biết nhảy, và có những kẻ đang cháy mà vẫn bước đi. Tôi phải tìm người mới, dựng phòng tuyến mới.' },
];

export const ACT5_END = [
  { who: 'HOÀN', shot: 'juggernautFalls', text: 'Cỗ Máy Nghiền đổ ập xuống giữa cao tốc như một chiếc xe bọc thép lật nghiêng. Cửa ngõ thủ đô đã ở ngay trước mặt.' },
  { who: 'HOÀN', shot: 'tollGate', need: ['tuan', 'ngoc'], alt: 'Chiếc xe của tôi không chạy nổi thêm mét nào. Tôi bỏ nó lại ở trạm thu phí, vác thùng mẫu đi bộ về phía thành phố.', text: 'Xe tải của Tuấn không chạy nổi thêm mét nào. Anh ở lại giữ trạm thu phí cho đoàn người tị nạn phía sau. Ngọc theo đoàn xe cứu trợ để dẫn đường cho không quân.' },
];

export const ACT6_INTRO = [
  { who: 'HOÀN', shot: 'capitalSkyline', text: 'Thủ đô. Những tòa nhà chọc trời tắt đèn, ga tàu điện ngầm thở ra hơi lạnh. Bệnh viện Trung ương chỉ còn cách mười dãy phố.' },
  { who: 'RADIO', shot: 'metroMouth', text: 'Bệnh viện Trung ương gọi người mang mẫu. Cầm cự mười đêm trong khi chúng tôi dọn đường. Có thứ gì đó đang làm tổ dưới lòng thành phố.' },
];

// Hết màn 3: vắc-xin ra đời, nhưng một tín hiệu lạ vẫn còn đó
export const STAGE3_END = [
  { who: "HOÀN", shot: "queenFalls", text: "Nữ Hoàng Bầy Đàn gục xuống giữa quảng trường. Từng con non quanh nó đứng khựng lại, rồi đổ rạp xuống như những con rối đứt dây." },
  { who: "RADIO", shot: "hospitalRoof", text: "Bệnh viện Trung ương: chúng tôi đã nhận được chủng gốc. Dây chuyền sản xuất bắt đầu lúc 6 giờ sáng." },
  { who: "HOÀN", shot: "heliSwarm", text: "Trực thăng cứu trợ bay qua đầu, từng chiếc một, mang theo những thùng vắc-xin đầu tiên về khắp các tỉnh." },
  { who: "RADIO", shot: "signalScope", text: "Hai tuần sau. Báo cáo khẩn từ phía bắc: một chủng mới không phản ứng với vắc-xin. Chúng to hơn, lì hơn, và di chuyển theo đội hình." },
  { who: "HOÀN", shot: "signalScope", text: "Tôi mở lại mọi bản ghi radio trên laptop. Mỗi đêm, đúng lúc bầy đàn tràn lên, có một nhịp 19 hertz lặp lại. Không phải tiếng động. Đó là một tín hiệu." },
];

// Màn 4 · Biến chủng: chương 7 · Nhà máy Thành Nam
export const STAGE4_INTRO = [
  { who: "RADIO", shot: "factoryGate", text: "MÀN 4 · BIẾN CHỦNG. Nhà máy dược Thành Nam là nơi duy nhất sản xuất được vắc-xin thế hệ hai. Cần hai mươi ngày, và cần người giữ cổng." },
  { who: "HOÀN", shot: "factoryGate", text: "Tôi lại ra đi tay trắng. Nhà máy nằm giữa những ống khói đã nguội. Hàng rào lần này là những thùng hóa chất rỗng." },
  { who: "HOÀN", shot: "signalScope", text: "Tôi mang theo laptop và bản ghi tín hiệu. Nếu có ai đó đang điều khiển bầy đàn, tôi phải tìm ra họ ở đâu." },
];

// Hết chương 7
export const ACT7_END = [
  { who: "HOÀN", shot: "furnaceFalls", text: "Lò Thiêu Sống đổ sập trước cổng nhà máy, lửa trên người nó tắt dần trong tuyết bẩn." },
  { who: "RADIO", shot: "vaccineLab", text: "Nhà máy Thành Nam: mẻ vắc-xin thế hệ hai đầu tiên đã xong. Phải đưa nó tới sân bay Bắc Thành ngay trong đêm." },
  { who: "HOÀN", shot: "vaccineLab", need: ["son", "thao"], alt: "Dây chuyền phải chạy tiếp. Những công nhân còn sống ở lại với lò hơi và bồn ủ thuốc. Tôi ôm thùng vắc-xin lên chiếc xe tải cuối cùng.", text: "Sơn ở lại giữ lò hơi cho dây chuyền chạy tiếp, Thảo ở lại với những bồn ủ thuốc. Tôi ôm thùng vắc-xin lên chiếc xe tải cuối cùng." },
];

// Chương 8 · Sân bay Bắc Thành
export const ACT8_INTRO = [
  { who: "HOÀN", shot: "airportRunway", text: "Sân bay Bắc Thành: đường băng duy nhất ở phía bắc còn dùng được. Những chuyến bay vận tải sẽ đưa vắc-xin đi khắp nơi." },
  { who: "HOÀN", shot: "signalScope", text: "Tháp không lưu còn một dàn máy chủ chạy bằng điện dự phòng. Tôi cắm laptop vào radar. Tín hiệu kia lại hiện lên, rõ hơn bao giờ hết." },
];

// Hết màn 4: lần ra nguồn tín hiệu
export const STAGE4_END = [
  { who: "HOÀN", shot: "reaperFalls", text: "Kẻ Gặt Đường Băng lao vào xác một chiếc máy bay và không đứng dậy nữa." },
  { who: "RADIO", shot: "cargoPlane", text: "Tháp không lưu: chuyến cuối cùng đã cất cánh. Vắc-xin thế hệ hai đang tới mọi tỉnh." },
  { who: "HOÀN", shot: "signalScope", text: "Tôi giải mã xong. Trạm Hải Đăng là một dự án quân sự: điều khiển bầy đàn bằng âm thanh. Họ mất kiểm soát, nhưng máy phát vẫn chạy bằng pin hạt nhân. Chừng nào nó còn phát, bầy đàn còn biến đổi." },
  { who: "HOÀN", shot: "cargoPlane", need: ["kien", "nhi"], alt: "Tôi dùng chỗ trống cuối cùng trên chuyến bay. Phi công chở tôi về phía bắc, xa hết mức nhiên liệu cho phép.", text: "Kiên chở tôi trên chuyến bay cuối, xa hết mức nhiên liệu cho phép. Nhi ở lại giữ tháp cho những chuyến bay sau." },
];

// Màn 5 · Tần số cuối cùng: chương 9 · Rừng tuyết biên giới
export const STAGE5_INTRO = [
  { who: "RADIO", shot: "snowForest", text: "MÀN 5 · TẦN SỐ CUỐI CÙNG. Ba trăm cây số rừng tuyết đến bờ biển phía bắc, rồi vượt eo biển đóng băng tới đảo Hải Đăng." },
  { who: "HOÀN", shot: "snowForest", text: "Máy bay hạ cánh khẩn cấp trên một bãi tuyết. Gió buốt như dao. Tôi dựng hàng rào bằng thân thông đổ và xác máy bay." },
  { who: "HOÀN", shot: "radioRoom", text: "Một trăm ngày trước, tôi ngồi bên bộ đàm chờ người khác đến cứu. Lần này tôi đi tắt cái đài phát thanh đã gây ra tất cả." },
];

// Hết chương 9
export const ACT9_END = [
  { who: "HOÀN", shot: "wendigoFalls", text: "Quỷ Tuyết gầm lên lần cuối rồi sụp xuống lớp băng, kéo theo cả một mảng hồ chìm vào nước đen." },
  { who: "HOÀN", shot: "frozenShore", need: ["quang", "tuyet"], alt: "Tôi một mình vượt eo biển đóng băng lúc bình minh. Sau lưng, băng bắt đầu nứt.", text: "Quang ở lại giữ đường mòn cho đoàn người tị nạn phía sau. Tuyết dẫn tôi qua eo biển đóng băng lúc bình minh, rồi quay về khi băng bắt đầu nứt." },
];

// Chương 10 · Trạm Hải Đăng
export const ACT10_INTRO = [
  { who: "HOÀN", shot: "lighthouse", text: "Trạm Hải Đăng: một ngọn hải đăng cũ trên đảo đá. Bên dưới là cả một khu nghiên cứu đào sâu vào lòng đảo. Ăng-ten khổng lồ vẫn đang phát." },
  { who: "RADIO", shot: "lighthouse", text: "…19 hertz… TIẾN LÊN… TÌM NGƯỜI SỐNG…" },
  { who: "HOÀN", shot: "transmitterRoom", text: "Mười đêm. Tôi phải giữ cửa trạm đủ lâu để viết lại phần mềm của máy phát." },
];
// Kết thúc: tắt tín hiệu, bầy đàn ngủ yên
export const ENDING = [
  { who: "HOÀN", shot: "callerFalls", text: "Kẻ Gọi Bầy gục xuống trước cửa phòng phát sóng. Những sợi cáp nối vào đầu nó vẫn còn chớp sáng." },
  { who: "HOÀN", shot: "transmitterRoom", need: ["minh"], alt: "Tôi ngồi trước màn hình, gõ dòng lệnh cuối cùng và nhấn Enter.", text: "Minh và tôi cùng nhìn màn hình. Tôi gõ dòng lệnh cuối cùng và nhấn Enter." },
  { who: "HOÀN", shot: "sleepWave", text: "Ăng-ten rung lên. Tần số đảo ngược lan ra khắp đất nước. Ở mọi nơi, bầy đàn dừng lại, rồi lần lượt nằm xuống như những người vừa ngủ thiếp đi." },
  { who: "RADIO", shot: "heliSwarm", text: "Bệnh viện Trung ương: chúng ngừng tấn công. Tất cả. Đội tiêm chủng đang tiến vào các thành phố." },
  { who: "HOÀN", shot: "transmitterRoom", text: "Tôi bật bộ phát của trạm, chuyển sang tần số khẩn cấp: Đây là Hoàn, từ đài phát thanh Bến Sương. Đã an toàn rồi. Hãy ra ngoài." },
  { who: "HOÀN", shot: "homecoming", need: ["lan", "tu"], alt: "Một tháng sau, tôi về lại Bến Sương. Căn nhà của ông ngoại vẫn còn đó, bao cát vẫn chất trước cửa.", text: "Một tháng sau, tôi về lại Bến Sương. Lan và Ông Tư đứng đợi dưới chân đồi Cao Vọng, như thể chuyến trực thăng chỉ vừa cất cánh hôm qua." },
  { who: "HOÀN", shot: "phongHeadphones", text: "Tôi đeo tai nghe. Trên mọi tần số, người ta đang gọi tên nhau. Lần này, họ đều được trả lời." },
];


export const ENDLESS_NOTE = [
  { who: 'RADIO', shot: 'lighthouse', text: 'Bầy đàn đã ngủ, nhưng không phải con nào cũng nghe được tín hiệu. Những con còn thức đang kéo về Trạm Hải Đăng…' },
  { who: 'HOÀN', text: 'Chế độ vô tận đã mở. Mỗi đêm khó hơn, cứ 5 đêm lại có một con trùm.' },
];

export const GAMEOVER_LINES = [
  'Hàng rào sụp đổ. Bóng tối nuốt chửng thêm một người.',
  'Những tấm ván cuối cùng gãy vụn. Tiếng rên rỉ tràn vào.',
  'Sáng hôm sau, radio vẫn phát, nhưng không còn ai đeo tai nghe.',
];

// Người sống sót có tên, được tìm thấy theo thứ tự
export const SURVIVORS = [
  {
    id: 'lan', name: 'Lan', role: 'Y tá', perk: 'Sửa rào hiệu quả hơn 35%', weapon: 'pistol', act: 1, from: 2,
    look: { shirt: '#e8eef2', pants: '#3b4a5c', skin: '#f0c9a0', hair: '#1b1410' },
    intro: 'Một cô y tá trốn trong hiệu thuốc, tay còn cầm cuộn băng gạc. "Tôi biết cách vá mọi thứ. Kể cả hàng rào."',
  },
  {
    id: 'tu', name: 'Ông Tư', role: 'Thợ săn', perk: 'Bắn chính xác, sát thương gấp đôi', weapon: 'rifle', act: 1, from: 5,
    look: { shirt: '#5b5236', pants: '#2b2a22', skin: '#c58c5c', hat: '#3a3324' },
    intro: 'Ông lão thợ săn ngồi trên nóc nhà kho, khẩu súng săn trên đùi. "Bốn mươi năm săn heo rừng. Mấy thứ này còn chậm hơn."',
  },
  {
    id: 'bao', name: 'Bảo', role: 'Thợ máy', perk: 'Hàng rào tự hồi phục trong đêm', weapon: 'smg', act: 2, from: 12,
    look: { shirt: '#3c6e8f', pants: '#2b2f3a', skin: '#e0b48c', hat: '#c46a2a' },
    intro: 'Một thợ máy cố thủ trong xưởng sửa tàu của cảng với cái mỏ hàn. "Cho tôi ít sắt vụn, hàng rào của anh sẽ tự liền vết thương."',
  },
  {
    id: 'mai', name: 'Mai', role: 'Sinh viên', perk: 'Lục lọi thu được thêm 30%', weapon: 'shotgun', act: 2, from: 15,
    look: { shirt: '#8f3c6d', pants: '#2b2f3a', skin: '#f0c9a0', hair: '#5a3418' },
    intro: 'Cô sinh viên thực tập ở cảng, trốn trong kho lạnh với ba lô đầy đồ hộp. "Tôi thuộc lòng sơ đồ bãi container. Chỗ nào còn đồ, tôi biết hết."',
  },
  {
    id: 'hung', name: 'Hùng', role: 'Cựu binh', perk: 'Mỗi sáng nhặt thêm 1 lựu đạn', weapon: 'lmg', stage: 2, act: 3, from: 22,
    intro: 'Một người lính biên phòng ngồi gác trên nóc trạm bơm, khẩu súng máy trên đùi. "Đơn vị tôi không còn ai. Cho tôi một chỗ trên hàng rào."',
  },
  {
    id: 'linh', name: 'Linh', role: 'Xạ thủ', perk: 'Headshot của bạn được thêm 25% tiền', weapon: 'sniper', stage: 2, act: 3, from: 25,
    intro: 'Cô gái tóc dài nằm trên tháp nước với khẩu súng bắn tỉa, từng là vận động viên bắn súng quốc gia. "Tôi không bắn trượt. Chưa bao giờ."',
  },
  {
    id: 'khoa', name: 'Bác sĩ Khoa', role: 'Nhà nghiên cứu', perk: 'Đồng đội bị thương hồi phục nhanh hơn 1 đêm', weapon: 'pistol', stage: 2, act: 4, from: 32,
    intro: 'Người đàn ông đeo kính, áo blouse dính máu, ôm chặt thùng mẫu lạnh. "Tôi là người điều chế vắc-xin. Giữ tôi sống, và tôi sẽ giữ cả đất nước sống."',
  },
  {
    id: 'vy', name: 'Vy', role: 'Kỹ sư điện', perk: 'Đêm mất điện: dựng đèn pha, nhìn rõ hơn nhiều', weapon: 'smg', stage: 2, act: 4, from: 35,
    intro: 'Cô kỹ sư buộc tóc hai búi, đội mũ bảo hộ vàng, đang nối lại máy phát của căn cứ. "Cho tôi mười phút và một cái cờ lê, cả căn cứ này sẽ sáng đèn."',
  },
  {
    id: 'tuan', name: 'Tuấn', role: 'Tài xế xe tải', perk: 'Mỗi sáng gia cố rào thêm 10% độ bền', weapon: 'shotgun', stage: 3, act: 5, from: 42,
    intro: 'Một tài xế xe container mắc kẹt giữa cao tốc, ngồi trên nóc cabin với khẩu shotgun. "Xe tôi còn nửa bình dầu. Muốn đi thủ đô thì phải có người lái."',
  },
  {
    id: 'ngoc', name: 'Ngọc', role: 'Phóng viên chiến trường', perk: 'Mỗi đêm thêm 1 thùng tiếp tế được thả', weapon: 'pistol', stage: 3, act: 5, from: 45,
    intro: 'Cô phóng viên tóc dài, máy quay đeo trên vai, áo phản quang chữ BÁO CHÍ. "Tôi liên lạc được với không quân. Cho tôi tọa độ, họ sẽ thả hàng."',
  },
  {
    id: 'dat', name: 'Đạt', role: 'Lính cứu hỏa', perk: 'Hàng rào chịu ít hơn 15% sát thương', weapon: 'flamer', stage: 3, act: 6, from: 52,
    intro: 'Người lính cứu hỏa trong bộ đồ chống cháy cháy xém, vác bình phun trên lưng. "Thành phố này cháy ba tuần rồi. Tôi chưa định nghỉ."',
  },
  {
    id: 'ha', name: 'Hà', role: 'Nữ đặc nhiệm', perk: 'Lựu đạn của bạn mạnh hơn 50%', weapon: 'rifle', stage: 3, act: 6, from: 55,
    intro: 'Cô gái mặc giáp đặc nhiệm, tóc tết gọn, đội trưởng một đội đã không còn ai. "Đội tôi giữ bệnh viện Trung ương đến người cuối cùng. Giờ đến lượt tôi giữ các anh."',
  },
  {
    id: "son", name: "Sơn", role: "Công nhân vận hành lò", perk: "Công trình phòng thủ rẻ hơn 20%", weapon: "shotgun", stage: 4, act: 7, from: 62,
    intro: "Người đàn ông vạm vỡ mặc áo bảo hộ cháy xém, cố thủ trong phòng lò hơi với cái xẻng và khẩu shotgun. \"Tôi dựng được mọi thứ từ sắt vụn. Rẻ hơn anh nghĩ.\"",
  },
  {
    id: "thao", name: "Thảo", role: "Dược sĩ", perk: "Mỗi sáng tự chế thêm 2 hộp đồ ăn", weapon: "smg", stage: 4, act: 7, from: 65,
    intro: "Cô dược sĩ đeo kính bảo hộ, khóa mình trong phòng sạch cùng những bồn ủ vắc-xin. \"Tôi biến được bột ngũ cốc thành khẩu phần. Đói không phải là cách chết của chúng ta.\"",
  },
  {
    id: "kien", name: "Kiên", role: "Phi công vận tải", perk: "Ban ngày có thêm 2 giờ", weapon: "rifle", stage: 4, act: 8, from: 72,
    intro: "Một phi công trong bộ áo bay bạc màu, ngồi trong buồng lái chiếc máy bay vận tải cuối cùng. \"Tôi bay đêm mười năm rồi. Một ngày của tôi dài hơn của anh.\"",
  },
  {
    id: "nhi", name: "Nhi", role: "Kiểm soát viên không lưu", perk: "Tiền thưởng hạ zombie +15%", weapon: "smg", stage: 4, act: 8, from: 75,
    intro: "Cô gái đeo tai nghe không lưu, một mình giữ tháp điều khiển suốt ba tuần. \"Tôi đếm từng con trên radar. Con nào cũng có giá.\"",
  },
  {
    id: "quang", name: "Quang", role: "Kiểm lâm biên giới", perk: "Mìn và lưỡi cưa mạnh hơn 40%", weapon: "sniper", stage: 5, act: 9, from: 82,
    intro: "Người kiểm lâm râu phủ tuyết, khẩu súng bắn tỉa quấn vải trắng. \"Tôi đặt bẫy thú mười lăm năm. Bẫy người chết còn dễ hơn.\"",
  },
  {
    id: "tuyet", name: "Tuyết", role: "Hướng dẫn viên leo núi", perk: "Đồng đội trên rào bắn nhanh hơn 20%", weapon: "shotgun", stage: 5, act: 9, from: 85,
    intro: "Cô gái tóc tết dưới mũ len, dây leo núi quấn quanh vai. \"Trên núi, ai chậm là chết. Tôi sẽ dạy cả nhóm anh nhanh tay hơn.\"",
  },
  {
    id: "minh", name: "Minh", role: "Lập trình viên", perk: "Công trình phòng thủ và drone gây thêm 25% sát thương", weapon: "smg", stage: 5, act: 10, from: 92,
    intro: "Người đồng nghiệp cũ của Hoàn, gầy rộc, đeo kính nứt, ôm chiếc laptop trong phòng máy chủ của trạm. \"Hoàn? Tôi viết phần mềm cho cái máy phát này. Giúp tôi sửa sai.\"",
  },
  {
    id: "an", name: "An", role: "Nhà khoa học đào tẩu", perk: "Zombie tinh nhuệ xuất hiện ít hơn một nửa", weapon: "tesla", stage: 5, act: 10, from: 95,
    intro: "Người phụ nữ mặc áo blouse của Dự án Hải Đăng, trốn trong phòng lưu trữ với khẩu súng điện thử nghiệm. \"Tôi biết chúng được tạo ra thế nào. Tôi biết cách làm chúng yếu đi.\"",
  },
];

// Chỉ số chiến đấu của đồng đội trên hàng rào (cấp 1)
export const MATE_COMBAT = {
  lan:  { dmg: 22, cd: [0.9, 1.4], head: 0.25, miss: 0.3 },
  tu:   { dmg: 44, cd: [1.4, 1.8], head: 0.55, miss: 0.1, hunter: true },
  bao:  { dmg: 14, cd: [0.25, 0.4], head: 0.15, miss: 0.35 },
  mai:  { dmg: 16, cd: [1.0, 1.4], head: 0.2, miss: 0.25, pellets: 3 },
  hung: { dmg: 20, cd: [0.6, 0.9], head: 0.2, miss: 0.3, burst: 3 },
  linh: { dmg: 90, cd: [1.8, 2.2], head: 0.7, miss: 0.05, hunter: true, pierce: 3 },
  khoa: { dmg: 18, cd: [1.0, 1.5], head: 0.2, miss: 0.35 },
  vy:   { dmg: 15, cd: [0.3, 0.45], head: 0.15, miss: 0.3 },
  tuan: { dmg: 18, cd: [1.0, 1.3], head: 0.2, miss: 0.25, pellets: 4 },
  ngoc: { dmg: 22, cd: [0.8, 1.2], head: 0.3, miss: 0.25 },
  dat:  { dmg: 10, cd: [0.18, 0.28], head: 0.05, miss: 0.2, pierce: 3 },
  ha:   { dmg: 34, cd: [0.7, 1.0], head: 0.5, miss: 0.1, burst: 2 },
  son:  { dmg: 18, cd: [1.0, 1.3], head: 0.2, miss: 0.25, pellets: 4 },
  thao: { dmg: 16, cd: [0.28, 0.42], head: 0.15, miss: 0.3 },
  kien: { dmg: 48, cd: [1.3, 1.7], head: 0.5, miss: 0.1, hunter: true },
  nhi:  { dmg: 17, cd: [0.26, 0.4], head: 0.2, miss: 0.25 },
  quang:{ dmg: 110, cd: [1.8, 2.2], head: 0.7, miss: 0.05, hunter: true, pierce: 3 },
  tuyet:{ dmg: 20, cd: [0.9, 1.2], head: 0.25, miss: 0.2, pellets: 4 },
  minh: { dmg: 18, cd: [0.25, 0.38], head: 0.2, miss: 0.25 },
  an:   { dmg: 40, cd: [0.6, 0.9], head: 0.1, miss: 0.1, pierce: 2 },
};

// Kỹ năng có hiệu lực khi người đó đã gia nhập nhóm và không bị thương
export const hasPerk = (data, id) => (data.crew || []).includes(id) && !((data.mates || {})[id]?.injured > 0);

// Không spoil: câu nhắc tới đồng đội chưa từng gặp thì dùng câu thay thế (hoặc bỏ)
export function storyFor(lines, met = []) {
  return (lines || []).map((l) => (l.need && !l.need.every((id) => met.includes(id)) ? (l.alt ? { ...l, text: l.alt } : null) : l)).filter(Boolean);
}
