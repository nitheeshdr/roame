import * as React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SubHeader, Avatar, Badge, EmptyState } from '@/components/ui';
import { roame } from '@/lib/api';

interface Participant {
  id: string;
  role: string;
  user: { id: string; profile: { displayName: string; username: string | null } | null };
}

export default function Participants() {
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const [items, setItems] = React.useState<Participant[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    roame
      .participants(activityId)
      .then((r) => setItems(r.data as unknown as Participant[]))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activityId]);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      <SubHeader title={`Going (${items.length})`} onBack={() => router.back()} />
      <FlatList
        data={items}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/user/${item.user.id}`)}
            className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3 active:opacity-80"
          >
            <Avatar name={item.user.profile?.displayName} size={44} />
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-foreground">
                {item.user.profile?.displayName ?? 'Roamer'}
              </Text>
              {item.user.profile?.username ? (
                <Text className="text-[13px] text-muted">@{item.user.profile.username}</Text>
              ) : null}
            </View>
            {item.role !== 'ATTENDEE' ? <Badge label={item.role === 'HOST' ? 'Host' : 'Co-host'} /> : null}
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        ListEmptyComponent={loading ? null : <EmptyState title="No one yet" subtitle="Be the first to join." />}
      />
    </SafeAreaView>
  );
}
