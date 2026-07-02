import * as React from 'react';
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CalendarDays, MapPin, Users, MessageCircle, Bookmark } from 'lucide-react-native';
import { Badge, Button, Avatar } from '@/components/ui';
import { useSession } from '@/lib/session';
import { roame } from '@/lib/api';

const MUTED = '#71717A';

interface Detail {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  city: string | null;
  addressLine: string | null;
  capacity: number | null;
  viewerJoined?: boolean;
  category: { name: string } | null;
  host: { profile: { displayName: string; avatarUrl: string | null } | null } | null;
  _count: { participants: number };
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ActivityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const [a, setA] = React.useState<Detail | null>(null);
  const [joined, setJoined] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [pending, setPending] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const data = (await roame.activity(id)) as unknown as Detail;
      setA(data);
      setJoined(!!data.viewerJoined);
    } catch {
      setA(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function toggleJoin() {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    setPending(true);
    try {
      if (joined) await roame.leave(id);
      else await roame.join(id);
      setJoined(!joined);
      load();
    } catch (e) {
      Alert.alert('Something went wrong', e instanceof Error ? e.message : '');
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#059669" />
      </View>
    );
  }
  if (!a) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-background">
        <Text className="mt-20 text-center text-muted">Activity not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center px-3 py-2">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
          <ChevronLeft color="#111111" size={24} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 18 }}>
        <View className="gap-3">
          {a.category ? <Badge label={a.category.name} /> : null}
          <Text className="text-[26px] font-bold leading-8 tracking-tight text-foreground">{a.title}</Text>
        </View>

        <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
          <Row icon={<CalendarDays color={MUTED} size={18} />} text={formatWhen(a.startsAt)} />
          {a.city || a.addressLine ? (
            <Row icon={<MapPin color={MUTED} size={18} />} text={[a.addressLine, a.city].filter(Boolean).join(', ')} />
          ) : null}
          <Row
            icon={<Users color={MUTED} size={18} />}
            text={`${a._count.participants} going${a.capacity ? ` · ${a.capacity} spots` : ''}`}
          />
        </View>

        <View className="flex-row items-center gap-3">
          <Avatar name={a.host?.profile?.displayName} size={40} />
          <View>
            <Text className="text-[12px] text-muted">Hosted by</Text>
            <Text className="text-[14px] font-medium text-foreground">{a.host?.profile?.displayName ?? 'Roamer'}</Text>
          </View>
        </View>

        {a.description ? (
          <View>
            <Text className="mb-2 text-[17px] font-semibold text-foreground">About</Text>
            <Text className="text-[15px] leading-6 text-muted">{a.description}</Text>
          </View>
        ) : null}

        {joined ? (
          <Pressable
            onPress={() => router.push(`/chat/${a.id}`)}
            className="flex-row items-center justify-center gap-2 rounded-2xl border border-border py-4 active:opacity-80"
          >
            <MessageCircle color="#059669" size={18} />
            <Text className="text-[15px] font-semibold text-foreground">Open activity chat</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <View className="flex-row gap-3 border-t border-border bg-background px-5 py-4">
        <Pressable
          onPress={() => user ? roame.save(a.id).catch(() => {}) : router.push('/sign-in')}
          className="h-14 w-14 items-center justify-center rounded-2xl border border-border"
        >
          <Bookmark color="#111111" size={20} />
        </Pressable>
        <View className="flex-1">
          <Button
            label={joined ? 'Going · tap to leave' : 'Join activity'}
            variant={joined ? 'outline' : 'primary'}
            loading={pending}
            onPress={toggleJoin}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      {icon}
      <Text className="text-[15px] text-foreground">{text}</Text>
    </View>
  );
}
