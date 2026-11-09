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
  20: 'Đêm cuối cùng. Thứ gì đó đang trồi lên từ lòng cảng.',
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
    { who: 'NHẬT KÝ', text: 'Sương dày đến mức không thấy nổi mũi súng. Tôi bắn theo tiếng rên. Lan nói tôi bắn trúng nhiều hơn tôi nghĩ.' },
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
    { who: 'NHẬT KÝ', text: 'Lần đầu tiên sau mười tám ngày, cả nhóm cùng cười. Ông Tư kể chuyện săn heo rừng.' },
  ],
  19: [
    { who: 'RADIO', text: 'Cảnh báo khẩn: thủy âm ghi nhận một cá thể khổng lồ đang di chuyển dưới nước về phía cầu tàu. Nó lớn hơn mọi thứ chúng tôi từng thấy.' },
    { who: 'PHONG', text: 'Đêm cuối. Tôi chỉnh tai nghe, kiểm tra từng băng đạn. Dù có chuyện gì, sáng mai chúng tôi sẽ lên tàu.' },
  ],
};

// Hết chương 1: trực thăng đến, nhưng hành trình chưa kết thúc
export const ACT1_END = [
  { who: 'PHONG', text: 'Kẻ Khổng Lồ đổ sập xuống ngay trước hàng rào. Mặt đất rung lên lần cuối, rồi im bặt.' },
  { who: 'RADIO', text: 'Phi đội Hải Âu gọi người sống sót ở Cao Vọng. Chúng tôi thấy pháo sáng của các bạn. Đang hạ cánh!' },
  { who: 'PHONG', text: 'Tiếng cánh quạt xé tan màn sương. Ánh bình minh đầu tiên sau mười đêm dài rọi lên những bao cát rách nát.' },
  { who: 'RADIO', text: 'Tin xấu: hạm đội đã rút ra xa vì bão. Chúng tôi chỉ đủ nhiên liệu để đưa các bạn tới Cảng Vọng Hải.' },
];

export const ACT2_INTRO = [
  { who: 'RADIO', text: 'Cảng Vọng Hải là điểm sơ tán cuối cùng của vùng duyên hải. Tàu Bình Minh sẽ cập cầu tàu số 3 sau MƯỜI đêm nữa.' },
  { who: 'PHONG', text: 'Trực thăng thả chúng tôi xuống cầu tàu rồi quay đầu. Cả thành phố cảng chìm trong bóng tối, và bóng tối đang chuyển động.' },
  { who: 'PHONG', text: 'Container chắn ngang, tôn lợp làm khiên. Lại một hàng rào nữa. Lại mười đêm nữa.' },
];

export const ENDING = [
  { who: 'PHONG', text: 'Quái Vật Cảng gục xuống, kéo theo nửa cầu tàu chìm vào làn nước đen.' },
  { who: 'RADIO', text: 'Tàu Bình Minh gọi cầu tàu số 3. Chúng tôi đang cập bến. Thả dây! Mọi người lên tàu ngay!' },
  { who: 'PHONG', text: 'Tiếng còi tàu vang dài qua mặt biển. Mặt trời lên, đỏ như một lời hứa.' },
  { who: 'PHONG', text: 'Hai mươi đêm. Tôi tháo tai nghe xuống. Lần đầu tiên, ngoài kia không còn tiếng rè nào nữa.' },
];

export const ENDLESS_NOTE = [
  { who: 'RADIO', text: 'Vẫn còn những người kẹt lại ở Vọng Hải. Tàu Bình Minh sẽ quay lại mỗi tuần, nếu cầu tàu còn đứng vững…' },
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
    id: 'lan', name: 'Lan', role: 'Y tá', perk: 'Sửa rào hiệu quả hơn 35%',
    look: { shirt: '#e8eef2', pants: '#3b4a5c', skin: '#f0c9a0', hair: '#1b1410' },
    intro: 'Một cô y tá trốn trong hiệu thuốc, tay còn cầm cuộn băng gạc. "Tôi biết cách vá mọi thứ. Kể cả hàng rào."',
  },
  {
    id: 'tu', name: 'Ông Tư', role: 'Thợ săn', perk: 'Bắn chính xác, sát thương gấp đôi',
    look: { shirt: '#5b5236', pants: '#2b2a22', skin: '#c58c5c', hat: '#3a3324' },
    intro: 'Ông lão thợ săn ngồi trên nóc nhà kho, khẩu súng săn trên đùi. "Bốn mươi năm săn heo rừng. Mấy thứ này còn chậm hơn."',
  },
  {
    id: 'bao', name: 'Bảo', role: 'Thợ máy', perk: 'Hàng rào tự hồi phục trong đêm',
    look: { shirt: '#3c6e8f', pants: '#2b2f3a', skin: '#e0b48c', hat: '#c46a2a' },
    intro: 'Một thợ máy cố thủ trong gara với cái mỏ hàn. "Cho tôi ít sắt vụn, hàng rào của anh sẽ tự liền vết thương."',
  },
  {
    id: 'mai', name: 'Mai', role: 'Sinh viên', perk: 'Lục lọi thu được thêm 30%',
    look: { shirt: '#8f3c6d', pants: '#2b2f3a', skin: '#f0c9a0', hair: '#5a3418' },
    intro: 'Cô sinh viên trốn trong thư viện, ba lô đầy đồ hộp. "Tôi thuộc lòng bản đồ thị trấn. Chỗ nào còn đồ, tôi biết hết."',
  },
];

export const hasPerk = (data, id) => (data.crew || []).includes(id);
