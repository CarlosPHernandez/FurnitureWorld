import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex">
      {/* Left side - Auth form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Delivery Manager</h1>
            </Link>
          </div>

          {/* Auth content */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">{title}</h2>
              <p className="mt-2 text-gray-600">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0">
          <Image
            src="https://picsum.photos/seed/auth/1200/800"
            alt="Authentication background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#2D6BFF] mix-blend-multiply" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-white p-12">
          <div className="max-w-xl text-center">
            <h2 className="text-4xl font-bold mb-4">Welcome to Delivery Manager</h2>
            <p className="text-lg opacity-90">
              Streamline your delivery operations with our comprehensive management platform
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 