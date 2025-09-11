"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search,
  Plus,
  Building,
  Users,
  Mail,
  Phone,
  Globe,
  MapPin,
  TrendingUp,
  DollarSign
} from "lucide-react"
import { formatCurrency, getInitials, formatDate } from "@/lib/utils"

// Mock data - In real app, this would come from API
const mockCompanies = [
  {
    id: "1",
    name: "TechCorp Solutions",
    industry: "Technology",
    website: "https://techcorp.com",
    email: "contact@techcorp.com",
    phone: "+1 (555) 123-4567",
    address: "123 Tech Street, Silicon Valley, CA",
    description: "Leading provider of enterprise software solutions",
    contacts: [
      { id: "1", firstName: "John", lastName: "Smith", position: "CEO" },
      { id: "2", firstName: "Jane", lastName: "Doe", position: "CTO" }
    ],
    opportunities: [
      { id: "1", title: "Cloud Migration", value: 75000, stage: "PROPOSAL" },
      { id: "2", title: "Software Implementation", value: 125000, stage: "NEGOTIATION" }
    ],
    createdAt: new Date("2024-01-15"),
    revenue: 450000
  },
  {
    id: "2",
    name: "Innovate Inc",
    industry: "Startup",
    website: "https://innovate.io",
    email: "hello@innovate.io",
    phone: "+1 (555) 987-6543",
    address: "456 Innovation Ave, Austin, TX",
    description: "Fast-growing tech startup specializing in AI solutions",
    contacts: [
      { id: "3", firstName: "Mike", lastName: "Johnson", position: "Founder" }
    ],
    opportunities: [
      { id: "3", title: "AI Consulting", value: 50000, stage: "QUALIFICATION" }
    ],
    createdAt: new Date("2024-02-01"),
    revenue: 150000
  }
]

export default function CompaniesPage() {
  const { data: session, status } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [companies] = useState(mockCompanies)

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/auth/signin")
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: companies.length,
    totalContacts: companies.reduce((sum, company) => sum + company.contacts.length, 0),
    totalOpportunities: companies.reduce((sum, company) => sum + company.opportunities.length, 0),
    totalRevenue: companies.reduce((sum, company) => sum + company.revenue, 0),
    avgRevenuePerCompany: companies.length > 0 ? companies.reduce((sum, company) => sum + company.revenue, 0) / companies.length : 0
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-600 mt-1">
              Manage your business relationships and company profiles
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search companies..."
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
                  <Building className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Companies</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                  <p className="text-2xl font-bold">{stats.totalContacts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Opportunities</p>
                  <p className="text-2xl font-bold">{stats.totalOpportunities}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Companies Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {getInitials(company.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {company.industry}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {company.description}
                </p>

                {/* Contact Info */}
                <div className="space-y-2">
                  {company.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{company.email}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {company.website.replace('https://', '')}
                      </a>
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="line-clamp-1">{company.address}</span>
                    </div>
                  )}
                </div>

                {/* Key Contacts */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Key Contacts ({company.contacts.length})</h4>
                  <div className="space-y-1">
                    {company.contacts.slice(0, 2).map((contact) => (
                      <div key={contact.id} className="flex items-center space-x-2 text-sm">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(`${contact.firstName} ${contact.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{contact.firstName} {contact.lastName}</span>
                        <Badge variant="outline" className="text-xs">
                          {contact.position}
                        </Badge>
                      </div>
                    ))}
                    {company.contacts.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{company.contacts.length - 2} more contacts
                      </p>
                    )}
                  </div>
                </div>

                {/* Opportunities Summary */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-sm font-medium">Opportunities</p>
                    <p className="text-xs text-gray-600">{company.opportunities.length} active</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(company.opportunities.reduce((sum, opp) => sum + opp.value, 0))}
                    </p>
                    <p className="text-xs text-gray-600">Total value</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Add Contact
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Added {formatDate(company.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first company.
            </p>
            <div className="mt-6">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
