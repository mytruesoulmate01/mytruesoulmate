-- =====================================================
-- 006: Create user_share_details table
-- Stores profile sharing preferences between users
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_share_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  
  -- Field-level sharing permissions (true = shared)
  name BOOLEAN DEFAULT FALSE,
  address BOOLEAN DEFAULT FALSE,
  mobile_number BOOLEAN DEFAULT FALSE,
  age BOOLEAN DEFAULT FALSE,
  dob BOOLEAN DEFAULT FALSE,
  gender BOOLEAN DEFAULT FALSE,
  email_id BOOLEAN DEFAULT FALSE,
  
  -- Social Media sharing
  facebook BOOLEAN DEFAULT FALSE,
  instagram BOOLEAN DEFAULT FALSE,
  twitter BOOLEAN DEFAULT FALSE,
  linkedin BOOLEAN DEFAULT FALSE,
  
  -- Education & Employment sharing
  education BOOLEAN DEFAULT FALSE,
  employment BOOLEAN DEFAULT FALSE,
  income BOOLEAN DEFAULT FALSE,
  
  -- Marriage Details sharing
  engagement BOOLEAN DEFAULT FALSE,
  marriage BOOLEAN DEFAULT FALSE,
  
  -- Family Details sharing
  father_name BOOLEAN DEFAULT FALSE,
  mother_name BOOLEAN DEFAULT FALSE,
  brother_name BOOLEAN DEFAULT FALSE,
  sister_name BOOLEAN DEFAULT FALSE,
  
  -- Criminal Record sharing
  court_case BOOLEAN DEFAULT FALSE,
  police_record BOOLEAN DEFAULT FALSE,
  
  -- Expectation sharing
  expectation_details BOOLEAN DEFAULT FALSE,
  
  -- Trust Score sharing
  truscore BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  details_shared BOOLEAN DEFAULT FALSE,
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint (one sharing record per user-recipient pair)
  CONSTRAINT unique_share_pair UNIQUE (user_id, recipient_email)
);

-- Enable Row Level Security
ALTER TABLE public.user_share_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own sharing preferences (what they've shared)
CREATE POLICY "share_select_own" ON public.user_share_details
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view shares directed to them (what's been shared with them)
CREATE POLICY "share_select_recipient" ON public.user_share_details
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "share_insert_own" ON public.user_share_details
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "share_update_own" ON public.user_share_details
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "share_delete_own" ON public.user_share_details
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_share_user_id ON public.user_share_details(user_id);
CREATE INDEX IF NOT EXISTS idx_share_recipient_id ON public.user_share_details(recipient_id);
CREATE INDEX IF NOT EXISTS idx_share_recipient_email ON public.user_share_details(recipient_email);

-- Updated at trigger
CREATE TRIGGER share_details_updated_at
  BEFORE UPDATE ON public.user_share_details
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
