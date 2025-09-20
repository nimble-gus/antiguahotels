import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/components/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Antigua Hotels Tours',
  description: 'Experiencias únicas en Guatemala - Hoteles boutique, tours y aventuras en Antigua',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
