# การ Deploy Thai Tea POS บน Vercel

## ขั้นตอนการ Deploy

### 1. เตรียม Vercel Account
- ไปที่ [vercel.com](https://vercel.com)
- สมัครสมาชิกหรือเข้าสู่ระบบด้วย GitHub account

### 2. เชื่อมต่อ GitHub Repository
1. คลิก "New Project" ใน Vercel Dashboard
2. เลือก "Import Git Repository"
3. เลือก repository: `chamarodfai/cha-ma-rod-fai`
4. กำหนดชื่อโปรเจค: `cha-ma-rodfaipos`

### 3. ตั้งค่า Environment Variables (สำคัญ!)
ใน Vercel Dashboard -> Settings -> Environment Variables:

```
SUPABASE_URL=https://ectkqadvatwrodmqkuze.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdGtxYWR2YXR3cm9kbXFrdXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTI1MDMsImV4cCI6MjA2OTEyODUwM30.vpKbaq98KYcMU_1s_co3oLLcjRvL010KYOrvf2JnpoE
```

### 4. ตั้งค่า Build Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### 5. ตั้งค่า Custom Domain
- ไปที่ Settings -> Domains
- เพิ่มโดเมน: `cha-ma-rodfaipos.vercel.app`

### 6. ตรวจสอบ Database Setup
1. เข้าสู่ระบบ [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือกโปรเจค: `ectkqadvatwrodmqkuze`
3. ไปที่ SQL Editor
4. รันสคริปต์จากไฟล์ `SUPABASE_SETUP.sql`

### 7. Deploy
- คลิก "Deploy" ใน Vercel
- รอให้ build เสร็จ (ประมาณ 2-3 นาที)

## ฟีเจอร์ที่ทำงานออนไลน์

### ✅ หน้าหลัก POS System
- เมนูเครื่องดื่ม 70% + ท็อปปิ้ง 30%
- ระบบตะกร้าสินค้า
- การคำนวณราคาและยอดรวม

### ✅ ระบบโปรโมชั่น
- หน้าเลือกโปรโมชั่น
- หน้าจัดการโปรโมชั่นแยก (เพิ่ม/แก้ไข/ลบ)
- เชื่อมต่อกับ Supabase Database

### ✅ ระบบใบเสร็จ
- แสดงใบเสร็จพร้อมรายละเอียด
- ดาวน์โหลดเป็นรูปภาพ (PNG)
- หมายเลขออเดอร์แบบ YYYYMMDD+4หลัก

### ✅ Dashboard Analytics
- กราฟยอดขายรายวัน/สัปดาห์/เดือน/ปี
- Pie Chart สินค้ายอดนิยม
- วิเคราะห์กำไร/ขาดทุน
- รายงานยอดขายรายเมนู

### ✅ Database Integration
- ตาราง: promotions, daily_sales, item_sales_analytics, promotion_analytics
- Auto-update analytics เมื่อมีออเดอร์ใหม่
- Backup ใน localStorage

## URL และ API Endpoints

### Production URLs
- Frontend: `https://cha-ma-rodfaipos.vercel.app`
- API Base: `https://cha-ma-rodfaipos.vercel.app/api`

### API Endpoints
- `GET /api/menu` - ดึงข้อมูลเมนู
- `GET/POST /api/orders` - จัดการออเดอร์
- `GET/POST/PUT/DELETE /api/promotions` - จัดการโปรโมชั่น
- `GET /api/analytics` - ดึงข้อมูลการวิเคราะห์

## การแก้ไขปัญหาที่อาจเกิดขึ้น

### ถ้า Build ไม่สำเร็จ
1. ตรวจสอบ Node.js version (ควรเป็น 18+)
2. ลบ `node_modules` และรัน `npm install` ใหม่
3. ตรวจสอบ syntax error ในโค้ด

### ถ้า API ไม่ทำงาน
1. ตรวจสอบ Environment Variables ใน Vercel
2. ตรวจสอบการเชื่อมต่อ Supabase
3. ดู Logs ใน Vercel Dashboard

### ถ้า Database ไม่เชื่อมต่อ
1. ตรวจสอบ Supabase URL และ API Key
2. ตรวจสอบว่าตารางถูกสร้างใน Supabase แล้ว
3. ตรวจสอบ RLS Policies

## การอัพเดทในอนาคต
1. แก้ไขโค้ดใน GitHub repository
2. Push การเปลี่ยนแปลง
3. Vercel จะ auto-deploy ทันที

สำเร็จ! แอป Thai Tea POS พร้อมใช้งานออนไลน์แล้ว 🎉
