import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export async function GET() {
  try {
    console.log('Starting test-invoice API call')

    // Properly await cookies() before using it
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Check if the invoices table exists
    console.log('Checking if invoices table exists...')
    try {
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('invoices')
        .select('id')
        .limit(1)

      if (tableCheckError) {
        console.error('Error checking invoices table:', tableCheckError)

        // If the table doesn't exist, try to create it
        if (tableCheckError.message.includes('relation "invoices" does not exist')) {
          console.log('Invoices table does not exist, attempting to create it...')

          // Create the invoice_status enum
          const createEnumResult = await supabase.rpc('exec_sql', {
            sql: `CREATE TYPE IF NOT EXISTS invoice_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');`
          })

          if (createEnumResult.error) {
            console.error('Error creating enum:', createEnumResult.error)
          }

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

          if (createTableResult.error) {
            console.error('Error creating table:', createTableResult.error)
            return NextResponse.json({
              error: 'Failed to create invoices table',
              details: createTableResult.error
            }, { status: 500 })
          }

          console.log('Invoices table created successfully')
        } else {
          return NextResponse.json({
            error: 'Error checking invoices table',
            details: tableCheckError.message
          }, { status: 500 })
        }
      } else {
        console.log('Invoices table exists')
      }
    } catch (error) {
      console.error('Exception checking table:', error)
      return NextResponse.json({
        error: 'Exception checking table',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    // Create a test invoice
    console.log('Creating test invoice...')
    const testInvoice = {
      invoice_number: 'TEST-001',
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '123-456-7890',
      customer_address: '123 Test St, Test City, TS 12345',
      date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        {
          description: 'Test Item',
          quantity: 1,
          unitPrice: 100,
          total: 100
        }
      ],
      subtotal: 100,
      tax: 8,
      total: 108,
      status: 'pending'
    }

    console.log('Test invoice data:', JSON.stringify(testInvoice, null, 2))

    const { data, error } = await supabase
      .from('invoices')
      .insert([testInvoice])
      .select()
      .single()

    if (error) {
      console.error('Error creating test invoice:', error)
      return NextResponse.json({
        error: 'Error creating test invoice',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    console.log('Test invoice created successfully:', data)
    return NextResponse.json({
      message: 'Test invoice created successfully',
      invoice: data
    })
  } catch (error) {
    console.error('Exception in test-invoice API:', error)
    return NextResponse.json({
      error: 'Failed to create test invoice',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 