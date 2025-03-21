import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function POST(request: Request) {
  try {
    const customerData = await request.json()
    console.log('Received customer data:', JSON.stringify(customerData, null, 2))

    // Validate required fields
    const requiredFields = [
      'fullName',
      'address',
      'phoneNumber',
      'dateOfBirth',
      'paymentMethod',
      'paymentFrequency',
      'itemsFinanced'
    ]

    for (const field of requiredFields) {
      if (!customerData[field]) {
        console.error(`Missing required field: ${field}`)
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate itemsFinanced
    if (!Array.isArray(customerData.itemsFinanced) || customerData.itemsFinanced.length === 0) {
      console.error('Invalid itemsFinanced: must be a non-empty array')
      return NextResponse.json(
        { error: 'Invalid itemsFinanced: must be a non-empty array' },
        { status: 400 }
      )
    }

    // Properly await cookies() before using it
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Calculate total amount
    const totalAmount = customerData.itemsFinanced.reduce(
      (total: number, item: { price: number }) => total + item.price,
      0
    )

    console.log('Calculated total amount:', totalAmount)

    // Convert camelCase to snake_case for database compatibility
    const dataToInsert = {
      // Use snake_case column names to match the database
      full_name: customerData.fullName,
      address: customerData.address,
      phone_number: customerData.phoneNumber,
      date_of_birth: customerData.dateOfBirth,
      tax_id: customerData.taxId || '',
      drivers_license: customerData.driversLicense || '',
      payment_method: customerData.paymentMethod,
      // Use card_name instead of cardName
      card_name: customerData.cardName || null,
      card_number: customerData.cardNumber || null,
      payment_frequency: customerData.paymentFrequency,
      payment_amount: customerData.paymentAmount,
      items_financed: customerData.itemsFinanced,
      total_amount: totalAmount,
      remaining_balance: totalAmount,
      payments: []
    }

    console.log('Data to insert (with snake_case):', JSON.stringify(dataToInsert, null, 2))

    // Insert the new credit account
    const { data, error } = await supabase
      .from('credit_accounts')
      .insert([dataToInsert])
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating credit account:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))

      return NextResponse.json(
        {
          error: `Failed to create credit account: ${error.message}`,
          details: error
        },
        { status: 500 }
      )
    }

    console.log('Successfully created credit account:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating credit account:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 