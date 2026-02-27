

# Theo doi thoi gian online thuc te cho kiem soat thoi gian hoc

## Van de hien tai

Hien tai, `time_spent_minutes` trong `daily_activity` chi duoc cap nhat khi be **hoan thanh 1 man choi** (qua ham `complete_stage`). Nghia la neu be mo trang web 2 tieng nhung khong hoan thanh man nao, thoi gian ghi nhan la 0 phut. Dieu nay khong phan anh dung thuc te.

## Giai phap

Them **online time tracker** chay tren client, moi phut se tu dong cong 1 phut vao `daily_activity.time_spent_minutes` khi be dang o trang game/lesson. Ket hop ca thoi gian online va thoi gian choi game.

## Thiet ke ky thuat

### 1. Tao hook `useOnlineTimeTracker` (src/hooks/useOnlineTimeTracker.ts)

Hook nay se:
- Chay khi user dang o trang game/lesson (cac path `/classroom/` va `/lessons`)
- Moi 60 giay, goi upsert vao `daily_activity` de cong them 1 phut
- Tu dong dung khi user chuyen sang tab khac (document.hidden) hoac roi khoi trang game
- Su dung `visibilitychange` event de khong tinh thoi gian khi tab bi an

Logic chinh:
```text
- Bat dau interval 60 giay khi vao trang game
- Moi 60 giay:
  + Kiem tra tab co dang active khong (document.hidden === false)
  + Neu active: upsert daily_activity, cong 1 phut
- Khi tab bi an: tam dung interval
- Khi tab active lai: tiep tuc interval
- Khi roi khoi trang game: dung hoan toan
```

### 2. Cap nhat `StudyTimeLimitWrapper` (src/components/game/StudyTimeLimitWrapper.tsx)

- Tich hop `useOnlineTimeTracker` vao day (vi no da biet user dang o game page)
- Hook se tu dong chay khi `isGamePage = true`

### 3. Khong can thay doi database

Bang `daily_activity` da co san cot `time_spent_minutes` va RLS policies phu hop (user co the insert va update cua minh). Khong can migration.

### 4. Xu ly xung dot voi `complete_stage`

Ham `complete_stage` trong SQL cung cong `time_spent_minutes`. De tranh cong trung:
- Online tracker se la nguon chinh de tinh thoi gian
- Sua logic trong `complete_stage` de **khong cong** `time_spent_minutes` nua (chi giu cong xp, points, lessons_completed)
- Tao migration de sua ham `complete_stage`

### Files thay doi

| File | Thay doi |
|---|---|
| `src/hooks/useOnlineTimeTracker.ts` | **Moi** - Hook theo doi thoi gian online |
| `src/components/game/StudyTimeLimitWrapper.tsx` | Tich hop useOnlineTimeTracker |
| `supabase/migrations/xxx.sql` | Sua ham complete_stage: bo phan cong time_spent_minutes |

### Luong hoat dong moi

```text
1. Be vao trang /classroom/grade1 -> useOnlineTimeTracker bat dau chay
2. Moi 60 giay (neu tab active): upsert daily_activity += 1 phut
3. Be chuyen tab sang YouTube -> tracker tam dung (khong tinh)
4. Be quay lai tab -> tracker tiep tuc
5. useStudyTimeLimit poll moi 60 giay -> doc daily_activity.time_spent_minutes
6. Khi time >= limit -> hien StudyBreakReminder voi Trau Vang
```

### Chi tiet xu ly edge case

- **Tab bi an**: Dung `document.addEventListener('visibilitychange')` de tam dung/tiep tuc
- **User chua dang nhap**: Khong track (kiem tra session truoc)
- **Ngay moi**: `activity_date = CURRENT_DATE` trong upsert, tu dong tao row moi
- **Nhieu tab**: Moi tab se track doc lap, nhung vi cong don vao cung row nen van chinh xac

