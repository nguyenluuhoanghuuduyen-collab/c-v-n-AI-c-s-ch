import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, Brain, HelpCircle, GraduationCap, Flame } from "lucide-react";
import { ChatMessage, Book } from "../types";

interface MentorChatProps {
  activeBook: Book;
  streakCount: number;
  studentXP: number;
  onSendMessage: (text: string) => Promise<void>;
  loading: boolean;
}

export default function MentorChat({
  activeBook,
  streakCount,
  studentXP,
  onSendMessage,
  loading
}: MentorChatProps) {
  const [inputText, setInputText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeBook.chatHistory, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    onSendMessage(inputText);
    setInputText("");
  };

  const executeQuickAction = (actionText: string) => {
    if (loading) return;
    onSendMessage(actionText);
  };

  const quickActions = [
    {
      title: "💡 Học kiểu Feynman",
      prompt: "Tớ muốn diễn tả nội dung chương sách vừa đọc bằng ngôn từ siêu tối giản cho một bạn tiểu học. Cậu hướng dẫn tớ nhen!",
      desc: "Trình bày giản dị"
    },
    {
      title: "🎭 Nhập vai thử thách",
      prompt: "Hãy đưa tớ vào một tình huống nhập vai (Role-play) mâu thuẫn để tớ thử nghiệm giải quyết vấn đề theo góc nhìn của cuốn sách này!",
      desc: "Kéo bối cảnh thực tế"
    },
    {
      title: "🏛️ Đối đầu Phản biện",
      prompt: "Tớ cảm nhận có một số luận điểm chưa thực sự thỏa đáng ở phần vừa đọc. Hãy phát động tranh biện phản biện đa chiều cùng tớ nhé!",
      desc: "Rèn tư duy sắc xảo"
    },
    {
      title: "🎒 Liên hệ học bạ THPT",
      prompt: "Làm thế nào để ứng dụng triết lý hoặc bài học trong chương vừa rồi vào bối cảnh trường cấp ba, học tập hay đời sống học sinh của tụi mình đây cậu?",
      desc: "Giải bài toán đời thực"
    }
  ];

  return (
    <div className="border border-stone-200 bg-stone-50/50 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-sm" id="socratic-chat-thread">
      {/* Mini header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-850">AI Socratic Reading Mentor</h3>
            <span className="text-[10px] text-stone-400 font-semibold block">Đang cố vấn: {activeBook.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-stone-600">
          <div className="flex items-center gap-1.5 bg-amber-100/60 px-2 py-1 rounded-lg text-amber-800">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Streak {streakCount} ngày</span>
          </div>
          <div className="bg-stone-100 px-2.5 py-1 rounded-lg text-stone-700">
            {studentXP} XP
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50">
        {activeBook.chatHistory.map((message) => {
          const isModel = message.role === "model";
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 max-w-[85%] ${
                isModel ? "self-start" : "ml-auto flex-row-reverse"
              }`}
            >
              {/* Avatar */}
              <div
                className={`h-8 h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm text-xs font-bold ${
                  isModel
                    ? "bg-amber-500 text-white"
                    : "bg-indigo-600 text-white"
                }`}
              >
                {isModel ? <Brain className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Bubble Body */}
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed font-sans ${
                  isModel
                    ? "bg-white border border-stone-150 text-stone-850 rounded-tl-none shadow-sm"
                    : "bg-stone-900 text-stone-50 rounded-tr-none"
                }`}
              >
                {/* Parse Vietnamese formatting dynamically if necessary, here we render directly with clean linebreaks */}
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                <span className="block text-[8px] text-stone-400 mt-2 text-right">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex items-start gap-3 max-w-[80%] self-start">
            <div className="h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 animate-spin">
              <Brain className="w-4 h-4" />
            </div>
            <div className="p-4 bg-white border border-amber-100 rounded-2xl rounded-tl-none text-xs text-stone-500 flex items-center gap-2 shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="italic font-medium">Mentor đang soi chiếu ghi chép của cậu nhen...</span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Socratic Quick Triggers */}
      <div className="bg-white border-t border-stone-200 px-6 py-3">
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-stone-400 block mb-2">
          Kích hoạt hành động Socratic nhanh để rèn tư duy:
        </span>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => executeQuickAction(action.prompt)}
              disabled={loading}
              className="text-left p-2 rounded-xl bg-amber-50/50 hover:bg-amber-50 border border-amber-100/50 transition duration-150 disabled:opacity-50 cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-amber-900 group-hover:text-amber-600">
                {action.title}
              </div>
              <div className="text-[9px] text-stone-400">
                {action.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message input */}
      <form onSubmit={handleSubmit} className="bg-white border-t border-stone-200 p-4 flex gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          placeholder="Viết câu trả lời, sự thấu cảm hoặc câu hỏi bất kỳ chia sẻ cho Mentor..."
          className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-xl text-xs placeholder-stone-400 font-medium"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow disabled:bg-stone-300 transition duration-150 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
