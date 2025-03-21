import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = createClient()

    // Check if the invoices table exists
    const { error: tableCheckError } = await supabase
      .from('invoices')
      .select('id')
      .limit(1)

    // If the table doesn't exist, create it
    if (tableCheckError && tableCheckError.message.includes('relation "invoices" does not exist')) {
      console.log('Invoices table does not exist, creating it...')

      // Create the invoice_status enum
      const { error: createEnumError } = await supabase.rpc('exec_sql', {
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
              CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
            END IF;
          END $$;
        `
      })

      if (createEnumError) {
        console.error('Error creating enum:', createEnumError)
        return NextResponse.json({
          error: 'Failed to create invoice_status enum',
          details: createEnumError.message
        }, { status: 500 })
      }

      // Create the invoices table
      const { error: createTableError } = await supabase.rpc('exec_sql', {
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
          
          -- Create function to update updated_at timestamp
          CREATE OR REPLACE FUNCTION update_invoice_updated_at()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ language 'plpgsql';
          
          -- Create trigger to automatically update updated_at
          DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
          CREATE TRIGGER update_invoices_updated_at
            BEFORE UPDATE ON invoices
            FOR EACH ROW
            EXECUTE FUNCTION update_invoice_updated_at();
          
          -- Create indexes for common queries
          CREATE INDEX IF NOT EXISTS idx_invoices_customer_name ON invoices(customer_name);
          CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
          CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
          CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
          
          -- Enable RLS
          ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
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

      if (createTableError) {
        console.error('Error creating table:', createTableError)
        return NextResponse.json({
          error: 'Failed to create invoices table',
          details: createTableError.message
        }, { status: 500 })
      }

      console.log('Invoices table created successfully')
    }

    // Generate a unique invoice number (simple implementation)
    const invoiceNumber = `INV-${Date.now()}`

    // Hardcoded invoice data for testing
    const invoiceData = {
      invoice_number: invoiceNumber,
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '555-123-4567',
      customer_address: '123 Test Street, Test City, TS 12345',
      date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      items: [
        {
          description: 'Queen Mattress',
          quantity: 1,
          unit_price: 899.99,
          total: 899.99
        },
        {
          description: 'Mattress Protector',
          quantity: 1,
          unit_price: 79.99,
          total: 79.99
        },
        {
          description: 'Delivery Fee',
          quantity: 1,
          unit_price: 49.99,
          total: 49.99
        }
      ],
      subtotal: 1029.97,
      tax: 82.40,
      total: 1112.37,
      status: 'pending',
      notes: 'This is a test invoice created via the API'
    }

    // Insert the invoice into the database
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()

    if (error) {
      console.error('Error creating invoice:', error)
      return NextResponse.json({
        error: 'Failed to create invoice',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Invoice created successfully',
      invoice: data[0]
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
