import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// This logic ensures the correct base URL is used across all environments.
// Priority:
// 1. EXPO_PUBLIC_API_BASE_URL environment variable
// 2. app.json extra.apiBaseUrl
// 3. Platform-specific fallback (simulator/emulator defaults)
const fallbackApiBaseUrl = Platform.select({
  android: 'http://10.0.2.2:4000',
  default: 'http://192.168.20.12:4000',
});

const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  fallbackApiBaseUrl;

console.log(`[API] Initializing client with baseURL: ${API_BASE_URL}`);
console.log(`[API] Platform: ${Platform.OS}`);
console.log(`[API] Development: ${__DEV__}`);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Injection method to break circular dependencies
let injectedStore: any;
export const injectStore = (store: any) => {
  injectedStore = store;
};

// Request interceptor to add auth credentials globally
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        const accountData = await SecureStore.getItemAsync('sai-family.devotee-account');
        if (accountData) {
          const account = JSON.parse(accountData);
          if (account?.id) {
            // Injecting x-user-id header. Change to Authorization: `Bearer ${token}` if needed later.
            config.headers['x-user-id'] = account.id;
          }
        }
      }
    } catch (err) {
      console.error('[API] Error getting auth credentials:', err);
    }

    console.log(`[API Request] --> ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling globally
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] <-- ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('[API] Unauthorized access - redirect to login / clear token');
      if (injectedStore) {
        injectedStore.dispatch({ type: 'devotee-account/LOGOUT_REQUEST' });
      }
    }

    if (axios.isAxiosError(error)) {
      const errorDetails = {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        status: error.response?.status,
        isNetworkError: !error.response,
      };

      console.error('[API Response Error]', errorDetails);

      // Network error hints
      if (!error.response) {
        console.error('[API Troubleshooting Hints]');
        console.error('❌ Backend is NOT reachable at:', error.config?.baseURL);
        console.error('✓ To fix, please:');
        console.error('  1. Make sure backend is running: npm run dev (in backend folder)');
        console.error('  2. Check backend is listening on port 4000');
        if (Platform.OS === 'android') {
          console.error('  3. For Android emulator, ensure using http://10.0.2.2:4000');
        } else if (Platform.OS === 'ios') {
          console.error('  3. For iOS simulator, localhost:4000 should work');
        } else {
          console.error('  3. For physical device, use machine local IP: http://YOUR_IP:4000');
        }
        console.error('  4. See TROUBLESHOOTING.md for detailed setup');
      }
    } else {
      console.error('[API Response Error] <-- ', error);
    }
    return Promise.reject(error);
  }
);

// This helper is for the temporary x-user-id auth method.
export const getAuthHeaders = (userId?: string) => {
  return userId ? { 'x-user-id': userId } : {};
};
