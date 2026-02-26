import { useState, useEffect, memo, useRef, useCallback } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface MatchPair {
  id: string;
  left: string;
  right: string;
  leftImage?: string;
  rightImage?: string;
}

interface MatchingPairsGameProps {
  pairs: MatchPair[];
  onComplete: (isCorrect: boolean) => void;
  title?: string;
}

const MatchingPairsGameComponent = ({ pairs, onComplete, title }: MatchingPairsGameProps) => {
  const [leftSelected, setLeftSelected] = useState<string | null>(null);
  const [rightSelected, setRightSelected] = useState<string | null>(null);
  // paired: leftId -> rightId (chưa kiểm tra đúng sai)
  const [paired, setPaired] = useState<Record<string, string>>({});
  // results: leftId -> boolean (chỉ có sau khi bấm kiểm tra)
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [shuffledRight, setShuffledRight] = useState<MatchPair[]>([]);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const shuffled = [...pairs].sort(() => Math.random() - 0.5);
    setShuffledRight(shuffled);
  }, [pairs]);

  // Tìm leftId đã ghép với rightId
  const getLeftForRight = useCallback((rightId: string): string | null => {
    for (const [left, right] of Object.entries(paired)) {
      if (right === rightId) return left;
    }
    return null;
  }, [paired]);

  const isLeftPaired = (id: string) => id in paired;
  const isRightPaired = (id: string) => getLeftForRight(id) !== null;

  const handleLeftClick = (id: string) => {
    if (showResults) return;
    if (isLeftPaired(id)) return; // đã ghép rồi
    if (leftSelected === id) { setLeftSelected(null); return; }
    setLeftSelected(id);
    if (rightSelected) {
      // Ghép cặp
      setPaired(prev => ({ ...prev, [id]: rightSelected }));
      setLeftSelected(null);
      setRightSelected(null);
    }
  };

  const handleRightClick = (id: string) => {
    if (showResults) return;
    if (isRightPaired(id)) return;
    if (rightSelected === id) { setRightSelected(null); return; }
    setRightSelected(id);
    if (leftSelected) {
      setPaired(prev => ({ ...prev, [leftSelected]: id }));
      setLeftSelected(null);
      setRightSelected(null);
    }
  };

  const handleUnpair = (leftId: string) => {
    if (showResults) return;
    setPaired(prev => {
      const next = { ...prev };
      delete next[leftId];
      return next;
    });
  };

  const handleCheckResults = () => {
    const newResults: Record<string, boolean> = {};
    for (const [leftId, rightId] of Object.entries(paired)) {
      newResults[leftId] = leftId === rightId;
    }
    setResults(newResults);
    setShowResults(true);
    const allCorrect = Object.values(newResults).every(Boolean);
    setTimeout(() => onCompleteRef.current(allCorrect), 2000);
  };

  const allPaired = Object.keys(paired).length === pairs.length;

  const getCardStyle = (id: string, isLeft: boolean) => {
    const isPaired = isLeft ? isLeftPaired(id) : isRightPaired(id);
    const isSelected = isLeft ? leftSelected === id : rightSelected === id;

    if (showResults && isPaired) {
      const leftId = isLeft ? id : getLeftForRight(id)!;
      const correct = results[leftId];
      if (correct) return "bg-green-500 text-white border-green-600";
      return "bg-red-500 text-white border-red-600";
    }
    if (isPaired) return "bg-primary/20 text-primary border-primary/50";
    if (isSelected) return "bg-primary text-primary-foreground border-primary ring-4 ring-primary/50";
    return "bg-card border-border hover:border-primary/50 hover:scale-105 cursor-pointer";
  };

  const getResultIcon = (id: string, isLeft: boolean) => {
    if (!showResults) return null;
    const isPaired = isLeft ? isLeftPaired(id) : isRightPaired(id);
    if (!isPaired) return null;
    const leftId = isLeft ? id : getLeftForRight(id)!;
    return results[leftId]
      ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-white" />
      : <XCircle className="w-5 h-5 flex-shrink-0 text-white" />;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in">
      {title && (
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-center">
          {title}
        </h2>
      )}

      <div className="text-center text-sm text-muted-foreground mb-4">
        {showResults
          ? "Kết quả đáp án của bạn"
          : "Nhấn vào một ô bên trái, sau đó nhấn vào ô tương ứng bên phải để nối cặp"}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-3">
          {pairs.map((pair) => (
            <motion.button
              key={pair.id}
              onClick={() => handleLeftClick(pair.id)}
              disabled={isLeftPaired(pair.id) || showResults}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 relative ${getCardStyle(pair.id, true)}`}
              whileTap={{ scale: (isLeftPaired(pair.id) || showResults) ? 1 : 0.95 }}
            >
              <div className="flex items-center gap-3">
                {pair.leftImage && (
                  <img src={pair.leftImage} alt="" className="w-12 h-12 object-contain" />
                )}
                <span className="text-lg font-semibold flex-1 text-left">{pair.left}</span>
                {getResultIcon(pair.id, true)}
                {isLeftPaired(pair.id) && !showResults && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleUnpair(pair.id); }}
                    className="p-1 rounded-full hover:bg-destructive/20 transition-colors"
                    aria-label="Bỏ ghép"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {shuffledRight.map((pair) => (
            <motion.button
              key={pair.id}
              onClick={() => handleRightClick(pair.id)}
              disabled={isRightPaired(pair.id) || showResults}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${getCardStyle(pair.id, false)}`}
              whileTap={{ scale: (isRightPaired(pair.id) || showResults) ? 1 : 0.95 }}
            >
              <div className="flex items-center gap-3">
                {pair.rightImage && (
                  <img src={pair.rightImage} alt="" className="w-12 h-12 object-contain" />
                )}
                <span className="text-lg font-semibold flex-1 text-left">{pair.right}</span>
                {getResultIcon(pair.id, false)}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="text-center space-y-3">
        <div className="text-sm font-medium">
          Đã nối: {Object.keys(paired).length} / {pairs.length}
        </div>
        {allPaired && !showResults && (
          <Button onClick={handleCheckResults} size="lg" className="animate-fade-in">
            ✅ Kiểm tra đáp án
          </Button>
        )}
      </div>
    </div>
  );
};

export const MatchingPairsGame = memo(MatchingPairsGameComponent);
