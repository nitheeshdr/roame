import * as React from 'react';
import { FlatList, RefreshControl, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays, MapPin, Users } from 'lucide-react-native';
import { Card, Badge } from '@/components/ui';
import { roame, type ActivityCard } from '@/lib/api';

const MUTED = '#71717A';

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ActivityRow({ activity }: { activity: ActivityCard }) {
  const host = activity.host?.profile?.displayName ?? 'Roamer';
  return (
    <Card>
      {activity.category ? <Badge label={activity.category.name} className="mb-3" /> : null}
      <Text className="text-[18px] font-semibold leading-6 text-foreground">{activity.title}</Text>

      <View className="mt-3 gap-1.5">
        <View className="flex-row items-center gap-2">
          <CalendarDays color={MUTED} size={16} strokeWidth={1.75} />
          <Text className="text-[14px] text-muted">{formatWhen(activity.startsAt)}</Text>
        </View>
        {activity.city ? (
          <View className="flex-row items-center gap-2">
            <MapPin color={MUTED} size={16} strokeWidth={1.75} />
            <Text className="text-[14px] text-muted">{activity.city}</Text>
          </View>
        ) : null}
      </View>

      <View className="mt-4 flex-row items-center justify-between border-t border-border pt-3">
        <Text className="text-[14px] text-muted">{host}</Text>
        <View className="flex-row items-center gap-1.5">
          <Users color={MUTED} size={14} strokeWidth={1.75} />
          <Text className="text-[14px] text-muted">{activity._count.participants} going</Text>
        </View>
      </View>
    </Card>
  );
}

export default function Discover() {
  const [items, setItems] = React.useState<ActivityCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const res = await roame.listActivities({ pageSize: '20' });
      setItems(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load activities');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <View className="flex-1 px-5 pt-2">
        <Text className="text-[28px] font-bold tracking-tight text-foreground">Discover</Text>
        <Text className="mb-4 mt-1 text-[15px] text-muted">Activities happening around you.</Text>

        <FlatList
          data={items}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => <ActivityRow activity={item} />}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          ListEmptyComponent={
            loading ? null : (
              <Text className="mt-16 text-center text-[15px] text-muted">
                {error ?? 'No activities yet. Check back soon.'}
              </Text>
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}
