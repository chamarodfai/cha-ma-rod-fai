/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'thai-orange': '#FF6B35',
        'thai-gold': '#F7931E',
        'thai-brown': '#8B4513',
        'thai-cream': '#FFF8DC'
      }
    },
  },
  plugins: [],
}
