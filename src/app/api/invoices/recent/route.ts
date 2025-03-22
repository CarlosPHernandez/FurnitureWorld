import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Environment variables for Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET(request: Request) {
  try {
    // Get the limit parameter, default to 5
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5', 10)

    // Create a Supabase admin client with the service role key to bypass RLS
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Fetch only the most recent invoices
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent invoices:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform database field names to camelCase for frontend
    const transformedData = data.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      customerName: invoice.customer_name || 'Customer', // Add default if missing
      customerEmail: invoice.customer_email,
      customerPhone: invoice.customer_phone,
      customerAddress: invoice.customer_address,
      date: invoice.date,
      dueDate: invoice.due_date,
      items: invoice.items,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      status: invoice.status,
      notes: invoice.notes,
      paidDate: invoice.paid_date,
      createdBy: invoice.created_by,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching recent invoices:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 