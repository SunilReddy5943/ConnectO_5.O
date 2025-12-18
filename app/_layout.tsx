import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LocationProvider } from './context/LocationContext';

// Polyfill fetch to prevent Supabase from trying to import @supabase/node-fetch
if (typeof globalThis.fetch === 'undefined') {
  // @ts-ignore
  globalThis.fetch = fetch;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <LocationProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/intent-selection" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/otp" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="auth/worker-register" />
            <Stack.Screen name="auth/role-select" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="search" />
            <Stack.Screen name="worker/[id]" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="job/create" />
            <Stack.Screen name="job/[id]" />
            <Stack.Screen name="referral" options={{ headerShown: false }} />
          </Stack>
        </LocationProvider>
      </AppProvider>
    </AuthProvider>
  );
}
