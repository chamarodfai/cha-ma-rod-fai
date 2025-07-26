import express from 'express';
import cors from 'cors';
import { put, list } from '@vercel/blob';

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

// Test API
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    method: req.method 
  });
});

// Menu API
app.get('/api/menu', async (req, res) => {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'Missing BLOB_READ_WRITE_TOKEN' });
    }

    const MENU_FILE = 'menu-items.json';
    const { blobs } = await list({ 
      prefix: MENU_FILE,
      token: process.env.BLOB_READ_WRITE_TOKEN 
    });
    
    if (blobs.length === 0) {
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
      
      return res.json(defaultMenu);
    }
    
    const blob = blobs[0];
    const response = await fetch(blob.url);
    const menuData = await response.json();
    
    res.json(menuData);
  } catch (error) {
    console.error('Menu API Error:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Orders API
app.get('/api/orders', async (req, res) => {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'Missing BLOB_READ_WRITE_TOKEN' });
    }

    const ORDERS_FILE = 'orders.json';
    const { blobs } = await list({ 
      prefix: ORDERS_FILE,
      token: process.env.BLOB_READ_WRITE_TOKEN 
    });
    
    if (blobs.length === 0) {
      return res.json([]);
    }
    
    const blob = blobs[0];
    const response = await fetch(blob.url);
    const ordersData = await response.json();
    
    res.json(ordersData);
  } catch (error) {
    console.error('Orders API Error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.listen(port, () => {
  console.log(`API Server running at http://localhost:${port}`);
});
