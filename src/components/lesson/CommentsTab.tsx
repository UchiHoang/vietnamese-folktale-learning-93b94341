import { useState, useRef } from 'react';
import { Loader2, Send, MessageCircle, Trash2, Heart, Reply, ChevronDown, ChevronUp, Smile } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTopicComments, CommentWithProfile } from '@/hooks/useTopicComments';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const EMOJI_LIST = ['😊', '😂', '❤️', '👍', '👏', '🎉', '🔥', '💯', '🤔', '😍', '🙏', '✨', '💪', '😢', '😮', '🥳'];
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

  // Format date nicely
  const formattedDate = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: false,
    locale: vi,
  });

  return (
    <div className={cn("space-y-3", isReply && "ml-10 md:ml-14")}>
      <div className={cn(
        "rounded-xl border p-4 md:p-5 hover:shadow-md transition-all",
        comment.is_admin_reply 
          ? "bg-admin-reply border-success/30" 
          : "bg-[#FFF5E6] border-[#F5DEB3]"
      )}>
        {/* Comment Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className={cn(
            "h-10 w-10 md:h-12 md:w-12 border-2",
            comment.is_admin_reply ? "border-success/40" : "border-primary/20"
          )}>
            <AvatarFallback className={cn(
              "font-bold text-lg",
              comment.is_admin_reply ? "bg-success/20 text-success" : "bg-primary/10 text-primary"
            )}>
              {comment.is_admin_reply ? "👨‍🏫" : comment.avatar}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-foreground text-sm md:text-base">
                {comment.display_name}
              </span>
              {comment.is_admin_reply && (
                <span className="px-2 py-0.5 bg-success/20 text-success text-xs font-semibold rounded-full">
                  Giáo viên
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                gửi bình luận lúc {formattedDate}
              </span>
              
              {/* Like count badge */}
              <div className="flex items-center gap-1 text-primary ml-auto">
                <span className="text-lg">👍</span>
                <span className="font-bold text-sm">{comment.likes_count}</span>
              </div>
            </div>
            
            {/* User info subtitle */}
            <p className="text-xs text-muted-foreground mt-0.5">
              {comment.is_admin_reply ? "Giáo viên • Hỗ trợ học tập" : "Học sinh • Trường Tiểu học"}
            </p>
          </div>

          {/* Delete button (only for own comments) */}
          {currentUserId === comment.user_id && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Comment Content - styled as quote box with white background */}
        <div className="bg-white rounded-lg p-3 md:p-4 ml-0 md:ml-14 mb-3 shadow-sm">
          <p className="text-sm md:text-base text-foreground leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        {/* Actions: Like & Reply */}
        <div className="flex items-center justify-end gap-3 md:gap-4 ml-0 md:ml-14">
          <button
            onClick={() => onLike(comment.id)}
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium transition-colors",
              comment.is_liked
                ? "text-destructive hover:text-destructive/80"
                : "text-muted-foreground hover:text-destructive"
            )}
          >
            <Heart
              className={cn("h-4 w-4", comment.is_liked && "fill-current")}
            />
            <span>Thích</span>
          </button>

          {!isReply && (
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Reply className="h-4 w-4" />
              <span>Trả lời</span>
            </button>
          )}
        </div>

        {/* Reply Input */}
        {showReplyInput && (
          <div className="mt-4 pt-4 border-t border-border/50 ml-0 md:ml-14">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Viết phản hồi..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={handleReplyKeyDown}
                className="flex-1"
                disabled={isSubmitting}
              />
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
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Show/Hide Replies Toggle */}
      {!isReply && repliesCount > 0 && (
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors ml-14"
        >
          {showReplies ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span>{repliesCount} phản hồi</span>
        </button>
      )}

      {/* Replies */}
      {!isReply && showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
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
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground text-lg">Đang tải bình luận...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Comment Input - Prominent at top with emoji picker */}
      <div className="flex items-center gap-3 bg-[#FFF5E6] rounded-full border-2 border-[#F5DEB3] p-2 pl-4 shadow-sm">
        <Input
          placeholder="Nhập bình luận ..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base bg-transparent"
          disabled={isSubmitting}
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={isSubmitting || !newComment.trim()}
          className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shrink-0"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
        
        {/* Emoji Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-warning hover:bg-warning/90 text-white shrink-0"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="end">
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewComment(prev => prev + emoji)}
                  className="text-2xl hover:scale-125 transition-transform p-1 rounded hover:bg-muted"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Total comments count */}
      <div className="flex justify-end">
        <span className="text-sm font-semibold text-foreground">
          Tất cả {totalComments} Bình luận
        </span>
      </div>

      {/* Comments List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Chưa có bình luận nào.</p>
            <p className="text-sm">Hãy là người đầu tiên đặt câu hỏi!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onDelete={deleteComment}
              onLike={toggleLike}
              onReply={handleReply}
              isSubmitting={isSubmitting}
            />
          ))
        )}
      </div>
    </div>
  );
};
