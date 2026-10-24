import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Construction, LampDesk, Leaf, MapPin, Trash2, Users } from 'lucide-react-native';
import {
  categories,
  priorities,
  statuses,
  type Photo,
  type Report,
  type Status,
} from '@/domain/reports/model';
import { reportSupport } from '@/domain/reports/rules';
import { Card, Choice, Copy } from '@/shared/ui/primitives';
import { useTheme } from '@/shared/theme/provider';
import { formatDate } from '@/shared/lib/format';

export function StatusBadge({ status }: { status: Status }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: 7,
        paddingHorizontal: 9,
        paddingVertical: 5,
        backgroundColor: colors.raised,
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      <Text style={{ color: colors[status], fontSize: 12, fontWeight: '600' }}>
        ● {statuses[status]}
      </Text>
    </View>
  );
}

export function PhotoView({ photo, height = 200 }: { photo: Photo; height?: number }) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  if (photo.kind === 'file' && !failed)
    return (
      <Image
        source={{ uri: photo.uri }}
        accessibilityLabel="Zdjęcie zgłoszenia"
        style={{ width: '100%', height, borderRadius: 10 }}
        contentFit="cover"
        onError={() => setFailed(true)}
      />
    );
  const type = photo.uri.replace('demo:', '');
  const Icon =
    type === 'road'
      ? Construction
      : type === 'lighting'
        ? LampDesk
        : type === 'waste'
          ? Trash2
          : type === 'greenery'
            ? Leaf
            : MapPin;
  return (
    <View
      accessibilityLabel={failed ? 'Nie można otworzyć zdjęcia' : 'Ilustracja demonstracyjna'}
      style={{
        height,
        borderRadius: 10,
        backgroundColor: colors.selected,
        borderColor: colors.border,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <Icon size={Math.min(64, height / 3)} strokeWidth={1.2} color={colors.accentText} />
      <Copy muted size={12}>
        {failed ? 'Zdjęcie niedostępne' : 'ILUSTRACJA DEMO'}
      </Copy>
    </View>
  );
}

export function Gallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const photo = photos[index] ?? photos[0];
  return (
    <View style={{ gap: 10 }}>
      {photo && <PhotoView key={photo.id} photo={photo} />}
      {photos.length > 1 && (
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {photos.map((item, position) => (
            <Choice
              key={item.id}
              label={`${position + 1}`}
              selected={position === index}
              onPress={() => setIndex(position)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export function ReportCard({
  report,
  reports,
  onPress,
}: {
  report: Report;
  reports: Report[];
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${report.title}, ${statuses[report.status]}, ${report.address}`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
    >
      <Card>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <Copy muted size={11}>
            {report.id}
          </Copy>
          <StatusBadge status={report.status} />
        </View>
        <Copy size={18} weight="600">
          {report.title}
        </Copy>
        <Copy muted size={13}>
          {report.address}
        </Copy>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Copy muted size={12}>
            {categories[report.category]} · {priorities[report.priority]}
          </Copy>
          <Users size={13} color={colors.muted} />
          <Copy muted size={12}>
            {reportSupport(report, reports).count}
          </Copy>
          <Copy muted size={12}>
            {formatDate(report.createdAt)}
          </Copy>
        </View>
      </Card>
    </Pressable>
  );
}
