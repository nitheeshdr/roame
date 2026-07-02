import * as React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Users } from 'lucide-react-native';
import { SubHeader, EmptyState } from '@/components/ui';
import { roame } from '@/lib/api';

interface ChatRow {
  conversationId: string;
  conversation: {
    activity: { id: string; title: string } | null;
    messages: { body: string | null; createdAt: string }[];
    _count: { participants: number };
  };
}

export default function Chats() {
  const [chats, setChats] = React.useState<ChatRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    roame
      .chats()
      .then((r) => setChats(r.data as unknown as ChatRow[]))
      .catch(() => setChats([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      <SubHeader title="My chats" onBack={() => router.back()} />
      <FlatList
        data={chats}
        keyExtractor={(c) => c.conversationId}
        renderItem={({ item }) => {
          const activity = item.conversation.activity;
          if (!activity) return null;
          const last = item.conversation.messages[0];
          return (
            <Pressable
              onPress={() => router.push(`/chat/${activity.id}`)}
              className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4 active:opacity-80"
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-subtle">
                <MessageCircle color="#059669" size={20} />
              </View>
              <View className="flex-1">
                <Text numberOfLines={1} className="text-[15px] font-semibold text-foreground">
                  {activity.title}
                </Text>
                <Text numberOfLines={1} className="text-[13px] text-muted">
                  {last?.body ?? 'No messages yet'}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Users color="#A1A1AA" size={13} />
                <Text className="text-[12px] text-muted">{item.conversation._count.participants}</Text>
              </View>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        ListEmptyComponent={loading ? null : <EmptyState title="No chats yet" subtitle="Join an activity to start chatting." />}
      />
    </SafeAreaView>
  );
}
