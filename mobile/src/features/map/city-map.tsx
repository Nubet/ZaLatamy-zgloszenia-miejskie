import type { ComponentProps } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '@/shared/theme/provider';
import { Copy } from '@/shared/ui/primitives';
import CityMapDOM from './city-map-dom';

export default function CityMap(props: ComponentProps<typeof CityMapDOM>) {
  const { colors } = useTheme();
  return (
    <CityMapDOM
      {...props}
      dom={{
        ...props.dom,
        useExpoDOMWebView: false,
        startInLoadingState: true,
        renderLoading: () => (
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Ładowanie mapy"
            accessibilityLiveRegion="polite"
            style={[
              StyleSheet.absoluteFill,
              {
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                backgroundColor: colors.background,
              },
            ]}
          >
            <ActivityIndicator color={colors.accentText} accessible={false} />
            <Copy muted size={14}>
              Ładowanie mapy…
            </Copy>
          </View>
        ),
      }}
    />
  );
}
