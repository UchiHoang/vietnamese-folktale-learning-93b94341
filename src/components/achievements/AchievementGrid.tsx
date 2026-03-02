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
  getCategoryIcon,
} from "@/data/achievements";
import { AchievementCard } from "./AchievementCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface AchievementGridProps {
  earnedAchievements: EarnedAchievement[];
}

export const AchievementGrid = ({ earnedAchievements }: AchievementGridProps) => {
  const { t } = useLanguage();

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

  const getCategoryLabel = (category: AchievementDefinition["category"]): string => {
    switch (category) {
      case "learning": return t.achievementGrid.categoryLearning;
      case "activity": return t.achievementGrid.categoryActivity;
      case "game": return t.achievementGrid.categoryGame;
      case "social": return t.achievementGrid.categorySocial;
      default: return category;
    }
  };

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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Award className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl">{t.achievementGrid.title}</h3>
          <p className="text-sm text-muted-foreground">
            {totalProgress.earned}/{totalProgress.total} {t.achievementGrid.unlocked}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">{t.achievementGrid.overallProgress}</span>
          <span className="font-medium">{Math.round(totalProgress.percentage)}%</span>
        </div>
        <Progress value={totalProgress.percentage} className="h-2" />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            {t.achievementGrid.all}
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
              <span className="hidden sm:inline">{getCategoryIcon(category)}</span>{" "}
              {getCategoryLabel(category)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-6">
            {categories.map((category) => {
              const progress = getCategoryProgress(category);
              const achievements = getAchievementsByCategory(category);
              return (
                <motion.div key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                    <h4 className="font-semibold">{getCategoryLabel(category)}</h4>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {progress.earned}/{progress.total}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {achievements.map((achievement, index) => (
                      <AchievementCard key={achievement.id} achievement={achievement} earnedData={earnedMap.get(achievement.id)} index={index} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {categories.map((category) => {
          const progress = getCategoryProgress(category);
          const achievements = getAchievementsByCategory(category);
          return (
            <TabsContent key={category} value={category}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-6 p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{getCategoryIcon(category)}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold">{getCategoryLabel(category)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {progress.earned}/{progress.total} {t.achievementGrid.categoryUnlocked}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(progress.percentage)}%
                    </span>
                  </div>
                  <Progress value={progress.percentage} className="h-2" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {achievements.map((achievement, index) => (
                    <AchievementCard key={achievement.id} achievement={achievement} earnedData={earnedMap.get(achievement.id)} index={index} />
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
