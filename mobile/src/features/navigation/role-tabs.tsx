import { Tabs } from 'expo-router';
import { Archive, Bell, Bookmark, List, ListTodo, MapPinned, Settings } from 'lucide-react-native';
import { useTheme } from '@/shared/theme/provider';
import { useReports } from '@/application/reports/provider';

export function RoleTabs({ official = false }: { official?: boolean }) {
  const { colors } = useTheme();
  const reports = useReports();
  const unread = reports.data?.notifications.filter((item) => !item.read).length ?? 0;
  const tabs = official
    ? [
        { name: 'index', label: 'Do obsługi', icon: ListTodo },
        { name: 'all', label: 'Wszystkie', icon: List },
        { name: 'archive', label: 'Archiwum', icon: Archive },
      ]
    : [
        { name: 'index', label: 'Mapa', icon: MapPinned },
        { name: 'mine', label: 'Moje sprawy', icon: Bookmark },
        { name: 'notifications', label: 'Zmiany', icon: Bell },
      ];
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.navigation, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accentText,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11 },
        headerTitleStyle: { fontSize: 17 },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            headerTitle: `${official ? 'Urząd' : 'Mieszkaniec'} · Demo`,
            tabBarIcon: ({ color, size }) => <tab.icon color={color} size={size} />,
            tabBarBadge: tab.name === 'notifications' && unread ? unread : undefined,
            tabBarBadgeStyle: { backgroundColor: colors.accent, color: '#ffffff' },
          }}
        />
      ))}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ustawienia',
          headerTitle: 'Ustawienia · Demo',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
