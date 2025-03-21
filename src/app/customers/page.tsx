import { Suspense } from 'react'
import CustomerManagementPage from './CustomerManagementPage'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'
import DeliveryLayout from '@/components/layout/DeliveryLayout'
import { LoadingScreen } from '@/components/ui/loading-spinner'

export const metadata = {
  title: 'Customer Management | Family Mattress',
  description: 'Manage your customers',
}

export default async function Page() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customers:', error)
  }

  return (
    <DeliveryLayout>
      <Suspense fallback={
        <LoadingScreen
          text="Loading customer data..."
          icon="chair"
        />
      }>
        <CustomerManagementPage initialCustomers={customers || []} />
      </Suspense>
    </DeliveryLayout>
  )
} 