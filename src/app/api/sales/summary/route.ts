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

    // Add logging to debug timeframe issues
    console.log(`Processing sales data request for timeframe: ${timeframe}`)

    // Create a Supabase client with service role for full access
    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    // Get current date
    const now = new Date()

    // Calculate start date based on timeframe
    let startDate: Date
    let periodLabels: string[] = []
    let groupByFormat: string
    let previousStartDate: Date // For comparison with previous period

    switch (timeframe) {
      case 'day':
        // Start of today
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
        // Previous day for comparison
        previousStartDate = new Date(startDate)
        previousStartDate.setDate(previousStartDate.getDate() - 1)

        // For day view, we'll use hourly data (9AM to 9PM business hours)
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
        // Previous week for comparison
        previousStartDate = new Date(startDate)
        previousStartDate.setDate(previousStartDate.getDate() - 7)

        groupByFormat = 'D'
        // Generate day of week labels (Sun, Mon, etc.)
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        periodLabels = weekdays
        break

      case 'year':
        // Start of current year
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0)
        // Previous year for comparison
        previousStartDate = new Date(startDate)
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 1)

        groupByFormat = 'MM'
        // Generate month labels (Jan, Feb, etc.)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        periodLabels = months
        break

      case 'month':
      default:
        // Start of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
        // Previous month for comparison
        previousStartDate = new Date(startDate)
        previousStartDate.setMonth(previousStartDate.getMonth() - 1)

        groupByFormat = 'DD'
        // Generate day labels (1-31)
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        periodLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`)
        break
    }

    // Log date ranges for debugging
    console.log(`Date range for ${timeframe}: ${startDate.toISOString()} to ${now.toISOString()}`)
    console.log(`Previous period: ${previousStartDate.toISOString()} to ${startDate.toISOString()}`)

    // Format dates for SQL query
    const formattedStartDate = startDate.toISOString()
    const formattedPreviousStartDate = previousStartDate.toISOString()

    // CURRENT PERIOD DATA
    // 1. Get total sales from invoices table for current period
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

    // 2. Get credit data from credit_accounts table for current period
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

    // PREVIOUS PERIOD DATA
    // 1. Get total sales from invoices table for previous period
    const { data: previousInvoiceData, error: previousInvoiceError } = await supabase
      .from('invoices')
      .select('id, total, date, status')
      .gte('date', formattedPreviousStartDate)
      .lt('date', formattedStartDate)
      .order('date', { ascending: true })

    if (previousInvoiceError) {
      console.error('Error fetching previous invoice data:', previousInvoiceError)
      return NextResponse.json(
        { error: 'Error fetching previous invoice data' },
        { status: 500 }
      )
    }

    // 2. Get credit data from credit_accounts table for previous period
    const { data: previousCreditData, error: previousCreditError } = await supabase
      .from('credit_accounts')
      .select('id, total_amount, created_at, items_financed')
      .gte('created_at', formattedPreviousStartDate)
      .lt('created_at', formattedStartDate)
      .order('created_at', { ascending: true })

    if (previousCreditError) {
      console.error('Error fetching previous credit data:', previousCreditError)
      return NextResponse.json(
        { error: 'Error fetching previous credit data' },
        { status: 500 }
      )
    }

    // CURRENT PERIOD CALCULATIONS
    // Calculate totals for current period
    const totalInvoiceSales = invoiceData.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
    const totalCreditSales = creditData.reduce((sum, account) => sum + (account.total_amount || 0), 0)

    const totalSales = totalInvoiceSales + totalCreditSales
    const cashSales = totalInvoiceSales // Assuming all invoice sales are cash sales
    const creditSales = totalCreditSales

    // Calculate customer count for current period
    const invoiceCustomers = invoiceData.length
    const creditCustomers = creditData.length
    const totalCustomers = invoiceCustomers + creditCustomers

    // Calculate average sale for current period
    const averageSale = totalSales / (totalCustomers || 1) // Avoid division by zero

    // PREVIOUS PERIOD CALCULATIONS
    // Calculate totals for previous period
    const previousTotalInvoiceSales = previousInvoiceData.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
    const previousTotalCreditSales = previousCreditData.reduce((sum, account) => sum + (account.total_amount || 0), 0)

    const previousTotalSales = previousTotalInvoiceSales + previousTotalCreditSales
    const previousCashSales = previousTotalInvoiceSales
    const previousCreditSales = previousTotalCreditSales

    // Calculate customer count for previous period
    const previousInvoiceCustomers = previousInvoiceData.length
    const previousCreditCustomers = previousCreditData.length
    const previousTotalCustomers = previousInvoiceCustomers + previousCreditCustomers

    // Calculate average sale for previous period
    const previousAverageSale = previousTotalSales / (previousTotalCustomers || 1)

    // GROWTH CALCULATIONS
    // Calculate growth percentages (handling division by zero)
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0; // 100% growth if previous was zero and current is positive
      }
      return ((current - previous) / previous) * 100;
    };

    const totalSalesGrowth = calculateGrowth(totalSales, previousTotalSales)
    const creditSalesGrowth = calculateGrowth(creditSales, previousCreditSales)
    const cashSalesGrowth = calculateGrowth(cashSales, previousCashSales)
    const customerCountGrowth = calculateGrowth(totalCustomers, previousTotalCustomers)
    const averageSaleGrowth = calculateGrowth(averageSale, previousAverageSale)

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
    else if (timeframe === 'month') {
      // Group by day of month (not week) for month view
      periodSales = periodLabels.map((dayLabel) => ({
        month: dayLabel,
        sales: 0,
        credit: 0,
        cash: 0
      }))

      creditData.forEach(account => {
        const day = new Date(account.created_at).getDate()
        // Day is 1-based, so subtract 1 for zero-based array index
        const index = day - 1
        if (index >= 0 && index < periodSales.length) {
          periodSales[index].sales += account.total_amount || 0
          periodSales[index].credit += account.total_amount || 0
        }
      })

      invoiceData.forEach(invoice => {
        const day = new Date(invoice.date).getDate()
        // Day is 1-based, so subtract 1 for zero-based array index
        const index = day - 1
        if (index >= 0 && index < periodSales.length) {
          periodSales[index].sales += invoice.total || 0
          periodSales[index].cash += invoice.total || 0
        }
      })
    }
    else {
      // Default fallback - should rarely be reached
      console.log('Using default period structure - unexpected timeframe:', timeframe)

      // Create a simple structure with just one period
      periodSales = [{
        month: 'All Data',
        sales: totalSales,
        credit: creditSales,
        cash: cashSales
      }]
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
      salesByCategory: salesByCategory,
      // Growth metrics
      growth: {
        totalSales: parseFloat(totalSalesGrowth.toFixed(1)),
        creditSales: parseFloat(creditSalesGrowth.toFixed(1)),
        cashSales: parseFloat(cashSalesGrowth.toFixed(1)),
        customerCount: parseFloat(customerCountGrowth.toFixed(1)),
        averageSale: parseFloat(averageSaleGrowth.toFixed(1))
      },
      // Add previous period data for reference
      previousPeriod: {
        totalSales: parseFloat(previousTotalSales.toFixed(2)),
        creditSales: parseFloat(previousCreditSales.toFixed(2)),
        cashSales: parseFloat(previousCashSales.toFixed(2)),
        customerCount: previousTotalCustomers,
        averageSale: parseFloat(previousAverageSale.toFixed(2))
      }
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