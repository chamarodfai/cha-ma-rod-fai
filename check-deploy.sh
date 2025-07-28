#!/bin/bash

# Thai Tea POS Deployment Check Script
echo "🧪 กำลังตรวจสอบสถานะการ Deploy ของ Thai Tea POS..."
echo "=================================================="

# ตัวแปรสำหรับ URL
BASE_URL="https://cha-ma-rodfaipos.vercel.app"

echo "🌐 ตรวจสอบเว็บไซต์หลัก..."
curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s\n" $BASE_URL

echo ""
echo "🔗 ตรวจสอบ API Endpoints..."

echo "📋 Menu API:"
curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s\n" $BASE_URL/api/menu

echo "🛒 Orders API:"
curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s\n" $BASE_URL/api/orders

echo "🎫 Promotions API:"
curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s\n" $BASE_URL/api/promotions

echo "📊 Analytics API:"
curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s\n" $BASE_URL/api/analytics

echo ""
echo "✅ การตรวจสอบเสร็จสิ้น!"
echo "ถ้าสถานะทั้งหมดเป็น 200 แสดงว่าแอปทำงานปกติ"
echo ""
echo "🔗 เปิดใช้งานที่: $BASE_URL"
