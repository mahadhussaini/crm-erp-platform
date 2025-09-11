"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Edit
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Mock data - In real app, this would come from API
const mockProducts = [
  {
    id: "1",
    name: "Wireless Headphones",
    description: "Premium wireless headphones with noise cancellation",
    sku: "WH-001",
    price: 199.99,
    cost: 120.00,
    category: "Electronics",
    stock: 45,
    minStock: 10,
    isActive: true,
    createdAt: new Date("2024-01-15")
  },
  {
    id: "2",
    name: "Laptop Stand",
    description: "Adjustable aluminum laptop stand",
    sku: "LS-002",
    price: 79.99,
    cost: 35.00,
    category: "Accessories",
    stock: 3,
    minStock: 15,
    isActive: true,
    createdAt: new Date("2024-01-20")
  },
  {
    id: "3",
    name: "Office Chair",
    description: "Ergonomic office chair with lumbar support",
    sku: "OC-003",
    price: 349.99,
    cost: 180.00,
    category: "Furniture",
    stock: 12,
    minStock: 5,
    isActive: true,
    createdAt: new Date("2024-02-01")
  },
  {
    id: "4",
    name: "USB Cable",
    description: "High-speed USB-C to USB-A cable",
    sku: "UC-004",
    price: 14.99,
    cost: 3.50,
    category: "Accessories",
    stock: 0,
    minStock: 20,
    isActive: false,
    createdAt: new Date("2024-01-10")
  }
]

export default function ProductsPage() {
  const { data: session, status } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [products] = useState(mockProducts)

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/auth/signin")
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    lowStock: products.filter(p => p.stock <= p.minStock && p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, product) => sum + (product.price * product.stock), 0),
    avgMargin: products.length > 0 ?
      products.reduce((sum, product) => sum + ((product.price - (product.cost || 0)) / product.price * 100), 0) / products.length : 0
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { status: "Out of Stock", color: "bg-red-100 text-red-800" }
    if (stock <= minStock) return { status: "Low Stock", color: "bg-yellow-100 text-yellow-800" }
    return { status: "In Stock", color: "bg-green-100 text-green-800" }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">
              Manage your product inventory and catalog
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
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
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Products</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold">{stats.lowStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock, product.minStock)
            const stockPercentage = product.minStock > 0 ? (product.stock / product.minStock) * 100 : 100

            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {product.description}
                      </CardDescription>
                    </div>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* SKU and Category */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">SKU: {product.sku}</span>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cost</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(product.cost || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Stock Information */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Stock Level</span>
                      <Badge className={stockStatus.color}>
                        {stockStatus.status}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{product.stock} units</span>
                        <span>Min: {product.minStock}</span>
                      </div>
                      <Progress
                        value={Math.min(stockPercentage, 100)}
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* Profit Margin */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Profit Margin</span>
                      <span className="text-sm font-medium text-green-600">
                        {product.cost ? (((product.price - product.cost) / product.price) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first product.
            </p>
            <div className="mt-6">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        )}

        {/* Low Stock Alert */}
        {stats.lowStock > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Low Stock Alert
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {stats.lowStock} products are running low on stock and need to be reordered.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  View Low Stock
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
