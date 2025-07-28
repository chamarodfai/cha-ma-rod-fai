import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://ectkqadvatwrodmqkuze.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2YXR3cm9kbXFrdXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTI1MDMsImV4cCI6MjA2OTEyODUwM30.vpKbaq98KYcMU_1s_co3oLLcjRvL010KYOrvf2JnpoE'

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { period = 'daily', startDate, endDate } = req.query

    switch (req.method) {
      case 'GET':
        // Get analytics data based on period
        let analyticsData = {}

        if (period === 'summary') {
          // Get overall summary
          const { data: summary, error: summaryError } = await supabase
            .from('analytics_summary')
            .select('*')
            .order('date', { ascending: false })
            .limit(30)

          if (summaryError) throw summaryError
          analyticsData.summary = summary || []

        } else if (period === 'daily') {
          // Get daily sales data
          const { data: dailySales, error: dailyError } = await supabase
            .from('daily_sales')
            .select('*')
            .order('date', { ascending: false })
            .limit(30)

          if (dailyError) throw dailyError
          analyticsData.daily = dailySales || []

        } else if (period === 'items') {
          // Get item sales analytics
          const { data: itemSales, error: itemError } = await supabase
            .from('item_sales_analytics')
            .select('*')
            .order('date', { ascending: false })
            .limit(100)

          if (itemError) throw itemError
          analyticsData.items = itemSales || []

        } else if (period === 'promotions') {
          // Get promotion analytics
          const { data: promoAnalytics, error: promoError } = await supabase
            .from('promotion_analytics')
            .select('*')
            .order('date', { ascending: false })
            .limit(50)

          if (promoError) throw promoError
          analyticsData.promotions = promoAnalytics || []

        } else if (period === 'popular-items') {
          // Get popular items (aggregated)
          const { data: popularItems, error: popularError } = await supabase
            .from('item_sales_analytics')
            .select(`
              item_name,
              SUM(quantity_sold) as total_quantity,
              SUM(revenue) as total_revenue,
              SUM(profit) as total_profit
            `)
            .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .group('item_name')
            .order('total_quantity', { ascending: false })
            .limit(10)

          if (popularError) throw popularError
          analyticsData.popularItems = popularItems || []

        } else {
          // Get comprehensive analytics
          const [dailySales, itemSales, promotionStats] = await Promise.all([
            supabase.from('daily_sales').select('*').order('date', { ascending: false }).limit(30),
            supabase.from('item_sales_analytics').select('*').order('date', { ascending: false }).limit(50),
            supabase.from('promotion_analytics').select('*').order('date', { ascending: false }).limit(20)
          ])

          analyticsData = {
            daily: dailySales.data || [],
            items: itemSales.data || [],
            promotions: promotionStats.data || []
          }
        }

        return res.status(200).json(analyticsData)

      case 'POST':
        // Manual analytics calculation (fallback if triggers don't work)
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })

        if (ordersError) throw ordersError

        // Process orders and update analytics tables
        const processedData = await processOrdersForAnalytics(orders)
        
        return res.status(200).json({ 
          message: 'Analytics updated successfully',
          processed: processedData 
        })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Analytics API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    })
  }
}

// Helper function to process orders for analytics
async function processOrdersForAnalytics(orders) {
  // Group orders by date
  const dailyStats = {}
  const itemStats = {}
  const promoStats = {}

  orders.forEach(order => {
    const date = order.created_at.split('T')[0]
    
    // Daily stats
    if (!dailyStats[date]) {
      dailyStats[date] = {
        total_orders: 0,
        total_revenue: 0,
        total_discount: 0
      }
    }
    
    dailyStats[date].total_orders += 1
    dailyStats[date].total_revenue += parseFloat(order.final_total || order.total || 0)
    dailyStats[date].total_discount += parseFloat(order.discount_amount || 0)

    // Item stats
    if (order.items) {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      items.forEach(item => {
        const key = `${date}-${item.name}`
        if (!itemStats[key]) {
          itemStats[key] = {
            date: date,
            item_name: item.name,
            quantity_sold: 0,
            revenue: 0
          }
        }
        itemStats[key].quantity_sold += parseInt(item.quantity || 1)
        itemStats[key].revenue += parseFloat(item.price || 0) * parseInt(item.quantity || 1)
      })
    }

    // Promotion stats
    if (order.promotion_id && order.promotion_name) {
      const key = `${date}-${order.promotion_id}`
      if (!promoStats[key]) {
        promoStats[key] = {
          date: date,
          promotion_id: order.promotion_id,
          promotion_name: order.promotion_name,
          usage_count: 0,
          total_discount: 0
        }
      }
      promoStats[key].usage_count += 1
      promoStats[key].total_discount += parseFloat(order.discount_amount || 0)
    }
  })

  return {
    dailyStats: Object.keys(dailyStats).length,
    itemStats: Object.keys(itemStats).length,
    promoStats: Object.keys(promoStats).length
  }
}
