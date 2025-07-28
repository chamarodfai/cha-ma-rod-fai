import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ectkqadvtaywrodmqkuze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2dGF5d3JvZG1xa3V6ZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM3OTcxMzk4LCJleHAiOjIwNTM1NDczOTh9.YOJpUHaFbLaKsQiWpYgtGHnMY4x-Xf8WGnU2J6ZMtHs';

console.log('Testing Supabase connection...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('1. Testing basic connection...');
    
    // Test connection by getting data
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Supabase Error:', error);
      return;
    }

    console.log('✅ Supabase connection successful!');
    console.log('📊 Sample data:', data);
    
    // Test insert
    console.log('2. Testing insert...');
    const { data: insertData, error: insertError } = await supabase
      .from('menu_items')
      .insert([{
        name: 'Test Menu ' + Date.now(),
        price: 25.00,
        cost: 15.00,
        category: 'ชาไทย',
        description: 'Test item'
      }])
      .select();

    if (insertError) {
      console.error('❌ Insert Error:', insertError);
    } else {
      console.log('✅ Insert successful:', insertData);
    }

  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();
