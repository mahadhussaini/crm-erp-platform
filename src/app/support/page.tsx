// import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  HeadphonesIcon,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  User,
  Calendar
} from 'lucide-react'

export const metadata = {
  title: 'Support Tickets - Salesforce',
  description: 'Manage customer support tickets and service requests',
}

// Mock data for tickets
const tickets = [
  {
    id: 'TKT-001',
    subject: 'Unable to access dashboard',
    customer: 'John Smith',
    status: 'OPEN',
    priority: 'HIGH',
    category: 'Technical',
    assignee: 'Sarah Wilson',
    createdAt: '2 hours ago',
    lastUpdate: '30 minutes ago',
    responseCount: 3
  },
  {
    id: 'TKT-002',
    subject: 'Billing inquiry for invoice #INV-123',
    customer: 'Acme Corporation',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    category: 'Billing',
    assignee: 'Mike Johnson',
    createdAt: '1 day ago',
    lastUpdate: '3 hours ago',
    responseCount: 5
  },
  {
    id: 'TKT-003',
    subject: 'Feature request - Export functionality',
    customer: 'Tech Solutions Ltd',
    status: 'PENDING_CUSTOMER',
    priority: 'LOW',
    category: 'Feature Request',
    assignee: 'Alice Brown',
    createdAt: '3 days ago',
    lastUpdate: '1 day ago',
    responseCount: 2
  },
  {
    id: 'TKT-004',
    subject: 'Password reset not working',
    customer: 'Jane Doe',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    category: 'Account',
    assignee: 'Tom Davis',
    createdAt: '1 week ago',
    lastUpdate: '2 days ago',
    responseCount: 4
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'bg-red-100 text-red-800'
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800'
    case 'PENDING_CUSTOMER':
      return 'bg-yellow-100 text-yellow-800'
    case 'RESOLVED':
      return 'bg-green-100 text-green-800'
    case 'CLOSED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-500 text-white'
    case 'HIGH':
      return 'bg-orange-500 text-white'
    case 'MEDIUM':
      return 'bg-yellow-500 text-white'
    case 'LOW':
      return 'bg-green-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

export default async function SupportPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600 mt-1">
            Manage customer support requests and service tickets
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold text-red-600">12</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">8</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">15</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">2.4h</p>
              </div>
              <HeadphonesIcon className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="all">All Tickets</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">ID:</span>
                        <span>{ticket.id}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{ticket.customer}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{ticket.createdAt}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>{ticket.responseCount} responses</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-500">Category: {ticket.category}</span>
                        <span className="text-gray-500">Assigned to: {ticket.assignee}</span>
                      </div>
                      <span className="text-xs text-gray-500">Last update: {ticket.lastUpdate}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-6">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      Add Response
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="open" className="space-y-4">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Open tickets will appear here</h3>
            <p className="text-gray-500">Tickets that need immediate attention</p>
          </div>
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your assigned tickets</h3>
            <p className="text-gray-500">Tickets currently assigned to you</p>
          </div>
        </TabsContent>

        <TabsContent value="urgent" className="space-y-4">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Urgent tickets</h3>
            <p className="text-gray-500">High priority tickets requiring immediate attention</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
