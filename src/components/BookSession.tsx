import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, FileText, CheckCircle2, Bookmark, Timer, AlertCircle, Volume2, Music } from "lucide-react";
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

  // Focus music tracks
  const tracks = [
    { name: "☕ Lofi Học Đường", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { name: "🌧️ Tiếng Mưa Rơi Rào", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { name: "🌲 Rừng Gió Rào Rạt", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" }
  ];

  const [audioTrack, setAudioTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioTrack]);

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
    { label: "📌 Ý tưởng tâm đắc", text: "Chi tiết/Khái niệm tâm đắc nhất của tớ là: " },
    { label: "🤔 Xung đột nhân vật", text: "Xung đột xảy ra khi nhân vật... làm tớ suy nghĩ là: " },
    { label: "💡 Ứng dụng thực tế", text: "Ứng dụng điều này vào bối cảnh học tập/đời sống là: " }
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
            <div className={`text-center ${timerActive ? "animate-pulse" : ""}`}>
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

          {/* Divider */}
          <div className="w-full h-[1px] bg-stone-100 my-4" />

          {/* White Noise Player Widget */}
          <div className="w-full space-y-3 text-left">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-600 animate-bounce" />
              <span className="text-xs uppercase font-extrabold tracking-wider text-stone-600">Nhạc Nền Tập Trung</span>
            </div>
            
            <audio
              ref={audioRef}
              src={tracks[audioTrack].url}
              loop
            />

            <div className="flex flex-col gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200/50 w-full">
              <div className="flex items-center justify-between gap-2">
                <select
                  value={audioTrack}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setAudioTrack(idx);
                    setIsPlaying(true); // Auto-play on switch
                  }}
                  className="bg-white border border-stone-200 text-[11px] font-semibold text-stone-700 px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 flex-1 max-w-[150px]"
                >
                  {tracks.map((t, idx) => (
                    <option key={idx} value={idx}>{t.name}</option>
                  ))}
                </select>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[10px] text-white cursor-pointer transition ${
                    isPlaying ? "bg-amber-600 hover:bg-amber-700" : "bg-stone-800 hover:bg-stone-900"
                  }`}
                >
                  {isPlaying ? "Tạm Dừng" : "Phát Nhạc"}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 pt-1 w-full">
                <Volume2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600 flex-1"
                />
                <span className="text-[9px] font-mono text-stone-400 w-6 text-right shrink-0">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
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
                  onClick={() => setNotes(pt.text)}
                  className="px-2.5 py-1.5 bg-white hover:bg-amber-50 text-[10px] font-bold text-stone-600 hover:text-amber-800 rounded-xl border border-stone-200 hover:border-amber-300 transition duration-150 shadow-sm cursor-pointer"
                >
                  {pt.label}
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
