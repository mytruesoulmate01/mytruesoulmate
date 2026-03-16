-- =====================================================
-- 007: Create verification table
-- Stores verification request history
-- =====================================================

CREATE TABLE IF NOT EXISTS public.verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Verification Request Info
  verification_type TEXT NOT NULL CHECK (verification_type IN (
    'identity', 'address', 'education', 'employment', 'income',
    'family', 'background', 'social_media', 'full_profile'
  )),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'expired')),
  
  -- Document references
  document_ids UUID[] DEFAULT '{}',
  
  -- Verification Details
  request_notes TEXT,
  verification_notes TEXT,
  rejection_reason TEXT,
  
  -- Verifier Info
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.verification ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "verification_select_own" ON public.verification
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "verification_insert_own" ON public.verification
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "verification_update_own" ON public.verification
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admin policies
CREATE POLICY "verification_admin_select" ON public.verification
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "verification_admin_update" ON public.verification
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role IN ('admin', 'moderator')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_verification_user_id ON public.verification(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_status ON public.verification(status);
CREATE INDEX IF NOT EXISTS idx_verification_type ON public.verification(verification_type);

-- Updated at trigger
CREATE TRIGGER verification_updated_at
  BEFORE UPDATE ON public.verification
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
