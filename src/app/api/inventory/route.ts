import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database.types'

// Environment variables for Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// GET: Fetch all inventory items
export async function GET(request: NextRequest) {
  try {
    // Create an admin client that bypasses RLS using the service role key
    const adminSupabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey
    )

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const status = searchParams.get('status')
    const lowStock = searchParams.get('lowStock') === 'true'

    // Build query
    let query = adminSupabase
      .from('inventory_items')
      .select('*')
      .order('updated_at', { ascending: false })

    // Apply filters if provided
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (brand && brand !== 'all') {
      query = query.eq('brand', brand)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (lowStock) {
      query = query.lte('quantity', adminSupabase.rpc('least', { a: 'quantity', b: 'min_quantity' }))
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching inventory:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Create a new inventory item
export async function POST(request: NextRequest) {
  try {
    // Create an admin client that bypasses RLS using the service role key
    const adminSupabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey
    )

    // Get request body
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['sku', 'name', 'category', 'brand', 'price', 'cost']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Transform the data to match database schema
    const inventoryItem = {
      sku: body.sku,
      name: body.name,
      category: body.category,
      brand: body.brand,
      quantity: body.quantity || 0,
      min_quantity: body.minQuantity || 0,
      price: body.price,
      cost: body.cost,
      image_url: body.imageUrl || '/download.jpg',

      // Dimensions
      length: body.dimensions?.length || null,
      width: body.dimensions?.width || null,
      height: body.dimensions?.height || null,
      dimension_unit: body.dimensions?.unit || 'cm',

      // Physical properties
      weight: body.weight || null,
      weight_unit: body.weightUnit || 'kg',
      materials: body.materials || [],
      finish: body.finish || null,
      color: body.color || null,

      // Assembly
      assembly_required: body.assemblyRequired || false,
      assembly_time: body.assemblyTime || null,

      // Warranty
      warranty_duration: body.warranty?.duration || null,
      warranty_coverage: body.warranty?.coverage || null,

      // Supplier
      supplier_id: body.supplier?.id || null,
      supplier_name: body.supplier?.name || null,
      supplier_lead_time: body.supplier?.leadTime || null,
      supplier_minimum_order: body.supplier?.minimumOrder || null,
      supplier_price_breaks: body.supplier?.priceBreaks || [],
      supplier_rating: body.supplier?.rating || null,

      // Location
      warehouse: body.location?.warehouse || 'MAIN',
      aisle: body.location?.aisle || null,
      shelf: body.location?.shelf || null,

      // Status
      status: body.status || 'active',
      season: body.season || null,

      // Additional info
      tags: body.tags || [],
      notes: body.notes || null,

      // Quality control
      last_inspection: body.qualityControl?.lastInspection || null,
      inspector: body.qualityControl?.inspector || null,
      quality_status: body.qualityControl?.status || 'pending',
      quality_issues: body.qualityControl?.issues || [],

      // Customization
      customization_available: body.customization?.available || false,
      customization_options: body.customization?.options || []
    }

    // Insert into database
    const { data, error } = await adminSupabase
      .from('inventory_items')
      .insert(inventoryItem)
      .select()

    if (error) {
      console.error('Error creating inventory item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 