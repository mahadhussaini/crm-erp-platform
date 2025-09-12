import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6months'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    let groupBy: string

    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        groupBy = 'day'
        break
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        groupBy = 'day'
        break
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        groupBy = 'month'
        break
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
        groupBy = 'month'
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        groupBy = 'month'
    }

    // Get sales data grouped by time period
    const salesData = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['DELIVERED', 'PROCESSING', 'SHIPPED'] }
      },
      select: {
        total: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get leads data for the same period
    const leadsData = await prisma.lead.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        status: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group data by time period
    const groupedData = new Map<string, {
      period: string
      sales: number
      leads: number
      conversions: number
    }>()

    // Process sales data
    salesData.forEach((order: { total: number; createdAt: Date }) => {
      const key = groupBy === 'day'
        ? order.createdAt.toISOString().split('T')[0]
        : `${order.createdAt.getFullYear()}-${(order.createdAt.getMonth() + 1).toString().padStart(2, '0')}`

      if (!groupedData.has(key)) {
        groupedData.set(key, {
          period: key,
          sales: 0,
          leads: 0,
          conversions: 0
        })
      }

      const existing = groupedData.get(key)!
      existing.sales += order.total
    })

    // Process leads data
    leadsData.forEach((lead: { createdAt: Date; status: string }) => {
      const key = groupBy === 'day'
        ? lead.createdAt.toISOString().split('T')[0]
        : `${lead.createdAt.getFullYear()}-${(lead.createdAt.getMonth() + 1).toString().padStart(2, '0')}`

      if (!groupedData.has(key)) {
        groupedData.set(key, {
          period: key,
          sales: 0,
          leads: 0,
          conversions: 0
        })
      }

      const existing = groupedData.get(key)!
      existing.leads += 1
      if (lead.status === 'CONVERTED') {
        existing.conversions += 1
      }
    })

    // Convert to array and sort
    const result = Array.from(groupedData.values()).sort((a, b) => 
      a.period.localeCompare(b.period)
    )

    // Format period names for display
    const formattedResult = result.map(item => ({
      ...item,
      name: groupBy === 'day' 
        ? new Date(item.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : new Date(item.period + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      conversionRate: item.leads > 0 ? (item.conversions / item.leads) * 100 : 0
    }))

    return NextResponse.json({
      data: formattedResult,
      period,
      totalSales: formattedResult.reduce((sum, item) => sum + item.sales, 0),
      totalLeads: formattedResult.reduce((sum, item) => sum + item.leads, 0),
      totalConversions: formattedResult.reduce((sum, item) => sum + item.conversions, 0)
    })

  } catch (error) {
    console.error('Sales trends error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales trends' },
      { status: 500 }
    )
  }
}
