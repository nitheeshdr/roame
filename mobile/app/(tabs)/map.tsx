import * as React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import { OlaMap } from '@/components/ola-map';
import { roame, type MapPoint } from '@/lib/api';
import { useLocation } from '@/lib/location';

export default function MapScreen() {
  const [points, setPoints] = React.useState<MapPoint[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { location, status } = useLocation();

  React.useEffect(() => {
    (async () => {
      try {
        const res = await roame.mapPoints();
        setPoints(res.data);
      } catch {
        setPoints([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const locationLabel =
    status === 'ready' && location?.name
      ? location.name
      : status === 'denied'
        ? 'Location off'
        : status === 'loading'
          ? 'Locating…'
          : 'Bengaluru';

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      <View className="px-5 pb-2 pt-1">
        <Text className="text-[28px] font-bold tracking-tight text-foreground">Map</Text>
        <View className="mt-1 flex-row items-center gap-1.5">
          <MapPin color="#059669" size={14} strokeWidth={2} />
          <Text className="text-[14px] text-muted">
            {locationLabel} · {points.length} activities
          </Text>
        </View>
      </View>
      <View className="flex-1 overflow-hidden">
        {loading || status === 'loading' ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#059669" />
          </View>
        ) : (
          <OlaMap
            points={points}
            me={location ? { lat: location.lat, lng: location.lng } : null}
            onSelect={(id) => router.push(`/activity/${id}`)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
