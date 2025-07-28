import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ectkqadvatwrodmqkuze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2YXR3cm9kbXFrdXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTI1MDMsImV4cCI6MjA2OTEyODUwM30.vpKbaq98KYcMU_1s_co3oLLcjRvL010KYOrvf2JnpoE';

// ใช้ environment variables เป็นหลัก แต่ fallback เป็น hardcoded values
const finalSupabaseUrl = process.env.SUPABASE_URL || supabaseUrl;
const finalSupabaseKey = process.env.SUPABASE_ANON_KEY || supabaseKey;

const supabase = createClient(finalSupabaseUrl, finalSupabaseKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`Orders API called with method: ${req.method}`);

  try {
    if (req.method === 'GET') {
      // Get all orders
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} orders`);
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      // Create new order
      console.log('Creating new order:', req.body);
      const { 
        order_id,
        items, 
        total, 
        customer_name, 
        discount_amount = 0, 
        final_total, 
        promotion_id, 
        promotion_name 
      } = req.body;
      
      if (!items || !total) {
        console.error('Missing required order fields');
        return res.status(400).json({ error: 'Missing required fields: items, total' });
      }

      const orderData = { 
        order_id: order_id,
        items: JSON.stringify(items), 
        total: parseFloat(total),
        discount_amount: parseFloat(discount_amount || 0),
        final_total: parseFloat(final_total || total),
        promotion_id: promotion_id || null,
        promotion_name: promotion_name || null,
        customer_name: customer_name || null,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) {
        console.error('Insert order error:', error);
        throw error;
      }

      // Update promotion usage count if promotion was used
      if (promotion_id) {
        await supabase
          .from('promotions')
          .update({ 
            usage_count: supabase.raw('usage_count + 1'),
            updated_at: new Date().toISOString()
          })
          .eq('id', promotion_id);
      }

      console.log('Successfully created order:', data);
      return res.status(201).json(data[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Orders API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
