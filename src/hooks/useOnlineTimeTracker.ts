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

      // Try insert first (new day = no row yet)
      const { error: insertError } = await supabase
        .from("daily_activity")
        .insert({
          user_id: userId,
          activity_date: today,
          time_spent_minutes: 1,
        });

      if (insertError) {
        // Row already exists for today, increment time_spent_minutes
        const { data: current } = await supabase
          .from("daily_activity")
          .select("time_spent_minutes")
          .eq("user_id", userId)
          .eq("activity_date", today)
          .maybeSingle();

        if (current) {
          await supabase
            .from("daily_activity")
            .update({ time_spent_minutes: current.time_spent_minutes + 1 })
            .eq("user_id", userId)
            .eq("activity_date", today);
        }
      }
    };

    // Start interval (first tick after 60s)
    intervalRef.current = setInterval(tick, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled]);
};
