import React from "react";
import { Award, Trophy, Compass, Flame, BookOpen, Star, Sparkles, TrendingUp, ShieldAlert, Spade } from "lucide-react";
import { UserProfile, Badge, StudentSkills } from "../types";

interface KnowledgeMapProps {
  profile: UserProfile;
}

export default function KnowledgeMap({ profile }: KnowledgeMapProps) {
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "Compass":
        return <Compass className="w-6 h-6 text-indigo-500" />;
      case "Trophy":
        return <Trophy className="w-6 h-6 text-amber-500" />;
      case "Flame":
        return <Flame className="w-6 h-6 text-red-500" />;
      case "Spade":
        return <Spade className="w-6 h-6 text-emerald-500" />;
      case "ShieldAlert":
        return <ShieldAlert className="w-6 h-6 text-purple-500" />;
      default:
        return <Award className="w-6 h-6 text-amber-500" />;
    }
  };

  // Human-readable titles and explanations for the intelligence categories
  const skillDetails = [
    {
      key: "criticalThinking" as keyof StudentSkills,
      label: "Tư duy phản biện (Critical Thinking)",
      description: "Đánh giá thông tin đa góc nhìn và không bị thiên lệch bởi một lập luận duy nhất.",
      accentClass: "bg-indigo-600",
      bgAccent: "bg-indigo-50",
      textAccent: "text-indigo-600",
      icon: <TrendingUp className="w-5 h-5 text-indigo-600" />
    },
    {
      key: "vocabulary" as keyof StudentSkills,
      label: "Vốn từ vựng xã hội & học thuật",
      description: "Độ sắc bén của câu chữ, thấu đạt từ ẩn dụ đến thuật ngữ chính thống văn học.",
      accentClass: "bg-amber-600",
      bgAccent: "bg-amber-50",
      textAccent: "text-amber-700",
      icon: <BookOpen className="w-5 h-5 text-amber-600" />
    },
    {
      key: "empathy" as keyof StudentSkills,
      label: "Khả năng thấu cảm & Chia sẻ",
      description: "Đặt mình vào vị trí nhân vật lịch sử/văn học để nhìn thấu bối cảnh tâm lý của họ.",
      accentClass: "bg-rose-500",
      bgAccent: "bg-rose-50",
      textAccent: "text-rose-600",
      icon: <Star className="w-5 h-5 text-rose-500" />
    },
    {
      key: "systematic" as keyof StudentSkills,
      label: "Tư duy hệ thống vĩ mô",
      description: "Tổng hợp các luồng tư tưởng lẻ tẻ thành cấu trúc tư duy liền mạch và khoa học.",
      accentClass: "bg-emerald-600",
      bgAccent: "bg-emerald-50",
      textAccent: "text-emerald-700",
      icon: <Sparkles className="w-5 h-5 text-emerald-600" />
    }
  ];

  const getRankName = (lvl: number) => {
    if (lvl <= 1) return "Học giả Sơ cấp";
    if (lvl <= 2) return "Nhà thám hiểm Bản đồ Tri thức";
    if (lvl <= 3) return "Trinh sát Socratic";
    if (lvl <= 4) return "Cố vấn Triết lý Trẻ";
    return "Hiền nhân Học đường";
  };

  return (
    <div className="space-y-8 animate-fade-in" id="knowledge-map">
      {/* Level Milestone Section */}
      <div className="p-6 bg-gradient-to-br from-amber-50 via-white to-amber-50/20 border border-amber-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center w-20 h-20 bg-amber-500 rounded-full text-white shadow-lg border-4 border-white">
            <span className="text-3xl font-extrabold">{profile.level}</span>
            <div className="absolute -bottom-2 px-2 py-0.5 bg-stone-900 text-[10px] uppercase font-bold text-amber-400 rounded-full shadow">
              KHÓA
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-stone-800">{getRankName(profile.level)}</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">Cấp {profile.level}</span>
            </div>
            <p className="text-sm text-stone-500 mt-1">
              Thư viện trí tuệ hiện tại sở hữu <span className="font-semibold text-stone-700">{profile.books.length}</span> cuốn sách. Chuỗi thăng hoa thói quen: <span className="font-semibold text-amber-600">{profile.streakCount} ngày 🔥</span>.
            </p>
          </div>
        </div>

        <div className="w-full md:w-80 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-stone-500">
            <span>Tiến độ thăng cấp ({profile.studentXP % 100}/100 XP)</span>
            <span>{profile.studentXP} XP tổng</span>
          </div>
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div
              className="h-full bg-amber-500 transition-all duration-500 rounded-full"
              style={{ width: `${profile.studentXP % 100}%` }}
            />
          </div>
          <p className="text-[10px] text-stone-400 text-right italic">
            Chỉ còn {100 - (profile.studentXP % 100)} XP nữa để chạm mốc Cấp {profile.level + 1}!
          </p>
        </div>
      </div>

      {/* Visual Constellation Map of Reading Journey */}
      <div className="p-6 bg-stone-900 text-white rounded-2xl space-y-4 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-y-1 translate-x-2 text-white/5 font-bold text-5xl select-none pointer-events-none">
          JOURNEY
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
            🌌 Bản đồ Chòm sao Socratic THPT
          </h3>
          <p className="text-[10px] text-stone-400 font-medium">Lộ trình tiến hóa học thức từ Học Giả Sơ Cấp đến Hiền Nhân Học Đường</p>
        </div>

        <div className="relative w-full overflow-x-auto py-2">
          <svg className="mx-auto min-w-[500px] h-36" viewBox="0 0 500 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting lines */}
            {[
              { from: [50, 65], to: [150, 35], active: profile.level >= 2 },
              { from: [150, 35], to: [250, 75], active: profile.level >= 3 },
              { from: [250, 75], to: [350, 25], active: profile.level >= 4 },
              { from: [350, 25], to: [450, 65], active: profile.level >= 5 }
            ].map((line, idx) => (
              <line
                key={idx}
                x1={line.from[0]}
                y1={line.from[1]}
                x2={line.to[0]}
                y2={line.to[1]}
                stroke={line.active ? "#f59e0b" : "#374151"}
                strokeWidth={line.active ? "3" : "2"}
                strokeDasharray={line.active ? "none" : "4 4"}
                filter={line.active ? "url(#glow-effect)" : undefined}
                className="transition-all duration-500"
              />
            ))}

            {/* Stars/Nodes */}
            {[
              { x: 50, y: 65, lvl: 1, name: "Sơ cấp", emoji: "🌱" },
              { x: 150, y: 35, lvl: 2, name: "Thám hiểm", emoji: "🧭" },
              { x: 250, y: 75, lvl: 3, name: "Trinh sát", emoji: "⚔️" },
              { x: 350, y: 25, lvl: 4, name: "Cố vấn", emoji: "🎓" },
              { x: 450, y: 65, lvl: 5, name: "Hiền nhân", emoji: "🔮" }
            ].map((node) => {
              const active = profile.level >= node.lvl;
              const current = profile.level === node.lvl;
              return (
                <g key={node.lvl} className="cursor-pointer group">
                  {/* Outer circle pulse for active/current */}
                  {active && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={current ? "18" : "14"}
                      fill="#d97706"
                      opacity={current ? "0.3" : "0.15"}
                      className={current ? "animate-ping" : ""}
                    />
                  )}
                  {/* Main circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="12"
                    fill={active ? (current ? "#f59e0b" : "#b45309") : "#1f2937"}
                    stroke={active ? "#fef3c7" : "#4b5563"}
                    strokeWidth="2"
                    filter={active ? "url(#glow-effect)" : undefined}
                    className="transition-all duration-300 group-hover:scale-110"
                  />
                  {/* Emoji / Number inside */}
                  <text
                    x={node.x}
                    y={node.y + 3.5}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill={active ? "#fff" : "#9ca3af"}
                  >
                    {node.emoji}
                  </text>
                  
                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y + 24}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="bold"
                    fill={active ? (current ? "#fbbf24" : "#d97706") : "#6b7280"}
                  >
                    {node.name}
                  </text>
                  <text
                    x={node.x}
                    y={node.y - 18}
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="bold"
                    fill="#9ca3af"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    Cấp {node.lvl}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Main Grid: Cognitive vector map vs Medals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Cognitive Skill Vector */}
        <div className="p-6 bg-white border border-stone-200/80 rounded-2xl space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-stone-850 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600 animate-pulse" />
              Bản Đồ Chỉ Số Tăng Trưởng Tri Thức
            </h3>
            <p className="text-xs text-stone-400 mt-1">Chỉ số đo lường sự tiến bộ và lĩnh ngộ dựa trên các cuộc hội thoại Active Recall cùng Mentor.</p>
          </div>

          <div className="space-y-5">
            {skillDetails.map(item => {
              const skill = profile.unlockedSkills[item.key];
              const pct = Math.min(100, Math.max(5, (skill.xp / skill.max) * 100));

              return (
                <div key={item.key} className="space-y-2 transition-all hover:translate-x-1 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                      {item.icon}
                      {item.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.bgAccent} ${item.textAccent}`}>
                      Cấp {skill.level} ({skill.xp}/{skill.max} XP)
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 leading-relaxed pl-6">
                    {item.description}
                  </div>
                  <div className="pl-6">
                    <div className="w-full h-2.5 bg-stone-50 border border-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.accentClass} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badge Catalog */}
        <div className="p-6 bg-white border border-stone-200/80 rounded-2xl space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-stone-850 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Hành Lang Huy Chương Danh Vọng
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Huy chương vinh danh thói quen đọc học thuật của học sinh. Hãy kích hoạt bằng các chiến công thực tế!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.badges.map(badge => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border transition-all duration-300 flex gap-3 ${
                  badge.isUnlocked
                    ? "bg-gradient-to-br from-amber-50/60 to-orange-50/40 border-amber-300 shadow-md shadow-amber-500/5 hover:scale-[1.03]"
                    : "bg-stone-50 border-stone-150 opacity-60"
                }`}
              >
                <div className={`p-2.5 h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${
                  badge.isUnlocked ? "bg-white shadow" : "bg-stone-150"
                }`}>
                  {getBadgeIcon(badge.icon)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold ${badge.isUnlocked ? "text-stone-850" : "text-stone-500"}`}>
                      {badge.name}
                    </span>
                    {badge.isUnlocked && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400 leading-normal">
                    {badge.description}
                  </p>
                  {badge.isUnlocked && badge.earnedAt && (
                    <span className="block text-[8px] text-amber-600 font-semibold tracking-wider uppercase">
                      ĐÃ MỞ KHÓA
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
