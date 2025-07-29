// สคริปต์สำหรับ debug การคำนวณ analytics
const debugAnalytics = async () => {
  console.log('🔍 Starting analytics debugging...')
  
  try {
    // ดึงข้อมูล orders จาก API
    const ordersResponse = await fetch('https://cha-ma-rodfaipos.vercel.app/api/orders')
    const orders = await ordersResponse.json()
    console.log('📦 Orders count:', orders.length)
    
    // ดึงข้อมูล menu จาก API
    const menuResponse = await fetch('https://cha-ma-rodfaipos.vercel.app/api/menu')
    let menuItems = []
    try {
      menuItems = await menuResponse.json()
    } catch (e) {
      console.log('⚠️ Menu API not available, using default items')
      menuItems = [
        { id: 1, name: 'ชาไทยร้อน', price: 25, cost: 15, category: 'ชาไทย' },
        { id: 2, name: 'ชาไทยเย็น', price: 30, cost: 18, category: 'ชาไทย' },
        { id: 47, name: 'ชาเย็น', price: 35, cost: 20, category: 'ชาไทย' },
        { id: 50, name: 'ชาเย็น (ขวด)', price: 40, cost: 25, category: 'ชาไทย' },
      ]
    }
    console.log('🍃 Menu items count:', menuItems.length)
    
    // ตรวจสอบโครงสร้างข้อมูล
    if (orders.length > 0) {
      console.log('📋 Sample order:', orders[0])
      console.log('📋 Order fields:', Object.keys(orders[0]))
      
      if (orders[0].items && orders[0].items.length > 0) {
        console.log('🧾 Sample item:', orders[0].items[0])
        console.log('🧾 Item fields:', Object.keys(orders[0].items[0]))
      }
    }
    
    // คำนวณ analytics
    let totalRevenue = 0
    let totalProfit = 0
    
    orders.forEach((order, index) => {
      const revenue = parseFloat(order.final_total || order.total || 0) || 0
      totalRevenue += revenue
      
      let orderProfit = 0
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const menuItem = menuItems.find(m => m.name === item.name || m.id === item.id)
          const itemPrice = parseFloat(item.price || item.originalPrice || 0) || 0
          const itemCost = parseFloat(item.cost || menuItem?.cost || itemPrice * 0.6) || 0
          const quantity = parseInt(item.quantity || 1) || 1
          
          const itemProfit = (itemPrice - itemCost) * quantity
          orderProfit += itemProfit
          
          console.log(`Order ${index + 1}, Item: ${item.name}, Price: ${itemPrice}, Cost: ${itemCost}, Qty: ${quantity}, Profit: ${itemProfit}`)
        })
      }
      totalProfit += orderProfit
      console.log(`Order ${index + 1} total: Revenue: ${revenue}, Profit: ${orderProfit}`)
    })
    
    console.log('📊 Final Results:')
    console.log('💰 Total Revenue:', totalRevenue)
    console.log('📈 Total Profit:', totalProfit)
    console.log('📊 Profit Margin:', totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) + '%' : '0%')
    
  } catch (error) {
    console.error('❌ Error in debug:', error)
  }
}

// รันการ debug
debugAnalytics()
