import { useState, useRef } from 'react';
import { Loader2, Send, MessageCircle, Trash2, Heart, Reply, ChevronDown, ChevronUp, Smile } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTopicComments, CommentWithProfile } from '@/hooks/useTopicComments';
import { formatDistanceToNow } from 'date-fns';
import { vi as viLocale } from 'date-fns/locale';
import { enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
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
  t: any;
  language: string;
}

const CommentItem = ({
  comment,
  currentUserId,
  onDelete,
  onLike,
  onReply,
  isSubmitting,
  isReply = false,
  t,
  language,
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

  const formattedDate = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: false,
    locale: language === "vi" ? viLocale : enUS,
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
            {!comment.is_admin_reply && comment.avatar?.startsWith("http") ? (
              <AvatarImage src={comment.avatar} alt={comment.display_name} className="object-cover" />
            ) : null}
            <AvatarFallback className={cn(
              "font-bold text-lg",
              comment.is_admin_reply ? "bg-success/20 text-success" : "bg-primary/10 text-primary"
            )}>
              {comment.is_admin_reply ? "👨‍🏫" : (comment.avatar?.startsWith("http") ? "👤" : comment.avatar)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-foreground text-sm md:text-base">
                {comment.display_name}
              </span>
              {comment.is_admin_reply && (
                <span className="px-2 py-0.5 bg-success/20 text-success text-xs font-semibold rounded-full">
                  {t.commentsTab.teacher}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {t.commentsTab.sentAt} {formattedDate}
              </span>
              
              {/* Like count badge */}
              <div className="flex items-center gap-1 text-primary ml-auto">
                <span className="text-lg">👍</span>
                <span className="font-bold text-sm">{comment.likes_count}</span>
              </div>
            </div>
            
            {/* User info subtitle */}
            <p className="text-xs text-muted-foreground mt-0.5">
              {comment.is_admin_reply ? t.commentsTab.teacherSupport : t.commentsTab.studentSchool}
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

        {/* Comment Content */}
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
            <span>{t.commentsTab.like}</span>
          </button>

          {!isReply && (
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Reply className="h-4 w-4" />
              <span>{t.commentsTab.reply}</span>
            </button>
          )}
        </div>

        {/* Reply Input */}
        {showReplyInput && (
          <div className="mt-4 pt-4 border-t border-border/50 ml-0 md:ml-14">
            <div className="flex items-center gap-2">
              <Input
                placeholder={t.commentsTab.replyPlaceholder}
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
                {t.commentsTab.cancel}
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
          <span>{t.commentsTab.repliesCount.replace("{count}", String(repliesCount))}</span>
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
              t={t}
              language={language}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentsTab = ({ topicId, topicTitle }: CommentsTabProps) => {
  const { t, language } = useLanguage();
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

  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground text-lg">{t.commentsTab.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Comment Input */}
      <div className="flex items-center gap-3 bg-[#FFF5E6] rounded-full border-2 border-[#F5DEB3] p-2 pl-4 shadow-sm">
        <Input
          placeholder={t.commentsTab.inputPlaceholder}
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
          {t.commentsTab.totalComments.replace("{count}", String(totalComments))}
        </span>
      </div>

      {/* Comments List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">{t.commentsTab.noComments}</p>
            <p className="text-sm">{t.commentsTab.beFirst}</p>
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
              t={t}
              language={language}
            />
          ))
        )}
      </div>
    </div>
  );
};