import type { ReactNode } from 'react';
import { useReports } from '@/application/reports/provider';
import type { DemoState } from '@/domain/reports/model';
import { Button, Heading, Loading, Notice, Screen } from '@/shared/ui/primitives';
import { ResetDemo } from '@/features/demo/reset-demo';

export function ReportsBoundary({ children }: { children: (state: DemoState) => ReactNode }) {
  const query = useReports();
  if (query.isPending)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (query.error)
    return (
      <Screen>
        <Heading title="Dane są niedostępne" />
        <Notice error message={query.error.message} />
        <Button
          label="Spróbuj ponownie"
          pending={query.isFetching}
          onPress={() => void query.refetch()}
        />
        <ResetDemo />
      </Screen>
    );
  return children(query.data);
}
