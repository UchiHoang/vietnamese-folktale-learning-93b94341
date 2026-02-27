
# Fix Star Calculation Logic + Add Failure Sound Effects

## Problems Found

### 1. Star Calculation Too Harsh
Current formula: `Math.floor((correct / total) * 3)`
- Requires **100% accuracy** for 3 stars (practically impossible for kids)
- 66% accuracy = only 1 star
- This misaligns with the performance thresholds (excellent >= 90%, good >= 60%)

**Fix**: Use threshold-based star calculation aligned with performance:
- >= 90% accuracy = 3 stars (excellent)
- >= 70% accuracy = 2 stars (good)
- >= 40% accuracy = 1 star (encouraging)
- < 40% accuracy = 0 stars (retry)

### 2. Stars Not Reset on Time Up
`handleTimeUp()` sets `performance = "retry"` but does NOT reset `starsThisLevel` to 0. This means the BadgeModal shows leftover stars from a previous attempt -- causing the mismatch visible in the screenshot (2 stars + "retry" message).

**Fix**: Add `setStarsThisLevel(0)` and `setEarnedXpThisLevel(0)` in `handleTimeUp`.

### 3. Performance Thresholds Misaligned with Stars
Current: performance uses 90%/60% thresholds but stars use a different formula. After fixing stars, align performance to match:
- 3 stars = "excellent"
- 2 stars = "good"  
- 0-1 stars = "retry"

### 4. No Failure Sound Effect
Currently there is no sad/failure sound when:
- Time runs out
- Player gets 0 stars
- Player performs poorly

**Fix**: Add a failure/sad sound effect that plays when `performance === "retry"` or when time is up.

## Files to Change

### `src/components/game/TrangQuynhMiniGame.tsx`
- Fix star calculation formula (line ~493): replace `Math.floor((newCorrect / totalQuestions) * 3)` with threshold-based logic
- Align performance determination to use star count instead of separate accuracy thresholds
- Fix `handleTimeUp`: add `setStarsThisLevel(0)` and `setEarnedXpThisLevel(0)`
- Play failure sound in `handleTimeUp`

### `src/components/game/BadgeModal.tsx`
- Add failure sound effect that plays when `performance === "retry"` on modal open
- Use Web Audio API or a free sound URL for a gentle "aww" or "try again" tone (kid-friendly, not scary)

## Technical Details

Star calculation replacement:
```typescript
// Old
const stars = Math.floor((newCorrect / totalQuestions) * 3);

// New
const accuracy = (newCorrect / totalQuestions) * 100;
let stars: number;
if (accuracy >= 90) stars = 3;
else if (accuracy >= 70) stars = 2;
else if (accuracy >= 40) stars = 1;
else stars = 0;
```

Performance aligned with stars:
```typescript
let performance: "excellent" | "good" | "retry";
if (stars >= 3) performance = "excellent";
else if (stars >= 2) performance = "good";
else performance = "retry";
```

handleTimeUp fix:
```typescript
const handleTimeUp = useCallback(() => {
  toast.error("Het gio!");
  setStarsThisLevel(0);
  setEarnedXpThisLevel(0);
  setLevelPerformance("retry");
  setShowBadgeModal(true);
  // Play failure sound
}, []);
```

Failure sound in BadgeModal: Play a gentle "womp womp" or descending tone via Web Audio API when `performance === "retry"` and `isOpen` becomes true.
