# Cấu Trúc Thư Mục Assets

Thư mục này tổ chức assets theo cấu trúc có thể mở rộng cho nhiều lớp học và game.

## Cấu trúc thư mục

```
public/assets/
├── common/                      # Assets dùng chung cho tất cả các lớp
│   ├── icons/                   # Icons dùng chung (badge, trophy...)
│   │   └── icon_badge.png
│   └── backgrounds/             # Backgrounds dùng chung
│
└── grades/                      # Assets theo từng lớp
    ├── preschool/               # Mầm non
    │   └── [game-name]/
    │       ├── characters/
    │       ├── icons/
    │       └── backgrounds/
    │
    ├── grade1/                  # Lớp 1
    │   └── [game-name]/
    │
    ├── grade2/                  # Lớp 2
    │   └── trangquynh/          # Game Trạng Quỳnh đi thi
    │       ├── characters/      # Nhân vật
    │       │   ├── trang_idle.png
    │       │   ├── trang_cheer.png
    │       │   └── trang_portrait.png
    │       ├── icons/           # Icons cho từng màn
    │       │   ├── icon_apple.png
    │       │   ├── icon_bridge.png
    │       │   ├── icon_clock.png
    │       │   └── ...
    │       └── backgrounds/     # Backgrounds
    │           ├── bg_village.png
    │           ├── bg_market.png
    │           └── ...
    │
    ├── grade3/                  # Lớp 3
    ├── grade4/                  # Lớp 4
    └── grade5/                  # Lớp 5
```

## Quy tắc đặt tên file

### Characters (Nhân vật)
- Format: `{character_id}_{state}.png`
- Ví dụ: `trang_idle.png`, `trang_cheer.png`, `teacher_angry.png`
- States phổ biến: `idle`, `cheer`, `portrait`, `sad`, `angry`, `thinking`

### Icons
- Format: `icon_{name}.png`
- Ví dụ: `icon_apple.png`, `icon_clock.png`, `icon_money.png`

### Backgrounds
- Format: `bg_{scene}.png`
- Ví dụ: `bg_village.png`, `bg_market.png`, `bg_palace.png`

## Thêm game mới

### 1. Tạo thư mục cho game mới
```
public/assets/grades/{grade}/{game-id}/
├── characters/
├── icons/
└── backgrounds/
```

### 2. Đăng ký trong assetPaths.ts
```typescript
// src/utils/assetPaths.ts
export const gameAssets = {
  // Existing
  trangquynh: new GameAssets({ grade: 'grade2', gameId: 'trangquynh' }),
  
  // New game
  myNewGame: new GameAssets({ grade: 'grade1', gameId: 'my-new-game' }),
};
```

### 3. Sử dụng trong code
```typescript
import { gameAssets } from '@/utils/assetPaths';

// Lấy đường dẫn nhân vật
const characterSprite = gameAssets.myNewGame.character('hero', 'idle');
// => /assets/grades/grade1/my-new-game/characters/hero_idle.png

// Lấy đường dẫn icon
const levelIcon = gameAssets.myNewGame.icon('star');
// => /assets/grades/grade1/my-new-game/icons/icon_star.png

// Lấy đường dẫn background
const bg = gameAssets.myNewGame.background('forest');
// => /assets/grades/grade1/my-new-game/backgrounds/bg_forest.png
```

## Ví dụ: Thêm game Lớp 1

```
public/assets/grades/grade1/counting-fun/
├── characters/
│   ├── bunny_idle.png
│   ├── bunny_happy.png
│   └── owl_idle.png
├── icons/
│   ├── icon_number.png
│   └── icon_star.png
└── backgrounds/
    ├── bg_garden.png
    └── bg_playground.png
```

```typescript
// src/utils/assetPaths.ts
export const gameAssets = {
  trangquynh: new GameAssets({ grade: 'grade2', gameId: 'trangquynh' }),
  countingFun: new GameAssets({ grade: 'grade1', gameId: 'counting-fun' }),
};

export const countingFunCharacters = {
  bunny: {
    idle: gameAssets.countingFun.character('bunny', 'idle'),
    happy: gameAssets.countingFun.character('bunny', 'happy'),
  },
  owl: {
    idle: gameAssets.countingFun.character('owl', 'idle'),
  },
};
```

## Lưu ý quan trọng

1. **Không đặt assets của các game khác nhau vào cùng thư mục** - Điều này sẽ gây nhầm lẫn và khó quản lý.

2. **Sử dụng `resolveLegacyAssetPath()`** để chuyển đổi đường dẫn cũ sang mới nếu cần.

3. **Tối ưu hình ảnh** trước khi thêm vào dự án - sử dụng định dạng PNG cho hình có transparency, JPEG cho ảnh nền.

4. **Kích thước khuyến nghị**:
   - Characters: 400x600px (portrait), 300x400px (sprite)
   - Icons: 128x128px hoặc 256x256px
   - Backgrounds: 1920x1080px

5. **Assets dùng chung** nên đặt trong `common/` để tái sử dụng giữa các game.
