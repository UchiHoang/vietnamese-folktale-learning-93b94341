

# Thay doi logic het gio: Luu ket qua hien tai thay vi that bai

## Hien tai
Khi het gio, game chi hien thong bao "Het gio!" va dat ket qua = 0 sao, 0 XP, hien modal "retry". Khong luu bat ky tien do nao.

## Thay doi
Khi het gio, game se **tu dong tinh diem dua tren so cau da tra loi dung** va luu ket qua nhu khi hoan thanh binh thuong. Nguoi choi van duoc tinh sao, XP, va badge dua tren ket qua hien co.

## Chi tiet ky thuat

### File: `src/components/game/TrangQuynhMiniGame.tsx`

**Sua `handleTimeUp`** (dong ~417-423):
- Thay vi dat 0 sao va "retry", goi logic tuong tu nhu khi tra loi cau cuoi cung:
  1. Lay `correctThisLevel`, `incorrectThisLevel`, `totalQuestions` hien tai
  2. Tinh accuracy, stars, XP dua tren so cau da tra loi dung
  3. Goi `completeStageMutation.mutateAsync(...)` de luu ket qua len server
  4. Hien BadgeModal voi ket qua tuong ung (co the "excellent", "good", hoac "retry" tuy so cau dung)

- Thong bao se doi tu "Het gio! Hay thu lai!" thanh "Het gio! Ket qua cua ban da duoc luu."

- Can chuyen `handleTimeUp` tu `useCallback` don gian sang mot async function co quyen truy cap cac state hien tai (`correctThisLevel`, `incorrectThisLevel`, `currentActivity`, v.v.)

Logic cu the:
```text
handleTimeUp:
  1. totalQuestions = currentActivity.questions.length
  2. accuracy = (correctThisLevel / totalQuestions) * 100
  3. Tinh stars theo threshold (>=90 -> 3, >=70 -> 2, >=40 -> 1, else 0)
  4. Tinh XP = correctThisLevel * xpReward
  5. Goi completeStageMutation (giong handleAnswer khi isLastQuestion)
  6. Dat performance, starsThisLevel, earnedXpThisLevel
  7. Hien BadgeModal
```

Luu y: Can dung `useCallback` voi dung dependencies hoac dung ref de dam bao `handleTimeUp` luon doc duoc state moi nhat (correctThisLevel, incorrectThisLevel) tai thoi diem het gio.

