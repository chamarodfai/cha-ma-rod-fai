import { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingCart, Receipt, Coffee, Database, BarChart3, Settings, Edit, Trash2, Save, Download, RefreshCw, TrendingUp, Calendar, PieChart, X } from 'lucide-react'
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
  const [showDashboard, setShowDashboard] = useState(false)
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
  const [selectedPromotion, setSelectedPromotion] = useState(null)
  const [showPromotionManager, setShowPromotionManager] = useState(false)
  const [showPromotionManagement, setShowPromotionManagement] = useState(false) // หน้าจัดการโปรโมชั่นแยก
  const [newPromotion, setNewPromotion] = useState({ 
    name: '', 
    type: 'percentage', // percentage, fixed
    value: '', 
    minAmount: '',
    description: '' 
  })
  const [editingPromotion, setEditingPromotion] = useState(null) // สำหรับแก้ไขโปรโมชั่น
  
  // States สำหรับระบบหมายเลขออเดอร์
  const [dailyOrderCount, setDailyOrderCount] = useState({}) // เก็บจำนวนออเดอร์แต่ละวัน
  
  // States สำหรับ Dashboard
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [analyticsData, setAnalyticsData] = useState({
    daily: {},
    weekly: {},
    monthly: {},
    yearly: {},
    totalRevenue: 0,
    totalProfit: 0,
    popularItems: [],
    menuDetails: {
      daily: {},
      weekly: {},
      monthly: {},
      yearly: {}
    }
  })
  const [selectedPeriod, setSelectedPeriod] = useState('daily') // daily, weekly, monthly, yearly
  
  // States สำหรับใบเสร็จ
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState(null)

  // โหลดข้อมูลจาก localStorage เมื่อเริ่มต้น
  // โหลดข้อมูลจาก Database เมื่อเริ่มต้น
  useEffect(() => {
    loadMenuFromDatabase()
    loadOrdersFromDatabase()
    loadPromotions()
    loadDailyOrderCount()
  }, [])

  // บันทึกข้อมูลการนับออเดอร์เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (Object.keys(dailyOrderCount).length > 0) {
      saveDailyOrderCount(dailyOrderCount)
    }
  }, [dailyOrderCount])

  // โหลดข้อมูลวิเคราะห์เมื่อมีการเปลี่ยนแปลงออเดอร์หรือเมนู
  useEffect(() => {
    if (orders.length > 0 && menuItems.length > 0) {
      // ลองโหลดจาก database ก่อน แล้วค่อย fallback เป็น local analysis
      loadAnalyticsFromDatabase()
    }
  }, [orders, menuItems])

  const loadMenuFromDatabase = async () => {
    try {
      setLoading(true)
      
      // วิธีที่ 1: ลองใช้ Supabase โดยตรง
      try {
        if (typeof window !== 'undefined') {
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseUrl = 'https://ectkqadvatwrodmqkuze.supabase.co';
          const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2YXR3cm9kbXFrdXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTI1MDMsImV4cCI6MjA2OTEyODUwM30.vpKbaq98KYcMU_1s_co3oLLcjRvL010KYOrvf2JnpoE';
          
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
    // ถ้าเป็นเครื่องดื่ม (ไม่ใช่ Topping) ให้เลือก drink ก่อน
    if (item.category !== 'Topping') {
      setSelectedDrink(item)
      setSelectedToppings([])
      // ไม่เปิด modal ทันที ให้เลือก topping ก่อน
      return
    }
    
    // ถ้าเป็น Topping และมี drink ที่เลือกแล้ว
    if (item.category === 'Topping' && selectedDrink) {
      const existingTopping = selectedToppings.find(topping => topping.id === item.id)
      if (!existingTopping) {
        setSelectedToppings([...selectedToppings, item])
      }
      return
    }
    
    // สำหรับกรณีปกติ (backward compatibility)
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

  // ฟังก์ชันลบ topping ที่เลือก
  const removeTopping = (toppingId) => {
    setSelectedToppings(selectedToppings.filter(topping => topping.id !== toppingId))
  }

  // ฟังก์ชันยืนยันการสั่ง
  const confirmOrder = () => {
    if (!selectedDrink) return
    
    // เปิด modal เพื่อยืนยัน
    setShowConfirmModal(true)
  }

  // ฟังก์ชันยืนยันการสั่งจริง
  const finalConfirmOrder = () => {
    if (!selectedDrink) return
    
    // สร้าง item ใหม่ที่รวม drink + toppings
    const totalPrice = selectedDrink.price + selectedToppings.reduce((sum, topping) => sum + topping.price, 0)
    const drinkWithToppings = {
      id: `${selectedDrink.id}_${Date.now()}`, // สร้าง unique ID
      name: selectedDrink.name,
      price: totalPrice,
      originalPrice: selectedDrink.price,
      toppings: selectedToppings,
      quantity: 1,
      category: selectedDrink.category
    }
    
    setCart([...cart, drinkWithToppings])
    
    // Reset selections
    setSelectedDrink(null)
    setSelectedToppings([])
    setShowConfirmModal(false)
  }

  // ฟังก์ชันยกเลิกการสั่ง
  const cancelOrder = () => {
    setSelectedDrink(null)
    setSelectedToppings([])
    setShowConfirmModal(false)
  }

  // ฟังก์ชันเพิ่มสินค้าแบบตรง (สำหรับรายการทั่วไป)
  const addToCartDirect = (item) => {
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

  // ฟังก์ชันโหลดโปรโมชั่นจาก Database
  const loadPromotions = async () => {
    try {
      const response = await fetch('/api/promotions')
      if (response.ok) {
        const data = await response.json()
        // กรองเฉพาะโปรโมชั่นที่ active และยังไม่หมดอายุ
        const activePromotions = data.filter(promo => {
          const now = new Date()
          const endDate = promo.end_date ? new Date(promo.end_date) : null
          return promo.is_active && (!endDate || endDate > now)
        })
        setPromotions(activePromotions)
      } else {
        console.error('Failed to load promotions from database')
        loadDefaultPromotions()
      }
    } catch (error) {
      console.error('Error loading promotions:', error)
      loadDefaultPromotions()
    }
  }

  // ฟังก์ชันโหลดโปรโมชั่นเริ่มต้น (fallback)
  const loadDefaultPromotions = () => {
    const defaultPromotions = [
      {
        id: 1,
        name: 'ลด 10%',
        type: 'percentage',
        value: 10,
        min_amount: 50,
        description: 'ลด 10% เมื่อซื้อครบ 50 บาท',
        is_active: true
      },
      {
        id: 2,
        name: 'ลด 20 บาท',
        type: 'fixed',
        value: 20,
        min_amount: 100,
        description: 'ลด 20 บาท เมื่อซื้อครบ 100 บาท',
        is_active: true
      }
    ]
    setPromotions(defaultPromotions)
  }

  // ฟังก์ชันคำนวณส่วนลด
  const calculateDiscount = (promotion, totalAmount) => {
    const minAmount = promotion.min_amount || promotion.minAmount || 0
    if (totalAmount < minAmount) return 0
    
    if (promotion.type === 'percentage') {
      return Math.floor(totalAmount * promotion.value / 100)
    } else {
      return promotion.value
    }
  }

  // ฟังก์ชันรับส่วนลด
  const applyPromotion = (promotion) => {
    const totalAmount = getTotalPrice()
    const discount = calculateDiscount(promotion, totalAmount)
    const minAmount = promotion.min_amount || promotion.minAmount || 0
    
    if (discount > 0) {
      setSelectedPromotion(promotion)
      setShowPromotionModal(false)
    } else {
      alert(`ยอดซื้อขั้นต่ำ ${minAmount} บาท`)
    }
  }

  // ฟังก์ชันลบส่วนลด
  const removePromotion = () => {
    setSelectedPromotion(null)
  }

  // ฟังก์ชันเพิ่มโปรโมชั่นใหม่
  // ฟังก์ชันเพิ่มโปรโมชั่นใหม่
  const addPromotion = async () => {
    if (!newPromotion.name || !newPromotion.value) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }
    
    const promotionData = {
      name: newPromotion.name,
      type: newPromotion.type,
      value: parseFloat(newPromotion.value),
      min_amount: parseFloat(newPromotion.minAmount) || 0,
      description: newPromotion.description || `${newPromotion.name} ${newPromotion.type === 'percentage' ? newPromotion.value + '%' : newPromotion.value + ' บาท'}`,
      is_active: true
    }
    
    try {
      const baseUrl = window.location.hostname === 'localhost' ? '' : 'https://cha-ma-rodfaipos.vercel.app'
      const response = await fetch(`${baseUrl}/api/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotionData)
      })
      
      if (response.ok) {
        const newPromotionFromDB = await response.json()
        setPromotions([...promotions, newPromotionFromDB])
        setNewPromotion({ name: '', type: 'percentage', value: '', minAmount: '', description: '' })
        alert('เพิ่มโปรโมชั่นสำเร็จ!')
      } else {
        alert('เกิดข้อผิดพลาดในการเพิ่มโปรโมชั่น')
      }
    } catch (error) {
      console.error('Error adding promotion:', error)
      // Fallback to local storage
      const localPromotion = {
        id: Date.now(),
        ...promotionData,
        min_amount: promotionData.min_amount // for backward compatibility
      }
      setPromotions([...promotions, localPromotion])
      setNewPromotion({ name: '', type: 'percentage', value: '', minAmount: '', description: '' })
    }
  }

  // ฟังก์ชันลบโปรโมชั่น
  const deletePromotion = async (promotionId) => {
    try {
      const baseUrl = window.location.hostname === 'localhost' ? '' : 'https://cha-ma-rodfaipos.vercel.app'
      const response = await fetch(`${baseUrl}/api/promotions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: promotionId })
      })
      
      if (response.ok) {
        setPromotions(promotions.filter(p => p.id !== promotionId))
        if (selectedPromotion?.id === promotionId) {
          setSelectedPromotion(null)
        }
        alert('ลบโปรโมชั่นสำเร็จ!')
      } else {
        alert('เกิดข้อผิดพลาดในการลบโปรโมชั่น')
      }
    } catch (error) {
      console.error('Error deleting promotion:', error)
      // Fallback to local deletion
      setPromotions(promotions.filter(p => p.id !== promotionId))
      if (selectedPromotion?.id === promotionId) {
        setSelectedPromotion(null)
      }
    }
  }

  // ฟังก์ชันแก้ไขโปรโมชั่น
  const updatePromotion = async () => {
    if (!editingPromotion || !editingPromotion.name || !editingPromotion.value) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    const updatedData = {
      id: editingPromotion.id,
      name: editingPromotion.name,
      type: editingPromotion.type,
      value: parseFloat(editingPromotion.value),
      min_amount: parseFloat(editingPromotion.minAmount) || 0,
      description: editingPromotion.description || `${editingPromotion.name} ${editingPromotion.type === 'percentage' ? editingPromotion.value + '%' : editingPromotion.value + ' บาท'}`,
      is_active: editingPromotion.is_active !== false
    }

    try {
      const baseUrl = window.location.hostname === 'localhost' ? '' : 'https://cha-ma-rodfaipos.vercel.app'
      const response = await fetch(`${baseUrl}/api/promotions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      })

      if (response.ok) {
        const updatedPromotion = await response.json()
        setPromotions(promotions.map(p => p.id === editingPromotion.id ? updatedPromotion : p))
        setEditingPromotion(null)
        alert('แก้ไขโปรโมชั่นสำเร็จ!')
      } else {
        alert('เกิดข้อผิดพลาดในการแก้ไขโปรโมชั่น')
      }
    } catch (error) {
      console.error('Error updating promotion:', error)
      // Fallback to local update
      const updatedPromotion = { ...editingPromotion, ...updatedData }
      setPromotions(promotions.map(p => p.id === editingPromotion.id ? updatedPromotion : p))
      setEditingPromotion(null)
    }
  }

  // ฟังก์ชันเปิดการแก้ไขโปรโมชั่น
  const startEditPromotion = (promotion) => {
    setEditingPromotion({
      id: promotion.id,
      name: promotion.name,
      type: promotion.type,
      value: promotion.value.toString(),
      minAmount: (promotion.min_amount || promotion.minAmount || 0).toString(),
      description: promotion.description || '',
      is_active: promotion.is_active
    })
  }

  // ฟังก์ชันยกเลิกการแก้ไข
  const cancelEditPromotion = () => {
    setEditingPromotion(null)
  }

  // ฟังก์ชันสร้างหมายเลขออเดอร์
  const generateOrderId = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const dateKey = `${year}${month}${day}`
    
    // ดึงจำนวนออเดอร์ของวันนี้
    const todayCount = dailyOrderCount[dateKey] || 0
    const newCount = todayCount + 1
    
    // อัปเดตจำนวนออเดอร์ของวันนี้
    setDailyOrderCount(prev => ({
      ...prev,
      [dateKey]: newCount
    }))
    
    // สร้างหมายเลขออเดอร์ YYYYMMDD + ลำดับ 4 หลัก
    const sequence = String(newCount).padStart(4, '0')
    return `${dateKey}${sequence}`
  }

  // ฟังก์ชันโหลดข้อมูลการนับออเดอร์
  const loadDailyOrderCount = () => {
    try {
      const saved = localStorage.getItem('thaiTeaDailyOrderCount')
      if (saved) {
        setDailyOrderCount(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading daily order count:', error)
    }
  }

  // ฟังก์ชันบันทึกข้อมูลการนับออเดอร์
  const saveDailyOrderCount = (countData) => {
    try {
      localStorage.setItem('thaiTeaDailyOrderCount', JSON.stringify(countData))
    } catch (error) {
      console.error('Error saving daily order count:', error)
    }
  }

  // ฟังก์ชันแสดงหมายเลขออเดอร์ในรูปแบบที่อ่านง่าย
  const formatOrderId = (orderId) => {
    if (typeof orderId === 'string' && orderId.length === 12) {
      // แยกส่วนวันที่และลำดับ
      const year = orderId.substring(0, 4)
      const month = orderId.substring(4, 6)
      const day = orderId.substring(6, 8)
      const sequence = orderId.substring(8, 12)
      
      return `${year}/${month}/${day}-${sequence}`
    }
    return orderId // ถ้าไม่ใช่รูปแบบใหม่ให้แสดงตามเดิม
  }

  // ฟังก์ชันวิเคราะห์ข้อมูลสำหรับ Dashboard
  const analyzeOrderData = () => {
    const analysis = {
      daily: {},
      weekly: {},
      monthly: {},
      yearly: {},
      totalRevenue: 0,
      totalProfit: 0,
      popularItems: [],
      // เพิ่มข้อมูลรายละเอียดของแต่ละเมนูในแต่ละช่วงเวลา
      menuDetails: {
        daily: {},
        weekly: {},
        monthly: {},
        yearly: {}
      }
    }

    // วิเคราะห์ข้อมูลรายวัน รายสัปดาห์ รายเดือน รายปี
    orders.forEach(order => {
      const orderDate = new Date(order.created_at)
      const dayKey = orderDate.toISOString().split('T')[0] // YYYY-MM-DD
      const weekKey = getWeekKey(orderDate)
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`
      const yearKey = `${orderDate.getFullYear()}`

      const revenue = order.total
      const cost = order.items?.reduce((sum, item) => {
        const menuItem = menuItems.find(m => m.id === item.id)
        return sum + (menuItem?.cost || 0) * item.quantity
      }, 0) || 0
      const profit = revenue - cost

      // รายวัน
      if (!analysis.daily[dayKey]) {
        analysis.daily[dayKey] = { orders: 0, revenue: 0, profit: 0 }
      }
      analysis.daily[dayKey].orders += 1
      analysis.daily[dayKey].revenue += revenue
      analysis.daily[dayKey].profit += profit

      // รายสัปดาห์
      if (!analysis.weekly[weekKey]) {
        analysis.weekly[weekKey] = { orders: 0, revenue: 0, profit: 0 }
      }
      analysis.weekly[weekKey].orders += 1
      analysis.weekly[weekKey].revenue += revenue
      analysis.weekly[weekKey].profit += profit

      // รายเดือน
      if (!analysis.monthly[monthKey]) {
        analysis.monthly[monthKey] = { orders: 0, revenue: 0, profit: 0 }
      }
      analysis.monthly[monthKey].orders += 1
      analysis.monthly[monthKey].revenue += revenue
      analysis.monthly[monthKey].profit += profit

      // รายปี
      if (!analysis.yearly[yearKey]) {
        analysis.yearly[yearKey] = { orders: 0, revenue: 0, profit: 0 }
      }
      analysis.yearly[yearKey].orders += 1
      analysis.yearly[yearKey].revenue += revenue
      analysis.yearly[yearKey].profit += profit

      // วิเคราะห์รายละเอียดแต่ละเมนูในแต่ละช่วงเวลา
      order.items?.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.id)
        const itemCost = (menuItem?.cost || 0) * item.quantity
        const itemRevenue = item.price * item.quantity
        const itemProfit = itemRevenue - itemCost

        // รายวัน - รายละเอียดเมนู
        if (!analysis.menuDetails.daily[dayKey]) {
          analysis.menuDetails.daily[dayKey] = {}
        }
        if (!analysis.menuDetails.daily[dayKey][item.id]) {
          analysis.menuDetails.daily[dayKey][item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0
          }
        }
        analysis.menuDetails.daily[dayKey][item.id].quantity += item.quantity
        analysis.menuDetails.daily[dayKey][item.id].revenue += itemRevenue
        analysis.menuDetails.daily[dayKey][item.id].cost += itemCost
        analysis.menuDetails.daily[dayKey][item.id].profit += itemProfit

        // รายสัปดาห์ - รายละเอียดเมนู
        if (!analysis.menuDetails.weekly[weekKey]) {
          analysis.menuDetails.weekly[weekKey] = {}
        }
        if (!analysis.menuDetails.weekly[weekKey][item.id]) {
          analysis.menuDetails.weekly[weekKey][item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0
          }
        }
        analysis.menuDetails.weekly[weekKey][item.id].quantity += item.quantity
        analysis.menuDetails.weekly[weekKey][item.id].revenue += itemRevenue
        analysis.menuDetails.weekly[weekKey][item.id].cost += itemCost
        analysis.menuDetails.weekly[weekKey][item.id].profit += itemProfit

        // รายเดือน - รายละเอียดเมนู
        if (!analysis.menuDetails.monthly[monthKey]) {
          analysis.menuDetails.monthly[monthKey] = {}
        }
        if (!analysis.menuDetails.monthly[monthKey][item.id]) {
          analysis.menuDetails.monthly[monthKey][item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0
          }
        }
        analysis.menuDetails.monthly[monthKey][item.id].quantity += item.quantity
        analysis.menuDetails.monthly[monthKey][item.id].revenue += itemRevenue
        analysis.menuDetails.monthly[monthKey][item.id].cost += itemCost
        analysis.menuDetails.monthly[monthKey][item.id].profit += itemProfit

        // รายปี - รายละเอียดเมนู
        if (!analysis.menuDetails.yearly[yearKey]) {
          analysis.menuDetails.yearly[yearKey] = {}
        }
        if (!analysis.menuDetails.yearly[yearKey][item.id]) {
          analysis.menuDetails.yearly[yearKey][item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0
          }
        }
        analysis.menuDetails.yearly[yearKey][item.id].quantity += item.quantity
        analysis.menuDetails.yearly[yearKey][item.id].revenue += itemRevenue
        analysis.menuDetails.yearly[yearKey][item.id].cost += itemCost
        analysis.menuDetails.yearly[yearKey][item.id].profit += itemProfit
      })

      analysis.totalRevenue += revenue
      analysis.totalProfit += profit
    })

    // วิเคราะห์สินค้ายอดนิยม
    const itemCounts = {}
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!itemCounts[item.id]) {
          itemCounts[item.id] = { 
            id: item.id, 
            name: item.name, 
            count: 0, 
            revenue: 0 
          }
        }
        itemCounts[item.id].count += item.quantity
        itemCounts[item.id].revenue += item.price * item.quantity
      })
    })

    const totalItems = Object.values(itemCounts).reduce((sum, item) => sum + item.count, 0)
    analysis.popularItems = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(item => ({
        ...item,
        percentage: totalItems > 0 ? ((item.count / totalItems) * 100).toFixed(1) : 0
      }))

    return analysis
  }

  // ฟังก์ชันหาสัปดาห์
  const getWeekKey = (date) => {
    const week = getWeekNumber(date)
    return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`
  }

  // ฟังก์ชันหาเลขสัปดาห์ในปี
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  }

  // ฟังก์ชันโหลดข้อมูลวิเคราะห์
  const loadAnalyticsData = () => {
    const analysis = analyzeOrderData()
    setAnalyticsData(analysis)
  }

  // ฟังก์ชันโหลดข้อมูลวิเคราะห์จาก Database
  const loadAnalyticsFromDatabase = async () => {
    try {
      const baseUrl = window.location.hostname === 'localhost' ? '' : 'https://cha-ma-rodfaipos.vercel.app'
      
      // โหลดข้อมูลสรุปรายวัน
      const [dailyResponse, itemsResponse, popularResponse] = await Promise.all([
        fetch(`${baseUrl}/api/analytics?period=daily`),
        fetch(`${baseUrl}/api/analytics?period=items`),
        fetch(`${baseUrl}/api/analytics?period=popular-items`)
      ])

      if (dailyResponse.ok && itemsResponse.ok && popularResponse.ok) {
        const dailyData = await dailyResponse.json()
        const itemsData = await itemsResponse.json()
        const popularData = await popularResponse.json()

        // แปลงข้อมูลจาก database ให้เข้ากับรูปแบบของ analytics
        const databaseAnalytics = {
          daily: {},
          weekly: {},
          monthly: {},
          yearly: {},
          totalRevenue: 0,
          totalProfit: 0,
          popularItems: popularData.popularItems || [],
          menuDetails: {
            daily: {},
            weekly: {},
            monthly: {},
            yearly: {}
          }
        }

        // ประมวลผลข้อมูลรายวัน
        dailyData.daily?.forEach(day => {
          databaseAnalytics.daily[day.date] = {
            orders: day.total_orders,
            revenue: parseFloat(day.total_revenue || 0),
            profit: parseFloat(day.total_profit || 0)
          }
          databaseAnalytics.totalRevenue += parseFloat(day.total_revenue || 0)
          databaseAnalytics.totalProfit += parseFloat(day.total_profit || 0)
        })

        // ประมวลผลข้อมูลรายการสินค้า
        itemsData.items?.forEach(item => {
          if (!databaseAnalytics.menuDetails.daily[item.date]) {
            databaseAnalytics.menuDetails.daily[item.date] = {}
          }
          databaseAnalytics.menuDetails.daily[item.date][item.item_name] = {
            id: item.item_id || item.item_name,
            name: item.item_name,
            quantity: item.quantity_sold,
            revenue: parseFloat(item.revenue || 0),
            cost: parseFloat(item.cost || 0),
            profit: parseFloat(item.profit || 0)
          }
        })

        setAnalyticsData(databaseAnalytics)
        console.log('✅ Analytics loaded from database')
      } else {
        console.log('⚠️ Database analytics not available, using local data')
        loadAnalyticsData() // fallback to local analysis
      }
    } catch (error) {
      console.error('Error loading analytics from database:', error)
      loadAnalyticsData() // fallback to local analysis
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
    setSelectedPromotion(null) // ล้างโปรโมชั่นด้วย
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  // ฟังก์ชันคำนวณราคาหลังหักส่วนลด
  const getFinalPrice = () => {
    const totalPrice = getTotalPrice()
    if (selectedPromotion) {
      const discount = calculateDiscount(selectedPromotion, totalPrice)
      return totalPrice - discount
    }
    return totalPrice
  }

  // ฟังก์ชันรับยอดส่วนลด
  const getDiscountAmount = () => {
    if (selectedPromotion) {
      return calculateDiscount(selectedPromotion, getTotalPrice())
    }
    return 0
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
        const supabaseUrl = 'https://ectkqadvatwrodmqkuze.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2YXR3cm9kbXFrdXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTI1MDMsImV4cCI6MjA2OTEyODUwM30.vpKbaq98KYcMU_1s_co3oLLcjRvL010KYOrvf2JnpoE';
        
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
    
    // สร้าง Order ID แบบใหม่ (YYYYMMDD + ลำดับ 4 หลัก)
    const orderId = generateOrderId()
    const currentDate = new Date()
    
    const subtotal = getTotalPrice()
    const discountAmount = getDiscountAmount()
    const finalTotal = getFinalPrice()
    
    // สร้างข้อมูลใบเสร็จ
    const receiptInfo = {
      orderId: orderId,
      items: [...cart],
      subtotal: subtotal,
      discount: discountAmount,
      promotion: selectedPromotion,
      finalTotal: finalTotal,
      date: currentDate.toLocaleDateString('th-TH'),
      time: currentDate.toLocaleTimeString('th-TH'),
      formattedOrderId: formatOrderId(orderId)
    }
    
    // สร้างออเดอร์ใหม่
    const newOrder = {
      id: orderId,
      order_id: orderId,
      items: [...cart],
      subtotal: subtotal,
      discount: discountAmount,
      promotion: selectedPromotion ? {
        name: selectedPromotion.name,
        type: selectedPromotion.type,
        value: selectedPromotion.value
      } : null,
      total: finalTotal,
      created_at: currentDate.toISOString(),
      display_date: currentDate.toLocaleDateString('th-TH'),
      display_time: currentDate.toLocaleTimeString('th-TH')
    }
    
    try {
      // บันทึกลง Database
      const baseUrl = window.location.hostname === 'localhost' ? '' : 'https://cha-ma-rodfaipos.vercel.app'
      const response = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          items: cart,
          total: subtotal,
          discount_amount: discountAmount,
          final_total: finalTotal,
          promotion_id: selectedPromotion?.id || null,
          promotion_name: selectedPromotion?.name || null,
          customer_name: 'ลูกค้า'
        })
      })
      
      if (response.ok) {
        console.log('Order saved to database successfully')
      } else {
        console.log('Failed to save order to database')
      }
    } catch (error) {
      console.error('Error saving order to database:', error)
    }
    
    // เพิ่มออเดอร์ใหม่เข้าไปในรายการ local
    setOrders(prevOrders => [...prevOrders, newOrder])
    
    // แสดงใบเสร็จ
    setReceiptData(receiptInfo)
    setShowReceipt(true)
    
    // Clear cart และ promotion
    clearCart()
  }

  // ฟังก์ชันบันทึกใบเสร็จเป็นรูปภาพ
  const downloadReceipt = async () => {
    const receiptElement = document.getElementById('receipt-content')
    if (!receiptElement) return
    
    try {
      const canvas = await html2canvas(receiptElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      })
      
      // สร้าง link ดาวน์โหลด
      const link = document.createElement('a')
      link.download = `receipt-${receiptData?.formattedOrderId || 'unknown'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error capturing receipt:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกใบเสร็จ')
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
              onClick={() => setShowPromotionManager(!showPromotionManager)}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Receipt className="w-4 h-4" />
              <span>โปรโมชั่น (เลือก)</span>
            </button>
            <button
              onClick={() => setShowPromotionManagement(!showPromotionManagement)}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>จัดการโปรโมชั่น</span>
            </button>
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>วิเคราะห์ยอดขาย</span>
            </button>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              วันที่: {new Date().toLocaleDateString('th-TH')}
            </div>
          </div>
        </div>
      </header>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-thai-orange" />
                  <span>วิเคราะห์ยอดขาย</span>
                </h2>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Period Selector */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  {[
                    { value: 'daily', label: 'รายวัน' },
                    { value: 'weekly', label: 'รายสัปดาห์' },
                    { value: 'monthly', label: 'รายเดือน' },
                    { value: 'yearly', label: 'รายปี' }
                  ].map(period => (
                    <button
                      key={period.value}
                      onClick={() => setSelectedPeriod(period.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedPeriod === period.value
                          ? 'bg-thai-orange text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
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

              {/* Charts Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">ยอดขาย{
                    selectedPeriod === 'daily' ? 'รายวัน' :
                    selectedPeriod === 'weekly' ? 'รายสัปดาห์' :
                    selectedPeriod === 'monthly' ? 'รายเดือน' : 'รายปี'
                  }</h3>
                  <div style={{ height: '300px' }}>
                    <Bar
                      data={{
                        labels: Object.keys(analyticsData[selectedPeriod]).slice(-10),
                        datasets: [
                          {
                            label: 'ยอดขาย',
                            data: Object.values(analyticsData[selectedPeriod]).slice(-10).map(d => d.revenue),
                            backgroundColor: 'rgba(249, 115, 22, 0.8)',
                            borderColor: 'rgba(249, 115, 22, 1)',
                            borderWidth: 1
                          },
                          {
                            label: 'กำไร',
                            data: Object.values(analyticsData[selectedPeriod]).slice(-10).map(d => d.profit),
                            backgroundColor: 'rgba(34, 197, 94, 0.8)',
                            borderColor: 'rgba(34, 197, 94, 1)',
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return '฿' + value.toLocaleString()
                              }
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            position: 'top'
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Orders Trend Chart */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">แนวโน้มจำนวนออเดอร์</h3>
                  <div style={{ height: '300px' }}>
                    <Line
                      data={{
                        labels: Object.keys(analyticsData[selectedPeriod]).slice(-10),
                        datasets: [
                          {
                            label: 'จำนวนออเดอร์',
                            data: Object.values(analyticsData[selectedPeriod]).slice(-10).map(d => d.orders),
                            borderColor: 'rgba(59, 130, 246, 1)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        },
                        plugins: {
                          legend: {
                            position: 'top'
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Popular Items Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Popular Items Pie Chart */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center space-x-2">
                    <PieChart className="w-6 h-6" />
                    <span>สินค้ายอดนิยม</span>
                  </h3>
                  <div style={{ height: '400px' }}>
                    <Pie
                      data={{
                        labels: analyticsData.popularItems.slice(0, 8).map(item => item.name),
                        datasets: [
                          {
                            data: analyticsData.popularItems.slice(0, 8).map(item => item.percentage),
                            backgroundColor: [
                              '#FF6384',
                              '#36A2EB',
                              '#FFCE56',
                              '#4BC0C0',
                              '#9966FF',
                              '#FF9F40',
                              '#FF6384',
                              '#C9CBCF'
                            ],
                            borderWidth: 2,
                            borderColor: '#fff'
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right'
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return context.label + ': ' + context.parsed + '%'
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Popular Items List */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">รายการสินค้ายอดนิยม</h3>
                  <div className="space-y-4">
                    {analyticsData.popularItems.slice(0, 10).map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-600">ขายได้ {item.count} ชิ้น</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-thai-orange">{item.percentage}%</p>
                          <p className="text-sm text-gray-600">฿{item.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Menu Details Section */}
              <div className="mt-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center space-x-2">
                  <Coffee className="w-7 h-7 text-thai-orange" />
                  <span>รายละเอียดยอดขายแต่ละเมนู{
                    selectedPeriod === 'daily' ? 'รายวัน' :
                    selectedPeriod === 'weekly' ? 'รายสัปดาห์' :
                    selectedPeriod === 'monthly' ? 'รายเดือน' : 'รายปี'
                  }</span>
                </h3>
                
                {/* Period Data */}
                <div className="space-y-6">
                  {Object.keys(analyticsData[selectedPeriod]).slice(-5).reverse().map(periodKey => {
                    const menuData = analyticsData.menuDetails?.[selectedPeriod]?.[periodKey] || {}
                    const sortedMenuItems = Object.values(menuData)
                      .sort((a, b) => b.revenue - a.revenue)
                    
                    return (
                      <div key={periodKey} className="bg-white rounded-lg border shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-xl font-bold text-gray-800">
                            {selectedPeriod === 'daily' ? 'วันที่' :
                             selectedPeriod === 'weekly' ? 'สัปดาห์ที่' :
                             selectedPeriod === 'monthly' ? 'เดือน' : 'ปี'} {periodKey}
                          </h4>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              รวม {analyticsData[selectedPeriod][periodKey]?.orders || 0} ออเดอร์
                            </p>
                            <p className="font-bold text-thai-orange">
                              ฿{(analyticsData[selectedPeriod][periodKey]?.revenue || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {sortedMenuItems.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left p-3 font-medium text-gray-700">เมนู</th>
                                  <th className="text-center p-3 font-medium text-gray-700">จำนวน</th>
                                  <th className="text-right p-3 font-medium text-gray-700">ยอดขาย</th>
                                  <th className="text-right p-3 font-medium text-gray-700">ต้นทุน</th>
                                  <th className="text-right p-3 font-medium text-gray-700">กำไร</th>
                                  <th className="text-center p-3 font-medium text-gray-700">อัตรากำไร</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {sortedMenuItems.map(item => (
                                  <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-800">{item.name}</td>
                                    <td className="p-3 text-center">
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                        {item.quantity}
                                      </span>
                                    </td>
                                    <td className="p-3 text-right font-medium text-green-600">
                                      ฿{item.revenue.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-right text-gray-600">
                                      ฿{item.cost.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-right font-medium text-thai-orange">
                                      ฿{item.profit.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-center">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        (item.profit / item.revenue * 100) >= 50 
                                          ? 'bg-green-100 text-green-800'
                                          : (item.profit / item.revenue * 100) >= 30
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(1) : 0}%
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Coffee className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>ไม่มีข้อมูลการขายในช่วงเวลานี้</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  
                  {Object.keys(analyticsData[selectedPeriod]).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h4 className="text-lg font-medium mb-2">ไม่มีข้อมูลการขาย</h4>
                      <p>เริ่มสร้างออเดอร์เพื่อดูรายงานการขาย</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Export Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(analyticsData, null, 2)
                    const dataBlob = new Blob([dataStr], {type: 'application/json'})
                    const url = URL.createObjectURL(dataBlob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
                    link.click()
                  }}
                  className="bg-thai-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>ส่งออกรายงาน</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Receipt Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">ใบเสร็จ</h2>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Receipt Content */}
              <div id="receipt-content" className="bg-white p-6 border-2 border-dashed border-gray-300">
                {/* Store Header */}
                <div className="text-center mb-6">
                  <div className="flex justify-center items-center space-x-2 mb-2">
                    <Coffee className="w-8 h-8 text-thai-orange" />
                    <h1 className="text-2xl font-bold text-thai-orange">POS ร้านชาไทย</h1>
                  </div>
                  <p className="text-sm text-gray-600">ระบบจุดขาย</p>
                  <div className="w-full h-px bg-gray-300 my-3"></div>
                </div>

                {/* Order Info */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>หมายเลขออเดอร์:</span>
                    <span className="font-mono font-bold">#{receiptData.formattedOrderId}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>วันที่:</span>
                    <span>{receiptData.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>เวลา:</span>
                    <span>{receiptData.time}</span>
                  </div>
                </div>

                <div className="w-full h-px bg-gray-300 my-3"></div>

                {/* Order Items */}
                <div className="mb-4">
                  <h3 className="font-bold mb-2">รายการสั่งซื้อ</h3>
                  {receiptData.items.map((item, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.name}</span>
                        <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-600 ml-2">
                        ฿{item.price.toLocaleString()} x {item.quantity}
                      </div>
                      {/* Show toppings if any */}
                      {item.toppings && item.toppings.length > 0 && (
                        <div className="ml-4 text-sm text-gray-600">
                          {item.toppings.map((topping, tIndex) => (
                            <div key={tIndex} className="flex justify-between">
                              <span>+ {topping.name}</span>
                              <span>฿{topping.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="w-full h-px bg-gray-300 my-3"></div>

                {/* Order Summary */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span>ยอดรวม:</span>
                    <span>฿{receiptData.subtotal.toLocaleString()}</span>
                  </div>
                  
                  {receiptData.promotion && receiptData.discount > 0 && (
                    <div className="flex justify-between mb-1 text-green-600">
                      <span>ส่วนลด ({receiptData.promotion.name}):</span>
                      <span>-฿{receiptData.discount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="w-full h-px bg-gray-300 my-2"></div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>รวมสุทธิ:</span>
                    <span className="text-thai-orange">฿{receiptData.finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="w-full h-px bg-gray-300 my-3"></div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-600">
                  <p>ขอบคุณที่ใช้บริการ</p>
                  <p>โปรดเก็บใบเสร็จนี้ไว้เป็นหลักฐาน</p>
                </div>
              </div>

              {/* Receipt Actions */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={downloadReceipt}
                  className="flex-1 bg-thai-orange hover:bg-orange-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>บันทึกรูปภาพ</span>
                </button>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-3 rounded-lg transition-colors"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Management Page */}
      {showPromotionManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                  <Receipt className="w-8 h-8 text-thai-orange" />
                  <span>จัดการโปรโมชั่น</span>
                </h2>
                <button
                  onClick={() => setShowPromotionManagement(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Add New Promotion Form */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  {editingPromotion ? 'แก้ไขโปรโมชั่น' : 'เพิ่มโปรโมชั่นใหม่'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อโปรโมชั่น</label>
                    <input
                      type="text"
                      value={editingPromotion ? editingPromotion.name : newPromotion.name}
                      onChange={(e) => {
                        if (editingPromotion) {
                          setEditingPromotion({...editingPromotion, name: e.target.value})
                        } else {
                          setNewPromotion({...newPromotion, name: e.target.value})
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thai-orange focus:border-thai-orange"
                      placeholder="เช่น ลด 10%"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทส่วนลด</label>
                    <select
                      value={editingPromotion ? editingPromotion.type : newPromotion.type}
                      onChange={(e) => {
                        if (editingPromotion) {
                          setEditingPromotion({...editingPromotion, type: e.target.value})
                        } else {
                          setNewPromotion({...newPromotion, type: e.target.value})
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thai-orange focus:border-thai-orange"
                    >
                      <option value="percentage">เปอร์เซ็นต์ (%)</option>
                      <option value="fixed">จำนวนเงิน (บาท)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ค่าส่วนลด {(editingPromotion ? editingPromotion.type : newPromotion.type) === 'percentage' ? '(%)' : '(บาท)'}
                    </label>
                    <input
                      type="number"
                      value={editingPromotion ? editingPromotion.value : newPromotion.value}
                      onChange={(e) => {
                        if (editingPromotion) {
                          setEditingPromotion({...editingPromotion, value: e.target.value})
                        } else {
                          setNewPromotion({...newPromotion, value: e.target.value})
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thai-orange focus:border-thai-orange"
                      placeholder="เช่น 10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ยอดซื้อขั้นต่ำ (บาท)</label>
                    <input
                      type="number"
                      value={editingPromotion ? editingPromotion.minAmount : newPromotion.minAmount}
                      onChange={(e) => {
                        if (editingPromotion) {
                          setEditingPromotion({...editingPromotion, minAmount: e.target.value})
                        } else {
                          setNewPromotion({...newPromotion, minAmount: e.target.value})
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thai-orange focus:border-thai-orange"
                      placeholder="เช่น 50"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                    <input
                      type="text"
                      value={editingPromotion ? editingPromotion.description : newPromotion.description}
                      onChange={(e) => {
                        if (editingPromotion) {
                          setEditingPromotion({...editingPromotion, description: e.target.value})
                        } else {
                          setNewPromotion({...newPromotion, description: e.target.value})
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thai-orange focus:border-thai-orange"
                      placeholder="รายละเอียดโปรโมชั่น (จะสร้างอัตโนมัติถ้าไม่ระบุ)"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-4">
                  {editingPromotion ? (
                    <>
                      <button
                        onClick={updatePromotion}
                        className="bg-thai-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        <span>บันทึกการแก้ไข</span>
                      </button>
                      <button
                        onClick={cancelEditPromotion}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg transition-colors"
                      >
                        ยกเลิก
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={addPromotion}
                      className="bg-thai-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>เพิ่มโปรโมชั่น</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Current Promotions List */}
              <div className="bg-white">
                <h3 className="text-xl font-bold mb-4 text-gray-800">รายการโปรโมชั่นปัจจุบัน</h3>
                
                {promotions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">ยังไม่มีโปรโมชั่น</p>
                    <p>เพิ่มโปรโมชั่นใหม่เพื่อเริ่มใช้งาน</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {promotions.map(promotion => (
                      <div key={promotion.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-800">{promotion.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{promotion.description}</p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              promotion.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {promotion.is_active !== false ? 'ใช้งาน' : 'ปิด'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">ประเภท:</span>
                            <span className="text-sm font-medium">
                              {promotion.type === 'percentage' ? 'เปอร์เซ็นต์' : 'จำนวนเงิน'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">ส่วนลด:</span>
                            <span className="text-sm font-bold text-thai-orange">
                              {promotion.type === 'percentage' ? `${promotion.value}%` : `฿${promotion.value}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">ยอดขั้นต่ำ:</span>
                            <span className="text-sm font-medium">฿{promotion.min_amount || promotion.minAmount || 0}</span>
                          </div>
                          {promotion.usage_count !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">ใช้งานแล้ว:</span>
                              <span className="text-sm font-medium">{promotion.usage_count} ครั้ง</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditPromotion(promotion)}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            <span>แก้ไข</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`คุณต้องการลบโปรโมชั่น "${promotion.name}" หรือไม่?`)) {
                                deletePromotion(promotion.id)
                              }
                            }}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>ลบ</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <span>🗄️ ข้อมูลออนไลน์จาก Supabase Database v2.1</span>
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
          {/* Menu Section - แบ่งเป็น 70% เครื่องดื่ม และ 30% Topping */}
          <div className="lg:col-span-2">
            <div className="flex gap-4 h-full">
              {/* เครื่องดื่ม 70% */}
              <div className="w-[70%]">
                <div className="card h-full">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">เมนูเครื่องดื่ม</h2>
                  
                  {/* Category Filter สำหรับเครื่องดื่มเท่านั้น */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categories.filter(cat => cat !== 'Topping').map(category => (
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

                  {/* Menu Items Grid - เฉพาะเครื่องดื่ม */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                    {filteredItems.filter(item => item.category !== 'Topping').map(item => (
                      <div 
                        key={item.id} 
                        className={`menu-item-card ${selectedDrink?.id === item.id ? 'ring-2 ring-thai-orange bg-orange-50' : ''}`}
                        onClick={() => addToCart(item)}
                      >
                        <div className="flex flex-col h-full">
                          <h3 className="font-semibold text-gray-800 mb-2">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                          <div className="flex-1"></div>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-xl font-bold text-thai-orange">{item.price}฿</span>
                            <div className="w-8 h-8 bg-thai-orange text-white rounded-full flex items-center justify-center">
                              <Plus className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Topping 30% */}
              <div className="w-[30%]">
                <div className="card h-full">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">ท็อปปิ้ง</h3>
                  
                  {selectedDrink && (
                    <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600">เลือกแล้ว:</p>
                      <p className="font-semibold text-gray-800">{selectedDrink.name}</p>
                      <p className="text-thai-orange font-bold">{selectedDrink.price}฿</p>
                    </div>
                  )}
                  
                  {/* Topping Items */}
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                    {menuItems.filter(item => item.category === 'Topping').map(topping => {
                      const isSelected = selectedToppings.some(t => t.id === topping.id)
                      return (
                        <div 
                          key={topping.id} 
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-green-50 border-green-300' 
                              : selectedDrink 
                                ? 'hover:bg-gray-50 border-gray-200' 
                                : 'opacity-50 cursor-not-allowed border-gray-200'
                          }`}
                          onClick={() => selectedDrink && addToCart(topping)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-800">{topping.name}</p>
                              <p className="text-sm text-thai-orange">+{topping.price}฿</p>
                            </div>
                            {isSelected && (
                              <button 
                                className="text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeTopping(topping.id)
                                }}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* ปุ่มยืนยัน */}
                  {selectedDrink && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">รวม:</p>
                        <p className="text-lg font-bold text-thai-orange">
                          {selectedDrink.price + selectedToppings.reduce((sum, t) => sum + t.price, 0)}฿
                        </p>
                      </div>
                      <button 
                        onClick={confirmOrder}
                        className="w-full bg-thai-orange hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium"
                      >
                        เพิ่มลงตะกร้า
                      </button>
                    </div>
                  )}
                </div>
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
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{item.name}</h4>
                          
                          {/* แสดง toppings ถ้ามี */}
                          {item.toppings && item.toppings.length > 0 && (
                            <div className="ml-4 mt-1 space-y-1">
                              {item.toppings.map(topping => (
                                <p key={topping.id} className="text-sm text-gray-600 flex items-center">
                                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                  {topping.name}
                                </p>
                              ))}
                            </div>
                          )}
                          
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                              {item.originalPrice && item.toppings?.length > 0 ? (
                                <>
                                  เครื่องดื่ม {item.originalPrice}฿ + ท็อปปิ้ง {item.price - item.originalPrice}฿
                                </>
                              ) : (
                                `${item.price}฿`
                              )} x {item.quantity}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => {
                              // สำหรับรายการที่มี topping จะไม่สามารถเพิ่มได้ ต้องสั่งใหม่
                              if (item.toppings && item.toppings.length > 0) {
                                alert('กรุณาสั่งใหม่สำหรับเครื่องดื่มที่มีท็อปปิ้ง')
                                return
                              }
                              addToCartDirect(item)
                            }}
                            className="p-1 bg-green-100 hover:bg-green-200 text-green-600 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between items-center text-gray-800">
                      <span>ยอดรวม:</span>
                      <span>{getTotalPrice()}฿</span>
                    </div>
                    
                    {/* ส่วนลด */}
                    {selectedPromotion ? (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-green-700">{selectedPromotion.name}</p>
                            <p className="text-xs text-green-600">{selectedPromotion.description}</p>
                          </div>
                          <button
                            onClick={removePromotion}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-green-700">
                          <span className="text-sm">ส่วนลด:</span>
                          <span className="font-bold">-{getDiscountAmount()}฿</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowPromotionModal(true)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>เลือกส่วนลด</span>
                      </button>
                    )}
                    
                    <div className="flex justify-between items-center text-lg font-bold text-gray-800 pt-2 border-t">
                      <span>รวมสุทธิ:</span>
                      <span className="text-thai-orange">{getFinalPrice()}฿</span>
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

      {/* Confirmation Modal */}
      {showConfirmModal && selectedDrink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">ยืนยันการสั่ง</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-gray-800">{selectedDrink.name}</h4>
                <p className="text-thai-orange font-bold">{selectedDrink.price}฿</p>
              </div>
              
              {selectedToppings.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">ท็อปปิ้ง:</h5>
                  {selectedToppings.map(topping => (
                    <div key={topping.id} className="flex justify-between items-center">
                      <span className="text-gray-700">{topping.name}</span>
                      <span className="text-green-600">+{topping.price}฿</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="p-4 bg-gray-100 rounded-lg">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>รวม:</span>
                  <span className="text-thai-orange">
                    {selectedDrink.price + selectedToppings.reduce((sum, t) => sum + t.price, 0)}฿
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={cancelOrder}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={finalConfirmOrder}
                className="flex-1 px-4 py-2 bg-thai-orange hover:bg-orange-600 text-white rounded-lg font-medium"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Selection Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">เลือกส่วนลด</h3>
              <button
                onClick={() => setShowPromotionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {promotions.map(promotion => {
                const totalAmount = getTotalPrice()
                const isEligible = totalAmount >= promotion.minAmount
                const discount = calculateDiscount(promotion, totalAmount)
                
                return (
                  <div 
                    key={promotion.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isEligible 
                        ? 'hover:bg-green-50 border-green-300' 
                        : 'opacity-50 cursor-not-allowed border-gray-200'
                    }`}
                    onClick={() => isEligible && applyPromotion(promotion)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{promotion.name}</h4>
                        <p className="text-sm text-gray-600">{promotion.description}</p>
                        {isEligible && (
                          <p className="text-green-600 font-bold text-sm mt-1">
                            ประหยัด: {discount}฿
                          </p>
                        )}
                        {!isEligible && (
                          <p className="text-red-500 text-sm mt-1">
                            ซื้อเพิ่ม {promotion.minAmount - totalAmount}฿
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {promotions.length === 0 && (
              <p className="text-gray-500 text-center py-8">ไม่มีโปรโมชั่น</p>
            )}
          </div>
        </div>
      )}

      {/* Promotion Manager Modal */}
      {showPromotionManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">จัดการโปรโมชั่น</h2>
              <button
                onClick={() => setShowPromotionManager(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Add New Promotion Form */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold mb-4">เพิ่มโปรโมชั่นใหม่</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="ชื่อโปรโมชั่น"
                  value={newPromotion.name}
                  onChange={(e) => setNewPromotion({...newPromotion, name: e.target.value})}
                  className="input"
                />
                <select
                  value={newPromotion.type}
                  onChange={(e) => setNewPromotion({...newPromotion, type: e.target.value})}
                  className="input"
                >
                  <option value="percentage">เปอร์เซ็นต์</option>
                  <option value="fixed">จำนวนเงิน</option>
                </select>
                <input
                  type="number"
                  placeholder={newPromotion.type === 'percentage' ? '% ลด' : 'จำนวนเงิน'}
                  value={newPromotion.value}
                  onChange={(e) => setNewPromotion({...newPromotion, value: e.target.value})}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="ยอดขั้นต่ำ (บาท)"
                  value={newPromotion.minAmount}
                  onChange={(e) => setNewPromotion({...newPromotion, minAmount: e.target.value})}
                  className="input"
                />
                <button
                  onClick={addPromotion}
                  className="btn-primary flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่ม
                </button>
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="คำอธิบาย (ไม่บังคับ)"
                  value={newPromotion.description}
                  onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})}
                  className="input w-full"
                />
              </div>
            </div>

            {/* Promotions List */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">รายการโปรโมชั่น</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ชื่อ</th>
                      <th className="text-left p-2">ประเภท</th>
                      <th className="text-left p-2">ส่วนลด</th>
                      <th className="text-left p-2">ยอดขั้นต่ำ</th>
                      <th className="text-left p-2">คำอธิบาย</th>
                      <th className="text-left p-2">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotions.map(promotion => (
                      <tr key={promotion.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{promotion.name}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            promotion.type === 'percentage' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {promotion.type === 'percentage' ? 'เปอร์เซ็นต์' : 'จำนวนเงิน'}
                          </span>
                        </td>
                        <td className="p-2 text-thai-orange font-semibold">
                          {promotion.type === 'percentage' ? `${promotion.value}%` : `${promotion.value}฿`}
                        </td>
                        <td className="p-2">{promotion.minAmount}฿</td>
                        <td className="p-2 text-sm text-gray-600">{promotion.description}</td>
                        <td className="p-2">
                          <button
                            onClick={() => deletePromotion(promotion.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {promotions.length === 0 && (
                <p className="text-gray-500 text-center py-8">ไม่มีโปรโมชั่น</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
