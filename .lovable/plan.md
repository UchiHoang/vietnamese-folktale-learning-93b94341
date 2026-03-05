

# Plan: Cleanup Redundant Supabase Tables

## Analysis Summary

After reviewing all 18 tables and cross-referencing with the codebase, I identified **4 tables** that are redundant or unused:

### Tables to Remove

| Table | Reason | Current Usage |
|-------|--------|---------------|
| **`contacts`** | Contact form uses edge function `send-contact-email` directly via Resend API. This table is never read or written to from any code. | Zero references in app code or edge functions |
| **`stage_history`** | Legacy table superseded by `level_history`. The `complete_stage` RPC writes to `level_history`, not `stage_history`. Only read in `ReportsTab.tsx` and `AnalyticsTab.tsx` (can be migrated to `level_history`). | Read-only in 2 files, never written to |
| **`user_best_scores`** | Legacy table. Never written to from app code. Only read in `useSupabaseProgress.ts` which itself is never imported anywhere. | Dead code path |
| **`game_progress`** | Legacy table superseded by `course_progress` + `game_globals`. Still referenced in `useSupabaseProgress.ts` (unused hook), `Profile.tsx`, `StudentsTab.tsx`, and `handle_new_user()` trigger. | Partially used but redundant |

### Tables to Keep (confirmed active)

`classes`, `comment_likes`, `comments`, `course_progress`, `daily_activity`, `game_globals`, `lessons`, `level_history`, `library_documents`, `notes`, `parental_settings`, `profiles`, `topics`, `user_achievements`, `user_lesson_progress`, `user_roles`, `user_streaks`

---

## Implementation Steps

### 1. Migrate code references away from legacy tables

**`Profile.tsx`** and **`StudentsTab.tsx`**: Replace `game_progress` reads with `game_globals` (which already has `total_xp`, `global_level`).

**`ReportsTab.tsx`** and **`AnalyticsTab.tsx`**: Replace `stage_history` reads with `level_history` queries (same data structure, already the primary source of truth).

### 2. Delete unused hook file

Remove `src/hooks/useSupabaseProgress.ts` entirely -- it's never imported and contains all references to `game_progress`, `stage_history`, and `user_best_scores`.

### 3. Update `handle_new_user()` trigger

Remove the `INSERT INTO public.game_progress` line from the trigger function, since new users get `game_globals` + `course_progress` rows created on first game interaction.

### 4. Drop tables via migration

```sql
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.stage_history CASCADE;
DROP TABLE IF EXISTS public.user_best_scores CASCADE;
DROP TABLE IF EXISTS public.game_progress CASCADE;
```

### 5. Update `handle_new_user()` function

```sql
-- Remove game_progress insert from the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() ...
  -- Remove: INSERT INTO public.game_progress (user_id) VALUES (new.id);
```

---

## Risk Assessment

- **`contacts`**: Zero risk. Completely unused.
- **`stage_history`**: Low risk. Data can be reconstructed from `level_history`. The 2 read-only references will be updated to use `level_history`.
- **`user_best_scores`**: Zero risk. Never written to, only accessed from dead code.
- **`game_progress`**: Low risk. All active game logic uses `course_progress` + `game_globals`. The 2 remaining reads in Profile/Admin will be updated.

