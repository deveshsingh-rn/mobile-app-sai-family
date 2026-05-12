# Redux Saga & API Setup Guide

## Quick Start

### 1. Find Your Local IP Address

**macOS/Linux:**
```bash
ipconfig getifaddr en0
```

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**Example output:** `192.168.1.100`

### 2. Start the Backend API Server

Your backend should be running on port 4000:

```bash
cd ../backend-api  # Navigate to your backend folder
npm install
npm run dev        # or your start command
```

Verify it's running:
```bash
curl http://localhost:4000/health  # or any test endpoint
```

### 3. Configure the Mobile App URL

Edit `app.json` and update the API base URL:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://YOUR_LOCAL_IP:4000"
    }
  }
}
```

**Examples:**
- **Local dev (simulator):** `http://localhost:4000`
- **Physical device:** `http://192.168.1.100:4000` (replace with your IP)
- **Android emulator:** `http://10.0.2.2:4000`
- **iOS simulator:** `http://localhost:4000`

### 4. Test API Connection

After starting the app, check the console logs for:
```
[API] Initializing client with baseURL: http://YOUR_IP:4000
```

Look for successful API requests:
```
[API Request] --> GET /api/experiences
API_RESPONSE: apiFetchExperiences {...}
```

## Common Issues & Fixes

### Network Error When Fetching Experiences

**Symptom:** `SAGA_ERROR: handleFetchExperiences [AxiosError: Network Error]`

**Fix:**
1. ✅ Backend is running on the correct IP and port
2. ✅ Mobile app and backend are on the same network
3. ✅ No firewall blocking port 4000
4. ✅ Check console for actual base URL being used

### Backend Not Reachable

**Check:**
```bash
# From your machine, verify the backend is responding
curl http://YOUR_LOCAL_IP:4000/health

# If using 10.0.2.2 (Android emulator)
# Make sure backend is listening on 0.0.0.0, not just localhost
```

### CORS Errors

If you see CORS errors, ensure your backend has:
```javascript
// In your backend middleware
app.use(cors({
  origin: '*', // or specific origins
  credentials: true
}));
```

### Physical Device Can't Connect

1. Ensure phone and dev machine are on the same WiFi network
2. Disable VPN on phone if active
3. Check firewall isn't blocking port 4000
4. Use your machine's actual local IP (not localhost)

## Redux Saga Setup

### File Structure
```
store/
├── index.ts              # Store configuration + saga middleware
├── root-reducer.ts       # Combines all reducers
├── root-saga.ts          # Combines all sagas
├── types.ts              # Root state & dispatch types
├── devotee-account/      # Devotee account feature
│   ├── actions.ts        # Action creators
│   ├── reducer.ts        # Reducer
│   ├── saga.ts           # Saga watchers & workers
│   ├── selectors.ts      # Selectors
│   └── types.ts          # State & action types
└── experiences/          # Experiences feature
    ├── actions.ts
    ├── reducer.ts
    ├── saga.ts
    ├── selectors.ts
    └── types.ts
```

### How Saga Works

1. **Action dispatched:** `dispatch(fetchExperiencesRequest())`
2. **Saga watches:** `takeLatest(FETCH_EXPERIENCES_REQUEST, handleFetchExperiences)`
3. **Worker calls API:** `yield call(apiFetchExperiences, ...)`
4. **Success or failure:** `yield put(fetchExperiencesSuccess(data))`
5. **Reducer updates state**
6. **Component re-renders**

### Adding a New Saga

```typescript
// 1. Define action types in types.ts
export const MY_ACTION = 'MY_ACTION';

// 2. Create action creators in actions.ts
export const myAction = (payload) => ({ type: MY_ACTION, payload });

// 3. Create saga worker in saga.ts
function* handleMyAction(action: any) {
  try {
    const data = yield call(myApiCall, action.payload);
    yield put(myActionSuccess(data));
  } catch (error) {
    yield put(myActionFailure(error.message));
  }
}

// 4. Register in rootSaga in root-saga.ts
export function* rootSaga() {
  yield all([
    fork(devoteeAccountSaga),
    fork(experiencesSaga),
    fork(myNewSaga),  // Add here
  ]);
}
```

## Debugging Tips

### Enable Redux DevTools (React Native Debugger)

Already configured in `store/index.ts`:
```javascript
const composeEnhancers =
  (__DEV__ &&
    (global as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
    (global as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      trace: true,
      traceLimit: 25,
    })) ||
  compose;
```

Open React Native Debugger and navigate to Redux tab to see:
- Dispatched actions
- State changes
- Action timeline

### Check Saga Logs

Look for these patterns in console:
```
SAGA_ERROR: handleFetchExperiences    // Error in saga
API_REQUEST: apiFetchExperiences      // API call started
API_RESPONSE: apiFetchExperiences     // API response received
[API Response Error]                  // Network/API error
```

## Environment-Specific Setup

### Development
- Backend: `http://localhost:4000` (simulator) or `http://YOUR_IP:4000` (device)
- Redux DevTools: ✅ Enabled
- API Logs: ✅ Verbose

### Production
- Backend: Your production API URL
- Redux DevTools: ❌ Disabled
- API Logs: ❌ Minimal

Update in `store/index.ts` and `services/api.ts` as needed.
