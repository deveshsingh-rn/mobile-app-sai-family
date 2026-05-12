#!/bin/bash

# Clear All App Data for Fresh Start

echo "🧹 Clearing All Saved Data"
echo "=========================="
echo ""

# The account data is saved in SecureStore with this key:
SECURE_STORE_KEY="sai-family.devotee-account"

echo "📋 Data that will be cleared:"
echo "  • Saved devotee account data"
echo "  • Redux state"
echo "  • App cache"
echo ""

echo "🔧 Steps to clear everything:"
echo ""
echo "1️⃣  Stop the app on your iPhone"
echo ""
echo "2️⃣  Run on your computer:"
echo "   npm run reset-project"
echo "   This clears:"
echo "   • Local React Native cache"
echo "   • Node modules cache"
echo ""
echo "3️⃣  Clear iPhone app cache/storage:"
echo "   • Settings → General → iPhone Storage"
echo "   • Find 'sai-family' app"
echo "   • Tap 'Offload App' or 'Delete App'"
echo "   • Then reinstall: npm run ios"
echo ""
echo "4️⃣  Full reset (if above doesn't work):"
echo "   • Uninstall app from iPhone"
echo "   • Delete build artifacts on computer:"
echo ""

cat << 'EOF'
     rm -rf /Users/developer/Desktop/mobile-app-sai-family/ios/Pods
     rm -rf /Users/developer/Desktop/mobile-app-sai-family/.expo
     rm -rf /Users/developer/Desktop/mobile-app-sai-family/node_modules/.cache

5️⃣  Rebuild everything fresh:
   npm install
   npm run reset-project
   npm run ios

EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ After completing above steps:"
echo "  • App will be completely fresh"
echo "  • All old account data is gone"
echo "  • Ready to create new account"
echo ""
echo "🌐 Network Fixed:"
echo "  • app.json updated to: http://172.20.10.11:4000"
echo "  • Should now work on physical iPhone"
echo ""
echo "📝 Look for in console:"
echo "  ✅ [API Response] <-- 200 /api/experiences"
echo ""
