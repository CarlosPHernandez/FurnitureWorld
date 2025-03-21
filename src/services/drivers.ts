'use client'

import type { Database } from '@/types/database.types'
import { createClient } from '@/lib/supabase'

export interface Driver {
  id: string
  name: string
  email: string
  phone: string
  status: string  // Changed from 'active' | 'inactive' to string to accommodate 'Available', 'On Delivery', etc.
  created_at: string
  avatar_url?: string
  deliveries_completed?: number
  is_active?: boolean
}

export class DriversError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DriversError'
  }
}

export async function getDrivers(): Promise<Driver[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new DriversError(`Failed to fetch drivers: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error in getDrivers:', error)
    throw error instanceof DriversError
      ? error
      : new DriversError('Failed to fetch drivers')
  }
}

export async function addDriver(driver: Omit<Driver, 'id' | 'created_at'>): Promise<Driver> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('drivers')
      .insert([driver])
      .select()
      .single()

    if (error) {
      throw new DriversError(`Failed to add driver: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in addDriver:', error)
    throw error instanceof DriversError
      ? error
      : new DriversError('Failed to add driver')
  }
}

export async function deleteDriver(id: string): Promise<void> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id)

    if (error) {
      throw new DriversError(`Failed to delete driver: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in deleteDriver:', error)
    throw error instanceof DriversError
      ? error
      : new DriversError('Failed to delete driver')
  }
}

export async function updateDriverStatus(id: string, status: 'active' | 'inactive'): Promise<Driver> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('drivers')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new DriversError(`Failed to update driver status: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in updateDriverStatus:', error)
    throw error instanceof DriversError
      ? error
      : new DriversError('Failed to update driver status')
  }
} 