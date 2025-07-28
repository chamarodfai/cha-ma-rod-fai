// Vercel API Routes
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Thai Tea POS API is running',
    endpoints: ['/api/menu', '/api/orders'],
    timestamp: new Date().toISOString()
  });
}
