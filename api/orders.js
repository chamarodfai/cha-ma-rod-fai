import { getOrders, saveOrder } from '../src/lib/prisma.js'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { items, total } = req.body;
      
      const order = await saveOrder({
        items,
        total,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
      });
      
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  } else if (req.method === 'GET') {
    try {
      const orders = await getOrders();
      res.status(200).json(orders.slice(0, 50)); // แสดง 50 รายการล่าสุด
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
