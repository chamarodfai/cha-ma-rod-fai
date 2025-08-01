import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ectkqadvatwrodmqkuze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2YXR3cm9kbXFrdXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTI1MDMsImV4cCI6MjA2OTEyODUwM30.vpKbaq98KYcMU_1s_co3oLLcjRvL010KYOrvf2JnpoE';

// ใช้ environment variables เป็นหลัก แต่ fallback เป็น hardcoded values
const finalSupabaseUrl = process.env.SUPABASE_URL || supabaseUrl;
const finalSupabaseKey = process.env.SUPABASE_ANON_KEY || supabaseKey;

console.log('Supabase URL:', finalSupabaseUrl);
console.log('Supabase Key exists:', !!finalSupabaseKey);

const supabase = createClient(finalSupabaseUrl, finalSupabaseKey);

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
