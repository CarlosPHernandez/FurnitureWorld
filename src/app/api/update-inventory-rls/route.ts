import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database.types'
import fs from 'fs'
import path from 'path'

// Environment variables for Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// GET endpoint to update RLS policies for inventory_items table
export async function GET(request: NextRequest) {
  try {
    // Create an admin client that bypasses RLS
    const adminSupabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey
    )

    // SQL to update RLS policies
    const sql = `
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
    `

    // Execute the SQL
    const { error } = await adminSupabase.rpc('exec_sql', { sql })

    if (error) {
      console.error('Error executing SQL:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Inventory RLS policies updated successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 