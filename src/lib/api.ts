import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, STORAGE_KEYS } from './config';
import type {
  User,
  TimeLog,
  RegisterData,
  AuthResponse,
  RefreshTokenResponse,
  ProfileResponse,
} from '../types';

// API client utility for React Native
class ApiClient {
  public baseURL: string; // Public for accessing uploaded files

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Token management with AsyncStorage
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      ]);
    } catch (error) {
      console.error('Error setting tokens:', error);
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  private isRefreshing = false;
  private refreshPromise: Promise<RefreshTokenResponse> | null = null;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAuth: boolean = false,
    isRetry: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if useAuth is true
    if (useAuth) {
      const token = await this.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`✅ API Response: ${response.status} ${url}`);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && useAuth && !isRetry && endpoint !== '/auth/refresh-token') {
        // Wait for ongoing refresh or start new one
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshPromise = this.refreshToken()
            .catch((error) => {
              // If refresh fails, clear tokens and reject
              this.clearTokens();
              throw error;
            })
            .finally(() => {
              this.isRefreshing = false;
              this.refreshPromise = null;
            });
        }

        try {
          await this.refreshPromise;
          // Retry the original request with new token
          return this.request<T>(endpoint, options, useAuth, true);
        } catch (refreshError) {
          // If refresh failed, throw the original 401 error
          const error = await response.json().catch(() => ({ message: 'Unauthorized' }));
          throw new Error(error.message || 'Unauthorized');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Handle timeout and network errors
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('API request timeout:', url);
        throw new Error('Tempo de resposta excedido. Verifique sua conexão.');
      }

      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store tokens
    if (response.accessToken && response.refreshToken) {
      await this.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store tokens
    if (response.accessToken && response.refreshToken) {
      await this.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<RefreshTokenResponse>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    // Update tokens
    if (response.accessToken && response.refreshToken) {
      await this.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }, true);

    // Clear tokens
    await this.clearTokens();

    return response;
  }

  async getProfile(): Promise<ProfileResponse> {
    return this.request<ProfileResponse>('/auth/profile', {}, true);
  }

  // Time log endpoints
  async checkIn(photo: {uri: string; type: string; name: string}, latitude: number, longitude: number): Promise<{ message: string; timeLog: TimeLog }> {
    const formData = new FormData();

    // React Native FormData file format
    formData.append('photo', {
      uri: photo.uri,
      type: 'image/jpeg',
      name: 'checkin.jpg',
    } as any);

    // Send as 'latitude' and 'longitude' - backend expects these names
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());

    console.log('📦 FormData contents:', {
      photoUri: photo.uri,
      photoType: 'image/jpeg',
      photoName: 'checkin.jpg',
      latitude,
      longitude,
    });

    const token = await this.getAccessToken();
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // DO NOT set Content-Type - let fetch set it with boundary for FormData

    console.log(`🌐 API Request: POST ${this.baseURL}/timelog/checkin (FormData)`);
    console.log('📦 Headers:', headers);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s for compressed photo upload

    try {
      const response = await fetch(`${this.baseURL}/timelog/checkin`, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
        // @ts-ignore - React Native specific options
        ...(Platform.OS === 'ios' ? { timeout: 20000 } : {}),
      });

      clearTimeout(timeoutId);
      console.log(`✅ API Response: ${response.status} /timelog/checkin`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('API request timeout: /timelog/checkin');
        throw new Error('Tempo de resposta excedido. Verifique sua conexão.');
      }

      if (error instanceof TypeError && error.message === 'Network request failed') {
        console.error('Network error during checkin:', error);
        console.error('Possible causes:');
        console.error('1. Backend not running on', this.baseURL);
        console.error('2. Device not on same network');
        console.error('3. File upload size too large');
        console.error('4. Firewall blocking the request');
        throw new Error('Falha na conexão com o servidor. Verifique se o backend está rodando.');
      }

      console.error('API request failed:', error);
      throw error;
    }
  }

  async checkOut(photo: {uri: string; type: string; name: string}, latitude: number, longitude: number): Promise<{ message: string; timeLog: TimeLog }> {
    const formData = new FormData();

    // React Native FormData file format
    formData.append('photo', {
      uri: photo.uri,
      type: 'image/jpeg',
      name: 'checkout.jpg',
    } as any);

    // Send as 'latitude' and 'longitude' - backend expects these names
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());

    console.log('📦 FormData contents:', {
      photoUri: photo.uri,
      photoType: 'image/jpeg',
      photoName: 'checkout.jpg',
      latitude,
      longitude,
    });

    const token = await this.getAccessToken();
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // DO NOT set Content-Type - let fetch set it with boundary for FormData

    console.log(`🌐 API Request: POST ${this.baseURL}/timelog/checkout (FormData)`);
    console.log('📦 Headers:', headers);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s for compressed photo upload

    try {
      const response = await fetch(`${this.baseURL}/timelog/checkout`, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
        // @ts-ignore - React Native specific options
        ...(Platform.OS === 'ios' ? { timeout: 20000 } : {}),
      });

      clearTimeout(timeoutId);
      console.log(`✅ API Response: ${response.status} /timelog/checkout`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('API request timeout: /timelog/checkout');
        throw new Error('Tempo de resposta excedido. Verifique sua conexão.');
      }

      if (error instanceof TypeError && error.message === 'Network request failed') {
        console.error('Network error during checkout:', error);
        console.error('Possible causes:');
        console.error('1. Backend not running on', this.baseURL);
        console.error('2. Device not on same network');
        console.error('3. File upload size too large');
        console.error('4. Firewall blocking the request');
        throw new Error('Falha na conexão com o servidor. Verifique se o backend está rodando.');
      }

      console.error('API request failed:', error);
      throw error;
    }
  }

  async getTimeLogs(): Promise<TimeLog[]> {
    return this.request<TimeLog[]>('/timelog', {}, true);
  }

  // Helper function to build correct photo URLs (handles both local and Cloudinary URLs)
  getPhotoUrl(photoPath: string | null | undefined): string | null {
    if (!photoPath) return null;
    // If it's already a full URL (Cloudinary), return as is
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    // Otherwise, it's a local path, prepend the API URL
    return `${this.baseURL}${photoPath}`;
  }
}

// Export singleton instance
export const api = new ApiClient(API_URL);
