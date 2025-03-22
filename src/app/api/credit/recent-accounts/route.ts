import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function GET(request: Request) {
  try {
    // Get the limit parameter, default to 5
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5', 10)

    // Create a Supabase client
    const supabase = createServerComponentClient<Database>({
      cookies
    })

    // Fetch the most recent credit accounts
    const { data, error } = await supabase
      .from('credit_accounts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent credit accounts:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Transform the data to ensure it matches the CustomerCredit interface
    const transformedData = data.map(account => ({
      id: account.id,
      fullName: account.full_name || '',
      address: account.address || '',
      phoneNumber: account.phone_number || '',
      dateOfBirth: account.date_of_birth || '',
      taxId: account.tax_id || '',
      driversLicense: account.drivers_license || '',
      paymentMethod: account.payment_method || 'cash',
      cardName: account.card_name || '',
      cardNumber: account.card_number || '',
      paymentFrequency: account.payment_frequency || 'monthly',
      paymentAmount: Number(account.payment_amount || 0),
      itemsFinanced: Array.isArray(account.items_financed) ? account.items_financed : [],
      totalAmount: Number(account.total_amount || 0),
      remainingBalance: Number(account.remaining_balance || 0),
      payments: Array.isArray(account.payments) ? account.payments : [],
      // Include original fields for dashboard compatibility
      created_at: account.created_at
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 