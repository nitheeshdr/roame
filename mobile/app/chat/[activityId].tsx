import * as React from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send } from 'lucide-react-native';
import { useSession } from '@/lib/session';
import { roame } from '@/lib/api';

interface Msg {
  id: string;
  body: string | null;
  senderId: string;
  createdAt: string;
  sender: { profile: { displayName: string } | null };
}

export default function Chat() {
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const { user } = useSession();
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [text, setText] = React.useState('');

  const load = React.useCallback(async () => {
    try {
      const res = await roame.messages(activityId);
      setMessages(res.data as unknown as Msg[]);
    } catch {
      setMessages([]);
    }
  }, [activityId]);

  React.useEffect(() => {
    load();
    const t = setInterval(load, 5000); // lightweight polling
    return () => clearInterval(t);
  }, [load]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    setText('');
    try {
      await roame.sendMessage(activityId, body);
      load();
    } catch {
      /* ignore */
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center gap-2 border-b border-border px-3 py-2">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
          <ChevronLeft color="#111111" size={24} />
        </Pressable>
        <Text className="text-[17px] font-semibold text-foreground">Activity chat</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={messages}
          inverted
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => {
            const mine = item.senderId === user?.id;
            return (
              <View className={`my-1 max-w-[80%] ${mine ? 'self-end' : 'self-start'}`}>
                {!mine ? (
                  <Text className="mb-0.5 ml-1 text-[11px] text-muted">
                    {item.sender?.profile?.displayName ?? 'Roamer'}
                  </Text>
                ) : null}
                <View className={`rounded-2xl px-4 py-2.5 ${mine ? 'bg-primary' : 'bg-subtle'}`}>
                  <Text className={`text-[15px] ${mine ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {item.body}
                  </Text>
                </View>
              </View>
            );
          }}
          contentContainerStyle={{ padding: 16, flexDirection: 'column-reverse' }}
        />

        <View className="flex-row items-center gap-2 border-t border-border px-3 py-2">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message"
            placeholderTextColor="#A1A1AA"
            className="h-11 flex-1 rounded-full border border-border bg-surface px-4 text-[15px] text-foreground"
          />
          <Pressable onPress={send} className="h-11 w-11 items-center justify-center rounded-full bg-primary">
            <Send color="#FFFFFF" size={18} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
