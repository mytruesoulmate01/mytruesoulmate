-- Add email verification columns to user_registration table
ALTER TABLE user_registration 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_token 
ON user_registration(email_verification_token) 
WHERE email_verification_token IS NOT NULL;

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Email verification columns added successfully';
END $$;
