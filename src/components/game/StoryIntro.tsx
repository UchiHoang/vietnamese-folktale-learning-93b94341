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
      <div className="max-w-3xl w-full animate-fade-in">
        <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Image */}
          <div className="bg-primary/10 p-8 flex justify-center">
            <img 
              src={trangIntro} 
              alt="Trạng Quỳnh"
              className="w-48 h-48 object-contain"
            />
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-heading font-bold text-primary">
                {slides[currentSlide].title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {slides[currentSlide].content}
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 py-4">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? "bg-primary w-8"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="flex-1"
              >
                Bỏ qua
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 gap-2"
              >
                {currentSlide < slides.length - 1 ? (
                  <>
                    Tiếp theo
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  "Bắt đầu"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
