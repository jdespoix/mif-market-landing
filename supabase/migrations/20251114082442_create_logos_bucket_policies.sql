/*
  # Create Storage Policies for Logos Bucket

  1. Storage Policies
    - Public read access to logos bucket
    - Admin/super_admin can upload, update, and delete logos
    
  2. Security
    - Only authenticated admins can modify logos
    - Anyone can view logos (public bucket)
*/

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can read logos" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can upload logos" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can update logos" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can delete logos" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create policy for public read access to logos bucket
CREATE POLICY "Public can read logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Create policy for admins to upload logos
CREATE POLICY "Admins can upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);

-- Create policy for admins to update logos
CREATE POLICY "Admins can update logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  bucket_id = 'logos' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);

-- Create policy for admins to delete logos
CREATE POLICY "Admins can delete logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);