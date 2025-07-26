// pages/api/orders.js
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
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const ORDERS_FILE = 'orders.json';

    if (req.method === 'GET') {
      const { blobs } = await list({ 
        prefix: ORDERS_FILE,
        token: process.env.BLOB_READ_WRITE_TOKEN 
      });
      
      if (blobs.length === 0) {
        return res.status(200).json([]);
      }
      
      const blob = blobs[0];
      const response = await fetch(blob.url);
      const ordersData = await response.json();
      
      return res.status(200).json(ordersData);
    }

    if (req.method === 'POST') {
      const { items, total } = req.body;
      
      // Get current orders
      const { blobs } = await list({ 
        prefix: ORDERS_FILE,
        token: process.env.BLOB_READ_WRITE_TOKEN 
      });
      
      let currentOrders = [];
      if (blobs.length > 0) {
        const blob = blobs[0];
        const response = await fetch(blob.url);
        currentOrders = await response.json();
      }
      
      // Add new order
      const newOrder = {
        id: Date.now(),
        items: items,
        total: parseFloat(total),
        created_at: new Date().toISOString(),
        display_date: new Date().toLocaleDateString('th-TH'),
        display_time: new Date().toLocaleTimeString('th-TH')
      };
      
      currentOrders.unshift(newOrder);
      
      // Keep only last 50 orders
      if (currentOrders.length > 50) {
        currentOrders = currentOrders.slice(0, 50);
      }
      
      // Save back
      await put(ORDERS_FILE, JSON.stringify(currentOrders), {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      
      return res.status(201).json(newOrder);
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
