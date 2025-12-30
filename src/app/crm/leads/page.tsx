"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LeadsKanban } from "@/components/crm/leads-kanban"
import { LeadScorer } from "@/components/ai/lead-scorer"
import { EmailGenerator } from "@/components/ai/email-generator"
import { AITextGenerator } from "@/components/ai/ai-text-generator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Target,
  TrendingUp,
  Users,
  DollarSign
} from "lucide-react"
import { LeadStatus, Priority } from "@prisma/client"
import { getStatusColor } from "@/lib/utils"

// Mock data - In real app, this would come from API
const mockLeads = [
  {
    id: "1",
    title: "Enterprise Software Solution",
    value: 50000,
    status: "NEW" as LeadStatus,
    priority: "HIGH" as Priority,
    source: "Website",
    contact: {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@enterprise.com"
    },
    company: {
      name: "Enterprise Corp"
    },
    assignedTo: {
      name: "Sarah Johnson",
      image: ""
    },
    createdAt: new Date("2024-01-15")
  },
  {
    id: "2",
    title: "Mobile App Development",
    value: 25000,
    status: "CONTACTED" as LeadStatus,
    priority: "MEDIUM" as Priority,
    source: "Referral",
    contact: {
      firstName: "Mike",
      lastName: "Davis",
      email: "mike.d@startup.io"
    },
    company: {
      name: "Startup Inc"
    },
    assignedTo: {
      name: "Alex Chen",
      image: ""
    },
    createdAt: new Date("2024-01-18")
  },
  {
    id: "3",
    title: "Cloud Migration Project",
    value: 75000,
    status: "QUALIFIED" as LeadStatus,
    priority: "HIGH" as Priority,
    source: "LinkedIn",
    contact: {
      firstName: "Lisa",
      lastName: "Brown",
      email: "lisa.brown@techcorp.com"
    },
    company: {
      name: "TechCorp"
    },
    assignedTo: {
      name: "Sarah Johnson",
      image: ""
    },
    createdAt: new Date("2024-01-20")
  }
]

export default function LeadsPage() {
  const { data: session, status } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [leads, setLeads] = useState(mockLeads)
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "ai">("kanban")

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/auth/signin")
  }

  const handleLeadUpdate = (leadId: string, newStatus: LeadStatus) => {
    setLeads(prev => prev.map(lead =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ))
    // In real app, this would make an API call to update the lead
    console.log(`Updated lead ${leadId} to status ${newStatus}`)
  }

  const filteredLeads = leads.filter(lead =>
    lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'NEW').length,
    contacted: leads.filter(l => l.status === 'CONTACTED').length,
    qualified: leads.filter(l => l.status === 'QUALIFIED').length,
    converted: leads.filter(l => l.status === 'CONVERTED').length,
    lost: leads.filter(l => l.status === 'LOST').length,
    totalValue: leads.reduce((sum, lead) => sum + lead.value, 0),
    convertedValue: leads.filter(l => l.status === 'CONVERTED').reduce((sum, lead) => sum + lead.value, 0),
    conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'CONVERTED').length / leads.length) * 100 : 0
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads Pipeline</h1>
            <p className="text-gray-600 mt-1">
              Track and manage your sales leads through the conversion funnel
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
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
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
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
                  <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                  <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
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
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Leads</p>
                  <p className="text-2xl font-bold">{stats.new + stats.contacted + stats.qualified}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and View Toggle */}
        <div className="flex items-center justify-between">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "kanban" | "list" | "ai")}>
            <TabsList>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="ai">AI Tools</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Pipeline View */}
        <Tabs value={viewMode}>
          <TabsContent value="kanban" className="mt-6">
            <LeadsKanban leads={filteredLeads} onLeadUpdate={handleLeadUpdate} />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Leads</CardTitle>
                <CardDescription>
                  Detailed list of all leads in your pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{lead.title}</h3>
                            <Badge variant="outline" className={getStatusColor(lead.priority.toLowerCase())}>
                              {lead.priority}
                            </Badge>
                            <Badge variant="secondary">{lead.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {lead.contact.firstName} {lead.contact.lastName} • {lead.company.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            ${lead.value.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">Source: {lead.source}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredLeads.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No leads found matching your search.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Lead Scoring */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI Lead Scoring</h3>
                  {filteredLeads.length > 0 && (
                    <LeadScorer
                      leadData={{
                        companyName: filteredLeads[0].company.name,
                        industry: "Technology", // This would come from actual lead data
                        companySize: "50-200 employees", // This would come from actual lead data
                        website: "www.example.com", // This would come from actual lead data
                        description: filteredLeads[0].title,
                        location: "San Francisco, CA" // This would come from actual lead data
                      }}
                    />
                  )}
                </div>

                {/* Email Generator */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI Email Generator</h3>
                  {filteredLeads.length > 0 && (
                    <EmailGenerator
                      contact={{
                        name: `${filteredLeads[0].contact.firstName} ${filteredLeads[0].contact.lastName}`,
                        company: filteredLeads[0].company.name,
                        position: "Decision Maker", // This would come from actual lead data
                        email: filteredLeads[0].contact.email
                      }}
                      context={`Following up on our discussion about ${filteredLeads[0].title} with a potential value of $${filteredLeads[0].value.toLocaleString()}.`}
                    />
                  )}
                </div>
              </div>

              {/* Text Generator for Lead-related Content */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Content Generator</h3>
                <AITextGenerator
                  templates={[
                    {
                      label: "Proposal Draft",
                      prompt: "Write a business proposal for"
                    },
                    {
                      label: "Meeting Summary",
                      prompt: "Summarize key points from our meeting about"
                    },
                    {
                      label: "Follow-up Email",
                      prompt: "Write a professional follow-up email regarding"
                    }
                  ]}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
