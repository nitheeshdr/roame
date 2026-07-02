import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CalendarDays, MapPin, Users, ArrowUpRight } from 'lucide-react-native';
import { Badge } from './ui';
import { categoryIcon } from './category-icon';
import type { ActivityCard } from '@/lib/api';

const MUTED = '#71717A';
export const FEATURED_WIDTH = 300;

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Large slider card for the home carousel. Calm surfaces, line icons only. */
export function FeaturedCard({ activity }: { activity: ActivityCard }) {
  const Icon = categoryIcon(activity.category?.slug);
  return (
    <Pressable
      onPress={() => router.push(`/activity/${activity.id}`)}
      style={{ width: FEATURED_WIDTH }}
      className="overflow-hidden rounded-3xl border border-border bg-surface active:opacity-90"
    >
      {/* Icon band — solid subtle surface, no gradient. */}
      <View className="h-32 items-center justify-center border-b border-border bg-subtle">
        <Icon color="#A1A1AA" size={40} strokeWidth={1.25} />
        {activity.category ? (
          <View className="absolute left-3 top-3">
            <Badge label={activity.category.name} className="bg-surface" />
          </View>
        ) : null}
        <View className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-surface">
          <ArrowUpRight color="#111111" size={16} strokeWidth={2} />
        </View>
      </View>

      <View className="gap-2.5 p-4">
        <Text numberOfLines={2} className="text-[18px] font-semibold leading-6 text-foreground">
          {activity.title}
        </Text>
        <View className="flex-row items-center gap-2">
          <CalendarDays color={MUTED} size={15} strokeWidth={1.75} />
          <Text className="text-[13px] text-muted">{formatWhen(activity.startsAt)}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <MapPin color={MUTED} size={15} strokeWidth={1.75} />
            <Text className="text-[13px] text-muted">{activity.city ?? 'Nearby'}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Users color={MUTED} size={14} strokeWidth={1.75} />
            <Text className="text-[13px] text-muted">{activity._count.participants} going</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
