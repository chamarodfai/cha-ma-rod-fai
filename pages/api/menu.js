export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ใช้ fetch API ที่ built-in ใน Node.js 18+
    const BLOB_BASE_URL = 'https://mut17cdzoqscasrb.public.blob.vercel-storage.com';
    const token = process.env.BLOB_READ_WRITE_TOKEN || 'vercel_blob_rw_mut17CDZOqScasrB_4iG8G6bqfmR1TKGpfnhU29qhKf8O2J1';

    switch (req.method) {
      case 'GET':
        try {
          // ลิสต์ blob files
          const listResponse = await fetch(`${BLOB_BASE_URL}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });

          if (!listResponse.ok) {
            console.log('List response not ok:', listResponse.status);
            return res.status(200).json([]);
          }

          const listData = await listResponse.json();
          const menuBlob = listData.blobs?.find(blob => blob.pathname === 'menu.json');
          
          if (menuBlob) {
            const menuResponse = await fetch(menuBlob.url);
            const menuData = await menuResponse.json();
            return res.status(200).json(menuData);
          } else {
            return res.status(200).json([]);
          }
        } catch (error) {
          console.error('Error fetching menu:', error);
          return res.status(200).json([]);
        }

      case 'POST':
        try {
          const menuData = req.body;
          
          // Upload ไฟล์ไป Vercel Blob Storage
          const uploadResponse = await fetch(`${BLOB_BASE_URL}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pathname: 'menu.json',
              body: JSON.stringify(menuData),
              access: 'public'
            })
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Upload error:', errorText);
            return res.status(500).json({ 
              error: 'Failed to save menu',
              details: errorText
            });
          }

          const result = await uploadResponse.json();
          return res.status(200).json({ 
            success: true, 
            url: result.url,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error saving menu:', error);
          return res.status(500).json({ 
            error: 'Failed to save menu',
            details: error.message
          });
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
