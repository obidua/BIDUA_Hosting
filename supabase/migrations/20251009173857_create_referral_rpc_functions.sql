/*
  # Referral System - RPC Functions for Frontend
  
  1. RPC Functions
    - `apply_referral_code_to_user()` - Apply referral code during signup
    - `get_my_referral_stats()` - Get user's referral statistics
    - `get_my_earnings()` - Get user's earnings breakdown
    - `request_referral_payout()` - Request a payout with tax calculations
    - `get_referral_leaderboard()` - Get top referrers
    - `admin_approve_payout()` - Admin function to approve payouts
  
  2. Security
    - Functions check authentication
    - Admin functions verify admin role
    - Users can only access their own data
*/

-- Function to apply referral code to a user (called during signup)
CREATE OR REPLACE FUNCTION apply_referral_code_to_user(
  user_id_param uuid,
  referral_code_param text
)
RETURNS json AS $$
DECLARE
  referrer_id uuid;
  result json;
BEGIN
  -- Validate referral code and get referrer
  SELECT id INTO referrer_id
  FROM users_profiles
  WHERE referral_code = referral_code_param;
  
  -- Check if referral code is valid
  IF referrer_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid referral code'
    );
  END IF;
  
  -- Check if user is trying to refer themselves
  IF referrer_id = user_id_param THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot use your own referral code'
    );
  END IF;
  
  -- Check if user already has a referrer
  IF EXISTS (SELECT 1 FROM users_profiles WHERE id = user_id_param AND referred_by IS NOT NULL) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User already has a referrer'
    );
  END IF;
  
  -- Update user's referred_by field
  UPDATE users_profiles
  SET referred_by = referrer_id
  WHERE id = user_id_param;
  
  RETURN json_build_object(
    'success', true,
    'referrer_id', referrer_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get referral statistics for current user
CREATE OR REPLACE FUNCTION get_my_referral_stats()
RETURNS json AS $$
DECLARE
  user_id uuid;
  referral_code text;
  total_l1 integer;
  total_l2 integer;
  total_l3 integer;
  total_earnings numeric;
  available_balance numeric;
  total_withdrawn numeric;
  pending_earnings numeric;
  approved_earnings numeric;
  result json;
BEGIN
  user_id := auth.uid();
  
  -- Get user's referral code
  SELECT up.referral_code INTO referral_code
  FROM users_profiles up
  WHERE up.id = user_id;
  
  -- Count L1 referrals (direct)
  SELECT COUNT(*) INTO total_l1
  FROM users_profiles
  WHERE referred_by = user_id;
  
  -- Count L2 referrals
  SELECT COUNT(*) INTO total_l2
  FROM users_profiles up1
  INNER JOIN users_profiles up2 ON up1.referred_by = up2.id
  WHERE up2.referred_by = user_id;
  
  -- Count L3 referrals
  SELECT COUNT(*) INTO total_l3
  FROM users_profiles up1
  INNER JOIN users_profiles up2 ON up1.referred_by = up2.id
  INNER JOIN users_profiles up3 ON up2.referred_by = up3.id
  WHERE up3.referred_by = user_id;
  
  -- Get balance info
  SELECT 
    COALESCE(up.total_earnings, 0),
    COALESCE(up.available_balance, 0),
    COALESCE(up.total_withdrawn, 0)
  INTO total_earnings, available_balance, total_withdrawn
  FROM users_profiles up
  WHERE up.id = user_id;
  
  -- Get pending earnings
  SELECT COALESCE(SUM(commission_amount), 0) INTO pending_earnings
  FROM referral_earnings
  WHERE user_id = auth.uid() AND status = 'pending';
  
  -- Get approved earnings
  SELECT COALESCE(SUM(commission_amount), 0) INTO approved_earnings
  FROM referral_earnings
  WHERE user_id = auth.uid() AND status = 'approved';
  
  RETURN json_build_object(
    'referral_code', referral_code,
    'total_referrals', total_l1 + total_l2 + total_l3,
    'l1_referrals', total_l1,
    'l2_referrals', total_l2,
    'l3_referrals', total_l3,
    'total_earnings', total_earnings,
    'available_balance', available_balance,
    'total_withdrawn', total_withdrawn,
    'pending_earnings', pending_earnings,
    'approved_earnings', approved_earnings,
    'can_request_payout', available_balance >= 500
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get earnings breakdown
CREATE OR REPLACE FUNCTION get_my_earnings(
  limit_param integer DEFAULT 50,
  offset_param integer DEFAULT 0
)
RETURNS json AS $$
DECLARE
  earnings_data json;
  total_count integer;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_count
  FROM referral_earnings
  WHERE user_id = auth.uid();
  
  -- Get earnings with related data
  SELECT json_build_object(
    'total', total_count,
    'earnings', json_agg(earnings_row)
  ) INTO earnings_data
  FROM (
    SELECT 
      re.id,
      re.order_id,
      re.referral_level as level,
      re.billing_type,
      re.commission_rate as rate,
      re.order_amount,
      re.commission_amount,
      re.status,
      re.renewal_cycle,
      re.created_at,
      re.approved_at,
      re.paid_at,
      json_build_object(
        'id', up.id,
        'full_name', up.full_name,
        'referral_code', up.referral_code
      ) as referred_user
    FROM referral_earnings re
    INNER JOIN users_profiles up ON re.referred_user_id = up.id
    WHERE re.user_id = auth.uid()
    ORDER BY re.created_at DESC
    LIMIT limit_param
    OFFSET offset_param
  ) earnings_row;
  
  RETURN COALESCE(earnings_data, json_build_object('total', 0, 'earnings', '[]'::json));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to request a payout
CREATE OR REPLACE FUNCTION request_referral_payout(
  amount_param numeric,
  payment_method_param text DEFAULT 'bank_transfer',
  bank_details_param jsonb DEFAULT '{}'::jsonb
)
RETURNS json AS $$
DECLARE
  user_id uuid;
  available_balance numeric;
  tds_rate numeric := 10.0; -- 10% TDS
  service_tax_rate numeric := 18.0; -- 18% GST
  tds_amount numeric;
  service_tax_amount numeric;
  net_amount numeric;
  payout_number text;
  payout_id uuid;
BEGIN
  user_id := auth.uid();
  
  -- Check if user exists and get balance
  SELECT up.available_balance INTO available_balance
  FROM users_profiles up
  WHERE up.id = user_id;
  
  -- Validate minimum amount
  IF amount_param < 500 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Minimum payout amount is 500 INR'
    );
  END IF;
  
  -- Validate sufficient balance
  IF available_balance < amount_param THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient balance'
    );
  END IF;
  
  -- Calculate taxes
  tds_amount := ROUND(amount_param * tds_rate / 100, 2);
  service_tax_amount := ROUND(amount_param * service_tax_rate / 100, 2);
  net_amount := amount_param - tds_amount - service_tax_amount;
  
  -- Generate payout number
  payout_number := 'PO' || to_char(now(), 'YYYYMMDD') || '-' || 
                   upper(substring(md5(random()::text) from 1 for 6));
  
  -- Insert payout request
  INSERT INTO referral_payouts (
    user_id,
    payout_number,
    gross_amount,
    tds_amount,
    service_tax_amount,
    net_amount,
    status,
    payment_method,
    bank_account_details,
    tax_year,
    tax_quarter
  ) VALUES (
    user_id,
    payout_number,
    amount_param,
    tds_amount,
    service_tax_amount,
    net_amount,
    'requested',
    payment_method_param,
    bank_details_param,
    EXTRACT(YEAR FROM now())::integer,
    EXTRACT(QUARTER FROM now())::integer
  )
  RETURNING id INTO payout_id;
  
  RETURN json_build_object(
    'success', true,
    'payout_id', payout_id,
    'payout_number', payout_number,
    'gross_amount', amount_param,
    'tds_amount', tds_amount,
    'service_tax_amount', service_tax_amount,
    'net_amount', net_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get my payout history
CREATE OR REPLACE FUNCTION get_my_payouts()
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(rp))
    FROM (
      SELECT 
        id,
        payout_number,
        gross_amount,
        tds_amount,
        service_tax_amount,
        net_amount,
        status,
        payment_method,
        payment_reference,
        requested_at,
        approved_at,
        completed_at,
        rejected_reason
      FROM referral_payouts
      WHERE user_id = auth.uid()
      ORDER BY created_at DESC
    ) rp
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin function to approve payout
CREATE OR REPLACE FUNCTION admin_approve_payout(
  payout_id_param uuid,
  payment_reference_param text DEFAULT ''
)
RETURNS json AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM users_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized: Admin access required'
    );
  END IF;
  
  -- Update payout status
  UPDATE referral_payouts
  SET 
    status = 'completed',
    payment_reference = payment_reference_param,
    approved_at = now()
  WHERE id = payout_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Payout not found'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Payout approved successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin function to reject payout
CREATE OR REPLACE FUNCTION admin_reject_payout(
  payout_id_param uuid,
  reason_param text
)
RETURNS json AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM users_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized: Admin access required'
    );
  END IF;
  
  -- Update payout status
  UPDATE referral_payouts
  SET 
    status = 'rejected',
    rejected_reason = reason_param
  WHERE id = payout_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Payout not found'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Payout rejected'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get referral leaderboard (top earners)
CREATE OR REPLACE FUNCTION get_referral_leaderboard(limit_param integer DEFAULT 10)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(leaderboard))
    FROM (
      SELECT 
        up.full_name,
        up.referral_code,
        up.total_earnings,
        (SELECT COUNT(*) FROM users_profiles WHERE referred_by = up.id) as total_referrals
      FROM users_profiles up
      WHERE up.total_earnings > 0
      ORDER BY up.total_earnings DESC
      LIMIT limit_param
    ) leaderboard
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
