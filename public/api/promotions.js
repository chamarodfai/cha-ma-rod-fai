// Simple in-memory promotions API for development
let promotions = [
  {
    id: 1,
    name: 'ลด 10%',
    type: 'percentage',
    value: 10,
    min_amount: 50,
    description: 'ลด 10% เมื่อซื้อครบ 50 บาท',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'ลด 20 บาท',
    type: 'fixed',
    value: 20,
    min_amount: 100,
    description: 'ลด 20 บาท เมื่อซื้อครบ 100 บาท',
    is_active: true,
    created_at: new Date().toISOString()
  }
]

// Handle CORS
function setCORSHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default function handler(req, res) {
  setCORSHeaders(res)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  switch (req.method) {
    case 'GET':
      return res.status(200).json(promotions.filter(p => p.is_active))

    case 'POST':
      const newPromotion = {
        id: Date.now(),
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      promotions.push(newPromotion)
      return res.status(201).json(newPromotion)

    case 'DELETE':
      const { id: deleteId } = req.body
      promotions = promotions.filter(p => p.id !== deleteId)
      return res.status(200).json({ message: 'Promotion deleted successfully' })

    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}
