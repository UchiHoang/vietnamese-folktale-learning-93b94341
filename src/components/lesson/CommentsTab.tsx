import { useState } from 'react';
import { Loader2, Send, MessageCircle, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTopicComments } from '@/hooks/useTopicComments';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CommentsTabProps {
  topicId: string;
  topicTitle: string;
}

export const CommentsTab = ({ topicId, topicTitle }: CommentsTabProps) => {
  const [newComment, setNewComment] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const {
    comments,
    isLoading,
    isSubmitting,
    postComment,
    deleteComment,
  } = useTopicComments(topicId);

  // Get current user ID
  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  });

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    const success = await postComment(newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Đang tải bình luận...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageCircle className="h-4 w-4" />
        <span>Hỏi đáp về: <strong className="text-foreground">{topicTitle}</strong></span>
        <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
          {comments.length} bình luận
        </span>
      </div>

      {/* New Comment Input */}
      <div className="space-y-2 bg-muted/30 p-3 rounded-lg border">
        <Textarea
          placeholder="Viết câu hỏi hoặc bình luận của bạn... (Nhấn Enter để gửi)"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[80px] resize-none text-base bg-background"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-1" />
            )}
            Gửi
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <ScrollArea className="h-[300px] pr-2">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Chưa có bình luận nào.</p>
            <p className="text-xs">Hãy là người đầu tiên đặt câu hỏi!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-card p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Comment Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{comment.avatar}</span>
                    <div>
                      <span className="font-medium text-sm text-foreground">
                        {comment.display_name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Delete button (only for own comments) */}
                  {currentUserId === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {/* Comment Content */}
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
