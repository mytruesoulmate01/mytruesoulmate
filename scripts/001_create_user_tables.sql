-- ================================================
-- USER DETAILS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  phone TEXT,
  profile_image_url TEXT,
  
  -- Address fields
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  
  -- Additional profile fields
  bio TEXT,
  occupation TEXT,
  education TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_details
DROP POLICY IF EXISTS "Users can view own details" ON public.user_details;
CREATE POLICY "Users can view own details" ON public.user_details
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own details" ON public.user_details;
CREATE POLICY "Users can insert own details" ON public.user_details
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own details" ON public.user_details;
CREATE POLICY "Users can update own details" ON public.user_details
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================
-- TRUSTSCORE TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.trustscore (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  total_score INTEGER DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  score_percentage DECIMAL(5,2) DEFAULT 0 CHECK (score_percentage >= 0 AND score_percentage <= 100),
  trust_level TEXT DEFAULT 'unverified' CHECK (trust_level IN ('unverified', 'basic', 'verified', 'premium', 'elite')),
  
  identity_verified BOOLEAN DEFAULT FALSE,
  education_verified BOOLEAN DEFAULT FALSE,
  employment_verified BOOLEAN DEFAULT FALSE,
  address_verified BOOLEAN DEFAULT FALSE,
  social_verified BOOLEAN DEFAULT FALSE,
  background_verified BOOLEAN DEFAULT FALSE,
  
  identity_doc_url TEXT,
  education_doc_url TEXT,
  employment_doc_url TEXT,
  address_doc_url TEXT,
  
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

ALTER TABLE public.trustscore ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own trustscore" ON public.trustscore;
CREATE POLICY "Users can view own trustscore" ON public.trustscore
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own trustscore" ON public.trustscore;
CREATE POLICY "Users can insert own trustscore" ON public.trustscore
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own trustscore" ON public.trustscore;
CREATE POLICY "Users can update own trustscore" ON public.trustscore
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ================================================
-- USER SHARE DETAILS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_share_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  share_enabled BOOLEAN DEFAULT FALSE,
  share_basic_info BOOLEAN DEFAULT TRUE,
  share_contact_info BOOLEAN DEFAULT FALSE,
  share_family_info BOOLEAN DEFAULT FALSE,
  share_education_info BOOLEAN DEFAULT TRUE,
  share_career_info BOOLEAN DEFAULT TRUE,
  share_photos BOOLEAN DEFAULT TRUE,
  share_trustscore BOOLEAN DEFAULT TRUE,
  share_verification_badges BOOLEAN DEFAULT TRUE,
  
  require_login_to_view BOOLEAN DEFAULT FALSE,
  allow_download BOOLEAN DEFAULT FALSE,
  watermark_photos BOOLEAN DEFAULT TRUE,
  hide_contact_until_connected BOOLEAN DEFAULT TRUE,
  
  share_code TEXT UNIQUE,
  share_url TEXT,
  share_expires_at TIMESTAMPTZ,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

ALTER TABLE public.user_share_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own share settings" ON public.user_share_details;
CREATE POLICY "Users can view own share settings" ON public.user_share_details
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own share settings" ON public.user_share_details;
CREATE POLICY "Users can insert own share settings" ON public.user_share_details
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own share settings" ON public.user_share_details;
CREATE POLICY "Users can update own share settings" ON public.user_share_details
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own share settings" ON public.user_share_details;
CREATE POLICY "Users can delete own share settings" ON public.user_share_details
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ================================================
-- TRUST CONNECTIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.trust_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  message TEXT,
  connection_type TEXT DEFAULT 'standard' CHECK (connection_type IN ('standard', 'premium', 'family')),
  
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(sender_user_id, recipient_user_id)
);

ALTER TABLE public.trust_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own connections" ON public.trust_connections;
CREATE POLICY "Users can view own connections" ON public.trust_connections
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_user_id OR auth.uid() = recipient_user_id);

DROP POLICY IF EXISTS "Users can create connection requests" ON public.trust_connections;
CREATE POLICY "Users can create connection requests" ON public.trust_connections
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_user_id);

DROP POLICY IF EXISTS "Users can update own connections" ON public.trust_connections;
CREATE POLICY "Users can update own connections" ON public.trust_connections
  FOR UPDATE TO authenticated
  USING (auth.uid() = sender_user_id OR auth.uid() = recipient_user_id);

DROP POLICY IF EXISTS "Users can delete own connections" ON public.trust_connections;
CREATE POLICY "Users can delete own connections" ON public.trust_connections
  FOR DELETE TO authenticated
  USING (auth.uid() = sender_user_id OR auth.uid() = recipient_user_id);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX IF NOT EXISTS idx_user_details_user_id ON public.user_details(user_id);
CREATE INDEX IF NOT EXISTS idx_user_details_email ON public.user_details(email);
CREATE INDEX IF NOT EXISTS idx_trustscore_user_id ON public.trustscore(user_id);
CREATE INDEX IF NOT EXISTS idx_user_share_details_user_id ON public.user_share_details(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_connections_sender ON public.trust_connections(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_trust_connections_recipient ON public.trust_connections(recipient_user_id);
