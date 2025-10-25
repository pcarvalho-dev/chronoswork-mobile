import { Platform } from 'react-native';
import Constants from 'expo-constants';

// API Configuration
// IMPORTANT: Update this IP to your computer's local IP address
// Find your IP: On Linux run: hostname -I | awk '{print $1}'
const LOCAL_IP = '192.168.1.226'; // Your computer's IP on local network
const API_PORT = '8000';

const getApiUrl = () => {
  // Check for manual override first (useful for physical devices)
  const forceLocalIP = process.env.EXPO_PUBLIC_FORCE_LOCAL_IP === 'true';
  const manualApiUrl = process.env.EXPO_PUBLIC_API_URL;

  if (forceLocalIP && manualApiUrl) {
    console.log('🔧 Using manual API URL from .env:', manualApiUrl);
    return manualApiUrl;
  }

  if (__DEV__) {
    // Detect if running on physical device or emulator/simulator
    const isPhysicalDevice = Constants.isDevice;
    const deviceName = Constants.deviceName;
    const expoConfig = Constants.expoConfig;

    console.log('📱 Platform:', Platform.OS);
    console.log('📱 Is Physical Device (Constants.isDevice):', isPhysicalDevice);
    console.log('📱 Device Name:', deviceName);
    console.log('📱 Running in Expo Go:', !!expoConfig?.extra?.expoGo);

    // Better detection: Check if running in Expo Go (always physical device)
    // or if debugger host is set (means physical device connected via network)
    const isRunningInExpoGo = !!expoConfig?.extra?.expoGo;
    const debuggerHost = expoConfig?.hostUri;

    console.log('🔍 Debugger Host:', debuggerHost);

    // If running in Expo Go or debugger host exists, it's a physical device
    const isRealDevice = isRunningInExpoGo || !!debuggerHost || isPhysicalDevice;

    console.log('✅ Final Detection - Is Real Device:', isRealDevice);

    if (Platform.OS === 'android') {
      // Physical Android device: use local IP
      // Android emulator: use 10.0.2.2
      const androidUrl = isRealDevice
        ? `http://${LOCAL_IP}:${API_PORT}`
        : `http://10.0.2.2:${API_PORT}`;
      console.log('🤖 Android URL:', androidUrl);
      return androidUrl;
    }

    if (Platform.OS === 'ios') {
      // Physical iOS device: use local IP
      // iOS simulator: use localhost
      const iosUrl = isRealDevice
        ? `http://${LOCAL_IP}:${API_PORT}`
        : `http://localhost:${API_PORT}`;
      console.log('🍎 iOS URL:', iosUrl);
      return iosUrl;
    }

    // Fallback
    return `http://${LOCAL_IP}:${API_PORT}`;
  }

  // Production: use your actual API URL
  return 'https://chronos-work.onrender.com';
};

export const API_URL = getApiUrl();

// Log the API URL for debugging
console.log('🔗 API URL configured as:', API_URL);

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;
