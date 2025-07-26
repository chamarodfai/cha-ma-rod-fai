export default function handler(req, res) {
  return res.status(200).json({ 
    message: 'API working from vercel/functions!',
    timestamp: new Date().toISOString()
  });
}
