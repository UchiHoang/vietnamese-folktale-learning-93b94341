import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AchievementDefinition, getCategoryLabel } from "@/data/achievements";
import Confetti from "react-confetti";

interface AchievementNotificationProps {
  achievement: AchievementDefinition | null;
  onDismiss: () => void;
}

export const AchievementNotification = ({
  achievement,
  onDismiss,
}: AchievementNotificationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (achievement) {
      setShowConfetti(true);
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);

      // Stop confetti after 3 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(confettiTimer);
      };
    }
  }, [achievement, onDismiss]);

  return (
    <>
      {/* Confetti effect */}
      {showConfetti && achievement && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          recycle={false}
          colors={["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 9998 }}
        />
      )}

      <AnimatePresence>
        {achievement && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ type: "spring", damping: 15, stiffness: 150 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-1 shadow-2xl">
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-200%", "200%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />

              <div className="relative bg-card rounded-xl p-6">
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-muted"
                  onClick={onDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Content */}
                <div className="flex items-start gap-4">
                  {/* Icon with glow */}
                  <motion.div
                    className="relative flex-shrink-0"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                    <div className="relative text-6xl bg-primary/10 rounded-2xl p-3">
                      {achievement.icon}
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    >
                      <Sparkles className="h-5 w-5 text-primary" />
                    </motion.div>
                  </motion.div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-medium text-primary mb-1"
                    >
                      🎉 Thành tựu mới!
                    </motion.p>
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-xl font-bold text-foreground mb-1"
                    >
                      {achievement.name}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm text-muted-foreground"
                    >
                      {achievement.description}
                    </motion.p>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                    >
                      {getCategoryLabel(achievement.category)}
                    </motion.span>
                  </div>
                </div>

                {/* Progress bar animation */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-primary rounded-b-xl"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
