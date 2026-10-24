import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ThemeProvider, useTheme } from '@/shared/theme/provider';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false }, mutations: { retry: false } } }));
  return <SafeAreaProvider><QueryClientProvider client={client}><ThemeProvider><Navigation /></ThemeProvider></QueryClientProvider></SafeAreaProvider>;
}

function Navigation() {
  const { colors, name } = useTheme();
  return <><StatusBar style={name === 'dark' ? 'light' : 'dark'} /><Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.background }, headerShadowVisible: false }}><Stack.Screen name="index" options={{ headerShown: false }} /></Stack></>;
}
