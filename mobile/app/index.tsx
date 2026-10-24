import { View, Text } from 'react-native';
import CityMap from '@/features/map/city-map';

export default function Index() {
  return <View style={{ flex: 1, paddingTop: 60, backgroundColor: '#111114' }}>
    <Text style={{ color: '#f0f0f3', fontSize: 24, padding: 20 }}>ZaŁatamy · Demo</Text>
    <CityMap theme="dark" points={[]} dom={{ style: { flex: 1 }, scrollEnabled: false }} />
  </View>;
}
