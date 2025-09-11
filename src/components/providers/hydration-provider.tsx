"use client"

import { ReactNode } from "react"

interface HydrationProviderProps {
  children: ReactNode
}

export function HydrationProvider({ children }: HydrationProviderProps) {
  return <>{children}</>
}