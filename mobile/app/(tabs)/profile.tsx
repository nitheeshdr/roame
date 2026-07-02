import * as React from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Bookmark, CalendarRange, LogOut } from 'lucide-react-native';
import { Screen, ScreenHeader, Avatar, Button, Card } from '@/components/ui';
import { useSession } from '@/lib/session';

function Row({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between px-4 py-4 active:opacity-80">
      <View className="flex-row items-center gap-3">
        {icon}
        <Text className="text-[15px] font-medium text-foreground">{label}</Text>
      </View>
      <ChevronRight color="#A1A1AA" size={18} />
    </Pressable>
  );
}

export default function Profile() {
  const { user, signOut } = useSession();

  if (!user) {
    return (
      <Screen className="items-center justify-center px-6">
        <Avatar name="?" size={72} />
        <Text className="mt-5 text-[22px] font-bold text-foreground">Welcome to Roame</Text>
        <Text className="mt-1 text-center text-[15px] text-muted">
          Sign in to host activities, RSVP, and message your groups.
        </Text>
        <View className="mt-6 w-full">
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Profile" />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View className="flex-row items-center gap-4">
          <Avatar name={user.displayName ?? user.email} size={64} />
          <View className="flex-1">
            <Text className="text-[18px] font-semibold text-foreground">{user.displayName ?? 'Roamer'}</Text>
            <Text className="text-[14px] text-muted">{user.email ?? user.phone}</Text>
          </View>
        </View>

        <Card className="p-0">
          <Row icon={<CalendarRange color="#059669" size={20} />} label="My activities" onPress={() => router.push('/list/hosted')} />
          <View className="h-px bg-border" />
          <Row icon={<Bookmark color="#059669" size={20} />} label="Saved" onPress={() => router.push('/list/saved')} />
        </Card>

        <Pressable
          onPress={signOut}
          className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl border border-border py-4 active:opacity-80"
        >
          <LogOut color="#DC2626" size={18} />
          <Text className="text-[15px] font-semibold text-destructive">Sign out</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
