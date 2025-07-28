#!/bin/bash

# Quick Health Check for Thai Tea POS Deployment
echo "🏥 Thai Tea POS - Quick Health Check"
echo "===================================="

BASE_URL="https://cha-ma-rodfaipos.vercel.app"

echo "🌐 Testing Production URL..."
curl -s -o /dev/null -w "Main App: %{http_code} (%{time_total}s)\n" $BASE_URL

echo ""
echo "🔗 Testing API Endpoints..."
curl -s -o /dev/null -w "Menu API: %{http_code} (%{time_total}s)\n" $BASE_URL/api/menu
curl -s -o /dev/null -w "Orders API: %{http_code} (%{time_total}s)\n" $BASE_URL/api/orders  
curl -s -o /dev/null -w "Promotions API: %{http_code} (%{time_total}s)\n" $BASE_URL/api/promotions
curl -s -o /dev/null -w "Analytics API: %{http_code} (%{time_total}s)\n" $BASE_URL/api/analytics

echo ""
echo "✅ Health check complete!"
echo "💻 Production URL: $BASE_URL"
