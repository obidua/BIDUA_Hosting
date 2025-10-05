/*
  # Add Cart System and Server Configuration Tables

  ## Overview
  This migration adds comprehensive cart functionality and server configuration options
  to support the internal ordering system with multi-step checkout and configuration.

  ## New Tables

  ### 1. `carts`
  Stores shopping cart information for each user
  - `id` (uuid, primary key) - Unique cart identifier
  - `user_id` (uuid, foreign key) - Owner of the cart
  - `created_at` (timestamptz) - Cart creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 2. `cart_items`
  Individual items within a shopping cart
  - `id` (uuid, primary key) - Unique cart item identifier
  - `cart_id` (uuid, foreign key) - Parent cart reference
  - `product_id` (uuid, foreign key) - Selected product/plan
  - `billing_cycle` (text) - Selected billing period
  - `quantity` (integer) - Number of instances
  - `price` (numeric) - Total price for this item
  - `monthly_price` (numeric) - Calculated monthly equivalent
  - `configuration` (jsonb) - Custom configurations (OS, location, addons)
  - `created_at` (timestamptz) - Item addition timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 3. `datacenters`
  Available datacenter locations for server deployment
  - `id` (uuid, primary key) - Unique datacenter identifier
  - `name` (text) - Datacenter name
  - `code` (text, unique) - Short code for datacenter
  - `city` (text) - City location
  - `country` (text) - Country location
  - `region` (text) - Geographic region
  - `is_active` (boolean) - Availability status
  - `capacity_status` (text) - Current capacity (available, limited, full)
  - `display_order` (integer) - Sort order in UI
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 4. `server_os_templates`
  Available operating system templates for server deployment
  - `id` (uuid, primary key) - Unique OS template identifier
  - `name` (text) - OS display name
  - `slug` (text, unique) - URL-friendly identifier
  - `version` (text) - OS version
  - `category` (text) - OS category (linux, windows, other)
  - `icon_url` (text) - Icon/logo URL
  - `is_active` (boolean) - Availability status
  - `display_order` (integer) - Sort order in UI
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ### 5. `addons`
  Additional services and upgrades available for purchase
  - `id` (uuid, primary key) - Unique addon identifier
  - `name` (text) - Addon name
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text) - Addon description
  - `category` (text) - Addon type (ip, backup, bandwidth, etc)
  - `price_monthly` (numeric) - Monthly pricing
  - `is_recurring` (boolean) - Whether charges repeat
  - `is_active` (boolean) - Availability status
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ## Security
  - Enable RLS on all new tables
  - Users can only access their own carts and cart items
  - Datacenters, OS templates, and addons are publicly readable
  - Only admins can modify datacenters, OS templates, and addons

  ## Important Notes
  - Cart items store configuration as JSONB for flexibility
  - Price calculations are stored to preserve historical pricing
  - Foreign key constraints ensure data integrity
  - Indexes added for performance on frequently queried fields
*/

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'semiannually', 'annually', 'biennially', 'triennially')),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price numeric NOT NULL,
  monthly_price numeric NOT NULL,
  configuration jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create datacenters table
CREATE TABLE IF NOT EXISTS datacenters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  city text NOT NULL,
  country text NOT NULL,
  region text NOT NULL,
  is_active boolean DEFAULT true,
  capacity_status text DEFAULT 'available' CHECK (capacity_status IN ('available', 'limited', 'full')),
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create server_os_templates table
CREATE TABLE IF NOT EXISTS server_os_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  version text NOT NULL,
  category text NOT NULL CHECK (category IN ('linux', 'windows', 'other')),
  icon_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create addons table
CREATE TABLE IF NOT EXISTS addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('ip', 'backup', 'bandwidth', 'storage', 'other')),
  price_monthly numeric NOT NULL,
  is_recurring boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_datacenters_is_active ON datacenters(is_active);
CREATE INDEX IF NOT EXISTS idx_server_os_templates_category ON server_os_templates(category);
CREATE INDEX IF NOT EXISTS idx_addons_category ON addons(category);

-- Enable Row Level Security
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE datacenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_os_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carts
CREATE POLICY "Users can view own cart"
  ON carts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cart"
  ON carts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON carts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart"
  ON carts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for cart_items
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add items to own cart"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

-- RLS Policies for datacenters (public read, admin write)
CREATE POLICY "Anyone can view active datacenters"
  ON datacenters FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage datacenters"
  ON datacenters FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'role' = 'admin' OR auth.users.raw_app_meta_data->>'role' = 'super_admin')
    )
  );

-- RLS Policies for server_os_templates (public read, admin write)
CREATE POLICY "Anyone can view active OS templates"
  ON server_os_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage OS templates"
  ON server_os_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'role' = 'admin' OR auth.users.raw_app_meta_data->>'role' = 'super_admin')
    )
  );

-- RLS Policies for addons (public read, admin write)
CREATE POLICY "Anyone can view active addons"
  ON addons FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage addons"
  ON addons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'role' = 'admin' OR auth.users.raw_app_meta_data->>'role' = 'super_admin')
    )
  );

-- Insert sample datacenters
INSERT INTO datacenters (name, code, city, country, region, is_active, capacity_status, display_order) VALUES
  ('Noida Data Center', 'IN-NOIDA', 'Noida', 'India', 'Asia Pacific', true, 'available', 1),
  ('Milton Keynes Data Center', 'UK-MK', 'Milton Keynes', 'United Kingdom', 'Europe', true, 'available', 2),
  ('Mumbai Data Center', 'IN-MUM', 'Mumbai', 'India', 'Asia Pacific', true, 'available', 3),
  ('London Data Center', 'UK-LON', 'London', 'United Kingdom', 'Europe', true, 'limited', 4)
ON CONFLICT (code) DO NOTHING;

-- Insert sample OS templates
INSERT INTO server_os_templates (name, slug, version, category, is_active, display_order) VALUES
  ('Ubuntu Server', 'ubuntu', '22.04 LTS', 'linux', true, 1),
  ('Ubuntu Server', 'ubuntu-20', '20.04 LTS', 'linux', true, 2),
  ('CentOS', 'centos', '9 Stream', 'linux', true, 3),
  ('Debian', 'debian', '12 (Bookworm)', 'linux', true, 4),
  ('Rocky Linux', 'rocky', '9', 'linux', true, 5),
  ('AlmaLinux', 'almalinux', '9', 'linux', true, 6),
  ('Windows Server', 'windows-2022', '2022', 'windows', true, 7),
  ('Windows Server', 'windows-2019', '2019', 'windows', true, 8)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample addons
INSERT INTO addons (name, slug, description, category, price_monthly, is_recurring, is_active) VALUES
  ('Additional IPv4 Address', 'ipv4-additional', 'Add one additional IPv4 address to your server', 'ip', 500, true, true),
  ('Additional IPv4 Block /29', 'ipv4-block-29', 'Add a /29 IPv4 block (5 usable IPs) to your server', 'ip', 2000, true, true),
  ('Automated Daily Backups', 'backup-daily', 'Automated daily backups with 7-day retention', 'backup', 300, true, true),
  ('Extra Bandwidth 1TB', 'bandwidth-1tb', 'Add 1TB of additional monthly bandwidth', 'bandwidth', 250, true, true),
  ('Extra Storage 100GB', 'storage-100gb', 'Add 100GB of additional SSD storage', 'storage', 400, true, true)
ON CONFLICT (slug) DO NOTHING;
