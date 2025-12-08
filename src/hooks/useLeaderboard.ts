import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: string;
  school: string | null;
  grade: string | null;
  totalPoints: number;
  totalXp: number;
}

export const useLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (
    grade: string | null = null,
    period: string = 'week',
    limit: number = 10
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_leaderboard', {
        p_grade: grade,
        p_period: period,
        p_limit: limit
      });

      if (rpcError) {
        console.error('Error fetching leaderboard:', rpcError);
        setError(rpcError.message);
        return [];
      }

      if (data && Array.isArray(data)) {
        const leaderboardData: LeaderboardEntry[] = data.map((entry: Record<string, unknown>) => ({
          rank: Number(entry.rank) || 0,
          userId: String(entry.user_id || ''),
          displayName: String(entry.display_name || 'Học sinh'),
          avatar: String(entry.avatar || '👤'),
          school: entry.school ? String(entry.school) : null,
          grade: entry.grade ? String(entry.grade) : null,
          totalPoints: Number(entry.total_points) || 0,
          totalXp: Number(entry.total_xp) || 0,
        }));
        
        setEntries(leaderboardData);
        return leaderboardData;
      }

      return [];
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load leaderboard');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    entries,
    isLoading,
    error,
    fetchLeaderboard,
  };
};
