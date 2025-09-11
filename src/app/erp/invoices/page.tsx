"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search,
  Plus,
  FileText,
  DollarSign,
  Download,
  Eye,
  Mail,
  CheckCircle,
  XCircle
} from "lucide-react"
import { formatCurrency, getInitials, formatDate } from "@/lib/utils"
import { InvoiceStatus } from "@prisma/client"

// Mock data - In real app, this would come from API
const mockInvoices = [
  {
    id: "INV-2024-001",
    invoiceNumber: "INV-2024-001",
    order: {
      id: "ORD-2024-001",
      orderNumber: "ORD-2024-001",
      customer: {
        name: "TechCorp Solutions",
        email: "billing@techcorp.com"
      }
    },
    status: "SENT" as InvoiceStatus,
    total: 1599.96,
    tax: 127.99,
    discount: 0,
    dueDate: new Date("2024-02-15"),
    paidDate: null,
    createdAt: new Date("2024-01-20"),
    user: {
      name: "John Doe",
      image: ""
    }
  },
  {
    id: "INV-2024-002",
    invoiceNumber: "INV-2024-002",
    order: {
      id: "ORD-2024-002",
      orderNumber: "ORD-2024-002",
      customer: {
        name: "Innovate Inc",
        email: "accounting@innovate.io"
      }
    },
    status: "PAID" as InvoiceStatus,
    total: 849.95,
    tax: 67.99,
    discount: 50,
    dueDate: new Date("2024-02-01"),
    paidDate: new Date("2024-01-28"),
    createdAt: new Date("2024-01-18"),
    user: {
      name: "Jane Smith",
      image: ""
    }
  },
  {
    id: "INV-2024-003",
    invoiceNumber: "INV-2024-003",
    order: {
      id: "ORD-2024-003",
      orderNumber: "ORD-2024-003",
      customer: {
        name: "Startup Corp",
        email: "finance@startup.com"
      }
    },
    status: "OVERDUE" as InvoiceStatus,
    total: 299.97,
    tax: 24.00,
    discount: 0,
    dueDate: new Date("2024-01-30"),
    paidDate: null,
    createdAt: new Date("2024-01-15"),
    user: {
      name: "Mike Johnson",
      image: ""
    }
  }
]

const statusConfig = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-800", icon: FileText },
  SENT: { label: "Sent", color: "bg-blue-100 text-blue-800", icon: Mail },
  PAID: { label: "Paid", color: "bg-green-100 text-green-800", icon: CheckCircle },
  OVERDUE: { label: "Overdue", color: "bg-red-100 text-red-800", icon: XCircle },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-800", icon: XCircle }
}

export default function InvoicesPage() {
  const { data: session, status } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [invoices] = useState(mockInvoices)

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/auth/signin")
  }

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: invoices.length,
    sent: invoices.filter(inv => inv.status === 'SENT').length,
    paid: invoices.filter(inv => inv.status === 'PAID').length,
    overdue: invoices.filter(inv => inv.status === 'OVERDUE').length,
    totalValue: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paidValue: invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.total, 0),
    overdueValue: invoices.filter(inv => inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.total, 0)
  }

  const getDaysOverdue = (dueDate: Date) => {
    const today = new Date()
    const diffTime = today.getTime() - dueDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-1">
              Manage and track your billing and payment collection
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-2xl font-bold">{stats.paid}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(stats.paidValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold">{stats.overdue}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(stats.overdueValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status Overview</CardTitle>
            <CardDescription>
              Current status distribution of all invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {Object.entries(statusConfig).map(([status, config]) => {
                const count = stats[status.toLowerCase() as keyof typeof stats] as number
                const IconComponent = config.icon

                return (
                  <div key={status} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-sm">{config.label}</h4>
                        <p className="text-xs text-gray-600">{count} invoices</p>
                      </div>
                    </div>
                    <Badge className={config.color}>
                      {count}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>
              Comprehensive list of all invoices and their payment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => {
                const statusInfo = statusConfig[invoice.status]
                const daysOverdue = invoice.status === 'OVERDUE' ? getDaysOverdue(invoice.dueDate) : 0

                return (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-6 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {invoice.invoiceNumber}
                          </h3>
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                          {invoice.status === 'OVERDUE' && (
                            <Badge variant="destructive">
                              {daysOverdue} days overdue
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Customer</p>
                            <p className="font-medium">{invoice.order.customer.name}</p>
                            <p className="text-gray-500">{invoice.order.customer.email}</p>
                          </div>

                          <div>
                            <p className="text-gray-600">Order</p>
                            <p className="font-medium">{invoice.order.orderNumber}</p>
                            <p className="text-gray-500">Related order</p>
                          </div>

                          <div>
                            <p className="text-gray-600">Created by</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {getInitials(invoice.user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{invoice.user.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Financial Details */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(invoice.total)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Tax: {formatCurrency(invoice.tax)}
                        </p>
                        {invoice.discount > 0 && (
                          <p className="text-sm text-red-600">
                            Discount: -{formatCurrency(invoice.discount)}
                          </p>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="text-sm text-center">
                        <p className="text-gray-600">Due Date</p>
                        <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                        {invoice.paidDate && (
                          <p className="text-gray-600 mt-1">
                            Paid: {formatDate(invoice.paidDate)}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Invoices will appear here once they are generated from orders.
                </p>
                <div className="mt-6">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
