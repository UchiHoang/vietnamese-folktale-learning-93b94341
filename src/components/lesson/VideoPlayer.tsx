import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play } from "lucide-react";
import { toast } from "sonner";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  topicId: string;
  isCompleted?: boolean;
  onComplete?: () => Promise<void>;
}

export const VideoPlayer = ({ videoUrl, title, topicId, isCompleted = false, onComplete }: VideoPlayerProps) => {
  const [hasMarkedComplete, setHasMarkedComplete] = useState(isCompleted);
  const [isLoading, setIsLoading] = useState(false);

  // Sync với prop isCompleted
  useEffect(() => {
    setHasMarkedComplete(isCompleted);
  }, [isCompleted]);

  const handleMarkComplete = useCallback(async () => {
    if (hasMarkedComplete || isLoading) return;
    
    setIsLoading(true);
    
    if (onComplete) {
      try {
        await onComplete();
        setHasMarkedComplete(true);
      } catch (error) {
        console.error("Error completing topic:", error);
        toast.error("Không thể lưu tiến độ. Vui lòng thử lại.");
      }
    } else {
      setHasMarkedComplete(true);
    }
    
    setIsLoading(false);
  }, [topicId, onComplete, hasMarkedComplete, isLoading]);

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="w-full bg-gradient-to-br from-black via-black to-gray-900 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
        <div className="aspect-video w-full relative">
          <iframe
            src={videoUrl}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Complete Button */}
      <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-3">
          {hasMarkedComplete ? (
            <>
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Đã hoàn thành!</p>
                <p className="text-xs text-muted-foreground">Bạn đã nhận +20 XP cho bài học này</p>
              </div>
            </>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Play className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Xem xong video?</p>
                <p className="text-xs text-muted-foreground">Nhấn nút để đánh dấu hoàn thành</p>
              </div>
            </>
          )}
        </div>

        {!hasMarkedComplete && (
          <Button
            onClick={handleMarkComplete}
            disabled={isLoading}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {isLoading ? "Đang lưu..." : "Hoàn thành"}
          </Button>
        )}
      </div>
    </div>
  );
};
