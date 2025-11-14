/*
  # Fix producers policies to use is_admin() function

  ## Changes
  1. Drop existing admin-related policies on producers
  2. Create new policies using is_admin() function to avoid recursion

  ## Security
  - Uses is_admin() function which bypasses RLS safely
  - Maintains same security model without recursion
*/

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can view all producers" ON producers;
DROP POLICY IF EXISTS "Admins can insert producers" ON producers;
DROP POLICY IF EXISTS "Admins can update all producers" ON producers;
DROP POLICY IF EXISTS "Admins can delete all producers" ON producers;

-- Recreate policies using is_admin() function

-- Admins can view all producers
CREATE POLICY "Admins can view all producers"
  ON producers FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can insert producers
CREATE POLICY "Admins can insert producers"
  ON producers FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admins can update all producers
CREATE POLICY "Admins can update all producers"
  ON producers FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete all producers
CREATE POLICY "Admins can delete all producers"
  ON producers FOR DELETE
  TO authenticated
  USING (is_admin());
