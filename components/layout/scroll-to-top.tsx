'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Resets the scroll position to the top of the page on every route change
 * and disables the browser's native scroll restoration so that it never
 * re-applies a stale scroll offset after a reload or navigation.
 */
export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
