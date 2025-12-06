import { useParams, useNavigate } from "react-router-dom";
import { ProtectedClassroom } from "@/components/ProtectedClassroom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, Sparkles } from "lucide-react";

const gradeInfo: Record<string, { title: string; description: string; icon: string }> = {
  preschool: {
    title: "Hành trình đếm bánh chưng cùng chú Cuội",
    description: "Khám phá số đếm qua câu chuyện dân gian",
    icon: "🌙"
  },
  grade1: {
    title: "Tí và cuộc đua cùng 12 con giáp",
    description: "Học toán qua truyện 12 con giáp",
    icon: "🐲"
  },
  grade3: {
    title: "Săn kho báu sông Hồng",
    description: "Phiêu lưu toán học trên dòng sông Hồng",
    icon: "🏴‍☠️"
  },
  grade4: {
    title: "Thám hiểm Cổ Loa thành",
    description: "Khám phá lịch sử qua bài toán",
    icon: "🏰"
  },
  grade5: {
    title: "Bảo vệ đất nước cùng Trạng Nguyên",
    description: "Toán học nâng cao với tinh thần yêu nước",
    icon: "🎓"
  }
};

const ClassroomComingSoon = () => {
  const { gradeId } = useParams();
  const navigate = useNavigate();
  const info = gradeInfo[gradeId || ""] || {
    title: "Lớp học",
    description: "Đang phát triển",
    icon: "📚"
  };

  return (
    <ProtectedClassroom>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center space-y-8 animate-fade-in">
          {/* Icon */}
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full border-2 border-primary/20">
              <span className="text-6xl">{info.icon}</span>
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {info.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {info.description}
            </p>
          </div>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
            <Construction className="w-5 h-5" />
            <span className="font-semibold">Sắp ra mắt</span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground max-w-md mx-auto">
            Chúng tôi đang xây dựng những câu chuyện và thử thách thú vị cho lớp học này. 
            Hãy quay lại sau nhé!
          </p>

          {/* Back Button */}
          <Button
            onClick={() => navigate("/")}
            size="lg"
            variant="outline"
            className="gap-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay về trang chủ
          </Button>
        </div>
      </div>
    </ProtectedClassroom>
  );
};

export default ClassroomComingSoon;
