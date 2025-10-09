/*
  # Fix Ambiguous Column Reference in Referral Stats Function

  1. Issue Fixed
    - Column reference "user_id" is ambiguous in get_my_referral_stats()
    - The function has a variable named user_id and queries tables with user_id column
    
  2. Solution
    - Fully qualify the column references in WHERE clauses
    - Use table aliases to make references explicit
*/

-- Recreate the function with proper column references
CREATE OR REPLACE FUNCTION get_my_referral_stats()
RETURNS json AS $$
DECLARE
  v_user_id uuid;
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
  v_user_id := auth.uid();
  
  -- Get user's referral code
  SELECT up.referral_code INTO referral_code
  FROM users_profiles up
  WHERE up.id = v_user_id;
  
  -- Count L1 referrals (direct)
  SELECT COUNT(*) INTO total_l1
  FROM users_profiles
  WHERE referred_by = v_user_id;
  
  -- Count L2 referrals
  SELECT COUNT(*) INTO total_l2
  FROM users_profiles up1
  INNER JOIN users_profiles up2 ON up1.referred_by = up2.id
  WHERE up2.referred_by = v_user_id;
  
  -- Count L3 referrals
  SELECT COUNT(*) INTO total_l3
  FROM users_profiles up1
  INNER JOIN users_profiles up2 ON up1.referred_by = up2.id
  INNER JOIN users_profiles up3 ON up2.referred_by = up3.id
  WHERE up3.referred_by = v_user_id;
  
  -- Get balance info
  SELECT 
    COALESCE(up.total_earnings, 0),
    COALESCE(up.available_balance, 0),
    COALESCE(up.total_withdrawn, 0)
  INTO total_earnings, available_balance, total_withdrawn
  FROM users_profiles up
  WHERE up.id = v_user_id;
  
  -- Get pending earnings (using table alias)
  SELECT COALESCE(SUM(re.commission_amount), 0) INTO pending_earnings
  FROM referral_earnings re
  WHERE re.user_id = v_user_id AND re.status = 'pending';
  
  -- Get approved earnings (using table alias)
  SELECT COALESCE(SUM(re.commission_amount), 0) INTO approved_earnings
  FROM referral_earnings re
  WHERE re.user_id = v_user_id AND re.status = 'approved';
  
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

-- Also fix get_my_earnings function for consistency
CREATE OR REPLACE FUNCTION get_my_earnings(
  limit_param integer DEFAULT 50,
  offset_param integer DEFAULT 0
)
RETURNS json AS $$
DECLARE
  v_user_id uuid;
  earnings_data json;
  total_count integer;
BEGIN
  v_user_id := auth.uid();
  
  -- Get total count
  SELECT COUNT(*) INTO total_count
  FROM referral_earnings re
  WHERE re.user_id = v_user_id;
  
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
    WHERE re.user_id = v_user_id
    ORDER BY re.created_at DESC
    LIMIT limit_param
    OFFSET offset_param
  ) earnings_row;
  
  RETURN COALESCE(earnings_data, json_build_object('total', 0, 'earnings', '[]'::json));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix request_referral_payout function
CREATE OR REPLACE FUNCTION request_referral_payout(
  amount_param numeric,
  payment_method_param text DEFAULT 'bank_transfer',
  bank_details_param jsonb DEFAULT '{}'::jsonb
)
RETURNS json AS $$
DECLARE
  v_user_id uuid;
  available_balance numeric;
  tds_rate numeric := 10.0;
  service_tax_rate numeric := 18.0;
  tds_amount numeric;
  service_tax_amount numeric;
  net_amount numeric;
  payout_number text;
  payout_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  -- Check if user exists and get balance
  SELECT up.available_balance INTO available_balance
  FROM users_profiles up
  WHERE up.id = v_user_id;
  
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
    v_user_id,
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

-- Fix get_my_payouts function
CREATE OR REPLACE FUNCTION get_my_payouts()
RETURNS json AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
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
      WHERE user_id = v_user_id
      ORDER BY created_at DESC
    ) rp
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
