import { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingCart, Receipt, Coffee, Database, BarChart3 } from 'lucide-react'

const categories = ['ทั้งหมด', 'ชาเย็น', 'ชาร้อน', 'ชาปั่น', 'กาแฟ', 'เครื่องดื่มพิเศษ']

function App() {
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [showDashboard, setShowDashboard] = useState(false)

  // โหลดเมนูจาก API (with fallback)
  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      // ใช้ข้อมูล fallback โดยตรงเพื่อให้แอปทำงานได้ทันที
      const fallbackData = [
        { id: 1, name: 'ชาไทยเย็น', price: 25, category: 'ชาเย็น' },
        { id: 2, name: 'ชาไทยร้อน', price: 20, category: 'ชาร้อน' },
        { id: 3, name: 'ชาเขียวเย็น', price: 25, category: 'ชาเย็น' },
        { id: 4, name: 'ชาเขียวร้อน', price: 20, category: 'ชาร้อน' },
        { id: 5, name: 'ชาดำเย็น', price: 20, category: 'ชาเย็น' },
        { id: 6, name: 'ชาดำร้อน', price: 15, category: 'ชาร้อน' },
        { id: 7, name: 'ชาไทยปั่น', price: 35, category: 'ชาปั่น' },
        { id: 8, name: 'ชาเขียวปั่น', price: 35, category: 'ชาปั่น' },
        { id: 9, name: 'กาแฟเย็น', price: 30, category: 'กาแฟ' },
        { id: 10, name: 'กาแฟร้อน', price: 25, category: 'กาแฟ' },
        { id: 11, name: 'โอเลี้ยง', price: 35, category: 'เครื่องดื่มพิเศษ' },
        { id: 12, name: 'น้ำแดง', price: 15, category: 'เครื่องดื่มพิเศษ' }
      ]
      
      setMenuItems(fallbackData)
      
      // ลองโหลดจาก API (แต่ไม่บล็อกการทำงาน)
      try {
        const response = await fetch('/api/menu')
        if (response.ok) {
          const data = await response.json()
          setMenuItems(data)
        }
      } catch (apiError) {
        console.log('API not available, using fallback data')
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
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

  const addToCart = (item) => {
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

  const removeFromCart = (itemId) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId)
    if (existingItem.quantity === 1) {
      setCart(cart.filter(cartItem => cartItem.id !== itemId))
    } else {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ))
    }
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const filteredItems = selectedCategory === 'ทั้งหมด' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory)

  const processOrder = async () => {
    if (cart.length === 0) {
      alert('กรุณาเลือกสินค้าก่อนสั่งซื้อ')
      return
    }
    
    try {
      setLoading(true)
      
      // สร้าง Order ID แบบ local
      const orderId = Date.now()
      
      const orderSummary = cart.map(item => 
        `${item.name} x${item.quantity} = ${item.price * item.quantity}฿`
      ).join('\n')
      
      const total = getTotalPrice()
      
      // ลองบันทึกลง API (แต่ไม่บล็อกถ้าไม่สำเร็จ)
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: cart,
            total: total
          })
        })
        
        if (response.ok) {
          const order = await response.json()
          alert(`✅ สั่งซื้อสำเร็จ!\n\nรายการสั่งซื้อ:\n${orderSummary}\n\nรวมทั้งสิ้น: ${total}฿\n\nหมายเลขออเดอร์: #${order.id}`)
        } else {
          throw new Error('API Error')
        }
      } catch (apiError) {
        // แสดงผลแบบ offline mode
        alert(`✅ สั่งซื้อสำเร็จ!\n\nรายการสั่งซื้อ:\n${orderSummary}\n\nรวมทั้งสิ้น: ${total}฿\n\nหมายเลขออเดอร์: #${orderId}\n\n📱 (โหมดออฟไลน์)`)
      }
      
      clearCart()
    } catch (error) {
      console.error('Error processing order:', error)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-thai-orange to-thai-gold text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coffee className="w-8 h-8" />
            <h1 className="text-2xl font-bold">POS ร้านชาไทย</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 px-3 py-1 rounded-full">
              วันที่: {new Date().toLocaleDateString('th-TH')}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">เมนูเครื่องดื่ม</h2>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-thai-orange text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => (
                  <div key={item.id} className="menu-item-card" onClick={() => addToCart(item)}>
                    <div className="flex flex-col h-full">
                      <h3 className="font-semibold text-gray-800 mb-2">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-lg font-bold text-thai-orange">{item.price}฿</span>
                        <button className="bg-thai-orange hover:bg-orange-600 text-white p-2 rounded-full transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  ตะกร้าสินค้า
                </h2>
                <span className="bg-thai-orange text-white px-2 py-1 rounded-full text-sm">
                  {getTotalItems()}
                </span>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ไม่มีสินค้าในตะกร้า</p>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.price}฿ x {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="p-1 bg-green-100 hover:bg-green-200 text-green-600 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center text-lg font-bold text-gray-800">
                      <span>รวมทั้งสิ้น:</span>
                      <span className="text-thai-orange">{getTotalPrice()}฿</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={processOrder}
                      className="w-full btn-primary flex items-center justify-center"
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      สั่งซื้อ
                    </button>
                    <button
                      onClick={clearCart}
                      className="w-full btn-secondary"
                    >
                      ล้างตะกร้า
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
