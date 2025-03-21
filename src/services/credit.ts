import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export interface CustomerCredit {
  id: string;
  fullName: string;
  address: string;
  phoneNumber: string;
  dateOfBirth: string;
  taxId: string;
  driversLicense: string;
  paymentMethod: 'cash' | 'check' | 'debit' | 'credit';
  cardName?: string;
  cardNumber?: string;
  paymentFrequency: 'weekly' | 'biweekly' | 'monthly';
  paymentAmount: number;
  itemsFinanced: Array<{
    name: string;
    price: number;
  }>;
  totalAmount: number;
  remainingBalance: number;
  payments: Array<{
    date: string;
    amount: number;
    method: string;
    reference: string;
  }>;
}

export class CreditError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CreditError'
  }
}

export const creditService = {
  async createCreditAccount(customerData: Omit<CustomerCredit, 'id' | 'remainingBalance' | 'payments'>) {
    try {
      // Create a new Supabase client for server component
      const supabase = createServerComponentClient<Database>({
        cookies
      })

      const totalAmount = customerData.itemsFinanced.reduce((total, item) => total + item.price, 0)

      // Prepare data for insertion
      const { data, error } = await supabase
        .from('credit_accounts')
        .insert({
          full_name: customerData.fullName,
          address: customerData.address,
          phone_number: customerData.phoneNumber,
          date_of_birth: customerData.dateOfBirth,
          tax_id: customerData.taxId,
          drivers_license: customerData.driversLicense,
          payment_method: customerData.paymentMethod,
          card_name: customerData.cardName,
          card_number: customerData.cardNumber,
          payment_frequency: customerData.paymentFrequency,
          payment_amount: customerData.paymentAmount,
          items_financed: customerData.itemsFinanced,
          total_amount: totalAmount,
          remaining_balance: totalAmount,
          payments: []
        })
        .select()
        .single()

      // Handle potential errors
      if (error) {
        console.error('Supabase error:', error)
        throw new CreditError(error.message)
      }

      // Ensure data is not null
      if (!data) {
        throw new CreditError('Failed to create credit account')
      }

      // Return the created account
      return {
        id: data.id,
        fullName: data.full_name || '',
        address: data.address || '',
        phoneNumber: data.phone_number || '',
        dateOfBirth: data.date_of_birth || '',
        taxId: data.tax_id || '',
        driversLicense: data.drivers_license || '',
        paymentMethod: data.payment_method as any,
        cardName: data.card_name || undefined,
        cardNumber: data.card_number || undefined,
        paymentFrequency: data.payment_frequency as any,
        paymentAmount: data.payment_amount || 0,
        itemsFinanced: Array.isArray(data.items_financed) ? data.items_financed : [],
        totalAmount: data.total_amount || 0,
        remainingBalance: data.remaining_balance || 0,
        payments: Array.isArray(data.payments) ? data.payments : [],
      }
    } catch (err) {
      if (err instanceof CreditError) throw err
      throw new CreditError(err instanceof Error ? err.message : 'Unknown error creating credit account')
    }
  },

  async recordPayment(
    accountId: string,
    payment: {
      amount: number;
      method: string;
      reference: string;
      date: string;
    }
  ) {
    try {
      // Create a new Supabase client for server component
      const supabase = createServerComponentClient<Database>({
        cookies
      })

      // Get current account data
      const { data: account, error: fetchError } = await supabase
        .from('credit_accounts')
        .select('*')
        .eq('id', accountId)
        .single()

      // Handle potential fetch errors
      if (fetchError) {
        console.error('Supabase fetch error:', fetchError)
        throw new CreditError(fetchError.message)
      }

      // Ensure account exists
      if (!account) {
        throw new CreditError(`Credit account with ID ${accountId} not found`)
      }

      // Update payments and remaining balance
      const currentPayments = Array.isArray(account.payments) ? account.payments : []
      const newPayments = [...currentPayments, payment]
      const newRemainingBalance = Math.max(0, (account.remaining_balance || 0) - payment.amount)

      // Update the account
      const { data, error } = await supabase
        .from('credit_accounts')
        .update({
          payments: newPayments,
          remaining_balance: newRemainingBalance
        })
        .eq('id', accountId)
        .select()
        .single()

      // Handle potential update errors
      if (error) {
        console.error('Supabase update error:', error)
        throw new CreditError(error.message)
      }

      // Ensure data is not null
      if (!data) {
        throw new CreditError('Failed to update credit account')
      }

      // Return the updated account
      return {
        id: data.id,
        fullName: data.full_name || '',
        address: data.address || '',
        phoneNumber: data.phone_number || '',
        dateOfBirth: data.date_of_birth || '',
        taxId: data.tax_id || '',
        driversLicense: data.drivers_license || '',
        paymentMethod: data.payment_method as any,
        cardName: data.card_name || undefined,
        cardNumber: data.card_number || undefined,
        paymentFrequency: data.payment_frequency as any,
        paymentAmount: data.payment_amount || 0,
        itemsFinanced: Array.isArray(data.items_financed) ? data.items_financed : [],
        totalAmount: data.total_amount || 0,
        remainingBalance: data.remaining_balance || 0,
        payments: Array.isArray(data.payments) ? data.payments : [],
      }
    } catch (err) {
      if (err instanceof CreditError) throw err
      throw new CreditError(err instanceof Error ? err.message : 'Unknown error recording payment')
    }
  },

  async getCreditAccounts() {
    try {
      // Create a new Supabase client for server component
      const supabase = createServerComponentClient<Database>({
        cookies
      })

      // Fetch credit accounts
      const { data, error } = await supabase
        .from('credit_accounts')
        .select('*')
        .order('created_at', { ascending: false })

      // Handle potential errors
      if (error) {
        console.error('Supabase error:', error)
        throw new CreditError(error.message)
      }

      // Ensure data is not null before mapping
      if (!data) {
        return []
      }

      // Transform the data to ensure it matches the CustomerCredit interface
      return data.map(account => ({
        id: account.id,
        fullName: account.full_name || '',
        address: account.address || '',
        phoneNumber: account.phone_number || '',
        dateOfBirth: account.date_of_birth || '',
        taxId: account.tax_id || '',
        driversLicense: account.drivers_license || '',
        paymentMethod: account.payment_method || 'cash',
        cardName: account.card_name || '',
        cardNumber: account.card_number || '',
        paymentFrequency: account.payment_frequency || 'monthly',
        paymentAmount: Number(account.payment_amount || 0),
        itemsFinanced: Array.isArray(account.items_financed) ? account.items_financed : [],
        totalAmount: Number(account.total_amount || 0),
        remainingBalance: Number(account.remaining_balance || 0),
        payments: Array.isArray(account.payments) ? account.payments : [],
      }));
    } catch (err) {
      if (err instanceof CreditError) throw err
      throw new CreditError('Failed to fetch credit accounts')
    }
  },

  async getCreditAccount(id: string) {
    try {
      // Create a new Supabase client for server component
      const supabase = createServerComponentClient<Database>({
        cookies
      })

      // Fetch the specific credit account
      const { data, error } = await supabase
        .from('credit_accounts')
        .select('*')
        .eq('id', id)
        .single()

      // Handle potential errors
      if (error) {
        console.error('Supabase error:', error)
        throw new CreditError(error.message)
      }

      // Ensure data is not null
      if (!data) {
        throw new CreditError(`Credit account with ID ${id} not found`)
      }

      // Transform the data to ensure it matches the CustomerCredit interface
      return {
        id: data.id,
        fullName: data.full_name || '',
        address: data.address || '',
        phoneNumber: data.phone_number || '',
        dateOfBirth: data.date_of_birth || '',
        taxId: data.tax_id || '',
        driversLicense: data.drivers_license || '',
        paymentMethod: data.payment_method || 'cash',
        cardName: data.card_name || '',
        cardNumber: data.card_number || '',
        paymentFrequency: data.payment_frequency || 'monthly',
        paymentAmount: Number(data.payment_amount || 0),
        itemsFinanced: Array.isArray(data.items_financed) ? data.items_financed : [],
        totalAmount: Number(data.total_amount || 0),
        remainingBalance: Number(data.remaining_balance || 0),
        payments: Array.isArray(data.payments) ? data.payments : [],
      };
    } catch (err) {
      if (err instanceof CreditError) throw err
      throw new CreditError('Failed to fetch credit account')
    }
  }
} 