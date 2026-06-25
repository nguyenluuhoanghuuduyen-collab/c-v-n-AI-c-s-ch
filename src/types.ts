export interface MicroGoal {
  pagesPerSession: number;
  timeEstimateMinutes: number;
  totalSessions: number;
  sessionDescription: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  zpdRating: string;
  whyRecommend?: string;
  microGoal: MicroGoal;
  skillsUnlocked: string;
  coverTheme: string; // Tailwind CSS classes like 'from-blue-600 to-indigo-700'
  
  // Progress variables
  sessionsCompleted: number;
  isCompleted: boolean;
  notes: string[];
  chatHistory: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: string;
}

export interface StudentSkills {
  criticalThinking: { level: number; xp: number; max: number };
  vocabulary: { level: number; xp: number; max: number };
  empathy: { level: number; xp: number; max: number };
  systematic: { level: number; xp: number; max: number };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  isUnlocked: boolean;
}

export interface UserProfile {
  name: string;
  interests: string;
  vocabularyLevel: "Sơ cấp" | "Trung cấp" | "Cao cấp";
  goals: string;
  didOnboard: boolean;
  streakCount: number;
  lastActiveDate?: string;
  studentXP: number;
  level: number;
  unlockedSkills: StudentSkills;
  activeBookId: string | null;
  books: Book[];
  badges: Badge[];
}

export interface Nudge {
  id: string;
  message: string;
  timeLabel: string;
  bookTitle?: string;
  type: "streak" | "remind" | "quote";
}
