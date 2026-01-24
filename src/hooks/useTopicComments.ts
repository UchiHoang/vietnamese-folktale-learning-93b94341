import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  user_id: string;
  topic_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  is_admin_reply: boolean;
}

export interface CommentWithProfile extends Comment {
  display_name: string;
  avatar: string;
  likes_count: number;
  is_liked: boolean;
  replies?: CommentWithProfile[];
}

export const useTopicComments = (topicId: string | null) => {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // Fetch comments for current topic
  const fetchComments = useCallback(async () => {
    if (!topicId) {
      setComments([]);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setIsLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const commentIds = commentsData.map(c => c.id);

      // Fetch profiles, likes count, and user's likes in parallel
      const [profilesResult, likesResult, userLikesResult] = await Promise.all([
        supabase.from('profiles').select('id, display_name, avatar').in('id', userIds),
        supabase.from('comment_likes').select('comment_id').in('comment_id', commentIds),
        currentUserId 
          ? supabase.from('comment_likes').select('comment_id').eq('user_id', currentUserId).in('comment_id', commentIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (profilesResult.error) throw profilesResult.error;

      // Create maps
      const profilesMap = new Map(
        profilesResult.data?.map(p => [p.id, { display_name: p.display_name, avatar: p.avatar }]) || []
      );

      // Count likes per comment
      const likesCountMap = new Map<string, number>();
      likesResult.data?.forEach(like => {
        likesCountMap.set(like.comment_id, (likesCountMap.get(like.comment_id) || 0) + 1);
      });

      // User's liked comments
      const userLikedSet = new Set(userLikesResult.data?.map(l => l.comment_id) || []);

      // Build comments with profiles
      const allComments: CommentWithProfile[] = commentsData.map(comment => ({
        ...comment,
        display_name: profilesMap.get(comment.user_id)?.display_name || 'Ẩn danh',
        avatar: profilesMap.get(comment.user_id)?.avatar || '👤',
        likes_count: likesCountMap.get(comment.id) || 0,
        is_liked: userLikedSet.has(comment.id),
        replies: [],
      }));

      // Organize into tree structure (parent comments with nested replies)
      const parentComments: CommentWithProfile[] = [];
      const repliesMap = new Map<string, CommentWithProfile[]>();

      allComments.forEach(comment => {
        if (comment.parent_id) {
          const existing = repliesMap.get(comment.parent_id) || [];
          existing.push(comment);
          repliesMap.set(comment.parent_id, existing);
        } else {
          parentComments.push(comment);
        }
      });

      // Attach replies to parents
      parentComments.forEach(parent => {
        parent.replies = repliesMap.get(parent.id) || [];
      });

      // Sort parent comments by newest first
      parentComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setComments(parentComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải bình luận',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [topicId, currentUserId, toast]);

  // Post a new comment or reply
  const postComment = useCallback(async (content: string, parentId?: string) => {
    if (!topicId || !content.trim()) return false;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng đăng nhập để bình luận',
          variant: 'destructive',
        });
        return false;
      }

      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          topic_id: topicId,
          content: content.trim(),
          parent_id: parentId || null,
        });

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: parentId ? 'Đã gửi phản hồi' : 'Bình luận của bạn đã được gửi',
      });

      await fetchComments();
      return true;
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi bình luận. Vui lòng thử lại.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [topicId, toast, fetchComments]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: 'Đã xóa',
        description: 'Bình luận đã được xóa',
      });

      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa bình luận',
        variant: 'destructive',
      });
    }
  }, [toast, fetchComments]);

  // Toggle like on a comment
  const toggleLike = useCallback(async (commentId: string) => {
    if (!currentUserId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng đăng nhập để thích bình luận',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('comment_id', commentId)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        await supabase
          .from('comment_likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        // Like
        await supabase
          .from('comment_likes')
          .insert({
            user_id: currentUserId,
            comment_id: commentId,
          });
      }

      // Optimistic update
      setComments(prev => updateLikeInComments(prev, commentId, !existingLike));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể thực hiện',
        variant: 'destructive',
      });
    }
  }, [currentUserId, toast]);

  // Helper to update likes in nested comment structure
  const updateLikeInComments = (
    comments: CommentWithProfile[],
    commentId: string,
    isLiked: boolean
  ): CommentWithProfile[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          is_liked: isLiked,
          likes_count: isLiked ? comment.likes_count + 1 : comment.likes_count - 1,
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateLikeInComments(comment.replies, commentId, isLiked),
        };
      }
      return comment;
    });
  };

  // Fetch comments when topic changes
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    isLoading,
    isSubmitting,
    currentUserId,
    postComment,
    deleteComment,
    toggleLike,
    refetch: fetchComments,
  };
};
