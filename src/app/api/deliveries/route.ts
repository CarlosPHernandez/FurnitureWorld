import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Environment variables for Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function POST(request: Request) {
  try {
    // Create a Supabase client with the anon key
    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    )

    const body = await request.json()

    // Generate a unique delivery ID with FDO prefix
    const deliveryId = `FDO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    const { data, error } = await supabase
      .from('deliveries')
      .insert([
        {
          id: deliveryId,
          customer: body.customer,
          address: body.address,
          delivery_date: body.delivery_date,
          time_slot: body.time_slot,
          driver: body.driver,
          items: body.items,
          status: 'Scheduled',
          coordinates: body.coordinates || null
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error saving delivery:', error)
    return NextResponse.json(
      { error: 'Failed to save delivery' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Create a Supabase client with the anon key
    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    )

    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching deliveries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deliveries' },
      { status: 500 }
    )
  }
} 