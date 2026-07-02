import * as React from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import {
  ChevronRight,
  Bookmark,
  CalendarRange,
  CalendarCheck,
  LogOut,
  UserRound,
  Heart,
  Award,
  Users,
  MessageCircle,
  Crown,
  Settings,
  LifeBuoy,
  ShieldCheck,
} from 'lucide-react-native';
import { Screen, ScreenHeader, Avatar, Button, Card } from '@/components/ui';
import { useSession } from '@/lib/session';
import { roame, type MyProfile } from '@/lib/api';

const GREEN = '#059669';

function Row({ icon, label, onPress, last = false }: { icon: React.ReactNode; label: string; onPress: () => void; last?: boolean }) {
  return (
    <>
      <Pressable onPress={onPress} className="flex-row items-center justify-between px-4 py-4 active:opacity-80">
        <View className="flex-row items-center gap-3">
          {icon}
          <Text className="text-[15px] font-medium text-foreground">{label}</Text>
        </View>
        <ChevronRight color="#A1A1AA" size={18} />
      </Pressable>
      {!last ? <View className="mx-4 h-px bg-border" /> : null}
    </>
  );
}

export default function Profile() {
  const { user, signOut } = useSession();
  const [me, setMe] = React.useState<MyProfile | null>(null);
  const [counts, setCounts] = React.useState<{ followers: number; following: number } | null>(null);

  React.useEffect(() => {
    if (!user) return;
    roame.myProfile().then(setMe).catch(() => {});
    roame.publicProfile(user.id)
      .then((p) => setCounts({ followers: p.followers, following: p.following }))
      .catch(() => {});
  }, [user]);

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

  const displayName = me?.profile?.displayName ?? user.displayName ?? 'Roamer';

  return (
    <Screen>
      <ScreenHeader title="Profile" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Identity */}
        <Pressable onPress={() => router.push('/profile/edit')} className="flex-row items-center gap-4 active:opacity-80">
          <Avatar name={displayName} size={64} />
          <View className="flex-1">
            <Text className="text-[18px] font-semibold text-foreground">{displayName}</Text>
            <Text className="text-[14px] text-muted">{user.email ?? user.phone}</Text>
            {me?.trustScore ? (
              <View className="mt-1 flex-row items-center gap-1">
                <ShieldCheck color={GREEN} size={13} strokeWidth={2} />
                <Text className="text-[12px] font-medium text-primary">
                  Trust {me.trustScore.score} · Level {me.trustScore.level}
                </Text>
              </View>
            ) : null}
          </View>
          <ChevronRight color="#A1A1AA" size={18} />
        </Pressable>

        {/* Stats */}
        <View className="flex-row gap-3">
          <Stat label="Followers" value={counts?.followers ?? 0} onPress={() => router.push('/profile/connections')} />
          <Stat label="Following" value={counts?.following ?? 0} onPress={() => router.push('/profile/connections')} />
          <Stat label="Interests" value={me?.interests.length ?? 0} onPress={() => router.push('/profile/interests')} />
        </View>

        {/* Activity */}
        <Card className="p-0">
          <Row icon={<CalendarRange color={GREEN} size={20} />} label="My activities" onPress={() => router.push('/list/hosted')} />
          <Row icon={<CalendarCheck color={GREEN} size={20} />} label="Joined" onPress={() => router.push('/list/joined')} />
          <Row icon={<Bookmark color={GREEN} size={20} />} label="Saved" onPress={() => router.push('/list/saved')} />
          <Row icon={<MessageCircle color={GREEN} size={20} />} label="My chats" onPress={() => router.push('/chats')} last />
        </Card>

        {/* Personal */}
        <Card className="p-0">
          <Row icon={<UserRound color={GREEN} size={20} />} label="Edit profile" onPress={() => router.push('/profile/edit')} />
          <Row icon={<Heart color={GREEN} size={20} />} label="Interests" onPress={() => router.push('/profile/interests')} />
          <Row icon={<Award color={GREEN} size={20} />} label="Badges" onPress={() => router.push('/profile/badges')} />
          <Row icon={<Users color={GREEN} size={20} />} label="Connections" onPress={() => router.push('/profile/connections')} last />
        </Card>

        {/* App */}
        <Card className="p-0">
          <Row icon={<Crown color={GREEN} size={20} />} label="Roame Premium" onPress={() => router.push('/premium')} />
          <Row icon={<Settings color={GREEN} size={20} />} label="Settings" onPress={() => router.push('/profile/settings')} />
          <Row icon={<LifeBuoy color={GREEN} size={20} />} label="Help & support" onPress={() => router.push('/help')} last />
        </Card>

        <Pressable
          onPress={signOut}
          className="mt-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border py-4 active:opacity-80"
        >
          <LogOut color="#DC2626" size={18} />
          <Text className="text-[15px] font-semibold text-destructive">Sign out</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value, onPress }: { label: string; value: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-1 items-center rounded-2xl border border-border bg-surface py-3 active:opacity-80">
      <Text className="text-[18px] font-bold text-foreground">{value}</Text>
      <Text className="text-[12px] text-muted">{label}</Text>
    </Pressable>
  );
}
