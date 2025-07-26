import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
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
          // ไม่มีไฟล์ ส่งค่า array ว่าง
          res.status(200).json([]);
        } else {
          // ดึงข้อมูลจากไฟล์ที่มีอยู่
          const response = await fetch(blobs[0].url);
          const ordersData = await response.json();
          
          // เรียงลำดับตามวันที่ล่าสุด
          const sortedOrders = ordersData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          res.status(200).json(sortedOrders);
        }
      } catch (error) {
        console.error('Error reading orders from blob:', error);
        res.status(500).json({ error: 'ไม่สามารถอ่านข้อมูลออเดอร์ได้' });
      }
      
    } else if (req.method === 'POST') {
      // เพิ่มออเดอร์ใหม่
      const { order_id, total, items } = req.body;
      
      if (!order_id || !total || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'ข้อมูลออเดอร์ไม่ครบถ้วน' });
      }
      
      try {
        // อ่านข้อมูลออเดอร์ปัจจุบัน
        const { blobs } = await list({ prefix: ORDERS_FILE });
        let currentOrders = [];
        
        if (blobs.length > 0) {
          const response = await fetch(blobs[0].url);
          currentOrders = await response.json();
        }
        
        // ตรวจสอบว่า order_id ซ้ำหรือไม่
        const existingOrder = currentOrders.find(order => order.order_id === order_id);
        if (existingOrder) {
          return res.status(409).json({ error: 'หมายเลขออเดอร์ซ้ำ' });
        }
        
        // สร้างออเดอร์ใหม่
        const newOrder = {
          id: currentOrders.length + 1,
          order_id: parseInt(order_id),
          total: parseFloat(total),
          items: items,
          created_at: new Date().toISOString(),
          display_date: new Date().toLocaleDateString('th-TH'),
          display_time: new Date().toLocaleTimeString('th-TH')
        };
        
        currentOrders.push(newOrder);
        
        // บันทึกกลับไป Blob Storage
        await put(ORDERS_FILE, JSON.stringify(currentOrders), {
          access: 'public',
        });
        
        res.status(201).json(newOrder);
      } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({ error: 'ไม่สามารถบันทึกออเดอร์ได้' });
      }
      
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    
  } catch (error) {
    console.error('Blob Storage error:', error);
    res.status(500).json({ 
      error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ Blob Storage',
      details: error.message 
    });
  }
}
