import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ectkqadvatwrodmqkuze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2YXR3cm9kbXFrdXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTI1MDMsImV4cCI6MjA2OTEyODUwM30.vpKbaq98KYcMU_1s_co3oLLcjRvL010KYOrvf2JnpoE';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`Analytics API called with method: ${req.method}, query:`, req.query);

  try {
    const { period = 'daily' } = req.query;

    if (req.method === 'GET') {
      
      if (period === 'daily') {
        // Get daily sales data from orders
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (ordersError) {
          console.error('Error fetching orders for daily analytics:', ordersError);
          throw ordersError;
        }

        // Process orders to create daily analytics
        const dailyData = [];
        const dailyMap = {};

        orders?.forEach(order => {
          const orderDate = new Date(order.created_at);
          const dateKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD
          
          if (!dailyMap[dateKey]) {
            dailyMap[dateKey] = {
              date: dateKey,
              orders_count: 0,
              total_revenue: 0,
              total_profit: 0,
              items_sold: 0
            };
          }
          
          dailyMap[dateKey].orders_count += 1;
          dailyMap[dateKey].total_revenue += parseFloat(order.final_total || order.total || 0);
          
          // Calculate profit (assuming 60% profit margin if cost not available)
          const profit = parseFloat(order.final_total || order.total || 0) * 0.6;
          dailyMap[dateKey].total_profit += profit;
          
          // Count items
          if (order.items) {
            try {
              const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              items.forEach(item => {
                dailyMap[dateKey].items_sold += item.quantity || 1;
              });
            } catch (e) {
              console.error('Error parsing order items:', e);
            }
          }
        });

        Object.values(dailyMap).forEach(day => dailyData.push(day));
        
        console.log(`Successfully processed daily analytics: ${dailyData.length} days`);
        return res.status(200).json({ daily: dailyData });
      }
      
      else if (period === 'items') {
        // Get item sales analytics
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (ordersError) {
          console.error('Error fetching orders for items analytics:', ordersError);
          throw ordersError;
        }

        const itemsData = [];
        const itemsMap = {};

        orders?.forEach(order => {
          const orderDate = new Date(order.created_at);
          const dateKey = orderDate.toISOString().split('T')[0];
          
          if (order.items) {
            try {
              const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              items.forEach(item => {
                const itemKey = `${dateKey}_${item.id || item.name}`;
                
                if (!itemsMap[itemKey]) {
                  itemsMap[itemKey] = {
                    date: dateKey,
                    item_id: item.id,
                    item_name: item.name,
                    quantity_sold: 0,
                    revenue: 0,
                    cost: 0,
                    profit: 0
                  };
                }
                
                itemsMap[itemKey].quantity_sold += item.quantity || 1;
                itemsMap[itemKey].revenue += (item.price || 0) * (item.quantity || 1);
                itemsMap[itemKey].cost += (item.cost || 0) * (item.quantity || 1);
                itemsMap[itemKey].profit = itemsMap[itemKey].revenue - itemsMap[itemKey].cost;
              });
            } catch (e) {
              console.error('Error parsing order items for analytics:', e);
            }
          }
        });

        Object.values(itemsMap).forEach(item => itemsData.push(item));
        
        console.log(`Successfully processed items analytics: ${itemsData.length} items`);
        return res.status(200).json({ items: itemsData });
      }
      
      else if (period === 'popular-items') {
        // Get popular items analytics
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (ordersError) {
          console.error('Error fetching orders for popular items:', ordersError);
          throw ordersError;
        }

        const popularItemsMap = {};
        let totalItemsSold = 0;

        orders?.forEach(order => {
          if (order.items) {
            try {
              const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              items.forEach(item => {
                const itemKey = item.id || item.name;
                
                if (!popularItemsMap[itemKey]) {
                  popularItemsMap[itemKey] = {
                    id: item.id,
                    name: item.name,
                    count: 0,
                    revenue: 0
                  };
                }
                
                popularItemsMap[itemKey].count += item.quantity || 1;
                popularItemsMap[itemKey].revenue += (item.price || 0) * (item.quantity || 1);
                totalItemsSold += item.quantity || 1;
              });
            } catch (e) {
              console.error('Error parsing order items for popular items:', e);
            }
          }
        });

        const popularItems = Object.values(popularItemsMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
          .map(item => ({
            ...item,
            percentage: totalItemsSold > 0 ? ((item.count / totalItemsSold) * 100).toFixed(1) : '0'
          }));
        
        console.log(`Successfully processed popular items: ${popularItems.length} items`);
        return res.status(200).json({ popularItems });
      }
      
      else {
        return res.status(400).json({ error: 'Invalid period parameter' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Analytics API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
