import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Star } from "lucide-react";

interface StarResultDisplayProps {
  stars: number;
  maxStars?: number;
  showConfetti?: boolean;
  size?: "sm" | "md" | "lg";
}

export const StarResultDisplay = ({ 
  stars, 
  maxStars = 3,
  showConfetti = true,
  size = "lg"
}: StarResultDisplayProps) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isConfettiActive, setIsConfettiActive] = useState(false);

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (stars === maxStars && showConfetti) {
      setIsConfettiActive(true);
      const timer = setTimeout(() => {
        setIsConfettiActive(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [stars, maxStars, showConfetti]);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14 md:w-16 md:h-16"
  };

  const containerGap = {
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-3"
  };

  return (
    <>
      {isConfettiActive && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.15}
          colors={["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 100 }}
        />
      )}
      
      <div className={`flex items-center justify-center ${containerGap[size]}`}>
        <AnimatePresence>
          {Array.from({ length: maxStars }).map((_, index) => {
            const isFilled = index < stars;
            const delay = index * 0.3;

            return (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0, 
                  opacity: 1,
                }}
                transition={{
                  delay,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className="relative"
              >
                {/* Glow effect for filled stars */}
                {isFilled && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: [1, 1.4, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                      delay: delay + 0.3,
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className={`absolute inset-0 rounded-full bg-yellow-400/40 blur-md ${sizeClasses[size]}`}
                  />
                )}
                
                {/* Star icon */}
                <motion.div
                  animate={isFilled ? {
                    y: [0, -5, 0],
                  } : {}}
                  transition={{
                    delay: delay + 0.5,
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Star
                    className={`${sizeClasses[size]} ${
                      isFilled 
                        ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]" 
                        : "text-muted-foreground/30"
                    }`}
                  />
                </motion.div>

                {/* Sparkle effect for filled stars */}
                {isFilled && (
                  <>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1.2, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        delay: delay + 0.4,
                        duration: 0.6,
                      }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full"
                    />
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        delay: delay + 0.5,
                        duration: 0.5,
                      }}
                      className="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-300 rounded-full"
                    />
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Text indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: maxStars * 0.3 + 0.3, duration: 0.4 }}
        className="text-center mt-3"
      >
        {stars === maxStars ? (
          <motion.span 
            className="text-lg font-bold text-yellow-500"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            ⭐ Hoàn hảo! ⭐
          </motion.span>
        ) : stars >= 2 ? (
          <span className="text-base font-medium text-primary">Tuyệt vời!</span>
        ) : stars === 1 ? (
          <span className="text-base font-medium text-muted-foreground">Cố gắng thêm nhé!</span>
        ) : (
          <span className="text-base font-medium text-destructive">Hãy thử lại!</span>
        )}
      </motion.div>
    </>
  );
};
