import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ectkqadvatwrodmqkuze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2YXR3cm9kbXFrdXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTI1MDMsImV4cCI6MjA2OTEyODUwM30.vpKbaq98KYcMU_1s_co3oLLcjRvL010KYOrvf2JnpoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Try to get orders
    console.log('\n1. Testing orders table...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (ordersError) {
      console.error('Orders table error:', ordersError);
      console.log('ตาราง orders ยังไม่ได้ถูกสร้าง!');
    } else {
      console.log('Orders table exists, records:', orders?.length || 0);
    }
    
    // Test 2: Try to create a test order
    console.log('\n2. Testing order creation...');
    const testOrder = {
      order_id: 'TEST-' + Date.now(),
      items: [{ id: 1, name: 'ทดสอบ', price: 25, quantity: 1 }],
      total: 25,
      final_total: 25,
      customer_name: 'ทดสอบ'
    };
    
    const { data: newOrder, error: createError } = await supabase
      .from('orders')
      .insert([testOrder])
      .select();
    
    if (createError) {
      console.error('Create order error:', createError);
    } else {
      console.log('Test order created successfully:', newOrder);
    }
    
    // Test 3: Check table schema
    console.log('\n3. Checking available tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Tables check error:', tablesError);
    } else {
      console.log('Available tables:', tables?.map(t => t.table_name) || []);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDatabase();
