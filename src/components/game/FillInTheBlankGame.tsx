import { useState, memo, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface BlankQuestion {
  id: string;
  text: string;
  blanks: { position: number; answer: string; placeholder?: string }[];
  explanation?: string;
}

interface FillInTheBlankGameProps {
  question: BlankQuestion;
  onComplete: (isCorrect: boolean) => void;
}

const BLANK_MARKER = "___";

const FillInTheBlankGameComponent = ({ question, onComplete }: FillInTheBlankGameProps) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleSubmit = () => {
    const correct = question.blanks.every((blank, index) => {
      const userAnswer = answers[index]?.trim().toLowerCase();
      const correctAnswer = blank.answer.trim().toLowerCase();
      return userAnswer === correctAnswer;
    });

    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleContinue = () => {
    onCompleteRef.current(isCorrect);
  };

  // Parse text và chèn ô trống. Hỗ trợ 2 kiểu dữ liệu:
  // 1) Có marker "___" trong câu hỏi (lớp 2 đang dùng)
  // 2) Không có marker, dùng vị trí `position` trong mảng blanks (các lớp khác)
  const renderTextWithBlanks = useMemo(() => {
    const text = question.text;
    const parts: React.ReactNode[] = [];

    const renderBlank = (blankIndex: number, blankConfig: { position?: number; answer: string; placeholder?: string }) => {
      const currentBlankIndex = blankIndex;
      const isBlankCorrect =
        showFeedback &&
        answers[currentBlankIndex]?.trim().toLowerCase() === blankConfig.answer.trim().toLowerCase();
      const isBlankIncorrect = showFeedback && !isBlankCorrect;

      return (
        <span key={`blank-${blankIndex}`} className="inline-flex items-center mx-1 align-middle">
          <Input
            type="text"
            value={answers[currentBlankIndex] || ""}
            onChange={(e) =>
              setAnswers((prev) => ({
                ...prev,
                [currentBlankIndex]: e.target.value,
              }))
            }
            disabled={showFeedback}
            placeholder={blankConfig.placeholder || "?"}
            className={`
              w-20 md:w-24 h-9 text-center text-base font-medium
              ${isBlankCorrect ? "border-green-500 bg-green-50 text-green-700" : ""}
              ${isBlankIncorrect ? "border-red-500 bg-red-50 text-red-700" : ""}
              ${!showFeedback ? "border-primary/40 focus:border-primary" : ""}
            `}
          />
          {showFeedback && (
            <span className="ml-1">
              {isBlankCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </span>
          )}
        </span>
      );
    };

    const markerRegex = /_{2,}/g;
    const hasMarkers = markerRegex.test(text);

    if (hasMarkers) {
      markerRegex.lastIndex = 0;
      let currentIndex = 0;
      let blankIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = markerRegex.exec(text)) !== null) {
        if (match.index > currentIndex) {
          parts.push(
            <span key={`text-${currentIndex}`}>{text.slice(currentIndex, match.index)}</span>
          );
        }

        const blankConfig = question.blanks[blankIndex] || { answer: "", placeholder: "?" };
        parts.push(renderBlank(blankIndex, blankConfig));

        currentIndex = match.index + BLANK_MARKER.length;
        blankIndex++;
      }

      if (currentIndex < text.length) {
        parts.push(<span key="text-end">{text.slice(currentIndex)}</span>);
      }
    } else {
      const sortedBlanks = [...question.blanks].map((b, idx) => ({ ...b, idx })).sort((a, b) => a.position - b.position);
      let currentIndex = 0;

      sortedBlanks.forEach((blank, order) => {
        const pos = Math.max(0, Math.min(blank.position, text.length));
        if (pos > currentIndex) {
          parts.push(<span key={`text-${currentIndex}`}>{text.slice(currentIndex, pos)}</span>);
        }
        parts.push(renderBlank(blank.idx, blank));
        currentIndex = pos;
      });

      if (currentIndex < text.length) {
        parts.push(<span key="text-end">{text.slice(currentIndex)}</span>);
      }
    }

    return parts;
  }, [question.text, question.blanks, answers, showFeedback]);

  const allBlanksFilled = question.blanks.every((_, index) => 
    answers[index]?.trim().length > 0
  );

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg border-2 border-primary/20">
        <h2 className="text-xl md:text-2xl font-heading font-bold text-center mb-6">
          Điền vào chỗ trống
        </h2>

        <div className="text-lg leading-relaxed mb-6 flex flex-wrap items-center">
          {renderTextWithBlanks}
        </div>

        {!showFeedback && allBlanksFilled && (
          <div className="text-center mt-6">
            <Button onClick={handleSubmit} size="lg">
              ✅ Kiểm tra đáp án
            </Button>
          </div>
        )}

        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-lg ${
              isCorrect 
                ? "bg-green-100 text-green-800" 
                : "bg-orange-100 text-orange-800"
            }`}
          >
            <p className="font-semibold mb-2">
              {isCorrect ? "🎉 Chính xác!" : "💡 Gần đúng rồi!"}
            </p>
            {question.explanation && (
              <p className="text-sm">{question.explanation}</p>
            )}
            {!isCorrect && (
              <div className="mt-3 text-sm">
                <p className="font-medium">Đáp án đúng:</p>
                {question.blanks.map((blank, idx) => (
                  <p key={idx}>Chỗ trống {idx + 1}: <span className="font-bold">{blank.answer}</span></p>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {showFeedback && (
          <div className="text-center mt-4">
            <Button onClick={handleContinue} size="lg" className="animate-fade-in gap-2">
              Tiếp tục <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const FillInTheBlankGame = memo(FillInTheBlankGameComponent);
