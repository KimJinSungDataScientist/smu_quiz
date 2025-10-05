import './globals.css'
import { Navbar } from '@/components/Navbar'
import { ReactNode } from 'react'

export const metadata = { title: 'Quiz Webapp', description: 'Admin & Student Quiz Platform' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <Navbar />
        <main className="max-w-5xl mx-auto p-4">{children}</main>
      </body>
    </html>
  )
}
