#!/bin/bash

# Complete Redux Saga Network Error - Final Fix Script

echo "🔧 Redux Saga Network Error - Complete Fix"
echo "==========================================="
echo ""

# Get the machine IP
MACHINE_IP="172.20.10.11"
LOCALHOST="localhost"

echo "📱 Choose your platform:"
echo ""
echo "1. iOS Simulator (use localhost:4000)"
echo "2. Android Emulator (use machine IP: $MACHINE_IP:4000)"
echo "3. Physical Device on WiFi (use machine IP: $MACHINE_IP:4000)"
echo "4. Just show me what to do"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
  1)
    echo ""
    echo "🍎 iOS Simulator Setup"
    echo ""
    echo "Step 1: Update app.json..."
    sed -i '' "s|\"apiBaseUrl\": \"[^\"]*\"|\"apiBaseUrl\": \"http://$LOCALHOST:4000\"|" app.json
    echo "  ✓ Updated to: http://$LOCALHOST:4000"
    echo ""
    echo "Step 2: Clear cache..."
    npm run reset-project || rm -rf node_modules/.cache
    echo "  ✓ Cache cleared"
    echo ""
    echo "Step 3: Restart iOS simulator..."
    echo "  📝 Run: npm run ios"
    echo ""
    echo "Step 4: Check console for:"
    echo "  ✅ [API Response] <-- 200 /api/experiences"
    echo ""
    ;;
  2)
    echo ""
    echo "🤖 Android Emulator Setup"
    echo ""
    echo "Step 1: Update app.json..."
    sed -i '' "s|\"apiBaseUrl\": \"[^\"]*\"|\"apiBaseUrl\": \"http://$MACHINE_IP:4000\"|" app.json
    echo "  ✓ Updated to: http://$MACHINE_IP:4000"
    echo ""
    echo "Step 2: Clear cache..."
    npm run reset-project || rm -rf node_modules/.cache
    echo "  ✓ Cache cleared"
    echo ""
    echo "Step 3: Restart Android emulator..."
    echo "  📝 Run: npm run android"
    echo ""
    echo "Step 4: Check console for:"
    echo "  ✅ [API Response] <-- 200 /api/experiences"
    echo ""
    ;;
  3)
    echo ""
    echo "📱 Physical Device Setup"
    echo ""
    echo "⚠️  Important:"
    echo "  1. Phone must be on the SAME WiFi network as this computer"
    echo "  2. Machine IP: $MACHINE_IP"
    echo "  3. Check phone WiFi is: $(networksetup -getairportnetwork en0 2>/dev/null || echo 'check WiFi settings')"
    echo ""
    echo "Step 1: Update app.json..."
    sed -i '' "s|\"apiBaseUrl\": \"[^\"]*\"|\"apiBaseUrl\": \"http://$MACHINE_IP:4000\"|" app.json
    echo "  ✓ Updated to: http://$MACHINE_IP:4000"
    echo ""
    echo "Step 2: Clear cache..."
    npm run reset-project || rm -rf node_modules/.cache
    echo "  ✓ Cache cleared"
    echo ""
    echo "Step 3: Rebuild and restart..."
    echo "  📝 For iOS: npm run ios"
    echo "  📝 For Android: npm run android"
    echo ""
    echo "Step 4: Check console for:"
    echo "  ✅ [API Response] <-- 200 /api/experiences"
    echo ""
    ;;
  4)
    echo ""
    echo "📋 Manual Setup Instructions:"
    echo ""
    cat << 'EOF'
1. IDENTIFY YOUR PLATFORM:
   - iOS Simulator? Use: http://localhost:4000
   - Android Emulator? Use: http://172.20.10.11:4000
   - Physical Device on WiFi? Use: http://172.20.10.11:4000

2. UPDATE app.json:
   Find this line:
     "apiBaseUrl": "http://localhost:4000"
   
   Replace with the appropriate URL from above

3. CLEAR CACHE:
   npm run reset-project

4. RESTART APP:
   npm run ios    # For iOS
   npm run android  # For Android

5. VERIFY IN CONSOLE:
   Look for these success messages:
   ✅ [API] Initializing client with baseURL: http://...
   ✅ [API Request] --> GET http://..../api/experiences
   ✅ [API Response] <-- 200 /api/experiences

6. IF STILL BROKEN:
   - Check backend is running: npm run dev (in backend-api folder)
   - Check console for detailed error: [Saga] Network Error
   - Read TROUBLESHOOTING.md for more help

EOF
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 For more help:"
echo "  - Detailed setup: cat API_SETUP.md"
echo "  - Troubleshooting: cat TROUBLESHOOTING.md"
echo "  - Run diagnostics: bash scripts/diagnose-network.sh"
echo ""
