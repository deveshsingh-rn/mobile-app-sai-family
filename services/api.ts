import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// This logic ensures the correct base URL is used across all environments.
// - Production: Uses the production URL (when you set one).
// - Development on physical device: Uses the IP from app.json.
// - Development on simulators: Falls back to localhost/10.0.2.2.
const fallbackApiBaseUrl = Platform.select({
  android: 'http://10.0.2.2:4000',
  default: 'http://localhost:4000',
});

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || fallbackApiBaseUrl;

console.log(`[API] Initializing client with baseURL: ${API_BASE_URL}`);

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

    console.log(`[API Request] --> ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('[API] Unauthorized access - redirect to login / clear token');
      if (injectedStore) {
        injectedStore.dispatch({ type: 'devotee-account/LOGOUT_REQUEST' });
      }
    }

    if (axios.isAxiosError(error)) {
      console.error('[API Response Error] <-- ', {
        message: error.message,
        url: error.config?.url,
        status: error.response?.status,
      });
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