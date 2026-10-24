import { useState } from 'react';
import { SectionList, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReportMutation } from '@/application/reports/provider';
import type { DemoState } from '@/domain/reports/model';
import { useTheme } from '@/shared/theme/provider';
import { Button, Card, Choice, Copy, Heading, Notice } from '@/shared/ui/primitives';
import { ReportsBoundary } from '@/features/report-details/reports-boundary';
import { formatDate } from '@/shared/lib/format';

export function NotificationsList() { return <ReportsBoundary>{state => <Inbox state={state} />}</ReportsBoundary>; }
function Inbox({ state }: { state: DemoState }) {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const read = useReportMutation((gateway, ids: string[]) => gateway.markRead(ids));
  const unread = state.notifications.filter(item => !item.read);
  const grouped = new Map<string, typeof state.notifications>();
  for (const notification of state.notifications.toSorted((a, b) => Date.parse(b.at) - Date.parse(a.at))) {
    if (unreadOnly && notification.read) continue;
    const day = formatDate(notification.at);
    const group = grouped.get(day) ?? [];
    group.push(notification); grouped.set(day, group);
  }
  return <SectionList style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 12 }} sections={[...grouped].map(([title, data]) => ({ title, data }))} keyExtractor={item => item.id} stickySectionHeadersEnabled={false} contentInsetAdjustmentBehavior="automatic" ListHeaderComponent={<View style={{ gap: 16, marginBottom: 12 }}><Heading eyebrow="Twoje sprawy" title="Co się zmieniło?" description={unread.length ? `${unread.length} aktualizacji do przeczytania.` : 'Jesteś na bieżąco.'} /><View style={{ flexDirection: 'row', gap: 8 }}><Choice label="Wszystkie" selected={!unreadOnly} onPress={() => setUnreadOnly(false)} /><Choice label={`Nieprzeczytane (${unread.length})`} selected={unreadOnly} onPress={() => setUnreadOnly(true)} /></View><Button label="Oznacz wszystkie jako przeczytane" variant="secondary" disabled={!unread.length} pending={read.isPending} onPress={() => read.mutate(unread.map(item => item.id))} /><Notice error message={read.error?.message} /></View>} renderSectionHeader={({ section }) => <View style={{ paddingVertical: 10 }}><Copy muted size={12}>{section.title}</Copy></View>} ListEmptyComponent={<Card><Copy weight="600">{unreadOnly ? 'Wszystko przeczytane' : 'Tu pojawią się aktualizacje'}</Copy><Copy muted>Zmiany statusu Twoich i obserwowanych spraw znajdziesz w tym miejscu.</Copy>{unreadOnly && <Button variant="secondary" label="Pokaż wszystkie" onPress={() => setUnreadOnly(false)} />}</Card>} renderItem={({ item }) => <Card style={{ borderColor: item.read ? colors.border : colors.accentText }}><Copy muted size={11}>{item.read ? 'PRZECZYTANE' : 'NOWA AKTUALIZACJA'} · {item.reportId}</Copy><Copy weight="600">{item.title}</Copy><Button label="Otwórz sprawę" variant="secondary" disabled={read.isPending} onPress={() => read.mutate([item.id], { onSuccess: () => router.push({ pathname: '/resident/reports/[id]', params: { id: item.reportId } }) })} />{!item.read && <Button label="Oznacz jako przeczytane" variant="secondary" disabled={read.isPending} onPress={() => read.mutate([item.id])} />}</Card>} />;
}
