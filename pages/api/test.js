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
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Environment check:');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Has Supabase Key:', !!supabaseKey);
    console.log('Key length:', supabaseKey ? supabaseKey.length : 0);
    
    if (!supabaseKey) {
      return res.status(500).json({ 
        error: 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable',
        timestamp: new Date().toISOString(),
        url: supabaseUrl,
        hasKey: false
      });
    }

    // Test Supabase connection
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to fetch from menu_items table
    const { data, error } = await supabase
      .from('menu_items')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: 'Supabase connection failed',
        details: error.message,
        timestamp: new Date().toISOString(),
        supabaseUrl,
        hasKey: true
      });
    }

    return res.status(200).json({ 
      message: 'API and Supabase working! 🎉',
      timestamp: new Date().toISOString(),
      method: req.method,
      environment: process.env.NODE_ENV,
      supabaseConnected: true,
      supabaseUrl,
      hasKey: true,
      menuItemsTable: 'accessible'
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'API Error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
