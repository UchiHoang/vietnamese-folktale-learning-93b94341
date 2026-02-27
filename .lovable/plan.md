

# Tinh nang gioi han thoi gian hoc tap cho phu huynh

## Tong quan

Them tinh nang cho phep phu huynh dat gioi han thoi gian hoc/choi trong ngay (30p, 60p, 90p, 120p). Khi het thoi gian, hien thi canh bao than thien voi nhan vat Trau Vang (mascot-buffalo.png) thay vi error dialog.

## Thiet ke UX/UI

### Canh bao khi het gio
- **Khong phai error/cam doan** - ma la loi dong vien de thuong
- Nhan vat Trau Vang xuat hien voi animation (bounce, vuon vai)
- Thong diep: "Cha, ban da hoc rat cham chi roi! Trau Vang thay hoi moi mat, chung minh cung nghi giai lao, uong mot ngum nuoc va nhin ra cua so nhe!"
- Nut "Nghi ngoi thoi!" (tat modal) va "Xin them 5 phut" (gia han 1 lan)
- Background overlay nhe (khong block hoan toan), mau pastel am ap
- Confetti nhe khi hien thi de ton vinh viec hoc cham chi

### Cai dat trong Settings
- Them muc "Gioi han thoi gian" voi icon Clock trong SettingsTab
- Toggle bat/tat tinh nang
- Khi bat: hien thi 4 lua chon (30p, 60p, 90p, 120p) dang radio group
- Hien thi thanh progress bar thoi gian da hoc hom nay

## Chi tiet ky thuat

### 1. Tao bang `parental_settings` trong Supabase

```text
SQL Migration:
- Tao bang parental_settings:
  - user_id (uuid, PK, FK -> auth.users)
  - daily_limit_minutes (integer, default null = khong gioi han)
  - limit_enabled (boolean, default false)
  - extra_time_used (boolean, default false) -- da dung "xin them 5 phut" hom nay chua
  - last_reset_date (date) -- de reset extra_time_used moi ngay
  - created_at, updated_at
- RLS: user chi doc/sua cua minh
```

### 2. Tao hook `useStudyTimeLimit` (src/hooks/useStudyTimeLimit.ts)

```text
- Load parental_settings tu Supabase
- Load daily_activity.time_spent_minutes cua ngay hom nay
- Tinh toan: remainingMinutes = dailyLimit - todayTimeSpent
- Dat interval 1 phut de kiem tra
- Khi remainingMinutes <= 0: trigger canh bao
- Expose: { isLimitReached, remainingMinutes, dailyLimit, todayTimeSpent, 
            grantExtraTime, settings, updateSettings }
```

### 3. Tao component `StudyBreakReminder` (src/components/game/StudyBreakReminder.tsx)

```text
- Full-screen overlay voi animation (framer-motion)
- Hinh anh Trau Vang (/mascot-buffalo.png) voi animation bounce/vuon vai
- Thong diep de thuong, khong mang tinh cam doan
- 2 nut:
  + "Nghi ngoi thoi!" -> dong modal, co the redirect ve trang chu
  + "Xin them 5 phut nua!" -> goi grantExtraTime(), chi cho phep 1 lan/ngay
- Hieu ung confetti nhe (da co react-confetti trong dependencies)
```

### 4. Cap nhat SettingsTab (src/components/profile/SettingsTab.tsx)

```text
- Them Card "Kiểm soát thời gian" voi icon Clock
- Toggle bat/tat gioi han
- Khi bat: hien thi RadioGroup voi 4 option: 30p, 60p, 90p, 120p
- Hien thi progress bar: "Hôm nay đã học: X/Y phút"
- Luu vao Supabase parental_settings
```

### 5. Tich hop vao game (TrangQuynhMiniGame va cac game page)

```text
- Trong App.tsx hoac tung game page: wrap voi StudyBreakReminder
- Hook useStudyTimeLimit chay o cap App hoac tung game component
- Khi isLimitReached = true: hien thi StudyBreakReminder overlay
- Khong block ngay lap tuc (cho phep luu progress truoc)
```

### Files can thay doi

| File | Thay doi |
|---|---|
| `supabase/migrations/xxx.sql` | Tao bang parental_settings + RLS |
| `src/integrations/supabase/types.ts` | Cap nhat types cho bang moi |
| `src/hooks/useStudyTimeLimit.ts` | **Moi** - Hook quan ly gioi han thoi gian |
| `src/components/game/StudyBreakReminder.tsx` | **Moi** - Modal canh bao de thuong |
| `src/components/profile/SettingsTab.tsx` | Them phan cai dat gioi han thoi gian |
| `src/App.tsx` | Them StudyBreakReminder wrapper |

### Luong hoat dong

```text
1. Phu huynh vao Profile > Settings > Bat "Gioi han thoi gian" > Chon 60 phut
2. Be vao choi game, hook useStudyTimeLimit bat dau theo doi
3. Moi phut, hook kiem tra daily_activity.time_spent_minutes
4. Khi tong >= 60 phut: trigger StudyBreakReminder
5. Trau Vang xuat hien: "Cham chi qua! Nghi ngoi di nao!"
6. Be bam "Xin them 5 phut" -> duoc them 5 phut (chi 1 lan/ngay)
7. Sau 5 phut: lai hien canh bao, chi con nut "Nghi ngoi thoi!"
```
