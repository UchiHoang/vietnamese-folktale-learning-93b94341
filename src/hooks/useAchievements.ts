import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ALL_ACHIEVEMENTS,
  AchievementDefinition,
  EarnedAchievement,
} from "@/data/achievements";

export interface UserStats {
  lessonsCompleted: number;
  streakDays: number;
  totalXp: number;
  totalPoints: number;
  levelReached: number;
  perfectLessons: number;
  totalLearningDays: number;
  levelsCompleted: number;
  starsEarned: number;
  badgesEarned: number;
  timeSpentMinutes: number;
}

interface UseAchievementsReturn {
  earnedAchievements: EarnedAchievement[];
  newlyUnlocked: AchievementDefinition | null;
  isLoading: boolean;
  checkAndUnlockAchievements: (stats: UserStats) => Promise<AchievementDefinition[]>;
  dismissNewAchievement: () => void;
  refreshAchievements: () => Promise<void>;
}

export const useAchievements = (): UseAchievementsReturn => {
  const [earnedAchievements, setEarnedAchievements] = useState<EarnedAchievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const notificationQueue = useRef<AchievementDefinition[]>([]);

  // Load earned achievements from database
  const refreshAchievements = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error loading achievements:", error);
        return;
      }

      setEarnedAchievements(data || []);
    } catch (error) {
      console.error("Error in refreshAchievements:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAchievements();
  }, [refreshAchievements]);

  // Check requirement against stats
  const checkRequirement = (
    achievement: AchievementDefinition,
    stats: UserStats
  ): boolean => {
    const { type, value } = achievement.requirement;

    switch (type) {
      case "lessons_completed":
        return stats.lessonsCompleted >= value;
      case "streak_days":
        return stats.streakDays >= value;
      case "total_xp":
        return stats.totalXp >= value;
      case "total_points":
        return stats.totalPoints >= value;
      case "level_reached":
        return stats.levelReached >= value;
      case "perfect_lessons":
        return stats.perfectLessons >= value;
      case "total_learning_days":
        return stats.totalLearningDays >= value;
      case "levels_completed":
        return stats.levelsCompleted >= value;
      case "stars_earned":
        return stats.starsEarned >= value;
      case "badges_earned":
        return stats.badgesEarned >= value;
      case "time_spent_minutes":
        return stats.timeSpentMinutes >= value;
      default:
        return false;
    }
  };

  // Unlock a single achievement
  const unlockAchievement = async (
    achievement: AchievementDefinition
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc("unlock_badge", {
        p_badge_id: achievement.id,
        p_badge_name: achievement.name,
        p_badge_description: achievement.description,
        p_badge_icon: achievement.icon,
      });

      if (error) {
        console.error("Error unlocking achievement:", error);
        return false;
      }

      // Handle both single object and array responses
      const result = Array.isArray(data) ? data[0] : data;
      return result?.success ?? false;
    } catch (error) {
      console.error("Error in unlockAchievement:", error);
      return false;
    }
  };

  // Show next notification from queue
  const showNextNotification = useCallback(() => {
    if (notificationQueue.current.length > 0 && !newlyUnlocked) {
      const next = notificationQueue.current.shift();
      if (next) {
        setNewlyUnlocked(next);
      }
    }
  }, [newlyUnlocked]);

  // Check and unlock all eligible achievements
  const checkAndUnlockAchievements = useCallback(
    async (stats: UserStats): Promise<AchievementDefinition[]> => {
      const earnedIds = new Set(earnedAchievements.map((a) => a.achievement_id));
      const newlyUnlockedList: AchievementDefinition[] = [];

      for (const achievement of ALL_ACHIEVEMENTS) {
        // Skip already earned
        if (earnedIds.has(achievement.id)) continue;

        // Check if requirement is met
        if (checkRequirement(achievement, stats)) {
          const success = await unlockAchievement(achievement);
          if (success) {
            newlyUnlockedList.push(achievement);
            earnedIds.add(achievement.id); // Prevent duplicate checks
          }
        }
      }

      // Add to notification queue
      if (newlyUnlockedList.length > 0) {
        notificationQueue.current.push(...newlyUnlockedList);
        await refreshAchievements();
        showNextNotification();
      }

      return newlyUnlockedList;
    },
    [earnedAchievements, refreshAchievements, showNextNotification]
  );

  // Dismiss current notification and show next
  const dismissNewAchievement = useCallback(() => {
    setNewlyUnlocked(null);
    // Small delay before showing next
    setTimeout(() => {
      showNextNotification();
    }, 300);
  }, [showNextNotification]);

  return {
    earnedAchievements,
    newlyUnlocked,
    isLoading,
    checkAndUnlockAchievements,
    dismissNewAchievement,
    refreshAchievements,
  };
};
