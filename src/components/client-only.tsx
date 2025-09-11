"use client"

import { useEffect, useState } from "react"

// Component wrapper that only renders on the client side
// Useful for components that use browser-only APIs or cause hydration mismatches
export function ClientOnly({ children, fallback = null }: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Wrapper for components that might have hydration issues
export function HydrationSafe({ children, className }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      suppressHydrationWarning
      className={className}
    >
      {children}
    </div>
  )
}

// Component that handles dynamic content safely
export function SafeDynamicContent({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return <>{children}</>
}