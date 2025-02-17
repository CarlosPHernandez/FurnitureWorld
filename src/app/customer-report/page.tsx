'use client'

import DeliveryLayout from '@/components/layout/DeliveryLayout'
import { 
  ChevronRight,
  ChevronDown,
  Star,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Filter,
  Download,
} from 'lucide-react'

const satisfactionMetrics = [
  {
    title: 'Overall Rating',
    value: '4.8',
    total: '5.0',
    icon: Star,
    color: '#FFB800'
  },
  {
    title: 'Customer Feedback',
    value: '1,245',
    label: 'responses',
    icon: MessageCircle,
    color: '#2D6BFF'
  },
  {
    title: 'Issues Reported',
    value: '23',
    label: 'this month',
    icon: AlertCircle,
    color: '#FF9500'
  },
  {
    title: 'Resolution Rate',
    value: '98.4%',
    label: 'resolved',
    icon: CheckCircle2,
    color: '#00C48C'
  }
]

const feedbackList = [
  {
    id: 1,
    customer: 'John Smith',
    rating: 5,
    comment: 'Excellent service, very prompt delivery!',
    date: '2 hours ago',
    orderId: 'ORD-1234'
  },
  {
    id: 2,
    customer: 'Sarah Wilson',
    rating: 4,
    comment: 'Good service but packaging could be better',
    date: '5 hours ago',
    orderId: 'ORD-1235'
  },
  {
    id: 3,
    customer: 'Mike Johnson',
    rating: 5,
    comment: 'Very professional courier, will order again',
    date: '1 day ago',
    orderId: 'ORD-1236'
  }
]

export default function CustomerReport() {
  return (
    <DeliveryLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span>Reports</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-[#2D6BFF]">Customer Feedback</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-100 rounded-lg">
              <Filter className="mr-2 h-4 w-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg">
              <Download className="mr-2 h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {satisfactionMetrics.map((metric) => (
            <div
              key={metric.title}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center mb-4">
                <metric.icon className="h-6 w-6 mr-2" style={{ color: metric.color }} />
                <h3 className="text-gray-500 text-sm">{metric.title}</h3>
              </div>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold" style={{ color: metric.color }}>
                  {metric.value}
                </p>
                {metric.total && (
                  <span className="text-gray-400 ml-1">/ {metric.total}</span>
                )}
                {metric.label && (
                  <span className="text-gray-400 text-sm ml-2">{metric.label}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feedback Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">
                Customer Satisfaction Trend
              </h2>
              <button className="flex items-center text-sm text-gray-500 hover:text-[#2D6BFF]">
                Last 30 Days
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Chart Component Placeholder
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-6">
              Recent Feedback
            </h2>
            <div className="space-y-4">
              {feedbackList.map((feedback) => (
                <div key={feedback.id} className="p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{feedback.customer}</span>
                    <span className="text-xs text-gray-500">{feedback.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{feedback.comment}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < feedback.rating ? 'fill-[#FFB800] text-[#FFB800]' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{feedback.orderId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DeliveryLayout>
  )
} 