import { useState } from 'react';
import { View } from 'react-native';
import { useIsMutating } from '@tanstack/react-query';
import { useSession } from '@/application/demo/session';
import { useTheme } from '@/shared/theme/provider';
import { Button, Card, Choice, Copy, Heading, Notice, Screen } from '@/shared/ui/primitives';

export function Settings() {
  const { role, setRole } = useSession();
  const { name, colors, setTheme, pending } = useTheme();
  const busy = useIsMutating({ mutationKey: ['reports'] }) > 0;
  const [error, setError] = useState('');
  function changeTheme(next: 'light' | 'dark') { setError(''); void setTheme(next).catch(() => setError('Nie udało się zapisać motywu. Spróbuj ponownie.')); }
  return <Screen>
    <Heading eyebrow="Ustawienia demo" title="Po Twojemu" description="Wygląd aplikacji i wybór perspektywy." />
    <Card><Copy weight="600">Wygląd</Copy><View style={{ flexDirection: 'row', gap: 10, opacity: pending ? 0.5 : 1 }} pointerEvents={pending ? 'none' : 'auto'}><Choice label="Jasny" selected={name === 'light'} onPress={() => changeTheme('light')} /><Choice label="Ciemny" selected={name === 'dark'} onPress={() => changeTheme('dark')} /></View><Copy muted size={13}>Motyw jest wspólny dla obu trybów i zapamiętany na urządzeniu.</Copy></Card>
    <Card><Copy weight="600">{role === 'official' ? 'Anna Kowalska · Urzędnik' : 'Marta Kowalska · Mieszkanka'}</Copy><Copy muted>Profil demonstracyjny. Zmień perspektywę, aby prześledzić tę samą sprawę po drugiej stronie.</Copy><Button label="Zmień tryb" variant="secondary" disabled={busy} onPress={() => setRole(null)} /></Card>
    <Notice message={error} error />
    <View style={{ height: 1, backgroundColor: colors.border }} /><Copy muted size={12}>ZaŁatamy · lokalne demo{ '\n' }Mapa: MapLibre / CARTO. Brak integracji z urzędem.</Copy>
  </Screen>;
}
