"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ClientBodyProps {
  children: ReactNode
  className?: string
}

export function ClientBody({ children, className }: ClientBodyProps) {
  return (
    <body className={cn("bg-background text-foreground", className)}>
      {children}
    </body>
  )
}