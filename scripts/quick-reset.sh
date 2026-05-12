#!/bin/bash

# Quick Reset Script for iPhone Physical Device

echo "🧹 Complete App Reset for iPhone Physical Device"
echo "==============================================="
echo ""

echo "Step 1: Clear computer cache..."
npm run reset-project
echo "  ✓ Cache cleared"
echo ""

echo "Step 2: Remove node_modules cache..."
rm -rf node_modules/.cache 2>/dev/null
echo "  ✓ Removed"
echo ""

echo "Step 3: Clear Expo cache..."
rm -rf .expo 2>/dev/null
echo "  ✓ Cleared"
echo ""

echo "Step 4: Rebuild and deploy to iPhone..."
echo ""
echo "Run this command:"
echo "  npm run ios"
echo ""
echo "When prompted on iPhone:"
echo "  • Delete existing app (if present)"
echo "  • Confirm installation of new app"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Your iPhone will now have:"
echo "  • Fresh clean install"
echo "  • All old data deleted"
echo "  • Connected to http://172.20.10.11:4000"
echo ""
echo "📝 Next:"
echo "  1. Create new account in app"
echo "  2. Check console for: [API Response] <-- 200"
echo "  3. Should see Experiences feed load"
echo ""
