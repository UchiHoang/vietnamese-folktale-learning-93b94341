import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PlayCircle, BookOpen, CheckCircle, Search, FileText, Loader2, Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { VideoPlayer } from "@/components/lesson/VideoPlayer";
import { LessonProgressBadge } from "@/components/lesson/LessonProgressBadge";
import { NotesTab } from "@/components/lesson/NotesTab";
import { CommentsTab } from "@/components/lesson/CommentsTab";
import { useIsMobile } from "@/hooks/use-mobile";

/* ==================================================================================
   KHU VỰC ĐỊNH NGHĨA KIỂU DỮ LIỆU
   ================================================================================== */
interface Lesson {
  id: string;
  title: string;
  topicCount: number;
  quizCount: number;
  completed?: boolean;
}

interface Topic {
  id: string;
  lessonId: string;
  semester: 1 | 2;
  title: string;
  videoUrl: string;
  description: string;
  completed?: boolean;
}

/* ==================================================================================
   KHU VỰC DỮ LIỆU (CÁC BẠN SỬA Ở ĐÂY)
   ================================================================================== */

// 1. DANH SÁCH LỚP HỌC (LESSONS)
const lessonsData: Lesson[] = [
  { id: "L1", title: "Toán Lớp 1", topicCount: 5, quizCount: 3 },
  { id: "L2", title: "Toán Lớp 2", topicCount: 10, quizCount: 5 },
  { id: "L3", title: "Toán Lớp 3", topicCount: 12, quizCount: 4 },
  { id: "L4", title: "Toán Lớp 4", topicCount: 15, quizCount: 6 },
  { id: "L5", title: "Toán Lớp 5", topicCount: 20, quizCount: 8 },
];

// 2. DANH SÁCH BÀI GIẢNG / VIDEO (TOPICS)
const topicsData: Topic[] = [
  /* --- LỚP 1 --- */
  {
    id: "L1-1",
    lessonId: "L1",
    semester: 1,
    title: "Các số từ 1 đến 10",
    videoUrl: "https://www.youtube.com/embed/EX8DR1YMlRE",
    description: "Học đếm số cơ bản.",
    completed: true,
  },
  {
    id: "L1-2",
    lessonId: "L1",
    semester: 1,
    title: "Các số 4, 5",
    videoUrl: "https://www.youtube.com/embed/tLoZ3HB3n7c",
    description: "Tiếp tục làm quen với các số từ 4, 5",
  },
  {
    id: "L1-3",
    lessonId: "L1",
    semester: 1,
    title: "Các số 6, 7, 8, 9",
    videoUrl: "https://www.youtube.com/embed/6mEtEcxAOnQ",
    description: "Khám phá các số từ 6 đến 9",
  },
  {
    id: "L1-4",
    lessonId: "L1",
    semester: 1,
    title: "Số 10 và ôn tập",
    videoUrl: "https://www.youtube.com/embed/lRXAnk0wiGI",
    description: "Học số 10 và ôn tập tất cả các số đã học",
    completed: false,
  },
  {
    id: "L1-5",
    lessonId: "L1",
    semester: 1,
    title: "Số 0",
    videoUrl: "https://www.youtube.com/embed/aMJgvwRAL_k",
    description: "Học Làm quen với số 0",
    completed: false,
  },
  {
    id: "L1-6",
    lessonId: "L1",
    semester: 1,
    title: "So Sánh Các Dấu Cho Bé Mới Bắt Đầu",
    videoUrl: "https://www.youtube.com/embed/nz5PWLtaokw",
    description: "Cách dùng các dấu trong phép so sánh",
    completed: false,
  },
  {
    id: "L1-7",
    lessonId: "L1",
    semester: 1,
    title: "Học Cách So Sánh Nhiều Hơn, Ít Hơn, Bằng Nhau",
    videoUrl: "https://www.youtube.com/embed/Z8P-pmHMxDU",
    description: "Học cách nhận biết và so sánh số lượng: nhiều – ít – bằng nhau",
    completed: false,
  },
  {
    id: "L1-8",
    lessonId: "L1",
    semester: 1,
    title: "Vẽ Đoạn Thẳng Có Độ Dài Cho Trước Như Thế Nào?",
    videoUrl: "https://www.youtube.com/embed/F3yktQ99TYw",
    description: "Học cách kẻ vẽ đoạn thẳng có độ dài chính xác.",
    completed: false,
  },
  {
    id: "L1-9",
    lessonId: "L1",
    semester: 1,
    title: "Học Cách Cộng Trong Phạm Vi 4, 5, 6 Đơn Giản",
    videoUrl: "https://www.youtube.com/embed/Ei0_VugQejo",
    description: "Làm quen với phép cộng trong phạm vi 4, 5 và 6",
    completed: false,
  },
  {
    id: "L1-10",
    lessonId: "L1",
    semester: 1,
    title: "Hiểu Nhanh Số 0 Trong Phép Cộng",
    videoUrl: "https://www.youtube.com/embed/9zOo65_BiuQ",
    description: "tìm hiểu Ý nghĩa của số 0 trong phép cộng",
    completed: false,
  },
  {
    id: "L1-11",
    lessonId: "L1",
    semester: 1,
    title: "Học Cách Cộng Trong Phạm Vi 6, 7, 8 Đơn Giản",
    videoUrl: "https://www.youtube.com/embed/Qq8r7-feu6s",
    description: "Làm quen với phép cộng trong phạm vi 6, 7 và 8",
    completed: false,
  },
  {
    id: "L1-12",
    lessonId: "L1",
    semester: 1,
    title: "Học Cách Cộng Trong Phạm Vi 9, 10 Đơn Giản",
    videoUrl: "https://www.youtube.com/embed/s-goxNdmJPE",
    description: "Làm quen với phép cộng trong phạm vi 9 và 10",
    completed: false,
  },
  {
    id: "L1-13",
    lessonId: "L1",
    semester: 1,
    title: "Học Cách Cộng Các Số Tròn Chục",
    videoUrl: "https://www.youtube.com/embed/yd5JHf4Blh0",
    description: "Biết cách cộng các số tròn chục.",
    completed: false,
  },
  {
    id: "L1-14",
    lessonId: "L1",
    semester: 1,
    title: "Học Cách Trừ Trong Phạm Vi 3, 4, 5 Đơn Giản",
    videoUrl: "https://www.youtube.com/embed/55l906_zUyE",
    description: "Làm quen với phép trừ trong phạm vi 3, 4 và 5",
    completed: false,
  },
  {
    id: "L1-15",
    lessonId: "L1",
    semester: 1,
    title: "Hiểu Nhanh Số 0 Trong Phép Trừ",
    videoUrl: "https://www.youtube.com/embed/CyeG3y7lKeg",
    description: "tìm hiểu Ý nghĩa của số 0 trong phép trừ",
    completed: false,
  },
  {
    id: "L1-16",
    lessonId: "L1",
    semester: 1,
    title: "Phân Biệt Điểm Ở Trong Hay Ở Ngoài Một Hình",
    videoUrl: "https://www.youtube.com/embed/-Cnwmbv69Aw",
    description: " Nhận biết điểm nằm trong hoặc ngoài một hình phẳng",
    completed: false,
  },
  {
    id: "L1-17",
    lessonId: "L1",
    semester: 1,
    title: "Nhận Biết Vị Trí: Trên – Dưới, Trái – Phải, Trước – Sau, Ở Giữa",
    videoUrl: "https://www.youtube.com/embed/ZD5O7uPbWhw",
    description: "Nhận biết các vị trí cơ bản.",
    completed: false,
  },
  {
    id: "L1-18",
    lessonId: "L1",
    semester: 1,
    title: "Học Cách So Sánh Nhiều Hơn, Ít Hơn, Bằng Nhau",
    videoUrl: "https://www.youtube.com/embed/Z8P-pmHMxDU",
    description: "Học cách nhận biết và so sánh số lượng: nhiều – ít – bằng nhau. ",
    completed: false,
  },
  {
    id: "L1-19",
    lessonId: "L1",
    semester: 1,
    title: "Nhận Biết Vị Trí: Trên – Dưới, Trái – Phải, Trước – Sau, Ở Giữa",
    videoUrl: "https://www.youtube.com/embed/ZD5O7uPbWhw",
    description: "Nhận biết các vị trí cơ bản.",
    completed: false,
  },
  /** Lớp 1 - kỳ 2 */
  {
    id: "L1-20",
    lessonId: "L1",
    semester: 2,
    title: "Làm Quen Với Đồng Hồ Và Thời Gian",
    videoUrl: "https://www.youtube.com/embed/mIPRUr0rrOc",
    description: "Làm quen và nhận biết đồng hồ và thời gian.",
    completed: false,
  },
  {
    id: "L1-21",
    lessonId: "L1",
    semester: 2,
    title: "Xăng-ti-mét (cm)",
    videoUrl: "https://www.youtube.com/embed/RJFSVVGgiTw",
    description: "Làm quen với đơn vị đo độ dài Xăng-ti-mét (cm)",
    completed: false,
  },
  {
    id: "L1-22",
    lessonId: "L1",
    semester: 2,
    title: "Nhận Biết Các Hình Học Cơ Bản: Vuông, Tròn, Tam Giác, Chữ Nhật",
    videoUrl: "https://www.youtube.com/embed/W3UzjLDA6M4",
    description: "Nhận biết các hình học cơ bản",
    completed: false,
  },
  {
    id: "L1-23",
    lessonId: "L1",
    semester: 2,
    title: "Khối Lập Phương – Khối Hộp Chữ Nhật Là Gì?",
    videoUrl: "https://www.youtube.com/embed/udOvVRBYfxo",
    description: "Nhận biết hình khối cơ bản.",
    completed: false,
  },
  {
    id: "L1-24",
    lessonId: "L1",
    semester: 2,
    title: "Học Cách Đo Độ Dài Chính Xác",
    videoUrl: "https://www.youtube.com/embed/_Z6BNEvcZHI",
    description: "Hiểu khái niệm đo độ dài là gì.",
    completed: false,
  },
  {
    id: "L1-25",
    lessonId: "L1",
    semester: 2,
    title: " Làm Quen Với Các Số Từ 11 Đến 16 Dễ Hiểu",
    videoUrl: "https://www.youtube.com/embed/xj6xmgfPTYA",
    description: "Làm quen với các số từ 11 đến 16",
    completed: false,
  },
  {
    id: "L1-26",
    lessonId: "L1",
    semester: 2,
    title: "Làm Quen Với Các Số Từ 17 Đến 20 Dễ Hiểu",
    videoUrl: "https://www.youtube.com/embed/cj_H-yURTkk",
    description: " Làm quen với các số từ 17 đến 20.",
    completed: false,
  },
  {
    id: "L1-27",
    lessonId: "L1",
    semester: 2,
    title: "Làm Quen Với Các Số Từ 21 Đến 40",
    videoUrl: "https://www.youtube.com/embed/kbd23ca3BTs",
    description: "Làm quen với các số từ 21 đến 40.",
    completed: false,
  },
  {
    id: "L1-28",
    lessonId: "L1",
    semester: 2,
    title: "Làm Quen Với Các Số Từ 71 Đến 99",
    videoUrl: "https://www.youtube.com/embed/vRSD68RnrHg",
    description: "Làm quen với các số từ 71 đến 99.",
    completed: false,
  },
  {
    id: "L1-29",
    lessonId: "L1",
    semester: 2,
    title: "Phép Trừ Dạng 27 - 4 Và 63 - 40 Dễ Hiểu Dễ Nhớ",
    videoUrl: "https://www.youtube.com/embed/_VJBjfIPXUw",
    description: "Làm quen với phép trừ dạng 27 - 4 và 63 - 40",
    completed: false,
  },
  {
    id: "L1-30",
    lessonId: "L1",
    semester: 2,
    title: "Học Cách So Sánh Độ Dài: Dài Hơn Hay Ngắn Hơn?",
    videoUrl: "https://www.youtube.com/embed/dl-mzVa01N0",
    description: "Quan sát và so sánh độ dài",
    completed: false,
  },
  {
    id: "L1-31",
    lessonId: "L1",
    semester: 2,
    title: "Làm Quen Với Các Số Từ 41 Đến 70",
    videoUrl: "https://www.youtube.com/embed/WOcDMWIiBFY",
    description: "Làm quen với các số từ 41 đến 70",
    completed: false,
  },
  /* --- LỚP 2 --- */
  /* --- LỚP 2 - HỌC KÌ 1 --- */
  {
    id: "L2-1",
    lessonId: "L2",
    semester: 1,
    title: "Nhận Biết Đơn Vị Chục, Trăm, Nghìn",
    videoUrl: "https://www.youtube.com/embed/GqOC3khhHYk",
    description: "Nhận Biết Đơn Vị Chục, Trăm, Nghìn",
  },
  {
    id: "L2-2",
    lessonId: "L2",
    semester: 1,
    title: "Học So Sánh Các Số Tròn Trăm",
    videoUrl: "https://www.youtube.com/embed/w_9hbyNwbEw",
    description: "Học So Sánh Các Số Tròn Trăm",
  },
  {
    id: "L2-3",
    lessonId: "L2",
    semester: 1,
    title: "Làm Quen Với Các Số Từ 111 Đến 200",
    videoUrl: "https://www.youtube.com/embed/lrc8idC9Itc",
    description: "Làm Quen Với Các Số Từ 111 Đến 200",
  },
  {
    id: "L2-4",
    lessonId: "L2",
    semester: 1,
    title: "Làm Quen Với Các Số Có Ba Chữ Số",
    videoUrl: "https://www.youtube.com/embed/tklyRfsxrq8",
    description: "Làm Quen Với Các Số Có Ba Chữ Số",
  },
  {
    id: "L2-5",
    lessonId: "L2",
    semester: 1,
    title: "Học Cách Tìm Một Số Hạng Trong Một Tổng",
    videoUrl: "https://www.youtube.com/embed/iq4s2yWVFYE",
    description: "Học Cách Tìm Một Số Hạng Trong Một Tổng",
  },
  {
    id: "L2-6",
    lessonId: "L2",
    semester: 1,
    title: "Phân Biệt Ngày, Giờ, Xem Đồng Hồ",
    videoUrl: "https://www.youtube.com/embed/HPsUJQ4amsM",
    description: "Phân Biệt Ngày, Giờ, Xem Đồng Hồ",
  },
  {
    id: "L2-7",
    lessonId: "L2",
    semester: 1,
    title: "Phân Biệt Ngày, Tháng, Xem Lịch",
    videoUrl: "https://www.youtube.com/embed/FfM5bGSUsJ4",
    description: "Phân Biệt Ngày, Tháng, Xem Lịch",
  },
  {
    id: "L2-8",
    lessonId: "L2",
    semester: 1,
    title: "Ki-Lo-Gam (Kg) Là Gì?",
    videoUrl: "https://www.youtube.com/embed/P5TGyT263tg",
    description: "Ki-Lo-Gam (Kg) Là Gì?",
  },
  {
    id: "L2-9",
    lessonId: "L2",
    semester: 1,
    title: "Lít (L) Là Gì?",
    videoUrl: "https://www.youtube.com/embed/sq6w6YTOy2g",
    description: "Lít (L) Là Gì?",
  },
  {
    id: "L2-10",
    lessonId: "L2",
    semester: 1,
    title: "Nhận Biết Tiền Việt Nam",
    videoUrl: "https://www.youtube.com/embed/ysFv_hBPiM8",
    description: "Nhận Biết Tiền Việt Nam",
  },
  {
    id: "L2-11",
    lessonId: "L2",
    semester: 1,
    title: "Học Cách Giải Bài Toán Về Nhiều Hơn",
    videoUrl: "https://www.youtube.com/embed/CTBmx61GEU8",
    description: "Học Cách Giải Bài Toán Về Nhiều Hơn",
  },
  {
    id: "L2-12",
    lessonId: "L2",
    semester: 1,
    title: "Học Cách Giải Các Bài Toán Về Tuổi",
    videoUrl: "https://www.youtube.com/embed/Xem-B2yn_f0",
    description: "Học Cách Giải Các Bài Toán Về Tuổi",
  },
  {
    id: "L2-13",
    lessonId: "L2",
    semester: 1,
    title: "Làm Quen Với Số Hạng – Tổng Trong Phép Cộng",
    videoUrl: "https://www.youtube.com/embed/5Szi-0_PRC8",
    description: "Làm Quen Với Số Hạng – Tổng Trong Phép Cộng",
  },
  {
    id: "L2-14",
    lessonId: "L2",
    semester: 1,
    title: "Làm Quen Với Số Bị Trừ – Số Trừ – Hiệu",
    videoUrl: "https://www.youtube.com/embed/3WVHjJfKivs",
    description: "Làm Quen Với Số Bị Trừ – Số Trừ – Hiệu",
  },
  /* --- LỚP 2 - HỌC KÌ 2 --- */
  {
    id: "L2-15",
    lessonId: "L2",
    semester: 2,
    title: "Khi Số Có Tận Cùng Là 1 Trừ Đi Một Số",
    videoUrl: "https://www.youtube.com/embed/7oMjY5lXYRo",
    description: "Khi Số Có Tận Cùng Là 1 Trừ Đi Một Số",
  },
  {
    id: "L2-16",
    lessonId: "L2",
    semester: 2,
    title: "Khi Số Có Tận Cùng Là 2 Trừ Đi Một Số",
    videoUrl: "https://www.youtube.com/embed/G2S8vsjxFnw",
    description: "Khi Số Có Tận Cùng Là 2 Trừ Đi Một Số",
  },
  {
    id: "L2-17",
    lessonId: "L2",
    semester: 2,
    title: "Làm Quen Với Kết Hợp Phép Tính",
    videoUrl: "https://www.youtube.com/embed/YtBWfbUzGO4",
    description: "Làm Quen Với Kết Hợp Phép Tính",
  },
  {
    id: "L2-18",
    lessonId: "L2",
    semester: 2,
    title: "Phép Cộng, Trừ Không Nhớ Trong Phạm Vi 1000",
    videoUrl: "https://www.youtube.com/embed/VV_8RWXr5P0",
    description: "Phép Cộng, Trừ Không Nhớ Trong Phạm Vi 1000",
  },
  {
    id: "L2-19",
    lessonId: "L2",
    semester: 2,
    title: "Làm Quen Với Thừa Số - Tích Trong Phép Nhân",
    videoUrl: "https://www.youtube.com/embed/TcdHD4aAXZM",
    description: "Làm Quen Với Thừa Số - Tích Trong Phép Nhân",
  },
  {
    id: "L2-20",
    lessonId: "L2",
    semester: 2,
    title: "Làm Quen Với Số Bị Chia - Số Chia - Thương",
    videoUrl: "https://www.youtube.com/embed/aKKma5Pbe_o",
    description: "Làm Quen Với Số Bị Chia - Số Chia - Thương",
  },
  {
    id: "L2-21",
    lessonId: "L2",
    semester: 2,
    title: "Khi Số 1 Trong Phép Nhân Và Phép Chia",
    videoUrl: "https://www.youtube.com/embed/bMu4KVezAy8",
    description: "Khi Số 1 Trong Phép Nhân Và Phép Chia",
  },
  {
    id: "L2-22",
    lessonId: "L2",
    semester: 2,
    title: "Làm Quen Với Đường Gấp Khúc - Độ Dài Đường Gấp Khúc",
    videoUrl: "https://www.youtube.com/embed/stX8wTTHbhg",
    description: "Làm Quen Với Đường Gấp Khúc - Độ Dài Đường Gấp Khúc",
  },
  {
    id: "L2-23",
    lessonId: "L2",
    semester: 2,
    title: "Học So Sánh Các Số Có Ba Chữ Số",
    videoUrl: "https://www.youtube.com/embed/LmpZNBdynyM",
    description: "Học So Sánh Các Số Có Ba Chữ Số",
  },
  {
    id: "L2-24",
    lessonId: "L2",
    semester: 2,
    title: "Khi Phép Cộng Có Tổng Bằng 100",
    videoUrl: "https://www.youtube.com/embed/QpltsNVai3U",
    description: "Khi Phép Cộng Có Tổng Bằng 100",
  },
  {
    id: "L2-25",
    lessonId: "L2",
    semester: 2,
    title: "Học Cách Tìm Một Thừa Số Của Phép Nhân",
    videoUrl: "https://www.youtube.com/embed/Ky0QKfWGLIk",
    description: "Học Cách Tìm Một Thừa Số Của Phép Nhân",
  },
  {
    id: "L2-26",
    lessonId: "L2",
    semester: 2,
    title: "Học Nhanh Bảng Chia 4 - Một Phần Tư",
    videoUrl: "https://www.youtube.com/embed/F9h_I64L1qM",
    description: "Học Nhanh Bảng Chia 4 - Một Phần Tư",
  },
  /* --- LỚP 3 --- */
  /* --- LỚP 3 - HỌC KÌ 1 --- */
  {
    id: "L3-1",
    lessonId: "L3",
    semester: 1,
    title: "Số có 4 chữ số",
    videoUrl: "https://www.youtube.com/embed/Ydqfpq0iisw?si=BzhPS_5QAANaEvmh",
    description: "Làm quen với số có 4 chữ số",
    completed: true,
  },
  {
    id: "L3-2",
    lessonId: "L3",
    semester: 1,
    title: "Hệ thống số la mã",
    videoUrl: "https://www.youtube.com/embed/QW_SF3hO7rU?si=W5Xq1DSATJ-qpR5c",
    description: " Làm Quen Với Hệ Thống Số La Mã",
  },
  {
    id: "L3-3",
    lessonId: "L3",
    semester: 1,
    title: "Số có 5 chữ số",
    videoUrl: "https://www.youtube.com/embed/GOVlVSwXot0?si=yGjfxU5rk_pyQ2hX",
    description: "Làm Quen Với Số Có 5 Chữ Số",
  },
  {
    id: "L3-4",
    lessonId: "L3",
    semester: 1,
    title: "Xem đồng hồ",
    videoUrl: "https://www.youtube.com/embed/46qb_FhcsRE?si=PeKBqtmco8mJfaIT",
    description: "Học cách xem đồng hồ",
    completed: false,
  },
  {
    id: "L3-5",
    lessonId: "L3",
    semester: 1,
    title: "Đồng hồ và số la mã",
    videoUrl: "https://www.youtube.com/embed/6VnQ8wXMyy0?si=1VAKSSYneNt7zMqi",
    description: "Học về đồng hồ và số la mã",
    completed: false,
  },
  {
    id: "L3-6",
    lessonId: "L3",
    semester: 1,
    title: "Tháng - năm",
    videoUrl: "https://www.youtube.com/embed/7PfYgTsy3vk",
    description: "Học Về Tháng - Năm",
    completed: false,
  },
  {
    id: "L3-7",
    lessonId: "L3",
    semester: 1,
    title: "Bảng đơn vị đo độ dài",
    videoUrl: "https://www.youtube.com/embed/aKcRhDuiJns",
    description: "Làm Quen Với Bảng Đơn Vị Đo Độ Dài",
    completed: false,
  },
  {
    id: "L3-8",
    lessonId: "L3",
    semester: 1,
    title: "GAM(G)",
    videoUrl: "https://www.youtube.com/embed/DX0zXC5TKnA",
    description: "Gam (G) Là Gì",
    completed: false,
  },
  {
    id: "L3-9",
    lessonId: "L3",
    semester: 1,
    title: "Bài Toán Về Độ Dài",
    videoUrl: "https://www.youtube.com/embed/PmhBGSO1VvU",
    description: "Bài Toán Về Độ Dài",
    completed: false,
  },
  {
    id: "L3-10",
    lessonId: "L3",
    semester: 1,
    title: "Xăng-ti-mét Vuông (Cm²)",
    videoUrl: "https://www.youtube.com/embed/_X0BSP8TBA4",
    description: "Xăng-ti-mét Vuông (Cm²) Là Gì?",
    completed: false,
  },
  {
    id: "L3-11",
    lessonId: "L3",
    semester: 1,
    title: "Tiền Việt Nam",
    videoUrl: "https://www.youtube.com/embed/oUzl55VNQM0",
    description: "Học về tiền Việt Nam",
    completed: false,
  },
  {
    id: "L3-12",
    lessonId: "L3",
    semester: 1,
    title: "Thống Kê Số Liệu",
    videoUrl: "https://www.youtube.com/embed/evdksCTk-Ag",
    description: "Làm Quen Với Thống Kê Số Liệu",
    completed: false,
  },
  {
    id: "L3-13",
    lessonId: "L3",
    semester: 1,
    title: "Nhân - Chia 6 ( Phần 1 )",
    videoUrl: "https://www.youtube.com/embed/ydQxUjdtZDM",
    description: "Học Nhanh Bảng Nhân - Chia 6",
    completed: false,
  },
  {
    id: "L3-14",
    lessonId: "L3",
    semester: 1,
    title: "Nhân - Chia 6 ( Phần 2 )",
    videoUrl: "https://www.youtube.com/embed/0-0_NyDc2kM",
    description: "Học Nhanh Bảng Nhân - Chia 6",
    completed: false,
  },
  {
    id: "L3-15",
    lessonId: "L3",
    semester: 1,
    title: "Nhân - Chia 7",
    videoUrl: "https://www.youtube.com/embed/0-0_NyDc2kM",
    description: "Học Nhanh Bảng Nhân - Chia 7",
    completed: false,
  },
  {
    id: "L3-16",
    lessonId: "L3",
    semester: 1,
    title: "Nhân - Chia 8",
    videoUrl: "https://www.youtube.com/embed/GJ-tlux3DEk",
    description: "Học Nhanh Bảng Nhân - Chia 8",
    completed: false,
  },
  {
    id: "L3-17",
    lessonId: "L3",
    semester: 1,
    title: "Nhân Số Có 2 Chữ Số Với Số Có 1 Chữ Số",
    videoUrl: "https://www.youtube.com/embed/GJ-tlux3DEk",
    description: "Học Nhân Số Có 2 Chữ Số Với Số Có 1 Chữ Số",
    completed: false,
  },
  {
    id: "L3-18",
    lessonId: "L3",
    semester: 1,
    title: "Nhân Số Có 3 Chữ Số Với Số Có 1 Chữ Số",
    videoUrl: "https://www.youtube.com/embed/uP9PEhu99Q4",
    description: "Học Nhân Số Có 3 Chữ Số Với Số Có 1 Chữ Số",
    completed: false,
  },
  {
    id: "L3-19",
    lessonId: "L3",
    semester: 1,
    title: "Chia Số Có 2 Chữ Số Cho Số Có 1 Chữ Số",
    videoUrl: "https://www.youtube.com/embed/0-0_NyDc2kM",
    description: "Học Chia Số Có 2 Chữ Số Cho Số Có 1 Chữ Số",
    completed: false,
  },
  {
    id: "L3-20",
    lessonId: "L3",
    semester: 1,
    title: "Dãy số",
    videoUrl: "https://www.youtube.com/embed/FCCfoClQ1CA",
    description: " Học Nhanh Về Dãy Số",
    completed: false,
  },

  /* --- LỚP 3 - HỌC KÌ 2 --- */
  {
    id: "L3-21",
    lessonId: "L3",
    semester: 2,
    title: "Các Phép Toán Được Định Nghĩa Qua Ký Hiệu",
    videoUrl: "https://www.youtube.com/embed/XQZl7jqJ6Xk",
    description: "Làm Quen Với Các Phép Toán Được Định Nghĩa Qua Ký Hiệu",
    completed: false,
  },
  {
    id: "L3-22",
    lessonId: "L3",
    semester: 2,
    title: "Tìm Một Trong Các Phần Bằng Nhau Của Một Số",
    videoUrl: "https://www.youtube.com/embed/wFj0e1tqIlQ",
    description: " Học Tìm Một Trong Các Phần Bằng Nhau Của Một Số ",
    completed: false,
  },
  {
    id: "L3-23",
    lessonId: "L3",
    semester: 2,
    title: "Gấp Một Số Lên Nhiều Lần ",
    videoUrl: "https://www.youtube.com/embed/Bft1I3R0nlg",
    description: "Học Về Gấp Một Số Lên Nhiều Lần ",
    completed: false,
  },
  {
    id: "L3-24",
    lessonId: "L3",
    semester: 2,
    title: "Giảm Đi Một Số Lần",
    videoUrl: "https://www.youtube.com/embed/IW2l8gYADMA",
    description: " Học Về Giảm Đi Một Số Lần",
    completed: false,
  },
  {
    id: "L3-25",
    lessonId: "L3",
    semester: 2,
    title: "So Sánh Số Lớn Gấp Mấy Lần Số Bé",
    videoUrl: "https://www.youtube.com/embed/u0i2sZXEjqo",
    description: "Học Cách So Sánh Số Lớn Gấp Mấy Lần Số Bé",
    completed: false,
  },
  {
    id: "L3-26",
    lessonId: "L3",
    semester: 2,
    title: "So Sánh Số Bé Bằng Một Phần Mấy Số Lớn",
    videoUrl: "https://www.youtube.com/embed/poaRzIUZhhI",
    description: "Học Cách So Sánh Số Bé Bằng Một Phần Mấy Số Lớn",
    completed: false,
  },
  {
    id: "L3-27",
    lessonId: "L3",
    semester: 2,
    title: "Các Bài Toán Đếm Hình, Cắt Ghép Hình",
    videoUrl: "https://www.youtube.com/embed/9WNEJgPUAxU",
    description: "Học Về Các Bài Toán Đếm Hình, Cắt Ghép Hình",
    completed: false,
  },
  {
    id: "L3-28",
    lessonId: "L3",
    semester: 2,
    title: "Điểm Ở Giữa, Trung Điểm Của Đoạn Thẳng",
    videoUrl: "https://www.youtube.com/embed/LKtfGiPykH8",
    description: "Học Về Điểm Ở Giữa, Trung Điểm Của Đoạn Thẳng",
    completed: false,
  },
  {
    id: "L3-29",
    lessonId: "L3",
    semester: 2,
    title: "Hình Chữ Nhật Và Các Yếu Tố Trong Hình Chữ Nhật",
    videoUrl: "https://www.youtube.com/embed/X-YE7UZFdSU",
    description: "Nhận Biết Hình Chữ Nhật Và Các Yếu Tố Trong Hình Chữ Nhật",
    completed: false,
  },
  {
    id: "L3-30",
    lessonId: "L3",
    semester: 2,
    title: "Chu Vi - Diện Tích Hình Chữ Nhật",
    videoUrl: "https://www.youtube.com/embed/PFeQZZIAqv8",
    description: " Làm Quen Với Chu Vi - Diện Tích Hình Chữ Nhật",
    completed: false,
  },
  {
    id: "L3-31",
    lessonId: "L3",
    semester: 2,
    title: "Chu Vi - Diện Tích Hình Vuông",
    videoUrl: "https://www.youtube.com/embed/zoewMBqRJ30",
    description: "Làm Quen Với Chu Vi - Diện Tích Hình Vuông",
    completed: false,
  },
  {
    id: "L3-32",
    lessonId: "L3",
    semester: 2,
    title: "Hình Tròn Và Các Yếu Tố Của Hình Tròn",
    videoUrl: "https://www.youtube.com/embed/huPEJRlzmBo",
    description: "Nhận Biết Hình Tròn Và Các Yếu Tố Của Hình Tròn",
    completed: false,
  },
  {
    id: "L3-33",
    lessonId: "L3",
    semester: 2,
    title: "Biểu Thức",
    videoUrl: "https://www.youtube.com/embed/EQqx6fj_dtE",
    description: "Học Tính Giá Trị Biểu Thức",
    completed: false,
  },
  {
    id: "L3-34",
    lessonId: "L3",
    semester: 2,
    title: "Chia Số Có 3 Chữ Số Cho Số Có 1 Chữ Số",
    videoUrl: "https://www.youtube.com/embed/wWX5fFWMco4",
    description: "Học Chia Số Có 3 Chữ Số Cho Số Có 1 Chữ Số",
    completed: false,
  },
  {
    id: "L3-35",
    lessonId: "L3",
    semester: 2,
    title: "Phép Chia Hết và Phép Chia Có Dư",
    videoUrl: "https://www.youtube.com/embed/wFj0e1tqIlQ",
    description: "Học Về Phép Chia Hết và Phép Chia Có Dư",
    completed: false,
  },
  {
    id: "L3-36",
    lessonId: "L3",
    semester: 2,
    title: "Phép Cộng - Trừ Các Số Trong Phạm Vi 10.000",
    videoUrl: "https://www.youtube.com/embed/wFj0e1tqIlQ",
    description: "Làm Quen Với Phép Cộng - Trừ Các Số Trong Phạm Vi 10.000",
    completed: false,
  },
  {
    id: "L3-37",
    lessonId: "L3",
    semester: 2,
    title: "Nhân Số Có 4 Chữ Số Với Số Có 1 Chữ Số",
    videoUrl: "https://www.youtube.com/embed/wFj0e1tqIlQ",
    description: "Học Nhân Số Có 4 Chữ Số Với Số Có 1 Chữ Số",
    completed: false,
  },
  {
    id: "L3-38",
    lessonId: "L3",
    semester: 2,
    title: "Chia số Có 4 Chữ Số Cho Số Có 1 Chữ Số",
    videoUrl: "https://www.youtube.com/embed/wFj0e1tqIlQ",
    description: "Học Chia số Có 4 Chữ Số Cho Số Có 1 Chữ Số",
    completed: false,
  },
  {
    id: "L3-39",
    lessonId: "L3",
    semester: 2,
    title: "Phép Cộng - Trừ Các Số Trong Phạm Vi 100.000",
    videoUrl: "https://www.youtube.com/embed/wFj0e1tqIlQ",
    description: "Làm Quen Với Phép Cộng - Trừ Các Số Trong Phạm Vi 100.000",
    completed: false,
  },
  {
    id: "L3-40",
    lessonId: "L3",
    semester: 2,
    title: "Nhân Số Có 5 Chữ Số Với Số Có 1 Chữ Số",
    videoUrl: "https://www.youtube.com/embed/wFj0e1tqIlQ",
    description: "Học Nhân Số Có 5 Chữ Số Với Số Có 1 Chữ Số",
    completed: false,
  },
  {
    id: "L3-41",
    lessonId: "L3",
    semester: 2,
    title: "Chia Số Có 5 Chữ Số Cho Số Có 1 Chữ Số ",
    videoUrl: "https://www.youtube.com/embed/wFj0e1tqIlQ",
    description: "Học Chia Số Có 5 Chữ Số Cho Số Có 1 Chữ Số ",
    completed: false,
  },
  {
    id: "L3-42",
    lessonId: "L3",
    semester: 2,
    title: "Hình Vuông Và Các Yếu Tố Trong Hình Vuông",
    videoUrl: "https://www.youtube.com/embed/o6hTF1CreRc",
    description: "Nhận Biết Hình Vuông Và Các Yếu Tố Trong Hình Vuông",
    completed: false,
  },

  /* --- LỚP 4 --- */
  /* --- LỚP 4 - HỌC KÌ 1 --- */
  {
    id: "L4-1",
    lessonId: "L4",
    semester: 1,
    title: "Làm Quen Với Hàng Và Lớp",
    videoUrl: "https://www.youtube.com/embed/_78OsABM5Go",
    description: "Học về hàng và lớp trong số học",
  },
  {
    id: "L4-2",
    lessonId: "L4",
    semester: 1,
    title: "Làm Quen Với Số Có 6 Chữ Số",
    videoUrl: "https://www.youtube.com/embed/PUfDL4SoktU",
    description: "Học về số có 6 chữ số",
  },
  {
    id: "L4-3",
    lessonId: "L4",
    semester: 1,
    title: "Học Cách So Sánh Số Có Nhiều Chữ Số",
    videoUrl: "https://www.youtube.com/embed/GQpqTlbb7eA",
    description: "So sánh các số có nhiều chữ số",
  },
  {
    id: "L4-4",
    lessonId: "L4",
    semester: 1,
    title: "Bài Toán Cấu Tạo Số",
    videoUrl: "https://www.youtube.com/embed/YKuRlIbi1NQ",
    description: "Học cách cấu tạo số",
  },
  {
    id: "L4-5",
    lessonId: "L4",
    semester: 1,
    title: "Làm Quen Với Dãy Số Tự Nhiên",
    videoUrl: "https://www.youtube.com/embed/_-TfMVI-D-U",
    description: "Tìm hiểu về dãy số tự nhiên",
  },
  {
    id: "L4-6",
    lessonId: "L4",
    semester: 1,
    title: "Viết Số Tự Nhiên Trong Hệ Thập Phân",
    videoUrl: "https://www.youtube.com/embed/jl_XHD1bvos",
    description: "Cách viết số tự nhiên trong hệ thập phân",
  },
  {
    id: "L4-7",
    lessonId: "L4",
    semester: 1,
    title: "So Sánh Và Sắp Xếp Thứ Tự Số Tự Nhiên",
    videoUrl: "https://www.youtube.com/embed/VsnZikILD0g",
    description: "So sánh và sắp xếp số tự nhiên",
  },
  {
    id: "L4-8",
    lessonId: "L4",
    semester: 1,
    title: "Yến - Tạ - Tấn Là Gì?",
    videoUrl: "https://www.youtube.com/embed/MDy1SHxpWJQ",
    description: "Đơn vị đo khối lượng: Yến, Tạ, Tấn",
  },
  {
    id: "L4-9",
    lessonId: "L4",
    semester: 1,
    title: "Học Về Giây - Phút - Giờ",
    videoUrl: "https://www.youtube.com/embed/BV1pYCm487A",
    description: "Đơn vị đo thời gian",
  },
  {
    id: "L4-10",
    lessonId: "L4",
    semester: 1,
    title: "Học Về Năm - Thế Kỷ",
    videoUrl: "https://www.youtube.com/embed/EihlDgamd9g",
    description: "Đơn vị đo thời gian lớn",
  },
  {
    id: "L4-11",
    lessonId: "L4",
    semester: 1,
    title: "Ki-Lô-Mét Vuông (Km²) Là Gì?",
    videoUrl: "https://www.youtube.com/embed/CqSa1zDsI3A",
    description: "Đơn vị đo diện tích",
  },
  {
    id: "L4-12",
    lessonId: "L4",
    semester: 1,
    title: "Tìm Số Trung Bình Cộng",
    videoUrl: "https://www.youtube.com/embed/S-1zGc1PJIg",
    description: "Học cách tính trung bình cộng",
  },

  /* --- LỚP 4 - HỌC KÌ 2 --- */
  {
    id: "L4-13",
    lessonId: "L4",
    semester: 1,
    title: "Toán nâng cao về trung bình cộng",
    videoUrl: "https://www.youtube.com/embed/tpbs7BfMooc",
    description: "Các bài toán nâng cao về trung bình cộng và ứng dụng",
  },
  {
    id: "L4-14",
    lessonId: "L4",
    semester: 1,
    title: "Phân tích biểu đồ dạng bảng",
    videoUrl: "https://www.youtube.com/embed/djLFzp3ni9U",
    description: "Học cách đọc và phân tích dữ liệu từ biểu đồ dạng bảng",
  },
  {
    id: "L4-15",
    lessonId: "L4",
    semester: 1,
    title: "Phân tích biểu đồ cột",
    videoUrl: "https://www.youtube.com/embed/TumAMV9lvX8",
    description: "Học cách đọc và phân tích dữ liệu từ biểu đồ dạng cột",
  },
  {
    id: "L4-16",
    lessonId: "L4",
    semester: 1,
    title: "Tìm quy luật của dãy số cho trước",
    videoUrl: "https://www.youtube.com/embed/I7RIVgXcEpI",
    description: "Phương pháp nhận biết và tìm quy luật của các dãy số",
  },
  {
    id: "L4-17",
    lessonId: "L4",
    semester: 1,
    title: "Tìm số số hạng, tổng của dãy số có quy luật",
    videoUrl: "https://www.youtube.com/embed/0wB3Ucw7YWg",
    description: "Cách tính số các số hạng và tổng của dãy số theo quy luật",
  },
  {
    id: "L4-18",
    lessonId: "L4",
    semester: 1,
    title: "Liên hệ giữa các thành phần phép cộng trừ",
    videoUrl: "https://www.youtube.com/embed/XH_AKXsFqiE",
    description: "Mối quan hệ giữa số hạng, tổng, số bị trừ, số trừ và hiệu",
  },
  {
    id: "L4-19",
    lessonId: "L4",
    semester: 1,
    title: "Biểu thức có chứa 3 chữ",
    videoUrl: "https://www.youtube.com/embed/GABdQGL3kL0",
    description: "Tìm hiểu và giải các biểu thức chứa ba chữ số",
  },
  {
    id: "L4-20",
    lessonId: "L4",
    semester: 1,
    title: "Tính chất kết hợp của phép cộng trừ",
    videoUrl: "https://www.youtube.com/embed/W5pFnY6JFhE",
    description: "Học và vận dụng tính chất kết hợp trong phép cộng và trừ",
  },
  {
    id: "L4-21",
    lessonId: "L4",
    semester: 1,
    title: "Tìm 2 số khi biết tổng hiệu",
    videoUrl: "https://www.youtube.com/embed/J6xVfNcCVWw",
    description: "Phương pháp giải bài toán tìm hai số khi biết tổng và hiệu",
  },
  {
    id: "L4-22",
    lessonId: "L4",
    semester: 1,
    title: "Bài toán tổng hiệu trong hình học",
    videoUrl: "https://www.youtube.com/embed/8MDAB6mNVfs",
    description: "Áp dụng phương pháp tổng hiệu vào bài toán hình học",
  },
  {
    id: "L4-23",
    lessonId: "L4",
    semester: 1,
    title: "Nhân với số có 1 chữ số",
    videoUrl: "https://www.youtube.com/embed/Rc4KRx31ktU",
    description: "Phương pháp nhân một số nhiều chữ số với số có 1 chữ số",
  },
  {
    id: "L4-24",
    lessonId: "L4",
    semester: 1,
    title: "Nhân với số tận cùng là 0",
    videoUrl: "https://www.youtube.com/embed/cNd1HNY53wY",
    description: "Kỹ thuật nhân nhanh với các số có tận cùng là chữ số 0",
  },
  {
    id: "L4-25",
    lessonId: "L4",
    semester: 1,
    title: "Nhân nhẩm số có 2 chữ số với 11",
    videoUrl: "https://www.youtube.com/embed/wzmUD3yo4PY",
    description: "Mẹo nhân nhẩm nhanh số có 2 chữ số với số 11",
  },
  {
    id: "L4-26",
    lessonId: "L4",
    semester: 1,
    title: "Nhân với số có 3 chữ số",
    videoUrl: "https://www.youtube.com/embed/PakvL2dwLJo",
    description: "Phương pháp nhân một số với số có 3 chữ số",
  },
  {
    id: "L4-27",
    lessonId: "L4",
    semester: 1,
    title: "Tính chất kết hợp của phép nhân",
    videoUrl: "https://www.youtube.com/embed/O6vMOWxH7Z0",
    description: "Học và vận dụng tính chất kết hợp trong phép nhân",
  },
  {
    id: "L4-28",
    lessonId: "L4",
    semester: 1,
    title: "Phân Số - Khái Niệm Cơ Bản",
    videoUrl: "https://www.youtube.com/embed/qR55ASMG5nY",
    description: "Làm quen với khái niệm phân số cơ bản",
  },
  {
    id: "L4-29",
    lessonId: "L4",
    semester: 1,
    title: "So Sánh Hai Phân Số",
    videoUrl: "https://www.youtube.com/embed/LzUD77f91O0",
    description: "Học cách so sánh hai phân số",
  },
  {
    id: "L4-30",
    lessonId: "L4",
    semester: 1,
    title: "Rút Gọn Phân Số",
    videoUrl: "https://www.youtube.com/embed/ykYH7hLpnKs",
    description: "Phương pháp rút gọn phân số",
  },
  {
    id: "L4-31",
    lessonId: "L4",
    semester: 1,
    title: "Quy Đồng Mẫu Số Các Phân Số",
    videoUrl: "https://www.youtube.com/embed/c5PFUOlbs7Y",
    description: "Học cách quy đồng mẫu số",
  },
  {
    id: "L4-32",
    lessonId: "L4",
    semester: 1,
    title: "Cộng Hai Phân Số Cùng Mẫu",
    videoUrl: "https://www.youtube.com/embed/qTVeLSorjOM",
    description: "Thực hành cộng phân số cùng mẫu",
  },
  {
    id: "L4-33",
    lessonId: "L4",
    semester: 1,
    title: "Cộng Hai Phân Số Khác Mẫu",
    videoUrl: "https://www.youtube.com/embed/dMUKlOBCDR0",
    description: "Cách cộng phân số khác mẫu số",
  },
  {
    id: "L4-34",
    lessonId: "L4",
    semester: 1,
    title: "Trừ Hai Phân Số Cùng Mẫu",
    videoUrl: "https://www.youtube.com/embed/NvuqWO3nCuY",
    description: "Phép trừ phân số cùng mẫu",
  },
  {
    id: "L4-35",
    lessonId: "L4",
    semester: 2,
    title: "Trừ Hai Phân Số Khác Mẫu",
    videoUrl: "https://www.youtube.com/embed/1b3WCwKTyMU",
    description: "Cách trừ phân số khác mẫu số",
  },
  {
    id: "L4-36",
    lessonId: "L4",
    semester: 2,
    title: "Bài Toán Có Lời Văn Về Phân Số",
    videoUrl: "https://www.youtube.com/embed/wGTztQfLa_s",
    description: "Giải các bài toán có lời văn liên quan đến phân số",
  },
  {
    id: "L4-37",
    lessonId: "L4",
    semester: 2,
    title: "Nhân Phân Số Với Số Tự Nhiên",
    videoUrl: "https://www.youtube.com/embed/vDPNHCxgVFA",
    description: "Học phép nhân phân số với số tự nhiên",
  },
  {
    id: "L4-38",
    lessonId: "L4",
    semester: 2,
    title: "Chia Phân Số Cho Số Tự Nhiên",
    videoUrl: "https://www.youtube.com/embed/zqi6pTvTaEw",
    description: "Cách chia phân số cho số tự nhiên",
  },
  {
    id: "L4-39",
    lessonId: "L4",
    semester: 2,
    title: "Hỗn Số - Khái Niệm Và Ứng Dụng",
    videoUrl: "https://www.youtube.com/embed/YVzo8wMO4XU",
    description: "Tìm hiểu về hỗn số và cách sử dụng",
  },
  {
    id: "L4-40",
    lessonId: "L4",
    semester: 2,
    title: "Chuyển Đổi Giữa Hỗn Số Và Phân Số",
    videoUrl: "https://www.youtube.com/embed/cwv-AJQSsrw",
    description: "Cách chuyển đổi hỗn số thành phân số và ngược lại",
  },
  {
    id: "L4-41",
    lessonId: "L4",
    semester: 2,
    title: "Tính Chất Cơ Bản Của Phân Số",
    videoUrl: "https://www.youtube.com/embed/084j1ojliuo",
    description: "Các tính chất quan trọng của phân số",
  },
  {
    id: "L4-42",
    lessonId: "L4",
    semester: 2,
    title: "Số Thập Phân - Làm Quen",
    videoUrl: "https://www.youtube.com/embed/gzBulq_6lNI",
    description: "Giới thiệu về số thập phân",
  },
  {
    id: "L4-43",
    lessonId: "L4",
    semester: 2,
    title: "Đọc Và Viết Số Thập Phân",
    videoUrl: "https://www.youtube.com/embed/WBG5O0Nf_zs",
    description: "Cách đọc và viết số thập phân chính xác",
  },
  {
    id: "L4-44",
    lessonId: "L4",
    semester: 2,
    title: "So Sánh Số Thập Phân",
    videoUrl: "https://www.youtube.com/embed/4jlZ5IVc-Uk",
    description: "Học cách so sánh các số thập phân",
  },
  {
    id: "L4-45",
    lessonId: "L4",
    semester: 2,
    title: "Cộng Số Thập Phân",
    videoUrl: "https://www.youtube.com/embed/mONOQSJ5-AM",
    description: "Phép cộng các số thập phân",
  },
  {
    id: "L4-46",
    lessonId: "L4",
    semester: 2,
    title: "Trừ Số Thập Phân",
    videoUrl: "https://www.youtube.com/embed/z2iPadFG57A",
    description: "Phép trừ các số thập phân",
  },
  {
    id: "L4-47",
    lessonId: "L4",
    semester: 2,
    title: "Nhân Số Thập Phân Với 10, 100, 1000",
    videoUrl: "https://www.youtube.com/embed/22B9LDJNRdo",
    description: "Quy tắc nhân số thập phân với 10, 100, 1000",
  },
  {
    id: "L4-48",
    lessonId: "L4",
    semester: 2,
    title: "Chia Số Thập Phân Cho 10, 100, 1000",
    videoUrl: "https://www.youtube.com/embed/uip1WcAXujU",
    description: "Quy tắc chia số thập phân cho 10, 100, 1000",
  },
  {
    id: "L4-49",
    lessonId: "L4",
    semester: 2,
    title: "Diện Tích Hình Chữ Nhật",
    videoUrl: "https://www.youtube.com/embed/5-Sr3Wz67nA",
    description: "Công thức tính diện tích hình chữ nhật",
  },
  {
    id: "L4-50",
    lessonId: "L4",
    semester: 2,
    title: "Diện Tích Hình Vuông",
    videoUrl: "https://www.youtube.com/embed/FNHdR9NHjhw",
    description: "Công thức tính diện tích hình vuông",
  },
  {
    id: "L4-51",
    lessonId: "L4",
    semester: 2,
    title: "Chu Vi Hình Chữ Nhật",
    videoUrl: "https://www.youtube.com/embed/ZXMVxjsm3oI",
    description: "Cách tính chu vi hình chữ nhật",
  },
  {
    id: "L4-52",
    lessonId: "L4",
    semester: 2,
    title: "Chu Vi Hình Vuông",
    videoUrl: "https://www.youtube.com/embed/6TIhc5SAyCI",
    description: "Cách tính chu vi hình vuông",
  },
  {
    id: "L4-53",
    lessonId: "L4",
    semester: 2,
    title: "Bài Toán Về Diện Tích Và Chu Vi",
    videoUrl: "https://www.youtube.com/embed/1FFCdrqvWR8",
    description: "Giải các bài toán về diện tích và chu vi",
  },
  {
    id: "L4-54",
    lessonId: "L4",
    semester: 2,
    title: "Đo Độ Dài - Đơn Vị Mét",
    videoUrl: "https://www.youtube.com/embed/uaROXbAggxM",
    description: "Đơn vị đo độ dài: mét và các đơn vị liên quan",
  },
  {
    id: "L4-55",
    lessonId: "L4",
    semester: 2,
    title: "Đổi Đơn Vị Độ Dài",
    videoUrl: "https://www.youtube.com/embed/Jcm_jIVHhOI",
    description: "Cách đổi giữa các đơn vị đo độ dài",
  },
  {
    id: "L4-56",
    lessonId: "L4",
    semester: 2,
    title: "Đo Khối Lượng - Kg, Tạ, Tấn",
    videoUrl: "https://www.youtube.com/embed/6eS23g2M7zQ",
    description: "Các đơn vị đo khối lượng và cách đổi",
  },
  {
    id: "L4-57",
    lessonId: "L4",
    semester: 2,
    title: "Đổi Đơn Vị Khối Lượng",
    videoUrl: "https://www.youtube.com/embed/6JLOxkAE0T8",
    description: "Chuyển đổi giữa các đơn vị khối lượng",
  },
  {
    id: "L4-58",
    lessonId: "L4",
    semester: 2,
    title: "Thời Gian - Giờ, Phút, Giây",
    videoUrl: "https://www.youtube.com/embed/e4dD87bW32g",
    description: "Đơn vị thời gian và cách tính toán",
  },
  {
    id: "L4-59",
    lessonId: "L4",
    semester: 2,
    title: "Tính Khoảng Thời Gian",
    videoUrl: "https://www.youtube.com/embed/YLS6AuD8HyQ",
    description: "Cách tính khoảng thời gian giữa hai mốc",
  },
  {
    id: "L4-60",
    lessonId: "L4",
    semester: 2,
    title: "Bài Toán Về Thời Gian",
    videoUrl: "https://www.youtube.com/embed/hrKYsWH53yg",
    description: "Giải các bài toán liên quan đến thời gian",
  },
  {
    id: "L4-61",
    lessonId: "L4",
    semester: 2,
    title: "Hình Tam Giác - Nhận Biết",
    videoUrl: "https://www.youtube.com/embed/-5QFgd13deU",
    description: "Nhận biết và phân loại hình tam giác",
  },
  {
    id: "L4-62",
    lessonId: "L4",
    semester: 2,
    title: "Các Loại Hình Tam Giác",
    videoUrl: "https://www.youtube.com/embed/PDxWFjLCxHU",
    description: "Tam giác vuông, cân, đều và các tính chất",
  },
  {
    id: "L4-63",
    lessonId: "L4",
    semester: 2,
    title: "Hình Thang - Khái Niệm",
    videoUrl: "https://www.youtube.com/embed/4vjLPqaosGc",
    description: "Tìm hiểu về hình thang và đặc điểm",
  },
  {
    id: "L4-64",
    lessonId: "L4",
    semester: 2,
    title: "Hình Bình Hành",
    videoUrl: "https://www.youtube.com/embed/_mVgyJgs2Zk",
    description: "Hình bình hành và tính chất của nó",
  },
  {
    id: "L4-65",
    lessonId: "L4",
    semester: 2,
    title: "Bài Toán Tổng Hợp Hình Học",
    videoUrl: "https://www.youtube.com/embed/ReaBghYw9p4",
    description: "Giải các bài toán hình học tổng hợp",
  },
  {
    id: "L4-66",
    lessonId: "L4",
    semester: 2,
    title: "Ôn Tập Và Củng Cố Kiến Thức",
    videoUrl: "https://www.youtube.com/embed/zVEDV1R5lWo",
    description: "Ôn tập toàn bộ kiến thức đã học",
  },
  {
    id: "L4-67",
    lessonId: "L4",
    semester: 2,
    title: "Bài Tập Tổng Hợp Cuối Năm",
    videoUrl: "https://www.youtube.com/embed/NKkjX1Z5R38",
    description: "Bài tập tổng hợp ôn thi cuối năm học",
  },

  /* --- LỚP 5 --- */
  /* --- LỚP 5 - HỌC KÌ 1 --- */
  {
    id: "L5-1",
    lessonId: "L5",
    semester: 1,
    title: "Chia Một Số Tự Nhiên Cho Một Số Thập Phân",
    videoUrl: "https://www.youtube.com/embed/8Akzlx2xODc",
    description: "Chia Một Số Tự Nhiên Cho Một Số Thập Phân",
  },
  {
    id: "L5-2",
    lessonId: "L5",
    semester: 1,
    title: "Khái Niệm Hỗn Số",
    videoUrl: "https://www.youtube.com/embed/PFP0F64bxfI",
    description: "Khái Niệm Hỗn Số",
  },
  {
    id: "L5-3",
    lessonId: "L5",
    semester: 1,
    title: "Chuyển Đổi Hỗn Số Thành Phân Số",
    videoUrl: "https://www.youtube.com/embed/M5aZBfU4A7Y",
    description: "Chuyển Đổi Hỗn Số Thành Phân Số",
  },
  {
    id: "L5-4",
    lessonId: "L5",
    semester: 1,
    title: "Đọc, Viết Số Thập Phân",
    videoUrl: "https://www.youtube.com/embed/jKuVl8lSUSE",
    description: "Đọc, Viết Số Thập Phân",
  },
  {
    id: "L5-5",
    lessonId: "L5",
    semester: 1,
    title: "So Sánh 2 Số Thập Phân",
    videoUrl: "https://www.youtube.com/embed/NSUiNNCdTDE",
    description: "So Sánh 2 Số Thập Phân",
  },
  {
    id: "L5-6",
    lessonId: "L5",
    semester: 1,
    title: "Viết Số Đo Độ Dài Dưới Dạng Số Thập Phân",
    videoUrl: "https://www.youtube.com/embed/AjyO6GMldDY",
    description: "Viết Số Đo Độ Dài Dưới Dạng Số Thập Phân",
  },
  {
    id: "L5-7",
    lessonId: "L5",
    semester: 1,
    title: "Ôn tập phép nhân",
    videoUrl: "https://www.youtube.com/embed/S19Lbyt8U_0",
    description: "Ôn tập và củng cố kiến thức về phép nhân",
  },
  {
    id: "L5-8",
    lessonId: "L5",
    semester: 1,
    title: "Nhân Một Số Thập Phân Với Một Số Thập Phân",
    videoUrl: "https://www.youtube.com/embed/KhsxxdEo2QQ",
    description: "Nhân Một Số Thập Phân Với Một Số Thập Phân",
  },
  {
    id: "L5-9",
    lessonId: "L5",
    semester: 1,
    title: "Chia Một Số Thập Phân Với Một Số Thập Phân",
    videoUrl: "https://www.youtube.com/embed/aO0X57Mm91Q",
    description: "Chia Một Số Thập Phân Với Một Số Thập Phân",
  },
  {
    id: "L5-10",
    lessonId: "L5",
    semester: 1,
    title: "Làm Quen Với Tỉ Số Phần Trăm",
    videoUrl: "https://www.youtube.com/embed/_Cjo_FpPnqQ",
    description: "Làm Quen Với Tỉ Số Phần Trăm",
  },
  {
    id: "L5-11",
    lessonId: "L5",
    semester: 1,
    title: "Cách Tính Diện Tích Hình Tam Giác",
    videoUrl: "https://www.youtube.com/embed/clTUm_OZQb8",
    description: "Cách Tính Diện Tích Hình Tam Giác",
  },
  {
    id: "L5-12",
    lessonId: "L5",
    semester: 1,
    title: "Cách Tính Diện Tích Hình Thang",
    videoUrl: "https://www.youtube.com/embed/HMjoeADksbU",
    description: "Cách Tính Diện Tích Hình Thang",
  },

  {
    id: "L5-13",
    lessonId: "L5",
    semester: 1,
    title: "Cách Tính Diện Tích Hình Tròn",
    videoUrl: "https://www.youtube.com/embed/TzzJ9PTVoyA",
    description: "Cách Tính Diện Tích Hình Tròn",
  },
  {
    id: "L5-14",
    lessonId: "L5",
    semester: 1,
    title: "Cách Tính Thời Gian, Quãng Đường, Vận Tốc",
    videoUrl: "https://www.youtube.com/embed/zFjbAYD3w3w",
    description: "Cách Tính Thời Gian, Quãng Đường, Vận Tốc",
  },
  {
    id: "L5-22",
    lessonId: "L5",
    semester: 1,
    title: "Tìm Tỉ Số Phần Trăm Của 2 Số",
    videoUrl: "https://www.youtube.com/embed/kCmwalu89GM",
    description: "Tìm Tỉ Số Phần Trăm Của 2 Số",
  },
  /* --- LỚP 5 - HỌC KÌ 2 --- */
  {
    id: "L5-15",
    lessonId: "L5",
    semester: 2,
    title: "Diện Tích Xung Quanh Và Diện Tích Toàn Phần Hình Hộp Chữ Nhật",
    videoUrl: "https://www.youtube.com/embed/0YrZsFToDIk",
    description: "Diện Tích Xung Quanh Và Diện Tích Toàn Phần Hình Hộp Chữ Nhật",
  },
  {
    id: "L5-16",
    lessonId: "L5",
    semester: 2,
    title: "Diện Tích Xung Quanh Và Diện Tích Toàn Phần Của Hình Lập Phương",
    videoUrl: "https://www.youtube.com/embed/TNgBCGNgl4Q",
    description: "Diện Tích Xung Quanh Và Diện Tích Toàn Phần Của Hình Lập Phương",
  },
  {
    id: "L5-23",
    lessonId: "L5",
    semester: 2,
    title: "Giới Thiệu Về Hình Trụ, Hình Cầu",
    videoUrl: "https://www.youtube.com/embed/0NewzRWSTfc",
    description: "Giới Thiệu Về Hình Trụ, Hình Cầu",
  },
  {
    id: "L5-24",
    lessonId: "L5",
    semester: 2,
    title: "Cộng Số Đo Thời Gian",
    videoUrl: "https://www.youtube.com/embed/6iRL5OsVLbc",
    description: "Cộng Số Đo Thời Gian",
  },
  {
    id: "L5-25",
    lessonId: "L5",
    semester: 2,
    title: "Trừ Số Đo Thời Gian",
    videoUrl: "https://www.youtube.com/embed/v3l00mOpelQ",
    description: "Trừ Số Đo Thời Gian",
  },
  {
    id: "L5-26",
    lessonId: "L5",
    semester: 2,
    title: "Nhân Số Đo Thời Gian",
    videoUrl: "https://www.youtube.com/embed/Fl1n_3_Lh40",
    description: "Nhân Số Đo Thời Gian",
  },
  {
    id: "L5-27",
    lessonId: "L5",
    semester: 2,
    title: "Chia Số Đo Thời Gian",
    videoUrl: "https://www.youtube.com/embed/c8-5gshbYiI",
    description: "Chia Số Đo Thời Gian",
  },
  {
    id: "L5-17",
    lessonId: "L5",
    semester: 2,
    title: "Thể Tích Của Một Hình",
    videoUrl: "https://www.youtube.com/embed/rlGdd3rj3A4",
    description: "Thể Tích Của Một Hình",
  },
  {
    id: "L5-18",
    lessonId: "L5",
    semester: 2,
    title: "Thể Tích Hình Hộp Chữ Nhật",
    videoUrl: "https://www.youtube.com/embed/D7AO_NwtoIs",
    description: "Thể Tích Hình Hộp Chữ Nhật",
  },
  {
    id: "L5-19",
    lessonId: "L5",
    semester: 2,
    title: "Thể Tích Hình Lập Phương",
    videoUrl: "https://www.youtube.com/embed/99tkJuwuMNQ",
    description: "Thể Tích Hình Lập Phương",
  },
  {
    id: "L5-20",
    lessonId: "L5",
    semester: 2,
    title: "Tìm Số Khi Biết Giá Trị Phần Trăm",
    videoUrl: "https://www.youtube.com/embed/vqY27sQnDcM",
    description: "Tìm Số Khi Biết Giá Trị Phần Trăm",
  },
  {
    id: "L5-21",
    lessonId: "L5",
    semester: 2,
    title: "Cách Tìm Giá Trị Của 1 Số",
    videoUrl: "https://www.youtube.com/embed/coQV2_IKiac",
    description: "Cách Tìm Giá Trị Của 1 Số",
  },
];

/* ==================================================================================
   LOGIC GIAO DIỆN
   ================================================================================== */
const Lessons = () => {
  // Hook lấy dữ liệu từ Supabase
  const {
    lessons: dbLessons,
    topics: dbTopics,
    lessonProgress,
    isLoading,
    markTopicCompleted,
    getLessonProgressById,
    isTopicCompleted,
  } = useLessonProgress();

  // Fallback: Sử dụng dữ liệu cứng nếu chưa có dữ liệu từ DB
  const activeLessons = dbLessons.length > 0 ? dbLessons : lessonsData.map(l => ({
    id: l.id,
    title: l.title,
    topic_count: l.topicCount,
    quiz_count: l.quizCount,
  }));

  const activeTopics = dbTopics.length > 0 ? dbTopics : topicsData.map(t => ({
    id: t.id,
    lesson_id: t.lessonId,
    semester: t.semester,
    title: t.title,
    video_url: t.videoUrl,
    description: t.description,
    order_index: 0,
    duration_minutes: 15,
  }));

  // Read URL search params for deep linking
  const [searchParams] = useSearchParams();
  const urlGrade = searchParams.get("grade");
  const urlTopic = searchParams.get("topic");
  const urlTab = searchParams.get("tab");

  // State chọn Lớp
  const [selectedLessonId, setSelectedLessonId] = useState<string>(() => {
    // Initialize from URL if available
    if (urlGrade && activeLessons.find(l => l.id === urlGrade)) {
      return urlGrade;
    }
    return "L5";
  });

  // State chọn Học kì (Mặc định là 1)
  const [selectedSemester, setSelectedSemester] = useState<number>(() => {
    // If we have a topic from URL, find its semester
    if (urlTopic) {
      const topic = activeTopics.find(t => t.id === urlTopic);
      if (topic) return topic.semester;
    }
    return 1;
  });

  // State tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");

  // State chọn Bài giảng (Video)
  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    // Initialize from URL if available
    if (urlTopic && activeTopics.find(t => t.id === urlTopic)) {
      return urlTopic;
    }
    return "";
  });

  // State cho active tab (notes/qa)
  const [activeToolTab, setActiveToolTab] = useState<string>(() => {
    return urlTab === "notes" ? "notes" : "qa";
  });

  // State cho mobile sidebar
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // LỌC DỮ LIỆU: Lớp + Học kì + Tìm kiếm
  const filteredTopics = useMemo(() => {
    return activeTopics.filter(
      (t) =>
        t.lesson_id === selectedLessonId &&
        t.semester === selectedSemester &&
        t.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [activeTopics, selectedLessonId, selectedSemester, searchQuery]);

  // Tự động chọn bài đầu tiên (chỉ khi không có URL topic)
  useEffect(() => {
    // Skip if we have a valid topic from URL on initial load
    if (urlTopic && activeTopics.find(t => t.id === urlTopic)) {
      return;
    }
    
    if (filteredTopics.length > 0) {
      if (!selectedTopicId || !filteredTopics.find((t) => t.id === selectedTopicId)) {
        setSelectedTopicId(filteredTopics[0].id);
      }
    } else {
      setSelectedTopicId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTopics]);

  const selectedLesson = activeLessons.find((l) => l.id === selectedLessonId);
  const selectedTopic = activeTopics.find((t) => t.id === selectedTopicId);

  // Xử lý khi video kết thúc
  const handleVideoComplete = async () => {
    if (selectedTopicId) {
      await markTopicCompleted(selectedTopicId);
    }
  };

  // Lấy tiến độ của lesson hiện tại
  const currentLessonProgress = getLessonProgressById(selectedLessonId);

  // Handler chọn topic trên mobile
  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  // Component nội dung sidebar (dùng chung cho cả desktop và mobile)
  const SidebarContent = () => (
    <>
      {/* Phần điều khiển trên cùng */}
      <div className="p-4 space-y-4 flex-shrink-0">
        {/* 1. Chọn Lớp */}
        <div>
          <label className="text-sm font-black text-foreground uppercase mb-1.5 block tracking-wider">
            Lớp Học
          </label>
          <Select
            value={selectedLessonId}
            onValueChange={(val) => {
              setSelectedLessonId(val);
              setSearchQuery("");
              setSelectedSemester(1);
            }}
          >
            <SelectTrigger className="w-full font-bold h-11 bg-background border-2 hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Chọn lớp..." />
            </SelectTrigger>
            <SelectContent>
              {activeLessons.map((lesson) => {
                const progress = getLessonProgressById(lesson.id);
                return (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    <div className="flex items-center justify-between w-full gap-3">
                      <span>{lesson.title}</span>
                      {progress && progress.completion_percentage > 0 && (
                        <span className="text-xs text-primary font-bold">
                          {Math.round(progress.completion_percentage)}%
                        </span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          {/* Progress bar cho lesson hiện tại */}
          {currentLessonProgress && currentLessonProgress.total_topics > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">Tiến độ</span>
                <span className="text-primary font-bold">
                  {currentLessonProgress.completed_topics}/{currentLessonProgress.total_topics} bài
                </span>
              </div>
              <Progress 
                value={currentLessonProgress.completion_percentage} 
                className="h-2"
              />
            </div>
          )}
        </div>

        {/* 2. Chọn Học Kì (Tabs) */}
        <div className="bg-muted/50 p-1 rounded-lg">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setSelectedSemester(1)}
              className={`text-sm font-black py-2 rounded-md transition-all ${
                selectedSemester === 1
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "text-muted-foreground hover:bg-white/70 font-bold"
              }`}
            >
              Học kì 1
            </button>
            <button
              onClick={() => setSelectedSemester(2)}
              className={`text-sm font-black py-2 rounded-md transition-all ${
                selectedSemester === 2
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "text-muted-foreground hover:bg-white/70 font-bold"
              }`}
            >
              Học kì 2
            </button>
          </div>
        </div>

        {/* 3. Tìm kiếm */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm bài học..."
            className="pl-9 bg-background border-2 font-semibold h-11 focus:border-primary/50 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Separator className="flex-shrink-0" />

      {/* Danh sách chủ điểm (Topics) */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-muted/20 to-muted/5 min-h-0 overflow-hidden">
        {/* Header danh sách */}
        <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 text-sm font-black text-foreground uppercase tracking-wider border-b-2 border-primary/30 flex justify-between items-center flex-shrink-0">
          <span className="text-base">DANH SÁCH BÀI HỌC</span>
          <Badge
            variant="outline"
            className="text-xs h-6 px-2.5 bg-background/90 font-black border-primary/40 text-primary"
          >
            {filteredTopics.length} BÀI
          </Badge>
        </div>

        {/* Container scroll với chiều cao cố định */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden lesson-list-scroll min-h-0 pb-4">
          <div className="p-3 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTopics.length > 0 ? (
              filteredTopics.map((topic, index) => {
                const completed = isTopicCompleted(topic.id);
                return (
                  <motion.button
                    key={topic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: isMobile && isMobileSidebarOpen ? index * 0.05 : 0,
                      duration: 0.2 
                    }}
                    onClick={() => handleTopicSelect(topic.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 border-2 flex gap-3.5 group items-start ${
                      selectedTopicId === topic.id
                        ? "bg-gradient-to-r from-primary/20 to-primary/15 border-primary shadow-lg ring-2 ring-primary/30"
                        : "bg-white hover:bg-muted/50 border-border/60 hover:border-primary/50 shadow-sm hover:shadow-lg"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Icon số thứ tự */}
                    <div className="flex-shrink-0 pt-0.5">
                      {selectedTopicId === topic.id ? (
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                          <PlayCircle className="h-5 w-5" />
                        </div>
                      ) : completed ? (
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-black text-foreground/70 group-hover:bg-primary/20 group-hover:text-primary transition-all border-2 border-border">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    {/* Nội dung bài học */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-base font-bold leading-snug mb-2 line-clamp-2 ${
                          selectedTopicId === topic.id
                            ? "text-primary"
                            : "text-foreground group-hover:text-primary/90"
                        }`}
                      >
                        {topic.title}
                      </h3>

                      {/* Badge trạng thái */}
                      <div className="flex items-center gap-2">
                        {completed ? (
                          <span className="text-xs px-2.5 py-1 bg-primary/15 text-primary rounded-lg font-bold inline-flex items-center gap-1.5">
                            <CheckCircle className="h-3 w-3" /> Hoàn thành
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/60 rounded-lg font-bold">
                            <PlayCircle className="h-3 w-3" /> {topic.duration_minutes || 15}p
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })
            ) : (
              <div className="text-center py-12 px-4 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-xs">Không tìm thấy bài học nào cho Học kì {selectedSemester}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Viền xanh lá ở đuôi sidebar */}
      <div className="h-3 bg-primary rounded-b-2xl flex-shrink-0" />
    </>
  );

  return (
    <PageTransition className="flex-1 flex flex-col bg-background">
      {/* KHU VỰC NỘI DUNG */}
      <div className="flex flex-1 min-h-0 relative">
        
        {/* Mobile: Floating button với animation */}
        <AnimatePresence>
          {!isMobileSidebarOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="lg:hidden fixed bottom-20 left-4 z-50"
            >
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="shadow-xl rounded-full h-14 w-14 p-0 hover:scale-110 transition-transform"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile: Sheet sidebar với animation mượt */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent 
            side="left" 
            className="w-[320px] sm:w-[360px] p-0 flex flex-col border-r-2 border-primary/20"
          >
            <SheetTitle className="sr-only">Danh sách bài học</SheetTitle>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <SidebarContent />
            </motion.div>
          </SheetContent>
        </Sheet>

        {/* Desktop: Sidebar cố định */}
        <div className="hidden lg:flex w-[320px] xl:w-[360px] border-r flex-col bg-card shadow-sm z-10 flex-shrink-0 h-[780px] overflow-hidden rounded-br-2xl">
          <SidebarContent />
        </div>

        {/* --- KHUNG CHÍNH (MAIN CONTENT) --- */}
        <div className="flex-1 flex flex-col bg-background h-full overflow-hidden relative">
          {/* Mobile header bar */}
          <div className="lg:hidden flex items-center gap-3 p-3 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-2"
            >
              <Menu className="h-4 w-4" />
              <span className="font-bold">Bài học</span>
            </Button>
            {selectedTopic && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {selectedTopic.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedLesson?.title} • Học kì {selectedSemester}
                </p>
              </div>
            )}
          </div>

          {!selectedTopic ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/5">
              <BookOpen className="h-16 w-16 mb-4 opacity-20" />
              <h2 className="text-xl font-semibold mb-2">Chưa chọn bài học</h2>
              <p className="hidden lg:block">Vui lòng chọn một bài học từ danh sách bên trái.</p>
              <p className="lg:hidden">Nhấn nút "Bài học" để chọn bài học.</p>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              {/* SỬA LỖI VIDEO BÉ: Tăng max-w từ 5xl lên 7xl hoặc full */}
              <div className="max-w-[1600px] mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
                {/* Header Bài Học - Ẩn trên mobile vì đã có header bar */}
                <div className="hidden lg:flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-sm md:text-base">
                    <span className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider shadow-md">
                      {selectedLesson?.title}
                    </span>
                    <span className="text-muted-foreground font-semibold">/</span>
                    <span className="bg-muted px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold">
                      Học kì {selectedSemester}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight tracking-tight">
                    {selectedTopic.title}
                  </h1>
                </div>

                {/* Video Player với nút hoàn thành */}
                <VideoPlayer
                  videoUrl={selectedTopic.video_url}
                  title={selectedTopic.title}
                  topicId={selectedTopic.id}
                  onComplete={handleVideoComplete}
                  isCompleted={isTopicCompleted(selectedTopic.id)}
                />

                {/* Phần nội dung bài học + XP - Layout 2 cột */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Cột trái: Nội dung bài học - Thiết kế mới theo mẫu */}
                  <div className="lg:col-span-2 bg-card dark:bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                    {/* Header */}
                    <div className="px-5 pt-5 pb-3">
                      <h3 className="font-bold text-xl flex items-center gap-3 text-foreground">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Nội dung bài học
                      </h3>
                    </div>
                    
                    {/* Nội dung */}
                    <div className="px-5 pb-5">
                      <h4 className="font-bold text-lg text-primary mb-3">
                        {selectedTopic.title}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Hãy xem kỹ video và ghi chép lại các công thức quan trọng. 
                        Sau khi xem xong, bạn có thể ghi chú bên dưới hoặc đặt câu hỏi trong phần Hỏi đáp.
                      </p>
                    </div>
                  </div>

                  {/* Cột phải: XP Info */}
                  <div className="lg:col-span-1 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 md:p-6 border border-primary/20 flex flex-col items-center justify-center text-center gap-3">
                    <div className="text-4xl">🎯</div>
                    <div className="text-lg md:text-xl font-bold text-primary">
                      Hoàn thành bài học
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-primary">
                      +20 XP
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Xem video và hoàn thành để nhận điểm kinh nghiệm
                    </p>
                  </div>
                </div>

                {/* Phần Ghi chú & Hỏi đáp - Nằm dưới, full width */}
                <div className="bg-card rounded-xl md:rounded-2xl border shadow-lg overflow-hidden">
                  <Tabs value={activeToolTab} onValueChange={setActiveToolTab} className="w-full">
                    {/* Header với gradient xanh lá - responsive */}
                    <div className="bg-gradient-to-r from-primary to-primary/80 px-3 sm:px-4 md:px-6 py-3 md:py-5 flex justify-center">
                      <TabsList className="bg-primary-foreground/20 backdrop-blur-sm border-none h-10 sm:h-12 md:h-14 p-1 md:p-1.5 rounded-full w-full max-w-md">
                        <TabsTrigger 
                          value="notes" 
                          className="flex-1 text-xs sm:text-sm md:text-lg font-bold px-2 sm:px-4 md:px-8 py-2 md:py-3 rounded-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=inactive]:text-primary-foreground/90 transition-all"
                        >
                          <span className="hidden sm:inline">📝 </span>Ghi chú
                        </TabsTrigger>
                        <TabsTrigger 
                          value="qa" 
                          className="flex-1 text-xs sm:text-sm md:text-lg font-bold px-2 sm:px-4 md:px-8 py-2 md:py-3 rounded-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=inactive]:text-primary-foreground/90 transition-all"
                        >
                          <span className="hidden sm:inline">💬 </span>Hỏi đáp
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <div className="p-4 md:p-6 bg-card">
                      <TabsContent value="notes" className="mt-0">
                        <NotesTab 
                          topicId={selectedTopic.id} 
                          topicTitle={selectedTopic.title} 
                        />
                      </TabsContent>
                      
                      <TabsContent value="qa" className="mt-0">
                        <CommentsTab 
                          topicId={selectedTopic.id} 
                          topicTitle={selectedTopic.title} 
                        />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
      <Footer />
    </PageTransition>
  );
};

export default Lessons;
