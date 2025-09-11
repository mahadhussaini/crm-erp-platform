"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Building,
  Target,
  Activity,
  Package,
  ShoppingCart,
  FileText,
  UserCheck,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

interface SidebarProps {
  className?: string
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    group: "main"
  },
  {
    name: "CRM",
    group: "crm",
    items: [
      { name: "Contacts", href: "/crm/contacts", icon: Users },
      { name: "Companies", href: "/crm/companies", icon: Building },
      { name: "Leads", href: "/crm/leads", icon: Target },
      { name: "Opportunities", href: "/crm/opportunities", icon: Activity },
    ]
  },
  {
    name: "ERP",
    group: "erp",
    items: [
      { name: "Products", href: "/erp/products", icon: Package },
      { name: "Orders", href: "/erp/orders", icon: ShoppingCart },
      { name: "Invoices", href: "/erp/invoices", icon: FileText },
      { name: "Projects", href: "/erp/projects", icon: FolderOpen },
      { name: "Attendance", href: "/erp/attendance", icon: UserCheck },
    ]
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    group: "main"
  }
]

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2">
            <img
              src="/logo.svg"
              alt="CRM/ERP Platform"
              className="h-8 w-auto"
            />
          </div>
        ) : (
          <img
            src="/logo.svg"
            alt="CRM/ERP Platform"
            className="h-6 w-auto mx-auto"
          />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {navigation.map((item) => {
            if (item.items) {
              return (
                <div key={item.group} className="space-y-1">
                  {!isCollapsed && (
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {item.name}
                    </div>
                  )}
                  {item.items.map((subItem) => {
                    const isActive = pathname === subItem.href
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <subItem.icon
                          className={cn(
                            "flex-shrink-0 h-5 w-5",
                            isActive ? "text-blue-500" : "text-gray-400",
                            isCollapsed ? "mr-0" : "mr-3"
                          )}
                        />
                        {!isCollapsed && subItem.name}
                      </Link>
                    )
                  })}
                </div>
              )
            }

            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href!}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "flex-shrink-0 h-5 w-5",
                    isActive ? "text-blue-500" : "text-gray-400",
                    isCollapsed ? "mr-0" : "mr-3"
                  )}
                />
                {!isCollapsed && item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
