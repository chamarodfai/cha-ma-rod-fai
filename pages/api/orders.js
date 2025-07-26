export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
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
          const orderBlobs = listData.blobs?.filter(blob => blob.pathname.startsWith('order-')) || [];
          
          const orders = [];
          for (const blob of orderBlobs) {
            try {
              const orderResponse = await fetch(blob.url);
              const orderData = await orderResponse.json();
              orders.push(orderData);
            } catch (error) {
              console.error('Error fetching order:', error);
            }
          }
          
          return res.status(200).json(orders);
        } catch (error) {
          console.error('Error fetching orders:', error);
          return res.status(200).json([]);
        }

      case 'POST':
        try {
          const orderData = req.body;
          const orderId = orderData.id || Date.now().toString();
          const filename = `order-${orderId}.json`;
          
          // Upload ไฟล์ไป Vercel Blob Storage
          const uploadResponse = await fetch(`${BLOB_BASE_URL}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pathname: filename,
              body: JSON.stringify(orderData),
              access: 'public'
            })
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Upload error:', errorText);
            return res.status(500).json({ 
              error: 'Failed to save order',
              details: errorText
            });
          }

          const result = await uploadResponse.json();
          return res.status(200).json({ 
            success: true, 
            orderId,
            url: result.url,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error saving order:', error);
          return res.status(500).json({ 
            error: 'Failed to save order',
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
