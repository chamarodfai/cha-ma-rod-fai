// pages/api/menu.js
import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check environment
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Missing BLOB_READ_WRITE_TOKEN');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const MENU_FILE = 'menu-items.json';

    if (req.method === 'GET') {
      console.log('GET /api/menu called');
      
      const { blobs } = await list({ 
        prefix: MENU_FILE,
        token: process.env.BLOB_READ_WRITE_TOKEN 
      });
      
      if (blobs.length === 0) {
        console.log('No menu file found, creating default');
        
        const defaultMenu = [
          { id: 1, name: 'ชาไทยเย็น', price: 25, cost: 12, category: 'ชาเย็น' },
          { id: 2, name: 'ชาไทยร้อน', price: 20, cost: 10, category: 'ชาร้อน' },
          { id: 3, name: 'ชาเขียวเย็น', price: 25, cost: 13, category: 'ชาเย็น' },
          { id: 4, name: 'กาแฟเย็น', price: 30, cost: 15, category: 'กาแฟ' }
        ];
        
        await put(MENU_FILE, JSON.stringify(defaultMenu), {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        
        console.log('Default menu created');
        return res.status(200).json(defaultMenu);
      }
      
      console.log('Fetching existing menu');
      const blob = blobs[0];
      const response = await fetch(blob.url);
      const menuData = await response.json();
      
      return res.status(200).json(menuData);
    }

    if (req.method === 'POST') {
      console.log('POST /api/menu called');
      const { name, price, cost, category } = req.body;
      
      // Get current menu
      const { blobs } = await list({ 
        prefix: MENU_FILE,
        token: process.env.BLOB_READ_WRITE_TOKEN 
      });
      
      let currentMenu = [];
      if (blobs.length > 0) {
        const blob = blobs[0];
        const response = await fetch(blob.url);
        currentMenu = await response.json();
      }
      
      // Add new item
      const newItem = {
        id: Date.now(),
        name,
        price: parseFloat(price),
        cost: parseFloat(cost),
        category,
        created_at: new Date().toISOString()
      };
      
      currentMenu.push(newItem);
      
      // Save back
      await put(MENU_FILE, JSON.stringify(currentMenu), {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      
      return res.status(201).json(newItem);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Menu API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
