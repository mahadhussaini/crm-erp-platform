"use client"

import { useEffect } from "react"
import { suppressExtensionErrors } from "@/lib/error-handler"

export function ErrorHandler() {
  useEffect(() => {
    // Initialize error suppression for browser extensions
    suppressExtensionErrors()
    
    // Additional error handling setup
    const handleError = (event: ErrorEvent) => {
      // Filter out extension-related errors
      if (
        event.message?.includes('Extension context invalidated') ||
        event.message?.includes('Could not establish connection') ||
        event.message?.includes('Receiving end does not exist') ||
        event.message?.includes('message channel closed')
      ) {
        event.preventDefault()
        return
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      
      // Filter out common browser extension errors
      if (
        error?.message?.includes('message channel closed') ||
        error?.message?.includes('listener indicated an asynchronous response') ||
        error?.message?.includes('Extension context invalidated') ||
        error?.message?.includes('Could not establish connection') ||
        error?.message?.includes('Receiving end does not exist')
      ) {
        event.preventDefault()
        return
      }
    }

    // Add event listeners
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null // This component doesn't render anything
}
