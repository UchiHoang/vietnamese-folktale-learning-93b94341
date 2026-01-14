# Lớp 1 - Cuộc Phiêu Lưu Số (Number Adventure)

## Thông tin game
- **Lớp**: Lớp 1 (Grade 1)
- **Game ID**: number-adventure
- **Chủ đề**: Phép cộng trừ cơ bản trong phạm vi 20

## Cấu trúc thư mục

```
number-adventure/
├── characters/               # Nhân vật
│   ├── hero_idle.png         # Nhân vật chính - chờ
│   ├── hero_run.png          # Nhân vật chính - chạy
│   ├── hero_celebrate.png    # Nhân vật chính - ăn mừng
│   ├── guide_idle.png        # Hướng dẫn viên - chờ
│   └── guide_point.png       # Hướng dẫn viên - chỉ tay
├── icons/                    # Icons cho từng màn
│   ├── icon_number1.png      # Số 1
│   ├── icon_number2.png      # Số 2
│   ├── icon_plus.png         # Dấu cộng
│   ├── icon_minus.png        # Dấu trừ
│   ├── icon_treasure.png     # Kho báu
│   └── icon_key.png          # Chìa khóa
└── backgrounds/              # Backgrounds
    ├── bg_forest.png         # Rừng xanh
    ├── bg_castle.png         # Lâu đài
    ├── bg_river.png          # Bờ sông
    └── bg_mountain.png       # Núi cao
```

## Sử dụng trong code

```typescript
import { grade1Games, grade1AdventureCharacters } from '@/utils/assetPaths';

// Lấy sprite nhân vật
const heroIdle = grade1AdventureCharacters.hero.idle;
const guidePoint = grade1AdventureCharacters.guide.point;

// Lấy icon màn chơi
const treasureIcon = grade1Games.numberAdventure.icon('treasure');

// Lấy background
const forestBg = grade1Games.numberAdventure.background('forest');
```

## Cốt truyện game
- **Phần 1**: Làm quen với các số từ 1-10
- **Phần 2**: Phép cộng đơn giản (không nhớ)
- **Phần 3**: Phép trừ đơn giản (không nhớ)
- **Phần 4**: Tổng hợp và thử thách cuối cùng

## Hướng dẫn thêm assets

1. Đặt file PNG vào đúng thư mục
2. Đặt tên theo format chuẩn
3. Kích thước khuyến nghị:
   - Characters: 400x500px
   - Icons: 128x128px
   - Backgrounds: 1920x1080px
