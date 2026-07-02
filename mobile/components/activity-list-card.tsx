import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CalendarDays, MapPin, Users } from 'lucide-react-native';
import { Badge } from './ui';
import type { ActivityCard } from '@/lib/api';

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

export function ActivityListCard({ activity }: { activity: ActivityCard }) {
  const host = activity.host?.profile?.displayName ?? 'Roamer';
  return (
    <Pressable
      onPress={() => router.push(`/activity/${activity.id}`)}
      className="rounded-2xl border border-border bg-surface p-4 active:opacity-90"
    >
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
    </Pressable>
  );
}
