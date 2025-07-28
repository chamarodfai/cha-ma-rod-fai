import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ectkqadvtaywrodmqkuze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2dGF5d3JvZG1xa3V6ZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM3OTcxMzk4LCJleHAiOjIwNTM1NDczOTh9.YOJpUHaFbLaKsQiWpYgtGHnMY4x-Xf8WGnU2J6ZMtHs';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // ดึงข้อมูลออเดอร์จาก Supabase
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      res.status(200).json(orders || []);
      return;
    }

    if (req.method === 'POST') {
      // บันทึกออเดอร์ใหม่
      const orderData = req.body;

      if (!orderData.order_id || !orderData.items || !orderData.total) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          order_id: orderData.order_id,
          customer_name: orderData.customer_name || 'ลูกค้า',
          items: orderData.items,
          total: parseFloat(orderData.total),
          status: orderData.status || 'pending',
          order_type: orderData.order_type || 'dine-in',
          table_number: orderData.table_number || null,
          notes: orderData.notes || '',
          payment_method: orderData.payment_method || 'cash'
        }])
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      res.status(201).json(data[0]);
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
