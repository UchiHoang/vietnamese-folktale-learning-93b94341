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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Ghi chú cho: <strong className="text-foreground">{topicTitle}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Đang lưu...
            </span>
          )}
          <Button
            size="sm"
            onClick={handleManualSave}
            disabled={isSaving}
            className="h-8"
          >
            <Save className="h-4 w-4 mr-1" />
            Lưu
          </Button>
        </div>
      </div>

      {/* Textarea */}
      <Textarea
        placeholder="Viết ghi chú của bạn tại đây... (Tự động lưu sau 2 giây)"
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        className="min-h-[200px] resize-none text-base leading-relaxed"
      />

      {/* Hint */}
      <p className="text-xs text-muted-foreground">
        💡 Ghi chú sẽ tự động lưu sau 2 giây khi bạn ngừng gõ. Bạn cũng có thể nhấn nút "Lưu" để lưu ngay.
      </p>
    </div>
  );
};
