export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      credit_accounts: {
        Row: {
          id: string
          full_name: string
          address: string
          phone_number: string
          date_of_birth: string
          tax_id: string
          drivers_license: string
          payment_method: 'cash' | 'check' | 'debit' | 'credit'
          card_name: string | null
          card_number: string | null
          payment_frequency: 'weekly' | 'biweekly' | 'monthly'
          payment_amount: number
          items_financed: Json[]
          total_amount: number
          remaining_balance: number
          payments: Json[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          address: string
          phone_number: string
          date_of_birth: string
          tax_id?: string
          drivers_license?: string
          payment_method: 'cash' | 'check' | 'debit' | 'credit'
          card_name?: string | null
          card_number?: string | null
          payment_frequency: 'weekly' | 'biweekly' | 'monthly'
          payment_amount: number
          items_financed: Json[]
          total_amount: number
          remaining_balance: number
          payments?: Json[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          address?: string
          phone_number?: string
          date_of_birth?: string
          tax_id?: string
          drivers_license?: string
          payment_method?: 'cash' | 'check' | 'debit' | 'credit'
          card_name?: string | null
          card_number?: string | null
          payment_frequency?: 'weekly' | 'biweekly' | 'monthly'
          payment_amount?: number
          items_financed?: Json[]
          total_amount?: number
          remaining_balance?: number
          payments?: Json[]
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          customer_name: string
          customer_email: string | null
          customer_phone: string | null
          customer_address: string | null
          date: string
          due_date: string
          items: Json[]
          subtotal: number
          tax: number
          total: number
          status: 'pending' | 'paid' | 'overdue' | 'cancelled'
          notes: string | null
          paid_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          customer_name: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          date: string
          due_date: string
          items: Json[]
          subtotal: number
          tax: number
          total: number
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          notes?: string | null
          paid_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          date?: string
          due_date?: string
          items?: Json[]
          subtotal?: number
          tax?: number
          total?: number
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          notes?: string | null
          paid_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
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
      invoice_status: 'pending' | 'paid' | 'overdue' | 'cancelled'
    }
  }
} 