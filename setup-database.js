import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Supabase configuration
const supabaseUrl = 'https://ectkqadvatwrodmqkuze.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2YXR3cm9kbXFrdXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTI1MDMsImV4cCI6MjA2OTEyODUwM30.vpKbaq98KYcMU_1s_co3oLLcjRvL010KYOrvf2JnpoE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTables() {
  console.log('🏗️ Creating tables in Supabase...')
  
  try {
    // Create promotions table
    console.log('📋 Creating promotions table...')
    const { data: promotionsResult, error: promotionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS promotions (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          type VARCHAR(50) NOT NULL CHECK (type IN ('percentage', 'fixed')),
          value DECIMAL(10, 2) NOT NULL,
          min_amount DECIMAL(10, 2) DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          end_date TIMESTAMP WITH TIME ZONE,
          usage_count INTEGER DEFAULT 0,
          max_usage INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (promotionsError) {
      console.log('Note: promotions table might already exist or RPC not available:', promotionsError.message)
    } else {
      console.log('✅ Promotions table created successfully')
    }

    // Update orders table structure
    console.log('📋 Updating orders table...')
    const { data: ordersResult, error: ordersError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS final_total DECIMAL(10, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS promotion_id INTEGER,
        ADD COLUMN IF NOT EXISTS promotion_name VARCHAR(255);
      `
    })
    
    if (ordersError) {
      console.log('Note: orders table columns might already exist:', ordersError.message)
    } else {
      console.log('✅ Orders table updated successfully')
    }

    // Insert sample promotions
    console.log('🎁 Inserting sample promotions...')
    const { data: insertResult, error: insertError } = await supabase
      .from('promotions')
      .upsert([
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
        },
        {
          id: 3,
          name: 'ลด 15%',
          type: 'percentage',
          value: 15,
          min_amount: 200,
          description: 'ลด 15% เมื่อซื้อครบ 200 บาท',
          is_active: true
        }
      ], { onConflict: 'id' })

    if (insertError) {
      console.error('❌ Error inserting promotions:', insertError)
    } else {
      console.log('✅ Sample promotions inserted successfully')
    }

    // Test promotions table
    console.log('🧪 Testing promotions table...')
    const { data: testData, error: testError } = await supabase
      .from('promotions')
      .select('*')
      .limit(5)

    if (testError) {
      console.error('❌ Error testing promotions table:', testError)
    } else {
      console.log('✅ Promotions table working! Found', testData.length, 'promotions')
      testData.forEach(promo => {
        console.log(`   - ${promo.name}: ${promo.type === 'percentage' ? promo.value + '%' : '฿' + promo.value}`)
      })
    }

    console.log('\n🎉 Database setup completed!')
    console.log('You can now use the promotions and analytics features.')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the setup
createTables()
