import { put, list, del } from '@vercel/blob';

// ข้อมูลเริ่มต้นของเมนู
const defaultMenuItems = [
  { id: 1, name: 'ชาไทยเย็น', price: 25, category: 'ชาเย็น' },
  { id: 2, name: 'ชาไทยร้อน', price: 20, category: 'ชาร้อน' },
  { id: 3, name: 'ชาเขียวเย็น', price: 25, category: 'ชาเย็น' },
  { id: 4, name: 'ชาเขียวร้อน', price: 20, category: 'ชาร้อน' },
  { id: 5, name: 'ชาดำเย็น', price: 20, category: 'ชาเย็น' },
  { id: 6, name: 'ชาดำร้อน', price: 15, category: 'ชาร้อน' },
  { id: 7, name: 'ชาไทยปั่น', price: 35, category: 'ชาปั่น' },
  { id: 8, name: 'ชาเขียวปั่น', price: 35, category: 'ชาปั่น' },
  { id: 9, name: 'กาแฟเย็น', price: 30, category: 'กาแฟ' },
  { id: 10, name: 'กาแฟร้อน', price: 25, category: 'กาแฟ' },
  { id: 11, name: 'โอเลี้ยง', price: 35, category: 'เครื่องดื่มพิเศษ' },
  { id: 12, name: 'น้ำแดง', price: 15, category: 'เครื่องดื่มพิเศษ' }
];

// Helper functions สำหรับจัดการข้อมูล
export async function getMenuItems() {
  try {
    const { blobs } = await list({ prefix: 'menu-items.json' });
    if (blobs.length === 0) {
      // ถ้าไม่มีไฟล์ ให้สร้างข้อมูลเริ่มต้น
      await saveMenuItems(defaultMenuItems);
      return defaultMenuItems;
    }
    
    const response = await fetch(blobs[0].url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting menu items:', error);
    return defaultMenuItems;
  }
}

export async function saveMenuItems(items) {
  try {
    const blob = await put('menu-items.json', JSON.stringify(items), {
      access: 'public',
      contentType: 'application/json'
    });
    return blob;
  } catch (error) {
    console.error('Error saving menu items:', error);
    throw error;
  }
}

export async function getOrders() {
  try {
    const { blobs } = await list({ prefix: 'orders.json' });
    if (blobs.length === 0) {
      return [];
    }
    
    const response = await fetch(blobs[0].url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
}

export async function saveOrder(order) {
  try {
    // ดึงออเดอร์เก่า
    const existingOrders = await getOrders();
    
    // เพิ่มออเดอร์ใหม่
    const newOrder = {
      ...order,
      id: Date.now(), // ใช้ timestamp เป็น ID
      createdAt: new Date().toISOString(),
      status: 'completed'
    };
    
    const updatedOrders = [newOrder, ...existingOrders];
    
    // บันทึกกลับไป
    const blob = await put('orders.json', JSON.stringify(updatedOrders), {
      access: 'public',
      contentType: 'application/json'
    });
    
    return newOrder;
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}
