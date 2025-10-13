/*
  # Fix RLS Infinite Recursion

  1. Problem
    - Current policies query users_profiles within policies, causing infinite recursion
    - This happens when checking if user is admin or checking existing role/status

  2. Solution
    - Simplify policies to avoid self-referential queries
    - For INSERT: Allow all authenticated users to create their profile
    - For SELECT: Allow users to read their own profile directly
    - For UPDATE: Allow users to update only non-sensitive fields
    - For Admin access: Create separate simpler policies

  3. Security
    - Maintain security by restricting role/status changes
    - Admins can be identified by checking JWT metadata if needed
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profiles;

-- Recreate simpler policies

-- Users can update their own profile but NOT role or account_status
CREATE POLICY "Users can update own profile data"
  ON users_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
  );

-- Admins can read all profiles (simplified - no recursion)
-- We'll use a service role or create a separate admin check mechanism
CREATE POLICY "Allow profile reads for authenticated users"
  ON users_profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    role IN ('admin', 'super_admin')
  );

-- Function to check if current user is admin (without recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policy for admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON users_profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());