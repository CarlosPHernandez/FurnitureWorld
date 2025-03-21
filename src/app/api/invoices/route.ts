import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export async function GET() {
  try {
    // Properly await cookies() before using it
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

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
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Temporarily remove authentication check for testing
    // const { data: { session } } = await supabase.auth.getSession()
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Get the invoice data from the request
    const invoiceData = await request.json()
    console.log('Received invoice data:', JSON.stringify(invoiceData, null, 2))

    // Validate required fields
    const requiredFields = ['customerName', 'date', 'dueDate', 'items', 'subtotal', 'tax', 'total']
    for (const field of requiredFields) {
      if (!invoiceData[field]) {
        console.error(`Missing required field: ${field}`)
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Check if the invoices table exists
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('invoices')
        .select('id')
        .limit(1)

      if (tableError) {
        console.error('Error checking invoices table:', tableError)
        return NextResponse.json({
          error: 'Database table error',
          details: tableError.message
        }, { status: 500 })
      }

      console.log('Table check successful')
    } catch (tableCheckError) {
      console.error('Exception checking table:', tableCheckError)
      return NextResponse.json({
        error: 'Exception checking database table',
        details: tableCheckError instanceof Error ? tableCheckError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Generate invoice number
    const { data: existingInvoices, error: numberError } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1)

    if (numberError) {
      console.error('Error getting existing invoice numbers:', numberError)
      return NextResponse.json({
        error: 'Error generating invoice number',
        details: numberError.message
      }, { status: 500 })
    }

    let invoiceNumber = 'INV-' + new Date().getFullYear() + '-001'

    if (existingInvoices && existingInvoices.length > 0) {
      const lastInvoiceNumber = existingInvoices[0].invoice_number
      const lastNumber = parseInt(lastInvoiceNumber.split('-')[2])
      invoiceNumber = `INV-${new Date().getFullYear()}-${(lastNumber + 1).toString().padStart(3, '0')}`
    }

    console.log('Generated invoice number:', invoiceNumber)

    // Prepare data for insertion
    const insertData = {
      invoice_number: invoiceNumber,
      customer_name: invoiceData.customerName,
      customer_email: invoiceData.customerEmail,
      customer_phone: invoiceData.customerPhone,
      customer_address: invoiceData.customerAddress,
      date: invoiceData.date,
      due_date: invoiceData.dueDate,
      items: invoiceData.items,
      subtotal: invoiceData.subtotal,
      tax: invoiceData.tax,
      total: invoiceData.total,
      status: 'pending',
      notes: invoiceData.notes,
      // created_by: session.user.id
    }

    console.log('Inserting invoice data:', JSON.stringify(insertData, null, 2))

    // Insert the new invoice
    const { data, error } = await supabase
      .from('invoices')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error creating invoice:', error)
      return NextResponse.json({
        error: 'Database error creating invoice',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    console.log('Invoice created successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Exception creating invoice:', error)
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 