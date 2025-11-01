import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, SkipForward } from "lucide-react";

interface CutsceneFrame {
  id: string;
  bg?: string;
  sprite?: string;
  speaker: string;
  text: string;
}

interface CutscenePlayerProps {
  frames: CutsceneFrame[];
  onComplete: () => void;
  onSkip: () => void;
}

export const CutscenePlayer = ({ frames, onComplete, onSkip }: CutscenePlayerProps) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  
  const currentFrame = frames[currentFrameIndex];
  const isLastFrame = currentFrameIndex === frames.length - 1;

  const handleNext = () => {
    if (isLastFrame) {
      onComplete();
    } else {
      setCurrentFrameIndex(prev => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleNext();
    } else if (e.key === "Escape") {
      onSkip();
    }
  };

  return (
    <div 
      className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden shadow-2xl"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Cutscene"
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10"
        style={{
          backgroundImage: currentFrame.bg ? `url(${currentFrame.bg})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
      
      {/* Character Sprite */}
      {currentFrame.sprite && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade-in">
          <img 
            src={currentFrame.sprite} 
            alt={currentFrame.speaker}
            className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
          />
        </div>
      )}

      {/* Dialogue Box */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-background/80 backdrop-blur-sm p-6 md:p-8 border-t-4 border-primary/20">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-lg md:text-xl font-heading font-bold text-primary">
              {currentFrame.speaker}
            </h3>
          </div>
          
          <p className="text-base md:text-lg leading-relaxed text-foreground">
            {currentFrame.text}
          </p>
          
          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-muted-foreground">
              {currentFrameIndex + 1} / {frames.length}
            </span>
            
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="gap-2"
              >
                <SkipForward className="w-4 h-4" />
                Bỏ qua
              </Button>
              
              <Button
                onClick={handleNext}
                size="lg"
                className="gap-2"
                aria-label={isLastFrame ? "Bắt đầu câu hỏi" : "Tiếp theo"}
              >
                {isLastFrame ? "Bắt đầu" : "Tiếp theo"}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
