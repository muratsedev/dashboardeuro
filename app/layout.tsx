import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './responsive.css'

// Force dynamic rendering for all dashboard routes
export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dashboard App',
  description: 'NextJS Dashboard with RTL support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  )
}
