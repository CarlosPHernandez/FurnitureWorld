'use client'

import { useState, useEffect } from 'react'
import DeliveryLayout from '@/components/layout/DeliveryLayout'
import {
  BarChart3,
  MapPin,
  Package,
  Clock,
  ChevronRight,
  ChevronDown,
  Truck,
  Calendar,
  Users,
  AlertCircle,
  Plus,
  MoreVertical,
  Phone,
  Mail,
  X
} from 'lucide-react'
import Image from 'next/image'
import { getDrivers, addDriver, deleteDriver, updateDriverStatus, DriversError, type Driver } from '@/services/drivers'

interface ActiveDelivery {
  id: string;
  customer: string;
  items: string;
  status: string;
  driver: string;
  eta: string;
  address: string;
  avatar: string;
}

interface Order {
  id: string;
  customer: string;
  status: 'Delivered' | 'In Progress' | 'Pending';
  date: string;
  amount: number;
}

const metrics = [
  {
    title: "Today's Deliveries",
    value: '0',
    change: '+0',
    icon: Truck,
    color: '#2D6BFF'
  },
  {
    title: 'Available Drivers',
    value: '0',
    change: '+0',
    icon: Users,
    color: '#00C48C'
  },
  {
    title: 'Pending Orders',
    value: '0',
    change: '+0',
    icon: Package,
    color: '#FF9500'
  },
  {
    title: 'Delayed Deliveries',
    value: '0',
    change: '+0',
    icon: AlertCircle,
    color: '#FF3B30'
  }
]

const activeDeliveries: ActiveDelivery[] = []

const upcomingDeliveries = [
  { time: '09:00 AM', count: 0 },
  { time: '10:00 AM', count: 0 },
  { time: '11:00 AM', count: 0 },
  { time: '12:00 PM', count: 0 },
  { time: '01:00 PM', count: 0 },
  { time: '02:00 PM', count: 0 }
]

const recentOrders: Order[] = [
  {
    id: '#ORD-001',
    customer: 'John Smith',
    status: 'Delivered',
    date: '2024-03-20',
    amount: 1299.99
  },
  {
    id: '#ORD-002',
    customer: 'Sarah Johnson',
    status: 'In Progress',
    date: '2024-03-20',
    amount: 849.99
  },
  {
    id: '#ORD-003',
    customer: 'Michael Brown',
    status: 'Pending',
    date: '2024-03-20',
    amount: 2199.99
  }
];

export default function DeliveryDashboard() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setIsLoading(true);
      const data = await getDrivers();
      setDrivers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load drivers');
      console.error('Error loading drivers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!newDriver.name.trim()) {
      setFormError('Driver name is required');
      return false;
    }
    if (!newDriver.phone.trim()) {
      setFormError('Phone number is required');
      return false;
    }
    if (!newDriver.email.trim()) {
      setFormError('Email is required');
      return false;
    }
    return true;
  };

  const handleAddDriver = async () => {
    try {
      setFormError(null);
      if (!validateForm()) return;

      // Trim the input values
      const driverData = {
        name: newDriver.name.trim(),
        email: newDriver.email.trim().toLowerCase(),
        phone: newDriver.phone.trim(),
        status: 'Available' as any,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newDriver.name.trim()}`
      };

      console.log('Submitting driver data:', driverData); // Debug log

      const driver = await addDriver(driverData);
      console.log('Driver added successfully:', driver); // Debug log

      setDrivers([...drivers, driver]);
      setNewDriver({ name: '', phone: '', email: '' });
      setShowAddDriver(false);
    } catch (err) {
      console.error('Error in handleAddDriver:', err); // Debug log
      if (err instanceof DriversError) {
        setFormError(err.message);
      } else {
        setFormError('An unexpected error occurred while adding the driver. Please try again.');
        console.error('Error adding driver:', err);
      }
    }
  };

  const handleRemoveDriver = async (driverId: string) => {
    try {
      await deleteDriver(driverId);
      setDrivers(drivers.filter(driver => driver.id !== driverId));
    } catch (err) {
      if (err instanceof DriversError) {
        setError(err.message);
      } else {
        setError('Failed to remove driver');
        console.error('Error removing driver:', err);
      }
    }
  };

  return (
    <DeliveryLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white rounded-xl p-3 md:p-4 shadow-sm">
          <div className="flex items-center text-sm text-gray-500">
            <span className="hover:text-gray-700 transition-colors">Dashboard</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-[#2D6BFF] font-medium">Furniture Deliveries</span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <button className="flex items-center justify-center px-4 py-2 text-sm text-[#1A1A1A] bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Today</span>
            </button>
            <button className="flex items-center justify-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg transition-colors duration-200 shadow-sm shadow-[#2D6BFF]/25">
              <Package className="mr-2 h-4 w-4" />
              <span>New Order</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.title}
              className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}10` }}>
                  <metric.icon className="h-6 w-6" style={{ color: metric.color }} />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${metric.change.startsWith('+')
                  ? 'text-[#00C48C] bg-[#00C48C]/10'
                  : 'text-[#FF9500] bg-[#FF9500]/10'
                  }`}>
                  {metric.change}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm group-hover:text-gray-700 transition-colors">{metric.title}</h3>
              <p className="text-xl md:text-2xl font-bold mt-2 transition-colors" style={{ color: metric.color }}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2 sm:mb-0">
                Recent Orders
              </h2>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-1.5 text-sm bg-[#2D6BFF] text-white rounded-full shadow-sm shadow-[#2D6BFF]/25 hover:bg-[#2D6BFF]/90 transition-colors duration-200">
                  All Orders
                </button>
                <button className="px-4 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-full transition-colors duration-200">
                  Pending
                </button>
                <button className="px-4 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-full transition-colors duration-200">
                  In Progress
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                    <th className="pb-4 font-medium">Order ID</th>
                    <th className="pb-4 font-medium">Customer</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium">Date</th>
                    <th className="pb-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-medium text-[#2D6BFF]">{order.id}</td>
                      <td className="py-4">{order.customer}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${order.status === 'Delivered'
                          ? 'bg-[#00C48C]/10 text-[#00C48C]'
                          : order.status === 'In Progress'
                            ? 'bg-[#2D6BFF]/10 text-[#2D6BFF]'
                            : 'bg-[#FF9500]/10 text-[#FF9500]'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-gray-500">{order.date}</td>
                      <td className="py-4 text-right font-medium">${order.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-6">
              Today's Schedule
            </h2>
            <div className="space-y-3">
              {upcomingDeliveries.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 cursor-pointer group"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-[#2D6BFF]/10 group-hover:bg-[#2D6BFF]/20 transition-colors">
                      <Clock className="h-4 w-4 text-[#2D6BFF]" />
                    </div>
                    <span className="text-sm font-medium ml-3 text-gray-700 group-hover:text-[#2D6BFF] transition-colors">
                      {slot.time}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">
                      {slot.count} deliveries
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#2D6BFF] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drivers Management */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-1">
                Drivers Management
              </h2>
              <p className="text-sm text-gray-500">
                {isLoading ? 'Loading drivers...' : `${drivers.length} active drivers`}
              </p>
            </div>
            <button
              onClick={() => setShowAddDriver(true)}
              className="inline-flex items-center px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg transition-colors duration-200 shadow-sm shadow-[#2D6BFF]/25"
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Driver
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Add Driver Form */}
          {showAddDriver && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Add New Driver</h3>
                <button
                  onClick={() => {
                    setShowAddDriver(false);
                    setFormError(null);
                    setNewDriver({ name: '', phone: '', email: '' });
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="driverName" className="block text-xs font-medium text-gray-700 mb-1">
                    Driver Name
                  </label>
                  <input
                    id="driverName"
                    type="text"
                    placeholder="Enter full name"
                    value={newDriver.name}
                    onChange={(e) => {
                      setFormError(null);
                      setNewDriver({ ...newDriver, name: e.target.value });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="driverPhone" className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="driverPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={newDriver.phone}
                    onChange={(e) => {
                      setFormError(null);
                      setNewDriver({ ...newDriver, phone: e.target.value });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="driverEmail" className="block text-xs font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="driverEmail"
                    type="email"
                    placeholder="email@example.com"
                    value={newDriver.email}
                    onChange={(e) => {
                      setFormError(null);
                      setNewDriver({ ...newDriver, email: e.target.value });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6BFF] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddDriver(false);
                    setFormError(null);
                    setNewDriver({ name: '', phone: '', email: '' });
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDriver}
                  className="px-4 py-2 text-sm text-white bg-[#2D6BFF] hover:bg-[#2D6BFF]/90 rounded-lg transition-colors duration-200"
                >
                  Add Driver
                </button>
              </div>
            </div>
          )}

          {/* Drivers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="ml-3 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="mt-2 h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              drivers.map((driver) => (
                <div
                  key={driver.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        <Image
                          src={driver.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`}
                          alt={driver.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">{driver.name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${driver.status === 'Available'
                          ? 'bg-[#00C48C]/10 text-[#00C48C]'
                          : driver.status === 'On Delivery'
                            ? 'bg-[#2D6BFF]/10 text-[#2D6BFF]'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                          {driver.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDriver(driver.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-4 w-4 mr-2" />
                      {driver.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-2" />
                      {driver.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Package className="h-4 w-4 mr-2" />
                      {driver.deliveries_completed} deliveries completed
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DeliveryLayout>
  )
} 