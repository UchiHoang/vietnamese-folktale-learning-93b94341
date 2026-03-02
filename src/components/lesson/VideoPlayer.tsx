import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play, Sparkles, Trophy, Star } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  const [hasMarkedComplete, setHasMarkedComplete] = useState(isCompleted);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    setHasMarkedComplete(isCompleted);
  }, [isCompleted]);

  const handleMarkComplete = useCallback(async () => {
    if (hasMarkedComplete || isLoading) return;
    
    setIsLoading(true);
    
    const triggerCelebration = () => {
      setHasMarkedComplete(true);
      setJustCompleted(true);
      setShowConfetti(true);
      setShowOverlay(true);
      playSound(SOUND_URLS.complete, 0.5);
      setTimeout(() => playSound(SOUND_URLS.xp, 0.4), 400);
      setTimeout(() => setShowConfetti(false), 5000);
      setTimeout(() => setShowOverlay(false), 6000);
      setTimeout(() => setJustCompleted(false), 6000);
    };

    if (onComplete) {
      try {
        await onComplete();
        triggerCelebration();
      } catch (error) {
        console.error("Error completing topic:", error);
        toast.error(t.videoPlayer.saveError);
      }
    } else {
      triggerCelebration();
    }
    
    setIsLoading(false);
  }, [topicId, onComplete, hasMarkedComplete, isLoading, t]);

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={400}
          colors={["#FFD700", "#FFA500", "#FFE066", "#FFCC00", "#FF6B6B", "#4ECDC4", "#A78BFA"]}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 9999 }}
        />
      )}

      {/* ===== FULLSCREEN CELEBRATION OVERLAY ===== */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Center celebration card */}
            <motion.div
              className="relative flex flex-col items-center gap-4 p-8 md:p-12"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 150, delay: 0.1 }}
            >
              {/* Glow ring */}
              <motion.div
                className="absolute inset-0 rounded-3xl bg-primary/10 blur-3xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />

              {/* Trophy icon */}
              <motion.div
                className="relative"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <motion.div
                  className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/30 flex items-center justify-center"
                  animate={{ boxShadow: ["0 0 20px hsl(var(--primary)/0.2)", "0 0 60px hsl(var(--primary)/0.4)", "0 0 20px hsl(var(--primary)/0.2)"] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Trophy className="h-12 w-12 md:h-14 md:w-14 text-primary" />
                </motion.div>

                {/* Orbiting stars */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{ top: "50%", left: "50%" }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3 + i, ease: "linear", delay: i * 0.3 }}
                  >
                    <motion.div style={{ transform: `translateX(${50 + i * 10}px) translateY(-50%)` }}>
                      <Star className="h-4 w-4 text-primary fill-primary" />
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-3xl md:text-4xl font-extrabold text-foreground text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t.videoPlayer.excellent}
              </motion.h2>

              <motion.p
                className="text-lg text-muted-foreground text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                {t.videoPlayer.lessonCompleted}
              </motion.p>

              {/* Floating XP badge */}
              <motion.div
                className="relative mt-2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.6 }}
              >
                <motion.div
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 shadow-2xl flex items-center gap-3"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <Sparkles className="h-7 w-7 text-primary-foreground" />
                  <span className="text-3xl md:text-4xl font-black text-primary-foreground tracking-tight">
                    +20 XP
                  </span>
                </motion.div>

                {/* Radiating particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary"
                    style={{ top: "50%", left: "50%" }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos((i * Math.PI * 2) / 6) * 80,
                      y: Math.sin((i * Math.PI * 2) / 6) * 80,
                      opacity: [1, 0],
                      scale: [1, 0],
                    }}
                    transition={{ duration: 1.2, delay: 0.7 + i * 0.08, ease: "easeOut" }}
                  />
                ))}
              </motion.div>

              {/* Auto-dismiss hint */}
              <motion.div
                className="mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <motion.div
                  className="h-1 w-32 rounded-full bg-muted overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 4.5, ease: "linear", delay: 1.5 }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <div className="relative flex items-center justify-between p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              {hasMarkedComplete ? (
                <motion.div
                  key="completed"
                  initial={justCompleted ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 14, stiffness: 200 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t.videoPlayer.completed}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary" />
                      {t.videoPlayer.earnedXP}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="incomplete" className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Play className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t.videoPlayer.watchedVideo}</p>
                    <p className="text-xs text-muted-foreground">{t.videoPlayer.clickToMark}</p>
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
              {isLoading ? t.videoPlayer.saving : t.videoPlayer.completeButton}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};