@echo off
echo 🚀 Thai Tea POS Deployment Status Check
echo ========================================

echo.
echo 📋 Project Information:
echo - Repository: chamarodfai/cha-ma-rod-fai
echo - Framework: Vite + React
echo - Database: Supabase
echo.

echo 🔍 Checking deployment status...
echo.

REM Try to get the latest deployment URL from Vercel
echo Deployment URLs (from recent deployments):
echo - https://cha-ma-rod-rf11h9ctu-asias-projects-1bfe2838.vercel.app
echo - https://cha-ma-rod-iyzf3dj7b-asias-projects-1bfe2838.vercel.app  
echo - https://cha-ma-rod-62qqqynl8-asias-projects-1bfe2838.vercel.app

echo.
echo 🌐 กำลังทดสอบ URLs...

REM Test the URLs
curl -s -o nul -w "URL 1: %%{http_code} (%%{time_total}s)\n" https://cha-ma-rod-rf11h9ctu-asias-projects-1bfe2838.vercel.app
curl -s -o nul -w "URL 2: %%{http_code} (%%{time_total}s)\n" https://cha-ma-rod-iyzf3dj7b-asias-projects-1bfe2838.vercel.app
curl -s -o nul -w "URL 3: %%{http_code} (%%{time_total}s)\n" https://cha-ma-rod-62qqqynl8-asias-projects-1bfe2838.vercel.app

echo.
echo ✅ ตรวจสอบเสร็จแล้ว!
echo.
echo 📖 คู่มือการใช้งาน:
echo 1. หากสถานะเป็น 200 = เว็บทำงานปกติ
echo 2. หากสถานะเป็น 404 = ยังไม่พร้อมใช้งาน
echo 3. หากสถานะเป็น 500 = มีข้อผิดพลาดในระบบ
echo.
echo 🔗 เปิดเว็บไซต์ล่าสุด: 
echo https://cha-ma-rod-62qqqynl8-asias-projects-1bfe2838.vercel.app

pause
