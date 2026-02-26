import { useState, useEffect, memo, useRef } from "react";
import { CheckCircle2, X, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface DragItem {
  id: string;
  content: string;
  image?: string;
  correctSlot: string;
}

interface DropSlot {
  id: string;
  label: string;
  image?: string;
}

interface DragDropGameProps {
  items: DragItem[];
  slots: DropSlot[];
  onComplete: (isCorrect: boolean) => void;
  title?: string;
}

const DragDropGameComponent = ({ items, slots, onComplete, title }: DragDropGameProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [droppedItems, setDroppedItems] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [shuffledItems, setShuffledItems] = useState<DragItem[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setShuffledItems(shuffled);
  }, [items]);

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDrop = (slotId: string) => {
    if (showResults) return;
    if (draggedItem) {
      setDroppedItems(prev => ({
        ...prev,
        [slotId]: draggedItem
      }));
      setDraggedItem(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemove = (slotId: string) => {
    if (showResults) return;
    setDroppedItems(prev => {
      const newItems = { ...prev };
      delete newItems[slotId];
      return newItems;
    });
  };

  const handleCheckResults = () => {
    setShowResults(true);
  };

  const handleContinue = () => {
    const isCorrect = items.every(item => {
      const placedSlot = Object.entries(droppedItems).find(([_, itemId]) => itemId === item.id)?.[0];
      return placedSlot === item.correctSlot;
    });
    onCompleteRef.current(isCorrect);
  };

  const isItemPlaced = (itemId: string) => {
    return Object.values(droppedItems).includes(itemId);
  };

  const isSlotCorrect = (slotId: string) => {
    const itemId = droppedItems[slotId];
    if (!itemId) return null;
    const item = items.find(i => i.id === itemId);
    return item?.correctSlot === slotId;
  };

  const getCorrectItemForSlot = (slotId: string): string => {
    const correctItem = items.find(i => i.correctSlot === slotId);
    return correctItem?.content || "";
  };

  const allItemsPlaced = items.length === Object.keys(droppedItems).length;

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
          : "Kéo các mục vào ô phù hợp"}
      </div>

      {/* Drop Slots */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {slots.map((slot) => {
          const itemId = droppedItems[slot.id];
          const item = items.find(i => i.id === itemId);
          const isCorrect = showResults ? isSlotCorrect(slot.id) : null;

          return (
            <div
              key={slot.id}
              onDrop={() => handleDrop(slot.id)}
              onDragOver={handleDragOver}
              className={`
                relative min-h-[120px] border-2 border-dashed rounded-xl p-4 transition-all duration-300
                ${!showResults && draggedItem ? "border-primary bg-primary/5" : ""}
                ${!showResults && !draggedItem && itemId ? "bg-primary/10 border-primary/50" : ""}
                ${!showResults && !draggedItem && !itemId ? "border-border bg-card" : ""}
                ${showResults && isCorrect === true ? "border-green-500 bg-green-50" : ""}
                ${showResults && isCorrect === false ? "border-red-500 bg-red-50" : ""}
              `}
            >
              <div className="text-sm font-medium text-center mb-2">{slot.label}</div>
              {slot.image && (
                <img src={slot.image} alt={slot.label} className="w-16 h-16 mx-auto mb-2 object-contain opacity-30" />
              )}

              {itemId && item && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  {item.image && (
                    <img src={item.image} alt="" className="w-12 h-12 object-contain" />
                  )}
                  <span className="text-sm font-semibold text-center">{item.content}</span>
                  
                  {!showResults && (
                    <button
                      onClick={() => handleRemove(slot.id)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {showResults && (
                    <div className="absolute top-2 right-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <X className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Show correct answer for wrong slots */}
              {showResults && isCorrect === false && (
                <div className="mt-2 pt-2 border-t border-red-300 text-xs text-red-700">
                  ✅ Đáp án đúng: <strong>{getCorrectItemForSlot(slot.id)}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Draggable Items */}
      {!showResults && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-center">Kéo các mục từ đây:</div>
          <div className="flex flex-wrap justify-center gap-3">
            {shuffledItems.map((item) => {
              if (isItemPlaced(item.id)) return null;

              return (
                <motion.div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  className="cursor-move p-3 bg-card border-2 border-primary rounded-xl shadow-lg hover:scale-105 transition-transform"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex flex-col items-center gap-2">
                    {item.image && (
                      <img src={item.image} alt="" className="w-12 h-12 object-contain" />
                    )}
                    <span className="text-sm font-semibold">{item.content}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="text-center space-y-3">
        <div className="text-sm font-medium">
          Đã xếp: {Object.keys(droppedItems).length} / {items.length}
        </div>
        {allItemsPlaced && !showResults && (
          <Button onClick={handleCheckResults} size="lg" className="animate-fade-in">
            ✅ Kiểm tra đáp án
          </Button>
        )}
        {showResults && (
          <div className="space-y-3">
            <div className={`p-4 rounded-lg animate-fade-in ${
              items.every(item => {
                const placedSlot = Object.entries(droppedItems).find(([_, itemId]) => itemId === item.id)?.[0];
                return placedSlot === item.correctSlot;
              })
                ? "bg-green-100 text-green-800" 
                : "bg-orange-100 text-orange-800"
            }`}>
              <p className="font-semibold">
                {items.every(item => {
                  const placedSlot = Object.entries(droppedItems).find(([_, itemId]) => itemId === item.id)?.[0];
                  return placedSlot === item.correctSlot;
                })
                  ? "🎉 Xuất sắc! Tất cả đều đúng!" 
                  : "💡 Xem lại đáp án đúng nhé!"}
              </p>
            </div>
            <Button onClick={handleContinue} size="lg" className="animate-fade-in gap-2">
              Tiếp tục <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const DragDropGame = memo(DragDropGameComponent);
