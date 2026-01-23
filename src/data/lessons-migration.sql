-- ==========================================
-- MIGRATION DỮ LIỆU TỪ lessonsData VÀ topicsData
-- ==========================================

-- 1. THÊM DỮ LIỆU VÀO BẢNG LESSONS
INSERT INTO public.lessons (id, title, topic_count, quiz_count) VALUES
  ('L1', 'Toán Lớp 1', 31, 3),
  ('L2', 'Toán Lớp 2', 26, 5),
  ('L3', 'Toán Lớp 3', 20, 4),
  ('L4', 'Toán Lớp 4', 20, 6),
  ('L5', 'Toán Lớp 5', 20, 8)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  topic_count = EXCLUDED.topic_count,
  quiz_count = EXCLUDED.quiz_count;

-- 2. THÊM DỮ LIỆU VÀO BẢNG TOPICS - LỚP 1 KỲ 1
INSERT INTO public.topics (id, lesson_id, semester, title, video_url, description, order_index) VALUES
  ('L1-1', 'L1', 1, 'Các số từ 1 đến 10', 'https://www.youtube.com/embed/EX8DR1YMlRE', 'Học đếm số cơ bản.', 1),
  ('L1-2', 'L1', 1, 'Các số 4, 5', 'https://www.youtube.com/embed/tLoZ3HB3n7c', 'Tiếp tục làm quen với các số từ 4, 5', 2),
  ('L1-3', 'L1', 1, 'Các số 6, 7, 8, 9', 'https://www.youtube.com/embed/6mEtEcxAOnQ', 'Khám phá các số từ 6 đến 9', 3),
  ('L1-4', 'L1', 1, 'Số 10 và ôn tập', 'https://www.youtube.com/embed/lRXAnk0wiGI', 'Học số 10 và ôn tập tất cả các số đã học', 4),
  ('L1-5', 'L1', 1, 'Số 0', 'https://www.youtube.com/embed/aMJgvwRAL_k', 'Học Làm quen với số 0', 5),
  ('L1-6', 'L1', 1, 'So Sánh Các Dấu Cho Bé Mới Bắt Đầu', 'https://www.youtube.com/embed/nz5PWLtaokw', 'Cách dùng các dấu trong phép so sánh', 6),
  ('L1-7', 'L1', 1, 'Học Cách So Sánh Nhiều Hơn, Ít Hơn, Bằng Nhau', 'https://www.youtube.com/embed/Z8P-pmHMxDU', 'Học cách nhận biết và so sánh số lượng: nhiều – ít – bằng nhau', 7),
  ('L1-8', 'L1', 1, 'Vẽ Đoạn Thẳng Có Độ Dài Cho Trước Như Thế Nào?', 'https://www.youtube.com/embed/F3yktQ99TYw', 'Học cách kẻ vẽ đoạn thẳng có độ dài chính xác.', 8),
  ('L1-9', 'L1', 1, 'Học Cách Cộng Trong Phạm Vi 4, 5, 6 Đơn Giản', 'https://www.youtube.com/embed/Ei0_VugQejo', 'Làm quen với phép cộng trong phạm vi 4, 5 và 6', 9),
  ('L1-10', 'L1', 1, 'Hiểu Nhanh Số 0 Trong Phép Cộng', 'https://www.youtube.com/embed/9zOo65_BiuQ', 'tìm hiểu Ý nghĩa của số 0 trong phép cộng', 10),
  ('L1-11', 'L1', 1, 'Học Cách Cộng Trong Phạm Vi 6, 7, 8 Đơn Giản', 'https://www.youtube.com/embed/Qq8r7-feu6s', 'Làm quen với phép cộng trong phạm vi 6, 7 và 8', 11),
  ('L1-12', 'L1', 1, 'Học Cách Cộng Trong Phạm Vi 9, 10 Đơn Giản', 'https://www.youtube.com/embed/s-goxNdmJPE', 'Làm quen với phép cộng trong phạm vi 9 và 10', 12),
  ('L1-13', 'L1', 1, 'Học Cách Cộng Các Số Tròn Chục', 'https://www.youtube.com/embed/yd5JHf4Blh0', 'Biết cách cộng các số tròn chục.', 13),
  ('L1-14', 'L1', 1, 'Học Cách Trừ Trong Phạm Vi 3, 4, 5 Đơn Giản', 'https://www.youtube.com/embed/55l906_zUyE', 'Làm quen với phép trừ trong phạm vi 3, 4 và 5', 14),
  ('L1-15', 'L1', 1, 'Hiểu Nhanh Số 0 Trong Phép Trừ', 'https://www.youtube.com/embed/CyeG3y7lKeg', 'tìm hiểu Ý nghĩa của số 0 trong phép trừ', 15),
  ('L1-16', 'L1', 1, 'Phân Biệt Điểm Ở Trong Hay Ở Ngoài Một Hình', 'https://www.youtube.com/embed/-Cnwmbv69Aw', 'Nhận biết điểm nằm trong hoặc ngoài một hình phẳng', 16),
  ('L1-17', 'L1', 1, 'Nhận Biết Vị Trí: Trên – Dưới, Trái – Phải, Trước – Sau, Ở Giữa', 'https://www.youtube.com/embed/ZD5O7uPbWhw', 'Nhận biết các vị trí cơ bản.', 17),
  ('L1-18', 'L1', 1, 'Học Cách So Sánh Nhiều Hơn, Ít Hơn, Bằng Nhau (Ôn tập)', 'https://www.youtube.com/embed/Z8P-pmHMxDU', 'Học cách nhận biết và so sánh số lượng: nhiều – ít – bằng nhau.', 18),
  ('L1-19', 'L1', 1, 'Nhận Biết Vị Trí (Ôn tập)', 'https://www.youtube.com/embed/ZD5O7uPbWhw', 'Nhận biết các vị trí cơ bản.', 19),
  -- LỚP 1 KỲ 2
  ('L1-20', 'L1', 2, 'Làm Quen Với Đồng Hồ Và Thời Gian', 'https://www.youtube.com/embed/mIPRUr0rrOc', 'Làm quen và nhận biết đồng hồ và thời gian.', 20),
  ('L1-21', 'L1', 2, 'Xăng-ti-mét (cm)', 'https://www.youtube.com/embed/RJFSVVGgiTw', 'Làm quen với đơn vị đo độ dài Xăng-ti-mét (cm)', 21),
  ('L1-22', 'L1', 2, 'Nhận Biết Các Hình Học Cơ Bản: Vuông, Tròn, Tam Giác, Chữ Nhật', 'https://www.youtube.com/embed/W3UzjLDA6M4', 'Nhận biết các hình học cơ bản', 22),
  ('L1-23', 'L1', 2, 'Khối Lập Phương – Khối Hộp Chữ Nhật Là Gì?', 'https://www.youtube.com/embed/udOvVRBYfxo', 'Nhận biết hình khối cơ bản.', 23),
  ('L1-24', 'L1', 2, 'Học Cách Đo Độ Dài Chính Xác', 'https://www.youtube.com/embed/_Z6BNEvcZHI', 'Hiểu khái niệm đo độ dài là gì.', 24),
  ('L1-25', 'L1', 2, 'Làm Quen Với Các Số Từ 11 Đến 16 Dễ Hiểu', 'https://www.youtube.com/embed/xj6xmgfPTYA', 'Làm quen với các số từ 11 đến 16', 25),
  ('L1-26', 'L1', 2, 'Làm Quen Với Các Số Từ 17 Đến 20 Dễ Hiểu', 'https://www.youtube.com/embed/cj_H-yURTkk', 'Làm quen với các số từ 17 đến 20.', 26),
  ('L1-27', 'L1', 2, 'Làm Quen Với Các Số Từ 21 Đến 40', 'https://www.youtube.com/embed/kbd23ca3BTs', 'Làm quen với các số từ 21 đến 40.', 27),
  ('L1-28', 'L1', 2, 'Làm Quen Với Các Số Từ 71 Đến 99', 'https://www.youtube.com/embed/vRSD68RnrHg', 'Làm quen với các số từ 71 đến 99.', 28),
  ('L1-29', 'L1', 2, 'Phép Trừ Dạng 27 - 4 Và 63 - 40 Dễ Hiểu Dễ Nhớ', 'https://www.youtube.com/embed/_VJBjfIPXUw', 'Làm quen với phép trừ dạng 27 - 4 và 63 - 40', 29),
  ('L1-30', 'L1', 2, 'Học Cách So Sánh Độ Dài: Dài Hơn Hay Ngắn Hơn?', 'https://www.youtube.com/embed/dl-mzVa01N0', 'Quan sát và so sánh độ dài', 30),
  ('L1-31', 'L1', 2, 'Làm Quen Với Các Số Từ 41 Đến 70', 'https://www.youtube.com/embed/WOcDMWIiBFY', 'Làm quen với các số từ 41 đến 70', 31),
  -- LỚP 2 KỲ 1
  ('L2-1', 'L2', 1, 'Nhận Biết Đơn Vị Chục, Trăm, Nghìn', 'https://www.youtube.com/embed/GqOC3khhHYk', 'Nhận Biết Đơn Vị Chục, Trăm, Nghìn', 1),
  ('L2-2', 'L2', 1, 'Học So Sánh Các Số Tròn Trăm', 'https://www.youtube.com/embed/w_9hbyNwbEw', 'Học So Sánh Các Số Tròn Trăm', 2),
  ('L2-3', 'L2', 1, 'Làm Quen Với Các Số Từ 111 Đến 200', 'https://www.youtube.com/embed/lrc8idC9Itc', 'Làm Quen Với Các Số Từ 111 Đến 200', 3),
  ('L2-4', 'L2', 1, 'Làm Quen Với Các Số Có Ba Chữ Số', 'https://www.youtube.com/embed/tklyRfsxrq8', 'Làm Quen Với Các Số Có Ba Chữ Số', 4),
  ('L2-5', 'L2', 1, 'Học Cách Tìm Một Số Hạng Trong Một Tổng', 'https://www.youtube.com/embed/iq4s2yWVFYE', 'Học Cách Tìm Một Số Hạng Trong Một Tổng', 5),
  ('L2-6', 'L2', 1, 'Phân Biệt Ngày, Giờ, Xem Đồng Hồ', 'https://www.youtube.com/embed/HPsUJQ4amsM', 'Phân Biệt Ngày, Giờ, Xem Đồng Hồ', 6),
  ('L2-7', 'L2', 1, 'Phân Biệt Ngày, Tháng, Xem Lịch', 'https://www.youtube.com/embed/FfM5bGSUsJ4', 'Phân Biệt Ngày, Tháng, Xem Lịch', 7),
  ('L2-8', 'L2', 1, 'Ki-Lo-Gam (Kg) Là Gì?', 'https://www.youtube.com/embed/P5TGyT263tg', 'Ki-Lo-Gam (Kg) Là Gì?', 8),
  ('L2-9', 'L2', 1, 'Lít (L) Là Gì?', 'https://www.youtube.com/embed/sq6w6YTOy2g', 'Lít (L) Là Gì?', 9),
  ('L2-10', 'L2', 1, 'Nhận Biết Tiền Việt Nam', 'https://www.youtube.com/embed/ysFv_hBPiM8', 'Nhận Biết Tiền Việt Nam', 10),
  ('L2-11', 'L2', 1, 'Học Cách Giải Bài Toán Về Nhiều Hơn', 'https://www.youtube.com/embed/CTBmx61GEU8', 'Học Cách Giải Bài Toán Về Nhiều Hơn', 11),
  ('L2-12', 'L2', 1, 'Học Cách Giải Các Bài Toán Về Tuổi', 'https://www.youtube.com/embed/Xem-B2yn_f0', 'Học Cách Giải Các Bài Toán Về Tuổi', 12),
  ('L2-13', 'L2', 1, 'Làm Quen Với Số Hạng – Tổng Trong Phép Cộng', 'https://www.youtube.com/embed/5Szi-0_PRC8', 'Làm Quen Với Số Hạng – Tổng Trong Phép Cộng', 13),
  ('L2-14', 'L2', 1, 'Làm Quen Với Số Bị Trừ – Số Trừ – Hiệu', 'https://www.youtube.com/embed/3WVHjJfKivs', 'Làm Quen Với Số Bị Trừ – Số Trừ – Hiệu', 14),
  -- LỚP 2 KỲ 2
  ('L2-15', 'L2', 2, 'Khi Số Có Tận Cùng Là 1 Trừ Đi Một Số', 'https://www.youtube.com/embed/7oMjY5lXYRo', 'Khi Số Có Tận Cùng Là 1 Trừ Đi Một Số', 15),
  ('L2-16', 'L2', 2, 'Khi Số Có Tận Cùng Là 2 Trừ Đi Một Số', 'https://www.youtube.com/embed/G2S8vsjxFnw', 'Khi Số Có Tận Cùng Là 2 Trừ Đi Một Số', 16),
  ('L2-17', 'L2', 2, 'Làm Quen Với Kết Hợp Phép Tính', 'https://www.youtube.com/embed/YtBWfbUzGO4', 'Làm Quen Với Kết Hợp Phép Tính', 17),
  ('L2-18', 'L2', 2, 'Phép Cộng, Trừ Không Nhớ Trong Phạm Vi 1000', 'https://www.youtube.com/embed/VV_8RWXr5P0', 'Phép Cộng, Trừ Không Nhớ Trong Phạm Vi 1000', 18),
  ('L2-19', 'L2', 2, 'Làm Quen Với Thừa Số - Tích Trong Phép Nhân', 'https://www.youtube.com/embed/TcdHD4aAXZM', 'Làm Quen Với Thừa Số - Tích Trong Phép Nhân', 19),
  ('L2-20', 'L2', 2, 'Làm Quen Với Số Bị Chia - Số Chia - Thương', 'https://www.youtube.com/embed/aKKma5Pbe_o', 'Làm Quen Với Số Bị Chia - Số Chia - Thương', 20),
  ('L2-21', 'L2', 2, 'Khi Số 1 Trong Phép Nhân Và Phép Chia', 'https://www.youtube.com/embed/bMu4KVezAy8', 'Khi Số 1 Trong Phép Nhân Và Phép Chia', 21),
  ('L2-22', 'L2', 2, 'Làm Quen Với Đường Gấp Khúc - Độ Dài Đường Gấp Khúc', 'https://www.youtube.com/embed/stX8wTTHbhg', 'Làm Quen Với Đường Gấp Khúc - Độ Dài Đường Gấp Khúc', 22),
  ('L2-23', 'L2', 2, 'Học So Sánh Các Số Có Ba Chữ Số', 'https://www.youtube.com/embed/LmpZNBdynyM', 'Học So Sánh Các Số Có Ba Chữ Số', 23),
  ('L2-24', 'L2', 2, 'Khi Phép Cộng Có Tổng Bằng 100', 'https://www.youtube.com/embed/QpltsNVai3U', 'Khi Phép Cộng Có Tổng Bằng 100', 24),
  ('L2-25', 'L2', 2, 'Học Cách Tìm Một Thừa Số Của Phép Nhân', 'https://www.youtube.com/embed/Ky0QKfWGLIk', 'Học Cách Tìm Một Thừa Số Của Phép Nhân', 25),
  ('L2-26', 'L2', 2, 'Học Nhanh Bảng Chia 4 - Một Phần Tư', 'https://www.youtube.com/embed/F9h_I64L1qM', 'Học Nhanh Bảng Chia 4 - Một Phần Tư', 26),
  -- LỚP 3 KỲ 1
  ('L3-1', 'L3', 1, 'Số có 4 chữ số', 'https://www.youtube.com/embed/Ydqfpq0iisw?si=BzhPS_5QAANaEvmh', 'Làm quen với số có 4 chữ số', 1),
  ('L3-2', 'L3', 1, 'Hệ thống số la mã', 'https://www.youtube.com/embed/QW_SF3hO7rU?si=W5Xq1DSATJ-qpR5c', 'Làm Quen Với Hệ Thống Số La Mã', 2),
  ('L3-3', 'L3', 1, 'Số có 5 chữ số', 'https://www.youtube.com/embed/GOVlVSwXot0?si=yGjfxU5rk_pyQ2hX', 'Làm Quen Với Số Có 5 Chữ Số', 3),
  ('L3-4', 'L3', 1, 'Xem đồng hồ', 'https://www.youtube.com/embed/46qb_FhcsRE?si=PeKBqtmco8mJfaIT', 'Học cách xem đồng hồ', 4),
  ('L3-5', 'L3', 1, 'Đồng hồ và số la mã', 'https://www.youtube.com/embed/6VnQ8wXMyy0?si=1VAKSSYneNt7zMqi', 'Học về đồng hồ và số la mã', 5),
  ('L3-6', 'L3', 1, 'Tháng - năm', 'https://www.youtube.com/embed/7PfYgTsy3vk', 'Học Về Tháng - Năm', 6),
  ('L3-7', 'L3', 1, 'Bảng đơn vị đo độ dài', 'https://www.youtube.com/embed/aKcRhDuiJns', 'Làm Quen Với Bảng Đơn Vị Đo Độ Dài', 7)
ON CONFLICT (id) DO UPDATE SET
  lesson_id = EXCLUDED.lesson_id,
  semester = EXCLUDED.semester,
  title = EXCLUDED.title,
  video_url = EXCLUDED.video_url,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;
