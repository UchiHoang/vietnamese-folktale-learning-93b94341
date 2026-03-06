

# Plan: Cleanup Redundant Database Functions

## Analysis

After cross-referencing all 14 database functions with the codebase, I identified the following:

### Functions to DROP (unused or broken)

| Function | Issue |
|----------|-------|
| **`update_current_node`** | References deleted `game_progress` table. Will error if called. Only appears in auto-generated `types.ts`. Never called from app code. |
| **`get_user_progress`** | Returns legacy format with hardcoded `points: 0`, `current_node: 0`. Never called from app code (only in `types.ts`). Replaced by `get_full_game_state`. |
| **`get_public_profile`** | Never called from any app code. |

### Functions to KEEP (actively used or serving infrastructure purpose)

| Function | Usage |
|----------|-------|
| `complete_stage` | Core game RPC, called from `useGameProgress.ts` |
| `get_full_game_state` | Core game RPC, called from `useGameProgress.ts` |
| `get_leaderboard` | Called from `Leaderboard.tsx` |
| `get_lesson_progress` | Called from `useLessonProgress.ts` |
| `mark_topic_completed` | Called from lesson components |
| `unlock_badge` | Called from `useAchievements.ts` |
| `update_user_streak` | Called from `Profile.tsx` and `complete_stage` |
| `calculate_level_from_xp` | Used by `complete_stage` internally (utility) |
| `has_role` | Used in RLS policies across all tables |
| `handle_new_user` | Trigger function for `auth.users` |
| `ensure_game_globals` | Trigger function for `auth.users` |
| `update_updated_at_column` / `handle_updated_at` | Trigger functions for `updated_at` columns |

### Note on trigger functions
`update_updated_at_column` and `handle_updated_at` are duplicate trigger helpers (same logic). We should consolidate to one but need to check which triggers reference which. Safe to keep both for now.

## Implementation

### Step 1: Drop 3 unused functions via SQL migration

```sql
DROP FUNCTION IF EXISTS public.update_current_node(integer, text);
DROP FUNCTION IF EXISTS public.get_user_progress();
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);
```

This single migration removes all 3 broken/unused functions. The `types.ts` file will auto-regenerate to reflect the changes.

### Risk Assessment
- **Zero risk**: All 3 functions have zero references in application code (only in auto-generated types).
- `update_current_node` would actively error if called since `game_progress` table no longer exists.

