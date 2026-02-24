import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import Confetti from "react-confetti";

interface StarRatingProps {
  stars: number; // 0-3
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showConfetti?: boolean;
  enableSound?: boolean;
  delay?: number;
}

// Sound URLs - using free sound effects
const SOUND_URLS = {
  starEarn: "https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3",
  threeStars: "https://cdn.freesound.org/previews/270/270402_5123851-lq.mp3",
};

const playSound = (url: string, volume = 0.5) => {
  try {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(() => {
      // Ignore autoplay errors
    });
  } catch {
    // Ignore sound errors
  }
};

const sizeConfig = {
  sm: { star: "w-8 h-8", gap: "gap-2" },
  md: { star: "w-12 h-12", gap: "gap-3" },
  lg: { star: "w-16 h-16", gap: "gap-4" },
};

export const StarRating = ({
  stars,
  maxStars = 3,
  size = "lg",
  showConfetti = true,
  enableSound = true,
  delay = 300,
}: StarRatingProps) => {
  const [visibleStars, setVisibleStars] = useState(0);
  const [showStarConfetti, setShowStarConfetti] = useState(false);
  const soundPlayed = useRef(false);
  const config = sizeConfig[size];

  useEffect(() => {
    soundPlayed.current = false;
    setVisibleStars(0);
    setShowStarConfetti(false);

    // Animate stars appearing one by one
    for (let i = 1; i <= stars; i++) {
      setTimeout(() => {
        setVisibleStars(i);

        // Play sound for each star
        if (enableSound) {
          playSound(SOUND_URLS.starEarn, 0.3);
        }

        // If this is the last star and we got 3 stars, show confetti + special sound
        if (i === stars && stars === maxStars && !soundPlayed.current) {
          soundPlayed.current = true;
          if (enableSound) {
            setTimeout(() => playSound(SOUND_URLS.threeStars, 0.5), 200);
          }
          if (showConfetti) {
            setShowStarConfetti(true);
            setTimeout(() => setShowStarConfetti(false), 4000);
          }
        }
      }, delay * i);
    }
  }, [stars, maxStars, enableSound, showConfetti, delay]);

  return (
    <>
      {showStarConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          colors={["#FFD700", "#FFA500", "#FFE066", "#FFCC00", "#FF6B6B", "#4ECDC4"]}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 9999 }}
        />
      )}

      <div className={`flex items-center justify-center ${config.gap}`}>
        {Array.from({ length: maxStars }).map((_, index) => {
          const isEarned = index < visibleStars;
          const starIndex = index;

          return (
            <div key={starIndex} className="relative">
              <AnimatePresence mode="wait">
                {isEarned ? (
                  <motion.div
                    key={`earned-${starIndex}`}
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{
                      scale: [0, 1.4, 1],
                      rotate: [-180, 15, 0],
                      opacity: 1,
                    }}
                    transition={{
                      duration: 0.6,
                      ease: "easeOut",
                      times: [0, 0.6, 1],
                    }}
                    className="relative"
                  >
                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 blur-md rounded-full"
                      style={{ background: "radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 70%)" }}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                    {/* Sparkle particles */}
                    {[...Array(3)].map((_, pi) => (
                      <motion.div
                        key={pi}
                        className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300"
                        initial={{
                          x: 0,
                          y: 0,
                          opacity: 1,
                          scale: 1,
                        }}
                        animate={{
                          x: [0, (pi - 1) * 20],
                          y: [0, -15 - pi * 5],
                          opacity: [1, 0],
                          scale: [1, 0],
                        }}
                        transition={{
                          duration: 0.8,
                          delay: 0.2,
                          ease: "easeOut",
                        }}
                        style={{
                          top: "50%",
                          left: "50%",
                        }}
                      />
                    ))}
                    <Star
                      className={`${config.star} text-yellow-400 fill-yellow-400 drop-shadow-lg relative z-10`}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`empty-${starIndex}`}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: 0.3 }}
                  >
                    <Star
                      className={`${config.star} text-muted-foreground/40`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Star count text */}
      <AnimatePresence>
        {visibleStars > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * stars / 1000 + 0.3 }}
            className="text-center text-sm font-medium text-muted-foreground mt-2"
          >
            {stars === maxStars
              ? "⭐ Hoàn hảo!"
              : stars === 2
              ? "🌟 Tuyệt vời!"
              : stars === 1
              ? "💫 Tốt lắm!"
              : ""}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
};
