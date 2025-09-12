'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Using Recharts' expected label function signature

interface PipelineDataItem {
  name: string
  value: number
  color: string
}

const salesData = [
  { name: 'Jan', sales: 4000, leads: 2400, conversion: 24 },
  { name: 'Feb', sales: 3000, leads: 1398, conversion: 22 },
  { name: 'Mar', sales: 2000, leads: 9800, conversion: 29 },
  { name: 'Apr', sales: 2780, leads: 3908, conversion: 25 },
  { name: 'May', sales: 1890, leads: 4800, conversion: 18 },
  { name: 'Jun', sales: 2390, leads: 3800, conversion: 23 },
  { name: 'Jul', sales: 3490, leads: 4300, conversion: 27 },
]

const pipelineData = [
  { name: 'Prospecting', value: 400, color: '#8884D8' },
  { name: 'Qualification', value: 300, color: '#82CA9D' },
  { name: 'Proposal', value: 200, color: '#FFC658' },
  { name: 'Negotiation', value: 150, color: '#FF7C7C' },
  { name: 'Closed Won', value: 100, color: '#8DD1E1' },
]

export function SalesMetrics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Performance</CardTitle>
          <CardDescription>
            Sales trends and lead conversion over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="leads" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
          <CardDescription>
            Distribution of opportunities by stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
              <PieChart>
              <Pie
                data={pipelineData}
                cx="50%"
                cy="50%"
                labelLine={false}
                // @ts-expect-error - Recharts label function has complex typing
                label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pipelineData.map((entry: PipelineDataItem, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
