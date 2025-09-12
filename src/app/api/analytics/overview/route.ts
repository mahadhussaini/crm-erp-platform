import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current date and dates for comparison
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Parallel queries for analytics data
    const [
      totalRevenue,
      lastMonthRevenue,
      totalCustomers,
      lastMonthCustomers,
      totalOrders,
      lastMonthOrders,
      totalLeads,
      convertedLeads
    ] = await Promise.all([
      // Current month revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: { in: ['DELIVERED', 'PROCESSING'] }
        },
        _sum: { total: true }
      }),
      
      // Last month revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: { in: ['DELIVERED', 'PROCESSING'] }
        },
        _sum: { total: true }
      }),
      
      // Current month customers
      prisma.customer.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),
      
      // Last month customers
      prisma.customer.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
        }
      }),
      
      // Current month orders
      prisma.order.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),
      
      // Last month orders
      prisma.order.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
        }
      }),
      
      // Total leads this month
      prisma.lead.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),
      
      // Converted leads this month
      prisma.lead.count({
        where: {
          createdAt: { gte: startOfMonth },
          status: 'CONVERTED'
        }
      })
    ])

    // Calculate percentage changes
    const revenueGrowth = lastMonthRevenue._sum.total 
      ? ((totalRevenue._sum.total || 0) - (lastMonthRevenue._sum.total || 0)) / (lastMonthRevenue._sum.total || 1) * 100
      : 0

    const customerGrowth = lastMonthCustomers 
      ? (totalCustomers - lastMonthCustomers) / lastMonthCustomers * 100
      : 0

    const orderGrowth = lastMonthOrders 
      ? (totalOrders - lastMonthOrders) / lastMonthOrders * 100
      : 0

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

    return NextResponse.json({
      revenue: {
        total: totalRevenue._sum.total || 0,
        growth: revenueGrowth
      },
      customers: {
        total: totalCustomers,
        growth: customerGrowth
      },
      orders: {
        total: totalOrders,
        growth: orderGrowth
      },
      conversionRate: {
        rate: conversionRate,
        total: totalLeads,
        converted: convertedLeads
      }
    })

  } catch (error) {
    console.error('Analytics overview error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
