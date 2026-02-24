import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

const SOUND_URLS = {
  complete: "https://cdn.freesound.org/previews/270/270402_5123851-lq.mp3",
  xp: "https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3",
};

const playSound = (url: string, volume = 0.5) => {
  try {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch {}
};

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

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
        setJustCompleted(true);
        setShowConfetti(true);
        playSound(SOUND_URLS.complete, 0.5);
        setTimeout(() => playSound(SOUND_URLS.xp, 0.4), 400);
        setTimeout(() => setShowConfetti(false), 4000);
        setTimeout(() => setJustCompleted(false), 5000);
      } catch (error) {
        console.error("Error completing topic:", error);
        toast.error("Không thể lưu tiến độ. Vui lòng thử lại.");
      }
    } else {
      setHasMarkedComplete(true);
      setJustCompleted(true);
      setShowConfetti(true);
      playSound(SOUND_URLS.complete, 0.5);
      setTimeout(() => setShowConfetti(false), 4000);
      setTimeout(() => setJustCompleted(false), 5000);
    }
    
    setIsLoading(false);
  }, [topicId, onComplete, hasMarkedComplete, isLoading]);

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          colors={["#FFD700", "#FFA500", "#FFE066", "#FFCC00", "#FF6B6B", "#4ECDC4"]}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 9999 }}
        />
      )}

      <div className="space-y-4">
        {/* Video Player */}
        <div className="w-full bg-gradient-to-br from-background via-background to-muted rounded-2xl overflow-hidden shadow-2xl ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
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
        <div className="relative flex items-center justify-between p-4 bg-card rounded-xl border border-border overflow-visible">
          {/* Floating +20 XP */}
          <AnimatePresence>
            {justCompleted && (
              <motion.div
                className="absolute -top-2 right-6 pointer-events-none z-10 flex items-center gap-1"
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 1, 0], y: -60, scale: [0.5, 1.2, 1, 0.8] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
              >
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xl font-bold text-primary drop-shadow-md">+20 XP</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              {hasMarkedComplete ? (
                <motion.div
                  key="completed"
                  initial={justCompleted ? { scale: 0, rotate: -180 } : false}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center relative"
                    animate={justCompleted ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: justCompleted ? 2 : 0, duration: 0.6 }}
                  >
                    <CheckCircle className="h-5 w-5 text-primary" />
                    {justCompleted && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 1, repeat: 2 }}
                      />
                    )}
                  </motion.div>
                  <div>
                    <motion.p
                      className="font-semibold text-foreground"
                      initial={justCompleted ? { opacity: 0, x: -10 } : false}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      Đã hoàn thành!
                    </motion.p>
                    <motion.p
                      className="text-xs text-muted-foreground flex items-center gap-1"
                      initial={justCompleted ? { opacity: 0, x: -10 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Sparkles className="h-3 w-3 text-primary" />
                      Bạn đã nhận +20 XP cho bài học này
                    </motion.p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="incomplete" className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Play className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Xem xong video?</p>
                    <p className="text-xs text-muted-foreground">Nhấn nút để đánh dấu hoàn thành</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
    </>
  );
};
