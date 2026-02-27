import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Clock } from "lucide-react";
import ReactConfetti from "react-confetti";
import { useState, useEffect } from "react";

interface StudyBreakReminderProps {
  isVisible: boolean;
  extraTimeUsed: boolean;
  onDismiss: () => void;
  onGrantExtraTime: () => void;
  todayTimeSpent: number;
}

const StudyBreakReminder = ({
  isVisible,
  extraTimeUsed,
  onDismiss,
  onGrantExtraTime,
  todayTimeSpent,
}: StudyBreakReminderProps) => {
  const navigate = useNavigate();
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRest = () => {
    onDismiss();
    navigate("/");
  };

  const handleExtraTime = () => {
    onGrantExtraTime();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: "rgba(255, 243, 224, 0.92)" }}
        >
          {showConfetti && (
            <ReactConfetti
              width={windowSize.width}
              height={windowSize.height}
              numberOfPieces={120}
              recycle={false}
              colors={["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA06B"]}
            />
          )}

          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="max-w-md w-full mx-4 bg-white rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden"
          >
            {/* Decorative top */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-accent" />

            {/* Mascot */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, -3, 3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="mb-4"
            >
              <img
                src="/mascot-buffalo.png"
                alt="Trâu Vàng"
                className="w-32 h-32 mx-auto object-contain drop-shadow-lg"
              />
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
            >
              <Clock className="w-4 h-4" />
              <span>Đã học {todayTimeSpent} phút hôm nay!</span>
            </motion.div>

            {/* Message */}
            <h2 className="text-xl font-bold text-foreground mb-2">
              Chăm chỉ quá! 🎉
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Chà, bạn đã học rất chăm chỉ rồi! Trâu Vàng thấy hơi mỏi mắt, 
              chúng mình cùng nghỉ giải lao, uống một ngụm nước và nhìn ra cửa sổ nhé!
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleRest}
                className="w-full rounded-full text-base py-5 bg-primary hover:bg-primary/90"
              >
                <Moon className="w-5 h-5 mr-2" />
                Nghỉ ngơi thôi!
              </Button>

              {!extraTimeUsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="outline"
                    onClick={handleExtraTime}
                    className="w-full rounded-full text-base py-5 border-dashed border-2"
                  >
                    ⏰ Xin thêm 5 phút nữa!
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Chỉ được xin thêm 1 lần mỗi ngày)
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StudyBreakReminder;
