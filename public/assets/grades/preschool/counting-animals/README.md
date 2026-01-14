# Mầm Non - Đếm Cùng Động Vật (Counting Animals)

## Thông tin game
- **Lớp**: Mầm non (Preschool)
- **Game ID**: counting-animals
- **Chủ đề**: Đếm số từ 1-10 với các con vật dễ thương

## Cấu trúc thư mục

```
counting-animals/
├── characters/           # Nhân vật
│   ├── bunny_idle.png    # Thỏ - trạng thái chờ
│   ├── bunny_happy.png   # Thỏ - vui mừng
│   ├── bear_idle.png     # Gấu - trạng thái chờ
│   ├── bear_wave.png     # Gấu - vẫy tay
│   └── owl_idle.png      # Cú - trạng thái chờ
├── icons/                # Icons cho từng màn
│   ├── icon_apple.png    # Đếm táo
│   ├── icon_banana.png   # Đếm chuối
│   ├── icon_star.png     # Đếm sao
│   ├── icon_flower.png   # Đếm hoa
│   └── icon_ball.png     # Đếm bóng
└── backgrounds/          # Backgrounds
    ├── bg_garden.png     # Vườn hoa
    ├── bg_farm.png       # Nông trại
    └── bg_playground.png # Sân chơi
```

## Sử dụng trong code

```typescript
import { preschoolGames, preschoolCountingCharacters } from '@/utils/assetPaths';

// Lấy sprite nhân vật
const bunnyIdle = preschoolCountingCharacters.bunny.idle;
const bearWave = preschoolCountingCharacters.bear.wave;

// Lấy icon màn chơi
const appleIcon = preschoolGames.countingAnimals.icon('apple');

// Lấy background
const gardenBg = preschoolGames.countingAnimals.background('garden');
```

## Hướng dẫn thêm assets

1. Đặt file PNG vào đúng thư mục (characters/, icons/, backgrounds/)
2. Đặt tên theo format: `{type}_{name}.png`
3. Kích thước khuyến nghị:
   - Characters: 400x500px (có transparency)
   - Icons: 128x128px hoặc 256x256px
   - Backgrounds: 1920x1080px
