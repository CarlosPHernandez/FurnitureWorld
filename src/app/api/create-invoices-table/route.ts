import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET() {
  try {
    // Properly await cookies() before using it
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Create the invoice_status enum if it doesn't exist
    const createEnumResult = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
            CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
          END IF;
        END
        $$;
      `
    })

    // Create the invoices table
    const createTableResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS invoices (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          invoice_number VARCHAR(50) NOT NULL UNIQUE,
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255),
          customer_phone VARCHAR(50),
          customer_address TEXT,
          date DATE NOT NULL,
          due_date DATE NOT NULL,
          items JSONB NOT NULL DEFAULT '[]'::jsonb,
          subtotal DECIMAL(10, 2) NOT NULL,
          tax DECIMAL(10, 2) NOT NULL,
          total DECIMAL(10, 2) NOT NULL,
          status invoice_status NOT NULL DEFAULT 'pending',
          notes TEXT,
          paid_date DATE,
          created_by UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    // Create the update_invoice_updated_at function
    const createFunctionResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_invoice_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    })

    // Create the trigger
    const createTriggerResult = await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
        CREATE TRIGGER update_invoices_updated_at
          BEFORE UPDATE ON invoices
          FOR EACH ROW
          EXECUTE FUNCTION update_invoice_updated_at();
      `
    })

    // Create indexes
    const createIndexesResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_invoices_customer_name ON invoices(customer_name);
        CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
        CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
        CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
      `
    })

    // Enable RLS
    const enableRlsResult = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
      `
    })

    // Create policies
    const createPoliciesResult = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Allow public access to view invoices" ON invoices;
        CREATE POLICY "Allow public access to view invoices"
          ON invoices
          FOR SELECT
          USING (true);

        DROP POLICY IF EXISTS "Allow authenticated users to insert invoices" ON invoices;
        CREATE POLICY "Allow authenticated users to insert invoices"
          ON invoices
          FOR INSERT
          TO authenticated
          WITH CHECK (true);

        DROP POLICY IF EXISTS "Allow authenticated users to update invoices" ON invoices;
        CREATE POLICY "Allow authenticated users to update invoices"
          ON invoices
          FOR UPDATE
          TO authenticated
          USING (true)
          WITH CHECK (true);

        DROP POLICY IF EXISTS "Allow authenticated users to delete invoices" ON invoices;
        CREATE POLICY "Allow authenticated users to delete invoices"
          ON invoices
          FOR DELETE
          TO authenticated
          USING (true);
      `
    })

    return NextResponse.json({
      message: 'Invoices table created successfully',
      results: {
        createEnum: createEnumResult,
        createTable: createTableResult,
        createFunction: createFunctionResult,
        createTrigger: createTriggerResult,
        createIndexes: createIndexesResult,
        enableRls: enableRlsResult,
        createPolicies: createPoliciesResult
      }
    })
  } catch (error) {
    console.error('Error creating invoices table:', error)
    return NextResponse.json({
      error: 'Failed to create invoices table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 