import React, { useState, useEffect } from "react";
import { Play, Pause, Square, FileText, CheckCircle2, Bookmark, Timer, AlertCircle } from "lucide-react";
import { Book } from "../types";

interface BookSessionProps {
  book: Book;
  onFinishSession: (notesText: string, timeSpentSeconds: number) => void;
}

export default function BookSession({ book, onFinishSession }: BookSessionProps) {
  const [timerActive, setTimerActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [notes, setNotes] = useState("");
  const [errorInput, setErrorInput] = useState("");

  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleStartPause = () => {
    setTimerActive(!timerActive);
  };

  const handleReset = () => {
    setTimerActive(false);
    setSecondsElapsed(0);
  };

  const handleFinish = () => {
    setTimerActive(false);
    if (!notes.trim()) {
      setErrorInput("Hãy ghi chú nhanh ít nhất 3 chữ về chương vừa rồi để tớ mở khóa tương tác Socratic nhé!");
      return;
    }
    setErrorInput("");
    onFinishSession(notes, secondsElapsed);
    setNotes("");
    setSecondsElapsed(0);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const expectedTimeInSeconds = book.microGoal.timeEstimateMinutes * 60;
  const progressPct = Math.min(100, (secondsElapsed / expectedTimeInSeconds) * 100);

  // Suggested Socratic seed links
  const defaultNotePrompts = [
    "📌 'Chi tiết/Khái niệm tâm đắc nhất của tớ là...'",
    "🤔 'Xung đột xảy ra khi nhân vật... làm tớ mâu thuẫn là...'",
    "💡 'Ứng dụng điều này vào các môn học hoặc thực tế trường học có thể là...'"
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="book-session-panel">
      {/* Upper header */}
      <div className={`p-6 rounded-2xl bg-gradient-to-r ${book.coverTheme} text-white relative overflow-hidden shadow-md`}>
        <div className="absolute right-0 bottom-0 translate-y-4 translate-x-2 opacity-10">
          <Bookmark className="w-48 h-48" />
        </div>
        <div className="flex justify-between items-start">
          <span className="px-3 py-1 bg-white/20 text-[10px] uppercase font-bold tracking-wider rounded-full backdrop-blur-sm">
            PHÂN KHÚC ZPD: {book.zpdRating}
          </span>
          <span className="text-xs font-semibold bg-black/20 px-2 py-1 rounded">
            Đã đọc {book.sessionsCompleted}/{book.microGoal.totalSessions} phiên mục tiêu
          </span>
        </div>
        <h2 className="text-2xl font-bold font-sans mt-3 text-white">{book.title}</h2>
        <p className="text-xs text-white/80 font-medium">Tác giả: {book.author} | Thể loại: {book.category}</p>
        
        <div className="mt-4 pt-4 border-t border-white/20 flex gap-4 items-center">
          <div className="shrink-0 flex items-center justify-center bg-white/25 w-10 h-10 rounded-xl">
            <Timer className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="block text-[11px] text-white/70 uppercase font-bold">Mục tiêu siêu nhỏ hôm nay</span>
            <span className="text-sm font-semibold">{book.microGoal.sessionDescription}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Core Timer column */}
        <div className="lg:col-span-2 p-6 bg-white border border-stone-200/80 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
          <span className="text-xs uppercase font-extrabold tracking-wider text-stone-400">Đồng Hồ Đốt Lửa Thói Quen</span>
          
          {/* Virtual clock container */}
          <div className="relative w-44 h-44 rounded-full border-4 border-stone-100 flex items-center justify-center shadow-inner">
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="82"
                stroke={timerActive ? "#eab308" : "#cbd5e1"}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="515"
                strokeDashoffset={515 - (515 * progressPct) / 100}
                className="transition-all duration-300"
              />
            </svg>
            <div className="text-center">
              <span className="block text-4xl font-mono font-bold text-stone-850">{formatTime(secondsElapsed)}</span>
              <span className="text-[10px] font-semibold text-stone-400 uppercase">
                {timerActive ? "Đang tập trung" : "Tạm dừng"}
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-400 text-center px-4">
            Đích đến tối thiểu khuyên dùng: <strong className="text-stone-600">{book.microGoal.timeEstimateMinutes} phút</strong> đọc sâu.
          </p>

          <div className="flex gap-2 w-full justify-center">
            <button
              onClick={handleStartPause}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all text-white cursor-pointer ${
                timerActive ? "bg-amber-500 hover:bg-amber-600 shadow" : "bg-teal-600 hover:bg-teal-700 shadow"
              }`}
            >
              {timerActive ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Tạm dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Bắt đầu đọc</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs transition-all border border-stone-200 cursor-pointer"
              title="Đặt lại đồng hồ"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notebook Column */}
        <div className="lg:col-span-3 p-6 bg-amber-50/20 border border-amber-100 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-amber-600" />
              Sổ Tay Thu Hoạch Socratic mở đầu
            </h3>
            <p className="text-xs text-stone-500">
              Hãy viết nhanh một dòng thu hoạch, nghi vấn hoặc cảm xúc bất kỳ phát sinh khi lật trang sách vừa xong. AI Reading Mentor sẽ dựa vào đây để khai mở đối thoại Socratic cực kỳ chất nhe!
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {defaultNotePrompts.map((pt, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setNotes(pt.slice(3) + " ")}
                  className="px-2 py-1 bg-amber-50 text-[10px] font-semibold text-amber-800 rounded-lg hover:bg-amber-100 border border-amber-100/50 transition"
                >
                  {pt.split(" '")[0]}
                </button>
              ))}
            </div>

            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full h-28 p-3 bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-xl text-xs text-stone-700 placeholder-stone-400 font-medium leading-relaxed shadow-inner"
              placeholder="Ghi ghép của cậu khi đọc... (ví dụ: 'Newton nhìn quả táo rụng và tớ nhận ra một định luật học thuật ra đời không chỉ bằng sự ngẫu nhiên mà là nền tảng quan sát dài lâu...')"
            />

            {errorInput && (
              <p className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 bg-amber-50 p-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorInput}
              </p>
            )}
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-3 bg-stone-900 hover:bg-stone-850 text-white font-bold rounded-xl shadow transition-all duration-200 flex items-center justify-center gap-2 text-xs cursor-pointer uppercase tracking-wider"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span>Nạp Sổ Tay & Gặp Socratic Mentor</span>
          </button>
        </div>

      </div>
    </div>
  );
}
