import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function GET() {
  try {
    // Properly await cookies() before using it
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Test the connection by getting the count of credit accounts
    const { count, error } = await supabase
      .from('credit_accounts')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Supabase connection test error:', error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error
        },
        { status: 500 }
      )
    }

    // Get column information to help debug schema issues
    const { data: columnInfo, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'credit_accounts' })

    let columns = []
    if (!columnError && columnInfo) {
      columns = columnInfo
    } else {
      console.log('Could not retrieve column information:', columnError)
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      count,
      columns
    })
  } catch (error) {
    console.error('Error testing database connection:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
} 