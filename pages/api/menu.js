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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mut17cdzoqscasrb.supabase.co';
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
          // ดึงเมนูจาก Supabase
          const { data: menu, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Supabase error:', error);
            return res.status(200).json([]);
          }

          return res.status(200).json(menu || []);
        } catch (error) {
          console.error('Error fetching menu:', error);
          return res.status(200).json([]);
        }

      case 'POST':
        try {
          const menuItems = req.body;
          
          if (!Array.isArray(menuItems)) {
            return res.status(400).json({ 
              error: 'Menu data must be an array',
              timestamp: new Date().toISOString()
            });
          }

          // ลบเมนูเก่าทั้งหมดก่อน (optional - หรือจะใช้ upsert)
          await supabase.from('menu_items').delete().neq('id', 0);

          // เพิ่มเมนูใหม่
          const { data, error } = await supabase
            .from('menu_items')
            .insert(menuItems.map(item => ({
              name: item.name,
              price: item.price,
              category: item.category || 'general',
              description: item.description || '',
              image_url: item.image || null,
              is_available: item.available !== false
            })))
            .select();

          if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ 
              error: 'Failed to save menu',
              details: error.message,
              timestamp: new Date().toISOString()
            });
          }

          return res.status(200).json({ 
            success: true, 
            count: data?.length || 0,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error saving menu:', error);
          return res.status(500).json({ 
            error: 'Failed to save menu',
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
