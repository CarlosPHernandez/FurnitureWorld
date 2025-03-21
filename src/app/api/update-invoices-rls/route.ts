import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

// Environment variables for Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// GET endpoint to update RLS policies for invoices table
export async function GET(request: NextRequest) {
  try {
    // Create an admin client that bypasses RLS
    const adminSupabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey
    )

    // SQL to update RLS policies
    const sql = `
      -- Update Row Level Security policies for invoices table
      -- This allows public/anonymous access to the invoices table

      -- First, drop any existing policies that might conflict
      DROP POLICY IF EXISTS "Allow public access to view invoices" ON invoices;
      DROP POLICY IF EXISTS "Allow public access to insert invoices" ON invoices;
      DROP POLICY IF EXISTS "Allow public access to update invoices" ON invoices;
      DROP POLICY IF EXISTS "Allow public access to delete invoices" ON invoices;

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
    `

    // Execute the SQL
    const { error } = await adminSupabase.rpc('exec_sql', { sql })

    if (error) {
      console.error('Error executing SQL:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Invoices RLS policies updated successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 