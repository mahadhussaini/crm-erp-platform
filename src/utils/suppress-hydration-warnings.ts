// Utility to suppress hydration warnings in development
export function suppressHydrationWarnings() {
  if (typeof window !== 'undefined') {
    // Store original console methods
    const originalWarn = console.warn
    const originalError = console.error

    // Suppress specific hydration warnings
    console.warn = (...args) => {
      const message = args.join(' ')
      if (
        message.includes('Expected server HTML to contain a matching') ||
        message.includes('hydration') ||
        message.includes('data-new-gr-c-s-check-loaded') ||
        message.includes('data-gr-ext-installed') ||
        message.includes('Grammarly') ||
        message.includes('browser extension')
      ) {
        return // Suppress these warnings
      }
      originalWarn.apply(console, args)
    }

    console.error = (...args) => {
      const message = args.join(' ')
      if (
        message.includes('hydration') ||
        message.includes('data-new-gr-c-s-check-loaded') ||
        message.includes('data-gr-ext-installed') ||
        message.includes('Grammarly') ||
        message.includes('browser extension')
      ) {
        return // Suppress these errors in development
      }
      originalError.apply(console, args)
    }
  }
}
