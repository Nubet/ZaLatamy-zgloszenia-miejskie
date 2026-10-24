import { useState } from 'react';
import { View } from 'react-native';
import { useIsMutating } from '@tanstack/react-query';
import { useSession } from '@/application/demo/session';
import { useTheme } from '@/shared/theme/provider';
import { Button, Card, Choice, Copy, Notice, Screen } from '@/shared/ui/primitives';
import { ResetDemo } from './reset-demo';

export function Settings() {
  const { role, setRole } = useSession();
  const { name, colors, setTheme, pending } = useTheme();
  const busy = useIsMutating({ mutationKey: ['reports'] }) > 0;
  const [error, setError] = useState('');
  function changeTheme(next: 'light' | 'dark') {
    setError('');
    void setTheme(next).catch(() => setError('Nie udało się zapisać motywu. Spróbuj ponownie.'));
  }
  return (
    <Screen>
      <Card>
        <Copy weight="600">Wygląd</Copy>
        <View
          style={{ flexDirection: 'row', gap: 10, opacity: pending ? 0.5 : 1 }}
          pointerEvents={pending ? 'none' : 'auto'}
        >
          <Choice label="Jasny" selected={name === 'light'} onPress={() => changeTheme('light')} />
          <Choice label="Ciemny" selected={name === 'dark'} onPress={() => changeTheme('dark')} />
        </View>
      </Card>
      <Card>
        <Copy weight="600">{role === 'official' ? 'Urzędnik' : 'Mieszkaniec'}</Copy>
        <Button
          label="Zmień profil"
          variant="secondary"
          disabled={busy}
          onPress={() => setRole(null)}
        />
      </Card>
      <Notice message={error} error />
      <Card>
        <Copy weight="600">Dane aplikacji</Copy>
        <ResetDemo />
      </Card>
      <View style={{ height: 1, backgroundColor: colors.border }} />
      <Copy muted size={12}>
        ZaŁatamy · wersja demonstracyjna. Dane są przechowywane na tym urządzeniu i nie są wysyłane
        do urzędu.
      </Copy>
    </Screen>
  );
}
