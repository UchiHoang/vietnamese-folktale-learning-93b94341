
CREATE OR REPLACE FUNCTION public.complete_stage(p_course_id text, p_node_index integer, p_score numeric, p_stars integer, p_xp_reward integer, p_game_specific_data jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_new_total_xp BIGINT;
  v_old_total_xp BIGINT := 0;
  v_new_level INT;
  v_current_level INT;
  v_needed_xp INT := 100;
  v_cp_id UUID;
  v_old_current_node INT;
  v_new_current_node INT;
  v_completed_nodes JSONB;
  v_total_stars INT;
  v_course_total_xp INT;
  v_extra_data JSONB;
  v_passed BOOLEAN := (p_stars > 0);
  v_duration INT;
  -- Delta variables
  v_old_best_xp INT := 0;
  v_old_best_stars INT := 0;
  v_old_best_score NUMERIC := 0;
  v_delta_xp INT;
  v_delta_stars INT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  v_duration := COALESCE((p_game_specific_data->>'timeSpent')::INT, 0);

  -- =============================================
  -- Lấy best record cũ từ level_history
  -- =============================================
  SELECT
    COALESCE(MAX(lh.stars), 0),
    COALESCE(MAX(lh.score), 0),
    COALESCE(MAX(COALESCE((lh.meta->>'xpReward')::INT, lh.score::INT)), 0)
  INTO v_old_best_stars, v_old_best_score, v_old_best_xp
  FROM public.level_history lh
  WHERE lh.user_id = v_user_id
    AND lh.course_id = p_course_id
    AND lh.node_index = p_node_index
    AND lh.passed = true;

  -- Tính delta: chỉ cộng phần chênh lệch nếu phá kỷ lục
  v_delta_xp := GREATEST(0, p_xp_reward - v_old_best_xp);
  v_delta_stars := GREATEST(0, p_stars - v_old_best_stars);

  -- =============================================
  -- Đảm bảo có row trong game_globals
  -- =============================================
  INSERT INTO public.game_globals(user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Lấy XP hiện tại (global)
  SELECT COALESCE(total_xp, 0), COALESCE(global_level, 1)
  INTO v_old_total_xp, v_current_level
  FROM public.game_globals
  WHERE user_id = v_user_id;

  -- Cập nhật Global XP và Coin (chỉ cộng delta)
  UPDATE public.game_globals
  SET 
    total_xp = total_xp + v_delta_xp,
    coins = coins + v_delta_stars,
    updated_at = NOW()
  WHERE user_id = v_user_id
  RETURNING total_xp, global_level INTO v_new_total_xp, v_current_level;

  -- Tính level mới
  v_new_level := GREATEST(1, CEIL(v_new_total_xp::NUMERIC / v_needed_xp));

  IF v_new_level > v_current_level THEN
    UPDATE public.game_globals
    SET global_level = v_new_level, updated_at = NOW()
    WHERE user_id = v_user_id;
  END IF;

  -- =============================================
  -- Lấy course_progress hiện tại
  -- =============================================
  SELECT id, current_node, completed_nodes, total_stars, COALESCE(total_xp, 0), extra_data
  INTO v_cp_id, v_old_current_node, v_completed_nodes, v_total_stars, v_course_total_xp, v_extra_data
  FROM public.course_progress
  WHERE user_id = v_user_id AND course_id = p_course_id;

  IF v_cp_id IS NULL THEN
    v_old_current_node := 0;
    v_completed_nodes := '[]'::jsonb;
    v_total_stars := 0;
    v_course_total_xp := 0;
    v_extra_data := '{}'::jsonb;
  END IF;

  v_course_total_xp := v_course_total_xp + v_delta_xp;

  IF v_passed THEN
    v_new_current_node := GREATEST(v_old_current_node, p_node_index + 1);
  ELSE
    v_new_current_node := v_old_current_node;
  END IF;

  IF v_passed THEN
    IF v_completed_nodes IS NULL OR v_completed_nodes = 'null'::jsonb THEN
      v_completed_nodes := jsonb_build_array(p_node_index);
    ELSIF NOT (v_completed_nodes @> jsonb_build_array(p_node_index)) THEN
      v_completed_nodes := v_completed_nodes || jsonb_build_array(p_node_index);
    END IF;
  END IF;

  -- Upsert course_progress (dùng delta)
  INSERT INTO public.course_progress(user_id, course_id, current_node, completed_nodes, total_stars, total_xp, extra_data)
  VALUES (v_user_id, p_course_id, v_new_current_node,
    CASE WHEN v_passed THEN jsonb_build_array(p_node_index) ELSE '[]'::jsonb END,
    v_delta_stars, v_delta_xp, COALESCE(p_game_specific_data, '{}'::jsonb))
  ON CONFLICT (user_id, course_id) DO UPDATE
  SET
    current_node = CASE 
      WHEN EXCLUDED.total_stars > 0 OR course_progress.current_node < v_new_current_node 
      THEN GREATEST(course_progress.current_node, v_new_current_node)
      ELSE course_progress.current_node
    END,
    completed_nodes = (
      SELECT COALESCE(jsonb_agg(DISTINCT value ORDER BY value), '[]'::jsonb)
      FROM jsonb_array_elements(
        COALESCE(NULLIF(course_progress.completed_nodes, 'null'::jsonb), '[]'::jsonb) || EXCLUDED.completed_nodes
      )
    ),
    total_stars = course_progress.total_stars + v_delta_stars,
    total_xp = course_progress.total_xp + v_delta_xp,
    extra_data = course_progress.extra_data || EXCLUDED.extra_data,
    updated_at = NOW()
  RETURNING id, current_node, completed_nodes, total_stars, total_xp, extra_data
  INTO v_cp_id, v_old_current_node, v_completed_nodes, v_total_stars, v_course_total_xp, v_extra_data;

  -- =============================================
  -- Lưu lịch sử (luôn lưu đầy đủ, không dùng delta)
  -- =============================================
  INSERT INTO public.level_history(user_id, course_id, node_index, score, stars, duration_seconds, passed, meta)
  VALUES (v_user_id, p_course_id, p_node_index, p_score, p_stars, v_duration, v_passed,
    p_game_specific_data || jsonb_build_object('xpReward', p_xp_reward, 'deltaXp', v_delta_xp, 'deltaStars', v_delta_stars));

  -- =============================================
  -- daily_activity: chỉ cộng delta
  -- =============================================
  INSERT INTO public.daily_activity (user_id, activity_date, xp_earned, points_earned, lessons_completed, time_spent_minutes)
  VALUES (v_user_id, CURRENT_DATE, v_delta_xp, p_score::int, 1, GREATEST(1, v_duration / 60))
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET
    xp_earned = daily_activity.xp_earned + v_delta_xp,
    points_earned = daily_activity.points_earned + p_score::int,
    lessons_completed = daily_activity.lessons_completed + 1,
    time_spent_minutes = daily_activity.time_spent_minutes + GREATEST(1, v_duration / 60);

  -- Update streak
  PERFORM public.update_user_streak(v_user_id);

  RETURN jsonb_build_object(
    'success', true,
    'globals', jsonb_build_object(
      'total_xp', v_new_total_xp,
      'global_level', v_new_level,
      'coins', (SELECT coins FROM public.game_globals WHERE user_id = v_user_id)
    ),
    'course', jsonb_build_object(
      'course_id', p_course_id,
      'current_node', v_old_current_node,
      'completed_nodes', v_completed_nodes,
      'total_stars', v_total_stars,
      'total_xp', v_course_total_xp,
      'extra_data', v_extra_data
    ),
    'delta', jsonb_build_object(
      'delta_xp', v_delta_xp,
      'delta_stars', v_delta_stars,
      'old_best_xp', v_old_best_xp,
      'old_best_stars', v_old_best_stars
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;
