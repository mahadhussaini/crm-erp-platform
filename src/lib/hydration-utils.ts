/**
 * Hydration utilities to help prevent and handle hydration mismatches
 */

import { useEffect, useState } from 'react'

/**
 * Hook to detect if we're in a hydration state
 */
export function useHydrated() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

/**
 * Hook to safely get window object without SSR issues
 */
export function useWindow() {
  const [windowObj, setWindowObj] = useState<Window | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowObj(window)
    }
  }, [])

  return windowObj
}

/**
 * Hook to safely get navigator object without SSR issues
 */
export function useNavigator() {
  const [navigatorObj, setNavigatorObj] = useState<Navigator | null>(null)

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setNavigatorObj(navigator)
    }
  }, [])

  return navigatorObj
}

/**
 * Hook to get user agent string safely
 */
export function useUserAgent() {
  const navigator = useNavigator()
  return navigator?.userAgent || ''
}

/**
 * Hook to detect if running in browser extension environment
 */
export function useBrowserExtension() {
  const [hasExtension, setHasExtension] = useState(false)

  useEffect(() => {
    // Check for common browser extension attributes
    const extensionAttributes = [
      'data-new-gr-c-s-check-loaded',
      'data-gr-ext-installed',
      'data-grammarly-shadow-root',
      'data-lastpass-root',
      'data-honey-extension'
    ]

    const checkForExtensions = () => {
      const body = document.body
      if (body) {
        const hasAnyExtension = extensionAttributes.some(attr =>
          body.hasAttribute(attr) || document.querySelector(`[${attr}]`) !== null
        )
        setHasExtension(hasAnyExtension)
      }
    }

    checkForExtensions()

    // Check again after a short delay to catch dynamically added attributes
    const timeoutId = setTimeout(checkForExtensions, 1000)

    return () => clearTimeout(timeoutId)
  }, [])

  return hasExtension
}

/**
 * Hook to get consistent timestamp that works in SSR
 */
export function useConsistentTime() {
  const [time, setTime] = useState(() => {
    // Return a consistent value during SSR
    if (typeof window === 'undefined') {
      return 0
    }
    return Date.now()
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTime(Date.now())
    }
  }, [])

  return time
}

/**
 * Hook to get screen dimensions safely
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState(() => ({
    width: 0,
    height: 0
  }))

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateScreenSize()

    const handleResize = () => {
      updateScreenSize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return screenSize
}

/**
 * Utility to create a stable key for lists that prevents hydration mismatches
 */
export function createStableKey(item: Record<string, unknown> | string | number, index: number, fallbackKey = 'id') {
  if (typeof item === 'object' && item !== null) {
    return (item as Record<string, unknown>)[fallbackKey] || (item as Record<string, unknown>).key || `item-${index}`
  }
  return `item-${index}`
}

/**
 * Utility to safely parse JSON that might fail during hydration
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString)
  } catch {
    return fallback
  }
}

/**
 * Utility to safely stringify JSON
 */
export function safeJsonStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj)
  } catch {
    return '{}'
  }
}

/**
 * Utility to check if we're in a server environment
 */
export const isServer = typeof window === 'undefined'

/**
 * Utility to check if we're in a client environment
 */
export const isClient = typeof window !== 'undefined'

/**
 * Safe localStorage wrapper that works in SSR
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (isServer) return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },

  setItem: (key: string, value: string): void => {
    if (isServer) return
    try {
      localStorage.setItem(key, value)
    } catch {
      // Silently fail
    }
  },

  removeItem: (key: string): void => {
    if (isServer) return
    try {
      localStorage.removeItem(key)
    } catch {
      // Silently fail
    }
  }
}

/**
 * Safe sessionStorage wrapper that works in SSR
 */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (isServer) return null
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },

  setItem: (key: string, value: string): void => {
    if (isServer) return
    try {
      sessionStorage.setItem(key, value)
    } catch {
      // Silently fail
    }
  },

  removeItem: (key: string): void => {
    if (isServer) return
    try {
      sessionStorage.removeItem(key)
    } catch {
      // Silently fail
    }
  }
}
