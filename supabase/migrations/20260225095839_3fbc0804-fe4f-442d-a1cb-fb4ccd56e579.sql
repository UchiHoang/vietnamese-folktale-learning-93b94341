
-- Allow admins to view all daily_activity
CREATE POLICY "Admins can view all daily_activity"
ON public.daily_activity FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all stage_history
CREATE POLICY "Admins can view all stage_history"
ON public.stage_history FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all game_globals
CREATE POLICY "Admins can view all game_globals"
ON public.game_globals FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all course_progress
CREATE POLICY "Admins can view all course_progress"
ON public.course_progress FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));
