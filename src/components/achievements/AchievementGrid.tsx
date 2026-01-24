import { useMemo } from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ALL_ACHIEVEMENTS,
  AchievementDefinition,
  EarnedAchievement,
  getAchievementsByCategory,
  getCategoryLabel,
  getCategoryIcon,
} from "@/data/achievements";
import { AchievementCard } from "./AchievementCard";

interface AchievementGridProps {
  earnedAchievements: EarnedAchievement[];
}

export const AchievementGrid = ({ earnedAchievements }: AchievementGridProps) => {
  const earnedIds = useMemo(
    () => new Set(earnedAchievements.map((a) => a.achievement_id)),
    [earnedAchievements]
  );

  const earnedMap = useMemo(() => {
    const map = new Map<string, EarnedAchievement>();
    earnedAchievements.forEach((a) => map.set(a.achievement_id, a));
    return map;
  }, [earnedAchievements]);

  const categories: AchievementDefinition["category"][] = ["learning", "activity", "game"];

  const getCategoryProgress = (category: AchievementDefinition["category"]) => {
    const categoryAchievements = getAchievementsByCategory(category);
    const earned = categoryAchievements.filter((a) => earnedIds.has(a.id)).length;
    return {
      earned,
      total: categoryAchievements.length,
      percentage: (earned / categoryAchievements.length) * 100,
    };
  };

  const totalProgress = {
    earned: earnedAchievements.length,
    total: ALL_ACHIEVEMENTS.length,
    percentage: (earnedAchievements.length / ALL_ACHIEVEMENTS.length) * 100,
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Award className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl">Thành tựu & Huy hiệu</h3>
          <p className="text-sm text-muted-foreground">
            {totalProgress.earned}/{totalProgress.total} thành tựu đã mở khóa
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Tiến độ tổng</span>
          <span className="font-medium">{Math.round(totalProgress.percentage)}%</span>
        </div>
        <Progress value={totalProgress.percentage} className="h-2" />
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            Tất cả
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
              <span className="hidden sm:inline">{getCategoryIcon(category)}</span>{" "}
              {getCategoryLabel(category)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All achievements */}
        <TabsContent value="all">
          <div className="space-y-6">
            {categories.map((category) => {
              const progress = getCategoryProgress(category);
              const achievements = getAchievementsByCategory(category);
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Category header */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                    <h4 className="font-semibold">{getCategoryLabel(category)}</h4>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {progress.earned}/{progress.total}
                    </span>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {achievements.map((achievement, index) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        earnedData={earnedMap.get(achievement.id)}
                        index={index}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Individual category tabs */}
        {categories.map((category) => {
          const progress = getCategoryProgress(category);
          const achievements = getAchievementsByCategory(category);

          return (
            <TabsContent key={category} value={category}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Category progress */}
                <div className="mb-6 p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{getCategoryIcon(category)}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold">{getCategoryLabel(category)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {progress.earned}/{progress.total} đã mở khóa
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(progress.percentage)}%
                    </span>
                  </div>
                  <Progress value={progress.percentage} className="h-2" />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {achievements.map((achievement, index) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      earnedData={earnedMap.get(achievement.id)}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          );
        })}
      </Tabs>
    </Card>
  );
};
