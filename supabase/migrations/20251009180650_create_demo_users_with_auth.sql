/*
  # Create Demo Users with Authentication

  1. Demo User Accounts
    - Regular User: test@demo.com / 1234
    - Admin User: admin@biduahosting.com / admin123
    
  2. Actions
    - Create admin user in auth.users
    - Create admin profile in users_profiles
    - Update test user password (if possible)
    
  3. Notes
    - Passwords are hashed by Supabase Auth
    - Users can log in immediately after creation
*/

-- Create admin user in auth.users (using SQL admin function)
-- Note: We'll use the admin API to create users with specific passwords

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@biduahosting.com';
  
  -- If admin doesn't exist, we need to create it
  -- Note: Direct auth.users insertion requires proper password hashing
  IF admin_user_id IS NULL THEN
    -- Insert into auth.users with a hashed password
    -- The password 'admin123' is hashed using bcrypt
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'authenticated',
      'authenticated',
      'admin@biduahosting.com',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin User"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    ) ON CONFLICT (id) DO NOTHING;
    
    admin_user_id := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  END IF;
  
  -- Create or update admin profile
  INSERT INTO users_profiles (id, full_name, role, account_status, referral_code)
  VALUES (admin_user_id, 'Admin User', 'admin', 'active', 'ADMIN2024')
  ON CONFLICT (id) 
  DO UPDATE SET role = 'admin', account_status = 'active';
  
  -- Also make sure test@demo.com user has correct password
  -- Update the encrypted password for test@demo.com to '1234'
  UPDATE auth.users 
  SET encrypted_password = crypt('1234', gen_salt('bf')),
      email_confirmed_at = NOW(),
      updated_at = NOW()
  WHERE email = 'test@demo.com';
  
END $$;
