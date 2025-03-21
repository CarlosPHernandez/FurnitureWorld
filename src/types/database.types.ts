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
      inventory_items: {
        Row: {
          id: string
          sku: string
          name: string
          category: string
          brand: string
          quantity: number
          min_quantity: number
          price: number
          cost: number
          image_url: string
          length: number | null
          width: number | null
          height: number | null
          dimension_unit: 'cm' | 'in'
          weight: number | null
          weight_unit: 'kg' | 'lb'
          materials: any[]
          finish: string | null
          color: string | null
          assembly_required: boolean
          assembly_time: number | null
          warranty_duration: number | null
          warranty_coverage: string | null
          supplier_id: string | null
          supplier_name: string | null
          supplier_lead_time: number | null
          supplier_minimum_order: number | null
          supplier_price_breaks: any[]
          supplier_rating: number | null
          warehouse: string
          aisle: string | null
          shelf: string | null
          status: 'active' | 'discontinued' | 'seasonal'
          season: 'spring' | 'summer' | 'fall' | 'winter' | null
          tags: any[]
          notes: string | null
          last_inspection: string | null
          inspector: string | null
          quality_status: 'passed' | 'failed' | 'pending'
          quality_issues: any[]
          customization_available: boolean
          customization_options: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          name: string
          category: string
          brand: string
          quantity?: number
          min_quantity?: number
          price: number
          cost: number
          image_url?: string
          length?: number | null
          width?: number | null
          height?: number | null
          dimension_unit?: 'cm' | 'in'
          weight?: number | null
          weight_unit?: 'kg' | 'lb'
          materials?: any[]
          finish?: string | null
          color?: string | null
          assembly_required?: boolean
          assembly_time?: number | null
          warranty_duration?: number | null
          warranty_coverage?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          supplier_lead_time?: number | null
          supplier_minimum_order?: number | null
          supplier_price_breaks?: any[]
          supplier_rating?: number | null
          warehouse?: string
          aisle?: string | null
          shelf?: string | null
          status?: 'active' | 'discontinued' | 'seasonal'
          season?: 'spring' | 'summer' | 'fall' | 'winter' | null
          tags?: any[]
          notes?: string | null
          last_inspection?: string | null
          inspector?: string | null
          quality_status?: 'passed' | 'failed' | 'pending'
          quality_issues?: any[]
          customization_available?: boolean
          customization_options?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          category?: string
          brand?: string
          quantity?: number
          min_quantity?: number
          price?: number
          cost?: number
          image_url?: string
          length?: number | null
          width?: number | null
          height?: number | null
          dimension_unit?: 'cm' | 'in'
          weight?: number | null
          weight_unit?: 'kg' | 'lb'
          materials?: any[]
          finish?: string | null
          color?: string | null
          assembly_required?: boolean
          assembly_time?: number | null
          warranty_duration?: number | null
          warranty_coverage?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          supplier_lead_time?: number | null
          supplier_minimum_order?: number | null
          supplier_price_breaks?: any[]
          supplier_rating?: number | null
          warehouse?: string
          aisle?: string | null
          shelf?: string | null
          status?: 'active' | 'discontinued' | 'seasonal'
          season?: 'spring' | 'summer' | 'fall' | 'winter' | null
          tags?: any[]
          notes?: string | null
          last_inspection?: string | null
          inspector?: string | null
          quality_status?: 'passed' | 'failed' | 'pending'
          quality_issues?: any[]
          customization_available?: boolean
          customization_options?: any[]
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
      driver_status: 'Available' | 'On Delivery' | 'Off Duty'
      item_status: 'active' | 'discontinued' | 'seasonal'
      quality_status: 'passed' | 'failed' | 'pending'
      weight_unit: 'kg' | 'lb'
      dimension_unit: 'cm' | 'in'
      season: 'spring' | 'summer' | 'fall' | 'winter'
      invoice_status: 'pending' | 'paid' | 'overdue' | 'cancelled'
    }
  }
} 