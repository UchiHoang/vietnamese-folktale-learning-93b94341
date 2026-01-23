import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LessonData {
  id: string;
  title: string;
  description?: string;
}

export interface TopicData {
  id: string;
  lesson_id: string;
  semester: 1 | 2;
  title: string;
  video_url: string;
  description?: string;
  order_index: number;
  duration_minutes?: number;
}

export interface LessonProgress {
  lesson_id: string;
  total_topics: number;
  completed_topics: number;
  completion_percentage: number;
}

export interface UserTopicProgress {
  topic_id: string;
  is_completed: boolean;
  completed_at?: string;
}

export const useLessonProgress = () => {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch lessons from database
  const fetchLessons = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("lessons")
        .select("*")
        .order("id");

      if (fetchError) {
        console.error("Error fetching lessons:", fetchError);
        setError(fetchError.message);
        return [];
      }

      return (data || []).map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description || undefined,
      }));
    } catch (err) {
      console.error("Unexpected error fetching lessons:", err);
      return [];
    }
  }, []);

  // Fetch topics from database
  const fetchTopics = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("topics")
        .select("*")
        .order("order_index");

      if (fetchError) {
        console.error("Error fetching topics:", fetchError);
        setError(fetchError.message);
        return [];
      }

      return (data || []).map((t) => ({
        id: t.id,
        lesson_id: t.lesson_id,
        semester: t.semester as 1 | 2,
        title: t.title,
        video_url: t.video_url,
        description: t.description || undefined,
        order_index: t.order_index,
        duration_minutes: t.duration_minutes || undefined,
      }));
    } catch (err) {
      console.error("Unexpected error fetching topics:", err);
      return [];
    }
  }, []);

  // Fetch lesson progress for current user
  const fetchLessonProgress = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error: fetchError } = await supabase.rpc("get_lesson_progress");

      if (fetchError) {
        console.error("Error fetching lesson progress:", fetchError);
        return [];
      }

      return (data || []).map((p: { lesson_id: string; total_topics: number; completed_topics: number; completion_percentage: number }) => ({
        lesson_id: p.lesson_id,
        total_topics: Number(p.total_topics),
        completed_topics: Number(p.completed_topics),
        completion_percentage: Number(p.completion_percentage),
      }));
    } catch (err) {
      console.error("Unexpected error fetching progress:", err);
      return [];
    }
  }, []);

  // Fetch completed topics for current user
  const fetchCompletedTopics = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return new Set<string>();

      const { data, error: fetchError } = await supabase
        .from("user_lesson_progress")
        .select("topic_id")
        .eq("is_completed", true);

      if (fetchError) {
        console.error("Error fetching completed topics:", fetchError);
        return new Set<string>();
      }

      return new Set((data || []).map((p) => p.topic_id));
    } catch (err) {
      console.error("Unexpected error:", err);
      return new Set<string>();
    }
  }, []);

  // Mark topic as completed
  const markTopicCompleted = useCallback(async (topicId: string): Promise<{
    success: boolean;
    xpEarned: number;
    alreadyCompleted: boolean;
    message: string;
  }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          xpEarned: 0,
          alreadyCompleted: false,
          message: "Chưa đăng nhập",
        };
      }

      const { data, error: rpcError } = await supabase.rpc("mark_topic_completed", {
        p_topic_id: topicId,
      });

      if (rpcError) {
        console.error("Error marking topic completed:", rpcError);
        return {
          success: false,
          xpEarned: 0,
          alreadyCompleted: false,
          message: rpcError.message,
        };
      }

      const result = data as { success: boolean; xp_earned: number; already_completed: boolean; message: string };

      if (result.success) {
        // Update local state
        setCompletedTopics((prev) => new Set([...prev, topicId]));

        // Refresh lesson progress
        const newProgress = await fetchLessonProgress();
        setLessonProgress(newProgress);

        if (!result.already_completed) {
          toast.success(`🎉 +${result.xp_earned} XP! ${result.message}`);
        }
      }

      return {
        success: result.success,
        xpEarned: result.xp_earned || 0,
        alreadyCompleted: result.already_completed || false,
        message: result.message || "",
      };
    } catch (err) {
      console.error("Unexpected error:", err);
      return {
        success: false,
        xpEarned: 0,
        alreadyCompleted: false,
        message: "Lỗi không xác định",
      };
    }
  }, [fetchLessonProgress]);

  // Get progress for a specific lesson
  const getLessonProgressById = useCallback((lessonId: string): LessonProgress | null => {
    return lessonProgress.find((p) => p.lesson_id === lessonId) || null;
  }, [lessonProgress]);

  // Check if topic is completed
  const isTopicCompleted = useCallback((topicId: string): boolean => {
    return completedTopics.has(topicId);
  }, [completedTopics]);

  // Load all data on mount
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      const [fetchedLessons, fetchedTopics, fetchedProgress, fetchedCompleted] = await Promise.all([
        fetchLessons(),
        fetchTopics(),
        fetchLessonProgress(),
        fetchCompletedTopics(),
      ]);

      if (mounted) {
        setLessons(fetchedLessons);
        setTopics(fetchedTopics);
        setLessonProgress(fetchedProgress);
        setCompletedTopics(fetchedCompleted);
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [fetchLessons, fetchTopics, fetchLessonProgress, fetchCompletedTopics]);

  return {
    lessons,
    topics,
    lessonProgress,
    completedTopics,
    isLoading,
    error,
    markTopicCompleted,
    getLessonProgressById,
    isTopicCompleted,
    refreshProgress: fetchLessonProgress,
  };
};
