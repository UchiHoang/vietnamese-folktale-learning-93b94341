

## Vấn đề hiện tại

Khi người chơi ghép sai cặp trong trò **Matching Pairs**, hệ thống hiển thị ngay lập tức:
- Card chuyển **đỏ** (`bg-red-500`) với icon **X**
- Điều này **lộ đáp án** vì người chơi biết ngay cặp nào sai

Tương tự, khi ghép đúng, card chuyển **xanh** ngay lập tức - cho phép người chơi dùng phương pháp loại trừ.

## Giải pháp

Thay đổi logic gameplay: **không tiết lộ đúng/sai ngay**, chỉ hiển thị kết quả sau khi người chơi đã nối hết tất cả các cặp.

### Luồng gameplay mới:
1. Người chơi chọn trái -> chọn phải -> cặp được **ghim lại** (hiển thị màu trung tính, ví dụ màu cam/primary)
2. Người chơi có thể **bỏ ghép** (nhấn X) để thử lại cặp khác
3. Khi đã nối đủ tất cả các cặp, hiện nút **"Kiểm tra đáp án"**
4. Khi bấm kiểm tra: mới hiển thị xanh (đúng) / đỏ (sai) cho từng cặp
5. Sau 2 giây, gọi `onComplete` với kết quả

### Chi tiết kỹ thuật

**File chỉnh sửa:** `src/components/game/MatchingPairsGame.tsx`

1. **Bỏ state `incorrect`** - không cần feedback sai ngay nữa
2. **Đổi state `matched` thành `paired`** (`Record<string, string>`) - lưu cặp đã ghép (trái -> phải) mà chưa kiểm tra đúng sai
3. **Thêm state `results`** (`Record<string, boolean>`) - chỉ có giá trị sau khi bấm kiểm tra
4. **Thêm state `showResults`** (boolean) - đánh dấu đã kiểm tra chưa
5. **Logic ghép cặp mới:**
   - Khi chọn trái + phải: lưu vào `paired[leftId] = rightId`, reset selection
   - Card đã ghép hiển thị màu primary (trung tính), có nút X để bỏ ghép
   - Không hiển thị đúng/sai
6. **Nút "Kiểm tra đáp án":** xuất hiện khi `Object.keys(paired).length === pairs.length`
   - Khi bấm: tính `results` cho từng cặp, set `showResults = true`
   - Hiển thị xanh/đỏ cho từng cặp
   - Gọi `onComplete(allCorrect)` sau 2 giây
7. **Cập nhật `getCardStyle`:** thêm trạng thái "paired" (đã ghép, chưa kiểm tra) với màu trung tính

