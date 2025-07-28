import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`API /menu called with method: ${req.method}`);
  console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('Supabase Key:', supabaseKey ? 'Set' : 'Missing');

  try {
    if (req.method === 'GET') {
      console.log('Fetching menu items from Supabase...');
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} menu items`);
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      console.log('Adding new menu item:', req.body);
      const { name, price, cost, category } = req.body;
      
      if (!name || !price || !category) {
        console.error('Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('menu_items')
        .insert([{ name, price: parseFloat(price), cost: cost ? parseFloat(cost) : null, category }])
        .select();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Successfully added menu item:', data);
      return res.status(201).json(data[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
