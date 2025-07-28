export default function handler(req, res) {
  return res.status(200).json({ 
    message: 'Hello from pages/api! ✨',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}
