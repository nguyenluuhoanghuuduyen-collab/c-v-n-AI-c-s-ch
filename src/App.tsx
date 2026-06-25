import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Award,
  MessageSquare,
  Plus,
  Trash2,
  Compass,
  Flame,
  ShieldAlert,
  Spade,
  Trophy,
  Clock,
  Sparkles,
  BookOpenCheck,
  UserCheck,
  Target,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Search,
  BookMarked
} from "lucide-react";
import { Book, UserProfile, ChatMessage, StudentSkills, Badge } from "./types";
import { CURATED_BOOKS, DEFAULT_USER_PROFILE, SAMPLE_NUDGES } from "./data";
import Onboarding from "./components/Onboarding";
import KnowledgeMap from "./components/KnowledgeMap";
import BookSession from "./components/BookSession";
import MentorChat from "./components/MentorChat";

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "active-session" | "chat">("dashboard");
  const [addingBookMode, setAddingBookMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New book state form
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");
  const [newBookCategory, setNewBookCategory] = useState("Văn học / Tâm lý");
  const [newBookPages, setNewBookPages] = useState(8);
  const [newBookMinutes, setNewBookMinutes] = useState(12);
  const [newBookSessions, setNewBookSessions] = useState(15);
  
  // Backend loading states
  const [chatLoading, setChatLoading] = useState(false);
  const [apiHealth, setApiHealth] = useState({ hasApiKey: false, checked: false });

  // Load from local storage initially
  useEffect(() => {
    const saved = localStorage.getItem("ai_reading_mentor_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
      } catch (e) {
        setProfile({ ...DEFAULT_USER_PROFILE, books: CURATED_BOOKS });
      }
    } else {
      // Setup default curated books ready to view or go onboard
      setProfile({ ...DEFAULT_USER_PROFILE, books: CURATED_BOOKS });
    }

    // Check API availability
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setApiHealth({ hasApiKey: d.hasApiKey, checked: true }))
      .catch(() => setApiHealth({ hasApiKey: false, checked: true }));
  }, []);

  // Save to local storage on profile update
  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem("ai_reading_mentor_profile", JSON.stringify(newProfile));
  };

  if (!profile) return null;

  // Complete onboarding flow
  const handleOnboardingComplete = (
    name: string,
    interests: string,
    vocab: "Sơ cấp" | "Trung cấp" | "Cao cấp",
    goals: string,
    recommended: Book[]
  ) => {
    // Merge recommended books with default ones
    const combinedBooks = recommended.length > 0 ? [...recommended, ...CURATED_BOOKS] : CURATED_BOOKS;
    
    // Unlock first welcome badge on boarding
    const initialBadges = [...profile.badges];
    const welcomeBadge = initialBadges.find((b) => b.id === "badge-welcome");
    if (welcomeBadge) {
      welcomeBadge.isUnlocked = true;
      welcomeBadge.earnedAt = new Date().toISOString();
    }

    const newProfile: UserProfile = {
      ...profile,
      name,
      interests,
      vocabularyLevel: vocab,
      goals,
      didOnboard: true,
      books: combinedBooks,
      activeBookId: combinedBooks[0].id,
      badges: initialBadges,
      streakCount: Math.max(1, profile.streakCount) // Start light streak!
    };
    updateProfile(newProfile);
  };

  // Add custom manual book brought to school
  const handleAddManualBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim() || !newBookAuthor.trim()) return;

    const bookEntry: Book = {
      id: `custom-${Date.now()}`,
      title: newBookTitle,
      author: newBookAuthor,
      category: newBookCategory,
      zpdRating: "Cá nhân hóa tự chọn",
      skillsUnlocked: "Tâm lý học hành vi, Kỹ năng tự lực",
      coverTheme: "from-stone-600 via-stone-700 to-stone-900",
      sessionsCompleted: 0,
      isCompleted: false,
      notes: [],
      chatHistory: [
        {
          id: `manual-welcome-${Date.now()}`,
          role: "model",
          content: `Chào mừng cậu tới phiên đọc cuốn sách tự chọn "${newBookTitle}"! 💫 Hôm nay tớ đã sẵn sàng cùng cậu khai thác cốt lõi vấn đề của tác phẩm này. Hãy đọc và ghi note lại nhen!`,
          timestamp: new Date().toISOString()
        }
      ],
      microGoal: {
        pagesPerSession: newBookPages,
        timeEstimateMinutes: newBookMinutes,
        totalSessions: newBookSessions,
        sessionDescription: `Đọc ${newBookPages} trang (khoảng ${newBookMinutes} phút) nhằm chinh phục 1 phiên trong tổng ${newBookSessions} cột mốc.`
      }
    };

    const newProfile = {
      ...profile,
      books: [bookEntry, ...profile.books],
      activeBookId: bookEntry.id
    };
    updateProfile(newProfile);
    setNewBookTitle("");
    setNewBookAuthor("");
    setAddingBookMode(false);
  };

  // Delete a book from library
  const handleDeleteBook = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = profile.books.filter((b) => b.id !== bookId);
    const newActiveId = profile.activeBookId === bookId 
      ? (filtered.length > 0 ? filtered[0].id : null) 
      : profile.activeBookId;

    updateProfile({
      ...profile,
      books: filtered,
      activeBookId: newActiveId
    });
  };

  // Select active active book
  const selectActiveBook = (bookId: string) => {
    updateProfile({
      ...profile,
      activeBookId: bookId
    });
    setActiveTab("dashboard");
  };

  // Finish a reading session & trigger gamification reward engines
  const handleFinishSession = (notesText: string, timeSpentSeconds: number) => {
    const bookId = profile.activeBookId;
    if (!bookId) return;

    const updatedBooks = profile.books.map((b) => {
      if (b.id === bookId) {
        const nextCompleted = b.sessionsCompleted + 1;
        const totalReq = b.microGoal.totalSessions;
        const isCompleted = nextCompleted >= totalReq;

        // Custom model welcome seed prompt
        const promptSeed: ChatMessage = {
          id: `notes-seed-${Date.now()}`,
          role: "user",
          content: `Tớ vừa hoàn thành phiên đọc thứ ${nextCompleted}. Sổ tay thu hoạch nhanh của tớ: "${notesText}"`,
          timestamp: new Date().toISOString()
        };

        return {
          ...b,
          sessionsCompleted: nextCompleted,
          isCompleted,
          notes: [...b.notes, notesText],
          chatHistory: [...b.chatHistory, promptSeed]
        };
      }
      return b;
    });

    // Reward calculations (XP, level-up)
    const xpReward = 20; // base finished session reward
    let newTotalXP = profile.studentXP + xpReward;
    let newLevel = profile.level;
    const levelThreshold = 100;
    if (Math.floor(newTotalXP / levelThreshold) > Math.floor(profile.studentXP / levelThreshold)) {
      newLevel = Math.floor(newTotalXP / levelThreshold) + 1;
    }

    // Allocate XP into user cognitive skills vector
    const updatedSkills = { ...profile.unlockedSkills };
    const skillsList = ["criticalThinking", "vocabulary", "empathy", "systematic"] as const;
    const pickedSkill = skillsList[Math.floor(Math.random() * skillsList.length)];
    updatedSkills[pickedSkill].xp += 15;
    if (updatedSkills[pickedSkill].xp >= updatedSkills[pickedSkill].max) {
      updatedSkills[pickedSkill].level += 1;
      updatedSkills[pickedSkill].xp = updatedSkills[pickedSkill].xp % updatedSkills[pickedSkill].max;
    }

    // Increase streak safely
    let currentStreak = profile.streakCount;
    const today = new Date().toDateString();
    if (profile.lastActiveDate !== today) {
      currentStreak += 1;
    }

    // Check Badges trigger conditions
    const updatedBadges = [...profile.badges];
    
    // Welcome badge trigger
    const welcomeB = updatedBadges.find(b => b.id === "badge-welcome");
    if (welcomeB && !welcomeB.isUnlocked) {
      welcomeB.isUnlocked = true;
      welcomeB.earnedAt = new Date().toISOString();
    }

    // Streak medal 3 days trigger
    const streakB = updatedBadges.find(b => b.id === "badge-streak-3");
    if (streakB && !streakB.isUnlocked && currentStreak >= 3) {
      streakB.isUnlocked = true;
      streakB.earnedAt = new Date().toISOString();
    }

    // Feynman technique trigger (once they write notes)
    const feynmanB = updatedBadges.find(b => b.id === "badge-feynman");
    if (feynmanB && !feynmanB.isUnlocked && notesText.length > 10) {
      feynmanB.isUnlocked = true;
      feynmanB.earnedAt = new Date().toISOString();
    }

    // Critical think levels badge
    const criticB = updatedBadges.find(b => b.id === "badge-critic");
    if (criticB && !criticB.isUnlocked && updatedSkills.criticalThinking.level >= 2) {
      criticB.isUnlocked = true;
      criticB.earnedAt = new Date().toISOString();
    }

    // First book completed medal trigger
    const firstBookCompleted = updatedBooks.some(b => b.isCompleted);
    const finishB = updatedBadges.find(b => b.id === "badge-first-book");
    if (finishB && !finishB.isUnlocked && firstBookCompleted) {
      finishB.isUnlocked = true;
      finishB.earnedAt = new Date().toISOString();
    }

    updateProfile({
      ...profile,
      books: updatedBooks,
      studentXP: newTotalXP,
      level: newLevel,
      unlockedSkills: updatedSkills,
      streakCount: currentStreak,
      lastActiveDate: today,
      badges: updatedBadges
    });

    // Auto navigate student to Chat Lounge for immediate Socratic reaction
    setActiveTab("chat");
    triggerSocraticResponse(notesText, updatedBooks);
  };

  // Chat message engine: Connects with the Express AI server `/api/mentor/chat` route
  const handleSendChatMessage = async (text: string) => {
    const bookId = profile.activeBookId;
    if (!bookId) return;

    const activeBook = profile.books.find((b) => b.id === bookId);
    if (!activeBook) return;

    const userMsg: ChatMessage = {
      id: `chat-user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };

    const updatedBooks = profile.books.map((b) => {
      if (b.id === bookId) {
        return {
          ...b,
          chatHistory: [...b.chatHistory, userMsg]
        };
      }
      return b;
    });

    // update profile state client-side first for responsive rendering of their bubble
    updateProfile({
      ...profile,
      books: updatedBooks
    });

    triggerSocraticResponse(text, updatedBooks);
  };

  const triggerSocraticResponse = async (text: string, currentBooks: Book[]) => {
    const bookId = profile.activeBookId;
    if (!bookId) return;

    const activeBook = currentBooks.find((b) => b.id === bookId);
    if (!activeBook) return;

    setChatLoading(true);

    try {
      // Build Socratic Payload
      const historyForApi = activeBook.chatHistory.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chatHistory: historyForApi,
          bookTitle: activeBook.title,
          bookAuthor: activeBook.author,
          sessionPages: activeBook.microGoal.pagesPerSession,
          studentMessage: text,
          streakCount: profile.streakCount,
          studentXP: profile.studentXP
        })
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối đến AI Reading Mentor.");
      }

      const data = await response.json();
      const mentorText = data.mentorResponse;

      const aiMsg: ChatMessage = {
        id: `chat-ai-${Date.now()}`,
        role: "model",
        content: mentorText,
        timestamp: new Date().toISOString()
      };

      // Apply dynamic XP reward boosts on successful Socratic replies (+10 base)
      const xpReward = 15;
      let newTotalXP = profile.studentXP + xpReward;
      let newLevel = profile.level;
      if (Math.floor(newTotalXP / 100) > Math.floor(profile.studentXP / 100)) {
        newLevel = Math.floor(newTotalXP / 100) + 1;
      }

      const updatedSkills = { ...profile.unlockedSkills };
      const skillsList = ["criticalThinking", "vocabulary", "empathy", "systematic"] as const;
      const pickedSkill = skillsList[Math.floor(Math.random() * skillsList.length)];
      updatedSkills[pickedSkill].xp += 10;
      if (updatedSkills[pickedSkill].xp >= updatedSkills[pickedSkill].max) {
        updatedSkills[pickedSkill].level += 1;
        updatedSkills[pickedSkill].xp = updatedSkills[pickedSkill].xp % updatedSkills[pickedSkill].max;
      }

      const postChatBooks = currentBooks.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            chatHistory: [...b.chatHistory, aiMsg]
          };
        }
        return b;
      });

      updateProfile({
        ...profile,
        books: postChatBooks,
        studentXP: newTotalXP,
        level: newLevel,
        unlockedSkills: updatedSkills
      });

    } catch (e: any) {
      console.error(e);
      // Fail gracefully: push temporary offline response helper
      const offlineMsg: ChatMessage = {
        id: `chat-fail-${Date.now()}`,
        role: "model",
        content: "😅 Chào cậu nhen! Trí tuệ AI Mentor đang bận tiếp thu kiến thức ngoài biển khơi chút xíu. Nhưng đừng lo, sổ tay tập trung thâu đêm của cậu đã được ghi nhận tuyệt vời vào Bản Đồ Tri Thức cục bộ. Hôm nay cậu đã làm xuất sắc rồi! 🌟 [Hẹn gặp lại cậu vào phiên đọc tối mai nhe!]",
        timestamp: new Date().toISOString()
      };

      const postChatBooks = currentBooks.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            chatHistory: [...b.chatHistory, offlineMsg]
          };
        }
        return b;
      });

      updateProfile({
        ...profile,
        books: postChatBooks
      });
    } finally {
      setChatLoading(false);
    }
  };

  // Filter book search query
  const filteredBooks = profile.books.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBook = profile.books.find((b) => b.id === profile.activeBookId) || null;

  // Onboard first if never set survey done
  if (!profile.didOnboard) {
    return (
      <div className="min-h-screen bg-stone-50 py-12 px-6 flex items-center justify-center">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans flex flex-col justify-between">
      
      {/* Top Header Panel */}
      <header className="bg-white border-b border-stone-150 py-4 px-6 sticky top-0 z-40 shadow-sm" id="main-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl text-white shadow-md">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-850 tracking-tight font-sans">Người Đồng Hành Đọc Sách Thông Minh</h1>
              <p className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase">Socratic AI Mentor & Gamified Reading Room</p>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 shadow-sm text-xs font-semibold text-amber-800">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Chuỗi {profile.streakCount} ngày</span>
            </div>

            <div className="flex items-center gap-2 text-stone-600 font-semibold text-xs">
              <span className="text-stone-400">Tài khoản:</span>
              <span className="text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full">{profile.name}</span>
            </div>

            <span className="h-6 w-[1px] bg-stone-200" />

            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-stone-400">Trình Học Thức</div>
              <div className="text-xs font-bold text-amber-600">Cấp {profile.level} ({profile.studentXP} XP)</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Interactive panel (Catalog & add books) - spans 4 columns */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* Active profile & ZPD details */}
          <div className="p-5 bg-white border border-stone-200 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                <Target className="w-4.5 h-4.5 text-amber-600" />
                Vùng ZPD của {profile.name}
              </h3>
              <button
                onClick={() => updateProfile({ ...profile, didOnboard: false })}
                className="text-[10px] text-amber-700 hover:underline font-bold transition cursor-pointer"
              >
                Khảo sát lại
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pt-1">
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                <span className="block text-stone-400 font-semibold uppercase mb-0.5 text-[9px]">Từ vựng xã hội</span>
                <strong className="text-stone-700 text-xs">{profile.vocabularyLevel}</strong>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                <span className="block text-stone-400 font-semibold uppercase mb-0.5 text-[9px]">Mục tiêu ngày</span>
                <strong className="text-stone-700 text-xs truncate block" title={profile.goals}>{profile.goals}</strong>
              </div>
            </div>

            <div className="text-[11px] text-stone-400 leading-relaxed bg-amber-50/20 p-3 rounded-xl border border-amber-50">
              💡 <strong>Hệ thống đề xuất:</strong> Vùng phát triển gần nhất (Zone of Proximal Development) khuyên bạn chọn biểu đồ sách có nhãn <strong className="text-amber-800">+10% đến +18%</strong> để rèn dũa từ vựng học thuật tối ưu nhất.
            </div>
          </div>

          {/* Book Catalog list */}
          <div className="p-5 bg-white border border-stone-200 rounded-2xl flex flex-col h-[480px] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-amber-600" />
                Kệ Sách Của Cậu ({profile.books.length})
              </h3>
              <button
                onClick={() => setAddingBookMode(!addingBookMode)}
                className="p-1 text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow-sm cursor-pointer"
                title="Bồi đắp thêm sách ngoài"
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Quick search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm sách..."
                className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-lg text-xs font-semibold placeholder-stone-400"
              />
            </div>

            {/* Manual Book enrollment screen if triggered */}
            {addingBookMode ? (
              <form onSubmit={handleAddManualBook} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-3 mb-3 overflow-y-auto flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-stone-500">Ghi nhận cuốn sách mới</span>
                  <button
                    type="button"
                    onClick={() => setAddingBookMode(false)}
                    className="text-[10px] text-stone-400 hover:text-stone-600 font-bold"
                  >
                    Hủy
                  </button>
                </div>
                
                <input
                  type="text"
                  required
                  placeholder="Tên sách muốn đọc..."
                  value={newBookTitle}
                  onChange={e => setNewBookTitle(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-stone-200 rounded text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Tác giả..."
                  value={newBookAuthor}
                  onChange={e => setNewBookAuthor(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-stone-200 rounded text-xs"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] uppercase font-bold text-stone-400">Số trang/phiên</label>
                    <input
                      type="number"
                      min={1}
                      value={newBookPages}
                      onChange={e => setNewBookPages(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase font-bold text-stone-400">Số phút/phiên</label>
                    <input
                      type="number"
                      min={1}
                      value={newBookMinutes}
                      onChange={e => setNewBookMinutes(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-stone-900 text-white font-bold rounded text-[10px] uppercase cursor-pointer tracking-wider"
                >
                  Ghi danh lên kệ
                </button>
              </form>
            ) : (
              /* Book catalog list scroll area */
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {filteredBooks.length === 0 ? (
                  <div className="text-center py-12 text-stone-400 text-xs">
                    <p>Chưa có sách phù hợp yêu cầu cậu tìm kiếm.</p>
                  </div>
                ) : (
                  filteredBooks.map((book) => {
                    const active = book.id === profile.activeBookId;
                    const progressRatio = book.sessionsCompleted / book.microGoal.totalSessions;
                    const progressPercent = Math.min(100, Math.round(progressRatio * 100));

                    return (
                      <div
                        key={book.id}
                        onClick={() => selectActiveBook(book.id)}
                        className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          active
                            ? "bg-amber-50/50 border-amber-300 shadow-sm ring-1 ring-amber-300"
                            : "bg-white border-stone-150 hover:bg-stone-50"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="inline-block px-1.5 py-0.5 bg-stone-100 text-stone-500 text-[8px] font-bold uppercase rounded mb-1">
                              {book.category}
                            </span>
                            <h4 className="text-xs font-bold text-stone-800 leading-snug line-clamp-1">{book.title}</h4>
                            <p className="text-[10px] text-stone-400 font-medium">Tác giả: {book.author}</p>
                          </div>
                          
                          <button
                            onClick={(e) => handleDeleteBook(book.id, e)}
                            className="text-stone-400 hover:text-red-600 transition p-1 rounded hover:bg-stone-100 shrink-0 cursor-pointer"
                            title="Xóa sách"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Recommendation rationale tag if available */}
                        {book.whyRecommend && (
                          <p className="text-[9px] text-stone-500 mt-1 lines-2 font-medium bg-stone-50 p-1.5 rounded border border-stone-100 italic line-clamp-2">
                            {book.whyRecommend}
                          </p>
                        )}

                        <div className="mt-2 text-[10px] text-stone-400 flex justify-between font-semibold">
                          <span>Mục tiêu: Đọc {book.microGoal.pagesPerSession} trang</span>
                          <span>Đạt {book.sessionsCompleted}/{book.microGoal.totalSessions} phiên</span>
                        </div>

                        <div className="w-full h-1.5 bg-stone-100 rounded-full mt-1.5 overflow-hidden border border-stone-150">
                          <div
                            className={`h-full ${book.isCompleted ? "bg-teal-600" : "bg-amber-500"} transition-all`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
            
            {/* API Warning Check - friendly badge */}
            {apiHealth.checked && !apiHealth.hasApiKey && (
              <div className="p-2 bg-amber-50 rounded-lg text-[9px] text-amber-800 font-medium border border-amber-100 flex items-center gap-1.5 mt-3">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Chưa kích hoạt API Key. AI Mentor sẽ chạy chế độ hướng dẫn offline, hãy vào Settings để cắm nhé!</span>
              </div>
            )}
          </div>
        </section>

        {/* Right workspace panel (Reading area / Active study / Coach dialogue) - spans 8 columns */}
        <section className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Main workspace navigation tabs */}
          <div className="bg-white border border-stone-200 p-1.5 rounded-2xl flex gap-1 shadow-sm">
            {[
              { id: "dashboard", label: "🗺️ Bản đồ & Nudges", desc: "Tiến độ tri thức & câu đố" },
              { id: "active-session", label: "📖 Bàn Đọc Sách", desc: "Phiên mục tiêu & đồng hồ ghi sổ" },
              { id: "chat", label: "💬 Lounge Socratic", desc: "Đối thoại với Mentor" }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    // Prevent entering reading rooms or chats without selecting a book first
                    if (tab.id !== "dashboard" && !profile.activeBookId) {
                      alert("Vui lòng kích hoạt một cuốn sách trên kệ của cậu trước nhé!");
                      return;
                    }
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                    active
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/15"
                      : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[9px] font-medium mt-0.5 ${active ? "text-amber-100" : "text-stone-400"}`}>
                    {tab.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE WORKSPACE CONTENTS */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Intelligent context Nudges based on day hour */}
              <div className="p-5 bg-stone-900 text-white rounded-2xl relative shadow-md overflow-hidden">
                <div className="absolute right-0 top-0 translate-y-1 translate-x-2 text-white/5 font-bold text-4xl">
                  NUDGES
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-amber-500 rounded-full text-stone-900 shrink-0">
                    <Sparkles className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Cú Hích Thúc Đẩy Học Tập</span>
                    <p className="text-xs font-medium leading-relaxed italic">
                      "Nam ơi, tối nay cậu đã dành ra 10 phút đọc chưa? Hãy lật Sách Của Cậu, rải trí tuệ lên 8 trang Hoàng Tử Bé nhé! Mục tiêu cực nhỏ nhưng chuỗi Streak thăng hoa sẽ không đứt đoạn đâu! 🔥"
                    </p>
                    <span className="block text-[8px] text-white/40 mt-1 uppercase font-bold tracking-widest">Auto-Nudge: Gửi theo Ngữ Cảnh</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Socratic Knowledge map dashboard */}
              <KnowledgeMap profile={profile} />

              {/* Saved Notes History overview for active book */}
              {activeBook && (
                <div className="p-6 bg-white border border-stone-250 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                    <BookMarked className="w-4.5 h-4.5 text-amber-600" />
                    Lịch Sử Ghi Chép & Thu Hoạch ({activeBook.notes.length})
                  </h3>
                  {activeBook.notes.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">Chưa phát sinh phiên ghi chép nào. Cậu hãy lật Bàn Đọc Sách bấm timer luyện đọc để ghi nhận thành tích nhen!</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {activeBook.notes.map((note, idx) => (
                        <div key={idx} className="p-3 bg-stone-50 border border-stone-150 rounded-xl text-xs text-stone-605 flex gap-2">
                          <span className="text-amber-600 font-bold">#{idx + 1}</span>
                          <p className="font-medium lead-normal">{note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "active-session" && activeBook && (
            <BookSession book={activeBook} onFinishSession={handleFinishSession} />
          )}

          {activeTab === "chat" && activeBook && (
            <MentorChat
              activeBook={activeBook}
              streakCount={profile.streakCount}
              studentXP={profile.studentXP}
              onSendMessage={handleSendChatMessage}
              loading={chatLoading}
            />
          )}

        </section>

      </main>

      {/* Styled cozy warm footer decoration */}
      <footer className="bg-white border-t border-stone-150 py-6 text-center text-xs text-stone-400 mt-12 font-medium">
        <p>© 2026 AI Reading Mentor — Kết hợp giữa thuyết Kiến tạo Giáo dục & Thuyết Cú Hích cho Học sinh THPT Việt Nam.</p>
        <p className="mt-1 text-[10px] text-amber-600 font-semibold uppercase tracking-wider">Cần Mẫn Độc Lập — Trí Tuệ Thăng Hoa</p>
      </footer>

    </div>
  );
}
