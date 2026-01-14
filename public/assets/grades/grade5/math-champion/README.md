# Lớp 5 - Vô Địch Toán Học (Math Champion)

## Thông tin game
- **Lớp**: Lớp 5 (Grade 5)
- **Game ID**: math-champion
- **Chủ đề**: Tổng hợp toán nâng cao, Phần trăm, Số thập phân, Hình học 3D

## Cấu trúc thư mục

```
math-champion/
├── characters/               # Nhân vật
│   ├── champion_idle.png     # Nhà vô địch - chờ
│   ├── champion_victory.png  # Nhà vô địch - chiến thắng
│   ├── champion_think.png    # Nhà vô địch - suy nghĩ
│   ├── mentor_idle.png       # Người hướng dẫn
│   ├── mentor_proud.png      # Người hướng dẫn - tự hào
│   └── rival_idle.png        # Đối thủ
├── icons/                    # Icons cho từng màn
│   ├── icon_percent.png      # Phần trăm
│   ├── icon_decimal.png      # Số thập phân
│   ├── icon_cube.png         # Hình lập phương
│   ├── icon_cylinder.png     # Hình trụ
│   ├── icon_pyramid.png      # Hình chóp
│   ├── icon_trophy.png       # Cúp vô địch
│   ├── icon_medal.png        # Huy chương
│   ├── icon_speed.png        # Tính nhanh
│   └── icon_brain.png        # Logic
└── backgrounds/              # Backgrounds
    ├── bg_stadium.png        # Sân vận động
    ├── bg_arena.png          # Đấu trường
    ├── bg_training.png       # Phòng luyện tập
    ├── bg_finals.png         # Chung kết
    └── bg_podium.png         # Bục trao giải
```

## Sử dụng trong code

```typescript
import { grade5Games, grade5ChampionCharacters } from '@/utils/assetPaths';

// Lấy sprite nhân vật
const championIdle = grade5ChampionCharacters.champion.idle;
const championVictory = grade5ChampionCharacters.champion.victory;
const mentorProud = grade5ChampionCharacters.mentor.proud;

// Lấy icon màn chơi
const percentIcon = grade5Games.mathChampion.icon('percent');
const trophyIcon = grade5Games.mathChampion.icon('trophy');

// Lấy background
const arenaBg = grade5Games.mathChampion.background('arena');
```

## Nội dung chính

### Vòng Loại: Số Thập Phân
- Đọc, viết số thập phân
- Cộng, trừ số thập phân
- Nhân, chia số thập phân

### Vòng Bảng: Phần Trăm
- Khái niệm phần trăm
- Tính phần trăm của số
- Bài toán thực tế về phần trăm

### Bán Kết: Hình Học 3D
- Hình hộp chữ nhật, lập phương
- Thể tích, diện tích xung quanh
- Hình trụ, hình nón, hình cầu

### Chung Kết: Thử Thách Tổng Hợp
- Bài toán tổng hợp nâng cao
- Đố vui logic
- Tính nhanh
- Đấu trí với đối thủ

## Đặc biệt
Game này có hệ thống:
- **Xếp hạng**: Bảng xếp hạng toàn quốc
- **Huy chương**: Vàng, Bạc, Đồng
- **Thử thách hàng tuần**: Cập nhật câu hỏi mới
