/*
  # Create Site Settings Table

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Setting identifier (e.g., 'logo', 'site_name')
      - `value` (text) - Setting value (URL for logo)
      - `type` (text) - Type of setting (image, text, etc.)
      - `updated_at` (timestamptz)
      - `updated_by` (uuid) - Admin who made the change
      
  2. Security
    - Enable RLS on `site_settings` table
    - Add policy for public read access (anyone can view site settings)
    - Add policy for admin/super_admin update access
    
  3. Initial Data
    - Insert default logo setting
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read site settings (for displaying logo, etc.)
CREATE POLICY "Anyone can read site settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

-- Only admins and super_admins can update site settings
CREATE POLICY "Admins can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- Only admins and super_admins can insert site settings
CREATE POLICY "Admins can insert site settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- Insert default logo setting using GitHub raw URL
INSERT INTO site_settings (key, value, type)
VALUES ('logo_url', 'https://raw.githubusercontent.com/jdespoix/mif-market-landing/main/public/LogoMifMarket2025.jpg', 'image')
ON CONFLICT (key) DO NOTHING;