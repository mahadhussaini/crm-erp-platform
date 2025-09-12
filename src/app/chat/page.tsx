// import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Phone, Video, Settings } from 'lucide-react'

export const metadata = {
  title: 'Chat - Salesforce',
  description: 'Team communication and messaging',
}

export default async function ChatPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-4 md:p-6 h-[calc(100vh-120px)]">
      <div className="flex h-full gap-4 md:gap-6">
        {/* Sidebar */}
        <div className="hidden md:block w-80 bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Messages</h2>
              <Button size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {/* Chat List */}
            {[
              { name: 'Sales Team', lastMessage: 'Great work on the Q3 numbers!', time: '2m', unread: 3 },
              { name: 'John Doe', lastMessage: 'Can we schedule a meeting?', time: '15m', unread: 1 },
              { name: 'Marketing', lastMessage: 'New campaign is ready for review', time: '1h', unread: 0 },
              { name: 'Alice Smith', lastMessage: 'Thanks for the quick response', time: '2h', unread: 0 },
            ].map((chat, index) => (
              <div key={index} className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {chat.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{chat.name}</p>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{chat.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{chat.lastMessage}</p>
                    </div>
                  </div>
                  {chat.unread > 0 && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                      <span className="text-xs text-white">{chat.unread}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Chat List - Only show on mobile */}
        <div className="md:hidden flex-1">
          <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Messages</h2>
                <Button size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {[
                { name: 'Sales Team', lastMessage: 'Great work on the Q3 numbers!', time: '2m', unread: 3 },
                { name: 'John Doe', lastMessage: 'Can we schedule a meeting?', time: '15m', unread: 1 },
                { name: 'Marketing', lastMessage: 'New campaign is ready for review', time: '1h', unread: 0 },
                { name: 'Alice Smith', lastMessage: 'Thanks for the quick response', time: '2h', unread: 0 },
              ].map((chat, index) => (
                <div key={index} className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {chat.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{chat.name}</p>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{chat.time}</span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">{chat.lastMessage}</p>
                      </div>
                    </div>
                    {chat.unread > 0 && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                        <span className="text-xs text-white">{chat.unread}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area - Hidden on mobile */}
        <div className="hidden md:flex flex-1 bg-white border border-gray-200 rounded-lg flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                S
              </div>
              <div>
                <h3 className="font-medium">Sales Team</h3>
                <p className="text-sm text-gray-500">5 members • 3 online</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Message bubbles */}
            {[
              { sender: 'John Doe', message: 'Great work on the Q3 numbers everyone!', time: '10:30 AM', own: false },
              { sender: 'You', message: 'Thanks! The team really pulled together.', time: '10:32 AM', own: true },
              { sender: 'Alice Smith', message: 'What are our targets for Q4?', time: '10:35 AM', own: false },
              { sender: 'You', message: 'I\'ll share the Q4 plan in our next meeting.', time: '10:37 AM', own: true },
            ].map((msg, index) => (
              <div key={index} className={`flex ${msg.own ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.own 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {!msg.own && <p className="text-xs font-medium mb-1">{msg.sender}</p>}
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${msg.own ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button>Send</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
