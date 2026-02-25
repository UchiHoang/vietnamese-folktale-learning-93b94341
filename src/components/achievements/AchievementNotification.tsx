import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AchievementDefinition, getCategoryLabel } from "@/data/achievements";
import Confetti from "react-confetti";

interface AchievementNotificationProps {
  achievement: AchievementDefinition | null;
  onDismiss: () => void;
}

// Achievement fanfare sound using Web Audio API
const playAchievementFanfare = () => {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // --- Main fanfare melody (bright ascending) ---
    const melodyNotes = [
      { freq: 523.25, start: 0, dur: 0.15 },     // C5
      { freq: 659.25, start: 0.15, dur: 0.15 },   // E5
      { freq: 783.99, start: 0.3, dur: 0.15 },    // G5
      { freq: 1046.5, start: 0.45, dur: 0.4 },    // C6 (held)
      { freq: 987.77, start: 0.85, dur: 0.12 },   // B5
      { freq: 1046.5, start: 0.97, dur: 0.5 },    // C6 (final)
    ];

    melodyNotes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.25, now + start + 0.03);
      gain.gain.setValueAtTime(0.25, now + start + dur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    });

    // --- Sparkle chime overlay ---
    const chimes = [
      { freq: 2093, start: 0.5, dur: 0.3 },
      { freq: 2637, start: 0.65, dur: 0.25 },
      { freq: 3136, start: 0.8, dur: 0.4 },
    ];
    chimes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.08, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    });

    // Auto-close context
    setTimeout(() => ctx.close(), 2500);
  } catch {
    // Silently fail if audio is blocked
  }
};

export const AchievementNotification = ({
  achievement,
  onDismiss,
}: AchievementNotificationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const soundPlayed = useRef(false);

  useEffect(() => {
    if (achievement) {
      setShowConfetti(true);
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

      // Play achievement fanfare (only once per achievement)
      if (!soundPlayed.current) {
        soundPlayed.current = true;
        playAchievementFanfare();
      }

      // Auto dismiss after 6 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 6000);

      // Stop confetti after 3 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(confettiTimer);
      };
    } else {
      soundPlayed.current = false;
    }
  }, [achievement, onDismiss]);

  return (
    <>
      {/* Confetti effect */}
      {showConfetti && achievement && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={300}
          recycle={false}
          colors={["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#E8A838"]}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 9998 }}
        />
      )}

      <AnimatePresence>
        {achievement && (
          /* Full-screen overlay for center positioning */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onDismiss}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.3, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -30 }}
              transition={{ type: "spring", damping: 14, stiffness: 180 }}
              className="w-[92%] max-w-sm mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-1 shadow-[0_0_60px_rgba(var(--primary),0.35)]">
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />

                <div className="relative bg-card rounded-[1.35rem] px-6 py-8 text-center">
                  {/* Close button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-muted"
                    onClick={onDismiss}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Trophy header */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.15, damping: 10 }}
                    className="mx-auto mb-2 flex items-center justify-center"
                  >
                    <Trophy className="h-6 w-6 text-primary" />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm font-semibold text-primary tracking-wide uppercase mb-4"
                  >
                    🎉 Thành tựu mới!
                  </motion.p>

                  {/* Icon with glow */}
                  <motion.div
                    className="relative mx-auto w-fit mb-5"
                    animate={{
                      scale: [1, 1.08, 1],
                      rotate: [0, 3, -3, 0],
                    }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                  >
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
                    <div className="relative text-7xl bg-primary/10 rounded-2xl p-5">
                      {achievement.icon}
                    </div>
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    >
                      <Sparkles className="h-6 w-6 text-primary" />
                    </motion.div>
                  </motion.div>

                  {/* Text content */}
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-foreground mb-2"
                  >
                    {achievement.name}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-muted-foreground mb-4"
                  >
                    {achievement.description}
                  </motion.p>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="inline-block text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {getCategoryLabel(achievement.category)}
                  </motion.span>

                  {/* Progress bar animation */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-primary rounded-b-[1.35rem]"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 6, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
