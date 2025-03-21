'use client'

import DeliveryLayout from '@/components/layout/DeliveryLayout'
import dynamic from 'next/dynamic'
import { LoadingScreen } from '@/components/ui/loading-spinner'

// Dynamically import the SalesDashboard component
const SalesDashboard = dynamic(
  () => import('@/components/dashboard/SalesDashboard'),
  {
    ssr: false,
    loading: () => <LoadingScreen text="Loading dashboard..." icon="sofa" />
  }
)

export default function Home() {
  return (
    <DeliveryLayout>
      <SalesDashboard />
    </DeliveryLayout>
  )
}
