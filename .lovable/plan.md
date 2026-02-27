

# Track thoi gian online tren tat ca cac trang website

## Muc tieu

Hien tai, thoi gian chi duoc tinh khi be o trang `/classroom/` hoac `/lessons`. Yeu cau moi: tinh thoi gian tren **tat ca cac trang** cua website (trang chu, profile, library, v.v.) de bao ve mat cho tre toan dien hon.

## Thay doi

### 1. `src/components/game/StudyTimeLimitWrapper.tsx`

- Bo dieu kien loc `isGamePage` cho tracker: `useOnlineTimeTracker(true)` thay vi `useOnlineTimeTracker(isGamePage)` -- nghia la bat cu khi nao user dang nhap va o bat ky trang nao, thoi gian deu duoc tinh.
- Giu nguyen `isGamePage` cho viec hien thi `StudyBreakReminder` -- popup nhac nho van chi hien khi be dang o trang hoc/choi, vi o trang chu/profile thi khong can chan.
- Tuy nhien, them logic: khi `isLimitReached` va be **khong** o trang game, van hien thi 1 banner nho (toast/notification) de nhac nhe thay vi popup toan man hinh.

### 2. Chi tiet thay doi code

**StudyTimeLimitWrapper.tsx:**

```text
Truoc: useOnlineTimeTracker(isGamePage)
Sau:   useOnlineTimeTracker(true)  // Track tren moi trang

Truoc: if (loading || !isGamePage) return null;
Sau:   if (loading) return null;
       if (!isGamePage && isLimitReached && !dismissed) {
         // Hien toast nhe nhang thay vi popup toan man hinh
         return <StudyBreakReminder ... softMode={true} />
       }
       if (!isGamePage) return null;
       // Giu nguyen popup cho trang game
```

**StudyBreakReminder.tsx:**
- Them prop `softMode?: boolean`
- Khi `softMode=true`: hien thi dang banner nho o goc duoi man hinh thay vi overlay toan man hinh, de tre van co the xem trang chu nhung van biet da het thoi gian

### 3. Khong can thay doi database

Hook `useOnlineTimeTracker` va bang `daily_activity` khong can thay doi gi -- chi thay doi dieu kien kich hoat tren client.

## Luong hoat dong moi

```text
1. Be dang nhap va vao bat ky trang nao -> tracker bat dau chay
2. Moi 60 giay (tab active) -> daily_activity.time_spent_minutes += 1
3. Khi het thoi gian:
   - Neu dang o trang game/lesson -> popup toan man hinh voi Trau Vang
   - Neu dang o trang khac (home, profile) -> banner nho o goc duoi nhac nho
4. Be van co the "xin them 5 phut" nhu binh thuong
```

## Tom tat files thay doi

| File | Thay doi |
|---|---|
| `src/components/game/StudyTimeLimitWrapper.tsx` | Bo dieu kien `isGamePage` cho tracker, them logic hien thi soft mode |
| `src/components/game/StudyBreakReminder.tsx` | Them prop `softMode` voi giao dien banner nho |

