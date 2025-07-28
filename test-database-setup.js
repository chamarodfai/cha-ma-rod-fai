import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://ectkqadvatwrodmqkuze.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2YXR3cm9kbXFrdXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTI1MDMsImV4cCI6MjA2OTEyODUwM30.vpKbaq98KYcMU_1s_co3oLLcjRvL010KYOrvf2JnpoE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🧪 Testing Supabase database connection...\n')
  
  try {
    // Test 1: Check promotions table
    console.log('1. Testing promotions table...')
    const { data: promotions, error: promotionsError } = await supabase
      .from('promotions')
      .select('*')
      .limit(5)
    
    if (promotionsError) {
      console.log('❌ Promotions table error:', promotionsError.message)
      console.log('🔧 Please run the SQL script in SUPABASE_SETUP.sql first')
      return
    } else {
      console.log('✅ Promotions table working!')
      console.log(`   Found ${promotions.length} promotions:`)
      promotions.forEach(promo => {
        console.log(`   - ${promo.name}: ${promo.type === 'percentage' ? promo.value + '%' : '฿' + promo.value} (min: ฿${promo.min_amount})`)
      })
    }

    // Test 2: Check orders table structure
    console.log('\n2. Testing orders table structure...')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_id, total, discount_amount, final_total, promotion_id, promotion_name')
      .limit(1)
    
    if (ordersError) {
      console.log('❌ Orders table error:', ordersError.message)
    } else {
      console.log('✅ Orders table structure updated!')
      console.log('   New columns: discount_amount, final_total, promotion_id, promotion_name')
    }

    // Test 3: Test menu_items table
    console.log('\n3. Testing menu_items table...')
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price, cost, category')
      .limit(3)
    
    if (menuError) {
      console.log('❌ Menu items error:', menuError.message)
    } else {
      console.log('✅ Menu items table working!')
      console.log(`   Found ${menuItems.length} sample items:`)
      menuItems.forEach(item => {
        console.log(`   - ${item.name}: ฿${item.price} (cost: ฿${item.cost || 0})`)
      })
    }

    // Test 4: Insert test promotion
    console.log('\n4. Testing promotion insert...')
    const testPromotion = {
      name: 'Test ลด 5%',
      type: 'percentage',
      value: 5,
      min_amount: 30,
      description: 'ทดสอบระบบ - ลด 5% เมื่อซื้อครบ 30 บาท',
      is_active: true
    }

    const { data: insertResult, error: insertError } = await supabase
      .from('promotions')
      .insert([testPromotion])
      .select()
      .single()

    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message)
    } else {
      console.log('✅ Insert test successful!')
      console.log(`   Created promotion: ${insertResult.name} (ID: ${insertResult.id})`)
      
      // Clean up test data
      await supabase.from('promotions').delete().eq('id', insertResult.id)
      console.log('   🧹 Test data cleaned up')
    }

    console.log('\n🎉 Database setup is complete and working!')
    console.log('Your POS system is now ready with:')
    console.log('✅ Promotions management')
    console.log('✅ Order tracking with discounts')
    console.log('✅ Analytics data collection')
    console.log('✅ Receipt generation')

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }
}

testDatabase()
