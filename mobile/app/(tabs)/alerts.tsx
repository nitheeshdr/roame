import * as React from 'react';
import { FlatList, RefreshControl, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen, ScreenHeader, EmptyState, Button, Card } from '@/components/ui';
import { useSession } from '@/lib/session';
import { roame, type Notification } from '@/lib/api';

function relative(iso: string): string {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86400)}d`;
}

export default function Alerts() {
  const { user } = useSession();
  const [items, setItems] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await roame.notifications();
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (!user) {
    return (
      <Screen>
        <ScreenHeader title="Alerts" />
        <EmptyState title="Sign in for updates" subtitle="Invites, reminders and messages appear here." />
        <View className="px-5">
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-row items-center justify-between pr-5">
        <ScreenHeader title="Alerts" />
        <Pressable
          onPress={async () => {
            await roame.readAll().catch(() => {});
            load();
          }}
        >
          <Text className="text-[13px] font-medium text-primary">Mark all read</Text>
        </Pressable>
      </View>
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <Card className={item.readAt ? '' : 'border-primary/40'}>
            <View className="flex-row items-start justify-between">
              <Text className="flex-1 pr-3 text-[15px] font-semibold text-foreground">{item.title}</Text>
              <Text className="text-[12px] text-muted">{relative(item.createdAt)}</Text>
            </View>
            {item.body ? <Text className="mt-1 text-[14px] text-muted">{item.body}</Text> : null}
          </Card>
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={loading ? null : <EmptyState title="No alerts yet" />}
      />
    </Screen>
  );
}
