'use client'

import { createContext, useState, useContext, useEffect, ReactNode } from 'react'

// Define the business information type
export interface BusinessInfo {
  companyName: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  website: string
  logoUrl: string
}

// Default business information
const defaultBusinessInfo: BusinessInfo = {
  companyName: 'Family Mattress and Furniture',
  address: '924 E Webb Ave',
  city: 'Burlington',
  state: 'NC',
  zipCode: '27217',
  phone: '(336) 524-6378',
  email: 'info@familymattress.com',
  website: 'www.familymattress.com',
  logoUrl: '/Logo-matters-1.webp'
}

// Create context
interface BusinessContextType {
  businessInfo: BusinessInfo
  updateBusinessInfo: (info: BusinessInfo) => void
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

// Provider component
export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(defaultBusinessInfo)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on initial render
  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem('businessInfo')
      if (savedInfo) {
        setBusinessInfo(JSON.parse(savedInfo))
      }
    } catch (error) {
      console.error('Failed to load business info from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Update function that also saves to localStorage
  const updateBusinessInfo = (info: BusinessInfo) => {
    setBusinessInfo(info)
    localStorage.setItem('businessInfo', JSON.stringify(info))
  }

  // Only render children once we've loaded data from localStorage
  if (!isLoaded) {
    return null
  }

  return (
    <BusinessContext.Provider value={{ businessInfo, updateBusinessInfo }}>
      {children}
    </BusinessContext.Provider>
  )
}

// Custom hook for using the business context
export function useBusinessInfo() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error('useBusinessInfo must be used within a BusinessProvider')
  }
  return context
} 