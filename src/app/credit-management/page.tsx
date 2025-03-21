import { Suspense } from 'react'
import type { Metadata } from 'next'
import DeliveryLayout from '@/components/layout/DeliveryLayout'
import { creditService } from '@/services/credit'
import CreditManagementClient from './CreditManagementClient'
import { LoadingScreen } from '@/components/ui/loading-spinner'
import type { CustomerCredit } from '@/services/credit'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export const metadata: Metadata = {
  title: 'Credit Customers',
  description: 'Manage credit customer accounts and applications',
}

export default async function CreditManagementPage() {
  let creditAccounts: CustomerCredit[] = [];
  let error = null;

  try {
    creditAccounts = await creditService.getCreditAccounts();
  } catch (err) {
    console.error('Error fetching credit accounts:', err);
    error = err instanceof Error ? err.message : 'Failed to load credit accounts';
  }

  return (
    <DeliveryLayout>
      <Suspense fallback={
        <LoadingScreen
          text="Loading credit accounts..."
          icon="bed"
        />
      }>
        {error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Error Loading Credit Accounts</h2>
            <p className="text-red-600">{error}</p>
            <p className="mt-4 text-gray-700">Please try refreshing the page or contact support if the issue persists.</p>
          </div>
        ) : (
          <CreditManagementClient initialCreditAccounts={creditAccounts} />
        )}
      </Suspense>
    </DeliveryLayout>
  )
} 