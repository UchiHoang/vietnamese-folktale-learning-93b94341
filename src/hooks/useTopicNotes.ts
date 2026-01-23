import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  user_id: string;
  topic_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useTopicNotes = (topicId: string | null) => {
  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch note for current topic
  const fetchNote = useCallback(async () => {
    if (!topicId) {
      setNote(null);
      setContent('');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('topic_id', topicId)
        .maybeSingle();

      if (error) throw error;

      setNote(data);
      setContent(data?.content || '');
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setIsLoading(false);
    }
  }, [topicId]);

  // Save note (upsert)
  const saveNote = useCallback(async (newContent: string) => {
    if (!topicId) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng đăng nhập để lưu ghi chú',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('notes')
        .upsert(
          {
            user_id: user.id,
            topic_id: topicId,
            content: newContent,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,topic_id',
          }
        )
        .select()
        .single();

      if (error) throw error;

      setNote(data);
      toast({
        title: 'Đã lưu',
        description: 'Ghi chú của bạn đã được lưu',
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu ghi chú. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [topicId, toast]);

  // Auto-save with debounce (2 seconds)
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for auto-save
    debounceTimer.current = setTimeout(() => {
      saveNote(newContent);
    }, 2000);
  }, [saveNote]);

  // Manual save
  const handleManualSave = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    saveNote(content);
  }, [content, saveNote]);

  // Fetch note when topic changes
  useEffect(() => {
    fetchNote();

    // Cleanup debounce timer on unmount or topic change
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [fetchNote]);

  return {
    note,
    content,
    isLoading,
    isSaving,
    handleContentChange,
    handleManualSave,
    refetch: fetchNote,
  };
};
