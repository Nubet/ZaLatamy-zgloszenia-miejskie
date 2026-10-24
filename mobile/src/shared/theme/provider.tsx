import { createContext, useContext, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, View } from 'react-native';
import { themes, type Theme, type ThemeName } from './tokens';

type ThemeContextValue = {
  name: ThemeName;
  colors: Theme;
  setTheme: (name: ThemeName) => Promise<void>;
  pending: boolean;
};
const ThemeContext = createContext<ThemeContextValue | null>(null);
const key = ['theme'];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: key,
    queryFn: async (): Promise<ThemeName> => {
      const value = await AsyncStorage.getItem('zalatamy:theme');
      return value === 'light' ? 'light' : 'dark';
    },
  });
  const mutation = useMutation({
    mutationFn: async (name: ThemeName) => {
      await AsyncStorage.setItem('zalatamy:theme', name);
      client.setQueryData(key, name);
    },
  });
  if (query.isPending)
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: themes.dark.background }}>
        <ActivityIndicator color={themes.dark.accentText} />
      </View>
    );
  const name = query.data ?? 'dark';
  return (
    <ThemeContext.Provider
      value={{
        name,
        colors: themes[name],
        setTheme: mutation.mutateAsync,
        pending: mutation.isPending,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('ThemeProvider is required');
  return context;
}
