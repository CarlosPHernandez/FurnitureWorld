import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database.types'

// Environment variables for Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// GET: Fetch a specific inventory item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create an admin client that bypasses RLS using the service role key
    const adminSupabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey
    )

    // Remove authentication check - allow public access to inventory items
    const { data, error } = await adminSupabase
      .from('inventory_items')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching inventory item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT: Update an inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create an admin client that bypasses RLS using the service role key
    const adminSupabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey
    )

    // Get request body
    const body = await request.json()

    // Update the inventory item
    const { data, error } = await adminSupabase
      .from('inventory_items')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating inventory item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Remove an inventory item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create an admin client that bypasses RLS using the service role key
    const adminSupabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey
    )

    // Delete the inventory item
    const { error } = await adminSupabase
      .from('inventory_items')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting inventory item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 