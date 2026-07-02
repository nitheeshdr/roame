import * as React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SubHeader, Avatar, EmptyState } from '@/components/ui';
import { roame, type UserCard } from '@/lib/api';

export default function Connections() {
  const [tab, setTab] = React.useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = React.useState<UserCard[]>([]);
  const [following, setFollowing] = React.useState<UserCard[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([roame.followers(), roame.following()])
      .then(([fr, fg]) => {
        setFollowers(fr.data);
        setFollowing(fg.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const data = tab === 'followers' ? followers : following;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      <SubHeader title="Connections" onBack={() => router.back()} />
      <View className="mx-5 mb-3 flex-row rounded-2xl border border-border bg-subtle p-1">
        {(['followers', 'following'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 items-center rounded-xl py-2.5 ${tab === t ? 'bg-surface' : ''}`}
          >
            <Text className={`text-[14px] font-semibold capitalize ${tab === t ? 'text-foreground' : 'text-muted'}`}>
              {t} ({t === 'followers' ? followers.length : following.length})
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={data}
        keyExtractor={(u) => u.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/user/${item.id}`)}
            className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3 active:opacity-80"
          >
            <Avatar name={item.profile?.displayName} size={44} />
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-foreground">{item.profile?.displayName ?? 'Roamer'}</Text>
              {item.profile?.username ? <Text className="text-[13px] text-muted">@{item.profile.username}</Text> : null}
            </View>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        ListEmptyComponent={loading ? null : <EmptyState title={`No ${tab} yet`} />}
      />
    </SafeAreaView>
  );
}
