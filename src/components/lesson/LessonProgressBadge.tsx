import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

interface LessonProgressBadgeProps {
  completedTopics: number;
  totalTopics: number;
  percentage: number;
  compact?: boolean;
}

export const LessonProgressBadge = ({
  completedTopics,
  totalTopics,
  percentage,
  compact = false,
}: LessonProgressBadgeProps) => {
  const isComplete = percentage >= 100;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {isComplete ? (
          <CheckCircle className="h-4 w-4 text-primary" />
        ) : (
          <span className="text-xs font-bold text-primary">{Math.round(percentage)}%</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">
          {completedTopics}/{totalTopics} bài
        </span>
        <span className={`font-bold ${isComplete ? "text-primary" : "text-foreground"}`}>
          {Math.round(percentage)}%
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-1.5 bg-muted"
      />
    </div>
  );
};
