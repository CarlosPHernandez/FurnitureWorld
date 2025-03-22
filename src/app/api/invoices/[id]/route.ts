import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Environment variables for Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Create an admin client that bypasses RLS
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Public access to individual invoices is allowed
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Transform to camelCase for frontend
    const transformedData = {
      id: data.id,
      invoiceNumber: data.invoice_number,
      customerName: data.customer_name || 'Customer', // Add default if missing
      customerEmail: data.customer_email,
      customerPhone: data.customer_phone,
      customerAddress: data.customer_address,
      date: data.date,
      dueDate: data.due_date,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      status: data.status,
      notes: data.notes,
      paidDate: data.paid_date,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Create an admin client that bypasses RLS
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Get the invoice data from the request
    const invoiceData = await request.json()

    // Update the invoice
    const { data, error } = await supabase
      .from('invoices')
      .update({
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
        status: invoiceData.status,
        notes: invoiceData.notes,
        paid_date: invoiceData.paidDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating invoice:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Create an admin client that bypasses RLS
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Delete the invoice
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting invoice:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Create an admin client that bypasses RLS
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Get the partial update data from the request
    const updateData = await request.json()
    console.log('PATCH request with data:', JSON.stringify(updateData))

    // Prepare the update object (only include fields that are provided)
    const updateObject: Record<string, any> = {};

    // Map incoming fields to database column names
    if (updateData.status !== undefined) updateObject.status = updateData.status;
    if (updateData.paidDate !== undefined) updateObject.paid_date = updateData.paidDate;
    if (updateData.date !== undefined) updateObject.date = updateData.date;
    if (updateData.dueDate !== undefined) updateObject.due_date = updateData.dueDate;

    // Always update the updated_at timestamp
    updateObject.updated_at = new Date().toISOString();

    console.log('Update object:', JSON.stringify(updateObject))

    // Update the invoice
    const { data, error } = await supabase
      .from('invoices')
      .update(updateObject)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating invoice:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Transform to camelCase for frontend
    const transformedData = {
      id: data.id,
      invoiceNumber: data.invoice_number,
      customerName: data.customer_name || 'Customer', // Add default if missing
      customerEmail: data.customer_email,
      customerPhone: data.customer_phone,
      customerAddress: data.customer_address,
      date: data.date,
      dueDate: data.due_date,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      status: data.status,
      notes: data.notes,
      paidDate: data.paid_date,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 