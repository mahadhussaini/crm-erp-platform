import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime, getInitials } from "@/lib/utils"
import { ActivityType } from "@prisma/client"

interface Activity {
  id: string
  type: ActivityType
  title: string
  date: Date
  user: {
    name: string
    image?: string
  }
}

interface RecentActivitiesProps {
  activities: Activity[]
}

const activityIcons = {
  CALL: "📞",
  EMAIL: "📧",
  MEETING: "🤝",
  NOTE: "📝",
  TASK: "✅"
}


export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>
          Latest customer interactions and task updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user.image} />
                <AvatarFallback className="bg-blue-500 text-white text-sm">
                  {getInitials(activity.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {activityIcons[activity.type]}
                  </span>
                  <p className="text-sm font-medium leading-none">
                    {activity.title}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  by {activity.user.name}
                </p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">
                {formatDateTime(activity.date)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
