'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type FurnitureIcon = 'bed' | 'sofa' | 'chair' | 'table' | 'lamp'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  icon?: FurnitureIcon
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  text = 'Loading...',
  icon = 'sofa',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  const renderIcon = () => {
    switch (icon) {
      case 'bed':
        return (
          <svg
            className={cn("animate-pulse", sizeClasses[size])}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 7V11C3 12.1046 3.89543 13 5 13H19C20.1046 13 21 12.1046 21 11V7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 19V13H3V19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7H3V5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case 'chair':
        return (
          <svg
            className={cn("animate-pulse", sizeClasses[size])}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 12H18V19H6V12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 5V12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 5V12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 19L4 22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 19L20 22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case 'table':
        return (
          <svg
            className={cn("animate-pulse", sizeClasses[size])}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 9H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 9L6 20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 9L18 20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 4L16 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 4L12 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case 'lamp':
        return (
          <svg
            className={cn("animate-pulse", sizeClasses[size])}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 21H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 21V14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 14H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 10L18 10C18 6.68629 15.3137 4 12 4C8.68629 4 6 6.68629 6 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case 'sofa':
      default:
        return (
          <svg
            className={cn("animate-pulse", sizeClasses[size])}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 11V17H21V11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 11V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 17L3 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 17L21 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 11H22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
    }
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative">
        {renderIcon()}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-1/2 w-1/2 animate-spin rounded-full border-b-2 border-current"></div>
        </div>
      </div>
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
    </div>
  )
}

export function LoadingScreen({
  text = 'Loading your data...',
  icon = 'sofa',
  className,
}: Omit<LoadingSpinnerProps, 'size'>) {
  return (
    <div className={cn("flex h-full min-h-[200px] w-full flex-col items-center justify-center p-8", className)}>
      <LoadingSpinner size="lg" text={text} icon={icon} />
    </div>
  )
}

export function LoadingCard({
  text = 'Loading...',
  icon = 'sofa',
  className,
}: Omit<LoadingSpinnerProps, 'size'>) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-6 shadow-sm", className)}>
      <LoadingSpinner size="md" text={text} icon={icon} />
    </div>
  )
}

export function LoadingRow({
  text = 'Loading...',
  icon = 'sofa',
  className,
}: Omit<LoadingSpinnerProps, 'size'>) {
  return (
    <div className={cn("flex items-center justify-center py-4", className)}>
      <LoadingSpinner size="sm" text={text} icon={icon} />
    </div>
  )
} 