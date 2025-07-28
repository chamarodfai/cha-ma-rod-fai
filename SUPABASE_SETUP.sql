-- ==========================================
-- SUPABASE SQL SETUP SCRIPT
-- Copy and paste this into Supabase SQL Editor
-- ==========================================

-- 1. Create promotions table
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

-- 2. Add new columns to existing orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_total DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS promotion_id INTEGER,
ADD COLUMN IF NOT EXISTS promotion_name VARCHAR(255);

-- 3. Insert sample promotions data
INSERT INTO promotions (name, type, value, min_amount, description, is_active) VALUES
('ลด 10%', 'percentage', 10, 50, 'ลด 10% เมื่อซื้อครบ 50 บาท', true),
('ลด 20 บาท', 'fixed', 20, 100, 'ลด 20 บาท เมื่อซื้อครบ 100 บาท', true),
('ลด 15%', 'percentage', 15, 200, 'ลด 15% เมื่อซื้อครบ 200 บาท', true),
('ลด 50 บาท', 'fixed', 50, 300, 'ลด 50 บาท เมื่อซื้อครบ 300 บาท', true),
('ลด 25%', 'percentage', 25, 500, 'ลด 25% เมื่อซื้อครบ 500 บาท', true);

-- 4. Create analytics tables for dashboard
-- Table for daily sales summary
CREATE TABLE IF NOT EXISTS daily_sales (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_cost DECIMAL(10, 2) DEFAULT 0,
  total_profit DECIMAL(10, 2) DEFAULT 0,
  total_discount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for item sales analytics
CREATE TABLE IF NOT EXISTS item_sales_analytics (
  id SERIAL PRIMARY KEY,
  item_id INTEGER,
  item_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  quantity_sold INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  profit DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, item_name, date)
);

-- Table for promotion usage analytics
CREATE TABLE IF NOT EXISTS promotion_analytics (
  id SERIAL PRIMARY KEY,
  promotion_id INTEGER NOT NULL,
  promotion_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  total_discount DECIMAL(10, 2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(promotion_id, date)
);

-- View for comprehensive analytics
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
  ds.date,
  ds.total_orders,
  ds.total_revenue,
  ds.total_cost,
  ds.total_profit,
  ds.total_discount,
  CASE 
    WHEN ds.total_revenue > 0 THEN ROUND(((ds.total_profit / ds.total_revenue) * 100)::numeric, 2)
    ELSE 0 
  END AS profit_percentage,
  COUNT(DISTINCT isa.item_id) as unique_items_sold,
  COUNT(DISTINCT pa.promotion_id) as promotions_used
FROM daily_sales ds
LEFT JOIN item_sales_analytics isa ON ds.date = isa.date AND isa.quantity_sold > 0
LEFT JOIN promotion_analytics pa ON ds.date = pa.date AND pa.usage_count > 0
GROUP BY ds.date, ds.total_orders, ds.total_revenue, ds.total_cost, ds.total_profit, ds.total_discount
ORDER BY ds.date DESC;

-- 5. Enable Row Level Security
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_sales_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_analytics ENABLE ROW LEVEL SECURITY;

-- 6. Create policy for public access (adjust for production security)
CREATE POLICY "Allow all operations on promotions" ON promotions FOR ALL USING (true);
CREATE POLICY "Allow all operations on daily_sales" ON daily_sales FOR ALL USING (true);
CREATE POLICY "Allow all operations on item_sales_analytics" ON item_sales_analytics FOR ALL USING (true);
CREATE POLICY "Allow all operations on promotion_analytics" ON promotion_analytics FOR ALL USING (true);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_type ON promotions(type);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_orders_promotion_id ON orders(promotion_id);
CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales(date);
CREATE INDEX IF NOT EXISTS idx_item_sales_date ON item_sales_analytics(date);
CREATE INDEX IF NOT EXISTS idx_item_sales_item_id ON item_sales_analytics(item_id);
CREATE INDEX IF NOT EXISTS idx_promotion_analytics_date ON promotion_analytics(date);
CREATE INDEX IF NOT EXISTS idx_promotion_analytics_promo_id ON promotion_analytics(promotion_id);

-- 8. Create functions for automatic analytics updates
CREATE OR REPLACE FUNCTION update_daily_sales()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert daily sales summary
  INSERT INTO daily_sales (date, total_orders, total_revenue, total_cost, total_profit, total_discount)
  VALUES (
    DATE(NEW.created_at),
    1,
    NEW.final_total,
    (
      SELECT COALESCE(SUM(
        (SELECT COALESCE(cost, 0) FROM menu_items WHERE menu_items.name = item->>'name') * 
        (item->>'quantity')::integer
      ), 0)
      FROM jsonb_array_elements(NEW.items) AS item
    ),
    NEW.final_total - (
      SELECT COALESCE(SUM(
        (SELECT COALESCE(cost, 0) FROM menu_items WHERE menu_items.name = item->>'name') * 
        (item->>'quantity')::integer
      ), 0)
      FROM jsonb_array_elements(NEW.items) AS item
    ),
    COALESCE(NEW.discount_amount, 0)
  )
  ON CONFLICT (date) DO UPDATE SET
    total_orders = daily_sales.total_orders + 1,
    total_revenue = daily_sales.total_revenue + NEW.final_total,
    total_cost = daily_sales.total_cost + (
      SELECT COALESCE(SUM(
        (SELECT COALESCE(cost, 0) FROM menu_items WHERE menu_items.name = item->>'name') * 
        (item->>'quantity')::integer
      ), 0)
      FROM jsonb_array_elements(NEW.items) AS item
    ),
    total_profit = daily_sales.total_profit + (NEW.final_total - (
      SELECT COALESCE(SUM(
        (SELECT COALESCE(cost, 0) FROM menu_items WHERE menu_items.name = item->>'name') * 
        (item->>'quantity')::integer
      ), 0)
      FROM jsonb_array_elements(NEW.items) AS item
    )),
    total_discount = daily_sales.total_discount + COALESCE(NEW.discount_amount, 0),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for automatic daily sales updates
CREATE TRIGGER trigger_update_daily_sales
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_sales();

-- 10. Verify the setup
SELECT 'Database setup completed successfully!' as status;
SELECT 'Promotions table:' as table_name, count(*) as total_records FROM promotions;
SELECT 'Daily sales table:' as table_name, count(*) as total_records FROM daily_sales;
SELECT 'Item analytics table:' as table_name, count(*) as total_records FROM item_sales_analytics;
SELECT 'Promotion analytics table:' as table_name, count(*) as total_records FROM promotion_analytics;
SELECT name, type, value, min_amount FROM promotions WHERE is_active = true;
