import { RecipientType } from '../../types';

interface Template {
  titleSuggestions: string[];
  defaultHeroMessage: string;
  momentsSuggestions: { title: string; content: string }[];
  defaultEndingMessage: string;
}

export const EmotionalTemplates: Record<RecipientType, Template> = {
  LOVER: {
    titleSuggestions: [
      "Khoảnh Khắc Của Chúng Ta",
      "Anh Yêu Em",
      "Em Là Cả Thế Giới Của Anh",
      "Hành Trình Yêu Thương"
    ],
    defaultHeroMessage: "Trên thế gian này, không có trái tim nào dành cho anh như trái tim em.",
    momentsSuggestions: [
      { title: "Lần Đầu Gặp Gỡ", content: "Khoảnh khắc ấy, anh nhận ra thế giới của mình đã thay đổi mãi mãi." },
      { title: "Những Kỷ Niệm Ngọt Ngào", content: "Cùng em đi qua những tháng ngày bình dị mà tràn ngập tình yêu." }
    ],
    defaultEndingMessage: "Cảm ơn em vì đã xuất hiện và yêu anh. Mãi yêu em!"
  },
  MOTHER: {
    titleSuggestions: [
      "Cảm Ơn Mẹ Yêu",
      "Mẹ Là Vầng Thái Dương",
      "Nơi Bình Yên Nhất Là Nhà",
      "Lời Yêu Thương Gửi Mẹ"
    ],
    defaultHeroMessage: "Mẹ là người duy nhất trên đời yêu con vô điều kiện, che chở con qua mọi giông bão.",
    momentsSuggestions: [
      { title: "Vòng Tay 2 Bàn Tay Mẹ", content: "Bàn tay chai sần đã nuôi nấng con nên người, dìu dắt con từng bước đi." },
      { title: "Những Lời Mẹ Dạy", content: "Lời khuyên ấm áp của mẹ là ngọn đèn dẫn đường con vượt qua thử thách." }
    ],
    defaultEndingMessage: "Con mong mẹ luôn khỏe mạnh, vui vẻ. Con yêu mẹ rất nhiều!"
  },
  FATHER: {
    titleSuggestions: [
      "Cha Yêu Kính",
      "Bờ Vai Vững Chãi Của Cha",
      "Cảm Ơn Cha",
      "Người Anh Hùng Lặng Thầm"
    ],
    defaultHeroMessage: "Cha không nói nhiều, nhưng tình yêu thương của cha bao la như núi Thái Sơn cao vợi.",
    momentsSuggestions: [
      { title: "Tấm Lưng Rộng Của Cha", content: "Cả cuộc đời vất vả ngược xuôi gánh vác cả gia đình trên vai cha." },
      { title: "Dạy Con Trưởng Thành", content: "Cha dạy con bản lĩnh, sự kiên trì để bước vào đời một cách vững vàng." }
    ],
    defaultEndingMessage: "Con tự hào vì được làm con của cha. Cảm ơn cha yêu quý!"
  },
  SPOUSE: {
    titleSuggestions: [
      "Trọn Đời Bên Nhau",
      "Vợ/Chồng Yêu Thương",
      "Gia Đình Nhỏ, Hạnh Phúc To",
      "Lời Hứa Trăm Năm"
    ],
    defaultHeroMessage: "Cảm ơn anh/em đã cùng nắm tay đi qua những thăng trầm cuộc sống, dựng xây tổ ấm.",
    momentsSuggestions: [
      { title: "Ngày Chúng Ta Chung Đôi", content: "Khoảnh khắc trao nhau chiếc nhẫn cưới, hứa hẹn trọn đời thủy chung." },
      { title: "Cùng Nhau Vượt Khó", content: "Chia ngọt sẻ bùi, cùng vượt qua những ngày tháng gian nan nhất." }
    ],
    defaultEndingMessage: "Mong chúng ta sẽ mãi nắm chặt tay nhau đi đến tận cùng hành trình cuộc đời!"
  },
  FAMILY: {
    titleSuggestions: [
      "Tổ Ấm Thân Thương",
      "Gia Đình Là Tất Cả",
      "Sum Vầy Hạnh Phúc",
      "Khoảnh Khắc Gia Đình"
    ],
    defaultHeroMessage: "Gia đình là nơi cuộc sống bắt đầu và tình yêu không bao giờ kết thúc.",
    momentsSuggestions: [
      { title: "Bữa Cơm Sum Họp", content: "Tiếng cười rộn rã quanh mâm cơm, nơi mọi mệt mỏi đều tan biến." },
      { title: "Những Chuyến Đi Chung", content: "Cùng nhau khám phá thế giới, ghi lại những kỷ niệm ngập tràn tiếng cười." }
    ],
    defaultEndingMessage: "Gia đình mãi là bến đỗ bình yên nhất của con. Con yêu mọi người!"
  },
  GRANDPARENT: {
    titleSuggestions: [
      "Kính Yêu Ông Bà",
      "Lời Chúc Sức Khỏe Ông Bà",
      "Kỷ Niệm Bên Ông Bà",
      "Bình Yên Tuổi Già"
    ],
    defaultHeroMessage: "Mái tóc sương pha và tình yêu thương dịu hiền của ông bà là cả bầu trời tuổi thơ của con.",
    momentsSuggestions: [
      { title: "Chuyện Kể Ngày Xưa", content: "Những buổi chiều ngồi nghe ông kể chuyện lịch sử, bà ru câu ca dao ngọt ngào." },
      { title: "Sự Bao Dung Của Ông Bà", content: "Ông bà luôn chở che, bênh vực mỗi khi con mắc lỗi nhỏ." }
    ],
    defaultEndingMessage: "Kính chúc ông bà luôn dồi dào sức khỏe, sống lâu trăm tuổi cùng con cháu!"
  },
  FRIEND: {
    titleSuggestions: [
      "Tình Bạn Diệu Kỳ",
      "Chúng Ta Là Bạn Thân",
      "Mãi Là Tri Kỷ",
      "Thanh Xuân Rực Rỡ"
    ],
    defaultHeroMessage: "Cảm ơn vì đã luôn ở bên tớ, chia sẻ mọi buồn vui và cùng tớ đi qua những ngày giông bão.",
    momentsSuggestions: [
      { title: "Những Ngày Trẻ Dại", content: "Cùng nhau trốn học, chia đôi gói mì, cười nói thâu đêm suốt sáng." },
      { title: "Luôn Ở Bên Nhau", content: "Khi tớ vấp ngã, cậu luôn là người đầu tiên đưa tay ra nâng đỡ và động viên." }
    ],
    defaultEndingMessage: "Chúc cho tình bạn của tụi mình mãi bền chặt, cùng nhau đi qua thật nhiều năm tháng nữa!"
  },
  CHILD: {
    titleSuggestions: [
      "Con Yêu Bé Bỏng",
      "Bình Minh Của Bố Mẹ",
      "Thiên Thần Nhỏ",
      "Nhìn Con Trưởng Thành"
    ],
    defaultHeroMessage: "Con là món quà tuyệt vời nhất mà cuộc đời đã ban tặng cho bố mẹ.",
    momentsSuggestions: [
      { title: "Tiếng Khóc Chào Đời", content: "Giây phút bế con trên tay, bố mẹ biết từ nay mình có một sứ mệnh thiêng liêng." },
      { title: "Bước Chân Đầu Tiên", content: "Chứng kiến con chập chững những bước đi đầu đời và gọi tiếng 'bố mẹ'." }
    ],
    defaultEndingMessage: "Bố mẹ mong con luôn vui tươi, khỏe mạnh và hạnh phúc trên con đường riêng của mình!"
  },
  TEACHER: {
    titleSuggestions: [
      "Người Lái Đò Thầm Lặng",
      "Tri Ân Thầy Cô",
      "Bụi Phấn Nhạt Phai",
      "Nghĩa Tình Sư Đạo"
    ],
    defaultHeroMessage: "Một chữ cũng là thầy, nửa chữ cũng là thầy. Kính chúc thầy cô vạn sự như ý.",
    momentsSuggestions: [
      { title: "Bài Giảng Đầu Tiên", content: "Nét chữ đầu đời, bài học đạo đức làm người thầy cô đã ân cần chỉ bảo." },
      { title: "Sự Tận Tụy Tắm Mát", content: "Những đêm thức trắng soạn giáo án, lo lắng cho kỳ thi của từng học sinh thân yêu." }
    ],
    defaultEndingMessage: "Chúng con xin gửi lời tri ân sâu sắc nhất tới thầy cô vì sự nghiệp trồng người cao cả!"
  },
  OTHER: {
    titleSuggestions: [
      "Mảnh Ghép Kỷ Niệm",
      "Lời Gửi Gắm Yêu Thương",
      "Món Quà Bất Ngờ",
      "Lưu Giữ Khoảnh Khắc"
    ],
    defaultHeroMessage: "Cuộc sống trở nên tươi đẹp hơn khi có những người đặc biệt như bạn xung quanh.",
    momentsSuggestions: [
      { title: "Khoảnh Khắc Gặp Nhau", content: "Nhân duyên đưa chúng ta đồng hành cùng nhau trên một chặng đường ý nghĩa." },
      { title: "Kỷ Niệm Đồng Hành", content: "Cùng nhau vượt qua thử thách công việc và cuộc sống hằng ngày." }
    ],
    defaultEndingMessage: "Chúc bạn luôn đong đầy niềm vui, may mắn và hạnh phúc trên mọi hành trình!"
  }
};
