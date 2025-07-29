import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ectkqadvatwrodmqkuze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2YXR3cm9kbXFrdXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTI1MDMsImV4cCI6MjA2OTEyODUwM30.vpKbaq98KYcMU_1s_co3oLLcjRvL010KYOrvf2JnpoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function viewOrders() {
  console.log('=== ดูข้อมูลออร์เดอร์ทั้งหมด ===\n');
  
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log(`จำนวนออร์เดอร์ทั้งหมด: ${orders?.length || 0}`);
    
    if (orders && orders.length > 0) {
      orders.forEach((order, index) => {
        console.log(`\n--- ออร์เดอร์ที่ ${index + 1} ---`);
        console.log(`Order ID: ${order.order_id}`);
        console.log(`ลูกค้า: ${order.customer_name}`);
        console.log(`จำนวนเงิน: ${order.final_total} บาท`);
        console.log(`ส่วนลด: ${order.discount_amount} บาท`);
        console.log(`โปรโมชั่น: ${order.promotion_name || 'ไม่มี'}`);
        console.log(`สถานะ: ${order.status}`);
        console.log(`วันที่: ${new Date(order.created_at).toLocaleString('th-TH')}`);
        console.log(`สินค้า: ${JSON.stringify(order.items, null, 2)}`);
      });
    } else {
      console.log('ยังไม่มีออร์เดอร์ในระบบ');
    }
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  }
}

viewOrders();
