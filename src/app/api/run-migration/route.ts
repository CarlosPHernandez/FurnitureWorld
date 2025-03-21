import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20240615000000_create_invoices_table.sql')
    const migrationSql = fs.readFileSync(migrationPath, 'utf8')

    // Properly await cookies() before using it
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Execute the SQL statements one by one
    const statements = migrationSql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0)

    const results = []

    for (const statement of statements) {
      try {
        // Skip DO blocks as they can't be executed directly via SQL query
        if (statement.startsWith('DO')) {
          results.push({ statement: 'DO block', status: 'skipped' })
          continue
        }

        const { error } = await supabase.rpc('exec_sql', { sql: statement })

        if (error) {
          results.push({ statement, error: error.message, status: 'error' })
        } else {
          results.push({ statement, status: 'success' })
        }
      } catch (error) {
        results.push({
          statement,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'error'
        })
      }
    }

    return NextResponse.json({
      message: 'Migration execution attempted',
      results
    })
  } catch (error) {
    console.error('Error running migration:', error)
    return NextResponse.json({
      error: 'Failed to run migration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 