import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export class CustomersError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CustomersError'
  }
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  notes?: string
  created_at: string
}

export interface CustomerInput {
  name: string
  email: string
  phone: string
  address: string
  notes?: string
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching customers:', error)
      throw new CustomersError(error.message)
    }

    return data || []
  } catch (err) {
    console.error('Error in getCustomers:', err)
    throw err instanceof CustomersError
      ? err
      : new CustomersError('Failed to fetch customers')
  }
}

export async function getCustomer(id: string): Promise<Customer> {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching customer:', error)
      throw new CustomersError(error.message)
    }

    if (!data) {
      throw new CustomersError('Customer not found')
    }

    return data
  } catch (err) {
    console.error('Error in getCustomer:', err)
    throw err instanceof CustomersError
      ? err
      : new CustomersError('Failed to fetch customer')
  }
}

// Note: The following functions should be used from API routes, not directly from server components
// They are kept here for completeness but should be called via API endpoints

export async function addCustomer(customer: CustomerInput): Promise<Customer> {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single()

    if (error) {
      console.error('Error adding customer:', error)
      throw new CustomersError(error.message)
    }

    if (!data) {
      throw new CustomersError('Failed to add customer')
    }

    return data
  } catch (err) {
    console.error('Error in addCustomer:', err)
    throw err instanceof CustomersError
      ? err
      : new CustomersError('Failed to add customer')
  }
}

export async function updateCustomer(id: string, customer: Partial<CustomerInput>): Promise<Customer> {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating customer:', error)
      throw new CustomersError(error.message)
    }

    if (!data) {
      throw new CustomersError('Customer not found')
    }

    return data
  } catch (err) {
    console.error('Error in updateCustomer:', err)
    throw err instanceof CustomersError
      ? err
      : new CustomersError('Failed to update customer')
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting customer:', error)
      throw new CustomersError(error.message)
    }
  } catch (err) {
    console.error('Error in deleteCustomer:', err)
    throw err instanceof CustomersError
      ? err
      : new CustomersError('Failed to delete customer')
  }
} 