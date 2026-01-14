# Lớp 4 - Thế Giới Hình Học (Geometry World)

## Thông tin game
- **Lớp**: Lớp 4 (Grade 4)
- **Game ID**: geometry-world
- **Chủ đề**: Hình học nâng cao, Góc, Diện tích, Chu vi

## Cấu trúc thư mục

```
geometry-world/
├── characters/               # Nhân vật
│   ├── architect_idle.png    # Kiến trúc sư - chờ
│   ├── architect_draw.png    # Kiến trúc sư - vẽ
│   ├── helper_idle.png       # Trợ lý
│   ├── builder_idle.png      # Thợ xây
│   └── ruler_idle.png        # Ông vua thước kẻ
├── icons/                    # Icons cho từng màn
│   ├── icon_angle.png        # Góc
│   ├── icon_protractor.png   # Thước đo góc
│   ├── icon_rectangle.png    # Hình chữ nhật
│   ├── icon_parallelogram.png # Hình bình hành
│   ├── icon_rhombus.png      # Hình thoi
│   ├── icon_perimeter.png    # Chu vi
│   ├── icon_area.png         # Diện tích
│   └── icon_compass.png      # Compa
└── backgrounds/              # Backgrounds
    ├── bg_blueprint.png      # Bản vẽ
    ├── bg_construction.png   # Công trường
    ├── bg_city.png           # Thành phố
    └── bg_museum.png         # Bảo tàng hình học
```

## Sử dụng trong code

```typescript
import { grade4Games, grade4GeometryCharacters } from '@/utils/assetPaths';

// Lấy sprite nhân vật
const architectIdle = grade4GeometryCharacters.architect.idle;
const architectDraw = grade4GeometryCharacters.architect.draw;

// Lấy icon màn chơi
const angleIcon = grade4Games.geometryWorld.icon('angle');

// Lấy background
const blueprintBg = grade4Games.geometryWorld.background('blueprint');
```

## Nội dung chính

### Phần 1: Góc và Đo Góc
- Góc nhọn, vuông, tù, bẹt
- Sử dụng thước đo góc
- Vẽ góc

### Phần 2: Các Hình Cơ Bản
- Hình bình hành
- Hình thoi
- Hình chữ nhật, hình vuông

### Phần 3: Chu Vi và Diện Tích
- Chu vi các hình
- Diện tích hình chữ nhật
- Diện tích hình vuông
- Diện tích hình bình hành

### Phần 4: Thử Thách Xây Dựng
- Bài toán thực tế
- Thiết kế và tính toán
