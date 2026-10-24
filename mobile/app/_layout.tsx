import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ThemeProvider, useTheme } from '@/shared/theme/provider';
import { StatusBar } from 'expo-status-bar';
import { ReportsProvider } from '@/application/reports/provider';
import { localGateway } from '@/infrastructure/local/native-storage';
import { SessionProvider, useSession } from '@/application/demo/session';
import { ReportingProvider } from '@/application/reporting/services';
import { reportingServices } from '@/infrastructure/media/reporting-services';

export default function RootLayout() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false }, mutations: { retry: false } } }));
  return <SafeAreaProvider><QueryClientProvider client={client}><ThemeProvider><ReportsProvider gateway={localGateway}><ReportingProvider services={reportingServices}><SessionProvider><Navigation /></SessionProvider></ReportingProvider></ReportsProvider></ThemeProvider></QueryClientProvider></SafeAreaProvider>;
}

function Navigation() {
  const { colors, name } = useTheme();
  const { role } = useSession();
  return <><StatusBar style={name === 'dark' ? 'light' : 'dark'} /><Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.background }, headerShadowVisible: false }}>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Protected guard={role === 'resident'}><Stack.Screen name="resident" options={{ headerShown: false }} /></Stack.Protected>
    <Stack.Protected guard={role === 'official'}><Stack.Screen name="official" options={{ headerShown: false }} /></Stack.Protected>
  </Stack></>;
}
