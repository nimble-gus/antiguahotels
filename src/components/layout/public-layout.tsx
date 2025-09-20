import { ReactNode } from 'react'
import PublicHeader from './public-header'
import PublicFooter from './public-footer'

interface PublicLayoutProps {
  children: ReactNode
  className?: string
}

export default function PublicLayout({ children, className = '' }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <PublicHeader />
      
      {/* Main Content */}
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      
      {/* Footer */}
      <PublicFooter />
    </div>
  )
}
