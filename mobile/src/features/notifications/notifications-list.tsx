import { useState } from 'react';
import { Pressable, SectionList, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReportMutation } from '@/application/reports/provider';
import type { DemoState } from '@/domain/reports/model';
import { useTheme } from '@/shared/theme/provider';
import { Button, Card, Choice, Copy, Notice } from '@/shared/ui/primitives';
import { ReportsBoundary } from '@/features/report-details/reports-boundary';
import { formatDate } from '@/shared/lib/format';

export function NotificationsList() {
  return <ReportsBoundary>{(state) => <Inbox state={state} />}</ReportsBoundary>;
}
function Inbox({ state }: { state: DemoState }) {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const read = useReportMutation((gateway, ids: string[]) => gateway.markRead(ids));
  const unread = state.notifications.filter((item) => !item.read);
  const grouped = new Map<string, typeof state.notifications>();
  for (const notification of [...state.notifications].sort(
    (a, b) => Date.parse(b.at) - Date.parse(a.at),
  )) {
    if (unreadOnly && notification.read) continue;
    const day = formatDate(notification.at);
    const group = grouped.get(day) ?? [];
    group.push(notification);
    grouped.set(day, group);
  }
  return (
    <SectionList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16, gap: 10 }}
      sections={[...grouped].map(([title, data]) => ({ title, data }))}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      contentInsetAdjustmentBehavior="automatic"
      ListHeaderComponent={
        <View style={{ gap: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Choice label="Wszystkie" selected={!unreadOnly} onPress={() => setUnreadOnly(false)} />
            <Choice
              label={`Nieprzeczytane (${unread.length})`}
              selected={unreadOnly}
              onPress={() => setUnreadOnly(true)}
            />
          </View>
          {unread.length > 0 && (
            <Button
              label="Oznacz wszystkie jako przeczytane"
              variant="text"
              disabled={!unread.length}
              pending={read.isPending}
              onPress={() => read.mutate(unread.map((item) => item.id))}
            />
          )}
          <Notice error message={read.error?.message} />
        </View>
      }
      renderSectionHeader={({ section }) => (
        <View style={{ paddingVertical: 10 }}>
          <Copy muted size={12}>
            {section.title}
          </Copy>
        </View>
      )}
      ListEmptyComponent={
        <Card>
          <Copy weight="600">
            {unreadOnly ? 'Wszystko przeczytane' : 'Tu pojawią się aktualizacje'}
          </Copy>
          {unreadOnly && (
            <Button
              variant="secondary"
              label="Pokaż wszystkie"
              onPress={() => setUnreadOnly(false)}
            />
          )}
        </Card>
      }
      renderItem={({ item }) => (
        <Card style={{ borderColor: item.read ? colors.border : colors.accentText }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.read ? '' : 'Nieprzeczytane. '}${item.title}. Otwórz zgłoszenie.`}
            disabled={read.isPending}
            onPress={() => {
              const open = () =>
                router.push({ pathname: '/resident/reports/[id]', params: { id: item.reportId } });
              if (item.read) open();
              else read.mutate([item.id], { onSuccess: open });
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              minHeight: 44,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <View style={{ flex: 1, gap: 6 }}>
              <Copy muted size={12}>
                {!item.read ? '● ' : ''}
                {item.reportId}
              </Copy>
              <Copy weight={item.read ? '400' : '600'}>{item.title}</Copy>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </Pressable>
          {!item.read && (
            <Button
              label="Oznacz jako przeczytane"
              variant="text"
              disabled={read.isPending}
              onPress={() => read.mutate([item.id])}
            />
          )}
        </Card>
      )}
    />
  );
}
