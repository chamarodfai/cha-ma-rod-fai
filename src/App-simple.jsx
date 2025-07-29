import { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingCart, Receipt, Coffee, Database, BarChart3, Settings, Edit, Trash2, Save, Download, TrendingUp, Calendar, PieChart, X } from 'lucide-react'

export default function App() {
  // States สำหรับเมนู
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'ชาไทย', price: 25, category: 'ชา', image: '🧡', cost: 15 },
    { id: 2, name: 'ชาเขียว', price: 25, category: 'ชา', image: '🍃', cost: 15 },
    { id: 3, name: 'กาแฟดำ', price: 20, category: 'กาแฟ', image: '☕', cost: 12 },
    { id: 4, name: 'กาแฟนม', price: 30, category: 'กาแฟ', image: '🥛', cost: 18 },
    { id: 5, name: 'น้ำมะนาว', price: 15, category: 'น้ำผลไม้', image: '🍋', cost: 8 },
    { id: 6, name: 'น้ำส้ม', price: 20, category: 'น้ำผลไม้', image: '🍊', cost: 12 },
  ])

  // States สำหรับตะกร้า
  const [cartItems, setCartItems] = useState([])
  
  // States สำหรับระบบรหัสผ่าน
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [pendingAction, setPendingAction] = useState('')
  const adminPassword = 'chamarodfai1020' // รหัสผ่านสำหรับผู้ดูแลระบบ - Final Update

  // States สำหรับการแสดงผล
  const [showMenuManager, setShowMenuManager] = useState(false)
  const [showOrderHistory, setShowOrderHistory] = useState(false)
  const [orders, setOrders] = useState([])
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState(null)

  // ฟังก์ชันเพิ่มสินค้าลงตะกร้า
  const addToCart = (menuItem) => {
    const existingItem = cartItems.find(item => item.id === menuItem.id)
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCartItems([...cartItems, { ...menuItem, quantity: 1 }])
    }
  }

  // ฟังก์ชันลดจำนวนสินค้า
  const decreaseQuantity = (itemId) => {
    setCartItems(cartItems.map(item =>
      item.id === itemId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ).filter(item => item.quantity > 0))
  }

  // ฟังก์ชันเพิ่มจำนวนสินค้า
  const increaseQuantity = (itemId) => {
    setCartItems(cartItems.map(item =>
      item.id === itemId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ))
  }

  // ฟังก์ชันลบสินค้าออกจากตะกร้า
  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId))
  }

  // คำนวณยอดรวม
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // ฟังก์ชันชำระเงิน
  const checkout = () => {
    if (cartItems.length === 0) {
      alert('ตะกร้าว่างเปล่า')
      return
    }

    const newOrder = {
      id: Date.now(),
      items: [...cartItems],
      totalAmount,
      timestamp: new Date().toLocaleString('th-TH'),
      formattedOrderId: `ORD-${String(Date.now()).slice(-6)}`
    }

    setOrders([...orders, newOrder])
    setReceiptData(newOrder)
    setShowReceipt(true)
    setCartItems([])
    alert(`ชำระเงินสำเร็จ! ยอดรวม ฿${totalAmount}`)
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
      } else if (pendingAction === 'order-history') {
        setShowOrderHistory(true)
      }
    } else {
      alert('รหัสผ่านไม่ถูกต้อง')
      setPassword('')
    }
  }

  // ฟังก์ชันขอการยืนยันตัวตน
  const requireAuthentication = (action) => {
    setPendingAction(action)
    setShowPasswordModal(true)
  }

  return (
    <div className="min-h-screen thai-gradient-bg">
      {/* Header */}
      <header className="thai-header-bg text-white p-4 shadow-xl">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-white/25 p-2 rounded-full shadow-lg glow-orange">
              🚂
            </div>
            <h1 className="text-2xl font-bold drop-shadow-md">
              POS CHA MA ROD FAI (ชา-มา-รถ-ไฟ) ☕🚂
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => requireAuthentication('menu-manager')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>จัดการเมนู</span>
            </button>
            <button
              onClick={() => requireAuthentication('order-history')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Receipt className="w-4 h-4" />
              <span>ประวัติการขาย</span>
            </button>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              วันที่: {new Date().toLocaleDateString('th-TH')}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="lg:col-span-2">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 glass-morphism">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-thai-orange pb-2">
              🍃 เมนูเครื่องดื่ม 🍃
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {menuItems.map(item => (
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
              ตะกร้าสินค้า ({cartItems.length})
            </h2>
            
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Coffee className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>ตะกร้าว่างเปล่า</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">฿{item.price} x {item.quantity}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="btn-secondary p-1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-medium">{item.quantity}</span>
                        <button
                          onClick={() => increaseQuantity(item.id)}
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
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>ยอดรวม:</span>
                    <span className="text-thai-orange">฿{totalAmount.toLocaleString()}</span>
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
    </div>
  )
}
