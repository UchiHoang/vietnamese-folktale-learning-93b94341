

# Fix: Chi cong them phan chenh lech khi choi lai man game

## Van de hien tai

Trong ham `complete_stage` (PostgreSQL RPC), moi lan hoan thanh mot man game:
- **Luon cong toan bo** `p_xp_reward` vao `game_globals.total_xp`
- **Luon cong toan bo** `p_stars` vao `course_progress.total_stars`
- **Luon cong toan bo** XP vao `course_progress.total_xp`

Dieu nay co nghia: Neu nguoi choi choi lai man cu va dat 30 XP, thi 30 XP do se duoc cong them vao tong XP, du truoc do da dat 50 XP o man do. Nguoi choi co the "farm" XP bang cach choi lai.

## Logic mong muon

1. Luu best score/stars/XP cho **tung node** trong mot course
2. Khi choi lai:
   - Neu diem moi > diem cu: chi cong phan **chenh lech** vao tong
   - Neu diem moi <= diem cu: **khong cong them** gi
3. Ap dung cho ca XP, stars, va score

## Giai phap

### Thay doi 1: Sua ham `complete_stage` (SQL migration)

Them logic kiem tra best score truoc khi cong:

```text
1. Tim best record cho (user_id, course_id, node_index) trong level_history
2. Tinh delta:
   - delta_xp = MAX(0, p_xp_reward - old_best_xp)
   - delta_stars = MAX(0, p_stars - old_best_stars)
   - delta_score = MAX(0, p_score - old_best_score)
3. Chi cong delta vao game_globals va course_progress
4. Van luu day du ket qua vao level_history (de co lich su)
```

Cu the trong SQL:
- Truoc khi update, SELECT best record tu `level_history` WHERE `course_id = p_course_id AND node_index = p_node_index` ORDER BY `score DESC` LIMIT 1
- Tinh `v_delta_xp`, `v_delta_stars`, `v_delta_score`
- Dung delta thay vi gia tri tuyet doi khi update `game_globals` va `course_progress`

### Thay doi 2: Khong can thay doi client code

Logic client (`useGameProgress.ts`, `TrangQuynhMiniGame.tsx`) van gui cung payload nhu cu. Server se tu dong xu ly viec chi cong chenh lech.

### Chi tiet ky thuat - SQL function moi

```text
complete_stage (sua lai):

  -- Lay best record cu
  SELECT MAX(score), MAX(stars), MAX(xp_from_meta)
  FROM level_history
  WHERE user_id = v_user_id
    AND course_id = p_course_id
    AND node_index = p_node_index
    AND passed = true;

  -- Tinh delta
  v_delta_xp := GREATEST(0, p_xp_reward - COALESCE(v_old_best_xp, 0));
  v_delta_stars := GREATEST(0, p_stars - COALESCE(v_old_best_stars, 0));

  -- Update game_globals chi voi delta
  UPDATE game_globals
  SET total_xp = total_xp + v_delta_xp,
      coins = coins + v_delta_stars  -- chi cong them stars moi
  ...

  -- Update course_progress chi voi delta
  total_stars = course_progress.total_stars + v_delta_stars,
  total_xp = course_progress.total_xp + v_delta_xp

  -- Van luu day du vao level_history
  INSERT INTO level_history (...) VALUES (...);

  -- daily_activity cung chi cong delta
  INSERT INTO daily_activity ... xp_earned = v_delta_xp ...
```

### Ket qua mong doi

| Tinh huong | XP cu | XP moi | Delta cong vao tong |
|---|---|---|---|
| Choi lan dau | 0 | 30 | +30 |
| Choi lai, pha ky luc | 30 | 50 | +20 |
| Choi lai, khong pha | 50 | 30 | +0 |
| Choi lai, bang diem | 50 | 50 | +0 |

### File thay doi
- **SQL migration**: Sua ham `complete_stage` de them logic delta
- Khong can thay doi file TypeScript nao
