-- Add parent_id column for nested replies
ALTER TABLE public.comments 
ADD COLUMN parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- Create index for faster queries on parent_id
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);

-- Create comment_likes table
CREATE TABLE public.comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

-- Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comment_likes
CREATE POLICY "Users can view all likes"
ON public.comment_likes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can like comments"
ON public.comment_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON public.comment_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster like counts
CREATE INDEX idx_comment_likes_comment_id ON public.comment_likes(comment_id);