'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign, User, ShoppingCart } from 'lucide-react'

const activities = [
  {
    id: 1,
    type: 'sale',
    description: 'New order from Acme Corp',
    amount: '$2,500',
    user: 'John Doe',
    time: '2 minutes ago',
    avatar: '/avatars/01.png'
  },
  {
    id: 2,
    type: 'lead',
    description: 'New lead: Sarah Johnson',
    amount: 'Potential: $5,000',
    user: 'Jane Smith',
    time: '5 minutes ago',
    avatar: '/avatars/02.png'
  },
  {
    id: 3,
    type: 'customer',
    description: 'Customer registration completed',
    amount: 'Premium Plan',
    user: 'Mike Wilson',
    time: '10 minutes ago',
    avatar: '/avatars/03.png'
  },
  {
    id: 4,
    type: 'order',
    description: 'Order #12345 shipped',
    amount: '$1,200',
    user: 'Alice Brown',
    time: '15 minutes ago',
    avatar: '/avatars/04.png'
  },
  {
    id: 5,
    type: 'sale',
    description: 'Deal closed with TechStart Inc',
    amount: '$15,000',
    user: 'Bob Johnson',
    time: '1 hour ago',
    avatar: '/avatars/05.png'
  }
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'sale':
      return <DollarSign className="w-4 h-4 text-green-600" />
    case 'lead':
      return <User className="w-4 h-4 text-blue-600" />
    case 'customer':
      return <User className="w-4 h-4 text-purple-600" />
    case 'order':
      return <ShoppingCart className="w-4 h-4 text-orange-600" />
    default:
      return <Clock className="w-4 h-4 text-gray-600" />
  }
}

const getActivityBadge = (type: string) => {
  switch (type) {
    case 'sale':
      return <Badge className="bg-green-100 text-green-800">Sale</Badge>
    case 'lead':
      return <Badge className="bg-blue-100 text-blue-800">Lead</Badge>
    case 'customer':
      return <Badge className="bg-purple-100 text-purple-800">Customer</Badge>
    case 'order':
      return <Badge className="bg-orange-100 text-orange-800">Order</Badge>
    default:
      return <Badge>Activity</Badge>
  }
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest business activities and transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.description}
                  </p>
                  {getActivityBadge(activity.type)}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-500">
                    by {activity.user}
                  </p>
                  <p className="text-sm font-semibold text-green-600">
                    {activity.amount}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
