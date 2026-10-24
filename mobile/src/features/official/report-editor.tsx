import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { useReportMutation } from '@/application/reports/provider';
import { priorities, statuses, type Report, type ReportUpdate } from '@/domain/reports/model';
import { acceptsConfirmations, requiresUpdateComment } from '@/domain/reports/rules';
import { Button, Card, Choice, Copy, Field, Heading, Notice, Screen } from '@/shared/ui/primitives';
import { ReportsBoundary } from '@/features/report-details/reports-boundary';
import { useTheme } from '@/shared/theme/provider';

export function ReportEditor({ id }: { id: string }) {
  return <ReportsBoundary>{state => { const report = state.reports.find(item => item.id === id); return report ? <Editor key={id} report={report} reports={state.reports} /> : <Screen><Heading title="Nie znaleziono sprawy" /><Button label="Wróć do kolejki" onPress={() => router.replace('/official')} /></Screen>; }}</ReportsBoundary>;
}
function Editor({ report, reports }: { report: Report; reports: Report[] }) {
  const [changes, setChanges] = useState<ReportUpdate>({ status: report.status, priority: report.priority, comment: '', duplicateOf: report.duplicateOf });
  const [targetSearch, setTargetSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const allowExit = useRef(false);
  const lock = useRef(false);
  const navigation = useNavigation();
  const { colors } = useTheme();
  const mutation = useReportMutation((gateway, update: ReportUpdate) => gateway.update(report.id, update));
  const dirty = !saved && (changes.status !== report.status || changes.priority !== report.priority || changes.comment.length > 0 || changes.duplicateOf !== report.duplicateOf);
  usePreventRemove(dirty || mutation.isPending, ({ data }) => {
    if (allowExit.current) { navigation.dispatch(data.action); return; }
    if (lock.current) return;
    Alert.alert('Odrzucić niezapisane zmiany?', 'Zmiany w edytorze nie zostały zapisane.', [{ text: 'Zostań', style: 'cancel' }, { text: 'Odrzuć', style: 'destructive', onPress: () => { allowExit.current = true; navigation.dispatch(data.action); } }]);
  });
  function change(update: Partial<ReportUpdate>) { setChanges(value => ({ ...value, ...update })); mutation.reset(); }
  async function submit() {
    if (lock.current) return;
    lock.current = true;
    try { await mutation.mutateAsync({ ...changes, duplicateOf: changes.status === 'duplicate' ? changes.duplicateOf : null }); setSaved(true); allowExit.current = true; if (router.canGoBack()) router.back(); else router.replace({ pathname: '/official/reports/[id]', params: { id: report.id } }); }
    catch { /* Mutation state exposes the error without discarding the editor. */ }
    finally { lock.current = false; }
  }
  const targets = reports.filter(item => item.id !== report.id && ((!item.duplicateOf && acceptsConfirmations(item)) || item.id === report.duplicateOf) && `${item.id} ${item.title} ${item.address}`.toLocaleLowerCase('pl').includes(targetSearch.toLocaleLowerCase('pl')));
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90} style={{ flex: 1, backgroundColor: colors.background }}><Stack.Screen options={{ title: 'Aktualizacja · Demo', gestureEnabled: !mutation.isPending }} /><Screen><Heading eyebrow={report.id} title="Aktualizuj sprawę" description={report.title} /><View style={{ gap: 16 }} pointerEvents={mutation.isPending ? 'none' : 'auto'}><Copy weight="600">Status</Copy><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{Object.entries(statuses).map(([key, label]) => <Choice key={key} label={label} selected={changes.status === key} onPress={() => change({ status: key as ReportUpdate['status'] })} />)}</View><Copy weight="600">Priorytet urzędu</Copy><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{Object.entries(priorities).map(([key, label]) => <Choice key={key} label={label} selected={changes.priority === key} onPress={() => change({ priority: key as ReportUpdate['priority'] })} />)}</View><Copy muted size={12}>Liczba potwierdzeń mieszkańców nie zmienia priorytetu.</Copy>{changes.status === 'duplicate' && <Card><Copy weight="600">Sprawa nadrzędna</Copy><Field label="Szukaj sprawy do połączenia" value={targetSearch} onChangeText={setTargetSearch} editable={!mutation.isPending} />{targets.map(item => <Choice key={item.id} label={`${item.id} · ${item.title}`} selected={changes.duplicateOf === item.id} onPress={() => change({ duplicateOf: item.id })} />)}{!targets.length && <Copy muted>Brak aktywnych spraw pasujących do wyszukiwania.</Copy>}<Copy muted size={12}>Zdjęcia i historie pozostaną zachowane. Potwierdzenia liczymy wspólnie, bez powielania osób.</Copy></Card>}<Field label={requiresUpdateComment(changes.status) ? 'Uzasadnienie (wymagane)' : 'Publiczny komentarz'} multiline maxLength={2000} value={changes.comment} editable={!mutation.isPending} onChangeText={comment => change({ comment })} hint={requiresUpdateComment(changes.status) ? 'Minimum 5 znaków. Komentarz zobaczą mieszkańcy.' : 'Komentarz trafi do historii sprawy.'} /></View><Notice error message={mutation.error?.message} /><Button label="Zapisz zmiany demo" pending={mutation.isPending} onPress={() => void submit()} /></Screen></KeyboardAvoidingView>;
}
