-- Xóa hàm complete_stage_grade5 vì không còn sử dụng
-- Tất cả các grade đều dùng chung complete_stage
DROP FUNCTION IF EXISTS public.complete_stage_grade5(text, text, integer, integer, integer, integer, integer);

-- Xóa hàm get_user_progress_by_grade vì tham chiếu các bảng progressGrade không tồn tại
DROP FUNCTION IF EXISTS public.get_user_progress_by_grade(text);
