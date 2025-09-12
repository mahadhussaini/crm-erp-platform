// import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react'

export const metadata = {
  title: 'Calendar - Salesforce',
  description: 'Schedule and manage meetings, events, and tasks',
}

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const today = new Date()
  const currentMonth = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Mock events data
  const events = [
    {
      id: '1',
      title: 'Sales Team Meeting',
      time: '9:00 AM - 10:00 AM',
      date: 'Today',
      type: 'meeting',
      attendees: 5,
      location: 'Conference Room A'
    },
    {
      id: '2',
      title: 'Client Call - Acme Corp',
      time: '2:00 PM - 3:00 PM',
      date: 'Today',
      type: 'call',
      attendees: 3,
      location: 'Virtual'
    },
    {
      id: '3',
      title: 'Product Demo',
      time: '10:00 AM - 11:30 AM',
      date: 'Tomorrow',
      type: 'meeting',
      attendees: 8,
      location: 'Conference Room B'
    },
    {
      id: '4',
      title: 'Quarterly Review',
      time: '3:00 PM - 5:00 PM',
      date: 'Friday',
      type: 'meeting',
      attendees: 12,
      location: 'Main Conference Room'
    }
  ]

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800'
      case 'call':
        return 'bg-green-100 text-green-800'
      case 'task':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">
            Schedule and manage your meetings, events, and tasks
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{currentMonth}</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const dayNumber = i - 6 + today.getDate()
                  const isToday = dayNumber === today.getDate() && i >= 6 && i < 28
                  const isCurrentMonth = i >= 6 && i < 28
                  
                  return (
                    <div
                      key={i}
                      className={`p-2 min-h-[80px] border border-gray-100 ${
                        isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                      } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <div className={`text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${
                        isToday ? 'font-bold text-blue-600' : ''
                      }`}>
                        {isCurrentMonth ? dayNumber : ''}
                      </div>
                      {/* Sample events on specific days */}
                      {isToday && (
                        <div className="mt-1 space-y-1">
                          <div className="text-xs bg-blue-100 text-blue-800 p-1 rounded truncate">
                            Sales Meeting
                          </div>
                          <div className="text-xs bg-green-100 text-green-800 p-1 rounded truncate">
                            Client Call
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    <Badge className={getEventTypeColor(event.type)} variant="secondary">
                      {event.type}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>{event.date} • {event.time}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3 h-3" />
                      <span>{event.location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="w-3 h-3" />
                      <span>{event.attendees} attendees</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="outline" className="text-xs">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Book Conference Room
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Set Reminder
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
