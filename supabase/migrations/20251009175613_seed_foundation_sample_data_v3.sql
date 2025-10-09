/*
  # Seed Foundation and Sample Data for Demo

  1. Foundation Data
    - Insert plan types and billing cycles (required for other tables)
    - Create sample hosting plans with pricing
    
  2. Demo Credentials
    - User: test@demo.com / 1234 (already exists in database)
    - Admin: admin@biduahosting.com / admin123 (to be displayed on admin login page)
    
  3. Notes
    - This adds foundation data to make the application functional
    - Plans are displayed on pricing page
    - Pricing covers multiple billing cycles for each plan
*/

-- Insert plan types
INSERT INTO plan_types (id, name, slug, description)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'General Purpose', 'general-purpose', 'Balanced CPU, RAM, and storage for most workloads'),
  ('11111111-1111-1111-1111-111111111112', 'CPU Optimized', 'cpu-optimized', 'High-performance processors for compute-intensive tasks'),
  ('11111111-1111-1111-1111-111111111113', 'Memory Optimized', 'memory-optimized', 'Large RAM capacity for memory-intensive applications'),
  ('11111111-1111-1111-1111-111111111114', 'Storage Optimized', 'storage-optimized', 'Maximum storage capacity for data-heavy workloads')
ON CONFLICT (id) DO NOTHING;

-- Insert billing cycles
INSERT INTO billing_cycles (id, name, slug, months, discount_percent, sort_order)
VALUES 
  ('22222222-2222-2222-2222-222222222221', 'Monthly', 'monthly', 1, 0, 1),
  ('22222222-2222-2222-2222-222222222222', 'Quarterly', 'quarterly', 3, 5, 2),
  ('22222222-2222-2222-2222-222222222223', 'Semi-Annually', 'semiannually', 6, 10, 3),
  ('22222222-2222-2222-2222-222222222224', 'Annually', 'annually', 12, 17, 4),
  ('22222222-2222-2222-2222-222222222225', 'Biennially', 'biennially', 24, 15, 5),
  ('22222222-2222-2222-2222-222222222226', 'Triennially', 'triennially', 36, 20, 6)
ON CONFLICT (id) DO NOTHING;

-- Insert sample hosting plans
INSERT INTO plans (id, plan_type_id, name, vcpu, ram_gb, storage_gb, bandwidth_tb, features, is_popular)
VALUES 
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Starter Cloud', 2, 4, 50, 1, 
   '["2 vCPU Cores", "4GB RAM", "50GB NVMe SSD", "1TB Bandwidth", "Free SSL Certificate", "99.9% Uptime SLA", "24/7 Support"]'::jsonb, 
   false),
  
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Business Pro', 4, 8, 100, 2,
   '["4 vCPU Cores", "8GB RAM", "100GB NVMe SSD", "2TB Bandwidth", "Free SSL Certificate", "99.9% Uptime SLA", "Priority Support", "Free Backup"]'::jsonb,
   true),
  
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111112', 'Enterprise Plus', 8, 16, 200, 5,
   '["8 vCPU Cores", "16GB RAM", "200GB NVMe SSD", "5TB Bandwidth", "Free SSL Certificate", "99.99% Uptime SLA", "Dedicated Support", "Daily Backups", "DDoS Protection"]'::jsonb,
   true),
  
  ('33333333-3333-3333-3333-333333333334', '11111111-1111-1111-1111-111111111113', 'Memory Optimized', 4, 32, 150, 3,
   '["4 vCPU Cores", "32GB RAM", "150GB NVMe SSD", "3TB Bandwidth", "Optimized for Databases", "Free SSL Certificate", "Priority Support"]'::jsonb,
   false),
  
  ('33333333-3333-3333-3333-333333333335', '11111111-1111-1111-1111-111111111114', 'Storage Pro', 4, 8, 500, 10,
   '["4 vCPU Cores", "8GB RAM", "500GB NVMe SSD", "10TB Bandwidth", "Perfect for File Storage", "Free SSL Certificate", "24/7 Support"]'::jsonb,
   false),
  
  ('33333333-3333-3333-3333-333333333336', '11111111-1111-1111-1111-111111111111', 'Micro Instance', 1, 2, 25, 0.5,
   '["1 vCPU Core", "2GB RAM", "25GB NVMe SSD", "500GB Bandwidth", "Free SSL Certificate", "99.9% Uptime SLA"]'::jsonb,
   false),
  
  ('33333333-3333-3333-3333-333333333337', '11111111-1111-1111-1111-111111111112', 'Ultra Performance', 16, 32, 400, 10,
   '["16 vCPU Cores", "32GB RAM", "400GB NVMe SSD", "10TB Bandwidth", "Maximum Performance", "Free SSL Certificate", "99.99% Uptime SLA", "24/7 Dedicated Support"]'::jsonb,
   false)
ON CONFLICT (id) DO NOTHING;

-- Insert pricing for all plans with different billing cycles
INSERT INTO plan_pricing (plan_id, billing_cycle_id, price)
VALUES 
  -- Micro Instance
  ('33333333-3333-3333-3333-333333333336', '22222222-2222-2222-2222-222222222221', 14.99),
  ('33333333-3333-3333-3333-333333333336', '22222222-2222-2222-2222-222222222222', 42.72),
  ('33333333-3333-3333-3333-333333333336', '22222222-2222-2222-2222-222222222224', 149.90),
  
  -- Starter Cloud
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222221', 29.99),
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', 85.47),
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222224', 299.90),
  
  -- Business Pro
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222221', 59.99),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', 170.97),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222224', 599.90),
  
  -- Enterprise Plus
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222221', 119.99),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 341.97),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222224', 1199.90),
  
  -- Memory Optimized
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222221', 149.99),
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', 427.47),
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222224', 1499.90),
  
  -- Storage Pro
  ('33333333-3333-3333-3333-333333333335', '22222222-2222-2222-2222-222222222221', 99.99),
  ('33333333-3333-3333-3333-333333333335', '22222222-2222-2222-2222-222222222222', 284.97),
  ('33333333-3333-3333-3333-333333333335', '22222222-2222-2222-2222-222222222224', 999.90),
  
  -- Ultra Performance
  ('33333333-3333-3333-3333-333333333337', '22222222-2222-2222-2222-222222222221', 249.99),
  ('33333333-3333-3333-3333-333333333337', '22222222-2222-2222-2222-222222222222', 712.47),
  ('33333333-3333-3333-3333-333333333337', '22222222-2222-2222-2222-222222222224', 2499.90)
ON CONFLICT (plan_id, billing_cycle_id) DO NOTHING;
