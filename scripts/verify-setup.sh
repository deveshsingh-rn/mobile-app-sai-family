#!/bin/bash

# API Setup Verification Script
# This script helps verify that your Redux Saga + API setup is correct

set -e

echo "🔍 Checking Redux Saga & API Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if backend URL is configured
echo "1. Checking API configuration..."
API_URL=$(grep -o '"apiBaseUrl": "[^"]*"' app.json | cut -d'"' -f4 || echo "NOT_FOUND")
if [ "$API_URL" == "NOT_FOUND" ]; then
  echo -e "${RED}✗ API URL not found in app.json${NC}"
  exit 1
fi
echo -e "${GREEN}✓ API URL configured: $API_URL${NC}"
echo ""

# 2. Check if backend is reachable
echo "2. Checking if backend is reachable..."
HOST=$(echo "$API_URL" | sed -E 's|http[s]?://([^:/]+).*|\1|')
PORT=$(echo "$API_URL" | sed -E 's|.*:([0-9]+).*|\1|' || echo "80")

# Extract IP/hostname for curl
if command -v curl &> /dev/null; then
  if timeout 3 curl -s "$API_URL/health" > /dev/null 2>&1 || timeout 3 curl -s "$API_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is reachable at $API_URL${NC}"
  else
    echo -e "${YELLOW}⚠ Could not reach backend at $API_URL${NC}"
    echo "  Make sure:"
    echo "  1. Backend server is running on port $PORT"
    echo "  2. Backend is listening on 0.0.0.0 (not just localhost)"
    echo "  3. No firewall is blocking port $PORT"
  fi
else
  echo -e "${YELLOW}⚠ curl not found, skipping backend check${NC}"
fi
echo ""

# 3. Check Redux setup
echo "3. Checking Redux setup..."
if [ -f "store/index.ts" ] && [ -f "store/root-saga.ts" ]; then
  echo -e "${GREEN}✓ Redux store files found${NC}"
else
  echo -e "${RED}✗ Redux store files missing${NC}"
  exit 1
fi
echo ""

# 4. Check API client configuration
echo "4. Checking API client..."
if grep -q "apiClient = axios.create" services/api.ts; then
  echo -e "${GREEN}✓ Axios client configured${NC}"
else
  echo -e "${RED}✗ Axios client not properly configured${NC}"
  exit 1
fi
echo ""

# 5. Check saga middleware
echo "5. Checking saga middleware setup..."
if grep -q "sagaMiddleware.run(rootSaga)" store/index.ts; then
  echo -e "${GREEN}✓ Saga middleware is running${NC}"
else
  echo -e "${RED}✗ Saga middleware not running${NC}"
  exit 1
fi
echo ""

# 6. Check experiences saga
echo "6. Checking experiences saga..."
if [ -f "store/experiences/saga.ts" ] && grep -q "handleFetchExperiences" store/experiences/saga.ts; then
  echo -e "${GREEN}✓ Experiences saga configured${NC}"
else
  echo -e "${RED}✗ Experiences saga missing or misconfigured${NC}"
  exit 1
fi
echo ""

echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Make sure your backend API is running: npm run dev (in backend folder)"
echo "2. Start the mobile app: npm run start"
echo "3. Check the console logs for '[API]' messages"
echo "4. Look for 'API_RESPONSE: apiFetchExperiences' for successful API calls"
echo ""
echo "📖 For detailed setup guide, see: API_SETUP.md"
