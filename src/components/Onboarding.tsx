import React, { useState } from "react";
import { Compass, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { UserProfile, Book } from "../types";

interface OnboardingProps {
  onComplete: (name: string, interests: string, vocab: "Sơ cấp" | "Trung cấp" | "Cao cấp", goals: string, recommended: Book[], customApiKey?: string) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState("Nam Nguyễn");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [vocabLevel, setVocabLevel] = useState<"Sơ cấp" | "Trung cấp" | "Cao cấp">("Trung cấp");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interestOptions = [
    "Văn học kinh điển",
    "Tâm lý học hành vi",
    "Khoa học vũ trụ, tự nhiên",
    "Phát triển kỹ năng mềm",
    "Giao tiếp & Tư duy phản biện",
    "Lịch sử & Triết học lý thuyết"
  ];

  const goalOptions = [
    "Duy trì thói quen đọc sách hàng ngày",
    "Triệt tiêu thói quen trì hoãn, lười đọc",
    "Nâng cao từ vựng và tư duy tranh biện",
    "Rèn luyện kỹ năng tự lực, phát triển bản thân"
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const interestsString = selectedInterests.length > 0 ? selectedInterests.join(", ") : "Nhiều lĩnh vực khác nhau";
    const goalsString = selectedGoals.length > 0 ? selectedGoals.join(". ") : "Đọc hằng ngày";

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (apiKey.trim()) {
        headers["x-api-key"] = apiKey.trim();
      }

      const response = await fetch("/api/mentor/recommend", {
        method: "POST",
        headers,
        body: JSON.stringify({
          interests: interestsString,
          vocabularyLevel: vocabLevel,
          goals: goalsString,
          currentBooksCount: 0
        })
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối đến máy chủ AI để đề xuất sách.");
      }

      const data = await response.json();
      
      const serverBooks: Book[] = (data.recommendedBooks || []).map((b: any, index: number) => ({
        id: `rec-${Date.now()}-${index}`,
        title: b.title,
        author: b.author,
        category: b.category,
        zpdRating: b.zpdRating,
        whyRecommend: b.whyRecommend,
        microGoal: {
          pagesPerSession: b.microGoal?.pagesPerSession || 8,
          timeEstimateMinutes: b.microGoal?.timeEstimateMinutes || 12,
          totalSessions: b.microGoal?.totalSessions || 15,
          sessionDescription: b.microGoal?.sessionDescription || "Đọc sách hàng ngày chia siêu nhỏ."
        },
        skillsUnlocked: b.skillsUnlocked,
        coverTheme: b.coverTheme || (index === 0 ? "from-indigo-600 to-indigo-800" : index === 1 ? "from-teal-600 to-emerald-800" : "from-amber-600 to-yellow-800"),
        sessionsCompleted: 0,
        isCompleted: false,
        notes: [],
        chatHistory: [
          {
            id: "onboard-welcome",
            role: "model",
            content: `Chào mừng ${name} đến với hành trình đọc sách! 📚 Tớ đã phân tích kỹ năng và đề xuất riêng cuốn sách này cận kề Vùng phát triển gần nhất (ZPD) của cậu. Hãy sẵn sàng cùng tớ thảo luận theo đúng phương pháp Socratic sau mỗi phiên đọc 10-15 phút để bứt phá tư duy nhé! ✨`,
            timestamp: new Date().toISOString()
          }
        ]
      }));

      onComplete(name, interestsString, vocabLevel, goalsString, serverBooks, apiKey.trim() || undefined);
    } catch (err: any) {
      console.error(err);
      setError("AI tạm thời bận nghiên cứu tài liệu. Chúng mình dùng dữ liệu đề xuất mặc định cực chất nhé!");
      // Fallback in case of API issues to guarantee seamless UX
      setTimeout(() => {
        onComplete(name, interestsString, vocabLevel, goalsString, [], apiKey.trim() || undefined);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-12 p-8 bg-white rounded-2xl border border-amber-100 shadow-xl shadow-amber-50/50" id="onboarding-form">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-600 mb-4 animate-bounce">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold font-sans text-stone-850">Người Đồng Hành Đọc Sách Thông Minh</h1>
        <p className="text-stone-500 mt-2">Dựa trên Thuyết Cú hích (Nudges) và Sư phạm Socratic, tớ sẽ cùng bạn lập thói quen đọc bất tử!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Tên của cậu là gì?</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-800 font-medium"
              placeholder="Nhập tên thân thương của cậu..."
              required
            />
          </div>
        </div>

        {/* API Key input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-stone-700">Gemini API Key (Tùy chọn)</label>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-700 hover:underline">Lấy Key tại Google AI Studio ↗</a>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-850 font-mono text-xs"
            placeholder="Nếu máy chủ chưa cấu hình API Key, hãy dán Key của cậu ở đây..."
          />
        </div>

        {/* Interests selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Lĩnh vực cậu quan tâm nhiều nhất?</label>
          <p className="text-xs text-stone-400">Chọn tối thiểu 1 chủ đề đề xuất được cá nhân hóa sâu sắc</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {interestOptions.map(option => {
              const selected = selectedInterests.includes(option);
              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => toggleInterest(option)}
                  className={`px-4 py-3 text-left rounded-xl border text-sm font-medium transition-all ${
                    selected
                      ? "bg-amber-100 border-amber-300 text-amber-900 shadow-sm"
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Compass className={`w-4 h-4 ${selected ? 'text-amber-600' : 'text-stone-400'}`} />
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vocabulary level self assessment */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Trình độ đọc hiểu & vốn từ hiện tại cậu cảm thấy?</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "Sơ cấp", title: "Cơ bản / Sơ cấp", desc: "Thích sách ngắn, từ dễ hiểu" },
              { id: "Trung cấp", title: "Trung bình / Trung cấp", desc: "Đọc thạo văn học, hiểu ẩn dụ" },
              { id: "Cao cấp", title: "Nâng cao / Uyên bác", desc: "Đọc quen sách chính luận triết học" }
            ].map(lvl => (
              <button
                type="button"
                key={lvl.id}
                onClick={() => setVocabLevel(lvl.id as any)}
                className={`p-3 text-center rounded-xl border transition-all flex flex-col items-center justify-center ${
                  vocabLevel === lvl.id
                    ? "bg-amber-600 border-amber-600 text-white shadow-md"
                    : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                <span className="font-bold text-sm">{lvl.title}</span>
                <span className={`text-[10px] mt-1 ${vocabLevel === lvl.id ? "text-amber-100" : "text-stone-400"}`}>{lvl.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Goals */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-700">Mục tiêu lớn nhất muốn chinh phục?</label>
          <div className="space-y-2">
            {goalOptions.map(option => {
              const selected = selectedGoals.includes(option);
              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => toggleGoal(option)}
                  className={`w-full px-4 py-3 text-left rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                    selected
                      ? "bg-amber-50 border-amber-200 text-stone-850"
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <GraduationCap className={`w-4 h-4 ${selected ? 'text-amber-600' : 'text-stone-400'}`} />
                    {option}
                  </span>
                  <input
                    type="checkbox"
                    checked={selected}
                    readOnly
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 pointer-events-none"
                  />
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all flex items-center justify-center gap-2 disabled:bg-stone-400 cursor-pointer text-base"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              <span>AI Đang Thiết Kế Lộ Trình Phù Hợp Vùng ZPD...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Gặp Gỡ AI Reading Mentor Của Cậu Ngay!</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 text-center bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold animated fadeIn">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
