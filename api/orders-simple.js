export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Test orders data - ข้อมูลจำลองสำหรับ orders
    const testOrdersData = [
      {
        id: 1,
        items: [
          { name: 'ชาไทยเย็น', quantity: 2, price: 25 },
          { name: 'เพิ่มไข่มุก', quantity: 1, price: 10 }
        ],
        total: 60,
        customer_name: 'ลูกค้า A',
        created_at: '2025-07-28T08:00:00Z'
      },
      {
        id: 2,
        items: [
          { name: 'ชาเขียวเย็น', quantity: 1, price: 25 },
          { name: 'กาแฟเย็น', quantity: 1, price: 30 }
        ],
        total: 55,
        customer_name: 'ลูกค้า B',
        created_at: '2025-07-28T09:00:00Z'
      }
    ];

    if (req.method === 'GET') {
      console.log('Orders API: Returning test orders data');
      return res.status(200).json(testOrdersData);
    }

    if (req.method === 'POST') {
      const { items, total, customer_name } = req.body;
      
      if (!items || !total) {
        return res.status(400).json({ error: 'Missing required fields: items, total' });
      }

      const newOrder = {
        id: testOrdersData.length + 1,
        items,
        total: parseFloat(total),
        customer_name: customer_name || 'ลูกค้า',
        created_at: new Date().toISOString()
      };

      console.log('Orders API: Adding new order:', newOrder);
      return res.status(201).json(newOrder);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Orders API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
