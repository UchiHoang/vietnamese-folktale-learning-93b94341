import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ParentalSettings {
  user_id: string;
  daily_limit_minutes: number | null;
  limit_enabled: boolean;
  extra_time_used: boolean;
  last_reset_date: string;
}

interface UseStudyTimeLimitReturn {
  isLimitReached: boolean;
  remainingMinutes: number;
  dailyLimit: number | null;
  todayTimeSpent: number;
  settings: ParentalSettings | null;
  extraTimeUsed: boolean;
  grantExtraTime: () => Promise<void>;
  updateSettings: (limit_enabled: boolean, daily_limit_minutes: number | null) => Promise<void>;
  loading: boolean;
}

export const useStudyTimeLimit = (): UseStudyTimeLimitReturn => {
  const [settings, setSettings] = useState<ParentalSettings | null>(null);
  const [todayTimeSpent, setTodayTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [extraTimeGranted, setExtraTimeGranted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;
      const today = new Date().toISOString().split("T")[0];

      // Fetch settings and today's activity in parallel
      const [settingsRes, activityRes] = await Promise.all([
        supabase
          .from("parental_settings" as any)
          .select("*")
          .eq("user_id", userId)
          .single(),
        supabase
          .from("daily_activity")
          .select("time_spent_minutes")
          .eq("user_id", userId)
          .eq("activity_date", today)
          .single(),
      ]);

      const settingsData = (settingsRes.data as unknown) as ParentalSettings | null;

      // Reset extra_time_used if it's a new day
      if (settingsData && settingsData.last_reset_date !== today) {
        await supabase
          .from("parental_settings" as any)
          .update({ extra_time_used: false, last_reset_date: today } as any)
          .eq("user_id", userId);
        settingsData.extra_time_used = false;
        settingsData.last_reset_date = today;
      }

      setSettings(settingsData);
      setTodayTimeSpent(activityRes.data?.time_spent_minutes ?? 0);
      setExtraTimeGranted(settingsData?.extra_time_used ?? false);
    } catch (err) {
      console.error("useStudyTimeLimit error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Poll every 60 seconds
    intervalRef.current = setInterval(fetchData, 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  const dailyLimit = settings?.limit_enabled ? settings.daily_limit_minutes : null;
  const effectiveLimit = dailyLimit != null
    ? dailyLimit + (extraTimeGranted && settings?.extra_time_used ? 0 : extraTimeGranted ? 5 : 0)
    : null;
  
  // Simpler logic: if extra time was granted in this session, add 5 minutes
  const actualLimit = dailyLimit != null
    ? dailyLimit + (extraTimeGranted ? 5 : 0)
    : null;

  const remainingMinutes = actualLimit != null ? Math.max(0, actualLimit - todayTimeSpent) : Infinity;
  const isLimitReached = settings?.limit_enabled === true && actualLimit != null && todayTimeSpent >= actualLimit;

  const grantExtraTime = useCallback(async () => {
    if (!settings || settings.extra_time_used) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      await supabase
        .from("parental_settings" as any)
        .update({ extra_time_used: true } as any)
        .eq("user_id", session.user.id);

      setExtraTimeGranted(true);
      setSettings((prev) => prev ? { ...prev, extra_time_used: true } : prev);
    } catch (err) {
      console.error("grantExtraTime error:", err);
    }
  }, [settings]);

  const updateSettings = useCallback(async (limit_enabled: boolean, daily_limit_minutes: number | null) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;
      const today = new Date().toISOString().split("T")[0];

      const payload = {
        user_id: userId,
        limit_enabled,
        daily_limit_minutes,
        last_reset_date: today,
      };

      // Upsert
      const { error } = await supabase
        .from("parental_settings" as any)
        .upsert(payload as any, { onConflict: "user_id" });

      if (error) throw error;

      setSettings((prev) => ({
        user_id: userId,
        extra_time_used: prev?.extra_time_used ?? false,
        last_reset_date: today,
        ...prev,
        daily_limit_minutes,
        limit_enabled,
      }));
    } catch (err) {
      console.error("updateSettings error:", err);
    }
  }, []);

  return {
    isLimitReached,
    remainingMinutes: remainingMinutes === Infinity ? 999 : remainingMinutes,
    dailyLimit,
    todayTimeSpent,
    settings,
    extraTimeUsed: settings?.extra_time_used ?? false,
    grantExtraTime,
    updateSettings,
    loading,
  };
};
