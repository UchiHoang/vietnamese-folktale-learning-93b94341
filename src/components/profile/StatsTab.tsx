import { Award, Flame, Star, Trophy, Target, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AchievementGrid } from "@/components/achievements/AchievementGrid";
import { EarnedAchievement } from "@/data/achievements";

interface GameProgress {
  total_xp: number;
  total_points: number;
  level: number;
  earned_badges: string[];
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_learning_days: number;
}

interface StatsTabProps {
  gameProgress: GameProgress | null;
  streak: StreakData | null;
  achievements: EarnedAchievement[];
}

const StatsTab = ({ gameProgress, streak, achievements }: StatsTabProps) => {
  const xpProgress = ((gameProgress?.total_xp || 0) % 200) / 2;

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tổng XP - giữ tông xanh */}
        <Card className="p-5 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div className="text-3xl font-bold text-primary">{gameProgress?.total_xp || 0}</div>
          <div className="text-sm text-muted-foreground">Tổng XP</div>
        </Card>
        
        {/* Điểm - chuyển sang tông vàng */}
        <Card className="p-5 text-center bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border border-yellow-200 dark:border-yellow-800/40">
          <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center mx-auto mb-3">
            <Star className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-yellow-500">{gameProgress?.total_points || 0}</div>
          <div className="text-sm text-muted-foreground">Điểm</div>
        </Card>
        
        {/* Chuỗi ngày - tông cam như hình minh họa */}
        <Card className="p-5 text-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800/40">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center mx-auto mb-3">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-orange-600">{streak?.current_streak || 0}</div>
          <div className="text-sm text-muted-foreground">Chuỗi ngày</div>
        </Card>
        
        {/* Cấp độ - tông tím như hình minh họa */}
        <Card className="p-5 text-center bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-purple-200 dark:border-purple-800/40">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mx-auto mb-3">
            <Trophy className="h-6 w-6 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-purple-600">{gameProgress?.level || 1}</div>
          <div className="text-sm text-muted-foreground">Cấp độ</div>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">Tiến độ cấp độ</h3>
          <span className="text-sm text-muted-foreground">
            {(gameProgress?.total_xp || 0) % 200} / 200 XP
          </span>
        </div>
        <Progress value={xpProgress} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">
          Còn {200 - ((gameProgress?.total_xp || 0) % 200)} XP để lên cấp {(gameProgress?.level || 1) + 1}
        </p>
      </Card>

      {/* Streak Section */}
      <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shadow-sm">
            <Flame className="h-6 w-6 text-orange-500 fill-orange-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400">Giữ chuỗi học tập</h3>
            <p className="text-sm text-orange-500 dark:text-orange-300">Học mỗi ngày để giữ chuỗi!</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-4 bg-card/80 dark:bg-card/60 rounded-xl shadow-sm border border-orange-100 dark:border-orange-900/30">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{streak?.current_streak || 0}</div>
            <div className="text-xs text-muted-foreground">Chuỗi hiện tại</div>
          </div>
          <div className="text-center p-4 bg-card/80 dark:bg-card/60 rounded-xl shadow-sm border border-orange-100 dark:border-orange-900/30">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{streak?.longest_streak || 0}</div>
            <div className="text-xs text-muted-foreground">Kỷ lục</div>
          </div>
          <div className="text-center p-4 bg-card/80 dark:bg-card/60 rounded-xl shadow-sm border border-orange-100 dark:border-orange-900/30">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{streak?.total_learning_days || 0}</div>
            <div className="text-xs text-muted-foreground">Tổng ngày học</div>
          </div>
        </div>
      </Card>

      {/* Achievement Grid - New comprehensive component */}
      <AchievementGrid earnedAchievements={achievements} />

      {/* Game Badges */}
      {gameProgress?.earned_badges && gameProgress.earned_badges.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-6 w-6 text-secondary" />
            <h3 className="font-bold text-xl">Huy hiệu trong game</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            {gameProgress.earned_badges.map((badge, index) => (
              <div
                key={index}
                className="text-4xl hover:scale-110 transition-transform cursor-pointer"
                title={`Huy hiệu ${index + 1}`}
              >
                {badge}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StatsTab;

