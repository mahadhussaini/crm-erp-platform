"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Plus,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  Users,
  Building
} from "lucide-react"
import { formatCurrency, getInitials, formatDate } from "@/lib/utils"
import { OpportunityStage } from "@prisma/client"

// Mock data - In real app, this would come from API
const mockOpportunities = [
  {
    id: "1",
    title: "Enterprise Cloud Migration",
    description: "Complete cloud infrastructure migration for TechCorp",
    value: 150000,
    probability: 75,
    stage: "PROPOSAL" as OpportunityStage,
    expectedClose: new Date("2024-03-15"),
    contact: {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@techcorp.com"
    },
    company: {
      name: "TechCorp Solutions",
      industry: "Technology"
    },
    assignedTo: {
      name: "Sarah Johnson",
      image: ""
    },
    createdAt: new Date("2024-01-15"),
    lastActivity: new Date("2024-01-20")
  },
  {
    id: "2",
    title: "Mobile App Development",
    description: "Custom mobile application for retail chain",
    value: 85000,
    probability: 60,
    stage: "NEGOTIATION" as OpportunityStage,
    expectedClose: new Date("2024-02-28"),
    contact: {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@retailchain.com"
    },
    company: {
      name: "RetailChain Inc",
      industry: "Retail"
    },
    assignedTo: {
      name: "Mike Chen",
      image: ""
    },
    createdAt: new Date("2024-01-20"),
    lastActivity: new Date("2024-01-22")
  },
  {
    id: "3",
    title: "AI Consulting Project",
    description: "AI implementation and consulting services",
    value: 120000,
    probability: 40,
    stage: "QUALIFICATION" as OpportunityStage,
    expectedClose: new Date("2024-04-10"),
    contact: {
      firstName: "Bob",
      lastName: "Wilson",
      email: "bob.wilson@innovate.io"
    },
    company: {
      name: "Innovate Labs",
      industry: "AI/ML"
    },
    assignedTo: {
      name: "Sarah Johnson",
      image: ""
    },
    createdAt: new Date("2024-02-01"),
    lastActivity: new Date("2024-02-05")
  }
]

const stageConfig = {
  PROSPECTING: { label: "Prospecting", color: "bg-gray-100 text-gray-800" },
  QUALIFICATION: { label: "Qualification", color: "bg-blue-100 text-blue-800" },
  PROPOSAL: { label: "Proposal", color: "bg-yellow-100 text-yellow-800" },
  NEGOTIATION: { label: "Negotiation", color: "bg-orange-100 text-orange-800" },
  CLOSED_WON: { label: "Closed Won", color: "bg-green-100 text-green-800" },
  CLOSED_LOST: { label: "Closed Lost", color: "bg-red-100 text-red-800" }
}

export default function OpportunitiesPage() {
  const { data: session, status } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [opportunities] = useState(mockOpportunities)

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/auth/signin")
  }

  const filteredOpportunities = opportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.contact.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: opportunities.length,
    totalValue: opportunities.reduce((sum, opp) => sum + opp.value, 0),
    weightedValue: opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0),
    avgProbability: opportunities.length > 0 ? opportunities.reduce((sum, opp) => sum + opp.probability, 0) / opportunities.length : 0,
    byStage: {
      PROSPECTING: opportunities.filter(opp => opp.stage === 'PROSPECTING').length,
      QUALIFICATION: opportunities.filter(opp => opp.stage === 'QUALIFICATION').length,
      PROPOSAL: opportunities.filter(opp => opp.stage === 'PROPOSAL').length,
      NEGOTIATION: opportunities.filter(opp => opp.stage === 'NEGOTIATION').length,
      CLOSED_WON: opportunities.filter(opp => opp.stage === 'CLOSED_WON').length,
      CLOSED_LOST: opportunities.filter(opp => opp.stage === 'CLOSED_LOST').length
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
            <p className="text-gray-600 mt-1">
              Track and manage your sales opportunities through the pipeline
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Opportunity
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search opportunities..."
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
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
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
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Weighted Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.weightedValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="h-4 w-4 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Probability</p>
                  <p className="text-2xl font-bold">{stats.avgProbability.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Stages Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
            <CardDescription>
              Distribution of opportunities across pipeline stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(stageConfig).map(([stage, config]) => (
                <div key={stage} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{config.label}</h4>
                    <p className="text-sm text-gray-600">{stats.byStage[stage as OpportunityStage]} opportunities</p>
                  </div>
                  <Badge className={config.color}>
                    {stats.byStage[stage as OpportunityStage]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opportunities List */}
        <Card>
          <CardHeader>
            <CardTitle>All Opportunities</CardTitle>
            <CardDescription>
              Detailed view of all sales opportunities in your pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredOpportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {opportunity.title}
                        </h3>
                        <Badge className={stageConfig[opportunity.stage].color}>
                          {stageConfig[opportunity.stage].label}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{opportunity.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(opportunity.value)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {opportunity.probability}% probability
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{opportunity.probability}%</span>
                    </div>
                    <Progress value={opportunity.probability} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Contact Info */}
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">
                          {getInitials(`${opportunity.contact.firstName} ${opportunity.contact.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {opportunity.contact.firstName} {opportunity.contact.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{opportunity.contact.email}</p>
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{opportunity.company.name}</p>
                        <p className="text-xs text-gray-500">{opportunity.company.industry}</p>
                      </div>
                    </div>

                    {/* Assigned To */}
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={opportunity.assignedTo.image} />
                        <AvatarFallback className="text-sm">
                          {getInitials(opportunity.assignedTo.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{opportunity.assignedTo.name}</p>
                        <p className="text-xs text-gray-500">Sales Rep</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Expected: {formatDate(opportunity.expectedClose)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Last activity: {formatDate(opportunity.lastActivity)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Update Stage
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredOpportunities.length === 0 && (
              <div className="text-center py-12">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first sales opportunity.
                </p>
                <div className="mt-6">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Opportunity
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
