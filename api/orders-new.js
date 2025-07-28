const { put, list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ตรวจสอบ environment variable
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Missing BLOB_READ_WRITE_TOKEN environment variable');
    return res.status(500).json({ 
      error: 'Server configuration error: Missing Blob Storage token',
      details: 'BLOB_READ_WRITE_TOKEN not configured'
    });
  }

  try {
    const ORDERS_FILE = 'orders.json';
    
    if (req.method === 'GET') {
      // ดึงข้อมูลออเดอร์จาก Blob Storage
      try {
        const { blobs } = await list({ prefix: ORDERS_FILE });
        
        if (blobs.length === 0) {
          return res.status(200).json([]);
        }
        
        const blob = blobs[0];
        const response = await fetch(blob.url);
        const ordersData = await response.json();
        
        return res.status(200).json(ordersData);
        
      } catch (error) {
        console.error('Error fetching orders from Blob Storage:', error);
        return res.status(500).json({ error: 'Failed to fetch orders data' });
      }
    }
    
    else if (req.method === 'POST') {
      // เพิ่มออเดอร์ใหม่
      const { items, total, customer_name } = req.body;
      
      if (!items || !total) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      try {
        // ดึงข้อมูลออเดอร์ปัจจุบัน
        const { blobs } = await list({ prefix: ORDERS_FILE });
        let currentOrders = [];
        
        if (blobs.length > 0) {
          const blob = blobs[0];
          const response = await fetch(blob.url);
          currentOrders = await response.json();
        }
        
        // สร้าง Order ID ใหม่
        const newOrderId = Date.now();
        const currentDate = new Date();
        
        // สร้างออเดอร์ใหม่
        const newOrder = {
          id: newOrderId,
          order_id: newOrderId,
          items: items,
          total: parseFloat(total),
          customer_name: customer_name || 'ลูกค้าทั่วไป',
          status: 'completed',
          created_at: currentDate.toISOString(),
          display_date: currentDate.toLocaleDateString('th-TH'),
          display_time: currentDate.toLocaleTimeString('th-TH')
        };
        
        currentOrders.unshift(newOrder); // เพิ่มที่ด้านบน
        
        // เก็บแค่ 100 ออเดอร์ล่าสุด
        if (currentOrders.length > 100) {
          currentOrders = currentOrders.slice(0, 100);
        }
        
        // บันทึกกลับลง Blob Storage
        await put(ORDERS_FILE, JSON.stringify(currentOrders), {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        
        return res.status(201).json(newOrder);
        
      } catch (error) {
        console.error('Error adding order:', error);
        return res.status(500).json({ error: 'Failed to add order' });
      }
    }
    
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Orders API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
