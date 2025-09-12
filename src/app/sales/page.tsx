// import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  DollarSign,
  Target,
  Users,
  Plus,
  Calendar,
  Phone,
  Mail,
  ArrowRight
} from 'lucide-react'

export const metadata = {
  title: 'Sales Pipeline - Salesforce',
  description: 'Visualize and manage your sales pipeline and opportunities',
}

// Mock pipeline data
const pipelineStages = [
  {
    name: 'Prospecting',
    deals: [
      { id: '1', company: 'TechStart Inc', value: 25000, probability: 10, contact: 'John Smith', lastActivity: '2 days ago' },
      { id: '2', company: 'Digital Solutions', value: 15000, probability: 15, contact: 'Sarah Johnson', lastActivity: '1 week ago' },
    ]
  },
  {
    name: 'Qualification',
    deals: [
      { id: '3', company: 'Global Corp', value: 45000, probability: 30, contact: 'Mike Wilson', lastActivity: '3 hours ago' },
      { id: '4', company: 'Innovate LLC', value: 32000, probability: 25, contact: 'Lisa Brown', lastActivity: '1 day ago' },
    ]
  },
  {
    name: 'Proposal',
    deals: [
      { id: '5', company: 'Enterprise Systems', value: 78000, probability: 60, contact: 'David Chen', lastActivity: '2 hours ago' },
      { id: '6', company: 'Metro Solutions', value: 21000, probability: 55, contact: 'Emma Davis', lastActivity: '4 hours ago' },
    ]
  },
  {
    name: 'Negotiation',
    deals: [
      { id: '7', company: 'Future Tech', value: 95000, probability: 80, contact: 'Alex Rodriguez', lastActivity: '30 minutes ago' },
    ]
  },
  {
    name: 'Closed Won',
    deals: [
      { id: '8', company: 'Success Corp', value: 55000, probability: 100, contact: 'Maria Garcia', lastActivity: 'Today' },
      { id: '9', company: 'Victory Inc', value: 38000, probability: 100, contact: 'Tom Anderson', lastActivity: 'Yesterday' },
    ]
  }
]

const getProbabilityColor = (probability: number) => {
  if (probability >= 80) return 'text-green-600'
  if (probability >= 60) return 'text-blue-600'
  if (probability >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

export default async function SalesPipelinePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const totalPipelineValue = pipelineStages.reduce((total, stage) => 
    total + stage.deals.reduce((stageTotal, deal) => stageTotal + deal.value, 0), 0
  )

  const totalDeals = pipelineStages.reduce((total, stage) => total + stage.deals.length, 0)

  const avgDealSize = totalDeals > 0 ? totalPipelineValue / totalDeals : 0

  const weightedValue = pipelineStages.reduce((total, stage) => 
    total + stage.deals.reduce((stageTotal, deal) => stageTotal + (deal.value * deal.probability / 100), 0), 0
  )

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-1">
            Visualize and manage your sales opportunities through each stage
          </p>
        </div>
        <Button className="mt-2 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          New Opportunity
        </Button>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pipeline Value</p>
                <p className="text-2xl font-bold">${totalPipelineValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weighted Pipeline</p>
                <p className="text-2xl font-bold">${Math.round(weightedValue).toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
                <p className="text-2xl font-bold">{totalDeals}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Deal Size</p>
                <p className="text-2xl font-bold">${Math.round(avgDealSize).toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Board */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Board</CardTitle>
          <CardDescription>
            Drag and drop opportunities between stages to update their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {pipelineStages.map((stage, _stageIndex) => {
              const stageValue = stage.deals.reduce((sum, deal) => sum + deal.value, 0)
              const stageWeightedValue = stage.deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0)
              
              return (
                <div key={stage.name} className="space-y-4">
                  {/* Stage Header */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg">{stage.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Deals:</span>
                        <span className="font-medium">{stage.deals.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Value:</span>
                        <span className="font-medium">${stageValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weighted:</span>
                        <span className="font-medium">${Math.round(stageWeightedValue).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stage Deals */}
                  <div className="space-y-3 min-h-[400px]">
                    {stage.deals.map((deal) => (
                      <Card key={deal.id} className="cursor-move hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-sm">{deal.company}</h4>
                              <p className="text-lg font-bold text-green-600">
                                ${deal.value.toLocaleString()}
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span>Probability</span>
                                <span className={`font-medium ${getProbabilityColor(deal.probability)}`}>
                                  {deal.probability}%
                                </span>
                              </div>
                              <Progress value={deal.probability} className="h-2" />
                            </div>
                            
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>{deal.contact}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{deal.lastActivity}</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-1 pt-2">
                              <Button size="sm" variant="outline" className="flex-1 text-xs">
                                <Phone className="w-3 h-3 mr-1" />
                                Call
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1 text-xs">
                                <Mail className="w-3 h-3 mr-1" />
                                Email
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {stage.deals.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Target className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">No deals in this stage</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pipeline Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'moved', company: 'Future Tech', from: 'Proposal', to: 'Negotiation', time: '30 minutes ago', user: 'Sarah Wilson' },
              { action: 'created', company: 'New Prospect Corp', stage: 'Prospecting', time: '2 hours ago', user: 'Mike Johnson' },
              { action: 'won', company: 'Success Corp', amount: '$55,000', time: '1 day ago', user: 'Alice Brown' },
              { action: 'updated', company: 'Enterprise Systems', field: 'probability to 60%', time: '2 days ago', user: 'Tom Davis' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      {activity.action === 'moved' && (
                        <span> moved <strong>{activity.company}</strong> from {activity.from} to {activity.to}</span>
                      )}
                      {activity.action === 'created' && (
                        <span> created new opportunity <strong>{activity.company}</strong> in {activity.stage}</span>
                      )}
                      {activity.action === 'won' && (
                        <span> closed <strong>{activity.company}</strong> for {activity.amount}</span>
                      )}
                      {activity.action === 'updated' && (
                        <span> updated <strong>{activity.company}</strong> {activity.field}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
