import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import trangIntro from "@/assets/trang_intro.png";

interface StoryIntroProps {
  onComplete: () => void;
}

export const StoryIntro = ({ onComplete }: StoryIntroProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Trạng Quỳnh đi thi",
      content: "Ngày xửa ngày xưa, ở một làng quê yên bình, có một cậu bé thông minh và nhanh trí tên là Trạng Quỳnh.",
    },
    {
      title: "Cuộc thi toán học",
      content: "Tin đồn có cuộc thi toán học ở làng bên lan rộng. Trạng Quỳnh quyết định đi thi để giúp đỡ bà con và thử thách trí tuệ của mình.",
    },
    {
      title: "Hành trình bắt đầu",
      content: "Trên đường đi, Trạng Quỳnh sẽ gặp nhiều thử thách toán học thú vị. Hãy cùng giúp Trạng Quỳnh vượt qua 9 thử thách để giành được huy hiệu vàng!",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full animate-fade-in space-y-8">
        {/* Title Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-heading font-bold" style={{ color: '#8B5A8C' }}>
            Trạng Quỳnh đi thi
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Câu bé Trạng Quỳnh chuẩn bị đi thi Toán rồi đó! Hãy giúp Quỳnh vượt qua từng màn thử thách và trở thành &quot;Trạng nhí thông minh&quot; nhé!
          </p>
        </div>

        {/* Character Image */}
        <div className="flex justify-center">
          <div className="bg-card rounded-3xl p-8 shadow-xl">
            <img 
              src={trangIntro} 
              alt="Trạng Quỳnh"
              className="w-64 h-64 object-contain"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={onComplete}
            size="lg"
            className="gap-2 text-lg px-8 py-6"
          >
            Bắt đầu phiêu lưu
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
