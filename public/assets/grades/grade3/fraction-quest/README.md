# Lớp 3 - Hành Trình Phân Số (Fraction Quest)

## Thông tin game
- **Lớp**: Lớp 3 (Grade 3)
- **Game ID**: fraction-quest
- **Chủ đề**: Phân số, Phép nhân chia, Hình học cơ bản

## Cấu trúc thư mục

```
fraction-quest/
├── characters/               # Nhân vật
│   ├── scientist_idle.png    # Nhà khoa học - chờ
│   ├── scientist_explain.png # Nhà khoa học - giải thích
│   ├── robot_idle.png        # Robot trợ lý - chờ
│   ├── robot_calculate.png   # Robot - tính toán
│   └── alien_idle.png        # Người ngoài hành tinh
├── icons/                    # Icons cho từng màn
│   ├── icon_pizza.png        # Chia pizza (phân số)
│   ├── icon_cake.png         # Chia bánh
│   ├── icon_fraction.png     # Phân số
│   ├── icon_multiply.png     # Phép nhân
│   ├── icon_divide.png       # Phép chia
│   ├── icon_circle.png       # Hình tròn
│   ├── icon_square.png       # Hình vuông
│   └── icon_triangle.png     # Tam giác
└── backgrounds/              # Backgrounds
    ├── bg_lab.png            # Phòng thí nghiệm
    ├── bg_space.png          # Không gian
    ├── bg_kitchen.png        # Nhà bếp
    └── bg_classroom.png      # Lớp học
```

## Sử dụng trong code

```typescript
import { grade3Games, grade3FractionCharacters } from '@/utils/assetPaths';

// Lấy sprite nhân vật
const scientistIdle = grade3FractionCharacters.scientist.idle;
const robotCalculate = grade3FractionCharacters.robot.calculate;

// Lấy icon màn chơi
const pizzaIcon = grade3Games.fractionQuest.icon('pizza');

// Lấy background
const labBg = grade3Games.fractionQuest.background('lab');
```

## Nội dung chính

### Phần 1: Làm Quen Phân Số
- Khái niệm phân số
- Đọc và viết phân số
- Phân số bằng nhau

### Phần 2: Phép Tính Với Phân Số
- Cộng phân số cùng mẫu
- Trừ phân số cùng mẫu
- So sánh phân số

### Phần 3: Hình Học
- Góc vuông, góc nhọn, góc tù
- Chu vi hình tam giác, tứ giác
- Diện tích hình chữ nhật

### Phần 4: Thử Thách Tổng Hợp
- Bài toán kết hợp
- Đố vui logic
