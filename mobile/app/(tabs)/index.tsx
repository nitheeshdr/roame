import * as React from 'react';
import { FlatList, RefreshControl, TextInput, View, Text } from 'react-native';
import { Search, MapPin } from 'lucide-react-native';
import { Screen, EmptyState } from '@/components/ui';
import { ActivityListCard } from '@/components/activity-list-card';
import { roame, type ActivityCard } from '@/lib/api';
import { useLocation } from '@/lib/location';

export default function Discover() {
  const [items, setItems] = React.useState<ActivityCard[]>([]);
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const { location, status } = useLocation();
  const place =
    status === 'ready' && location?.name
      ? location.name
      : status === 'denied'
        ? 'Enable location'
        : status === 'loading'
          ? 'Locating…'
          : 'Near you';

  const load = React.useCallback(async (query?: string) => {
    try {
      const res = await roame.listActivities({ pageSize: 30, q: query || undefined });
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    const t = setTimeout(() => load(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q, load]);

  return (
    <Screen>
      <View className="px-5 pb-3 pt-1">
        <View className="flex-row items-center gap-1.5">
          <MapPin color="#059669" size={15} strokeWidth={2} />
          <Text className="text-[13px] font-medium text-muted">{place}</Text>
        </View>
        <Text className="mt-1 text-[28px] font-bold tracking-tight text-foreground">Discover</Text>
      </View>
      <View className="mx-5 mb-3 flex-row items-center gap-2 rounded-2xl border border-border bg-surface px-3">
        <Search color="#71717A" size={18} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search activities"
          placeholderTextColor="#A1A1AA"
          className="h-11 flex-1 text-[15px] text-foreground"
        />
      </View>
      <FlatList
        data={items}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => <ActivityListCard activity={item} />}
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => load(q.trim())} />}
        ListEmptyComponent={
          loading ? null : <EmptyState title="Nothing here yet" subtitle="Try another search or host your own." />
        }
      />
    </Screen>
  );
}
