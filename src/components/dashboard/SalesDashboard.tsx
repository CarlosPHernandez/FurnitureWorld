'use client'

import { useState, useEffect } from 'react'
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
  ArrowUp
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

export default function SalesDashboard() {
  const [salesData, setSalesData] = useState<SalesSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [recentCreditAccounts, setRecentCreditAccounts] = useState<CustomerCredit[]>([])
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [isLoadingCredit, setIsLoadingCredit] = useState(true)
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true)

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
        setSalesData(data)
      } catch (error) {
        console.error('Error fetching sales data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesData()
  }, [timeframe])

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
        const response = await fetch('/api/invoices')
        if (response.ok) {
          const data = await response.json()
          // Sort by creation date and take most recent 5
          const sortedInvoices = [...data].sort((a, b) =>
            new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
          ).slice(0, 5)
          setRecentInvoices(sortedInvoices)
        }
      } catch (error) {
        console.error('Error fetching recent invoices:', error)
      } finally {
        setIsLoadingInvoices(false)
      }
    }

    fetchRecentInvoices()
  }, [])

  // Placeholder data for initial render
  const placeholderData: SalesSummary = {
    totalSales: 125000,
    creditSales: 75000,
    cashSales: 50000,
    customerCount: 45,
    averageSale: 2777.78,
    monthlySales: [
      { month: 'Jan', sales: 12000, credit: 8000, cash: 4000 },
      { month: 'Feb', sales: 15000, credit: 9000, cash: 6000 },
      { month: 'Mar', sales: 18000, credit: 11000, cash: 7000 },
      { month: 'Apr', sales: 16000, credit: 10000, cash: 6000 },
      { month: 'May', sales: 14000, credit: 8500, cash: 5500 },
      { month: 'Jun', sales: 19000, credit: 12000, cash: 7000 },
    ],
    salesByCategory: [
      { name: 'Mattresses', value: 45000 },
      { name: 'Bedroom Sets', value: 30000 },
      { name: 'Living Room', value: 25000 },
      { name: 'Dining Room', value: 15000 },
      { name: 'Accessories', value: 10000 },
    ]
  }

  const data = salesData || placeholderData

  // Calculate credit vs cash percentage
  const creditPercentage = data.totalSales ? (data.creditSales / data.totalSales) * 100 : 0
  const cashPercentage = data.totalSales ? (data.cashSales / data.totalSales) * 100 : 0

  if (isLoading && !salesData) {
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
          <h2 className="text-2xl font-bold text-gray-800">Sales Dashboard</h2>
          <p className="text-gray-500 mt-1">Overview of all sales channels and performance</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <BadgeDollarSign className="h-6 w-6 text-[#2D6BFF]" />
            </div>
            <div className="flex items-center text-emerald-500 text-sm font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>8.2%</span>
            </div>
          </div>
          <h3 className="text-sm text-gray-500 font-medium">Total Sales</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.totalSales)}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-[#2D6BFF]" />
            </div>
            <div className="flex items-center text-emerald-500 text-sm font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>12.5%</span>
            </div>
          </div>
          <h3 className="text-sm text-gray-500 font-medium">Credit Sales</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.creditSales)}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-[#2D6BFF]" />
            </div>
            <div className="flex items-center text-emerald-500 text-sm font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>5.1%</span>
            </div>
          </div>
          <h3 className="text-sm text-gray-500 font-medium">Cash Sales</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data.cashSales)}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-[#2D6BFF]" />
            </div>
            <div className="flex items-center text-emerald-500 text-sm font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>3.7%</span>
            </div>
          </div>
          <h3 className="text-sm text-gray-500 font-medium">Customers</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.customerCount}</p>
        </div>
      </div>

      {/* Credit vs Cash Split */}
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
              <p className="text-sm text-gray-500">Average transaction: <span className="font-bold text-gray-800">{formatCurrency(data.averageSale)}</span></p>
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
            <h3 className="text-lg font-medium text-gray-800">Sales Trend</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.monthlySales}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${formatCurrency(Number(value))}`, 'Amount']} />
                <Legend />
                <Bar dataKey="credit" name="Credit Sales" fill="#2D6BFF" />
                <Bar dataKey="cash" name="Cash Sales" fill="#82ca9d" />
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
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.salesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${formatCurrency(Number(value))}`, 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Accounts and Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Credit Accounts */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-[#2D6BFF] mr-2" />
              <h3 className="text-lg font-medium text-gray-800">Recent Credit Accounts</h3>
            </div>
            <a href="/credit-management" className="text-sm text-[#2D6BFF] hover:underline flex items-center">
              View All <ArrowUpRight className="ml-1 h-3 w-3" />
            </a>
          </div>

          {isLoadingCredit ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D6BFF]"></div>
            </div>
          ) : recentCreditAccounts.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">No credit accounts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs uppercase text-gray-500 px-2 py-3 font-medium">Customer</th>
                    <th className="text-left text-xs uppercase text-gray-500 px-2 py-3 font-medium">Total</th>
                    <th className="text-left text-xs uppercase text-gray-500 px-2 py-3 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentCreditAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-2 py-3">
                        <p className="text-sm font-medium text-gray-900">{account.fullName}</p>
                      </td>
                      <td className="px-2 py-3">
                        <p className="text-sm text-gray-600">{formatCurrency(account.totalAmount)}</p>
                      </td>
                      <td className="px-2 py-3">
                        <p className="text-sm text-gray-600">{formatCurrency(account.remainingBalance)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-[#2D6BFF] mr-2" />
              <h3 className="text-lg font-medium text-gray-800">Recent Invoices</h3>
            </div>
            <a href="/invoices" className="text-sm text-[#2D6BFF] hover:underline flex items-center">
              View All <ArrowUpRight className="ml-1 h-3 w-3" />
            </a>
          </div>

          {isLoadingInvoices ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D6BFF]"></div>
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs uppercase text-gray-500 px-2 py-3 font-medium">Invoice #</th>
                    <th className="text-left text-xs uppercase text-gray-500 px-2 py-3 font-medium">Customer</th>
                    <th className="text-left text-xs uppercase text-gray-500 px-2 py-3 font-medium">Amount</th>
                    <th className="text-left text-xs uppercase text-gray-500 px-2 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-2 py-3">
                        <p className="text-sm font-medium text-[#2D6BFF]">{invoice.invoiceNumber}</p>
                      </td>
                      <td className="px-2 py-3">
                        <p className="text-sm text-gray-900">{invoice.customerName}</p>
                      </td>
                      <td className="px-2 py-3">
                        <p className="text-sm text-gray-600">{formatCurrency(invoice.total)}</p>
                      </td>
                      <td className="px-2 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                          }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 