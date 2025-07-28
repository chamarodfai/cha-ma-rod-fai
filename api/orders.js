import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

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
      const { items, total, customer_name } = req.body;
      
      if (!items || !total) {
        console.error('Missing required order fields');
        return res.status(400).json({ error: 'Missing required fields: items, total' });
      }

      const { data, error } = await supabase
        .from('orders')
        .insert([{ 
          items: JSON.stringify(items), 
          total: parseFloat(total),
          customer_name: customer_name || null,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('Insert order error:', error);
        throw error;
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
