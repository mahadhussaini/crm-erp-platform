"use client"

import { useEffect } from "react"

// Component to fix hydration mismatches caused by browser extensions
export function HydrationFix() {
  useEffect(() => {
    // Remove browser extension attributes that cause hydration mismatches
    const body = document.body
    const attributesToRemove = [
      'data-new-gr-c-s-check-loaded',
      'data-gr-ext-installed',
      'data-rh',
      'data-react-helmet',
      'data-styled-components'
    ]

    attributesToRemove.forEach(attr => {
      if (body.hasAttribute(attr)) {
        body.removeAttribute(attr)
      }
    })

    // Clean up any script tags that might have been injected
    const scripts = document.querySelectorAll('script[data-extension], script[data-gr-ext]')
    scripts.forEach(script => script.remove())

    // Clean up any style tags from extensions
    const styles = document.querySelectorAll('style[data-extension], style[data-gr-ext]')
    styles.forEach(style => style.remove())
  }, [])

  return null
}