/*
  # Add Identity Records Correctly

  1. Changes
    - Create identity records without generated columns
    - Email is auto-generated from identity_data
    
  2. Security
    - Identity records enable proper authentication
*/

-- Create identity for test user
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  jsonb_build_object(
    'sub', 'a0000000-0000-0000-0000-000000000001',
    'email', 'test@demo.com',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  now(),
  now(),
  now()
)
ON CONFLICT (provider, provider_id) 
DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  updated_at = now();

-- Create identity for admin user
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  jsonb_build_object(
    'sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'email', 'admin@biduahosting.com',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  now(),
  now(),
  now()
)
ON CONFLICT (provider, provider_id) 
DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  updated_at = now();
