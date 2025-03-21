import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleMapsProvider } from '@/contexts/GoogleMapsContext'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Family Mattress",
  description: "Mattress and furniture delivery management system",
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#F8F8F8]`} suppressHydrationWarning>
        <GoogleMapsProvider>
          {children}
        </GoogleMapsProvider>
      </body>
    </html>
  );
}
