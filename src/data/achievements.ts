// Định nghĩa toàn bộ thành tựu trong hệ thống
export interface AchievementDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: "learning" | "activity" | "game" | "social";
  requirement: AchievementRequirement;
}

export interface AchievementRequirement {
  type: 
    | "lessons_completed" 
    | "streak_days" 
    | "total_xp" 
    | "total_points"
    | "level_reached"
    | "perfect_lessons"
    | "total_learning_days"
    | "levels_completed"
    | "stars_earned"
    | "badges_earned"
    | "time_spent_minutes";
  value: number;
}

export interface EarnedAchievement {
  id: string;
  achievement_id: string;
  achievement_name: string;
  achievement_icon: string;
  achievement_description: string | null;
  earned_at: string;
}

// Thành tựu học tập (Learning)
const LEARNING_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first-lesson",
    name: "Bước đầu tiên",
    icon: "🎯",
    description: "Hoàn thành bài học đầu tiên",
    category: "learning",
    requirement: { type: "lessons_completed", value: 1 },
  },
  {
    id: "lessons-5",
    name: "Học sinh chăm chỉ",
    icon: "📚",
    description: "Hoàn thành 5 bài học",
    category: "learning",
    requirement: { type: "lessons_completed", value: 5 },
  },
  {
    id: "lessons-10",
    name: "Nhà học giả",
    icon: "🎓",
    description: "Hoàn thành 10 bài học",
    category: "learning",
    requirement: { type: "lessons_completed", value: 10 },
  },
  {
    id: "lessons-25",
    name: "Bậc thầy kiến thức",
    icon: "🏛️",
    description: "Hoàn thành 25 bài học",
    category: "learning",
    requirement: { type: "lessons_completed", value: 25 },
  },
  {
    id: "perfect-lesson",
    name: "Hoàn hảo",
    icon: "💯",
    description: "Hoàn thành bài học không sai câu nào",
    category: "learning",
    requirement: { type: "perfect_lessons", value: 1 },
  },
  {
    id: "perfect-3",
    name: "Siêu hoàn hảo",
    icon: "🌟",
    description: "Hoàn thành 3 bài học hoàn hảo",
    category: "learning",
    requirement: { type: "perfect_lessons", value: 3 },
  },
];

// Thành tựu hoạt động (Activity)
const ACTIVITY_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "streak-3",
    name: "Kiên trì 3 ngày",
    icon: "🔥",
    description: "Học liên tục 3 ngày",
    category: "activity",
    requirement: { type: "streak_days", value: 3 },
  },
  {
    id: "streak-7",
    name: "Tuần lễ siêng năng",
    icon: "💪",
    description: "Học liên tục 7 ngày",
    category: "activity",
    requirement: { type: "streak_days", value: 7 },
  },
  {
    id: "streak-14",
    name: "Chiến binh kiên trì",
    icon: "⚔️",
    description: "Học liên tục 14 ngày",
    category: "activity",
    requirement: { type: "streak_days", value: 14 },
  },
  {
    id: "streak-30",
    name: "Bậc thầy kỷ luật",
    icon: "👑",
    description: "Học liên tục 30 ngày",
    category: "activity",
    requirement: { type: "streak_days", value: 30 },
  },
  {
    id: "learning-days-10",
    name: "Nhà thám hiểm",
    icon: "🔍",
    description: "Tổng cộng 10 ngày học",
    category: "activity",
    requirement: { type: "total_learning_days", value: 10 },
  },
  {
    id: "learning-days-30",
    name: "Khám phá gia",
    icon: "🧭",
    description: "Tổng cộng 30 ngày học",
    category: "activity",
    requirement: { type: "total_learning_days", value: 30 },
  },
  {
    id: "time-60",
    name: "Giờ vàng",
    icon: "⏰",
    description: "Học tổng cộng 60 phút",
    category: "activity",
    requirement: { type: "time_spent_minutes", value: 60 },
  },
  {
    id: "time-300",
    name: "5 giờ học tập",
    icon: "⌛",
    description: "Học tổng cộng 5 giờ",
    category: "activity",
    requirement: { type: "time_spent_minutes", value: 300 },
  },
];

// Thành tựu game (Game)
const GAME_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "xp-100",
    name: "Tích lũy XP",
    icon: "⭐",
    description: "Đạt 100 XP",
    category: "game",
    requirement: { type: "total_xp", value: 100 },
  },
  {
    id: "xp-500",
    name: "Ngôi sao XP",
    icon: "🌟",
    description: "Đạt 500 XP",
    category: "game",
    requirement: { type: "total_xp", value: 500 },
  },
  {
    id: "xp-1000",
    name: "Siêu sao XP",
    icon: "✨",
    description: "Đạt 1000 XP",
    category: "game",
    requirement: { type: "total_xp", value: 1000 },
  },
  {
    id: "xp-5000",
    name: "Huyền thoại XP",
    icon: "💎",
    description: "Đạt 5000 XP",
    category: "game",
    requirement: { type: "total_xp", value: 5000 },
  },
  {
    id: "level-5",
    name: "Cấp 5",
    icon: "🏅",
    description: "Đạt cấp độ 5",
    category: "game",
    requirement: { type: "level_reached", value: 5 },
  },
  {
    id: "level-10",
    name: "Cấp 10",
    icon: "🥇",
    description: "Đạt cấp độ 10",
    category: "game",
    requirement: { type: "level_reached", value: 10 },
  },
  {
    id: "level-20",
    name: "Bậc thầy",
    icon: "🏆",
    description: "Đạt cấp độ 20",
    category: "game",
    requirement: { type: "level_reached", value: 20 },
  },
  {
    id: "levels-3",
    name: "Người chinh phục",
    icon: "🚀",
    description: "Hoàn thành 3 màn chơi",
    category: "game",
    requirement: { type: "levels_completed", value: 3 },
  },
  {
    id: "levels-10",
    name: "Thám hiểm gia",
    icon: "🗺️",
    description: "Hoàn thành 10 màn chơi",
    category: "game",
    requirement: { type: "levels_completed", value: 10 },
  },
  {
    id: "stars-10",
    name: "Thu thập sao",
    icon: "⭐",
    description: "Thu thập 10 sao",
    category: "game",
    requirement: { type: "stars_earned", value: 10 },
  },
  {
    id: "stars-30",
    name: "Vua sao",
    icon: "🌠",
    description: "Thu thập 30 sao",
    category: "game",
    requirement: { type: "stars_earned", value: 30 },
  },
  {
    id: "badges-3",
    name: "Bộ sưu tập nhỏ",
    icon: "🎖️",
    description: "Thu thập 3 huy hiệu",
    category: "game",
    requirement: { type: "badges_earned", value: 3 },
  },
  {
    id: "badges-10",
    name: "Nhà sưu tập",
    icon: "🎪",
    description: "Thu thập 10 huy hiệu",
    category: "game",
    requirement: { type: "badges_earned", value: 10 },
  },
  {
    id: "points-1000",
    name: "Tích điểm",
    icon: "💰",
    description: "Đạt 1000 điểm",
    category: "game",
    requirement: { type: "total_points", value: 1000 },
  },
  {
    id: "points-5000",
    name: "Triệu phú điểm",
    icon: "💵",
    description: "Đạt 5000 điểm",
    category: "game",
    requirement: { type: "total_points", value: 5000 },
  },
];

// Xuất toàn bộ thành tựu
export const ALL_ACHIEVEMENTS: AchievementDefinition[] = [
  ...LEARNING_ACHIEVEMENTS,
  ...ACTIVITY_ACHIEVEMENTS,
  ...GAME_ACHIEVEMENTS,
];

// Helper functions
export const getAchievementById = (id: string): AchievementDefinition | undefined => {
  return ALL_ACHIEVEMENTS.find((a) => a.id === id);
};

export const getAchievementsByCategory = (category: AchievementDefinition["category"]): AchievementDefinition[] => {
  return ALL_ACHIEVEMENTS.filter((a) => a.category === category);
};

export const getCategoryLabel = (category: AchievementDefinition["category"]): string => {
  switch (category) {
    case "learning":
      return "Học tập";
    case "activity":
      return "Hoạt động";
    case "game":
      return "Trò chơi";
    case "social":
      return "Xã hội";
    default:
      return category;
  }
};

export const getCategoryIcon = (category: AchievementDefinition["category"]): string => {
  switch (category) {
    case "learning":
      return "📚";
    case "activity":
      return "🔥";
    case "game":
      return "🎮";
    case "social":
      return "🤝";
    default:
      return "🏆";
  }
};
