-- ================================================
-- MYTRUESOULMATE SUPABASE SCHEMA
-- Authoritative migration script (matches live DB)
-- Last updated: March 2026
-- ================================================

-- ================================================
-- PROFILES TABLE (basic user info, auto-created on signup)
-- ================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  user_role TEXT DEFAULT 'user' CHECK (user_role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- ================================================
-- USER DETAILS TABLE (extended matrimonial profile)
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  marital_status TEXT,
  religion TEXT,
  caste TEXT,
  mother_tongue TEXT,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  blood_group TEXT,
  complexion TEXT,
  body_type TEXT,
  physical_disability TEXT,
  
  -- Education & Career
  education_level TEXT,
  education_details TEXT,
  occupation TEXT,
  company_name TEXT,
  job_title TEXT,
  annual_income TEXT,
  work_location TEXT,
  
  -- Family Information
  father_name TEXT,
  father_occupation TEXT,
  mother_name TEXT,
  mother_occupation TEXT,
  siblings_count INTEGER,
  family_type TEXT,
  family_status TEXT,
  family_values TEXT,
  
  -- Location
  country TEXT,
  state TEXT,
  city TEXT,
  pincode TEXT,
  residential_address TEXT,
  native_place TEXT,
  
  -- Contact
  phone_number TEXT,
  alternate_phone TEXT,
  whatsapp_number TEXT,
  
  -- Lifestyle Preferences
  diet TEXT,
  smoking TEXT,
  drinking TEXT,
  hobbies TEXT[],
  interests TEXT[],
  languages_known TEXT[],
  
  -- Partner Preferences
  partner_age_min INTEGER,
  partner_age_max INTEGER,
  partner_height_min INTEGER,
  partner_height_max INTEGER,
  partner_education TEXT[],
  partner_occupation TEXT[],
  partner_income_min TEXT,
  partner_religion TEXT[],
  partner_caste TEXT[],
  partner_marital_status TEXT[],
  partner_location TEXT[],
  
  -- About
  about_me TEXT,
  expectations TEXT,
  
  -- Metadata
  profile_completion_percentage INTEGER DEFAULT 0,
  is_profile_visible BOOLEAN DEFAULT TRUE,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;

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
-- TRUSTSCORE TABLE (verification scores)
-- ================================================
CREATE TABLE IF NOT EXISTS public.trustscore (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Overall Score
  total_score INTEGER DEFAULT 0,
  max_possible_score INTEGER DEFAULT 100,
  score_percentage DECIMAL(5,2) DEFAULT 0,
  trust_level TEXT DEFAULT 'unverified' CHECK (trust_level IN ('unverified', 'basic', 'verified', 'premium', 'elite')),
  
  -- Individual Verification Scores
  identity_score INTEGER DEFAULT 0,
  education_score INTEGER DEFAULT 0,
  employment_score INTEGER DEFAULT 0,
  address_score INTEGER DEFAULT 0,
  social_score INTEGER DEFAULT 0,
  background_score INTEGER DEFAULT 0,
  
  -- Verification Status Flags
  identity_verified BOOLEAN DEFAULT FALSE,
  education_verified BOOLEAN DEFAULT FALSE,
  employment_verified BOOLEAN DEFAULT FALSE,
  address_verified BOOLEAN DEFAULT FALSE,
  social_verified BOOLEAN DEFAULT FALSE,
  background_verified BOOLEAN DEFAULT FALSE,
  
  -- Verification Dates
  identity_verified_at TIMESTAMPTZ,
  education_verified_at TIMESTAMPTZ,
  employment_verified_at TIMESTAMPTZ,
  address_verified_at TIMESTAMPTZ,
  social_verified_at TIMESTAMPTZ,
  background_verified_at TIMESTAMPTZ,
  
  -- Verification Details (JSONB for flexibility)
  identity_details JSONB DEFAULT '{}',
  education_details JSONB DEFAULT '{}',
  employment_details JSONB DEFAULT '{}',
  address_details JSONB DEFAULT '{}',
  social_details JSONB DEFAULT '{}',
  background_details JSONB DEFAULT '{}',
  
  -- Document URLs (legacy, prefer documents table)
  identity_doc_url TEXT,
  education_doc_url TEXT,
  employment_doc_url TEXT,
  address_doc_url TEXT,
  
  -- Metadata
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
-- DOCUMENTS TABLE (verification documents)
-- ================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Document Information
  document_type TEXT NOT NULL,
  document_category TEXT NOT NULL CHECK (document_category IN ('identity', 'education', 'employment', 'address', 'social', 'background', 'other')),
  document_name TEXT,
  file_path TEXT,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Verification Status
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected', 'expired')),
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Document Details
  document_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  issuing_authority TEXT,
  
  -- Extracted Data
  extracted_data JSONB DEFAULT '{}',
  
  -- Metadata
  is_primary BOOLEAN DEFAULT FALSE,
  upload_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_select_own" ON public.documents;
CREATE POLICY "documents_select_own" ON public.documents
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_insert_own" ON public.documents;
CREATE POLICY "documents_insert_own" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_update_own" ON public.documents;
CREATE POLICY "documents_update_own" ON public.documents
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_delete_own" ON public.documents;
CREATE POLICY "documents_delete_own" ON public.documents
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ================================================
-- USER SHARE DETAILS TABLE (profile sharing)
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_share_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Share Settings
  share_enabled BOOLEAN DEFAULT FALSE,
  share_basic_info BOOLEAN DEFAULT TRUE,
  share_contact_info BOOLEAN DEFAULT FALSE,
  share_family_info BOOLEAN DEFAULT FALSE,
  share_education_info BOOLEAN DEFAULT TRUE,
  share_career_info BOOLEAN DEFAULT TRUE,
  share_photos BOOLEAN DEFAULT TRUE,
  share_trustscore BOOLEAN DEFAULT TRUE,
  share_verification_badges BOOLEAN DEFAULT TRUE,
  
  -- Privacy Settings
  require_login_to_view BOOLEAN DEFAULT FALSE,
  allow_download BOOLEAN DEFAULT FALSE,
  watermark_photos BOOLEAN DEFAULT TRUE,
  hide_contact_until_connected BOOLEAN DEFAULT TRUE,
  
  -- Share Link
  share_code TEXT UNIQUE,
  share_url TEXT,
  share_expires_at TIMESTAMPTZ,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
-- TRUST CONNECTIONS TABLE (user connections)
-- ================================================
CREATE TABLE IF NOT EXISTS public.trust_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Connection Details
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  message TEXT,
  connection_type TEXT DEFAULT 'standard' CHECK (connection_type IN ('standard', 'premium', 'family')),
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate connections
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
-- VERIFICATION TABLE (verification processes)
-- ================================================
CREATE TABLE IF NOT EXISTS public.verification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Verification Type
  verification_type TEXT NOT NULL CHECK (verification_type IN ('identity', 'education', 'employment', 'address', 'social', 'background', 'phone', 'email')),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'verified', 'rejected', 'expired', 'cancelled')),
  
  -- Verification Details
  verification_method TEXT,
  verifier_id UUID,
  verifier_notes TEXT,
  
  -- Request/Response Data
  request_data JSONB DEFAULT '{}',
  response_data JSONB DEFAULT '{}',
  
  -- Third Party Integration
  third_party_provider TEXT,
  third_party_reference TEXT,
  third_party_response JSONB DEFAULT '{}',
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Score Contribution
  score_awarded INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.verification ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "verification_select_own" ON public.verification;
CREATE POLICY "verification_select_own" ON public.verification
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "verification_insert_own" ON public.verification;
CREATE POLICY "verification_insert_own" ON public.verification
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "verification_update_own" ON public.verification;
CREATE POLICY "verification_update_own" ON public.verification
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_details_user_id ON public.user_details(user_id);
CREATE INDEX IF NOT EXISTS idx_trustscore_user_id ON public.trustscore(user_id);
CREATE INDEX IF NOT EXISTS idx_trustscore_level ON public.trustscore(trust_level);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(document_category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_share_details_user_id ON public.user_share_details(user_id);
CREATE INDEX IF NOT EXISTS idx_user_share_details_share_code ON public.user_share_details(share_code);
CREATE INDEX IF NOT EXISTS idx_trust_connections_sender ON public.trust_connections(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_trust_connections_recipient ON public.trust_connections(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_trust_connections_status ON public.trust_connections(status);
CREATE INDEX IF NOT EXISTS idx_verification_user_id ON public.verification(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_type ON public.verification(verification_type);
CREATE INDEX IF NOT EXISTS idx_verification_status ON public.verification(status);

-- ================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_user_details_updated_at ON public.user_details;
CREATE TRIGGER set_user_details_updated_at
  BEFORE UPDATE ON public.user_details
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_trustscore_updated_at ON public.trustscore;
CREATE TRIGGER set_trustscore_updated_at
  BEFORE UPDATE ON public.trustscore
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_documents_updated_at ON public.documents;
CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_user_share_details_updated_at ON public.user_share_details;
CREATE TRIGGER set_user_share_details_updated_at
  BEFORE UPDATE ON public.user_share_details
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_trust_connections_updated_at ON public.trust_connections;
CREATE TRIGGER set_trust_connections_updated_at
  BEFORE UPDATE ON public.trust_connections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_verification_updated_at ON public.verification;
CREATE TRIGGER set_verification_updated_at
  BEFORE UPDATE ON public.verification
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ================================================
-- AUTO-CREATE PROFILE TRIGGER (on user signup)
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
