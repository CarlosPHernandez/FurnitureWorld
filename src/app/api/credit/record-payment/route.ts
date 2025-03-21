import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function POST(request: Request) {
  try {
    const { accountId, payment } = await request.json()
    console.log('Recording payment for account:', accountId)
    console.log('Payment details:', payment)

    // Properly await cookies() before using it
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current account data
    const { data: account, error: fetchError } = await supabase
      .from('credit_accounts')
      .select()
      .eq('id', accountId)
      .single()

    if (fetchError) {
      console.error('Error fetching credit account:', fetchError)
      return NextResponse.json(
        { error: `Failed to fetch credit account: ${fetchError.message}` },
        { status: 500 }
      )
    }

    if (!account) {
      console.error('Credit account not found:', accountId)
      return NextResponse.json(
        { error: 'Credit account not found' },
        { status: 404 }
      )
    }

    console.log('Current account data:', JSON.stringify(account, null, 2))

    // Get the current payments array and remaining balance, handling both camelCase and snake_case
    const currentPayments = Array.isArray(account.payments) ? account.payments : []

    const currentRemainingBalance =
      typeof account.remaining_balance === 'number' ? account.remaining_balance :
        (typeof account.remainingBalance === 'number' ? account.remainingBalance : 0)

    console.log('Current payments:', currentPayments)
    console.log('Current remaining balance:', currentRemainingBalance)
    console.log('Payment amount to deduct:', payment.amount)

    // Update account with new payment using snake_case field names for database compatibility
    const { data: updatedAccount, error: updateError } = await supabase
      .from('credit_accounts')
      .update({
        payments: [...currentPayments, payment],
        remaining_balance: currentRemainingBalance - payment.amount
      })
      .eq('id', accountId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating credit account:', updateError)
      return NextResponse.json(
        { error: `Failed to record payment: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('Payment recorded successfully')
    return NextResponse.json({
      success: true,
      updatedAccount
    })
  } catch (error) {
    console.error('Error recording payment:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 