-- =============================================
-- IMPORT DỮ LIỆU LESSONS (CÁC LỚP HỌC)
-- =============================================

INSERT INTO public.lessons (id, title, topic_count, quiz_count, description) VALUES
('L1', 'Toán Lớp 1', 31, 3, 'Học toán cơ bản cho lớp 1'),
('L2', 'Toán Lớp 2', 28, 5, 'Học toán cơ bản cho lớp 2'),
('L3', 'Toán Lớp 3', 12, 4, 'Học toán cơ bản cho lớp 3'),
('L4', 'Toán Lớp 4', 15, 6, 'Học toán cơ bản cho lớp 4'),
('L5', 'Toán Lớp 5', 20, 8, 'Học toán cơ bản cho lớp 5')
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  topic_count = EXCLUDED.topic_count,
  quiz_count = EXCLUDED.quiz_count,
  description = EXCLUDED.description;

-- =============================================
-- IMPORT DỮ LIỆU TOPICS - LỚP 1 HỌC KỲ 1
-- =============================================

INSERT INTO public.topics (id, lesson_id, semester, title, video_url, description, order_index, duration_minutes) VALUES
-- Lớp 1 - Học kỳ 1
('L1-1', 'L1', 1, 'Các số từ 1 đến 10', 'https://www.youtube.com/embed/EX8DR1YMlRE', 'Học đếm số cơ bản.', 1, 15),
('L1-2', 'L1', 1, 'Các số 4, 5', 'https://www.youtube.com/embed/tLoZ3HB3n7c', 'Tiếp tục làm quen với các số từ 4, 5', 2, 15),
('L1-3', 'L1', 1, 'Các số 6, 7, 8, 9', 'https://www.youtube.com/embed/6mEtEcxAOnQ', 'Khám phá các số từ 6 đến 9', 3, 15),
('L1-4', 'L1', 1, 'Số 10 và ôn tập', 'https://www.youtube.com/embed/lRXAnk0wiGI', 'Học số 10 và ôn tập tất cả các số đã học', 4, 15),
('L1-5', 'L1', 1, 'Số 0', 'https://www.youtube.com/embed/aMJgvwRAL_k', 'Học Làm quen với số 0', 5, 15),
('L1-6', 'L1', 1, 'So Sánh Các Dấu Cho Bé Mới Bắt Đầu', 'https://www.youtube.com/embed/nz5PWLtaokw', 'Cách dùng các dấu trong phép so sánh', 6, 15),
('L1-7', 'L1', 1, 'Học Cách So Sánh Nhiều Hơn, Ít Hơn, Bằng Nhau', 'https://www.youtube.com/embed/Z8P-pmHMxDU', 'Học cách nhận biết và so sánh số lượng', 7, 15),
('L1-8', 'L1', 1, 'Vẽ Đoạn Thẳng Có Độ Dài Cho Trước', 'https://www.youtube.com/embed/F3yktQ99TYw', 'Học cách kẻ vẽ đoạn thẳng có độ dài chính xác', 8, 15),
('L1-9', 'L1', 1, 'Học Cách Cộng Trong Phạm Vi 4, 5, 6', 'https://www.youtube.com/embed/Ei0_VugQejo', 'Làm quen với phép cộng trong phạm vi 4, 5 và 6', 9, 15),
('L1-10', 'L1', 1, 'Hiểu Nhanh Số 0 Trong Phép Cộng', 'https://www.youtube.com/embed/9zOo65_BiuQ', 'Ý nghĩa của số 0 trong phép cộng', 10, 15),
('L1-11', 'L1', 1, 'Học Cách Cộng Trong Phạm Vi 6, 7, 8', 'https://www.youtube.com/embed/Qq8r7-feu6s', 'Làm quen với phép cộng trong phạm vi 6, 7 và 8', 11, 15),
('L1-12', 'L1', 1, 'Học Cách Cộng Trong Phạm Vi 9, 10', 'https://www.youtube.com/embed/s-goxNdmJPE', 'Làm quen với phép cộng trong phạm vi 9 và 10', 12, 15),
('L1-13', 'L1', 1, 'Học Cách Cộng Các Số Tròn Chục', 'https://www.youtube.com/embed/yd5JHf4Blh0', 'Biết cách cộng các số tròn chục', 13, 15),
('L1-14', 'L1', 1, 'Học Cách Trừ Trong Phạm Vi 3, 4, 5', 'https://www.youtube.com/embed/55l906_zUyE', 'Làm quen với phép trừ trong phạm vi 3, 4 và 5', 14, 15),
('L1-15', 'L1', 1, 'Hiểu Nhanh Số 0 Trong Phép Trừ', 'https://www.youtube.com/embed/CyeG3y7lKeg', 'Ý nghĩa của số 0 trong phép trừ', 15, 15),
('L1-16', 'L1', 1, 'Phân Biệt Điểm Ở Trong Hay Ở Ngoài Một Hình', 'https://www.youtube.com/embed/-Cnwmbv69Aw', 'Nhận biết điểm nằm trong hoặc ngoài hình', 16, 15),
('L1-17', 'L1', 1, 'Nhận Biết Vị Trí: Trên – Dưới, Trái – Phải', 'https://www.youtube.com/embed/ZD5O7uPbWhw', 'Nhận biết các vị trí cơ bản', 17, 15),
('L1-18', 'L1', 1, 'So Sánh Nhiều Hơn, Ít Hơn, Bằng Nhau', 'https://www.youtube.com/embed/Z8P-pmHMxDU', 'Học cách so sánh số lượng', 18, 15),
('L1-19', 'L1', 1, 'Nhận Biết Vị Trí Cơ Bản', 'https://www.youtube.com/embed/ZD5O7uPbWhw', 'Nhận biết các vị trí cơ bản', 19, 15),

-- Lớp 1 - Học kỳ 2
('L1-20', 'L1', 2, 'Làm Quen Với Đồng Hồ Và Thời Gian', 'https://www.youtube.com/embed/mIPRUr0rrOc', 'Làm quen và nhận biết đồng hồ và thời gian', 20, 15),
('L1-21', 'L1', 2, 'Xăng-ti-mét (cm)', 'https://www.youtube.com/embed/RJFSVVGgiTw', 'Làm quen với đơn vị đo độ dài cm', 21, 15),
('L1-22', 'L1', 2, 'Nhận Biết Các Hình Học Cơ Bản', 'https://www.youtube.com/embed/W3UzjLDA6M4', 'Nhận biết hình vuông, tròn, tam giác, chữ nhật', 22, 15),
('L1-23', 'L1', 2, 'Khối Lập Phương – Khối Hộp Chữ Nhật', 'https://www.youtube.com/embed/udOvVRBYfxo', 'Nhận biết hình khối cơ bản', 23, 15),
('L1-24', 'L1', 2, 'Học Cách Đo Độ Dài Chính Xác', 'https://www.youtube.com/embed/_Z6BNEvcZHI', 'Hiểu khái niệm đo độ dài', 24, 15),
('L1-25', 'L1', 2, 'Làm Quen Với Các Số Từ 11 Đến 16', 'https://www.youtube.com/embed/xj6xmgfPTYA', 'Làm quen với các số từ 11 đến 16', 25, 15),
('L1-26', 'L1', 2, 'Làm Quen Với Các Số Từ 17 Đến 20', 'https://www.youtube.com/embed/cj_H-yURTkk', 'Làm quen với các số từ 17 đến 20', 26, 15),
('L1-27', 'L1', 2, 'Làm Quen Với Các Số Từ 21 Đến 40', 'https://www.youtube.com/embed/kbd23ca3BTs', 'Làm quen với các số từ 21 đến 40', 27, 15),
('L1-28', 'L1', 2, 'Làm Quen Với Các Số Từ 71 Đến 99', 'https://www.youtube.com/embed/vRSD68RnrHg', 'Làm quen với các số từ 71 đến 99', 28, 15),
('L1-29', 'L1', 2, 'Phép Trừ Dạng 27 - 4 Và 63 - 40', 'https://www.youtube.com/embed/_VJBjfIPXUw', 'Làm quen với phép trừ dạng 27 - 4 và 63 - 40', 29, 15),
('L1-30', 'L1', 2, 'Học Cách So Sánh Độ Dài', 'https://www.youtube.com/embed/dl-mzVa01N0', 'Quan sát và so sánh độ dài', 30, 15),
('L1-31', 'L1', 2, 'Làm Quen Với Các Số Từ 41 Đến 70', 'https://www.youtube.com/embed/WOcDMWIiBFY', 'Làm quen với các số từ 41 đến 70', 31, 15),

-- Lớp 2 - Học kỳ 1
('L2-1', 'L2', 1, 'Nhận Biết Đơn Vị Chục, Trăm, Nghìn', 'https://www.youtube.com/embed/GqOC3khhHYk', 'Nhận Biết Đơn Vị Chục, Trăm, Nghìn', 1, 15),
('L2-2', 'L2', 1, 'Học So Sánh Các Số Tròn Trăm', 'https://www.youtube.com/embed/w_9hbyNwbEw', 'Học So Sánh Các Số Tròn Trăm', 2, 15),
('L2-3', 'L2', 1, 'Làm Quen Với Các Số Từ 111 Đến 200', 'https://www.youtube.com/embed/lrc8idC9Itc', 'Làm Quen Với Các Số Từ 111 Đến 200', 3, 15),
('L2-4', 'L2', 1, 'Làm Quen Với Các Số Có Ba Chữ Số', 'https://www.youtube.com/embed/tklyRfsxrq8', 'Làm Quen Với Các Số Có Ba Chữ Số', 4, 15),
('L2-5', 'L2', 1, 'Học Cách Tìm Một Số Hạng Trong Một Tổng', 'https://www.youtube.com/embed/iq4s2yWVFYE', 'Học Cách Tìm Một Số Hạng Trong Một Tổng', 5, 15),
('L2-6', 'L2', 1, 'Phân Biệt Ngày, Giờ, Xem Đồng Hồ', 'https://www.youtube.com/embed/HPsUJQ4amsM', 'Phân Biệt Ngày, Giờ, Xem Đồng Hồ', 6, 15),
('L2-7', 'L2', 1, 'Phân Biệt Ngày, Tháng, Xem Lịch', 'https://www.youtube.com/embed/FfM5bGSUsJ4', 'Phân Biệt Ngày, Tháng, Xem Lịch', 7, 15),
('L2-8', 'L2', 1, 'Ki-Lo-Gam (Kg) Là Gì?', 'https://www.youtube.com/embed/P5TGyT263tg', 'Ki-Lo-Gam (Kg) Là Gì?', 8, 15),
('L2-9', 'L2', 1, 'Lít (L) Là Gì?', 'https://www.youtube.com/embed/sq6w6YTOy2g', 'Lít (L) Là Gì?', 9, 15),
('L2-10', 'L2', 1, 'Nhận Biết Tiền Việt Nam', 'https://www.youtube.com/embed/ysFv_hBPiM8', 'Nhận Biết Tiền Việt Nam', 10, 15),
('L2-11', 'L2', 1, 'Học Cách Giải Bài Toán Về Nhiều Hơn', 'https://www.youtube.com/embed/CTBmx61GEU8', 'Học Cách Giải Bài Toán Về Nhiều Hơn', 11, 15),
('L2-12', 'L2', 1, 'Học Cách Giải Các Bài Toán Về Tuổi', 'https://www.youtube.com/embed/Xem-B2yn_f0', 'Học Cách Giải Các Bài Toán Về Tuổi', 12, 15),
('L2-13', 'L2', 1, 'Làm Quen Với Số Hạng – Tổng Trong Phép Cộng', 'https://www.youtube.com/embed/5Szi-0_PRC8', 'Làm Quen Với Số Hạng – Tổng Trong Phép Cộng', 13, 15),
('L2-14', 'L2', 1, 'Làm Quen Với Số Bị Trừ – Số Trừ – Hiệu', 'https://www.youtube.com/embed/3WVHjJfKivs', 'Làm Quen Với Số Bị Trừ – Số Trừ – Hiệu', 14, 15),

-- Lớp 2 - Học kỳ 2
('L2-15', 'L2', 2, 'Khi Số Có Tận Cùng Là 1 Trừ Đi Một Số', 'https://www.youtube.com/embed/7oMjY5lXYRo', 'Khi Số Có Tận Cùng Là 1 Trừ Đi Một Số', 15, 15),
('L2-16', 'L2', 2, 'Khi Số Có Tận Cùng Là 2 Trừ Đi Một Số', 'https://www.youtube.com/embed/G2S8vsjxFnw', 'Khi Số Có Tận Cùng Là 2 Trừ Đi Một Số', 16, 15),
('L2-17', 'L2', 2, 'Làm Quen Với Kết Hợp Phép Tính', 'https://www.youtube.com/embed/YtBWfbUzGO4', 'Làm Quen Với Kết Hợp Phép Tính', 17, 15),
('L2-18', 'L2', 2, 'Phép Cộng, Trừ Không Nhớ Trong Phạm Vi 1000', 'https://www.youtube.com/embed/VV_8RWXr5P0', 'Phép Cộng, Trừ Không Nhớ Trong Phạm Vi 1000', 18, 15),
('L2-19', 'L2', 2, 'Làm Quen Với Thừa Số - Tích Trong Phép Nhân', 'https://www.youtube.com/embed/TcdHD4aAXZM', 'Làm Quen Với Thừa Số - Tích Trong Phép Nhân', 19, 15),
('L2-20', 'L2', 2, 'Làm Quen Với Số Bị Chia - Số Chia - Thương', 'https://www.youtube.com/embed/aKKma5Pbe_o', 'Làm Quen Với Số Bị Chia - Số Chia - Thương', 20, 15),
('L2-21', 'L2', 2, 'Khi Số 1 Trong Phép Nhân Và Phép Chia', 'https://www.youtube.com/embed/bMu4KVezAy8', 'Khi Số 1 Trong Phép Nhân Và Phép Chia', 21, 15),
('L2-22', 'L2', 2, 'Khi Số 0 Trong Phép Nhân Và Phép Chia', 'https://www.youtube.com/embed/TqNRMdGCcyo', 'Khi Số 0 Trong Phép Nhân Và Phép Chia', 22, 15),
('L2-23', 'L2', 2, 'Bảng Nhân 2, 3, 4, 5', 'https://www.youtube.com/embed/8FS-9nXaUf8', 'Bảng Nhân 2, 3, 4, 5', 23, 15),
('L2-24', 'L2', 2, 'Bảng Chia 2, 3, 4, 5', 'https://www.youtube.com/embed/z1J2kF0yJyI', 'Bảng Chia 2, 3, 4, 5', 24, 15),
('L2-25', 'L2', 2, 'Đường Thẳng, Đường Cong', 'https://www.youtube.com/embed/j4qJAF7GmI4', 'Đường Thẳng, Đường Cong', 25, 15),
('L2-26', 'L2', 2, 'Chu Vi Hình Tam Giác, Tứ Giác', 'https://www.youtube.com/embed/qM3hEH_DhNo', 'Chu Vi Hình Tam Giác, Tứ Giác', 26, 15),
('L2-27', 'L2', 2, 'Mét (m) Là Gì?', 'https://www.youtube.com/embed/8wMJuWJ8gSc', 'Mét (m) Là Gì?', 27, 15),
('L2-28', 'L2', 2, 'Ki-lô-mét (km) Là Gì?', 'https://www.youtube.com/embed/3d6B8tP2xYg', 'Ki-lô-mét (km) Là Gì?', 28, 15)

ON CONFLICT (id) DO UPDATE SET 
  lesson_id = EXCLUDED.lesson_id,
  semester = EXCLUDED.semester,
  title = EXCLUDED.title,
  video_url = EXCLUDED.video_url,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  duration_minutes = EXCLUDED.duration_minutes;