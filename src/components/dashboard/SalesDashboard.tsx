'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import {
  DollarSign,
  CreditCard,
  Users,
  TrendingUp,
  BarChart3,
  PieChartIcon,
  Wallet,
  BadgeDollarSign,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  ChevronsUp,
  PercentIcon,
  FileText,
  Percent,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  Minus,
  Info,
  Calendar
} from 'lucide-react'
import { LoadingScreen } from '@/components/ui/loading-spinner'
import { CustomerCredit } from '@/services/credit'
import { Invoice } from '@/types/invoice'

interface SalesSummary {
  totalSales: number
  creditSales: number
  cashSales: number
  customerCount: number
  averageSale: number
  monthlySales: {
    month: string
    sales: number
    credit: number
    cash: number
  }[]
  salesByCategory: {
    name: string
    value: number
  }[]
  growth?: {
    totalSales: number
    creditSales: number
    cashSales: number
    customerCount: number
    averageSale: number
  }
  previousPeriod?: {
    totalSales: number
    creditSales: number
    cashSales: number
    customerCount: number
    averageSale: number
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

// Helper function to render growth indicators
const GrowthIndicator = ({ value }: { value: number }) => {
  if (value > 0) {
    return (
      <span className="text-emerald-500 flex items-center gap-1 text-sm font-medium">
        <ArrowUp className="h-4 w-4" />
        {formatPercentage(value)}
      </span>
    );
  } else if (value < 0) {
    return (
      <span className="text-rose-500 flex items-center gap-1 text-sm font-medium">
        <ArrowDown className="h-4 w-4" />
        {formatPercentage(Math.abs(value))}
      </span>
    );
  } else {
    return (
      <span className="text-gray-500 flex items-center gap-1 text-sm font-medium">
        <Minus className="h-4 w-4" />
        0%
      </span>
    );
  }
};

const PreviousPeriodValue = ({ value, label }: { value: number, label: string }) => {
  return (
    <div className="mt-1 text-sm text-gray-500">
      <span className="font-medium">{label}:</span> {formatCurrency(value)}
    </div>
  );
};

// Helper function to capitalize the first letter of a string
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Helper function to determine if a transaction is from today
const isToday = (date: string) => {
  if (!date) return false;
  const today = new Date()
  const transactionDate = new Date(date)
  return (
    transactionDate.getDate() === today.getDate() &&
    transactionDate.getMonth() === today.getMonth() &&
    transactionDate.getFullYear() === today.getFullYear()
  )
}

// Helper function to get the current time range for daily view
const getCurrentTimeRange = () => {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  return {
    startTime: startOfDay.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
    currentTime: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  }
}

export default function SalesDashboard() {
  const [salesData, setSalesData] = useState<SalesSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [recentCreditAccounts, setRecentCreditAccounts] = useState<CustomerCredit[]>([])
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [isLoadingCredit, setIsLoadingCredit] = useState(true)
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // For daily view, get the current time range
  const timeRange = getCurrentTimeRange()

  // Fetch sales summary data
  useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/sales/summary?timeframe=${timeframe}`)
        if (!response.ok) {
          throw new Error('Failed to fetch sales data')
        }
        const data = await response.json()

        // Debug: Log the API response
        console.log(`Sales data for ${timeframe}:`, data)

        // Check if the response contains actual sales data (not just empty/zero values)
        const hasRealData = data && data.totalSales > 0
        if (hasRealData) {
          setSalesData(data)
        } else {
          // Instead of setting salesData to null, use empty data structure
          // This will allow charts to render with zero values
          const emptyData = {
            totalSales: 0,
            creditSales: 0,
            cashSales: 0,
            customerCount: 0,
            averageSale: 0,
            monthlySales: generateEmptyPeriodData(timeframe),
            salesByCategory: [
              { name: 'No Sales Yet', value: 0 }
            ],
            growth: {
              totalSales: 0,
              creditSales: 0,
              cashSales: 0,
              customerCount: 0,
              averageSale: 0
            },
            previousPeriod: {
              totalSales: 0,
              creditSales: 0,
              cashSales: 0,
              customerCount: 0,
              averageSale: 0
            }
          }
          setSalesData(emptyData)
          console.log(`No sales data found for ${timeframe} period, using empty data structure`)
        }

        setLastUpdated(new Date())
      } catch (error) {
        console.error('Error fetching sales data:', error)
        // On error, still set empty data structure to avoid showing an error state
        const emptyData = {
          totalSales: 0,
          creditSales: 0,
          cashSales: 0,
          customerCount: 0,
          averageSale: 0,
          monthlySales: generateEmptyPeriodData(timeframe),
          salesByCategory: [
            { name: 'No Sales Yet', value: 0 }
          ],
          growth: {
            totalSales: 0,
            creditSales: 0,
            cashSales: 0,
            customerCount: 0,
            averageSale: 0
          },
          previousPeriod: {
            totalSales: 0,
            creditSales: 0,
            cashSales: 0,
            customerCount: 0,
            averageSale: 0
          }
        }
        setSalesData(emptyData)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }

    fetchSalesData()
  }, [timeframe])

  // Helper function to generate empty period data based on timeframe
  const generateEmptyPeriodData = (timeframe: 'day' | 'week' | 'month' | 'year') => {
    switch (timeframe) {
      case 'day':
        // For day view, generate 12 hour periods (9AM to 9PM)
        return Array.from({ length: 12 }, (_, i) => {
          const hour = i + 9  // Start from 9AM
          return {
            month: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`,
            sales: 0,
            credit: 0,
            cash: 0
          }
        });
      case 'week':
        // For week view, generate 7 days (Sun-Sat)
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return weekdays.map(day => ({
          month: day,
          sales: 0,
          credit: 0,
          cash: 0
        }));
      case 'year':
        // For year view, generate 12 months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.map(month => ({
          month,
          sales: 0,
          credit: 0,
          cash: 0
        }));
      case 'month':
      default:
        // For month view, generate ~30 days
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => ({
          month: `${i + 1}`,
          sales: 0,
          credit: 0,
          cash: 0
        }));
    }
  };

  // Set up auto-refresh for day view (every 5 minutes)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timeframe === 'day' && autoRefresh) {
      interval = setInterval(() => {
        handleRefreshData();
      }, 5 * 60 * 1000); // 5 minutes
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeframe, autoRefresh]);

  // Fetch recent credit accounts
  useEffect(() => {
    const fetchRecentCreditAccounts = async () => {
      setIsLoadingCredit(true)
      try {
        const response = await fetch('/api/credit/recent-accounts')
        if (!response.ok) {
          // If the endpoint doesn't exist, we'll fetch all accounts
          const allAccountsResponse = await fetch('/api/credit/accounts')
          if (allAccountsResponse.ok) {
            const allAccounts = await allAccountsResponse.json()
            // Sort by creation date and take most recent 5
            const sortedAccounts = [...allAccounts].sort((a, b) =>
              new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
            ).slice(0, 5)
            setRecentCreditAccounts(sortedAccounts)
          }
        } else {
          const data = await response.json()
          setRecentCreditAccounts(data)
        }
      } catch (error) {
        console.error('Error fetching recent credit accounts:', error)
      } finally {
        setIsLoadingCredit(false)
      }
    }

    fetchRecentCreditAccounts()
  }, [])

  // Fetch recent invoices
  useEffect(() => {
    const fetchRecentInvoices = async () => {
      setIsLoadingInvoices(true)
      try {
        // Use the new recent invoices endpoint for better performance
        const response = await fetch('/api/invoices/recent')
        if (!response.ok) {
          // Fallback to the main invoices endpoint if the recent one doesn't exist
          const allInvoicesResponse = await fetch('/api/invoices')
          if (allInvoicesResponse.ok) {
            const data = await allInvoicesResponse.json()
            // Sort by creation date and take most recent 5
            const sortedInvoices = [...data].sort((a, b) =>
              new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
            ).slice(0, 5)
            setRecentInvoices(sortedInvoices)
          }
        } else {
          const data = await response.json()
          setRecentInvoices(data)
        }
      } catch (error) {
        console.error('Error fetching recent invoices:', error)
      } finally {
        setIsLoadingInvoices(false)
      }
    }

    fetchRecentInvoices()
  }, [])

  // Refresh all data
  const handleRefreshData = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    // Fetch sales data with the current timeframe
    try {
      const response = await fetch(`/api/sales/summary?timeframe=${timeframe}&refresh=true`)
      if (response.ok) {
        const data = await response.json()
        setSalesData(data)
      }

      // Fetch credit accounts using the optimized endpoint
      const creditResponse = await fetch('/api/credit/recent-accounts?refresh=true')
      if (creditResponse.ok) {
        const creditData = await creditResponse.json()
        setRecentCreditAccounts(creditData)
      }

      // Fetch invoices using the optimized endpoint
      const invoicesResponse = await fetch('/api/invoices/recent?refresh=true')
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        setRecentInvoices(invoicesData)
      } else {
        // Fallback to the main endpoint
        const allInvoicesResponse = await fetch('/api/invoices?refresh=true')
        if (allInvoicesResponse.ok) {
          const allInvoicesData = await allInvoicesResponse.json()
          const sortedInvoices = [...allInvoicesData].sort((a, b) =>
            new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
          ).slice(0, 5)
          setRecentInvoices(sortedInvoices)
        }
      }

      // Update the last updated timestamp
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Format the last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return lastUpdated.toLocaleString();
    }
  };

  // Format current date for display
  const formatCurrentDate = () => {
    const today = new Date()
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Remove the old reference to placeholderData here and use the actual salesData
  // which now always has a value (either real data or zeroes)
  const data = salesData || {
    totalSales: 0,
    creditSales: 0,
    cashSales: 0,
    customerCount: 0,
    averageSale: 0,
    monthlySales: [],
    salesByCategory: [],
    growth: {
      totalSales: 0,
      creditSales: 0,
      cashSales: 0,
      customerCount: 0,
      averageSale: 0
    },
    previousPeriod: {
      totalSales: 0,
      creditSales: 0,
      cashSales: 0,
      customerCount: 0,
      averageSale: 0
    }
  }

  // Calculate credit vs cash percentage
  const creditPercentage = data.totalSales ? (data.creditSales / data.totalSales) * 100 : 0
  const cashPercentage = data.totalSales ? (data.cashSales / data.totalSales) * 100 : 0

  // Get the previous period label based on the selected timeframe
  const getPreviousPeriodLabel = () => {
    switch (timeframe) {
      case 'day':
        return 'Previous Day'
      case 'week':
        return 'Previous Week'
      case 'month':
        return 'Previous Month'
      case 'year':
        return 'Previous Year'
      default:
        return 'Previous Period'
    }
  }

  // Filter recent credit accounts to show today's accounts first in daily view
  const processedCreditAccounts = useMemo(() => {
    if (timeframe !== 'day' || !recentCreditAccounts.length) {
      return recentCreditAccounts;
    }

    // Sort accounts to show today's first, then others
    return [...recentCreditAccounts].sort((a, b) => {
      // First try to use created_at property (from API)
      // Then fall back to other date properties if they exist
      const aDate = (a as any).created_at || a.dateOfBirth;
      const bDate = (b as any).created_at || b.dateOfBirth;

      const aIsToday = isToday(aDate);
      const bIsToday = isToday(bDate);

      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;

      // If both are today or both are not today, sort by date (newest first)
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  }, [recentCreditAccounts, timeframe]);

  // Filter recent invoices to show today's invoices first in daily view
  const processedInvoices = useMemo(() => {
    if (timeframe !== 'day' || !recentInvoices.length) {
      return recentInvoices;
    }

    // Sort invoices to show today's first, then others
    return [...recentInvoices].sort((a, b) => {
      const aIsToday = isToday(a.date || a.createdAt || '');
      const bIsToday = isToday(b.date || b.createdAt || '');

      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;

      // If both are today or both are not today, sort by date (newest first)
      const aDate = new Date(a.date || a.createdAt || '');
      const bDate = new Date(b.date || b.createdAt || '');
      return bDate.getTime() - aDate.getTime();
    });
  }, [recentInvoices, timeframe]);

  // Count today's transactions
  const todaysTransactionCount = useMemo(() => {
    if (timeframe !== 'day') return null;

    const todaysCreditAccounts = recentCreditAccounts.filter(account => {
      const accountDate = (account as any).created_at || account.dateOfBirth;
      return isToday(accountDate);
    }).length;

    const todaysInvoices = recentInvoices.filter(invoice =>
      isToday(invoice.date || invoice.createdAt || '')
    ).length;

    return {
      creditAccounts: todaysCreditAccounts,
      invoices: todaysInvoices,
      total: todaysCreditAccounts + todaysInvoices
    };
  }, [recentCreditAccounts, recentInvoices, timeframe]);

  // Update the loading check to just check isLoading since we'll always have salesData
  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingScreen
          text="Loading sales dashboard..."
          icon="table"
        />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-800">Sales Dashboard</h2>
            {timeframe === 'day' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium flex items-center">
                <Calendar className="h-3 w-3 mr-1" /> Today
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">
            {timeframe === 'day' ? (
              <>
                Today's sales: <span className="font-medium">{formatCurrentDate()}</span>
                {salesData && salesData.totalSales > 0 && (
                  <span className="ml-2">
                    <span className="text-gray-700 font-semibold">{salesData.customerCount}</span> customers,
                    <span className="text-gray-700 font-semibold ml-1">{formatCurrency(salesData.totalSales)}</span> total
                  </span>
                )}
              </>
            ) : (
              <>Overview of all sales channels and performance</>
            )}
            <span className="italic text-xs ml-1">({capitalizeFirstLetter(timeframe)})</span>
          </p>
          {timeframe === 'day' && (
            <p className="text-xs text-gray-500 mt-0.5">
              Showing transactions from {timeRange.startTime} to {timeRange.currentTime}
            </p>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>
              Last updated: {formatLastUpdated()}
              <button
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className="ml-2 text-blue-600 hover:text-blue-800 inline-flex items-center"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              {timeframe === 'day' && (
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`ml-3 text-xs px-2 py-0.5 rounded ${autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  {autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
                </button>
              )}
              {timeframe === 'day' && autoRefresh && (
                <span className="ml-2 text-xs text-green-700">
                  (Refreshes every 5 minutes)
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm">
          <button
            onClick={() => setTimeframe('day')}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${timeframe === 'day'
              ? 'bg-[#2D6BFF] text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Day
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${timeframe === 'week'
              ? 'bg-[#2D6BFF] text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${timeframe === 'month'
              ? 'bg-[#2D6BFF] text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeframe('year')}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${timeframe === 'year'
              ? 'bg-[#2D6BFF] text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Sales Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-2">
            <div className="flex items-center justify-between gap-4">
              <h3 className="tracking-tight text-sm font-medium">Total Sales</h3>
              {data?.growth?.totalSales !== undefined && (
                <GrowthIndicator value={data.growth.totalSales} />
              )}
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(data?.totalSales || 0)}
            </div>
            {data?.previousPeriod?.totalSales !== undefined && (
              <PreviousPeriodValue
                value={data.previousPeriod.totalSales}
                label={getPreviousPeriodLabel()}
              />
            )}
          </div>
        </div>

        {/* Credit Sales Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-2">
            <div className="flex items-center justify-between gap-4">
              <h3 className="tracking-tight text-sm font-medium">Credit Sales</h3>
              {data?.growth?.creditSales !== undefined && (
                <GrowthIndicator value={data.growth.creditSales} />
              )}
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(data?.creditSales || 0)}
            </div>
            {data?.previousPeriod?.creditSales !== undefined && (
              <PreviousPeriodValue
                value={data.previousPeriod.creditSales}
                label={getPreviousPeriodLabel()}
              />
            )}
          </div>
        </div>

        {/* Cash Sales Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-2">
            <div className="flex items-center justify-between gap-4">
              <h3 className="tracking-tight text-sm font-medium">Cash Sales</h3>
              {data?.growth?.cashSales !== undefined && (
                <GrowthIndicator value={data.growth.cashSales} />
              )}
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(data?.cashSales || 0)}
            </div>
            {data?.previousPeriod?.cashSales !== undefined && (
              <PreviousPeriodValue
                value={data.previousPeriod.cashSales}
                label={getPreviousPeriodLabel()}
              />
            )}
          </div>
        </div>

        {/* Customer Count Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-2">
            <div className="flex items-center justify-between gap-4">
              <h3 className="tracking-tight text-sm font-medium">Customer Count</h3>
              {data?.growth?.customerCount !== undefined && (
                <GrowthIndicator value={data.growth.customerCount} />
              )}
            </div>
            <div className="text-2xl font-bold">
              {data?.customerCount || 0}
            </div>
            {data?.previousPeriod?.customerCount !== undefined && (
              <div className="mt-1 text-sm text-gray-500">
                <span className="font-medium">{getPreviousPeriodLabel()}:</span> {data.previousPeriod.customerCount}
              </div>
            )}
          </div>
        </div>

        {/* Average Sale Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-2">
            <div className="flex items-center justify-between gap-4">
              <h3 className="tracking-tight text-sm font-medium">Average Sale</h3>
              {data?.growth?.averageSale !== undefined && (
                <GrowthIndicator value={data.growth.averageSale} />
              )}
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(data?.averageSale || 0)}
            </div>
            {data?.previousPeriod?.averageSale !== undefined && (
              <PreviousPeriodValue
                value={data.previousPeriod.averageSale}
                label={getPreviousPeriodLabel()}
              />
            )}
          </div>
        </div>
      </div>

      {/* Credit vs Cash Split - always show this section */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center mb-4">
          <Percent className="h-5 w-5 text-[#2D6BFF] mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Sales Distribution</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Credit Sales</span>
                <span className="text-sm font-medium text-gray-700">{formatPercentage(creditPercentage)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-[#2D6BFF] h-2.5 rounded-full" style={{ width: `${creditPercentage}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Cash Sales</span>
                <span className="text-sm font-medium text-gray-700">{formatPercentage(cashPercentage)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${cashPercentage}%` }}></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#2D6BFF] rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Credit Financing</span>
              </div>
              <span className="text-sm font-bold">{formatCurrency(data.creditSales)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Direct Payment</span>
              </div>
              <span className="text-sm font-bold">{formatCurrency(data.cashSales)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t mt-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Total</span>
              </div>
              <span className="text-sm font-bold">{formatCurrency(data.totalSales)}</span>
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-500">
                Average transaction:
                <span className="font-bold text-gray-800 ml-1">{formatCurrency(data.averageSale)}</span>
                {data.growth && (
                  <span className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded ${data.growth.averageSale > 0
                    ? 'text-emerald-700 bg-emerald-50'
                    : data.growth.averageSale < 0
                      ? 'text-red-700 bg-red-50'
                      : 'text-gray-700 bg-gray-50'
                    }`}>
                    {data.growth.averageSale > 0 ? '↑' : data.growth.averageSale < 0 ? '↓' : ''}
                    {formatPercentage(Math.abs(data.growth.averageSale))}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-[#2D6BFF] mr-2" />
            <h3 className="text-lg font-medium text-gray-800">
              {timeframe === 'day' ? 'Hourly' :
                timeframe === 'week' ? 'Daily' :
                  timeframe === 'month' ? 'Daily' :
                    'Monthly'} Sales
            </h3>
            {timeframe === 'day' && (
              <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                Live updates
              </span>
            )}
          </div>
          <div className={`${timeframe === 'day' ? 'h-96' : 'h-80'} w-full`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.monthlySales || generateEmptyPeriodData(timeframe)}
                margin={{
                  top: 30,
                  right: 30,
                  left: 20,
                  bottom: timeframe === 'day' ? 60 : 40,
                }}
                barSize={timeframe === 'day' ? 15 : 20}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  label={{
                    value: `${timeframe === 'day' ? 'Hour' :
                      timeframe === 'week' ? 'Day' :
                        timeframe === 'month' ? 'Day of Month' : 'Month'}`,
                    position: 'insideBottom',
                    offset: timeframe === 'day' ? -40 : -30,
                    style: { textAnchor: 'middle', fontSize: 11 },
                  }}
                  height={timeframe === 'day' ? 60 : 50}
                  tickMargin={timeframe === 'day' ? 15 : 10}
                  tick={{ fontSize: 11 }}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis
                  label={{
                    value: 'Sales ($)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
                  }}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
                  labelFormatter={(label) => {
                    if (timeframe === 'day') return `Hour: ${label}`;
                    if (timeframe === 'week') return `Day: ${label}`;
                    if (timeframe === 'month') return `Day ${label}`;
                    return `Month: ${label}`;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                <Bar dataKey="credit" name="Credit Sales" fill="#2D6BFF" />
                <Bar dataKey="cash" name="Cash Sales" fill="#4ADE80" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <PieChartIcon className="h-5 w-5 text-[#2D6BFF] mr-2" />
            <h3 className="text-lg font-medium text-gray-800">Sales by Category</h3>
          </div>
          {salesData?.totalSales === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="rounded-full bg-gray-100 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <PieChartIcon className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-500">No sales data to display yet</p>
                <p className="text-sm text-gray-400 mt-1">Categories will appear here as sales are made</p>
              </div>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesData?.salesByCategory || [{ name: 'No Sales', value: 0 }]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(salesData?.salesByCategory || [{ name: 'No Sales', value: 0 }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${formatCurrency(Number(value))}`, 'Amount']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Accounts and Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Credit Accounts */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-[#2D6BFF] mr-2" />
              <h3 className="text-lg font-medium text-gray-800">
                Recent Credit Accounts
                {timeframe === 'day' && todaysTransactionCount && (
                  <span className="ml-2 text-sm font-normal text-blue-600">
                    {todaysTransactionCount.creditAccounts} today
                  </span>
                )}
              </h3>
            </div>
            <a href="/credit-management" className="text-sm text-[#2D6BFF] hover:underline flex items-center">
              View All <ArrowUpRight className="ml-1 h-3 w-3" />
            </a>
          </div>

          {isLoadingCredit ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2D6BFF]"></div>
            </div>
          ) : processedCreditAccounts.length > 0 ? (
            <div className="space-y-4">
              {processedCreditAccounts.map((account, index) => {
                // Access account date, handling both API format and interface format
                const accountDate = (account as any).created_at || account.dateOfBirth;
                return (
                  <div
                    key={account.id}
                    className={`p-3 border rounded-lg ${isToday(accountDate) && timeframe === 'day'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{account.fullName}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(account.totalAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(accountDate).toLocaleDateString()}
                          {isToday(accountDate) && timeframe === 'day' && (
                            <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Today
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(accountDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No credit accounts found
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-[#2D6BFF] mr-2" />
              <h3 className="text-lg font-medium text-gray-800">
                Recent Invoices
                {timeframe === 'day' && todaysTransactionCount && (
                  <span className="ml-2 text-sm font-normal text-blue-600">
                    {todaysTransactionCount.invoices} today
                  </span>
                )}
              </h3>
            </div>
            <a href="/invoices" className="text-sm text-[#2D6BFF] hover:underline flex items-center">
              View All <ArrowUpRight className="ml-1 h-3 w-3" />
            </a>
          </div>

          {isLoadingInvoices ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2D6BFF]"></div>
            </div>
          ) : processedInvoices.length > 0 ? (
            <div className="space-y-4">
              {processedInvoices.map((invoice) => {
                // Access date & customer info, handling both API format and interface format
                const invoiceDate = invoice.date || invoice.createdAt || '';
                const customerName = (invoice as any).customer_name || invoice.customerName || 'Customer';

                return (
                  <div
                    key={invoice.id}
                    className={`p-3 border rounded-lg ${isToday(invoiceDate) && timeframe === 'day'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {customerName}
                        </p>
                        <p className="text-sm text-gray-600">{formatCurrency(invoice.total)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(invoiceDate).toLocaleDateString()}
                          {isToday(invoiceDate) && timeframe === 'day' && (
                            <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Today
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(invoiceDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No invoices found
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 