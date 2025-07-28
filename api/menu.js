import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ectkqadvtaywrodmqkuze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2dGF5d3JvZG1xa3V6ZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM3OTcxMzk4LCJleHAiOjIwNTM1NDczOTh9.YOJpUHaFbLaKsQiWpYgtGHnMY4x-Xf8WGnU2J6ZMtHs';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      console.log('Loading menu from Supabase...');
      
      // ดึงข้อมูลเมนูจาก Supabase
      const { data: menuItems, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Menu loaded successfully:', menuItems?.length, 'items');
      res.status(200).json(menuItems || []);
      return;
    }

    if (req.method === 'POST') {
      // เพิ่มเมนูใหม่
      const { name, price, cost, category, description } = req.body;

      if (!name || !price || !cost || !category) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const { data, error } = await supabase
        .from('menu_items')
        .insert([{
          name,
          price: parseFloat(price),
          cost: parseFloat(cost),
          category,
          description: description || '',
          is_available: true
        }])
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      res.status(201).json(data[0]);
      return;
    }

    if (req.method === 'DELETE') {
      // ลบเมนู
      const { id } = req.query;
      
      if (!id) {
        res.status(400).json({ error: 'Missing menu item ID' });
        return;
      }

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', parseInt(id));

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      res.status(200).json({ message: 'Menu item deleted successfully' });
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
