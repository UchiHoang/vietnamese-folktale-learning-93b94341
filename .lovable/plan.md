

# Plan: Don dep va toi uu backend Leaderboard

## Phan tich hien trang

Sau khi kiem tra ky, day la ban do du lieu hien tai lien quan den leaderboard:

```text
Bang hien tai lien quan:
+------------------+     +------------------+     +------------------+
|   leaderboard    |     |  game_globals    |     |  game_progress   |
+------------------+     +------------------+     +------------------+
| user_id          |     | user_id          |     | user_id          |
| display_name  *  |     | total_xp   (SoT) |     | total_points  *  |
| avatar        *  |     | global_level     |     | total_xp      *  |
| school        *  |     | coins            |     | grade          * |
| grade         *  |     |                  |     | level          * |
| normalized_grade*|     |                  |     | current_node   * |
| points        *  |     |                  |     | completed_nodes* |
| rank (NULL!)     |     |                  |     | earned_badges  * |
+------------------+     +------------------+     | streak         * |
        |                                         | points         * |
        |  * = du thua / stale                    +------------------+
        v
  +------------------+     +------------------+
  |    profiles      |     | course_progress  |
  +------------------+     +------------------+
  | display_name (GoT)|    | course_id        |
  | avatar       (GoT)|    | total_xp   (SoT) |
  | school       (GoT)|    | total_stars      |
  | grade        (GoT)|    | current_node     |
  +------------------+     +------------------+
  
  SoT = Source of Truth (nguon du lieu chinh xac)
  GoT = Ground of Truth (du lieu goc)
```

### Van de chinh:

1. **Bang `leaderboard`**: Sao chep `display_name`, `avatar`, `school`, `grade` tu `profiles` -- hoan toan du thua. Cot `rank` luon NULL. Cot `points` bi stale (khong khop `game_globals.total_xp`).

2. **Bang `game_progress`**: La he thong **cu**. He thong moi dung `course_progress` + `game_globals`. Nhung `game_progress` van duoc frontend Leaderboard query de filter theo grade, va `useSupabaseProgress.ts` van ghi vao no.

3. **Frontend query 2-3 bang thay vi dung 1 RPC** -- phuc tap va khong chinh xac.

4. **Bo loc thoi gian** (tuan/thang/nam) hoan toan khong hoat dong.

---

## Giai phap

### Buoc 1: Tao RPC moi `get_leaderboard_v2` (Database Migration)

Tao 1 RPC duy nhat xu ly moi truong hop:

```text
get_leaderboard_v2(p_grade TEXT, p_period TEXT, p_limit INT)

Neu p_grade IS NULL ("Tat ca"):
  -> Xep hang theo game_globals.total_xp
  -> JOIN profiles de lay display_name, avatar, school

Neu p_grade = 'preschool' / 'grade1' / ... :
  -> Xep hang theo SUM(level_history.score)
     WHERE course_id LIKE 'grade1%'
     AND created_at >= start_of_period
  -> JOIN profiles de lay thong tin hien thi

p_period:
  'week'  -> date_trunc('week', NOW())
  'month' -> date_trunc('month', NOW())  
  'year'  -> date_trunc('year', NOW())
  'all'   -> '1970-01-01' (tat ca thoi gian)
```

### Buoc 2: Xoa cac cot du thua trong bang `leaderboard` (Database Migration)

Xoa cac cot sau khoi bang `leaderboard` vi chung sao chep du lieu tu `profiles`:
- `display_name` (da co trong `profiles`)
- `avatar` (da co trong `profiles`)  
- `school` (da co trong `profiles`)
- `grade` (da co trong `profiles`)
- `normalized_grade` (du thua)
- `rank` (luon NULL, vo nghia)

Chi giu lai:
- `id`, `user_id`, `points` (se dong bo = `game_globals.total_xp`), `created_at`, `updated_at`

### Buoc 3: Xoa cac trigger du thua

- Xoa trigger `sync_profile_to_leaderboard` (khong can sao chep profile data nua)
- Xoa trigger `create_leaderboard_on_profile` (khong can tao leaderboard entry rieng nua)
- Xoa trigger `update_leaderboard_points` trên `game_progress` (he thong cu)
- Xoa cac function tuong ung: `sync_profile_to_leaderboard()`, `create_leaderboard_entry()`, `sync_game_points_to_leaderboard()`

### Buoc 4: Dong bo `leaderboard.points` = `game_globals.total_xp`

Chay SQL de cap nhat tat ca row hien co cho khop voi du lieu chinh xac.

### Buoc 5: Tao trigger moi tren `game_globals`

Khi `game_globals.total_xp` thay doi -> tu dong cap nhat `leaderboard.points`.

### Buoc 6: Cap nhat Frontend `Leaderboard.tsx`

Thay the toan bo logic query phuc tap bang 1 lenh RPC duy nhat:

```text
Truoc (phuc tap, sai):
  - "Tat ca": query game_globals + query leaderboard (display info)
  - Grade filter: query leaderboard (all users) + query game_progress (grade points)
  - Time filter: BO QUA

Sau (don gian, chinh xac):
  const { data } = await supabase.rpc('get_leaderboard_v2', {
    p_grade: selectedGrade === 'tat-ca' ? null : gradeMap[selectedGrade],
    p_period: periodMap[selectedPeriod],
    p_limit: 10
  });
```

### Buoc 7: (Tuy chon) Don dep bang `game_progress`

Bang `game_progress` van duoc `useSupabaseProgress.ts` su dung. Can chuyen cac tham chieu sang `course_progress` + `game_globals` truoc khi xoa. Day la thay doi lon hon, co the thuc hien sau.

---

## Files can sua

| File | Thay doi |
|------|---------|
| Database Migration (SQL) | Tao `get_leaderboard_v2` RPC, xoa cot du thua, xoa trigger cu, tao trigger moi, dong bo data |
| `src/components/Leaderboard.tsx` | Thay the query logic bang 1 RPC call, fix filter thoi gian, fix label "Tat Ca" |

## Ket qua mong doi

- Leaderboard hien thi dung diem so tu `game_globals.total_xp`
- Filter theo grade hoat dong dung (dua tren `level_history`)
- Filter theo thoi gian hoat dong (tuan/thang/nam)
- Giam 5 cot du thua trong bang `leaderboard`
- Xoa 3 trigger/function khong can thiet
- Frontend code gon hon (1 RPC thay vi 2-3 query)

