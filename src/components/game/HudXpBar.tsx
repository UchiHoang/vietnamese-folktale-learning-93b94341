import { Progress } from "@/components/ui/progress";
import { Trophy, Star } from "lucide-react";

interface HudXpBarProps {
  totalXp: number;
  currentQuestion: number;
  totalQuestions: number;
  levelTitle: string;
}

export const HudXpBar = ({ 
  totalXp, 
  currentQuestion, 
  totalQuestions,
  levelTitle 
}: HudXpBarProps) => {
  const progressPercent = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="w-full bg-card/80 backdrop-blur-sm border-b border-primary/20 p-4 shadow-sm">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Level Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-heading font-bold text-primary">
            {levelTitle}
          </h2>
          
          {/* XP Counter */}
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Star className="w-5 h-5 text-primary fill-primary" />
            <span className="text-lg font-bold text-primary">
              {totalXp} XP
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Câu hỏi {currentQuestion} / {totalQuestions}
            </span>
            <span className="text-muted-foreground">
              {Math.round(progressPercent)}% hoàn thành
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>
      </div>
    </div>
  );
};
