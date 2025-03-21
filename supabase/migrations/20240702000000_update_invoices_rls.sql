-- Update Row Level Security policies for invoices table
-- This allows public/anonymous access to the invoices table

-- First, drop any existing policies that might conflict
DROP POLICY IF EXISTS "Allow public access to view invoices" ON invoices;
DROP POLICY IF EXISTS "Allow public access to insert invoices" ON invoices;
DROP POLICY IF EXISTS "Allow public access to update invoices" ON invoices;
DROP POLICY IF EXISTS "Allow public access to delete invoices" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated users to insert invoices" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated users to update invoices" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated users to delete invoices" ON invoices;
DROP POLICY IF EXISTS "Allow public access to view invoices" ON invoices;

-- Create a policy for public/anonymous access to view invoices
CREATE POLICY "Allow public access to view invoices"
  ON invoices
  FOR SELECT
  USING (true);

-- Create a policy for public/anonymous access to add invoices
CREATE POLICY "Allow public access to insert invoices"
  ON invoices
  FOR INSERT
  WITH CHECK (true);

-- Create a policy for public/anonymous access to update invoices
CREATE POLICY "Allow public access to update invoices"
  ON invoices
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create a policy for public/anonymous access to delete invoices
CREATE POLICY "Allow public access to delete invoices"
  ON invoices
  FOR DELETE
  USING (true); 