import { getMenuItems, saveMenuItems } from '../src/lib/prisma.js'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const menuItems = await getMenuItems();
      res.status(200).json(menuItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      res.status(500).json({ error: 'Failed to fetch menu items' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, price, category } = req.body;
      const menuItems = await getMenuItems();
      
      const newItem = {
        id: Math.max(...menuItems.map(item => item.id), 0) + 1,
        name,
        price: parseFloat(price),
        category
      };
      
      const updatedItems = [...menuItems, newItem];
      await saveMenuItems(updatedItems);
      
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating menu item:', error);
      res.status(500).json({ error: 'Failed to create menu item' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
