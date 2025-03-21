-- Update Row Level Security policies for inventory_items table
-- This allows public/anonymous access to the inventory_items table

-- First, drop any existing policies that might conflict
DROP POLICY IF EXISTS "Allow public access to view inventory" ON inventory_items;
DROP POLICY IF EXISTS "Allow public access to insert inventory" ON inventory_items;
DROP POLICY IF EXISTS "Allow public access to update inventory" ON inventory_items;
DROP POLICY IF EXISTS "Allow public access to delete inventory" ON inventory_items;

-- Create a policy for public/anonymous access to view inventory
CREATE POLICY "Allow public access to view inventory"
  ON inventory_items
  FOR SELECT
  USING (true);

-- Create a policy for public/anonymous access to add inventory
CREATE POLICY "Allow public access to insert inventory"
  ON inventory_items
  FOR INSERT
  WITH CHECK (true);

-- Create a policy for public/anonymous access to update inventory
CREATE POLICY "Allow public access to update inventory"
  ON inventory_items
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create a policy for public/anonymous access to delete inventory
CREATE POLICY "Allow public access to delete inventory"
  ON inventory_items
  FOR DELETE
  USING (true); 