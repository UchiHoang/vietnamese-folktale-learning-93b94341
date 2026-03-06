// Database Schema Documentation - Last updated: 2026-03-06
// This file contains static metadata extracted from the Supabase schema.

export interface ColumnDef {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  isPrimaryKey?: boolean;
}

export interface RLSPolicy {
  name: string;
  command: "SELECT" | "INSERT" | "UPDATE" | "DELETE";
  using?: string;
  withCheck?: string;
}

export interface ForeignKey {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

export interface TableDef {
  name: string;
  description: string;
  columns: ColumnDef[];
  rlsPolicies: RLSPolicy[];
  foreignKeys: ForeignKey[];
  disabledActions: string[];
}

export interface FunctionDef {
  name: string;
  args: string;
  returns: string;
  description: string;
  type: "rpc" | "trigger" | "utility";
}

export interface StorageBucket {
  name: string;
  description: string;
  isPublic: boolean;
}

export const DB_TABLES: TableDef[] = [
  {
    name: "profiles",
    description: "Thông tin mở rộng của user (tên, avatar, trường, lớp, địa chỉ...)",
    columns: [
      { name: "id", type: "uuid", nullable: false, default: null, isPrimaryKey: true },
      { name: "display_name", type: "text", nullable: false, default: null },
      { name: "avatar", type: "text", nullable: true, default: "'👤'" },
      { name: "email", type: "text", nullable: true, default: null },
      { name: "phone", type: "text", nullable: true, default: null },
      { name: "birth_date", type: "date", nullable: true, default: null },
      { name: "gender", type: "text", nullable: true, default: null },
      { name: "grade", type: "text", nullable: true, default: null },
      { name: "school", type: "text", nullable: true, default: null },
      { name: "class_id", type: "uuid", nullable: true, default: null },
      { name: "class_name", type: "text", nullable: true, default: null },
      { name: "province", type: "text", nullable: true, default: null },
      { name: "district", type: "text", nullable: true, default: null },
      { name: "ward", type: "text", nullable: true, default: null },
      { name: "address", type: "text", nullable: true, default: null },
      { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
      { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "Public profiles are viewable by everyone", command: "SELECT", using: "true" },
      { name: "Admins can view all profiles", command: "SELECT", using: "has_role(auth.uid(), 'admin')" },
      { name: "Users can view own profile", command: "SELECT", using: "auth.uid() = id" },
      { name: "Users can view their own profile", command: "SELECT", using: "auth.uid() = id" },
      { name: "profiles read leaderboard", command: "SELECT", using: "true" },
      { name: "Users can insert own profile", command: "INSERT", withCheck: "auth.uid() = id" },
      { name: "Users can insert their own profile", command: "INSERT", withCheck: "auth.uid() = id" },
      { name: "Users can update own profile", command: "UPDATE", using: "auth.uid() = id", withCheck: "auth.uid() = id" },
      { name: "Users can update their own profile", command: "UPDATE", using: "auth.uid() = id" },
    ],
    foreignKeys: [
      { column: "class_id", referencedTable: "classes", referencedColumn: "id" },
    ],
    disabledActions: ["DELETE"],
  },
  {
    name: "user_roles",
    description: "Phân quyền RBAC (student / teacher / admin)",
    columns: [
      { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimaryKey: true },
      { name: "user_id", type: "uuid", nullable: false, default: null },
      { name: "role", type: "app_role", nullable: false, default: "'student'" },
    ],
    rlsPolicies: [
      { name: "Users can view their own role", command: "SELECT", using: "auth.uid() = user_id" },
      { name: "Admins can view all roles", command: "SELECT", using: "has_role(auth.uid(), 'admin')" },
    ],
    foreignKeys: [],
    disabledActions: ["INSERT", "UPDATE", "DELETE"],
  },
  {
    name: "parental_settings",
    description: "Cài đặt giới hạn thời gian học của phụ huynh",
    columns: [
      { name: "user_id", type: "uuid", nullable: false, default: null, isPrimaryKey: true },
      { name: "limit_enabled", type: "boolean", nullable: false, default: "false" },
      { name: "daily_limit_minutes", type: "integer", nullable: true, default: null },
      { name: "extra_time_used", type: "boolean", nullable: false, default: "false" },
      { name: "last_reset_date", type: "date", nullable: false, default: "CURRENT_DATE" },
      { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
      { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "Users can view own parental_settings", command: "SELECT", using: "auth.uid() = user_id" },
      { name: "Users can insert own parental_settings", command: "INSERT", withCheck: "auth.uid() = user_id" },
      { name: "Users can update own parental_settings", command: "UPDATE", using: "auth.uid() = user_id" },
    ],
    foreignKeys: [],
    disabledActions: ["DELETE"],
  },
  {
    name: "game_globals",
    description: "Trạng thái game tổng (XP, level, coins, badges) của user",
    columns: [
      { name: "user_id", type: "uuid", nullable: false, default: null, isPrimaryKey: true },
      { name: "total_xp", type: "bigint", nullable: false, default: "0" },
      { name: "global_level", type: "integer", nullable: false, default: "1" },
      { name: "coins", type: "bigint", nullable: false, default: "0" },
      { name: "avatar_config", type: "jsonb", nullable: false, default: "'{}'" },
      { name: "unlocked_badges", type: "jsonb", nullable: false, default: "'[]'" },
      { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
      { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "gg_select_own", command: "SELECT", using: "auth.uid() = user_id" },
      { name: "Admins can view all game_globals", command: "SELECT", using: "has_role(auth.uid(), 'admin')" },
      { name: "gg_update_own", command: "UPDATE", using: "auth.uid() = user_id" },
    ],
    foreignKeys: [],
    disabledActions: ["INSERT", "DELETE"],
  },
  {
    name: "course_progress",
    description: "Tiến trình từng khóa game (node hiện tại, XP, sao, nodes đã hoàn thành)",
    columns: [
      { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimaryKey: true },
      { name: "user_id", type: "uuid", nullable: false, default: null },
      { name: "course_id", type: "text", nullable: false, default: null },
      { name: "current_node", type: "integer", nullable: false, default: "0" },
      { name: "total_xp", type: "integer", nullable: false, default: "0" },
      { name: "total_stars", type: "integer", nullable: false, default: "0" },
      { name: "completed_nodes", type: "jsonb", nullable: false, default: "'[]'" },
      { name: "extra_data", type: "jsonb", nullable: false, default: "'{}'" },
      { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
      { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "cp_select_own", command: "SELECT", using: "auth.uid() = user_id" },
      { name: "Admins can view all course_progress", command: "SELECT", using: "has_role(auth.uid(), 'admin')" },
      { name: "cp_insert_own", command: "INSERT", withCheck: "auth.uid() = user_id" },
      { name: "cp_update_own", command: "UPDATE", using: "auth.uid() = user_id" },
    ],
    foreignKeys: [],
    disabledActions: ["DELETE"],
  },
  {
    name: "level_history",
    description: "Lịch sử chơi từng level (điểm, sao, thời gian, pass/fail)",
    columns: [
      { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimaryKey: true },
      { name: "user_id", type: "uuid", nullable: false, default: null },
      { name: "course_id", type: "text", nullable: false, default: null },
      { name: "node_index", type: "integer", nullable: false, default: null },
      { name: "score", type: "numeric", nullable: false, default: "0" },
      { name: "stars", type: "integer", nullable: false, default: "0" },
      { name: "passed", type: "boolean", nullable: false, default: "true" },
      { name: "duration_seconds", type: "integer", nullable: false, default: "0" },
      { name: "meta", type: "jsonb", nullable: false, default: "'{}'" },
      { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "lh_select_own", command: "SELECT", using: "auth.uid() = user_id" },
      { name: "leaderboard_read_level_history", command: "SELECT", using: "true" },
      { name: "lh_insert_own", command: "INSERT", withCheck: "auth.uid() = user_id" },
    ],
    foreignKeys: [],
    disabledActions: ["UPDATE", "DELETE"],
  },
  {
    name: "user_achievements",
    description: "Huy hiệu / thành tựu đã mở khóa",
    columns: [
      { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimaryKey: true },
      { name: "user_id", type: "uuid", nullable: false, default: null },
      { name: "achievement_id", type: "text", nullable: false, default: null },
      { name: "achievement_name", type: "text", nullable: false, default: null },
      { name: "achievement_icon", type: "text", nullable: false, default: "'🏆'" },
      { name: "achievement_description", type: "text", nullable: true, default: null },
      { name: "earned_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "Users can view their own achievements", command: "SELECT", using: "auth.uid() = user_id" },
      { name: "Users can insert their own achievements", command: "INSERT", withCheck: "auth.uid() = user_id" },
    ],
    foreignKeys: [],
    disabledActions: ["UPDATE", "DELETE"],
  },
  {
    name: "daily_activity",
    description: "Hoạt động hàng ngày (XP, thời gian, bài hoàn thành)",
    columns: [
      { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimaryKey: true },
      { name: "user_id", type: "uuid", nullable: false, default: null },
      { name: "activity_date", type: "date", nullable: false, default: "CURRENT_DATE" },
      { name: "xp_earned", type: "integer", nullable: false, default: "0" },
      { name: "points_earned", type: "integer", nullable: false, default: "0" },
      { name: "time_spent_minutes", type: "integer", nullable: false, default: "0" },
      { name: "lessons_completed", type: "integer", nullable: false, default: "0" },
      { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "Users can view their own activity", command: "SELECT", using: "auth.uid() = user_id" },
      { name: "Admins can view all daily_activity", command: "SELECT", using: "has_role(auth.uid(), 'admin')" },
      { name: "Users can insert their own activity", command: "INSERT", withCheck: "auth.uid() = user_id" },
      { name: "Users can update their own activity", command: "UPDATE", using: "auth.uid() = user_id" },
    ],
    foreignKeys: [],
    disabledActions: ["DELETE"],
  },
  {
    name: "user_streaks",
    description: "Chuỗi ngày học liên tục (streak)",
    columns: [
      { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimaryKey: true },
      { name: "user_id", type: "uuid", nullable: false, default: null },
      { name: "current_streak", type: "integer", nullable: false, default: "0" },
      { name: "longest_streak", type: "integer", nullable: false, default: "0" },
      { name: "total_learning_days", type: "integer", nullable: false, default: "0" },
      { name: "last_activity_date", type: "date", nullable: true, default: null },
      { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
      { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "Users can view their own streak", command: "SELECT", using: "auth.uid() = user_id" },
      { name: "Users can insert their own streak", command: "INSERT", withCheck: "auth.uid() = user_id" },
      { name: "Users can update their own streak", command: "UPDATE", using: "auth.uid() = user_id" },
    ],
    foreignKeys: [],
    disabledActions: ["DELETE"],
  },
  {
    name: "classes",
    description: "Lớp học do giáo viên tạo và quản lý",
    columns: [
      { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimaryKey: true },
      { name: "name", type: "text", nullable: false, default: null },
      { name: "description", type: "text", nullable: true, default: null },
      { name: "grade", type: "text", nullable: false, default: null },
      { name: "teacher_id", type: "uuid", nullable: true, default: null },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
      { name: "updated_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
    rlsPolicies: [
      { name: "Teachers can view all classes", command: "SELECT", using: "EXISTS(... role IN ('teacher','admin'))" },
      { name: "Teachers can create classes", command: "INSERT", withCheck: "EXISTS(... role IN ('teacher','admin'))" },
      { name: "Teachers can update their classes", command: "UPDATE", using: "teacher_id = auth.uid() OR admin" },
      { name: "Teachers can delete their classes", command: "DELETE", using: "teacher_id = auth.uid() OR admin" },
    ],
    foreignKeys: [],
    disabledActions: [],
  },
  {
    name: "lessons",
    description: "Đơn vị bài học (chương/unit)",
    columns: [
      { name: "id", type: "text", nullable: false, default: null, isPrimaryKey: true },
      { name: "title", type: "text", nullable: false, default: null },
      { name: "description", type: "text", nullable: true, default: null },
      { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
      { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "Everyone can view lessons", command: "SELECT", using: "true" },
      { name: "Admins can insert lessons", command: "INSERT", withCheck: "has_role(auth.uid(), 'admin')" },
      { name: "Admins can update lessons", command: "UPDATE", using: "has_role(auth.uid(), 'admin')" },
      { name: "Admins can delete lessons", command: "DELETE", using: "has_role(auth.uid(), 'admin')" },
    ],
    foreignKeys: [],
    disabledActions: [],
  },
  {
    name: "topics",
    description: "Chủ đề video bài giảng (thuộc lesson)",
    columns: [
      { name: "id", type: "text", nullable: false, default: null, isPrimaryKey: true },
      { name: "lesson_id", type: "text", nullable: false, default: null },
      { name: "title", type: "text", nullable: false, default: null },
      { name: "description", type: "text", nullable: true, default: null },
      { name: "video_url", type: "text", nullable: false, default: null },
      { name: "semester", type: "integer", nullable: false, default: null },
      { name: "order_index", type: "integer", nullable: false, default: "0" },
      { name: "duration_minutes", type: "integer", nullable: true, default: "15" },
      { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
      { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "Everyone can view topics", command: "SELECT", using: "true" },
      { name: "Admins can insert topics", command: "INSERT", withCheck: "has_role(auth.uid(), 'admin')" },
      { name: "Admins can update topics", command: "UPDATE", using: "has_role(auth.uid(), 'admin')" },
      { name: "Admins can delete topics", command: "DELETE", using: "has_role(auth.uid(), 'admin')" },
    ],
    foreignKeys: [
      { column: "lesson_id", referencedTable: "lessons", referencedColumn: "id" },
    ],
    disabledActions: [],
  },
  {
    name: "user_lesson_progress",
    description: "Tiến trình xem video bài giảng (thời gian xem, vị trí, hoàn thành)",
    columns: [
      { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimaryKey: true },
      { name: "user_id", type: "uuid", nullable: false, default: null },
      { name: "topic_id", type: "text", nullable: false, default: null },
      { name: "is_completed", type: "boolean", nullable: false, default: "false" },
      { name: "watch_time_seconds", type: "integer", nullable: false, default: "0" },
      { name: "last_position_seconds", type: "integer", nullable: false, default: "0" },
      { name: "completed_at", type: "timestamptz", nullable: true, default: null },
      { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
      { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "Users can view own progress", command: "SELECT", using: "auth.uid() = user_id" },
      { name: "Users can insert own progress", command: "INSERT", withCheck: "auth.uid() = user_id" },
      { name: "Users can update own progress", command: "UPDATE", using: "auth.uid() = user_id" },
    ],
    foreignKeys: [
      { column: "topic_id", referencedTable: "topics", referencedColumn: "id" },
    ],
    disabledActions: ["DELETE"],
  },
  {
    name: "comments",
    description: "Bình luận của user trên từng topic",
    columns: [
      { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimaryKey: true },
      { name: "user_id", type: "uuid", nullable: false, default: null },
      { name: "topic_id", type: "text", nullable: false, default: null },
      { name: "content", type: "text", nullable: false, default: null },
      { name: "is_admin_reply", type: "boolean", nullable: false, default: "false" },
      { name: "parent_id", type: "uuid", nullable: true, default: null },
      { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "Anyone authenticated can view comments", command: "SELECT", using: "auth.uid() IS NOT NULL" },
      { name: "Users can create comments", command: "INSERT", withCheck: "auth.uid() = user_id" },
      { name: "Users can insert their own comments", command: "INSERT", withCheck: "auth.uid() = user_id" },
      { name: "Users can delete their own comments or admin", command: "DELETE", using: "auth.uid() = user_id OR admin/teacher" },
    ],
    foreignKeys: [
      { column: "parent_id", referencedTable: "comments", referencedColumn: "id" },
    ],
    disabledActions: ["UPDATE"],
  },
  {
    name: "comment_likes",
    description: "Like trên bình luận",
    columns: [
      { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimaryKey: true },
      { name: "user_id", type: "uuid", nullable: false, default: null },
      { name: "comment_id", type: "uuid", nullable: false, default: null },
      { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "Users can view all likes", command: "SELECT", using: "true" },
      { name: "Users can like comments", command: "INSERT", withCheck: "auth.uid() = user_id" },
      { name: "Users can unlike their own likes", command: "DELETE", using: "auth.uid() = user_id" },
    ],
    foreignKeys: [
      { column: "comment_id", referencedTable: "comments", referencedColumn: "id" },
    ],
    disabledActions: ["UPDATE"],
  },
  {
    name: "notes",
    description: "Ghi chú cá nhân của user trên từng topic",
    columns: [
      { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimaryKey: true },
      { name: "user_id", type: "uuid", nullable: false, default: null },
      { name: "topic_id", type: "text", nullable: false, default: null },
      { name: "content", type: "text", nullable: false, default: "''" },
      { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
      { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "Users can view their own notes", command: "SELECT", using: "auth.uid() = user_id" },
      { name: "Users can insert their own notes", command: "INSERT", withCheck: "auth.uid() = user_id" },
      { name: "Users can update their own notes", command: "UPDATE", using: "auth.uid() = user_id" },
      { name: "Users can delete their own notes", command: "DELETE", using: "auth.uid() = user_id" },
    ],
    foreignKeys: [],
    disabledActions: [],
  },
  {
    name: "library_documents",
    description: "Metadata tài liệu thư viện (file lưu trong Storage)",
    columns: [
      { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", isPrimaryKey: true },
      { name: "title", type: "text", nullable: false, default: null },
      { name: "description", type: "text", nullable: true, default: null },
      { name: "file_name", type: "text", nullable: false, default: null },
      { name: "file_path", type: "text", nullable: false, default: null },
      { name: "file_type", type: "text", nullable: false, default: null },
      { name: "file_size", type: "bigint", nullable: false, default: "0" },
      { name: "grade", type: "text", nullable: false, default: null },
      { name: "download_count", type: "integer", nullable: false, default: "0" },
      { name: "uploaded_by", type: "uuid", nullable: false, default: null },
      { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
      { name: "updated_at", type: "timestamptz", nullable: false, default: "now()" },
    ],
    rlsPolicies: [
      { name: "Authenticated users can view documents", command: "SELECT", using: "auth.uid() IS NOT NULL" },
      { name: "Teachers can upload documents", command: "INSERT", withCheck: "EXISTS(... role IN ('teacher','admin'))" },
      { name: "Teachers can update own documents", command: "UPDATE", using: "uploaded_by = auth.uid() OR admin" },
      { name: "Teachers can delete own documents", command: "DELETE", using: "uploaded_by = auth.uid() OR admin" },
    ],
    foreignKeys: [],
    disabledActions: [],
  },
];

export const DB_FUNCTIONS: FunctionDef[] = [
  { name: "complete_stage", args: "p_course_id, p_node_index, p_score, p_stars, p_xp_reward, p_game_specific_data?", returns: "json", description: "Hoàn thành 1 level game: cập nhật course_progress, game_globals, level_history atomically", type: "rpc" },
  { name: "get_full_game_state", args: "p_course_id", returns: "json", description: "Lấy toàn bộ state game: course_progress + game_globals + level_history", type: "rpc" },
  { name: "get_leaderboard", args: "p_period?, p_grade?, p_limit?", returns: "table", description: "Bảng xếp hạng theo XP, lọc theo kỳ và khối lớp", type: "rpc" },
  { name: "get_lesson_progress", args: "p_lesson_id?", returns: "table", description: "Tính % hoàn thành bài học (số topics đã xem / tổng)", type: "rpc" },
  { name: "mark_topic_completed", args: "p_topic_id", returns: "json", description: "Đánh dấu topic đã hoàn thành, cập nhật daily_activity", type: "rpc" },
  { name: "unlock_badge", args: "p_badge_id, p_badge_name, p_badge_icon, p_badge_description", returns: "table", description: "Mở khóa huy hiệu (idempotent, trả về already_earned nếu đã có)", type: "rpc" },
  { name: "update_user_streak", args: "p_user_id", returns: "void", description: "Cập nhật streak học liên tục (gọi khi user hoạt động)", type: "rpc" },
  { name: "calculate_level_from_xp", args: "p_xp", returns: "integer", description: "Tính level từ XP (utility, dùng bởi complete_stage)", type: "utility" },
  { name: "has_role", args: "_user_id, _role", returns: "boolean", description: "Kiểm tra user có role không (SECURITY DEFINER, dùng trong RLS)", type: "utility" },
  { name: "handle_new_user", args: "(trigger)", returns: "trigger", description: "Tự động tạo profile + user_roles khi user đăng ký", type: "trigger" },
  { name: "ensure_game_globals", args: "(trigger)", returns: "trigger", description: "Tự động tạo game_globals row khi user đăng ký", type: "trigger" },
];

export const DB_STORAGE: StorageBucket[] = [
  { name: "avatars", description: "Ảnh đại diện của user", isPublic: true },
  { name: "library-documents", description: "File tài liệu thư viện (PDF, DOCX...)", isPublic: false },
];

export const DB_ENUM = {
  app_role: ["student", "teacher", "admin"],
};
