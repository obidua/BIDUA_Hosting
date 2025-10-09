/*
  # Recreate Test User with Proper Auth Flow

  1. Changes
    - Delete and recreate test user
    - Use proper Supabase auth format
    
  2. Notes
    - Password will be '1234'
    - Email will be confirmed
*/

-- First, clean up existing data
DELETE FROM users_profiles WHERE id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM auth.users WHERE id = 'a0000000-0000-0000-0000-000000000001';

-- Create the user in auth.users with a proper password hash
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  aud,
  role
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'test@demo.com',
  '$2a$10$ZK5RqJKtFqKKRKxVFqKKRO7VEkzD7P7kZqKqKqKqKqKqKqKqKu',  -- This is a placeholder, we'll use crypt below
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Test User"}',
  now(),
  now(),
  '',
  '',
  '',
  '',
  'authenticated',
  'authenticated'
);

-- Update with proper password hash for '1234'
UPDATE auth.users 
SET encrypted_password = crypt('1234', gen_salt('bf'))
WHERE id = 'a0000000-0000-0000-0000-000000000001';

-- Create profile
INSERT INTO users_profiles (
  id,
  full_name,
  role,
  account_status,
  referral_code
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Test User',
  'customer',
  'active',
  'TESTUSER2024'
);

-- Also verify admin user exists
DO $$
BEGIN
  -- Check if admin exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') THEN
    -- Create admin user
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token,
      aud,
      role
    ) VALUES (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '00000000-0000-0000-0000-000000000000',
      'admin@biduahosting.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Admin User"}',
      now(),
      now(),
      '',
      '',
      '',
      '',
      'authenticated',
      'authenticated'
    );
    
    -- Create admin profile
    INSERT INTO users_profiles (
      id,
      full_name,
      role,
      account_status,
      referral_code
    ) VALUES (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'Admin User',
      'admin',
      'active',
      'ADMIN2024'
    );
  ELSE
    -- Update admin password
    UPDATE auth.users 
    SET encrypted_password = crypt('admin123', gen_salt('bf'))
    WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  END IF;
END $$;
