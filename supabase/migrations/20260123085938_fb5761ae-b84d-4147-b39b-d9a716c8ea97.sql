-- ==========================================
-- 1. BẢNG LESSONS (Lớp học / Chương học)
-- ==========================================
CREATE TABLE public.lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  topic_count INTEGER NOT NULL DEFAULT 0,
  quiz_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Ai cũng có thể xem danh sách lớp học
CREATE POLICY "Everyone can view lessons"
ON public.lessons FOR SELECT
USING (true);

-- Chỉ admin mới có thể thêm/sửa/xóa
CREATE POLICY "Admins can insert lessons"
ON public.lessons FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update lessons"
ON public.lessons FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete lessons"
ON public.lessons FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger update updated_at
CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- 2. BẢNG TOPICS (Bài giảng / Video)
-- ==========================================
CREATE TABLE public.topics (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Ai cũng có thể xem danh sách topics
CREATE POLICY "Everyone can view topics"
ON public.topics FOR SELECT
USING (true);

-- Chỉ admin mới có thể thêm/sửa/xóa
CREATE POLICY "Admins can insert topics"
ON public.topics FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update topics"
ON public.topics FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete topics"
ON public.topics FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index để query nhanh theo lesson_id và semester
CREATE INDEX idx_topics_lesson_semester ON public.topics(lesson_id, semester);

-- Trigger update updated_at
CREATE TRIGGER update_topics_updated_at
BEFORE UPDATE ON public.topics
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- 3. BẢNG USER_LESSON_PROGRESS (Tiến độ học tập)
-- ==========================================
CREATE TABLE public.user_lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  watch_time_seconds INTEGER NOT NULL DEFAULT 0,
  last_position_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- Enable RLS
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users chỉ xem được tiến độ của mình
CREATE POLICY "Users can view own progress"
ON public.user_lesson_progress FOR SELECT
USING (auth.uid() = user_id);

-- Users có thể tạo tiến độ của mình
CREATE POLICY "Users can insert own progress"
ON public.user_lesson_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users có thể cập nhật tiến độ của mình
CREATE POLICY "Users can update own progress"
ON public.user_lesson_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Index để query nhanh theo user_id
CREATE INDEX idx_user_lesson_progress_user ON public.user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_topic ON public.user_lesson_progress(topic_id);

-- Trigger update updated_at
CREATE TRIGGER update_user_lesson_progress_updated_at
BEFORE UPDATE ON public.user_lesson_progress
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- 4. FUNCTION: Đánh dấu hoàn thành video
-- ==========================================
CREATE OR REPLACE FUNCTION public.mark_topic_completed(p_topic_id TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_already_completed BOOLEAN;
  v_xp_earned INTEGER := 20; -- XP cho mỗi video
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Kiểm tra xem đã hoàn thành chưa
  SELECT is_completed INTO v_already_completed
  FROM public.user_lesson_progress
  WHERE user_id = v_user_id AND topic_id = p_topic_id;

  -- Nếu đã hoàn thành trước đó, không cộng thêm XP
  IF v_already_completed = true THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_completed', true,
      'xp_earned', 0,
      'message', 'Bài học đã được hoàn thành trước đó'
    );
  END IF;

  -- Upsert tiến độ
  INSERT INTO public.user_lesson_progress (user_id, topic_id, is_completed, completed_at)
  VALUES (v_user_id, p_topic_id, true, now())
  ON CONFLICT (user_id, topic_id)
  DO UPDATE SET
    is_completed = true,
    completed_at = COALESCE(user_lesson_progress.completed_at, now()),
    updated_at = now();

  -- Cộng XP vào game_globals
  INSERT INTO public.game_globals (user_id, total_xp)
  VALUES (v_user_id, v_xp_earned)
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_xp = game_globals.total_xp + v_xp_earned,
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'already_completed', false,
    'xp_earned', v_xp_earned,
    'message', 'Hoàn thành bài học thành công!'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ==========================================
-- 5. FUNCTION: Lấy tiến độ theo lesson
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_lesson_progress(p_lesson_id TEXT DEFAULT NULL)
RETURNS TABLE(
  lesson_id TEXT,
  total_topics BIGINT,
  completed_topics BIGINT,
  completion_percentage NUMERIC
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    t.lesson_id,
    COUNT(t.id) as total_topics,
    COUNT(ulp.id) FILTER (WHERE ulp.is_completed = true) as completed_topics,
    CASE 
      WHEN COUNT(t.id) > 0 THEN 
        ROUND((COUNT(ulp.id) FILTER (WHERE ulp.is_completed = true)::NUMERIC / COUNT(t.id)::NUMERIC) * 100, 1)
      ELSE 0
    END as completion_percentage
  FROM public.topics t
  LEFT JOIN public.user_lesson_progress ulp 
    ON ulp.topic_id = t.id AND ulp.user_id = v_user_id
  WHERE (p_lesson_id IS NULL OR t.lesson_id = p_lesson_id)
  GROUP BY t.lesson_id;
END;
$$;