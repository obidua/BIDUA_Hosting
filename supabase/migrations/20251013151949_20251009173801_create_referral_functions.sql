/*
  # Referral System - Core Functions
  
  1. Functions
    - `generate_referral_code()` - Generates unique referral codes
    - `apply_referral_code()` - Links a new user to their referrer
    - `get_referral_chain()` - Gets L1, L2, L3 referrers for a user
    - `calculate_and_distribute_commissions()` - Calculates and creates commission records
    - `process_order_commissions()` - Trigger function for order completion
    - `update_user_balance()` - Updates available balance when earnings approved
  
  2. Triggers
    - Auto-generate referral code on user profile creation
    - Auto-calculate commissions on order completion
    - Auto-update user balance when earnings status changes
  
  3. Commission Structure
    - Recurring (monthly, quarterly, semiannually): L1=5%, L2=1%, L3=1%
    - One-time (annually, biennially, triennially): L1=15%, L2=3%, L3=2%
*/

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    -- Generate random 10-character code with prefix
    code := 'REF' || upper(substring(md5(random()::text) from 1 for 7));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM users_profiles WHERE referral_code = code) INTO exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign referral code to new users
CREATE OR REPLACE FUNCTION assign_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign if referral_code is NULL
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign referral code
DROP TRIGGER IF EXISTS trigger_assign_referral_code ON users_profiles;
CREATE TRIGGER trigger_assign_referral_code
  BEFORE INSERT ON users_profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_referral_code();

-- Function to get referral chain (L1, L2, L3 referrers) for a user
CREATE OR REPLACE FUNCTION get_referral_chain(target_user_id uuid)
RETURNS TABLE (
  level integer,
  referrer_id uuid,
  referrer_name text,
  referrer_code text
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE referral_tree AS (
    -- Base case: direct referrer (L1)
    SELECT 
      1 as level,
      up.referred_by as referrer_id,
      up2.full_name as referrer_name,
      up2.referral_code as referrer_code
    FROM users_profiles up
    LEFT JOIN users_profiles up2 ON up.referred_by = up2.id
    WHERE up.id = target_user_id AND up.referred_by IS NOT NULL
    
    UNION ALL
    
    -- Recursive case: L2 and L3
    SELECT 
      rt.level + 1,
      up.referred_by,
      up2.full_name,
      up2.referral_code
    FROM referral_tree rt
    INNER JOIN users_profiles up ON rt.referrer_id = up.id
    LEFT JOIN users_profiles up2 ON up.referred_by = up2.id
    WHERE rt.level < 3 AND up.referred_by IS NOT NULL
  )
  SELECT * FROM referral_tree WHERE referrer_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to determine if billing cycle is recurring or one-time
CREATE OR REPLACE FUNCTION get_billing_type(cycle_slug text)
RETURNS text AS $$
BEGIN
  IF cycle_slug IN ('monthly', 'quarterly', 'semiannually') THEN
    RETURN 'recurring';
  ELSIF cycle_slug IN ('annually', 'biennially', 'triennially') THEN
    RETURN 'onetime';
  ELSE
    RETURN 'recurring'; -- default
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get commission rate based on level and billing type
CREATE OR REPLACE FUNCTION get_commission_rate(level integer, billing_type text)
RETURNS numeric AS $$
BEGIN
  IF billing_type = 'recurring' THEN
    CASE level
      WHEN 1 THEN RETURN 5.0;
      WHEN 2 THEN RETURN 1.0;
      WHEN 3 THEN RETURN 1.0;
      ELSE RETURN 0.0;
    END CASE;
  ELSIF billing_type = 'onetime' THEN
    CASE level
      WHEN 1 THEN RETURN 15.0;
      WHEN 2 THEN RETURN 3.0;
      WHEN 3 THEN RETURN 2.0;
      ELSE RETURN 0.0;
    END CASE;
  ELSE
    RETURN 0.0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate and distribute commissions for an order
CREATE OR REPLACE FUNCTION calculate_and_distribute_commissions(order_id_param uuid)
RETURNS void AS $$
DECLARE
  order_record RECORD;
  referrer_record RECORD;
  billing_type_val text;
  commission_rate_val numeric;
  commission_amount_val numeric;
  cycle_slug text;
BEGIN
  -- Get order details
  SELECT o.*, bc.slug as billing_cycle_slug
  INTO order_record
  FROM orders o
  LEFT JOIN billing_cycles bc ON o.billing_cycle_id = bc.id
  WHERE o.id = order_id_param;
  
  -- Exit if order not found or has no amount
  IF NOT FOUND OR order_record.amount IS NULL OR order_record.amount <= 0 THEN
    RETURN;
  END IF;
  
  -- Determine billing type
  cycle_slug := COALESCE(order_record.billing_cycle_slug, order_record.billing_cycle, 'monthly');
  billing_type_val := get_billing_type(cycle_slug);
  
  -- Get referral chain for the buyer
  FOR referrer_record IN 
    SELECT * FROM get_referral_chain(order_record.user_id)
  LOOP
    -- Get commission rate for this level and billing type
    commission_rate_val := get_commission_rate(referrer_record.level, billing_type_val);
    
    -- Skip if no commission for this level
    CONTINUE WHEN commission_rate_val <= 0;
    
    -- Calculate commission amount
    commission_amount_val := (order_record.amount * commission_rate_val / 100);
    
    -- Insert earning record
    INSERT INTO referral_earnings (
      user_id,
      referred_user_id,
      order_id,
      referral_level,
      billing_type,
      commission_rate,
      order_amount,
      commission_amount,
      status,
      renewal_cycle
    ) VALUES (
      referrer_record.referrer_id,
      order_record.user_id,
      order_id_param,
      referrer_record.level,
      billing_type_val,
      commission_rate_val,
      order_record.amount,
      commission_amount_val,
      'approved', -- Auto-approve commissions
      COALESCE(order_record.renewal_count, 0)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-process commissions when order is completed
CREATE OR REPLACE FUNCTION process_order_commissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when order status changes to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    PERFORM calculate_and_distribute_commissions(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic commission processing
DROP TRIGGER IF EXISTS trigger_process_order_commissions ON orders;
CREATE TRIGGER trigger_process_order_commissions
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION process_order_commissions();

-- Function to update user balance when earnings status changes
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- When earnings are approved, add to available balance
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE users_profiles
    SET 
      total_earnings = total_earnings + NEW.commission_amount,
      available_balance = available_balance + NEW.commission_amount
    WHERE id = NEW.user_id;
  END IF;
  
  -- When earnings are reversed, subtract from balance
  IF NEW.status = 'reversed' AND OLD.status = 'approved' THEN
    UPDATE users_profiles
    SET 
      total_earnings = GREATEST(0, total_earnings - NEW.commission_amount),
      available_balance = GREATEST(0, available_balance - NEW.commission_amount)
    WHERE id = NEW.user_id;
  END IF;
  
  -- When earnings are paid, update paid_at timestamp
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    NEW.paid_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for balance updates
DROP TRIGGER IF EXISTS trigger_update_user_balance ON referral_earnings;
CREATE TRIGGER trigger_update_user_balance
  AFTER INSERT OR UPDATE ON referral_earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_balance();

-- Function to process payout request
CREATE OR REPLACE FUNCTION update_payout_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- When payout is approved, mark earnings as paid and update balance
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Mark associated earnings as paid
    UPDATE referral_earnings
    SET status = 'paid', paid_at = now()
    WHERE user_id = NEW.user_id
      AND status = 'approved'
      AND created_at <= NEW.requested_at;
    
    -- Update user balance
    UPDATE users_profiles
    SET 
      available_balance = GREATEST(0, available_balance - NEW.gross_amount),
      total_withdrawn = total_withdrawn + NEW.net_amount
    WHERE id = NEW.user_id;
    
    NEW.completed_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payout processing
DROP TRIGGER IF EXISTS trigger_update_payout_balance ON referral_payouts;
CREATE TRIGGER trigger_update_payout_balance
  BEFORE UPDATE ON referral_payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_payout_balance();