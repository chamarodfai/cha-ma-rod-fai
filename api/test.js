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

  console.log('Test API called');
  
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('menu_items')
      .select('id')
      .limit(1);
    
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
      itemCount: data?.length || 0,
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
