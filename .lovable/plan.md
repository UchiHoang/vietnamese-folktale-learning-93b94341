

## Kế hoạch: Thay thế dữ liệu mock trong Phân tích học tập bằng dữ liệu thực

### Tổng quan

Hiện tại `AnalyticsTab` sử dụng rất nhiều dữ liệu giả/random cho:
1. **Biểu đồ XP/thời gian theo ngày** - fallback `getMockData()` với `Math.random()`
2. **Radar kỹ năng** - `Math.random()` trên base skill
3. **Phân bổ chủ đề** - hardcoded percentages
4. **Hiệu suất theo thời gian trong ngày** - hardcoded values
5. **So sánh tuần** - hardcoded "+12%", "+8%", etc.
6. **Gợi ý phụ huynh** - hardcoded text

Sẽ thay thế toàn bộ bằng dữ liệu thực từ `level_history` và `stage_history`.

---

### Nguồn dữ liệu thực có sẵn

| Bảng | Cột hữu ích |
|------|-------------|
| `level_history` | `course_id`, `node_index`, `score`, `stars`, `duration_seconds`, `passed`, `meta`, `created_at` |
| `stage_history` | `course_id`, `stage_id`, `score`, `correct_answers`, `total_questions`, `time_spent_seconds`, `accuracy`, `xp_earned`, `created_at` |
| `course_progress` | `course_id`, `total_xp`, `completed_nodes`, `total_stars` |
| `game_globals` | `total_xp`, `global_level`, `coins` |

---

### Chi tiết thay đổi

#### 1. Tải dữ liệu thực thay vì daily_activity

Thay vì query bảng `daily_activity` (gần như trống), sẽ query `level_history` va `stage_history` trực tiếp, sau đó tính toán phía client:

```
level_history -> group by DATE(created_at) -> XP/ngày, điểm/ngày, số bài/ngày
stage_history -> accuracy, time_spent -> hiệu suất theo giờ
```

#### 2. Biểu đồ XP và thời gian theo ngày (thay getMockData)

- Group `level_history` theo ngày (`created_at::date`)
- Tính: `SUM(score)` cho XP, `COUNT(*)` cho số bài, `SUM(duration_seconds)/60` cho thời gian
- Lọc theo `timeRange` (7d/30d/all)
- Nếu không có dữ liệu: hiển thị thông báo "Chua co du lieu" thay vi mock

#### 3. Radar kỹ năng (thay Math.random)

Tính toán dựa trên `course_id` trong `level_history`:
- Map course_id sang kỹ năng:
  - `preschool-*` -> "Dem so"
  - `grade1-*` -> "Tinh toan"
  - `grade2-*` -> "Phep cong/tru"
  - `grade3-*` -> "Hinh hoc" (Song Hong)
  - `grade4-*` -> "Do luong" (Giong)
  - `grade5-*` -> "Logic"
- Giá trị = `AVG(score) / MAX(score) * 100` cho mỗi nhóm course
- Nếu course chưa chơi -> giá trị = 0

#### 4. Phân bổ chủ đề (thay hardcoded)

- Group `level_history` theo `course_id`
- Tính `COUNT(*)` cho mỗi course
- Chuyển thành phần trăm: `count / total * 100`
- Map course_id sang tên hiển thị tiếng Việt

#### 5. Hiệu suất theo thời gian trong ngày (thay hardcoded)

- Từ `stage_history`, group theo giờ (`EXTRACT(HOUR FROM created_at)`):
  - Sáng (6-12h), Chiều (12-18h), Tối (18-22h)
- Tính `AVG(accuracy)` và `COUNT(*)` cho mỗi khung giờ

#### 6. So sánh tuần (thay hardcoded percentages)

- Tuần này: filter `level_history` trong 7 ngày gần nhất
- Tuần trước: filter 7-14 ngày trước
- Tính delta % thực tế cho XP/ngày, thời gian/ngày, độ chính xác, số bài

#### 7. Gợi ý phụ huynh (dynamic)

- Xác định khung giờ có accuracy cao nhất
- Xác định course có ít lượt chơi nhất (cần cải thiện)
- Tính thời gian học trung bình và đề xuất mục tiêu

---

### Kỹ thuật

File thay đổi: **`src/components/profile/AnalyticsTab.tsx`** (viết lại phần logic, giữ nguyên JSX/UI)

Luồng xử lý:
1. `useEffect` -> gọi 2 query song song: `level_history` + `stage_history` (filter `user_id = auth.uid()`)
2. Xử lý tất cả tính toán phía client (group by date, group by course, group by hour)
3. Áp dụng bộ lọc `timeRange` trên dữ liệu đã tải
4. Khi không có dữ liệu thực -> hiển thị "Chua co du lieu hoc tap" thay vì mock data
5. Loại bỏ hoàn toàn hàm `getMockData()` và mọi `Math.random()`

Không cần migration database - chỉ cần thay đổi frontend query.

