import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Environment variables for Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// PUT: Update a delivery (mark as done, etc.)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Create a Supabase client with the anon key
    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    )

    // Get request body
    const body = await request.json()

    // Update the delivery
    const { data, error } = await supabase
      .from('deliveries')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating delivery:', error)
    return NextResponse.json(
      { error: 'Failed to update delivery' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a delivery
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Create a Supabase client with the anon key
    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    )

    // Delete the delivery
    const { error } = await supabase
      .from('deliveries')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting delivery:', error)
    return NextResponse.json(
      { error: 'Failed to delete delivery' },
      { status: 500 }
    )
  }
} 