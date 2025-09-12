// import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Send, Edit, Trash2, Calendar, Users, Eye, MousePointer } from 'lucide-react'

export const metadata = {
  title: 'Email Campaigns - Salesforce Marketing',
  description: 'Create and manage email marketing campaigns',
}

// Mock data for campaigns
const campaigns = [
  {
    id: '1',
    name: 'Summer Sale Announcement',
    subject: '🌞 Summer Sale - Up to 50% Off Everything!',
    status: 'sent',
    recipients: 2847,
    openRate: 28.5,
    clickRate: 4.8,
    sentAt: '2024-09-12T14:30:00Z',
    createdAt: '2024-09-12T10:00:00Z'
  },
  {
    id: '2',
    name: 'Weekly Newsletter #42',
    subject: 'Your Weekly Update - New Features & Tips',
    status: 'sent',
    recipients: 2654,
    openRate: 22.1,
    clickRate: 3.2,
    sentAt: '2024-09-10T09:00:00Z',
    createdAt: '2024-09-09T16:00:00Z'
  },
  {
    id: '3',
    name: 'Product Update Alert',
    subject: 'New Feature Alert: Advanced Analytics Dashboard',
    status: 'sent',
    recipients: 1892,
    openRate: 31.2,
    clickRate: 6.1,
    sentAt: '2024-09-05T11:15:00Z',
    createdAt: '2024-09-04T14:30:00Z'
  },
  {
    id: '4',
    name: 'Customer Survey',
    subject: 'Help us improve - 2 minute survey',
    status: 'scheduled',
    recipients: 2847,
    openRate: 0,
    clickRate: 0,
    scheduledAt: '2024-09-15T10:00:00Z',
    createdAt: '2024-09-12T16:45:00Z'
  },
  {
    id: '5',
    name: 'Welcome Series - Part 1',
    subject: 'Welcome aboard! Let\'s get you started',
    status: 'draft',
    recipients: 0,
    openRate: 0,
    clickRate: 0,
    createdAt: '2024-09-12T18:20:00Z'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'sent':
      return 'bg-green-100 text-green-800'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'sending':
      return 'bg-yellow-100 text-yellow-800'
    case 'paused':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600 mt-1">
            Create, manage, and track your email marketing campaigns
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{campaign.subject}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{campaign.recipients.toLocaleString()} recipients</span>
                    </div>
                    
                    {campaign.status === 'sent' && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span>{campaign.openRate}% open rate</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MousePointer className="w-4 h-4 text-gray-400" />
                          <span>{campaign.clickRate}% click rate</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Send className="w-4 h-4 text-gray-400" />
                          <span>Sent {new Date(campaign.sentAt!).toLocaleDateString()}</span>
                        </div>
                      </>
                    )}
                    
                    {campaign.status === 'scheduled' && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Scheduled for {new Date(campaign.scheduledAt!).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {campaign.status === 'draft' && (
                      <div className="flex items-center space-x-2">
                        <Edit className="w-4 h-4 text-gray-400" />
                        <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  {campaign.status === 'draft' && (
                    <>
                      <Button size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </>
                  )}
                  
                  {campaign.status === 'scheduled' && (
                    <>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive">
                        Cancel
                      </Button>
                    </>
                  )}
                  
                  {campaign.status === 'sent' && (
                    <>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Report
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send className="w-4 h-4 mr-2" />
                        Duplicate
                      </Button>
                    </>
                  )}
                  
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first email campaign to start engaging with your customers
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
