import { Book, Badge, UserProfile } from "./types";

export const CURATED_BOOKS: Book[] = [
  {
    id: "curated-1",
    title: "Hoàng Tử Bé",
    author: "Antoine de Saint-Exupéry",
    category: "Văn học cổ điển & Triết lý",
    zpdRating: "Vừa vặn phát triển +10%",
    whyRecommend: "Tác phẩm chứa đựng những bài học sâu sắc về cuộc sống, tình yêu thương và cái nhìn thuần khiết thích hợp để rèn luyện sự đồng cảm của học sinh.",
    microGoal: {
      pagesPerSession: 8,
      timeEstimateMinutes: 10,
      totalSessions: 12,
      sessionDescription: "Đọc 8 trang mỗi phiên tối, tổng cộng 12 phiên để mở cánh cửa thế giới tinh thần tuổi trẻ."
    },
    skillsUnlocked: "Khả năng thấu cảm, Trí tưởng tượng phong phú, Từ vựng biểu cảm",
    coverTheme: "from-sky-400 via-blue-600 to-indigo-800",
    sessionsCompleted: 0,
    isCompleted: false,
    notes: [],
    chatHistory: [
      {
        id: "sys-welcome",
        role: "model",
        content: "Chào mừng cậu đến với hành lang sao của Hoàng Tử Bé! 🪐 Tớ là AI Reading Mentor của cậu. Hôm nay chúng mình hãy bắt đầu với 8 trang đầu tiên nha. Hãy nhấn đọc và chuẩn bị tinh thần chia sẻ cảm tưởng sâu lắng với tớ sau khi đọc nhé!",
        timestamp: new Date().toISOString()
      }
    ]
  },
  {
    id: "curated-2",
    title: "Khuyến Học",
    author: "Fukuzawa Yukichi",
    category: "Tư duy xã hội & Kỹ năng sống",
    zpdRating: "Thử thách nhẹ +15%",
    whyRecommend: "Tuyệt phẩm giúp định hình chí khí tự học, ý thức quốc gia và tư duy bình đẳng, rất phù hợp cho học sinh THPT chuẩn bị bước ra thế giới.",
    microGoal: {
      pagesPerSession: 6,
      timeEstimateMinutes: 12,
      totalSessions: 20,
      sessionDescription: "Đọc 6 trang văn bản nghị luận cô đọng mỗi ngày để rèn tư duy logic sắc bén."
    },
    skillsUnlocked: "Tư duy phản biện, Ý thức độc lập tự cường, Từ vựng tranh biện",
    coverTheme: "from-amber-700 via-yellow-800 to-amber-950",
    sessionsCompleted: 0,
    isCompleted: false,
    notes: [],
    chatHistory: [
      {
        id: "sys-welcome",
        role: "model",
        content: "Chào tinh anh học đường! 📚 Trình độ của cậu hoàn toàn đáp ứng được sự uyên bác của Fukuzawa Yukichi. Hãy bắt đầu chiến dịch 'Khuyến Học' với 6 trang mở đầu hôm nay nhé!",
        timestamp: new Date().toISOString()
      }
    ]
  },
  {
    id: "curated-3",
    title: "Lược Sử Thời Gian",
    author: "Stephen Hawking",
    category: "Khoa học vũ trụ & Triết học lý thuyết",
    zpdRating: "Thách thức tư duy +18%",
    whyRecommend: "Kích thích tư duy hệ thống và thế giới quan khoa học vĩ mô, nâng tầm vốn từ vựng học thuật của học sinh lên một đẳng cấp mới.",
    microGoal: {
      pagesPerSession: 5,
      timeEstimateMinutes: 15,
      totalSessions: 18,
      sessionDescription: "Chỉ 5 trang mỗi phiên nhưng cần độ tập trung cao độ để thẩm thấu sâu các khái niệm lượng tử lý thú."
    },
    skillsUnlocked: "Tư duy hệ thống vũ trụ, Óc suy luận logic, Vốn từ học thuật",
    coverTheme: "from-slate-900 via-indigo-950 to-purple-900",
    sessionsCompleted: 0,
    isCompleted: false,
    notes: [],
    chatHistory: [
      {
        id: "sys-welcome",
        role: "model",
        content: "Này nhà khoa học trẻ của tương lai! 🌌 Cuốn sách đầy bí ẩn này sẽ kéo cậu đi từ điểm kỳ dị tới hố đen vũ trụ. Hãy rèn luyện óc tò mò cùng tớ với 5 trang đầu tiên nhé!",
        timestamp: new Date().toISOString()
      }
    ]
  },
  {
    id: "curated-4",
    title: "Tuổi Trẻ Đáng Giá Bao Nhiêu?",
    author: "Rosie Nguyễn",
    category: "Định hướng bản thân & Kỹ năng",
    zpdRating: "Dễ tiếp cận cảm xúc +5%",
    whyRecommend: "Cuốn sách tuyệt vời bàn về hành trình tự học, đi tìm đam mê và chuẩn bị hành trang tốt nhất cho các bạn trẻ Việt Nam.",
    microGoal: {
      pagesPerSession: 10,
      timeEstimateMinutes: 12,
      totalSessions: 22,
      sessionDescription: "Nhịp đọc thoải mái 10 trang mỗi ngày, thích hợp nạp cảm hứng sáng tạo và học hỏi."
    },
    skillsUnlocked: "Nhận thức bản thân, Định hướng phong cách sống, Kỹ năng tự học",
    coverTheme: "from-teal-600 via-emerald-700 to-green-800",
    sessionsCompleted: 0,
    isCompleted: false,
    notes: [],
    chatHistory: [
      {
        id: "sys-welcome",
        role: "model",
        content: "Chào cậu bạn đầy mơ mộng! 🌟 Tụi mình cùng lướt qua những trang sách đầy trải nghiệm của tác giả Rosie để tìm ra giá trị quý giá nhất của tuổi trẻ tụi mình nhen!",
        timestamp: new Date().toISOString()
      }
    ]
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: "badge-welcome",
    name: "Bạch Đằng Khởi Hành",
    description: "Nhấn nút đọc và bắt đầu cuộc hành trình rèn luyện thói quen đọc sách.",
    icon: "Compass",
    isUnlocked: false
  },
  {
    id: "badge-first-book",
    name: "Cán Đích Vĩ Đại",
    description: "Hoàn thành xuất sắc 100% các phiên đọc của một cuốn sách bất kỳ.",
    icon: "Trophy",
    isUnlocked: false
  },
  {
    id: "badge-streak-3",
    name: "Chiến Binh Kỷ Luật",
    description: "Đạt chuỗi đọc sách liên tiếp trong vòng 3 ngày rực lửa.",
    icon: "Flame",
    isUnlocked: false
  },
  {
    id: "badge-feynman",
    name: "Cố Vấn Feynman",
    description: "Giải thích xuất sắc ý tưởng phức tạp của một chương vừa đọc cho AI Reading Mentor.",
    icon: "Spade",
    isUnlocked: false
  },
  {
    id: "badge-critic",
    name: "Cố Vấn Phản Biện",
    description: "Mở khóa Tư duy Phản biện đạt cấp độ 2 trên Bản đồ tăng trưởng tri thức.",
    icon: "ShieldAlert",
    isUnlocked: false
  }
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Nam Nguyễn",
  interests: "Tâm lý học, Phát triển bản thân, Khoa học vũ trụ",
  vocabularyLevel: "Trung cấp",
  goals: "Duy trì đọc 15 phút mỗi tối để rèn tư duy sắc xảo",
  didOnboard: false,
  streakCount: 0,
  studentXP: 0,
  level: 1,
  unlockedSkills: {
    criticalThinking: { level: 1, xp: 10, max: 100 },
    vocabulary: { level: 1, xp: 20, max: 100 },
    empathy: { level: 1, xp: 15, max: 100 },
    systematic: { level: 1, xp: 5, max: 100 }
  },
  activeBookId: null,
  books: [],
  badges: INITIAL_BADGES
};

export const SAMPLE_NUDGES = [
  {
    id: "nudge-1",
    message: "Tối nay chín giờ nhe Nam ơi! Dành ra đúng 10 phút cho 8 trang mục tiêu tiếp theo nào. Đừng để vương quốc kiến trúc của cậu vắng bóng thủ lĩnh!",
    timeLabel: "9:00 PM",
    type: "remind"
  },
  {
    id: "nudge-2",
    message: "Cảm hứng tối nay: 'Sách là ngọn hải đăng được dựng lên trong đại dương thời gian.' — Edwin Percy Whipple.",
    timeLabel: "Quote của ngày",
    type: "quote"
  }
];
