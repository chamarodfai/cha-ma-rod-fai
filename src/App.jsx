import { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingCart, Receipt, Coffee, Database, BarChart3, Settings, Edit, Trash2, Save, Download, RefreshCw } from 'lucide-react'

const categories = ['ทั้งหมด', 'ชาไทย', 'ชาเขียว', 'กาแฟ', 'เครื่องดื่ม', 'Topping']

function App() {
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [showDashboard, setShowDashboard] = useState(false)
  const [showMenuManager, setShowMenuManager] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState({ name: '', price: '', cost: '', category: 'ชาไทย' })

  // โหลดข้อมูลจาก localStorage เมื่อเริ่มต้น
  // โหลดข้อมูลจาก Database เมื่อเริ่มต้น
  useEffect(() => {
    loadMenuFromDatabase()
    loadOrdersFromDatabase()
  }, [])

  const loadMenuFromDatabase = async () => {
    try {
      setLoading(true)
      
      // วิธีที่ 1: ลองใช้ Supabase โดยตรง
      try {
        if (typeof window !== 'undefined') {
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseUrl = 'https://ectkqadvtaywrodmqkuze.supabase.co';
          const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2dGF5d3JvZG1xa3V6ZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM3OTcxMzk4LCJleHAiOjIwNTM1NDczOTh9.YOJpUHaFbLaKsQiWpYgtGHnMY4x-Xf8WGnU2J6ZMtHs';
          
          const supabase = createClient(supabaseUrl, supabaseKey);
          console.log('Trying Supabase direct connection...');
          
          const { data: menu, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Supabase direct error:', error);
          } else if (menu && menu.length > 0) {
            console.log('✅ Menu loaded directly from Supabase:', menu);
            setMenuItems(menu);
            localStorage.setItem('thaiTeaMenuItemsBackup', JSON.stringify(menu));
            setLoading(false);
            return;
          }
        }
      } catch (supabaseError) {
        console.log('Supabase direct connection failed:', supabaseError);
      }
      
      // วิธีที่ 2: ลองใช้ API
      const baseUrl = window.location.hostname === 'localhost' ? '' : 'https://cha-ma-rodfaipos.vercel.app'
      console.log('Loading menu from API:', `${baseUrl}/api/menu`);
      
      const response = await fetch(`${baseUrl}/api/menu`)
      
      console.log('Menu API Response status:', response.status);
      console.log('Menu API Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json()
        console.log('Menu data loaded:', data);
        setMenuItems(data)
        // บันทึกเป็น backup ใน localStorage
        localStorage.setItem('thaiTeaMenuItemsBackup', JSON.stringify(data))
      } else {
        const errorText = await response.text();
        console.error('Menu API Error:', response.status, errorText);
        console.log('API response not ok:', response.status, response.statusText)
        throw new Error('ไม่สามารถโหลดเมนูจาก Database ได้')
      }
    } catch (error) {
      console.error('Error loading menu from database:', error)
      // ใช้ข้อมูลจาก localStorage เป็น fallback
      loadMenuFromStorage()
    } finally {
      setLoading(false)
    }
  }

  const loadOrdersFromDatabase = async () => {
    try {
      const baseUrl = window.location.hostname === 'localhost' ? '' : 'https://cha-ma-rodfaipos.vercel.app'
      const response = await fetch(`${baseUrl}/api/orders`)
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
        // บันทึกเป็น backup ใน localStorage
        localStorage.setItem('thaiTeaOrdersBackup', JSON.stringify(data))
      }
    } catch (error) {
      console.error('Error loading orders from database:', error)
      // ใช้ข้อมูลจาก localStorage เป็น fallback
      loadOrdersFromStorage()
    }
  }

  // บันทึกเมนูลง localStorage เป็น backup เท่านั้น
  useEffect(() => {
    if (menuItems.length > 0) {
      localStorage.setItem('thaiTeaMenuItemsBackup', JSON.stringify(menuItems))
    }
  }, [menuItems])

  // บันทึกออเดอร์ลง localStorage เป็น backup เท่านั้น
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('thaiTeaOrdersBackup', JSON.stringify(orders))
    }
  }, [orders])

  const loadMenuFromStorage = () => {
    try {
      const savedMenu = localStorage.getItem('thaiTeaMenuItemsBackup')
      if (savedMenu) {
        const parsedMenu = JSON.parse(savedMenu)
        setMenuItems(parsedMenu)
        setLoading(false)
        return
      }
    } catch (error) {
      console.error('Error loading menu from storage:', error)
    }
    
    // ถ้าไม่มีข้อมูลใน localStorage ให้ใช้ข้อมูลเริ่มต้น
    fetchMenuItems()
  }

  const loadOrdersFromStorage = () => {
    try {
      const savedOrders = localStorage.getItem('thaiTeaOrdersBackup')
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders)
        setOrders(parsedOrders)
      }
    } catch (error) {
      console.error('Error loading orders from storage:', error)
    }
  }

  const fetchMenuItems = () => {
    // ข้อมูลเริ่มต้นเมื่อใช้ครั้งแรก
    const defaultMenuData = [
      { id: 1, name: 'ชาไทยเย็น', price: 25, cost: 15, category: 'ชาไทย' },
      { id: 2, name: 'ชาไทยร้อน', price: 20, cost: 12, category: 'ชาไทย' },
      { id: 3, name: 'ชาเขียวเย็น', price: 30, cost: 18, category: 'ชาเขียว' },
      { id: 4, name: 'ชาเขียวร้อน', price: 25, cost: 15, category: 'ชาเขียว' },
      { id: 5, name: 'กาแฟเย็น', price: 35, cost: 20, category: 'กาแฟ' },
      { id: 6, name: 'กาแฟร้อน', price: 30, cost: 17, category: 'กาแฟ' },
      { id: 7, name: 'น้ำส้ม', price: 20, cost: 8, category: 'เครื่องดื่ม' },
      { id: 8, name: 'น้ำมะนาว', price: 15, cost: 5, category: 'เครื่องดื่ม' },
      { id: 9, name: 'โซดา', price: 18, cost: 7, category: 'เครื่องดื่ม' },
      { id: 10, name: 'ไข่มุก', price: 10, cost: 3, category: 'Topping' },
      { id: 11, name: 'วุ้นกะทิ', price: 8, cost: 2.5, category: 'Topping' },
      { id: 12, name: 'น้ำแดง', price: 15, cost: 5, category: 'เครื่องดื่มพิเศษ' }
    ]
    
    setMenuItems(defaultMenuData)
    setLoading(false)
  }

  const fetchOrders = async () => {
    // ไม่ใช้ API - เก็บออเดอร์ใน local state เท่านั้น
    console.log('Orders stored locally only')
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

  // ฟังก์ชั่นจัดการเมนู - แบบ offline-first
  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.cost) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }
    
    // สร้างเมนูใหม่แบบ local first
    const newMenuId = Math.max(...menuItems.map(item => item.id), 0) + 1
    const menuItem = {
      id: newMenuId,
      name: newItem.name,
      price: parseFloat(newItem.price),
      cost: parseFloat(newItem.cost),
      category: newItem.category,
      available: true
    }
    
    // อัพเดท UI ก่อน
    setMenuItems([...menuItems, menuItem])
    setNewItem({ name: '', price: '', cost: '', category: 'ชาไทย' })
    
    // พยายามบันทึกลง Supabase โดยตรงก่อน
    try {
      if (typeof window !== 'undefined') {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = 'https://ectkqadvtaywrodmqkuze.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2dGF5d3JvZG1xa3V6ZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM3OTcxMzk4LCJleHAiOjIwNTM1NDczOTh9.YOJpUHaFbLaKsQiWpYgtGHnMY4x-Xf8WGnU2J6ZMtHs';
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log('Trying to save menu item directly to Supabase...');
        
        const { data, error } = await supabase
          .from('menu_items')
          .insert([{
            name: newItem.name,
            price: parseFloat(newItem.price),
            cost: parseFloat(newItem.cost),
            category: newItem.category,
            available: true
          }])
          .select();

        if (!error && data && data.length > 0) {
          console.log('✅ Menu item saved directly to Supabase:', data[0]);
          // อัพเดท ID จาก Supabase
          setMenuItems(prev => prev.map(item => 
            item.id === newMenuId ? { ...item, id: data[0].id } : item
          ));
          alert('เพิ่มเมนูสำเร็จ! (บันทึกลง Supabase Database แล้ว)');
          return;
        } else {
          console.error('Supabase insert error:', error);
        }
      }
    } catch (supabaseError) {
      console.log('Supabase direct save failed:', supabaseError);
    }
    
    // fallback: พยายามบันทึกลง API
    try {
      const baseUrl = window.location.hostname === 'localhost' ? '' : 'https://cha-ma-rodfaipos.vercel.app'
      console.log('Attempting to save menu item to:', `${baseUrl}/api/menu`);
      
      const response = await fetch(`${baseUrl}/api/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newItem.name,
          price: parseFloat(newItem.price),
          cost: parseFloat(newItem.cost),
          category: newItem.category
        })
      })
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const savedItem = await response.json()
        console.log('Saved item:', savedItem);
        // อัพเดท ID จาก server
        setMenuItems(prev => prev.map(item => 
          item.id === newMenuId ? { ...item, id: savedItem.id } : item
        ))
        alert('เพิ่มเมนูสำเร็จ! (บันทึกลง Database แล้ว)')
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        alert('เพิ่มเมนูสำเร็จ! (บันทึกเฉพาะ Local) - API Error: ' + response.status)
      }
    } catch (error) {
      console.error('Error adding menu item to API:', error)
      alert('เพิ่มเมนูสำเร็จ! (บันทึกเฉพาะ Local) - Network Error: ' + error.message)
    }
  }

  const deleteMenuItem = async (itemId) => {
    if (confirm('ต้องการลบเมนูนี้หรือไม่?')) {
      // ลบจาก UI ก่อน
      setMenuItems(menuItems.filter(item => item.id !== itemId))
      
      // พยายามลบจาก API
      try {
        const baseUrl = window.location.hostname === 'localhost' ? '' : 'https://cha-ma-rodfaipos.vercel.app'
        const response = await fetch(`${baseUrl}/api/menu`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: itemId })
        })
        
        if (response.ok) {
          alert('ลบเมนูสำเร็จ! (บันทึกลง Database แล้ว)')
        } else {
          alert('ลบเมนูสำเร็จ! (บันทึกเฉพาะ Local)')
        }
      } catch (error) {
        console.error('Error deleting menu item from API:', error)
        alert('ลบเมนูสำเร็จ! (บันทึกเฉพาะ Local)')
      }
    }
  }

  const startEditItem = (item) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      price: item.price.toString(),
      cost: item.cost.toString(),
      category: item.category
    })
  }

  const saveEditItem = async () => {
    if (!editingItem.name || !editingItem.price || !editingItem.cost) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }
    
    // อัพเดท UI ก่อน
    const updatedItem = {
      id: editingItem.id,
      name: editingItem.name,
      price: parseFloat(editingItem.price),
      cost: parseFloat(editingItem.cost),
      category: editingItem.category,
      available: true
    }
    
    setMenuItems(menuItems.map(item => 
      item.id === editingItem.id ? updatedItem : item
    ))
    setEditingItem(null)
    
    // พยายามบันทึกลง API
    try {
      const baseUrl = window.location.hostname === 'localhost' ? '' : 'https://cha-ma-rodfaipos.vercel.app'
      const response = await fetch(`${baseUrl}/api/menu`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem)
      })
      
      if (response.ok) {
        alert('แก้ไขเมนูสำเร็จ! (บันทึกลง Database แล้ว)')
      } else {
        alert('แก้ไขเมนูสำเร็จ! (บันทึกเฉพาะ Local)')
      }
    } catch (error) {
      console.error('Error updating menu item in API:', error)
      alert('แก้ไขเมนูสำเร็จ! (บันทึกเฉพาะ Local)')
    }
  }

  // ฟังก์ชั่นจัดการข้อมูล
  const clearAllData = async () => {
    if (confirm('ต้องการล้างข้อมูลทั้งหมดหรือไม่? (จะลบข้อมูลใน Database ด้วย)')) {
      try {
        // ล้างข้อมูลใน localStorage
        localStorage.removeItem('thaiTeaMenuItemsBackup')
        localStorage.removeItem('thaiTeaOrdersBackup')
        localStorage.removeItem('thaiTeaMenuItems') // เก่า
        localStorage.removeItem('thaiTeaOrders') // เก่า
        
        // รีเซ็ต state
        setOrders([])
        setMenuItems([])
        
        // โหลดเมนูเริ่มต้นใหม่จาก Database
        await loadMenuFromDatabase()
        
        alert('ล้างข้อมูลเรียบร้อย!')
      } catch (error) {
        console.error('Error clearing data:', error)
        alert('เกิดข้อผิดพลาดในการล้างข้อมูล')
      }
    }
  }

  const exportData = async () => {
    try {
      // ดึงข้อมูลล่าสุดจาก Database
      const baseUrl = window.location.hostname === 'localhost' ? '' : 'https://cha-ma-rodfaipos.vercel.app'
      const [menuResponse, ordersResponse] = await Promise.all([
        fetch(`${baseUrl}/api/menu`),
        fetch(`${baseUrl}/api/orders`)
      ])
      
      const menuData = menuResponse.ok ? await menuResponse.json() : menuItems
      const ordersData = ordersResponse.ok ? await ordersResponse.json() : orders
      
      const data = {
        menuItems: menuData,
        orders: ordersData,
        exportDate: new Date().toISOString(),
        source: 'Supabase Database'
      }
      
      const dataStr = JSON.stringify(data, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `thai-tea-pos-backup-${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      alert('ส่งออกข้อมูลสำเร็จ!')
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล')
    }
  }

  const filteredItems = selectedCategory === 'ทั้งหมด' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory)

  const processOrder = async () => {
    if (cart.length === 0) {
      alert('กรุณาเลือกสินค้าก่อนสั่งซื้อ')
      return
    }
    
    // สร้าง Order ID แบบ local
    const orderId = Date.now()
    const currentDate = new Date()
    
    const orderSummary = cart.map(item => 
      `${item.name} x${item.quantity} = ${item.price * item.quantity}฿`
    ).join('\n')
    
    const total = getTotalPrice()
    
    // สร้างออเดอร์ใหม่
    const newOrder = {
      id: orderId,
      order_id: orderId,
      items: [...cart],
      total: total,
      created_at: currentDate.toISOString(),
      display_date: currentDate.toLocaleDateString('th-TH'),
      display_time: currentDate.toLocaleTimeString('th-TH')
    }
    
    // เพิ่มออเดอร์ใหม่เข้าไปในรายการ
    setOrders(prevOrders => [...prevOrders, newOrder])
    
    // แสดงผลออเดอร์
    alert(`✅ สั่งซื้อสำเร็จ!\n\nรายการสั่งซื้อ:\n${orderSummary}\n\nรวมทั้งสิ้น: ${total}฿\n\nหมายเลขออเดอร์: #${orderId}`)
    clearCart()
    
    // พยายามบันทึกลง API
    try {
      const baseUrl = window.location.hostname === 'localhost' ? '' : 'https://cha-ma-rodfaipos.vercel.app'
      const response = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          total: total,
          items: cart
        })
      })
      
      if (!response.ok) {
        console.log('Failed to save order to API, saved locally only')
      }
    } catch (error) {
      console.error('Error saving order to API:', error)
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
            <button
              onClick={() => {
                loadMenuFromDatabase()
                loadOrdersFromDatabase()
              }}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              title="รีเฟรชข้อมูลจาก Database"
            >
              <RefreshCw className="w-4 h-4" />
              <span>รีเฟรช</span>
            </button>
            <button
              onClick={() => setShowMenuManager(!showMenuManager)}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>จัดการเมนู</span>
            </button>
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              วันที่: {new Date().toLocaleDateString('th-TH')}
            </div>
          </div>
        </div>
      </header>

      {/* Menu Manager Modal */}
      {showMenuManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">จัดการเมนู</h2>
              <button
                onClick={() => setShowMenuManager(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Data Management */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold mb-4">จัดการข้อมูล</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={exportData}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>ส่งออกข้อมูล</span>
                </button>
                <button
                  onClick={clearAllData}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ล้างข้อมูลทั้งหมด</span>
                </button>
                <div className="text-sm text-gray-600 flex items-center">
                  <span>🗄️ ข้อมูลบันทึกใน Supabase Database v2.0</span>
                </div>
              </div>
            </div>

            {/* Add New Item Form */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold mb-4">เพิ่มเมนูใหม่</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="ชื่อเมนู"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="ราคาขาย (บาท)"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="ต้นทุน (บาท)"
                  value={newItem.cost}
                  onChange={(e) => setNewItem({...newItem, cost: e.target.value})}
                  className="input"
                />
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="input"
                >
                  {categories.filter(cat => cat !== 'ทั้งหมด').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  onClick={addMenuItem}
                  className="btn btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่ม</span>
                </button>
              </div>
            </div>

            {/* Menu Items List */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">รายการเมนูทั้งหมด</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ชื่อเมนู</th>
                      <th className="text-left p-2">ประเภท</th>
                      <th className="text-left p-2">ราคาขาย</th>
                      <th className="text-left p-2">ต้นทุน</th>
                      <th className="text-left p-2">กำไร</th>
                      <th className="text-left p-2">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map(item => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        {editingItem && editingItem.id === item.id ? (
                          <>
                            <td className="p-2">
                              <input
                                type="text"
                                value={editingItem.name}
                                onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                                className="input text-sm"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={editingItem.category}
                                onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                                className="input text-sm"
                              >
                                {categories.filter(cat => cat !== 'ทั้งหมด').map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={editingItem.price}
                                onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                                className="input text-sm"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={editingItem.cost}
                                onChange={(e) => setEditingItem({...editingItem, cost: e.target.value})}
                                className="input text-sm"
                              />
                            </td>
                            <td className="p-2">
                              <span className="text-green-600 font-semibold">
                                {parseFloat(editingItem.price || 0) - parseFloat(editingItem.cost || 0)}฿
                              </span>
                            </td>
                            <td className="p-2">
                              <div className="flex space-x-2">
                                <button
                                  onClick={saveEditItem}
                                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1"
                                >
                                  <Save className="w-3 h-3" />
                                  <span>บันทึก</span>
                                </button>
                                <button
                                  onClick={() => setEditingItem(null)}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-2 font-medium">{item.name}</td>
                            <td className="p-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {item.category}
                              </span>
                            </td>
                            <td className="p-2 font-semibold text-thai-orange">{item.price}฿</td>
                            <td className="p-2 text-gray-600">{item.cost}฿</td>
                            <td className="p-2">
                              <span className="text-green-600 font-semibold">
                                {item.price - item.cost}฿
                              </span>
                            </td>
                            <td className="p-2">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => startEditItem(item)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>แก้ไข</span>
                                </button>
                                <button
                                  onClick={() => deleteMenuItem(item.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>ลบ</span>
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

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
