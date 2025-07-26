import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ectkqadvtaywrodmqkuze.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
      return res.status(500).json({ 
        error: 'Missing Supabase configuration',
        timestamp: new Date().toISOString()
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (req.method) {
      case 'GET':
        try {
          // ดึงออเดอร์จาก Supabase
          const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Supabase error:', error);
            return res.status(200).json([]);
          }

          return res.status(200).json(orders || []);
        } catch (error) {
          console.error('Error fetching orders:', error);
          return res.status(200).json([]);
        }

      case 'POST':
        try {
          const orderData = req.body;
          
          // เพิ่มข้อมูลออเดอร์ลง Supabase
          const { data, error } = await supabase
            .from('orders')
            .insert({
              order_id: orderData.id || Date.now().toString(),
              customer_name: orderData.customerName || 'ลูกค้า',
              items: orderData.items || [],
              total: orderData.total || 0,
              status: orderData.status || 'pending',
              order_type: orderData.type || 'dine-in',
              table_number: orderData.tableNumber || null,
              notes: orderData.notes || '',
              payment_method: orderData.paymentMethod || 'cash'
            })
            .select()
            .single();

          if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ 
              error: 'Failed to save order',
              details: error.message,
              timestamp: new Date().toISOString()
            });
          }

          return res.status(200).json({ 
            success: true, 
            orderId: data.order_id,
            id: data.id,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error saving order:', error);
          return res.status(500).json({ 
            error: 'Failed to save order',
            details: error.message,
            timestamp: new Date().toISOString()
          });
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
