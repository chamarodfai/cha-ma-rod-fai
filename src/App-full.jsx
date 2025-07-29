import { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingCart, Receipt, Coffee, Database, BarChart3, Settings, Edit, Trash2, Save, Download, TrendingUp, Calendar, PieChart, X } from 'lucide-react'
import html2canvas from 'html2canvas'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'

// ลงทะเบียน Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const categories = ['ทั้งหมด', 'ชาไทย', 'ชาเขียว', 'กาแฟ', 'เครื่องดื่ม', 'Topping']

function App() {
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
  const adminPassword = 'chamarodfai1020' // รหัสผ่านสำหรับผู้ดูแลระบบ - FULL VERSION

  // States สำหรับ Analytics
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

  // โหลดข้อมูลเมนูจาก API
  useEffect(() => {
    fetchMenuItems()
    fetchOrders()
    fetchPromotions()
  }, [])

  // คำนวณข้อมูล Analytics เมื่อ orders เปลี่ยน
  useEffect(() => {
    calculateAnalytics()
    calculateDailySales()
  }, [orders])

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
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
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

    orders.forEach(order => {
      const date = new Date(order.created_at || order.timestamp)
      const dateStr = date.toLocaleDateString('th-TH')
      const revenue = order.total_amount
      const profit = order.items?.reduce((sum, item) => 
        sum + ((item.price - item.cost) * item.quantity), 0) || 0

      // รายวัน
      if (!analytics.daily[dateStr]) {
        analytics.daily[dateStr] = { revenue: 0, profit: 0, orders: 0 }
      }
      analytics.daily[dateStr].revenue += revenue
      analytics.daily[dateStr].profit += profit
      analytics.daily[dateStr].orders += 1

      analytics.totalRevenue += revenue
      analytics.totalProfit += profit
    })

    // สินค้ายอดนิยม
    const itemCount = {}
    orders.forEach(order => {
      order.items?.forEach(item => {
        itemCount[item.name] = (itemCount[item.name] || 0) + item.quantity
      })
    })

    analytics.popularItems = Object.entries(itemCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    setAnalyticsData(analytics)
  }

  // คำนวณยอดขายรายวัน
  const calculateDailySales = () => {
    const today = new Date().toLocaleDateString('th-TH')
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at || order.timestamp).toLocaleDateString('th-TH')
      return orderDate === today
    })

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0)
    const todayProfit = todayOrders.reduce((sum, order) => 
      sum + (order.items?.reduce((itemSum, item) => 
        itemSum + ((item.price - item.cost) * item.quantity), 0) || 0), 0
    )

    setDailySales({
      today: todayRevenue,
      todayOrders: todayOrders.length,
      todayProfit: todayProfit
    })
  }

  // ฟังก์ชันตรวจสอบรหัสผ่าน
  const handlePasswordSubmit = () => {
    if (password === adminPassword) {
      setIsAuthenticated(true)
      setShowPasswordModal(false)
      setPassword('')
      
      // ดำเนินการตาม action ที่รอ
      if (pendingAction === 'menu-manager') {
        setShowMenuManager(true)
      } else if (pendingAction === 'promotion-management') {
        setShowPromotionManager(true)
      } else if (pendingAction === 'analytics') {
        setShowAnalytics(true)
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
      // หากยืนยันตัวตนแล้ว ดำเนินการเลย
      if (action === 'menu-manager') {
        setShowMenuManager(true)
      } else if (action === 'promotion-management') {
        setShowPromotionManager(true)
      } else if (action === 'analytics') {
        setShowAnalytics(true)
      }
    } else {
      // หากยังไม่ยืนยันตัวตน ขอรหัสผ่าน
      setPendingAction(action)
      setShowPasswordModal(true)
    }
  }

  // เพิ่มสินค้าลงตะกร้า
  const addToCart = (item) => {
    if (item.category === 'Topping') {
      // Topping ต้องเลือกเครื่องดื่มก่อน
      if (cart.length === 0 || !cart.some(cartItem => cartItem.category !== 'Topping')) {
        alert('กรุณาเลือกเครื่องดื่มก่อนเพิ่ม Topping')
        return
      }
    }

    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  // ปรับจำนวนสินค้าในตะกร้า
  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId))
    } else {
      setCart(cart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  // คำนวณยอดรวม
  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
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
    if (cart.length === 0) {
      alert('ตะกร้าว่างเปล่า')
      return
    }

    const { total } = calculateTotal()
    const orderData = {
      items: cart,
      total_amount: total,
      promotion_id: selectedPromotion?.id || null,
      timestamp: new Date().toISOString()
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const newOrder = await response.json()
        setOrders([...orders, newOrder])
        setCart([])
        setSelectedPromotion(null)
        alert(`ชำระเงินสำเร็จ! ยอดรวม ฿${total}`)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      // สำรองข้อมูลใน localStorage
      const newOrder = {
        id: Date.now(),
        ...orderData,
        created_at: new Date().toISOString()
      }
      setOrders([...orders, newOrder])
      setCart([])
      setSelectedPromotion(null)
      alert(`ชำระเงินสำเร็จ! ยอดรวม ฿${total}`)
    }
  }

  // กรองเมนูตามหมวดหมู่
  const filteredMenuItems = selectedCategory === 'ทั้งหมด' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory)

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

  if (loading) {
    return (
      <div className="min-h-screen thai-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🚂</div>
          <p className="text-xl text-white">กำลังโหลด POS ชา-มา-รถ-ไฟ...</p>
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
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 overflow-x-auto">
            <button
              onClick={() => requireAuthentication('menu-manager')}
              className="bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap"
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
              onClick={() => requireAuthentication('promotion-management')}
              className="bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline text-sm lg:text-base">จัดการโปรโมชั่น</span>
            </button>
            <button
              onClick={() => setShowDailySales(true)}
              className="bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline text-sm lg:text-base">ยอดขายวันนี้</span>
            </button>
            <button
              onClick={() => requireAuthentication('analytics')}
              className="bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap"
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

            {/* Menu Items */}
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-thai-orange pb-2">
              🍃 เมนูเครื่องดื่ม 🍃
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMenuItems.map(item => (
                <div key={item.id} className="menu-item-card group">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                    {item.image}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                  <p className="text-thai-orange font-bold mb-2">฿{item.price}</p>
                  <p className="text-xs text-gray-500 mb-3">{item.category}</p>
                  <button
                    onClick={() => addToCart(item)}
                    className="btn-primary w-full"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    เพิ่ม
                  </button>
                </div>
              ))}
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
                  <div key={item.id} className="cart-item">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">฿{item.price} x {item.quantity}</p>
                      </div>
                      <button
                        onClick={() => updateCartQuantity(item.id, 0)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="btn-secondary p-1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="btn-secondary p-1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-thai-orange">
                        ฿{(item.price * item.quantity).toLocaleString()}
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
                    <p className="text-3xl font-bold">฿{dailySales.today.toLocaleString()}</p>
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
                    <p className="text-3xl font-bold">฿{dailySales.todayProfit.toLocaleString()}</p>
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

      {/* Analytics Modal */}
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
                        ฿{analyticsData.totalRevenue.toLocaleString()}
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
                        ฿{analyticsData.totalProfit.toLocaleString()}
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
                        {analyticsData.totalRevenue > 0 
                          ? ((analyticsData.totalProfit / analyticsData.totalRevenue) * 100).toFixed(1)
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
