export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Test data - ข้อมูลจำลองจาก Supabase
    const testMenuData = [
      { id: 1, name: 'ชาไทยเย็น', price: 25, cost: 15, category: 'เครื่องดื่ม' },
      { id: 2, name: 'ชาเขียวเย็น', price: 25, cost: 15, category: 'เครื่องดื่ม' },
      { id: 3, name: 'ชาดำเย็น', price: 20, cost: 12, category: 'เครื่องดื่ม' },
      { id: 4, name: 'กาแฟเย็น', price: 30, cost: 18, category: 'เครื่องดื่ม' },
      { id: 5, name: 'โกโก้เย็น', price: 30, cost: 18, category: 'เครื่องดื่ม' },
      { id: 6, name: 'เพิ่มไข่มุก', price: 10, cost: 5, category: 'Topping' },
      { id: 7, name: 'เพิ่มวุ้นกะทิ', price: 10, cost: 5, category: 'Topping' },
      { id: 8, name: 'เพิ่มชาไทย', price: 15, cost: 8, category: 'Topping' }
    ];

    if (req.method === 'GET') {
      console.log('Menu API: Returning test data');
      return res.status(200).json(testMenuData);
    }

    if (req.method === 'POST') {
      const { name, price, cost, category } = req.body;
      
      if (!name || !price || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newItem = {
        id: testMenuData.length + 1,
        name,
        price: parseFloat(price),
        cost: cost ? parseFloat(cost) : null,
        category
      };

      console.log('Menu API: Adding new item:', newItem);
      return res.status(201).json(newItem);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Menu API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
