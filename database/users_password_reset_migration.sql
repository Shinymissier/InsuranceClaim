-- Run this once in Supabase SQL Editor for an existing users table.
-- It is safe for existing accounts.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_otp_hash TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_otp_expiry TIMESTAMP;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_otp_attempts INTEGER;

UPDATE users
SET password_reset_otp_attempts = 0
WHERE password_reset_otp_attempts IS NULL;

ALTER TABLE users
ALTER COLUMN password_reset_otp_attempts SET DEFAULT 0;

ALTER TABLE users
ALTER COLUMN password_reset_otp_attempts SET NOT NULL;
