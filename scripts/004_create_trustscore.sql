-- =====================================================
-- 004: Create trustscore table
-- Stores trust score verification data
-- =====================================================

CREATE TABLE IF NOT EXISTS public.trustscore (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Overall Trust Score
  total_score INTEGER DEFAULT 0,
  verification_level TEXT DEFAULT 'unverified' CHECK (verification_level IN ('unverified', 'basic', 'verified', 'premium')),
  
  -- Individual Field Verification Status (true = verified)
  name_verified BOOLEAN DEFAULT FALSE,
  address_verified BOOLEAN DEFAULT FALSE,
  mobile_verified BOOLEAN DEFAULT FALSE,
  age_verified BOOLEAN DEFAULT FALSE,
  gender_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Social Media Verification
  facebook_verified BOOLEAN DEFAULT FALSE,
  instagram_verified BOOLEAN DEFAULT FALSE,
  twitter_verified BOOLEAN DEFAULT FALSE,
  linkedin_verified BOOLEAN DEFAULT FALSE,
  
  -- Education & Employment Verification
  education_verified BOOLEAN DEFAULT FALSE,
  employment_verified BOOLEAN DEFAULT FALSE,
  income_verified BOOLEAN DEFAULT FALSE,
  
  -- Family Verification
  father_verified BOOLEAN DEFAULT FALSE,
  mother_verified BOOLEAN DEFAULT FALSE,
  
  -- Background Verification
  court_case_verified BOOLEAN DEFAULT FALSE,
  police_record_verified BOOLEAN DEFAULT FALSE,
  
  -- Verification timestamps
  last_verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  CONSTRAINT unique_trustscore UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.trustscore ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "trustscore_select_own" ON public.trustscore
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "trustscore_insert_own" ON public.trustscore
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trustscore_update_own" ON public.trustscore
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin policy for verification (admins can update any trustscore)
CREATE POLICY "trustscore_admin_update" ON public.trustscore
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- Policy to allow viewing shared trustscores
CREATE POLICY "trustscore_select_shared" ON public.trustscore
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_share_details usd
      WHERE usd.user_id = public.trustscore.user_id
      AND usd.recipient_id = auth.uid()
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_trustscore_user_id ON public.trustscore(user_id);

-- Updated at trigger
CREATE TRIGGER trustscore_updated_at
  BEFORE UPDATE ON public.trustscore
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
