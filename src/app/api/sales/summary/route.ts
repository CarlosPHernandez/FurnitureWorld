import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// Environment variables for Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'month'

    // Create a Supabase client with service role for full access
    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    // Get current date
    const now = new Date()

    // Calculate start date based on timeframe
    let startDate: Date
    let periodLabels: string[] = []
    let groupByFormat: string

    switch (timeframe) {
      case 'day':
        // Start of today
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
        groupByFormat = 'HH24'
        // Generate hour labels for today (9AM, 11AM, etc.)
        periodLabels = Array.from({ length: 12 }, (_, i) => {
          const hour = i + 9  // Start from 9AM
          return `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`
        })
        break

      case 'week':
        // Start of current week (Sunday)
        const dayOfWeek = now.getDay()
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 0, 0, 0)
        groupByFormat = 'D'
        // Generate day of week labels (Sun, Mon, etc.)
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        periodLabels = weekdays
        break

      case 'year':
        // Start of current year
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0)
        groupByFormat = 'MM'
        // Generate month labels (Jan, Feb, etc.)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        periodLabels = months
        break

      case 'month':
      default:
        // Start of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
        groupByFormat = 'DD'
        // Generate week labels (Week 1, Week 2, etc.)
        periodLabels = Array.from({ length: 5 }, (_, i) => `Week ${i + 1}`)
        break
    }

    // Format date for SQL query
    const formattedStartDate = startDate.toISOString()

    // 1. Get total sales from invoices table
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, total, date, status')
      .gte('date', formattedStartDate)
      .order('date', { ascending: true })

    if (invoiceError) {
      console.error('Error fetching invoice data:', invoiceError)
      return NextResponse.json(
        { error: 'Error fetching invoice data' },
        { status: 500 }
      )
    }

    // 2. Get credit data from credit_accounts table
    const { data: creditData, error: creditError } = await supabase
      .from('credit_accounts')
      .select('id, total_amount, created_at, items_financed')
      .gte('created_at', formattedStartDate)
      .order('created_at', { ascending: true })

    if (creditError) {
      console.error('Error fetching credit data:', creditError)
      return NextResponse.json(
        { error: 'Error fetching credit data' },
        { status: 500 }
      )
    }

    // Calculate totals
    const totalInvoiceSales = invoiceData.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
    const totalCreditSales = creditData.reduce((sum, account) => sum + (account.total_amount || 0), 0)

    const totalSales = totalInvoiceSales + totalCreditSales
    const cashSales = totalInvoiceSales // Assuming all invoice sales are cash sales
    const creditSales = totalCreditSales

    // Calculate customer count
    const invoiceCustomers = invoiceData.length
    const creditCustomers = creditData.length
    const totalCustomers = invoiceCustomers + creditCustomers

    // Calculate average sale
    const averageSale = totalSales / (totalCustomers || 1) // Avoid division by zero

    // Process categorized sales data
    // Extract categories from credit accounts and invoices
    const categories: Record<string, number> = {}

    // Add categories from credit accounts
    creditData.forEach(account => {
      if (Array.isArray(account.items_financed)) {
        account.items_financed.forEach((item: any) => {
          const category = item.category || "Uncategorized"
          categories[category] = (categories[category] || 0) + Number(item.price)
        })
      }
    })

    // For invoices, we'll need to estimate categories
    // This is a simple implementation assuming categories based on description
    invoiceData.forEach(invoice => {
      // Default category for invoices if we can't determine
      categories["Other"] = (categories["Other"] || 0) + Number(invoice.total || 0)
    })

    // Convert to array format expected by the dashboard
    const salesByCategory = Object.entries(categories).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }))

    // Prepare period sales data (for chart)
    let periodSales: Array<{ month: string, sales: number, credit: number, cash: number }> = []

    // Simple implementation - more sophisticated grouping would require SQL date functions
    if (timeframe === 'day') {
      // Group by hour buckets for the day
      periodSales = periodLabels.map((hourLabel) => ({
        month: hourLabel,
        sales: 0,
        credit: 0,
        cash: 0
      }))

      // This is a simplified approach - in a real implementation, you would use SQL to group by hour
      creditData.forEach(account => {
        const hour = new Date(account.created_at).getHours()
        if (hour >= 9 && hour < 21) { // Business hours 9AM-9PM
          const index = Math.floor((hour - 9) / 1) // 1-hour buckets
          if (periodSales[index]) {
            periodSales[index].sales += account.total_amount || 0
            periodSales[index].credit += account.total_amount || 0
          }
        }
      })

      invoiceData.forEach(invoice => {
        const hour = new Date(invoice.date).getHours()
        if (hour >= 9 && hour < 21) { // Business hours 9AM-9PM
          const index = Math.floor((hour - 9) / 1) // 1-hour buckets
          if (periodSales[index]) {
            periodSales[index].sales += invoice.total || 0
            periodSales[index].cash += invoice.total || 0
          }
        }
      })
    }
    else if (timeframe === 'week') {
      // Group by day of week
      periodSales = periodLabels.map((dayLabel) => ({
        month: dayLabel,
        sales: 0,
        credit: 0,
        cash: 0
      }))

      creditData.forEach(account => {
        const dayOfWeek = new Date(account.created_at).getDay()
        periodSales[dayOfWeek].sales += account.total_amount || 0
        periodSales[dayOfWeek].credit += account.total_amount || 0
      })

      invoiceData.forEach(invoice => {
        const dayOfWeek = new Date(invoice.date).getDay()
        periodSales[dayOfWeek].sales += invoice.total || 0
        periodSales[dayOfWeek].cash += invoice.total || 0
      })
    }
    else if (timeframe === 'year') {
      // Group by month
      periodSales = periodLabels.map((monthLabel) => ({
        month: monthLabel,
        sales: 0,
        credit: 0,
        cash: 0
      }))

      creditData.forEach(account => {
        const month = new Date(account.created_at).getMonth()
        periodSales[month].sales += account.total_amount || 0
        periodSales[month].credit += account.total_amount || 0
      })

      invoiceData.forEach(invoice => {
        const month = new Date(invoice.date).getMonth()
        periodSales[month].sales += invoice.total || 0
        periodSales[month].cash += invoice.total || 0
      })
    }
    else {
      // Month view - group by week
      const weeks: { [key: string]: { sales: number, credit: number, cash: number } } = {}

      // Initialize the weeks
      periodLabels.forEach((label, index) => {
        weeks[label] = { sales: 0, credit: 0, cash: 0 }
      })

      creditData.forEach(account => {
        const day = new Date(account.created_at).getDate()
        const weekNumber = Math.floor(day / 7) + 1
        const weekLabel = `Week ${weekNumber}`

        if (weeks[weekLabel]) {
          weeks[weekLabel].sales += account.total_amount || 0
          weeks[weekLabel].credit += account.total_amount || 0
        }
      })

      invoiceData.forEach(invoice => {
        const day = new Date(invoice.date).getDate()
        const weekNumber = Math.floor(day / 7) + 1
        const weekLabel = `Week ${weekNumber}`

        if (weeks[weekLabel]) {
          weeks[weekLabel].sales += invoice.total || 0
          weeks[weekLabel].cash += invoice.total || 0
        }
      })

      // Convert the weeks object to the expected array format
      periodSales = Object.entries(weeks).map(([label, data]) => ({
        month: label,
        sales: data.sales,
        credit: data.credit,
        cash: data.cash
      }))
    }

    // Format numbers to have at most 2 decimal places
    periodSales = periodSales.map(period => ({
      month: period.month,
      sales: parseFloat(period.sales.toFixed(2)),
      credit: parseFloat(period.credit.toFixed(2)),
      cash: parseFloat(period.cash.toFixed(2))
    }))

    // Prepare response
    const response = {
      totalSales: parseFloat(totalSales.toFixed(2)),
      creditSales: parseFloat(creditSales.toFixed(2)),
      cashSales: parseFloat(cashSales.toFixed(2)),
      customerCount: totalCustomers,
      averageSale: parseFloat(averageSale.toFixed(2)),
      monthlySales: periodSales,
      salesByCategory: salesByCategory
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching sales data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 