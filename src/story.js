// Cốt truyện: Phong, nhân viên trạm phát thanh Bến Sương.
// Chương 1 (đêm 1–10): giữ nhà dưới chân đồi chờ trực thăng.
// Chương 2 (đêm 11–20): giữ cầu tàu Cảng Vọng Hải chờ tàu sơ tán.

export const HERO_NAME = 'PHONG';

export const INTRO = [
  { who: 'RADIO', text: '…rè… rè… Đây là Đài Phát Thanh Khẩn Cấp vùng duyên hải. Dịch bệnh đã tràn qua thị trấn Bến Sương.' },
  { who: 'PHONG', text: 'Tôi là Phong, kỹ thuật viên trạm phát thanh thị trấn. Ba ngày nay tôi chỉ ngồi bên bộ đàm, nghe những cuộc gọi cầu cứu tắt dần.' },
  { who: 'RADIO', text: 'Người nhiễm bệnh mất hết lý trí và tấn công mọi thứ còn sống. Chúng mạnh nhất về đêm. Không được ra ngoài sau khi mặt trời lặn.' },
  { who: 'RADIO', text: 'Trực thăng cứu hộ sẽ hạ cánh trên đồi Cao Vọng sau MƯỜI đêm nữa. Ai còn nghe được… hãy cố thủ. Hãy sống sót.' },
  { who: 'PHONG', text: 'Căn nhà cũ của ông ngoại nằm ngay chân đồi. Vài bao cát, mấy tấm ván, khẩu súng lục và hai quả lựu đạn trong rương gỗ.' },
  { who: 'PHONG', text: 'Tai nghe vẫn đeo trên cổ. Chừng nào radio còn phát, chừng đó tôi còn hy vọng. Mặt trời vừa lặn.' },
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
  60: 'Đêm cuối cùng. Nữ Hoàng Bầy Đàn trồi lên từ lòng đất.',
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
    { who: 'PHONG', text: 'Tôi chỉnh lại ăng-ten trên mái nhà. Tín hiệu rõ hơn hẳn. Năm đêm. Đã đi được nửa đường.' },
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
    { who: 'PHONG', text: 'Radio không còn phát gì nữa. Tôi tháo tai nghe ra rồi lại đeo vào. Chỉ là do bão thôi.' },
  ],
  9: [
    { who: 'RADIO', text: '…rè… Đây là Phi đội Cứu hộ Hải Âu. Chúng tôi sẽ đến đồi Cao Vọng lúc bình minh sau đêm mai. Giữ vững!' },
    { who: 'RADIO', text: 'Cảnh báo: vệ tinh ghi nhận một cá thể khổng lồ đang tiến về phía đồi. Nó cao gấp đôi người thường.' },
    { who: 'NHẬT KÝ', text: 'Một đêm nữa thôi. Chỉ một đêm nữa.' },
  ],
  11: [
    { who: 'PHONG', text: 'Cầu tàu số 3 trụ được đêm đầu. Mùi muối, mùi dầu máy, và mùi xác chết.' },
    { who: 'RADIO', text: 'Tàu Bình Minh gọi cảng Vọng Hải. Chúng tôi còn chín ngày hải trình. Hãy giữ cầu tàu cho chúng tôi cập bến.' },
  ],
  12: [
    { who: 'RADIO', text: 'Cảnh báo: chủng trương phình phát nổ khi bị tiêu diệt. Bắn chúng khi còn ở xa, vụ nổ sẽ quét sạch những con xung quanh.' },
    { who: 'NHẬT KÝ', text: 'Một con nổ ngay trước hàng rào. Ba tấm tôn bay mất. May mà không ai bị thương.' },
  ],
  13: [
    { who: 'RADIO', text: 'Đội cảnh sát cơ động từng giữ cảng đã bị nhiễm. Mũ giáp chặn được đạn vào đầu, cho đến khi vỡ. Lửa và chất nổ xuyên qua giáp.' },
    { who: 'PHONG', text: 'Kho vũ khí của cảng còn mở. Có súng phun lửa và súng phóng lựu, nếu đủ tiền đổi với ông chủ kho.' },
  ],
  14: [
    { who: 'NHẬT KÝ', text: 'Sương dày đến mức không thấy nổi mũi súng. Tôi bắn theo tiếng rên. Mai nói tôi bắn trúng nhiều hơn tôi nghĩ.' },
    { who: 'RADIO', text: 'Tàu Bình Minh: chúng tôi đã qua eo biển. Sáu ngày nữa.' },
  ],
  15: [
    { who: 'PHONG', text: 'Con khổng lồ thứ hai ngã xuống giữa bãi container. Nó rơi xuống nước mà không nổi lên.' },
    { who: 'RADIO', text: 'Thủy âm của tàu ghi nhận chuyển động lớn dưới đáy cảng. Có thể chỉ là xác tàu cũ. Có thể không.' },
  ],
  16: [
    { who: 'NHẬT KÝ', text: 'Bão biển. Sóng tràn lên cầu tàu cuốn theo cả xác lẫn sống. Chúng vẫn bò lên được.' },
    { who: 'RADIO', text: '…Bình Minh… neo tránh bão… chậm một ngày… rè…' },
  ],
  17: [
    { who: 'PHONG', text: 'Tôi sửa lại bộ đàm của cảng. Giờ chúng tôi nói chuyện được với thuyền trưởng mỗi sáng.' },
    { who: 'RADIO', text: 'Thuyền trưởng tàu Bình Minh: ba đêm nữa. Trên tàu còn chỗ cho tất cả các bạn.' },
  ],
  18: [
    { who: 'RADIO', text: 'Chúng tôi thấy ánh lửa của các bạn từ ngoài khơi. Hai đêm nữa thôi. Đừng bỏ cuộc.' },
    { who: 'NHẬT KÝ', text: 'Lần đầu tiên sau mười tám ngày, cả nhóm cùng cười. Bảo kể chuyện hồi sửa tàu đánh cá.' },
  ],
  19: [
    { who: 'RADIO', text: 'Cảnh báo khẩn: thủy âm ghi nhận một cá thể khổng lồ đang di chuyển dưới nước về phía cầu tàu. Nó lớn hơn mọi thứ chúng tôi từng thấy.' },
    { who: 'PHONG', text: 'Đêm cuối. Tôi chỉnh tai nghe, kiểm tra từng băng đạn. Dù có chuyện gì, sáng mai chúng tôi sẽ lên tàu.' },
  ],
  21: [
    { who: 'RADIO', text: 'Trạm Hồng Sơn gọi đoàn Bình Minh. Máy bay vận tải sẽ thả tiếp tế. Bắn vào thùng hàng khi nó còn lơ lửng để mở dù sớm.' },
    { who: 'PHONG', text: 'Đêm đầu trên đập. Gió núi lạnh buốt. Dưới chân là cả một hồ nước đen ngòm.' },
  ],
  22: [
    { who: 'RADIO', text: 'Cảnh báo: chó nghiệp vụ của đồn biên phòng đã bị nhiễm. Chúng rất nhanh và thấp, hãy hạ nòng súng.' },
    { who: 'NHẬT KÝ', text: 'Hùng nói anh từng huấn luyện mấy con chó đó. Anh không nói thêm gì nữa.' },
  ],
  23: [
    { who: 'PHONG', text: 'Mất điện cả đêm. Tôi chỉ bắn theo vệt sáng của đèn pin và tiếng rên. Vy hứa sẽ dựng đèn pha nếu tìm được máy phát.' },
    { who: 'RADIO', text: 'Bác sĩ Khoa: mẫu vắc-xin đầu tiên đang nuôi cấy. Chúng tôi cần mười bảy ngày nữa.' },
  ],
  24: [
    { who: 'RADIO', text: 'Chủng mới: Kẻ rú. Tiếng hét của nó kích động cả bầy, làm chúng chạy nhanh hơn. Hạ nó trước tiên.' },
    { who: 'NHẬT KÝ', text: 'Tiếng rú đó vẫn còn văng vẳng trong tai, kể cả khi đã tháo tai nghe.' },
  ],
  25: [
    { who: 'PHONG', text: 'Kẻ Khổng Lồ thứ ba. Nó gục ngay trên mép đập rồi rơi xuống lòng hồ.' },
    { who: 'RADIO', text: 'Một đoàn tiếp tế bị phục kích gần cầu treo. Có kẻ đã cướp hòm vật tư. Nếu thấy nó, đừng để nó chạy thoát.' },
  ],
  26: [
    { who: 'NHẬT KÝ', text: 'Tối qua có một con khoác ba lô quân dụng, chạy vòng vòng như đang trêu chúng tôi. Linh nói lần sau cô sẽ không bắn trượt.' },
    { who: 'RADIO', text: 'Bác sĩ Khoa: tiến độ 40%. Các bạn đang làm rất tốt.' },
  ],
  27: [
    { who: 'RADIO', text: 'Cảnh báo: chủng tái sinh. Chúng đứng dậy sau khi gục, trừ khi bị bắn vỡ đầu hoặc thiêu cháy.' },
    { who: 'PHONG', text: 'Tôi đếm được ba con đứng dậy hai lần. Từ giờ chỉ nhắm vào đầu.' },
  ],
  28: [
    { who: 'NHẬT KÝ', text: 'Sương mù và bão. Ba thùng tiếp tế rơi trúng đập, một thùng rơi xuống hồ. Hùng lặn xuống vớt được nửa thùng đạn.' },
    { who: 'RADIO', text: 'Vệ tinh ghi nhận một đàn rất lớn đang di chuyển qua rừng thông về phía đập.' },
  ],
  29: [
    { who: 'RADIO', text: 'Đàn lớn đó có một con đầu đàn. Nó to như một ngôi nhà và đi đến đâu, chó hoang theo đến đó.' },
    { who: 'PHONG', text: 'Đêm mai là đêm thứ mười trên đập. Rồi chúng tôi sẽ rút vào căn cứ trong lòng núi.' },
  ],
  31: [
    { who: 'PHONG', text: 'Căn cứ Hồng Sơn có tường thép, đèn pha và một bộ phát sóng quân sự. Lần đầu tiên tôi được chạm vào một chiếc máy như thế.' },
    { who: 'RADIO', text: 'Kho vũ khí căn cứ đã mở: súng điện thử nghiệm. Đắt, nhưng một tia sét có thể hạ năm con.' },
  ],
  32: [
    { who: 'NHẬT KÝ', text: 'Chúng gặm đứt cáp điện chính. Vy sửa đến tận sáng. Tay cô bị bỏng nhưng vẫn cười.' },
    { who: 'RADIO', text: 'Bác sĩ Khoa: tiến độ 65%. Mẫu ổn định ở nhiệt độ thường.' },
  ],
  33: [
    { who: 'PHONG', text: 'Kẻ mang hòm lần này đeo thùng mẫu lạnh của phòng thí nghiệm. Khoa suýt ngất khi thấy nó.' },
    { who: 'RADIO', text: 'Mỗi thùng mẫu là một tuần nghiên cứu. Hãy bảo vệ chúng bằng mọi giá.' },
  ],
  34: [
    { who: 'NHẬT KÝ', text: 'Bão. Tiếp tế rơi khắp sân bay. Vy dựng đèn pha trên tháp canh soi từng thùng hàng.' },
    { who: 'RADIO', text: 'Cảnh báo: hai cá thể khổng lồ đang leo lên đường núi. Cùng lúc.' },
  ],
  35: [
    { who: 'PHONG', text: 'Hai con. Tôi không nghĩ chúng tôi sẽ qua được. Nhưng chúng tôi vẫn ở đây.' },
    { who: 'RADIO', text: 'Bác sĩ Khoa: tiến độ 85%. Năm đêm nữa.' },
  ],
  36: [
    { who: 'NHẬT KÝ', text: 'Chúng chạy nhanh như bị điên. Có lẽ chúng ngửi thấy mùi phòng thí nghiệm. Hoặc mùi hy vọng.' },
    { who: 'RADIO', text: 'Phong, cậu có thể chỉnh bộ phát sóng của căn cứ để phủ toàn quốc không? Khi vắc-xin xong, mọi người cần biết công thức.' },
  ],
  37: [
    { who: 'PHONG', text: 'Tôi làm được. Tôi đã làm việc này cả đời. Chỉ cần căn cứ còn điện vào đêm cuối.' },
    { who: 'NHẬT KÝ', text: 'Lại mất điện. Lại tiếng sủa trong bóng tối. Không ai ngủ được.' },
  ],
  38: [
    { who: 'RADIO', text: 'Bác sĩ Khoa: tiến độ 97%. Nhưng có chuyện rồi. Mẫu Thể Số 0, bệnh nhân đầu tiên mà chúng tôi giữ lại để nghiên cứu, đang phá cửa phòng cách ly.' },
    { who: 'PHONG', text: 'Hai đêm nữa. Tôi đã đi từ Bến Sương đến tận đây. Không thể dừng lại bây giờ.' },
  ],
  39: [
    { who: 'RADIO', text: 'Vắc-xin hoàn tất lúc bình minh. Mẫu Thể Số 0 đã thoát ra ngoài. Nó sẽ đến tìm các bạn.' },
    { who: 'PHONG', text: 'Tôi chỉnh tai nghe lần cuối. Đêm mai, hoặc là tất cả, hoặc là không gì cả.' },
  ],
  41: [
    { who: 'PHONG', text: 'Đêm đầu trên cao tốc. Thùng mẫu lạnh nằm trong cabin, đèn báo nhiệt độ vẫn xanh.' },
    { who: 'RADIO', text: 'Không quân gọi người mang mẫu: chúng tôi sẽ thả tiếp tế khi có thể. Đường bay rất nguy hiểm.' },
  ],
  42: [
    { who: 'RADIO', text: 'Cảnh báo: chủng nhảy. Chúng bật qua mìn và dây thép gai, đáp thẳng xuống hàng rào. Hạ chúng khi còn đang lao tới.' },
    { who: 'NHẬT KÝ', text: 'Tuấn nói anh đã chạy tuyến này hai mươi năm. Anh biết từng trạm xăng còn dầu.' },
  ],
  43: [
    { who: 'PHONG', text: 'Mất điện cả đêm. Những chiếc xe cháy là thứ ánh sáng duy nhất. Tôi bắn vào những cái bóng chạy qua ngọn lửa.' },
    { who: 'RADIO', text: 'Kho quân sự ở km 140 còn súng cối tự động. Nếu đủ tiền, đổi được một khẩu.' },
  ],
  44: [
    { who: 'RADIO', text: 'Chủng mới: Kẻ cháy. Chúng không sợ lửa, đốt luôn cả hàng rào. Dùng đạn thường hoặc chất nổ.' },
    { who: 'RADIO', text: 'Cảnh báo: một con khổng lồ đang lết dọc cao tốc. Nó to như con ở cảng Vọng Hải.' },
  ],
  45: [
    { who: 'PHONG', text: 'Quái Vật Cảng thứ hai gục xuống giữa đống xe. Ngọc quay lại tất cả. "Sau này người ta cần biết chuyện gì đã xảy ra," cô nói.' },
    { who: 'RADIO', text: 'Bệnh viện Trung ương: còn mười lăm ngày. Nhiệt độ thùng mẫu vẫn ổn định chứ?' },
  ],
  46: [
    { who: 'NHẬT KÝ', text: 'Cả đêm mưa, cả một bầy đàn đi qua như dòng sông. Hàng rào xe tải bốc khói đến sáng.' },
    { who: 'RADIO', text: 'Bệnh viện Trung ương: còn mười bốn ngày.' },
  ],
  47: [
    { who: 'PHONG', text: 'Thùng mẫu vẫn ổn. Tôi thì không chắc. Đã bốn mươi bảy đêm rồi.' },
    { who: 'RADIO', text: 'Không quân: chúng tôi thấy pháo sáng của các bạn. Thả hàng trong ba phút.' },
  ],
  48: [
    { who: 'NHẬT KÝ', text: 'Kẻ mang hòm lần này kéo theo một can dầu. Tuấn chửi thề suốt nửa tiếng.' },
    { who: 'RADIO', text: 'Vệ tinh ghi nhận một khối di chuyển rất lớn ở cửa ngõ thủ đô. Nó lao theo đường thẳng, như một chiếc xe ủi.' },
  ],
  49: [
    { who: 'PHONG', text: 'Đêm mai là đêm cuối trên cao tốc. Sau đó là thành phố, và những thứ đang chờ trong đó.' },
    { who: 'RADIO', text: 'Cỗ Máy Nghiền: lớp da dày như thép tấm, đạn thường chỉ xước. Hãy dùng chất nổ và súng xuyên giáp.' },
  ],
  51: [
    { who: 'PHONG', text: 'Thủ đô im lặng một cách kỳ lạ. Không còn tiếng còi xe, chỉ còn tiếng gió lùa qua những ô kính vỡ.' },
    { who: 'RADIO', text: 'Kho thiết bị của đội phản ứng nhanh còn tháp Tesla và drone chiến đấu. Rất đắt, nhưng đáng.' },
  ],
  52: [
    { who: 'RADIO', text: 'Chủng phân thân: khi gục, chúng tách ra thành những con non nhỏ và nhanh. Đừng để chúng dồn tới hàng rào.' },
    { who: 'NHẬT KÝ', text: 'Đạt đã dập ba đám cháy quanh phòng tuyến. Anh nói thành phố này là nhà anh.' },
  ],
  53: [
    { who: 'PHONG', text: 'Chúng tràn lên từ ga tàu điện ngầm như nước vỡ bờ. Có cái gì đó dưới đó đang sinh ra chúng.' },
    { who: 'RADIO', text: 'Bệnh viện Trung ương: tuyến đường số 2 đã thông được một nửa. Cầm cự tiếp.' },
  ],
  54: [
    { who: 'RADIO', text: 'Cảnh báo: chủng tàng hình. Da chúng đổi màu theo bóng tối. Chỉ thấy rõ khi chúng đã đến rất gần.' },
    { who: 'NHẬT KÝ', text: 'Hà đứng trên nóc xe buýt suốt đêm, không bắn trượt phát nào. Đội của cô đã hy sinh để giữ chính con đường này.' },
  ],
  55: [
    { who: 'PHONG', text: 'Hai con trùm, một đêm. Tôi không biết mình đã bắn bao nhiêu băng đạn.' },
    { who: 'RADIO', text: 'Bệnh viện Trung ương: còn năm ngày. Chúng tôi đã định vị được cái tổ. Nó ở ngay dưới quảng trường.' },
  ],
  56: [
    { who: 'NHẬT KÝ', text: 'Mất điện toàn thành phố. Chúng chạy nhanh hơn trong bóng tối, như thể bóng tối là nhà của chúng.' },
    { who: 'RADIO', text: 'Phong, đường dây của bệnh viện chập chờn. Cậu có thể nối lại ăng-ten trên nóc tòa nhà phát thanh không?' },
  ],
  57: [
    { who: 'PHONG', text: 'Tôi trèo lên nóc tòa nhà phát thanh quốc gia. Nơi tôi từng mơ được làm việc. Giờ tôi sửa nó bằng băng dính và dây đồng.' },
    { who: 'RADIO', text: 'Tín hiệu rõ rồi! Không quân sẽ thả mọi thứ còn lại xuống quảng trường.' },
  ],
  58: [
    { who: 'RADIO', text: 'Cả thủ đô đang thức giấc. Cái tổ dưới quảng trường đang gọi tất cả về. Đêm nay sẽ rất dài.' },
    { who: 'NHẬT KÝ', text: 'Đạt và Hà đứng hai bên tôi. Ba người, một hàng rào, một thùng mẫu lạnh.' },
  ],
  59: [
    { who: 'RADIO', text: 'Bệnh viện Trung ương: đường đã thông. Bình minh mai chúng tôi sẽ tới lấy mẫu. Nhưng thứ dưới quảng trường đã thức dậy. Nó là mẹ của tất cả.' },
    { who: 'PHONG', text: 'Một đêm nữa. Sáu mươi đêm. Tôi sẽ không dừng lại ở đêm cuối cùng.' },
  ],
};

// Hết chương 1: trực thăng đến, nhưng hành trình chưa kết thúc
export const ACT1_END = [
  { who: 'PHONG', text: 'Kẻ Khổng Lồ đổ sập xuống ngay trước hàng rào. Mặt đất rung lên lần cuối, rồi im bặt.' },
  { who: 'RADIO', text: 'Phi đội Hải Âu gọi người sống sót ở Cao Vọng. Chúng tôi thấy pháo sáng của các bạn. Đang hạ cánh!' },
  { who: 'PHONG', text: 'Tiếng cánh quạt xé tan màn sương. Ánh bình minh đầu tiên sau mười đêm dài rọi lên những bao cát rách nát.' },
  { who: 'RADIO', text: 'Tin xấu: hạm đội đã rút ra xa vì bão. Trực thăng chỉ còn một chỗ, và chỉ đủ nhiên liệu tới Cảng Vọng Hải.' },
  { who: 'PHONG', text: 'Lan và Ông Tư đẩy tôi lên. "Cậu là người duy nhất biết sửa radio. Bọn tôi sẽ đi chuyến sau." Cánh cửa đóng lại trước khi tôi kịp nói gì.' },
];

export const ACT2_INTRO = [
  { who: 'RADIO', text: 'Cảng Vọng Hải là điểm sơ tán cuối cùng của vùng duyên hải. Tàu Bình Minh sẽ cập cầu tàu số 3 sau MƯỜI đêm nữa.' },
  { who: 'PHONG', text: 'Trực thăng thả tôi xuống cầu tàu rồi quay đầu. Một mình. Cả thành phố cảng chìm trong bóng tối, và bóng tối đang chuyển động.' },
  { who: 'PHONG', text: 'Container chắn ngang, tôn lợp làm khiên. Lại một hàng rào nữa. Lại mười đêm nữa.' },
];

// Hết màn 1 (đêm 20): tàu cập bến, nhưng hành trình mới bắt đầu
export const STAGE1_END = [
  { who: 'PHONG', text: 'Quái Vật Cảng gục xuống, kéo theo nửa cầu tàu chìm vào làn nước đen.' },
  { who: 'RADIO', text: 'Tàu Bình Minh gọi cầu tàu số 3. Chúng tôi đang cập bến. Thả dây! Mọi người lên tàu ngay!' },
  { who: 'PHONG', text: 'Tiếng còi tàu vang dài qua mặt biển. Hai mươi đêm. Tôi tưởng mọi thứ đã kết thúc.' },
  { who: 'PHONG', text: 'Bảo và Mai ở lại trên tàu. Tàu Bình Minh phải đưa hàng trăm người ra hạm đội, và họ cần một thợ máy, một người biết đường.' },
];

export const STAGE2_INTRO = [
  { who: 'RADIO', text: '…rè… Đây là Trạm Nghiên Cứu Hồng Sơn. Chúng tôi có mẫu vắc-xin. Cần hai mươi ngày để điều chế. Trạm đang bị vây. Ai nghe được… xin hãy đến.' },
  { who: 'PHONG', text: 'Thuyền trưởng nhìn tôi. Cả nhóm nhìn tôi. Tôi là người duy nhất hiểu tín hiệu đó đến từ đâu.' },
  { who: 'PHONG', text: 'Thuyền trưởng cho tôi một chiếc xuồng máy. Tôi ngược sông lên núi một mình. Ở Hồng Sơn có những người khác cũng đang chiến đấu.' },
  { who: 'RADIO', text: 'MÀN 2 · MẬT MÃ HỒNG SƠN. Giữ cổng đập mười đêm, rồi giữ căn cứ thêm mười đêm nữa, cho đến khi vắc-xin hoàn tất.' },
];

export const ACT3_END = [
  { who: 'PHONG', text: 'Bạo Chúa Rừng đổ sập xuống mép đập. Bê tông nứt toác dưới sức nặng của nó.' },
  { who: 'RADIO', text: 'Đập không trụ được nữa. Rút vào căn cứ trong lòng núi ngay! Chúng tôi sẽ mở cổng thép.' },
  { who: 'PHONG', text: 'Hùng và Linh ở lại trên mép đập cầm chân bầy đàn cho tôi chạy. Cánh cổng thép đóng sập sau lưng. Tôi vẫn nghe tiếng súng máy của Hùng rất lâu.' },
];

export const ACT4_INTRO = [
  { who: 'PHONG', text: 'Căn cứ Hồng Sơn: tường thép, đèn pha, tháp canh, và phòng thí nghiệm của bác sĩ Khoa ở trung tâm.' },
  { who: 'RADIO', text: 'Mười đêm cuối. Vắc-xin đang được điều chế. Phong, chúng tôi cần cậu giữ cho bộ phát sóng sống sót.' },
];

export const STAGE2_END = [
  { who: 'PHONG', text: 'Mẫu Thể Số 0 gục xuống trước cánh cổng thép. Sau bốn mươi đêm, mọi thứ im lặng.' },
  { who: 'RADIO', text: 'Bác sĩ Khoa: vắc-xin đã hoàn tất. Phong, đến lượt cậu.' },
  { who: 'PHONG', text: 'Tôi đeo tai nghe, đặt tay lên bộ phát sóng. Tần số khẩn cấp, mọi băng tần, toàn quốc.' },
  { who: 'PHONG', text: 'Đây là Phong, trạm phát thanh Bến Sương. Nếu bạn còn nghe được… chúng tôi có thuốc chữa. Hãy ghi lại công thức sau đây.' },
  { who: 'PHONG', text: 'Lần đầu tiên sau bốn mươi đêm, radio không còn tiếng rè. Chỉ có những giọng nói đáp lại, từ khắp mọi nơi.' },
  { who: 'RADIO', text: 'Bác sĩ Khoa: công thức là chưa đủ. Bệnh viện Trung ương ở thủ đô cần chủng gốc để sản xuất hàng triệu liều. Ai đó phải mang thùng mẫu này đi.' },
  { who: 'PHONG', text: 'Khoa và Vy phải ở lại giữ phòng thí nghiệm. Tôi nhận thùng mẫu lạnh. Lại một mình, lại một con đường mới.' },
];

export const STAGE3_INTRO = [
  { who: 'RADIO', text: 'MÀN 3 · CHUYẾN HÀNG CUỐI CÙNG. Ba trăm cây số cao tốc Bắc Nam. Rồi thủ đô. Thùng mẫu phải đến Bệnh viện Trung ương trong hai mươi ngày.' },
  { who: 'PHONG', text: 'Chiếc xe quân sự chết máy ở km 112. Phía trước là một đoàn xe tải bỏ hoang nằm ngang mặt đường. Tôi dựng hàng rào bằng chính những chiếc xe đó.' },
  { who: 'PHONG', text: 'Ngoài kia có những kẻ biết nhảy, và có những kẻ đang cháy mà vẫn bước đi. Tôi phải tìm người mới, dựng phòng tuyến mới.' },
];

export const ACT5_END = [
  { who: 'PHONG', text: 'Cỗ Máy Nghiền đổ ập xuống giữa cao tốc như một chiếc xe bọc thép lật nghiêng. Cửa ngõ thủ đô đã ở ngay trước mặt.' },
  { who: 'PHONG', text: 'Xe tải của Tuấn không chạy nổi thêm mét nào. Anh ở lại giữ trạm thu phí cho đoàn người tị nạn phía sau. Ngọc theo đoàn xe cứu trợ để dẫn đường cho không quân.' },
];

export const ACT6_INTRO = [
  { who: 'PHONG', text: 'Thủ đô. Những tòa nhà chọc trời tắt đèn, ga tàu điện ngầm thở ra hơi lạnh. Bệnh viện Trung ương chỉ còn cách mười dãy phố.' },
  { who: 'RADIO', text: 'Bệnh viện Trung ương gọi người mang mẫu. Cầm cự mười đêm trong khi chúng tôi dọn đường. Có thứ gì đó đang làm tổ dưới lòng thành phố.' },
];

export const ENDING = [
  { who: 'PHONG', text: 'Nữ Hoàng Bầy Đàn gục xuống giữa quảng trường. Từng con non quanh nó đứng khựng lại, rồi đổ rạp xuống như những con rối đứt dây.' },
  { who: 'RADIO', text: 'Bệnh viện Trung ương: chúng tôi đã nhận được chủng gốc. Dây chuyền sản xuất bắt đầu lúc 6 giờ sáng. Một triệu liều mỗi tuần.' },
  { who: 'PHONG', text: 'Trực thăng cứu trợ bay qua đầu, từng chiếc một, mang theo những thùng vắc-xin đầu tiên về khắp các tỉnh.' },
  { who: 'PHONG', text: 'Sáu mươi đêm. Bến Sương, Vọng Hải, Hồng Sơn, cao tốc, thủ đô. Những người tôi gặp trên đường đều đã ở lại một nơi nào đó để tôi đi tiếp.' },
  { who: 'PHONG', text: 'Tôi đeo tai nghe. Trên mọi tần số, người ta đang gọi tên nhau. Lần này, họ đều được trả lời.' },
];

export const ENDLESS_NOTE = [
  { who: 'RADIO', text: 'Vắc-xin cần thời gian để đến được mọi nơi. Căn cứ Hồng Sơn sẽ là trạm phân phối, nếu nó còn đứng vững…' },
  { who: 'PHONG', text: 'Chế độ vô tận đã mở. Mỗi đêm khó hơn, cứ 5 đêm lại có một con trùm.' },
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
};

// Kỹ năng có hiệu lực khi người đó đã gia nhập nhóm và không bị thương
export const hasPerk = (data, id) => (data.crew || []).includes(id) && !((data.mates || {})[id]?.injured > 0);
