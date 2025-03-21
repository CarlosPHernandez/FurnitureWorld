import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Environment variables for Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET() {
  try {
    // Create a Supabase admin client with the service role key to bypass RLS
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Public access to invoices is allowed
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Check if the error is because the table doesn't exist
      if (error.message.includes('relation "invoices" does not exist')) {
        return NextResponse.json(
          {
            error: 'The invoices database table does not exist. Please run the database migration.',
            details: error.message
          },
          { status: 500 }
        )
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Create a Supabase admin client with the service role key to bypass RLS
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Get auth status for debugging
    const cookieStore = cookies()
    if (cookieStore) {
      const authCookie = cookieStore.get('sb-auth-token')
      console.log('Auth cookie exists:', !!authCookie)
    }

    // Get the invoice data from the request
    const invoiceData = await request.json()
    console.log('Received invoice data:', JSON.stringify(invoiceData))

    // Validate required fields
    const requiredFields = ['customerName', 'date', 'dueDate', 'items', 'subtotal', 'tax', 'total']
    for (const field of requiredFields) {
      if (!invoiceData[field]) {
        console.error(`Missing required field: ${field}`)
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Check if invoices table exists
    console.log('Checking if invoices table exists...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('invoices')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('Error checking invoices table:', tableError)
      return NextResponse.json({
        error: 'Database error checking invoices table',
        details: tableError.message,
        code: tableError.code
      }, { status: 500 })
    }

    // Generate invoice number
    console.log('Generating invoice number...')
    const currentYear = new Date().getFullYear()
    let nextInvoiceNumber = 1

    // Get the highest invoice number for the current year
    const { data: highestInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('invoice_number')
      .ilike('invoice_number', `INV-${currentYear}-%`)
      .order('invoice_number', { ascending: false })
      .limit(1)

    if (invoiceError) {
      console.error('Error getting highest invoice number:', invoiceError)
      return NextResponse.json({
        error: 'Database error getting highest invoice number',
        details: invoiceError.message,
        code: invoiceError.code
      }, { status: 500 })
    }

    if (highestInvoice && highestInvoice.length > 0) {
      const lastNumberPart = highestInvoice[0].invoice_number.split('-')[2]
      nextInvoiceNumber = parseInt(lastNumberPart, 10) + 1
      console.log('Last invoice number found:', highestInvoice[0].invoice_number)
      console.log('Next invoice number will be:', nextInvoiceNumber)
    }

    const invoiceNumber = `INV-${currentYear}-${nextInvoiceNumber.toString().padStart(4, '0')}`
    console.log('Generated invoice number:', invoiceNumber)

    // Prepare data for insertion
    const insertData = {
      invoice_number: invoiceNumber,
      customer_name: invoiceData.customerName,
      customer_email: invoiceData.customerEmail || null,
      customer_phone: invoiceData.customerPhone || null,
      customer_address: invoiceData.customerAddress || null,
      date: invoiceData.date,
      due_date: invoiceData.dueDate,
      items: invoiceData.items,  // Supabase handles JSONB serialization automatically
      subtotal: invoiceData.subtotal,
      tax: invoiceData.tax,
      total: invoiceData.total,
      status: 'pending',
      notes: invoiceData.notes || null,
      // No longer relying on session user ID
      created_by: null,
    }

    console.log('Preparing to insert with data:', JSON.stringify(insertData))

    // Insert the invoice
    console.log('Inserting invoice...')
    const { data, error } = await supabase
      .from('invoices')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error creating invoice:', error)
      console.error('Error details:', JSON.stringify(error))
      return NextResponse.json({
        error: 'Database error creating invoice',
        details: error.message,
        code: error.code,
        hint: error.hint || null,
        details_full: JSON.stringify(error)
      }, { status: 500 })
    }

    console.log('Invoice created successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Exception creating invoice:', error)
    console.error('Error details:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
} 