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
      console.log('Creating new order with request body:', JSON.stringify(req.body, null, 2));
      
      const { 
        order_id,
        items, 
        total, 
        customer_name = 'ลูกค้า', // ค่าเริ่มต้น
        discount_amount = 0, 
        final_total, 
        promotion_id, 
        promotion_name,
        status = 'completed',
        order_type = 'dine-in',
        payment_method = 'cash'
      } = req.body;
      
      console.log('Extracted fields:', {
        order_id,
        items: items?.length || 0,
        total,
        customer_name,
        discount_amount,
        final_total
      });
      
      if (!items || items.length === 0) {
        console.error('Missing or empty items array');
        return res.status(400).json({ error: 'Missing or empty items array' });
      }
      
      if (!total && total !== 0) {
        console.error('Missing total amount');
        return res.status(400).json({ error: 'Missing total amount' });
      }

      const orderData = { 
        order_id: order_id || `ORD-${Date.now()}`,
        items: items, // ส่ง array โดยตรง ไม่ต้อง JSON.stringify
        total: parseFloat(total),
        discount_amount: parseFloat(discount_amount || 0),
        final_total: parseFloat(final_total || total),
        promotion_id: promotion_id || null,
        promotion_name: promotion_name || null,
        customer_name: customer_name,
        status: status,
        order_type: order_type,
        payment_method: payment_method,
        created_at: new Date().toISOString()
      }
      
      console.log('Prepared order data for Supabase:', JSON.stringify(orderData, null, 2));

      console.log('Prepared order data for Supabase:', JSON.stringify(orderData, null, 2));

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) {
        console.error('Supabase insert error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // ส่งข้อมูล error ที่ละเอียดกลับไป
        return res.status(400).json({ 
          error: 'Failed to create order',
          supabase_error: error.message,
          details: error.details,
          hint: error.hint
        });
      }

      console.log('Successfully created order in Supabase:', data);

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
