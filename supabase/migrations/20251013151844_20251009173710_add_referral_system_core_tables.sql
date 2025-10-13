/*
  # Referral System - Core Tables and Structure
  
  1. New Tables
    - `user_servers` - Track servers purchased by users
    - `referral_earnings` - Track commission earnings for referrers
    - `referral_payouts` - Manage payout requests and history
  
  2. Modifications to existing tables
    - Add referral_code, referred_by, total_earnings, available_balance to users_profiles
    - Add plan_id, billing_cycle_id, payment_date, next_renewal_date to orders
  
  3. Security
    - Enable RLS on all new tables
    - Users can read their own data
    - Admins can manage all data
  
  4. Notes
    - Existing orders table will be extended for referral tracking
    - Commission rates: Recurring (5%, 1%, 1%), One-time (15%, 3%, 2%)
    - Minimum payout threshold: 500 INR
*/

-- Add referral fields to users_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN referral_code text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'referred_by'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN referred_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'total_earnings'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN total_earnings numeric DEFAULT 0 CHECK (total_earnings >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'available_balance'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN available_balance numeric DEFAULT 0 CHECK (available_balance >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'total_withdrawn'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN total_withdrawn numeric DEFAULT 0 CHECK (total_withdrawn >= 0);
  END IF;
END $$;

-- Create index on referral_code for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_profiles_referral_code ON users_profiles(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_profiles_referred_by ON users_profiles(referred_by) WHERE referred_by IS NOT NULL;

-- Add plan_id and billing_cycle_id to orders table (to link with new structure)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'plan_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN plan_id uuid REFERENCES plans(id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'billing_cycle_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN billing_cycle_id uuid REFERENCES billing_cycles(id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'next_renewal_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN next_renewal_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'renewal_count'
  ) THEN
    ALTER TABLE orders ADD COLUMN renewal_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN amount numeric CHECK (amount > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method text DEFAULT '';
  END IF;
END $$;

-- User servers table
CREATE TABLE IF NOT EXISTS user_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES plans(id) ON DELETE RESTRICT,
  server_name text NOT NULL,
  hostname text UNIQUE NOT NULL,
  ip_address text DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
  os_type text DEFAULT 'Ubuntu 22.04 LTS',
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_server_status CHECK (status IN ('active', 'stopped', 'suspended', 'provisioning', 'error'))
);

-- Referral earnings table
CREATE TABLE IF NOT EXISTS referral_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  referral_level integer NOT NULL CHECK (referral_level >= 1 AND referral_level <= 3),
  billing_type text NOT NULL,
  commission_rate numeric NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100),
  order_amount numeric NOT NULL CHECK (order_amount > 0),
  commission_amount numeric NOT NULL CHECK (commission_amount >= 0),
  status text NOT NULL DEFAULT 'pending',
  renewal_cycle integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  paid_at timestamptz,
  CONSTRAINT valid_billing_type CHECK (billing_type IN ('recurring', 'onetime')),
  CONSTRAINT valid_earning_status CHECK (status IN ('pending', 'approved', 'paid', 'rejected', 'reversed'))
);

-- Referral payouts table
CREATE TABLE IF NOT EXISTS referral_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payout_number text UNIQUE NOT NULL,
  gross_amount numeric NOT NULL CHECK (gross_amount >= 500),
  tds_amount numeric DEFAULT 0 CHECK (tds_amount >= 0),
  service_tax_amount numeric DEFAULT 0 CHECK (service_tax_amount >= 0),
  net_amount numeric NOT NULL CHECK (net_amount > 0),
  status text NOT NULL DEFAULT 'requested',
  payment_method text DEFAULT '',
  payment_reference text DEFAULT '',
  bank_account_details jsonb DEFAULT '{}'::jsonb,
  requested_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  completed_at timestamptz,
  rejected_reason text DEFAULT '',
  tax_year integer,
  tax_quarter integer CHECK (tax_quarter >= 1 AND tax_quarter <= 4),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_payout_status CHECK (status IN ('requested', 'under_review', 'approved', 'processing', 'completed', 'rejected'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_servers_user_id ON user_servers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_servers_order_id ON user_servers(order_id);
CREATE INDEX IF NOT EXISTS idx_user_servers_status ON user_servers(status);

CREATE INDEX IF NOT EXISTS idx_referral_earnings_user_id ON referral_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referred_user ON referral_earnings(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_order_id ON referral_earnings(order_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_status ON referral_earnings(status);

CREATE INDEX IF NOT EXISTS idx_referral_payouts_user_id ON referral_payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_payouts_status ON referral_payouts(status);

-- Enable Row Level Security
ALTER TABLE user_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_servers
CREATE POLICY "Users can read own servers"
  ON user_servers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all servers"
  ON user_servers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for referral_earnings
CREATE POLICY "Users can read own earnings"
  ON referral_earnings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all earnings"
  ON referral_earnings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update earnings"
  ON referral_earnings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for referral_payouts
CREATE POLICY "Users can read own payouts"
  ON referral_payouts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payout requests"
  ON referral_payouts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all payouts"
  ON referral_payouts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update payouts"
  ON referral_payouts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );