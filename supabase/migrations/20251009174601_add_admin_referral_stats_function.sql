/*
  # Admin Referral Stats Function
  
  1. New Functions
    - `get_admin_referral_stats()` - Get system-wide referral statistics for admins
  
  2. Security
    - Only accessible by admin users
*/

-- Function to get admin referral statistics
CREATE OR REPLACE FUNCTION get_admin_referral_stats()
RETURNS json AS $$
DECLARE
  total_referrals integer;
  total_earnings numeric;
  pending_payouts numeric;
  completed_payouts numeric;
  is_admin boolean;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM users_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Count total referrals (users who were referred by someone)
  SELECT COUNT(*) INTO total_referrals
  FROM users_profiles
  WHERE referred_by IS NOT NULL;
  
  -- Sum total earnings across all users
  SELECT COALESCE(SUM(total_earnings), 0) INTO total_earnings
  FROM users_profiles;
  
  -- Sum pending payout requests
  SELECT COALESCE(SUM(gross_amount), 0) INTO pending_payouts
  FROM referral_payouts
  WHERE status IN ('requested', 'under_review');
  
  -- Sum completed payouts
  SELECT COALESCE(SUM(net_amount), 0) INTO completed_payouts
  FROM referral_payouts
  WHERE status = 'completed';
  
  RETURN json_build_object(
    'totalReferrals', total_referrals,
    'totalEarnings', total_earnings,
    'pendingPayouts', pending_payouts,
    'completedPayouts', completed_payouts
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
