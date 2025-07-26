-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  description TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  customer_name VARCHAR(255) DEFAULT 'ลูกค้า',
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  order_type VARCHAR(50) DEFAULT 'dine-in',
  table_number INTEGER,
  notes TEXT,
  payment_method VARCHAR(50) DEFAULT 'cash',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);

-- Enable Row Level Security (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on menu_items" ON menu_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);

-- Insert some sample menu items
INSERT INTO menu_items (name, price, category, description) VALUES
('ชาไทยเย็น', 25.00, 'ชาไทย', 'ชาไทยเย็นแบบดั้งเดิม'),
('ชาไทยร้อน', 20.00, 'ชาไทย', 'ชาไทยร้อนหอมกรุ่น'),
('ชาเขียวเย็น', 30.00, 'ชาเขียว', 'ชาเขียวเย็นสดชื่น'),
('กาแฟเย็น', 35.00, 'กาแฟ', 'กาแฟเย็นรสชาติเข้มข้น'),
('โกโก้เย็น', 40.00, 'เครื่องดื่ม', 'โกโก้เย็นหวานมัน');
