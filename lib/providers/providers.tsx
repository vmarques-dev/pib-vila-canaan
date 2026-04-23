'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/hooks/useAuth'
import ScrollToTop from '@/components/layout/scroll-to-top'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ScrollToTop />
      {children}
    </AuthProvider>
  )
}
