// Cốt truyện: thị trấn Bến Sương, 10 đêm chờ trực thăng cứu hộ.

export const INTRO = [
  { who: 'RADIO', text: '…rè… rè… Đây là Đài Phát Thanh Khẩn Cấp vùng duyên hải. Dịch bệnh đã tràn qua thị trấn Bến Sương.' },
  { who: 'RADIO', text: 'Người nhiễm bệnh mất hết lý trí và tấn công mọi thứ còn sống. Chúng mạnh nhất về đêm. Không được ra ngoài sau khi mặt trời lặn.' },
  { who: 'RADIO', text: 'Trực thăng cứu hộ sẽ hạ cánh trên đồi Cao Vọng sau MƯỜI đêm nữa. Ai còn nghe được… hãy cố thủ. Hãy sống sót.' },
  { who: 'BẠN', text: 'Căn nhà cũ của ông ngoại nằm ngay chân đồi. Vài bao cát, mấy tấm ván, khẩu súng lục và hai quả lựu đạn trong rương gỗ.' },
  { who: 'BẠN', text: 'Thế là đủ để bắt đầu. Mặt trời vừa lặn, và tiếng rên rỉ đang đến gần.' },
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
    { who: 'NHẬT KÝ', text: 'Năm đêm. Mình đã đi được nửa đường.' },
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
    { who: 'NHẬT KÝ', text: 'Radio không còn phát gì nữa. Mình tự nhủ là do bão. Chỉ là do bão thôi.' },
  ],
  9: [
    { who: 'RADIO', text: '…rè… Đây là Phi đội Cứu hộ Hải Âu. Chúng tôi sẽ đến đồi Cao Vọng lúc bình minh sau đêm mai. Giữ vững!' },
    { who: 'RADIO', text: 'Cảnh báo: vệ tinh ghi nhận một cá thể khổng lồ đang tiến về phía đồi. Nó cao gấp đôi người thường.' },
    { who: 'NHẬT KÝ', text: 'Một đêm nữa thôi. Chỉ một đêm nữa.' },
  ],
};

export const ENDING = [
  { who: 'BẠN', text: 'Kẻ Khổng Lồ đổ sập xuống ngay trước hàng rào. Mặt đất rung lên lần cuối, rồi im bặt.' },
  { who: 'RADIO', text: 'Phi đội Hải Âu gọi người sống sót ở Cao Vọng. Chúng tôi thấy pháo sáng của bạn. Đang hạ cánh!' },
  { who: 'BẠN', text: 'Tiếng cánh quạt xé tan màn sương. Ánh bình minh đầu tiên sau mười đêm dài rọi lên những bao cát rách nát.' },
  { who: 'BẠN', text: 'Bến Sương ở lại phía sau. Nhưng mình đã sống sót. Và mình không đi một mình.' },
];

export const ENDLESS_NOTE = [
  { who: 'RADIO', text: 'Vẫn còn những người kẹt lại ở Bến Sương. Nếu bạn muốn quay lại giữ trạm Cao Vọng cho chuyến bay tiếp theo…' },
  { who: 'BẠN', text: 'Chế độ vô tận đã mở. Mỗi đêm khó hơn, cứ 5 đêm lại có một Kẻ Khổng Lồ.' },
];

export const GAMEOVER_LINES = [
  'Hàng rào sụp đổ. Bến Sương nuốt chửng thêm một người.',
  'Những tấm ván cuối cùng gãy vụn. Tiếng rên rỉ tràn vào căn nhà.',
  'Không ai còn ở đó để nghe radio vào sáng hôm sau.',
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
