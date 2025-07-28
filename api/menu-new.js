const { put, list, del } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    const MENU_FILE = 'menu-items.json';
    
    if (req.method === 'GET') {
      // ดึงข้อมูลเมนูจาก Blob Storage
      try {
        const { blobs } = await list({ prefix: MENU_FILE });
        
        if (blobs.length === 0) {
          // ไม่มีไฟล์ เริ่มต้นด้วยเมนูเริ่มต้น
          const defaultMenu = [
            { id: 1, name: 'ชาไทยเย็น', price: 25, cost: 12, category: 'ชาเย็น' },
            { id: 2, name: 'ชาไทยร้อน', price: 20, cost: 10, category: 'ชาร้อน' },
            { id: 3, name: 'ชาเขียวเย็น', price: 25, cost: 13, category: 'ชาเย็น' },
            { id: 4, name: 'ชาเขียวร้อน', price: 20, cost: 11, category: 'ชาร้อน' },
            { id: 5, name: 'ชาดำเย็น', price: 20, cost: 8, category: 'ชาเย็น' },
            { id: 6, name: 'ชาดำร้อน', price: 15, cost: 6, category: 'ชาร้อน' },
            { id: 7, name: 'ชาไทยปั่น', price: 35, cost: 18, category: 'ชาปั่น' },
            { id: 8, name: 'ชาเขียวปั่น', price: 35, cost: 19, category: 'ชาปั่น' },
            { id: 9, name: 'กาแฟเย็น', price: 30, cost: 15, category: 'กาแฟ' },
            { id: 10, name: 'กาแฟร้อน', price: 25, cost: 12, category: 'กาแฟ' },
            { id: 11, name: 'โอเลี้ยง', price: 35, cost: 20, category: 'เครื่องดื่มพิเศษ' },
            { id: 12, name: 'น้ำแดง', price: 15, cost: 5, category: 'เครื่องดื่มพิเศษ' }
          ];
          
          // บันทึกเมนูเริ่มต้นลง Blob Storage
          await put(MENU_FILE, JSON.stringify(defaultMenu), {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN
          });
          
          return res.status(200).json(defaultMenu);
        }
        
        // ดึงข้อมูลจากไฟล์ที่มีอยู่
        const blob = blobs[0];
        const response = await fetch(blob.url);
        const menuData = await response.json();
        
        return res.status(200).json(menuData);
        
      } catch (error) {
        console.error('Error fetching menu from Blob Storage:', error);
        return res.status(500).json({ error: 'Failed to fetch menu data' });
      }
    }
    
    else if (req.method === 'POST') {
      // เพิ่มเมนูใหม่
      const { name, price, cost, category } = req.body;
      
      if (!name || !price || !cost || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      try {
        // ดึงข้อมูลเมนูปัจจุบัน
        const { blobs } = await list({ prefix: MENU_FILE });
        let currentMenu = [];
        
        if (blobs.length > 0) {
          const blob = blobs[0];
          const response = await fetch(blob.url);
          currentMenu = await response.json();
        }
        
        // สร้าง ID ใหม่
        const newId = currentMenu.length > 0 ? Math.max(...currentMenu.map(item => item.id)) + 1 : 1;
        
        // เพิ่มเมนูใหม่
        const newMenuItem = {
          id: newId,
          name,
          price: parseFloat(price),
          cost: parseFloat(cost),
          category,
          available: true,
          created_at: new Date().toISOString()
        };
        
        currentMenu.push(newMenuItem);
        
        // บันทึกกลับลง Blob Storage
        await put(MENU_FILE, JSON.stringify(currentMenu), {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        
        return res.status(201).json(newMenuItem);
        
      } catch (error) {
        console.error('Error adding menu item:', error);
        return res.status(500).json({ error: 'Failed to add menu item' });
      }
    }
    
    else if (req.method === 'PUT') {
      // อัพเดทเมนู
      const { id, name, price, cost, category } = req.body;
      
      if (!id || !name || !price || !cost || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      try {
        // ดึงข้อมูลเมนูปัจจุบัน
        const { blobs } = await list({ prefix: MENU_FILE });
        
        if (blobs.length === 0) {
          return res.status(404).json({ error: 'Menu not found' });
        }
        
        const blob = blobs[0];
        const response = await fetch(blob.url);
        let currentMenu = await response.json();
        
        // หาและอัพเดทเมนู
        const itemIndex = currentMenu.findIndex(item => item.id === parseInt(id));
        
        if (itemIndex === -1) {
          return res.status(404).json({ error: 'Menu item not found' });
        }
        
        currentMenu[itemIndex] = {
          ...currentMenu[itemIndex],
          name,
          price: parseFloat(price),
          cost: parseFloat(cost),
          category,
          updated_at: new Date().toISOString()
        };
        
        // บันทึกกลับลง Blob Storage
        await put(MENU_FILE, JSON.stringify(currentMenu), {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        
        return res.status(200).json(currentMenu[itemIndex]);
        
      } catch (error) {
        console.error('Error updating menu item:', error);
        return res.status(500).json({ error: 'Failed to update menu item' });
      }
    }
    
    else if (req.method === 'DELETE') {
      // ลบเมนู
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Missing item ID' });
      }
      
      try {
        // ดึงข้อมูลเมนูปัจจุบัน
        const { blobs } = await list({ prefix: MENU_FILE });
        
        if (blobs.length === 0) {
          return res.status(404).json({ error: 'Menu not found' });
        }
        
        const blob = blobs[0];
        const response = await fetch(blob.url);
        let currentMenu = await response.json();
        
        // ลบเมนู
        const filteredMenu = currentMenu.filter(item => item.id !== parseInt(id));
        
        if (filteredMenu.length === currentMenu.length) {
          return res.status(404).json({ error: 'Menu item not found' });
        }
        
        // บันทึกกลับลง Blob Storage
        await put(MENU_FILE, JSON.stringify(filteredMenu), {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        
        return res.status(200).json({ message: 'Menu item deleted successfully' });
        
      } catch (error) {
        console.error('Error deleting menu item:', error);
        return res.status(500).json({ error: 'Failed to delete menu item' });
      }
    }
    
    else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
