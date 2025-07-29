import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Updated: Force cache reload - Build 2025-07-29
// ลอง render แบบง่าย ๆ
try {
  const root = createRoot(document.getElementById('root'));
  root.render(<App />);
} catch (error) {
  console.error('Failed to render:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h1>ระบบ POS ร้านชาไทย</h1>
      <p>กำลังโหลด...</p>
      <p style="color: red;">หากมีปัญหา กรุณารีเฟรชหน้าเว็บ</p>
    </div>
  `;
}
