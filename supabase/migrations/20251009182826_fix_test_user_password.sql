/*
  # Fix Test User Password

  1. Changes
    - Delete existing test user
    - Recreate test user with proper password hash
    - Ensure profile is linked correctly
    
  2. Security
    - User will have confirmed email
    - Password will be set to '1234'
*/

-- Delete existing test user profile first
DELETE FROM users_profiles WHERE id = 'a0000000-0000-0000-0000-000000000001';

-- Delete existing test user from auth
DELETE FROM auth.users WHERE email = 'test@demo.com';

-- Create test user with proper auth setup
-- Note: We'll use a specific UUID for consistency
DO $$
DECLARE
  test_user_id uuid := 'a0000000-0000-0000-0000-000000000001';
  encrypted_pw text;
BEGIN
  -- Generate proper bcrypt hash for password '1234'
  encrypted_pw := crypt('1234', gen_salt('bf'));
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role,
    confirmation_token,
    recovery_token,
    email_change_token_current,
    email_change_token_new
  ) VALUES (
    test_user_id,
    '00000000-0000-0000-0000-000000000000',
    'test@demo.com',
    encrypted_pw,
    now(),
    now(),
    now(),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    encrypted_password = encrypted_pw,
    email_confirmed_at = now(),
    updated_at = now();
  
  -- Insert into users_profiles
  INSERT INTO users_profiles (
    id,
    full_name,
    role,
    account_status,
    referral_code
  ) VALUES (
    test_user_id,
    'Test User',
    'customer',
    'active',
    'TESTUSER2024'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = 'Test User',
    role = 'customer',
    account_status = 'active',
    referral_code = 'TESTUSER2024';
END $$;
