-- =====================================================
-- 003: Create user_details table
-- Stores extended user profile data for matrimonial information
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_id TEXT,
  
  -- Personal Details
  name TEXT,
  address TEXT,
  mobile_number TEXT,
  age INTEGER,
  dob DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  
  -- Social Media Details
  facebook TEXT,
  instagram TEXT,
  twitter TEXT,
  linkedin TEXT,
  
  -- Education & Employment Details
  education TEXT,
  employment TEXT,
  income TEXT,
  
  -- Marriage Details
  engagement TEXT,
  marriage TEXT,
  
  -- Family Member Details
  father_name TEXT,
  mother_name TEXT,
  brother_name TEXT,
  sister_name TEXT,
  
  -- Criminal Record Details
  court_case TEXT,
  police_record TEXT,
  
  -- Expectation Details
  expectation_details TEXT,
  
  -- Trust Score
  truscore INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint on user_id (one detail record per user)
  CONSTRAINT unique_user_details UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "user_details_select_own" ON public.user_details
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_details_insert_own" ON public.user_details
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_details_update_own" ON public.user_details
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_details_delete_own" ON public.user_details
  FOR DELETE USING (auth.uid() = user_id);

-- Policy to allow viewing shared profiles (will be refined in sharing table)
CREATE POLICY "user_details_select_shared" ON public.user_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_share_details usd
      WHERE usd.user_id = public.user_details.user_id
      AND usd.recipient_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_details_user_id ON public.user_details(user_id);
CREATE INDEX IF NOT EXISTS idx_user_details_email ON public.user_details(email_id);

-- Updated at trigger
CREATE TRIGGER user_details_updated_at
  BEFORE UPDATE ON public.user_details
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
