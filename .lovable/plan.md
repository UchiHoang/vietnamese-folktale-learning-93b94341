
# Sửa hệ thống Thành tựu & Huy hiệu

## Vấn đề phát hiện

1. **Bảng `user_badges` không tồn tại**: Hàm `unlock_badge` trong database ghi vào bảng `user_badges` nhưng bảng này không có trong hệ thống. Bảng thực tế là `user_achievements`. Vì vậy mỗi lần mở khóa huy hiệu đều thất bại.

2. **Thành tựu chỉ được kiểm tra ở trang Hồ sơ**: Sau khi chơi game xong, hệ thống không tự động kiểm tra thành tựu. Người chơi phải vào trang Profile mới trigger được.

3. **Nhiều chỉ số luôn bằng 0**: `perfectLessons`, `starsEarned`, `timeSpentMinutes` đều bị gán cứng = 0, khiến nhiều thành tựu không bao giờ mở khóa được.

## Kế hoạch sửa

### Buoc 1: Sửa hàm `unlock_badge` trong database
- Tạo migration sửa RPC `unlock_badge` để ghi vào bảng `user_achievements` thay vì `user_badges`
- Map cột cho đúng: `badge_id` -> `achievement_id`, `badge_name` -> `achievement_name`, v.v.

### Buoc 2: Thu thập stats đầy đủ từ database
- Sửa hàm `checkAchievements` trong `Profile.tsx` để query thêm dữ liệu thực:
  - `starsEarned`: tổng `total_stars` từ `course_progress`
  - `timeSpentMinutes`: tổng `time_spent_minutes` từ `daily_activity`
  - `perfectLessons`: đếm số stage có `accuracy = 100` từ `level_history`

### Buoc 3: Tích hợp kiểm tra thành tựu sau khi chơi game
- Thêm logic gọi `checkAndUnlockAchievements` sau khi `completeStage` thành công trong `useGameProgress.ts`
- Hiển thị thông báo huy hiệu mới ngay sau khi chơi xong

---

### Chi tiet ky thuat

**Migration SQL** -- Sửa hàm `unlock_badge`:

```text
DROP FUNCTION IF EXISTS public.unlock_badge;

CREATE FUNCTION public.unlock_badge(...)
  -- Thay "user_badges" -> "user_achievements"
  -- Thay "badge_id" -> "achievement_id"
  -- Thay "badge_name" -> "achievement_name"
  -- Thay "badge_description" -> "achievement_description"  
  -- Thay "badge_icon" -> "achievement_icon"
```

**Profile.tsx** -- Query stats thực:

```text
// Thay vì hardcode 0:
const { data: historyData } = await supabase
  .from('level_history').select('stars, score, meta')
  .eq('user_id', userId);

const { data: activityData } = await supabase
  .from('daily_activity').select('time_spent_minutes')
  .eq('user_id', userId);

stats.starsEarned = coursesData.reduce((s, c) => s + c.total_stars, 0);
stats.timeSpentMinutes = activityData.reduce((s, a) => s + a.time_spent_minutes, 0);
stats.perfectLessons = historyData.filter(h => h.stars === 3).length;
```

**useGameProgress.ts** -- Trigger achievements post-game:

```text
// Trong onSuccess của completeStage mutation:
// 1. Thu thập stats mới từ result
// 2. Gọi checkAndUnlockAchievements(stats)
```

Cac file can thay doi:
- `supabase/migrations/` -- migration mới sửa `unlock_badge`
- `src/pages/Profile.tsx` -- query stats đầy đủ
- `src/hooks/useGameProgress.ts` -- trigger check achievements sau game
- `src/hooks/useAchievements.ts` -- nhận callback từ game context
