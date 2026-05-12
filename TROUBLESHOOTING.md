# Network Error Troubleshooting Guide

## Your Current Error

```
ERROR SAGA_ERROR: handleFetchExperiences [AxiosError: Network Error]
```

This means the mobile app tried to fetch experiences from the backend API but failed because:
1. **Backend is not running** (most common)
2. **Wrong API URL** in app.json
3. **Network connectivity issue** between app and backend
4. **Firewall blocking** the port

## Solution

### Step 1: Start the Backend API Server

The backend API must be running on port 4000 before the mobile app can fetch data.

```bash
# Navigate to your backend project
cd ../backend-api

# Install dependencies (if not done)
npm install

# Start the development server
npm run dev
```

**Expected output:**
```
Server running on http://localhost:4000
```

### Step 2: Verify the Backend is Running

Test the API manually:

```bash
# Test API endpoint
curl http://localhost:4000/api/experiences

# If backend has a health check endpoint
curl http://localhost:4000/health
```

**Expected:** You should get a JSON response (not a connection error).

### Step 3: Verify Mobile App Configuration

Check that `app.json` has the correct API URL:

```bash
npm run verify
```

**Output should show:**
```
✓ API URL configured: http://localhost:4000
✓ Saga middleware is running
✓ Experiences saga configured
```

### Step 4: Start the Mobile App

In a new terminal:

```bash
npm run start

# For iOS
npm run ios

# For Android  
npm run android
```

### Step 5: Check Console Logs

Look for these success indicators:

```
[API] Initializing client with baseURL: http://localhost:4000
[API Request] --> GET /api/experiences
API_RESPONSE: apiFetchExperiences {...}
```

If you see errors like:
```
[API Response Error] <-- Network Error
SAGA_ERROR: handleFetchExperiences
```

It means the backend is still not reachable. Go back to Step 1 and make sure it's running.

---

## Detailed Troubleshooting

### Issue: Backend Shows "Cannot Listen on Port 4000"

**Solution:** Another process is using port 4000. Find and stop it:

```bash
# macOS/Linux
lsof -i :4000
kill -9 <PID>

# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

Then restart the backend.

### Issue: "Connection Refused" or "Network Error"

**Possible causes & fixes:**

1. **Backend not running**
   ```bash
   # Check if backend process is running
   npm run dev  # in backend folder
   ```

2. **Backend listening on wrong address**
   - Backend should listen on `0.0.0.0`, not just `localhost`
   - Check your backend's configuration/port setup

3. **Firewall blocking port 4000**
   - Macbook: System Preferences → Security & Privacy → Firewall
   - Windows: Windows Defender Firewall → Allow app through

4. **Using wrong IP for physical device**
   - Get your machine's local IP: `ipconfig getifaddr en0` (macOS)
   - Update app.json: `"apiBaseUrl": "http://192.168.1.100:4000"`
   - Phone must be on same WiFi network

### Issue: Error on Physical Device But Works on Simulator

**Solution:** Use your machine's local IP instead of localhost

```bash
# Get your IP (macOS)
ipconfig getifaddr en0
# Example output: 192.168.1.100

# Update app.json
{
  "extra": {
    "apiBaseUrl": "http://192.168.1.100:4000"
  }
}

# Rebuild and restart the app
npm run android  # or npm run ios
```

**Make sure:**
- Phone is on same WiFi as dev machine
- Backend is listening on `0.0.0.0`, not just `localhost`

### Issue: CORS Errors

If you see CORS errors in network tab:

**Fix in Backend:**

```javascript
// Add to your backend middleware (Express example)
const cors = require('cors');

app.use(cors({
  origin: '*', // or specific origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  headers: ['Content-Type', 'x-user-id', 'Authorization']
}));
```

### Issue: "Timeout" Errors

Backend is reachable but slow or not responding:

```javascript
// In services/api.ts, you can increase timeout:
// Current: timeout: 30000 (30 seconds)
// This is usually enough, but if needed:
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,  // 60 seconds
});
```

---

## Workflow: Start Everything Correctly

### Terminal 1 (Backend)
```bash
cd backend-api
npm run dev
# Wait for "Server running on http://localhost:4000"
```

### Terminal 2 (Mobile App)
```bash
cd mobile-app-sai-family
npm run start
# Scan QR code or press 'i' for iOS / 'a' for Android
```

### Verify It's Working

In the mobile app, you should see:
- ✅ Experiences feed loads
- ✅ No network errors in console
- ✅ "API_RESPONSE: apiFetchExperiences" in logs

---

## Quick Reference: Setup Checklist

- [ ] Backend API repository cloned/exists
- [ ] Backend dependencies installed: `npm install`
- [ ] Backend started: `npm run dev` (port 4000)
- [ ] Backend responding: `curl http://localhost:4000/api/experiences`
- [ ] `app.json` has correct API URL
- [ ] `npm run verify` shows all checks ✓
- [ ] Mobile app started: `npm run start`
- [ ] Console shows `[API]` initialization messages
- [ ] Experiences feed loads without errors

---

## Redux Saga Data Flow Diagram

```
User Action (Component)
    ↓
dispatch(fetchExperiencesRequest())
    ↓
[Saga watches] takeLatest(FETCH_EXPERIENCES_REQUEST)
    ↓
handleFetchExperiences worker function
    ↓
yield call(apiFetchExperiences, params)
    ↓
apiClient.get('/api/experiences')
    ↓
← → Backend API
    ↓
yield put(fetchExperiencesSuccess(data))
    ↓
[Reducer] updates state
    ↓
Component re-renders with new data
```

If it fails at "apiClient.get" step → Network Error

---

## Still Not Working?

1. **Run verification:** `npm run verify`
2. **Check console logs** for `[API]` messages
3. **Check backend console** for request logs
4. **Verify port 4000 is free:** `lsof -i :4000`
5. **Verify API endpoint exists:** `curl http://localhost:4000/api/experiences`
6. **Check firewall** isn't blocking the port
7. **Try localhost vs 10.0.2.2** if on Android emulator

If all else fails, check these files:
- `app.json` → API URL configuration
- `services/api.ts` → Axios client setup
- `store/experiences/saga.ts` → Saga error handling
- `store/index.ts` → Store/saga middleware initialization
