export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      drivers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone: string
          status: 'Available' | 'On Delivery' | 'Off Duty'
          deliveries_completed: number
          avatar_url: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone: string
          status?: 'Available' | 'On Delivery' | 'Off Duty'
          deliveries_completed?: number
          avatar_url?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string
          status?: 'Available' | 'On Delivery' | 'Off Duty'
          deliveries_completed?: number
          avatar_url?: string | null
          is_active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      driver_status: 'Available' | 'On Delivery' | 'Off Duty'
    }
  }
} 