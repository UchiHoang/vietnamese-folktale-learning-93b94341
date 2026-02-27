import { useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Lightbulb, ArrowRight } from "lucide-react";
import { Question } from "@/utils/storyLoader";
import { MatchingPairsGame } from "./MatchingPairsGame";
import { DragDropGame } from "./DragDropGame";
import { FillInTheBlankGame } from "./FillInTheBlankGame";
import { CountingGame } from "./CountingGame";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean) => void;
}

const QuestionCardComponent = ({
  question, 
  questionNumber, 
  totalQuestions,
  onAnswer 
}: QuestionCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleAnswer = (index: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
  };

  const handleContinue = () => {
    const isCorrect = selectedAnswer === question.correctAnswer;
    onAnswer(isCorrect);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowHint(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleAnswer(index);
    }
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  // Question progress indicator for special game types
  const QuestionProgress = () => (
    <div className="flex items-center justify-center mb-4">
      <div className="relative flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 via-primary/10 to-accent/15 border border-primary/20 shadow-sm">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-md">
          {questionNumber}
        </div>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-xs text-muted-foreground font-medium">Câu hỏi</span>
          <span className="text-sm font-bold text-foreground">{questionNumber} / {totalQuestions}</span>
        </div>
        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  // Render different game types
  if (question.type === "matching-pairs" && question.pairs) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <QuestionProgress />
        <MatchingPairsGame
          pairs={question.pairs}
          title={question.question}
          onComplete={onAnswer}
        />
      </div>
    );
  }

  if (question.type === "drag-drop" && question.dragItems && question.dropSlots) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <QuestionProgress />
        <DragDropGame
          items={question.dragItems}
          slots={question.dropSlots}
          title={question.question}
          onComplete={onAnswer}
        />
      </div>
    );
  }

  if (question.type === "fill-blank" && question.blanks) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <QuestionProgress />
        <FillInTheBlankGame
          question={{
            id: question.id,
            text: question.question,
            blanks: question.blanks,
            explanation: question.explanation
          }}
          onComplete={onAnswer}
        />
      </div>
    );
  }

  if (question.type === "counting" && question.countingItems && question.countingAnswer !== undefined) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <QuestionProgress />
        <CountingGame
          items={question.countingItems}
          correctAnswer={question.countingAnswer}
          question={question.question}
          explanation={question.explanation}
          onComplete={onAnswer}
        />
      </div>
    );
  }

  // Default: multiple-choice
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Progress */}
      <QuestionProgress />

      {/* Question */}
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg border-2 border-primary/20">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-8">
          {question.question}
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = index === question.correctAnswer;
            const showCorrect = showFeedback && isCorrectOption;
            const showIncorrect = showFeedback && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={showFeedback}
                className={`
                  relative p-6 rounded-xl text-lg font-semibold transition-all duration-300
                  border-2 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/50
                  ${showCorrect ? "bg-green-500 text-white border-green-600" : ""}
                  ${showIncorrect ? "bg-red-500 text-white border-red-600" : ""}
                  ${!showFeedback ? "bg-secondary hover:bg-secondary/80 border-primary/30" : ""}
                  ${showFeedback ? "cursor-not-allowed" : "cursor-pointer"}
                `}
                aria-label={`Đáp án ${String.fromCharCode(65 + index)}: ${option}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex-1 text-left">{option}</span>
                  {showCorrect && <CheckCircle2 className="w-6 h-6 flex-shrink-0" />}
                  {showIncorrect && <XCircle className="w-6 h-6 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div 
            className={`mt-6 p-4 rounded-lg animate-fade-in ${
              isCorrect ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
            }`}
            role="alert"
          >
            <p className="font-semibold mb-2">
              {isCorrect ? "🎉 Chính xác!" : "💡 Gần đúng rồi!"}
            </p>
            <p className="text-sm">{question.explanation}</p>
          </div>
        )}

        {/* Continue button */}
        {showFeedback && (
          <div className="text-center mt-4">
            <Button onClick={handleContinue} size="lg" className="animate-fade-in gap-2">
              Tiếp tục <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Hint Button */}
      {!showFeedback && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHint(!showHint)}
            className="gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            {showHint ? "Ẩn gợi ý" : "Xem gợi ý"}
          </Button>
          {showHint && (
            <p className="mt-3 text-sm text-muted-foreground animate-fade-in">
              💡 Đọc kỹ câu hỏi và suy nghĩ từng bước một nhé!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const QuestionCard = memo(QuestionCardComponent);
