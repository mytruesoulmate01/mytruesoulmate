-- =====================================================
-- 005: Create documents table
-- Stores user documents for verification
-- =====================================================

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Document Info
  document_type TEXT NOT NULL CHECK (document_type IN (
    'identity', 'address_proof', 'education', 'employment', 
    'income', 'marriage', 'family', 'police_clearance', 'court_record', 'other'
  )),
  document_name TEXT,
  content TEXT, -- Can store document content or metadata
  file_url TEXT, -- URL to stored file (if using Supabase Storage)
  file_type TEXT,
  file_size INTEGER,
  
  -- Verification Status
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "documents_select_own" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "documents_insert_own" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_update_own" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "documents_delete_own" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Admin policy for document verification
CREATE POLICY "documents_admin_select" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

CREATE POLICY "documents_admin_update" ON public.documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_id ON public.documents(doc_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(document_type);

-- Updated at trigger
CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
