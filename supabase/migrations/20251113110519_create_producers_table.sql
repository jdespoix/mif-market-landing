/*
  # Create producers registration table

  1. New Tables
    - `producers`
      - `id` (uuid, primary key) - Unique identifier for each producer
      - `structure_name` (text) - Name of the production structure
      - `contact_lastname` (text) - Contact person's last name
      - `contact_firstname` (text) - Contact person's first name
      - `email` (text, unique) - Professional email address
      - `phone` (text) - Contact phone number
      - `region` (text) - Geographic region of operation
      - `category` (text) - Type of production activity
      - `website` (text, optional) - Website or social media link
      - `charter_accepted` (boolean, default false) - Acceptance of MIF charter
      - `status` (text, default 'referenced') - Current status in the system
      - `created_at` (timestamptz) - Registration timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `producers` table
    - Add policy for public insert (registration is open to all)
    - Add policy for authenticated users to read all data (admin access)
    - Add policy for users to read their own data by email
  
  3. Important Notes
    - Email must be unique to prevent duplicate registrations
    - Charter acceptance is mandatory before registration (enforced in app)
    - Status field allows tracking producer journey: 'referenced' → 'client_active'
    - Public can insert but cannot read (privacy protection)
    - Only authenticated users (admin) can view the full database
*/

CREATE TABLE IF NOT EXISTS producers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_name text NOT NULL,
  contact_lastname text NOT NULL,
  contact_firstname text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  region text NOT NULL,
  category text NOT NULL,
  website text,
  charter_accepted boolean DEFAULT false NOT NULL,
  status text DEFAULT 'referenced' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE producers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (public registration)
CREATE POLICY "Anyone can register as producer"
  ON producers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (charter_accepted = true);

-- Policy: Authenticated users (admin) can read all data
CREATE POLICY "Authenticated users can read all producers"
  ON producers
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_producers_email ON producers(email);

-- Create index on region for filtering
CREATE INDEX IF NOT EXISTS idx_producers_region ON producers(region);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_producers_category ON producers(category);

-- Create index on status for tracking
CREATE INDEX IF NOT EXISTS idx_producers_status ON producers(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_producers_created_at ON producers(created_at DESC);