# 📁 Cấu Trúc Thư Mục Assets

Thư mục này tổ chức assets theo cấu trúc có thể mở rộng cho nhiều lớp học và game.

## 🏗️ Cấu trúc tổng quan

```
public/assets/
├── common/                          # Assets dùng chung cho TẤT CẢ các lớp
│   ├── icons/                       # Icons dùng chung (badge, trophy, star...)
│   │   ├── icon_badge.png
│   │   ├── icon_trophy.png
│   │   └── icon_star.png
│   ├── backgrounds/                 # Backgrounds dùng chung
│   │   └── bg_default.png
│   └── ui/                          # UI elements (buttons, frames...)
│       ├── button_primary.png
│       └── frame_gold.png
│
└── grades/                          # Assets theo TỪNG LỚP
    │
    ├── preschool/                   # 🧒 MẦM NON
    │   └── counting-animals/        # Game: Đếm cùng động vật
    │       ├── characters/
    │       │   ├── bunny_idle.png
    │       │   └── bear_happy.png
    │       ├── icons/
    │       └── backgrounds/
    │
    ├── grade1/                      # 📚 LỚP 1
    │   └── number-adventure/        # Game: Cuộc phiêu lưu số
    │       ├── characters/
    │       │   ├── hero_idle.png
    │       │   └── guide_point.png
    │       ├── icons/
    │       └── backgrounds/
    │
    ├── grade2/                      # 📖 LỚP 2
    │   └── trangquynh/              # Game: Trạng Quỳnh đi thi ✅ (đang phát triển)
    │       ├── characters/
    │       │   ├── trang_idle.png
    │       │   ├── trang_cheer.png
    │       │   └── trang_portrait.png
    │       ├── icons/
    │       │   ├── icon_apple.png
    │       │   ├── icon_bridge.png
    │       │   └── ...
    │       └── backgrounds/
    │
    ├── grade3/                      # 📐 LỚP 3
    │   └── fraction-quest/          # Game: Hành trình phân số
    │       ├── characters/
    │       │   ├── scientist_idle.png
    │       │   └── robot_calculate.png
    │       ├── icons/
    │       └── backgrounds/
    │
    ├── grade4/                      # 📏 LỚP 4
    │   └── geometry-world/          # Game: Thế giới hình học
    │       ├── characters/
    │       │   ├── architect_idle.png
    │       │   └── architect_draw.png
    │       ├── icons/
    │       └── backgrounds/
    │
    └── grade5/                      # 🏆 LỚP 5
        └── math-champion/           # Game: Vô địch toán học
            ├── characters/
            │   ├── champion_idle.png
            │   ├── champion_victory.png
            │   └── mentor_proud.png
            ├── icons/
            └── backgrounds/
```

## 📋 Danh sách Games theo Lớp

| Lớp | Game ID | Tên Game | Trạng thái |
|-----|---------|----------|------------|
| Mầm non | `counting-animals` | Đếm Cùng Động Vật | 📝 Planned |
| Lớp 1 | `number-adventure` | Cuộc Phiêu Lưu Số | 📝 Planned |
| Lớp 2 | `trangquynh` | Trạng Quỳnh Đi Thi | ✅ Active |
| Lớp 3 | `fraction-quest` | Hành Trình Phân Số | 📝 Planned |
| Lớp 4 | `geometry-world` | Thế Giới Hình Học | 📝 Planned |
| Lớp 5 | `math-champion` | Vô Địch Toán Học | 📝 Planned |

## 🎨 Quy tắc đặt tên file

### Characters (Nhân vật)
- Format: `{character_id}_{state}.png`
- States phổ biến: `idle`, `cheer`, `portrait`, `happy`, `sad`, `angry`, `thinking`, `run`, `celebrate`

```
✅ trang_idle.png
✅ bunny_happy.png  
✅ champion_victory.png
❌ trang.png (thiếu state)
❌ Trang_Idle.png (không dùng chữ hoa)
```

### Icons
- Format: `icon_{name}.png`

```
✅ icon_apple.png
✅ icon_trophy.png
❌ apple_icon.png (sai format)
❌ iconApple.png (không dùng camelCase)
```

### Backgrounds
- Format: `bg_{scene}.png`

```
✅ bg_village.png
✅ bg_arena.png
❌ village_bg.png (sai format)
❌ background_village.png (quá dài)
```

## 🚀 Thêm Game Mới

### Bước 1: Tạo thư mục

```bash
# Ví dụ: Thêm game mới cho Lớp 3
mkdir -p public/assets/grades/grade3/my-new-game/{characters,icons,backgrounds}
```

### Bước 2: Đăng ký trong assetPaths.ts

```typescript
// src/utils/assetPaths.ts

// Thêm vào phần grade3Games
export const grade3Games = {
  fractionQuest: new GameAssets({ grade: 'grade3', gameId: 'fraction-quest' }),
  myNewGame: new GameAssets({ grade: 'grade3', gameId: 'my-new-game' }), // 👈 Thêm dòng này
};
```

### Bước 3: Tạo character config (nếu cần)

```typescript
// src/utils/assetPaths.ts

export const myNewGameCharacters = {
  hero: {
    idle: grade3Games.myNewGame.character('hero', 'idle'),
    happy: grade3Games.myNewGame.character('hero', 'happy'),
  },
  helper: {
    idle: grade3Games.myNewGame.character('helper', 'idle'),
  },
};
```

### Bước 4: Sử dụng trong component

```typescript
import { grade3Games, myNewGameCharacters } from '@/utils/assetPaths';

// Lấy sprite nhân vật
const heroSprite = myNewGameCharacters.hero.idle;

// Lấy icon
const levelIcon = grade3Games.myNewGame.icon('star');

// Lấy background
const sceneBg = grade3Games.myNewGame.background('forest');
```

## 📐 Kích thước khuyến nghị

| Loại | Kích thước | Định dạng | Ghi chú |
|------|-----------|-----------|---------|
| Characters (sprite) | 400x500px | PNG (có transparency) | Nhân vật full-body |
| Characters (portrait) | 300x300px | PNG (có transparency) | Chân dung/avatar |
| Icons | 128x128px hoặc 256x256px | PNG (có transparency) | Vuông, nền trong |
| Backgrounds | 1920x1080px | PNG hoặc JPG | 16:9 aspect ratio |

## ⚠️ Lưu ý quan trọng

1. **KHÔNG đặt assets của các game khác nhau vào cùng thư mục** - Mỗi game có thư mục riêng để tránh xung đột.

2. **KHÔNG dùng đường dẫn cứng trong code** - Luôn sử dụng `assetPaths.ts` để quản lý đường dẫn.

3. **Assets dùng chung** đặt trong `common/` - Ví dụ: badge, trophy, star icons.

4. **Tối ưu hình ảnh** trước khi thêm vào dự án - Giảm dung lượng file.

5. **Mỗi thư mục game có README.md** - Ghi chú về nhân vật, màn chơi, cách sử dụng.

## 🔧 Migration từ đường dẫn cũ

Nếu bạn có code sử dụng đường dẫn cũ (ví dụ: `assets/user/trang_idle.png`), sử dụng helper function:

```typescript
import { resolveLegacyAssetPath } from '@/utils/assetPaths';

// Đường dẫn cũ sẽ được chuyển đổi tự động
const spritePath = resolveLegacyAssetPath('assets/user/trang_idle.png');
// => /assets/grades/grade2/trangquynh/characters/trang_idle.png
```

## 📚 Tài liệu thêm

Xem README.md trong từng thư mục game để biết chi tiết về:
- Danh sách nhân vật và trạng thái
- Danh sách icons theo màn chơi
- Cốt truyện và nội dung game
- Hướng dẫn sử dụng trong code
