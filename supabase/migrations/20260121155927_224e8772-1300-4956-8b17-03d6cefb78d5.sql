-- Create storage bucket for library documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'library-documents', 
  'library-documents', 
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
);

-- Create library_documents table for metadata
CREATE TABLE public.library_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  grade TEXT NOT NULL, -- mam-non, lop-1, lop-2, etc.
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL, -- pdf, doc, docx, txt
  download_count INTEGER NOT NULL DEFAULT 0,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.library_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all documents
CREATE POLICY "Authenticated users can view documents"
ON public.library_documents
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Policy: Teachers/Admins can insert documents
CREATE POLICY "Teachers can upload documents"
ON public.library_documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('teacher', 'admin')
  )
);

-- Policy: Teachers can update their own documents, Admins can update all
CREATE POLICY "Teachers can update own documents"
ON public.library_documents
FOR UPDATE
USING (
  uploaded_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy: Teachers can delete their own documents, Admins can delete all
CREATE POLICY "Teachers can delete own documents"
ON public.library_documents
FOR DELETE
USING (
  uploaded_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Storage policies for library-documents bucket
-- Authenticated users can download files
CREATE POLICY "Authenticated users can download library files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'library-documents' AND
  auth.uid() IS NOT NULL
);

-- Teachers/Admins can upload files
CREATE POLICY "Teachers can upload library files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'library-documents' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('teacher', 'admin')
  )
);

-- Teachers can delete their own files, Admins can delete all
CREATE POLICY "Teachers can delete library files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'library-documents' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_library_documents_updated_at
BEFORE UPDATE ON public.library_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();