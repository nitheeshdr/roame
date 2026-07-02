import * as React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, Lock } from 'lucide-react-native';
import { SubHeader } from '@/components/ui';
import { roame, type Badge as BadgeType } from '@/lib/api';

export default function Badges() {
  const [earned, setEarned] = React.useState<BadgeType[]>([]);
  const [catalog, setCatalog] = React.useState<BadgeType[]>([]);

  React.useEffect(() => {
    roame.badgeCatalog().then((r) => setCatalog(r.data)).catch(() => {});
    roame.myBadges().then((r) => setEarned(r.data)).catch(() => {});
  }, []);

  const earnedSlugs = new Set(earned.map((b) => b.slug));

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      <SubHeader title="Badges" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <Text className="text-[14px] text-muted">
          {earned.length} of {catalog.length} earned
        </Text>
        {catalog.map((b) => {
          const has = earnedSlugs.has(b.slug);
          return (
            <View
              key={b.slug}
              className={`flex-row items-center gap-4 rounded-2xl border p-4 ${has ? 'border-primary/40 bg-surface' : 'border-border bg-subtle'}`}
            >
              <View className={`h-11 w-11 items-center justify-center rounded-full ${has ? 'bg-primary' : 'bg-border'}`}>
                {has ? <Award color="#FFFFFF" size={20} strokeWidth={2} /> : <Lock color="#71717A" size={18} />}
              </View>
              <View className="flex-1">
                <Text className={`text-[15px] font-semibold ${has ? 'text-foreground' : 'text-muted'}`}>{b.name}</Text>
                <Text className="text-[13px] text-muted">{b.description}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
