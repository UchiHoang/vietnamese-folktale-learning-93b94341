# Lớp 2 - Trạng Quỳnh Đi Thi

## Thông tin game
- **Lớp**: Lớp 2 (Grade 2)
- **Game ID**: trangquynh
- **Chủ đề**: Toán lớp 2 - Cộng trừ trong phạm vi 1000, Thời gian, Đo lường, Nhân chia

## Cấu trúc thư mục

```
trangquynh/
├── characters/               # Nhân vật
│   ├── trang_idle.png        # Trạng Quỳnh - chờ
│   ├── trang_cheer.png       # Trạng Quỳnh - vui mừng
│   ├── trang_portrait.png    # Trạng Quỳnh - chân dung
│   ├── teacher_idle.png      # Thầy đồ
│   ├── villager_idle.png     # Dân làng
│   ├── merchant_idle.png     # Thương nhân
│   └── king_idle.png         # Nhà vua
├── icons/                    # Icons cho 15 màn
│   ├── icon_apple.png        # Màn 1: Làng Thi Nhỏ
│   ├── icon_bridge.png       # Màn 2: Thử Thách Trên Cầu
│   ├── icon_bunch.png        # Màn 3: Giúp Bà Hàng Xóm
│   ├── icon_clock.png        # Màn 4: Giờ Học Cuối Cùng
│   ├── icon_calendar.png     # Màn 5: Lịch Trình May Mắn
│   ├── icon_ruler.png        # Màn 6: Thước Đo Ao Sen
│   ├── icon_road.png         # Màn 7: Đường Đê Khúc Khuỷu
│   ├── icon_sack.png         # Màn 8: Gạo Trắng, Nước Trong
│   ├── icon_market.png       # Màn 9: Chợ Phiên Kinh Kỳ
│   ├── icon_candy.png        # Màn 10: Chia Kẹo Cho Trẻ
│   ├── icon_money.png        # Màn 11: Tiền Thưởng Của Làng
│   ├── icon_rice.png         # Màn 12: Kiểm Kê Kho Thóc
│   ├── icon_scroll.png       # Màn 13: So Sánh Bổng Lộc
│   ├── icon_brick.png        # Màn 14: Xây Dựng Thành Quách
│   ├── icon_crown.png        # Màn 15: Đối Đáp Trước Rồng Vàng
│   └── icon_puzzle.png       # Icon mặc định
└── backgrounds/              # Backgrounds
    ├── bg_village.png        # Làng quê
    ├── bg_bridge.png         # Cây cầu
    ├── bg_school.png         # Trường làng
    ├── bg_road.png           # Đường đi
    ├── bg_market.png         # Chợ
    ├── bg_palace.png         # Cung điện
    └── bg_throne.png         # Điện Rồng
```

## Sử dụng trong code

```typescript
import { 
  gameAssets, 
  trangQuynhCharacters, 
  getTrangQuynhLevelIcon 
} from '@/utils/assetPaths';

// Lấy sprite nhân vật
const trangIdle = trangQuynhCharacters.trang.idle;
const trangCheer = trangQuynhCharacters.trang.cheer;

// Lấy icon màn chơi theo số màn
const level5Icon = getTrangQuynhLevelIcon(5); // icon_calendar.png

// Lấy background
const villageBg = gameAssets.trangquynh.background('village');
```

## Cốt truyện 4 phần

### Phần 1: Khởi Hành Tại Làng (Màn 1-5)
- Cộng trừ có nhớ trong phạm vi 100
- Bài toán lời văn
- Xem đồng hồ, lịch

### Phần 2: Hành Trình Gian Nan (Màn 6-8)
- Đo độ dài (cm, dm, m)
- Đường gấp khúc, hình học
- Khối lượng (kg), dung tích (lít)

### Phần 3: Kinh Đô Nhộn Nhịp (Màn 9-11)
- Phép nhân (bảng 2, 5)
- Phép chia (bảng 2, 5)
- Tiền tệ Việt Nam

### Phần 4: Vào Thi Đình (Màn 12-15)
- Số trong phạm vi 1000
- So sánh số 3 chữ số
- Cộng trừ không nhớ trong phạm vi 1000
- Ôn tập tổng hợp nâng cao
