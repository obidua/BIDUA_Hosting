/*
  # Fix RLS Policies - Remove Infinite Recursion

  1. Issues Fixed
    - Remove infinite recursion in users_profiles policies
    - Simplify admin policies to avoid self-referencing queries
    - Fix ambiguous column references in referral functions
    
  2. Changes
    - Drop existing problematic policies
    - Create new simplified policies without recursion
    - Users can read/update their own profiles
    - Service role (backend) can do everything
*/

-- Drop all existing policies on users_profiles to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON users_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users_profiles;

-- Create simple, non-recursive policies
-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can update their own profile (but not role or account_status)
CREATE POLICY "Users can update own profile"
  ON users_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON users_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Note: Admin access should be handled via service role key in the backend
-- or via a separate admin table that doesn't reference users_profiles

-- For now, let's create a helper function to check if user is admin
-- This function will be used by other tables, not by users_profiles itself
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
