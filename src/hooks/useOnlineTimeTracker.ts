import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks real online time on game/lesson pages.
 * Every 60 seconds (while tab is visible), adds +1 minute to daily_activity.time_spent_minutes.
 */
export const useOnlineTimeTracker = (enabled: boolean) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const tick = async () => {
      if (document.hidden) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;
      const today = new Date().toISOString().split("T")[0];

      // Check if row exists first to avoid 409 duplicate key error
      const { data: existing } = await supabase
        .from("daily_activity")
        .select("time_spent_minutes")
        .eq("user_id", userId)
        .eq("activity_date", today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("daily_activity")
          .update({ time_spent_minutes: existing.time_spent_minutes + 1 })
          .eq("user_id", userId)
          .eq("activity_date", today);
      } else {
        await supabase
          .from("daily_activity")
          .insert({
            user_id: userId,
            activity_date: today,
            time_spent_minutes: 1,
          });
      }
    };

    intervalRef.current = setInterval(tick, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled]);
};
