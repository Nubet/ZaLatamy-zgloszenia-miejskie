import { Redirect } from 'expo-router';
import { Image } from 'expo-image';
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
    {
      role: 'resident',
      title: 'Jestem mieszkańcem',
      description: 'Zgłoś problem, sprawdź okolicę i śledź postęp spraw.',
      icon: MapPinned,
    },
    {
      role: 'official',
      title: 'Jestem urzędnikiem',
      description: 'Przeglądaj kolejkę, aktualizuj statusy i łącz sprawy.',
      icon: Building2,
    },
  ];
  return (
    <Screen>
      <View style={{ paddingTop: insets.top + 20, gap: 20 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Image
            source={require('../../../assets/logo.svg')}
            style={{ width: 44, height: 44 }}
            contentFit="contain"
            accessibilityLabel="Logo ZaŁatamy"
          />
          <Copy size={23} weight="800">
            ZaŁatamy
          </Copy>
          <Copy muted size={12}>
            ŁÓDŹ
          </Copy>
        </View>
        <Heading title="Wybierz profil" />
        {modes.map((mode) => (
          <Pressable
            key={mode.role}
            accessibilityRole="button"
            accessibilityLabel={mode.title}
            onPress={() => setRole(mode.role)}
            style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
          >
            <Card
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 20 }}
            >
              <mode.icon size={24} color={colors.accentText} />
              <View style={{ flex: 1, gap: 4 }}>
                <Copy size={17} weight="600">
                  {mode.title}
                </Copy>
                <Copy muted size={13}>
                  {mode.description}
                </Copy>
              </View>
              <ArrowUpRight size={18} color={colors.muted} />
            </Card>
          </Pressable>
        ))}
        <Button
          label={name === 'dark' ? 'Włącz jasny motyw' : 'Włącz ciemny motyw'}
          variant="text"
          pending={pending}
          icon={
            name === 'dark' ? (
              <Sun size={18} color={colors.text} />
            ) : (
              <Moon size={18} color={colors.text} />
            )
          }
          onPress={() => {
            setError('');
            void setTheme(name === 'dark' ? 'light' : 'dark').catch(() =>
              setError('Nie udało się zapisać motywu. Spróbuj ponownie.'),
            );
          }}
        />
        <Notice message={error} error />
        <Copy muted size={12}>
          Wersja demonstracyjna. Zgłoszenia nie są wysyłane do urzędu.
        </Copy>
      </View>
    </Screen>
  );
}
