import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://ectkqadvatwrodmqkuze.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2YXR3cm9kbXFrdXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTI1MDMsImV4cCI6MjA2OTEyODUwM30.vpKbaq98KYcMU_1s_co3oLLcjRvL010KYOrvf2JnpoE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createPromotionsTable() {
  console.log('🔧 Manual table creation...')
  
  // Try to create a simple test record to see if the table exists
  console.log('🧪 Testing if promotions table exists...')
  
  const { data: existingData, error: existingError } = await supabase
    .from('promotions')
    .select('id')
    .limit(1)
  
  if (existingError && existingError.code === '42P01') {
    console.log('❌ Promotions table does not exist')
    console.log('\n📝 Manual steps required:')
    console.log('1. Go to https://ectkqadvatwrodmqkuze.supabase.co/project/ectkqadvatwrodmqkuze/editor')
    console.log('2. Click on "SQL Editor" in the left sidebar')
    console.log('3. Run the following SQL:')
    console.log('\n--- COPY THIS SQL ---')
    console.log(`
-- Create promotions table
CREATE TABLE promotions (
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

-- Add columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_total DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS promotion_id INTEGER,
ADD COLUMN IF NOT EXISTS promotion_name VARCHAR(255);

-- Insert sample promotions
INSERT INTO promotions (name, type, value, min_amount, description, is_active) VALUES
('ลด 10%', 'percentage', 10, 50, 'ลด 10% เมื่อซื้อครบ 50 บาท', true),
('ลด 20 บาท', 'fixed', 20, 100, 'ลด 20 บาท เมื่อซื้อครบ 100 บาท', true),
('ลด 15%', 'percentage', 15, 200, 'ลด 15% เมื่อซื้อครบ 200 บาท', true),
('ลด 50 บาท', 'fixed', 50, 300, 'ลด 50 บาท เมื่อซื้อครบ 300 บาท', true);

-- Enable RLS (Row Level Security)
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production)
CREATE POLICY "Allow all operations on promotions" ON promotions FOR ALL USING (true);

-- Create indexes
CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_promotions_type ON promotions(type);
    `)
    console.log('--- END SQL ---\n')
    console.log('4. Click "Run" to execute the SQL')
    console.log('5. After running, test the application again')
    
  } else if (existingError) {
    console.log('❌ Error checking table:', existingError)
  } else {
    console.log('✅ Promotions table already exists!')
    console.log('Found existing data:', existingData?.length || 0, 'records')
    
    // Test inserting sample data
    const { data: insertData, error: insertError } = await supabase
      .from('promotions')
      .upsert([
        {
          name: 'ลด 10%',
          type: 'percentage', 
          value: 10,
          min_amount: 50,
          description: 'ลด 10% เมื่อซื้อครบ 50 บาท',
          is_active: true
        }
      ], { onConflict: 'name' })
    
    if (insertError) {
      console.log('❌ Error inserting test data:', insertError)
    } else {
      console.log('✅ Test data inserted successfully')
    }
  }
}

createPromotionsTable()
