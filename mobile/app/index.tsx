import { View } from 'react-native';
import CityMap from '@/features/map/city-map';
import { useTheme } from '@/shared/theme/provider';
import { Button, Heading, Screen } from '@/shared/ui/primitives';

export default function Index() {
  const { name, setTheme } = useTheme();
  return <Screen><View style={{ height: 30 }} /><Heading eyebrow="Łódź · Demo" title="ZaŁatamy" description="Twoje miasto. W Twoich rękach." /><Button label={name === 'dark' ? 'Jasny motyw' : 'Ciemny motyw'} onPress={() => void setTheme(name === 'dark' ? 'light' : 'dark')} /><View style={{ height: 400, borderRadius: 14, overflow: 'hidden' }}><CityMap theme={name} points={[]} dom={{ style: { flex: 1 }, scrollEnabled: false }} /></View></Screen>;
}
