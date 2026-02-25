import { useCallback } from "react";
import { useGameProgress, CompleteStageResult } from "./useGameProgress";
import { useAchievements, UserStats } from "./useAchievements";
import { supabase } from "@/integrations/supabase/client";

/**
 * Wraps useGameProgress + useAchievements so that achievements
 * are automatically checked after each successful stage completion.
 */
export const useGameProgressWithAchievements = (courseId: string) => {
  const achievements = useAchievements();

  const fetchAndCheckAchievements = useCallback(
    async (result: CompleteStageResult) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const userId = session.user.id;

        // Fetch real stats in parallel
        const [streakRes, coursesRes, historyRes, activityRes] =
          await Promise.all([
            supabase
              .from("user_streaks")
              .select("current_streak, total_learning_days")
              .eq("user_id", userId)
              .single(),
            supabase
              .from("course_progress")
              .select("total_stars, completed_nodes")
              .eq("user_id", userId),
            supabase
              .from("level_history")
              .select("stars")
              .eq("user_id", userId),
            supabase
              .from("daily_activity")
              .select("time_spent_minutes")
              .eq("user_id", userId),
          ]);

        const courses = coursesRes.data || [];
        const starsEarned = courses.reduce(
          (s, c) => s + (c.total_stars || 0),
          0
        );
        const allCompleted = courses.reduce((acc, c) => {
          const nodes = Array.isArray(c.completed_nodes)
            ? c.completed_nodes
            : [];
          return acc + nodes.length;
        }, 0);
        const perfectLessons = (historyRes.data || []).filter(
          (h) => h.stars === 3
        ).length;
        const timeSpentMinutes = (activityRes.data || []).reduce(
          (s, a) => s + (a.time_spent_minutes || 0),
          0
        );

        const stats: UserStats = {
          lessonsCompleted: allCompleted,
          streakDays: streakRes.data?.current_streak || 0,
          totalXp: result.globals.total_xp,
          totalPoints: result.globals.coins,
          levelReached: result.globals.global_level,
          perfectLessons,
          totalLearningDays: streakRes.data?.total_learning_days || 0,
          levelsCompleted: allCompleted,
          starsEarned,
          badgesEarned: achievements.earnedAchievements.length,
          timeSpentMinutes,
        };

        await achievements.checkAndUnlockAchievements(stats);
      } catch (err) {
        console.error("Error checking achievements post-game:", err);
      }
    },
    [achievements]
  );

  const gameProgress = useGameProgress(courseId, {
    onStageComplete: fetchAndCheckAchievements,
  });

  return {
    ...gameProgress,
    achievements,
  };
};
