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

  console.log('Test API called');
  
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('menu_items')
      .select('count(*)')
      .single();
    
    if (error) {
      console.error('Database test error:', error);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: error.message 
      });
    }
    
    return res.status(200).json({ 
      message: 'API is working!',
      database: 'Connected',
      itemCount: data.count || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test API Error:', error);
    return res.status(500).json({ 
      error: 'Test failed',
      details: error.message 
    });
  }
}
