'use client'

import DeliveryLayout from '@/components/layout/DeliveryLayout'
import { 
  ChevronRight,
  Calendar,
  Filter,
  Download,
  BarChart3,
  LineChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

const statisticsCards = [
  {
    title: 'Total Deliveries',
    value: '12,456',
    change: '+15.3%',
    trend: 'up',
    period: 'vs last month'
  },
  {
    title: 'Average Time',
    value: '32.5 min',
    change: '-8.4%',
    trend: 'down',
    period: 'vs last month'
  },
  {
    title: 'Success Rate',
    value: '98.7%',
    change: '+2.1%',
    trend: 'up',
    period: 'vs last month'
  },
  {
    title: 'Customer Rating',
    value: '4.8/5.0',
    change: '+0.3',
    trend: 'up',
    period: 'vs last month'
  }
]

const deliveryTrends = [
  { date: 'Mon', value: 150 },
  { date: 'Tue', value: 230 },
  { date: 'Wed', value: 224 },
  { date: 'Thu', value: 218 },
  { date: 'Fri', value: 335 },
  { date: 'Sat', value: 247 },
  { date: 'Sun', value: 186 }
]

export default function DeliveryData() {
  return (
    <DeliveryLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span>Analytics</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-[#2D6BFF]">Delivery Statistics</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Last 7 Days</span>
            </button>
            <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
              <Filter className="mr-2 h-4 w-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg">
              <Download className="mr-2 h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statisticsCards.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm">{stat.title}</h3>
                <span className={`flex items-center text-sm font-medium ${
                  stat.trend === 'up' ? 'text-[#00C48C]' : 'text-[#FF9500]'
                }`}>
                  {stat.change}
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="ml-1 h-4 w-4" />
                  )}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</p>
              <span className="text-xs text-gray-400">{stat.period}</span>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delivery Trends */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  Delivery Trends
                </h2>
                <p className="text-sm text-gray-500">Daily delivery volume</p>
              </div>
              <LineChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Line Chart Component Placeholder
            </div>
          </div>

          {/* Delivery Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  Delivery Distribution
                </h2>
                <p className="text-sm text-gray-500">By time of day</p>
              </div>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Bar Chart Component Placeholder
            </div>
          </div>

          {/* Delivery Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  Delivery Status
                </h2>
                <p className="text-sm text-gray-500">Current status distribution</p>
              </div>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Pie Chart Component Placeholder
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  Performance Metrics
                </h2>
                <p className="text-sm text-gray-500">Key performance indicators</p>
              </div>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Bar Chart Component Placeholder
            </div>
          </div>
        </div>
      </div>
    </DeliveryLayout>
  )
} 