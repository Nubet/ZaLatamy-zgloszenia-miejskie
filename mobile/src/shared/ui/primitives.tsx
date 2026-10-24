import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/theme/provider';

export function Copy({
  children,
  muted = false,
  size = 15,
  weight = '400',
}: {
  children: ReactNode;
  muted?: boolean;
  size?: number;
  weight?: '400' | '500' | '600' | '700' | '800';
}) {
  const { colors } = useTheme();
  return (
    <Text
      selectable
      style={{
        color: muted ? colors.muted : colors.text,
        fontSize: size,
        fontWeight: weight,
        lineHeight: size * 1.45,
      }}
    >
      {children}
    </Text>
  );
}

export function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {eyebrow && (
        <Text
          style={{ color: colors.accentText, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}
        >
          {eyebrow.toLocaleUpperCase('pl')}
        </Text>
      )}
      <Copy size={24} weight="700">
        {title}
      </Copy>
      {description && <Copy muted>{description}</Copy>}
    </View>
  );
}

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const content = { padding: 16, paddingBottom: Math.max(16, insets.bottom + 8), gap: 16 };
  return scroll ? (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={content}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, backgroundColor: colors.background, ...content }}>{children}</View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        padding: 14,
        gap: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        ...style,
      }}
    >
      {children}
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  pending = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'text';
  disabled?: boolean;
  pending?: boolean;
  icon?: ReactNode;
}) {
  const { colors } = useTheme();
  const foreground =
    variant === 'primary' ? '#ffffff' : variant === 'danger' ? colors.error : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || pending, busy: pending }}
      disabled={disabled || pending}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        paddingHorizontal: variant === 'text' ? 8 : 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor:
          variant === 'text' || variant === 'danger'
            ? 'transparent'
            : variant === 'primary'
              ? colors.accent
              : colors.border,
        backgroundColor:
          variant === 'text' || variant === 'danger'
            ? 'transparent'
            : variant === 'primary'
              ? colors.accent
              : colors.surface,
        opacity: disabled || pending ? 0.5 : pressed ? 0.75 : 1,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      {pending ? <ActivityIndicator color={foreground} /> : icon}
      <Text
        style={{
          color: foreground,
          fontSize: 15,
          fontWeight: '600',
          flexShrink: 1,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Field({
  label,
  hint,
  ...props
}: TextInputProps & { label: string; hint?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 7 }}>
      <Copy size={14} weight="600">
        {label}
      </Copy>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        selectionColor={colors.accentText}
        {...props}
        style={[
          {
            minHeight: 48,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            backgroundColor: colors.surface,
            color: colors.text,
            padding: 13,
            fontSize: 16,
            textAlignVertical: props.multiline ? 'top' : 'center',
          },
          props.multiline && { minHeight: 120 },
          props.style,
        ]}
      />
      {hint && (
        <Copy muted size={12}>
          {hint}
        </Copy>
      )}
    </View>
  );
}

export function Sheet({
  title,
  visible,
  onClose,
  children,
}: {
  title: string;
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Copy size={18} weight="600">
            {title}
          </Copy>
          <Button label="Gotowe" variant="text" onPress={onClose} />
        </View>
        <Screen>{children}</Screen>
      </SafeAreaView>
    </Modal>
  );
}

export function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        minHeight: 48,
        justifyContent: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: selected ? colors.accentText : colors.border,
        backgroundColor: selected ? colors.selected : colors.surface,
      }}
    >
      <Text
        style={{
          color: selected ? colors.accentText : colors.secondary,
          fontSize: 14,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Notice({ message, error = false }: { message?: string; error?: boolean }) {
  const { colors } = useTheme();
  return message ? (
    <Text
      selectable
      accessibilityRole={error ? 'alert' : 'text'}
      style={{ color: error ? colors.error : colors.muted, fontSize: 14, lineHeight: 21 }}
    >
      {message}
    </Text>
  ) : null;
}

export function Loading() {
  const { colors } = useTheme();
  return (
    <View style={{ padding: 30 }}>
      <ActivityIndicator color={colors.accentText} accessibilityLabel="Wczytywanie" />
    </View>
  );
}
