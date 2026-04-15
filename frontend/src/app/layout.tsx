import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FloatingChatButton } from '@/components/chat/floating-chat-button'
import { ChatNotificationToast } from '@/components/chat/chat-notification-toast'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HMSS - Hotel Management and Search System',
  description: 'Find and manage hostel room listings across Malaysia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[var(--background)]`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingChatButton />
        <ChatNotificationToast />
      </body>
    </html>
  )
}
