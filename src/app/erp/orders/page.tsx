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
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Edit
} from "lucide-react"
import { formatCurrency, getInitials, formatDate } from "@/lib/utils"
import { OrderStatus } from "@prisma/client"

// Mock data - In real app, this would come from API
const mockOrders = [
  {
    id: "ORD-2024-001",
    orderNumber: "ORD-2024-001",
    customer: {
      name: "TechCorp Solutions",
      email: "contact@techcorp.com"
    },
    status: "PROCESSING" as OrderStatus,
    total: 1599.96,
    tax: 127.99,
    discount: 0,
    notes: "Urgent delivery requested",
    items: [
      { name: "Wireless Headphones", quantity: 2, price: 199.99 },
      { name: "Laptop Stand", quantity: 5, price: 79.99 },
      { name: "USB Cable", quantity: 10, price: 14.99 }
    ],
    user: {
      name: "John Doe",
      image: ""
    },
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-22")
  },
  {
    id: "ORD-2024-002",
    orderNumber: "ORD-2024-002",
    customer: {
      name: "Innovate Inc",
      email: "hello@innovate.io"
    },
    status: "SHIPPED" as OrderStatus,
    total: 849.95,
    tax: 67.99,
    discount: 50,
    notes: "Gift wrap requested",
    items: [
      { name: "Office Chair", quantity: 2, price: 349.99 },
      { name: "Laptop Stand", quantity: 1, price: 79.99 }
    ],
    user: {
      name: "Jane Smith",
      image: ""
    },
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-21")
  },
  {
    id: "ORD-2024-003",
    orderNumber: "ORD-2024-003",
    customer: {
      name: "Startup Corp",
      email: "orders@startup.com"
    },
    status: "DELIVERED" as OrderStatus,
    total: 299.97,
    tax: 24.00,
    discount: 0,
    notes: "",
    items: [
      { name: "Wireless Headphones", quantity: 1, price: 199.99 },
      { name: "USB Cable", quantity: 5, price: 14.99 }
    ],
    user: {
      name: "Mike Johnson",
      image: ""
    },
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20")
  }
]

const statusConfig = {
  PENDING: { label: "Pending", color: "bg-gray-100 text-gray-800", icon: Clock },
  PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Package },
  SHIPPED: { label: "Shipped", color: "bg-orange-100 text-orange-800", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle }
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [orders] = useState(mockOrders)

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/auth/signin")
  }

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    totalValue: orders.reduce((sum, order) => sum + order.total, 0),
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-1">
              Manage customer orders and fulfillment
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search orders..."
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
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{stats.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Overview</CardTitle>
            <CardDescription>
              Current status distribution of all orders
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
                        <p className="text-xs text-gray-600">{count} orders</p>
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

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>
              Comprehensive list of all customer orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusInfo = statusConfig[order.status]

                return (
                  <div
                    key={order.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.customer.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.customer.email}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        <p className="text-xl font-bold text-green-600 mt-2">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Items ({order.items.length})</h4>
                      <div className="space-y-1">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{order.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">Subtotal</p>
                        <p className="font-medium">{formatCurrency(order.total - order.tax)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tax</p>
                        <p className="font-medium">{formatCurrency(order.tax)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Discount</p>
                        <p className="font-medium">-{formatCurrency(order.discount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total</p>
                        <p className="font-semibold">{formatCurrency(order.total)}</p>
                      </div>
                    </div>

                    {/* Order Meta */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(order.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">
                            Created by {order.user.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Update
                        </Button>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        <strong>Notes:</strong> {order.notes}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Orders will appear here once customers start placing them.
                </p>
                <div className="mt-6">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Order
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
