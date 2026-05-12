#!/bin/bash

# Comprehensive Network Diagnostic Tool

echo "🔍 Redux Saga Network Error Diagnostic Tool"
echo "============================================"
echo ""

# Get machine IP
MACHINE_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "UNKNOWN")
LOCALHOST="127.0.0.1"

echo "📊 Network Information:"
echo "  Machine IP: $MACHINE_IP"
echo "  Localhost: $LOCALHOST"
echo "  Backend Port: 4000"
echo ""

# Check if backend is running
echo "🧪 Backend Connectivity Check:"
echo ""

echo "1. Testing http://localhost:4000"
if curl -s -m 3 http://localhost:4000/api/experiences > /dev/null 2>&1; then
  echo "   ✅ REACHABLE from macOS"
else
  echo "   ❌ NOT reachable (expected for mobile app)"
fi

echo ""
echo "2. Testing http://$MACHINE_IP:4000"
if [ "$MACHINE_IP" != "UNKNOWN" ]; then
  if curl -s -m 3 http://$MACHINE_IP:4000/api/experiences > /dev/null 2>&1; then
    echo "   ✅ REACHABLE from local network (use this for devices!)"
  else
    echo "   ❌ NOT reachable"
  fi
else
  echo "   ⚠️  Could not determine machine IP"
fi

echo ""
echo "3. Testing http://10.0.2.2:4000 (Android emulator special address)"
if curl -s -m 3 http://10.0.2.2:4000/api/experiences > /dev/null 2>&1; then
  echo "   ✅ REACHABLE (Android emulator can use this)"
else
  echo "   ❌ NOT reachable from this machine"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check current app.json setting
CURRENT_URL=$(grep -o '"apiBaseUrl": "[^"]*"' app.json 2>/dev/null | cut -d'"' -f4 || echo "NOT_FOUND")

echo "📝 Current Configuration:"
echo "  app.json apiBaseUrl: $CURRENT_URL"
echo ""

echo "🚀 SOLUTIONS:"
echo ""
echo "FOR iOS SIMULATOR:"
echo "  ✓ Use: http://localhost:4000"
echo "  ✓ Command: sed -i '' 's|\"apiBaseUrl\": \"[^\"]*\"|\"apiBaseUrl\": \"http://localhost:4000\"|' app.json"
echo "  ✓ Then: npm run ios"
echo ""

echo "FOR Android EMULATOR:"
echo "  ✓ Use: http://10.0.2.2:4000"
echo "  ✓ Command: sed -i '' 's|\"apiBaseUrl\": \"[^\"]*\"|\"apiBaseUrl\": \"http://10.0.2.2:4000\"|' app.json"
echo "  ✓ Then: npm run android"
echo ""

echo "FOR PHYSICAL DEVICE (same WiFi network):"
echo "  ✓ Use: http://$MACHINE_IP:4000"
echo "  ✓ Command: sed -i '' 's|\"apiBaseUrl\": \"[^\"]*\"|\"apiBaseUrl\": \"http://$MACHINE_IP:4000\"|' app.json"
echo "  ✓ Ensure phone is on SAME WiFi as dev machine"
echo "  ✓ Then: npm run android OR npm run ios"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS:"
echo "  1. Choose your platform above (iOS simulator, Android emulator, or physical device)"
echo "  2. Run the appropriate sed command to update app.json"
echo "  3. Clear app cache: npm run reset-project"
echo "  4. Rebuild and restart: npm run ios OR npm run android"
echo "  5. Watch console for: [API Response] <-- 200 /api/experiences"
echo ""
