import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useIsMutating } from '@tanstack/react-query';
import { useReportMutation } from '@/application/reports/provider';
import { Button, Notice } from '@/shared/ui/primitives';

export function ResetDemo() {
  const reset = useReportMutation((gateway) => gateway.reset());
  const busy = useIsMutating({ mutationKey: ['reports'] }) > 0;
  const locked = useRef(false);
  const [done, setDone] = useState(false);
  function confirm() {
    setDone(false);
    reset.reset();
    Alert.alert(
      'Przywrócić dane początkowe?',
      'Zgłoszenia, szkic, zdjęcia i powiadomienia obu trybów zostaną zastąpione zestawem demo. Motyw pozostanie bez zmian.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Resetuj demo',
          style: 'destructive',
          onPress: () => {
            if (locked.current) return;
            locked.current = true;
            reset.mutate(undefined, {
              onSuccess: () => setDone(true),
              onSettled: () => {
                locked.current = false;
              },
            });
          },
        },
      ],
    );
  }
  return (
    <>
      <Button
        label="Przywróć dane demo"
        variant="danger"
        disabled={busy}
        pending={reset.isPending}
        onPress={confirm}
      />
      <Notice error message={reset.error?.message} />
      {done && <Notice message="Przywrócono dane początkowe obu trybów." />}
    </>
  );
}
