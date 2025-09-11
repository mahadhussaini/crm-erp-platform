"use client"

import { useEffect, useState } from "react"

/**
 * Hook that returns true only after the component has mounted on the client
 * This helps prevent hydration mismatches by ensuring client-only logic
 * only runs after hydration is complete
 */
export function useHydrated(): boolean {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    setHasHydrated(true)
  }, [])

  return hasHydrated
}

/**
 * Hook that provides a safe way to access window/document objects
 * Returns null during SSR and the actual object after hydration
 */
export function useWindow(): Window | null {
  const [windowObject, setWindowObject] = useState<Window | null>(null)

  useEffect(() => {
    setWindowObject(window)
  }, [])

  return windowObject
}

/**
 * Hook that provides a safe way to access document object
 * Returns null during SSR and the actual object after hydration
 */
export function useDocument(): Document | null {
  const [documentObject, setDocumentObject] = useState<Document | null>(null)

  useEffect(() => {
    setDocumentObject(document)
  }, [])

  return documentObject
}
