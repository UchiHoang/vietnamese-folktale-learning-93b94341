-- Add is_admin_reply column to comments table
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS is_admin_reply BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster queries on admin replies
CREATE INDEX IF NOT EXISTS idx_comments_is_admin_reply ON public.comments(is_admin_reply);

-- Update RLS policy to allow admin/teacher to delete any comment
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments or admin can delete any" 
ON public.comments 
FOR DELETE 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'teacher')
  )
);

-- Allow admin/teacher to insert replies with is_admin_reply = true
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
CREATE POLICY "Users can create comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);