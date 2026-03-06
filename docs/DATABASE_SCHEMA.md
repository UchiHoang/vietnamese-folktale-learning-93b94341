# Database Schema Documentation

> Cập nhật: 2026-03-06

## Tổng quan

| Thống kê | Số lượng |
|----------|----------|
| Bảng dữ liệu | 17 |
| Functions | 11 |
| Storage Buckets | 2 |
| Enum | 1 |

---

## Enum

### `app_role`
`student` | `teacher` | `admin`

---

## Bảng dữ liệu

### 1. `profiles`
> Thông tin mở rộng của user (tên, avatar, trường, lớp, địa chỉ...)

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | uuid | NOT NULL | — |
| display_name | text | NOT NULL | — |
| avatar | text | YES | '👤' |
| email | text | YES | — |
| phone | text | YES | — |
| birth_date | date | YES | — |
| gender | text | YES | — |
| grade | text | YES | — |
| school | text | YES | — |
| class_id | uuid | YES | — |
| class_name | text | YES | — |
| province | text | YES | — |
| district | text | YES | — |
| ward | text | YES | — |
| address | text | YES | — |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

**Foreign Keys:** `class_id` → `classes.id`

**RLS Policies:**
- `SELECT` — Public profiles are viewable by everyone (`true`)
- `SELECT` — Admins can view all profiles (`has_role(auth.uid(), 'admin')`)
- `SELECT` — Users can view own profile (`auth.uid() = id`)
- `INSERT` — Users can insert own profile (`auth.uid() = id`)
- `UPDATE` — Users can update own profile (`auth.uid() = id`)

**🚫 Không cho phép:** DELETE

---

### 2. `user_roles`
> Phân quyền RBAC (student / teacher / admin)

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | uuid | NOT NULL | gen_random_uuid() |
| user_id | uuid | NOT NULL | — |
| role | app_role | NOT NULL | 'student' |

**RLS Policies:**
- `SELECT` — Users can view their own role (`auth.uid() = user_id`)
- `SELECT` — Admins can view all roles (`has_role(auth.uid(), 'admin')`)

**🚫 Không cho phép:** INSERT, UPDATE, DELETE

---

### 3. `parental_settings`
> Cài đặt giới hạn thời gian học của phụ huynh

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 user_id | uuid | NOT NULL | — |
| limit_enabled | boolean | NOT NULL | false |
| daily_limit_minutes | integer | YES | — |
| extra_time_used | boolean | NOT NULL | false |
| last_reset_date | date | NOT NULL | CURRENT_DATE |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

**RLS Policies:**
- `SELECT` — Users can view own parental_settings (`auth.uid() = user_id`)
- `INSERT` — Users can insert own parental_settings (`auth.uid() = user_id`)
- `UPDATE` — Users can update own parental_settings (`auth.uid() = user_id`)

**🚫 Không cho phép:** DELETE

---

### 4. `game_globals`
> Trạng thái game tổng (XP, level, coins, badges) của user

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 user_id | uuid | NOT NULL | — |
| total_xp | bigint | NOT NULL | 0 |
| global_level | integer | NOT NULL | 1 |
| coins | bigint | NOT NULL | 0 |
| avatar_config | jsonb | NOT NULL | '{}' |
| unlocked_badges | jsonb | NOT NULL | '[]' |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

**RLS Policies:**
- `SELECT` — gg_select_own (`auth.uid() = user_id`)
- `SELECT` — Admins can view all game_globals (`has_role(auth.uid(), 'admin')`)
- `UPDATE` — gg_update_own (`auth.uid() = user_id`)

**🚫 Không cho phép:** INSERT, DELETE

---

### 5. `course_progress`
> Tiến trình từng khóa game (node hiện tại, XP, sao, nodes đã hoàn thành)

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | uuid | NOT NULL | gen_random_uuid() |
| user_id | uuid | NOT NULL | — |
| course_id | text | NOT NULL | — |
| current_node | integer | NOT NULL | 0 |
| total_xp | integer | NOT NULL | 0 |
| total_stars | integer | NOT NULL | 0 |
| completed_nodes | jsonb | NOT NULL | '[]' |
| extra_data | jsonb | NOT NULL | '{}' |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

**RLS Policies:**
- `SELECT` — cp_select_own (`auth.uid() = user_id`)
- `SELECT` — Admins can view all course_progress (`has_role(auth.uid(), 'admin')`)
- `INSERT` — cp_insert_own (`auth.uid() = user_id`)
- `UPDATE` — cp_update_own (`auth.uid() = user_id`)

**🚫 Không cho phép:** DELETE

---

### 6. `level_history`
> Lịch sử chơi từng level (điểm, sao, thời gian, pass/fail)

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | uuid | NOT NULL | gen_random_uuid() |
| user_id | uuid | NOT NULL | — |
| course_id | text | NOT NULL | — |
| node_index | integer | NOT NULL | — |
| score | numeric | NOT NULL | 0 |
| stars | integer | NOT NULL | 0 |
| passed | boolean | NOT NULL | true |
| duration_seconds | integer | NOT NULL | 0 |
| meta | jsonb | NOT NULL | '{}' |
| created_at | timestamptz | NOT NULL | now() |

**RLS Policies:**
- `SELECT` — lh_select_own (`auth.uid() = user_id`)
- `SELECT` — leaderboard_read_level_history (`true`)
- `INSERT` — lh_insert_own (`auth.uid() = user_id`)

**🚫 Không cho phép:** UPDATE, DELETE

---

### 7. `user_achievements`
> Huy hiệu / thành tựu đã mở khóa

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | uuid | NOT NULL | gen_random_uuid() |
| user_id | uuid | NOT NULL | — |
| achievement_id | text | NOT NULL | — |
| achievement_name | text | NOT NULL | — |
| achievement_icon | text | NOT NULL | '🏆' |
| achievement_description | text | YES | — |
| earned_at | timestamptz | NOT NULL | now() |

**RLS Policies:**
- `SELECT` — Users can view their own achievements (`auth.uid() = user_id`)
- `INSERT` — Users can insert their own achievements (`auth.uid() = user_id`)

**🚫 Không cho phép:** UPDATE, DELETE

---

### 8. `daily_activity`
> Hoạt động hàng ngày (XP, thời gian, bài hoàn thành)

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | uuid | NOT NULL | gen_random_uuid() |
| user_id | uuid | NOT NULL | — |
| activity_date | date | NOT NULL | CURRENT_DATE |
| xp_earned | integer | NOT NULL | 0 |
| points_earned | integer | NOT NULL | 0 |
| time_spent_minutes | integer | NOT NULL | 0 |
| lessons_completed | integer | NOT NULL | 0 |
| created_at | timestamptz | NOT NULL | now() |

**RLS Policies:**
- `SELECT` — Users can view their own activity (`auth.uid() = user_id`)
- `SELECT` — Admins can view all daily_activity (`has_role(auth.uid(), 'admin')`)
- `INSERT` — Users can insert their own activity (`auth.uid() = user_id`)
- `UPDATE` — Users can update their own activity (`auth.uid() = user_id`)

**🚫 Không cho phép:** DELETE

---

### 9. `user_streaks`
> Chuỗi ngày học liên tục (streak)

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | uuid | NOT NULL | gen_random_uuid() |
| user_id | uuid | NOT NULL | — |
| current_streak | integer | NOT NULL | 0 |
| longest_streak | integer | NOT NULL | 0 |
| total_learning_days | integer | NOT NULL | 0 |
| last_activity_date | date | YES | — |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

**RLS Policies:**
- `SELECT` — Users can view their own streak (`auth.uid() = user_id`)
- `INSERT` — Users can insert their own streak (`auth.uid() = user_id`)
- `UPDATE` — Users can update their own streak (`auth.uid() = user_id`)

**🚫 Không cho phép:** DELETE

---

### 10. `classes`
> Lớp học do giáo viên tạo và quản lý

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | uuid | NOT NULL | gen_random_uuid() |
| name | text | NOT NULL | — |
| description | text | YES | — |
| grade | text | NOT NULL | — |
| teacher_id | uuid | YES | — |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |

**RLS Policies:**
- `SELECT` — Teachers can view all classes (`EXISTS(... role IN ('teacher','admin'))`)
- `INSERT` — Teachers can create classes (`EXISTS(... role IN ('teacher','admin'))`)
- `UPDATE` — Teachers can update their classes (`teacher_id = auth.uid() OR admin`)
- `DELETE` — Teachers can delete their classes (`teacher_id = auth.uid() OR admin`)

---

### 11. `lessons`
> Đơn vị bài học (chương/unit)

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | text | NOT NULL | — |
| title | text | NOT NULL | — |
| description | text | YES | — |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

**RLS Policies:**
- `SELECT` — Everyone can view lessons (`true`)
- `INSERT` — Admins can insert lessons (`has_role(auth.uid(), 'admin')`)
- `UPDATE` — Admins can update lessons (`has_role(auth.uid(), 'admin')`)
- `DELETE` — Admins can delete lessons (`has_role(auth.uid(), 'admin')`)

---

### 12. `topics`
> Chủ đề video bài giảng (thuộc lesson)

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | text | NOT NULL | — |
| lesson_id | text | NOT NULL | — |
| title | text | NOT NULL | — |
| description | text | YES | — |
| video_url | text | NOT NULL | — |
| semester | integer | NOT NULL | — |
| order_index | integer | NOT NULL | 0 |
| duration_minutes | integer | YES | 15 |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

**Foreign Keys:** `lesson_id` → `lessons.id`

**RLS Policies:**
- `SELECT` — Everyone can view topics (`true`)
- `INSERT` — Admins can insert topics (`has_role(auth.uid(), 'admin')`)
- `UPDATE` — Admins can update topics (`has_role(auth.uid(), 'admin')`)
- `DELETE` — Admins can delete topics (`has_role(auth.uid(), 'admin')`)

---

### 13. `user_lesson_progress`
> Tiến trình xem video bài giảng (thời gian xem, vị trí, hoàn thành)

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | uuid | NOT NULL | gen_random_uuid() |
| user_id | uuid | NOT NULL | — |
| topic_id | text | NOT NULL | — |
| is_completed | boolean | NOT NULL | false |
| watch_time_seconds | integer | NOT NULL | 0 |
| last_position_seconds | integer | NOT NULL | 0 |
| completed_at | timestamptz | YES | — |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

**Foreign Keys:** `topic_id` → `topics.id`

**RLS Policies:**
- `SELECT` — Users can view own progress (`auth.uid() = user_id`)
- `INSERT` — Users can insert own progress (`auth.uid() = user_id`)
- `UPDATE` — Users can update own progress (`auth.uid() = user_id`)

**🚫 Không cho phép:** DELETE

---

### 14. `comments`
> Bình luận của user trên từng topic

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | uuid | NOT NULL | gen_random_uuid() |
| user_id | uuid | NOT NULL | — |
| topic_id | text | NOT NULL | — |
| content | text | NOT NULL | — |
| is_admin_reply | boolean | NOT NULL | false |
| parent_id | uuid | YES | — |
| created_at | timestamptz | NOT NULL | now() |

**Foreign Keys:** `parent_id` → `comments.id`

**RLS Policies:**
- `SELECT` — Anyone authenticated can view comments (`auth.uid() IS NOT NULL`)
- `INSERT` — Users can create comments (`auth.uid() = user_id`)
- `DELETE` — Users can delete their own comments or admin (`auth.uid() = user_id OR admin/teacher`)

**🚫 Không cho phép:** UPDATE

---

### 15. `comment_likes`
> Like trên bình luận

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | uuid | NOT NULL | gen_random_uuid() |
| user_id | uuid | NOT NULL | — |
| comment_id | uuid | NOT NULL | — |
| created_at | timestamptz | NOT NULL | now() |

**Foreign Keys:** `comment_id` → `comments.id`

**RLS Policies:**
- `SELECT` — Users can view all likes (`true`)
- `INSERT` — Users can like comments (`auth.uid() = user_id`)
- `DELETE` — Users can unlike their own likes (`auth.uid() = user_id`)

**🚫 Không cho phép:** UPDATE

---

### 16. `notes`
> Ghi chú cá nhân của user trên từng topic

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | uuid | NOT NULL | gen_random_uuid() |
| user_id | uuid | NOT NULL | — |
| topic_id | text | NOT NULL | — |
| content | text | NOT NULL | '' |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

**RLS Policies:**
- `SELECT` — Users can view their own notes (`auth.uid() = user_id`)
- `INSERT` — Users can insert their own notes (`auth.uid() = user_id`)
- `UPDATE` — Users can update their own notes (`auth.uid() = user_id`)
- `DELETE` — Users can delete their own notes (`auth.uid() = user_id`)

---

### 17. `library_documents`
> Metadata tài liệu thư viện (file lưu trong Storage)

| Cột | Kiểu | Nullable | Default |
|-----|------|----------|---------|
| 🔑 id | uuid | NOT NULL | gen_random_uuid() |
| title | text | NOT NULL | — |
| description | text | YES | — |
| file_name | text | NOT NULL | — |
| file_path | text | NOT NULL | — |
| file_type | text | NOT NULL | — |
| file_size | bigint | NOT NULL | 0 |
| grade | text | NOT NULL | — |
| download_count | integer | NOT NULL | 0 |
| uploaded_by | uuid | NOT NULL | — |
| created_at | timestamptz | NOT NULL | now() |
| updated_at | timestamptz | NOT NULL | now() |

**RLS Policies:**
- `SELECT` — Authenticated users can view documents (`auth.uid() IS NOT NULL`)
- `INSERT` — Teachers can upload documents (`EXISTS(... role IN ('teacher','admin'))`)
- `UPDATE` — Teachers can update own documents (`uploaded_by = auth.uid() OR admin`)
- `DELETE` — Teachers can delete own documents (`uploaded_by = auth.uid() OR admin`)

---

## Functions

| Tên | Tham số | Trả về | Loại | Mô tả |
|-----|---------|--------|------|-------|
| `complete_stage` | p_course_id, p_node_index, p_score, p_stars, p_xp_reward, p_game_specific_data? | json | rpc | Hoàn thành 1 level game: cập nhật course_progress, game_globals, level_history atomically |
| `get_full_game_state` | p_course_id | json | rpc | Lấy toàn bộ state game: course_progress + game_globals + level_history |
| `get_leaderboard` | p_period?, p_grade?, p_limit? | table | rpc | Bảng xếp hạng theo XP, lọc theo kỳ và khối lớp |
| `get_lesson_progress` | p_lesson_id? | table | rpc | Tính % hoàn thành bài học (số topics đã xem / tổng) |
| `mark_topic_completed` | p_topic_id | json | rpc | Đánh dấu topic đã hoàn thành, cập nhật daily_activity |
| `unlock_badge` | p_badge_id, p_badge_name, p_badge_icon, p_badge_description | table | rpc | Mở khóa huy hiệu (idempotent, trả về already_earned nếu đã có) |
| `update_user_streak` | p_user_id | void | rpc | Cập nhật streak học liên tục (gọi khi user hoạt động) |
| `calculate_level_from_xp` | p_xp | integer | utility | Tính level từ XP (utility, dùng bởi complete_stage) |
| `has_role` | _user_id, _role | boolean | utility | Kiểm tra user có role không (SECURITY DEFINER, dùng trong RLS) |
| `handle_new_user` | (trigger) | trigger | trigger | Tự động tạo profile + user_roles khi user đăng ký |
| `ensure_game_globals` | (trigger) | trigger | trigger | Tự động tạo game_globals row khi user đăng ký |

---

## Storage Buckets

| Bucket | Mô tả | Public |
|--------|--------|--------|
| `avatars` | Ảnh đại diện của user | ✅ Yes |
| `library-documents` | File tài liệu thư viện (PDF, DOCX...) | ❌ No |
