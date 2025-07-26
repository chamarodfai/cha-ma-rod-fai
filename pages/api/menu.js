import { put, list } from '@vercel/blob';

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
    const MENU_FILE = 'menu.json';
    
    if (req.method === 'GET') {
      // ดึงข้อมูลเมนูจาก Blob Storage
      try {
        const { blobs } = await list({ prefix: MENU_FILE });
        
        if (blobs.length === 0) {
          // ไม่มีไฟล์ ให้สร้างเมนูเริ่มต้น
          const defaultMenu = [
            { id: 1, name: 'ชาไทยเย็น', price: 25, cost: 12, category: 'ชาเย็น', available: true },
            { id: 2, name: 'ชาไทยร้อน', price: 20, cost: 10, category: 'ชาร้อน', available: true },
            { id: 3, name: 'ชาเขียวเย็น', price: 25, cost: 13, category: 'ชาเย็น', available: true },
            { id: 4, name: 'ชาเขียวร้อน', price: 20, cost: 11, category: 'ชาร้อน', available: true },
            { id: 5, name: 'ชาดำเย็น', price: 20, cost: 8, category: 'ชาเย็น', available: true },
            { id: 6, name: 'ชาดำร้อน', price: 15, cost: 6, category: 'ชาร้อน', available: true },
            { id: 7, name: 'ชาไทยปั่น', price: 35, cost: 18, category: 'ชาปั่น', available: true },
            { id: 8, name: 'ชาเขียวปั่น', price: 35, cost: 19, category: 'ชาปั่น', available: true },
            { id: 9, name: 'กาแฟเย็น', price: 30, cost: 15, category: 'กาแฟ', available: true },
            { id: 10, name: 'กาแฟร้อน', price: 25, cost: 12, category: 'กาแฟ', available: true },
            { id: 11, name: 'โอเลี้ยง', price: 35, cost: 20, category: 'เครื่องดื่มพิเศษ', available: true },
            { id: 12, name: 'น้ำแดง', price: 15, cost: 5, category: 'เครื่องดื่มพิเศษ', available: true }
          ];
          
          // บันทึกเมนูเริ่มต้นลง Blob Storage
          await put(MENU_FILE, JSON.stringify(defaultMenu), {
            access: 'public',
          });
          
          res.status(200).json(defaultMenu);
        } else {
          // ดึงข้อมูลจากไฟล์ที่มีอยู่
          const response = await fetch(blobs[0].url);
          const menuData = await response.json();
          res.status(200).json(menuData);
        }
      } catch (error) {
        console.error('Error reading menu from blob:', error);
        res.status(500).json({ error: 'ไม่สามารถอ่านข้อมูลเมนูได้' });
      }
      
    } else if (req.method === 'POST') {
      // เพิ่มเมนูใหม่
      const { name, price, category, cost } = req.body;
      
      if (!name || !price || !category) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
      }
      
      try {
        // อ่านข้อมูลเมนูปัจจุบัน
        const { blobs } = await list({ prefix: MENU_FILE });
        let currentMenu = [];
        
        if (blobs.length > 0) {
          const response = await fetch(blobs[0].url);
          currentMenu = await response.json();
        }
        
        // สร้างเมนูใหม่
        const newMenuItem = {
          id: currentMenu.length > 0 ? Math.max(...currentMenu.map(item => item.id)) + 1 : 1,
          name: name.trim(),
          price: parseFloat(price),
          cost: cost ? parseFloat(cost) : parseFloat(price) * 0.5, // ถ้าไม่มี cost ให้ใช้ 50% ของราคา
          category: category.trim(),
          available: true
        };
        
        currentMenu.push(newMenuItem);
        
        // บันทึกกลับไป Blob Storage
        await put(MENU_FILE, JSON.stringify(currentMenu), {
          access: 'public',
        });
        
        res.status(201).json(newMenuItem);
      } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ error: 'ไม่สามารถเพิ่มเมนูได้' });
      }
      
    } else if (req.method === 'PUT') {
      // แก้ไขเมนู
      const { id, name, price, category, cost, available } = req.body;
      
      if (!id || !name || !price || !category) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
      }
      
      try {
        const { blobs } = await list({ prefix: MENU_FILE });
        
        if (blobs.length === 0) {
          return res.status(404).json({ error: 'ไม่พบข้อมูลเมนู' });
        }
        
        const response = await fetch(blobs[0].url);
        let currentMenu = await response.json();
        
        // หาและแก้ไขเมนู
        const menuIndex = currentMenu.findIndex(item => item.id === parseInt(id));
        if (menuIndex === -1) {
          return res.status(404).json({ error: 'ไม่พบเมนูที่ต้องการแก้ไข' });
        }
        
        currentMenu[menuIndex] = {
          id: parseInt(id),
          name: name.trim(),
          price: parseFloat(price),
          cost: cost ? parseFloat(cost) : currentMenu[menuIndex].cost || parseFloat(price) * 0.5,
          category: category.trim(),
          available: available !== undefined ? available : true
        };
        
        // บันทึกกลับไป Blob Storage
        await put(MENU_FILE, JSON.stringify(currentMenu), {
          access: 'public',
        });
        
        res.status(200).json(currentMenu[menuIndex]);
      } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'ไม่สามารถแก้ไขเมนูได้' });
      }
      
    } else if (req.method === 'DELETE') {
      // ลบเมนู
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'กรุณาระบุ ID ของเมนูที่ต้องการลบ' });
      }
      
      try {
        const { blobs } = await list({ prefix: MENU_FILE });
        
        if (blobs.length === 0) {
          return res.status(404).json({ error: 'ไม่พบข้อมูลเมนู' });
        }
        
        const response = await fetch(blobs[0].url);
        let currentMenu = await response.json();
        
        // หาและลบเมนู
        const menuIndex = currentMenu.findIndex(item => item.id === parseInt(id));
        if (menuIndex === -1) {
          return res.status(404).json({ error: 'ไม่พบเมนูที่ต้องการลบ' });
        }
        
        const deletedItem = currentMenu.splice(menuIndex, 1)[0];
        
        // บันทึกกลับไป Blob Storage
        await put(MENU_FILE, JSON.stringify(currentMenu), {
          access: 'public',
        });
        
        res.status(200).json({ message: 'ลบเมนูเรียบร้อยแล้ว', deletedItem });
      } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: 'ไม่สามารถลบเมนูได้' });
      }
      
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
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
