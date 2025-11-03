import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface PrologueSlide {
  id: string;
  bg?: string;
  sprite: string;
  speaker: string;
  text: string;
}

interface StoryIntroProps {
  prologue: PrologueSlide[];
  onComplete: () => void;
}

export const StoryIntro = ({ prologue, onComplete }: StoryIntroProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < prologue.length - 1) {
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
          <div className="bg-primary/10 p-8 flex flex-col items-center gap-2">
            <img 
              src={`/${prologue[currentSlide].sprite}`}
              alt={prologue[currentSlide].speaker}
              className="w-48 h-48 object-contain"
            />
            <p className="text-sm font-semibold text-primary">{prologue[currentSlide].speaker}</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {prologue[currentSlide].text}
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 py-4">
              {prologue.map((_, index) => (
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
                {currentSlide < prologue.length - 1 ? (
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
