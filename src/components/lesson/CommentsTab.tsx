import { useState } from 'react';
import { Loader2, Send, MessageCircle, Trash2, Heart, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTopicComments, CommentWithProfile } from '@/hooks/useTopicComments';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CommentsTabProps {
  topicId: string;
  topicTitle: string;
}

interface CommentItemProps {
  comment: CommentWithProfile;
  currentUserId: string | null;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
  onReply: (parentId: string, content: string) => Promise<boolean>;
  isSubmitting: boolean;
  isReply?: boolean;
}

const CommentItem = ({
  comment,
  currentUserId,
  onDelete,
  onLike,
  onReply,
  isSubmitting,
  isReply = false,
}: CommentItemProps) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;
    const success = await onReply(comment.id, replyContent);
    if (success) {
      setReplyContent('');
      setShowReplyInput(false);
    }
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitReply();
    }
  };

  const repliesCount = comment.replies?.length || 0;

  return (
    <div className={cn("space-y-2", isReply && "ml-8 border-l-2 border-muted pl-4")}>
      <div className="bg-card p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
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
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Comment Content */}
        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mb-3">
          {comment.content}
        </p>

        {/* Actions: Like & Reply */}
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => onLike(comment.id)}
            className={cn(
              "flex items-center gap-1 transition-colors",
              comment.is_liked
                ? "text-destructive hover:text-destructive/80"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart
              className={cn("h-4 w-4", comment.is_liked && "fill-current")}
            />
            <span>{comment.likes_count > 0 ? comment.likes_count : ''}</span>
            <span className="hidden sm:inline">{comment.is_liked ? 'Đã thích' : 'Thích'}</span>
          </button>

          {!isReply && (
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="h-4 w-4" />
              <span>Trả lời</span>
            </button>
          )}

          {!isReply && repliesCount > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors ml-auto"
            >
              {showReplies ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span>{repliesCount} phản hồi</span>
            </button>
          )}
        </div>

        {/* Reply Input */}
        {showReplyInput && (
          <div className="mt-3 pt-3 border-t space-y-2">
            <Textarea
              placeholder="Viết phản hồi..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={handleReplyKeyDown}
              className="min-h-[60px] resize-none text-sm"
              disabled={isSubmitting}
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowReplyInput(false);
                  setReplyContent('');
                }}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitReply}
                disabled={isSubmitting || !replyContent.trim()}
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
        )}
      </div>

      {/* Replies */}
      {!isReply && showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onDelete={onDelete}
              onLike={onLike}
              onReply={onReply}
              isSubmitting={isSubmitting}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentsTab = ({ topicId, topicTitle }: CommentsTabProps) => {
  const [newComment, setNewComment] = useState('');

  const {
    comments,
    isLoading,
    isSubmitting,
    currentUserId,
    postComment,
    deleteComment,
    toggleLike,
  } = useTopicComments(topicId);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    const success = await postComment(newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    return await postComment(content, parentId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Count total comments including replies
  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  );

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
        <span>
          Hỏi đáp về: <strong className="text-foreground">{topicTitle}</strong>
        </span>
        <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
          {totalComments} bình luận
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
      <ScrollArea className="h-[350px] pr-2">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Chưa có bình luận nào.</p>
            <p className="text-xs">Hãy là người đầu tiên đặt câu hỏi!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onDelete={deleteComment}
                onLike={toggleLike}
                onReply={handleReply}
                isSubmitting={isSubmitting}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
