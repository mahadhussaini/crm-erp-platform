/**
 * Global error handler for client-side errors
 * Prevents console spam from browser extensions and other external sources
 */

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections (like the async response error)
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    
    // Filter out common browser extension errors
    if (
      error?.message?.includes('message channel closed') ||
      error?.message?.includes('listener indicated an asynchronous response') ||
      error?.message?.includes('Extension context invalidated') ||
      error?.message?.includes('Could not establish connection') ||
      error?.message?.includes('Receiving end does not exist')
    ) {
      // Suppress browser extension errors
      event.preventDefault()
      return
    }
    
    // Log other errors for debugging
    console.error('Unhandled promise rejection:', error)
  })

  // Handle general errors
  window.addEventListener('error', (event) => {
    const error = event.error
    
    // Filter out browser extension errors
    if (
      error?.message?.includes('Extension context invalidated') ||
      error?.message?.includes('Could not establish connection') ||
      error?.message?.includes('Receiving end does not exist') ||
      error?.message?.includes('message channel closed')
    ) {
      // Suppress browser extension errors
      event.preventDefault()
      return
    }
  })
}

export function suppressExtensionErrors() {
  // Additional function to suppress extension-related console errors
  if (typeof window !== 'undefined') {
    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      const message = args.join(' ')
      
      // Filter out extension-related errors
      if (
        message.includes('message channel closed') ||
        message.includes('listener indicated an asynchronous response') ||
        message.includes('Extension context invalidated') ||
        message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist')
      ) {
        return // Suppress these errors
      }
      
      // Log other errors normally
      originalConsoleError.apply(console, args)
    }
  }
}
