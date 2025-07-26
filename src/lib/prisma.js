// Simple storage solution for Vercel
const menuItems = [
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

let orders = [];

// Helper functions สำหรับจัดการข้อมูล
export async function getMenuItems() {
  try {
    return menuItems;
  } catch (error) {
    console.error('Error getting menu items:', error);
    return menuItems;
  }
}

export async function saveMenuItems(items) {
  try {
    // For now, just return the items (in real app, save to blob storage)
    return { success: true };
  } catch (error) {
    console.error('Error saving menu items:', error);
    throw error;
  }
}

export async function getOrders() {
  try {
    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
}

export async function saveOrder(order) {
  try {
    const newOrder = {
      ...order,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'completed'
    };
    
    orders.unshift(newOrder);
    
    // Keep only last 100 orders
    if (orders.length > 100) {
      orders = orders.slice(0, 100);
    }
    
    return newOrder;
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}
