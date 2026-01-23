import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  user_id: string;
  topic_id: string;
  content: string;
  created_at: string;
  user_profile?: {
    display_name: string;
    avatar: string;
  };
}

interface CommentWithProfile extends Comment {
  display_name: string;
  avatar: string;
}

export const useTopicComments = (topicId: string | null) => {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch comments for current topic
  const fetchComments = useCallback(async () => {
    if (!topicId) {
      setComments([]);
      return;
    }

    setIsLoading(true);
    try {
      // First fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setIsLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(commentsData.map(c => c.user_id))];

      // Fetch profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user profiles
      const profilesMap = new Map(
        profilesData?.map(p => [p.id, { display_name: p.display_name, avatar: p.avatar }]) || []
      );

      // Combine comments with profiles
      const commentsWithProfiles: CommentWithProfile[] = commentsData.map(comment => ({
        ...comment,
        display_name: profilesMap.get(comment.user_id)?.display_name || 'Ẩn danh',
        avatar: profilesMap.get(comment.user_id)?.avatar || '👤',
      }));

      setComments(commentsWithProfiles);
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
  }, [topicId, toast]);

  // Post a new comment
  const postComment = useCallback(async (content: string) => {
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
        });

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Bình luận của bạn đã được gửi',
      });

      // Refresh comments
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

      // Refresh comments
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

  // Fetch comments when topic changes
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    isLoading,
    isSubmitting,
    postComment,
    deleteComment,
    refetch: fetchComments,
  };
};
