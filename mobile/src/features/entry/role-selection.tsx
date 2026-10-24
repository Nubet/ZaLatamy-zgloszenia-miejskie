import { Redirect } from 'expo-router';
import { View, Pressable } from 'react-native';
import { ArrowUpRight, Building2, MapPinned, Moon, Sun } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession, type Role } from '@/application/demo/session';
import { useTheme } from '@/shared/theme/provider';
import { Button, Card, Copy, Heading, Notice, Screen } from '@/shared/ui/primitives';
import { useState } from 'react';

export function RoleSelection() {
  const { role, setRole } = useSession();
  const { name, colors, setTheme, pending } = useTheme();
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();
  if (role) return <Redirect href={role === 'resident' ? '/resident' : '/official'} />;
  const modes: { role: Role; title: string; description: string; icon: typeof MapPinned }[] = [
    { role: 'resident', title: 'Jestem mieszkańcem', description: 'Zgłoś problem, sprawdź okolicę i śledź postęp spraw.', icon: MapPinned },
    { role: 'official', title: 'Jestem urzędnikiem', description: 'Przeglądaj kolejkę, aktualizuj statusy i łącz sprawy.', icon: Building2 },
  ];
  return <Screen><View style={{ paddingTop: insets.top + 20, gap: 30 }}>
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><View style={{ backgroundColor: colors.accent, padding: 10, borderRadius: 12 }}><MapPinned color="#ffffff" size={24} /></View><Copy size={23} weight="800">ZaŁatamy</Copy><Copy muted size={12}>ŁÓDŹ</Copy></View>
    <Heading eyebrow="Wersja demonstracyjna" title="Jedno miasto.\nDwie perspektywy." description="Wybierz, z której strony chcesz poznać aplikację." />
    <Card><Copy weight="600">To jest demo</Copy><Copy muted>Zgłoszenia i działania urzędu są demonstracyjne. Dane zapisują się tylko na tym urządzeniu. Nic nie jest wysyłane do miasta.</Copy></Card>
    {modes.map(mode => <Pressable key={mode.role} accessibilityRole="button" accessibilityLabel={mode.title} onPress={() => setRole(mode.role)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}><Card style={{ gap: 16 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><mode.icon size={28} color={colors.accentText} /><ArrowUpRight size={20} color={colors.muted} /></View><Copy size={21} weight="700">{mode.title}</Copy><Copy muted>{mode.description}</Copy></Card></Pressable>)}
    <Button label={name === 'dark' ? 'Włącz jasny motyw' : 'Włącz ciemny motyw'} variant="secondary" pending={pending} icon={name === 'dark' ? <Sun size={18} color={colors.text} /> : <Moon size={18} color={colors.text} />} onPress={() => { setError(''); void setTheme(name === 'dark' ? 'light' : 'dark').catch(() => setError('Nie udało się zapisać motywu. Spróbuj ponownie.')); }} />
    <Notice message={error} error /><Copy muted size={12}>Mapa korzysta z internetu. Pozostałe dane demo są lokalne.</Copy>
  </View></Screen>;
}
