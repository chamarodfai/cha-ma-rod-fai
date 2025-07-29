import { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingCart, Receipt, Coffee, Database, BarChart3, Settings, Edit, Trash2, Save, Download, TrendingUp, Calendar, PieChart, X } from 'lucide-react'

const categories = ['ทั้งหมด', 'ชาไทย', 'ชาเขียว', 'กาแฟ', 'เครื่องดื่ม', 'Topping']

function App() {
  // State สำหรับการนำทาง
  const [currentPage, setCurrentPage] = useState('main') // 'main', 'menu-manager', 'promotion-manager', 'analytics', 'daily-sales'
  
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [showMenuManager, setShowMenuManager] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState({ name: '', price: '', cost: '', category: 'ชาไทย' })
  
  // States สำหรับระบบ topping
  const [selectedDrink, setSelectedDrink] = useState(null)
  const [selectedToppings, setSelectedToppings] = useState([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showToppingModal, setShowToppingModal] = useState(false)
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState(null)
  
  // States สำหรับระบบโปรโมชั่น
  const [promotions, setPromotions] = useState([])
  const [showPromotionModal, setShowPromotionModal] = useState(false)
  const [showPromotionManager, setShowPromotionManager] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState(null)
  const [editingPromotion, setEditingPromotion] = useState(null)
  const [newPromotion, setNewPromotion] = useState({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_amount: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  })

  // States สำหรับระบบรหัสผ่าน
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [pendingAction, setPendingAction] = useState('')
  const adminPassword = 'chamarodfai1020' // รหัสผ่านสำหรับผู้ดูแลระบบ - STABLE VERSION

  // States สำหรับ Analytics (ไม่มี Chart)
  const [analyticsData, setAnalyticsData] = useState({
    daily: {},
    weekly: {},
    monthly: {},
    yearly: {},
    totalRevenue: 0,
    totalProfit: 0,
    popularItems: []
  })
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('daily')
  
  // States สำหรับยอดขายรายวัน
  const [showDailySales, setShowDailySales] = useState(false)
  const [dailySales, setDailySales] = useState({
    today: 0,
    todayOrders: 0,
    todayProfit: 0
  })

  // States สำหรับใบเสร็จ
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState(null)

  // โหลดข้อมูลเมนูจาก API
  useEffect(() => {
    fetchMenuItems()
    fetchOrders()
    fetchPromotions()
  }, [])

  // คำนวณข้อมูล Analytics เมื่อ orders เปลี่ยน
  useEffect(() => {
    console.log('🔄 Orders changed, recalculating analytics...')
    console.log('📊 Current orders count:', orders.length)
    console.log('🍃 Current menu items count:', menuItems.length)
    calculateAnalytics()
    calculateDailySales()
  }, [orders, menuItems])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu')
      if (response.ok) {
        const data = await response.json()
        setMenuItems(data)
      } else {
        // ใช้ข้อมูลเริ่มต้นหาก API ไม่ทำงาน
        setMenuItems([
          { id: 1, name: 'ชาไทยร้อน', price: 25, cost: 15, category: 'ชาไทย', image: '🧡' },
          { id: 2, name: 'ชาไทยเย็น', price: 30, cost: 18, category: 'ชาไทย', image: '🧡' },
          { id: 3, name: 'ชาเขียวร้อน', price: 25, cost: 15, category: 'ชาเขียว', image: '🍃' },
          { id: 4, name: 'ชาเขียวเย็น', price: 30, cost: 18, category: 'ชาเขียว', image: '🍃' },
          { id: 5, name: 'กาแฟดำร้อน', price: 20, cost: 12, category: 'กาแฟ', image: '☕' },
          { id: 6, name: 'กาแฟนมร้อน', price: 30, cost: 18, category: 'กาแฟ', image: '🥛' },
          { id: 7, name: 'น้ำมะนาว', price: 15, cost: 8, category: 'เครื่องดื่ม', image: '🍋' },
          { id: 8, name: 'น้ำส้ม', price: 20, cost: 12, category: 'เครื่องดื่ม', image: '🍊' },
          { id: 9, name: 'เพิ่มไข่มุก', price: 10, cost: 5, category: 'Topping', image: '⚫' },
          { id: 10, name: 'เพิ่มวุ้นกะทิ', price: 8, cost: 4, category: 'Topping', image: '⚪' },
        ])
      }
    } catch (error) {
      console.error('Error fetching menu:', error)
      // ใช้ข้อมูลเริ่มต้น
      setMenuItems([
        { id: 1, name: 'ชาไทยร้อน', price: 25, cost: 15, category: 'ชาไทย', image: '🧡' },
        { id: 2, name: 'ชาไทยเย็น', price: 30, cost: 18, category: 'ชาไทย', image: '🧡' },
        { id: 3, name: 'ชาเขียวร้อน', price: 25, cost: 15, category: 'ชาเขียว', image: '🍃' },
        { id: 4, name: 'ชาเขียวเย็น', price: 30, cost: 18, category: 'ชาเขียว', image: '🍃' },
        { id: 5, name: 'กาแฟดำร้อน', price: 20, cost: 12, category: 'กาแฟ', image: '☕' },
        { id: 6, name: 'กาแฟนมร้อน', price: 30, cost: 18, category: 'กาแฟ', image: '🥛' },
        { id: 7, name: 'น้ำมะนาว', price: 15, cost: 8, category: 'เครื่องดื่ม', image: '🍋' },
        { id: 8, name: 'น้ำส้ม', price: 20, cost: 12, category: 'เครื่องดื่ม', image: '🍊' },
        { id: 9, name: 'เพิ่มไข่มุก', price: 10, cost: 5, category: 'Topping', image: '⚫' },
        { id: 10, name: 'เพิ่มวุ้นกะทิ', price: 8, cost: 4, category: 'Topping', image: '⚪' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      console.log('🌐 Fetching orders from API...')
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Orders received from API:', data.length, 'orders')
        console.log('📋 Sample order structure:', data[0])
        setOrders(data)
      } else {
        console.warn('⚠️ API response not OK:', response.status)
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
    }
  }

  const fetchPromotions = async () => {
    try {
      const response = await fetch('/api/promotions')
      if (response.ok) {
        const data = await response.json()
        setPromotions(data)
      }
    } catch (error) {
      console.error('Error fetching promotions:', error)
    }
  }

  // คำนวณข้อมูล Analytics
  const calculateAnalytics = () => {
    const analytics = {
      daily: {},
      weekly: {},
      monthly: {},
      yearly: {},
      totalRevenue: 0,
      totalProfit: 0,
      popularItems: []
    }

    console.log('🔍 Calculating analytics with orders:', orders.length)

    orders.forEach((order, index) => {
      try {
        console.log(`📊 Processing order ${index + 1}:`, order)
        
        const date = new Date(order.created_at || order.timestamp || new Date())
        const dateStr = date.toLocaleDateString('th-TH')
        
        // ป้องกัน NaN ในการคำนวณ revenue - ใช้ final_total หรือ total
        const revenue = parseFloat(order.final_total || order.total || order.total_amount || 0) || 0
        console.log(`💰 Revenue for order ${index + 1}:`, revenue)
        
        // คำนวณ profit โดยใช้ cost จาก menuItems ที่มีอยู่
        let profit = 0
        if (order.items && Array.isArray(order.items)) {
          profit = order.items.reduce((sum, item) => {
            // หา cost จาก menuItems ที่มีอยู่ในระบบ
            const menuItem = menuItems.find(m => m.name === item.name || m.id === item.id)
            const itemPrice = parseFloat(item.price || item.originalPrice || 0) || 0
            const itemCost = parseFloat(item.cost || menuItem?.cost || itemPrice * 0.6) || 0 // ใช้ 60% ของราคาขายเป็น cost เริ่มต้น
            const quantity = parseInt(item.quantity || 1) || 1
            
            console.log(`🧮 Item: ${item.name}, Price: ${itemPrice}, Cost: ${itemCost}, Qty: ${quantity}`)
            
            // รวม topping cost
            let toppingCost = 0
            if (item.toppings && Array.isArray(item.toppings)) {
              toppingCost = item.toppings.reduce((toppingSum, topping) => {
                const toppingMenuItem = menuItems.find(m => m.name === topping.name || m.id === topping.id)
                const toppingPrice = parseFloat(topping.price || 0) || 0
                const toppingCostValue = parseFloat(topping.cost || toppingMenuItem?.cost || toppingPrice * 0.6) || 0
                return toppingSum + toppingCostValue
              }, 0)
            }
            
            return sum + ((itemPrice - itemCost - toppingCost) * quantity)
          }, 0)
        }
        profit = parseFloat(profit) || 0
        console.log(`📈 Profit for order ${index + 1}:`, profit)

        // รายวัน
        if (!analytics.daily[dateStr]) {
          analytics.daily[dateStr] = { revenue: 0, profit: 0, orders: 0 }
        }
        analytics.daily[dateStr].revenue += revenue
        analytics.daily[dateStr].profit += profit
        analytics.daily[dateStr].orders += 1

        analytics.totalRevenue += revenue
        analytics.totalProfit += profit
      } catch (error) {
        console.error('❌ Error calculating analytics for order:', order, error)
      }
    })

    // สินค้ายอดนิยม
    const itemCount = {}
    orders.forEach(order => {
      try {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            if (item.name) {
              const quantity = parseInt(item.quantity || 0) || 0
              itemCount[item.name] = (itemCount[item.name] || 0) + quantity
            }
          })
        }
      } catch (error) {
        console.error('Error counting items for order:', order, error)
      }
    })

    analytics.popularItems = Object.entries(itemCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // ตรวจสอบว่าค่าไม่เป็น NaN
    analytics.totalRevenue = parseFloat(analytics.totalRevenue) || 0
    analytics.totalProfit = parseFloat(analytics.totalProfit) || 0

    console.log('✅ Analytics calculated:', {
      totalRevenue: analytics.totalRevenue,
      totalProfit: analytics.totalProfit,
      dailyCount: Object.keys(analytics.daily).length,
      popularItemsCount: analytics.popularItems.length
    })

    setAnalyticsData(analytics)
  }

  // คำนวณยอดขายรายวัน
  const calculateDailySales = () => {
    const today = new Date().toLocaleDateString('th-TH')
    const todayOrders = orders.filter(order => {
      try {
        const orderDate = new Date(order.created_at || order.timestamp || new Date()).toLocaleDateString('th-TH')
        return orderDate === today
      } catch (error) {
        console.error('Error filtering today orders:', error)
        return false
      }
    })

    console.log('📅 Today orders:', todayOrders.length)

    const todayRevenue = todayOrders.reduce((sum, order) => {
      const revenue = parseFloat(order.final_total || order.total || order.total_amount || 0) || 0
      console.log('💰 Order revenue:', revenue)
      return sum + revenue
    }, 0)
    
    const todayProfit = todayOrders.reduce((sum, order) => {
      let orderProfit = 0
      try {
        if (order.items && Array.isArray(order.items)) {
          orderProfit = order.items.reduce((itemSum, item) => {
            // หา cost จาก menuItems ที่มีอยู่ในระบบ
            const menuItem = menuItems.find(m => m.name === item.name || m.id === item.id)
            const itemPrice = parseFloat(item.price || item.originalPrice || 0) || 0
            const itemCost = parseFloat(item.cost || menuItem?.cost || itemPrice * 0.6) || 0 // ใช้ 60% ของราคาขายเป็น cost เริ่มต้น
            const quantity = parseInt(item.quantity || 1) || 1
            
            // รวม topping cost
            let toppingCost = 0
            if (item.toppings && Array.isArray(item.toppings)) {
              toppingCost = item.toppings.reduce((toppingSum, topping) => {
                const toppingMenuItem = menuItems.find(m => m.name === topping.name || m.id === topping.id)
                const toppingPrice = parseFloat(topping.price || 0) || 0
                const toppingCostValue = parseFloat(topping.cost || toppingMenuItem?.cost || toppingPrice * 0.6) || 0
                return toppingSum + toppingCostValue
              }, 0)
            }
            
            return itemSum + ((itemPrice - itemCost - toppingCost) * quantity)
          }, 0)
        }
      } catch (error) {
        console.error('Error calculating profit for order:', order, error)
      }
      return sum + (parseFloat(orderProfit) || 0)
    }, 0)

    console.log('📊 Daily sales calculated:', { todayRevenue, todayProfit, todayOrders: todayOrders.length })

    setDailySales({
      today: parseFloat(todayRevenue) || 0,
      todayOrders: todayOrders.length || 0,
      todayProfit: parseFloat(todayProfit) || 0
    })
  }

  // ฟังก์ชันตรวจสอบรหัสผ่าน
  const handlePasswordSubmit = () => {
    if (password === adminPassword) {
      setIsAuthenticated(true)
      setShowPasswordModal(false)
      setPassword('')
      
      // เปลี่ยนหน้าตาม action ที่รอ
      if (pendingAction) {
        setCurrentPage(pendingAction)
        setPendingAction('')
      }
      
      // ตั้งให้ session หมดอายุใน 30 นาที
      setTimeout(() => {
        setIsAuthenticated(false)
      }, 30 * 60 * 1000)
    } else {
      alert('รหัสผ่านไม่ถูกต้อง')
      setPassword('')
    }
  }

  // ฟังก์ชันขอการยืนยันตัวตน
  const requireAuthentication = (action) => {
    if (isAuthenticated) {
      // หากยืนยันตัวตนแล้ว เปลี่ยนหน้าเลย
      setCurrentPage(action)
    } else {
      // หากยังไม่ยืนยันตัวตน ขอรหัสผ่าน
      setPendingAction(action)
      setShowPasswordModal(true)
    }
  }

  // ฟังก์ชันการนำทางโดยไม่ต้องรหัสผ่าน
  const navigateTo = (page) => {
    setCurrentPage(page)
  }

  // เพิ่มสินค้าลงตะกร้า (แสดง popup แทน)
  const addToCart = (item) => {
    setSelectedMenuItem(item)
    setShowAddToCartModal(true)
  }

  // เพิ่มสินค้าลงตะกร้าจริง
  const confirmAddToCart = (item, toppings = []) => {
    // รวม topping กับเครื่องดื่ม
    const finalItem = {
      ...item,
      cost: parseFloat(item.cost) || 0, // เพิ่ม cost เพื่อป้องกัน NaN
      toppings: toppings,
      finalPrice: item.price + toppings.reduce((sum, topping) => sum + topping.price, 0)
    }

    const existingItem = cart.find(cartItem => 
      cartItem.id === item.id && 
      JSON.stringify(cartItem.toppings || []) === JSON.stringify(toppings)
    )
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id && 
        JSON.stringify(cartItem.toppings || []) === JSON.stringify(toppings)
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...finalItem, quantity: 1, id: Date.now() }])
    }

    setShowAddToCartModal(false)
    setSelectedMenuItem(null)
    setSelectedToppings([])
  }

  // ปรับจำนวนสินค้าในตะกร้า
  const updateCartQuantity = (itemId, newQuantity, toppings = []) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => 
        !(item.id === itemId && JSON.stringify(item.toppings || []) === JSON.stringify(toppings))
      ))
    } else {
      setCart(cart.map(item =>
        item.id === itemId && JSON.stringify(item.toppings || []) === JSON.stringify(toppings)
          ? { ...item, quantity: newQuantity } 
          : item
      ))
    }
  }

  // คำนวณยอดรวม
  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => {
      const itemPrice = item.finalPrice || item.price
      return sum + (itemPrice * item.quantity)
    }, 0)
    let discount = 0
    
    if (selectedPromotion) {
      if (selectedPromotion.discount_type === 'percentage') {
        discount = subtotal * (selectedPromotion.discount_value / 100)
      } else {
        discount = selectedPromotion.discount_value
      }
    }
    
    return { subtotal, discount, total: subtotal - discount }
  }

  // ชำระเงิน
  const checkout = async () => {
    console.log('🛒 Starting checkout process...')
    
    if (cart.length === 0) {
      alert('ตะกร้าว่างเปล่า')
      return
    }

    const { total } = calculateTotal()
    const orderData = {
      items: cart,
      total: total, // เปลี่ยนจาก total_amount เป็น total
      order_id: `ORD-${String(Date.now()).slice(-6)}`,
      final_total: total,
      promotion_id: selectedPromotion?.id || null,
      promotion_name: selectedPromotion?.name || null,
      timestamp: new Date().toISOString(),
      formattedOrderId: `ORD-${String(Date.now()).slice(-6)}`
    }

    console.log('📦 Order data:', orderData)
    console.log('🛒 Cart items:', cart)
    console.log('💰 Total amount:', total)

    try {
      console.log('🌐 Sending request to /api/orders...')
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)

      let newOrder
      if (response.ok) {
        newOrder = await response.json()
        console.log('✅ Order saved to database:', newOrder)
      } else {
        const errorText = await response.text()
        console.warn('⚠️ API failed with status:', response.status, 'Error:', errorText)
        // ถ้า API ล้มเหลว ใช้ข้อมูลท้องถิ่น
        newOrder = {
          id: Date.now(),
          ...orderData,
          created_at: new Date().toISOString()
        }
      }
      
      console.log('💾 Updating local state with order:', newOrder)
      
      // อัพเดทข้อมูลในแอพ
      setOrders([...orders, newOrder])
      setReceiptData(newOrder)
      setShowReceipt(true)
      setCart([])
      setSelectedPromotion(null)
      
      console.log('✅ Checkout completed successfully!')
      alert(`ชำระเงินสำเร็จ! ยอดรวม ฿${total.toLocaleString()}`)
      
    } catch (error) {
      console.error('❌ Error creating order:', error)
      // สำรองข้อมูลเมื่อเกิดข้อผิดพลาด
      const newOrder = {
        id: Date.now(),
        ...orderData,
        created_at: new Date().toISOString()
      }
      
      console.log('💾 Using fallback order data:', newOrder)
      
      setOrders([...orders, newOrder])
      setReceiptData(newOrder)
      setShowReceipt(true)
      setCart([])
      setSelectedPromotion(null)
      alert(`ชำระเงินสำเร็จ! (บันทึกท้องถิ่น) ยอดรวม ฿${total.toLocaleString()}`)
    }
  }

  // จัดการเมนู - เพิ่มเมนูใหม่
  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.cost) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    const menuItem = {
      id: Date.now(),
      name: newItem.name,
      price: parseFloat(newItem.price),
      cost: parseFloat(newItem.cost),
      category: newItem.category,
      image: '🍃'
    }

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuItem)
      })

      if (response.ok) {
        const addedItem = await response.json()
        setMenuItems([...menuItems, addedItem])
      } else {
        setMenuItems([...menuItems, menuItem])
      }
    } catch (error) {
      setMenuItems([...menuItems, menuItem])
    }

    setNewItem({ name: '', price: '', cost: '', category: 'ชาไทย' })
  }

  // จัดการโปรโมชั่น - เพิ่มโปรโมชั่นใหม่
  const addPromotion = async () => {
    if (!newPromotion.name || !newPromotion.discount_value) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    const promotion = {
      id: Date.now(),
      ...newPromotion,
      discount_value: parseFloat(newPromotion.discount_value),
      min_amount: newPromotion.min_amount ? parseFloat(newPromotion.min_amount) : 0
    }

    try {
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotion)
      })

      if (response.ok) {
        const addedPromotion = await response.json()
        setPromotions([...promotions, addedPromotion])
      } else {
        setPromotions([...promotions, promotion])
      }
    } catch (error) {
      setPromotions([...promotions, promotion])
    }

    setNewPromotion({
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_amount: '',
      valid_from: '',
      valid_until: '',
      is_active: true
    })
  }

  // กรองเมนูตามหมวดหมู่
  const filteredMenuItems = selectedCategory === 'ทั้งหมด' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory)

  // แยกเครื่องดื่มและ Topping
  const drinkItems = filteredMenuItems.filter(item => item.category !== 'Topping')
  const toppingItems = menuItems.filter(item => item.category === 'Topping')

  // ตรวจสอบโปรโมชั่นที่ใช้ได้
  const getAvailablePromotions = () => {
    const { subtotal } = calculateTotal()
    return promotions.filter(promo => 
      promo.is_active && 
      (!promo.min_amount || subtotal >= promo.min_amount) &&
      new Date() >= new Date(promo.valid_from) &&
      new Date() <= new Date(promo.valid_until)
    )
  }

  // ฟังก์ชันสำหรับ render เนื้อหาตามหน้าที่เลือก
  const renderPageContent = () => {
    switch (currentPage) {
      case 'main':
        return renderMainPage()
      case 'menu-manager':
        return renderMenuManager()
      case 'promotion-manager':
        return renderPromotionManager()
      case 'analytics':
        return renderAnalytics()
      case 'daily-sales':
        return renderDailySales()
      default:
        return renderMainPage()
    }
  }

  // หน้าหลัก - POS
  const renderMainPage = () => (
    <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu Section */}
      <div className="lg:col-span-2">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 glass-morphism">
          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-thai-orange text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items - แบ่งเป็น 70% เครื่องดื่ม และ 30% Topping */}
          <div className="flex gap-4">
            {/* เครื่องดื่ม 70% */}
            <div className="w-[70%]">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-thai-orange pb-2">
                🍃 เครื่องดื่ม 🍃
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {drinkItems.map(item => (
                  <div key={item.id} className="menu-item-card group">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {item.image}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm">{item.name}</h3>
                    <p className="text-thai-orange font-bold mb-2">฿{item.price}</p>
                    <button
                      onClick={() => addToCart(item)}
                      className="btn-primary w-full text-sm"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      เลือก
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Topping 30% */}
            <div className="w-[30%]">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-orange-400 pb-2">
                🧡 Topping 🧡
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {toppingItems.map(item => (
                  <div key={item.id} className="menu-item-card group bg-orange-50">
                    <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                      {item.image}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1 text-xs">{item.name}</h3>
                    <p className="text-orange-600 font-bold mb-2 text-sm">+฿{item.price}</p>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs w-full transition-colors"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      เพิ่ม
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div>
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 glass-morphism sticky top-4">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2 text-thai-orange" />
            ตะกร้าสินค้า ({cart.length})
          </h2>
          
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Coffee className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>ตะกร้าว่างเปล่า</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={`${item.id}-${JSON.stringify(item.toppings || [])}`} className="cart-item">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-600">฿{item.finalPrice || item.price} x {item.quantity}</p>
                      {item.toppings && item.toppings.length > 0 && (
                        <div className="ml-4 mt-1">
                          {item.toppings.map(topping => (
                            <p key={topping.id} className="text-xs text-orange-600 flex items-center">
                              <span className="mr-1">•</span>
                              {topping.name}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => updateCartQuantity(item.id, 0, item.toppings)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1, item.toppings)}
                        className="btn-secondary p-1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1, item.toppings)}
                        className="btn-secondary p-1"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-bold text-thai-orange">
                      ฿{((item.finalPrice || item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              {/* Promotion Section */}
              {selectedPromotion && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-800">{selectedPromotion.name}</p>
                      <p className="text-sm text-green-600">{selectedPromotion.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedPromotion(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>ยอดรวม:</span>
                    <span>฿{calculateTotal().subtotal.toLocaleString()}</span>
                  </div>
                  {selectedPromotion && (
                    <div className="flex justify-between text-green-600">
                      <span>ส่วนลด:</span>
                      <span>-฿{calculateTotal().discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xl font-bold border-t pt-2">
                    <span>ยอดสุทธิ:</span>
                    <span className="text-thai-orange">฿{calculateTotal().total.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={checkout}
                  className="btn-primary w-full mt-4 text-lg py-3"
                >
                  <Receipt className="w-5 h-5 mr-2" />
                  ชำระเงิน
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // หน้าจัดการเมนู
  const renderMenuManager = () => (
    <div className="container mx-auto p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 glass-morphism">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-thai-orange" />
            จัดการเมนู
          </h2>
          <button
            onClick={() => navigateTo('main')}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            กลับหน้าหลัก
          </button>
        </div>

        {/* Add New Item Form */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">เพิ่มเมนูใหม่</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ชื่อเมนู"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="ราคาขาย"
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="ต้นทุน"
              value={newItem.cost}
              onChange={(e) => setNewItem({...newItem, cost: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              className="border rounded-lg px-3 py-2"
            >
              {categories.filter(cat => cat !== 'ทั้งหมด').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <button
            onClick={addMenuItem}
            className="mt-4 bg-thai-orange text-white px-4 py-2 rounded-lg hover:bg-thai-orange-dark"
          >
            เพิ่มเมนู
          </button>
        </div>

        {/* Menu Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map(item => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="text-2xl mb-2">{item.image}</div>
              <h4 className="font-semibold">{item.name}</h4>
              <p className="text-thai-orange font-bold">฿{item.price}</p>
              <p className="text-sm text-gray-600">ต้นทุน: ฿{item.cost}</p>
              <p className="text-xs text-gray-500">{item.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // หน้าจัดการโปรโมชั่น
  const renderPromotionManager = () => (
    <div className="container mx-auto p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 glass-morphism">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Receipt className="w-8 h-8 mr-3 text-thai-orange" />
            จัดการโปรโมชั่น
          </h2>
          <button
            onClick={() => navigateTo('main')}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            กลับหน้าหลัก
          </button>
        </div>

        {/* Promotions List */}
        <div className="space-y-4">
          {promotions.map(promo => (
            <div key={promo.id} className="border rounded-lg p-4">
              <h4 className="font-semibold text-lg">{promo.name}</h4>
              <p className="text-gray-600">{promo.description}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className="bg-thai-orange text-white px-2 py-1 rounded">
                  {promo.discount_type === 'percentage' 
                    ? `ลด ${promo.discount_value}%` 
                    : `ลด ฿${promo.discount_value}`
                  }
                </span>
                {promo.min_amount && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    ขั้นต่ำ ฿{promo.min_amount}
                  </span>
                )}
                <span className={`px-2 py-1 rounded ${promo.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {promo.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // หน้ายอดขายวันนี้
  const renderDailySales = () => (
    <div className="container mx-auto p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 glass-morphism">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-thai-orange" />
            ยอดขายวันนี้
          </h3>
          <button
            onClick={() => navigateTo('main')}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            กลับหน้าหลัก
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">ยอดขายวันนี้</p>
                <p className="text-3xl font-bold">฿{(parseFloat(dailySales.today) || 0).toLocaleString()}</p>
              </div>
              <Receipt className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">จำนวนออเดอร์</p>
                <p className="text-3xl font-bold">{dailySales.todayOrders} ออเดอร์</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">กำไรวันนี้</p>
                <p className="text-3xl font-bold">฿{(parseFloat(dailySales.todayProfit) || 0).toLocaleString()}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            📅 {new Date().toLocaleDateString('th-TH', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  )

  // หน้าวิเคราะห์ยอดขาย
  const renderAnalytics = () => {
    console.log('🎨 Rendering analytics page with data:', analyticsData)
    console.log('📊 Analytics values:', {
      totalRevenue: analyticsData.totalRevenue,
      totalProfit: analyticsData.totalProfit,
      totalRevenueType: typeof analyticsData.totalRevenue,
      totalProfitType: typeof analyticsData.totalProfit
    })
    
    return (
    <div className="container mx-auto p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 glass-morphism">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-thai-orange" />
            วิเคราะห์ยอดขาย
          </h2>
          <button
            onClick={() => navigateTo('main')}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            กลับหน้าหลัก
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">ยอดขายรวม</p>
                <p className="text-2xl font-bold">
                  ฿{(parseFloat(analyticsData.totalRevenue) || 0).toLocaleString()}
                </p>
              </div>
              <Receipt className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">กำไรรวม</p>
                <p className="text-2xl font-bold">
                  ฿{(parseFloat(analyticsData.totalProfit) || 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">จำนวนออเดอร์</p>
                <p className="text-2xl font-bold">
                  {orders.length.toLocaleString()}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">อัตรากำไร</p>
                <p className="text-2xl font-bold">
                  {(parseFloat(analyticsData.totalRevenue) || 0) > 0 
                    ? (((parseFloat(analyticsData.totalProfit) || 0) / (parseFloat(analyticsData.totalRevenue) || 1)) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <PieChart className="w-6 h-6 mr-2" />
              สินค้ายอดนิยม
            </h3>
            {analyticsData.popularItems.length > 0 ? (
              <div className="space-y-2">
                {analyticsData.popularItems.map((item, index) => (
                  <div key={item.name} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">#{index + 1} {item.name}</span>
                    <span className="text-thai-orange font-bold">{item.count} ชิ้น</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>ยังไม่มีข้อมูลการขาย</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-gray-800">ยอดขายรายวัน</h3>
            {Object.keys(analyticsData.daily).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(analyticsData.daily).slice(-7).map(([date, data]) => (
                  <div key={date} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">{date}</span>
                    <div className="text-right">
                      <div className="text-thai-orange font-bold">฿{(parseFloat(data.revenue) || 0).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{parseInt(data.orders) || 0} ออเดอร์</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>ยังไม่มีข้อมูลการขาย</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    )
  }

  return (
    <div className="min-h-screen thai-gradient-bg">
      {/* Header */}
      <header className="thai-header-bg text-white p-2 sm:p-4 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-y-1"></div>
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-white/25 p-2 rounded-full shadow-lg glow-orange">
              🚂
            </div>
            <h1 className="text-xl sm:text-2xl font-bold drop-shadow-md">
              POS CHA MA ROD FAI (ชา-มา-รถ-ไฟ) ☕🚂
            </h1>
          </div>
              onClick={() => navigateTo('main')}
              className={`px-2 sm:px-3 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap ${
                currentPage === 'main' ? 'bg-white/40' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span className="hidden sm:inline text-sm lg:text-base">หน้าหลัก</span>
            </button>
            <button
              onClick={() => requireAuthentication('menu-manager')}
              className={`px-2 sm:px-3 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap ${
                currentPage === 'menu-manager' ? 'bg-white/40' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline text-sm lg:text-base">จัดการเมนู</span>
            </button>
            <button
              onClick={() => setShowPromotionModal(!showPromotionModal)}
              className="bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap"
            >
              <Receipt className="w-4 h-4" />
              <span className="hidden md:inline text-sm lg:text-base">โปรโมชั่น</span>
            </button>
            <button
              onClick={() => requireAuthentication('promotion-manager')}
              className={`px-2 sm:px-3 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap ${
                currentPage === 'promotion-manager' ? 'bg-white/40' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline text-sm lg:text-base">จัดการโปรโมชั่น</span>
            </button>
            <button
              onClick={() => navigateTo('daily-sales')}
              className={`px-2 sm:px-3 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap ${
                currentPage === 'daily-sales' ? 'bg-white/40' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline text-sm lg:text-base">ยอดขายวันนี้</span>
            </button>
            <button
              onClick={() => requireAuthentication('analytics')}
              className={`px-2 sm:px-3 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap ${
                currentPage === 'analytics' ? 'bg-white/40' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden md:inline text-sm lg:text-base">วิเคราะห์ยอดขาย</span>
            </button>
            <div className="bg-white/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
              <span className="hidden sm:inline text-sm lg:text-base">วันที่: </span>
              <span className="text-sm lg:text-base">{new Date().toLocaleDateString('th-TH')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {renderPageContent()}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4 text-center">🔐 ยืนยันตัวตน</h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="กรอกรหัสผ่าน"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-thai-orange focus:border-transparent"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPassword('')
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 px-4 py-2 bg-thai-orange text-white rounded-lg hover:bg-thai-orange-dark transition-colors"
              >
                ยืนยัน
              </button>
            </div>
            
            <div className="mt-3 text-xs text-gray-500 text-center">
              💡 เซสชันจะหมดอายุใน 30 นาที
            </div>
          </div>
        </div>
      )}

      {/* Menu Manager Modal */}
      {showMenuManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Settings className="w-8 h-8 mr-3 text-thai-orange" />
                  จัดการเมนู
                </h2>
                <button
                  onClick={() => setShowMenuManager(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Add New Item Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-4">เพิ่มเมนูใหม่</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="ชื่อเมนู"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="ราคาขาย"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="ต้นทุน"
                    value={newItem.cost}
                    onChange={(e) => setNewItem({...newItem, cost: e.target.value})}
                    className="border rounded-lg px-3 py-2"
                  />
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="border rounded-lg px-3 py-2"
                  >
                    {categories.filter(cat => cat !== 'ทั้งหมด').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={addMenuItem}
                  className="mt-4 bg-thai-orange text-white px-4 py-2 rounded-lg hover:bg-thai-orange-dark"
                >
                  เพิ่มเมนู
                </button>
              </div>

              {/* Menu Items List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="text-2xl mb-2">{item.image}</div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-thai-orange font-bold">฿{item.price}</p>
                    <p className="text-sm text-gray-600">ต้นทุน: ฿{item.cost}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Manager Modal */}
      {showPromotionManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Receipt className="w-8 h-8 mr-3 text-thai-orange" />
                  จัดการโปรโมชั่น
                </h2>
                <button
                  onClick={() => setShowPromotionManager(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Add New Promotion Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-4">เพิ่มโปรโมชั่นใหม่</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="ชื่อโปรโมชั่น"
                    value={newPromotion.name}
                    onChange={(e) => setNewPromotion({...newPromotion, name: e.target.value})}
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="คำอธิบาย"
                    value={newPromotion.description}
                    onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})}
                    className="border rounded-lg px-3 py-2"
                  />
                  <select
                    value={newPromotion.discount_type}
                    onChange={(e) => setNewPromotion({...newPromotion, discount_type: e.target.value})}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="percentage">เปอร์เซ็นต์</option>
                    <option value="fixed">จำนวนเงิน</option>
                  </select>
                  <input
                    type="number"
                    placeholder={newPromotion.discount_type === 'percentage' ? 'เปอร์เซ็นต์ลด' : 'จำนวนเงินลด'}
                    value={newPromotion.discount_value}
                    onChange={(e) => setNewPromotion({...newPromotion, discount_value: e.target.value})}
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="ยอดขั้นต่ำ (ถ้ามี)"
                    value={newPromotion.min_amount}
                    onChange={(e) => setNewPromotion({...newPromotion, min_amount: e.target.value})}
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="date"
                    placeholder="วันเริ่มต้น"
                    value={newPromotion.valid_from}
                    onChange={(e) => setNewPromotion({...newPromotion, valid_from: e.target.value})}
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="date"
                    placeholder="วันสิ้นสุด"
                    value={newPromotion.valid_until}
                    onChange={(e) => setNewPromotion({...newPromotion, valid_until: e.target.value})}
                    className="border rounded-lg px-3 py-2"
                  />
                </div>
                <button
                  onClick={addPromotion}
                  className="mt-4 bg-thai-orange text-white px-4 py-2 rounded-lg hover:bg-thai-orange-dark"
                >
                  เพิ่มโปรโมชั่น
                </button>
              </div>

              {/* Promotions List */}
              <div className="space-y-4">
                {promotions.map(promo => (
                  <div key={promo.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg">{promo.name}</h4>
                    <p className="text-gray-600">{promo.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                      <span className="bg-thai-orange text-white px-2 py-1 rounded">
                        {promo.discount_type === 'percentage' 
                          ? `ลด ${promo.discount_value}%` 
                          : `ลด ฿${promo.discount_value}`
                        }
                      </span>
                      {promo.min_amount && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          ขั้นต่ำ ฿{promo.min_amount}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded ${promo.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {promo.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">🎉 โปรโมชั่นพิเศษ</h3>
              <button
                onClick={() => setShowPromotionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              {getAvailablePromotions().map(promo => (
                <div
                  key={promo.id}
                  onClick={() => {
                    setSelectedPromotion(promo)
                    setShowPromotionModal(false)
                  }}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-semibold text-gray-800">{promo.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{promo.description}</p>
                  <div className="text-sm text-thai-orange font-medium">
                    {promo.discount_type === 'percentage' 
                      ? `ลด ${promo.discount_value}%` 
                      : `ลด ฿${promo.discount_value}`
                    }
                    {promo.min_amount && ` (ขั้นต่ำ ฿${promo.min_amount})`}
                  </div>
                </div>
              ))}
              
              {getAvailablePromotions().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>ไม่มีโปรโมชั่นที่ใช้ได้ในขณะนี้</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Daily Sales Modal */}
      {showDailySales && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <Calendar className="w-8 h-8 mr-3 text-thai-orange" />
                ยอดขายวันนี้
              </h3>
              <button
                onClick={() => setShowDailySales(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">ยอดขายวันนี้</p>
                    <p className="text-3xl font-bold">฿{(parseFloat(dailySales.today) || 0).toLocaleString()}</p>
                  </div>
                  <Receipt className="w-12 h-12 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">จำนวนออเดอร์</p>
                    <p className="text-3xl font-bold">{dailySales.todayOrders} ออเดอร์</p>
                  </div>
                  <ShoppingCart className="w-12 h-12 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">กำไรวันนี้</p>
                    <p className="text-3xl font-bold">฿{(parseFloat(dailySales.todayProfit) || 0).toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-purple-200" />
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                📅 {new Date().toLocaleDateString('th-TH', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal (ไม่มี Chart เพื่อหลีกเลี่ยง error) */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                  <TrendingUp className="w-8 h-8 mr-3 text-thai-orange" />
                  วิเคราะห์ยอดขาย
                </h2>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">ยอดขายรวม</p>
                      <p className="text-2xl font-bold">
                        ฿{(parseFloat(analyticsData.totalRevenue) || 0).toLocaleString()}
                      </p>
                    </div>
                    <Receipt className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">กำไรรวม</p>
                      <p className="text-2xl font-bold">
                        ฿{(parseFloat(analyticsData.totalProfit) || 0).toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">จำนวนออเดอร์</p>
                      <p className="text-2xl font-bold">
                        {orders.length.toLocaleString()}
                      </p>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">อัตรากำไร</p>
                      <p className="text-2xl font-bold">
                        {(parseFloat(analyticsData.totalRevenue) || 0) > 0 
                          ? (((parseFloat(analyticsData.totalProfit) || 0) / (parseFloat(analyticsData.totalRevenue) || 1)) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-200" />
                  </div>
                </div>
              </div>

              {/* Popular Items */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  <PieChart className="w-6 h-6 mr-2" />
                  สินค้ายอดนิยม
                </h3>
                {analyticsData.popularItems.length > 0 ? (
                  <div className="space-y-2">
                    {analyticsData.popularItems.map((item, index) => (
                      <div key={item.name} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="font-medium">#{index + 1} {item.name}</span>
                        <span className="text-thai-orange font-bold">{item.count} ชิ้น</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>ยังไม่มีข้อมูลการขาย</p>
                  </div>
                )}
              </div>

              {/* Daily Sales Data */}
              <div className="bg-white p-6 rounded-lg border shadow-sm mt-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">ยอดขายรายวัน</h3>
                {Object.keys(analyticsData.daily).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(analyticsData.daily).slice(-7).map(([date, data]) => (
                      <div key={date} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="font-medium">{date}</span>
                        <div className="text-right">
                          <div className="text-thai-orange font-bold">฿{(parseFloat(data.revenue) || 0).toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{parseInt(data.orders) || 0} ออเดอร์</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>ยังไม่มีข้อมูลการขาย</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Modal */}
      {showAddToCartModal && selectedMenuItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-slideIn" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999
          }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">เพิ่มลงตะกร้า</h3>
                <button
                  onClick={() => {
                    setShowAddToCartModal(false)
                    setSelectedMenuItem(null)
                    setSelectedToppings([])
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Selected Item */}
              <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{selectedMenuItem.image}</div>
                  <div>
                    <h4 className="font-semibold text-lg">{selectedMenuItem.name}</h4>
                    <p className="text-thai-orange font-bold">฿{selectedMenuItem.price}</p>
                  </div>
                </div>
              </div>

              {/* Topping Selection */}
              {selectedMenuItem.category !== 'Topping' && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-3">เลือก Topping (ไม่บังคับ)</h4>
                  <div className="space-y-2">
                    {toppingItems.map(topping => (
                      <div key={topping.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{topping.image}</div>
                          <div>
                            <span className="font-medium">{topping.name}</span>
                            <span className="text-orange-600 font-bold ml-2">+฿{topping.price}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const isSelected = selectedToppings.find(t => t.id === topping.id)
                            if (isSelected) {
                              setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id))
                            } else {
                              setSelectedToppings([...selectedToppings, topping])
                            }
                          }}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            selectedToppings.find(t => t.id === topping.id)
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {selectedToppings.find(t => t.id === topping.id) ? '✓' : '+'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Price */}
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">ราคารวม:</span>
                  <span className="text-xl font-bold text-thai-orange">
                    ฿{selectedMenuItem.price + selectedToppings.reduce((sum, t) => sum + t.price, 0)}
                  </span>
                </div>
                {selectedToppings.length > 0 && (
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedMenuItem.name} + {selectedToppings.map(t => t.name).join(', ')}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddToCartModal(false)
                    setSelectedMenuItem(null)
                    setSelectedToppings([])
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => confirmAddToCart(selectedMenuItem, selectedToppings)}
                  className="flex-1 px-4 py-3 bg-thai-orange text-white rounded-lg hover:bg-thai-orange-dark transition-colors flex items-center justify-center"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  เพิ่มลงตะกร้า
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideIn" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999
          }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-thai-orange flex items-center">
                  <Receipt className="w-6 h-6 mr-2" />
                  ใบเสร็จรับเงิน
                </h3>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div id="receipt-content" className="bg-gradient-to-b from-orange-50 to-white p-6 rounded-lg border-2 border-orange-200">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">🚂☕</div>
                  <h2 className="font-bold text-xl text-thai-orange">POS CHA MA ROD FAI</h2>
                  <p className="text-sm text-gray-600">ชา-มา-รถ-ไฟ</p>
                  <div className="w-full h-1 bg-gradient-to-r from-orange-300 via-thai-orange to-orange-600 rounded mt-2"></div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-orange-200 mb-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Order ID:</span>
                      <p className="font-bold text-thai-orange">{receiptData.order_id || receiptData.formattedOrderId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">วันที่:</span>
                      <p className="font-bold">{new Date(receiptData.created_at || receiptData.timestamp).toLocaleString('th-TH')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <h4 className="font-semibold text-gray-800 border-b border-orange-200 pb-1">รายการสินค้า</h4>
                  {receiptData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="text-xs text-orange-600 ml-2">
                            {item.toppings.map(topping => (
                              <div key={topping.id}>• {topping.name}</div>
                            ))}
                          </div>
                        )}
                        <span className="text-sm text-gray-600"> x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-thai-orange">
                        ฿{((item.finalPrice || item.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t-2 border-thai-orange pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">ยอดรวมทั้งสิ้น</span>
                    <span className="text-2xl font-bold text-thai-orange">
                      ฿{(receiptData.total || receiptData.final_total || receiptData.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="text-center mt-6 text-sm text-gray-600">
                  <div className="w-full h-1 bg-gradient-to-r from-orange-300 via-thai-orange to-orange-600 rounded mb-2"></div>
                  <p className="font-medium">ขอบคุณที่ใช้บริการ</p>
                  <p>🙏 สวัสดีครับ/ค่ะ 🙏</p>
                  <p className="text-xs mt-2">💝 หวังว่าจะได้รับใช้อีกครั้ง 💝</p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  ปิด
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-thai-orange text-white px-4 py-3 rounded-lg hover:bg-thai-orange-dark transition-colors flex items-center justify-center font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  พิมพ์ใบเสร็จ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
