import type { Database } from '@/types/database.types'
import { supabase } from '@/lib/supabase'

export type Driver = Database['public']['Tables']['drivers']['Row']
export type NewDriver = Database['public']['Tables']['drivers']['Insert']
export type UpdateDriver = Database['public']['Tables']['drivers']['Update']

export class DriversError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DriversError';
  }
}

// Debug log to check client initialization
console.log('Drivers service initialized with Supabase client:', !!supabase);

export const driversService = {
  async getDrivers() {
    try {
      console.log('Starting getDrivers request...');
      
      // Verify client is initialized
      if (!supabase) {
        throw new DriversError('Supabase client is not initialized');
      }

      // Log the request details
      console.log('Making Supabase request to drivers table');
      
      const response = await supabase
        .from('drivers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      // Log the full response for debugging
      console.log('Supabase response:', response);
      
      const { data, error, status, statusText } = response;
      
      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw new DriversError(`Failed to fetch drivers: ${error.message}`, error);
      }

      if (!data) {
        console.warn('No data returned from Supabase');
        return [];
      }

      console.log(`Successfully fetched ${data.length} drivers`);
      return data;
    } catch (err: any) {
      console.error('Detailed error in getDrivers:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        originalError: err.originalError
      });
      
      if (err instanceof DriversError) {
        throw err;
      }
      
      throw new DriversError('Failed to fetch drivers: Unexpected error occurred', err);
    }
  },

  async addDriver(driver: NewDriver) {
    try {
      // Validate email format
      if (!driver.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new DriversError('Invalid email format');
      }

      // Validate phone format (basic validation)
      if (!driver.phone.match(/^[\d\s()-]+$/)) {
        throw new DriversError('Invalid phone format');
      }

      console.log('Adding driver:', driver); // Debug log

      const { data, error } = await supabase
        .from('drivers')
        .insert({
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`,
          status: 'Available',
          deliveries_completed: 0,
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error adding driver:', error);
        if (error.code === '23505') {
          throw new DriversError('A driver with this email already exists');
        }
        throw new DriversError(`Failed to add driver: ${error.message}`, error);
      }

      if (!data) {
        throw new DriversError('No data returned after adding driver');
      }

      return data;
    } catch (error) {
      console.error('Error in addDriver:', error);
      if (error instanceof DriversError) throw error;
      throw new DriversError('Failed to add driver', error);
    }
  },

  async updateDriver(id: string, updates: UpdateDriver) {
    try {
      // Validate email if it's being updated
      if (updates.email && !updates.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new DriversError('Invalid email format');
      }

      // Validate phone if it's being updated
      if (updates.phone && !updates.phone.match(/^[\d\s()-]+$/)) {
        throw new DriversError('Invalid phone format');
      }

      const { data, error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Supabase error updating driver:', error);
        if (error.code === '23505') {
          throw new DriversError('A driver with this email already exists');
        }
        throw new DriversError(`Failed to update driver: ${error.message}`, error);
      }

      return data;
    } catch (error) {
      console.error('Error in updateDriver:', error);
      if (error instanceof DriversError) throw error;
      throw new DriversError('Failed to update driver', error);
    }
  },

  async deleteDriver(id: string) {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_active: false })
        .eq('id', id)
      
      if (error) {
        console.error('Supabase error deleting driver:', error);
        throw new DriversError(`Failed to delete driver: ${error.message}`, error);
      }
    } catch (error) {
      console.error('Error in deleteDriver:', error);
      if (error instanceof DriversError) throw error;
      throw new DriversError('Failed to delete driver', error);
    }
  },

  async updateDriverStatus(id: string, status: Driver['status']) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Supabase error updating driver status:', error);
        throw new DriversError(`Failed to update driver status: ${error.message}`, error);
      }
      return data;
    } catch (error) {
      console.error('Error in updateDriverStatus:', error);
      if (error instanceof DriversError) throw error;
      throw new DriversError('Failed to update driver status', error);
    }
  }
} 