import { Loader2, Save, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useTopicNotes } from '@/hooks/useTopicNotes';

interface NotesTabProps {
  topicId: string;
  topicTitle: string;
}

export const NotesTab = ({ topicId, topicTitle }: NotesTabProps) => {
  const {
    content,
    isLoading,
    isSaving,
    handleContentChange,
    handleManualSave,
  } = useTopicNotes(topicId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Đang tải ghi chú...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background p-4 md:p-6 -m-4 md:-m-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-5 w-5 text-primary" />
          <span className="text-sm">
            Ghi chú bài học: <strong className="text-foreground">{topicTitle}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isSaving && (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang lưu...
            </span>
          )}
          <Button
            onClick={handleManualSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            Lưu ghi chú
          </Button>
        </div>
      </div>

     {/* Textarea - Larger and more prominent */}
     <Textarea
  placeholder={`Viết ghi chú của bạn tại đây...

Ví dụ:
• Công thức quan trọng
• Các bước giải bài
• Những điểm cần nhớ`}
  value={content}
  onChange={(e) => handleContentChange(e.target.value)}
  className="min-h-[350px] resize-none text-base leading-relaxed bg-card border-2 focus:border-primary/50 p-4 rounded-xl"
/>


      {/* Hint */}
      <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted rounded-lg p-3">
        <p>
          💡 Ghi chú sẽ tự động lưu sau 2 giây khi bạn ngừng gõ.
        </p>
        <p className="text-xs">
          Chỉ bạn mới xem được ghi chú này
        </p>
      </div>
    </div>
  );
};
